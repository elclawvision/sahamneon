import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface StockData {
    ticker: string;
    name: string;
    top_holder_name: string;
    top_holder_pct: number;
    est_free_float: number;
    holders_count: number;
}

const FreeFloatScreener: React.FC = () => {
    const [stocks, setStocks] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>('all');
    const [sortConfig, setSortConfig] = useState<{ key: keyof StockData, direction: 'asc' | 'desc' } | null>({ key: 'est_free_float', direction: 'asc' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchStocks();
    }, []);

    const fetchStocks = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('saham_tab_tickers')
            .select('ticker, company_name, top_holder_name, top_holder_pct, est_free_float, holders_count');

        if (error) {
            console.error('Error fetching stocks:', error);
        } else if (data) {
            const mapped = data.map((d: any) => ({
                ticker: d.ticker,
                name: d.company_name,
                top_holder_name: d.top_holder_name || '-',
                top_holder_pct: d.top_holder_pct || 0,
                est_free_float: d.est_free_float || 0,
                holders_count: d.holders_count || 0
            }));
            setStocks(mapped);
        }
        setLoading(false);
    };

    const filteredStocks = useMemo(() => {
        let result = [...stocks];
        if (filter === 'low') result = result.filter(s => s.est_free_float < 5);
        else if (filter === 'reg') result = result.filter(s => s.est_free_float < 15);
        else if (filter === 'mid') result = result.filter(s => s.est_free_float >= 15 && s.est_free_float <= 50);
        else if (filter === 'high') result = result.filter(s => s.est_free_float > 50);

        if (sortConfig) {
            result.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [stocks, filter, sortConfig]);

    const requestSort = (key: keyof StockData) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const FilterButton = ({ id, label }: { id: string, label: string }) => (
        <button
            onClick={() => setFilter(id)}
            style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: filter === id ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            {label}
        </button>
    );

    return (
        <div style={{
            minHeight: '100vh',
            background: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '40px 20px'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                        🏷️ Free Float Screener
                    </h1>
                    <button
                        onClick={() => navigate('/saham')}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            color: '#fff',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Kembali ke Dashboard
                    </button>
                </div>

                <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
                    Screen stocks by estimated free float · MSCI Methodology
                </p>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', flexWrap: 'wrap' }}>
                    <FilterButton id="low" label="Low Float (<5%)" />
                    <FilterButton id="reg" label="Below 15% (Regulatory Risk)" />
                    <FilterButton id="mid" label="Mid Float (15-50%)" />
                    <FilterButton id="high" label="High Float (>50%)" />
                    <FilterButton id="all" label="All Tickers" />
                </div>

                <div style={{
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    padding: '16px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    marginBottom: '24px',
                    fontSize: '13px',
                    color: '#cbd5e1'
                }}>
                    ℹ️ {filteredStocks.length} tickers · Strategic holders (CP/IB/FD/OT + affiliated individuals) excluded from float · <span style={{ color: '#3b82f6', cursor: 'pointer' }}>Learn more</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th onClick={() => requestSort('ticker')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#94a3b8' }}>TICKER {sortConfig?.key === 'ticker' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                <th onClick={() => requestSort('top_holder_name')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#94a3b8' }}>TOP HOLDER ({'>'}1%) {sortConfig?.key === 'top_holder_name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                <th onClick={() => requestSort('top_holder_pct')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#94a3b8' }}>TOTAL HELD {sortConfig?.key === 'top_holder_pct' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                <th onClick={() => requestSort('est_free_float')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#94a3b8' }}>EST. FREE FLOAT {sortConfig?.key === 'est_free_float' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                                <th onClick={() => requestSort('holders_count')} style={{ padding: '12px 16px', cursor: 'pointer', color: '#94a3b8' }}>HOLDERS ({'>'}1%) {sortConfig?.key === 'holders_count' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading data...</td>
                                </tr>
                            ) : filteredStocks.map((stock) => (
                                <tr key={stock.ticker} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="table-row">
                                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>{stock.ticker}</td>
                                    <td style={{ padding: '12px 16px', color: '#e2e8f0' }}>{stock.top_holder_name}</td>
                                    <td style={{ padding: '12px 16px', color: '#e2e8f0' }}>{stock.top_holder_pct.toFixed(1)}%</td>
                                    <td style={{ padding: '12px 16px', color: stock.est_free_float < 15 ? '#fbbf24' : '#fff' }}>
                                        {stock.est_free_float.toFixed(2)}% {stock.est_free_float < 15 && '⚠️'}
                                    </td>
                                    <td style={{ padding: '12px 16px', color: '#e2e8f0' }}>{stock.holders_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <style>{`
        .table-row:hover {
          background: rgba(255,255,255,0.03);
        }
      `}</style>
        </div>
    );
};

export default FreeFloatScreener;
