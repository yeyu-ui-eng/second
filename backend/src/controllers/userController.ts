import { Response, NextFunction } from 'express';
import { prisma } from '../app';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';
import { createAuditLog } from '../utils/audit';

export class UserController {
  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { role, page = '1', limit = '10' } = req.query;
      const where: any = {};
      if (role) where.role = role;

      const users = await prisma.user.findMany({
        where,
        select: { id: true, email: true, firstName: true, lastName: true, role: true, phone: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
      });

      const total = await prisma.user.count({ where });

      res.json({
        data: users,
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

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, phone: true, avatar: true, isActive: true, createdAt: true },
      });
      if (!user) throw new AppError('User not found.', 404);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password, firstName, lastName, role, phone } = req.body;
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) throw new AppError('Email already registered.', 400);

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, firstName, lastName, role, phone },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
      });

      await createAuditLog({
        userId: req.user?.id,
        action: 'CREATE_USER',
        entity: 'User',
        entityId: user.id,
        details: { email, role },
      });

      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, role, phone, isActive } = req.body;
      const user = await prisma.user.update({
        where: { id: req.params.id },
        data: { firstName, lastName, role, phone, isActive },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, phone: true, isActive: true },
      });

      await createAuditLog({
        userId: req.user?.id,
        action: 'UPDATE_USER',
        entity: 'User',
        entityId: user.id,
        details: { updates: req.body },
      });

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.user.update({
        where: { id: req.params.id },
        data: { isActive: false },
      });

      await createAuditLog({
        userId: req.user?.id,
        action: 'DISABLE_USER',
        entity: 'User',
        entityId: req.params.id,
      });

      res.json({ message: 'User disabled successfully.' });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true, email: true, firstName: true, lastName: true, role: true, phone: true, avatar: true, createdAt: true,
          _count: { select: { orders: true, productionTasks: true } },
        },
      });
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, phone } = req.body;
      const user = await prisma.user.update({
        where: { id: req.user!.id },
        data: { firstName, lastName, phone },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, phone: true },
      });
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
