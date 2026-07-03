import { Router } from 'express';
import { orderController } from '../controllers/orderController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createOrderValidator, updateOrderValidator } from '../validators/order';
import { upload } from '../middleware/upload';
import { prisma } from '../app';

export const orderRouter = Router();

orderRouter.get('/stats', authenticate, orderController.getStats.bind(orderController));
orderRouter.get('/', authenticate, orderController.findAll.bind(orderController));
orderRouter.get('/:id', authenticate, orderController.findById.bind(orderController));
orderRouter.post('/', authenticate, createOrderValidator, validate, orderController.create.bind(orderController));
orderRouter.put('/:id', authenticate, updateOrderValidator, validate, orderController.update.bind(orderController));
orderRouter.delete('/:id', authenticate, authorize('ADMIN'), orderController.delete.bind(orderController));

orderRouter.post('/:id/attachments', authenticate, upload.single('file'), async (req: any, res: any, next: any) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    const attachment = await prisma.attachment.create({
      data: {
        orderId: req.params.id,
        filename: req.file.originalname,
        filepath: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
    res.status(201).json(attachment);
  } catch (error) {
    next(error);
  }
});
