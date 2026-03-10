-- This entirely removes the old view that caused the "Security definer" warning
DROP VIEW IF EXISTS "public"."saham_tab_msci_screener";

-- Recreate the view as a Security Invoker so it respects the unrestricted table policies and clears the Supabase warning
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

-- Explicitly allow public (anon) access again
GRANT SELECT ON "public"."saham_tab_msci_screener" TO anon, authenticated;
