import React from 'react';
import { StockRow, InvestorRow } from '../types/stock';

export const getFreeFloatColumns = (pushToStack: (type: 'ticker' | 'investor', id: string) => void) => [
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

export const getStockColumns = (pushToStack: (type: 'ticker' | 'investor', id: string) => void) => [
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
    { key: 'top_holder' as keyof StockRow, label: 'TOP HOLDER', minWidth: '220px' },
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
        label: 'FREE FLOAT', 
        minWidth: '120px',
        align: 'right' as const,
        render: (v: number, row: StockRow) => (
            <span style={{ color: row.has_warning ? '#fbbf24' : 'var(--text-primary)', fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {v.toFixed(2)}% {row.has_warning && '⚠️'}
            </span>
        )
    },
];

export const getInvestorColumns = (pushToStack: (type: 'ticker' | 'investor', id: string) => void) => [
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
                    textAlign: 'left',
                    fontWeight: 700,
                    textDecoration: 'underline'
                }}
            >
                {v}
            </button>
        )
    },
    { key: 'nat' as keyof InvestorRow, label: 'NAT', minWidth: '80px', align: 'center' as const },
    { key: 'type' as keyof InvestorRow, label: 'TYPE', minWidth: '120px' },
    { key: 'positions' as keyof InvestorRow, label: 'POS', minWidth: '80px', align: 'right' as const, render: (v: number) => <span style={{ fontWeight: 700 }}>{v}</span> },
    { 
        key: 'top_holding' as keyof InvestorRow, 
        label: 'TOP HOLDING',
        minWidth: '220px',
        render: (v: string) => (
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    pushToStack('ticker', v);
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
];
