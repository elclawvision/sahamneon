-- FIX 1: Rename the table since "Overview" is just a frontend concept, the raw data is "Tickers"
ALTER TABLE "public"."saham_tab_overview" RENAME TO "saham_tab_tickers";

-- FIX 2: Re-create the MSCI Screener view to explicitly point to the correct newly named table
CREATE OR REPLACE VIEW "public"."saham_tab_msci_screener" AS
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

-- FIX 3: RESTRICT MSCI Screener so it is Premium Only (revoke anon access)
REVOKE SELECT ON "public"."saham_tab_msci_screener" FROM anon;
GRANT SELECT ON "public"."saham_tab_msci_screener" TO authenticated;
