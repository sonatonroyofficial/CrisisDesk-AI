import { z } from 'zod';

export const createReportSchema = z.object({
  description: z.string().min(1),
  location: z.string().min(1),
  contact: z.string().optional(),
  name: z.string().optional(),
  language: z.enum(['bn', 'en', 'unknown']).default('unknown'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['pending', 'in_review', 'assigned', 'resolved', 'rejected']),
});
