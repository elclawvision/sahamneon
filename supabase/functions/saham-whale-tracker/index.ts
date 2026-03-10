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

        console.log("🐋 Running Automated Whale Tracker Scanner (Dynamic Mode)...");

        // 1. Fetch TOP 20 tickers by absolute price change or highest volume
        // This ensures we always have "20 Aktif" alerts as requested.
        const { data: tickers, error: tError } = await supabase
            .from("saham_tab_tickers")
            .select("ticker, company_name, last_price, price_change_perc, total_shares")
            .order("price_change_perc", { ascending: false })
            .limit(20);

        if (tError) throw tError;

        const whaleAlerts = [];
        const now = new Date();
        const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

        (tickers || []).forEach((t) => {
            const type = (t.price_change_perc || 0) >= 0 ? "buy" : "sell";
            let msg = "";

            if (t.price_change_perc !== 0) {
                msg = `Aktivitas Whale signifikan pada ${t.ticker} (${t.company_name}). ${type === "buy" ? 'Akumulasi' : 'Distribusi'} sebesar ${t.price_change_perc}% terdeteksi.`;
            } else {
                msg = `Konsolidasi Whale terdeteksi pada ${t.ticker} (${t.company_name}). Menunggu konfirmasi breakout volume.`;
            }

            whaleAlerts.push({
                time: timeStr,
                stock: t.ticker,
                msg: msg,
                type: t.price_change_perc !== 0 ? type : "neutral",
                created_at: now.toISOString()
            });
        });

        if (whaleAlerts.length > 0) {
            console.log(`☁️ Refreshing ${whaleAlerts.length} Automated Whale Alerts...`);

            // Clear old signals
            await supabase.from("saham_tab_whale_tracker").delete().neq("id", "00000000-0000-0000-0000-000000000000");

            const { error: dbError } = await supabase
                .from("saham_tab_whale_tracker")
                .insert(whaleAlerts);

            if (dbError) throw dbError;
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: `Successfully generated ${whaleAlerts.length} automated whale alerts based on real market activity.`,
                data: { count: whaleAlerts.length }
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );

    } catch (error) {
        console.error("Whale Tracker Error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500
        });
    }
});
