import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth.js';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { clinicRegistrationSchema } from '../schemas/clinic-registration.js';

const router = Router();

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// POST /api/clinics/register - Register a new clinic (Self-service)
router.post('/register', async (req, res) => {
  try {
    const data = clinicRegistrationSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate slug
    let slug = slugify(data.clinicName);
    const existingClinic = await prisma.clinic.findUnique({ where: { slug } });
    if (existingClinic) {
      slug = `${slug}-${Date.now()}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Transaction to create User and Clinic
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.ownerName,
          role: 'CLINIC_OWNER',
        },
      });

      const clinic = await tx.clinic.create({
        data: {
          name: data.clinicName,
          slug,
          address: data.address,
          city: data.city,
          phone: data.phone,
          website: data.website || null,
          description: data.description || null,
          status: 'PENDING_APPROVAL',
          ownerId: user.id,
        },
      });

      return { user, clinic };
    });

    // TODO: Send email notifications (Admin & Owner)

    return res.status(201).json({ message: 'Clinic registration submitted successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error registering clinic:', error);
    return res.status(500).json({ error: 'Failed to register clinic' });
  }
});

// GET /api/clinics/admin/pending - List pending clinics
router.get('/admin/pending', authMiddleware, adminMiddleware, async (_req, res) => {
  try {
    const clinics = await prisma.clinic.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: { owner: { select: { email: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(clinics);
  } catch (error) {
    console.error('Error fetching pending clinics:', error);
    return res.status(500).json({ error: 'Failed to fetch pending clinics' });
  }
});

// PUT /api/clinics/admin/:id/approve - Approve clinic
router.put('/admin/:id/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const clinic = await prisma.clinic.update({
      where: { id },
      data: { status: 'ACTIVE' },
      include: { owner: true },
    });
    
    // TODO: Send approval email

    return res.json(clinic);
  } catch (error) {
    console.error('Error approving clinic:', error);
    return res.status(500).json({ error: 'Failed to approve clinic' });
  }
});

// PUT /api/clinics/admin/:id/reject - Reject clinic
router.put('/admin/:id/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.clinic.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });

    return res.json({ message: 'Clinic rejected/suspended' });
  } catch (error) {
    console.error('Error rejecting clinic:', error);
    return res.status(500).json({ error: 'Failed to reject clinic' });
  }
});

// GET /api/clinics - List clinics with filters
router.get('/', async (req, res) => {
  try {
    const {
      city,
      search,
      services,
      languages,
      minRating,
      sortBy = 'newest',
      page = '1',
      limit = '12',
    } = req.query;

    const where: any = {};

    if (city && city !== 'all') {
      where.city = city as string;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (services) {
      const servicesArray = (services as string).split(',').filter(Boolean);
      if (servicesArray.length > 0) {
        where.services = { hasSome: servicesArray };
      }
    }

    if (languages) {
      const languagesArray = (languages as string).split(',').filter(Boolean);
      if (languagesArray.length > 0) {
        where.languages = { hasSome: languagesArray };
      }
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const clinicsWithReviews = await prisma.clinic.findMany({
      where,
      include: {
        reviews: {
          select: { rating: true },
        },
        procedures: {
          select: { averagePrice: true },
        },
        _count: {
          select: { reviews: true },
        },
      },
    });

    // Calculate average ratings and filter by minRating
    let filteredClinics = clinicsWithReviews.map((clinic) => {
      const avgRating =
        clinic.reviews.length > 0
          ? clinic.reviews.reduce((sum, r) => sum + r.rating, 0) / clinic.reviews.length
          : 0;
      return {
        ...clinic,
        averageRating: avgRating,
      };
    });

    if (minRating && minRating !== 'all') {
      const minRatingNum = parseFloat(minRating as string);
      filteredClinics = filteredClinics.filter(
        (clinic) => clinic.averageRating >= minRatingNum
      );
    }

    // Sort clinics
    let sortedClinics = [...filteredClinics];
    switch (sortBy) {
      case 'rating':
        sortedClinics.sort((a, b) => b.averageRating - a.averageRating);
        break;
      case 'reviews':
        sortedClinics.sort((a, b) => b._count.reviews - a._count.reviews);
        break;
      case 'name':
        sortedClinics.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        sortedClinics.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    const total = sortedClinics.length;
    const paginatedClinics = sortedClinics.slice(skip, skip + limitNum);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      clinics: paginatedClinics,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching clinics:', error);
    res.status(500).json({ error: 'Failed to fetch clinics' });
  }
});

// GET /api/clinics/stats - Get clinic statistics (must be before /:id route)
router.get('/stats', async (_req, res) => {
  try {
    const clinics = await prisma.clinic.findMany({
      select: {
        city: true,
      },
    });

    const uniqueCities = Array.from(new Set(clinics.map(c => c.city))).sort();
    const totalCount = clinics.length;

    return res.json({
      _count: totalCount,
      cities: uniqueCities,
    });
  } catch (error) {
    console.error('Error fetching clinic stats:', error);
    return res.status(500).json({ error: 'Failed to fetch clinic stats' });
  }
});

// GET /api/clinics/search - Autocomplete search
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query || query.length < 2) {
      return res.json([]);
    }

    const clinics = await prisma.clinic.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        images: true,
      },
      take: 5,
    });

    return res.json(clinics);
  } catch (error) {
    console.error('Error searching clinics:', error);
    return res.status(500).json({ error: 'Failed to search clinics' });
  }
});

// GET /api/clinics/my-clinic - Get owned clinic (Clinic Owner only)
router.get('/my-clinic', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { ownedClinic: true },
    });

    if (!user || !user.ownedClinic) {
      return res.status(404).json({ error: 'No clinic found for this user' });
    }

    return res.json(user.ownedClinic);
  } catch (error) {
    console.error('Error fetching my clinic:', error);
    return res.status(500).json({ error: 'Failed to fetch clinic' });
  }
});

// GET /api/clinics/:id - Get single clinic by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const clinic = await prisma.clinic.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        procedures: true,
        _count: {
          select: { reviews: true, bookings: true },
        },
      },
    });

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    return res.json(clinic);
  } catch (error) {
    console.error('Error fetching clinic:', error);
    return res.status(500).json({ error: 'Failed to fetch clinic' });
  }
});

// GET /api/clinics/slug/:slug - Get clinic by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const clinic = await prisma.clinic.findUnique({
      where: { slug },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        procedures: true,
        _count: {
          select: { reviews: true, bookings: true },
        },
      },
    });

    if (!clinic) {
      return res.status(404).json({ error: 'Clinic not found' });
    }

    return res.json(clinic);
  } catch (error) {
    console.error('Error fetching clinic:', error);
    return res.status(500).json({ error: 'Failed to fetch clinic' });
  }
});

// GET /api/clinics/my-clinic - Get owned clinic (Clinic Owner only)
router.get('/my-clinic', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { ownedClinic: true },
    });

    if (!user || !user.ownedClinic) {
      return res.status(404).json({ error: 'No clinic found for this user' });
    }

    return res.json(user.ownedClinic);
  } catch (error) {
    console.error('Error fetching my clinic:', error);
    return res.status(500).json({ error: 'Failed to fetch clinic' });
  }
});

// POST /api/clinics - Create clinic (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const clinicSchema = z.object({
      name: z.string().min(1),
      slug: z.string().min(1),
      description: z.string().optional(),
      address: z.string().min(1),
      city: z.string().min(1),
      phone: z.string().min(1),
      email: z.string().email().optional(),
      website: z.string().url().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      services: z.array(z.string()).default([]),
      languages: z.array(z.string()).default([]),
      certifications: z.array(z.string()).default([]),
      accreditations: z.array(z.string()).default([]),
      doctorCount: z.number().optional(),
      establishedYear: z.number().optional(),
      images: z.array(z.string()).default([]),
      beforeAfterImages: z.array(z.string()).default([]),
      trustBadges: z.array(z.string()).default([]),
      successStories: z.array(z.string()).default([]),
      featured: z.boolean().default(false),
    });

    const data = clinicSchema.parse(req.body);
    const clinic = await prisma.clinic.create({ data });
    return res.status(201).json(clinic);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error creating clinic:', error);
    return res.status(500).json({ error: 'Failed to create clinic' });
  }
});

// PUT /api/clinics/:id - Update clinic (Admin or Owner)
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    // Check permissions
    if (userRole !== 'ADMIN') {
      const clinic = await prisma.clinic.findUnique({
        where: { id },
        select: { ownerId: true },
      });

      if (!clinic || clinic.ownerId !== userId) {
        return res.status(403).json({ error: 'Unauthorized to update this clinic' });
      }
    }

    const clinicSchema = z.object({
      name: z.string().min(1).optional(),
      slug: z.string().min(1).optional(),
      description: z.string().optional(),
      address: z.string().min(1).optional(),
      city: z.string().min(1).optional(),
      phone: z.string().min(1).optional(),
      email: z.string().email().optional(),
      website: z.string().url().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      services: z.array(z.string()).optional(),
      languages: z.array(z.string()).optional(),
      certifications: z.array(z.string()).optional(),
      accreditations: z.array(z.string()).optional(),
      doctorCount: z.number().optional(),
      establishedYear: z.number().optional(),
      images: z.array(z.string()).optional(),
      beforeAfterImages: z.array(z.string()).optional(),
      trustBadges: z.array(z.string()).optional(),
      successStories: z.array(z.string()).optional(),
      featured: z.boolean().optional(),
    });

    const data = clinicSchema.parse(req.body);

    // Prevent non-admins from updating restricted fields
    if (userRole !== 'ADMIN') {
      delete data.featured;
      // delete data.status; // status is not in schema anyway
    }

    const clinic = await prisma.clinic.update({
      where: { id },
      data,
    });
    return res.json(clinic);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Error updating clinic:', error);
    return res.status(500).json({ error: 'Failed to update clinic' });
  }
});

// DELETE /api/clinics/:id - Delete clinic (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await prisma.clinic.delete({ where: { id } });
    return res.json({ message: 'Clinic deleted successfully' });
  } catch (error) {
    console.error('Error deleting clinic:', error);
    return res.status(500).json({ error: 'Failed to delete clinic' });
  }
});

export default router;
