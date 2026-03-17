import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import StockSheets from './pages/StockSheets';
import LandingPage from './pages/LandingPage';
import DemoDashboard from './pages/DemoDashboard';
import Payment from './pages/Payment';
import ReviewPage from './pages/ReviewPage';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';

function App() {
    const { session, loading } = useAuth();

    if (loading) return null;

    return (
        <BrowserRouter>
            <Routes>
                {/* LP accessible; Redirection handled inside component if logged in */}
                <Route path="/lp" element={<LandingPage />} />
                
                {/* Auth Page: Redirection handled inside component if logged in */}
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
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
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
