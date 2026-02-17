import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { createReviewSchema } from '../schemas/review.js';
import { reviewLimiter } from '../middleware/rateLimit.js';

const router = Router();

// POST /api/reviews - Create a new review
router.post('/', authMiddleware, reviewLimiter, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const data = createReviewSchema.parse(req.body);

    const clinic = await prisma.clinic.findUnique({
      where: { id: data.clinicId },
    });

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    const review = await prisma.review.create({
      data: {
        clinicId: data.clinicId,
        userId,
        rating: data.rating,
        comment: data.comment,
        reviewCategories: (data.reviewCategories as any) || undefined,
        reviewImages: data.reviewImages || [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json(review);
  } catch (error) {
    const { ZodError } = await import('zod');
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    console.error('Error creating review:', error);
    return res.status(500).json({ error: 'Failed to create review' });
  }
});

// GET /api/reviews - Get reviews (for a clinic or all)
router.get('/', async (req, res) => {
  try {
    const clinicId = req.query.clinicId as string;

    const reviews = await prisma.review.findMany({
      where: clinicId ? { clinicId } : {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        clinic: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// PUT /api/reviews/:id/verify - Toggle review verification (admin only)
router.put('/:id/verify', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;

    if (typeof verified !== 'boolean') {
      return res.status(400).json({ error: 'verified must be a boolean' });
    }

    const review = await prisma.review.update({
      where: { id },
      data: { verified },
    });

    return res.json(review);
  } catch (error) {
    console.error('Error updating review verification:', error);
    return res.status(500).json({ error: 'Failed to update review' });
  }
});

// DELETE /api/reviews/:id - Delete a review (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await prisma.review.delete({
      where: { id },
    });

    return res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
