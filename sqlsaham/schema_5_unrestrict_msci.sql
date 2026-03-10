-- Explicitly grant SELECT to anon for the MSCI Screener view
-- By default, views bypass RLS of underlying tables unless explicitly set. This ensures PostgREST allows anonymous fetching.

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON "public"."saham_tab_msci_screener" TO anon, authenticated;
