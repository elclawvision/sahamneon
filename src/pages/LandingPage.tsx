import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0f172a',
            color: '#fff',
            fontFamily: 'Inter, system-ui, sans-serif',
            overflowX: 'hidden'
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
                
                body {
                    margin: 0;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }

                .gradient-text {
                    background: linear-gradient(135deg, #60a5fa, #c084fc);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-blob {
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(59, 130, 246, 0.15), transparent 70%);
                    filter: blur(60px);
                    z-index: 0;
                }
                
                .card {
                    background: rgba(30, 41, 59, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(12px);
                    transition: all 0.3s ease;
                }
                
                .card:hover {
                    border-color: rgba(96, 165, 250, 0.5);
                    transform: translateY(-5px);
                }
            `}</style>

            {/* Navbar */}
            <nav style={{
                padding: '24px 8%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-1px' }}>
                    SAHAM<span className="gradient-text">ULTIMATE</span>
                </div>
                <button 
                    onClick={() => navigate('/auth')}
                    style={{
                        padding: '12px 28px',
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)'
                    }}
                >
                    Login
                </button>
            </nav>

            {/* Hero Section */}
            <header style={{
                padding: '100px 8%',
                textAlign: 'center',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div className="hero-blob" style={{ top: '-100px', left: '10%' }}></div>
                <div className="hero-blob" style={{ bottom: '-100px', right: '10%' }}></div>

                <div style={{
                    background: 'rgba(96, 165, 250, 0.1)',
                    padding: '8px 20px',
                    borderRadius: '50px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#60a5fa',
                    marginBottom: '24px',
                    border: '1px solid rgba(96, 165, 250, 0.2)',
                    position: 'relative'
                }}>
                    ✨ Data Whale Terupdate H+1
                </div>

                <h1 style={{
                    fontSize: 'clamp(40px, 8vw, 76px)',
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: '-2px',
                    maxWidth: '900px',
                    marginBottom: '32px',
                    position: 'relative'
                }}>
                    Lihat Siapa <span className="gradient-text">Pemilik Saham</span> Sebenarnya.
                </h1>

                <p style={{
                    fontSize: 'clamp(16px, 2vw, 20px)',
                    color: '#94a3b8',
                    maxWidth: '650px',
                    lineHeight: 1.6,
                    marginBottom: '48px',
                    position: 'relative'
                }}>
                    Lacak pergerakan whale, institusi, dan konglomerat Indonesia melalui data sheets yang bersih, cepat, dan mobile-friendly.
                </p>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
                    <button 
                        onClick={() => navigate('/auth')}
                        style={{
                            padding: '18px 40px',
                            background: '#fff',
                            color: '#0f172a',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 700,
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        Mulai Sekarang
                    </button>
                    <button 
                         style={{
                            padding: '18px 40px',
                            background: 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            fontWeight: 700,
                            fontSize: '16px',
                            cursor: 'pointer'
                        }}
                    >
                        Demo Gratis
                    </button>
                </div>
            </header>

            {/* Features Area */}
            <section style={{ padding: '80px 8%', position: 'relative' }}>
                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                    gap: '24px' 
                }}>
                    <div className="card" style={{ padding: '40px', borderRadius: '24px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '20px' }}>⚡</div>
                        <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Instan & Tanpa Lag</h3>
                        <p style={{ color: '#94a3b8', fontSize: '15px' }}>Navigasi antar bursa dan investor dalam hitungan detik. Dioptimalkan untuk kecepatan maksimal.</p>
                    </div>
                    
                    <div className="card" style={{ padding: '40px', borderRadius: '24px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '20px' }}>📱</div>
                        <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Mobile First</h3>
                        <p style={{ color: '#94a3b8', fontSize: '15px' }}>Akses data whale kapan saja dari HP Anda dengan antarmuka yang sangat responsif.</p>
                    </div>
                    
                    <div className="card" style={{ padding: '40px', borderRadius: '24px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '20px' }}>📥</div>
                        <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Download CSV</h3>
                        <p style={{ color: '#94a3b8', fontSize: '15px' }}>Ekspor data ke Excel hanya dengan satu klik untuk analisa mendalam Anda sendiri.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '60px 8%',
                borderTop: '1px solid rgba(255,255,255,0.05)',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '14px'
            }}>
                © 2026 Saham Ultimate • Versi Maret 2026 • IDX Big Data
            </footer>
        </div>
    );
}
