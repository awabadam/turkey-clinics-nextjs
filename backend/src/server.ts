import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.set('trust proxy', 1);
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiter
app.use('/api', apiLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

// Health check
app.get('/health', (_req, res) => {
  return res.json({ status: 'ok' });
});

// Routes
import authRoutes from './routes/auth.js';
import clinicsRoutes from './routes/clinics.js';
import reviewsRoutes from './routes/reviews.js';
import bookingsRoutes from './routes/bookings.js';
import favoritesRoutes from './routes/favorites.js';
import proceduresRoutes from './routes/procedures.js';
import analyticsRoutes from './routes/analytics.js';
import uploadRoutes from './routes/upload.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimit.js';

app.use('/api/auth', authRoutes);
app.use('/api/clinics', clinicsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/procedures', proceduresRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
