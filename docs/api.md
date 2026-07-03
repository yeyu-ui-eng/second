# API Documentation

## Base URL

- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Error Response Format

```json
{
  "error": "Error message description"
}
```

### Validation Error Response

```json
{
  "error": "Validation failed.",
  "details": [
    { "field": "email", "message": "Valid email is required" }
  ]
}
```

---

## Auth Endpoints

### POST /auth/login
Authenticate user and get tokens.

**Request:**
```json
{
  "email": "admin@fashion.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "uuid-refresh-token",
  "user": {
    "id": "uuid",
    "email": "admin@fashion.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "ADMIN"
  }
}
```

### POST /auth/register
Create new user account.

**Request:**
```json
{
  "email": "newuser@company.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "SALES",
  "phone": "+1-555-0100"
}
```

### POST /auth/refresh-token
Get new access token using refresh token.

**Request:**
```json
{
  "refreshToken": "uuid-refresh-token"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### GET /auth/me
Get current authenticated user.

### POST /auth/change-password
Change password for authenticated user.

**Request:**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newSecurePassword"
}
```

---

## Users (Admin only)

### GET /users
List all users.

**Query Parameters:** `?role=SALES&page=1&limit=10`

### POST /users
Create new user.

**Request:**
```json
{
  "email": "user@company.com",
  "password": "securePass",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "PRODUCTION",
  "phone": "+1-555-0200"
}
```

### PUT /users/:id
Update user.

### DELETE /users/:id
Deactivate user (soft delete).

### GET /users/profile
Get own profile.

### PUT /users/profile
Update own profile.

---

## Orders

### GET /orders
List orders with filtering and pagination.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status
- `search` - Search by order number or customer name
- `startDate` / `endDate` - Date range filter
- `sortBy` - Field to sort by
- `sortOrder` - asc or desc

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "orderNumber": "ORD-...",
      "customer": { "firstName": "Emma", "lastName": "Wilson" },
      "product": { "name": "Classic Blazer" },
      "user": { "firstName": "Sarah", "lastName": "Johnson" },
      "quantity": 2,
      "totalPrice": 599.98,
      "status": "CONFIRMED",
      "paymentStatus": "PARTIAL",
      "orderDate": "2026-06-15T10:00:00Z",
      "productionTasks": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

### GET /orders/:id
Get full order details with customer, product, user, production tasks, and attachments.

### POST /orders
Create new order.

**Request:**
```json
{
  "customerId": "uuid",
  "productId": "uuid",
  "quantity": 3,
  "unitPrice": 89.99,
  "size": "M",
  "color": "Blue",
  "dueDate": "2026-08-01",
  "notes": "Rush order"
}
```

### PUT /orders/:id
Update order.

**Request:**
```json
{
  "status": "CONFIRMED",
  "paymentStatus": "PAID",
  "notes": "Updated notes"
}
```

### DELETE /orders/:id
Delete order (Admin only).

### GET /orders/stats
Get order statistics for current user or all orders.

---

## Products

### GET /products
List active products.

### POST /products
Create product (Admin only).

**Request:**
```json
{
  "name": "Summer Dress",
  "sku": "SDR-001",
  "category": "Dresses",
  "price": 199.99,
  "cost": 95.00,
  "sizes": "XS,S,M,L",
  "colors": "Red,White,Blue"
}
```

### PUT /products/:id
Update product.

### DELETE /products/:id
Deactivate product.

---

## Customers

### GET /customers
List customers.

### POST /customers
Create customer.

### PUT /customers/:id
Update customer.

### DELETE /customers/:id
Delete customer.

---

## Production

### GET /production
List production tasks (Admin only, with pagination).

### GET /production/queue
Get production queue ordered by creation date.

### GET /production/my-tasks
Get tasks assigned to current user.

### GET /production/stats
Get production statistics.

### POST /production/assign
Assign production task to user (Admin only).

**Request:**
```json
{
  "orderId": "uuid",
  "assignedTo": "uuid"
}
```

### PUT /production/:id
Update production task stage.

**Request:**
```json
{
  "stage": "SEWING",
  "notes": "Fabric cut, proceeding to sewing",
  "delayReason": "Waiting for material"
}
```

---

## Dashboard

### GET /dashboard/admin
Admin dashboard with sales summary, revenue trends, production stats, recent orders, and top products.

### GET /dashboard/sales
Sales dashboard with personal performance, commissions, and recent orders.

### GET /dashboard/production
Production dashboard with assigned tasks, progress, and activity.

---

## Reports (Admin only)

### GET /reports/sales
Sales report with revenue breakdown.

### GET /reports/performance
Employee performance report with rankings.

### GET /reports/revenue
Revenue report with monthly/daily breakdown.

### GET /reports/production-efficiency
Production efficiency report.

### GET /reports/export?type=orders
Export report as CSV.

---

## Notifications

### GET /notifications
Get user notifications.

### GET /notifications/unread-count
Get unread notification count.

### PUT /notifications/:id/read
Mark notification as read.

### PUT /notifications/read-all
Mark all notifications as read.

---

## Analytics (Admin only)

### GET /analytics/revenue
Revenue analytics with daily/monthly breakdown.

### GET /analytics/orders-by-status
Order distribution by status.

### GET /analytics/top-employees
Top performing employees.

### GET /analytics/production-timeline
Production task distribution by stage.

---

## Settings (Admin only)

### GET /settings
Get system settings.

### PUT /settings
Update system settings.

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |
