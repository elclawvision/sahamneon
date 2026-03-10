import pdfplumber
import pandas as pd
import json

def test_extract(pdf_path):
    print(f"Reading {pdf_path}...")
    data = []
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for i, page in enumerate(pdf.pages):
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        # Clean empty cells or None
                        cleaned_row = [str(cell).strip().replace('\n', ' ') if cell else '' for cell in row]
                        # Filter out empty rows or header rows
                        if len(cleaned_row) >= 5 and any(c.isdigit() for c in cleaned_row[-1]):
                            data.append(cleaned_row)
                            
        df = pd.DataFrame(data)
        if not df.empty:
            print(f"✅ Extracted {len(df)} rows from the PDF.")
            # Print the first few rows to confirm extraction
            print("Preview of Real Extracted Data:")
            print("="*80)
            for _, row in df.head().iterrows():
                print(" | ".join([str(x)[:20] for x in row]))
            print("="*80)
            return df
        else:
            print("❌ No data rows found.")
    except Exception as e:
        print(f"Error during extraction: {e}")
        
if __name__ == "__main__":
    test_extract("real_ksei_sample.pdf")
