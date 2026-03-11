import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const DB_URL = Deno.env.get("SUPABASE_URL")!;
const DB_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabase = createClient(DB_URL, DB_SERVICE_KEY);
        const now = new Date();
        const todayStr = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        console.log(`📊 Generating Daily Report for ${todayStr}...`);

        // 1. Fetch current ticker data
        const { data: tickers, error: tError } = await supabase
            .from("saham_tab_tickers")
            .select("ticker, company_name, last_price, price_change_perc, sector, market_cap")
            .not("last_price", "is", null);

        if (tError) throw tError;

        // 2. Aggregate Sector Performance
        const sectorStats = {};
        tickers.forEach(t => {
            const sec = t.sector || "Uncategorized";
            if (!sectorStats[sec]) {
                sectorStats[sec] = { totalChange: 0, count: 0, companies: [] };
            }
            sectorStats[sec].totalChange += t.price_change_perc || 0;
            sectorStats[sec].count += 1;
            sectorStats[sec].companies.push(t);
        });

        const sectors = Object.keys(sectorStats).map(name => ({
            name,
            avgChange: parseFloat((sectorStats[name].totalChange / sectorStats[name].count).toFixed(2)),
            count: sectorStats[name].count
        })).sort((a, b) => b.avgChange - a.avgChange);

        // 3. Top Gainers and Losers
        const topGainers = [...tickers]
            .sort((a, b) => (b.price_change_perc || 0) - (a.price_change_perc || 0))
            .slice(0, 5);

        const topLosers = [...tickers]
            .sort((a, b) => (a.price_change_perc || 0) - (b.price_change_perc || 0))
            .slice(0, 5);

        // 4. Whale Movement Summary
        const whaleAdvance = tickers.filter(t => t.whale_status === 'ADVANCE');
        const whaleRetreat = tickers.filter(t => t.whale_status === 'RETREAT');

        // 5. Market Overview
        const marketGainers = tickers.filter(t => t.price_change_perc > 0).length;
        const marketLosers = tickers.filter(t => t.price_change_perc < 0).length;
        const marketUnchanged = tickers.length - marketGainers - marketLosers;

        // 6. Construct Report
        const report = {
            title: `Laporan Harian Saham AI - ${todayStr}`,
            summary: {
                total_stocks: tickers.length,
                gainers: marketGainers,
                losers: marketLosers,
                unchanged: marketUnchanged,
                sentiment: marketGainers > marketLosers ? "Bullish 📈" : "Bearish 📉"
            },
            whale_movement: {
                advance_count: whaleAdvance.length,
                retreat_count: whaleRetreat.length,
                top_advance: whaleAdvance.slice(0, 3).map(t => t.ticker),
                top_retreat: whaleRetreat.slice(0, 3).map(t => t.ticker)
            },
            top_sectors: sectors.slice(0, 3),
            bottom_sectors: sectors.slice(-3).reverse(),
            gainers: topGainers.map(t => `${t.ticker} (+${t.price_change_perc}%)`),
            losers: topLosers.map(t => `${t.ticker} (${t.price_change_perc}%)`)
        };

        // Optional: Return as JSON or Plain text for WhatsApp
        return new Response(JSON.stringify(report, null, 2), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200
        });

    } catch (error) {
        console.error("Function Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
        });
    }
});
