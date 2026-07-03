import { Request, Response, NextFunction } from 'express';
import { prisma } from '../app';
import { authService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { createAuditLog } from '../utils/audit';

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      await createAuditLog({
        userId: result.user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: result.user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshAccessToken(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await authService.logout(refreshToken);

      await createAuditLog({
        userId: req.user?.id,
        action: 'LOGOUT',
        entity: 'User',
        entityId: req.user?.id,
      });

      res.json({ message: 'Logged out successfully.' });
    } catch (error) {
      next(error);
    }
  }

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { id: true, email: true, firstName: true, lastName: true, role: true, phone: true, avatar: true, isActive: true, createdAt: true },
      });
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.user!.id, currentPassword, newPassword);

      await createAuditLog({
        userId: req.user?.id,
        action: 'CHANGE_PASSWORD',
        entity: 'User',
        entityId: req.user?.id,
      });

      res.json({ message: 'Password changed successfully.' });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
