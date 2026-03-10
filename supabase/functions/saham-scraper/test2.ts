// test2.ts
const ticker = "BBCA.JK";
try {
    const url = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=defaultKeyStatistics,price`;
    const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const data = await response.json();
    console.log(JSON.stringify(data));
} catch (e) {
    console.error(e);
}
