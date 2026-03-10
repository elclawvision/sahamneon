import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SahamDashboard from './pages/Saham';
import Auth from './pages/Auth';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<SahamDashboard />} />
                <Route path="/saham" element={<SahamDashboard />} />
                <Route path="/auth" element={<Auth />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
