import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const DB_URL = Deno.env.get("SUPABASE_URL")!;
const DB_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// 18 MAJOR INDONESIAN CONGLOMERATES MAPPING (As requested by User)
// We match against either the 'company_name' or the 'ticker' itself.
const CONGLOMERATE_MAPPING: Record<string, string[]> = {
    "Bakrie Group": ["BAKRIE", "BUMI", "BRMS", "ENRG", "UNSP", "DEWA", "BNBR", "VKTR", "MDIA"],
    "MNC Group": ["HARY TANOE", "GLOBAL MEDIACOM", "MNCN", "BMTR", "MSIN", "BHIT", "KPIG", "BABP", "BCAP", "IPTV"],
    "Lippo Group": ["LIPPO", "LPKR", "MPPA", "SILO", "MLPL", "NOBU", "LPPF", "LPCK", "LINK", "GOLL", "ZONE", "LPLI"],
    "Salim Group": ["ANTHONI SALIM", "INDOFOOD", "ICBP", "INDF", "LSIP", "AMRT", "DNET", "FAST", "META", "NISP", "ROTI", "SIMP", "BINA", "CASA"],
    "Sinar Mas Group": ["SINAR MAS", "INDAH KIAT", "INKP", "TKIM", "BSDE", "SMMA", "DUTAYASA", "DSSA", "SMRA", "FREN", "BSIM", "DMAS"],
    "Boy Tohir": ["GARIBALDI TOHIR", "ADRO", "ADMR", "ESSA", "MBMA", "MDKA", "GOTO"],
    "TP Rachmat": ["THEODORE PERMATADI RACHMAT", "TRIPUTRA", "TAPG", "DRMA", "DSNG", "ASSA"],
    "Djarum Group": ["DWIMURIA", "BANK CENTRAL ASIA", "BBCA", "TOWR", "BELI", "BLIBLI", "SUPR", "SMKL"],
    "Hermanto Tanoko": ["TANCORP", "CLEO", "CAKK", "AVIA", "PEVE", "DEPO", "ZONE", "BLES", "WIFI", "CMNL"],
    "Prajogo Pangestu": ["PRAJOGO PANGESTU", "BARITO PACIFIC", "BRPT", "TPIA", "BREN", "CUAN", "PTRO", "PETRINDO"],
    "Happy Hapsoro": ["HAPSORO", "CBRE", "MINA", "RAJA", "SINI", "PSKT", "FORU", "WIFI"],
    "Emtek Group": ["ELANG MAHKOTA", "EMTEK", "SCMA", "BUKA", "OMED"],
    "Aguan / Sugianto Kusuma": ["SUGIANTO KUSUMA", "AGUAN", "PANI", "BSBK", "ASRI"],
    "Arsjad Rasjid": ["ARSJAD RASJID", "INDY", "ROOK", "MBMA", "GOTO"],
    "Astra Group": ["ASTRA INTERNATIONAL", "ASII", "UNTR", "AALI", "ASGR", "AUTO", "BNLI"],
    "Chairul Tanjung": ["CHAIRUL TANJUNG", "CT CORP", "BANK MEGA", "MEGA", "TRANSMART"],
    "Low Tuck Kwong": ["LOW TUCK KWONG", "BAYAN", "BYAN"],
    "Rajawali Group": ["PETER SONDAKH", "RAJAWALI", "BWPT", "SMCB", "ARTO"]
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
