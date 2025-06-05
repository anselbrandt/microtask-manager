FROM node:18-alpine AS builder

WORKDIR /app/frontend

COPY frontend/package*.json frontend/
COPY frontend/vite.config.js frontend/ # if you have vite config or other root files
COPY frontend/src frontend/src

RUN npm install
RUN npm run build

FROM node:18-alpine

WORKDIR /app/backend

COPY backend/package*.json backend/
COPY backend/src backend/src

COPY --from=builder /app/frontend/dist backend/src/dist

RUN npm install

EXPOSE 3001

CMD ["npm", "start"]
