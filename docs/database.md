# Database Documentation

## ER Diagram (Text Representation)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    User     │     │    Order     │     │ Production  │
├─────────────┤     ├──────────────┤     │    Task     │
│ id (PK)     │◀────│ userId (FK)  │     ├─────────────┤
│ email (UQ)  │     │ id (PK)      │────▶│ id (PK)     │
│ password    │     │ orderNumber  │     │ orderId(FK) │
│ firstName   │     │ customerId   │     │ assignedTo  │
│ lastName    │     │ productId    │     │ stage       │
│ role        │     │ quantity     │     │ startedAt   │
│ phone       │     │ totalPrice   │     │ completedAt │
│ isActive    │     │ status       │     │ notes       │
└─────────────┘     │ paymentStatus│     │ delayReason │
       │            │ dueDate      │     └─────────────┘
       │            └──────┬───────┘            │
       │                  │                     │
       ▼                  ▼                     ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│ RefreshToken│     │  Customer    │     │  Product    │
├─────────────┤     ├──────────────┤     ├─────────────┤
│ id (PK)     │     │ id (PK)      │     │ id (PK)     │
│ token (UQ)  │     │ firstName    │     │ name        │
│ userId (FK) │     │ lastName     │     │ sku (UQ)    │
│ expiresAt   │     │ email        │     │ category    │
└─────────────┘     │ phone        │     │ price       │
                    │ city         │     │ cost        │
┌─────────────┐     └──────────────┘     │ sizes       │
│ Attachment  │                          │ colors      │
├─────────────┤     ┌──────────────┐     └─────────────┘
│ id (PK)     │     │ Notification │
│ orderId(FK) │     ├──────────────┤
│ filename    │     │ id (PK)      │
│ filepath    │     │ userId (FK)  │
│ mimetype    │     │ title        │
│ size        │     │ message      │
└─────────────┘     │ type         │
                    │ isRead       │
┌─────────────┐     │ link         │
│  AuditLog   │     └──────────────┘
├─────────────┤
│ id (PK)     │     ┌────────────────┐
│ userId (FK) │     │SystemSetting   │
│ action      │     ├────────────────┤
│ entity      │     │ id (PK)        │
│ entityId    │     │ key (UQ)       │
│ details     │     │ value          │
│ ipAddress   │     └────────────────┘
└─────────────┘
```

## Entities

### Users
- Core entity for authentication and role management
- 3 roles: ADMIN, SALES, PRODUCTION
- Soft deletion via `isActive` flag
- Indexed on `email` and `role`

### Orders
- Central business entity linking customers, products, and sales staff
- Unique `orderNumber` auto-generated (ORD-{timestamp}-{random})
- Status workflow: NEW → CONFIRMED → IN_PRODUCTION → READY → DELIVERED (or CANCELLED)
- Payment tracking: PENDING → PARTIAL → PAID (or REFUNDED)
- Indexed on: orderNumber, customerId, userId, productId, status, orderDate

### Production Tasks
- Tracks each stage of production for an order
- Stages: WAITING → ASSIGNED → CUTTING → SEWING → QUALITY_CHECK → PACKAGING → READY → DELIVERED
- Tracks timing (startedAt, completedAt) and delays
- Assigned to PRODUCTION role users

### Products
- Catalog of sellable items
- Unique SKU identifier
- Tracks pricing and cost for margin analysis
- Optional size/color variants (comma-separated)

### Customers
- Contact information and order history
- Used across multiple orders over time

### Notifications
- System-generated alerts for users
- Types: NEW_ORDER, PRODUCTION_ASSIGNED, PRODUCTION_COMPLETED, ORDER_DELAYED, etc.
- Read/unread tracking

### Audit Logs
- Immutable record of all system actions
- Tracks who did what, when, and from where
- JSON details for flexible data storage

## Indexes

| Table | Index | Type |
|-------|-------|------|
| users | email | Unique |
| users | role | B-tree |
| orders | orderNumber | Unique |
| orders | customerId | B-tree |
| orders | userId | B-tree |
| orders | status | B-tree |
| orders | orderDate | B-tree |
| products | sku | Unique |
| products | category | B-tree |
| customers | email | B-tree |
| production_tasks | orderId | B-tree |
| production_tasks | assignedTo | B-tree |
| notifications | userId + isRead | Composite |
| audit_logs | userId | B-tree |
| audit_logs | createdAt | B-tree |

## Constraints

- All primary keys use UUID v4
- Foreign keys with CASCADE on delete where appropriate
- Check constraints via Prisma enum types
- Unique constraints on email, orderNumber, sku, token, key
