import { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { STOCKS, ALERTS, CONGLOMERATE_NODES, EDGES, MOCK_SCREENER } from "./saham-mock";
import ForceGraph2D from "react-force-graph-2d";

/* ─── MINI SPARKLINE ─── */

function Sparkline({ up }: { up: boolean }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const base = 50 + (up ? i * 2 : -i * 2);
    return base + (Math.random() - 0.5) * 14;
  });
  const minV = Math.min(...pts), maxV = Math.max(...pts);
  const norm = pts.map(v => 32 - ((v - minV) / (maxV - minV || 1)) * 28);
  const path = norm.map((y, i) => `${i === 0 ? "M" : "L"}${(i / (pts.length - 1)) * 80},${y}`).join(" ");
  return (
    <svg width={80} height={32} style={{ display: "block" }}>
      <path d={path} fill="none" stroke={up ? "#22c55e" : "#ef4444"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── MARKET LINE CHART (IHSG) ─── */
function MarketLineChart({ data }: { data: { price: number }[] }) {
  if (!data || data.length < 2) return null;
  const values = data.map(d => d.price);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV || 1;
  const width = 600;
  const height = 180;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.price - minV) / range) * height;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(" L ")}`;
  const areaData = `${pathData} L ${width},${height} L 0,${height} Z`;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaData} fill="url(#chartGradient)" />
      <path d={pathData} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Current price pulse */}
      <circle cx={width} cy={height - ((values[values.length - 1] - minV) / range) * height} r="4" fill="#3b82f6" />
      <circle cx={width} cy={height - ((values[values.length - 1] - minV) / range) * height} r="8" fill="#3b82f6" fillOpacity="0.3">
        <animate attributeName="r" from="4" to="12" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.3" to="0" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// SVG graph removed to use ForceGraph2D

/* ─── AI CHATBOT ─── */
function AIChatbot() {
  const [msgs, setMsgs] = useState([
    { role: "ai", text: "Halo! Tanya saya tentang kepemilikan saham, pergerakan whale, atau konglomerat IDX." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const REPLIES = {
    bbca: "📊 Minggu ini Djarum Group (via holding) borong 12.4M lembar BBCA. Dana asing Singapura net buy Rp340M. Kepemilikan <5% naik 18.2% → 19.7%.",
    byan: "🐋 BYAN: Kepemilikan Bayan Resources Tbk naik signifikan. Low Tuck Kwong menambah posisi melalui entitas Kalimantan. Volume institutsi 3x rata-rata.",
    salim: "🏢 Salim Group mengontrol: INDF, ICBP, BRPT, dan punya kepemilikan silang di beberapa bank. Total kapitalisasi ekosistem ~Rp450T.",
  };

  const send = () => {
    if (!input.trim()) return;
    const q = input.trim(); setInput(""); setLoading(true);
    setMsgs(m => [...m, { role: "user", text: q }]);
    setTimeout(() => {
      const l = q.toLowerCase();
      const reply = l.includes("bbca") ? REPLIES.bbca : l.includes("byan") ? REPLIES.byan : l.includes("salim") ? REPLIES.salim
        : "🤖 Menganalisis data KSEI & MSCI float... Ditemukan pergerakan institusional signifikan. Akumulasi whale terdeteksi dalam 72 jam terakhir.";
      setMsgs(m => [...m, { role: "ai", text: reply }]);
      setLoading(false);
    }, 1100);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingBottom: 8 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "82%", padding: "9px 13px",
              borderRadius: m.role === "user" ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
              background: m.role === "user" ? "linear-gradient(135deg,#3b82f6,#6366f1)" : "rgba(0,0,0,0.04)",
              border: m.role === "user" ? "none" : "1px solid rgba(0,0,0,0.07)",
              color: m.role === "user" ? "#fff" : "#1e293b",
              fontSize: 13, lineHeight: 1.6, fontFamily: "Inter, system-ui, sans-serif",
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 4, padding: "9px 13px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", animation: `bounce 1s ${i * 0.2}s infinite` }} />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Tanya: siapa borong BBCA?"
          style={{
            flex: 1, background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8,
            padding: "8px 12px", color: "#1e293b", fontSize: 13, fontFamily: "Inter, system-ui, sans-serif", outline: "none"
          }} />
        <button onClick={send} style={{
          background: "linear-gradient(135deg,#3b82f6,#6366f1)", border: "none",
          borderRadius: 8, padding: "8px 16px", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14
        }}>→</button>
      </div>
    </div>
  );
}

/* ─── LOGIN PAGE ─── */
function LoginPage({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 60);
    return () => clearInterval(t);
  }, []);

  const handleLogin = () => {
    if (!email || !pass) { setErr("Email dan password wajib diisi."); return; }
    setErr(""); setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(email); }, 1400);
  };

  const dots = Array.from({ length: 32 }, (_, i) => ({
    x: (i % 8) * 13 + 2, y: Math.floor(i / 8) * 24 + 8,
    op: 0.06 + Math.sin(tick / 20 + i * 0.5) * 0.04
  }));

  return (
    <div style={{
      minHeight: "100vh", background: "#f8faff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Inter, system-ui, sans-serif", position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatCard{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        input:focus{outline:none!important;}
      `}</style>

      {/* Animated BG dots */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 110 100" preserveAspectRatio="xMidYMid slice">
        {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={0.9} fill="#3b82f6" fillOpacity={d.op} />)}
      </svg>

      {/* Left side decorative */}
      <div style={{
        position: "absolute", left: -120, top: "50%", transform: "translateY(-50%)",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(59,130,246,0.08),transparent 70%)",
        pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", right: -80, bottom: -80,
        width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle,rgba(99,102,241,0.07),transparent 70%)",
        pointerEvents: "none"
      }} />

      {/* Floating mock chart card */}
      <div style={{
        position: "absolute", left: "6%", top: "50%", transform: "translateY(-50%)",
        background: "#fff", borderRadius: 16, padding: "20px 24px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)",
        width: 200, animation: "floatCard 4s ease-in-out infinite",
        display: "none", // hidden on small screens via media would go here
      }} className="floating-card">
        <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>WHALE ALERT</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>BBCA +2.14%</div>
        <div style={{ fontSize: 12, color: "#22c55e", marginBottom: 10 }}>▲ Djarum +12.4M lembar</div>
        <Sparkline up={true} />
      </div>

      {/* Login card */}
      <div style={{
        background: "#fff", borderRadius: 24, padding: "48px 44px",
        boxShadow: "0 20px 80px rgba(0,0,0,0.1)", border: "1px solid rgba(0,0,0,0.06)",
        width: "100%", maxWidth: 420, position: "relative", zIndex: 2,
        animation: "fadeUp 0.6s ease both",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: "linear-gradient(135deg,#3b82f6,#6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(59,130,246,0.35)",
            flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <polyline points="2,14 6,9 10,11 14,5 18,7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="18" cy="7" r="2" fill="#fff" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 800, fontSize: 20, color: "#0f172a", letterSpacing: -0.5 }}>
              Saham <span style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Ultimate</span>
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8", letterSpacing: 1, fontWeight: 500 }}>IDX INTELLIGENCE PLATFORM</div>
          </div>
        </div>

        <h2 style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 700, fontSize: 26, color: "#0f172a", marginBottom: 6 }}>
          Selamat datang
        </h2>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          Masuk untuk akses data whale & konglomerat IDX secara real-time.
        </p>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)}
              placeholder="nama@email.com" type="email"
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(0,0,0,0.1)",
                fontSize: 14, fontFamily: "Inter, system-ui, sans-serif", color: "#0f172a", background: "#f8faff",
                transition: "border 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#3b82f6"}
              onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.1)"}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Password</label>
            <input value={pass} onChange={e => setPass(e.target.value)}
              placeholder="••••••••" type="password"
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid rgba(0,0,0,0.1)",
                fontSize: 14, fontFamily: "Inter, system-ui, sans-serif", color: "#0f172a", background: "#f8faff",
                transition: "border 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#3b82f6"}
              onBlur={e => e.target.style.borderColor = "rgba(0,0,0,0.1)"}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>

          {err && <div style={{ fontSize: 13, color: "#ef4444", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8, padding: "9px 12px" }}>{err}</div>}

          <button onClick={handleLogin} disabled={loading} style={{
            marginTop: 4, width: "100%", padding: "13px",
            background: loading ? "rgba(59,130,246,0.6)" : "linear-gradient(135deg,#3b82f6,#6366f1)",
            border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer", fontFamily: "Inter, system-ui, sans-serif",
            boxShadow: "0 4px 20px rgba(59,130,246,0.35)",
            transition: "all 0.2s",
          }}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: "spin 1s linear infinite" }}>
                  <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                  <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Masuk...
              </span>
            ) : "Masuk ke Dashboard →"}
          </button>
        </div>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#94a3b8" }}>
          Belum punya akses?{" "}
          <span style={{ color: "#3b82f6", fontWeight: 600, cursor: "pointer" }}>Daftar Lifetime Rp199.000</span>
        </div>

        {/* Social proof */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
          <div style={{ display: "flex" }}>
            {["#3b82f6", "#6366f1", "#f59e0b", "#22c55e"].map((c, i) => (
              <div key={i} style={{
                width: 24, height: 24, borderRadius: "50%", background: c, border: "2px solid #fff",
                marginLeft: i > 0 ? -8 : 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, color: "#fff", fontWeight: 700
              }}>
                {["A", "B", "C", "D"][i]}
              </div>
            ))}
          </div>
          <span style={{ fontSize: 12, color: "#64748b" }}>+2,847 investor aktif</span>
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ─── DASHBOARD ─── */
function Dashboard({ userEmail, onLogout, onRequestLogin }: { userEmail: string | null, onLogout: () => void, onRequestLogin: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [pulseTick, setPulseTick] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Real Data States
  const [realStocks, setRealStocks] = useState<any[]>([]);
  const [realAlerts, setRealAlerts] = useState<any[]>([]);
  const [realNodes, setRealNodes] = useState<any[]>([]);
  const [realEdges, setRealEdges] = useState<any[]>([]);
  const [realScreener, setRealScreener] = useState<any[]>([]);
  const [realInvestorWatch, setRealInvestorWatch] = useState<any[]>([]);
  const [loadingRealData, setLoadingRealData] = useState(false);
  const [realIHSG, setRealIHSG] = useState<any[]>([]);
  const [konglomeratView, setKonglomeratView] = useState<"graph" | "table">("graph");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  const [lastUpdateText, setLastUpdateText] = useState<string>("Tunggu...");
  const [floatFilter, setFloatFilter] = useState<string>("all");

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getProcessedData = (data: any[]) => {
    let processed = [...data];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      processed = processed.filter(item =>
        (item.id && item.id.toLowerCase().includes(q)) ||
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.company_name && item.company_name.toLowerCase().includes(q)) ||
        (item.ticker && item.ticker.toLowerCase().includes(q)) ||
        (item.t && item.t.toLowerCase().includes(q)) ||
        (item.f && item.f.toLowerCase().includes(q)) ||
        (item.s && item.s.toLowerCase().includes(q)) ||
        (item.investor_name && item.investor_name.toLowerCase().includes(q)) ||
        (item.percentage && item.percentage.toLowerCase().includes(q))
      );
    }
    if (sortConfig) {
      processed.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        const cleanNum = (val: any) => {
          if (typeof val === 'number') return val;
          if (typeof val !== 'string') return 0;
          let cleaned = val.replace(/[Rp.%,]/g, '').trim();
          if (cleaned.endsWith('M')) return parseFloat(cleaned) * 1000000;
          if (cleaned.endsWith('B')) return parseFloat(cleaned) * 1000000000;
          if (cleaned.endsWith('T')) return parseFloat(cleaned) * 1000000000000;
          return parseFloat(cleaned) || 0;
        };
        const numericKeys = ['price', 'change', 'last_price', 'price_change_perc', 'vol', 'ff', 'liq', 'free_float', 'r', 'msci', 'p'];
        if (numericKeys.includes(sortConfig.key)) {
          aVal = cleanNum(aVal);
          bVal = cleanNum(bVal);
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return processed;
  };

  const userName = userEmail ? userEmail.split("@")[0] : "guest_user";
  const isPremium = userEmail === "dragon@yahoo.com" || Boolean(userEmail);

  useEffect(() => {
    const t = setInterval(() => setPulseTick(x => x + 1), 2000);
    return () => clearInterval(t);
  }, []);

  // IHSG Fetcher (Using Proxy to bypass CORS)
  useEffect(() => {
    const fetchIHSG = async () => {
      try {
        const res = await fetch(`https://nlrgdhpmsittuwiiindq.supabase.co/functions/v1/saham-ihsg-proxy?interval=1d&range=1mo`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }
        });
        const json = await res.json();
        const result = json?.chart?.result?.[0];
        const quotes = result?.indicators?.quote?.[0]?.close || [];
        const timestamps = result?.timestamp || [];

        const history = quotes.map((q: number, i: number) => ({
          price: Math.round(q),
          time: new Date(timestamps[i] * 1000).toLocaleDateString(),
          change: i > 0 ? ((q - quotes[i - 1]) / quotes[i - 1]) * 100 : 0
        })).filter((x: any) => x.price);

        setRealIHSG(history);
      } catch (e) {
        console.error("Failed to fetch IHSG through proxy", e);
      }
    };
    fetchIHSG();
    const t = setInterval(fetchIHSG, 300000); // 5 min
    return () => clearInterval(t);
  }, []);

  // Fetch Real Data when logged in
  useEffect(() => {
    if (isPremium) {
      setLoadingRealData(true);

      const fetchRealData = async () => {
        try {
          const [resTickers, resAlerts, resNodes, resScreener, resInvestors] = await Promise.all([
            supabase.from('saham_tab_tickers').select('*').order('last_price', { ascending: false }),
            supabase.from('saham_tab_whale_tracker').select('*').order('created_at', { ascending: false }),
            supabase.from('saham_tab_konglomerat_v2').select('*'),
            supabase.from('saham_tab_msci_screener').select('*').order('id', { ascending: true }),
            supabase.from('saham_tab_investor_watch').select('*').order('investor_name', { ascending: true })
          ]);

          if (resAlerts.data && !resAlerts.error) {
            setRealAlerts(resAlerts.data);
          }

          if (resInvestors.data && !resInvestors.error) {
            setRealInvestorWatch(resInvestors.data);
          }

          if (resTickers.data && !resTickers.error && resAlerts.data) {
            const activeWhaleTickers = new Set(resAlerts.data.map((a: any) => a.stock));
            const mappedData = resTickers.data.map((dbStock: any) => ({
              id: dbStock.ticker,
              name: dbStock.company_name,
              price: dbStock.last_price,
              change: dbStock.price_change_perc || 0,
              vol: (dbStock.total_shares / 1000000).toFixed(0) + "M",
              sector: "-",
              whale: activeWhaleTickers.has(dbStock.ticker),
              free_float: dbStock.est_free_float + "%"
            }));
            if (mappedData.length > 0) setRealStocks(mappedData);

            // Extract the most recent last_updated timestamp
            if (resTickers.data.length > 0) {
              const maxDate = new Date(Math.max(...resTickers.data.map((d: any) => new Date(d.last_updated || 0).getTime())));
              if (maxDate.getTime() > 0) {
                const formatted = maxDate.toLocaleDateString("id-ID", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                }).replace(',', '') + " WIB";
                setLastUpdateText(formatted);
              }
            }
          }

          if (resNodes.data && !resNodes.error) {
            const groupColorMap: Record<string, string> = {};
            resNodes.data.forEach((n: any) => {
              if (n.is_group) groupColorMap[n.id] = n.color || "#3b82f6";
            });

            setRealNodes(resNodes.data.map((n: any) => ({
              ...n,
              // Group Hubs are Vivid, Tickers are desaturated group color
              color: n.is_group
                ? (n.color || "#3b82f6")
                : (groupColorMap[n.group_id] ? `${groupColorMap[n.group_id]}88` : "rgba(255,255,255,0.7)"),
              // Hubs are much larger (100-150), Tickers are small (18)
              val: n.is_group
                ? (n.market_cap_val ? Math.max(80, Math.sqrt(Number(n.market_cap_val)) / 300000) : 120)
                : 18
            })));

            const edges: any[] = [];
            resNodes.data.forEach((n: any) => {
              if (n.group_id) {
                edges.push({
                  source: n.group_id,
                  target: n.id,
                  // The "bridge" link takes the color of the conglomerate
                  color: groupColorMap[n.group_id] || "rgba(0,0,0,0.15)"
                });
              }
            });
            setRealEdges(edges);
          }

          if (resScreener.data && !resScreener.error) {
            setRealScreener(resScreener.data);
          }

        } catch (e) {
          console.error("Failed to fetch real data", e);
        } finally {
          setLoadingRealData(false);
        }
      };

      fetchRealData();
    }
  }, [isPremium]);

  // Determine what Data to show. Mock for marketing, Real for signed in users.
  const displayStocks = isPremium ? realStocks : STOCKS;
  const displayAlerts = isPremium ? realAlerts : ALERTS;
  const displayNodes = isPremium ? realNodes : CONGLOMERATE_NODES;
  const displayEdges = isPremium ? realEdges : EDGES;

  const displayScreener = isPremium ? realScreener : MOCK_SCREENER;


  const NAV = [
    { id: "overview", icon: "⬡", label: "Overview" },
    { id: "ticker", icon: "📊", label: "Live Tickers" },
    { id: "whale", icon: "🐋", label: "Whale Tracker" },
    { id: "float", icon: "🎈", label: "Free Float Hunt" },
    { id: "investor", icon: "🕵️", label: "Investor Watch" },
    { id: "graph", icon: "🕸", label: "Konglomerat" },
    { id: "screener", icon: "🔬", label: "MSCI Screener" },
    { id: "report", icon: "📈", label: "Intel Report" },
    { id: "ai", icon: "🤖", label: "AI Spotlight" },
  ];

  // Dynamic KPI Calculations based on strictly the loaded data
  const totalSaham = displayStocks.length;
  const activeAlerts = displayAlerts.length;
  const recentAlertTickers = displayAlerts.slice(0, 3).map(a => a.stock).join(", ");

  const sortedGainers = [...displayStocks].sort((a, b) => Number(b.change) - Number(a.change));
  const topGainer = sortedGainers[0];
  const gainerValue = topGainer ? `${Math.abs(topGainer.change)}%` : "0%";
  const gainerName = topGainer ? topGainer.id : "-";

  const msciCount = displayScreener.filter(s => s.status === 'MSCI').length || 0;
  const lowFloatCount = displayStocks.filter(s => parseFloat(s.free_float) < 15).length;
  const conglomerateCount = displayNodes.filter(n => n.is_group).length;

  const SUMMARY_CARDS = [
    { label: "Live Tickers", value: `${totalSaham} Emiten`, sub: "Koneksi Real-time", color: "#3b82f6", up: true },
    { label: "Whale Tracker", value: `${activeAlerts} Sinyal`, sub: recentAlertTickers || "Tidak ada pergerakan", color: "#f59e0b", up: activeAlerts > 0 ? null : false },
    { label: "Free Float Hunt", value: `${lowFloatCount} Emiten`, sub: "Likuiditas Rendah (<15%)", color: "#ef4444", up: false },
    { label: "Investor Watch", value: "LKH & Funds", sub: "Update Portfolio Harian", color: "#ec4899", up: true },
    { label: "Konglomerat", value: `${conglomerateCount} Grup`, sub: "Peta Hubungan Bisnis", color: "#6366f1", up: null },
    { label: "MSCI Screener", value: `${msciCount} Saham`, sub: "Filter Likuiditas Global", color: "#8b5cf6", up: null },
  ];

  const sortedLosers = [...displayStocks].sort((a, b) => Number(a.change) - Number(b.change));
  const topLoser = sortedLosers[0];
  const loserValue = topLoser ? `${Math.abs(topLoser.change)}%` : "0%";

  // Intel Report calculations
  const top20Gainers = sortedGainers.slice(0, 20);
  const top20Losers = sortedLosers.slice(0, 20);
  const positiveCount = displayStocks.filter(s => s.change > 0).length;
  const negativeCount = displayStocks.filter(s => s.change < 0).length;
  const sentimentScore = ((positiveCount / (positiveCount + negativeCount || 1)) * 100).toFixed(1);
  const sentimentLabel = Number(sentimentScore) > 60 ? "Bullish (Optimis)" : Number(sentimentScore) < 40 ? "Bearish (Pesimis)" : "Netral";

  const sahamDiperhatikan = displayStocks.filter(s => displayAlerts.some((a: any) => a.stock === s.id && a.type === 'buy')).slice(0, 5);
  const sahamDihindari = displayStocks.filter(s => parseFloat(s.free_float) < 10 || displayAlerts.some((a: any) => a.stock === s.id && a.type === 'sell')).slice(0, 5);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f1f5fb", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        @keyframes pulseRing{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:0.3}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.1);border-radius:4px}
        input:focus{outline:none}
        .nav-btn:hover{background:rgba(59,130,246,0.08)!important;color:#3b82f6!important;}
        .stock-row:hover{background:rgba(59,130,246,0.04)!important;}
      `}</style>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sidebarOpen ? 220 : 64, flexShrink: 0,
        background: "#fff", borderRight: "1px solid rgba(0,0,0,0.07)",
        display: "flex", flexDirection: "column",
        transition: "width 0.25s ease", overflow: "hidden",
        boxShadow: "2px 0 12px rgba(0,0,0,0.04)",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 10, minHeight: 64 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: "linear-gradient(135deg,#3b82f6,#6366f1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(59,130,246,0.3)",
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <polyline points="1,11 5,7 8,9 11,4 15,6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="15" cy="6" r="1.5" fill="#fff" />
            </svg>
          </div>
          {sidebarOpen && (
            <div style={{ animation: "slideIn 0.2s ease both" }}>
              <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 800, fontSize: 15, color: "#0f172a", whiteSpace: "nowrap" }}>
                Saham <span style={{ background: "linear-gradient(135deg,#3b82f6,#6366f1)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Ultimate</span>
              </div>
              <div style={{ fontSize: 9, color: "#94a3b8", letterSpacing: 1, fontWeight: 600 }}>IDX INTELLIGENCE</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setActiveTab(n.id)} className="nav-btn"
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: sidebarOpen ? "10px 12px" : "10px",
                justifyContent: sidebarOpen ? "flex-start" : "center",
                border: "none", borderRadius: 10, cursor: "pointer",
                background: activeTab === n.id ? "rgba(59,130,246,0.1)" : "transparent",
                color: activeTab === n.id ? "#3b82f6" : "#64748b",
                fontFamily: "Inter, system-ui, sans-serif", fontWeight: activeTab === n.id ? 700 : 500,
                fontSize: 14, transition: "all 0.15s", width: "100%", textAlign: "left",
              }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{n.icon}</span>
              {sidebarOpen && <span style={{ whiteSpace: "nowrap", animation: "slideIn 0.2s ease both" }}>{n.label}</span>}
              {sidebarOpen && activeTab === n.id && <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: "#3b82f6" }} />}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "12px 8px", borderTop: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: userEmail ? "linear-gradient(135deg,#f59e0b,#ef4444)" : "rgba(0,0,0,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: userEmail ? "#fff" : "#64748b", fontWeight: 700, fontSize: 13, flexShrink: 0
            }}>
              {userName[0]?.toUpperCase()}
            </div>
            {sidebarOpen && (
              <div style={{ animation: "slideIn 0.2s ease both", overflow: "hidden" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: userEmail ? "#1e293b" : "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 110 }}>{userName}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>{userEmail ? "Premium Member" : "Guest Mode"}</div>
              </div>
            )}
          </div>
          {!userEmail && (
            <button onClick={onRequestLogin} style={{
              width: "100%", padding: sidebarOpen ? "8px 12px" : "10px 0",
              background: "linear-gradient(135deg,#3b82f6,#6366f1)",
              border: "none", borderRadius: 8, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, justifyContent: sidebarOpen ? "flex-start" : "center",
              color: "#fff", fontWeight: 700, fontSize: 12, fontFamily: "Inter, system-ui, sans-serif",
            }}>
              <span style={{ fontSize: 14 }}>🔓</span>
              {sidebarOpen && <span style={{ animation: "slideIn 0.2s ease both" }}>Login / Daftar</span>}
            </button>
          )}
          {userEmail && (
            <button onClick={onLogout} style={{
              width: "100%", padding: sidebarOpen ? "8px 12px" : "10px 0",
              background: "rgba(0,0,0,0.05)",
              border: "none", borderRadius: 8, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8, justifyContent: sidebarOpen ? "flex-start" : "center",
              color: "#64748b", fontWeight: 600, fontSize: 12, fontFamily: "Inter, system-ui, sans-serif",
              marginTop: -6
            }}>
              {sidebarOpen && <span style={{ animation: "slideIn 0.2s ease both" }}>Keluar</span>}
            </button>
          )}
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Topbar */}
        <header style={{
          height: 64, background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.07)",
          display: "flex", alignItems: "center", padding: "0 24px", gap: 16,
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}>
          <button onClick={() => setSidebarOpen(s => !s)} style={{
            border: "none", background: "rgba(0,0,0,0.04)", borderRadius: 8,
            padding: "6px 8px", cursor: "pointer", fontSize: 16, color: "#64748b",
          }}>☰</button>

          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 700, fontSize: 16, color: "#0f172a" }}>
              {NAV.find(n => n.id === activeTab)?.label}
            </div>
          </div>

          {/* Live badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6, background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.2)", borderRadius: 50, padding: "4px 12px"
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", background: "#22c55e",
              boxShadow: "0 0 0 0 rgba(34,197,94,0.5)", animation: "pulseRing 1.5s infinite"
            }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#16a34a" }}>LIVE IDX</span>
          </div>

          <div style={{ fontSize: 13, color: "#64748b", fontFamily: "Menlo, Monaco, Consolas, monospace" }}>
            {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
          </div>
          {!userEmail && (
            <button onClick={onRequestLogin} style={{
              background: "linear-gradient(135deg,#3b82f6,#6366f1)",
              border: "none", borderRadius: 9, padding: "8px 18px",
              color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer",
              fontFamily: "Inter, system-ui, sans-serif",
              boxShadow: "0 3px 14px rgba(59,130,246,0.3)",
              whiteSpace: "nowrap",
            }}>🔓 Masuk / Daftar</button>
          )}
          {userEmail && (
            <button onClick={onLogout} style={{
              background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 9, padding: "8px 16px", color: "#64748b",
              fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "Inter, system-ui, sans-serif",
            }}>Keluar</button>
          )}
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: "auto", padding: 24 }}>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp 0.4s ease both" }}>
              {/* Greeting */}
              <div>
                <h1 style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 800, fontSize: 24, color: "#0f172a" }}>
                  {userName ? `Selamat datang, ${userName} 👋` : "Selamat Datang di Saham Intel 👋"}
                </h1>
                <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>Berikut ringkasan pasar IDX hari ini — {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
              </div>

              {/* Top KPI Cards (Moved from previous location) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
                {SUMMARY_CARDS.map((k, i) => (
                  <div key={i} style={{
                    background: "#fff", borderRadius: 16, padding: "20px",
                    border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    animationDelay: `${i * 0.08}s`, animation: "fadeUp 0.4s ease both",
                  }}>
                    <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, letterSpacing: 0.5, marginBottom: 8 }}>{k.label}</div>
                    <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 800, fontSize: 22, color: "#0f172a", marginBottom: 4 }}>{k.value}</div>
                    <div style={{ fontSize: 12, color: k.up === true ? "#22c55e" : k.up === false ? "#ef4444" : "#64748b", fontWeight: 500 }}>{k.sub}</div>
                    <div style={{ marginTop: 10, height: 3, borderRadius: 2, background: `${k.color}22` }}>
                      <div style={{ height: "100%", width: `${55 + i * 10}%`, borderRadius: 2, background: k.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Layout for Alerts + Mini Chart on Overview */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>

                {/* Welcome Card / Chart Placeholder */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                    <div>
                      <h3 style={{ fontFamily: "Inter, system-ui, sans-serif", fontSize: 18, color: "#0f172a", marginBottom: 4 }}>Market Snapshot (IHSG)</h3>
                      <p style={{ color: "#64748b", fontSize: 13 }}>Pergerakan indeks saham gabungan dalam 30 hari terakhir</p>
                    </div>
                    {realIHSG.length > 0 && (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b" }}>{realIHSG[realIHSG.length - 1].price.toLocaleString('id-ID')}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: realIHSG[realIHSG.length - 1].change >= 0 ? "#22c55e" : "#ef4444" }}>
                          {realIHSG[realIHSG.length - 1].change >= 0 ? '▲' : '▼'} {Math.abs(realIHSG[realIHSG.length - 1].change).toFixed(2)}%
                        </div>
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2, fontWeight: 500 }}>
                          {realIHSG[realIHSG.length - 1].time}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ height: 220, background: "linear-gradient(to bottom, rgba(59,130,246,0.05), transparent)", borderRadius: 12, position: "relative", padding: "10px 0" }}>
                    {realIHSG.length > 0 ? (
                      <MarketLineChart data={realIHSG} />
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>
                        {loadingRealData ? "Memuat data bursa..." : "Gagal memuat data IHSG"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Alerts */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", position: "relative" }}>
                  {!isPremium && <LockGate onRequestLogin={onRequestLogin} label="Whale Tracker" />}
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulseRing 1.5s infinite" }} />
                    <span style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Whale Tracker</span>
                  </div>
                  <div style={{ padding: "8px 0", maxHeight: 420, overflowY: "auto" }}>
                    {displayAlerts.map((a: any, i: number) => (
                      <div key={i} style={{
                        padding: "14px 20px", borderBottom: "1px solid rgba(0,0,0,0.04)",
                        borderLeft: `3px solid ${a.type === "buy" ? "#22c55e" : a.type === "sell" ? "#ef4444" : "#94a3b8"}`
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontFamily: "Menlo, Monaco, Consolas, monospace", fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{a.stock}</span>
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>{a.time} WIB</span>
                          <span style={{
                            marginLeft: "auto", fontSize: 11, fontWeight: 700,
                            color: a.type === "buy" ? "#16a34a" : a.type === "sell" ? "#dc2626" : "#64748b",
                            background: a.type === "buy" ? "rgba(34,197,94,0.1)" : a.type === "sell" ? "rgba(239,68,68,0.1)" : "rgba(0,0,0,0.05)",
                            padding: "2px 7px", borderRadius: 50
                          }}>
                            {a.type === "buy" ? "BUY" : a.type === "sell" ? "SELL" : "INFO"}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.5 }}>{a.msg}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TICKER ── */}
          {activeTab === "ticker" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp 0.4s ease both" }}>
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
                    <span style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 700, fontSize: 16, color: "#0f172a" }}>Daftar Lengkap Emiten</span>
                    <span style={{ fontSize: 13, color: "#64748b" }}>Data 720 Saham & Free Float. Last Update: <strong>{lastUpdateText}</strong></span>
                  </div>
                  <div style={{ position: "relative", flex: 0.8, maxWidth: 300 }}>
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12 }}>🔍</span>
                    <input
                      type="text"
                      placeholder="Cari Ticker atau Nama..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "100%", padding: "8px 12px 8px 32px", borderRadius: 8,
                        border: "1px solid rgba(0,0,0,0.1)", fontSize: 13, background: "#f8faff"
                      }}
                    />
                  </div>
                </div>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>Real-time KSEI</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(0,0,0,0.02)" }}>
                      {[
                        { key: "id", label: "Kode" },
                        { key: "name", label: "Nama" },
                        { key: "price", label: "Harga" },
                        { key: "change", label: "Perubahan" },
                        { key: "vol", label: "Volume" },
                        { key: "whale", label: "Whale" },
                        { key: null, label: "Chart" }
                      ].map(h => (
                        <th
                          key={h.label}
                          onClick={() => h.key && requestSort(h.key)}
                          style={{
                            padding: "10px 16px", textAlign: "left", fontSize: 11, color: "#94a3b8",
                            fontWeight: 600, letterSpacing: 0.5, whiteSpace: "nowrap",
                            cursor: h.key ? "pointer" : "default"
                          }}
                        >
                          {h.label}
                          {h.key && sortConfig?.key === h.key && (
                            <span style={{ color: "#3b82f6", marginLeft: 4 }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                          {h.key && sortConfig?.key !== h.key && (
                            <span style={{ opacity: 0.3, marginLeft: 4 }}>⇅</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getProcessedData(displayStocks).map((s, i) => (
                      <tr key={i} className="stock-row" style={{ borderTop: "1px solid rgba(0,0,0,0.04)", transition: "background 0.15s", cursor: "pointer" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontFamily: "Menlo, Monaco, Consolas, monospace", fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{s.id}</span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</td>
                        <td style={{ padding: "12px 16px", fontFamily: "Menlo, Monaco, Consolas, monospace", fontSize: 13, fontWeight: 600, color: "#0f172a" }}>
                          {s.price.toLocaleString("id-ID")}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            fontSize: 12, fontWeight: 700,
                            color: s.change > 0 ? "#16a34a" : "#dc2626",
                            background: s.change > 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                            padding: "3px 8px", borderRadius: 50,
                          }}>{s.change > 0 ? "+" : ""}{s.change}%</span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#64748b", fontFamily: "Menlo, Monaco, Consolas, monospace" }}>{s.vol}</td>
                        <td style={{ padding: "12px 16px" }}>
                          {userEmail ? (
                            s.whale ? (
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "3px 8px", borderRadius: 50 }}>🐋 AKTIF</span>
                            ) : <span style={{ fontSize: 11, color: "#cbd5e1" }}>—</span>
                          ) : (
                            <span onClick={onRequestLogin} style={{
                              fontSize: 11, fontWeight: 700, color: "#3b82f6", background: "rgba(59,130,246,0.08)",
                              padding: "3px 8px", borderRadius: 50, cursor: "pointer", border: "1px solid rgba(59,130,246,0.15)"
                            }}>🔒 Login</span>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px" }}><Sparkline up={s.change > 0} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "whale" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp 0.4s ease both", position: "relative" }}>
              {!isPremium && <LockGate onRequestLogin={onRequestLogin} label="Whale Tracker Premium" />}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
                <div>
                  <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 800, fontSize: 22, color: "#0f172a" }}>🐋 Whale Tracker</div>
                  <p style={{ color: "#3b82f6", fontSize: 12, fontWeight: 600, marginTop: 4 }}>🕒 Last Update: {lastUpdateText}</p>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
                {displayStocks.filter(s => s.whale).map((s, i) => (
                  <div key={i} style={{
                    background: "#fff", borderRadius: 16, padding: 20, border: "1px solid rgba(245,158,11,0.2)",
                    boxShadow: "0 4px 20px rgba(245,158,11,0.06)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <span style={{ fontFamily: "Menlo, Monaco, Consolas, monospace", fontWeight: 800, fontSize: 18, color: "#0f172a" }}>{s.id}</span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>{s.name}</span>
                      <span style={{ marginLeft: "auto", fontWeight: 700, color: "#16a34a", fontSize: 14 }}>+{s.change}%</span>
                    </div>
                    <div style={{ background: "rgba(245,158,11,0.07)", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: "#92400e", fontWeight: 600 }}>🐋 Whale Accumulation Detected</div>
                      <div style={{ fontSize: 12, color: "#78350f", marginTop: 4 }}>Volume institusional 3× rata-rata 5 hari</div>
                    </div>
                    <Sparkline up={true} />
                  </div>
                ))}
              </div>
              {/* All alerts detail */}
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
                  <span style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Riwayat Sinyal Hari Ini</span>
                  <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12 }}>🔍</span>
                    <input
                      type="text"
                      placeholder="Cari emiten di riwayat..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "100%", padding: "7px 12px 8px 32px", borderRadius: 8,
                        border: "1px solid rgba(0,0,0,0.1)", fontSize: 13, background: "#f8faff"
                      }}
                    />
                  </div>
                </div>
                {/* Header row for sorting history */}
                <div style={{ background: "rgba(0,0,0,0.02)", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", padding: "10px 20px" }}>
                  {[
                    { key: "stock", label: "TICKER", width: 52 },
                    { key: "time", label: "TIME", width: 52 },
                    { key: "msg", label: "ACTION", flex: 1 },
                    { key: "type", label: "SIGNAL", width: 80 }
                  ].map(h => (
                    <div
                      key={h.label}
                      onClick={() => requestSort(h.key)}
                      style={{
                        width: h.width, flex: h.flex, fontSize: 10, color: "#94a3b8", fontWeight: 700,
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                      }}
                    >
                      {h.label}
                      {sortConfig?.key === h.key && (
                        <span style={{ color: "#3b82f6" }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                      )}
                      {sortConfig?.key !== h.key && <span style={{ opacity: 0.3 }}>⇅</span>}
                    </div>
                  ))}
                </div>
                {getProcessedData(displayAlerts).map((a: any, i: number) => (
                  <div key={i} style={{
                    padding: "14px 20px", borderBottom: "1px solid rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 14,
                    borderLeft: `3px solid ${a.type === "buy" ? "#22c55e" : a.type === "sell" ? "#ef4444" : "#94a3b8"}`
                  }}>
                    <div style={{ fontFamily: "Menlo, Monaco, Consolas, monospace", fontWeight: 700, color: "#0f172a", fontSize: 14, minWidth: 52 }}>{a.stock}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8", minWidth: 52 }}>{a.time} WIB</div>
                    <div style={{ fontSize: 13, color: "#475569", flex: 1 }}>{a.msg}</div>
                    <span style={{
                      fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
                      color: a.type === "buy" ? "#16a34a" : a.type === "sell" ? "#dc2626" : "#64748b",
                      background: a.type === "buy" ? "rgba(34,197,94,0.1)" : a.type === "sell" ? "rgba(239,68,68,0.1)" : "rgba(0,0,0,0.05)",
                      padding: "3px 9px", borderRadius: 50
                    }}>
                      {a.type === "buy" ? "● BUY" : a.type === "sell" ? "● SELL" : "● INFO"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "float" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp 0.4s ease both", position: "relative" }}>
              {!isPremium && <LockGate onRequestLogin={onRequestLogin} label="Free Float Hunter Premium" />}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
                <div>
                  <h1 style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 800, fontSize: 22, color: "#0f172a" }}>🎈 Free Float Hunter</h1>
                  <p style={{ color: "#3b82f6", fontSize: 12, fontWeight: 600, marginTop: 2 }}>🕒 Last Update: {lastUpdateText}</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { id: "low", label: "Low Float (<5%)" },
                    { id: "below15", label: "Below 15%" },
                    { id: "mid", label: "Mid (15-50%)" },
                    { id: "high", label: "High (>50%)" },
                    { id: "all", label: "All 955" }
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setFloatFilter(f.id)}
                      style={{
                        padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                        cursor: "pointer", border: "1px solid rgba(0,0,0,0.08)",
                        background: floatFilter === f.id ? "#0f172a" : "#fff",
                        color: floatFilter === f.id ? "#fff" : "#64748b",
                        transition: "all 0.2s"
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
                  <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12 }}>🔍</span>
                    <input
                      type="text"
                      placeholder="Cari Ticker di Float Hunt..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "100%", padding: "8px 12px 8px 32px", borderRadius: 8,
                        border: "1px solid rgba(0,0,0,0.1)", fontSize: 13, background: "#f8faff"
                      }}
                    />
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#f8faff", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {[
                          { key: "id", label: "TICKER" },
                          { key: "name", label: "COMPANY" },
                          { key: "price", label: "PRICE" },
                          { key: "free_float", label: "EST. FREE FLOAT" },
                          { key: null, label: "STATUS" }
                        ].map(h => (
                          <th
                            key={h.label}
                            onClick={() => h.key && requestSort(h.key)}
                            style={{
                              padding: "14px 16px", fontSize: 13, color: "#64748b", fontWeight: 700,
                              cursor: h.key ? "pointer" : "default"
                            }}
                          >
                            {h.label}
                            {h.key && sortConfig?.key === h.key && (
                              <span style={{ color: "#3b82f6", marginLeft: 4 }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                            {h.key && sortConfig?.key !== h.key && (
                              <span style={{ opacity: 0.3, marginLeft: 4 }}>⇅</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getProcessedData(displayStocks.filter(s => {
                        const f = parseFloat(s.free_float);
                        if (floatFilter === "low") return f < 5;
                        if (floatFilter === "below15") return f < 15;
                        if (floatFilter === "mid") return f >= 15 && f <= 50;
                        if (floatFilter === "high") return f > 50;
                        return true;
                      })).slice(0, 100).map((s, i) => {
                        const floatVal = parseFloat(s.free_float);
                        const isExtreme = floatVal < 5;
                        const isTight = floatVal < 15;
                        return (
                          <tr key={i} className="stock-row" style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", transition: "all 0.2s" }}>
                            <td style={{ padding: "14px 16px", fontFamily: "Menlo, Monaco, Consolas, monospace", fontWeight: 800, fontSize: 14, color: "#0f172a" }}>{s.id}</td>
                            <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569", fontWeight: 500 }}>{s.name}</td>
                            <td style={{ padding: "14px 16px", fontSize: 13, color: "#0f172a", fontWeight: 700 }}>Rp{Number(s.price).toLocaleString('id-ID')}</td>
                            <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 800, color: isExtreme ? "#ef4444" : isTight ? "#f59e0b" : "#3b82f6" }}>
                              {s.free_float} {isExtreme && "⚠️"}
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <span style={{
                                fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 50,
                                background: isExtreme ? "rgba(239,68,68,0.1)" : isTight ? "rgba(245,158,11,0.1)" : "rgba(59,130,246,0.1)",
                                color: isExtreme ? "#dc2626" : isTight ? "#d97706" : "#2563eb"
                              }}>
                                {isExtreme ? "LOW LIQUIDITY" : isTight ? "TIGHT FLOAT" : floatVal > 50 ? "INSTITUTIONAL" : "MID FLOAT"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "investor" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp 0.4s ease both", position: "relative" }}>
              {!isPremium && <LockGate onRequestLogin={onRequestLogin} label="Investor Watch Premium" />}
              <div>
                <h1 style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 800, fontSize: 22, color: "#0f172a" }}>🕵️ Investor Watch</h1>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, marginTop: 4 }}>
                  <div>
                    <p style={{ color: "#64748b", fontSize: 14 }}>Melacak kepemilikan investor besar dan institusi (Mutual Funds & High-Net-Worth Individuals).</p>
                    <p style={{ color: "#3b82f6", fontSize: 12, fontWeight: 600, marginTop: 2 }}>🕒 Last Update: {lastUpdateText}</p>
                  </div>
                  <div style={{ position: "relative", width: 280 }}>
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12 }}>🔍</span>
                    <input
                      type="text"
                      placeholder="Cari Investor atau Ticker..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: "100%", padding: "8px 12px 8px 32px", borderRadius: 8,
                        border: "1px solid rgba(0,0,0,0.1)", fontSize: 13, background: "#fff"
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
                {/* LKH Hidden Holdings */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👴</div>
                    <div>
                      <div style={{ fontWeight: 800, color: "#0f172a" }}>Lo Kheng Hong Watch</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Hidden Holdings (1% - 5%)</div>
                    </div>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        {[
                          { key: "ticker", label: "TICKER" },
                          { key: "percentage", label: "EST. OWNERSHIP" },
                          { key: "status", label: "STATUS" }
                        ].map(h => (
                          <th
                            key={h.label} onClick={() => h.key && requestSort(h.key)}
                            style={{ padding: "10px 0", fontSize: 11, color: "#94a3b8", cursor: "pointer" }}
                          >
                            {h.label} {sortConfig?.key === h.key && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            {sortConfig?.key !== h.key && <span style={{ opacity: 0.2, marginLeft: 2 }}>⇅</span>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getProcessedData(realInvestorWatch.filter(i => i.type === 'LKH')).map((v, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                          <td style={{ padding: "12px 0", fontFamily: "monospace", fontWeight: 700, color: "#3b82f6" }}>{v.ticker}</td>
                          <td style={{ padding: "12px 0", fontWeight: 700, color: "#1e293b" }}>{v.percentage}</td>
                          <td style={{ padding: "12px 0" }}><span style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>{v.status}</span></td>
                        </tr>
                      ))}
                      {realInvestorWatch.filter(i => i.type === 'LKH').length === 0 && (
                        <tr><td colSpan={3} style={{ padding: "20px 0", textAlign: "center", fontSize: 12, color: "#94a3b8" }}>Belum ada data investor.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mutual Fund Top Bets */}
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏦</div>
                    <div>
                      <div style={{ fontWeight: 800, color: "#0f172a" }}>Top Mutual Funds Bets</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>Top holdings in big reksa dana</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {getProcessedData(realInvestorWatch.filter(i => i.type === 'Fund')).map((f, i) => (
                      <div key={i} style={{ padding: "12px", borderRadius: 12, background: "#f8faff", border: "1px solid rgba(0,0,0,0.03)" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>{f.investor_name}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 800, color: "#1e293b" }}>{f.ticker}</span>
                          <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 700 }}>{f.percentage} Holding</span>
                        </div>
                      </div>
                    ))}
                    {realInvestorWatch.filter(i => i.type === 'Fund').length === 0 && (
                      <div style={{ padding: "20px", textAlign: "center", fontSize: 12, color: "#94a3b8" }}>Belum ada data Mutual Funds.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── CONGLOMERATE ── */}
          {activeTab === "graph" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp 0.4s ease both", position: "relative" }}>
              {!isPremium && <LockGate onRequestLogin={onRequestLogin} label="Peta Konglomerat Premium" />}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
                <div>
                  <h1 style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 800, fontSize: 22, color: "#0f172a" }}>🕸 Peta Konglomerat IDX</h1>
                  <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>Jaringan kepemilikan saham oleh grup bisnis besar di Indonesia. Diupdate secara otomatis.</p>
                  <p style={{ color: "#3b82f6", fontSize: 12, fontWeight: 600, marginTop: 2 }}>🕒 Last Update: {lastUpdateText}</p>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setKonglomeratView("graph")}
                    style={{
                      padding: "6px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
                      background: konglomeratView === "graph" ? "rgba(59,130,246,0.1)" : "transparent",
                      color: konglomeratView === "graph" ? "#3b82f6" : "#64748b"
                    }}>Grafik 3D</button>
                  <button
                    onClick={() => setKonglomeratView("table")}
                    style={{
                      padding: "6px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none",
                      background: konglomeratView === "table" ? "rgba(59,130,246,0.1)" : "transparent",
                      color: konglomeratView === "table" ? "#3b82f6" : "#64748b"
                    }}>Tabel Data</button>
                </div>
              </div>

              {konglomeratView === "graph" ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
                  {/* D3 Graph View */}
                  <div style={{ background: "#fff", borderRadius: 16, padding: 8, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden", minHeight: 600 }}>
                    <div style={{ padding: "16px 16px 8px 16px", fontSize: 13, color: "#64748b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Interaktif D3.js — Drag node untuk memutus gravitasi, scroll untuk zoom.</span>
                      <span style={{ fontSize: 11, background: "rgba(59,130,246,0.1)", color: "#3b82f6", padding: "4px 10px", borderRadius: 50, fontWeight: 700 }}>LIVE PHYSICS</span>
                    </div>
                    <div style={{ width: "100%", height: 550 }}>
                      <ForceGraph2D
                        graphData={{ nodes: displayNodes, links: displayEdges }}
                        nodeLabel={(n: any) => `
                        <div style="padding: 10px; background: rgba(15,23,42,0.95); color: #fff; border-radius: 12px; font-size: 12px; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(8px); box-shadow: 0 4px 20px rgba(0,0,0,0.3)">
                          <div style="font-weight: 800; border-bottom: 1px solid rgba(255,255,255,0.2); margin-bottom: 6px; padding-bottom: 6px; font-size: 14px; color: ${n.borderColor || '#fff'}">${n.name || n.id}</div>
                          ${n.item_type ? `<div style="color: #94a3b8; margin-bottom: 4px">${n.item_type}</div>` : ''}
                          ${n.market_cap_val ? `<div style="color: #f59e0b; font-weight: 700">Market Cap: Rp${(Number(n.market_cap_val) / 1e12).toFixed(1)}T</div>` : ''}
                          ${n.ownership_perc ? `<div style="color: #4ade80; font-weight: 700">Ownership: ${n.ownership_perc}%</div>` : ''}
                          ${n.sector ? `<div style="color: #60a5fa">${n.sector}</div>` : ''}
                        </div>
                      `}
                        nodeCanvasObject={(node: any, ctx, globalScale) => {
                          const label = node.name || node.id;
                          const fontSize = node.is_group ? 14 / globalScale : 10 / globalScale;
                          const r = Math.sqrt(node.val || 10) / globalScale * 3;

                          // Draw Halo / Glow for Groups
                          if (node.is_group) {
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, r * 1.4, 0, 2 * Math.PI, false);
                            ctx.fillStyle = `${node.borderColor}22`;
                            ctx.fill();
                          }

                          // Draw Node Body
                          ctx.beginPath();
                          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                          ctx.fillStyle = node.color;
                          ctx.fill();

                          // Add Border (Core-Halo)
                          ctx.strokeStyle = node.borderColor;
                          ctx.lineWidth = node.is_group ? 2 / globalScale : 1.5 / globalScale;
                          ctx.stroke();

                          // Draw Text for Groups or high zoom
                          if (node.is_group || globalScale > 1.5) {
                            ctx.font = `${node.is_group ? 'bold' : 'normal'} ${fontSize}px Inter, system-ui`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillStyle = '#1e293b';
                            ctx.fillText(label, node.x, node.y + r + (node.is_group ? 8 : 6) / globalScale);
                          }
                        }}
                        nodePointerAreaPaint={(node: any, color, ctx) => {
                          const r = Math.sqrt(node.val || 10) * 1.5;
                          ctx.fillStyle = color;
                          ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false); ctx.fill();
                        }}
                        linkColor={(link: any) => link.color}
                        linkWidth={1.5}
                        linkCurvature="curvature"
                        linkDirectionalParticles={1}
                        linkDirectionalParticleSpeed={0.003}
                        width={undefined}
                        height={550}
                        backgroundColor="#f8faff"
                        warmupTicks={150}
                        cooldownTicks={0}
                      />
                    </div>
                  </div>

                  {/* 18 Groups Mapping */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 600, overflowY: "auto", paddingRight: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>18 Peta Konglomerat</div>
                    {(isPremium ? displayNodes.filter((n: any) => n.is_group) : displayNodes.filter((n: any) => n.group && !n.id.match(/^[A-Z]{4}$/))).map((g: any, i: number) => (
                      <div key={i} style={{
                        background: "#fff", borderRadius: 12, padding: 18, border: `1px solid ${g.color}33`,
                        borderLeft: `5px solid ${g.color}`, boxShadow: "0 2px 8px rgba(0,0,0,0.03)", transition: "transform 0.15s", cursor: "pointer"
                      }} onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.transform = "translateX(4px)"} onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.transform = "translateX(0)"}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 800, fontSize: 15, color: "#0f172a" }}>{g.name}</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: g.color, background: `${g.color}15`, padding: "2px 8px", borderRadius: 50 }}>{g.cap || (g.market_cap_val ? `Rp${(Number(g.market_cap_val) / 1e12).toFixed(0)}T` : "—")}</div>
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, marginBottom: g.ai_insight ? 10 : 0 }}>{g.desc}</div>

                        {g.ai_insight && (
                          <div style={{
                            marginTop: 8, padding: "8px 12px", background: "rgba(59,130,246,0.05)",
                            borderRadius: 8, borderLeft: "3px solid #3b82f6", fontSize: 11, color: "#1e40af"
                          }}>
                            <span style={{ fontWeight: 800, display: "block", marginBottom: 2 }}>🤖 AI SPOTLIGHT</span>
                            {g.ai_insight}
                          </div>
                        )}
                      </div>
                    ))}

                    <div style={{ background: "rgba(59,130,246,0.04)", borderRadius: 12, padding: 16, border: "1px dashed rgba(59,130,246,0.3)", textAlign: "center", marginTop: 8 }}>
                      <div style={{ fontSize: 12, color: "#3b82f6", fontWeight: 600 }}>Tampilkan semua grup...</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ background: "#f8faff", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <th style={{ padding: "14px 16px", fontSize: 13, color: "#64748b", fontWeight: 700 }}>TICKER</th>
                        <th style={{ padding: "14px 16px", fontSize: 13, color: "#64748b", fontWeight: 700 }}>COMPANY / OWNER</th>
                        <th style={{ padding: "14px 16px", fontSize: 13, color: "#64748b", fontWeight: 700 }}>GROUP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayNodes.filter((n: any) => !n.is_group).map((n: any, i: number) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                          <td style={{ padding: "14px 16px", fontFamily: "monospace", fontWeight: 800, color: "#3b82f6" }}>{n.id}</td>
                          <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569", fontWeight: 500 }}>{n.name}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ padding: "4px 8px", background: "rgba(0,0,0,0.04)", borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#0f172a" }}>
                              {n.group}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── SCREENER ── */}
          {
            activeTab === "screener" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp 0.4s ease both", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
                  <div>
                    <h1 style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 800, fontSize: 22, color: "#0f172a" }}>🔬 MSCI Float Screener</h1>
                    <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>Screener blue-chip berdasarkan standar free float tinggi ({">30%"}).</p>
                    <p style={{ color: "#3b82f6", fontSize: 12, fontWeight: 600, marginTop: 2 }}>🕒 Last Update: {lastUpdateText}</p>
                    <p style={{ color: "#f59e0b", fontSize: 12, fontWeight: 600, marginTop: 4 }}>⚠️ Simulasi Murni: Rating & Label MSCI (1.2%) adalah estimasi proksi berdasarkan kapitalisasi publik. Bukan data official dari index MSCI.</p>
                  </div>
                </div>
                <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", gap: 12, alignItems: "center" }}>
                    <span style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>Saham Layak Institusi</span>
                    <div style={{ position: "relative", flex: 1, maxWidth: 300 }}>
                      <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12 }}>🔍</span>
                      <input
                        type="text"
                        placeholder="Cari di MSCI Screener..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          width: "100%", padding: "8px 12px 8px 32px", borderRadius: 8,
                          border: "1px solid rgba(0,0,0,0.1)", fontSize: 13, background: "#f8faff"
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: "auto" }}>Filter: Free Float ≥ 30% | Liq. ≥ Rp50M/hari</span>
                  </div>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "rgba(0,0,0,0.02)" }}>
                        {[
                          { key: "id", label: "Kode" },
                          { key: "ff", label: "Free Float" },
                          { key: "liq", label: "Likuiditas Harian" },
                          { key: "msci", label: "MSCI Weight" },
                          { key: "status", label: "Status" },
                          { key: "r", label: "Rating" }
                        ].map(h => (
                          <th
                            key={h.label}
                            onClick={() => h.key && requestSort(h.key)}
                            style={{
                              padding: "10px 16px", textAlign: "left", fontSize: 11, color: "#94a3b8",
                              fontWeight: 600, letterSpacing: 0.5, cursor: h.key ? "pointer" : "default"
                            }}
                          >
                            {h.label}
                            {h.key && sortConfig?.key === h.key && (
                              <span style={{ color: "#3b82f6", marginLeft: 4 }}>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                            )}
                            {h.key && sortConfig?.key !== h.key && (
                              <span style={{ opacity: 0.3, marginLeft: 4 }}>⇅</span>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getProcessedData(displayScreener).map((r: any, i: number) => (
                        <tr key={i} className="stock-row" style={{ borderTop: "1px solid rgba(0,0,0,0.04)", cursor: "pointer" }}>
                          <td style={{ padding: "12px 16px", fontFamily: "Menlo, Monaco, Consolas, monospace", fontWeight: 700, fontSize: 13, color: "#0f172a" }}>{r.id}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569" }}>{r.ff}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#475569", fontFamily: "Menlo, Monaco, Consolas, monospace" }}>{r.liq}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontFamily: "Menlo, Monaco, Consolas, monospace", color: r.msci !== "—" ? "#3b82f6" : "#cbd5e1" }}>{r.msci}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{
                              fontSize: 11, fontWeight: 700,
                              color: r.status === "MSCI" ? "#16a34a" : "#94a3b8",
                              background: r.status === "MSCI" ? "rgba(34,197,94,0.1)" : "rgba(0,0,0,0.05)",
                              padding: "3px 9px", borderRadius: 50
                            }}>{r.status}</span>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            {"★".repeat(r.r)}<span style={{ color: "#e2e8f0" }}>{"★".repeat(5 - r.r)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          }

          {/* ── AI SPOTLIGHT ── */}
          {
            activeTab === "ai" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp 0.4s ease both", position: "relative" }}>
                {!isPremium && <LockGate onRequestLogin={onRequestLogin} label="AI Spotlight Premium" />}
                <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 800, fontSize: 22, color: "#0f172a" }}>🤖 AI Spotlight</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16, alignItems: "start" }}>
                  <div style={{
                    background: "#fff", borderRadius: 16, padding: 24, border: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)", height: 480, display: "flex", flexDirection: "column"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", animation: "pulseRing 1.5s infinite" }} />
                      <span style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 700, fontSize: 14, color: "#0f172a" }}>AI Spotlight — KSEI Intelligence</span>
                    </div>
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <AIChatbot />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ background: "#fff", borderRadius: 16, padding: 18, border: "1px solid rgba(0,0,0,0.06)" }}>
                      <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 700, fontSize: 13, color: "#0f172a", marginBottom: 10 }}>Contoh pertanyaan:</div>
                      {["Siapa borong BBCA minggu ini?", "Kepemilikan tersembunyi BYAN?", "Ceritakan Salim Group", "Saham MSCI terbaik hari ini?"].map((q, i) => (
                        <div key={i} style={{
                          fontSize: 12, color: "#3b82f6", padding: "7px 10px", background: "rgba(59,130,246,0.06)",
                          borderRadius: 8, marginBottom: 6, cursor: "pointer", border: "1px solid rgba(59,130,246,0.12)"
                        }}>
                          "{q}"
                        </div>
                      ))}
                    </div>
                    <div style={{ background: "rgba(59,130,246,0.05)", borderRadius: 16, padding: 18, border: "1px solid rgba(59,130,246,0.12)" }}>
                      <div style={{ fontSize: 12, color: "#3b82f6", fontWeight: 600, marginBottom: 6 }}>⚡ Powered by</div>
                      <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4 }}>Elvision AI Logic</div>
                      <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>Scraping otomatis ribuan PDF KSEI & OJK setiap hari untuk data paling akurat.</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          {/* ── INTEL REPORT ── */}
          {
            activeTab === "report" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20, animation: "fadeUp 0.4s ease both", position: "relative" }} className="print-report">
                {!isPremium && <LockGate onRequestLogin={onRequestLogin} label="Intel Report Premium" />}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }} className="no-print">
                  <div>
                    <h1 style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 800, fontSize: 22, color: "#0f172a" }}>📈 Intel Report</h1>
                    <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>Rangkuman performa pasar dan aktivitas institusi (Diperbarui 2x Sehari). Pukul 10.00 WIB dan 17.00 WIB silahkan download PDF</p>
                    <p style={{ color: "#3b82f6", fontSize: 12, fontWeight: 600, marginTop: 2 }}>🕒 Last Update: {lastUpdateText}</p>
                  </div>
                  <button onClick={() => window.print()} style={{
                    background: "#0f172a", color: "#fff", padding: "10px 20px", borderRadius: 8,
                    fontWeight: 700, fontSize: 13, cursor: "pointer", border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                  }}>
                    ⬇️ Download PDF
                  </button>
                </div>

                <div style={{ display: "none" }} className="print-header">
                  <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 5 }}>Saham Intel - Market Report</h1>
                  <p style={{ fontSize: 12, color: "#64748b", marginBottom: 20 }}>Generated on {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} | Update: {lastUpdateText}</p>
                </div>

                {/* Sentiment & Overview */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 16 }}>
                  <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid rgba(0,0,0,0.06)", borderLeft: "4px solid #3b82f6" }}>
                    <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700, marginBottom: 8 }}>MARKET SENTIMENT</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{sentimentLabel}</div>
                    <div style={{ fontSize: 14, color: "#64748b" }}><span style={{ color: "#16a34a", fontWeight: 700 }}>{positiveCount} Naik</span> vs <span style={{ color: "#dc2626", fontWeight: 700 }}>{negativeCount} Turun</span> ({sentimentScore}%)</div>
                  </div>
                  <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid rgba(0,0,0,0.06)", borderLeft: "4px solid #f59e0b" }}>
                    <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700, marginBottom: 8 }}>WHALE ACTIVITY</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{activeAlerts} Sinyal</div>
                    <div style={{ fontSize: 14, color: "#64748b" }}>Terdeteksi akumulasi / distribusi besar hari ini.</div>
                  </div>
                </div>

                {/* Top Gainers & Losers */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="print-grid">
                  <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
                    <div style={{ padding: "16px", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "rgba(34,197,94,0.05)" }}>
                      <span style={{ fontWeight: 800, color: "#16a34a", fontSize: 15 }}>🚀 Top 20 Gainers</span>
                    </div>
                    <div style={{ maxHeight: 300, overflowY: "auto" }} className="print-auto-height">
                      {top20Gainers.map((s, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                          <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>{s.id}</span>
                          <span style={{ color: "#16a34a", fontWeight: 700 }}>+{s.change}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
                    <div style={{ padding: "16px", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "rgba(239,68,68,0.05)" }}>
                      <span style={{ fontWeight: 800, color: "#dc2626", fontSize: 15 }}>📉 Top 20 Losers</span>
                    </div>
                    <div style={{ maxHeight: 300, overflowY: "auto" }} className="print-auto-height">
                      {top20Losers.map((s, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid rgba(0,0,0,0.03)" }}>
                          <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#0f172a" }}>{s.id}</span>
                          <span style={{ color: "#dc2626", fontWeight: 700 }}>{s.change}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actionable Insights */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="print-grid">
                  <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 16, marginBottom: 16 }}>🎯 Saham Layak Diperhatikan</div>
                    <ul style={{ margin: 0, paddingLeft: 20, color: "#475569", fontSize: 14, lineHeight: 1.6 }}>
                      {sahamDiperhatikan.length > 0 ? sahamDiperhatikan.map((s, i) => (
                        <li key={i} style={{ marginBottom: 8 }}><strong>{s.id}</strong> - Terdeteksi sinyal BUY dari Whale hari ini dengan volume signifikan.</li>
                      )) : <li>Belum ada sinyal akumulasi kuat hari ini.</li>}
                    </ul>
                  </div>
                  <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid rgba(0,0,0,0.06)" }}>
                    <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 16, marginBottom: 16 }}>⚠️ Saham Perlu Dihindari</div>
                    <ul style={{ margin: 0, paddingLeft: 20, color: "#475569", fontSize: 14, lineHeight: 1.6 }}>
                      {sahamDihindari.length > 0 ? sahamDihindari.map((s, i) => (
                        <li key={i} style={{ marginBottom: 8 }}><strong>{s.id}</strong> - Risiko volatilitas tinggi (Free Float terlalu kecil) atau ada sinyal SELL besar.</li>
                      )) : <li>Tidak ada peringatan kritis saat ini.</li>}
                    </ul>
                  </div>
                </div>

                {/* Disclaimer */}
                <div style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: 20, borderLeft: "5px solid #f59e0b" }}>
                  <div style={{ fontWeight: 800, color: "#d97706", fontSize: 15, marginBottom: 8 }}>DISCLAIMER</div>
                  <p style={{ fontSize: 13, color: "#78350f", lineHeight: 1.6, margin: 0 }}>
                    Laporan ini bukan saran finansial atau rekomendasi pembelian saham tertentu. Keputusan investasi sepenuhnya berada di tangan Anda. Kami tidak mengarahkan tindakan apapun, baik membeli maupun menjual. Data yang disajikan 100% merupakan kalkulasi obyektif dari real data pasar (Yahoo Finance, KSEI, OJK) yang dirangkum secara logis menggunakan sistem otomatis milik Saham Intel.
                  </p>
                </div>
              </div>
            )
          }

        </main >
      </div >
    </div >
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <div style={{
      width: 44, height: 24, borderRadius: 12,
      background: on ? "#22c55e" : "#e2e8f0",
      position: "relative", cursor: "pointer",
      transition: "background .2s", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 3, left: on ? 20 : 3,
        width: 18, height: 18, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,.2)",
        transition: "left .2s",
      }} />
    </div>
  );
}

/* ─── LOCK GATE (blur overlay for premium sections) ─── */
function LockGate({ onRequestLogin, label = "Fitur Premium" }: { onRequestLogin: () => void, label?: string }) {
  const G = "#3b82f6"; // Example gradient color 1
  const GD = "#2563eb"; // Example gradient color 2
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 10,
      backdropFilter: "blur(5px)",
      background: "rgba(255,255,255,0.7)",
      borderRadius: "inherit",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 12,
    }}>
      <div style={{ fontSize: 28 }}>🔒</div>
      <div style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 700, fontSize: 15, color: "#0f172a" }}>{label}</div>
      <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>Masuk untuk mengakses data ini</div>
      <button onClick={onRequestLogin} style={{
        background: `linear-gradient(135deg, ${G}, ${GD})`,
        border: "none", borderRadius: 9, padding: "10px 22px",
        color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
        fontFamily: "Inter, system-ui, sans-serif",
        boxShadow: `0 4px 16px ${G}44`,
      }}>Buka Akses →</button>
    </div>
  );
}

/* ─── ROOT ─── */
export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    const recordClient = async (user_email: string) => {
      if (!user_email) return;
      try {
        await supabase.from('saham_clients').upsert({ user_email, last_login: new Date().toISOString() }, { onConflict: 'user_email' });
      } catch (e) {
        console.error("Tracking error", e);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const email = session?.user?.email || null;
      setUser(email);
      setLoadingConfig(false);
      if (email) recordClient(email);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email || null;
      setUser(email);
      if (email) recordClient(email);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRequestLogin = () => {
    window.location.href = '/auth';
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loadingConfig) return null;

  return (
    <Dashboard
      userEmail={user}
      onLogout={handleLogout}
      onRequestLogin={handleRequestLogin}
    />
  );
}
