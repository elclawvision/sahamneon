-- Add historical tracking columns for Whale movements
ALTER TABLE "public"."saham_tab_tickers" 
ADD COLUMN IF NOT EXISTS "prev_top_holder_pct" numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS "whale_status" text DEFAULT 'NEUTRAL', -- 'ADVANCE', 'RETREAT', 'NEUTRAL'
ADD COLUMN IF NOT EXISTS "institutions_count" integer DEFAULT 0, -- Specific to yfinance data
ADD COLUMN IF NOT EXISTS "prev_institutions_count" integer DEFAULT 0;

-- Comments for documentation
COMMENT ON COLUMN "public"."saham_tab_tickers"."whale_status" IS 'Tracks institutional movement: ADVANCE (buying), RETREAT (selling), or NEUTRAL';
