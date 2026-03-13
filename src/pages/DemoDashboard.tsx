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
    { ticker: 'AADI', issuer: 'ADARO STRATEGIC INVESTMENTS', shares: '1,234,567', percent: '41.10%', whale: 'ADARO STRATEGIC INVESTMENTS' },
    { ticker: 'AALI', issuer: 'PT ASTRA INTERNATIONAL TBK', shares: '81,234,567', percent: '79.68%', whale: 'PT ASTRA INTERNATIONAL TBK' },
    { ticker: 'ABBA', issuer: 'PT. Beyond Media', shares: '51,234,567', percent: '40.47%', whale: 'PT. Beyond Media' },
    { ticker: 'ABDA', issuer: 'OONA INDONESIA PTE LTD', shares: '20,345,679', percent: '86.75%', whale: 'OONA INDONESIA PTE LTD' },
    { ticker: 'ABMM', issuer: 'PT TIARA MARGA TRAKINDO', shares: '20,234,567', percent: '53.56%', whale: 'PT TIARA MARGA TRAKINDO' },
    { ticker: 'ACES', issuer: 'PT KAWAN LAMA SEJAHTERA', shares: '15,000,000', percent: '60.00%', whale: 'PT KAWAN LAMA SEJAHTERA' },
    { ticker: 'ACRO', issuer: 'TAE SUNG CHUNG', shares: '5,000,000', percent: '78.40%', whale: 'TAE SUNG CHUNG' },
    { ticker: 'ACST', issuer: 'PT. KARYA SUPRA PERKASA', shares: '8,000,000', percent: '91.17%', whale: 'PT. KARYA SUPRA PERKASA' },
    { ticker: 'ADCP', issuer: 'ADHI KARYA PERSERO TBK PT.', shares: '3,000,000', percent: '90.00%', whale: 'ADHI KARYA PERSERO TBK PT.' },
    { ticker: 'ADES', issuer: 'WATER PARTNERS BOTTLING SA', shares: '2,500,000', percent: '91.35%', whale: 'WATER PARTNERS BOTTLING SA' },
];

const INVESTOR_MOCK = [
    { name: 'UOB KAY HIAN PRIVATE LIMITED', nat: 'F', type: 'SC', positions: 65, top: 'SOHO 40,03 %' },
    { name: 'BANK OF SINGAPORE LIMITED', nat: 'F', type: 'IB', positions: 37, top: 'DMMX 13,89 %' },
    { name: 'PERUSAHAAN PERSEROAN (PERSERO) PT. ASABRI', nat: 'L', type: 'IS', positions: 33, top: 'PCAR 26,19 %' },
    { name: 'DJS KETENAGAKERJAAN PROGRAM JAMINAN HARI TUA', nat: 'L', type: 'IS', positions: 31, top: 'LSIP 4,41 %' },
    { name: 'UBS AG SINGAPORE BRANCH', nat: 'F', type: 'IB', positions: 27, top: 'MLPL 16,08 %' },
    { name: 'DBS BANK LTD.', nat: 'F', type: 'IB', positions: 25, top: 'SKYB 9,00 %' },
    { name: 'CGS INTERNATIONAL SECURITIES SINGAPORE PTE LTD', nat: 'F', type: 'IB', positions: 24, top: 'SQMI 22,10 %' },
];

const CONGLO_MOCK = [
    { name: 'Bakrie Group', tickers: ['ENRG', 'BRMS'], description: 'Bakrie Family Conglomerate' },
    { name: 'MNC Group', tickers: ['MNCN', 'BHIT'], description: 'Hary Tanoesoedibjo Group' },
    { name: 'Lippo Group', tickers: ['LPKR', 'MLPL'], description: 'Riady Family Group' },
    { name: 'Salim Group', tickers: ['ICBP', 'INDF'], description: 'Anthony Salim Group' },
    { name: 'Hermanto Tanoko', tickers: ['AVIA', 'CLEO'], description: 'Tanoko Family Group' },
    { name: 'Prajogo Pangestu', tickers: ['BREN', 'BRPT'], description: 'Barito Group' },
];

