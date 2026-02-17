import { Router } from 'express';
import multer from 'multer';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth.js';
import { storageService } from '../services/storage.js';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
});

// POST /api/upload - Upload an image file (Admin only)
router.post('/', authMiddleware, adminMiddleware, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const url = await storageService.upload({
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
    });

    return res.json({ url });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload file' });
  }
});

export default router;
