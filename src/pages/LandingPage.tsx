import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface ReviewItem {
    id: number;
    email: string;
    rating: number;
    date: string;
    text: string;
    verified: boolean;
    badge?: string;
}

// ─── DATA ────────────────────────────────────────────────────────────────────
const REVIEWS: ReviewItem[] = [
    { id: 1, email: 'bud***@gmail.com', rating: 5, date: '2 Mar 2026', text: 'Gila sih ini. Baru 2 hari pakai udah nemu saham yang Lo Kheng Hong baru masuk, holders count turun 8% dalam sebulan. Entry di 340, sekarang udah 410. Worth it banget buat 99rb.', verified: true, badge: 'Value Investor' },
    { id: 2, email: 'ren***@yahoo.com', rating: 5, date: '28 Feb 2026', text: 'Data foreign flow-nya akurat banget. Saya compare sama aplikasi lain yang saya bayar 500rb/bulan — Saham Ultimate Real-Time KSEI jauh lebih clean dan mudah dibaca. Langsung pindah ke sini.', verified: true, badge: 'Pro Trader' },
    { id: 3, email: 'senaditsr***@hotmail.com', rating: 5, date: '25 Feb 2026', text: 'CSV export-nya the real MVP. Langsung saya masukkan ke Google Sheets dan bikin dashboard sendiri. Bonus tutorialnya juga sangat membantu untuk pemula seperti saya.', verified: true, badge: 'Data Analyst' },
    { id: 4, email: 'andhy***@gmail.com', rating: 5, date: '22 Feb 2026', text: 'Tab Public Figures itu yang paling keren menurut saya. Bisa lihat portfolio politisi aktif dan mantan pejabat. Informasi ini yang biasanya cuma dimiliki orang dalam.', verified: true, badge: 'Swing Trader' },
    { id: 5, email: 'dew***@gmail.com', rating: 4, date: '19 Feb 2026', text: 'Sudah 3 bulan pakai dan puas banget. Hot searches feature sering akurat — beberapa nama yang trending di sini ternyata memang ada corporate action sebulan kemudian. Rekomended!', verified: true, badge: 'Investor Ritel' },
    { id: 6, email: 'eko***@outlook.com', rating: 5, date: '15 Feb 2026', text: 'Bonus ebook cheat sheet whale-nya beneran 47 halaman penuh! Bukan PDF tipis ala-ala. Saya print dan tempel di meja trading. Best purchase di 2026 sejauh ini.', verified: true, badge: 'Full-time Trader' },
    { id: 7, email: 'fir***@gmail.com', rating: 5, date: '12 Feb 2026', text: 'Konglomerat map-nya super berguna. Begitu ada berita positif di satu perusahaan Prajogo, saya langsung cek semua saham grupnya. Return rata-rata 3 bulan terakhir naik signifikan.', verified: true, badge: 'Group Investor' },
    { id: 8, email: 'han***@gmail.com', rating: 5, date: '8 Feb 2026', text: 'Sebagai pemula yang baru 6 bulan investasi, tutorial free float-nya literally ngubah cara pandang saya. Sekarang saya tidak pernah beli saham tanpa cek free float dulu.', verified: true, badge: 'Pemula' },
    { id: 9, email: 'irw***@yahoo.co.id', rating: 4, date: '5 Feb 2026', text: 'Mobile version-nya bagus, cepat, tidak berat. Saya sering cek pas lagi di jalan atau meeting. Data peta konglomerat 2025-nya juga up-to-date, beda sama yang beredar gratis di internet.', verified: true, badge: 'Mobile User' },
    { id: 10, email: 'jul***@gmail.com', rating: 5, date: '1 Feb 2026', text: 'Norges Bank portofolio list-nya bikin nganga. Ternyata banyak saham mid-cap yang mereka pegang diam-diam. Sekarang jadi salah satu filter utama saya sebelum riset lebih dalam.', verified: true, badge: 'Fundamental Investor' },
];

