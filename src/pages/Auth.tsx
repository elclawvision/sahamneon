import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { sql } from '../lib/db';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Zap, ShieldCheck, ArrowLeft, KeyRound } from 'lucide-react';

// Helper custom SVG icons
const Sparkline = ({ up }: { up: boolean }) => (
    <svg width="60" height="24" viewBox="0 0 60 24" fill="none">
        <path
            d={up ? "M0 20L10 15L20 18L30 8L40 12L50 2L60 5" : "M0 5L10 12L20 8L30 18L40 15L50 22L60 20"}
            stroke={up ? "#22c55e" : "#ef4444"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default function Auth() {
    const navigate = useNavigate();
    const { session, refreshSession } = useAuth();
    const [email, setEmail] = useState("");
    const [pass, setPass] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [view, setView] = useState<'login' | 'signup' | 'forgot-password'>('login');
    const [tick, setTick] = useState(0);

    useEffect(() => {
        if (session) navigate('/sheets', { replace: true });
    }, [session, navigate]);

    useEffect(() => {
        const t = setInterval(() => setTick(x => x + 1), 60);
        return () => clearInterval(t);
    }, []);

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!email || !pass) { toast.error("Email dan password wajib diisi."); return; }
        setLoading(true);
        
        try {
            const cleanedEmail = email.trim().toLowerCase().replace(/\s/g, '');

            // STEP 1: Try normal sign-in (may THROW on 401)
            let signInResult: any = null;
            let signInError: any = null;
            try {
                signInResult = await authClient.signIn.email({
                    email: email.trim(),
                    password: pass,
                });
                if (signInResult.error) {
                    signInError = signInResult.error;
                    signInResult = null;
                }
            } catch (err) {
                signInError = err;
            }

            // STEP 2: If sign-in failed, try fallback auto-registration
            if (signInError) {
                console.log("Neon SignIn failed, running fallback...", signInError);

                // Fallback 1: Check if this is a PAID user who hasn't registered in Neon Auth yet
                const paidCheck = await sql`
                    SELECT * FROM global_product 
                    WHERE (LOWER(REPLACE(email, ' ', '')) = ${cleanedEmail} OR email ILIKE ${'%' + email.trim() + '%'})
                    AND status = 'PAID' 
                    ORDER BY created_at DESC
                    LIMIT 1
                `;

                if (paidCheck && paidCheck.length > 0) {
                    const payment = paidCheck[0];
                    console.log("Paid user found, auto-registering in Neon Auth...");
                    
                    try {
                        // Register them in Neon Auth
                        const signupResult = await authClient.signUp.email({
                            email: email.trim(),
                            password: pass,
                            name: payment.name || 'Investor',
                        });
                        // signUp might also throw, handle both patterns
                        if (signupResult?.error) {
                            console.warn("SignUp returned error:", signupResult.error);
                        }

                        // Now sign them in
                        await authClient.signIn.email({
                            email: email.trim(),
                            password: pass,
                        });

                        // Ensure they are in saham_clients
                        await sql`
                            INSERT INTO saham_clients (user_email, status, joined_at, last_login)
                            VALUES (${cleanedEmail}, 'active', NOW(), NOW())
                            ON CONFLICT (user_email) DO UPDATE SET status = 'active', last_login = NOW()
                        `;

                        toast.success("Akun diaktifkan secara otomatis!");
                        await refreshSession();
                        navigate("/sheets");
                        return;
                    } catch (regErr: any) {
                        console.error("Auto-Registration Failed:", regErr);
                        toast.error("Gagal registrasi otomatis: " + (regErr.message || JSON.stringify(regErr)));
                        setLoading(false);
                        return;
                    }
                }

                // Fallback 2: Check if they are in saham_clients but lost their Neon Auth record
                const clientCheck = await sql`
                    SELECT * FROM saham_clients
                    WHERE (LOWER(REPLACE(user_email, ' ', '')) = ${cleanedEmail} OR user_email ILIKE ${'%' + email.trim() + '%'})
                    AND status = 'active'
                    ORDER BY joined_at DESC
                    LIMIT 1
                `;

                if (clientCheck && clientCheck.length > 0) {
                    const client = clientCheck[0];
                    console.log("Active client found, restoring Neon Auth...");
                    
                    try {
                        await authClient.signUp.email({
                            email: email.trim(),
                            password: pass,
                            name: client.name || 'Investor',
                        });

                        await authClient.signIn.email({
                            email: email.trim(),
                            password: pass,
                        });

                        await sql`
                            UPDATE saham_clients SET status = 'active', last_login = NOW()
                            WHERE user_email = ${client.user_email}
                        `;

                        toast.success("Login berhasil (akun direstorasi)!");
                        await refreshSession();
                        navigate("/sheets");
                        return;
                    } catch (restErr: any) {
                        console.error("Restoration Failed:", restErr);
                        toast.error("Gagal restorasi akun: " + (restErr.message || JSON.stringify(restErr)));
                        setLoading(false);
                        return;
                    }
                }

                // No fallback matched - show error
                toast.error("Email atau password salah.");
                setLoading(false);
                return;
            }

            // STEP 3: Sign-in succeeded - ensure user is in saham_clients
            if (signInResult?.data?.user) {
                const userEmail = signInResult.data.user.email;
                const clients = await sql`SELECT * FROM saham_clients WHERE LOWER(REPLACE(user_email, ' ', '')) = ${cleanedEmail} LIMIT 1`;
                const client = clients[0];

                if (client) {
                    await sql`UPDATE saham_clients SET last_login = ${new Date().toISOString()} WHERE user_email = ${client.user_email}`;
                    toast.success("Selamat datang kembali!");
                    await refreshSession();
                    navigate("/sheets");
                } else {
                    // In Neon Auth but not in saham_clients - check if they paid
                    const paidHistory = await sql`
                        SELECT * FROM global_product 
                        WHERE (LOWER(REPLACE(email, ' ', '')) = ${cleanedEmail})
                        AND status = 'PAID' 
                        LIMIT 1
                    `;

                    if (paidHistory && paidHistory.length > 0) {
                        await sql`
                            INSERT INTO saham_clients (user_email, status, joined_at, last_login)
                            VALUES (${userEmail.toLowerCase()}, 'active', NOW(), NOW())
                            ON CONFLICT (user_email) DO NOTHING
                        `;
                        toast.success("Akses diaktifkan!");
                        await refreshSession();
                        navigate("/sheets");
                    } else {
                        toast.error("Anda belum memiliki akses Saham Ultimate.");
                        await authClient.signOut();
                    }
                }
            }
        } catch (error: any) {
            console.error("Auth Error:", error);
            toast.error(error.message || "Terjadi kesalahan. Coba lagi.");
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !pass || !name) { toast.error("Semua data wajib diisi."); return; }
        setLoading(true);

        try {
            const signupResult = await authClient.signUp.email({
                email: email.trim(),
                password: pass,
                name: name.trim(),
            });

            if (signupResult.error) throw signupResult.error;

            // Immediately sign them in
            await authClient.signIn.email({
                email: email.trim(),
                password: pass,
            });

            // Create record in saham_clients
            await sql`
                INSERT INTO saham_clients (user_email, status, joined_at, last_login)
                VALUES (${email.trim()}, 'active', NOW(), NOW())
                ON CONFLICT (user_email) DO UPDATE SET status = 'active', last_login = NOW()
            `;

            toast.success("Pendaftaran berhasil!");
            await refreshSession();
            navigate("/sheets");
        } catch (error: any) {
            console.error("SignUp Error:", error);
            toast.error(error.message || "Gagal mendaftar.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        toast.info("Fitur reset password sedang dalam pemeliharaan (migrasi ke Neon). Silahkan hubungi admin.");
    };

    const dots = Array.from({ length: 32 }, (_, i) => ({
        x: (i % 8) * 13 + 2, y: Math.floor(i / 8) * 24 + 8,
        op: 0.06 + Math.sin(tick / 20 + i * 0.5) * 0.04
    }));

    return (
        <div className="auth-container">
            <style>{`
                .auth-container, .auth-container * {
                    box-sizing: border-box;
                }
                .auth-container {
                    --bg-page: #f8fafc;
                    --bg-card: #ffffff;
                    --text-primary: #0f172a;
                    --text-secondary: #475569;
                    --primary: #2563eb;
                    --primary-hover: #1d4ed8;
                    --border: #e2e8f0;
                    --input-bg: #fdfdfd;
                    
                    min-height: 100vh;
                    background: var(--bg-page);
                    color: var(--text-primary);
                    font-family: 'Inter', system-ui, sans-serif;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1.5rem;
                    position: relative;
                }

                .auth-card {
                    width: 100%;
                    max-width: 420px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    padding: 2.5rem;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
                    animation: fadeUp 0.5s ease-out;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .auth-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .auth-logo {
                    width: 72px;
                    height: auto;
                    margin-bottom: 1.25rem;
                }

                .auth-h1 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.025em;
                }

                .auth-p {
                    font-size: 0.9375rem;
                    color: var(--text-secondary);
                    line-height: 1.5;
                }

                .form-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .input-wrap {
                    position: relative;
                    margin-bottom: 1.25rem;
                }

                .input-icon {
                    position: absolute;
                    left: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #94a3b8;
                    width: 18px;
                    height: 18px;
                }

                .auth-input {
                    width: 100%;
                    background: var(--input-bg);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 0.75rem 1rem 0.75rem 2.75rem;
                    font-size: 0.9375rem;
                    color: var(--text-primary);
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }

                .auth-input:focus {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
                }

                .btn-eye {
                    position: absolute;
                    right: 0.875rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    display: flex;
                }

                .btn-submit {
                    width: 100%;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 0.875rem;
                    font-size: 0.9375rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.2s, transform 0.1s;
                    margin-top: 0.5rem;
                }

                .btn-submit:hover { background: var(--primary-hover); }
                .btn-submit:active { transform: scale(0.99); }
                .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

                .btn-ghost {
                    background: none;
                    border: none;
                    color: var(--primary);
                    font-weight: 600;
                    font-size: 0.875rem;
                    cursor: pointer;
                    padding: 0;
                }

                .btn-ghost:hover { text-decoration: underline; }

                .nav-back {
                    position: absolute;
                    top: 1.5rem;
                    left: 1.5rem;
                    width: 40px;
                    height: 40px;
                    background: white;
                    border: 1px solid var(--border);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: var(--text-primary);
                    transition: all 0.2s;
                }

                .nav-back:hover { background: #f1f5f9; }

                .tab-switcher {
                    display: flex;
                    background: #f1f5f9;
                    padding: 4px;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                }
                .tab-btn {
                    flex: 1;
                    border: none;
                    background: none;
                    padding: 8px;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s;
                }
                .tab-btn.active {
                    background: white;
                    color: var(--primary);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }
            `}</style>

            <button onClick={() => navigate('/lp')} className="nav-back">
                <ArrowLeft size={20} />
            </button>

            <div className="auth-card">
                <div className="auth-header">
                    <img src="/saham.png" alt="Logo" className="auth-logo" />
                    <h1 className="auth-h1">
                        {view === 'login' ? 'Selamat Datang' : view === 'signup' ? 'Buat Akun' : 'Lupa Password'}
                    </h1>
                    <p className="auth-p">
                        {view === 'login' 
                            ? 'Akses database Whale & Konglomerat IDX sekarang.' 
                            : view === 'signup'
                            ? 'Daftar sekarang untuk akses data IDX.'
                            : 'Masukkan email untuk instruksi reset password.'}
                    </p>
                </div>

                {(view === 'login' || view === 'signup') && (
                    <div className="tab-switcher">
                        <button 
                            className={`tab-btn ${view === 'login' ? 'active' : ''}`}
                            onClick={() => setView('login')}
                        >
                            Masuk
                        </button>
                        <button 
                            className={`tab-btn ${view === 'signup' ? 'active' : ''}`}
                            onClick={() => setView('signup')}
                        >
                            Daftar
                        </button>
                    </div>
                )}

                {view === 'login' || view === 'signup' ? (
                    <form onSubmit={view === 'login' ? handleLogin : handleSignUp}>
                        {view === 'signup' && (
                            <>
                                <label className="form-label">Nama Lengkap</label>
                                <div className="input-wrap">
                                    <KeyRound className="input-icon" />
                                    <input
                                        className="auth-input"
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Contoh: Sarah"
                                        required
                                    />
                                </div>
                            </>
                        )}
                        <label className="form-label">Email</label>
                        <div className="input-wrap">
                            <Mail className="input-icon" />
                            <input
                                className="auth-input"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@email.com"
                                required
                            />
                        </div>

                        <label className="form-label">Password</label>
                        <div className="input-wrap">
                            <Lock className="input-icon" />
                            <input 
                                className="auth-input"
                                type={showPassword ? "text" : "password"}
                                value={pass}
                                onChange={e => setPass(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="btn-eye">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {view === 'login' && (
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem', marginBottom: '1.25rem' }}>
                                <button type="button" onClick={() => setView('forgot-password')} className="btn-ghost">
                                    Lupa Password?
                                </button>
                            </div>
                        )}

                        <button className="btn-submit" type="submit" disabled={loading}>
                            {loading ? 'Memproses...' : view === 'login' ? 'Masuk →' : 'Daftar Akun →'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>
                                {view === 'login' ? 'Belum punya akses?' : 'Sudah punya akun?'}
                            </span>
                            <button 
                                type="button" 
                                onClick={() => view === 'login' ? setView('signup') : setView('login')} 
                                className="btn-ghost" 
                                style={{marginLeft: '0.5rem'}}
                            >
                                {view === 'login' ? 'Daftar Sekarang' : 'Masuk Saja'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleForgotPassword}>
                        <label className="form-label">Email</label>
                        <div className="input-wrap">
                            <Mail className="input-icon" />
                            <input
                                className="auth-input"
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@email.com"
                                required
                            />
                        </div>

                        <button className="btn-submit" type="submit" disabled={loading}>
                            {loading ? 'Mengirim...' : 'Kirim Link Reset →'}
                        </button>

                        <button type="button" onClick={() => setView('login')} className="btn-submit" style={{ background: '#f1f5f9', color: '#475569', marginTop: '0.75rem' }}>
                            Kembali ke Login
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
