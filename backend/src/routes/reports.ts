import { Router } from 'express';
import { reportController } from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/auth';

export const reportRouter = Router();

reportRouter.get('/sales', authenticate, authorize('ADMIN'), reportController.salesReport.bind(reportController));
reportRouter.get('/performance', authenticate, authorize('ADMIN'), reportController.performanceReport.bind(reportController));
reportRouter.get('/production-efficiency', authenticate, authorize('ADMIN'), reportController.productionEfficiency.bind(reportController));
reportRouter.get('/revenue', authenticate, authorize('ADMIN'), reportController.revenueReport.bind(reportController));
reportRouter.get('/export', authenticate, authorize('ADMIN'), reportController.exportCSV.bind(reportController));