const FAQS = [
    {
        q: 'Apa yang saya dapatkan setelah bayar Rp 99.000?',
        a: 'Akses penuh ke platform Saham Ultimate (data whale Real-Time KSEI, konglomerat, public figures, hot searches, free float screener + CSV download) DAN 3 bonus PDF eksklusif: Cheat Sheet 5 Tanda Whale Sudah Masuk (47 hal), Tutorial Deteksi Gorengan via Free Float (37 hal), dan Watchlist Konglomerat Indonesia 2025 (33 hal). Total nilai setara > Rp 800.000, kamu bayar Rp 99.000. Sekali bayar, akses langsung.'
    },
    {
        q: 'Apakah ini berlangganan atau sekali bayar?',
        a: 'Ini adalah pembelian SEKALI BAYAR. Tidak ada biaya berulang, tidak ada hidden subscription, tidak ada auto-renewal. Bayar Rp 99.000, akses langsung dan selamanya untuk versi yang sudah dibeli.'
    },
    {
        q: 'Seberapa sering data diupdate?',
        a: 'Data kepemilikan saham (holders count, free float, top holder, foreign %) diperbarui secara Real-Time (Maret 2026) mengikuti data KSEI. Artinya data yang kamu lihat adalah yang paling mutakhir — jauh lebih cepat dari laporan keuangan quarterly yang kebanyakan investor andalkan.'
    },
    {
        q: 'Apakah data ini akurat dan bisa dipercaya?',
        a: 'Data bersumber langsung dari KSEI (Kustodian Sentral Efek Indonesia) — registrar resmi semua kepemilikan saham di Indonesia. Kami tidak membuat interpretasi atau modifikasi pada data raw, hanya membersihkan dan menyajikannya agar mudah dibaca. Lihat bagian "Kami Berintegritas" di halaman ini untuk komitmen transparansi kami.'
    },
    {
        q: 'Apakah ini untuk pemula atau hanya trader advanced?',
        a: 'Keduanya. Pemula akan sangat terbantu oleh bonus PDF yang menjelaskan konsep dari nol — tidak ada asumsi pengetahuan sebelumnya. Trader advanced akan appreciate kedalaman data (CSV export, free float screener, crossing negosiasi) yang bisa diintegrasikan ke workflow riset yang sudah ada.'
    },
    {
        q: 'Apakah data ini memberikan rekomendasi saham untuk dibeli?',
        a: 'Tidak. Saham Ultimate adalah platform data dan edukasi, bukan platform rekomendasi investasi. Kami menyediakan data yang memungkinkan kamu membuat keputusan lebih informed — bukan membuat keputusan untuk kamu. Selalu lakukan riset mandiri dan konsultasikan dengan advisor keuangan berlisensi.'
    },
    {
        q: 'Bagaimana cara download bonus PDF setelah bayar?',
        a: 'Setelah pembayaran dikonfirmasi, link download ketiga PDF bonus akan otomatis tersedia di dashboard akun kamu di menu "Bonus Content". PDF bisa didownload ke device apapun dan disimpan selamanya — tidak ada expiry.'
    },
    {
        q: 'Apakah ada garansi uang kembali?',
        a: 'Karena ini adalah produk digital yang langsung dapat diakses setelah pembayaran, kami tidak menyediakan garansi refund standar. Namun jika ada masalah teknis yang mencegah kamu mengakses produk, tim support kami akan menyelesaikannya dalam 24 jam atau memberikan kompensasi yang setara.'
    },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const StarRating = ({ rating }: { rating: number }) => (
    <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(i => (
            <span key={i} style={{ color: i <= rating ? '#f59e0b' : '#e2e8f0', fontSize: '14px' }}>★</span>
        ))}
    </div>
);

