/* ────────────────────────────────────────────────────────
   OnboardingWizard.jsx — First-login 3-step guide
   Shows once, stored in localStorage as 'sc_onboarded'
   ──────────────────────────────────────────────────────── */
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, MessageSquare, ArrowRight, X, CheckCircle } from 'lucide-react'

const STEPS = [
  {
    emoji: '👤',
    title: 'Welcome to SkillConnect!',
    desc: 'You\'re part of a community that believes knowledge should be shared, not sold. Let\'s set you up in 3 quick steps.',
    color: '#6366F1',
    bg: '#EEF2FF',
    detail: 'This will only take 1 minute.',
    action: null,
    icon: BookOpen,
  },
  {
    emoji: '📚',
    title: 'Add Your First Skill',
    desc: 'Tell the community what you can teach and what you want to learn. The more skills you add, the better your matches.',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    detail: 'Go to Skills → Add Skill to get started.',
    action: { label: 'Go to Skills →', route: '/skills' },
    icon: BookOpen,
  },
  {
    emoji: '🤝',
    title: 'Find Your First Match',
    desc: 'Our algorithm will instantly suggest users who can teach you what you need — and learn what you can teach.',
    color: '#0EA5E9',
    bg: '#F0F9FF',
    detail: 'Visit the Matches page to see who\'s waiting for you.',
    action: { label: 'See Matches →', route: '/matches' },
    icon: Users,
  },
  {
    emoji: '💬',
    title: 'Start Your First Session',
    desc: 'Message your match, schedule a session, and start exchanging knowledge. It\'s that simple!',
    color: '#10B981',
    bg: '#ECFDF5',
    detail: 'Use Messages to connect, then Sessions to schedule.',
    action: { label: 'Go to Messages →', route: '/messages' },
    icon: MessageSquare,
  },
]

export default function OnboardingWizard({ onClose }) {
  const [step, setStep] = useState(0)
  const navigate = useNavigate()
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const finish = () => {
    sessionStorage.setItem('sc_onboarding_dismissed', '1')
    onClose()
  }

  const handleAction = () => {
    if (current.action) {
      finish()
      navigate(current.action.route)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)',
        backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000, padding: 24,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        style={{
          background: 'white', borderRadius: 28, padding: '40px 36px',
          width: '100%', maxWidth: 500, position: 'relative',
          boxShadow: '0 24px 80px rgba(99,102,241,0.2), 0 8px 24px rgba(0,0,0,0.08)',
          border: '1.5px solid rgba(99,102,241,0.1)',
          overflow: 'hidden',
        }}
      >
        {/* Accent top bar */}
        <motion.div
          key={step}
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${current.color}, ${current.color}aa)`, transformOrigin: 'left' }}
        />

        {/* Skip */}
        <button onClick={finish} style={{ position: 'absolute', top: 16, right: 16, background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <X size={14} color="#64748B" />
        </button>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === step ? 24 : 8 }}
              style={{ height: 8, borderRadius: 99, background: i <= step ? current.color : '#E2E8F0', transition: 'all 0.3s' }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
          >
            {/* Emoji */}
            <div style={{ width: 72, height: 72, background: current.bg, border: `2px solid ${current.color}25`, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, marginBottom: 20, boxShadow: `0 6px 20px ${current.color}15` }}>
              {current.emoji}
            </div>

            <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 24, color: '#0F172A', marginBottom: 10, letterSpacing: '-0.02em' }}>
              {current.title}
            </h2>
            <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#475569', lineHeight: 1.7, marginBottom: 10 }}>
              {current.desc}
            </p>
            <p style={{ fontFamily: 'Inter', fontSize: 13, color: current.color, fontWeight: 600, marginBottom: 28, background: current.bg, borderRadius: 8, padding: '8px 12px', display: 'inline-block' }}>
              💡 {current.detail}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {current.action && (
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: `0 8px 24px ${current.color}40` }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAction}
              style={{ flex: 1, padding: '13px 20px', background: `linear-gradient(135deg, ${current.color}, ${current.color}cc)`, border: 'none', borderRadius: 12, color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: `0 4px 14px ${current.color}30` }}
            >
              {current.action.label}
            </motion.button>
          )}

          {!isLast ? (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setStep(s => s + 1)}
              style={{ flex: 1, padding: '13px 20px', background: current.action ? 'white' : `linear-gradient(135deg, ${current.color}, ${current.color}cc)`, border: current.action ? '1.5px solid #E2E8F0' : 'none', borderRadius: 12, color: current.action ? '#374151' : 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: current.action ? 'none' : `0 4px 14px ${current.color}30` }}
            >
              {step === 0 ? "Let's Go!" : 'Next'} <ArrowRight size={16} />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}
              whileTap={{ scale: 0.97 }}
              onClick={finish}
              style={{ flex: 1, padding: '13px 20px', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', borderRadius: 12, color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}
            >
              <CheckCircle size={16} /> Get Started!
            </motion.button>
          )}
        </div>

        {/* Step text */}
        <p style={{ textAlign: 'center', marginTop: 16, color: '#94A3B8', fontFamily: 'Inter', fontSize: 12 }}>
          Step {step + 1} of {STEPS.length}
        </p>
      </motion.div>
    </motion.div>
  )
}
