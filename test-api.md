# API Routes Testing Guide

The API routes have been successfully implemented and built. Here's how to test them:

## Available Endpoints

### 1. GET /api/tasks
Fetch all tasks for the test user.

**Query Parameters:**
- `date` (optional): Filter by due date (YYYY-MM-DD)
- `search` (optional): Search in task title
- `completed` (optional): Filter by completion status ("true" or "false")
- `sortBy` (optional): Sort by "priority", "duration", or "createdAt"
- `sortOrder` (optional): "asc" or "desc"

**Example:**
```bash
curl http://localhost:3000/api/tasks
curl "http://localhost:3000/api/tasks?date=2025-11-08"
curl "http://localhost:3000/api/tasks?search=welcome&sortBy=priority&sortOrder=desc"
```

### 2. POST /api/tasks
Create a new task.

**Body:**
```json
{
  "title": "My new task",
  "priority": "high",
  "dueDate": "2025-11-10",
  "timeCost": 60
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task","priority":"medium","timeCost":30}'
```

### 3. PATCH /api/tasks/[id]
Update an existing task.

**Body (all fields optional):**
```json
{
  "title": "Updated title",
  "completed": true,
  "priority": "low",
  "dueDate": "2025-11-11",
  "timeCost": 45
}
```

**Example:**
```bash
curl -X PATCH http://localhost:3000/api/tasks/TASK_ID \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

### 4. DELETE /api/tasks/[id]
Delete a task.

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/tasks/TASK_ID
```

## Running the Tests

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Use one of these tools to test:
   - **cURL** (command line) - examples above
   - **Thunder Client** (VS Code extension)
   - **Postman** (desktop app)
   - **Insomnia** (desktop app)

## Sample Test Flow

1. **Get all tasks** - Should return 2 sample tasks from seed
2. **Create a task** - POST new task, save the returned ID
3. **Get all tasks** - Should now return 3 tasks
4. **Update task** - PATCH to mark task as completed
5. **Get all tasks** - Verify task is updated
6. **Delete task** - DELETE using the task ID
7. **Get all tasks** - Should be back to 2 tasks

## Notes

- All endpoints use the hardcoded test user ID: `cmhqhy2q30000k5zcu0jspwws`
- The database is SQLite (file: `prisma/dev.db`)
- Toast notifications are configured but only visible when frontend calls the API
- Frontend still uses localStorage - API is ready but not yet integrated
