import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';

const APP_VERSION = '2026.03.12.02'; // <-- Change this to force cache clear

if (typeof window !== 'undefined' && localStorage.getItem('v_cache') !== APP_VERSION) {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
    }
    if ('caches' in window) {
        caches.keys().then(names => names.forEach(n => caches.delete(n)));
    }
    localStorage.setItem('v_cache', APP_VERSION);
    window.location.reload();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider>
            <App />
        </ThemeProvider>
    </React.StrictMode>,
);
