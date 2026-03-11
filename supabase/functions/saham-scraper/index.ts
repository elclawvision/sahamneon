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

    console.log("🚀 Fetching Real Market Prices for ALL Tickers via Yahoo Finance V8");

    // 1. Fetch ALL tickers from the database with all mandatory NOT NULL columns
    const { data: tickers, error: tError } = await supabase
      .from("saham_tab_tickers")
      .select("ticker, company_name, total_shares, est_free_float");

    if (tError) throw tError;
    if (!tickers || tickers.length === 0) {
      return new Response(JSON.stringify({ error: "No tickers found in database" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      });
    }

    const records: any[] = [];
    const batchSize = 200; // GoAPI limit optimization: 200 symbols per fetch (4 requests total for ~720 tickers)
    const GOAPI_KEY = Deno.env.get("GOAPI_KEY") || "b82c5a5a-c7ad-5756-53e0-ac3a5894";

    for (let i = 0; i < tickers.length; i += batchSize) {
      const batch = tickers.slice(i, i + batchSize);
      const symbols = batch.map((t: any) => t.ticker).join(",");

      try {
        const response = await fetch(`https://api.goapi.io/stock/idx/prices?symbols=${symbols}`, {
          headers: {
            'X-API-KEY': GOAPI_KEY,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          console.error(`GoAPI HTTP error: ${response.status} ${response.statusText}`);
          continue;
        }

        const reqData = await response.json();
        const results = reqData?.data?.results || [];

        results.forEach((res: any) => {
          const t = batch.find((b: any) => b.ticker === res.symbol);
          if (!t) return;

          const lastPrice = res.close || 0;
          const changePerc = res.change_pct || 0;
          const volume = res.volume || 0;

          if (lastPrice > 0) {
            records.push({
              ticker: t.ticker,
              company_name: t.company_name,
              total_shares: t.total_shares,
              est_free_float: t.est_free_float,
              last_price: lastPrice,
              price_change_perc: parseFloat(changePerc.toFixed(2)),
              volume: volume,
              last_updated: new Date().toISOString()
            });
          }
        });
      } catch (e: any) {
        console.error(`⚠️ Failed to fetch batch ${i / batchSize + 1}:`, e.message);
      }

      console.log(`Processed batch ${i / batchSize + 1} of ${Math.ceil(tickers.length / batchSize)}`);
    }

    if (records.length === 0) {
      return new Response(JSON.stringify({ error: "No data could be fetched from Yahoo Finance" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      });
    }

    console.log(`☁️ Upserting ${records.length} records into saham_tab_tickers...`);
    const { error: dbError } = await supabase
      .from("saham_tab_tickers")
      .upsert(records);

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synchronized ${records.length} stocks.`,
        data: { count: records.length }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );

  } catch (error: any) {
    console.error("Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});
