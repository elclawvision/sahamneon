import requests
from bs4 import BeautifulSoup

def inspect_ksei():
    url = 'https://www.ksei.co.id/services/registered-securities/ownership-report'
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
    try:
        res = requests.get(url, headers=headers, timeout=10)
        print(f"Status Code: {res.status_code}")
        soup = BeautifulSoup(res.text, 'html.parser')
        
        # Find all PDF or ZIP links
        links = soup.find_all('a', href=True)
        pdf_links = [a['href'] for a in links if '.pdf' in a['href'].lower() or '.zip' in a['href'].lower()]
        
        print("Found possible download links:")
        for link in pdf_links[:10]:
            print(link)
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_ksei()
