import { prisma } from '../app';
import { AppError } from '../middleware/errorHandler';
import { generateOrderNumber, calculatePagination } from '../utils/helpers';
import { Prisma } from '@prisma/client';

export class OrderService {
  async create(data: {
    customerId: string;
    productId: string;
    userId: string;
    quantity: number;
    unitPrice: number;
    size?: string;
    color?: string;
    dueDate?: string;
    notes?: string;
  }) {
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product || !product.isActive) throw new AppError('Product not found.', 404);

    const totalPrice = data.quantity * data.unitPrice;
    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: data.customerId,
        productId: data.productId,
        userId: data.userId,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        totalPrice,
        size: data.size,
        color: data.color,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes,
      },
      include: { customer: true, product: true, user: true },
    });

    return order;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { skip, take, page, limit } = calculatePagination(params.page, params.limit);

    const where: Prisma.OrderWhereInput = {};

    if (params.status) where.status = params.status as any;
    if (params.userId) where.userId = params.userId;
    if (params.search) {
      where.OR = [
        { orderNumber: { contains: params.search } },
        { customer: { firstName: { contains: params.search } } },
        { customer: { lastName: { contains: params.search } } },
      ];
    }
    if (params.startDate || params.endDate) {
      where.orderDate = {};
      if (params.startDate) where.orderDate.gte = new Date(params.startDate);
      if (params.endDate) where.orderDate.lte = new Date(params.endDate);
    }

    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
    if (params.sortBy === 'orderDate') orderBy.orderDate = params.sortOrder || 'desc';
    else if (params.sortBy === 'totalPrice') orderBy.totalPrice = params.sortOrder || 'desc';
    else orderBy.createdAt = 'desc';

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take,
        where,
        orderBy,
        include: { customer: true, product: true, user: true, productionTasks: true },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        product: true,
        user: true,
        productionTasks: { include: { assignedUser: true } },
        attachments: true,
      },
    });
    if (!order) throw new AppError('Order not found.', 404);
    return order;
  }

  async update(id: string, data: any) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new AppError('Order not found.', 404);

    if (data.quantity && data.unitPrice) {
      data.totalPrice = data.quantity * data.unitPrice;
    } else if (data.quantity) {
      data.totalPrice = data.quantity * order.unitPrice;
    } else if (data.unitPrice) {
      data.totalPrice = order.quantity * data.unitPrice;
    }

    if (data.status === 'DELIVERED') {
      data.deliveredAt = new Date();
    }

    return prisma.order.update({
      where: { id },
      data,
      include: { customer: true, product: true, user: true, productionTasks: true },
    });
  }

  async delete(id: string) {
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new AppError('Order not found.', 404);
    await prisma.order.delete({ where: { id } });
  }

  async getStats(userId?: string) {
    const where = userId ? { userId } : {};

    const [totalOrders, totalRevenue, statusCounts, todayOrders, weekOrders, monthOrders] =
      await Promise.all([
        prisma.order.count({ where }),
        prisma.order.aggregate({ where, _sum: { totalPrice: true } }),
        prisma.order.groupBy({
          by: ['status'],
          where,
          _count: true,
        }),
        prisma.order.count({
          where: { ...where, orderDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
        }),
        prisma.order.count({
          where: {
            ...where,
            orderDate: { gte: new Date(new Date().setDate(new Date().getDate() - 7)) },
          },
        }),
        prisma.order.count({
          where: {
            ...where,
            orderDate: { gte: new Date(new Date().setDate(1)) },
          },
        }),
      ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      statusCounts,
      todayOrders,
      weekOrders,
      monthOrders,
    };
  }
}

export const orderService = new OrderService();
