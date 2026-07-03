# Deployment Guide

## Docker Deployment

### Prerequisites

- Docker 24+
- Docker Compose 2.20+

### Quick Deploy

```bash
# From project root
docker-compose up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Backend API** on port 5000
- **Frontend** served via Nginx on port 80
- **Nginx** reverse proxy on ports 80/443

### Verify Deployment

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f

# Check API health
curl http://localhost:5000/api/health
```

### Production Configuration

#### 1. Environment Variables

Create a `docker-compose.override.yml`:

```yaml
version: '3.8'
services:
  backend:
    environment:
      JWT_SECRET: "your-very-long-secure-random-secret"
      JWT_REFRESH_SECRET: "another-very-long-secure-random-secret"
      CORS_ORIGIN: "https://your-domain.com"
```

#### 2. SSL Certificates

Place your SSL files in `nginx/ssl/`:

```
nginx/ssl/
├── cert.pem
└── key.pem
```

For development, generate self-signed certs:

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/key.pem \
  -out nginx/ssl/cert.pem \
  -subj "/CN=localhost"
```

#### 3. Database Persistent Storage

Database data persists in Docker volume `postgres_data`. For backups:

```bash
docker exec sales-db pg_dump -U postgres sales_platform > backup.sql
```

To restore:

```bash
cat backup.sql | docker exec -i sales-db psql -U postgres sales_platform
```

## Manual Production Deployment

### Backend

```bash
cd backend
npm ci --only=production
npm run build
NODE_ENV=production node dist/app.js
```

### Frontend

```bash
cd frontend
npm ci
npm run build
# Serve dist/ directory with any web server
```

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and Deploy
        run: |
          docker-compose build
          docker-compose up -d
```

## Monitoring

### Health Check

```bash
curl http://localhost:5000/api/health
# Response: {"status":"ok","timestamp":"2026-07-04T..."}
```

### Logs

- Backend logs stored in `backend/logs/`
- Docker logs via `docker-compose logs`
- Nginx access/error logs within container
