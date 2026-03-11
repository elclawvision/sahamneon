import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Copy, ShieldCheck, Zap, CreditCard, ChevronRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Payment.tsx
 * Premium payment page for Saham Ultimate
 * Exactly mimicking the premium aesthetics of darkfeminine.tsx
 */

const SahamPayment = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [purchasePassword, setPurchasePassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("QRIS");
    const [loading, setLoading] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);
    const [paymentData, setPaymentData] = useState<any>(null);

    const priceIDR = 99000;
    const productName = "Universal Saham Ultimate";

    const sendWAAlert = async (type: 'attempt' | 'success', details: any) => {
        try {
            const waToken = "EKOSp9NBSuNVVU";
            const waInstanceId = "BDD9F9320ECD"; 
            const msg = type === 'attempt'
                ? `🔔 *Mencoba Checkout SAHAM*\nProduk: ${productName}\nNama: ${details.name}\nWA: ${details.phone}\nMetode: ${details.method}`
                : `✅ *Checkout SAHAM Sukses*\nRef: ${details.ref}\nNama: ${details.name}\nWA: ${details.phone}\nTotal: Rp${priceIDR.toLocaleString('id-ID')}`;

            const cleanTarget = "62895325633487";
            const params = new URLSearchParams({
                instance_id: waInstanceId,
                access_token: waToken,
                chatId: cleanTarget + "@c.us",
                message: msg
            });

            await fetch(`https://wawp.net/wp-json/awp/v1/send?${params.toString()}`, {
                method: 'POST'
            });
        } catch (e) { console.error('WA API Error', e); }
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !phone || !email || !purchasePassword) {
            toast.error("Mohon lengkapi semua data!");
            return;
        }

        setLoading(true);
        // Sanitize phone: strip +, spaces, dashes, leading 0 to 62
        let cleanPhone = phone.trim().replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) {
            cleanPhone = '62' + cleanPhone.slice(1);
        } else if (!cleanPhone.startsWith('62')) {
            cleanPhone = '62' + cleanPhone;
        }

        sendWAAlert('attempt', { name, phone: cleanPhone, method: paymentMethod });

        const payload = {
            subscriptionType: 'universal',
            paymentMethod: paymentMethod,
            userName: name,
            userEmail: email.trim().toLowerCase(),
            phoneNumber: cleanPhone,
            address: 'Digital',
            amount: priceIDR,
            currency: 'IDR',
            quantity: 1,
            productName: productName,
            purchasePassword: purchasePassword.trim().toLowerCase()
        };

        try {
            const { data, error } = await supabase.functions.invoke('tripay-create-payment', { body: payload });
            if (error) throw error;

            if (data?.success) {
                setPaymentData(data);
                setShowInstructions(true);
                sendWAAlert('success', { ref: data.tripay_reference || 'N/A', name, phone: cleanPhone });
            } else {
                toast.error(data?.error || "Gagal membuat pembayaran.");
            }
        } catch (err: any) {
            console.error(err);
            toast.error("Terjadi kesalahan sistem. Hubungi admin.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('🔴 [REALTIME INIT CHECK] showInstructions:', showInstructions, 'paymentData:', paymentData);
        if (!showInstructions || !paymentData) {
            console.log('🔴 [REALTIME] Aborting setup: showInstructions is false or paymentData is null');
            return;
        }

        const tripayRef = paymentData.tripay_reference || paymentData.reference;
        if (!tripayRef) {
            console.error('🔴 [REALTIME] ERROR: No tripay_reference or reference found in paymentData!', paymentData);
            return;
        }
        
        console.log(`🚀 [REALTIME] 🟢 SUCCESS! Start listening for Saham activation on ref: [${tripayRef}]`);
        const channelName = `payment-status-saham-${tripayRef}`;
        
        const channel = supabase.channel(channelName)
            .on('postgres_changes', { 
                event: 'UPDATE', 
                schema: 'public', 
                table: 'global_product', 
                filter: `tripay_reference=eq.${tripayRef}` 
            },
                (payload: any) => {
                    console.log('🔥 [REALTIME RAW PAYLOAD RECEIVED] ->', JSON.stringify(payload, null, 2));
                    console.log(`🔥 [REALTIME STATUS CHECK] Old: ${payload.old?.status} | New: ${payload.new?.status}`);
                    
                    if (payload.new?.status === 'PAID') {
                        console.log('✅ [SUCCESS] Activation detected via realtime! Firing TOAST...');
                        toast.success("✅ PEMBAYARAN BERHASIL! Akses Anda sudah aktif.", { duration: 10000 });
                        supabase.removeChannel(channel);
                        
                        // Show full-screen success modal with premium design
                        const modal = document.createElement('div');
                        modal.innerHTML = `
                          <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 999999; backdrop-filter: blur(8px);">
                            <div style="background: linear-gradient(135deg, #0A0612 0%, #13141c 50%, #0A0612 100%); padding: 50px; border-radius: 25px; text-align: center; max-width: 90%; box-shadow: 0 25px 80px rgba(59, 130, 246, 0.3); border: 2px solid rgba(59, 130, 246, 0.3); position: relative; overflow: hidden;">
                              <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%); animation: pulse 2s ease-in-out infinite;"></div>
                              <div style="position: relative; z-index: 10;">
                                <div style="font-size: 5rem; margin-bottom: 25px; filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.5));">🎉</div>
                                <h2 style="font-size: 2.5rem; background: linear-gradient(45deg, #3b82f6, #60a5fa, #93c5fd); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 20px; font-weight: bold; font-family: 'Cormorant Garamond', serif;">Pembayaran Berhasil!</h2>
                                <p style="font-size: 1.4rem; color: #e2e8f0; margin-bottom: 25px; line-height: 1.6;">Akses Saham Ultimate Anda telah aktif.</p>
                                <button id="sahamLoginBtn" style="background: linear-gradient(135deg, #2563eb, #4f46e5); color: white; border: none; padding: 15px 30px; border-radius: 12px; font-size: 1.2rem; font-weight: bold; cursor: pointer; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3); transition: all 0.3s ease;">
                                  Masuk Dashboard
                                </button>
                                <div style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 12px; padding: 15px; margin-top: 20px;">
                                  <p style="color: #94a3b8; font-size: 1rem;">Otomatis dialihkan dalam <span id="sahamCountdown" style="color: #60a5fa; font-weight: bold; font-size: 1.2rem;">5</span> detik</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <style>
                            @keyframes pulse {
                              0%, 100% { opacity: 0.5; transform: scale(1); }
                              50% { opacity: 0.8; transform: scale(1.05); }
                            }
                          </style>
                        `;
                        document.body.appendChild(modal);

                        // Add login button click handler
                        const loginBtn = document.getElementById('sahamLoginBtn');
                        if (loginBtn) {
                          loginBtn.addEventListener('click', () => {
                            document.body.removeChild(modal);
                            navigate('/auth');
                          });
                        }

                        // Add countdown
                        let timeLeft = 5;
                        const countdownEl = document.getElementById('sahamCountdown');
                        const timer = setInterval(() => {
                          timeLeft -= 1;
                          if (countdownEl) countdownEl.innerText = timeLeft.toString();
                          if (timeLeft <= 0) {
                            clearInterval(timer);
                            if (document.body.contains(modal)) {
                              document.body.removeChild(modal);
                              navigate('/auth');
                            }
                          }
                        }, 1000);
                    } else {
                        console.log('⚠️ [REALTIME] Status was updated, but it is NOT "PAID". It is:', payload.new?.status);
                    }
                }
            ).subscribe((status, err) => {
                console.log(`📡 [REALTIME SUBSCRIPTION STATUS] channel [${channelName}] is now:`, status);
                if (err) console.error('❌ [REALTIME SUBSCRIPTION ERROR]:', err);
            });

        return () => {
            console.log(`🛑 [REALTIME] Cleanup: Removing channel [${channelName}]`);
            supabase.removeChannel(channel);
        };
    }, [showInstructions, paymentData, navigate]);

    return (
        <div className="saham-pay-container">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=DM+Sans:wght@300;400;500;700&display=swap');
                
                .saham-pay-container {
                    --bg-primary: #0A0612;
                    --bg-card: #13141c;
                    --bg-section: #050505;
                    --purple: #3b82f6;
                    --purple-light: #60a5fa;
                    --gold: #C9991A;
                    --gold-light: #F0C84A;
                    --gold-dark: #9A7010;
                    --cream: #EEE5C8;
                    --muted: #7D6B9E;
                    --white: #FFFFFF;
                    --red: #EF4444;
                    --font-display: 'Cormorant Garamond', Georgia, serif;
                    --font-body: 'DM Sans', system-ui, sans-serif;
                    
                    min-height: 100vh;
                    background: var(--bg-primary);
                    color: var(--white);
                    font-family: var(--font-body);
                    padding: 2.5rem 1.25rem;
                }

                .saham-pay-container * {
                    box-sizing: border-box;
                }

                .pay-wrap {
                    max-width: 500px;
                    margin: 0 auto;
                    width: 100%;
                }

                .pay-header {
                    text-align: center;
                    margin-bottom: 2.5rem;
                }

                .pay-title {
                    font-family: var(--font-display);
                    font-size: 2.5rem;
                    font-weight: 700;
                    line-height: 1.1;
                    margin-bottom: 0.5rem;
                }

                .pay-subtitle {
                    color: var(--muted);
                    font-size: 1rem;
                }

                .pay-card {
                    background: var(--bg-card);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 1.5rem;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
                }

                .pay-label {
                    display: block;
                    font-size: 0.8rem;
                    font-weight: 700;
                    color: var(--purple-light);
                    margin-bottom: 0.5rem;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }

                .pay-input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 1rem;
                    color: var(--white);
                    font-size: 1rem;
                    margin-bottom: 1.25rem;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .pay-input:focus {
                    border-color: var(--purple-light);
                }

                .pay-pwrap {
                    display: flex;
                    margin-bottom: 1.25rem;
                }

                .pay-ppfx {
                    background: rgba(59, 130, 246, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-right: none;
                    border-radius: 12px 0 0 12px;
                    padding: 0 1rem;
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--purple-light);
                    display: flex;
                    align-items: center;
                    white-space: nowrap;
                }

                .pay-pwrap .pay-input {
                    margin-bottom: 0;
                    border-radius: 0 12px 12px 0;
                }

                .pay-method-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .pay-method-opt {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 0.75rem;
                    cursor: pointer;
                    text-align: center;
                    transition: all 0.2s;
                }

                .pay-method-opt.selected {
                    border-color: var(--purple-light);
                    background: rgba(59, 130, 246, 0.1);
                }

                .pay-method-name {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: var(--white);
                }

                .pay-method-sub {
                    font-size: 0.7rem;
                    color: var(--muted);
                    margin-top: 0.25rem;
                }

                .pay-summary {
                    background: rgba(59, 130, 246, 0.05);
                    border: 1px solid rgba(59, 130, 246, 0.1);
                    border-radius: 12px;
                    padding: 1.25rem;
                    margin-bottom: 1.5rem;
                }

                .pay-summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.75rem;
                    font-size: 0.9rem;
                }

                .pay-summary-total {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 0.75rem;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    font-size: 1.1rem;
                    font-weight: 700;
                }

                .pay-btn {
                    width: 100%;
                    padding: 1.25rem;
                    background: linear-gradient(135deg, #2563eb, #4f46e5);
                    color: white;
                    border: none;
                    border-radius: 14px;
                    font-size: 1.1rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
                }

                .pay-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px -5px rgba(37, 99, 235, 0.5);
                }

                .pay-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .back-btn {
                    position: absolute;
                    top: 1.5rem;
                    left: 1rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: none;
                    color: var(--white);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }
            `}</style>

            <button onClick={() => navigate(-1)} className="back-btn">
                <ArrowLeft size={20} />
            </button>

            <div className="pay-wrap">
                <header className="pay-header">
                    <h1 className="pay-title">Mulai Akses <br /> <span style={{color: 'var(--gold-light)'}}>Saham Ultimate</span></h1>
                    <p className="pay-subtitle">Dapatkan data whale & insider setiap hari.</p>
                </header>

                <div className="pay-card">
                    {showInstructions && paymentData ? (
                        <div className="pay-instructions">
                            <h2 className="pay-title" style={{textAlign: 'center', marginBottom: '0.5rem'}}>Instruksi Pembayaran</h2>
                            <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>
                                Reference: <span style={{ color: '#3b82f6' }}>{paymentData.tripay_reference}</span>
                            </p>
                            <p style={{ textAlign: 'center', fontSize: '12px', color: '#10b981', marginBottom: '1.5rem', fontWeight: 500 }}>
                                ⚡ 5 detik setelah transfer akan muncul di layar ini
                            </p>
                            
                            {paymentData.payCode && (
                                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                                    <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '8px', textAlign: 'center' }}>KODE PEMBAYARAN {paymentMethod}</p>
                                    <div style={{ background: '#e2e8f0', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a' }}>{paymentData.payCode}</span>
                                        <button onClick={() => { navigator.clipboard.writeText(paymentData.payCode); toast.success('Tersalin!'); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Copy size={22} color="#3b82f6" /></button>
                                    </div>
                                </div>
                            )}

                            {paymentData.qrUrl && (
                                <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '24px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                                    <h3 style={{ fontSize: '20px', marginBottom: '8px', fontWeight: 700, color: '#0f172a' }}>Scan QRIS</h3>
                                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: 1.6 }}>Buka aplikasi E-Wallet (GoPay/DANA/ShopeePay/OVO) atau Mobile Banking pilihan Anda.</p>
                                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                                        <img src={paymentData.qrUrl} alt="QRIS" style={{ width: '250px', height: '250px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }} />
                                    </div>
                                    <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '10px', color: '#166534', fontSize: '14px', fontWeight: 600, lineHeight: 1.5 }}>
                                        ✅ Screenshot / Simpan gambar QRIS ini lalu upload dari galeri pada aplikasi pembayaran Anda.
                                    </div>
                                </div>
                            )}

                            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '1.5rem' }}>
                                    Setelah membayar, sistem akan mendeteksi secara otomatis dan mengirimkan akses ke WhatsApp/Email Anda.
                                </p>
                                <button className="pay-btn" onClick={() => setShowInstructions(false)}>
                                    Kembali
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleCheckout}>
                            <h2 className="pay-title">Pendaftaran Saham Ultimate</h2>
                            <p className="pay-subtitle">Dapatkan akses lifetime data whale tracker & screener premium.</p>

                            <label className="pay-label">Nama Lengkap</label>
                            <input 
                                className="pay-input" 
                                placeholder="Contoh: Sarah" 
                                required 
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />

                            <label className="pay-label">WhatsApp Number</label>
                            <div className="pay-pwrap">
                                <div className="pay-ppfx">🇮🇩 +62</div>
                                <input 
                                    className="pay-input" 
                                    placeholder="812345678" 
                                    type="tel" 
                                    required 
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                            </div>

                            <label className="pay-label">Email (untuk link download)</label>
                            <input 
                                className="pay-input" 
                                type="email" 
                                placeholder="contoh@gmail.com" 
                                required 
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />

                            <label className="pay-label">Buat Password * <span style={{fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 'normal'}}>(untuk akses Dashboard)</span></label>
                            <div style={{position: 'relative'}}>
                                <input 
                                    className="pay-input" 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="Minimal 6 karakter" 
                                    required 
                                    minLength={6}
                                    value={purchasePassword}
                                    onChange={e => setPurchasePassword(e.target.value)}
                                    style={{paddingRight: '3rem'}}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer'}}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <label className="pay-label">Metode Pembayaran</label>
                            <div className="pay-method-grid">
                                {[
                                    ["QRIS", "QRIS", "Shopee, OVO, DANA"],
                                    ["BCAVA", "BCA VA", "Otomatis via BCA"],
                                    ["BNIVA", "BNI VA", "Otomatis via BNI"],
                                    ["BRIVA", "BRI VA", "Otomatis via BRI"]
                                ].map(([id, nm, sb]) => (
                                    <div 
                                        key={id} 
                                        className={`pay-method-opt ${paymentMethod === id ? "selected" : ""}`}
                                        onClick={() => setPaymentMethod(id)}
                                    >
                                        <div className="pay-method-name">{nm}</div>
                                        <div className="pay-method-sub">{sb}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="pay-summary">
                                <div className="pay-summary-row">
                                    <span style={{color: 'var(--muted)'}}>Saham Ultimate Lifetime</span>
                                    <span>Rp 99.000</span>
                                </div>
                                <div className="pay-summary-total">
                                    <span>Total</span>
                                    <span style={{color: 'var(--gold-light)'}}>Rp 99.000</span>
                                </div>
                            </div>

                            <button className="pay-btn" type="submit" disabled={loading}>
                                {loading ? "Memproses..." : "🛒 Bayar Sekarang"}
                            </button>

                            <p style={{fontSize: '0.7rem', color: 'var(--muted)', textAlign: 'center', marginTop: '1rem', lineHeight: '1.5'}}>
                                🔒 Pembayaran aman & dienkripsi. Produk dikirim secara digital lewat WhatsApp & Email.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SahamPayment;
