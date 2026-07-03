import { Request, Response, NextFunction } from 'express';
import { prisma } from '../app';
import { reportService } from '../services/reportService';
import { parseDateRange } from '../utils/helpers';

export class ReportController {
  async salesReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const report = await reportService.salesReport(startDate as string, endDate as string);
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async performanceReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, startDate, endDate } = req.query;
      const report = await reportService.performanceReport(
        userId as string,
        startDate as string,
        endDate as string
      );
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async productionEfficiency(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const report = await reportService.productionEfficiency(
        startDate as string,
        endDate as string
      );
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async revenueReport(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const report = await reportService.revenueReport(startDate as string, endDate as string);
      res.json(report);
    } catch (error) {
      next(error);
    }
  }

  async exportCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, startDate, endDate } = req.query;
      const { start, end } = parseDateRange(startDate as string, endDate as string);

      let data: any[] = [];
      let headers: string[] = [];

      if (type === 'orders') {
        const orders = await prisma.order.findMany({
          where: { orderDate: { gte: start, lte: end } },
          include: { customer: true, product: true, user: true },
        });
        headers = ['Order Number', 'Customer', 'Product', 'Quantity', 'Total Price', 'Status', 'Order Date'];
        data = orders.map((o: any) => [
          o.orderNumber,
          `${o.customer.firstName} ${o.customer.lastName}`,
          o.product.name,
          o.quantity,
          o.totalPrice,
          o.status,
          o.orderDate.toISOString(),
        ]);
      } else if (type === 'sales') {
        const report = await reportService.salesReport(startDate as string, endDate as string);
        headers = ['Employee', 'Orders', 'Revenue'];
        data = report.byEmployee.map((e: any) => [e.name, e.orders, e.revenue]);
      }

      const csvLines = [headers.join(','), ...data.map((row) => row.join(','))];
      const csvContent = csvLines.join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report.csv`);
      res.send(csvContent);
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
