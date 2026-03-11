-- Create saham_clients table
CREATE TABLE IF NOT EXISTS public.saham_clients (
    idx SERIAL PRIMARY KEY,
    id UUID DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL UNIQUE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ,
    status TEXT DEFAULT 'active'
);

-- Insert initial data
INSERT INTO public.saham_clients (id, user_email, joined_at, last_login, status)
VALUES 
('0b187179-785a-42c1-9d78-3ecc9b175483', 'elvisiondragon@gmail.com', '2026-03-11 06:19:50.568352+07', '2026-03-11 06:20:40.796+07', 'active'),
('20b2345b-0dc4-4800-ac69-94bb324b1579', 'oktavi05andri@gmail.com', '2026-03-10 19:13:20.557644+07', '2026-03-11 16:17:23.195+07', 'active'),
('f8bd10db-c6fd-4733-ad83-83857ac447fc', 'dragon@yahoo.com', '2026-03-09 06:13:48.828577+07', '2026-03-11 06:21:40.157+07', 'active')
ON CONFLICT (user_email) DO NOTHING;
