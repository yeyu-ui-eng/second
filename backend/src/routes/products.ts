import { Router } from 'express';
import { productController } from '../controllers/productController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProductValidator, updateProductValidator } from '../validators/product';

export const productRouter = Router();

productRouter.get('/', authenticate, productController.findAll.bind(productController));
productRouter.get('/:id', authenticate, productController.findById.bind(productController));
productRouter.post('/', authenticate, authorize('ADMIN'), createProductValidator, validate, productController.create.bind(productController));
productRouter.put('/:id', authenticate, authorize('ADMIN'), updateProductValidator, validate, productController.update.bind(productController));
productRouter.delete('/:id', authenticate, authorize('ADMIN'), productController.delete.bind(productController));
