import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { generateToken } from '../lib/auth.js';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { registerSchema, loginSchema } from '../schemas/auth.js';

const router = Router();

// POST /api/auth/register - Register a new user
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login - Login user
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    
    const user = await prisma.user.findUnique({
      where: { id: authReq.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const updateProfileSchema = z.object({
  name: z.string().optional(),
});

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { name } = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: authReq.user!.userId },
      data: {
        name: name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return res.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

// Change password
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: authReq.user!.userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: authReq.user!.userId },
      data: { password: hashedPassword },
    });

    return res.json({ message: 'Password updated successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
