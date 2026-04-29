import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CreditCard, Lock, CheckCircle, Zap, ArrowLeft, QrCode, Smartphone, ScanLine, RefreshCw } from 'lucide-react'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

/* ─── Plan config ─── */
const PLANS = {
  monthly: { name: 'Pro Monthly', price: '₹99', period: '/month', description: 'Billed monthly, cancel anytime', amount: 99 },
  yearly: { name: 'Pro Yearly', price: '₹999', period: '/year', description: 'Best value — save ₹189/year', amount: 999 },
}

/* ─── Particle background ─── */
function ParticleBg() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current; const ctx = canvas.getContext('2d'); let id
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    const pts = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      c: ['#60A5FA', '#818CF8', '#A78BFA', '#38BDF8'][Math.floor(Math.random() * 4)]
    }))
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.c + '99'; ctx.fill()
      })
      pts.forEach((p, i) => pts.slice(i + 1).forEach(q => {
        const d = Math.hypot(p.x - q.x, p.y - q.y)
        if (d < 110) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y)
          ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - d / 110)})`
          ctx.lineWidth = 0.5; ctx.stroke()
        }
      }))
      id = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
}

/* ─── UPI Apps with local images + inline badge fallback ─── */
const UPI_APPS = [
  {
    name: 'Google Pay', color: '#4285F4', bg: '#EEF3FF', scheme: 'gpay://upi/pay',
    img: '/payments/gpay.png',
    badge: (
      <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fff', border: '1px solid #E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="30" height="30" viewBox="0 0 48 48">
          <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
      </div>
    ),
  },
  {
    name: 'PhonePe', color: '#5F259F', bg: '#F3EEFF', scheme: 'phonepe://pay',
    img: '/payments/phonepe.png',
    badge: (
      <div style={{ width: 44, height: 44, borderRadius: 10, background: '#5F259F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="26" height="26" viewBox="0 0 100 100" fill="none">
          <path d="M28 22h27c12 0 21 9 21 21s-9 21-21 21H44v16H28V22zm16 30h11c3.9 0 7-3.1 7-7s-3.1-7-7-7H44v14z" fill="white" />
          <circle cx="72" cy="74" r="9" fill="#CBB4F0" />
        </svg>
      </div>
    ),
  },
  {
    name: 'Paytm', color: '#00BAF2', bg: '#E6F8FF', scheme: 'paytmmp://pay',
    img: '/payments/paytm.png',
    badge: (
      <div style={{ width: 44, height: 44, borderRadius: 10, background: '#00BAF2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 12, color: 'white', letterSpacing: -0.5 }}>Paytm</span>
      </div>
    ),
  },
  {
    name: 'BHIM UPI', color: '#00A859', bg: '#E6FAF0', scheme: 'upi://pay',
    img: '/payments/bhim.png',
    badge: (
      <div style={{ width: 44, height: 44, borderRadius: 10, background: '#00A859', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, gap: 1 }}>
        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: 12, color: 'white', letterSpacing: 0.5 }}>BHIM</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 9, color: 'rgba(255,255,255,0.8)' }}>UPI</span>
      </div>
    ),
  },
]

/* ─── App Logo with local image + inline badge fallback ─── */
function AppLogo({ app, size = 44 }) {
  const [imgFailed, setImgFailed] = useState(false)
  const small = size < 36
  if (imgFailed) {
    if (small) {
      // Compact coloured dot for chip view
      return (
        <div style={{ width: size, height: size, borderRadius: 6, background: app.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ color: 'white', fontFamily: 'Outfit', fontWeight: 800, fontSize: size * 0.45, lineHeight: 1 }}>{app.name[0]}</span>
        </div>
      )
    }
    return app.badge
  }
  return (
    <div style={{ width: size, height: size, borderRadius: small ? 6 : 10, background: '#fff', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, padding: small ? 2 : 3, boxSizing: 'border-box' }}>
      <img src={app.img} alt={app.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={() => setImgFailed(true)} />
    </div>
  )
}

const TABS = [
  { id: 'qr',   icon: QrCode,    label: 'UPI QR'      },
  { id: 'apps', icon: Smartphone, label: 'Pay via App' },
]

const lbl = { display: 'block', fontFamily: 'Inter', fontWeight: 600, fontSize: 11, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }

/* ════════════════════ SUCCESS SCREEN ════════════════════ */
function SuccessScreen({ onDone }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '16px 0' }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', stiffness: 220 }}>
        <div style={{ width: 76, height: 76, background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={38} color="#22C55E" />
        </div>
      </motion.div>
      <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 26, color: '#0F172A', marginBottom: 10 }}>Payment Successful! 🎉</h2>
      <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#64748B', marginBottom: 20 }}>
        You now have full Pro access — messaging, sessions, and more.
      </p>
      <div style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 12, padding: '12px 18px', marginBottom: 24 }}>
        <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#3B82F6', fontWeight: 600 }}>✓ Chat &nbsp;•&nbsp; ✓ Sessions &nbsp;•&nbsp; ✓ Pro Badge</span>
      </div>
      <button onClick={onDone} className="btn-neon-green" style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 700 }}>
        Go to Dashboard →
      </button>
    </motion.div>
  )
}

/* ════════════════════ CARD TAB ════════════════════ */
function CardTab({ onSuccess, loading, setLoading, planKey, updateUser }) {
  const [form, setForm] = useState({ name: '', number: '', expiry: '', cvv: '' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const fmtCard = v => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const fmtExpiry = v => { const d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }

  const handlePay = async (e) => {
    e.preventDefault()
    if (!form.name || !form.number || !form.expiry || !form.cvv) { toast.error('Fill all card details'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    try {
      const { data } = await authAPI.subscribe({ plan: planKey })
      if (data.success) { updateUser({ is_premium: true, premium_expires_at: data.expires_at }); onSuccess() }
    } catch { toast.error('Payment failed. Try again.') }
    finally { setLoading(false) }
  }

  return (
    <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={lbl}>Cardholder Name</label>
        <input className="input-field" placeholder="John Smith" value={form.name} onChange={e => set('name', e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }} />
      </div>
      <div>
        <label style={lbl}>Card Number</label>
        <div style={{ position: 'relative' }}>
          <input className="input-field" placeholder="1234 5678 9012 3456"
            value={form.number} onChange={e => set('number', fmtCard(e.target.value))}
            style={{ width: '100%', boxSizing: 'border-box', letterSpacing: 2, paddingRight: 48 }} />
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>💳</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={lbl}>Expiry</label>
          <input className="input-field" placeholder="MM/YY" value={form.expiry} onChange={e => set('expiry', fmtExpiry(e.target.value))} style={{ width: '100%', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={lbl}>CVV</label>
          <input className="input-field" placeholder="•••" type="password" maxLength={4}
            value={form.cvv} onChange={e => set('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
            style={{ width: '100%', boxSizing: 'border-box' }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
        {['💳 Visa', '💳 Mastercard', '💳 RuPay', '🏦 Net Banking'].map(c => (
          <span key={c} style={{ fontFamily: 'Inter', fontSize: 11, color: '#94A3B8', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '3px 8px' }}>{c}</span>
        ))}
      </div>
      <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 10, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Lock size={13} color="#3B82F6" />
        <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#3B82F6' }}>256-bit SSL secured payment</span>
      </div>
      <button type="submit" disabled={loading}
        style={{ background: loading ? '#94A3B8' : 'linear-gradient(135deg,#3B82F6,#6366F1)', border: 'none', color: 'white', borderRadius: 12, padding: '14px', fontFamily: 'Inter', fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%' }}>
        {loading
          ? <><div style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Processing...</>
          : '💳 Pay Now'}
      </button>
    </form>
  )
}

/* 🔴 Your real UPI VPA — update this one place to change everywhere */
const UPI_ID = 'sitarakhatoon7314@okicici'

/* ════════════════════ UPI QR TAB ════════════════════ */
function QRTab({ onSuccess, loading, setLoading, planKey, updateUser, amount }) {
  const [polling, setPolling] = useState(false)
  const upiStr = `upi://pay?pa=${UPI_ID}&pn=SkillConnect&am=${amount}&cu=INR&tn=SkillConnect+Pro`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=1E40AF&bgcolor=F8FAFC&data=${encodeURIComponent(upiStr)}`

  const handleVerify = async () => {
    setPolling(true); setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    try {
      const { data } = await authAPI.subscribe({ plan: planKey })
      if (data.success) { updateUser({ is_premium: true, premium_expires_at: data.expires_at }); onSuccess() }
    } catch { toast.error('Payment not found. Please try again.') }
    finally { setPolling(false); setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 16, padding: 20 }}>
        <img src={qrUrl} alt="UPI QR Code" width={180} height={180} style={{ display: 'block', borderRadius: 8 }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#64748B', marginBottom: 6 }}>Scan with any UPI app</div>
        <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: '#0F172A', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 16px', display: 'inline-block', letterSpacing: 0.3 }}>
          {UPI_ID}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        {UPI_APPS.map(app => (
          <div key={app.name} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '5px 12px' }}>
            <AppLogo app={app} size={22} />
            <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#475569', fontWeight: 500 }}>{app.name}</span>
          </div>
        ))}
      </div>
      <div style={{ width: '100%', borderTop: '1px solid #F1F5F9', paddingTop: 16 }}>
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#94A3B8', textAlign: 'center', marginBottom: 12 }}>
          After completing payment in your UPI app, tap below to confirm
        </p>
        <button onClick={handleVerify} disabled={loading}
          style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: loading ? '#94A3B8' : 'linear-gradient(135deg,#3B82F6,#6366F1)', color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {polling
            ? <><RefreshCw size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Verifying...</>
            : <><ScanLine size={15} /> I've Completed Payment</>}
        </button>
      </div>
    </div>
  )
}

