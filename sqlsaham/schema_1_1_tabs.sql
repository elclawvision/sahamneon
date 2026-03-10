-- 🛑 1. DROP ALL OLD & PRIVATE DATA TABLES
-- As per the safety policy: WE DO NOT STORE USER MONEY OR PRIVATE WALLET TOKENS.
-- However, we KEEP 'saham_clients' to track WHO is logging in to the dashboard.
DROP TABLE IF EXISTS "public"."saham_investors" CASCADE;
DROP TABLE IF EXISTS "public"."saham_ownership" CASCADE;
DROP TABLE IF EXISTS "public"."saham_whales" CASCADE;
DROP TABLE IF EXISTS "public"."saham_tickers" CASCADE;
DROP TABLE IF EXISTS "public"."saham_alerts" CASCADE;
DROP TABLE IF EXISTS "public"."saham_conglomerate_nodes" CASCADE;
DROP VIEW IF EXISTS "public"."saham_msci_screener" CASCADE;
DROP TABLE IF EXISTS "public"."saham_msci_screener" CASCADE;
DROP VIEW IF EXISTS "public"."saham_tab_msci_screener" CASCADE;

-------------------------------------------------------
-- ✅ 2. CREATE NEW 1:1 TAB TABLES (UNRESTRICTED READS)
-------------------------------------------------------

-- TAB 0: SAHAM CLIENTS (Tracking System)
CREATE TABLE IF NOT EXISTS "public"."saham_clients" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_email" TEXT NOT NULL,
    "joined_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "last_login" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "status" TEXT NOT NULL DEFAULT 'active',
    PRIMARY KEY ("id"),
    UNIQUE ("user_email")
);
ALTER TABLE "public"."saham_clients" ENABLE ROW LEVEL SECURITY;
-- Allow users to insert/update their own tracking data when they log in
CREATE POLICY "Enable insert for authenticated users" ON "public"."saham_clients" FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON "public"."saham_clients" FOR UPDATE USING (auth.role() = 'authenticated');
-- Unrestricted read access for the tracker
CREATE POLICY "Enable read access for all users" ON "public"."saham_clients" FOR SELECT USING (true);

-- TAB 1: OVERVIEW (Formerly saham_tickers)
CREATE TABLE IF NOT EXISTS "public"."saham_tab_tickers" (
    "ticker" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "total_shares" BIGINT NOT NULL,
    "est_free_float" NUMERIC NOT NULL,
    "last_price" NUMERIC NOT NULL,
    "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY ("ticker")
);
ALTER TABLE "public"."saham_tab_tickers" ENABLE ROW LEVEL SECURITY;
-- Unrestricted read access for everyone (anon included)
CREATE POLICY "Enable read access for all users" ON "public"."saham_tab_tickers" FOR SELECT USING (true);


-- TAB 2: WHALE TRACKER
CREATE TABLE IF NOT EXISTS "public"."saham_tab_whale_tracker" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "time" TEXT NOT NULL,
    "stock" TEXT NOT NULL,
    "msg" TEXT NOT NULL,
    "type" TEXT NOT NULL CHECK (type IN ('buy', 'sell', 'neutral')),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."saham_tab_whale_tracker" ENABLE ROW LEVEL SECURITY;
-- Unrestricted read access for everyone (anon included)
CREATE POLICY "Enable read access for all users" ON "public"."saham_tab_whale_tracker" FOR SELECT USING (true);


-- TAB 3: KONGLOMERAT
CREATE TABLE IF NOT EXISTS "public"."saham_tab_konglomerat" (
    "id" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,
    "r" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "desc" TEXT,
    "cap" TEXT,
    "parent_id" TEXT, 
    PRIMARY KEY ("id")
);
ALTER TABLE "public"."saham_tab_konglomerat" ENABLE ROW LEVEL SECURITY;
-- Unrestricted read access for everyone (anon included)
CREATE POLICY "Enable read access for all users" ON "public"."saham_tab_konglomerat" FOR SELECT USING (true);


-- TAB 4: MSCI SCREENER
-- We rebuild this view so it points definitively to the new 'saham_tab_tickers'
-- View inherently uses the permissions of the underlying table
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

-- Explicitly grant access to the view so PostgREST can read it statelessly
GRANT SELECT ON "public"."saham_tab_msci_screener" TO anon, authenticated;


-------------------------------------------------------
-- 🌱 3. SEED INITIAL MOCK DATA
-------------------------------------------------------

INSERT INTO "public"."saham_tab_whale_tracker" ("id", "time", "stock", "msg", "type") VALUES
('1ab5164d-df79-4505-883a-4ddf9af7fdf1', '09:14', 'BYAN', 'Whale accumulation +4.1% | Dana asing borong 12.4M lembar', 'buy'),
('2ab5164d-df79-4505-883a-4ddf9af7fdf2', '09:31', 'ADRO', 'Kepemilikan tersembunyi naik 2.3% dalam 3 hari', 'buy'),
('3ab5164d-df79-4505-883a-4ddf9af7fdf3', '10:02', 'GOTO', 'Whale distribution terdeteksi — hati-hati net sell', 'sell'),
('4ab5164d-df79-4505-883a-4ddf9af7fdf4', '10:47', 'BBCA', 'Djarum Group tambah 12.4M lembar via holding', 'buy'),
('5ab5164d-df79-4505-883a-4ddf9af7fdf5', '11:15', 'TLKM', 'Penurunan volume institusional, sinyal lemah', 'neutral')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "public"."saham_tab_konglomerat" ("id", "x", "y", "r", "color", "desc", "cap") VALUES
('SALIM', 30, 28, 36, '#3b82f6', 'INDF, ICBP, BRPT + 9 entitas lain', '~Rp450T'),
('DJARUM', 70, 28, 34, '#8b5cf6', 'BBCA, HMSP + 6 entitas lain', '~Rp820T'),
('LIPPO', 50, 68, 30, '#f59e0b', 'LPKR, MPPA + 12 entitas lain', '~Rp180T')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "public"."saham_tab_konglomerat" ("id", "x", "y", "r", "color", "parent_id") VALUES
('INDF', 14, 52, 18, '#60a5fa', 'SALIM'),
('ICBP', 22, 70, 16, '#60a5fa', 'SALIM'),
('BRPT', 36, 80, 14, '#60a5fa', 'SALIM'),
('BBCA', 82, 52, 22, '#a78bfa', 'DJARUM'),
('HMSP', 88, 72, 15, '#a78bfa', 'DJARUM'),
('LPKR', 38, 88, 14, '#fcd34d', 'LIPPO'),
('MPPA', 62, 88, 13, '#fcd34d', 'LIPPO')
ON CONFLICT ("id") DO NOTHING;
