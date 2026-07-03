# Administrator Manual

## User Management

### Creating Users
1. Navigate to "Employees" in the sidebar
2. Click "Add Employee"
3. Fill in email, password, name, and role
4. Click "Create"

### Managing Users
- **Edit**: Click pencil icon to update name, role, or phone
- **Disable**: Click X icon to deactivate user (they cannot login)
- **Reactivate**: Click X icon on disabled users to re-enable

### Roles
- **Admin**: Full system access (manage users, products, orders, reports)
- **Sales**: Create orders, view customers, personal dashboard
- **Production**: View and update production tasks

## Product Management

1. Navigate to "Products"
2. Click "Add Product" to create new products
3. Enter product details including SKU (must be unique), price, and cost
4. Products can be deactivated (not deleted) to preserve order history

## Order Management

- View all orders in the system
- Update any order's status or payment
- Delete orders if necessary
- Attach files to orders (images, PDFs)

## Production Workflow

### Assigning Tasks
1. Navigate to "Production"
2. Click "Assign Task"
3. Select the order and production staff member
4. Task is created with initial stage "ASSIGNED"

### Workflow Stages
```
WAITING → ASSIGNED → CUTTING → SEWING → QUALITY_CHECK → PACKAGING → READY → DELIVERED
```

## Reports

### Available Reports
- **Sales Report**: Revenue, orders, by employee
- **Employee Performance**: Rankings with commission
- **Revenue Report**: Monthly revenue trends
- **Production Efficiency**: Completion times and stats

### Exporting
- Click "Export" to download CSV
- Reports include configurable date range filters

## Settings

Configure:
- **Company Name**: Displayed in system
- **Commission Rate**: Percentage for sales commission (default: 5%)
- **Currency**: Reporting currency (USD, EUR, GBP)

## Audit Trail

All admin actions are logged in the audit_logs table:
- User creation/modification
- Order status changes
- Production assignments
- System settings changes
- Login/logout events

## Security Best Practices

1. Use strong passwords (minimum 8 characters)
2. Regularly review active users
3. Disable accounts when employees leave
4. Use HTTPS in production
5. Keep JWT secrets secure and rotate periodically
6. Regular database backups
