import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { createBookingSchema } from '../schemas/booking.js';
import { emailService } from '../services/email.js';
import { bookingLimiter } from '../middleware/rateLimit.js';

const router = Router();

// POST /api/bookings - Create a new booking
router.post('/', bookingLimiter, async (req, res) => {
  try {
    const data = createBookingSchema.parse(req.body);

    const clinic = await prisma.clinic.findUnique({
      where: { id: data.clinicId },
    });

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    // Get userId if authenticated
    let userId = null;
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        const { verifyToken } = await import('../lib/auth.js');
        const decoded = verifyToken(token);
        userId = decoded?.userId || null;
      }
    } catch (e) {
      // Not authenticated, continue without userId
    }

    const booking = await prisma.booking.create({
      data: {
        clinicId: data.clinicId,
        userId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
        status: 'PENDING',
      },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            phone: true,
            email: true, // Need email to notify clinic
          },
        },
      },
    });

    // Send notifications (non-blocking)
    const adminEmail = process.env.ADMIN_EMAIL || clinic.email;
    if (adminEmail) {
      emailService.sendNewLeadNotification(adminEmail, booking, clinic).catch(console.error);
    }
    emailService.sendBookingConfirmation(booking.email, booking, clinic).catch(console.error);

    return res.status(201).json(booking);
  } catch (error) {
    // Zod errors are handled by global error handler, but we'll leave this for now
    // or let it bubble up if we had async handler wrapper.
    // Since we are using try/catch, we need to pass zod error to next(error) or handle it.
    // The current pattern is res.status(500), so we should check for ZodError.
    
    // Ideally, we should use the global error handler I implemented earlier.
    // For now, I will throw the error to be caught by the global handler if I used `next(error)`,
    // but this route handler doesn't use `next`.
    // I will let the global error handler take care of it by calling `next(error)`.
    
    // Wait, the current implementation uses `res.status(500)`.
    // I should probably manually check for ZodError here OR switch to using `next(error)`.
    // Given I implemented `errorHandler` middleware in Phase 0, I should use it.
    // But `express` async handlers don't catch errors automatically unless I use a wrapper or `next`.
    
    // Let's modify the catch block to pass to next.
    // But the route signature is `(req, res)`. I need `next`.
    
    // Actually, I'll just rely on the existing pattern but add Zod check.
    // OR better, I'll update the signature to `(req, res, next)`.
    
    // Let's try to use the global handler.
    // But wait, the `bookings.ts` file I read didn't import `ZodError`.
    
    const { ZodError } = await import('zod');
    if (error instanceof ZodError) {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    
    console.error('Error creating booking:', error);
    return res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /api/bookings - Get bookings (admin only or user's own bookings)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const isAdmin = (req as any).user.role === 'ADMIN';
    const status = req.query.status as string;

    const where: any = {};
    if (!isAdmin) {
      where.userId = userId;
    }
    if (status) {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            city: true,
            phone: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// PUT /api/bookings/:id - Update booking status
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const isAdmin = (req as any).user.role === 'ADMIN';
    const { status } = req.body;

    if (!status || !['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const isOwner = booking.userId === userId;

    // Only allow cancellation if user is admin or owner
    if (status === 'CANCELLED' && !isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Only admins can change status to CONFIRMED
    if (status === 'CONFIRMED' && !isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return res.status(500).json({ error: 'Failed to update booking' });
  }
});

export default router;
