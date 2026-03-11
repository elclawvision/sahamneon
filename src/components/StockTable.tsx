import React, { useState, useMemo } from 'react';

interface Column<T> {
    key: keyof T;
    label: string;
    render?: (value: any, row: T) => React.ReactNode;
}

interface StockTableProps<T> {
    data: T[];
    columns: Column<T>[];
    rowKey: (row: T) => string;
    initialSort?: { key: keyof T, direction: 'asc' | 'desc' };
}

const StockTable = <T extends Record<string, any>>({ 
    data, 
    columns,
    rowKey,
    initialSort 
}: StockTableProps<T>) => {
    const [sortConfig, setSortConfig] = useState<{ key: keyof T, direction: 'asc' | 'desc' } | null>(initialSort || null);

    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                if (aVal === bVal) return 0;
                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;

                if (aVal < bVal) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (aVal > bVal) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const requestSort = (key: keyof T) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                textAlign: 'left',
                fontSize: '14px',
                color: '#f8fafc'
            }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        {columns.map((col) => (
                            <th 
                                key={col.key as string}
                                onClick={() => requestSort(col.key)}
                                style={{ 
                                    padding: '16px', 
                                    color: '#94a3b8', 
                                    fontWeight: 600, 
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {col.label} {sortConfig?.key === col.key && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row) => (
                        <tr 
                            key={rowKey(row)} 
                            style={{ 
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            {columns.map((col) => (
                                <td key={col.key as string} style={{ padding: '16px' }}>
                                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StockTable;
