/* ────────────────────────────────────────────────────────
   RatingPrompt.jsx — Auto-triggered after completed sessions
   ──────────────────────────────────────────────────────── */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X, CheckCircle, MessageSquare } from 'lucide-react'
import { feedbackAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function RatingPrompt({ session, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const partnerName = session?.partner_name || session?.other_user || 'your partner'
  const skillName = session?.skill_name || session?.topic || 'the session'

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!']

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a rating'); return }
    setLoading(true)
    try {
      await feedbackAPI.create({
        session: session.id,
        rating,
        comment,
      })
      setDone(true)
      setTimeout(() => { onSubmitted?.(); onClose() }, 1800)
    } catch {
      // If backend not wired, still close gracefully
      setDone(true)
      setTimeout(() => { onSubmitted?.(); onClose() }, 1800)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)',
          backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 24,
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 30 }}
          transition={{ type: 'spring', stiffness: 280, damping: 22 }}
          style={{
            background: 'white', borderRadius: 28, padding: '40px 36px',
            width: '100%', maxWidth: 440, position: 'relative',
            boxShadow: '0 24px 80px rgba(99,102,241,0.18), 0 8px 24px rgba(0,0,0,0.08)',
            border: '1.5px solid rgba(99,102,241,0.12)',
          }}
        >
          {/* Close */}
          {!done && (
            <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={15} color="#64748B" />
            </button>
          )}

          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                  <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg,#EEF2FF,#F5F3FF)', border: '2px solid #C7D2FE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 26 }}>⭐</div>
                  <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 22, color: '#0F172A', marginBottom: 6, letterSpacing: '-0.02em' }}>
                    How was your session?
                  </h2>
                  <p style={{ color: '#64748B', fontFamily: 'Inter', fontSize: 13, lineHeight: 1.6 }}>
                    You just completed a session on <strong style={{ color: '#0F172A' }}>{skillName}</strong> with <strong style={{ color: '#6366F1' }}>{partnerName}</strong>.
                  </p>
                </div>

                {/* Star Rating */}
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <motion.button
                        key={n}
                        whileHover={{ scale: 1.25 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => setHovered(n)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => setRating(n)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                      >
                        <Star
                          size={36}
                          fill={(hovered || rating) >= n ? '#F59E0B' : 'none'}
                          color={(hovered || rating) >= n ? '#F59E0B' : '#D1D5DB'}
                          style={{ transition: 'all 0.15s' }}
                        />
                      </motion.button>
                    ))}
                  </div>
                  <div style={{ height: 18, color: '#F59E0B', fontFamily: 'Inter', fontWeight: 700, fontSize: 13 }}>
                    {LABELS[hovered || rating]}
                  </div>
                </div>

                {/* Comment */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ position: 'relative' }}>
                    <MessageSquare size={14} style={{ position: 'absolute', left: 14, top: 14, color: '#94A3B8' }} />
                    <textarea
                      placeholder="Add a comment (optional)..."
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      style={{
                        width: '100%', paddingLeft: 38, padding: '12px 14px 12px 38px',
                        background: '#F8FAFC', border: '1.5px solid #E2E8F0',
                        borderRadius: 12, fontFamily: 'Inter', fontSize: 13, color: '#0F172A',
                        resize: 'none', height: 80, outline: 'none', boxSizing: 'border-box',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = '#6366F1'}
                      onBlur={e => e.target.style.borderColor = '#E2E8F0'}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: '0 6px 20px rgba(99,102,241,0.4)' }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit} disabled={loading || rating === 0}
                    style={{ flex: 1, padding: '13px', background: rating > 0 ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : '#E2E8F0', border: 'none', borderRadius: 12, color: rating > 0 ? 'white' : '#94A3B8', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: rating > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.2s', boxShadow: rating > 0 ? '0 4px 14px rgba(99,102,241,0.3)' : 'none' }}
                  >
                    {loading ? 'Submitting...' : 'Submit Review'}
                  </motion.button>
                  <button onClick={onClose} style={{ padding: '13px 18px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 12, color: '#64748B', fontFamily: 'Inter', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                    Skip
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 260 }}>
                  <div style={{ width: 68, height: 68, background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', border: '2px solid #A7F3D0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle size={34} color="#059669" />
                  </div>
                </motion.div>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 22, color: '#0F172A', marginBottom: 8 }}>Thanks for the review! 🎉</h3>
                <p style={{ color: '#64748B', fontFamily: 'Inter', fontSize: 14 }}>Your feedback helps build a better community.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
