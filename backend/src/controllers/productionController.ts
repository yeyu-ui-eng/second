import { Response, NextFunction } from 'express';
import { prisma } from '../app';
import { AuthRequest } from '../middleware/auth';
import { productionService } from '../services/productionService';
import { createAuditLog } from '../utils/audit';

export class ProductionController {
  async assign(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderId, assignedTo } = req.body;
      const task = await productionService.assign(orderId, assignedTo);

      await createAuditLog({
        userId: req.user?.id,
        action: 'ASSIGN_PRODUCTION',
        entity: 'ProductionTask',
        entityId: task.id,
        details: { orderId, assignedTo },
      });

      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }

  async updateStage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const task = await productionService.updateStage(req.params.id, req.body);

      await createAuditLog({
        userId: req.user?.id,
        action: 'UPDATE_PRODUCTION_STAGE',
        entity: 'ProductionTask',
        entityId: task.id,
        details: { stage: req.body.stage },
      });

      res.json(task);
    } catch (error) {
      next(error);
    }
  }

  async getQueue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const queue = await productionService.getQueue();
      res.json(queue);
    } catch (error) {
      next(error);
    }
  }

  async getUserTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const tasks = await productionService.getUserTasks(req.user!.id);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await productionService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = '1', limit = '20', stage } = req.query;
      const where: any = {};
      if (stage) where.stage = stage;

      const [tasks, total] = await Promise.all([
        prisma.productionTask.findMany({
          where,
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
          take: parseInt(limit as string),
          orderBy: { createdAt: 'desc' },
          include: { order: { include: { product: true, customer: true } }, assignedUser: true },
        }),
        prisma.productionTask.count({ where }),
      ]);

      res.json({
        data: tasks,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productionController = new ProductionController();
