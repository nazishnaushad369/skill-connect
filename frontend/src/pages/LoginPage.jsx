import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, Zap, ArrowRight, Home, Sparkles, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function LightParticles() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current; const ctx = canvas.getContext('2d'); let id
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener('resize', resize)
    const COLORS = ['#C7D2FE','#DDD6FE','#BAE6FD','#FBCFE8','#E9D5FF']
    const pts = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 2 + 0.8,
      c: COLORS[Math.floor(Math.random() * COLORS.length)]
    }))
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.c + 'CC'; ctx.fill()
      })
      pts.forEach((p, i) => pts.slice(i + 1).forEach(q => {
        const d = Math.hypot(p.x - q.x, p.y - q.y)
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y)
          ctx.strokeStyle = `rgba(99,102,241,${0.10 * (1 - d / 120)})`
          ctx.lineWidth = 0.7; ctx.stroke()
        }
      }))
      id = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      login(data.user, { access: data.access, refresh: data.refresh })
      toast.success(`Welcome back, ${data.user.name}!`)
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FAFBFF 0%, #EEF2FF 35%, #F5F3FF 65%, #F0F9FF 100%)',
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Soft orbs */}
      <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: 560, height: 560, background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-5%', right: '-5%', width: 460, height: 460, background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '40%', right: '15%', width: 280, height: 280, background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />

      {/* Subtle grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.035) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0 }} />
      <LightParticles />

      {/* Back to Home */}
      <Link to="/" style={{
        position: 'fixed', top: 20, left: 24, display: 'flex', alignItems: 'center', gap: 7,
        textDecoration: 'none', background: 'white', border: '1.5px solid #E2E8F0',
        borderRadius: 10, padding: '8px 16px', zIndex: 10,
        boxShadow: '0 2px 10px rgba(99,102,241,0.08)', transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.background = '#EEF2FF' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = 'white' }}
      >
        <Home size={15} color="#6366F1" />
        <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#6366F1' }}>Back to Home</span>
      </Link>

      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>

        {/* Logo + heading */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(99,102,241,0.35)' }}>
              <Zap size={22} color="white" fill="white" />
            </div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 23, color: '#0F172A' }}>Skill<span style={{ color: '#6366F1' }}>Connect</span></span>
          </Link>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 9999, padding: '5px 14px', marginBottom: 16 }}>
            <Sparkles size={12} color="#6366F1" />
            <span style={{ color: '#6366F1', fontSize: 12, fontWeight: 600 }}>Welcome back!</span>
          </div>

          <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 29, marginBottom: 6, color: '#0F172A', letterSpacing: '-0.02em' }}>Sign in to continue</h1>
          <p style={{ color: '#64748B', fontFamily: 'Inter', fontSize: 14 }}>Your skill exchange journey awaits</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'white',
          border: '1.5px solid rgba(99,102,241,0.1)',
          borderRadius: 22, padding: '36px 36px 32px',
          boxShadow: '0 8px 40px rgba(99,102,241,0.10), 0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label style={{ display: 'block', color: '#334155', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input id="login-email" type="email" required style={{
                  width: '100%', paddingLeft: 42, height: 46,
                  background: '#F8FAFC', border: '1.5px solid #E2E8F0',
                  borderRadius: 11, color: '#0F172A', fontFamily: 'Inter', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                  placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#6366F1'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ color: '#334155', fontFamily: 'Inter', fontSize: 13, fontWeight: 600 }}>Password</label>
                <Link to="/forgot-password" style={{ color: '#6366F1', fontFamily: 'Inter', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input id="login-password" type={showPassword ? 'text' : 'password'} required style={{
                  width: '100%', paddingLeft: 42, paddingRight: 44, height: 46,
                  background: '#F8FAFC', border: '1.5px solid #E2E8F0',
                  borderRadius: 11, color: '#0F172A', fontFamily: 'Inter', fontSize: 14,
                  outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                }}
                  placeholder="••••••••"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  onFocus={e => e.target.style.borderColor = '#6366F1'}
                  onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: '#94A3B8', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#6366F1'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                  title={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }} whileTap={{ scale: 0.98 }}
              type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', borderRadius: 12, color: 'white', fontFamily: 'Inter', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}>
              {loading
                ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in...</>
                : <><span>Sign In</span><ArrowRight size={16} /></>}
            </motion.button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 22, color: '#64748B', fontFamily: 'Inter', fontSize: 14 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: 700 }}>Sign up free</Link>
        </p>
      </motion.div>
    </div>
  )
}
