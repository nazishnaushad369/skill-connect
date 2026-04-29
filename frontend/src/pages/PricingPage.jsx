import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Check, Zap, MessageSquare, Calendar, BookOpen, Shield, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

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
      c: ['#60A5FA','#818CF8','#A78BFA','#38BDF8'][Math.floor(Math.random() * 4)]
    }))
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1
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

const FREE_FEATURES = ['Create account & login', 'Browse all skills', 'Find skill partners', 'View profiles & reviews', 'Add your own skills']
const PRO_FEATURES  = ['Everything in Free', 'Unlimited messaging & chat', 'Schedule skill sessions', 'Priority match suggestions', 'Premium member badge']

export default function PricingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div style={{ background: 'linear-gradient(135deg, #060B1A 0%, #0D1B3E 35%, #0F2260 60%, #1A1060 85%, #0A0520 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Glow orbs */}
      <div style={{ position: 'fixed', top: '0%', left: '10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '0%', right: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      {/* Grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0 }} />
      <ParticleBg />

      {/* Navbar */}
      <nav style={{ position: 'relative', zIndex: 10, background: 'rgba(255,255,255,0.98)', borderBottom: '1px solid rgba(99,102,241,0.15)', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backdropFilter: 'blur(16px)', boxShadow: '0 2px 20px rgba(79,70,229,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#3B82F6,#6366F1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(99,102,241,0.35)' }}>
            <Zap size={18} color="white" fill="white" />
          </div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20, color: '#0F172A' }}>Skill<span style={{ color: '#3B82F6' }}>Connect</span></span>
        </div>
        <button onClick={() => navigate('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #E2E8F0', color: '#64748B', borderRadius: 8, padding: '8px 16px', fontFamily: 'Inter', fontSize: 13, cursor: 'pointer' }}>
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '72px 24px 48px', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 20, padding: '5px 14px', marginBottom: 20 }}>
            <Zap size={13} color="#818CF8" fill="#818CF8" />
            <span style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: '#A5B4FC' }}>Unlock Full Access</span>
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 46, color: 'white', marginBottom: 16, lineHeight: 1.1 }}>
            Simple, Transparent<br />
            <span style={{ background: 'linear-gradient(135deg,#60A5FA,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pricing</span>
          </h1>
          <p style={{ fontFamily: 'Inter', fontSize: 17, color: 'rgba(255,255,255,0.55)', maxWidth: 480, margin: '0 auto' }}>
            Start free. Upgrade when you're ready to chat and schedule sessions with your skill partners.
          </p>
        </motion.div>
      </div>

      {/* Plans */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 28, padding: '0 24px 64px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>

        {/* Free Plan — glossy white */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 20, padding: '36px 32px', width: 340, boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(100,116,139,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={18} color="#64748B" />
            </div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, color: '#475569' }}>Free</span>
          </div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 42, color: '#0F172A', marginBottom: 4 }}>₹0</div>
          <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#94A3B8', marginBottom: 28 }}>Forever free</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {FREE_FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, background: 'rgba(100,116,139,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={11} color="#64748B" />
                </div>
                <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#475569' }}>{f}</span>
              </div>
            ))}
            {['Messaging & Chat', 'Session Scheduling'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: 0.4 }}>
                <div style={{ width: 20, height: 20, background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '50%', flexShrink: 0 }} />
                <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#94A3B8', textDecoration: 'line-through' }}>{f}</span>
              </div>
            ))}
          </div>
          <button disabled style={{ width: '100%', padding: '13px', borderRadius: 10, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#94A3B8', fontFamily: 'Inter', fontWeight: 600, fontSize: 14, cursor: 'not-allowed' }}>
            {user?.is_premium ? 'Previous Plan' : 'Current Plan'}
          </button>
        </motion.div>

        {/* Pro Plan */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: 'linear-gradient(145deg,#1E40AF,#4F46E5)', border: '1px solid rgba(99,102,241,0.4)', borderRadius: 20, padding: '36px 32px', width: 340, boxShadow: '0 16px 56px rgba(79,70,229,0.4)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '4px 12px', fontFamily: 'Inter', fontSize: 11, fontWeight: 700, color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
            ⭐ POPULAR
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} color="white" fill="white" />
            </div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, color: 'white' }}>Pro</span>
          </div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 42, color: 'white', marginBottom: 2 }}>₹99<span style={{ fontSize: 16, fontWeight: 500, opacity: 0.7 }}>/mo</span></div>
          <div style={{ fontFamily: 'Inter', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 28 }}>or ₹999/year — save ₹189</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {PRO_FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 20, height: 20, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={11} color="white" />
                </div>
                <span style={{ fontFamily: 'Inter', fontSize: 14, color: 'white' }}>{f}</span>
              </div>
            ))}
          </div>
          {user?.is_premium ? (
            <button disabled style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: 'not-allowed' }}>
              ✓ Already Premium
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => navigate('/payment?plan=monthly')}
                style={{ width: '100%', padding: '13px', borderRadius: 10, border: 'none', background: 'white', color: '#1E40AF', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.2)', transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                Get Pro — ₹99/month
              </button>
              <button onClick={() => navigate('/payment?plan=yearly')}
                style={{ width: '100%', padding: '11px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent', color: 'white', fontFamily: 'Inter', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                ₹999/year (Best Value)
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Why Pro */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 80px', position: 'relative', zIndex: 1, width: '100%' }}>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 24, color: 'white', textAlign: 'center', marginBottom: 32 }}>Why go Pro?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {[
            { icon: MessageSquare, color: '#60A5FA', title: 'Unlimited Chat',       desc: 'Message any skill partner without restrictions' },
            { icon: Calendar,      color: '#A78BFA', title: 'Session Scheduling',   desc: 'Book and manage skill exchange sessions easily' },
            { icon: Shield,        color: '#34D399', title: 'Premium Badge',        desc: 'Stand out with a verified Pro member badge' },
          ].map(({ icon: Icon, color, title, desc }, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
              style={{ background: 'rgba(255,255,255,0.97)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 16, padding: '24px 20px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 white' }}>
              <div style={{ width: 48, height: 48, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: `0 0 16px ${color}25` }}>
                <Icon size={22} color={color} />
              </div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 6 }}>{title}</div>
              <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>{desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
