# CLAUDE.md

- Never run "npm run dev".
- Use "npm run build" to check if code compiles or not. See results and fix code if needed.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A task tracker web application built with Next.js 15 (App Router), TypeScript, and Tailwind CSS v3. Features task management with calendar integration, priority levels, and localStorage persistence. Uses a coastal color palette (slate, cyan, blue tones).

## Development Commands

- **Build**: `npm run build` - Compiles TypeScript and builds production bundle. Use this to verify code correctness.
- **Lint**: `npm run lint` - Runs Next.js ESLint checks
- **Production**: `npm start` - Runs production server (requires build first)
- **Dev**: Avoid running `npm run dev` unless specifically requested

## Architecture

### State Management
- **Client-side only**: All components use React hooks (`useState`, `useEffect`)
- **No external state libraries**: Direct state manipulation via setState functions
- **Persistence**: localStorage via `lib/storage.ts` wrapper functions

### Data Flow
1. **Load**: `app/page.tsx` → `getTasks()` → localStorage → hydrate state
2. **Update**: User action → state update → `persistTasks()` → localStorage
3. **Filter**: `selectedDate` state controls calendar date filtering

### Key Components

**`app/page.tsx`** (Main container, ~280 lines)
- Manages all application state: tasks, input, selectedDate
- Handles CRUD operations: addTask, toggleTask, updateTaskDate, updateTaskPriority
- Filters tasks by date: `displayedTasks` shows either date-filtered or undated tasks
- Client-side only ("use client" directive)

**`app/components/Calendar.tsx`** (Calendar UI, ~185 lines)
- Receives tasks with dates as prop, displays monthly calendar grid
- Manages own month/year navigation state
- Generates calendar days dynamically, showing priority-colored dots for tasks
- Date selection updates parent state via `onDateSelect` callback

**`lib/storage.ts`** (localStorage wrapper, ~25 lines)
- `getTasks()`: Reads and parses tasks from localStorage key `"todo.tasks:v1"`
- `saveTasks(tasks)`: Serializes and writes tasks to localStorage
- Handles errors gracefully, SSR-safe (checks `typeof window`)

**`types.ts`** (Type definitions, ~10 lines)
- `Task`: id, title, completed, createdAt, dueDate?, priority?
- `Priority`: "low" | "medium" | "high"

### State Structure

```typescript
// Main state in app/page.tsx
const [tasks, setTasks] = useState<Task[]>([])        // All tasks
const [inputValue, setInputValue] = useState("")      // New task input
const [isLoaded, setIsLoaded] = useState(false)       // Hydration flag
const [selectedDate, setSelectedDate] = useState<string | null>(null)  // Calendar filter

// Derived state
displayedTasks = selectedDate
  ? tasks.filter(t => t.dueDate === selectedDate)     // Date-filtered
  : tasks.filter(t => !t.dueDate)                     // Undated only
tasksWithDates = tasks.filter(t => t.dueDate)         // For calendar display
```

### Task Lifecycle

**Create**: `addTask()` → new Task object with `Date.now()` id → append to state → persist
**Toggle**: `toggleTask(id)` → map over tasks, flip completed boolean → persist
**Update Date**: `updateTaskDate(id, date)` → map over tasks, set dueDate → persist
**Update Priority**: `updateTaskPriority(id, priority)` → map over tasks, set priority → persist

### Color System (Tailwind)

**Background gradient**: `from-slate-50 via-blue-50 to-cyan-50`
**Primary accent**: cyan-600 (buttons, focus rings, selections)
**Text**: slate-800 (headers), slate-600/700 (body)
**Borders**: blue-100 (cards), slate-200 (inputs)

**Priority colors**:
- Low: green-500 (border/dot), green-700 (text), green-50 (bg)
- Medium: yellow-500 (border/dot), yellow-700 (text), yellow-50 (bg)
- High: red-500 (border/dot), red-700 (text), red-50 (bg)

### Important Implementation Details

**Hydration handling**: `isLoaded` flag prevents SSR/client mismatch. Renders loading skeleton until localStorage is read client-side.

**Calendar dot rendering**: Maps over `tasksForDay.slice(0, 3)` to show up to 3 priority-colored dots per date.

**Task filtering logic**: When `selectedDate` is set, main list shows ONLY tasks for that date. When null, shows ONLY undated tasks. Calendar always receives `tasksWithDates`.

**localStorage key**: `"todo.tasks:v1"` - version suffix allows future schema migrations.

**Date format**: ISO date strings `YYYY-MM-DD` for consistency with HTML date input.

## File Organization

```
app/
  components/Calendar.tsx    # Calendar component (isolated, reusable)
  layout.tsx                 # Root layout, minimal (just globals.css import)
  page.tsx                   # Main page, all business logic
  globals.css                # Tailwind directives only
lib/
  storage.ts                 # localStorage wrapper functions
types.ts                     # Shared TypeScript types
```

## Making Changes

**Adding task properties**: Update `Task` type in `types.ts`, add UI in `app/page.tsx`, ensure persistence in `updateTask*` functions.

**Modifying colors**: Update Tailwind classes. Coastal palette uses slate/cyan/blue. Priority colors are functional (green/yellow/red).

**Calendar changes**: Edit `app/components/Calendar.tsx`. Component receives tasks as props, manages its own month/year state.

**State updates**: Always call `persistTasks(updatedTasks)` after `setTasks()` to maintain localStorage sync.
