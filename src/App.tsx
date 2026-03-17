import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import StockSheets from './pages/StockSheets';
import LandingPage from './pages/LandingPage';
import DemoDashboard from './pages/DemoDashboard';
import Payment from './pages/Payment';
import ReviewPage from './pages/ReviewPage';
import { authClient } from './lib/auth';
import { Toaster } from 'sonner';

function App() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authClient.getSession().then((result) => {
            if (result.data?.session) {
                setSession(result.data.session);
            }
            setLoading(false);
        });

        // Neon authClient doesn't have an equivalent onAuthStateChange yet in the same way,
        // so we rely on periodic checks or manual updates if needed.
        // For now, getSession at startup is the main flow.
    }, []);

    if (loading) return null;

    return (
        <BrowserRouter>
            <Routes>
                {/* LP always accessible */}
                <Route path="/lp" element={<LandingPage />} />
                
                {/* Auth Page */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Payment Page */}
                <Route path="/payment" element={<Payment />} />

                {/* Review Page */}
                <Route path="/review" element={<ReviewPage />} />

                {/* Demo Page: Always accessible */}
                <Route path="/demo" element={<DemoDashboard />} />

                {/* Main Entry: Redirect to sheets if logged in, else LP */}
                <Route path="/" element={session ? <Navigate to="/sheets" replace /> : <Navigate to="/lp" replace />} />

                {/* Protected Sheets */}
                <Route path="/sheets" element={session ? <StockSheets /> : <Navigate to="/lp" replace />} />

                {/* Legacy cleanup redirect */}
                <Route path="/saham" element={<Navigate to="/sheets" replace />} />
                <Route path="/free-float" element={<Navigate to="/sheets" replace />} />
            </Routes>
            <style>{`
                [data-sonner-toaster] {
                    z-index: 999999 !important;
                }
            `}</style>
            <Toaster position="top-center" richColors closeButton toastOptions={{ style: { zIndex: 999999 } }} />
        </BrowserRouter>
    );
}

export default App;
