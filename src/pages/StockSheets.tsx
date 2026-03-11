import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import StockTable from '../components/StockTable';
import { getAllTickers, getFreeFloatData, getInvestorTabData } from '../data/stockData';
import { conglomerates } from '../data/conglomerates';
import { StockRow, InvestorRow } from '../types/stock';

const StockSheets: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'all' | 'float' | 'investor' | 'conglomerate'>('all');
    const [floatFilter, setFloatFilter] = useState<'all' | 'low' | 'below15' | 'mid' | 'high'>('all');
    const [selectedConglo, setSelectedConglo] = useState<string | null>(null);
    const navigate = useNavigate();

    const allStocks = getAllTickers();

    const tabs = [
        { id: 'all', label: 'All Tickers', data: allStocks },
        { id: 'float', label: 'Free Float Screener', data: getFreeFloatData() },
        { id: 'investor', label: 'Investor Tab', data: getInvestorTabData() },
        { id: 'conglomerate', label: 'Conglomerates', data: [] }
    ];

    const activeData = useMemo(() => {
        if (activeTab === 'all') return allStocks;
        if (activeTab === 'float') {
            const data = getFreeFloatData();
            if (floatFilter === 'all') return data;
            return data.filter(item => {
                const f = item.free_float;
                if (floatFilter === 'low') return f < 5;
                if (floatFilter === 'below15') return f < 15;
                if (floatFilter === 'mid') return f >= 15 && f <= 50;
                if (floatFilter === 'high') return f > 50;
                return true;
            });
        }
        if (activeTab === 'investor') return getInvestorTabData();
        if (activeTab === 'conglomerate') {
            if (!selectedConglo) return [];
            const conglo = conglomerates.find(c => c.name === selectedConglo);
            if (!conglo) return [];
            return allStocks.filter(s => conglo.tickers.includes(s.ticker.toUpperCase()));
        }
        return [];
    }, [activeTab, floatFilter, selectedConglo, allStocks]);

    const stockColumns = [
        { key: 'ticker' as keyof StockRow, label: 'TICKER' },
        { key: 'holders_count' as keyof StockRow, label: 'HOLDERS' },
        { key: 'top_holder' as keyof StockRow, label: 'TOP HOLDER' },
        { key: 'top_pct' as keyof StockRow, label: 'TOP %', render: (v: number) => `${v.toFixed(2)}%` },
        { 
            key: 'local_pct' as keyof StockRow, 
            label: 'LOCAL %', 
            render: (v: number) => `${v.toFixed(2)}%`,
            hidden: activeTab === 'float'
        },
        { 
            key: 'foreign_pct' as keyof StockRow, 
            label: 'FOREIGN %', 
            render: (v: number) => `${v.toFixed(2)}%`,
            hidden: activeTab === 'float'
        },
        { 
            key: 'free_float' as keyof StockRow, 
            label: activeTab === 'float' ? 'EST. FREE FLOAT ↑' : 'FREE FLOAT', 
            render: (v: number, row: StockRow) => (
                <span style={{ color: row.has_warning ? '#fbbf24' : '#f8fafc' }}>
                    {v.toFixed(2)}% {row.has_warning && '⚠️'}
                </span>
            )
        },
    ].filter(c => !c.hidden);

    const investorColumns = [
        { key: 'investor' as keyof InvestorRow, label: 'INVESTOR' },
        { key: 'type' as keyof InvestorRow, label: 'TYPE' },
        { key: 'nat' as keyof InvestorRow, label: 'NAT' },
        { key: 'positions' as keyof InvestorRow, label: 'POSITIONS' },
        { key: 'top_holding' as keyof InvestorRow, label: 'TOP HOLDING' },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '40px 20px'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
                        📊 Stock Data Sheets
                    </h1>
                    <button
                        onClick={() => navigate('/saham')}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: '#fff',
                            padding: '10px 20px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                    >
                        Dashboard
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                                color: activeTab === tab.id ? '#fff' : '#94a3b8',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}>
                    <div style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
                            {activeTab === 'conglomerate' && !selectedConglo ? 'Select a conglomerate group below' : `Showing ${activeData.length} records processed per latest KSEI recordings.`}
                        </p>
                    </div>

                    {activeTab === 'float' && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                            {[
                                { id: 'all', label: 'All Float' },
                                { id: 'low', label: 'Low Float (<5%)' },
                                { id: 'below15', label: 'Below 15% (Regulatory Risk)' },
                                { id: 'mid', label: 'Mid Float (15-50%)' },
                                { id: 'high', label: 'High Float (>50%)' }
                            ].map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => setFloatFilter(option.id as any)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: floatFilter === option.id ? 'rgba(59,130,246,0.2)' : 'transparent',
                                        color: floatFilter === option.id ? '#60a5fa' : '#94a3b8',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        borderColor: floatFilter === option.id ? '#3b82f6' : 'rgba(255,255,255,0.1)'
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'conglomerate' && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                            {conglomerates.map(conglo => (
                                <button
                                    key={conglo.name}
                                    onClick={() => setSelectedConglo(conglo.name)}
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '10px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        background: selectedConglo === conglo.name ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
                                        color: selectedConglo === conglo.name ? '#60a5fa' : '#f8fafc',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        borderColor: selectedConglo === conglo.name ? '#3b82f6' : 'transparent'
                                    }}
                                >
                                    {conglo.name}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'investor' ? (
                        <StockTable<InvestorRow>
                            data={activeData as any as InvestorRow[]}
                            title="Investor Tab"
                            columns={investorColumns}
                            rowKey={(row) => row.investor}
                            initialSort={{ key: 'positions', direction: 'desc' }}
                        />
                    ) : (activeTab === 'conglomerate' && !selectedConglo) ? (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                            Please select a conglomerate group from the list above.
                        </div>
                    ) : (
                        <StockTable<StockRow>
                            data={activeData as any as StockRow[]}
                            title={tabs.find(t => t.id === activeTab)?.label || ''}
                            columns={stockColumns}
                            rowKey={(row) => row.ticker}
                            initialSort={{ key: 'ticker', direction: 'asc' }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default StockSheets;