const CELEB_MOCK = [
    { name: 'GARIBALDI THOHIR', tickers: ['ADRO', 'ADMR', 'AADI'], type: 'Public Figure' },
    { name: 'LO KHENG HONG', tickers: ['BMTR', 'GZCO', 'NISP'], type: 'Value Investor' },
    { name: 'KAESANG PANGAREP', tickers: ['PMMP'], type: 'Public Figure' },
];

export default function DemoDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('tickers');
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
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
            background: '#fff',
            color: '#1e293b',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: isMobile ? '20px 16px 20px 16px' : '40px 20px',
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
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: space-around;
                    padding: 12px 0;
                    margin: 0 -16px;
                    position: sticky;
                    bottom: 0;
                    z-index: 10;
                    box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05);
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
                    border-bottom: 3px solid #3b82f6;
                    border-radius: 0;
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
                            {activeTab === 'tickers' ? 'Tickers: General List' :
                             activeTab === 'investor' ? 'Investor Tab' :
                             activeTab === 'conglomerate' ? (selectedItem ? `Conglomerates - ${selectedItem}` : 'Conglomerates') :
                             activeTab === 'celebrities' ? (selectedItem ? `Finance Celebrities - ${selectedItem}` : 'Finance Celebrities') : 'SAHAMULTIMATE'}
                            <span style={{ fontSize: '10px', background: '#3b82f6', color: '#fff', padding: '1px 6px', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '8px' }}>Version Maret 2026</span>
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
                        <div style={{ fontSize: '13px', opacity: 0.9 }}>
                            {activeTab === 'tickers' ? 'Database utama seluruh saham IHSG untuk analisis kepemilikan whale.' :
                             activeTab === 'investor' ? 'Daftar investor besar (Institusi & HNWI) beserta jumlah kepemilikan dan top holdings mereka.' :
                             activeTab === 'conglomerate' ? 'Analisis kepemilikan saham berdasarkan grup konglomerasi besar di Indonesia.' :
                             activeTab === 'celebrities' ? 'Tracking portofolio dan pergerakan saham tokoh publik serta investor ternama.' : 'Beberapa data disamarkan. Silahkan login untuk detail lengkap.'}
                        </div>
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
                                            <span>{row.shares}</span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700 }}>
                                            <span>{row.percent}</span>
                                        </td>
                                        <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                                            <span>{row.whale}</span>
                                        </td>
                                    </tr>
                                ))}
                                {/* Decorative Blurred Rows to imply more data */}
                                <tr style={{ opacity: 0.6, filter: 'blur(3px)', pointerEvents: 'none', userSelect: 'none' }}>
                                    <td style={{ padding: '16px', fontWeight: 800, color: '#3b82f6' }}>ADRO</td>
                                    {!isMobile && <td style={{ padding: '16px' }}>ADARO ENERGY INDONESIA TBK</td>}
                                    <td style={{ padding: '16px', textAlign: 'right' }}>15,234,567</td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700 }}>15.20%</td>
                                    <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>GARIBALDI THOHIR</td>
                                </tr>
                                {[...Array(3)].map((_, i) => (
                                    <tr key={i} style={{ opacity: 0.15 - (i * 0.03), filter: `blur(${4 + i}px)`, pointerEvents: 'none', userSelect: 'none' }}>
                                        <td style={{ padding: '16px', fontWeight: 800, color: '#3b82f6' }}>XXXX</td>
                                        {!isMobile && <td style={{ padding: '16px' }}>RESTRICTED DATA CONTENT</td>}
                                        <td style={{ padding: '16px', textAlign: 'right' }}>XX,XXX,XXX</td>
                                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700 }}>XX.XX%</td>
                                        <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>PREMIUM ONLY</td>
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
                                            <span>{row.name}</span>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>{row.nat}</td>
                                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700 }}>{row.positions}</td>
                                        <td style={{ padding: '16px', color: '#1e293b' }}>
                                            <span>{row.top}</span>
                                        </td>
                                    </tr>
                                ))}
                                {/* Decorative Blurred Rows */}
                                <tr style={{ opacity: 0.6, filter: 'blur(3px)', pointerEvents: 'none', userSelect: 'none' }}>
                                    <td style={{ padding: '16px', fontWeight: 800, color: '#3b82f6' }}>JPMORGAN CHASE BANK, NA</td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>F</td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700 }}>120</td>
                                    <td style={{ padding: '16px', color: '#1e293b' }}>BBCA 2,10 %</td>
                                </tr>
                                {[...Array(3)].map((_, i) => (
                                    <tr key={i} style={{ opacity: 0.15 - (i * 0.03), filter: `blur(${4 + i}px)`, pointerEvents: 'none', userSelect: 'none' }}>
                                        <td style={{ padding: '16px', fontWeight: 800, color: '#3b82f6' }}>RESTRICTED NAME</td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>?</td>
                                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700 }}>XXX</td>
                                        <td style={{ padding: '16px', color: '#1e293b' }}>LOCKED CONTENT</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'conglomerate' && (
                        <div style={{ padding: '24px', display: 'grid', gap: '16px', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                            {CONGLO_MOCK.map((group, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => setSelectedItem(group.name)}
                                    style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: selectedItem === group.name ? '#eff6ff' : '#f8fafc', cursor: 'pointer', borderLeft: selectedItem === group.name ? '4px solid #3b82f6' : '1px solid #e2e8f0' }}
                                >
                                    <div style={{ fontWeight: 800, fontSize: '16px', color: '#3b82f6', marginBottom: '4px' }}>{group.name}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>{group.description}</div>
                                    {selectedItem === group.name && (
                                        <div style={{ marginTop: '12px', padding: '12px', background: '#fff', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>HOLDINGS (SAMPLE)</div>
                                            <div style={{ display: 'grid', gap: '8px' }}>
                                                {TICKER_MOCK.slice(0, 3).map(t => (
                                                    <div key={t.ticker} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                        <span style={{ fontWeight: 800 }}>{t.ticker}</span>
                                                        <span style={{ filter: 'blur(3px)' }}>{t.percent}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {/* Blurred Group Placeholders */}
                            <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', opacity: 0.4, filter: 'blur(4px)', pointerEvents: 'none' }}>
                                <div style={{ fontWeight: 800, fontSize: '16px', color: '#3b82f6', marginBottom: '4px' }}>Djarum Group</div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>Hartono Family Portfolio</div>
                            </div>
                            <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', opacity: 0.2, filter: 'blur(6px)', pointerEvents: 'none' }}>
                                <div style={{ fontWeight: 800, fontSize: '16px', color: '#3b82f6', marginBottom: '4px' }}>Sinar Mas Group</div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>Widjaja Family Portfolio</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'celebrities' && (
                        <div style={{ padding: '24px', display: 'grid', gap: '16px', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                            {CELEB_MOCK.map((group, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => setSelectedItem(group.name)}
                                    style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: selectedItem === group.name ? '#fdf2f8' : '#f8fafc', cursor: 'pointer', borderLeft: selectedItem === group.name ? '4px solid #db2777' : '1px solid #e2e8f0' }}
                                >
                                    <div style={{ fontWeight: 800, fontSize: '16px', color: '#db2777', marginBottom: '4px' }}>{group.name}</div>
                                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>{group.type}</div>
                                    {selectedItem === group.name && (
                                        <div style={{ marginTop: '12px', padding: '12px', background: '#fff', borderRadius: '8px', border: '1px solid #fce7f3' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px' }}>WHALE PORTFOLIO (SAMPLE)</div>
                                            <div style={{ display: 'grid', gap: '8px' }}>
                                                {TICKER_MOCK.slice(4, 7).map(t => (
                                                    <div key={t.ticker} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                                        <span style={{ fontWeight: 800 }}>{t.ticker}</span>
                                                        <span style={{ filter: 'blur(3px)' }}>{t.percent}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {/* Blurred Celeb Placeholders */}
                            <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fdf2f8', opacity: 0.4, filter: 'blur(4px)', pointerEvents: 'none' }}>
                                <div style={{ fontWeight: 800, fontSize: '16px', color: '#db2777', marginBottom: '4px' }}>SANDIAGA UNO</div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>Public Figure</div>
                            </div>
                            <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fdf2f8', opacity: 0.2, filter: 'blur(6px)', pointerEvents: 'none' }}>
                                <div style={{ fontWeight: 800, fontSize: '16px', color: '#db2777', marginBottom: '4px' }}>HARRY TANOE</div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>Public Figure</div>
                            </div>
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
