import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { orderService } from '../services/orderService';
import { createAuditLog } from '../utils/audit';

export class OrderController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.create({
        ...req.body,
        userId: req.body.userId || req.user!.id,
      });

      await createAuditLog({
        userId: req.user?.id,
        action: 'CREATE_ORDER',
        entity: 'Order',
        entityId: order.id,
        details: { orderNumber: order.orderNumber },
      });

      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const query: any = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        status: req.query.status as string,
        search: req.query.search as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      if (req.user!.role === 'SALES') {
        query.userId = req.user!.id;
      }

      const result = await orderService.findAll(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.findById(req.params.id);
      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.update(req.params.id, req.body);

      await createAuditLog({
        userId: req.user?.id,
        action: 'UPDATE_ORDER',
        entity: 'Order',
        entityId: order.id,
        details: { updates: req.body },
      });

      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await orderService.delete(req.params.id);

      await createAuditLog({
        userId: req.user?.id,
        action: 'DELETE_ORDER',
        entity: 'Order',
        entityId: req.params.id,
      });

      res.json({ message: 'Order deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }

  async getStats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.role === 'SALES' ? req.user!.id : undefined;
      const stats = await orderService.getStats(userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
