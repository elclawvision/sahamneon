-- STEP 14: SEED 10 WHALE ALERTS
-- This ensures the Overview summary shows "10 Aktif" and the specified tickers.

DELETE FROM "public"."saham_tab_whale_tracker";

INSERT INTO "public"."saham_tab_whale_tracker" ("id", "time", "stock", "msg", "type") VALUES
(uuid_generate_v4(), '08:55', 'TLKM', 'Whale accumulation detected via local brokers | Net buy Rp12B', 'buy'),
(uuid_generate_v4(), '09:02', 'BYAN', 'Strategic purchase by Kalimantan holding | 500k lot matched', 'buy'),
(uuid_generate_v4(), '09:14', 'ADRO', 'Adaro Group increasing ownership in green energy subsidiary', 'buy'),
(uuid_generate_v4(), '09:30', 'BBCA', 'Foreign inflow from Singapore desk | +8.2M shares', 'buy'),
(uuid_generate_v4(), '10:05', 'GOTO', 'Profit taking detected at resistance level | Local sell', 'sell'),
(uuid_generate_v4(), '10:45', 'ASII', 'Institutional rotation into automotive sector | Neutral accumulation', 'buy'),
(uuid_generate_v4(), '11:20', 'AMMN', 'Copper price impact | Massive buy wall at Rp8700', 'buy'),
(uuid_generate_v4(), '13:15', 'UNTR', 'Heavy equipment demand spike | Distribution alert', 'sell'),
(uuid_generate_v4(), '14:02', 'BREN', 'Renewable energy pivot | High frequency trade buy', 'buy'),
(uuid_generate_v4(), '15:50', 'ICBP', 'Defensive sector accumulation before holiday', 'buy');

-- Verification
SELECT count(*) as total_alerts FROM saham_tab_whale_tracker;
