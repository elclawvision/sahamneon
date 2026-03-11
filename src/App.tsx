import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SahamPage from './pages/Saham';
import Auth from './pages/Auth';
import FreeFloatScreener from './pages/FreeFloatScreener';
import StockSheets from './pages/StockSheets';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<FreeFloatScreener />} />
                <Route path="/saham" element={<SahamPage />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/free-float" element={<FreeFloatScreener />} />
                <Route path="/sheets" element={<StockSheets />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
