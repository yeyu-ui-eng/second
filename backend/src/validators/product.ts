import { body } from 'express-validator';

export const createProductValidator = [
  body('name').notEmpty().withMessage('Product name is required').trim(),
  body('sku').notEmpty().withMessage('SKU is required').trim(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('cost').optional().isFloat({ min: 0 }),
  body('category').optional().isString().trim(),
];

export const updateProductValidator = [
  body('name').optional().notEmpty().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('cost').optional().isFloat({ min: 0 }),
];
