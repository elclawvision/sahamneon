-- script to fill up 'saham_tab_tickers' with real idx ticker data
-- The 'saham_tab_tickers' table maps directly to the Live Tickers tab.

INSERT INTO "public"."saham_tab_tickers" (
    "ticker", 
    "company_name", 
    "total_shares", 
    "est_free_float", 
    "last_price"
) VALUES
('BBCA', 'Bank Central Asia Tbk', 123275050000, 44.9, 9850),
('BYAN', 'Bayan Resources Tbk', 33333333300, 10.5, 19200),
('BREN', 'Barito Renewables Energy Tbk', 133700000000, 11.2, 5400),
('AMMN', 'Amman Mineral Internasional Tbk', 72500000000, 17.5, 8750),
('BMRI', 'Bank Mandiri (Persero) Tbk', 93333333333, 40.0, 7150),
('TLKM', 'Telkom Indonesia (Persero) Tbk', 99062216601, 47.9, 3950),
('BBRI', 'Bank Rakyat Indonesia Tbk', 151559000000, 46.1, 6200),
('ASII', 'Astra International Tbk', 40483553140, 49.5, 5200),
('UNVR', 'Unilever Indonesia Tbk', 38150000000, 15.0, 2600),
('GOTO', 'GoTo Gojek Tokopedia Tbk', 1201400000000, 70.0, 65),
('CTRA', 'Ciputra Development Tbk', 18500000000, 45.0, 1200),
('SMRA', 'Summarecon Agung Tbk', 16500000000, 40.0, 600),
('MNCN', 'Media Nusantara Citra Tbk', 15000000000, 35.0, 350),
('SMGR', 'Semen Indonesia Tbk', 5900000000, 49.0, 6000),
('INKP', 'Indah Kiat Pulp & Paper Tbk', 5400000000, 40.0, 8000),
('BSDE', 'Bumi Serpong Damai Tbk', 21000000000, 35.0, 1000),
('BRPT', 'Barito Pacific Tbk', 93000000000, 28.0, 1000),
('INDF', 'Indofood Sukses Makmur Tbk', 8700000000, 49.0, 6800),
('ICBP', 'Indofood CBP Sukses Makmur Tbk', 11600000000, 20.0, 11000),
('KLBF', 'Kalbe Farma Tbk', 46800000000, 43.0, 1500)
ON CONFLICT ("ticker") DO UPDATE SET 
    "company_name" = EXCLUDED."company_name",
    "total_shares" = EXCLUDED."total_shares",
    "est_free_float" = EXCLUDED."est_free_float",
    "last_price" = EXCLUDED."last_price",
    "last_updated" = NOW();
