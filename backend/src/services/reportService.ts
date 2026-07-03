import { prisma } from '../app';
import { parseDateRange } from '../utils/helpers';

export class ReportService {
  async salesReport(startDate?: string, endDate?: string) {
    const { start, end } = parseDateRange(startDate, endDate);

    const orders = await prisma.order.findMany({
      where: { orderDate: { gte: start, lte: end } },
      include: { user: true, product: true, customer: true },
      orderBy: { orderDate: 'desc' },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const byStatus = await prisma.order.groupBy({
      by: ['status'],
      where: { orderDate: { gte: start, lte: end } },
      _count: true,
      _sum: { totalPrice: true },
    });

    const byEmployee = await prisma.order.groupBy({
      by: ['userId'],
      where: { orderDate: { gte: start, lte: end } },
      _count: true,
      _sum: { totalPrice: true },
    });

    const employeeDetails = await prisma.user.findMany({
      where: { id: { in: byEmployee.map((e) => e.userId) } },
      select: { id: true, firstName: true, lastName: true },
    });

    return {
      period: { start, end },
      summary: { totalRevenue, totalOrders, avgOrderValue },
      byStatus,
      byEmployee: byEmployee.map((e) => ({
        userId: e.userId,
        name: employeeDetails.find((u) => u.id === e.userId)
          ? `${employeeDetails.find((u) => u.id === e.userId)!.firstName} ${employeeDetails.find((u) => u.id === e.userId)!.lastName}`
          : 'Unknown',
        orders: e._count,
        revenue: e._sum.totalPrice || 0,
      })),
      orders,
    };
  }

  async performanceReport(userId?: string, startDate?: string, endDate?: string) {
    const { start, end } = parseDateRange(startDate, endDate);
    const where: any = { orderDate: { gte: start, lte: end } };
    if (userId) where.userId = userId;

    const users = userId
      ? [await prisma.user.findUnique({ where: { id: userId } })]
      : await prisma.user.findMany({ where: { role: 'SALES' } });

    const performance = await Promise.all(
      users
        .filter((u): u is NonNullable<typeof u> => u !== null)
        .map(async (user) => {
          const userOrders = await prisma.order.findMany({
            where: { ...where, userId: user.id },
          });

          const totalOrders = userOrders.length;
          const revenue = userOrders.reduce((s, o) => s + o.totalPrice, 0);
          const completed = userOrders.filter((o) => o.status === 'DELIVERED').length;
          const cancelled = userOrders.filter((o) => o.status === 'CANCELLED').length;
          const avgOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;
          const commission = revenue * 0.05;

          return {
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            totalOrders,
            revenue,
            completed,
            cancelled,
            avgOrderValue,
            commission,
          };
        })
    );

    performance.sort((a, b) => b.revenue - a.revenue);
    const ranked = performance.map((p, i) => ({ ...p, rank: i + 1 }));

    return { period: { start, end }, employees: ranked };
  }

  async productionEfficiency(startDate?: string, endDate?: string) {
    const { start, end } = parseDateRange(startDate, endDate);

    const tasks = await prisma.productionTask.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        completedAt: { not: null },
      },
      include: { assignedUser: true, order: true },
    });

    const avgCompletionTime = tasks.length > 0
      ? tasks.reduce((sum, t) => {
          const duration = t.completedAt!.getTime() - t.createdAt.getTime();
          return sum + duration;
        }, 0) / tasks.length
      : 0;

    const byUser = await prisma.productionTask.groupBy({
      by: ['assignedTo'],
      where: { createdAt: { gte: start, lte: end } },
      _count: true,
    });

    return {
      period: { start, end },
      totalCompleted: tasks.length,
      avgCompletionTimeHours: Math.round(avgCompletionTime / (1000 * 60 * 60) * 100) / 100,
      totalTasks: await prisma.productionTask.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
    };
  }

  async revenueReport(startDate?: string, endDate?: string) {
    const { start, end } = parseDateRange(startDate, endDate);

    const orders = await prisma.order.findMany({
      where: {
        orderDate: { gte: start, lte: end },
        status: { not: 'CANCELLED' },
      },
    });

    const monthly: Record<string, number> = {};
    const daily: Record<string, number> = {};

    orders.forEach((o) => {
      const monthKey = o.orderDate.toISOString().substring(0, 7);
      const dayKey = o.orderDate.toISOString().substring(0, 10);
      monthly[monthKey] = (monthly[monthKey] || 0) + o.totalPrice;
      daily[dayKey] = (daily[dayKey] || 0) + o.totalPrice;
    });

    return {
      period: { start, end },
      totalRevenue: orders.reduce((s, o) => s + o.totalPrice, 0),
      totalOrders: orders.length,
      monthly,
      daily,
    };
  }
}

export const reportService = new ReportService();
