import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// GET /api/favorites - Get all favorites or check if specific clinic is favorited
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const clinicId = req.query.clinicId as string;

    if (clinicId) {
      // Check if specific clinic is favorited
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_clinicId: {
            userId,
            clinicId,
          },
        },
      });

      return res.json({ isFavorite: !!favorite });
    }

    // Get all favorites for user
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        clinic: {
          include: {
            _count: {
              select: { reviews: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// POST /api/favorites - Add a favorite
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { clinicId } = req.body;

    if (!clinicId) {
      return res.status(400).json({ error: 'Missing clinicId' });
    }

    // Check if clinic exists
    const clinic = await prisma.clinic.findUnique({
      where: { id: clinicId },
    });

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_clinicId: {
          userId,
          clinicId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Already favorited' });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId,
        clinicId,
      },
      include: {
        clinic: {
          include: {
            _count: {
              select: { reviews: true },
            },
          },
        },
      },
    });

    return res.status(201).json(favorite);
  } catch (error) {
    console.error('Error creating favorite:', error);
    return res.status(500).json({ error: 'Failed to create favorite' });
  }
});

// DELETE /api/favorites - Remove a favorite
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const clinicId = req.query.clinicId as string;

    if (!clinicId) {
      return res.status(400).json({ error: 'Missing clinicId' });
    }

    await prisma.favorite.delete({
      where: {
        userId_clinicId: {
          userId,
          clinicId,
        },
      },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error deleting favorite:', error);
    return res.status(500).json({ error: 'Failed to delete favorite' });
  }
});

export default router;
