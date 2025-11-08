import { NextResponse } from 'next/server';

// Hardcoded test user ID for development
// This will be replaced with real authentication later
export const TEST_USER_ID = 'cmhqhy2q30000k5zcu0jspwws';

// Success response helper
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

// Error response helper
export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
