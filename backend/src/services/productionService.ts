import { prisma } from '../app';
import { AppError } from '../middleware/errorHandler';

export class ProductionService {
  async assign(orderId: string, assignedTo: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found.', 404);

    const user = await prisma.user.findUnique({ where: { id: assignedTo } });
    if (!user || user.role !== 'PRODUCTION') throw new AppError('Invalid production user.', 400);

    const task = await prisma.productionTask.create({
      data: { orderId, assignedTo, stage: 'ASSIGNED' },
      include: { order: true, assignedUser: true },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'IN_PRODUCTION' },
    });

    return task;
  }

  async updateStage(id: string, data: { stage?: string; notes?: string; delayReason?: string }) {
    const task = await prisma.productionTask.findUnique({ where: { id } });
    if (!task) throw new AppError('Production task not found.', 404);

    const updateData: any = {};
    if (data.stage) updateData.stage = data.stage;
    if (data.notes) updateData.notes = data.notes;
    if (data.delayReason) updateData.delayReason = data.delayReason;

    if (data.stage === 'ASSIGNED' && !task.startedAt) {
      updateData.startedAt = new Date();
    }

    if (data.stage === 'DELIVERED' || data.stage === 'READY') {
      updateData.completedAt = new Date();
      if (data.stage === 'DELIVERED') {
        await prisma.order.update({
          where: { id: task.orderId },
          data: { status: 'DELIVERED', deliveredAt: new Date() },
        });
      }
      if (data.stage === 'READY') {
        await prisma.order.update({
          where: { id: task.orderId },
          data: { status: 'READY' },
        });
      }
    }

    return prisma.productionTask.update({
      where: { id },
      data: updateData,
      include: { order: { include: { product: true, customer: true } }, assignedUser: true },
    });
  }

  async getQueue() {
    return prisma.productionTask.findMany({
      where: { stage: { not: 'DELIVERED' } },
      orderBy: { createdAt: 'asc' },
      include: {
        order: { include: { product: true, customer: true } },
        assignedUser: true,
      },
    });
  }

  async getUserTasks(userId: string) {
    return prisma.productionTask.findMany({
      where: { assignedTo: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        order: { include: { product: true, customer: true } },
      },
    });
  }

  async getStats() {
    const [total, inProgress, completed, pending, delayed] = await Promise.all([
      prisma.productionTask.count(),
      prisma.productionTask.count({
        where: { stage: { in: ['ASSIGNED', 'CUTTING', 'SEWING', 'QUALITY_CHECK', 'PACKAGING'] } },
      }),
      prisma.productionTask.count({
        where: { stage: { in: ['READY', 'DELIVERED'] } },
      }),
      prisma.productionTask.count({ where: { stage: 'WAITING' } }),
      prisma.productionTask.count({
        where: {
          delayReason: { not: null },
          stage: { not: { in: ['READY', 'DELIVERED'] } },
        },
      }),
    ]);

    return { total, inProgress, completed, pending, delayed };
  }
}

export const productionService = new ProductionService();
