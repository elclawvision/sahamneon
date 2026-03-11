import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import StockSheets from './pages/StockSheets';
import LandingPage from './pages/LandingPage';
import { supabase } from './lib/supabase';

function App() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) return null;

    return (
        <BrowserRouter>
            <Routes>
                {/* LP always accessible */}
                <Route path="/lp" element={<LandingPage />} />
                
                {/* Auth Page */}
                <Route path="/auth" element={<Auth />} />

                {/* Main Entry: Redirect to sheets if logged in, else auth (or LP if you prefer) */}
                <Route path="/" element={session ? <Navigate to="/sheets" replace /> : <Navigate to="/auth" replace />} />

                {/* Protected Sheets */}
                <Route path="/sheets" element={session ? <StockSheets /> : <Navigate to="/auth" replace />} />

                {/* Legacy cleanup redirect */}
                <Route path="/saham" element={<Navigate to="/sheets" replace />} />
                <Route path="/free-float" element={<Navigate to="/sheets" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
