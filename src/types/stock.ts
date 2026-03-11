export interface StockRow {
    ticker: string;
    holders_count: number;
    top_holder: string;
    top_pct: number;
    local_pct: number;
    foreign_pct: number;
    free_float: number;
    has_warning?: boolean;
}

export interface InvestorRow {
    investor: string;
    type: string;
    nat: string;
    positions: number;
    top_holding: string;
}
