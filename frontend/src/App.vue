<template>
  <section class="section">
    <div class="container">
      <h1 class="title">Login</h1>

      <div v-if="!jwt" class="field">
        <label class="label">Username</label>
        <div class="control">
          <input
            class="input"
            type="text"
            placeholder="Enter username"
            v-model="username"
            @keyup.enter="login"
          />
        </div>
      </div>

      <div class="field">
        <div class="control">
          <button
            class="button"
            :class="jwt ? 'is-danger' : 'is-primary'"
            @click="jwt ? logout() : login()"
            :disabled="loading || (!jwt && !username)"
          >
            <span v-if="loading" class="loader"></span>
            <span v-else>{{ jwt ? "Logout" : "Login" }}</span>
          </button>
        </div>
      </div>

      <div v-if="error" class="notification is-danger">
        {{ error }}
      </div>

      <div v-if="jwt" class="notification is-info">
        <strong>Mock JWT:</strong>
        <pre>{{ jwt }}</pre>
      </div>

      <div v-if="jwt" class="box mt-5">
        <h2 class="subtitle">Add a Task</h2>

        <div class="field">
          <div class="control">
            <input
              class="input"
              type="text"
              placeholder="Enter task title"
              v-model="newTask"
            />
          </div>
        </div>

        <div class="field mt-3">
          <div class="control">
            <input
              class="input"
              type="text"
              placeholder="Enter task description"
              v-model="newDescription"
            />
          </div>
        </div>

        <div class="field mt-3">
          <div class="control">
            <button
              class="button is-success"
              @click="addTask"
              :disabled="addingTask || !newTask"
            >
              <span v-if="addingTask" class="loader"></span>
              <span v-else>Add Task</span>
            </button>
          </div>
        </div>

        <div v-if="taskError" class="notification is-danger mt-3">
          {{ taskError }}
        </div>

        <div v-if="createdTask" class="notification is-success mt-3">
          Task "<strong>{{ createdTask.title }}</strong
          >" added!
        </div>
      </div>

      <div v-if="tasks.length" class="box mt-5">
        <h2 class="subtitle">All Tasks</h2>
        <ul>
          <li v-for="task in tasks" :key="task._id" class="task-item">
            <strong>{{ task.title }}</strong> — {{ task.description }}
            <br />
            <small
              >Created by: <strong>{{ task.username }}</strong></small
            >
            <span
              :class="[
                'status-badge',
                task.status === 'Open'
                  ? 'todo'
                  : task.status === 'Completed'
                  ? 'done'
                  : '',
              ]"
            >
              {{ task.status }}
            </span>

            <button
              v-if="task.status === 'Open'"
              class="button is-small is-success ml-3"
              @click="markCompleted(task._id)"
              :disabled="updatingTaskId === task._id"
            >
              <span v-if="updatingTaskId === task._id" class="loader"></span>
              <span v-else>Mark Completed</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

const username = ref("");
const jwt = ref("");
const error = ref("");
const loading = ref(false);

const newTask = ref("");
const newDescription = ref("");
const addingTask = ref(false);
const taskError = ref("");
const createdTask = ref(null);

const tasks = ref([]);
const updatingTaskId = ref(null);

const API_SERVER_URL =
  import.meta.env.VITE_API_SERVER_URL || "http://localhost:3001";

async function login() {
  error.value = "";
  jwt.value = "";

  if (!username.value) {
    error.value = "Username is required";
    return;
  }

  loading.value = true;

  try {
    const res = await fetch(`${API_SERVER_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.value }),
    });

    if (!res.ok) {
      const data = await res.json();
      error.value = data.error || "Login failed";
      return;
    }

    const text = await res.text();
    jwt.value = text;

    await fetchTasks();
  } catch {
    error.value = "Network error";
  } finally {
    loading.value = false;
  }
}

function logout() {
  jwt.value = "";
  username.value = "";
  tasks.value = [];
  createdTask.value = null;
  error.value = "";
  taskError.value = "";
  newTask.value = "";
  newDescription.value = "";
}

async function fetchTasks() {
  try {
    const res = await fetch(`${API_SERVER_URL}/tasks`);
    if (!res.ok) throw new Error("Failed to fetch tasks");

    const data = await res.json();
    tasks.value = data;
  } catch (err) {
    console.error(err);
  }
}

async function addTask() {
  taskError.value = "";
  createdTask.value = null;

  if (!newTask.value) return;

  addingTask.value = true;

  try {
    const res = await fetch(`${API_SERVER_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt.value}`,
      },
      body: JSON.stringify({
        title: newTask.value,
        description: newDescription.value,
        username: username.value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      taskError.value = data.error || "Failed to add task";
      return;
    }

    createdTask.value = data;
    newTask.value = "";
    newDescription.value = "";

    await fetchTasks();
  } catch (err) {
    taskError.value = "Network error";
  } finally {
    addingTask.value = false;
  }
}

async function markCompleted(taskId) {
  if (!jwt.value) {
    alert("You must be logged in to update tasks");
    return;
  }

  updatingTaskId.value = taskId;

  try {
    const res = await fetch(`${API_SERVER_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${jwt.value}`,
      },
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to update task");
      return;
    }

    await fetchTasks();
  } catch {
    alert("Network error");
  } finally {
    updatingTaskId.value = null;
  }
}
</script>

<style>
.loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #3273dc;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  display: inline-block;
  animation: spin 1s linear infinite;
  vertical-align: middle;
  margin-right: 6px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.status-badge {
  display: inline-block;
  padding: 0.15em 0.5em;
  margin-left: 0.5em;
  border-radius: 0.25em;
  font-size: 0.75em;
  font-weight: 600;
  color: white;
  vertical-align: middle;
  user-select: none;
}

.status-badge.todo {
  background-color: #3273dc; /* blue */
}

.status-badge.done {
  background-color: #23d160; /* green */
}

.ml-3 {
  margin-left: 0.75rem;
}
</style>
