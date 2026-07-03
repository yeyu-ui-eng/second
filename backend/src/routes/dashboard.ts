import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';

export const dashboardRouter = Router();

dashboardRouter.get('/admin', authenticate, authorize('ADMIN'), dashboardController.adminDashboard.bind(dashboardController));
dashboardRouter.get('/sales', authenticate, authorize('SALES'), dashboardController.salesDashboard.bind(dashboardController));
dashboardRouter.get('/production', authenticate, authorize('PRODUCTION'), dashboardController.productionDashboard.bind(dashboardController));
