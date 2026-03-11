# Saham Intel - Whale Tracking & Conglomerate Analysis

Saham Intel is a premium stock market intelligence platform for the Indonesian Stock Exchange (IDX), designed to match and exceed industrial standard tools like StockMap. It provides deep insights into institutional "Whale" movements, conglomerate cross-holdings, and high-value investor tracking.

## 🚀 Key Features

- **Live Tickers**: Real-time IDX stock price and volume tracking via GoAPI.
- **Whale Tracker**: Automated detection of institutional "Whale" movements (Advance/Retreat) based on shareholder count and concentration shifts.
- **Free Float Hunter**: Deep analysis of shareholder records to identify low-float opportunities.
- **Investor Watch**: Classification of big players into STRATEGIC vs FREE FLOAT categories using MSCI Index methodologies.
- **Conglomerates**: Interactive 3D visualization of business group cross-holdings (Salim, Djarum, Sinar Mas, etc.).
- **MSCI Screener**: Liquidity and float-based screening for potential MSCI inclusion.
- **Intel Report**: AI-powered daily market sentiment and sector pulse.
- **AI Spotlight**: Direct intelligence queries on stock entities and ownership structures.

## 🏗 Technology Stack

- **Frontend**: React, Vite, Framer Motion (Animations), Lucid Icons.
- **Backend/Database**: Supabase (PostgreSQL, Auth, Edge Functions).
- **Data Pipeline**: Python Scrapers/Bots (yfinance, GoAPI).
- **Architecture**: Specialized "Bot-per-Tab" architecture for robust real-time data ingestion.

## 🤖 Specialized Bots

The platform is powered by a set of automated bots located in `assist_code/`:

1.  **Ticker Bot**: Syncs official price and volume data from GoAPI.
2.  **Float Bot (`float_bot.py`)**: Performs deep scrapes of 720+ tickers to analyze institutional shareholder dynamics and detect Whale movements.
3.  **Whale Bot**: Detects volume anomalies and block trades.
4.  **Intel Bot (`saham-daily-reporter`)**: Generates automated daily intelligence reports.

## 🛠 Database Schema

Primary tables in Supabase include:
- `saham_tab_tickers`: Core stock data, holders metrics, and whale status.
- `saham_tab_whale_tracker`: History of institutional alerts.
- `saham_tab_konglomerat_v2`: Conglomerate nodes and caps.
- `saham_tab_investor_watch`: Key institutional player database.
- `saham_investor_types`: MSCI/KSEI classification rules.

## 🛡 Security

- **Single-Session Enforcement**: Prevents credential sharing by invalidating old sessions upon a new login.
- **Premium Lock Gate**: Role-based access control (RBAC) to ensure premium analytics are only viewable by authorized users.

---
*Targeted for March 2026 "Saleable Product" High-Value Release.*
