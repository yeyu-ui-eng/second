# Installation Guide

## Prerequisites

- **Node.js** v20.0.0 or higher
- **npm** v9.0.0 or higher
- **PostgreSQL** 16 or higher
- **Git** (optional)

## Step-by-Step Installation

### 1. Clone or Extract the Project

```bash
cd C:\Users\User\Desktop\four
```

### 2. Database Setup

Ensure PostgreSQL is running and create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sales_platform;

# Exit
\q
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/sales_platform?schema=public"

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with demo data
npx prisma db seed
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

### 5. Start Development Servers

From the root directory:

```bash
npm run dev
```

Or start separately:

```bash
# Terminal 1 - Backend (port 5000)
cd backend && npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend && npm run dev
```

### 6. Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

### Demo Credentials

| Role       | Email                    | Password  |
|------------|--------------------------|-----------|
| Admin      | admin@fashion.com        | admin123  |
| Sales      | sales@fashion.com        | admin123  |
| Production | production@fashion.com   | admin123  |

## Troubleshooting

### Database Connection Issues

Ensure PostgreSQL is running and the connection string in `.env` is correct:

```
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/sales_platform?schema=public"
```

### Prisma Issues

If you encounter Prisma errors:

```bash
npx prisma generate
npx prisma migrate dev
```

### Port Conflicts

If ports are in use, change them in:
- Backend: `backend/.env` - `PORT=5000`
- Frontend: `frontend/vite.config.ts` - `server.port`
