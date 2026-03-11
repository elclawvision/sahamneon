export interface PortfolioItem {
    ticker: string;
    percentage: string;
}

export interface PublicFigure {
    name: string;
    status: 'ACTIVE' | 'EX-OFFICIAL' | 'TYCOON';
    description: string;
    positions: number;
    portfolio: PortfolioItem[];
}

export const publicFigures: PublicFigure[] = [
    {
        name: "MARUARAR SIRAIT",
        status: "ACTIVE",
        description: "Menteri Perumahan & Kawasan Permukiman (PKP)",
        positions: 3,
        portfolio: [
            {"ticker": "COCO", "percentage": "3.31%"},
            {"ticker": "BOLA", "percentage": "1.91%"},
            {"ticker": "TRIM", "percentage": "1.1%"}
        ]
    },
    {
        name: "GARIBALDI THOHIR",
        status: "ACTIVE",
        description: "Kakak Erick Thohir (Menteri BUMN)",
        positions: 7,
        portfolio: [
            {"ticker": "TRIM", "percentage": "34.68%"},
            {"ticker": "PALM", "percentage": "19.9%"},
            {"ticker": "ESSA", "percentage": "14.55%"},
            {"ticker": "MDKA", "percentage": "7.46%"},
            {"ticker": "ADRO", "percentage": "6.73%"},
            {"ticker": "AADI", "percentage": "5.83%"},
            {"ticker": "MBMA", "percentage": "2.26%"}
        ]
    },
    {
        name: "SANDIAGA SALAHUDDIN UNO",
        status: "EX-OFFICIAL",
        description: "Ex-Menteri Parekraf, Ex-Cawapres 2019",
        positions: 3,
        portfolio: [
            {"ticker": "SRTG", "percentage": "21.51%"},
            {"ticker": "ADRO", "percentage": "2.08%"},
            {"ticker": "AADI", "percentage": "2.04%"}
        ]
    },
    {
        name: "H HUTOMO MANDALA PUTRA",
        status: "EX-OFFICIAL",
        description: "Tommy Soeharto — Putra Presiden ke-2",
        positions: 1,
        portfolio: [
            {"ticker": "HUMI", "percentage": "4.95%"}
        ]
    },
    {
        name: "SOLIHIN JUSUF KALLA",
        status: "EX-OFFICIAL",
        description: "Putra Jusuf Kalla (Ex-Wakil Presiden)",
        positions: 1,
        portfolio: [
            {"ticker": "BUKK", "percentage": "29.91%"}
        ]
    },
    {
        name: "ANINDITHA ANESTYA BAKRIE",
        status: "EX-OFFICIAL",
        description: "Keluarga Aburizal Bakrie (Ex-Menko Perekonomian)",
        positions: 1,
        portfolio: [
            {"ticker": "ALII", "percentage": "1.95%"}
        ]
    },
    {
        name: "HARY TANOESOEDIBJO",
        status: "EX-OFFICIAL",
        description: "Founder MNC Group, Cawapres 2014 & 2019",
        positions: 1,
        portfolio: [
            {"ticker": "BHIT", "percentage": "3.12%"}
        ]
    },
    {
        name: "ANTHONI SALIM",
        status: "TYCOON",
        description: "Salim Group — Konglomerat terbesar Indonesia",
        positions: 4,
        portfolio: [
            {"ticker": "DNET", "percentage": "25.3%"},
            {"ticker": "DCII", "percentage": "11.12%"},
            {"ticker": "EMTK", "percentage": "8.97%"},
            {"ticker": "BBCA", "percentage": "1.15%"}
        ]
    },
    {
        name: "LO KHENG HONG. DRS",
        status: "TYCOON",
        description: "Warren Buffett Indonesia — Investor legendaris",
        positions: 13,
        portfolio: [
            {"ticker": "DILD", "percentage": "6.71%"},
            {"ticker": "BMTR", "percentage": "6.44%"},
            {"ticker": "GJTL", "percentage": "6.02%"},
            {"ticker": "ABMM", "percentage": "5.62%"},
            {"ticker": "SIMP", "percentage": "5.03%"},
            {"ticker": "RALS", "percentage": "2.16%"},
            {"ticker": "CFIN", "percentage": "1.58%"},
            {"ticker": "ADMG", "percentage": "1.29%"},
            {"ticker": "MAIN", "percentage": "1.24%"},
            {"ticker": "PNIN", "percentage": "1.23%"},
            {"ticker": "LSIP", "percentage": "1.21%"},
            {"ticker": "BEST", "percentage": "1.16%"},
            {"ticker": "SRIL", "percentage": "1.02%"}
        ]
    },
    {
        name: "ACHMAD ZAKY SYAIFUDIN",
        status: "TYCOON",
        description: "Founder & Ex-CEO Bukalapak",
        positions: 1,
        portfolio: [
            {"ticker": "BUKA", "percentage": "1.2%"}
        ]
    }
];
