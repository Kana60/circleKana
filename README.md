# OpKit — Mini CRM with Real-time Task Updates

A fullstack mini-CRM application built as a test assignment for Circle Creative Buro.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + React Router |
| Backend | NestJS + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Real-time | WebSocket (Socket.IO) |
| Auth | JWT + bcrypt |
| DevOps | Docker Compose |

## Project Structure

```
opkit/
├── backend/               # NestJS API
│   ├── prisma/
│   │   └── schema.prisma  # DB schema
│   ├── src/
│   │   ├── auth/          # JWT auth module
│   │   ├── tasks/         # Tasks CRUD + WebSocket gateway
│   │   ├── prisma/        # Prisma service
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── .env.example
├── frontend/              # React app
│   └── src/
│       ├── api/           # Axios API calls
│       ├── components/    # TaskCard, CreateTaskModal
│       ├── context/       # AuthContext
│       ├── hooks/         # useSocket
│       ├── pages/         # LoginPage, RegisterPage, TasksPage
│       └── types/         # TypeScript interfaces
├── docker-compose.yml     # PostgreSQL
└── README.md
```

## Local Setup

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### 1. Start the database

```bash
docker-compose up -d
```

### 2. Setup the backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

Backend runs at `http://localhost:3001`

### 3. Setup the frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | Register with email + password |
| POST | /auth/login | Login, returns JWT token |

### Tasks (requires JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET | /tasks | Get all user tasks |
| POST | /tasks | Create a task |
| PATCH | /tasks/:id | Update task or change status |
| DELETE | /tasks/:id | Delete task |

## WebSocket Events

The server emits the following events to all connected clients:

| Event | Payload | Trigger |
|-------|---------|---------|
| `task:statusChanged` | `{ id, status, timestamp }` | Task status updated |
| `task:created` | Task object | New task created |
| `task:updated` | Task object | Task fields updated |
| `task:deleted` | `{ id, timestamp }` | Task deleted |

### Real-time demo
Open the app in two browser windows with the same account — status changes in one window will instantly reflect in the other.

## Running Tests

```bash
cd backend
npm test
```

Unit tests cover `TasksService`: findAll, create, update (status change, not found, forbidden), remove.
