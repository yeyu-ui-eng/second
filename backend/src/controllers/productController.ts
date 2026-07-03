import { Response, NextFunction } from 'express';
import { prisma } from '../app';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export class ProductController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await prisma.product.create({ data: req.body });
      res.status(201).json(product);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return next(new AppError('Product with this SKU already exists.', 400));
      }
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, category, page = '1', limit = '10' } = req.query;
      const where: any = { isActive: true };
      if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { sku: { contains: search as string } },
      ];
      }
      if (category) where.category = category;

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip: (parseInt(page as string) - 1) * parseInt(limit as string),
          take: parseInt(limit as string),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.product.count({ where }),
      ]);

      res.json({
        data: products,
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
      const product = await prisma.product.findUnique({ where: { id: req.params.id } });
      if (!product) throw new AppError('Product not found.', 404);
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const product = await prisma.product.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(product);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.product.update({
        where: { id: req.params.id },
        data: { isActive: false },
      });
      res.json({ message: 'Product deactivated successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
