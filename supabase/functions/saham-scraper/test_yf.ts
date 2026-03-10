// test_yf.ts
const ticker = "BBCA.JK";
try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = await response.json();
    const meta = data.chart?.result?.[0]?.meta;
    console.log(meta.symbol, meta.regularMarketPrice);
} catch (e) {
    console.error(e);
}
