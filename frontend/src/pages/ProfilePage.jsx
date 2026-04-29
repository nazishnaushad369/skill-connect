import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Star, MessageSquare, X, BookOpen, Award, Calendar, TrendingUp, Shield, Target, Zap, CheckCircle } from 'lucide-react'
import { usersAPI, feedbackAPI, skillsAPI, sessionsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import { SkeletonProfile, SkeletonStyles } from '../components/Skeleton'
import toast from 'react-hot-toast'

const GRADE_COLORS = ['#6366F1','#8B5CF6','#0EA5E9','#10B981','#F59E0B','#EC4899']

/* ── Inline star display ── */
function Stars({ rating, size = 14 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={size} color={n <= rating ? '#F59E0B' : '#E2E8F0'} fill={n <= rating ? '#F59E0B' : 'none'} />
      ))}
    </div>
  )
}

/* ── Achievement badges ── */
const BADGE_DEFS = [
  { id: 'first_skill',   emoji: '📚', label: 'First Skill',    desc: 'Added first skill',   check: (sk) => sk.length >= 1 },
  { id: 'five_skills',   emoji: '🔥', label: 'Skill Master',   desc: '5+ skills added',     check: (sk) => sk.length >= 5 },
  { id: 'top_rated',     emoji: '⭐', label: 'Top Rated',      desc: 'Avg rating 4.5+',     check: (_,fb) => fb?.average_rating >= 4.5 },
  { id: 'reviewer',      emoji: '✍️', label: 'Reviewed',       desc: 'Received a review',   check: (_,fb) => fb?.total_reviews >= 1 },
  { id: 'session_pro',   emoji: '🎯', label: 'Session Pro',    desc: '5+ sessions done',    check: (_,__,sess) => sess >= 5 },
  { id: 'connector',     emoji: '🤝', label: 'Connector',      desc: 'First session done',  check: (_,__,sess) => sess >= 1 },
]

function BadgeGrid({ skills, feedback, sessionCount }) {
  const earned = BADGE_DEFS.filter(b => b.check(skills, feedback, sessionCount))
  const locked = BADGE_DEFS.filter(b => !b.check(skills, feedback, sessionCount))
  return (
    <div>
      <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, color: '#0F172A', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
        <Award size={16} color="#F59E0B" /> Achievements
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {earned.map(b => (
          <motion.div key={b.id} whileHover={{ scale: 1.08 }} title={b.desc}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', border: '1.5px solid #FDE68A', borderRadius: 20, padding: '5px 12px', cursor: 'default' }}>
            <span style={{ fontSize: 16 }}>{b.emoji}</span>
            <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 12, color: '#92400E' }}>{b.label}</span>
          </motion.div>
        ))}
        {locked.map(b => (
          <div key={b.id} title={`Locked: ${b.desc}`}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 20, padding: '5px 12px', opacity: 0.45, cursor: 'default' }}>
            <span style={{ fontSize: 16, filter: 'grayscale(1)' }}>{b.emoji}</span>
            <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: '#94A3B8' }}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Review modal ── */
