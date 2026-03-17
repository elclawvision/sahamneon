import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';

const APP_VERSION = '2026.03.18.06'; // <-- Match today's date

if (typeof window !== 'undefined') {
    const currentCache = localStorage.getItem('v_cache');
    if (currentCache && currentCache !== APP_VERSION) {
        localStorage.clear(); // Clear everything once
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
        }
        localStorage.setItem('v_cache', APP_VERSION);
        window.location.reload();
    } else {
        localStorage.setItem('v_cache', APP_VERSION);
    }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </React.StrictMode>,
);
