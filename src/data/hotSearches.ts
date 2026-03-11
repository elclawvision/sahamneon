export interface HotSearchPortfolioItem {
    ticker: string;
    percentage: string;
}

export interface HotSearch {
    rank: number;
    name: string;
    views: number;
    description?: string;
    portfolio?: HotSearchPortfolioItem[];
    isTicker?: boolean;
    topHolder?: string;
}

export const hotSearches: HotSearch[] = [
    { 
        rank: 1, 
        name: "ANDRY HAKIM", 
        views: 2634,
        description: "Investor - High Net Worth Individual",
        portfolio: [
            { ticker: "CBRE", percentage: "5.02%" },
            { ticker: "SOTS", percentage: "3.96%" },
            { ticker: "RMKO", percentage: "2.40%" }
        ]
    },
    { 
        rank: 2, 
        name: "GOVERNMENT OF NORWAY", 
        views: 1556,
        description: "Sovereign Wealth Fund (Norges Bank)",
        portfolio: [
            { ticker: "ADES", percentage: "5.14%" },
            { ticker: "JSMR", percentage: "4.02%" },
            { ticker: "KLBF", percentage: "3.45%" },
            { ticker: "ICBP", percentage: "3.09%" },
            { ticker: "INTP", percentage: "3.09%" },
            { ticker: "AKRA", percentage: "2.75%" },
            { ticker: "INDF", percentage: "2.63%" },
            { ticker: "PWON", percentage: "2.33%" },
            { ticker: "BMRI", percentage: "2.33%" },
            { ticker: "ERAA", percentage: "2.31%" }
        ]
    },
    { 
        rank: 3, 
        name: "LO KHENG HONG. DRS", 
        views: 1368,
        description: "Warren Buffett Indonesia - Investor legendaris",
        portfolio: [
            { ticker: "DILD", percentage: "6.71%" },
            { ticker: "BMTR", percentage: "6.44%" },
            { ticker: "GJTL", percentage: "6.02%" },
            { ticker: "ABMM", percentage: "5.62%" },
            { ticker: "SIMP", percentage: "5.03%" },
            { ticker: "RALS", percentage: "2.16%" },
            { ticker: "CFIN", percentage: "1.58%" }
        ]
    },
    { 
        rank: 4, 
        name: "BELVIN TANNADI", 
        views: 1189,
        description: "Professional Stock Investor",
        portfolio: [
            { ticker: "NICE", percentage: "4.00%" },
            { ticker: "MITI", percentage: "1.69%" },
            { ticker: "BSBK", percentage: "1.30%" },
            { ticker: "BIPI", percentage: "1.11%" }
        ]
    },
    { 
        rank: 5, 
        name: "DJONI", 
        views: 1137,
        description: "Investor - Strategic Holdings",
        portfolio: [
            { ticker: "DATA", percentage: "5.45%" },
            { ticker: "MINA", percentage: "5.33%" },
            { ticker: "WIFI", percentage: "5.27%" },
            { ticker: "FOLK", percentage: "5.14%" },
            { ticker: "NINE", percentage: "5.10%" },
            { ticker: "TRUE", percentage: "5.09%" }
        ]
    },
    { 
        rank: 6, 
        name: "UOB KAY HIAN PRIVATE LIMITED", 
        views: 1047,
        description: "Institutional Custodian / Nominee",
        portfolio: [
            { ticker: "SOHO", percentage: "40.03%" },
            { ticker: "JAST", percentage: "29.95%" },
            { ticker: "ECII", percentage: "29.78%" },
            { ticker: "BINA", percentage: "16.86%" },
            { ticker: "TUGU", percentage: "15.84%" }
        ]
    },
    { 
        rank: 7, 
        name: "HAPSORO", 
        views: 981,
        description: "Strategic Investor (Basis Utama Prima)",
        portfolio: [
            { ticker: "RAJA", percentage: "27.52%" },
            { ticker: "MINA", percentage: "19.68%" },
            { ticker: "UANG", percentage: "19.35%" },
            { ticker: "SINI", percentage: "9.00%" },
            { ticker: "ARKO", percentage: "2.04%" }
        ]
    },
    { 
        rank: 8, 
        name: "IBST", 
        views: 612,
        isTicker: true,
        description: "INTI BANGUN SEJAHTERA Tbk",
        topHolder: "PT IFORTE SOLUSI INFOTEK (99.95%)"
    }
];
