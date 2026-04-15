import { z } from 'zod';

export const clinicRegistrationSchema = z.object({
  // Clinic Info
  clinicName: z.string().min(2),
  address: z.string().min(5),
  city: z.string().min(2),
  phone: z.string().min(5),
  website: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  
  // Owner Account
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export type ClinicRegistrationInput = z.infer<typeof clinicRegistrationSchema>;
