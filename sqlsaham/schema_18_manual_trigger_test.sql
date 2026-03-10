-- 🚀 MANUAL TRIGGER FOR SAHAM INTEL AUTOMATION
-- Run this script to instantly execute all 4 scheduled Edge Functions.
-- This is useful for testing or populating data outside of the 10AM/5PM cron schedule.

-- 1. TRIGGER TICKER & PRICE SCRAPER
-- Updates `saham_tab_tickers` with live prices from Yahoo Finance.
SELECT net.http_post(url:='https://nlrgdhpmsittuwiiindq.supabase.co/functions/v1/saham-scraper');

-- 2. TRIGGER WHALE TRACKER
-- Updates `saham_tab_whale_tracker` by analyzing the new prices and volumes.
-- Note: Make sure to run this AFTER the ticker scraper finishes.
SELECT net.http_post(url:='https://nlrgdhpmsittuwiiindq.supabase.co/functions/v1/saham-whale-tracker');

-- 3. TRIGGER CONGLOMERATE MAPPER
-- Updates `saham_tab_konglomerat_v2` with the latest ownership networks.
SELECT net.http_post(url:='https://nlrgdhpmsittuwiiindq.supabase.co/functions/v1/saham-conglomerate-scraper');

-- 4. TRIGGER INVESTOR WATCH
-- Updates `saham_tab_investor_watch` with portfolio data (LKH & Mutual Funds).
SELECT net.http_post(url:='https://nlrgdhpmsittuwiiindq.supabase.co/functions/v1/saham-investor-scraper');

-- Note: In a real SQL editor, you might need to run these one by one 
-- if you notice timeouts, or wait about 2-3 seconds between executions 
-- so the database has time to process the HTTP requests.