/* ════════════════════ APPS TAB ════════════════════ */
function AppsTab({ onSuccess, loading, setLoading, planKey, updateUser, amount }) {
  const [redirecting, setRedirecting] = useState(null)

  const handleApp = async (app) => {
    setRedirecting(app.name)
    const upiUrl = `${app.scheme}?pa=${UPI_ID}&pn=SkillConnect&am=${amount}&cu=INR&tn=SkillConnect+Pro`
    window.location.href = upiUrl
    await new Promise(r => setTimeout(r, 2500))
    setRedirecting(null)
  }

  const handleVerify = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1800))
    try {
      const { data } = await authAPI.subscribe({ plan: planKey })
      if (data.success) { updateUser({ is_premium: true, premium_expires_at: data.expires_at }); onSuccess() }
    } catch { toast.error('Payment not verified. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 4 }}>
        Choose your preferred payment app
      </p>

      {UPI_APPS.map(app => (
        <motion.button key={app.name}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => handleApp(app)}
          disabled={!!redirecting}
          style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '11px 16px',
            background: redirecting === app.name ? app.bg : '#FFFFFF',
            border: `1px solid ${redirecting === app.name ? app.color + '50' : '#E2E8F0'}`,
            borderRadius: 12, cursor: redirecting ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
            boxShadow: redirecting === app.name ? `0 4px 14px ${app.color}20` : '0 1px 3px rgba(0,0,0,0.04)',
          }}>
          {app.badge && <AppLogo app={app} />}
          <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: '#0F172A', flex: 1 }}>{app.name}</span>
          {redirecting === app.name ? (
            <span style={{ fontFamily: 'Inter', fontSize: 12, color: app.color, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 12, height: 12, border: `2px solid ${app.color}40`, borderTopColor: app.color, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Opening…
            </span>
          ) : (
            <span style={{ fontSize: 18, color: '#CBD5E1', lineHeight: 1 }}>›</span>
          )}
        </motion.button>
      ))}

      <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 14, marginTop: 4 }}>
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#94A3B8', textAlign: 'center', marginBottom: 10 }}>
          Completed payment in the app? Click below to confirm.
        </p>
        <button onClick={handleVerify} disabled={loading}
          style={{ width: '100%', padding: '12px', borderRadius: 12, border: 'none', background: loading ? '#94A3B8' : 'linear-gradient(135deg,#22C55E,#16A34A)', color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading
            ? <><RefreshCw size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Verifying…</>
            : "✅ I've Paid — Confirm"}
        </button>
      </div>
    </div>
  )
}

