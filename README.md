# MicroTask Manager

### Demo site:

### https://demo.anselbrandt.net

## Install and Run

### Frontend

```
cd frontend

npm install

npm run build
```

### Backend

```
cd backend

npm install

npm run start
```

### Config

Build `dist/` files will be served from the root static path at https://localhost:3000 by default.

API url can be configured in `frontend/.env`:

```
VITE_API_SERVER_URL=http://localhost:3001/api
```

Backend server port can be configured in `backend/.env`:

```
PORT=3000
```

### Future deployment:

1. Dockerfile builds

2. Docker Compose file running MongoDB, Redis and the Express Backend App

(Additional tests and linting on GitHub Actions can be run here)

3. GitHub Actions connects to EC2 via SSH

4. GitHub Actions pulls repo on EC2, builds containers and starts with "docker compose up -d"

#### Sample `Dockerfile`

```
FROM node:20 AS frontend

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

FROM node:20

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY --from=frontend /app/frontend/dist ./dist

COPY backend/ ./backend/

ENV PORT=3000

# Expose port 3000
EXPOSE 3000

CMD ["node", "backend/src/app.js"]

```

#### Sample `docker-compose.yml`

```
version: "3.8"
services:
  mongo:
    image: mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  redis:
    image: redis
    ports:
      - "6379:6379"

  server:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - MONGO_URL=mongodb://mongo:27017/taskdb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis

volumes:
  mongo-data:

```
