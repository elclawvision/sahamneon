-- Create saham_reviews table
CREATE TABLE IF NOT EXISTS public.saham_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    name TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.saham_reviews ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Enable read access for all users"
    ON public.saham_reviews FOR SELECT
    USING (true);

-- Allow insert access for authenticated users matching their email
CREATE POLICY "Enable insert for users based on email"
    ON public.saham_reviews FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        (SELECT email FROM auth.users WHERE id = auth.uid()) = user_email
    );

-- Allow update access for authenticated users matching their email
CREATE POLICY "Enable update for users based on email"
    ON public.saham_reviews FOR UPDATE
    USING (
        auth.role() = 'authenticated' AND
        (SELECT email FROM auth.users WHERE id = auth.uid()) = user_email
    );

-- Allow delete access for authenticated users matching their email
CREATE POLICY "Enable delete for users based on email"
    ON public.saham_reviews FOR DELETE
    USING (
        auth.role() = 'authenticated' AND
        (SELECT email FROM auth.users WHERE id = auth.uid()) = user_email
    );
-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.saham_reviews;
