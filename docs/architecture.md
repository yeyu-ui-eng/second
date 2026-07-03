# Architecture Documentation

## System Overview

The Fashion Sales Platform follows a modern three-tier architecture:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend   │────▶│   Backend   │────▶│  Database   │
│  (React +    │     │  (Express   │     │ (PostgreSQL)│
│   Vite)      │◀────│   + TS)    │◀────│             │
└─────────────┘     └─────────────┘     └─────────────┘
       │                    │
       │                    │
┌──────┴──────┐    ┌───────┴───────┐
│   Nginx     │    │   JWT Auth    │
│  (Reverse   │    │   + RBAC      │
│   Proxy)    │    └───────────────┘
└─────────────┘
```

## Clean Architecture Layers

### Backend

```
┌─────────────────────────────────────────┐
│              Routes (HTTP)              │
├─────────────────────────────────────────┤
│           Controllers (Handlers)        │
├─────────────────────────────────────────┤
│             Services (Business)         │
├─────────────────────────────────────────┤
│           Prisma ORM (Data Access)      │
├─────────────────────────────────────────┤
│           PostgreSQL (Storage)          │
└─────────────────────────────────────────┘
```

### Cross-cutting Concerns

- **Middleware**: Authentication, authorization, validation, error handling, rate limiting
- **Utilities**: Logging, audit trails, helpers
- **Security**: JWT, bcrypt, helmet, CORS, input sanitization

## Frontend Architecture

```
┌─────────────────────────────────────────┐
│          Pages (Route Components)       │
├─────────────────────────────────────────┤
│       Shared Components (UI Library)    │
├─────────────────────────────────────────┤
│      State Management (Zustand)         │
├─────────────────────────────────────────┤
│        API Client (Axios)               │
└─────────────────────────────────────────┘
```

### Component Tree

```
App
├── Login Page
└── Layout (Authenticated)
    ├── Sidebar Navigation
    ├── Header (Profile, Notifications)
    └── Main Content
        ├── Admin Dashboard
        ├── Sales Dashboard
        ├── Production Dashboard
        ├── Orders (List + Detail)
        ├── Products
        ├── Customers
        ├── Production Tasks
        ├── Employees (Admin only)
        ├── Reports (Admin only)
        ├── Settings (Admin only)
        └── Profile
```

## Data Flow

1. User authenticates → JWT issued → stored in localStorage
2. Every API request includes Bearer token in Authorization header
3. Backend validates JWT → attaches user context to request
4. RBAC middleware checks user role for protected routes
5. Request proceeds to controller → service → database
6. Response flows back through middleware layers

## Security Architecture

- **Authentication**: JWT access tokens (24h) + refresh tokens (7d)
- **Password Hashing**: bcrypt with 12 rounds
- **RBAC**: Three roles (ADMIN, SALES, PRODUCTION) with granular permissions
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **HTTP Security**: Helmet middleware for headers
- **Input Validation**: express-validator on all endpoints
- **CORS**: Restricted to configured origin

## Performance Considerations

- Pagination on all list endpoints
- Database indexes on frequently queried columns
- Efficient Prisma queries with selective includes
- Frontend lazy loading via React Router
- Nginx caching and gzip compression
