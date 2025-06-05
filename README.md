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
