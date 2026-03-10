-- FIX 4: Secure the view by forcing it to use the invoker's permissions (security_invoker = true)
-- By default in PostgreSQL 15+, views can be specifically marked to run as the caller rather than the creator.
-- This ensures Row Level Security (RLS) policies on the underlying tables ('saham_tab_tickers') apply correctly instead of bypassing them.

-- First, drop the existing view to be absolutely clean
DROP VIEW IF EXISTS "public"."saham_tab_msci_screener";

-- Recreate it specifically with security_invoker flag ENABLED
CREATE VIEW "public"."saham_tab_msci_screener" WITH (security_invoker = true) AS
SELECT 
    ticker AS id,
    est_free_float || '%' AS ff,
    'Rp' || (total_shares / 1000000)::TEXT || 'M' AS liq, 
    CASE WHEN est_free_float > 30 THEN '1.2%' ELSE '—' END AS msci,
    CASE WHEN est_free_float > 30 THEN 'MSCI' ELSE 'Non-MSCI' END AS status,
    CASE WHEN est_free_float > 40 THEN 5 WHEN est_free_float > 20 THEN 4 ELSE 3 END AS r
FROM "public"."saham_tab_tickers"
WHERE last_price > 0
ORDER BY est_free_float ASC;

-- Enforce access control directly on the view
REVOKE ALL ON "public"."saham_tab_msci_screener" FROM PUBLIC;
REVOKE ALL ON "public"."saham_tab_msci_screener" FROM anon;
GRANT SELECT ON "public"."saham_tab_msci_screener" TO authenticated;
