# Testing Guide

## Test Overview

The platform includes:
- **Unit Tests**: Isolated function/service testing
- **Integration Tests**: API endpoint testing with database
- **API Tests**: Request/response validation

## Running Tests

### Prerequisites

```bash
cd backend
npm install
```

### Run All Tests

```bash
npm test
```

### Run with Coverage

```bash
npm test -- --coverage
```

### Run Specific Test File

```bash
npx jest tests/auth.test.ts
npx jest tests/orders.test.ts
npx jest tests/products.test.ts
```

### Watch Mode

```bash
npm run test:watch
```

## Test Structure

```
backend/tests/
├── auth.test.ts        # Authentication tests
├── orders.test.ts       # Order management tests
└── products.test.ts     # Product CRUD tests
```

## Test Coverage

### Auth Tests
- Login with valid credentials → 200 + tokens
- Login with invalid password → 401
- Login with missing fields → 400
- Register new user → 201
- Register duplicate email → 400
- Get current user with token → 200
- Get current user without token → 401

### Orders Tests
- Create order with valid data → 201
- Create order with missing fields → 400
- List orders → 200 + pagination

### Products Tests
- Admin creates product → 201
- Sales cannot create product → 403
- List products → 200

## Mocking Strategy

- Database uses a test PostgreSQL instance
- Tests clean up after themselves
- Authentication creates real users and tokens for testing

## Load Testing Plan

For production readiness, conduct load testing with:

### Tools
- **k6** or **Artillery** for API load testing
- **Lighthouse** for frontend performance

### Scenarios
1. **Concurrent logins**: 50 users logging in simultaneously
2. **Order creation**: 100 concurrent order submissions
3. **Dashboard load**: Multiple dashboard requests
4. **Report generation**: Exporting reports with large datasets

### Targets
- Response time < 500ms for 95% of requests
- Support 200 concurrent users
- API throughput of 1000 requests/min

## Manual Test Scenarios

### Sales Workflow
1. Login as Sales user
2. Dashboard shows personal stats
3. Create new order with customer + product
4. Verify order appears in list
5. Update order status to CONFIRMED
6. View order details

### Production Workflow
1. Login as Admin
2. Assign order to production staff
3. Login as Production user
4. View assigned task on dashboard
5. Advance through production stages
6. Mark as READY

### Admin Workflow
1. Login as Admin
2. Dashboard shows full analytics
3. Create new user (Employee page)
4. Create new product
5. Generate reports
6. Update system settings
