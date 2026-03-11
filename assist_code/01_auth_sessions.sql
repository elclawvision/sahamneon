-- Step 1: Create a table to track active browser sessions per user
CREATE TABLE IF NOT EXISTS public.active_user_sessions (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id) -- This guarantees ONLY 1 active session per user!
);

-- Step 2: Enable RLS (Row Level Security)
ALTER TABLE public.active_user_sessions ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their OWN session
CREATE POLICY "Users can view own session" ON public.active_user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own session" ON public.active_user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own session" ON public.active_user_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own session" ON public.active_user_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Step 3: Create a helper function to "UPSERT" a session
-- (If user logs in on a new device, it overwrites the old device_id!)
CREATE OR REPLACE FUNCTION register_active_session(p_user_id UUID, p_device_id TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.active_user_sessions (user_id, device_id, last_active)
    VALUES (p_user_id, p_device_id, NOW())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        device_id = EXCLUDED.device_id,
        last_active = NOW();
END;
$$;