/* ════════════════════ MAIN PAGE ════════════════════ */
export default function PaymentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const planKey = searchParams.get('plan') || 'monthly'
  const planInfo = PLANS[planKey] || PLANS.monthly
  const { updateUser } = useAuth()

  const [activeTab, setActiveTab] = useState('qr')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (success) return (
    <div style={{ background: 'linear-gradient(135deg,#060B1A 0%,#0D1B3E 35%,#0F2260 60%,#1A1060 85%,#0A0520 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <div style={{ position: 'fixed', top: '10%', left: '5%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0 }} />
      <ParticleBg />
      <div style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 24, padding: '48px 40px', maxWidth: 420, width: '100%', boxShadow: '0 16px 56px rgba(0,0,0,0.4), inset 0 1px 0 white', position: 'relative', zIndex: 1 }}>
        <SuccessScreen onDone={() => navigate('/dashboard')} />
      </div>
    </div>
  )

  return (
    <div style={{ background: 'linear-gradient(135deg,#060B1A 0%,#0D1B3E 35%,#0F2260 60%,#1A1060 85%,#0A0520 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative' }}>
      {/* Glow orbs */}
      <div style={{ position: 'fixed', top: '5%', left: '5%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(59,130,246,0.1) 0%,transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '5%', right: '5%', width: 400, height: 400, background: 'radial-gradient(circle,rgba(99,102,241,0.08) 0%,transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      {/* Grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.04) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0 }} />
      <ParticleBg />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'grid', gridTemplateColumns: '300px 1fr', maxWidth: 760, width: '100%', borderRadius: 24, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', zIndex: 1 }}>

        {/* ── Left: Order Summary ── */}
        <div style={{ background: 'linear-gradient(160deg,#1E40AF,#4F46E5)', padding: '36px 28px', color: 'white', display: 'flex', flexDirection: 'column' }}>
          <button onClick={() => navigate('/pricing')}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', fontFamily: 'Inter', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, marginBottom: 28, width: 'fit-content' }}>
            <ArrowLeft size={12} /> Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.2)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={17} color="white" fill="white" />
            </div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16 }}>SkillConnect Pro</span>
          </div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Order Summary</div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, marginBottom: 2 }}>{planInfo.name}</div>
          <div style={{ fontFamily: 'Inter', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 22 }}>{planInfo.description}</div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Unlimited messaging', 'Session scheduling', 'Premium member badge', 'Priority suggestions'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={13} color="rgba(255,255,255,0.8)" />
                <span style={{ fontFamily: 'Inter', fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 18, marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'Inter', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Total today</span>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 26 }}>{planInfo.price}</span>
          </div>
        </div>

        {/* ── Right: Payment Form ── */}
        <div style={{ background: '#FFFFFF', padding: '36px 32px', overflowY: 'auto', maxHeight: '90vh' }}>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 12, padding: 4, gap: 4, marginBottom: 24 }}>
            {TABS.map(({ id, icon: Icon, label }) => (
              <button key={id} onClick={() => !loading && setActiveTab(id)}
                style={{
                  flex: 1, padding: '9px 6px', borderRadius: 9, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  background: activeTab === id ? '#FFFFFF' : 'transparent',
                  boxShadow: activeTab === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3
                }}>
                <Icon size={15} color={activeTab === id ? '#3B82F6' : '#94A3B8'} />
                <span style={{ fontFamily: 'Inter', fontWeight: activeTab === id ? 700 : 500, fontSize: 11, color: activeTab === id ? '#2563EB' : '#94A3B8' }}>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
              {activeTab === 'qr'   && <QRTab   onSuccess={() => setSuccess(true)} loading={loading} setLoading={setLoading} planKey={planKey} updateUser={updateUser} amount={planInfo.amount} />}
              {activeTab === 'apps' && <AppsTab onSuccess={() => setSuccess(true)} loading={loading} setLoading={setLoading} planKey={planKey} updateUser={updateUser} amount={planInfo.amount} />}
            </motion.div>
          </AnimatePresence>

          <p style={{ fontFamily: 'Inter', fontSize: 11, color: '#CBD5E1', textAlign: 'center', marginTop: 18 }}>
            🔒 Demo only — no real charges will be made
          </p>
        </div>

      </motion.div>
    </div>
  )
}
