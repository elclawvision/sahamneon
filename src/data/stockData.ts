import { StockRow, InvestorRow } from '../types/stock';
import { allTickers } from './allTickers';
import { freeFloat } from './freeFloat';
import { investorTab } from './investorTab';

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

export const getAllTickers = (): StockRow[] => allTickers;
export const getFreeFloatData = (): StockRow[] => freeFloat;
export const getInvestorTabData = (): InvestorRow[] => investorTab as any as InvestorRow[];
