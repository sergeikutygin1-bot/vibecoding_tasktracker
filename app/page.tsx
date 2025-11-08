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
  const [customTimeInputs, setCustomTimeInputs] = useState<Record<string, string>>({});

  // Form state for task creation
  const [formPriority, setFormPriority] = useState<Priority | undefined>(undefined);
  const [formDueDate, setFormDueDate] = useState<string>("");
  const [formTimeCost, setFormTimeCost] = useState<number>(30);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Edit modal state
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Sort state
  const [sortByPriority, setSortByPriority] = useState<"none" | "high-to-low" | "low-to-high">("none");
  const [sortByDuration, setSortByDuration] = useState<"none" | "short-to-long" | "long-to-short">("none");

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
      timeCost: formTimeCost,
      priority: formPriority,
      dueDate: formDueDate || undefined,
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    persistTasks(updatedTasks);

    // Reset form fields
    setInputValue("");
    setFormPriority(undefined);
    setFormDueDate("");
    setFormTimeCost(30);
    setShowAdvancedOptions(false);
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

  function handleFormPriorityChange(e: ChangeEvent<HTMLSelectElement>): void {
    const value = e.target.value as Priority | "";
    setFormPriority(value || undefined);
  }

  function handleFormDueDateChange(e: ChangeEvent<HTMLInputElement>): void {
    setFormDueDate(e.target.value);
  }

  function handleFormTimeCostChange(e: ChangeEvent<HTMLSelectElement>): void {
    setFormTimeCost(parseInt(e.target.value));
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

  function updateTaskTimeCost(id: string, timeCost: number | undefined): void {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, timeCost } : task
    );
    setTasks(updatedTasks);
    persistTasks(updatedTasks);
  }

  function deleteTask(id: string): void {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    persistTasks(updatedTasks);
    if (editingTaskId === id) {
      setEditingTaskId(null);
    }
  }

  function toggleEditMode(id: string): void {
    setEditingTaskId(editingTaskId === id ? null : id);
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

  // Helper to format time cost
  const formatTimeCost = (minutes: number | undefined): string => {
    const mins = minutes ?? 30; // Default to 30 if undefined
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (remainingMins === 0) return `${hours}h`;
    return `${hours}h ${remainingMins}m`;
  };

  // Helper to get priority value for sorting
  const getPriorityValue = (priority?: Priority): number => {
    switch (priority) {
      case "high": return 3;
      case "medium": return 2;
      case "low": return 1;
      default: return 0; // No priority goes at the end
    }
  };

  // Filter tasks by selected date, then apply sorting
  let displayedTasks = selectedDate
    ? tasks.filter((task) => task.dueDate === selectedDate)
    : tasks;

  // Apply sorting
  displayedTasks = [...displayedTasks].sort((a, b) => {
    // First, sort by priority if enabled
    if (sortByPriority !== "none") {
      const priorityA = getPriorityValue(a.priority);
      const priorityB = getPriorityValue(b.priority);

      if (priorityA !== priorityB) {
        return sortByPriority === "high-to-low"
          ? priorityB - priorityA
          : priorityA - priorityB;
      }
    }

    // Then, sort by duration as secondary sort
    if (sortByDuration !== "none") {
      const durationA = a.timeCost ?? 30;
      const durationB = b.timeCost ?? 30;

      if (durationA !== durationB) {
        return sortByDuration === "short-to-long"
          ? durationA - durationB
          : durationB - durationA;
      }
    }

    return 0;
  });

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
      <div className="mx-auto max-w-7xl p-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
          {/* Left Panel - Tasks (40%) */}
          <div className="w-full lg:w-2/5 flex flex-col">
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-md flex flex-col h-[800px]">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-800">Todo List</h1>
              <p className="mt-1 text-sm text-slate-600">
                Keep track of your tasks
              </p>
            </div>
          {/* Input form */}
          <form onSubmit={addTask} className="mb-6">
            <label htmlFor="task-input" className="sr-only">
              Add a new task
            </label>
            <div className="flex gap-2 items-center">
              <input
                id="task-input"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="What needs to be done?"
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="text-sm text-cyan-600 hover:text-cyan-700 font-medium px-3 py-2 rounded-lg hover:bg-cyan-50 transition-colors"
              >
                Options {showAdvancedOptions ? "▲" : "▼"}
              </button>
              <button
                type="submit"
                aria-label="Add task"
                className="rounded-lg bg-cyan-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
              >
                Add
              </button>
            </div>

            {/* Advanced options - collapsible */}
            {showAdvancedOptions && (
              <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-3 gap-3">
                {/* Time cost selector */}
                <div>
                  <label htmlFor="form-time" className="block text-xs font-medium text-slate-700 mb-1">
                    Duration
                  </label>
                  <select
                    id="form-time"
                    value={formTimeCost}
                    onChange={handleFormTimeCostChange}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                {/* Priority selector */}
                <div>
                  <label htmlFor="form-priority" className="block text-xs font-medium text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="form-priority"
                    value={formPriority || ""}
                    onChange={handleFormPriorityChange}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Date picker */}
                <div>
                  <label htmlFor="form-date" className="block text-xs font-medium text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    id="form-date"
                    type="date"
                    value={formDueDate}
                    onChange={handleFormDueDateChange}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>
            )}
          </form>

          {/* Sort controls */}
          <div className="mb-4 flex gap-3 items-center">
            {/* Priority sort */}
            <div className="flex-1">
              <label htmlFor="sort-priority" className="block text-xs font-medium text-slate-700 mb-1">
                Sort by Priority
              </label>
              <select
                id="sort-priority"
                value={sortByPriority}
                onChange={(e) => setSortByPriority(e.target.value as "none" | "high-to-low" | "low-to-high")}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="none">None</option>
                <option value="high-to-low">High → Low</option>
                <option value="low-to-high">Low → High</option>
              </select>
            </div>

            {/* Duration sort */}
            <div className="flex-1">
              <label htmlFor="sort-duration" className="block text-xs font-medium text-slate-700 mb-1">
                Sort by Duration
              </label>
              <select
                id="sort-duration"
                value={sortByDuration}
                onChange={(e) => setSortByDuration(e.target.value as "none" | "short-to-long" | "long-to-short")}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="none">None</option>
                <option value="short-to-long">Short → Long</option>
                <option value="long-to-short">Long → Short</option>
              </select>
            </div>
          </div>

          {/* Section header */}
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              {(() => {
                const activeSorts = [
                  sortByPriority !== 'none' ? 'priority' : null,
                  sortByDuration !== 'none' ? 'duration' : null
                ].filter(Boolean).length;

                const baseTitle = selectedDate ? `Tasks for ${selectedDate}` : 'All Tasks';

                return activeSorts > 0
                  ? `${baseTitle} (sorted by ${activeSorts} ${activeSorts > 1 ? 'criteria' : 'criterion'})`
                  : baseTitle;
              })()}
            </h2>
            {(selectedDate || sortByPriority !== 'none' || sortByDuration !== 'none') && (
              <button
                onClick={() => {
                  setSelectedDate(null);
                  setSortByPriority('none');
                  setSortByDuration('none');
                }}
                className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Task list */}
          <div className="flex-1 min-h-0 flex flex-col">
          {displayedTasks.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-slate-500 text-sm">
                No tasks yet. Add one above!
              </p>
            </div>
          ) : (
            <div className="space-y-1 overflow-y-auto h-full">
              {displayedTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 rounded-lg py-2 px-3 pl-4 border-l-4 transition-colors hover:bg-gray-50 ${getPriorityColor(task.priority)}`}
                >
                  <input
                    type="checkbox"
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1 flex items-center gap-2">
                    <label
                      htmlFor={`task-${task.id}`}
                      onClick={() => toggleTask(task.id)}
                      className={`cursor-pointer select-none text-sm ${
                        task.completed
                          ? "text-gray-400 line-through"
                          : "text-gray-700"
                      }`}
                    >
                      {task.title}
                    </label>

                    {/* Time cost badge */}
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-100 text-cyan-700 border border-cyan-300">
                      {formatTimeCost(task.timeCost)}
                    </span>
                  </div>

                  {/* Edit button */}
                  <button
                    onClick={() => toggleEditMode(task.id)}
                    className="p-1.5 rounded-lg text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                    aria-label="Edit task"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label="Delete task"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          </div>

          {/* Task count */}
          {tasks.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200 text-center text-sm text-slate-600">
              {tasks.filter((t) => !t.completed).length} of {tasks.length} tasks
              remaining
            </div>
          )}
        </div>
          </div>

          {/* Right Panel - Calendar (60%) */}
          <div className="w-full lg:w-3/5 flex flex-col">
            <Calendar
              tasks={tasksWithDates}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>
        </div>

        {/* Edit Modal */}
        {editingTaskId && (() => {
          const editingTask = tasks.find(t => t.id === editingTaskId);
          if (!editingTask) return null;

          return (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setEditingTaskId(null)}
            >
              <div
                className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4 border border-blue-100"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Edit Task</h3>

                {/* Task title display */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Task
                  </label>
                  <div className="text-sm text-slate-700 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    {editingTask.title}
                  </div>
                </div>

                {/* Time cost selector */}
                <div className="mb-4">
                  <label htmlFor="edit-time" className="block text-xs font-medium text-slate-700 mb-1">
                    Duration
                  </label>
                  <select
                    id="edit-time"
                    value={editingTask.timeCost ?? 30}
                    onChange={(e) => updateTaskTimeCost(editingTaskId, parseInt(e.target.value))}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                {/* Priority selector */}
                <div className="mb-4">
                  <label htmlFor="edit-priority" className="block text-xs font-medium text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    id="edit-priority"
                    value={editingTask.priority || ""}
                    onChange={(e) => {
                      const value = e.target.value as Priority | "";
                      updateTaskPriority(editingTaskId, value || undefined);
                    }}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Date picker */}
                <div className="mb-6">
                  <label htmlFor="edit-date" className="block text-xs font-medium text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    id="edit-date"
                    type="date"
                    value={editingTask.dueDate || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateTaskDate(editingTaskId, value || undefined);
                    }}
                    className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                {/* Modal buttons */}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setEditingTaskId(null)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </main>
  );
}
