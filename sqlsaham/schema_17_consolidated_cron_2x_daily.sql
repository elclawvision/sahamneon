-- 🛡️ SAHAM INTEL CONSOLIDATED CRON JOBS (2X DAILY)
-- Schedule: 10:00 AM WIB and 05:00 PM WIB
-- WIB is UTC+7. 
-- 10:00 AM WIB = 03:00 UTC
-- 05:00 PM WIB = 10:00 UTC

-- 1. CLEANUP PREVIOUS CRON JOBS
-- 1. SAFE CLEANUP (Only unschedule if exists)
DO $$
DECLARE
    job_names TEXT[] := ARRAY[
        'conglomerate-daily-sync',
        'saham-investor-watch-update',
        'saham-ticker-scraper-10am',
        'saham-ticker-scraper-5pm',
        'saham-whale-tracker-10am',
        'saham-whale-tracker-5pm',
        'saham-conglomerate-10am',
        'saham-conglomerate-5pm',
        'saham-investor-10am',
        'saham-investor-5pm'
    ];
    jname TEXT;
BEGIN
    FOREACH jname IN ARRAY job_names LOOP
        IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = jname) THEN
            PERFORM cron.unschedule(jname);
        END IF;
    END LOOP;
END $$;

-- 2. TICKER & PRICE SCRAPER (saham-scraper)
SELECT cron.schedule('saham-ticker-scraper-10am', '0 3 * * *', $$ SELECT net.http_post(url:='https://nlrgdhpmsittuwiiindq.supabase.co/functions/v1/saham-scraper') $$);
SELECT cron.schedule('saham-ticker-scraper-5pm', '0 10 * * *', $$ SELECT net.http_post(url:='https://nlrgdhpmsittuwiiindq.supabase.co/functions/v1/saham-scraper') $$);

-- 3. WHALE TRACKER (saham-whale-tracker)
SELECT cron.schedule('saham-whale-tracker-10am', '0 3 * * *', $$ SELECT net.http_post(url:='https://nlrgdhpmsittuwiiindq.supabase.co/functions/v1/saham-whale-tracker') $$);
SELECT cron.schedule('saham-whale-tracker-5pm', '0 10 * * *', $$ SELECT net.http_post(url:='https://nlrgdhpmsittuwiiindq.supabase.co/functions/v1/saham-whale-tracker') $$);

-- 4. CONGLOMERATE MAPPER (saham-conglomerate-scraper)
SELECT cron.schedule('saham-conglomerate-10am', '0 3 * * *', $$ SELECT net.http_post(url:='https://nlrgdhpmsittuwiiindq.supabase.co/functions/v1/saham-conglomerate-scraper') $$);
SELECT cron.schedule('saham-conglomerate-5pm', '0 10 * * *', $$ SELECT net.http_post(url:='https://nlrgdhpmsittuwiiindq.supabase.co/functions/v1/saham-conglomerate-scraper') $$);

-- 5. INVESTOR WATCH (saham-investor-scraper)
SELECT cron.schedule('saham-investor-10am', '0 3 * * *', $$ SELECT net.http_post(url:='https://nlrgdhpmsittuwiiindq.supabase.co/functions/v1/saham-investor-scraper') $$);
SELECT cron.schedule('saham-investor-5pm', '0 10 * * *', $$ SELECT net.http_post(url:='https://nlrgdhpmsittuwiiindq.supabase.co/functions/v1/saham-investor-scraper') $$);
