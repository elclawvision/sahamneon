import cloudscraper

url = "https://www.idx.co.id/primary/NewsAnnouncement/GetNewsSearch?language=id-id&keyword=Kepemilikan&pageNumber=1&pageSize=10"
scraper = cloudscraper.create_scraper()
try:
    res = scraper.get(url)
    print("Status:", res.status_code)
    data = res.json()
    items = data.get('data', [])
    for item in items[:2]:
        print(f"[{item.get('FormattedDate')}] {item.get('Title')}")
        for f in item.get('Attachments', []):
            print(f" -> {f.get('OriginalFilename')} | URL: https://admin.idx.co.id{f.get('FileUrl')}")
except Exception as e:
    print(f"Error: {e}")
