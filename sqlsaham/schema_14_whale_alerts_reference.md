# Whale Alerts Reference Data

> [!NOTE]
> This file contains the data structure and example alerts for the Whale Tracker feature. 
> This is for reference only; real data is now being automated via the `saham-whale-tracker` Edge Function.

## Alert Structure (JSON)
```json
{
  "stock": "TICKER",
  "msg": "Alert message describing the whale movement",
  "type": "buy | sell | neutral",
  "time": "HH:MM"
}
```

## Example Historical Data
| Time  | Stock | Type | Message |
|-------|-------|------|---------|
| 08:55 | TLKM  | BUY  | Whale accumulation detected via local brokers | Net buy Rp12B |
| 09:02 | BYAN  | BUY  | Strategic purchase by Kalimantan holding | 500k lot matched |
| 09:14 | ADRO  | BUY  | Adaro Group increasing ownership in green energy subsidiary |
| 09:30 | BBCA  | BUY  | Foreign inflow from Singapore desk | +8.2M shares |
| 10:05 | GOTO  | SELL | Profit taking detected at resistance level | Local sell |
```sql
-- REFERENCE SQL (NOT TO BE RUN MANUALLY)
-- INSERT INTO "public"."saham_tab_whale_tracker" ("id", "time", "stock", "msg", "type") VALUES ...
```
