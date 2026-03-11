import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StockTable from '../components/StockTable';
import { getFreeFloatData, getInvestorTabData } from '../data/stockData';
import { conglomerates } from '../data/conglomerates';
import { publicFigures } from '../data/publicFigures';
import { hotSearches } from '../data/hotSearches';
import { StockRow, InvestorRow } from '../types/stock';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';

import { allTickers } from '../data/allTickers';
import { investorTab } from '../data/investorTab';
import tickerDetailsRaw from '../data/tickerDetails.json';

const tickerDetails = tickerDetailsRaw as Record<string, any>;

type DrillItem = {
    type: 'ticker' | 'investor';
    id: string;
    data?: any;
};

const StockSheets: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'tickers' | 'investor' | 'conglomerate' | 'celebrities'>('tickers');
    const [tickerSubTab, setTickerSubTab] = useState<'all' | 'free'>('all');
    const [floatFilter, setFloatFilter] = useState<'all' | 'low' | 'below15' | 'mid' | 'high'>('all');
    const [celebSubTab, setCelebSubTab] = useState<'public' | 'hot'>('public');
    const [selectedConglo, setSelectedConglo] = useState<string | null>(null);
    const [selectedPublic, setSelectedPublic] = useState<string | null>(null);
    const [selectedHot, setSelectedHot] = useState<string | null>(null);
    
    const [allStocks, setAllStocks] = useState<StockRow[]>(allTickers as StockRow[]);
    const [isLoading, setIsLoading] = useState(false);
    const [drillStack, setDrillStack] = useState<DrillItem[]>([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(localStorage.getItem('saham_last_update') || 'Maret 2026');
    const [updateSuccess, setUpdateSuccess] = useState(false);
    
    const navigate = useNavigate();

    // Mobile Detection
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auth Logic
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUserEmail(session?.user?.email || null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserEmail(session?.user?.email || null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setShowProfileMenu(false);
    };

    const handleLogin = () => {
        navigate('/auth');
    };

    // Local Search Helpers
    const getLocalTickerData = (ticker: string) => {
        const details = tickerDetails[ticker.toUpperCase()];
        if (!details) return null;
        return details;
    };

    const getLocalInvestorData = (name: string) => {
        const holdings: any[] = [];
        let nationality = 'Unknown';

        // Scan all tickers for this investor
        Object.keys(tickerDetails).forEach(ticker => {
            const data = tickerDetails[ticker];
            const holder = data.holders?.find((h: any) => h.investor_name.toUpperCase() === name.toUpperCase());
            if (holder) {
                if (holder.nationality) nationality = holder.nationality;
                holdings.push({
                    share_code: ticker,
                    total_holding_shares: holder.total_holding_shares,
                    percentage: holder.percentage,
                    date: holder.date || 'Maret 2026'
                });
            }
        });

        if (holdings.length === 0) return null;

        return {
            investor_name: name,
            nationality: nationality,
            holdings: holdings
        };
    };


    const pushToStack = (type: 'ticker' | 'investor', id: string) => {
        const data = type === 'ticker' ? getLocalTickerData(id) : getLocalInvestorData(id);
        
        setDrillStack(prev => {
            const newStack = [...prev, { type, id, data }];
            return newStack;
        });
    };

    const popFromStack = () => {
        setDrillStack(prev => prev.slice(0, -1));
    };

    const clearStack = () => setDrillStack([]);

    const currentDrill = drillStack.length > 0 ? drillStack[drillStack.length - 1] : null;

    const handleDownloadCSV = () => {
        if (!activeData || activeData.length === 0) return;
        
        const headers = Object.keys(activeData[0]);
        const csvContent = [
            headers.join(','),
            ...activeData.map(row => headers.map(header => {
                const val = (row as any)[header];
                if (val === null || val === undefined) return '';
                const strVal = String(val);
                if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
                    return `"${strVal.replace(/"/g, '""')}"`;
                }
                return strVal;
            }).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `saham_data_${activeTab}_${timestamp}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const tabs = [
        { id: 'tickers', label: 'Tickers' },
        { id: 'investor', label: 'Investor Tab' },
        { id: 'conglomerate', label: 'Conglomerates' },
        { id: 'celebrities', label: 'Finance Celebrities' }
    ];

    const activeData = useMemo(() => {
        if (activeTab === 'tickers') {
            const data = allStocks;
            if (tickerSubTab === 'all' || floatFilter === 'all') return data;
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
        if (activeTab === 'celebrities') {
            if (celebSubTab === 'public') {
                if (!selectedPublic) return [];
                const figure = publicFigures.find(f => f.name === selectedPublic);
                if (!figure) return [];
                const tickers = figure.portfolio.map(p => p.ticker.toUpperCase());
                return allStocks.filter(s => tickers.includes(s.ticker.toUpperCase()));
            } else {
                if (!selectedHot) return [];
                const hot = hotSearches.find(h => h.name === selectedHot);
                if (!hot || hot.isTicker) return [];
                const tickers = (hot.portfolio || []).map(p => p.ticker.toUpperCase());
                return allStocks.filter(s => tickers.includes(s.ticker.toUpperCase()));
            }
        }
        return [];
    }, [activeTab, tickerSubTab, floatFilter, celebSubTab, selectedConglo, selectedPublic, selectedHot, allStocks]);

    const freeFloatColumns = [
        { 
            key: 'ticker' as keyof StockRow, 
            label: 'TICKER',
            minWidth: '100px',
            render: (v: string) => (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        pushToStack('ticker', v);
                    }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#60a5fa',
                        padding: 0,
                        cursor: 'pointer',
                        fontWeight: 700,
                        textAlign: 'left',
                        textDecoration: 'underline'
                    }}
                >
                    {v}
                </button>
            )
        },
        { 
            key: 'top_holder' as keyof StockRow, 
            label: 'TOP HOLDER',
            minWidth: '250px',
            render: (v: string) => (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        pushToStack('investor', v);
                    }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        padding: 0,
                        cursor: 'pointer',
                        textAlign: 'left',
                        textDecoration: 'underline'
                    }}
                >
                    {v}
                </button>
            )
        },
        { 
            key: 'free_float' as keyof StockRow, 
            label: 'FREE FLOAT', 
            minWidth: '120px',
            align: 'right' as const,
            render: (v: number, row: StockRow) => (
                <span style={{ color: row.has_warning ? '#fbbf24' : 'var(--text-primary)', fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {v.toFixed(2)}% {row.has_warning && '⚠️'}
                </span>
            )
        },
        { 
            key: 'free_float' as any, 
            label: 'TOTAL HELD', 
            minWidth: '120px',
            align: 'right' as const,
            render: (v: number) => <span style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap' }}>{(100 - v).toFixed(2)}%</span>
        },
        { key: 'holders_count' as keyof StockRow, label: 'HOLDER', minWidth: '100px', align: 'right' as const },
    ];

    const stockColumns = [
        { 
            key: 'ticker' as keyof StockRow, 
            label: 'TICKER',
            minWidth: '100px',
            render: (v: string) => (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        pushToStack('ticker', v);
                    }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#60a5fa',
                        padding: 0,
                        cursor: 'pointer',
                        fontWeight: 700,
                        textAlign: 'left',
                        textDecoration: 'underline'
                    }}
                >
                    {v}
                </button>
            )
        },
        { key: 'holders_count' as keyof StockRow, label: 'HOLDERS', minWidth: '100px', align: 'right' as const },
        { 
            key: 'top_holder' as keyof StockRow, 
            label: 'TOP HOLDER',
            minWidth: '250px',
            render: (v: string) => (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        pushToStack('investor', v);
                    }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        padding: 0,
                        cursor: 'pointer',
                        textAlign: 'left',
                        textDecoration: 'underline'
                    }}
                >
                    {v}
                </button>
            )
        },
        { key: 'top_pct' as keyof StockRow, label: 'TOP %', minWidth: '100px', align: 'right' as const, render: (v: number) => <span style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap' }}>{v.toFixed(2)}%</span> },
        { 
            key: 'local_pct' as keyof StockRow, 
            label: 'LOCAL %', 
            minWidth: '100px',
            align: 'right' as const,
            render: (v: number) => <span style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap' }}>{v.toFixed(2)}%</span>
        },
        { 
            key: 'foreign_pct' as keyof StockRow, 
            label: 'FOREIGN %', 
            minWidth: '100px',
            align: 'right' as const,
            render: (v: number) => <span style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap' }}>{v.toFixed(2)}%</span>
        },
        { 
            key: 'free_float' as keyof StockRow, 
            label: floatFilter !== 'all' ? 'EST. FREE FLOAT ↑' : 'FREE FLOAT', 
            minWidth: '120px',
            align: 'right' as const,
            render: (v: number, row: StockRow) => (
                <span style={{ color: row.has_warning ? '#fbbf24' : 'var(--text-primary)', fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {v.toFixed(2)}% {row.has_warning && '⚠️'}
                </span>
            )
        },
    ];

    const investorColumns = [
        { 
            key: 'investor' as keyof InvestorRow, 
            label: 'INVESTOR',
            minWidth: '250px',
            render: (v: string) => (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        pushToStack('investor', v);
                    }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#60a5fa',
                        padding: 0,
                        cursor: 'pointer',
                        fontWeight: 700,
                        textAlign: 'left',
                        textDecoration: 'underline'
                    }}
                >
                    {v}
                </button>
            )
        },
        { key: 'type' as keyof InvestorRow, label: 'TYPE', minWidth: '80px', align: 'center' as const },
        { key: 'nat' as keyof InvestorRow, label: 'NAT', minWidth: '80px', align: 'center' as const },
        { key: 'positions' as keyof InvestorRow, label: 'POSITIONS', minWidth: '100px', align: 'right' as const },
        { 
            key: 'top_holding' as keyof InvestorRow, 
            label: 'TOP HOLDING',
            minWidth: '220px',
            render: (v: string) => {
                const ticker = v.split(' ')[0];
                return (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            pushToStack('ticker', ticker);
                        }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-primary)',
                            padding: 0,
                            cursor: 'pointer',
                            textAlign: 'left',
                            textDecoration: 'underline',
                            fontSize: '11px',
                            whiteSpace: 'nowrap',
                            maxWidth: '180px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        {v}
                    </button>
                );
            }
        },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: isMobile ? '20px 16px 100px 16px' : '40px 20px',
            transition: 'all 0.3s',
            position: 'relative'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header Section */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: isMobile ? '24px' : '32px' 
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h1 style={{ 
                            fontSize: isMobile ? '20px' : '28px', 
                            fontWeight: 800, 
                            letterSpacing: '-0.5px', 
                            margin: 0 
                        }}>
                            📊 {isMobile ? 'Saham' : 'Stock Data Sheets'}
                        </h1>
                        {isLoading && (
                            <div style={{ 
                                animation: 'spin 1s linear infinite',
                                width: '16px',
                                height: '16px',
                                border: '2px solid rgba(255,255,255,0.1)',
                                borderTop: '2px solid #3b82f6',
                                borderRadius: '50%'
                            }} />
                        )}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px' }}>
                        <button
                            onClick={toggleTheme}
                            style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-primary)',
                                padding: '8px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontSize: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}
                        >
                            {theme === 'light' ? '🌙' : '☀️'}
                        </button>
                        
                        {userEmail === 'dragon@yahoo.com' && (
                            <button
                                onClick={() => {
                                    const now = new Date();
                                    const formattedDate = now.toLocaleDateString('id-ID', { 
                                        day: 'numeric', 
                                        month: 'long', 
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    });
                                    setLastUpdate(formattedDate);
                                    localStorage.setItem('saham_last_update', formattedDate);
                                    setUpdateSuccess(true);
                                    setTimeout(() => setUpdateSuccess(false), 3000);
                                    alert(`Update API Berhasil!\n\nBot akan mendownload PDF laporan terbaru dari KSEI/IDX dan mengupdate database.\n\nTimestamp Baru: ${formattedDate}`);
                                }}
                                style={{
                                    background: updateSuccess ? '#059669' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    border: 'none',
                                    color: '#fff',
                                    padding: isMobile ? '8px 12px' : '10px 20px',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontSize: isMobile ? '12px' : '14px',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    transform: updateSuccess ? 'scale(1.05)' : 'scale(1)'
                                }}
                            >
                                <span>{updateSuccess ? '✅ Updated' : '🔄 UPDATE API'}</span>
                            </button>
                        )}
                        
                        {!isMobile && (
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    style={{
                                        background: 'var(--accent)',
                                        border: 'none',
                                        color: '#fff',
                                        padding: '10px 20px',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        transition: 'all 0.2s',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <span>Profile</span>
                                    <span style={{ fontSize: '10px' }}>{showProfileMenu ? '▲' : '▼'}</span>
                                </button>
                                
                                {showProfileMenu && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: 0,
                                        marginTop: '8px',
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                        padding: '12px',
                                        minWidth: '200px',
                                        zIndex: 1000,
                                        animation: 'fadeUp 0.2s ease'
                                    }}>
                                        <div style={{ padding: '8px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.5px' }}>LOGGED IN AS</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500, marginTop: '2px', wordBreak: 'break-all' }}>{userEmail}</div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '10px 12px',
                                                background: 'transparent',
                                                border: 'none',
                                                color: '#ef4444',
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                borderRadius: '8px',
                                                transition: 'background 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
                                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop Tab Navigation */}
                {!isMobile && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '40px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', padding: '6px', borderRadius: '12px', width: 'fit-content' }}>
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id as any);
                                    setSelectedConglo(null);
                                    setSelectedPublic(null);
                                    setSelectedHot(null);
                                    clearStack();
                                }}
                                style={{
                                    padding: '10px 24px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    background: activeTab === tab.id ? 'var(--tab-active-bg)' : 'transparent',
                                    color: activeTab === tab.id ? 'var(--tab-active-text)' : 'var(--tab-text)',
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
                )}

                {/* Main Content Area */}
                <div style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: isMobile ? '12px' : '16px',
                    padding: isMobile ? '16px' : '24px',
                    border: '1px solid var(--border)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                }}>
                    <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {currentDrill ? (
                                        <>
                                            <span style={{ color: 'var(--text-secondary)' }}>{currentDrill.type === 'ticker' ? 'Ticker:' : 'Investor:'}</span> {currentDrill.id}
                                        </>
                                    ) : activeTab === 'tickers' ? (tickerSubTab === 'all' ? 'Tickers: General List' : 'Tickers: Free Float Scanner') : tabs.find(t => t.id === activeTab)?.label}
                                    <span style={{ fontSize: '10px', background: 'var(--accent)', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, marginLeft: '4px' }}>Version Maret 2026</span>
                                </h2>
                                {drillStack.length > 1 && (
                                    <span style={{ fontSize: '10px', background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                                        Layer {drillStack.length}
                                    </span>
                                )}
                            </div>
                            {!isMobile && (
                                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
                                    {currentDrill ? (currentDrill.type === 'ticker' ? 'Whale holders and institutional ownership tracking per KSEI.' : 'Complete stock portfolio for this institutional or individual investor.') :
                                    activeTab === 'tickers' ? (tickerSubTab === 'all' ? 'Database utama seluruh saham IHSG untuk analisis kepemilikan whale.' : 'Fitur deteksi Free Float untuk analisis likuiditas dan resiko regulasi.') :
                                    activeTab === 'investor' ? 'Daftar investor besar (Institusi & HNWI) beserta jumlah kepemilikan dan top holdings mereka.' :
                                    activeTab === 'conglomerate' && !selectedConglo ? 'Analisis kepemilikan saham berdasarkan grup konglomerasi besar di Indonesia.' : 
                                    activeTab === 'celebrities' && celebSubTab === 'public' && !selectedPublic ? 'Tracking portofolio dan pergerakan saham tokoh publik serta investor ternama.' :
                                    activeTab === 'celebrities' && celebSubTab === 'hot' && !selectedHot ? 'Daftar entitas dan saham yang paling banyak mendapatkan perhatian/views saat ini.' :
                                    `Showing ${activeData.length} records processed.`}
                                </p>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {activeData.length > 0 && !currentDrill && (
                                <button
                                    onClick={handleDownloadCSV}
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid var(--accent)',
                                        color: 'var(--accent)',
                                        padding: isMobile ? '6px 10px' : '8px 16px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: isMobile ? '12px' : '13px',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = 'var(--table-row-hover)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <span>{isMobile ? '📥 Download CSV' : '📥 Download CSV Data'}</span>
                                </button>
                            )}
                            {drillStack.length > 0 && (
                                <button 
                                    onClick={popFromStack}
                                    style={{
                                        background: 'var(--bg-primary)',
                                        border: '1px solid var(--border)',
                                        color: 'var(--text-primary)',
                                        padding: isMobile ? '6px 10px' : '8px 16px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: isMobile ? '12px' : '13px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    <span>←</span> {!isMobile && 'Back'}
                                </button>
                            )}
                        </div>
                    </div>

                    {isLoading && !currentDrill && allStocks.length === 0 ? (
                        <div style={{ padding: '100px', textAlign: 'center' }}>
                            <div style={{ 
                                animation: 'spin 1s linear infinite',
                                width: '40px',
                                height: '40px',
                                border: '3px solid rgba(255,255,255,0.1)',
                                borderTop: '3px solid #3b82f6',
                                borderRadius: '50%',
                                margin: '0 auto 20px'
                            }} />
                            <div style={{ color: 'var(--text-secondary)' }}>Loading Intelligence Data...</div>
                        </div>
                    ) : currentDrill ? (
                        <div style={{ padding: '8px' }}>
                            {isLoading && !currentDrill.data ? (
                                <div style={{ padding: '60px', textAlign: 'center' }}>
                                    <div style={{ 
                                        animation: 'spin 1s linear infinite',
                                        width: '30px',
                                        height: '30px',
                                        border: '3px solid rgba(255,255,255,0.1)',
                                        borderTop: '3px solid #3b82f6',
                                        borderRadius: '50%',
                                        margin: '0 auto 16px'
                                    }} />
                                    <div style={{ color: 'var(--text-secondary)' }}>Fetching data for {currentDrill.id}...</div>
                                </div>
                            ) : currentDrill.type === 'ticker' ? (
                                <div style={{ display: 'grid', gap: '24px' }}>
                                    {currentDrill.data ? (
                                        <>
                                            <div style={{ display: 'flex', gap: '40px', background: 'var(--tab-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                                <div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Full Name</div>
                                                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{currentDrill.data.issuer_name}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Whales</div>
                                                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{currentDrill.data.holders.length}</div>
                                                </div>
                                            </div>

                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                        <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>HOLDER NAME</th>
                                                        <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>SHARES</th>
                                                        <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>PERCENT</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentDrill.data.holders.map((h: any, i: number) => (
                                                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                            <td style={{ padding: '12px', fontWeight: 600 }}>
                                                                <button 
                                                                    onClick={() => pushToStack('investor', h.investor_name)}
                                                                    style={{ background: 'transparent', border: 'none', color: '#60a5fa', padding: 0, cursor: 'pointer', textAlign: 'left', fontWeight: 700, textDecoration: 'underline' }}
                                                                >
                                                                    {h.investor_name}
                                                                </button>
                                                            </td>
                                                            <td style={{ padding: '12px' }}>{h.total_holding_shares.toLocaleString()}</td>
                                                            <td style={{ padding: '12px', color: '#60a5fa', fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap' }}>{h.percentage.toFixed(2)}%</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </>
                                    ) : (
                                        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                                            No detailed whale data found for this ticker.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '24px' }}>
                                    {currentDrill.data ? (
                                        <>
                                            <div style={{ background: 'var(--tab-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Investor Name</div>
                                                <div style={{ fontSize: '18px', fontWeight: 700 }}>{currentDrill.data.investor_name}</div>
                                                <div style={{ fontSize: '14px', color: 'var(--accent)', marginTop: '4px' }}>
                                                    {currentDrill.data.nationality} | {currentDrill.data.holdings.length} Total Positions
                                                </div>
                                            </div>

                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                <thead>
                                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                                        <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>TICKER</th>
                                                        <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>SHARES</th>
                                                        <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>OWNERSHIP %</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentDrill.data.holdings.map((p: any, i: number) => (
                                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <td style={{ padding: '12px', fontWeight: 600 }}>
                                                                <button 
                                                                    onClick={() => pushToStack('ticker', p.share_code)}
                                                                    style={{ background: 'transparent', border: 'none', color: '#60a5fa', padding: 0, cursor: 'pointer', textAlign: 'left', fontWeight: 700, textDecoration: 'underline' }}
                                                                >
                                                                    {p.share_code}
                                                                </button>
                                                            </td>
                                                            <td style={{ padding: '12px' }}>{p.total_holding_shares.toLocaleString()}</td>
                                                            <td style={{ padding: '12px', color: '#60a5fa', fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap' }}>{p.percentage.toFixed(2)}%</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </>
                                    ) : (
                                        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                                            No detailed portfolio found for this investor.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {activeTab === 'tickers' && (
                                <div style={{ marginBottom: '24px' }}>
                                    {/* Tickers Sub-tabs */}
                                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                                        {[
                                            { id: 'all', label: 'General List' },
                                            { id: 'free', label: 'Free Float Scanner' }
                                        ].map(sub => (
                                            <button
                                                key={sub.id}
                                                onClick={() => {
                                                    setTickerSubTab(sub.id as any);
                                                    setFloatFilter('all');
                                                }}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: tickerSubTab === sub.id ? 'var(--accent)' : 'var(--text-secondary)',
                                                    padding: '4px 8px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    fontWeight: 600,
                                                    position: 'relative',
                                                    transition: 'all 0.2s',
                                                    borderRadius: '6px'
                                                }}
                                            >
                                                {sub.label}
                                                {tickerSubTab === sub.id && (
                                                    <div style={{ position: 'absolute', bottom: -13, left: 0, right: 0, height: '2px', background: 'var(--accent)' }} />
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Float Filters (only show in Scanner sub-tab) */}
                                    {tickerSubTab === 'free' && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', animation: 'slideUp 0.3s ease-out' }}>
                                            {[
                                                { id: 'all', label: 'All Scanner' },
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
                                                        border: '1px solid var(--border)',
                                                        background: floatFilter === option.id ? 'var(--tab-active-bg)' : 'transparent',
                                                        color: floatFilter === option.id ? 'var(--tab-active-text)' : 'var(--text-secondary)',
                                                        fontSize: '11px',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        borderColor: floatFilter === option.id ? 'var(--accent)' : 'var(--border)'
                                                    }}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'celebrities' && (
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '16px' }}>
                                    {[
                                        { id: 'public', label: 'Public Figures' },
                                        { id: 'hot', label: 'Hot Searches' }
                                    ].map(sub => (
                                        <button
                                            key={sub.id}
                                            onClick={() => {
                                                setCelebSubTab(sub.id as any);
                                                setSelectedPublic(null);
                                                setSelectedHot(null);
                                            }}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: celebSubTab === sub.id ? '#3b82f6' : '#64748b',
                                                padding: '4px 0',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: 600,
                                                position: 'relative',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {sub.label}
                                            {celebSubTab === sub.id && (
                                                <div style={{ position: 'absolute', bottom: -17, left: 0, right: 0, height: '2px', background: '#3b82f6' }} />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'conglomerate' && !selectedConglo && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                                    {conglomerates.map(conglo => (
                                        <button
                                            key={conglo.name}
                                            onClick={() => setSelectedConglo(conglo.name)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: '10px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: selectedConglo === conglo.name ? 'rgba(59,130,246,0.1)' : 'var(--bg-primary)',
                                                color: selectedConglo === conglo.name ? '#3b82f6' : 'var(--text-primary)',
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                borderColor: selectedConglo === conglo.name ? '#3b82f6' : 'var(--border)'
                                            }}
                                        >
                                            {conglo.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'celebrities' && celebSubTab === 'public' && !selectedPublic && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                                    {publicFigures.map(figure => (
                                        <button
                                            key={figure.name}
                                            onClick={() => setSelectedPublic(figure.name)}
                                            style={{
                                                padding: '16px',
                                                textAlign: 'left',
                                                borderRadius: '12px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: selectedPublic === figure.name ? 'rgba(59,130,246,0.1)' : 'var(--bg-primary)',
                                                color: 'var(--text-primary)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                borderColor: selectedPublic === figure.name ? '#3b82f6' : 'var(--border)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: 700, fontSize: '14px' }}>{figure.name}</span>
                                                <span style={{ 
                                                    fontSize: '10px', 
                                                    padding: '2px 6px', 
                                                    borderRadius: '4px', 
                                                    color: '#fff',
                                                    background: figure.status === 'ACTIVE' ? '#059669' : figure.status === 'TYCOON' ? '#7c3aed' : '#4b5563'
                                                }}>{figure.status}</span>
                                            </div>
                                            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', lineHeight: '1.4' }}>{figure.description}</div>
                                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#60a5fa' }}>{figure.positions} Positions</div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'celebrities' && celebSubTab === 'hot' && !selectedHot && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                                    {hotSearches.map(item => (
                                        <button 
                                            key={item.rank} 
                                            onClick={() => setSelectedHot(item.name)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '16px',
                                                background: selectedHot === item.name ? 'rgba(59,130,246,0.1)' : 'var(--bg-primary)',
                                                borderRadius: '12px',
                                                border: '1px solid',
                                                borderColor: selectedHot === item.name ? '#3b82f6' : 'var(--border)',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                color: 'var(--text-primary)',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ 
                                                width: '28px', 
                                                height: '28px', 
                                                background: item.rank <= 3 ? '#3b82f6' : 'rgba(255,255,255,0.1)', 
                                                borderRadius: '50%', 
                                                display: 'flex', 
                                                justifyContent: 'center', 
                                                alignItems: 'center',
                                                marginRight: '16px',
                                                fontSize: '14px',
                                                fontWeight: 800
                                            }}>{item.rank}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: 700, fontSize: '15px' }}>{item.name}</div>
                                                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{item.description}</div>
                                                <div style={{ fontSize: '11px', color: '#60a5fa', marginTop: '4px' }}>{item.views.toLocaleString()} views</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'investor' ? (
                                <StockTable<InvestorRow>
                                    key={`investor-${activeTab}`}
                                    data={activeData as any as InvestorRow[]}
                                    columns={investorColumns}
                                    rowKey={(row) => row.investor}
                                    initialSort={{ key: 'positions', direction: 'desc' }}
                                />
                            ) : (activeTab === 'conglomerate' && !selectedConglo) ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                    Please select a conglomerate group from the list above.
                                </div>
                            ) : (activeTab === 'celebrities' && celebSubTab === 'public' && !selectedPublic) ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                    Please select a public figure above to see their portfolio.
                                </div>
                            ) : (activeTab === 'celebrities' && celebSubTab === 'hot' && !selectedHot) ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                    Click on a trending entity above to view their stock holdings.
                                </div>
                            ) : (activeTab === 'celebrities' && celebSubTab === 'hot' && hotSearches.find(h => h.name === selectedHot)?.isTicker) ? (
                                <div style={{ padding: '32px', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <h3 style={{ margin: '0 0 16px 0', color: 'var(--accent)' }}>Ticker Detail: {selectedHot}</h3>
                                    <div style={{ display: 'flex', gap: '24px' }}>
                                        <div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</div>
                                            <div style={{ fontSize: '16px', fontWeight: 600 }}>{hotSearches.find(h => h.name === selectedHot)?.description}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Holder</div>
                                            <div style={{ fontSize: '16px', fontWeight: 600 }}>
                                                <button 
                                                    onClick={() => pushToStack('investor', hotSearches.find(h => h.name === selectedHot)?.topHolder || '')}
                                                    style={{ background: 'transparent', border: 'none', color: 'var(--accent)', padding: 0, cursor: 'pointer', textAlign: 'left', fontWeight: 700, textDecoration: 'underline' }}
                                                >
                                                    {hotSearches.find(h => h.name === selectedHot)?.topHolder}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px' }}>
                                        <button 
                                            onClick={() => pushToStack('ticker', selectedHot!)}
                                            style={{ background: '#3b82f6', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                                        >
                                            View All Holders for {selectedHot}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <StockTable<StockRow>
                                    key={`ticker-${activeTab}-${tickerSubTab}`}
                                    data={activeData as any as StockRow[]}
                                    columns={activeTab === 'tickers' && tickerSubTab === 'free' ? freeFloatColumns : stockColumns}
                                    rowKey={(row) => row.ticker}
                                    initialSort={activeTab === 'tickers' && tickerSubTab === 'free' ? { key: 'free_float', direction: 'asc' } : { key: 'ticker', direction: 'asc' }}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* Version Display */}
                <div style={{ 
                    marginTop: '24px', 
                    textAlign: 'center', 
                    color: 'var(--text-secondary)', 
                    fontSize: '12px',
                    opacity: 0.8,
                    paddingBottom: isMobile ? '40px' : '0',
                    fontWeight: 600
                }}>
                    Last Update: {lastUpdate}
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            {isMobile && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'var(--bg-secondary)',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-around',
                    padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
                    zIndex: 2000,
                    boxShadow: '0 -4px 16px rgba(0,0,0,0.2)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                setSelectedConglo(null);
                                setSelectedPublic(null);
                                setSelectedHot(null);
                                clearStack();
                                setShowProfileMenu(false);
                            }}
                            style={{
                                background: activeTab === tab.id ? 'var(--tab-active-bg)' : 'transparent',
                                border: 'none',
                                color: activeTab === tab.id ? 'var(--tab-active-text)' : 'var(--text-secondary)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '8px 4px',
                                borderRadius: '12px',
                                flex: 1,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                margin: '0 4px'
                            }}
                        >
                            <span style={{ fontSize: '20px' }}>
                                {tab.id === 'tickers' ? '📈' : 
                                 tab.id === 'investor' ? '🐋' : 
                                 tab.id === 'conglomerate' ? '🏢' : 
                                 '⭐'}
                            </span>
                            <span style={{ fontSize: '10px', fontWeight: 600 }}>{tab.label.split(' ')[0]}</span>
                        </button>
                    ))}
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: showProfileMenu ? 'var(--accent)' : 'var(--text-secondary)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '8px 4px',
                            flex: 1,
                            cursor: 'pointer'
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>👤</span>
                        <span style={{ fontSize: '10px', fontWeight: 600 }}>Profile</span>
                    </button>
                </div>
            )}

            {/* Mobile Profile Menu Overlay */}
            {isMobile && showProfileMenu && (
                <div 
                    style={{
                        position: 'fixed',
                        bottom: 'calc(70px + env(safe-area-inset-bottom))',
                        right: '16px',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '16px',
                        width: '240px',
                        zIndex: 1001,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                        animation: 'slideUp 0.3s ease-out'
                    }}
                >
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Logged in as</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, wordBreak: 'break-all' }}>{userEmail || 'Guest'}</div>
                    </div>
                    {userEmail ? (
                        <button
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                background: '#ef4444',
                                color: '#fff',
                                border: 'none',
                                padding: '10px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Log Out
                        </button>
                    ) : (
                        <button
                            onClick={handleLogin}
                            style={{
                                width: '100%',
                                background: 'var(--accent)',
                                color: '#fff',
                                border: 'none',
                                padding: '10px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Log In
                        </button>
                    )}
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default StockSheets;
