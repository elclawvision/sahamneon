-- Add new columns for enhanced reporting
ALTER TABLE public.saham_tab_tickers 
ADD COLUMN IF NOT EXISTS sector TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS market_cap BIGINT,
ADD COLUMN IF NOT EXISTS volume BIGINT;

-- Note: market_cap and volume will be populated by the Edge Function during the next sync.
-- Tickers will be mapped to sectors using the migration script.
