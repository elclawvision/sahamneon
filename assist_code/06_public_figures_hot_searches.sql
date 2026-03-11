-- Create table for Public Figures (Influential Investors)
CREATE TABLE IF NOT EXISTS "public"."saham_tab_public_figures" (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    status text NOT NULL,
    description text NOT NULL,
    positions integer DEFAULT 0,
    top_ticker text,
    top_pct text,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE "public"."saham_tab_public_figures" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON "public"."saham_tab_public_figures" FOR SELECT USING (true);

-- Seed Public Figures
INSERT INTO "public"."saham_tab_public_figures" (name, status, description, positions, top_ticker, top_pct) VALUES
('GARIBALDI THOHIR', 'ACTIVE', 'Kakak Erick Thohir (Menteri BUMN)', 7, 'TRIM', '34.68%'),
('MARUARAR SIRAIT', 'ACTIVE', 'Menteri Perumahan & Kawasan Permukiman (PKP)', 3, 'COCO', '3.31%'),
('SANDIAGA SALAHUDDIN UNO', 'EX-OFFICIAL', 'Ex-Menteri Parekraf, Ex-Cawapres 2019', 3, 'SRTG', '21.51%'),
('H HUTOMO MANDALA PUTRA', 'EX-OFFICIAL', 'Tommy Soeharto — Putra Presiden ke-2', 1, 'HUMI', '4.95%'),
('SOLIHIN JUSUF KALLA', 'EX-OFFICIAL', 'Putra Jusuf Kalla (Ex-Wakil Presiden)', 1, 'BUKK', '29.91%'),
('ANTONI SALIM', 'TYCOON', 'Salim Group — Konglomerat terbesar Indonesia', 4, 'DNET', '25.3%'),
('LO KHENG HONG. DRS', 'TYCOON', 'Warren Buffett Indonesia — Investor legendaris', 13, 'DILD', '6.71%'),
('ACHMAD ZAKY SYAIFUDIN', 'TYCOON', 'Founder & Ex-CEO Bukalapak', 1, 'BUKA', '1.2%')
ON CONFLICT DO NOTHING;

-- Create table for Hot Searches (Trending Tickers/People)
CREATE TABLE IF NOT EXISTS "public"."saham_tab_hot_searches" (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    views integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE "public"."saham_tab_hot_searches" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON "public"."saham_tab_hot_searches" FOR SELECT USING (true);

-- Seed Hot Searches
INSERT INTO "public"."saham_tab_hot_searches" (name, views) VALUES
('ANDRY HAKIM', 2626),
('GOVERNMENT OF NORWAY', 1554),
('LO KHENG HONG. DRS', 1367),
('BELVIN TANNADI', 1188),
('DJONI', 1134),
('UOB KAY HIAN PRIVATE LIMITED', 1036),
('HAPSORO', 980),
('IBST', 610)
ON CONFLICT DO NOTHING;
