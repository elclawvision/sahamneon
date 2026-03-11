import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface MockRow {
    ticker: string;
    issuer: string;
    shares: string;
    percent: string;
    whale: string;
}

const TICKER_MOCK: MockRow[] = [
    { ticker: 'BBCA', issuer: 'PT Bank Central Asia Tbk', shares: '67,8*1,234,567', percent: '54.91%', whale: 'PT D* I* A*' },
    { ticker: 'BBRI', issuer: 'PT Bank Rakyat Indonesia (Persero) Tbk', shares: '81,2*4,567,890', percent: '53.19%', whale: 'N* R* I*' },
    { ticker: 'TLKM', issuer: 'PT Telkom Indonesia (Persero) Tbk', shares: '51,2*3,456,890', percent: '52.09%', whale: 'N* R* I*' },
    { ticker: 'BYAN', issuer: 'PT Bayan Resources Tbk', shares: '20,3*4,567,901', percent: '60.91%', whale: 'L* T* K*' },
    { ticker: 'ASII', issuer: 'PT Astra International Tbk', shares: '20,2*3,456,789', percent: '50.11%', whale: 'J* C* & C*' },
];

const INVESTOR_MOCK = [
    { name: 'L* T* K*', type: 'INDIVIDUAL', nat: 'ID', positions: 5, top: 'BYAN' },
    { name: 'B* K*', type: 'INDIVIDUAL', nat: 'CH', positions: 3, top: 'BREN' },
    { name: 'P* G*', type: 'INDIVIDUAL', nat: 'ID', positions: 12, top: 'ADRO' },
    { name: 'H* T*', type: 'INDIVIDUAL', nat: 'ID', positions: 8, top: 'MNCN' },
];

const CONGLO_MOCK = [
    { name: 'S* G*', tickers: ['BBCA', 'D*'], description: 'Hartono Family Group' },
    { name: 'A* G*', tickers: ['ASII', 'U*'], description: 'Jardine/Astra Group' },
    { name: 'D* G*', tickers: ['B*'], description: 'Pangestu Group' },
];

