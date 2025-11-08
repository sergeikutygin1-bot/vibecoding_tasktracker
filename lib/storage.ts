/**
 * DEPRECATED: This file is no longer used in the application.
 *
 * The app has been migrated from localStorage to a database-backed API.
 * All task operations now use the API client in lib/api-client.ts.
 *
 * This file is kept for reference only and should not be imported
 * in new code.
 *
 * Migration date: 2025-11-08
 */

import { Task } from "@/types";

const STORAGE_KEY = "todo.tasks:v1";

export function getTasks(): Task[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load tasks from localStorage:", error);
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Failed to save tasks to localStorage:", error);
  }
}
