import yfinance as yf
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import os
import time

# Database connection details
DB_CONFIG = {
    "host": "db.nlrgdhpmsittuwiiindq.supabase.co",
    "database": "postgres",
    "user": "postgres",
    "password": "Ewekuda77777@_"
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG)

def fetch_tickers_from_db():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT ticker FROM saham_tab_tickers")
    tickers = [row[0] for row in cur.fetchall()]
    cur.close()
    conn.close()
    return tickers

def scrape_yf_data(ticker_symbol):
    try:
        ticker = yf.Ticker(f"{ticker_symbol}.JK")
        info = ticker.info
        
        # Get Institutional Holders for Top Holder info
        inst = ticker.institutional_holders
        top_holder_name = "-"
        top_holder_pct = 0
        
        if inst is not None and not inst.empty:
            # Sort by shares descending just in case
            inst = inst.sort_values(by="Shares", ascending=False)
            top_holder_name = inst.iloc[0]["Holder"]
            top_holder_pct = float(inst.iloc[0].get("pctHeld", 0)) * 100
        
        # Fallback for holders_count if numberOfShareholders is 0
        # We can use institutionsCount as a meaningful metric for "Whale Holders"
        major = ticker.major_holders
        holders_count = int(info.get("numberOfShareholders", 0))
        if holders_count == 0 and major is not None:
             # Take institutionsCount from major_holders if available
             holders_count = int(major.get("Value", {}).get("institutionsCount", 0))

        return {
            "ticker": ticker_symbol,
            "holders_count": holders_count,
            "top_holder_name": top_holder_name,
            "top_holder_pct": top_holder_pct
        }
    except Exception as e:
        print(f"Error scraping {ticker_symbol}: {e}")
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
            last_updated = NOW()
        WHERE ticker = %s
    """
    
    data_to_update = [
        (r["holders_count"], r["top_holder_name"], r["top_holder_pct"], r["ticker"])
        for r in results
    ]
    
    try:
        cur.executemany(sql, data_to_update)
        conn.commit()
        print(f"Successfully updated {len(results)} records in DB.")
    except Exception as e:
        conn.rollback()
        print(f"DB Update Error: {e}")
    finally:
        cur.close()
        conn.close()

def main():
    print("Starting yfinance shareholder scraper...")
    tickers = fetch_tickers_from_db()
    print(f"Found {len(tickers)} tickers in DB.")
    
    # Process in small batches to avoid hitting Yahoo too hard and stay responsive
    batch_size = 10 
    # For this test/run, we'll just do the first 30 most important ones to show it works
    # In a full run, we'd do all or rotate.
    target_tickers = tickers[:30] 
    
    results = []
    for t in target_tickers:
        print(f"Scraping {t}...")
        data = scrape_yf_data(t)
        if data:
            results.append(data)
        time.sleep(0.5) # Be nice to Yahoo
        
    update_db(results)
    print("Scraper finished.")

if __name__ == "__main__":
    main()
