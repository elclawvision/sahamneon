import { allTickers } from './allTickers';
import { investorTab } from './investorTab';
import tickerDetailsRaw from './tickerDetails.json';

const tickerDetails = tickerDetailsRaw as Record<string, any>;

export const getLocalTickerData = (id: string) => {
    const ticker = id.toUpperCase();
    const details = tickerDetails[ticker] || null;
    if (details) return details;
    const base = (allTickers as any[]).find(t => t.ticker === ticker);
    if (base) return { ticker, ...base, holders: [] };
    return null;
};

export const getLocalInvestorData = (id: string) => {
    const inv = (investorTab as any[]).find(i => i.investor === id);
    if (!inv) return { investor: id, type: 'Unknown', positions: 0, nat: 'ID', holdings: [] };
    return inv;
};
