-- STEP 13: ADD PRICE CHANGE COLUMN TO TICKERS
-- This allows us to store real daily performance data from the scraper.

ALTER TABLE IF EXISTS "public"."saham_tab_tickers" 
ADD COLUMN IF NOT EXISTS "price_change_perc" NUMERIC DEFAULT 0;

-- Also ensure the column exists in any related views if necessary
-- For the MSCI Screener view, we can update it to include the real percentage if needed later.

-- Verification
SELECT ticker, company_name, last_price, price_change_perc FROM saham_tab_tickers LIMIT 5;