const useInView = (threshold = 0.15) => {
    const ref = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return { ref, inView };
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function LandingPage() {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [reviewPage, setReviewPage] = useState(0);
    const [loginPrompt, setLoginPrompt] = useState(false);

    const heroSection = useInView(0.1);
    const offerSection = useInView(0.1);
    const bonusSection = useInView(0.1);
    const reviewSection = useInView(0.1);
    const integritySection = useInView(0.1);
    const faqSection = useInView(0.1);

    const REVIEWS_PER_PAGE = 5;
    const totalPages = Math.ceil(REVIEWS.length / REVIEWS_PER_PAGE);
    const visibleReviews = REVIEWS.slice(reviewPage * REVIEWS_PER_PAGE, (reviewPage + 1) * REVIEWS_PER_PAGE);

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            color: '#1e293b',
            fontFamily: '"Syne", system-ui, sans-serif',
            overflowX: 'hidden',
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --blue: #3b82f6;
          --blue-dim: rgba(59,130,246,0.12);
          --blue-glow: rgba(59,130,246,0.35);
          --gold: #f59e0b;
          --gold-dim: rgba(245,158,11,0.12);
          --surface: #ffffff;
          --border: #e2e8f0;
          --text-muted: #64748b;
          --radius: 16px;
        }

        body { background: #f8fafc; }

        .fade-up {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        .fade-up.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 0 0 0 var(--blue-glow); }
          50% { box-shadow: 0 0 32px 8px var(--blue-glow); }
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes blink {
          0%,100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 32px;
          background: var(--blue);
          color: #fff;
          border: none;
          border-radius: var(--radius);
          font-family: "Syne", sans-serif;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.25s ease;
          animation: pulse-glow 3s infinite;
          white-space: nowrap;
        }
        .btn-primary:hover { background: #2563eb; transform: translateY(-2px); }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 32px;
          background: transparent;
          color: #475569;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-family: "Syne", sans-serif;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.25s ease;
          white-space: nowrap;
        }
        .btn-ghost:hover { background: #f1f5f9; border-color: var(--blue); color: #1e293b; }

        .glass-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 20px;
          backdrop-filter: blur(12px);
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          border-color: rgba(59,130,246,0.3);
          background: rgba(255,255,255,0.06);
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          font-family: "DM Sans", sans-serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .ticker-wrap { overflow: hidden; white-space: nowrap; }
        .ticker-inner { display: inline-flex; gap: 0; animation: ticker 28s linear infinite; }
        .ticker-item {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 0 32px;
          font-family: "DM Sans", sans-serif;
          font-size: 13px;
          color: #475569;
          font-weight: 500;
        }
        .ticker-item span { color: var(--blue); font-weight: 700; }

        .offer-price-old {
          font-family: "DM Sans", sans-serif;
          font-size: 18px;
          color: #475569;
          text-decoration: line-through;
        }
        .offer-price-new {
          font-size: clamp(48px, 8vw, 72px);
          font-weight: 800;
          color: #0f172a;
          line-height: 1;
          letter-spacing: -2px;
        }

        .bonus-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 20px;
          border-radius: 14px;
          background: var(--surface);
          border: 1px solid var(--border);
          transition: all 0.25s ease;
        }
        .bonus-item:hover { border-color: rgba(59,130,246,0.4); background: rgba(59,130,246,0.05); }

        .review-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.25s ease;
        }
        .review-card:hover { border-color: rgba(245,158,11,0.3); }

        .faq-item {
          border-bottom: 1px solid var(--border);
          overflow: hidden;
        }
        .faq-q {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 0;
          cursor: pointer;
          font-weight: 600;
          font-size: 15px;
          color: #475569;
          gap: 16px;
          transition: color 0.2s;
        }
        .faq-q:hover { color: #0f172a; }
        .faq-a {
          font-family: "DM Sans", sans-serif;
          font-size: 14px;
          color: #94a3b8;
          line-height: 1.75;
          padding-bottom: 20px;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease, opacity 0.3s ease;
          opacity: 0;
        }
        .faq-a.open { max-height: 300px; opacity: 1; }

        .integrity-row {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 18px 0;
          border-bottom: 1px solid var(--border);
        }
        .integrity-row:last-child { border-bottom: none; }

        .section-eyebrow {
          font-family: "DM Sans", sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--blue);
          margin-bottom: 12px;
        }

        .gradient-text {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6 60%, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .gold-text {
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* MOBILE */
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
          .hero-btns { flex-direction: column; width: 100%; }
          .hero-btns button { width: 100% !important; }
          .feature-grid { grid-template-columns: 1fr !important; }
          .offer-grid { grid-template-columns: 1fr !important; }
          .how-grid { grid-template-columns: 1fr !important; }
          .review-name-row { flex-direction: column; gap: 4px !important; }
        }
      `}</style>

            {/* ── NAVBAR ── */}
            <nav style={{
                padding: '20px 6%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border)',
                position: 'sticky',
                top: 0,
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
                zIndex: 100,
            }}>
                <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px', color: '#0f172a' }}>
                    SAHAM<span className="gradient-text">ULTIMATE</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span className="hide-mobile" style={{ fontSize: '13px', color: '#64748b', fontFamily: '"DM Sans", sans-serif' }}>
                        Data Real-Time KSEI • Maret 2026
                    </span>
                    <button className="btn-ghost" style={{ padding: '10px 20px', fontSize: '14px' }} onClick={() => navigate('/auth')}>
                        Login
                    </button>
                    <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }} onClick={() => navigate('/auth')}>
                        Mulai →
                    </button>
                </div>
            </nav>

            {/* ── TICKER ── */}
            <div style={{ borderBottom: '1px solid var(--border)', padding: '10px 0', background: 'rgba(255,255,255,0.015)' }}>
                <div className="ticker-wrap">
                    <div className="ticker-inner">
                        {[
                            ['🐋 WHALE RADAR', 'Lo Kheng Hong + 13 Saham'],
                            ['📊 NORGES BANK', 'ADES 5.14% • JSMR 4.02%'],
                            ['🏢 KONGLOMERAT', '18 Grup • 80+ Ticker'],
                            ['📥 CSV EXPORT', 'Download Semua Data'],
                            ['👤 PUBLIC FIGURES', '10 Pejabat + 3 Tycoon'],
                            ['⚡ REAL-TIME KSEI', 'Data Maret 2026'],
                            ['🎁 BONUS PDF', '3 Ebook • 117 Halaman'],
                            ['🐋 WHALE RADAR', 'Lo Kheng Hong + 13 Saham'],
                            ['📊 NORGES BANK', 'ADES 5.14% • JSMR 4.02%'],
                            ['🏢 KONGLOMERAT', '18 Grup • 80+ Ticker'],
                            ['📥 CSV EXPORT', 'Download Semua Data'],
                            ['👤 PUBLIC FIGURES', '10 Pejabat + 3 Tycoon'],
                            ['⚡ REAL-TIME KSEI', 'Data Maret 2026'],
                            ['🎁 BONUS PDF', '3 Ebook • 117 Halaman'],
                        ].map(([label, val], i) => (
                            <div key={i} className="ticker-item">
                                {label} <span>•</span> {val} <span style={{ opacity: 0.3, margin: '0 8px' }}>|</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── HERO ── */}
            <header style={{ padding: 'clamp(60px, 10vw, 120px) 6% clamp(60px, 8vw, 100px)', textAlign: 'center', position: 'relative' }}>
                <div ref={heroSection.ref} className={`fade-up ${heroSection.inView ? 'visible' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
                    <div className="badge-pill" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#3b82f6', marginBottom: '32px' }}>
                        <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', animation: 'blink 1.5s infinite' }} />
                        Data KSEI Live • Real-Time Maret 2026
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(38px, 7.5vw, 80px)',
                        fontWeight: 800,
                        lineHeight: 1.05,
                        letterSpacing: '-2px',
                        color: '#0f172a',
                        maxWidth: '900px',
                        marginBottom: '24px',
                    }}>
                        Retail Kalah Bukan Karena Bodoh.<br />
                        <span className="gradient-text">Tapi Karena Buta Data.</span>
                    </h1>

                    <p style={{
                        fontFamily: '"DM Sans", sans-serif',
                        fontSize: 'clamp(15px, 2vw, 18px)',
                        color: '#64748b',
                        maxWidth: '560px',
                        lineHeight: 1.75,
                        marginBottom: '48px',
                    }}>
                        Kamu tidak tahu siapa yang pegang saham itu. Kamu tidak tahu whale sudah masuk atau belum. Kami sudah scrape semuanya secara Real-Time — dan sekarang data itu ada di tanganmu.
                    </p>

                    <div className="hero-btns" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn-primary" style={{ fontSize: '16px', padding: '18px 36px' }} onClick={() => navigate('/auth')}>
                            Akses Sekarang — Rp 99.000
                        </button>
                        <button className="btn-ghost" style={{ fontSize: '16px', padding: '18px 36px', color: '#1e293b', borderColor: '#e2e8f0' }} onClick={() => navigate('/demo')}>
                            Demo Gratis →
                        </button>
                    </div>

                    <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', color: '#64748b', marginTop: '16px' }}>
                        Sekali bayar • Tanpa berlangganan • Langsung akses + 3 Bonus PDF
                    </p>
                </div>
            </header>

            {/* ── STATS STRIP ── */}
            <div style={{ padding: '0 6% 60px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1px', background: '#e2e8f0', borderRadius: '20px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    {[
                        ['900+', 'Emiten IDX'],
                        ['18', 'Grup Konglomerat'],
                        ['900++', 'Ticker Dianalisis'],
                        ['REAL-TIME', 'KSEI Maret 2026'],
                        ['500+', 'Pembeli Terverifikasi'],
                    ].map(([num, label]) => (
                        <div key={label} style={{ background: '#fff', padding: '28px 20px', textAlign: 'center' }}>
                            <div style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: '#0f172a', marginBottom: '4px', letterSpacing: '-1px' }}>{num}</div>
                            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', color: '#64748b', fontWeight: 500 }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── FEATURES ── */}
            <section style={{ padding: '0 6% 80px' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div className="section-eyebrow">Platform</div>
                    <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>
                        Semua Data Whale,<br /><span className="gradient-text">Dalam Satu Tempat</span>
                    </h2>
                </div>

                <div className="feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                    {[
                        { icon: '🐋', title: 'Portfolio Whale', desc: 'Lihat portofolio Lo Kheng Hong, Norges Bank, dan 10+ investor legendaris secara real-time beserta % kepemilikannya.' },
                        { icon: '🏢', title: 'Peta Konglomerat', desc: '18 grup konglomerat terbesar — Prajogo, Salim, Djarum, Astra, dan lainnya. Satu perubahan di induk langsung kelihatan dampaknya.' },
                        { icon: '👤', title: 'Public Figures', desc: 'Politisi aktif, mantan pejabat, dan taipan Indonesia. Siapa memegang saham apa — transparansi data KSEI yang bersih.' },
                        { icon: '🔥', title: 'Hot Searches', desc: 'Siapa investor yang paling banyak dicari minggu ini? Fitur trending yang menampilkan nama-nama di balik pergerakan saham.' },
                        { icon: '📊', title: 'Free Float Screener', desc: 'Filter emiten IDX berdasarkan free float secara real-time. Deteksi saham gorengan dan low-float yang menarik sebelum bergerak.' },
                        { icon: '📥', title: 'CSV Download', desc: 'Export semua data ke Excel/Google Sheets dengan satu klik. Buat analisis personal dengan data mentah yang sudah bersih.' },
                    ].map(({ icon, title, desc }) => (
                        <div key={title} className="glass-card" style={{ padding: '28px', background: '#fff', borderColor: '#e2e8f0' }}>
                            <div style={{ fontSize: '28px', marginBottom: '14px' }}>{icon}</div>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>{title}</h3>
                            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: '#64748b', lineHeight: 1.7 }}>{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── HOW TO USE ── */}
            <section style={{ padding: '0 6% 80px' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div className="section-eyebrow">Cara Pakai</div>
                    <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>
                        3 Langkah, Langsung Dapat<br /><span className="gradient-text">Insight yang Kamu Butuhkan</span>
                    </h2>
                </div>

                <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    {[
                        {
                            step: '01',
                            title: 'Pilih Tab yang Relevan',
                            desc: 'Mau cari tahu siapa pemegang saham X? Buka tab "All Tickers" dan ketik ticker-nya. Mau lihat portfolio investor? Buka tab "Hot Searches" atau "Public Figures".',
                            tip: 'Tip: Mulai dari "Hot Searches" untuk lihat siapa yang sedang ramai.'
                        },
                        {
                            step: '02',
                            title: 'Baca Data & Skor Sinyal',
                            desc: 'Perhatikan: holders_count (naik/turun), free_float (< 15% = waspada), top_pct (konsentrasi), dan foreign_pct. Gunakan Whale Scorecard dari bonus PDF.',
                            tip: 'Tip: Holders turun + foreign naik + nama baru = sinyal paling kuat.'
                        },
                        {
                            step: '03',
                            title: 'Export CSV & Analisis Lanjut',
                            desc: 'Klik tombol Download CSV di setiap tab. Buka di Excel atau Google Sheets. Tambahkan conditional formatting untuk tracking watchlist personal kamu.',
                            tip: 'Tip: Simpan snapshot CSV mingguan untuk tracking perubahan real-time.'
                        },
                    ].map(({ step, title, desc, tip }) => (
                        <div key={step} className="glass-card" style={{ padding: '32px', background: '#fff', borderColor: '#e2e8f0' }}>
                            <div style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 800, color: 'rgba(15,23,42,0.15)', lineHeight: 1, marginBottom: '16px', letterSpacing: '-2px' }}>{step}</div>
                            <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '10px' }}>{title}</h3>
                            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: '#64748b', lineHeight: 1.75, marginBottom: '14px' }}>{desc}</p>
                            <div style={{ padding: '10px 14px', background: 'rgba(59,130,246,0.05)', borderRadius: '10px', borderLeft: '3px solid var(--blue)' }}>
                                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', color: '#3b82f6', margin: 0 }}>{tip}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── ABSURD OFFER ── */}
            <section ref={offerSection.ref} style={{ padding: '0 6% 80px' }}>
                <div className={`fade-up ${offerSection.inView ? 'visible' : ''}`}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.04) 0%, rgba(139,92,246,0.04) 100%)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '28px',
                        padding: 'clamp(32px, 6vw, 64px)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                            <div className="section-eyebrow">Absurd Offer</div>
                            <h2 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px', marginBottom: '12px' }}>
                                Informasi yang Biasanya<br /><span className="gradient-text">Cuma Dimiliki Fund Manager</span>
                            </h2>
                            <p style={{ fontFamily: '"DM Sans", sans-serif', color: '#64748b', fontSize: '15px', maxWidth: '520px', margin: '0 auto' }}>
                                Bloomberg Rp 8 juta/bulan. Refinitiv Rp 15 juta/bulan. Saham Ultimate?
                            </p>
                        </div>

                        {/* Value Stack */}
                        <div style={{ marginBottom: '40px' }}>
                            {[
                                ['🐋 Platform Whale Radar IDX — Real-Time Maret', 'Rp 300.000'],
                                ['📊 Free Float Screener + Warning Flag', 'Rp 150.000'],
                                ['🏢 Peta Konglomerat 18 Grup + 900 Ticker ++', 'Rp 150.000'],
                                ['👤 Public Figures & Politisi Portfolio', 'Rp 100.000'],
                                ['📥 CSV Export Semua Data', 'Rp 100.000'],
                                ['🎁 BONUS: Cheat Sheet 5 Tanda Whale (47 hal)', 'Rp 149.000'],
                                ['🎁 BONUS: Tutorial Deteksi Gorengan (37 hal)', 'Rp 99.000'],
                                ['🎁 BONUS: Watchlist Konglomerat 2025 (33 hal)', 'Rp 99.000'],
                            ].map(([item, price], i) => (
                                <div key={i} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 0',
                                    borderBottom: '1px solid #f1f5f9',
                                    gap: '16px',
                                }}>
                                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: item.includes('BONUS') ? '#f59e0b' : '#334155' }}>{item}</span>
                                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: '#94a3b8', whiteSpace: 'nowrap', textDecoration: 'line-through' }}>{price}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0 0', gap: '16px' }}>
                                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Total Nilai</span>
                                <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '18px', fontWeight: 800, color: '#94a3b8', textDecoration: 'line-through' }}>Rp 1.147.000</span>
                            </div>
                        </div>

                        {/* Price */}
                        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                            <div className="offer-price-old" style={{ marginBottom: '4px', color: '#64748b' }}>Nilai total Rp 1.147.000</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span className="offer-price-new" style={{ color: '#0f172a' }}>Rp 99.000</span>
                            </div>
                            <div className="badge-pill" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', margin: '0 auto' }}>
                                ⚡ Hemat 91% — Sekali Bayar
                            </div>
                        </div>

                        <div className="hero-btns" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button className="btn-primary" style={{ fontSize: '16px', padding: '18px 36px' }} onClick={() => navigate('/auth')}>
                                Akses Sekarang — Rp 99.000
                            </button>
                        </div>
                        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', color: '#64748b', marginTop: '16px', textAlign: 'center' }}>
                            Sekali bayar • Tanpa berlangganan • Langsung akses + 3 Bonus PDF
                        </p>
                    </div>
                </div>
            </section>

            {/* ── BONUS ── */}
            <section ref={bonusSection.ref} style={{ padding: '0 6% 80px' }}>
                <div className={`fade-up ${bonusSection.inView ? 'visible' : ''}`}>
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div className="section-eyebrow">Bonus Eksklusif</div>
                        <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px', marginBottom: '12px' }}>
                            3 PDF Bonus — <span className="gold-text">Total 117 Halaman</span>
                        </h2>
                        <p style={{ fontFamily: '"DM Sans", sans-serif', color: '#64748b', fontSize: '14px' }}>
                            Ditulis eksklusif oleh tim Saham Ultimate. Tidak dijual terpisah di mana pun.
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            {
                                num: '47',
                                color: '#3b82f6',
                                title: 'Cheat Sheet: 5 Tanda Whale Sudah Masuk',
                                desc: 'Panduan lengkap membaca sinyal kepemilikan institusi & smart money. Termasuk Whale Detection Scorecard, confluence method, studi kasus konglomerat IDX, psikologi investor, risk management framework, glossarium 15+ istilah, dan FAQ.',
                                tags: ['Holders Counting', 'Foreign Flow', 'Negosiasi Market', 'Free Float', 'Top Holder Change'],
                            },
                            {
                                num: '37',
                                color: '#10b981',
                                title: 'Tutorial: Deteksi Saham Gorengan via Free Float',
                                desc: 'Dari konsep dasar hingga teknik lanjutan. Anatomi saham gorengan, 5 pola manipulasi, zona bahaya free float, matrix analisis 2 dimensi, checklist 10 poin anti-gorengan, dan cara pakai screener Saham Ultimate step-by-step.',
                                tags: ['Free Float Zones', 'Anti-Gorengan', 'Pump & Dump', 'Screener Guide', 'Risk Matrix'],
                            },
                            {
                                num: '33',
                                color: '#8b5cf6',
                                title: 'Watchlist Konglomerat Indonesia 2025',
                                desc: 'Peta 18 grup konglomerat terbesar — tesis investasi, bull/bear case, dan rating bintang setiap saham dalam grup. Termasuk profil Prajogo, Salim, Djarum, Boy Thohir, Sinar Mas, Astra, dan rising stars. Plus master watchlist tier 1-3.',
                                tags: ['18 Grup Analisis', 'Bull/Bear Case', 'Star Rating', 'Master Watchlist', 'Rising Stars'],
                            },
                        ].map(({ num, color, title, desc, tags }) => (
                            <div key={title} className="bonus-item" style={{ borderColor: `${color}22` }}>
                                <div style={{
                                    minWidth: '56px',
                                    height: '56px',
                                    background: `${color}15`,
                                    border: `1px solid ${color}33`,
                                    borderRadius: '14px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <span style={{ fontSize: '18px', fontWeight: 800, color, lineHeight: 1 }}>{num}</span>
                                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '9px', color: `${color}99`, fontWeight: 600 }}>HAL</span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>{title}</h3>
                                    <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: '#64748b', lineHeight: 1.65, marginBottom: '10px' }}>{desc}</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {tags.map(t => (
                                            <span key={t} className="badge-pill" style={{ background: `${color}10`, border: `1px solid ${color}25`, color: `${color}cc`, fontSize: '11px' }}>{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── INTEGRITY ── */}
            <section ref={integritySection.ref} style={{ padding: '0 6% 80px' }}>
                <div className={`fade-up ${integritySection.inView ? 'visible' : ''}`}>
                    <div style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border)',
                        borderRadius: '24px',
                        padding: 'clamp(28px, 5vw, 52px)',
                    }}>
                        <div style={{ marginBottom: '32px' }}>
                            <div className="section-eyebrow">Transparansi</div>
                            <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px', marginBottom: '12px' }}>
                                Kami Berintegritas
                            </h2>
                            <p style={{ fontFamily: '"DM Sans", sans-serif', color: '#64748b', fontSize: '14px', maxWidth: '540px', lineHeight: 1.7 }}>
                                Setiap produk yang dijual anggota <strong style={{ color: '#0f172a' }}>eL Vision</strong> menggunakan arsitektur kami diwajibkan untuk menampilkan review dari <em>verified buyer</em> — bukan testimoni anonim, bukan ulasan palsu. Review hanya bisa ditulis oleh akun yang sudah melakukan pembelian terverifikasi.
                            </p>
                        </div>

                        <div>
                            {[
                                { icon: '✓', title: 'Verified Buyer Only', desc: 'Review hanya bisa ditulis setelah pembelian dikonfirmasi. Tidak ada akun yang bisa review tanpa transaksi nyata.' },
                                { icon: '✓', title: 'Email Tersensor untuk Privasi', desc: 'Identitas reviewer ditampilkan dalam format email tersensor (contoh: senaditsr***@hotmail.com) untuk melindungi privasi sekaligus membuktikan keaslian.' },
                                { icon: '✓', title: 'Login untuk Tulis Review', desc: 'Hanya pengguna yang sudah login dengan akun terverifikasi yang bisa menulis review. Tidak bisa dimanipulasi dari luar.' },
                                { icon: '✓', title: 'Data Bersumber dari KSEI', desc: 'Semua data kepemilikan bersumber langsung dari KSEI — kami tidak membuat, memodifikasi, atau menginterpretasikan ulang data mentah.' },
                                { icon: '✓', title: 'Bukan Saran Investasi', desc: 'Kami data platform, bukan advisor investasi. Semua keputusan beli/jual adalah tanggung jawab penuh pengguna. Kami tidak pernah merekomendasikan saham.' },
                            ].map(({ icon, title, desc }) => (
                                <div key={title} className="integrity-row">
                                    <div style={{ width: '28px', height: '28px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '13px', color: '#22c55e', fontWeight: 700 }}>{icon}</div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a', marginBottom: '2px' }}>{title}</div>
                                        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>{desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── REVIEWS ── */}
            <section ref={reviewSection.ref} style={{ padding: '0 6% 80px' }}>
                <div className={`fade-up ${reviewSection.inView ? 'visible' : ''}`}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div className="section-eyebrow">Review Terverifikasi</div>
                        <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px', marginBottom: '8px' }}>
                            Apa Kata 500+ Pembeli
                        </h2>
                        <p style={{ fontFamily: '"DM Sans", sans-serif', color: '#64748b', fontSize: '13px' }}>
                            Menampilkan 10 dari 500 review terverifikasi •{' '}
                            <button
                                onClick={() => setLoginPrompt(true)}
                                style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', fontSize: '13px', textDecoration: 'underline' }}
                            >
                                Login untuk menulis review
                            </button>
                        </p>
                    </div>

                    {/* Summary Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '20px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '42px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>4.9</div>
                            <StarRating rating={5} />
                            <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', color: '#475569', marginTop: '2px' }}>dari 500+ ulasan</div>
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            {[['5 bintang', 91], ['4 bintang', 7], ['3 bintang', 2]].map(([label, pct]) => (
                                <div key={String(label)} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', color: '#64748b', width: '60px' }}>{label}</span>
                                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: '#f59e0b', borderRadius: '3px' }} />
                                    </div>
                                    <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', color: '#475569', width: '28px' }}>{pct}%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Review Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                        {visibleReviews.map(r => (
                            <div key={r.id} className="review-card">
                                <div className="review-name-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{r.email}</span>
                                            {r.badge && (
                                                <span className="badge-pill" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#3b82f6', fontSize: '10px' }}>{r.badge}</span>
                                            )}
                                            {r.verified && (
                                                <span className="badge-pill" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#16a34a', fontSize: '10px' }}>
                                                    ✓ Verified Buyer
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <StarRating rating={r.rating} />
                                        <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '11px', color: '#334155', marginTop: '2px' }}>{r.date}</div>
                                    </div>
                                </div>
                                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: '#94a3b8', lineHeight: 1.7 }}>{r.text}</p>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setReviewPage(i)}
                                style={{
                                    width: '32px', height: '32px',
                                    borderRadius: '8px',
                                    border: i === reviewPage ? '1px solid var(--blue)' : '1px solid var(--border)',
                                    background: i === reviewPage ? 'rgba(59,130,246,0.15)' : 'transparent',
                                    color: i === reviewPage ? '#93c5fd' : '#475569',
                                    cursor: 'pointer',
                                    fontFamily: '"Syne", sans-serif',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    {/* Write review prompt */}
                    <div style={{ textAlign: 'center', marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
                        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: '#475569', marginBottom: '10px' }}>
                            Sudah beli dan ingin berbagi pengalaman?
                        </p>
                        <button
                            className="btn-ghost"
                            style={{ padding: '10px 24px', fontSize: '13px' }}
                            onClick={() => navigate('/auth')}
                        >
                            Login untuk Tulis Review →
                        </button>
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section ref={faqSection.ref} style={{ padding: '0 6% 80px' }}>
                <div className={`fade-up ${faqSection.inView ? 'visible' : ''}`} style={{ maxWidth: '700px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                        <div className="section-eyebrow">FAQ</div>
                        <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px' }}>
                            Pertanyaan<br /><span className="gradient-text">yang Sering Ditanya</span>
                        </h2>
                    </div>

                    <div>
                        {FAQS.map((faq, i) => (
                            <div key={i} className="faq-item">
                                <div className="faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                                    <span>{faq.q}</span>
                                    <span style={{ color: openFaq === i ? 'var(--blue)' : '#475569', fontSize: '20px', fontWeight: 300, flexShrink: 0, transition: 'transform 0.3s', transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                                </div>
                                <div className={`faq-a ${openFaq === i ? 'open' : ''}`}>{faq.a}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FINAL CTA ── */}
            <section style={{ padding: '0 6% 100px', textAlign: 'center' }}>
                <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                    <div className="section-eyebrow" style={{ textAlign: 'center' }}>Mulai Sekarang</div>
                    <h2 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 800, color: '#000', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '20px' }}>
                        Stop Tebak-tebakan.<br /><span className="gradient-text">Baca Jejaknya.</span>
                    </h2>
                    <p style={{ fontFamily: '"DM Sans", sans-serif', color: '#64748b', fontSize: '15px', marginBottom: '36px', lineHeight: 1.7 }}>
                        Ribuan investor ritel sudah menggunakan data ini. Sementara kamu baca halaman ini, whale mungkin sedang akumulasi saham yang besok harganya bergerak.
                    </p>
                    <div className="hero-btns" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn-primary" style={{ fontSize: '16px', padding: '18px 36px' }} onClick={() => navigate('/auth')}>
                            Akses Sekarang — Rp 99.000
                        </button>
                    </div>
                    <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', color: '#64748b', marginTop: '16px' }}>
                        Sekali bayar • Tanpa berlangganan • Langsung akses + 3 Bonus PDF
                    </p>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer style={{ padding: '40px 6%', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    SAHAM<span className="gradient-text">ULTIMATE</span>
                </div>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', color: '#334155', textAlign: 'center' }}>
                    © 2026 Saham Ultimate • Arsitektur oleh eL Vision • Data: KSEI IDX • Bukan Saran Investasi
                </p>
                <div style={{ display: 'flex', gap: '16px' }}>
                    {['Privacy', 'Terms', 'Support'].map(l => (
                        <span key={l} style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', color: '#334155', cursor: 'pointer' }}>{l}</span>
                    ))}
                </div>
            </footer>

            {/* ── LOGIN PROMPT MODAL ── */}
            {loginPrompt && (
                <div
                    onClick={() => setLoginPrompt(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{ background: '#0d1422', border: '1px solid var(--border)', borderRadius: '20px', padding: '40px 36px', maxWidth: '400px', width: '100%', textAlign: 'center' }}
                    >
                        <div style={{ fontSize: '36px', marginBottom: '16px' }}>🔒</div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Login untuk Review</h3>
                        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: '#64748b', lineHeight: 1.7, marginBottom: '24px' }}>
                            Hanya <strong style={{ color: '#0f172a' }}>verified buyer</strong> yang bisa menulis review. Login dengan akun kamu untuk memastikan keaslian ulasan.
                        </p>
                        <button className="btn-primary" style={{ width: '100%', marginBottom: '10px' }} onClick={() => navigate('/auth')}>
                            Login / Daftar
                        </button>
                        <button className="btn-ghost" style={{ width: '100%', fontSize: '13px', padding: '12px' }} onClick={() => setLoginPrompt(false)}>
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}