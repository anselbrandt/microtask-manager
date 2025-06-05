import express from "express";
import mongoose from "mongoose";
import { createClient } from "redis";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = [
  "http://localhost:3000",
  "https://air.anselbrandt.net",
  "https://demo.anselbrandt.net",
  "https://microtask-manager.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());

const redisClient = createClient();
redisClient.on("error", (err) => console.error("Redis Client Error", err));
await redisClient.connect();

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  username: { type: String, required: true },
  status: {
    type: String,
    enum: ["Open", "Completed"],
    default: "Open",
  },
});

const Task = mongoose.model("Task", taskSchema);

mongoose
  .connect("mongodb://localhost:27017/taskdb")
  .then(async () => {
    console.log("Connected to MongoDB");

    // DB is dropped on restart since this is a sample project
    await mongoose.connection.dropDatabase();
    console.log("Dropped existing database");

    app.listen(port, () => {
      console.log(`Task API listening on port ${port}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(express.static(path.join(process.cwd(), "../dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "../dist/index.html"));
});

app.post("/api/login", (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const payload = { username };
  const mockJwt = JSON.stringify(payload);

  res.type("text/plain").send(mockJwt);
});

app.post("/api/tasks", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid token" });
    }

    const token = authHeader.slice(7);
    let payload;

    try {
      payload = JSON.parse(token);
    } catch {
      return res.status(400).json({ error: "Invalid token format" });
    }

    const { username } = payload;
    if (!username) {
      return res.status(400).json({ error: "Username not found in token" });
    }

    const { title, description = "" } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    const newTask = new Task({ title, description, username, status: "Open" });
    await newTask.save();

    await redisClient.del("tasks_cache");

    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.get("/api/tasks", async (req, res) => {
  try {
    const cachedTasks = await redisClient.get("tasks_cache");

    if (cachedTasks) {
      console.log("Serving from Redis cache");
      return res.json(JSON.parse(cachedTasks));
    }

    const tasks = await Task.find();
    await redisClient.setEx("tasks_cache", 30, JSON.stringify(tasks));

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { status: "Completed" },
      { new: true }
    );

    if (!updatedTask) return res.status(404).json({ error: "Task not found" });

    await redisClient.del("tasks_cache");

    res.json(updatedTask);
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
});
