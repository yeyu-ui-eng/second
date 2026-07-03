# Fashion Sales Platform - Internal Sales Performance Tracking

A comprehensive internal web application for managing sales activities, production workflow, and employee performance for fashion companies.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Frontend**: React, TypeScript, Vite, TailwindCSS, Recharts
- **Database**: PostgreSQL
- **Auth**: JWT + Refresh Tokens, bcrypt
- **Deployment**: Docker, Docker Compose, Nginx

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm

### Local Development

```bash
# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Setup environment
cp backend/.env.example backend/.env
# Edit .env with your database URL

# Run database migrations
cd backend
npx prisma migrate dev
npx prisma db seed

# Start development servers
npm run dev  # Starts both backend (port 5000) and frontend (port 5173)
```

### Docker Deployment

```bash
docker-compose up -d
```

### Demo Credentials

| Role       | Email                    | Password  |
|------------|--------------------------|-----------|
| Admin      | admin@fashion.com        | admin123  |
| Sales      | sales@fashion.com        | admin123  |
| Production | production@fashion.com   | admin123  |

---

## Table of Contents

1. [Architecture Overview](./docs/architecture.md)
2. [Database Design](./docs/database.md)
3. [API Documentation](./docs/api.md)
4. [Installation Guide](./docs/installation.md)
5. [Deployment Guide](./docs/deployment.md)
6. [User Manual](./docs/user-manual.md)
7. [Administrator Manual](./docs/admin-manual.md)
8. [Testing](./docs/testing.md)

---

## Project Structure

```
├── backend/                 # Express + TypeScript backend
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/       # Auth, validation, error handling
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic layer
│   │   ├── utils/           # Helpers, logger, audit
│   │   └── validators/      # Input validation rules
│   ├── prisma/              # Schema, migrations, seed
│   └── tests/               # Test suite
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Shared UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   ├── store/           # Zustand state
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Helper functions
├── nginx/                   # Nginx configuration
├── docs/                    # Documentation
└── docker-compose.yml       # Docker deployment
```

## Features

- **Role-Based Access**: Admin, Sales, Production with distinct permissions
- **Order Management**: Full CRUD with status tracking
- **Production Workflow**: Stage-based tracking (Cutting → Sewing → QC → Packaging → Ready)
- **Dashboard Analytics**: Real-time KPIs, charts, and revenue tracking
- **Employee Performance**: Ranked performance with commission calculations
- **Reporting**: Sales, revenue, performance, and production reports with CSV export
- **Notifications**: System-wide notifications for orders and production updates
- **Audit Logging**: Complete action history for compliance
- **Security**: JWT auth, rate limiting, input validation, CORS, helmet

## License

Internal use only.
