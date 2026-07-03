import { Router } from 'express';
import { prisma } from '../app';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Response } from 'express';

export const settingsRouter = Router();

settingsRouter.get('/', authenticate, authorize('ADMIN'), async (_req: AuthRequest, res: Response) => {
  const settings = await prisma.systemSetting.findMany();
  const result: Record<string, string> = {};
  settings.forEach((s) => { result[s.key] = s.value; });
  res.json(result);
});

settingsRouter.put('/', authenticate, authorize('ADMIN'), async (req: AuthRequest, res: Response) => {
  const entries = Object.entries(req.body);
  for (const [key, value] of entries) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: value as string },
      create: { key, value: value as string },
    });
  }
  res.json({ message: 'Settings updated.' });
});
