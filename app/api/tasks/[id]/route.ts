import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { updateTaskSchema } from '@/lib/validations/task';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { Task } from '@/types';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PATCH /api/tasks/[id] - Update a specific task
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    // Create Supabase client with cookies for auth
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.delete(name);
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await context.params;
    const body = await req.json();

    // Validate request body
    const validatedData = updateTaskSchema.parse(body);

    // Check if task exists and belongs to user
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single<Task>();

    if (fetchError || !existingTask) {
      return errorResponse('Task not found', 404);
    }

    if (existingTask.userId !== user.id) {
      return errorResponse('Unauthorized', 403);
    }

    // Update task
    const { data: task, error: updateError } = await supabase
      .from('tasks')
      .update(validatedData as any)
      .eq('id', id)
      .select()
      .single<Task>();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return errorResponse('Failed to update task', 500);
    }

    return successResponse({ task });
  } catch (error) {
    console.error('PATCH /api/tasks/[id] error:', error);
    return errorResponse('Failed to update task', 500);
  }
}

// DELETE /api/tasks/[id] - Delete a specific task
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    // Create Supabase client with cookies for auth
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.delete(name);
          },
        },
      }
    );

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await context.params;

    // Check if task exists and belongs to user
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single<Task>();

    if (fetchError || !existingTask) {
      return errorResponse('Task not found', 404);
    }

    if (existingTask.userId !== user.id) {
      return errorResponse('Unauthorized', 403);
    }

    // Delete task
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      return errorResponse('Failed to delete task', 500);
    }

    return successResponse({ success: true });
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error);
    return errorResponse('Failed to delete task', 500);
  }
}
