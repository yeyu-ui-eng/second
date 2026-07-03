import { body } from 'express-validator';

export const createOrderValidator = [
  body('customerId').isUUID().withMessage('Valid customer ID is required'),
  body('productId').isUUID().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('unitPrice').isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  body('dueDate').optional().isISO8601().withMessage('Valid due date is required'),
];

export const updateOrderValidator = [
  body('status').optional().isIn(['NEW', 'CONFIRMED', 'IN_PRODUCTION', 'READY', 'DELIVERED', 'CANCELLED']),
  body('paymentStatus').optional().isIn(['PENDING', 'PARTIAL', 'PAID', 'REFUNDED']),
  body('quantity').optional().isInt({ min: 1 }),
  body('notes').optional().isString(),
];
