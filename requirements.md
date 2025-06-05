# 🔧 Requirements

### 1. Frontend (Vue.js + Vite + Axios)

- A login screen (mocked auth is fine).

- Dashboard with:

  - “Create MicroTask” form.

  - List of MicroTasks with title, description, and status (“Open”, “Completed”).

    -Ability to mark a task as completed.

- Styling can be basic but clean (use Bulma CSS or Oruga UI or your choice).

### 2. Backend (Node.js + Express + MongoDB)

- REST API with:

  - POST /tasks → Create new task.

  - GET /tasks → List all tasks.

  - PUT /tasks/:id → Mark task as completed.

- Use Mongoose for schema design.

- Connect to Redis and implement basic caching for GET /tasks with 30-second TTL.

### 3. Bonus (Extra Credit)

- Use PM2 for local server process management.

- Deploy the backend to AWS EC2 and provide the URL in the README.

- Add a GitHub Action that:

  - Runs lint checks and tests (can be basic or mocked).

  - Deploys to EC2 (via rsync or CodeDeploy setup).

# 📄 Deliverables

1. `. A public GitHub repository with:

   - /client (Vue.js frontend)

   - /server (Node.js backend)

2. .env.example with required environment variables

3. README.md with:

   - Setup instructions

   - Notes on staging/production safety measures

   - CI/CD explanation (even if mocked)
