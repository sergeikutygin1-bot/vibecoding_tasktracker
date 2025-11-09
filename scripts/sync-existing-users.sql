-- Sync existing Supabase Auth users to public.users table
-- Run this AFTER applying supabase-auto-sync-users.sql
-- This will backfill any users that were created before the trigger was set up

-- Insert any auth.users that don't exist in public.users
INSERT INTO public.users (id, email, name, image, "emailVerified", "createdAt", "updatedAt")
SELECT
  au.id::TEXT,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', NULL) as name,
  COALESCE(au.raw_user_meta_data->>'avatar_url', NULL) as image,
  au.email_confirmed_at as "emailVerified",
  au.created_at as "createdAt",
  au.updated_at as "updatedAt"
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.users pu WHERE pu.id = au.id::TEXT
)
ON CONFLICT (id) DO NOTHING;

-- Report the results
DO $$
DECLARE
  auth_count INTEGER;
  public_count INTEGER;
  synced_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users;
  SELECT COUNT(*) INTO public_count FROM public.users;
  synced_count := public_count;

  RAISE NOTICE 'Sync completed:';
  RAISE NOTICE '  - Auth users (auth.users): %', auth_count;
  RAISE NOTICE '  - Public users (public.users): %', public_count;
  RAISE NOTICE '  - Users should match: %', CASE WHEN auth_count = public_count THEN 'YES ✓' ELSE 'NO - investigate!' END;
END $$;
