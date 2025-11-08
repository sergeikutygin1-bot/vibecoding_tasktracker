import { z } from 'zod';

// Priority enum
export const prioritySchema = z.enum(['low', 'medium', 'high']);

// Schema for creating a new task
export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(500, 'Title too long'),
  priority: prioritySchema.optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  timeCost: z.number().int().positive('Time cost must be positive').max(1440, 'Time cost cannot exceed 24 hours').optional(),
});

// Schema for updating an existing task
export const updateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(500, 'Title too long').optional(),
  completed: z.boolean().optional(),
  priority: prioritySchema.nullable().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').nullable().optional(),
  timeCost: z.number().int().positive('Time cost must be positive').max(1440, 'Time cost cannot exceed 24 hours').nullable().optional(),
});

// Schema for query parameters
export const taskQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format').optional(),
  search: z.string().optional(),
  completed: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['priority', 'duration', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// TypeScript types derived from schemas
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryParams = z.infer<typeof taskQuerySchema>;
