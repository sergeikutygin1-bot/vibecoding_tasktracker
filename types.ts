export type Priority = "low" | "medium" | "high";

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string; // ISO date string (YYYY-MM-DD)
  priority?: Priority;
  timeCost?: number; // Duration in minutes
};
