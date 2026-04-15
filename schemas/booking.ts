import { z } from 'zod';

export const createBookingSchema = z.object({
  clinicId: z.string().uuid("Invalid clinic ID"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  preferredDate: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
