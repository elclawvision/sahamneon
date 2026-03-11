-- Add new columns for enhanced reporting
ALTER TABLE public.saham_tab_tickers 
ADD COLUMN IF NOT EXISTS sector TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS market_cap BIGINT,
ADD COLUMN IF NOT EXISTS volume BIGINT;

-- Note: market_cap and volume will be populated by the Edge Function during the next sync.
-- Tickers will be mapped to sectors using the migration script.
-- 1. Financials
UPDATE public.saham_tab_tickers SET sector = 'FINANCIAL', industry = 'Banks' WHERE ticker IN ('BBCA', 'BBRI', 'BMRI', 'BBNI', 'BBTN', 'ARTO', 'BRIS', 'BBYB', 'BTPS', 'BDMN', 'MEGA', 'PNBN');

-- 2. Consumer Non-Cyclical
UPDATE public.saham_tab_tickers SET sector = 'CONSUMER NON-CYCLICAL', industry = 'Food & Beverages' WHERE ticker IN ('INDF', 'ICBP', 'MYOR', 'GOOD', 'ROTI', 'CAMP', 'AISA', 'CLEO');
UPDATE public.saham_tab_tickers SET sector = 'CONSUMER NON-CYCLICAL', industry = 'Tobacco' WHERE ticker IN ('HMSP', 'GGRM', 'WIIM');
UPDATE public.saham_tab_tickers SET sector = 'CONSUMER NON-CYCLICAL', industry = 'Personal Care' WHERE ticker IN ('UNVR', 'KINO', 'TCID');

-- 3. Consumer Cyclical
UPDATE public.saham_tab_tickers SET sector = 'CONSUMER CYCLICAL', industry = 'Automobiles' WHERE ticker IN ('ASII', 'AUTO', 'IMAS', 'GJTL');
UPDATE public.saham_tab_tickers SET sector = 'CONSUMER CYCLICAL', industry = 'Retails' WHERE ticker IN ('ACES', 'MAPI', 'MAPA', 'AMRT', 'MIDI', 'LPPF', 'RALS');
UPDATE public.saham_tab_tickers SET sector = 'CONSUMER CYCLICAL', industry = 'Media' WHERE ticker IN ('SCMA', 'MNCN', 'MSIN', 'VIVA');

-- 4. Energy
UPDATE public.saham_tab_tickers SET sector = 'ENERGY', industry = 'Coal' WHERE ticker IN ('ADRO', 'BYAN', 'ITMG', 'PTBA', 'BUMI', 'INDY', 'HRUM', 'DOID', 'SMMT', 'MBAP');
UPDATE public.saham_tab_tickers SET sector = 'ENERGY', industry = 'Oil & Gas' WHERE ticker IN ('MEDC', 'ENRG', 'AKRA', 'PGAS');

-- 5. Basic Materials
UPDATE public.saham_tab_tickers SET sector = 'BASIC MATERIALS', industry = 'Metals & Mining' WHERE ticker IN ('ANTM', 'INCO', 'MDKA', 'TINS', 'ZINC', 'DKFT');
UPDATE public.saham_tab_tickers SET sector = 'BASIC MATERIALS', industry = 'Chemicals' WHERE ticker IN ('TPIA', 'BRPT', 'ADMG');
UPDATE public.saham_tab_tickers SET sector = 'BASIC MATERIALS', industry = 'Paper' WHERE ticker IN ('INKP', 'TKIM');

-- 6. Infrastructure
UPDATE public.saham_tab_tickers SET sector = 'INFRASTRUCTURE', industry = 'Telecommunication' WHERE ticker IN ('TLKM', 'ISAT', 'EXCL', 'FREN', 'TOWR', 'TBIG');
UPDATE public.saham_tab_tickers SET sector = 'INFRASTRUCTURE', industry = 'Utilities' WHERE ticker IN ('POWR', 'KEEN', 'ARKN');

-- 7. Healthcare
UPDATE public.saham_tab_tickers SET sector = 'HEALTHCARE', industry = 'Hospitals' WHERE ticker IN ('MIKA', 'HEAL', 'SILO', 'SAME', 'PRDA');
UPDATE public.saham_tab_tickers SET sector = 'HEALTHCARE', industry = 'Pharmaceuticals' WHERE ticker IN ('KLBF', 'TSPC', 'SIDO', 'KAEF', 'INAF');

-- 8. Properties & Real Estate
UPDATE public.saham_tab_tickers SET sector = 'PROPERTIES & REAL ESTATE', industry = 'Real Estate' WHERE ticker IN ('PWON', 'BSDE', 'SMRA', 'CTRA', 'ASRI', 'DILD', 'LPKR', 'APLN');

-- 9. Technology
UPDATE public.saham_tab_tickers SET sector = 'TECHNOLOGY', industry = 'Software' WHERE ticker IN ('GOTO', 'BUKA', 'DMMX', 'MCAS', 'MLPT', 'ATIC', 'WIFI');

-- 10. Industrials
UPDATE public.saham_tab_tickers SET sector = 'INDUSTRIAL', industry = 'Heavy Equipment' WHERE ticker IN ('UNTR', 'HEXA');
UPDATE public.saham_tab_tickers SET sector = 'INDUSTRIAL', industry = 'Construction' WHERE ticker IN ('ADHI', 'PTPP', 'WIKA', 'WSKT', 'JKON', 'TOTL');

-- 11. Transportation & Logistics
UPDATE public.saham_tab_tickers SET sector = 'TRANSPORTATION & LOGISTICS', industry = 'Passangers' WHERE ticker IN ('BIRD', 'GIAA', 'ASSA');
UPDATE public.saham_tab_tickers SET sector = 'TRANSPORTATION & LOGISTICS', industry = 'Logistics' WHERE ticker IN ('TMAS', 'SMDR', 'NELI');
