import { Request, Response, NextFunction } from 'express';
import { prisma } from '../app';
import { parseDateRange } from '../utils/helpers';

export class AnalyticsController {
  async revenue(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const { start, end } = parseDateRange(startDate as string, endDate as string);

      const orders = await prisma.order.findMany({
        where: { orderDate: { gte: start, lte: end }, status: { not: 'CANCELLED' } },
        select: { totalPrice: true, orderDate: true },
        orderBy: { orderDate: 'asc' },
      });

      const daily: Record<string, number> = {};
      const monthly: Record<string, number> = {};

      orders.forEach((o) => {
        const dayKey = o.orderDate.toISOString().substring(0, 10);
        const monthKey = o.orderDate.toISOString().substring(0, 7);
        daily[dayKey] = (daily[dayKey] || 0) + o.totalPrice;
        monthly[monthKey] = (monthly[monthKey] || 0) + o.totalPrice;
      });

      res.json({ daily, monthly, total: orders.reduce((s, o) => s + o.totalPrice, 0) });
    } catch (error) {
      next(error);
    }
  }

  async ordersByStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const statusCounts = await prisma.order.groupBy({
        by: ['status'],
        _count: true,
      });
      res.json(statusCounts);
    } catch (error) {
      next(error);
    }
  }

  async topEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const { start, end } = parseDateRange(startDate as string, endDate as string);

      const byEmployee = await prisma.order.groupBy({
        by: ['userId'],
        where: { orderDate: { gte: start, lte: end } },
        _sum: { totalPrice: true },
        _count: true,
        orderBy: { _sum: { totalPrice: 'desc' } },
        take: 10,
      });

      const users = await prisma.user.findMany({
        where: { id: { in: byEmployee.map((e) => e.userId) } },
        select: { id: true, firstName: true, lastName: true },
      });

      res.json(
        byEmployee.map((e) => ({
          userId: e.userId,
          name: users.find((u) => u.id === e.userId)
            ? `${users.find((u) => u.id === e.userId)!.firstName} ${users.find((u) => u.id === e.userId)!.lastName}`
            : 'Unknown',
          revenue: e._sum.totalPrice || 0,
          orders: e._count,
        }))
      );
    } catch (error) {
      next(error);
    }
  }

  async productionTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const stages = await prisma.productionTask.groupBy({
        by: ['stage'],
        _count: true,
      });
      res.json(stages);
    } catch (error) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();
