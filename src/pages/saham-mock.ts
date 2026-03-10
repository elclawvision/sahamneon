export const STOCKS = [
    { id: "BBCA", name: "Bank Central Asia", price: 9850, change: +2.14, vol: "342M", sector: "Perbankan", whale: true },
    { id: "BMRI", name: "Bank Mandiri", price: 6200, change: +1.87, vol: "218M", sector: "Perbankan", whale: false },
    { id: "TLKM", name: "Telkom Indonesia", price: 3920, change: -0.76, vol: "189M", sector: "Telko", whale: false },
    { id: "BYAN", name: "Bayan Resources", price: 18400, change: +4.12, vol: "52M", sector: "Batubara", whale: true },
    { id: "ASII", name: "Astra International", price: 5250, change: +0.96, vol: "275M", sector: "Otomotif", whale: false },
    { id: "ADRO", name: "Adaro Energy", price: 3180, change: +2.88, vol: "301M", sector: "Batubara", whale: true },
    { id: "GOTO", name: "GoTo Gojek Tokopedia", price: 64, change: -3.03, vol: "892M", sector: "Teknologi", whale: false },
    { id: "BBRI", name: "Bank Rakyat Indonesia", price: 5400, change: +1.31, vol: "411M", sector: "Perbankan", whale: false },
];

export const ALERTS = [
    { time: "09:14", stock: "BYAN", msg: "Whale accumulation +4.1% | Dana asing borong 12.4M lembar", type: "buy" },
    { time: "09:31", stock: "ADRO", msg: "Kepemilikan tersembunyi naik 2.3% dalam 3 hari", type: "buy" },
    { time: "10:02", stock: "GOTO", msg: "Whale distribution terdeteksi — hati-hati net sell", type: "sell" },
    { time: "10:47", stock: "BBCA", msg: "Djarum Group tambah 12.4M lembar via holding", type: "buy" },
    { time: "11:15", stock: "TLKM", msg: "Penurunan volume institusional, sinyal lemah", type: "neutral" },
];

export const CONGLOMERATE_NODES = [
    // Conglomerate Groups
    { id: "SALIM", name: "Salim Group", val: 36, color: "#3b82f6", group: 1, cap: "~Rp450T", desc: "INDF, ICBP, BRPT + entitas lain" },
    { id: "DJARUM", name: "Djarum Group", val: 34, color: "#8b5cf6", group: 2, cap: "~Rp820T", desc: "BBCA, HMSP + entitas lain" },
    { id: "LIPPO", name: "Lippo Group", val: 30, color: "#f59e0b", group: 3, cap: "~Rp180T", desc: "LPKR, MPPA + entitas lain" },
    { id: "SINARMAS", name: "Sinar Mas Group", val: 32, color: "#10b981", group: 4, cap: "~Rp320T", desc: "INKP, TKIM, SMMA + entitas lain" },
    { id: "MNC", name: "MNC Group", val: 28, color: "#6366f1", group: 5, cap: "~Rp110T", desc: "MNCN, BMTR, BHIT + entitas lain" },
    { id: "BARITO", name: "Barito Pacific", val: 35, color: "#ec4899", group: 6, cap: "~Rp600T", desc: "BRPT, TPIA, BREN + entitas lain" },

    // Stocks
    { id: "INDF", name: "Indofood", val: 18, color: "#93c5fd", group: 1 },
    { id: "ICBP", name: "Indofood CBP", val: 16, color: "#93c5fd", group: 1 },
    { id: "LSIP", name: "PP London Sumatra", val: 14, color: "#93c5fd", group: 1 },

    { id: "BBCA", name: "Bank Central Asia", val: 22, color: "#c4b5fd", group: 2 },
    { id: "TOWR", name: "Sarana Menara", val: 15, color: "#c4b5fd", group: 2 },

    { id: "LPKR", name: "Lippo Karawaci", val: 14, color: "#fcd34d", group: 3 },
    { id: "MPPA", name: "Matahari Putra Prima", val: 13, color: "#fcd34d", group: 3 },
    { id: "SILO", name: "Siloam Hospitals", val: 16, color: "#fcd34d", group: 3 },

    { id: "INKP", name: "Indah Kiat", val: 16, color: "#6ee7b7", group: 4 },
    { id: "TKIM", name: "Pabrik Kertas Tjiwi", val: 15, color: "#6ee7b7", group: 4 },
    { id: "SMMA", name: "Sinarmas Multiartha", val: 18, color: "#6ee7b7", group: 4 },
    { id: "BSDE", name: "Bumi Serpong Damai", val: 17, color: "#6ee7b7", group: 4 },

    { id: "MNCN", name: "Media Nusantara", val: 15, color: "#a5b4fc", group: 5 },
    { id: "BMTR", name: "Global Mediacom", val: 14, color: "#a5b4fc", group: 5 },
    { id: "MSIN", name: "MNC Digital", val: 16, color: "#a5b4fc", group: 5 },

    { id: "BRPT", name: "Barito Pacific", val: 20, color: "#fbcfe8", group: 6 },
    { id: "TPIA", name: "Chandra Asri", val: 22, color: "#fbcfe8", group: 6 },
    { id: "BREN", name: "Barito Renewables", val: 25, color: "#fbcfe8", group: 6 },
    { id: "CUAN", name: "Petrindo Jaya", val: 18, color: "#fbcfe8", group: 6 },
];

export const EDGES = [
    // Cross-holdings
    { source: "SALIM", target: "INDF" },
    { source: "SALIM", target: "ICBP" },
    { source: "SALIM", target: "LSIP" },
    { source: "SALIM", target: "LIPPO" }, // Cross holding
    { source: "INDF", target: "ICBP" },   // Subsidiary

    { source: "DJARUM", target: "BBCA" },
    { source: "DJARUM", target: "TOWR" },
    { source: "DJARUM", target: "LIPPO" }, // Cross holding

    { source: "LIPPO", target: "LPKR" },
    { source: "LIPPO", target: "MPPA" },
    { source: "LIPPO", target: "SILO" },
    { source: "LPKR", target: "SILO" },    // Subsidiary

    { source: "SINARMAS", target: "INKP" },
    { source: "SINARMAS", target: "TKIM" },
    { source: "SINARMAS", target: "SMMA" },
    { source: "SINARMAS", target: "BSDE" },

    { source: "MNC", target: "MNCN" },
    { source: "MNC", target: "BMTR" },
    { source: "MNC", target: "MSIN" },
    { source: "BMTR", target: "MNCN" },    // Subsidiary

    { source: "BARITO", target: "BRPT" },
    { source: "BARITO", target: "TPIA" },
    { source: "BARITO", target: "BREN" },
    { source: "BARITO", target: "CUAN" },
    { source: "BRPT", target: "TPIA" },    // Subsidiary
];

export const MOCK_SCREENER = [
    { id: "BBCA", ff: "52%", liq: "Rp420M", msci: "1.82%", status: "MSCI", r: 5 },
    { id: "BMRI", ff: "40%", liq: "Rp310M", msci: "1.24%", status: "MSCI", r: 5 },
    { id: "ASII", ff: "49%", liq: "Rp280M", msci: "0.98%", status: "MSCI", r: 4 },
    { id: "BBRI", ff: "43%", liq: "Rp390M", msci: "1.41%", status: "MSCI", r: 5 },
    { id: "BYAN", ff: "22%", liq: "Rp95M", msci: "—", status: "Non-MSCI", r: 3 },
    { id: "GOTO", ff: "18%", liq: "Rp210M", msci: "—", status: "Non-MSCI", r: 2 },
];