export default function DemoDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('tickers');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const tabs = [
        { id: 'tickers', label: 'Tickers', icon: '📈' },
        { id: 'investor', label: 'Investors', icon: '🐋' },
        { id: 'conglomerate', label: 'Groups', icon: '🏢' },
        { id: 'celebrities', label: 'Celebs', icon: '⭐' }
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            color: '#1e293b',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: isMobile ? '20px 16px 100px 16px' : '40px 20px',
            position: 'relative'
        }}>
            <style>{`
                .blur-text {
                    filter: blur(5px);
                    user-select: none;
                }
                .censored {
                    background: #e2e8f0;
                    color: transparent;
                    border-radius: 4px;
                    display: inline-block;
                    min-width: 60px;
                }
                .demo-banner {
                    background: linear-gradient(135deg, #3b82f6, #6366f1);
                    color: white;
                    padding: 16px;
                    border-radius: 12px;
                    margin-bottom: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2);
                }
                .mobile-nav {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-around;
                    padding: 8px 0 env(safe-area-inset-bottom);
                    z-index: 1000;
                }
                .nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    background: none;
                    border: none;
                    color: #64748b;
                    font-size: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    padding: 8px;
                    flex: 1;
                }
                .nav-item.active {
                    color: #3b82f6;
                }
            `}</style>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {isMobile && (
                            <button 
                                onClick={() => navigate('/lp')}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    width: '44px', 
                                    height: '44px', 
                                    background: '#fff', 
                                    border: '1px solid #e2e8f0', 
                                    borderRadius: '12px', 
                                    color: '#0f172a',
                                    fontSize: '20px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                    flexShrink: 0
                                }}
                            >
                                ←
                            </button>
                        )}
                        <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 800, color: '#0f172a' }}>
                            SAHAM<span style={{ color: '#3b82f6' }}>ULTIMATE</span> <span style={{ fontSize: '10px', background: '#3b82f6', color: '#fff', padding: '1px 6px', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '4px' }}>DEMO</span>
                        </div>
                    </div>
                    {!isMobile && (
                        <button 
                            onClick={() => navigate('/auth')}
                            style={{ padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                        >
                            Login Full Access
                        </button>
                    )}
                </header>

                {/* Banner */}
                <div className="demo-banner">
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: isMobile ? '16px' : '18px' }}>Mode Demo Terbatas</div>
                        <div style={{ fontSize: '13px', opacity: 0.9 }}>Beberapa data disamarkan. Silahkan login untuk detail lengkap.</div>
                    </div>
                    <button 
                        onClick={() => navigate('/auth')}
                        style={{ background: '#fff', color: '#3b82f6', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', marginLeft: '12px' }}
                    >
                        Buka Semua
                    </button>
                </div>

                {/* Desktop Tabs & Actions */}
                {!isMobile && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div style={{ display: 'flex', gap: '8px', background: '#fff', padding: '6px', borderRadius: '12px', width: 'fit-content', border: '1px solid #e2e8f0' }}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        padding: '10px 24px',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                                        color: activeTab === tab.id ? '#fff' : '#64748b',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => navigate('/auth')}
                            style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px', 
                                background: '#f8fafc', 
                                color: '#94a3b8', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '10px', 
                                fontWeight: 700, 
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            📥 Download CSV <span style={{ fontSize: '10px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', marginLeft: '4px' }}>LOCKED</span>
                        </button>
                    </div>
                )}

                {/* Mobile Actions */}
                {isMobile && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                        <button 
                            onClick={() => navigate('/auth')}
                            style={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '8px 12px', 
                                background: '#fff', 
                                color: '#94a3b8', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '8px', 
                                fontWeight: 800, 
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            📥 CSV <span style={{ fontSize: '10px' }}>🔒</span>
                        </button>
                    </div>
                )}

                {/* Content Section */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    {activeTab === 'tickers' && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '16px', fontWeight: 700, color: '#475569' }}>TICKER</th>
                                    {!isMobile && <th style={{ padding: '16px', fontWeight: 700, color: '#475569' }}>ISSUER</th>}
                                    <th style={{ padding: '16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>SHARES</th>
                                    <th style={{ padding: '16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>%</th>
                                    <th style={{ padding: '16px', fontWeight: 700, color: '#475569' }}>WHALE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {TICKER_MOCK.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px', fontWeight: 800, color: '#3b82f6' }}>{row.ticker}</td>
                                        {!isMobile && <td style={{ padding: '16px', color: '#1e293b', fontSize: '14px' }}>{row.issuer}</td>}
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <span className="censored" style={{ minWidth: isMobile ? '40px' : '80px' }}>{row.shares}</span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700 }}>
                                            <span className="blur-text">{row.percent}</span>
                                        </td>
                                        <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                                            <span className="blur-text">{row.whale}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'investor' && (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                                    <th style={{ padding: '16px', fontWeight: 700, color: '#475569' }}>INVESTOR</th>
                                    <th style={{ padding: '16px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>NAT</th>
                                    <th style={{ padding: '16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>POS</th>
                                    <th style={{ padding: '16px', fontWeight: 700, color: '#475569' }}>TOP HOLDING</th>
                                </tr>
                            </thead>
                            <tbody>
                                {INVESTOR_MOCK.map((row, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '16px', fontWeight: 800, color: '#3b82f6' }}>
                                            <span className="blur-text">{row.name}</span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>{row.nat}</td>
                                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700 }}>{row.positions}</td>
                                        <td style={{ padding: '16px', color: '#1e293b' }}>{row.top}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'conglomerate' && (
                        <div style={{ padding: '24px', display: 'grid', gap: '16px', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                            {CONGLO_MOCK.map((group, i) => (
                                <div key={i} style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                    <div style={{ fontWeight: 800, fontSize: '16px', color: '#3b82f6', marginBottom: '4px' }}>{group.name}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>{group.description}</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {group.tickers.map(t => (
                                            <span key={t} style={{ padding: '4px 8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>{t}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'celebrities' && (
                        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🔒</span>
                            <div style={{ fontWeight: 800, fontSize: '20px', marginBottom: '8px' }}>Eksklusif: Public Figure Portfolio</div>
                            <div style={{ color: '#64748b', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                                Lihat portofolio tokoh publik ternama secara real-time. Fitur ini hanya tersedia untuk pengguna premium.
                            </div>
                            <button 
                                onClick={() => navigate('/auth')}
                                style={{ padding: '12px 32px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
                            >
                                Login Untuk Melihat
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Teaser */}
                <div style={{ marginTop: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                    © 2026 Saham Ultimate • Versi Demo • Data Berkala Terkunci
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            {isMobile && (
                <div className="mobile-nav">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <span style={{ fontSize: '20px' }}>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                    <button className="nav-item" onClick={() => navigate('/auth')}>
                        <span style={{ fontSize: '20px' }}>👤</span>
                        <span>Auth</span>
                    </button>
                </div>
            )}
        </div>
    );
}