function FeedbackModal({ revieweeId, revieweeName, onClose, onAdded }) {
  const [rating, setRating] = useState(5)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await feedbackAPI.create({ reviewee: revieweeId, rating, comment })
      onAdded(data)
      toast.success('Review submitted!')
    } catch { toast.error('Failed to submit review'); setLoading(false) }
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
        onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
          style={{ background: 'white', border: '1.5px solid rgba(99,102,241,0.12)', borderRadius: 24, padding: '36px 32px', width: '100%', maxWidth: 420, position: 'relative', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}
          onClick={e => e.stopPropagation()}>
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={14} color="#64748B" />
          </button>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>⭐</div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 20, color: '#0F172A', marginBottom: 4 }}>Rate {revieweeName}</h2>
            <p style={{ color: '#64748B', fontFamily: 'Inter', fontSize: 13 }}>Share your experience with this skill partner</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
                {[1,2,3,4,5].map(n => (
                  <motion.button key={n} type="button" whileHover={{ scale: 1.25 }} whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                    <Star size={34} fill={(hovered || rating) >= n ? '#F59E0B' : 'none'} color={(hovered || rating) >= n ? '#F59E0B' : '#D1D5DB'} style={{ transition: 'all 0.15s' }} />
                  </motion.button>
                ))}
              </div>
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="How was your skill exchange session?"
              style={{ width: '100%', padding: '12px 14px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 12, fontFamily: 'Inter', fontSize: 13, color: '#0F172A', resize: 'none', height: 90, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#6366F1'} onBlur={e => e.target.style.borderColor = '#E2E8F0'}
            />
            <motion.button whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(99,102,241,0.4)' }} whileTap={{ scale: 0.97 }}
              type="submit" disabled={loading}
              style={{ padding: '13px', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', borderRadius: 12, color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Inline premium upsell modal (full-page layout matching PremiumGate) ── */
function PremiumModal({ onClose }) {
  const navigate = useNavigate()
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      style={{ position: 'fixed', inset: 0, display: 'flex', background: '#F8FAFC', zIndex: 1000 }}>
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: '56px 48px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 16px 48px rgba(0,0,0,0.07)' }}>
          <div style={{ width: 72, height: 72, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Lock size={30} color="#6366F1" />
          </div>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 26, color: '#0F172A', marginBottom: 10 }}>
            Premium Feature
          </h2>
          <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#64748B', marginBottom: 8, lineHeight: 1.6 }}>
            <strong style={{ color: '#0F172A' }}>Session Scheduling</strong> is available for SkillConnect Pro members.
            Upgrade to unlock session scheduling, messaging, and more.
          </p>
          <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: '14px 20px', margin: '20px 0 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, textAlign: 'left' }}>
            {['💬 Unlimited Chat', '📅 Book Sessions', '🔍 Priority Matches', '⭐ Pro Badge'].map((f, i) => (
              <div key={i} style={{ fontFamily: 'Inter', fontSize: 13, color: '#475569', fontWeight: 500 }}>{f}</div>
            ))}
          </div>
          <button onClick={() => navigate('/pricing')}
            style={{ width: '100%', background: 'linear-gradient(135deg,#3B82F6,#6366F1)', border: 'none', color: 'white', borderRadius: 12, padding: '14px', fontFamily: 'Inter', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <Zap size={16} fill="white" /> Upgrade to Pro
          </button>
          <button onClick={onClose}
            style={{ width: '100%', background: 'none', border: '1px solid #E2E8F0', color: '#64748B', borderRadius: 12, padding: '12px', fontFamily: 'Inter', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>
            Maybe later
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ── Schedule-with-user form (pre-filled partner) ── */
function ScheduleWithUser({ partnerId, partnerName, onClose }) {
  const [form, setForm] = useState({ title: '', date: '', time: '', notes: '', meet_link: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const inputStyle = { width: '100%', height: 44, padding: '0 14px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 11, fontFamily: 'Inter', fontSize: 14, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', color: '#334155', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, marginBottom: 6 }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title || !form.date || !form.time) { toast.error('Please fill title, date and time'); return }
    setLoading(true)
    try {
      await sessionsAPI.create({ ...form, user2: partnerId })
      setDone(true)
      toast.success('Session scheduled!')
      setTimeout(onClose, 1600)
    } catch { toast.error('Failed to schedule session'); setLoading(false) }
  }

  if (done) return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)', border: '2px solid #A7F3D0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
        <CheckCircle size={30} color="#059669" />
      </div>
      <h3 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 20, color: '#0F172A', marginBottom: 6 }}>Session Scheduled! 🎉</h3>
      <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#64748B' }}>Your session with {partnerName} has been booked.</p>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div><label style={labelStyle}>Session Title</label>
        <input style={inputStyle} placeholder="e.g. React Basics" value={form.title} onChange={set('title')} required
          onFocus={e => e.target.style.borderColor='#6366F1'} onBlur={e => e.target.style.borderColor='#E2E8F0'} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><label style={labelStyle}>Date</label>
          <input type="date" style={inputStyle} value={form.date} onChange={set('date')} required
            onFocus={e => e.target.style.borderColor='#6366F1'} onBlur={e => e.target.style.borderColor='#E2E8F0'} />
        </div>
        <div><label style={labelStyle}>Time</label>
          <input type="time" style={inputStyle} value={form.time} onChange={set('time')} required
            onFocus={e => e.target.style.borderColor='#6366F1'} onBlur={e => e.target.style.borderColor='#E2E8F0'} />
        </div>
      </div>
      <div><label style={labelStyle}>Notes <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional)</span></label>
        <textarea value={form.notes} onChange={set('notes')} placeholder="Any agenda or prep notes..."
          style={{ ...inputStyle, height: 72, padding: '10px 14px', resize: 'none' }}
          onFocus={e => e.target.style.borderColor='#6366F1'} onBlur={e => e.target.style.borderColor='#E2E8F0'} />
      </div>
      <div><label style={labelStyle}>Google Meet Link <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional)</span></label>
        <input type="url" style={inputStyle} placeholder="https://meet.google.com/xxx-xxxx-xxx" value={form.meet_link} onChange={set('meet_link')}
          onFocus={e => e.target.style.borderColor='#00897B'} onBlur={e => e.target.style.borderColor='#E2E8F0'} />
      </div>
      <motion.button whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(16,185,129,0.4)' }} whileTap={{ scale: 0.97 }}
        type="submit" disabled={loading}
        style={{ padding: '13px', background: 'linear-gradient(135deg,#10B981,#059669)', border: 'none', borderRadius: 12, color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Calendar size={15} /> {loading ? 'Scheduling...' : `Schedule with ${partnerName}`}
      </motion.button>
    </form>
  )
}

export default function ProfilePage() {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()
  const [profileUser, setProfileUser] = useState(null)
  const [skills, setSkills] = useState([])
  const [feedback, setFeedback] = useState(null)
  const [sessionCount, setSessionCount] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [showPremium, setShowPremium] = useState(false)
  const [loading, setLoading] = useState(true)
  const isOwn = parseInt(id) === currentUser?.id

  useEffect(() => {
    Promise.all([
      usersAPI.detail(id),
      skillsAPI.list({ user: id }),
      feedbackAPI.userFeedback(id),
      sessionsAPI.list({}),
    ]).then(([u, sk, fb, sess]) => {
      setProfileUser(u.data)
      const allSkills = Array.isArray(sk.data) ? sk.data : (sk.data?.results ?? [])
      setSkills(allSkills.filter(s => s.user_id === parseInt(id)))
      setFeedback(fb.data)
      const allSess = Array.isArray(sess.data) ? sess.data : (sess.data?.results ?? [])
      setSessionCount(allSess.filter(s => s.status === 'completed').length)
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="page-bg" style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '40px 48px' }}>
        <SkeletonProfile />
        <SkeletonStyles />
      </main>
    </div>
  )

  if (!profileUser) return null

  const teachSkills = skills.filter(s => s.skill_type === 'teach')
  const learnSkills = skills.filter(s => s.skill_type === 'learn')
  const avgRating = feedback?.average_rating || 0
  const totalReviews = feedback?.total_reviews || 0
  const initials = profileUser.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()
  const gradIndex = profileUser.id % GRADE_COLORS.length
  const avatarGrad = `linear-gradient(135deg, ${GRADE_COLORS[gradIndex]}, ${GRADE_COLORS[(gradIndex+2)%GRADE_COLORS.length]})`

  return (
    <div className="page-bg" style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', right: '10%', width: 420, height: 420, background: 'radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '20%', width: 320, height: 320, background: 'radial-gradient(circle,rgba(139,92,246,0.06) 0%,transparent 70%)', borderRadius: '50%' }} />
      </div>

      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '40px 48px', maxWidth: 'calc(100vw - 240px)', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          {/* ── Hero card ── */}
          <div style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', border: '1.5px solid rgba(255,255,255,0.95)', borderRadius: 24, padding: '32px 36px', marginBottom: 24, boxShadow: '0 8px 40px rgba(99,102,241,0.10)', position: 'relative', overflow: 'hidden' }}>
            {/* top gradient bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: avatarGrad }} />

            <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Avatar + online dot */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 90, height: 90, borderRadius: '50%', background: avatarGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 900, color: 'white', fontFamily: 'Outfit', boxShadow: `0 8px 28px ${GRADE_COLORS[gradIndex]}40` }}>
                  {initials}
                </div>
                {/* Online / Offline dot */}
                <div style={{ position: 'absolute', bottom: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: profileUser.is_online ? '#22C55E' : '#94A3B8', border: '2.5px solid white', boxShadow: profileUser.is_online ? '0 0 0 3px rgba(34,197,94,0.25)' : 'none', animation: profileUser.is_online ? 'pulse 2s infinite' : 'none' }} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 28, color: '#0F172A', marginBottom: 4, letterSpacing: '-0.02em' }}>{profileUser.name}</h1>
                    {/* Online / Offline label */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: profileUser.is_online ? '#22C55E' : '#94A3B8', flexShrink: 0, animation: profileUser.is_online ? 'pulse 2s infinite' : 'none' }} />
                      <span style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: profileUser.is_online ? '#16A34A' : '#94A3B8' }}>
                        {profileUser.is_online ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                      {profileUser.email ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748B', fontFamily: 'Inter', fontSize: 13 }}>
                          <Mail size={13} /> {profileUser.email}
                        </div>
                      ) : !isOwn && (
                        <div
                          title="Upgrade to Pro to view this user's email"
                          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'linear-gradient(135deg,#F5F3FF,#EEF2FF)', border: '1px solid #C7D2FE', borderRadius: 20, padding: '3px 10px', cursor: 'pointer' }}
                          onClick={() => window.location.href = '/pricing'}
                        >
                          <Lock size={11} color="#6366F1" />
                          <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 12, color: '#4338CA' }}>Email hidden · Upgrade to Pro</span>
                        </div>
                      )}
                      {profileUser.is_premium && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'linear-gradient(135deg,#FFF7ED,#FEF3C7)', border: '1px solid #FDE68A', borderRadius: 20, padding: '3px 10px' }}>
                          <Zap size={11} color="#D97706" fill="#D97706" />
                          <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 11, color: '#92400E' }}>PRO</span>
                        </div>
                      )}
                      {totalReviews > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 20, padding: '3px 10px' }}>
                          <Star size={12} color="#F59E0B" fill="#F59E0B" />
                          <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 12, color: '#92400E' }}>{avgRating}</span>
                          <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#B45309' }}>({totalReviews} reviews)</span>
                        </div>
                      )}
                    </div>
                    {profileUser.bio && <p style={{ color: '#475569', fontFamily: 'Inter', fontSize: 14, lineHeight: 1.7, maxWidth: 520 }}>{profileUser.bio}</p>}
                  </div>

                  {!isOwn && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <motion.button whileHover={{ scale: 1.04, boxShadow: '0 6px 20px rgba(99,102,241,0.4)' }} whileTap={{ scale: 0.96 }}
                        onClick={() => navigate(`/messages/${profileUser.id}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', borderRadius: 12, padding: '10px 18px', color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
                        <MessageSquare size={14} /> Message
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.04, boxShadow: '0 6px 20px rgba(16,185,129,0.35)' }} whileTap={{ scale: 0.96 }}
                        onClick={() => currentUser?.is_premium ? setShowSchedule(true) : setShowPremium(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, background: currentUser?.is_premium ? 'linear-gradient(135deg,#10B981,#059669)' : 'rgba(16,185,129,0.08)', border: currentUser?.is_premium ? 'none' : '1.5px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '10px 18px', color: currentUser?.is_premium ? 'white' : '#059669', fontFamily: 'Inter', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: currentUser?.is_premium ? '0 4px 14px rgba(16,185,129,0.3)' : 'none' }}>
                        <Calendar size={14} /> Schedule
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                        onClick={() => setShowFeedback(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 12, padding: '10px 18px', color: '#374151', fontFamily: 'Inter', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                        <Star size={14} color="#F59E0B" /> Review
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stat pills */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              {[
                { icon: BookOpen,    val: teachSkills.length, label: 'Teaching',   color: '#6366F1', bg: '#EEF2FF', border: '#C7D2FE' },
                { icon: Target,      val: learnSkills.length, label: 'Learning',   color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
                { icon: Calendar,    val: sessionCount,       label: 'Sessions',   color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
                { icon: TrendingUp,  val: totalReviews,       label: 'Reviews',    color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 12, padding: '8px 14px' }}>
                  <s.icon size={14} color={s.color} />
                  <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: s.color }}>{s.val}</span>
                  <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#64748B', fontWeight: 500 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Skills card */}
            <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(255,255,255,0.95)', borderRadius: 20, padding: '24px 26px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 17, color: '#0F172A', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 7 }}>
                <BookOpen size={16} color="#6366F1" /> Skills
              </h2>
              {teachSkills.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#6366F1', fontFamily: 'Inter', fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Can Teach</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {teachSkills.map(s => <span key={s.id} style={{ background: '#EEF2FF', color: '#4338CA', border: '1px solid #C7D2FE', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, fontFamily: 'Inter' }}>{s.skill_name}</span>)}
                  </div>
                </div>
              )}
              {learnSkills.length > 0 && (
                <div>
                  <div style={{ color: '#8B5CF6', fontFamily: 'Inter', fontSize: 11, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Wants to Learn</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                    {learnSkills.map(s => <span key={s.id} style={{ background: '#F5F3FF', color: '#7C3AED', border: '1px solid #DDD6FE', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, fontFamily: 'Inter' }}>{s.skill_name}</span>)}
                  </div>
                </div>
              )}
              {skills.length === 0 && <p style={{ color: '#94A3B8', fontFamily: 'Inter', fontSize: 14 }}>No skills added yet.</p>}
            </div>

            {/* Reviews card */}
            <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(255,255,255,0.95)', borderRadius: 20, padding: '24px 26px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 17, color: '#0F172A', marginBottom: totalReviews > 0 ? 12 : 18, display: 'flex', alignItems: 'center', gap: 7 }}>
                <Star size={16} color="#F59E0B" /> Reviews
              </h2>
              {totalReviews > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, background: '#FFFBEB', borderRadius: 12, padding: '10px 14px', border: '1px solid #FDE68A' }}>
                  <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 32, color: '#F59E0B' }}>{avgRating}</span>
                  <div>
                    <Stars rating={Math.round(avgRating)} size={16} />
                    <div style={{ color: '#64748B', fontFamily: 'Inter', fontSize: 12, marginTop: 3 }}>{totalReviews} review{totalReviews !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}
              {!feedback?.reviews?.length ? (
                <p style={{ color: '#94A3B8', fontFamily: 'Inter', fontSize: 14 }}>No reviews yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 200, overflowY: 'auto' }}>
                  {feedback.reviews.map(r => (
                    <div key={r.id} style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 14px', border: '1px solid #F1F5F9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 13, color: '#0F172A' }}>{r.reviewer_detail?.name}</span>
                        <Stars rating={r.rating} size={13} />
                      </div>
                      {r.comment && <p style={{ color: '#64748B', fontFamily: 'Inter', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Achievement Badges */}
          <div style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(255,255,255,0.95)', borderRadius: 20, padding: '24px 26px', marginTop: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <BadgeGrid skills={skills} feedback={feedback} sessionCount={sessionCount} />
          </div>

        </motion.div>
        <SkeletonStyles />
      </main>

      {showFeedback && (
        <FeedbackModal
          revieweeId={parseInt(id)}
          revieweeName={profileUser.name}
          onClose={() => setShowFeedback(false)}
          onAdded={(r) => {
            setFeedback(p => ({ ...p, reviews: [r, ...(p?.reviews || [])], total_reviews: (p?.total_reviews || 0) + 1 }))
            setShowFeedback(false)
          }}
        />
      )}

      {showPremium && <PremiumModal onClose={() => setShowPremium(false)} />}

      {showSchedule && (
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
            onClick={() => setShowSchedule(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{ background: 'white', border: '1.5px solid rgba(99,102,241,0.12)', borderRadius: 24, padding: '36px 32px', width: '100%', maxWidth: 480, position: 'relative', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowSchedule(false)} style={{ position: 'absolute', top: 14, right: 14, background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={14} color="#64748B" />
              </button>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 22, marginBottom: 6, color: '#0F172A' }}>📅 Schedule a Session</h2>
              <p style={{ fontFamily: 'Inter', fontSize: 13, color: '#64748B', marginBottom: 24 }}>with <strong style={{ color: '#6366F1' }}>{profileUser.name}</strong></p>
              <ScheduleWithUser partnerId={profileUser.id} partnerName={profileUser.name} onClose={() => setShowSchedule(false)} />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
