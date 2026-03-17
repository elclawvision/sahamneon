import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../lib/auth';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff, CheckCircle, Zap, ShieldCheck } from 'lucide-react';

/**
 * ResetPassword.tsx
 * Premium Reset Password page for Saham Ultimate
 * Mimicking UMKM logic with Saham premium aesthetics.
 */

const ResetPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        const cleanPass = password.trim().toLowerCase();
        const cleanConfirm = confirmPassword.trim().toLowerCase();

        if (cleanPass !== cleanConfirm) {
            toast.error("Password tidak cocok!");
            return;
        }

        if (cleanPass.length < 6) {
            toast.error("Password minimal 6 karakter.");
            return;
        }

        setLoading(true);

        try {
            const result = await authClient.updateUser({
                password: cleanPass
            });

            if (result.error) throw result.error;

            setIsSuccess(true);
            toast.success("Password berhasil diperbarui!");

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/auth');
            }, 2000);

        } catch (error: any) {
            console.error("Reset password error:", error);
            toast.error(error.message || "Gagal memperbarui password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-container">
            <style>{`
                .reset-container {
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
                }

                .reset-card {
                    width: 100%;
                    max-width: 420px;
                    background: var(--bg-card);
                    border: 1px solid var(--border);
                    border-radius: 20px;
                    padding: 2.5rem;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
                    animation: fadeUp 0.5s ease-out;
                    text-align: center;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .reset-logo {
                    width: 72px;
                    height: auto;
                    margin-bottom: 1.25rem;
                }

                .reset-h1 {
                    font-size: 1.75rem;
                    font-weight: 800;
                    margin-bottom: 0.5rem;
                    letter-spacing: -0.025em;
                }

                .reset-p {
                    font-size: 0.9375rem;
                    color: var(--text-secondary);
                    line-height: 1.5;
                    margin-bottom: 2rem;
                }

                .form-label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 600;
                    text-align: left;
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

                .reset-input {
                    width: 100%;
                    background: var(--input-bg);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 0.75rem 1rem 0.75rem 2.75rem;
                    font-size: 0.9375rem;
                    outline: none;
                    transition: all 0.2s;
                }

                .reset-input:focus {
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
                    transition: all 0.2s;
                }

                .btn-submit:hover { background: var(--primary-hover); }
                .btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

                .success-box {
                    padding: 2rem;
                }
            `}</style>

            <div className="reset-card">
                {isSuccess ? (
                    <div className="success-box">
                        <div style={{ color: '#22c55e', marginBottom: '1.5rem' }}>
                            <CheckCircle size={64} style={{ margin: '0 auto' }} />
                        </div>
                        <h2 className="reset-h1">Berhasil!</h2>
                        <p className="reset-p">Password kamu telah diperbarui.</p>
                        <button className="btn-submit" onClick={() => navigate('/auth')}>
                            Kembali ke Login
                        </button>
                    </div>
                ) : (
                    <>
                        <img src="/saham.png" alt="Logo" className="reset-logo" />
                        <h1 className="reset-h1">Reset Password</h1>
                        <p className="reset-p">Silahkan masukkan password baru kamu.</p>

                        <form onSubmit={handleResetPassword} style={{ textAlign: 'left' }}>
                            <label className="form-label">Password Baru</label>
                            <div className="input-wrap">
                                <Lock className="input-icon" />
                                <input 
                                    className="reset-input"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Minimal 6 karakter"
                                    required
                                    minLength={6}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="btn-eye">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <label className="form-label">Konfirmasi Password</label>
                            <div className="input-wrap">
                                <Lock className="input-icon" />
                                <input 
                                    className="reset-input"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="Ulangi password baru"
                                    required
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="btn-eye">
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <button className="btn-submit" type="submit" disabled={loading}>
                                {loading ? 'Memperbarui...' : 'Update Password →'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
