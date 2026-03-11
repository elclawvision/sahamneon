import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface MockRow {
    ticker: string;
    issuer: string;
    shares: number;
    percent: number;
    whale: string;
}

const MOCK_DATA: MockRow[] = [
    { ticker: 'BBCA', issuer: 'PT Bank Central Asia Tbk', shares: 67891234567, percent: 54.91, whale: 'PT Dwimuria Investama Andalan' },
    { ticker: 'BBRI', issuer: 'PT Bank Rakyat Indonesia (Persero) Tbk', shares: 81234567890, percent: 53.19, whale: 'Negara Republik Indonesia' },
    { ticker: 'TLKM', issuer: 'PT Telkom Indonesia (Persero) Tbk', shares: 51234567890, percent: 52.09, whale: 'Negara Republik Indonesia' },
    { ticker: 'BYAN', issuer: 'PT Bayan Resources Tbk', shares: 20345678901, percent: 60.91, whale: 'Low Tuck Kwong' },
    { ticker: 'ASII', issuer: 'PT Astra International Tbk', shares: 20234567890, percent: 50.11, whale: 'Jardine Cycle & Carriage Ltd' },
];

export default function DemoDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('tickers');

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            color: '#1e293b',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '20px'
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
            `}</style>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                        SAHAM<span style={{ color: '#3b82f6' }}>ULTIMATE</span> <span style={{ fontSize: '12px', background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '4px', verticalAlign: 'middle', marginLeft: '8px' }}>DEMO</span>
                    </div>
                    <button 
                        onClick={() => navigate('/auth')}
                        style={{ padding: '8px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                    >
                        Login Full Access
                    </button>
                </header>

                {/* Banner */}
                <div className="demo-banner">
                    <div>
                        <div style={{ fontWeight: 800, fontSize: '18px' }}>Mode Demo Terbatas</div>
                        <div style={{ fontSize: '14px', opacity: 0.9 }}>Beberapa data disamarkan. Silahkan login untuk detail lengkap & fitur ekspor.</div>
                    </div>
                    <button 
                        onClick={() => navigate('/auth')}
                        style={{ background: '#fff', color: '#3b82f6', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}
                    >
                        Buka Semua Data
                    </button>
                </div>

                {/* Main Table Title */}
                <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>🐋 Whale Tracker</h2>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>H+1 KSEI Reporting Data</span>
                </div>

                {/* Mock Table */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '16px', fontWeight: 700, color: '#475569' }}>TICKER</th>
                                <th style={{ padding: '16px', fontWeight: 700, color: '#475569' }}>ISSUER NAME</th>
                                <th style={{ padding: '16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>SHARES</th>
                                <th style={{ padding: '16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>PERCENT</th>
                                <th style={{ padding: '16px', fontWeight: 700, color: '#475569' }}>TOP HOLDER</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_DATA.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px', fontWeight: 800, color: '#3b82f6' }}>{row.ticker}</td>
                                    <td style={{ padding: '16px', color: '#1e293b', fontSize: '14px' }}>{row.issuer}</td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <span className="censored">CENSORED</span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700 }}>
                                        <span className="blur-text">{row.percent.toFixed(2)}%</span>
                                    </td>
                                    <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                                        {i === 0 ? row.whale : <span className="censored" style={{ minWidth: '120px' }}>LOG IN TO SEE</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                    © 2026 Saham Ultimate • Versi Demo • Data Real H+1 Terkunci
                </div>
            </div>
        </div>
    );
}
