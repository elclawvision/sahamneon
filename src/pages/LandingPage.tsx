import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            color: '#1e293b',
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
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-blob {
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(59, 130, 246, 0.08), transparent 70%);
                    filter: blur(60px);
                    z-index: 0;
                }
                
                .card {
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }
                
                .card:hover {
                    border-color: #3b82f6;
                    transform: translateY(-5px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
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
                <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-1px', color: '#0f172a' }}>
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
                        boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.3)'
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
                    background: 'rgba(59, 130, 246, 0.05)',
                    padding: '8px 20px',
                    borderRadius: '50px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#3b82f6',
                    marginBottom: '24px',
                    border: '1px solid rgba(59, 130, 246, 0.1)',
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
                    position: 'relative',
                    color: '#0f172a'
                }}>
                    Lihat Siapa <span className="gradient-text">Pemilik Saham</span> Sebenarnya.
                </h1>

                <p style={{
                    fontSize: 'clamp(16px, 2vw, 20px)',
                    color: '#64748b',
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
                            background: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '16px',
                            fontWeight: 700,
                            fontSize: '16px',
                            cursor: 'pointer',
                            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                        }}
                    >
                        Mulai Sekarang
                    </button>
                    <button 
                        onClick={() => navigate('/demo')}
                        style={{
                            padding: '18px 40px',
                            background: '#fff',
                            color: '#1e293b',
                            border: '1px solid #e2e8f0',
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
                        <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#0f172a' }}>Instan & Tanpa Lag</h3>
                        <p style={{ color: '#64748b', fontSize: '15px' }}>Navigasi antar bursa dan investor dalam hitungan detik. Dioptimalkan untuk kecepatan maksimal.</p>
                    </div>
                    
                    <div className="card" style={{ padding: '40px', borderRadius: '24px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '20px' }}>📱</div>
                        <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#0f172a' }}>Mobile First</h3>
                        <p style={{ color: '#64748b', fontSize: '15px' }}>Akses data whale kapan saja dari HP Anda dengan antarmuka yang sangat responsif.</p>
                    </div>
                    
                    <div className="card" style={{ padding: '40px', borderRadius: '24px' }}>
                        <div style={{ fontSize: '32px', marginBottom: '20px' }}>📥</div>
                        <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#0f172a' }}>Download CSV</h3>
                        <p style={{ color: '#64748b', fontSize: '15px' }}>Ekspor data ke Excel hanya dengan satu klik untuk analisa mendalam Anda sendiri.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: '60px 8%',
                borderTop: '1px solid #e2e8f0',
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '14px'
            }}>
                © 2026 Saham Ultimate • Versi Maret 2026 • IDX Big Data
            </footer>
        </div>
    );
}
