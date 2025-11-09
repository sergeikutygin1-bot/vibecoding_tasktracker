import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthError {
  message: string;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { user: null, error: { message: error.message } };
  }

  // Create user record in database after successful signup
  if (data.user) {
    const { error: dbError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Failed to create user in database:', dbError);
      // Don't fail the signup - user can still authenticate
      // The user record will be created on next login attempt
    }
  }

  return { user: data.user, error: null };
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { user: null, error: { message: error.message } };
  }

  // Ensure user exists in database (fallback for users created before this fix)
  if (data.user) {
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', data.user.id)
      .single();

    if (!existingUser) {
      // User doesn't exist in database, create them
      const { error: dbError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

      if (dbError) {
        console.error('Failed to create user in database:', dbError);
      }
    }
  }

  return { user: data.user, error: null };
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: { message: error.message } };
  }

  return { error: null };
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    return { user: null, error: { message: error.message } };
  }

  return { user, error: null };
}

/**
 * Get the current session
 */
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    return { session: null, error: { message: error.message } };
  }

  return { session, error: null };
}
