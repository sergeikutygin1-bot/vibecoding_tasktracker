import { Task } from '@/types';
import { CreateTaskInput, UpdateTaskInput, TaskQueryParams } from './validations/task';

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Generic API request wrapper with error handling
 */
async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        response.status,
        data.error || 'Request failed',
        data.details
      );
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Network error or other fetch error
    if (error instanceof TypeError) {
      throw new APIError(0, 'Network error. Please check your connection.');
    }

    throw new APIError(500, 'An unexpected error occurred');
  }
}

/**
 * Task API client
 */
export const taskAPI = {
  /**
   * Get all tasks with optional filtering and sorting
   */
  getAll: async (params?: TaskQueryParams): Promise<Task[]> => {
    const query = new URLSearchParams(
      Object.entries(params || {})
        .filter(([_, v]) => v != null && v !== '')
        .map(([k, v]) => [k, String(v)])
    );

    const queryString = query.toString();
    const url = `/api/tasks${queryString ? `?${queryString}` : ''}`;

    const { tasks } = await apiRequest<{ tasks: Task[] }>(url);
    return tasks;
  },

  /**
   * Create a new task
   */
  create: async (data: CreateTaskInput): Promise<Task> => {
    const { task } = await apiRequest<{ task: Task }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return task;
  },

  /**
   * Update an existing task
   */
  update: async (id: string, data: UpdateTaskInput): Promise<Task> => {
    const { task } = await apiRequest<{ task: Task }>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return task;
  },

  /**
   * Delete a task
   */
  delete: async (id: string): Promise<boolean> => {
    const { success } = await apiRequest<{ success: boolean }>(
      `/api/tasks/${id}`,
      {
        method: 'DELETE',
      }
    );
    return success;
  },
};
