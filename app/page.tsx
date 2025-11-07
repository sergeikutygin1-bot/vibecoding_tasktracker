"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Task, Priority } from "@/types";
import { getTasks, saveTasks } from "@/lib/storage";
import Calendar from "./components/Calendar";

const INITIAL_TASKS: Task[] = [
  {
    id: "1",
    title: "Welcome to your todo list!",
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Click to mark tasks as complete",
    completed: true,
    createdAt: new Date().toISOString(),
  },
];

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Load tasks from localStorage on mount
  useEffect(() => {
    loadTasks();
  }, []);

  function loadTasks(): void {
    const stored = getTasks();
    if (stored.length > 0) {
      setTasks(stored);
    } else {
      setTasks(INITIAL_TASKS);
      saveTasks(INITIAL_TASKS);
    }
    setIsLoaded(true);
  }

  function persistTasks(updatedTasks: Task[]): void {
    saveTasks(updatedTasks);
  }

  function addTask(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    const title = inputValue.trim();
    if (!title) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    persistTasks(updatedTasks);
    setInputValue("");
  }

  function toggleTask(id: string): void {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    persistTasks(updatedTasks);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>): void {
    setInputValue(e.target.value);
  }

  function updateTaskDate(id: string, dueDate: string | undefined): void {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, dueDate } : task
    );
    setTasks(updatedTasks);
    persistTasks(updatedTasks);
  }

  function updateTaskPriority(id: string, priority: Priority | undefined): void {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, priority } : task
    );
    setTasks(updatedTasks);
    persistTasks(updatedTasks);
  }

  // Helper to get priority color classes
  const getPriorityColor = (priority?: Priority) => {
    switch (priority) {
      case "low":
        return "border-green-500 text-green-700 bg-green-50";
      case "medium":
        return "border-yellow-500 text-yellow-700 bg-yellow-50";
      case "high":
        return "border-red-500 text-red-700 bg-red-50";
      default:
        return "border-gray-300 text-gray-600 bg-white";
    }
  };

  // Filter tasks based on selected date
  const displayedTasks = selectedDate
    ? tasks.filter((task) => task.dueDate === selectedDate)
    : tasks.filter((task) => !task.dueDate); // Show only tasks without dates in main list

  const tasksWithDates = tasks.filter((task) => task.dueDate);

  // Prevent hydration mismatch by not rendering until loaded
  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8">
        <div className="mx-auto max-w-md p-4">
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <div className="h-8 animate-pulse rounded bg-slate-100"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 py-8">
      <div className="mx-auto max-w-md p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Todo List</h1>
          <p className="mt-1 text-sm text-slate-600">
            Keep track of your tasks
          </p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-md mb-6">
          {/* Input form */}
          <form onSubmit={addTask} className="mb-6">
            <label htmlFor="task-input" className="sr-only">
              Add a new task
            </label>
            <div className="flex gap-2">
              <input
                id="task-input"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="What needs to be done?"
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                type="submit"
                aria-label="Add task"
                className="rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
              >
                Add
              </button>
            </div>
          </form>

          {/* Section header */}
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              {selectedDate ? `Tasks for ${selectedDate}` : "Tasks without dates"}
            </h2>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* Task list */}
          {displayedTasks.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-500 text-sm">
                {selectedDate ? "No tasks for this date" : "No tasks without dates"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {displayedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-2 rounded-lg py-2 px-2 pl-3 border-l-4 transition-colors hover:bg-gray-50 ${getPriorityColor(task.priority)}`}
                >
                  <input
                    type="checkbox"
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={`task-${task.id}`}
                    onClick={() => toggleTask(task.id)}
                    className={`flex-1 cursor-pointer select-none text-sm ${
                      task.completed
                        ? "text-gray-400 line-through"
                        : "text-gray-700"
                    }`}
                  >
                    {task.title}
                  </label>

                  {/* Priority selector */}
                  <select
                    value={task.priority || ""}
                    onChange={(e) => {
                      const value = e.target.value as Priority | "";
                      updateTaskPriority(task.id, value || undefined);
                    }}
                    className={`text-xs rounded border px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                      task.priority
                        ? task.priority === "low"
                          ? "border-green-500 text-green-700"
                          : task.priority === "medium"
                          ? "border-yellow-500 text-yellow-700"
                          : "border-red-500 text-red-700"
                        : "border-gray-300 text-gray-600"
                    }`}
                  >
                    <option value="">Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>

                  {/* Date picker */}
                  <div className="flex items-center gap-1">
                    <input
                      type="date"
                      value={task.dueDate || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateTaskDate(task.id, value || undefined);
                      }}
                      className="text-xs rounded border border-slate-200 px-2 py-1 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                    {task.dueDate && (
                      <button
                        onClick={() => updateTaskDate(task.id, undefined)}
                        className="p-1 text-gray-400 hover:text-red-600"
                        aria-label="Clear date"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendar */}
        <Calendar
          tasks={tasksWithDates}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        {/* Task count */}
        {tasks.length > 0 && (
          <div className="mt-4 text-center text-sm text-slate-600">
            {tasks.filter((t) => !t.completed).length} of {tasks.length} tasks
            remaining
          </div>
        )}
      </div>
    </main>
  );
}
