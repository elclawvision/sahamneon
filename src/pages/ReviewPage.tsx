import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import { Mail, Lock, Eye, EyeOff, Star, Trash2, ArrowLeft } from "lucide-react";

export default function ReviewPage() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [userEmailSession, setUserEmailSession] = useState("");
    
    // Review States
    const [userReview, setUserReview] = useState<any>(null);
    const [reviewText, setReviewText] = useState("");
    const [reviewRating, setReviewRating] = useState(0);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchUserReview = async (email: string) => {
        const { data } = await supabase.from('saham_reviews').select('*').eq('user_email', email).maybeSingle();
        if (data) {
            setUserReview(data);
            setReviewText(data.comment);
            setReviewRating(data.rating);
        } else {
            setUserReview(null);
            setReviewText("");
            setReviewRating(0);
        }
    };

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setIsLoggedIn(true);
                setUserEmailSession(session.user.email || "");
                fetchUserReview(session.user.email || "");
            }
        };
        checkSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setIsLoggedIn(true);
                setUserEmailSession(session.user.email || "");
                fetchUserReview(session.user.email || "");
            } else {
                setIsLoggedIn(false);
                setUserEmailSession("");
                setUserReview(null);
            }
        });

        return () => { authListener.subscription.unsubscribe(); };
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoginLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: loginEmail.trim().toLowerCase(),
                password: loginPassword,
            });
            if (error) throw error;
            if (data.user) {
                toast.success("Login Berhasil");
            }
        } catch (error: any) {
            toast.error(error.message || "Login Gagal");
        } finally {
            setIsLoginLoading(false);
        }
    };

    const submitReview = async () => {
        if (!reviewRating) {
            toast.error("Silahkan beri rating bintang terlebih dahulu.");
            return;
        }
        if (!reviewText || reviewText.trim() === '') {
            toast.error("Ulasan tidak boleh kosong.");
            return;
        }
        setIsActionLoading(true);
        try {
            const payload = {
                user_email: userEmailSession,
                name: userEmailSession.split('@')[0],
                rating: reviewRating,
                comment: reviewText.trim()
            };
            if (userReview) {
                const { error } = await supabase.from('saham_reviews').update(payload).eq('id', userReview.id);
                if (error) throw error;
                toast.success("Review diperbarui");
            } else {
                const { error } = await supabase.from('saham_reviews').insert([payload]);
                if (error) throw error;
                toast.success("Review ditambahkan");
            }
            fetchUserReview(userEmailSession);
        } catch (error: any) {
            toast.error(error.message || "Gagal submit review");
        } finally {
            setIsActionLoading(false);
        }
    };

    const deleteReview = async () => {
        if (!userReview) return;
        if (!confirm("Hapus review anda?")) return;
        setIsActionLoading(true);
        try {
            const { error } = await supabase.from('saham_reviews').delete().eq('id', userReview.id);
            if (error) throw error;
            toast.success("Review dihapus");
            fetchUserReview(userEmailSession);
        } catch (error: any) {
            toast.error(error.message || "Gagal menghapus review");
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <div className="review-container">
            <style>{`
                .review-container {
                    min-height: 100vh;
                    background: #0f172a;
                    color: #f8fafc;
                    font-family: 'Inter', system-ui, sans-serif;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 2rem 1rem;
                }
                .review-card {
                    width: 100%;
                    max-width: 500px;
                    background: #1e293b;
                    border: 1px solid #334155;
                    border-radius: 20px;
                    padding: 2.5rem;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
                }
                .nav-back {
                    align-self: flex-start;
                    margin-bottom: 2rem;
                    background: #334155;
                    border: none;
                    color: white;
                    padding: 0.75rem;
                    border-radius: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                    max-width: fit-content;
                }
                .header {
                    text-align: center;
                    margin-bottom: 2rem;
                }
                .header h1 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(to right, #fbbf24, #f59e0b);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .header p {
                    color: #94a3b8;
                    font-size: 0.9375rem;
                }
                .form-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 600;
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
                    color: #64748b;
                    width: 18px;
                    height: 18px;
                }
                .input-field {
                    width: 100%;
                    background: #0f172a;
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 0.75rem 1rem 0.75rem 2.75rem;
                    color: white;
                    outline: none;
                }
                .btn-submit {
                    width: 100%;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    padding: 0.875rem;
                    font-size: 0.9375rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-submit:hover { background: #1d4ed8; }
                .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
                
                .star-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    margin-right: 0.5rem;
                    transition: transform 0.1s;
                }
                .star-btn:hover { transform: scale(1.1); }
                
                .textarea-field {
                    width: 100%;
                    background: #0f172a;
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 1rem;
                    color: white;
                    min-height: 120px;
                    margin-bottom: 1.5rem;
                    font-family: inherit;
                    resize: vertical;
                    outline: none;
                }
                .textarea-field:focus { border-color: #2563eb; }
                
                .action-row {
                    display: flex;
                    gap: 0.75rem;
                }
                .btn-delete {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    padding: 0.75rem;
                    border-radius: 12px;
                    cursor: pointer;
                }
            `}</style>

            <div style={{ width: '100%', maxWidth: '500px' }}>
                <button onClick={() => navigate('/lp')} className="nav-back">
                    <ArrowLeft size={20} /> Kembali ke Landing Page
                </button>

                <div className="review-card">
                    <div className="header">
                        <h1>Review Saham Ultimate</h1>
                        <p>Berikan ulasan jujur anda untuk membantu orang lain belajar.</p>
                    </div>

                    {!isLoggedIn ? (
                        <form onSubmit={handleLogin}>
                            <label className="form-label">Email Pembelian</label>
                            <div className="input-wrap">
                                <Mail className="input-icon" />
                                <input
                                    className="input-field"
                                    type="email"
                                    value={loginEmail}
                                    onChange={e => setLoginEmail(e.target.value)}
                                    placeholder="email@anda.com"
                                    required
                                />
                            </div>

                            <label className="form-label">Password</label>
                            <div className="input-wrap">
                                <Lock className="input-icon" />
                                <input
                                    className="input-field"
                                    type={showPassword ? "text" : "password"}
                                    value={loginPassword}
                                    onChange={e => setLoginPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <button className="btn-submit" type="submit" disabled={isLoginLoading}>
                                {isLoginLoading ? 'Memproses...' : 'Login untuk Review →'}
                            </button>
                            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                                * Gunakan email dan password saat anda membeli produk ini.
                            </p>
                        </form>
                    ) : (
                        <div style={{ animation: 'fadeUp 0.3s ease-out' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                                    Halo, <strong>{userEmailSession.split('@')[0]}</strong>
                                </span>
                                <button
                                    onClick={() => supabase.auth.signOut()}
                                    style={{ background: 'none', border: '1px solid #ef4444', color: '#ef4444', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                                >
                                    Logout
                                </button>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label">Rating Anda</label>
                                <div style={{ display: 'flex' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            className="star-btn"
                                            onClick={() => setReviewRating(star)}
                                        >
                                            <Star
                                                size={32}
                                                fill={reviewRating >= star ? "#fbbf24" : "transparent"}
                                                color={reviewRating >= star ? "#fbbf24" : "#475569"}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <label className="form-label">Ulasan Jujur</label>
                            <textarea
                                className="textarea-field"
                                value={reviewText}
                                onChange={e => setReviewText(e.target.value)}
                                placeholder="Tuliskan pengalaman anda menggunakan Saham Ultimate..."
                            />

                            <div className="action-row">
                                <button
                                    className="btn-submit"
                                    onClick={submitReview}
                                    disabled={isActionLoading}
                                >
                                    {isActionLoading ? 'Memproses...' : (userReview ? 'Update Review' : 'Kirim Review')}
                                </button>
                                {userReview && (
                                    <button
                                        className="btn-delete"
                                        onClick={deleteReview}
                                        disabled={isActionLoading}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
