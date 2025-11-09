export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string | null; // ISO date string (YYYY-MM-DD)
  priority?: string | null;
  timeCost?: number | null; // Duration in minutes
  userId: string;
};
