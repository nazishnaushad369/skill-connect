import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Zap, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      // Always show success (security: don't reveal if email exists)
      if (res.ok || res.status === 200) {
        setSent(true)
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } catch {
      toast.error('Network error. Please check your connection.')
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
      {/* Orbs */}
      <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-5%', right: '-5%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />

      {/* Grid */}
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0 }} />

      {/* Back to login */}
      <Link to="/login" style={{
        position: 'fixed', top: 20, left: 24, display: 'flex', alignItems: 'center', gap: 7,
        textDecoration: 'none', background: 'white', border: '1.5px solid #E2E8F0',
        borderRadius: 10, padding: '8px 16px', zIndex: 10,
        boxShadow: '0 2px 10px rgba(99,102,241,0.08)', transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.background = '#EEF2FF' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = 'white' }}
      >
        <ArrowLeft size={15} color="#6366F1" />
        <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#6366F1' }}>Back to Login</span>
      </Link>

      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 24 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(99,102,241,0.35)' }}>
              <Zap size={22} color="white" fill="white" />
            </div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 23, color: '#0F172A' }}>Skill<span style={{ color: '#6366F1' }}>Connect</span></span>
          </Link>
        </div>

        {!sent ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 9999, padding: '5px 14px', marginBottom: 14 }}>
                <Sparkles size={12} color="#6366F1" />
                <span style={{ color: '#6366F1', fontSize: 12, fontWeight: 600 }}>Password Recovery</span>
              </div>
              <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 28, color: '#0F172A', marginBottom: 8, letterSpacing: '-0.02em' }}>Forgot your password?</h1>
              <p style={{ color: '#64748B', fontFamily: 'Inter', fontSize: 14, lineHeight: 1.65 }}>No worries! Enter your email and we'll send you a reset link.</p>
            </div>

            <div style={{
              background: 'white', border: '1.5px solid rgba(99,102,241,0.10)',
              borderRadius: 22, padding: '32px 36px',
              boxShadow: '0 8px 40px rgba(99,102,241,0.10), 0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', color: '#334155', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type="email" required
                      placeholder="you@example.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      style={{
                        width: '100%', paddingLeft: 42, height: 46,
                        background: '#F8FAFC', border: '1.5px solid #E2E8F0',
                        borderRadius: 11, color: '#0F172A', fontFamily: 'Inter', fontSize: 14,
                        outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = '#6366F1'}
                      onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" disabled={loading}
                  style={{ width: '100%', padding: '14px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', borderRadius: 12, color: 'white', fontFamily: 'Inter', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Sending...</> : 'Send Reset Link'}
                </motion.button>
              </form>
            </div>

            <p style={{ textAlign: 'center', marginTop: 22, color: '#64748B', fontFamily: 'Inter', fontSize: 14 }}>
              Remember your password?{' '}
              <Link to="/login" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: 700 }}>Sign in</Link>
            </p>
          </>
        ) : (
          /* ── Success state ── */
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'white', border: '1.5px solid rgba(99,102,241,0.10)',
              borderRadius: 22, padding: '48px 36px', textAlign: 'center',
              boxShadow: '0 8px 40px rgba(99,102,241,0.10)',
            }}>
            <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', border: '2px solid #A7F3D0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 16px rgba(16,185,129,0.2)' }}>
              <CheckCircle size={36} color="#059669" />
            </div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 24, color: '#0F172A', marginBottom: 10, letterSpacing: '-0.02em' }}>Check your inbox!</h2>
            <p style={{ color: '#64748B', fontFamily: 'Inter', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
              If an account with <strong style={{ color: '#0F172A' }}>{email}</strong> exists, we've sent a password reset link. Check your spam folder too.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => { setEmail(''); setSent(false) }}
                style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', borderRadius: 12, color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
                Send another link
              </motion.button>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', padding: '12px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 12, color: '#374151', fontFamily: 'Inter', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  ← Back to Login
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
