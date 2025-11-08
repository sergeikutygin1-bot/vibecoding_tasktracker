import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateTaskSchema } from '@/lib/validations/task';
import { successResponse, errorResponse, TEST_USER_ID } from '@/lib/api-utils';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PATCH /api/tasks/[id] - Update a specific task
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
  const { id } = await context.params;
  const body = await req.json();

  // Validate request body
  const validatedData = updateTaskSchema.parse(body);

  // Check if task exists and belongs to user
  const existingTask = await prisma.task.findUnique({
    where: { id },
  });

  if (!existingTask) {
    return errorResponse('Task not found', 404);
  }

  if (existingTask.userId !== TEST_USER_ID) {
    return errorResponse('Unauthorized', 403);
  }

  // Update task
  const task = await prisma.task.update({
    where: { id },
    data: validatedData,
  });

  return successResponse({ task });
  } catch (error) {
    console.error('PATCH /api/tasks/[id] error:', error);
    return errorResponse('Failed to update task', 500);
  }
}

// DELETE /api/tasks/[id] - Delete a specific task
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
  const { id } = await context.params;

  // Check if task exists and belongs to user
  const existingTask = await prisma.task.findUnique({
    where: { id },
  });

  if (!existingTask) {
    return errorResponse('Task not found', 404);
  }

  if (existingTask.userId !== TEST_USER_ID) {
    return errorResponse('Unauthorized', 403);
  }

  // Delete task
  await prisma.task.delete({
    where: { id },
  });

  return successResponse({ success: true });
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error);
    return errorResponse('Failed to delete task', 500);
  }
}
