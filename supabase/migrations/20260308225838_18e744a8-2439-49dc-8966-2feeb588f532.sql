-- Fix ai_cache RLS: drop permissive policy, use restrictive service-role-only approach
DROP POLICY IF EXISTS "Service role full access" ON public.ai_cache;

-- No user-facing RLS policies = only service_role can access (RLS enabled but no policies for anon/authenticated)
-- Edge functions use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS