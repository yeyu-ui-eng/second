import { body } from 'express-validator';

export const assignProductionValidator = [
  body('orderId').isUUID().withMessage('Valid order ID is required'),
  body('assignedTo').isUUID().withMessage('Valid user ID is required'),
];

export const updateProductionValidator = [
  body('stage').optional().isIn(['WAITING', 'ASSIGNED', 'CUTTING', 'SEWING', 'QUALITY_CHECK', 'PACKAGING', 'READY', 'DELIVERED']),
  body('notes').optional().isString(),
  body('delayReason').optional().isString(),
];
