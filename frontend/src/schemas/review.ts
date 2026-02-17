import { z } from 'zod';

export const createReviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().optional(),
  reviewCategories: z.object({
    cleanliness: z.number().min(1).max(5).optional(),
    staff: z.number().min(1).max(5).optional(),
    results: z.number().min(1).max(5).optional(),
    value: z.number().min(1).max(5).optional(),
  }).optional(),
  reviewImages: z.array(z.string().url()).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
