# Saham SaaS Dashboard - Current State & Roadmap

## 1. Supabase Database Schema (What We Have)

### Core Tables & Views
1. **`saham_clients`**
   - **Purpose:** Tracks user logins and activity.
   - **Fields:** `user_email` (PK), `last_login`, `created_at`.
   - **Status:** ✅ Active. Correctly mapped to `profiles` via `user_email`.

2. **`saham_tab_tickers`** (Formerly `saham_tab_overview`)
   - **Purpose:** The central data source for real stock data (Prices, Shares, Free Float).
   - **Status:** ✅ Active. Populated with real sample data.

3. **`saham_tab_whale_tracker`**
   - **Purpose:** Stores large transaction alerts (Foreign buys/sells).
   - **Status:** ✅ Active. Fetched by frontend.

4. **`saham_tab_konglomerat`**
   - **Purpose:** Stores the node/edge chart data for conglomerate relationships.
   - **Status:** ✅ Active.

5. **`saham_tab_msci_screener`** (View)
   - **Purpose:** Automatically filters `saham_tab_tickers` for stocks with Free Float > 30%.
   - **Status:** ✅ Active. Configured as `security_invoker = true` so it is safely unrestricted and clears Supabase security warnings.

---

## 2. Frontend Tabs (`Saham.tsx`) vs Database Matching

| Frontend Tab | Connects To | Status | Notes |
| :--- | :--- | :--- | :--- |
| **Overview** | None (Hardcoded) | ⚠️ Pending Real Data | Currently uses React state (`SUMMARY_CARDS`, `INDEX_CARDS`). Needs a real DB connection or API to pull live index markers. |
| **Live Tickers** | `saham_tab_tickers` | ✅ Perfect Match | Displays all live prices and stats directly from the DB. |
| **Whale Tracker** | `saham_tab_whale_tracker` | ✅ Perfect Match | Premium feature; queries DB directly when logged in. |
| **Konglomerat** | `saham_tab_konglomerat` | ✅ Perfect Match | Premium feature; plots network graph from DB. |
| **MSCI Screener** | `saham_tab_msci_screener` | ✅ Perfect Match | **Unrestricted** (free access). Fetches filtered view data. |
| **AI Spotlight** | None | ❌ Missing | Frontend tab exists, but no DB table or data logic implemented yet. |

---

## 3. What We Haven't Fulfilled Yet (Missing Pieces)

1. **AI Spotlight Table & Logic**
   - We still need to create `saham_tab_ai_spotlight` in the database.
   - We need logic to generate daily AI summaries (e.g., "AI detects heavy accumulation in ADRO").

2. **Real-Time Overview Data**
   - The "Overview" tab KPIs (Portofolio Anda, Indeks) are still mock strings. We need a way to calculate or fetch this real global market state.

3. **The Data Engine (Cron/Bot)**
   - **Crucial:** The database currently contains *sample* real data injected via SQL manually. It is not moving. We need the automation engine.

---

## 4. How We Are Working: The Automation Plan (Edge Function vs VPS Bot)

For the dashboard to be fully "Live", we must implement a backend worker that feeds Supabase. 

**Option A: Python Bot on VPS (Recommended)**
- Create a Python script (`idx_scraper.py`) that runs on a `cron` schedule every 15 minutes during market hours.
- Uses `yfinance` or a local IDX API to fetch live prices.
- Runs `supabase.table("saham_tab_tickers").upsert(...)` to update `last_price`.
- Calculates whale movements and does an `INSERT` into `saham_tab_whale_tracker`.

**Option B: Supabase Edge Functions**
- Create a Deno Edge Function (`sync-idx-data`).
- Use pg_cron inside Supabase to trigger it every hour.
- The Edge function fetches external JSON APIs and does the Upsert directly to the database.

**Our Next Phase Promise:**
To fulfill the promise, our next immediate step must be to either:
1. Fix the remaining empty tabs (Overview & AI Spotlight), or
2. Build the exact Python Bot / Edge Function that streams live Yahoo/IDX data directly into `saham_tab_tickers` so the frontend actually moves.
