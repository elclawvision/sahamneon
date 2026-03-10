-- SAHAM CONGLOMERATE UPGRADE V2 (20 GROUPS)
-- TABLE: saham_tab_konglomerat_v2

-- Step 0: Cleanup (Ensures clean type application if previous version existed)
DROP TABLE IF EXISTS saham_tab_konglomerat_v2 CASCADE;

-- Step 1: Ensure Table Structure (ownership_perc is TEXT to allow "%" symbol)
CREATE TABLE saham_tab_konglomerat_v2 (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    is_group BOOLEAN DEFAULT FALSE,
    group_id TEXT REFERENCES saham_tab_konglomerat_v2(id),
    ownership_perc TEXT, -- e.g. "54.2%"
    ai_insight TEXT,     -- Strategic move/sentiment
    market_cap_val BIGINT, -- Raw value for node scaling
    color TEXT,          -- UI Branding for the group
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Seed the 20 Conglomerate Hubs
INSERT INTO saham_tab_konglomerat_v2 (id, name, is_group, market_cap_val, color, ai_insight)
VALUES 
('DJARUM', 'Djarum Group', TRUE, 820000000000000, '#8b5cf6', 'Dominasi Perbankan (BBCA) & FMCG. Ekspansi ke Digital via Blibli.'),
('SALIM', 'Salim Group', TRUE, 450000000000000, '#3b82f6', 'Rantai pasok makanan terintegrasi (Indofood) & Infrastruktur.'),
('SINARMAS', 'Sinar Mas Group', TRUE, 320000000000000, '#10b981', 'Konglomerasi terbesar di sektor Kertas, Sawit, & Properti.'),
('ASTRA', 'Astra International', TRUE, 220000000000000, '#6366f1', 'Holding otomotif & alat berat terbesar di Indonesia.'),
('BARITO', 'Barito Pacific', TRUE, 600000000000000, '#ec4899', 'Prajogo Pangestu: Agresif di Energi Terbarukan & Petrokimia.'),
('LIPPO', 'Lippo Group', TRUE, 180000000000000, '#f59e0b', 'Fokus pada Kesehatan (Siloam) & Properti Residensial.'),
('MNC', 'MNC Group', TRUE, 110000000000000, '#ef4444', 'Dominasi Media Penyiaran & Ekspansi ke Fintech.'),
('BAKRIE', 'Bakrie Group', TRUE, 900000000000000, '#94a3b8', 'Legacy conglomerate dengan fokus pada Pertambangan & Media.'),
('CTCORP', 'CT Corp', TRUE, 150000000000000, '#818cf8', 'Chairul Tanjung: Ritel (Transmart), Bank (Mega), & Media.'),
('MAYAPADA', 'Mayapada Group', TRUE, 800000000000000, '#fbbf24', 'Tahir: Fokus pada Perbankan, Properti, & Kesehatan.'),
('EMTEK', 'Emtek Group', TRUE, 130000000000000, '#34d399', 'Pemain kunci Teknologi/Streaming (Vidio) & Media (SCMA).'),
('SARATOGA', 'Saratoga Group', TRUE, 200000000000000, '#60a5fa', 'Investment holding with focus on Natural Resources & Logistics.'),
('PANIN', 'Panin Group', TRUE, 120000000000000, '#f87171', 'One of the oldest financial groups in Indonesia.'),
('MEDCO', 'Medco Group', TRUE, 140000000000000, '#fb923c', 'Energy (Oil & Gas) & Mining (AMMAN) Conglomerate.'),
('ADARO', 'Adaro Group', TRUE, 170000000000000, '#020617', 'Boy Thohir: Diversifying from Coal to Aluminum & Green.'),
('TRIPUTRA', 'Triputra Group', TRUE, 160000000000000, '#166534', 'TP Rachmat: Focus on Agribusiness & Manufacturing.'),
('WILMAR', 'Wilmar International', TRUE, 250000000000000, '#ca8a04', 'Global Palm Oil giant with Indonesia base.'),
('CIPUTRA', 'Ciputra Group', TRUE, 85000000000000, '#7c3aed', 'Real Estate King with projects across the archipelago.'),
('AKR', 'AKR Corporindo', TRUE, 75000000000000, '#2563eb', 'Logistics & Fuel Distribution + Industrial Estate manager.'),
('BAYAN', 'Bayan Resources', TRUE, 400000000000000, '#4b5563', 'Low Tuck Kwong: One of the most efficient coal producers.')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    market_cap_val = EXCLUDED.market_cap_val,
    color = EXCLUDED.color,
    ai_insight = EXCLUDED.ai_insight;

-- Step 3: Seed Initial Tickers (Child Nodes) for Demo
INSERT INTO saham_tab_konglomerat_v2 (id, name, is_group, group_id, ownership_perc, ai_insight, market_cap_val)
VALUES
('BBCA', 'Bank Central Asia', FALSE, 'DJARUM', '54.9%', 'Kepemilikan stabil via PT Dwimuria Investama.', 1200000000000000),
('INDF', 'Indofood', FALSE, 'SALIM', '50.1%', 'Ujung tombak Salim Group di sektor FMCG.', 60000000000000),
('BRPT', 'Barito Pacific', FALSE, 'BARITO', '71.2%', 'Holding utama Prajogo Pangestu.', 90000000000000),
('BREN', 'Barito Renewables', FALSE, 'BARITO', '64.5%', 'Strategic moves into Geothermal power.', 800000000000000),
('SCMA', 'Surya Citra Media', FALSE, 'EMTEK', '61.0%', 'Media asset utama Emtek Group.', 12000000000000),
('AMRT', 'Sumber Alfaria', FALSE, 'SALIM', '—', 'Strategic alliance for distribution.', 110000000000000)
ON CONFLICT (id) DO UPDATE SET
    group_id = EXCLUDED.group_id,
    ownership_perc = EXCLUDED.ownership_perc,
    ai_insight = EXCLUDED.ai_insight;

-- Step 4: Security
ALTER TABLE saham_tab_konglomerat_v2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON saham_tab_konglomerat_v2 FOR SELECT USING (true);
