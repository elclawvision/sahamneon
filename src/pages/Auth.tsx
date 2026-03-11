import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Helper custom SVG icons
const Sparkline = ({ up }: { up: boolean }) => (
    <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
        <path
            d={up ? "M0 20L10 15L20 18L30 8L40 12L50 2L60 5" : "M0 5L10 12L20 8L30 18L40 15L50 22L60 20"}
            stroke={up ? "#22c55e" : "#ef4444"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default function Auth() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setTick(x => x + 1), 60);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) navigate('/sheets');
        });
    }, [navigate]);

    const handleLogin = async () => {
        if (!email || !pass) { setErr("Email dan password wajib diisi."); return; }
        setErr(""); 
        setLoading(true);
        
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password: pass,
            });
            if (error) throw error;
            navigate("/sheets");
        } catch (error: any) {
            setErr(error.message);
        } finally {
            setLoading(true); // Keep loading brief for transition
            setTimeout(() => setLoading(false), 500);
        }
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
                @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
                input:focus{outline:none!important;}
                
                @media (max-width: 640px) {
                    .login-card {
                        padding: 32px 24px !important;
                        border-radius: 20px !important;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.08) !important;
                    }
                    .floating-card, .bg-decoration {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Animated BG dots */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 110 100" preserveAspectRatio="xMidYMid slice">
                {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={0.9} fill="#3b82f6" fillOpacity={d.op} />)}
            </svg>

            {/* Back Button for Mobile */}
            <button 
                onClick={() => navigate('/lp')}
                style={{
                    position: "absolute",
                    top: "20px",
                    left: "20px",
                    zIndex: 10,
                    width: "50px",
                    height: "50px",
                    borderRadius: "15px",
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                    color: "#0f172a",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                }}
            >
                ←
            </button>

            {/* Left side decorative */}
            <div className="bg-decoration" style={{
                position: "absolute", left: -120, top: "50%", transform: "translateY(-50%)",
                width: 400, height: 400, borderRadius: "50%",
                background: "radial-gradient(circle,rgba(59,130,246,0.08),transparent 70%)",
                pointerEvents: "none"
            }} />
            <div className="bg-decoration" style={{
                position: "absolute", right: -80, bottom: -80,
                width: 320, height: 320, borderRadius: "50%",
                background: "radial-gradient(circle,rgba(99,102,241,0.07),transparent 70%)",
                pointerEvents: "none"
            }} />

            {/* Floating mock chart card */}
            <div className="floating-card" style={{
                position: "absolute", left: "6%", top: "50%", transform: "translateY(-50%)",
                background: "#fff", borderRadius: 16, padding: "20px 24px",
                boxShadow: "0 8px 40px rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.06)",
                width: 200, animation: "floatCard 4s ease-in-out infinite",
            }}>
                <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 8, letterSpacing: 1 }}>WHALE ALERT</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>BBCA +2.14%</div>
                <div style={{ fontSize: 12, color: "#22c55e", marginBottom: 10 }}>▲ Djarum +12.4M lembar</div>
                <Sparkline up={true} />
            </div>

            {/* Login card */}
            <div className="login-card" style={{
                background: "#fff", borderRadius: 24, padding: "48px 44px",
                boxShadow: "0 20px 80px rgba(0,0,0,0.1)", border: "1px solid rgba(0,0,0,0.06)",
                width: "92%", maxWidth: 420, position: "relative", zIndex: 2,
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
                    
                    <div style={{ marginTop: 12, textAlign: 'center' }}>
                        <span 
                            onClick={() => navigate('/lp')} 
                            style={{ fontSize: '13px', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Ke Landing Page
                        </span>
                    </div>
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
        </div>
    );
}
