import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';

export const analyticsRouter = Router();

analyticsRouter.get('/revenue', authenticate, authorize('ADMIN'), analyticsController.revenue.bind(analyticsController));
analyticsRouter.get('/orders-by-status', authenticate, authorize('ADMIN'), analyticsController.ordersByStatus.bind(analyticsController));
analyticsRouter.get('/top-employees', authenticate, authorize('ADMIN'), analyticsController.topEmployees.bind(analyticsController));
analyticsRouter.get('/production-timeline', authenticate, authorize('ADMIN'), analyticsController.productionTimeline.bind(analyticsController));
