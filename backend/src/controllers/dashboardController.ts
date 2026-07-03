import { Response, NextFunction } from 'express';
import { prisma } from '../app';
import { AuthRequest } from '../middleware/auth';

export class DashboardController {
  async adminDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [
        totalSales,
        dailySales,
        weeklySales,
        monthlySales,
        salesByEmployee,
        ordersInProduction,
        completedProduction,
        pendingProduction,
        revenueData,
        recentOrders,
        topProducts,
      ] = await Promise.all([
        prisma.order.aggregate({ _sum: { totalPrice: true } }),
        prisma.order.aggregate({
          where: { orderDate: { gte: todayStart } },
          _sum: { totalPrice: true },
          _count: true,
        }),
        prisma.order.aggregate({
          where: { orderDate: { gte: weekStart } },
          _sum: { totalPrice: true },
          _count: true,
        }),
        prisma.order.aggregate({
          where: { orderDate: { gte: monthStart } },
          _sum: { totalPrice: true },
          _count: true,
        }),
        prisma.order.groupBy({
          by: ['userId'],
          _sum: { totalPrice: true },
          _count: true,
          orderBy: { _sum: { totalPrice: 'desc' } },
          take: 10,
        }),
        prisma.productionTask.count({ where: { stage: { in: ['ASSIGNED', 'CUTTING', 'SEWING', 'QUALITY_CHECK', 'PACKAGING'] } } }),
        prisma.productionTask.count({ where: { stage: { in: ['READY', 'DELIVERED'] } } }),
        prisma.productionTask.count({ where: { stage: 'WAITING' } }),
        prisma.order.findMany({
          where: { status: { not: 'CANCELLED' } },
          select: { totalPrice: true, orderDate: true },
          orderBy: { orderDate: 'asc' },
        }),
        prisma.order.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { customer: true, product: true, user: true },
        }),
        prisma.order.groupBy({
          by: ['productId'],
          _sum: { quantity: true, totalPrice: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 10,
        }),
      ]);

      const employeeNames = await prisma.user.findMany({
        where: { id: { in: salesByEmployee.map((e) => e.userId) } },
        select: { id: true, firstName: true, lastName: true },
      });

      const productNames = await prisma.product.findMany({
        where: { id: { in: topProducts.map((p) => p.productId) } },
        select: { id: true, name: true },
      });

      const revenueByMonth: Record<string, number> = {};
      revenueData.forEach((r) => {
        const key = r.orderDate.toISOString().substring(0, 7);
        revenueByMonth[key] = (revenueByMonth[key] || 0) + r.totalPrice;
      });

      res.json({
        summary: {
          totalSales: totalSales._sum.totalPrice || 0,
          dailySales: { total: dailySales._sum.totalPrice || 0, count: dailySales._count },
          weeklySales: { total: weeklySales._sum.totalPrice || 0, count: weeklySales._count },
          monthlySales: { total: monthlySales._sum.totalPrice || 0, count: monthlySales._count },
        },
        production: {
          inProgress: ordersInProduction,
          completed: completedProduction,
          pending: pendingProduction,
        },
        salesByEmployee: salesByEmployee.map((e) => ({
          userId: e.userId,
          name: employeeNames.find((u) => u.id === e.userId)
            ? `${employeeNames.find((u) => u.id === e.userId)!.firstName} ${employeeNames.find((u) => u.id === e.userId)!.lastName}`
            : 'Unknown',
          revenue: e._sum.totalPrice || 0,
          orders: e._count,
        })),
        revenueByMonth,
        recentOrders,
        topProducts: topProducts.map((p) => ({
          productId: p.productId,
          name: productNames.find((pr) => pr.id === p.productId)?.name || 'Unknown',
          quantity: p._sum.quantity || 0,
          revenue: p._sum.totalPrice || 0,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  async salesDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const [personalSales, monthlyPerformance, activeOrders, completedOrders, recentOrders] =
        await Promise.all([
          prisma.order.aggregate({
            where: { userId },
            _sum: { totalPrice: true },
            _count: true,
          }),
          prisma.order.aggregate({
            where: { userId, orderDate: { gte: monthStart } },
            _sum: { totalPrice: true },
            _count: true,
          }),
          prisma.order.count({
            where: { userId, status: { in: ['NEW', 'CONFIRMED', 'IN_PRODUCTION'] } },
          }),
          prisma.order.count({
            where: { userId, status: 'DELIVERED' },
          }),
          prisma.order.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { customer: true, product: true },
          }),
        ]);

      res.json({
        totalSales: personalSales._sum.totalPrice || 0,
        totalOrders: personalSales._count,
        monthlyPerformance: {
          revenue: monthlyPerformance._sum.totalPrice || 0,
          orders: monthlyPerformance._count,
        },
        commission: (personalSales._sum.totalPrice || 0) * 0.05,
        activeOrders,
        completedOrders,
        recentOrders,
      });
    } catch (error) {
      next(error);
    }
  }

  async productionDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;

      const [assigned, inProgress, completed, delayed, recentTasks] = await Promise.all([
        prisma.productionTask.count({ where: { assignedTo: userId, stage: 'ASSIGNED' } }),
        prisma.productionTask.count({
          where: { assignedTo: userId, stage: { in: ['CUTTING', 'SEWING', 'QUALITY_CHECK', 'PACKAGING'] } },
        }),
        prisma.productionTask.count({ where: { assignedTo: userId, stage: { in: ['READY', 'DELIVERED'] } } }),
        prisma.productionTask.count({ where: { assignedTo: userId, delayReason: { not: null } } }),
        prisma.productionTask.findMany({
          where: { assignedTo: userId },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { order: { include: { product: true, customer: true } } },
        }),
      ]);

      res.json({
        assigned,
        inProgress,
        completed,
        delayed,
        recentTasks,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
