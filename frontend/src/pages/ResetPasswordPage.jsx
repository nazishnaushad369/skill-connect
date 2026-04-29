import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Zap, Eye, EyeOff, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const uid   = searchParams.get('uid')   || ''
  const token = searchParams.get('token') || ''

  const [password, setPassword]   = useState('')
  const [confirm,  setConfirm]    = useState('')
  const [showPw,   setShowPw]     = useState(false)
  const [showCf,   setShowCf]     = useState(false)
  const [loading,  setLoading]    = useState(false)
  const [done,     setDone]       = useState(false)
  const [error,    setError]      = useState('')

  // If no uid/token, show invalid link message immediately
  const invalidLink = !uid || !token

  const strength = password.length === 0 ? 0
    : password.length < 6  ? 1
    : password.length < 10 ? 2
    : 3

  const strengthLabel = ['', 'Weak', 'Good', 'Strong']
  const strengthColor = ['', '#EF4444', '#F59E0B', '#22C55E']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setDone(true)
        setTimeout(() => navigate('/login'), 3000)
      } else {
        setError(data.detail || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection.')
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
      {/* Background orbs */}
      <div style={{ position: 'fixed', top: '-10%', left: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '-5%', right: '-5%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0 }} />

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

        {/* Invalid link state */}
        {invalidLink ? (
          <div style={{ background: 'white', border: '1.5px solid #FEE2E2', borderRadius: 22, padding: '40px 36px', textAlign: 'center', boxShadow: '0 8px 40px rgba(239,68,68,0.10)' }}>
            <div style={{ width: 64, height: 64, background: '#FEF2F2', border: '2px solid #FECACA', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
              <AlertCircle size={30} color="#EF4444" />
            </div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 22, color: '#0F172A', marginBottom: 10 }}>Invalid Reset Link</h2>
            <p style={{ color: '#64748B', fontFamily: 'Inter', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
              This link is invalid or has expired. Please request a new password reset.
            </p>
            <Link to="/forgot-password" style={{ display: 'block', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', borderRadius: 12, padding: '12px', textAlign: 'center', color: 'white', textDecoration: 'none', fontFamily: 'Inter', fontWeight: 700, fontSize: 14 }}>
              Request New Link
            </Link>
          </div>
        ) : done ? (
          /* Success state */
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            style={{ background: 'white', border: '1.5px solid rgba(99,102,241,0.10)', borderRadius: 22, padding: '48px 36px', textAlign: 'center', boxShadow: '0 8px 40px rgba(99,102,241,0.10)' }}>
            <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', border: '2px solid #A7F3D0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 16px rgba(16,185,129,0.2)' }}>
              <CheckCircle size={36} color="#059669" />
            </div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 24, color: '#0F172A', marginBottom: 10, letterSpacing: '-0.02em' }}>Password Updated!</h2>
            <p style={{ color: '#64748B', fontFamily: 'Inter', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
              Your password has been reset successfully. Redirecting you to login...
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#6366F1', fontFamily: 'Inter', fontSize: 13 }}>
              <div style={{ width: 14, height: 14, border: '2px solid rgba(99,102,241,0.3)', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              Redirecting to login...
            </div>
          </motion.div>
        ) : (
          /* Form */
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: 9999, padding: '5px 14px', marginBottom: 14 }}>
                <Sparkles size={12} color="#6366F1" />
                <span style={{ color: '#6366F1', fontSize: 12, fontWeight: 600 }}>Set New Password</span>
              </div>
              <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 28, color: '#0F172A', marginBottom: 8, letterSpacing: '-0.02em' }}>Create new password</h1>
              <p style={{ color: '#64748B', fontFamily: 'Inter', fontSize: 14, lineHeight: 1.65 }}>Choose a strong password for your account.</p>
            </div>

            <div style={{ background: 'white', border: '1.5px solid rgba(99,102,241,0.10)', borderRadius: 22, padding: '32px 36px', boxShadow: '0 8px 40px rgba(99,102,241,0.10), 0 2px 8px rgba(0,0,0,0.04)' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* New password */}
                <div>
                  <label style={{ display: 'block', color: '#334155', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type={showPw ? 'text' : 'password'} required
                      placeholder="At least 6 characters"
                      value={password} onChange={e => setPassword(e.target.value)}
                      style={{ width: '100%', paddingLeft: 42, paddingRight: 42, height: 46, background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 11, color: '#0F172A', fontFamily: 'Inter', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = '#6366F1'}
                      onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94A3B8' }}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: '#F1F5F9', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${(strength / 3) * 100}%`, background: strengthColor[strength], borderRadius: 4, transition: 'all 0.3s' }} />
                      </div>
                      <span style={{ fontSize: 11, fontFamily: 'Inter', fontWeight: 600, color: strengthColor[strength] }}>{strengthLabel[strength]}</span>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label style={{ display: 'block', color: '#334155', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                    <input
                      type={showCf ? 'text' : 'password'} required
                      placeholder="Repeat your password"
                      value={confirm} onChange={e => setConfirm(e.target.value)}
                      style={{ width: '100%', paddingLeft: 42, paddingRight: 42, height: 46, background: '#F8FAFC', border: `1.5px solid ${confirm && confirm !== password ? '#EF4444' : '#E2E8F0'}`, borderRadius: 11, color: '#0F172A', fontFamily: 'Inter', fontSize: 14, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                      onFocus={e => e.target.style.borderColor = '#6366F1'}
                      onBlur={e => e.target.style.borderColor = confirm && confirm !== password ? '#EF4444' : '#E2E8F0'}
                    />
                    <button type="button" onClick={() => setShowCf(v => !v)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#94A3B8' }}>
                      {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '10px 14px' }}>
                    <AlertCircle size={15} color="#EF4444" />
                    <span style={{ color: '#DC2626', fontFamily: 'Inter', fontSize: 13 }}>{error}</span>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" disabled={loading}
                  style={{ width: '100%', padding: '14px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: loading ? '#94A3B8' : 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', borderRadius: 12, color: 'white', fontFamily: 'Inter', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}>
                  {loading
                    ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Updating...</>
                    : '🔐 Set New Password'}
                </motion.button>
              </form>
            </div>

            <p style={{ textAlign: 'center', marginTop: 22, color: '#64748B', fontFamily: 'Inter', fontSize: 14 }}>
              Remember your password?{' '}
              <Link to="/login" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: 700 }}>Sign in</Link>
            </p>
          </>
        )}
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
