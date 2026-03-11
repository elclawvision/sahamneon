-- Add missing actual columns for Free Float Hunt feature
ALTER TABLE "public"."saham_tab_tickers"
ADD COLUMN IF NOT EXISTS "holders_count" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "top_holder_name" text DEFAULT '-',
ADD COLUMN IF NOT EXISTS "top_holder_pct" numeric DEFAULT 0;

-- Optionally, backfill initial data for a few top tickers just so the UI isn't completely empty for them until a scraper runs
UPDATE "public"."saham_tab_tickers" SET "holders_count" = 450000, "top_holder_name" = 'PT Dwimuria Investama Andalan', "top_holder_pct" = 54.94 WHERE ticker = 'BBCA';
UPDATE "public"."saham_tab_tickers" SET "holders_count" = 320000, "top_holder_name" = 'Negara Republik Indonesia', "top_holder_pct" = 52.00 WHERE ticker = 'BMRI';
UPDATE "public"."saham_tab_tickers" SET "holders_count" = 280000, "top_holder_name" = 'Negara Republik Indonesia', "top_holder_pct" = 53.19 WHERE ticker = 'BBRI';
UPDATE "public"."saham_tab_tickers" SET "holders_count" = 190000, "top_holder_name" = 'Negara Republik Indonesia', "top_holder_pct" = 52.09 WHERE ticker = 'TLKM';
UPDATE "public"."saham_tab_tickers" SET "holders_count" = 110000, "top_holder_name" = 'PT Astra International Tbk', "top_holder_pct" = 59.50 WHERE ticker = 'UNTR';
