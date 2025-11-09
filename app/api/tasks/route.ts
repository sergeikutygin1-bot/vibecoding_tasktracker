import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createTaskSchema, taskQuerySchema } from '@/lib/validations/task';
import { successResponse, errorResponse } from '@/lib/api-utils';
import { Task } from '@/types';

// GET /api/tasks - Fetch all tasks for the user
export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);

    // Parse and validate query parameters
    const queryParams = taskQuerySchema.parse({
      date: searchParams.get('date') || undefined,
      search: searchParams.get('search') || undefined,
      completed: searchParams.get('completed') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      sortOrder: searchParams.get('sortOrder') || undefined,
    });

    // Build Supabase query
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('userId', user.id);

    // Filter by date
    if (queryParams.date) {
      query = query.eq('dueDate', queryParams.date);
    }

    // Filter by completed status
    if (queryParams.completed) {
      query = query.eq('completed', queryParams.completed === 'true');
    }

    // Filter by search query (title contains, case-insensitive)
    if (queryParams.search) {
      query = query.ilike('title', `%${queryParams.search}%`);
    }

    // Apply sorting
    if (queryParams.sortBy === 'priority') {
      // Priority sorting will be handled in memory
      query = query.order('createdAt', { ascending: false });
    } else if (queryParams.sortBy === 'duration') {
      query = query.order('timeCost', {
        ascending: queryParams.sortOrder === 'asc',
        nullsFirst: false
      });
    } else {
      // Default sort by createdAt
      query = query.order('createdAt', {
        ascending: queryParams.sortOrder === 'asc'
      });
    }

    // Fetch tasks
    const { data: tasks, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return errorResponse('Failed to fetch tasks', 500);
    }

    // Handle priority sorting in memory (since it's stored as string)
    let sortedTasks = tasks || [];
    if (queryParams.sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      sortedTasks = sortedTasks.sort((a, b) => {
        const aPriority = a.priority as keyof typeof priorityOrder | null;
        const bPriority = b.priority as keyof typeof priorityOrder | null;
        const aValue = aPriority ? priorityOrder[aPriority] : 0;
        const bValue = bPriority ? priorityOrder[bPriority] : 0;

        return queryParams.sortOrder === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      });
    }

    return successResponse({ tasks: sortedTasks });
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return errorResponse('Failed to fetch tasks', 500);
  }
}

// POST /api/tasks - Create a new task
export async function POST(req: NextRequest) {
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

    const body = await req.json();

    // Validate request body
    const validatedData = createTaskSchema.parse(body);

    // Create task in database
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        ...validatedData,
        userId: user.id,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return errorResponse('Failed to create task', 500);
    }

    return successResponse({ task }, 201);
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return errorResponse('Failed to create task', 500);
  }
}
