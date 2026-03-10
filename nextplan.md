# Saham SaaS Roadmap & Next Plan (Phase 5)

## 📌 Status Saat Ini (Berhasil Dicapai)
1. **Validasi Frontend Lulus:** Seluruh tampilan React (`Saham.tsx`) berhasil menarik UI mutlak dari `supabase.from()` menyesuaikan Tab masing-masing.
2. **Data Bersih & Independen:** Tidak ada lagi campur-aduk data milik user pribadi (`clients`, `investors`, `wallets`).
3. **Automasi Berjalan:** Script Deno (_Edge Function_) sudah dikonfigurasi sukses mengambil Data dari _Yahoo Finance Query V8_.

## 🚀 Rencana Fase 5: Memperkaya Isi "Screener" & "Whale Tracker"
Fase ini berfokus memaksimalkan algoritma backend (_pencakar_) bukan lagi menggambar UI, untuk membuat Dashboard Saham terasa "Sangat Pro" tanpa repot.

### 1. 🐋 Membangun Mesin Deteksi "Paus" Sebenarnya (Whale API)
- Mengembangkan Script Python/Deno yang secara harian (_cron job_) menyapu Data Transaksi KSEI/IDX (_Foreign Net Buy/Sell_).
- Skrip akan otomatis melemparkan (insert) baris baru logika pintar ke `saham_tab_whale_tracker` seperti: `"Asing akumulasi 400M di BBCA hari ini"`.
- Jika ini selesai, tab **Whale Tracker** Bapak di UI akan punya notifikasi *Alert* asli!

### 2. 🕸 Koneksi Jaringan Konglomerasi (The Real Spider Web)
- Saat ini data jaringan konglomerasi (Grup Salim, Djarum, dll) sudah di dalam Tabel (`saham_tab_konglomerat`) tapi masih berupa data rintisan statis (_Seed Data SQ_L).
- Skrip Backend akan ditugaskan untuk menghitung "Total Market Cap" aktual (_berdasarkan persentase Free Float x Last Price x Shares_) untuk Grup Induk.
- Cap (Kapitalisasi Jaringan) akan otomatis di-*update* seiring naik-turunnya harga agregat, menjadikannya dinamis.

### 3. 💳 Setup Gerbang Pembayaran Otomatis (Midtrans / Stripe)
- Saat ini tombol `LockGate` "Buka Akses ->" hanya memanggil Form Login.
- Kedepan, ketika Visitor berhasil mendaftar, sistem harus mengunci mereka sebagai akun `GUEST`.
- Mengintegrasikan webhook *Payment Gateway* yang mana saat mereka membayar subskripsi, *Role* di Supabase berubah otomatis menjadi `PREMIUM`.

### 4. 🗄 Integrasi AI Spotlight (Agent Langchain)
- Membedah RAG (*Retrieval Augmented Generation*): AI Chatbot `AIChatbot.tsx` harus ditautkan ke tabel `saham_tab_overview` dkk agar AI bisa memberikan analisis instan: *"Beri saya insight BREN hari ini" -> AI memeriksa data di Supabase untuk merangkum secara otomatis.*
