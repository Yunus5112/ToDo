import { z } from 'zod';

export const listCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80, 'Max 80 chars'),
});

export const taskCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Max 120 chars'),
  list_id: z.number().int().positive(),
});

export type ListCreateInput = z.infer<typeof listCreateSchema>;
export type TaskCreateInput = z.infer<typeof taskCreateSchema>;


