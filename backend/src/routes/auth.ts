import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { loginValidator, registerValidator, changePasswordValidator } from '../validators/auth';

export const authRouter = Router();

authRouter.post('/login', loginValidator, validate, authController.login.bind(authController));
authRouter.post('/register', registerValidator, validate, authController.register.bind(authController));
authRouter.post('/refresh-token', authController.refreshToken.bind(authController));
authRouter.post('/logout', authenticate, authController.logout.bind(authController));
authRouter.get('/me', authenticate, authController.me.bind(authController));
authRouter.post('/change-password', authenticate, changePasswordValidator, validate, authController.changePassword.bind(authController));
