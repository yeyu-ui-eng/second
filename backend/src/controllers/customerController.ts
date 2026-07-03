import { Response, NextFunction } from 'express';
import { prisma } from '../app';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export class CustomerController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customer = await prisma.customer.create({ data: req.body });
      res.status(201).json(customer);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, page = '1', limit = '10' } = req.query;
      const where: any = {};
      if (search) {
        where.OR = [
          { firstName: { contains: search as string } },
          { lastName: { contains: search as string } },
          { email: { contains: search as string } },
          { phone: { contains: search as string } },
        ];
      }

      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where,
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
          take: parseInt(limit as string),
          orderBy: { createdAt: 'desc' },
          include: { _count: { select: { orders: true } } },
        }),
        prisma.customer.count({ where }),
      ]);

      res.json({
        data: customers,
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
      const customer = await prisma.customer.findUnique({
        where: { id: req.params.id },
        include: { orders: { include: { product: true, user: true }, orderBy: { createdAt: 'desc' }, take: 20 } },
      });
      if (!customer) throw new AppError('Customer not found.', 404);
      res.json(customer);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const customer = await prisma.customer.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(customer);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.customer.delete({ where: { id: req.params.id } });
      res.json({ message: 'Customer deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

export const customerController = new CustomerController();
