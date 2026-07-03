import { Router } from 'express';
import { customerController } from '../controllers/customerController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCustomerValidator } from '../validators/customer';

export const customerRouter = Router();

customerRouter.get('/', authenticate, customerController.findAll.bind(customerController));
customerRouter.get('/:id', authenticate, customerController.findById.bind(customerController));
customerRouter.post('/', authenticate, createCustomerValidator, validate, customerController.create.bind(customerController));
customerRouter.put('/:id', authenticate, customerController.update.bind(customerController));
customerRouter.delete('/:id', authenticate, authorize('ADMIN'), customerController.delete.bind(customerController));
