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
    // 1. Get base info from investorTab
    const inv = (investorTab as any[]).find(i => i.investor === id);
    
    // 2. Reconstruct holdings from all ticker details
    const reconstructedHoldings: any[] = [];
    Object.entries(tickerDetails).forEach(([ticker, details]: [string, any]) => {
        if (details.holders && Array.isArray(details.holders)) {
            const holding = details.holders.find((h: any) => h.investor_name === id);
            if (holding) {
                reconstructedHoldings.push({
                    share_code: ticker,
                    total_holding_shares: holding.total_holding_shares,
                    percentage: holding.percentage
                });
            }
        }
    });

    // 3. Return normalized object
    if (!inv) {
        return { 
            investor_name: id, 
            nationality: 'ID', 
            type: 'Unknown', 
            positions: reconstructedHoldings.length, 
            holdings: reconstructedHoldings 
        };
    }

    return {
        ...inv,
        investor_name: inv.investor, // Mapping 'investor' to 'investor_name' for UI
        nationality: inv.nat === 'L' ? 'Local' : 'Foreign',
        holdings: reconstructedHoldings
    };
};
