import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createTaskSchema, taskQuerySchema } from '@/lib/validations/task';
import { successResponse, errorResponse, TEST_USER_ID } from '@/lib/api-utils';

// GET /api/tasks - Fetch all tasks for the user
export async function GET(req: NextRequest) {
  try {
  const { searchParams } = new URL(req.url);

  // Parse and validate query parameters
  const queryParams = taskQuerySchema.parse({
    date: searchParams.get('date') || undefined,
    search: searchParams.get('search') || undefined,
    completed: searchParams.get('completed') || undefined,
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: searchParams.get('sortOrder') || undefined,
  });

  // Build Prisma query
  const where: any = {
    userId: TEST_USER_ID,
  };

  // Filter by date
  if (queryParams.date) {
    where.dueDate = queryParams.date;
  }

  // Filter by completed status
  if (queryParams.completed) {
    where.completed = queryParams.completed === 'true';
  }

  // Filter by search query (title contains)
  if (queryParams.search) {
    where.title = {
      contains: queryParams.search,
      mode: 'insensitive',
    };
  }

  // Build orderBy clause
  let orderBy: any = { createdAt: 'desc' }; // Default sort

  if (queryParams.sortBy === 'priority') {
    // Custom priority sorting (high > medium > low)
    // Will need to fetch and sort in memory for proper priority ordering
  } else if (queryParams.sortBy === 'duration') {
    orderBy = { timeCost: queryParams.sortOrder || 'asc' };
  } else if (queryParams.sortBy === 'createdAt') {
    orderBy = { createdAt: queryParams.sortOrder || 'desc' };
  }

  // Fetch tasks
  let tasks = await prisma.task.findMany({
    where,
    orderBy,
  });

  // Handle priority sorting in memory (since it's stored as string)
  if (queryParams.sortBy === 'priority') {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    tasks = tasks.sort((a, b) => {
      const aPriority = a.priority as keyof typeof priorityOrder | null;
      const bPriority = b.priority as keyof typeof priorityOrder | null;
      const aValue = aPriority ? priorityOrder[aPriority] : 0;
      const bValue = bPriority ? priorityOrder[bPriority] : 0;

      return queryParams.sortOrder === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    });
  }

  return successResponse({ tasks });
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return errorResponse('Failed to fetch tasks', 500);
  }
}

// POST /api/tasks - Create a new task
export async function POST(req: NextRequest) {
  try {
  const body = await req.json();

  // Validate request body
  const validatedData = createTaskSchema.parse(body);

  // Create task in database
  const task = await prisma.task.create({
    data: {
      ...validatedData,
      userId: TEST_USER_ID,
      completed: false,
    },
  });

  return successResponse({ task }, 201);
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return errorResponse('Failed to create task', 500);
  }
}
