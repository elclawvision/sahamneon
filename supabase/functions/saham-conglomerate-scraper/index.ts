import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const DB_URL = Deno.env.get("SUPABASE_URL")!;
const DB_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// 20 MAJOR INDONESIAN CONGLOMERATES MAPPING
// We match against either the 'company_name' or the 'ticker' itself.
const CONGLOMERATE_MAPPING: Record<string, string[]> = {
    "DJARUM": ["DWIMURIA", "BANK CENTRAL ASIA", "BBCA", "TOWR", "BELI"],
    "SALIM": ["ANTHONI SALIM", "INDOFOOD", "ICBP", "INDF", "LSIP", "AMRT", "DNET", "FAST"],
    "SINARMAS": ["SINAR MAS", "INDAH KIAT", "INKP", "TKIM", "BSDE", "SMMA", "DUTAYASA", "DSSA", "SMRA"],
    "ASTRA": ["ASTRA INTERNATIONAL", "ASII", "UNTR", "AALI"],
    "BARITO": ["PRAJOGO PANGESTU", "BARITO PACIFIC", "BRPT", "TPIA", "BREN", "CUAN"],
    "LIPPO": ["LIPPO", "LPKR", "MPPA", "SILO", "MLPL", "NOBU"],
    "MNC": ["HARY TANOE", "GLOBAL MEDIACOM", "MNCN", "BMTR", "MSIN"],
    "BAKRIE": ["BAKRIE", "BUMI", "BRMS", "ENRG", "UNSP"],
    "CTCORP": ["CHAIRUL TANJUNG", "BANK MEGA", "MEGA", "TRANSMART"],
    "MAYAPADA": ["TAHIR", "MAYAPADA", "MAYA"],
    "EMTEK": ["ELANG MAHKOTA", "EMTEK", "SCMA", "BUKA"],
    "SARATOGA": ["SARATOGA", "SRTG", "ADRO", "MDKA", "TBIG", "PALM"],
    "PANIN": ["PANIN", "PNBN", "PNLF", "PNIN"],
    "MEDCO": ["MEDCO", "MEDC", "AMMN"],
    "ADARO": ["ADARO", "ADRO", "ADMR"],
    "TRIPUTRA": ["TRIPUTRA", "TAPG", "DRMA"],
    "WILMAR": ["WILMAR", "CEKA"],
    "CIPUTRA": ["CIPUTRA", "CTRA", "METRODATA", "MTDL"],
    "AKR": ["AKR CORPORINDO", "AKRA", "JIIPE"],
    "BAYAN": ["LOW TUCK KWONG", "BAYAN", "BYAN"]
};

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
        console.log("🦅 Running Conglomerate Logic (20 Groups) via Supabase Edge Function...");

        // Strategy: Instead of scraping KSEI PDF (blocked by Cloudflare in Deno),
        // we process the 'saham_ownership' or 'saham_tickers' tags if provided.
        // For automation, we can check for new tickers or updates in the database.

        // This function would be triggered after the Python scraper uploads to a raw staging table.
        // For now, it reinforces the mapping logic inside the database.

        const { data: tickers, error: tError } = await supabase
            .from("saham_tab_tickers")
            .select("ticker, company_name");

        if (tError) throw tError;

        const results = [];
        for (const t of tickers || []) {
            const name = (t.company_name || "").toUpperCase();
            const ticker = (t.ticker || "").toUpperCase();

            for (const [hubId, keywords] of Object.entries(CONGLOMERATE_MAPPING)) {
                if (keywords.some(k => name.includes(k.toUpperCase()) || ticker === k.toUpperCase())) {
                    results.push({
                        id: t.ticker,
                        name: t.ticker,
                        is_group: false,
                        group_id: hubId,
                        ai_insight: `Identified as ${hubId} member via strategic asset mapping.`
                    });
                    break; // Move to next ticker once matched
                }
            }
        }

        if (results.length > 0) {
            console.log(`☁️ Upserting ${results.length} conglomerate links...`);
            const { error: upError } = await supabase
                .from("saham_tab_konglomerat_v2")
                .upsert(results);
            if (upError) throw upError;
        }

        return new Response(
            JSON.stringify({ success: true, count: results.length }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );

    } catch (error) {
        console.error("Function Error:", (error as Error).message);
        return new Response(JSON.stringify({ error: (error as Error).message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
        });
    }
});
