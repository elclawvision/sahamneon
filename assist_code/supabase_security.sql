-- Migration: Create Active User Sessions and Register RPC
-- Purpose: Enable Single-Session Enforcement (SSE) to prevent account sharing

-- 1. Create the table for active sessions if it doesn't exist
CREATE TABLE IF NOT EXISTS public.active_user_sessions (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create helper table for client tracking (legacy)
CREATE TABLE IF NOT EXISTS public.saham_clients (
    user_email TEXT PRIMARY KEY,
    last_login TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS but allow authenticated users to read/update their own session
ALTER TABLE public.active_user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saham_clients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own session" ON public.active_user_sessions;
CREATE POLICY "Users can manage their own session" ON public.active_user_sessions
    FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own tracking" ON public.saham_clients;
CREATE POLICY "Users can view their own tracking" ON public.saham_clients
    FOR ALL USING (auth.email() = user_email);

-- 4. Create the RPC function for Atomic Registration
-- This function is called via supabase.rpc('register_active_session', { p_user_id, p_device_id })
CREATE OR REPLACE FUNCTION public.register_active_session(p_user_id UUID, p_device_id TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.active_user_sessions (user_id, device_id, updated_at)
    VALUES (p_user_id, p_device_id, now())
    ON CONFLICT (user_id) DO UPDATE
    SET device_id = EXCLUDED.device_id,
        updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to authenticated users
GRANT EXECUTE ON FUNCTION public.register_active_session TO authenticated;
GRANT EXECUTE ON FUNCTION public.register_active_session TO anon;
GRANT EXECUTE ON FUNCTION public.register_active_session TO service_role;
