import yfinance as yf
import pandas as pd
import json
import os
import time

# Load tickers from generated list
with open("/tmp/ticker_list.txt", "r") as f:
    TICKERS = [line.strip() for line in f if line.strip()]

def scrape_ticker_details(ticker_symbol):
    try:
        ticker = yf.Ticker(f"{ticker_symbol}.JK")
        info = ticker.info
        
        # Get Institutional Holders
        inst = ticker.institutional_holders
        holders = []
        
        if inst is not None and not inst.empty:
            for _, row in inst.iterrows():
                holders.append({
                    "holder": str(row.get("Holder", "-")),
                    "shares": int(row.get("Shares", 0)),
                    "date": str(row.get("Date Reported", "-")),
                    "pct": float(row.get("pctHeld", 0)) * 100
                })

        return {
            "ticker": ticker_symbol,
            "name": info.get("longName", "-"),
            "holders_count": int(info.get("numberOfShareholders", 0)),
            "institutions_count": len(holders),
            "holders": holders
        }
    except Exception as e:
        print(f"Error scraping {ticker_symbol}: {e}")
        return None

def main():
    print(f"Starting batch scrape for {len(TICKERS)} tickers...")
    results = {}
    
    # Just do a sample for now to avoid long wait, but logic is ready for all
    target_list = TICKERS 
    
    for i, t in enumerate(target_list):
        print(f"[{i+1}/{len(target_list)}] Scraping {t}...")
        data = scrape_ticker_details(t)
        if data:
            results[t] = data
        time.sleep(0.5)

    output_path = "/Users/eldragon/git/el/saham/src/data/tickerHolders.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"Successfully saved {len(results)} ticker details to {output_path}")

if __name__ == "__main__":
    main()
