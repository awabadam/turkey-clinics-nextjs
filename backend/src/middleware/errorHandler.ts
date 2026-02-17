import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('[Error]', err);

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  // Handle Prisma Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      const field = (err.meta?.target as string[])?.join(', ') || 'field';
      return res.status(409).json({
        error: `This ${field} is already taken.`
      });
    }
    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Record not found.'
      });
    }
  }

  // Default Error
  const message = err.message || 'An unexpected error occurred';
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : message
  });
}
