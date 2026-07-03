import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

export const userRouter = Router();

userRouter.get('/', authenticate, authorize('ADMIN'), userController.findAll.bind(userController));
userRouter.get('/profile', authenticate, userController.getProfile.bind(userController));
userRouter.put('/profile', authenticate, userController.updateProfile.bind(userController));
userRouter.get('/:id', authenticate, authorize('ADMIN'), userController.findById.bind(userController));
userRouter.post('/', authenticate, authorize('ADMIN'), userController.create.bind(userController));
userRouter.put('/:id', authenticate, authorize('ADMIN'), userController.update.bind(userController));
userRouter.delete('/:id', authenticate, authorize('ADMIN'), userController.delete.bind(userController));
