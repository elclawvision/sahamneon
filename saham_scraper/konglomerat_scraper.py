import os
import pandas as pd
from datetime import datetime
from supabase import create_client, Client
from scraper import scrape_ksei_idx_data, extract_pdf_data

# Load env variables if not in scraper.py
from dotenv import load_dotenv
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

# 20 MAJOR INDONESIAN CONGLOMERATES MAPPING
# Mapping HUB_ID to list of known Investor Names/Entities in KSEI Reports
CONGLOMERATE_MAPPING = {
    "DJARUM": ["PT DWIMURIA INVESTAMA ANDALAN", "ROBERT BUDI HARTONO", "MICHAEL BAMBANG HARTONO", "PT GLOBAL DIGITAL NIAGA"],
    "SALIM": ["ANTHONI SALIM", "PT INDOFOOD SUKSES MAKMUR", "FIRST PACIFIC COMPANY LIMITED"],
    "SINARMAS": ["PT SINAR MAS MULTIARTHA", "PT INDAH KIAT PULP & PAPER", "PT PABRIK KERTAS TJIWI"],
    "ASTRA": ["JARDINE CYCLE & CARRIAGE", "PT ASTRA INTERNATIONAL"],
    "BARITO": ["PRAJOGO PANGESTU", "PT BARITO PACIFIC"],
    "LIPPO": ["PT LIPPO KARAWACI", "PT MULTIPOLAR", "RIADY FAMILY"],
    "MNC": ["HARY TANOESOEDIBJO", "PT GLOBAL MEDIACOM", "PT MNC ASIA HOLDING"],
    "BAKRIE": ["PT BAKRIE & BROTHERS", "ABURIZAL BAKRIE"],
    "CTCORP": ["CHAIRUL TANJUNG", "PT TRANS CORPORA"],
    "MAYAPADA": ["DATO' SRI TAHIR", "PT MAYAPADA MULTIARTHA"],
    "EMTEK": ["EDDY KUSNADI SARIAATMADJA", "PT ELANG MAHKOTA TEKNOLOGI"],
    "SARATOGA": ["PT SARATOGA INVESTAMA SEDAYA", "SANDIAGA UNO", "EDWIN SOERYADJAYA"],
    "PANIN": ["MU'MIN ALI GUNAWAN", "PT PANIN FINANCIAL", "PT PANIN INVESTMENT"],
    "MEDCO": ["PT MEDCO DAYA ABADI LESTARI", "ARIFIN PANIGORO"],
    "ADARO": ["GARIBALDI THOHIR", "BOY THOHIR", "PT ADARO STRATEGIC INVESTMENTS"],
    "TRIPUTRA": ["PT TRIPUTRA INVESTINDO ARYA", "THEODORE PERMADI RACHMAT"],
    "WILMAR": ["MARTUA SITORUS", "WILMAR INTERNATIONAL"],
    "CIPUTRA": ["PT CIPUTRA DEVELOPMENT", "CIPUTRA FAMILY"],
    "AKR": ["PT ARTHAKENCANA RAYATAMA", "HARYANTO ADIKOESOEMO"],
    "BAYAN": ["LOW TUCK KWONG", "PT BAYAN RESOURCES"]
}

def run_konglomerat_scraper():
    print("🦅 Starting Conglomerate Mapping Scraper (20 Groups Target)...")
    
    # 1. Get the latest KSEI PDF (Reuse logic from scraper.py)
    pdf_path = scrape_ksei_idx_data()
    if not pdf_path:
        print("❌ Could not get KSEI PDF. Scraper aborted.")
        return

    # 2. Extract Data
    df = extract_pdf_data(pdf_path)
    if df.empty:
        print("❌ No data extracted from PDF.")
        return

    # Clean the dataframe (assuming columns: 0: No, 1: Emiten, 2: Ticker, 3: Investor, 4: Status, 5: Shares, 6: %)
    # KSEI format can vary slightly, so we use robust finding
    
    results = []
    
    # We loop through conglomerates and find their presence in the report
    for hub_id, vehicles in CONGLOMERATE_MAPPING.items():
        print(f"🔍 Searching for {hub_id} presence...")
        for _, row in df.iterrows():
            investor_name = str(row[3]).upper() if len(row) > 3 else ""
            ticker = str(row[2]).upper() if len(row) > 2 else ""
            
            # Check if any vehicle name is in the investor name
            if any(v in investor_name for v in vehicles):
                try:
                    percent = float(str(row[6]).replace('%', '').replace(',', '.'))
                    shares = str(row[5]).replace(',', '').replace('.', '')
                    
                    results.append({
                        "hub_id": hub_id,
                        "ticker": ticker,
                        "investor_used": investor_name,
                        "ownership_perc": percent,
                        "shares": int(shares) if shares.isdigit() else 0,
                        "updated_at": datetime.utcnow().isoformat()
                    })
                    print(f"   ✨ Found {hub_id} in {ticker} ({percent}%) via {investor_name[:20]}...")
                except Exception as e:
                    print(f"   ⚠️ Error parsing row for {hub_id}: {e}")

    # 3. Update Supabase
    if results and SUPABASE_URL and SUPABASE_KEY != "PASTE_YOUR_SERVICE_ROLE_KEY_HERE":
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print(f"☁️ Connected to Supabase. Upserting {len(results)} conglomerate relationships...")
        
        for res in results:
            # We insert into saham_tab_konglomerat_v2
            # hub_id maps to id (is_group=true)
            # ticker maps to id (is_group=false)
            
            # 1. Ensure the child ticker exists in the table as a node
            supabase.table("saham_tab_konglomerat_v2").upsert({
                "id": res["ticker"],
                "name": res["ticker"], # Fallback name
                "is_group": False,
                "group_id": res["hub_id"],
                "ownership_perc": str(res["ownership_perc"]) + "%",
                "ai_insight": f"Holding by {res['investor_used']}. Update verified on {datetime.now().strftime('%d %b %Y')}.",
                "last_updated": datetime.utcnow().isoformat()
            }).execute()
            
        print("✅ Conglomerate data updated successfully.")
    else:
        print("⚠️ Supabase credentials missing or no results to upload.")

if __name__ == "__main__":
    run_konglomerat_scraper()
