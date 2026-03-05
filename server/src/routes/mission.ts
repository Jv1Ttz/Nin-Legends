import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/:characterId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const characterId = req.params.characterId as string;
    const missions = await prisma.mission.findMany({
      where: {
        characterId,
        character: { userId: req.userId! },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ missions });
  } catch (err) {
    console.error('Get missions error:', err);
    res.status(500).json({ error: 'Erro ao buscar missões' });
  }
});

export { router as missionRoutes };
