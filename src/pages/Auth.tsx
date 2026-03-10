import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Helper custom SVG icons
const MailIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const LockIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;

export default function Auth() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [currentView, setCurrentView] = useState<'auth' | 'forgot-password' | 'reset-sent'>('auth');
    const [activeTab, setActiveTab] = useState<'login' | 'signup'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('auth_active_tab') as 'login' | 'signup') || 'login';
        }
        return 'login';
    });

    useEffect(() => {
        localStorage.setItem('auth_active_tab', activeTab);
    }, [activeTab]);

    const [errorMsg, setErrorMsg] = useState("");

    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [signupData, setSignupData] = useState({ email: '', password: '', confirmPassword: '' });
    const [forgotData, setForgotData] = useState({ email: '' });

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                navigate(-1); // Go back to where they came from
            }
        };
        checkUser();
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: loginData.email.trim().toLowerCase(),
                password: loginData.password,
            });
            if (error) throw error;
            navigate("/");
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        if (signupData.password !== signupData.confirmPassword) {
            setErrorMsg("Passwords do not match.");
            return;
        }
        setIsLoading(true);
        try {
            const email = signupData.email.trim().toLowerCase();
            const { error } = await supabase.auth.signUp({
                email,
                password: signupData.password,
            });

            if (error) {
                if (error.message.toLowerCase().includes('already registered')) {
                    // Auto-migrate to login
                    const { error: loginError } = await supabase.auth.signInWithPassword({
                        email,
                        password: signupData.password
                    });
                    if (loginError) throw loginError;
                    navigate("/");
                    return;
                }
                throw error;
            }
            navigate("/");
        } catch (error: any) {
            setErrorMsg(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgot = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsLoading(true);
        try {
            const { error } = await supabase.functions.invoke('send-reset-password-email', {
                body: {
                    email: forgotData.email.trim().toLowerCase(),
                    redirectTo: `https://app.elvisiongroup.com/reset-password?return=${window.location.origin}`
                }
            });
            if (error) throw error;
            setCurrentView('reset-sent');
        } catch (error: any) {
            setErrorMsg("Error sending reset email: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // UI Styles
    const containerStyle: React.CSSProperties = {
        minHeight: "100vh", backgroundColor: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "Inter, system-ui, sans-serif"
    };
    const cardStyle: React.CSSProperties = {
        width: "100%", maxWidth: 400, backgroundColor: "#1e293b", borderRadius: 16, padding: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.4)"
    };
    const inputContainer: React.CSSProperties = {
        position: "relative", marginBottom: 16
    };
    const inputStyle: React.CSSProperties = {
        width: "100%", backgroundColor: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "12px 12px 12px 40px", color: "white", fontSize: 14, outline: "none", boxSizing: "border-box"
    };
    const iconStyle: React.CSSProperties = {
        position: "absolute", left: 12, top: 12, color: "#64748b"
    };
    const btnStyle: React.CSSProperties = {
        width: "100%", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: 8, padding: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 8
    };
    const tabBtn: React.CSSProperties = {
        flex: 1, padding: 10, background: "transparent", border: "none", color: "#94a3b8", fontWeight: 600, cursor: "pointer", transition: "all .2s"
    };

    if (currentView === 'reset-sent') {
        return (
            <div style={containerStyle}>
                <div style={{ ...cardStyle, textAlign: "center" as const }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>📧</div>
                    <h2 style={{ color: "white", margin: "0 0 8px 0" }}>Check Your Email</h2>
                    <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>Reset instructions have been sent.</p>
                    <button onClick={() => setCurrentView('auth')} style={btnStyle}>Back to Login</button>
                </div>
            </div>
        );
    }

    if (currentView === 'forgot-password') {
        return (
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <h2 style={{ color: "white", margin: "0 0 8px 0", textAlign: "center" as const }}>Reset Password</h2>
                    <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24, textAlign: "center" as const }}>We will send you a secure link.</p>
                    {errorMsg && <div style={{ background: "#7f1d1d", color: "#fca5a5", padding: 10, borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{errorMsg}</div>}
                    <form onSubmit={handleForgot}>
                        <div style={inputContainer}>
                            <div style={iconStyle}><MailIcon /></div>
                            <input style={inputStyle} type="email" placeholder="email@example.com" value={forgotData.email} onChange={e => setForgotData({ email: e.target.value })} required />
                        </div>
                        <button type="submit" style={btnStyle} disabled={isLoading}>{isLoading ? "Sending..." : "Send Reset Link"}</button>
                    </form>
                    <button onClick={() => setCurrentView('auth')} style={{ ...btnStyle, background: "transparent", border: "1px solid #334155", marginTop: 16 }}>Back to Login</button>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={{ width: "100%", maxWidth: 400 }}>
                <div style={{ textAlign: "center" as const, marginBottom: 24 }}>
                    <h1 style={{ color: "white", fontSize: 24, margin: "0 0 8px 0", fontWeight: 800 }}>Welcome Back</h1>
                    <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>Login to access your premium dashboard</p>
                </div>

                <div style={cardStyle}>
                    <div style={{ display: "flex", background: "#0f172a", borderRadius: 8, padding: 4, marginBottom: 24 }}>
                        <button onClick={() => { setActiveTab('login'); setErrorMsg(""); }} style={{ ...tabBtn, background: activeTab === 'login' ? '#1e293b' : 'transparent', color: activeTab === 'login' ? 'white' : '#64748b', borderRadius: 6 }}>Login</button>
                        <button onClick={() => { setActiveTab('signup'); setErrorMsg(""); }} style={{ ...tabBtn, background: activeTab === 'signup' ? '#1e293b' : 'transparent', color: activeTab === 'signup' ? 'white' : '#64748b', borderRadius: 6 }}>Daftar</button>
                    </div>

                    {errorMsg && <div style={{ background: "#7f1d1d", color: "#fca5a5", padding: 10, borderRadius: 6, fontSize: 13, marginBottom: 16 }}>{errorMsg}</div>}

                    {activeTab === 'login' ? (
                        <form onSubmit={handleLogin}>
                            <div style={inputContainer}>
                                <div style={iconStyle}><MailIcon /></div>
                                <input style={inputStyle} type="email" placeholder="email@example.com" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} required />
                            </div>
                            <div style={inputContainer}>
                                <div style={iconStyle}><LockIcon /></div>
                                <input style={inputStyle} type="password" placeholder="••••••••" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} required />
                            </div>
                            <div style={{ textAlign: "right", marginBottom: 16 }}>
                                <span onClick={() => setCurrentView('forgot-password')} style={{ color: "#3b82f6", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>Lupa Password?</span>
                            </div>
                            <button type="submit" style={btnStyle} disabled={isLoading}>{isLoading ? "Mohon Tunggu..." : "Masuk"}</button>
                        </form>
                    ) : (
                        <form onSubmit={handleSignup}>
                            <div style={inputContainer}>
                                <div style={iconStyle}><MailIcon /></div>
                                <input style={inputStyle} type="email" placeholder="email@example.com" value={signupData.email} onChange={e => setSignupData({ ...signupData, email: e.target.value })} required />
                            </div>
                            <div style={inputContainer}>
                                <div style={iconStyle}><LockIcon /></div>
                                <input style={inputStyle} type="password" placeholder="Password (min 6 char)" value={signupData.password} onChange={e => setSignupData({ ...signupData, password: e.target.value })} required minLength={6} />
                            </div>
                            <div style={inputContainer}>
                                <div style={iconStyle}><LockIcon /></div>
                                <input style={inputStyle} type="password" placeholder="Ulangi Password" value={signupData.confirmPassword} onChange={e => setSignupData({ ...signupData, confirmPassword: e.target.value })} required minLength={6} />
                            </div>
                            <button type="submit" style={{ ...btnStyle, background: "#8b5cf6" }} disabled={isLoading}>{isLoading ? "Membuat Akun..." : "Buat Akun Gratis"}</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
