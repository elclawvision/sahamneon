import yfinance as yf
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import os
import time
from datetime import datetime

# Database connection details
DB_CONFIG = {
    "host": "db.nlrgdhpmsittuwiiindq.supabase.co",
    "database": "postgres",
    "user": "postgres",
    "password": "Ewekuda77777@_"
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

def fetch_current_data_from_db():
    conn = get_db_connection()
    cur = conn.cursor()
    # Fetch ticker and current metrics to compare
    cur.execute("SELECT ticker, top_holder_pct, institutions_count FROM saham_tab_tickers")
    data = {row[0]: {"top_holder_pct": float(row[1] or 0), "institutions_count": int(row[2] or 0)} for row in cur.fetchall()}
    cur.close()
    conn.close()
    return data

def scrape_yf_data(ticker_symbol, current_db_data):
    try:
        ticker_jk = f"{ticker_symbol}.JK"
        ticker = yf.Ticker(ticker_jk)
        info = ticker.info
        
        # Get Institutional Holders for Top Holder info
        inst = ticker.institutional_holders
        top_holder_name = "-"
        top_holder_pct = 0
        
        if inst is not None and not inst.empty:
            inst = inst.sort_values(by="Shares", ascending=False)
            top_holder_name = inst.iloc[0]["Holder"]
            top_holder_pct = float(inst.iloc[0].get("pctHeld", 0)) * 100
        
        # Institutions Count from major_holders
        major = ticker.major_holders
        institutions_count = 0
        if major is not None:
             try:
                # Value -> institutionsCount
                institutions_count = int(major.get("Value", {}).get("institutionsCount", 0))
             except:
                institutions_count = 0

        # Regular Holders Count fallback
        holders_count = int(info.get("numberOfShareholders", 0))
        if holders_count == 0:
            holders_count = institutions_count

        # Logic for Whale Movement (Advance/Retreat)
        whale_status = 'NEUTRAL'
        prev_data = current_db_data.get(ticker_symbol, {"top_holder_pct": 0, "institutions_count": 0})
        
        # If Top % increases or Institutions Count increases, it's an ADVANCE
        if top_holder_pct > prev_data["top_holder_pct"] or institutions_count > prev_data["institutions_count"]:
            whale_status = 'ADVANCE'
        # If they decrease considerably (threshold 0.01% to avoid noise), it's a RETREAT
        elif top_holder_pct < (prev_data["top_holder_pct"] - 0.01) or institutions_count < prev_data["institutions_count"]:
            whale_status = 'RETREAT'

        return {
            "ticker": ticker_symbol,
            "holders_count": holders_count,
            "top_holder_name": top_holder_name,
            "top_holder_pct": top_holder_pct,
            "institutions_count": institutions_count,
            "prev_top_holder_pct": prev_data["top_holder_pct"],
            "prev_institutions_count": prev_data["institutions_count"],
            "whale_status": whale_status
        }
    except Exception as e:
        # print(f"Error scraping {ticker_symbol}: {e}")
        return None

def update_db(results):
    if not results:
        return
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    sql = """
        UPDATE saham_tab_tickers 
        SET holders_count = %s, 
            top_holder_name = %s, 
            top_holder_pct = %s,
            institutions_count = %s,
            prev_top_holder_pct = %s,
            prev_institutions_count = %s,
            whale_status = %s,
            last_updated = NOW()
        WHERE ticker = %s
    """
    
    data_to_update = [
        (
            r["holders_count"], 
            r["top_holder_name"], 
            r["top_holder_pct"], 
            r["institutions_count"],
            r["prev_top_holder_pct"],
            r["prev_institutions_count"],
            r["whale_status"],
            r["ticker"]
        )
        for r in results
    ]
    
    try:
        # Using execute_values for better performance in bulk updates if needed, 
        # but executemany is fine for 700 rows.
        cur.executemany(sql, data_to_update)
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"DB Update Error: {e}")
    finally:
        cur.close()
        conn.close()

def main():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Started Float Bot (Deep Scrape)...")
    current_db_data = fetch_current_data_from_db()
    tickers = list(current_db_data.keys())
    print(f"Found {len(tickers)} tickers in DB.")
    
    results = []
    processed_count = 0
    
    for t in tickers:
        processed_count += 1
        # print(f"[{processed_count}/{len(tickers)}] Scraping {t}...")
        data = scrape_yf_data(t, current_db_data)
        if data:
            results.append(data)
        
        # Batch update every 20 tickers to avoid losing progress and keep DB active
        if len(results) >= 20:
            update_db(results)
            print(f"[{datetime.now().strftime('%H:%M:%S')}] Updated batch of {len(results)}. Total processed: {processed_count}/{len(tickers)}")
            results = []
            
        time.sleep(1.5) # Gentle rate to avoid Yahoo blockage (Total ~20 mins for 720 stocks)
        
    # Final batch
    if results:
        update_db(results)
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Updated final batch of {len(results)}.")
        
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Float Bot finished.")

if __name__ == "__main__":
    main()
