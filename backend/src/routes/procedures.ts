import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/procedures - Get all procedures
router.get('/', async (req, res) => {
  try {
    const clinicId = req.query.clinicId as string;

    const where: any = {};
    if (clinicId) {
      where.clinicId = clinicId;
    }

    const procedures = await prisma.procedure.findMany({
      where,
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return res.json(procedures);
  } catch (error) {
    console.error('Error fetching procedures:', error);
    return res.status(500).json({ error: 'Failed to fetch procedures' });
  }
});

// POST /api/procedures - Create a new procedure (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, description, averagePrice, clinicId } = req.body;

    if (!name || !clinicId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const procedure = await prisma.procedure.create({
      data: {
        name,
        description: description || null,
        averagePrice: averagePrice ? parseFloat(averagePrice) : null,
        clinicId,
      },
    });

    return res.status(201).json(procedure);
  } catch (error) {
    console.error('Error creating procedure:', error);
    return res.status(500).json({ error: 'Failed to create procedure' });
  }
});

// PUT /api/procedures/:id - Update a procedure (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, averagePrice } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (averagePrice !== undefined) {
      updateData.averagePrice = averagePrice ? parseFloat(averagePrice) : null;
    }

    const procedure = await prisma.procedure.update({
      where: { id },
      data: updateData,
    });

    res.json(procedure);
  } catch (error) {
    console.error('Error updating procedure:', error);
    res.status(500).json({ error: 'Failed to update procedure' });
  }
});

// DELETE /api/procedures/:id - Delete a procedure (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    await prisma.procedure.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting procedure:', error);
    res.status(500).json({ error: 'Failed to delete procedure' });
  }
});

export default router;
