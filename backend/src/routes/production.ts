import { Router } from 'express';
import { productionController } from '../controllers/productionController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { assignProductionValidator, updateProductionValidator } from '../validators/production';

export const productionRouter = Router();

productionRouter.get('/queue', authenticate, productionController.getQueue.bind(productionController));
productionRouter.get('/stats', authenticate, productionController.getStats.bind(productionController));
productionRouter.get('/my-tasks', authenticate, productionController.getUserTasks.bind(productionController));
productionRouter.get('/', authenticate, authorize('ADMIN'), productionController.getAll.bind(productionController));
productionRouter.post('/assign', authenticate, authorize('ADMIN'), assignProductionValidator, validate, productionController.assign.bind(productionController));
productionRouter.put('/:id', authenticate, updateProductionValidator, validate, productionController.updateStage.bind(productionController));
