import React, { useState, useMemo } from 'react';

interface Column<T> {
    key: keyof T;
    label: string;
    render?: (value: any, row: T) => React.ReactNode;
    minWidth?: string;
    align?: 'left' | 'center' | 'right';
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
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 50;

    // Reset pagination when data changes
    useMemo(() => {
        setCurrentPage(1);
    }, [data.length]);

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

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage]);

    const totalPages = Math.ceil(sortedData.length / pageSize);

    const requestSort = (key: keyof T) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div style={{ width: '100%' }}>
            <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse', 
                    textAlign: 'left',
                    fontSize: '14px',
                    color: 'var(--text-primary)'
                }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            {columns.map((col) => (
                                <th 
                                    key={col.key as string}
                                    onClick={() => requestSort(col.key)}
                                    style={{ 
                                        padding: '16px', 
                                        color: 'var(--text-secondary)', 
                                        fontWeight: 600, 
                                        cursor: 'pointer',
                                        userSelect: 'none',
                                        whiteSpace: 'nowrap',
                                        minWidth: col.minWidth,
                                        textAlign: col.align || 'left'
                                    }}
                                >
                                    {col.label} {sortConfig?.key === col.key && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row) => (
                            <tr 
                                key={rowKey(row)} 
                                style={{ 
                                    borderBottom: '1px solid var(--border)',
                                    transition: 'background 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'var(--table-row-hover)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                {columns.map((col) => (
                                    <td 
                                        key={col.key as string} 
                                        style={{ 
                                            padding: '16px',
                                            minWidth: col.minWidth,
                                            textAlign: col.align || 'left'
                                        }}
                                    >
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: '12px', 
                    padding: '24px 16px',
                    borderTop: '1px solid var(--border)',
                    marginTop: '8px'
                }}>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{
                            padding: '8px 16px',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-primary)',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: 600
                        }}
                    >
                        Previous
                    </button>
                    
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        Page <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{currentPage}</span> of {totalPages}
                    </span>

                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                            padding: '8px 16px',
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            color: currentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-primary)',
                            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                            fontSize: '13px',
                            fontWeight: 600
                        }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default StockTable;
