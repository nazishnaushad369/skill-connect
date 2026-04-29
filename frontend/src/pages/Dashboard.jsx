import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Users, Calendar, Plus, ArrowRight, Star, Zap, Clock, TrendingUp, Sparkles, BarChart2, Award } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { skillsAPI, matchesAPI, sessionsAPI } from '../services/api'
import Sidebar from '../components/Sidebar'
import AddSkillModal from '../components/AddSkillModal'
import { SkeletonStatCard, SkeletonMatchCard, SkeletonStyles } from '../components/Skeleton'
import OnboardingWizard from '../components/OnboardingWizard'
import toast from 'react-hot-toast'

const STAT_CONFIGS = [
  { key: 'teach',    label: 'Skills Teaching',   icon: BookOpen,    gradient: 'linear-gradient(135deg,#3B82F6,#2563EB)', glow: '#3B82F6', route: '/skills?tab=mine&type=teach' },
  { key: 'learn',    label: 'Skills Learning',    icon: Star,        gradient: 'linear-gradient(135deg,#A855F7,#7C3AED)', glow: '#A855F7', route: '/skills?tab=mine&type=learn' },
  { key: 'matches',  label: 'Suggested Matches',  icon: Users,       gradient: 'linear-gradient(135deg,#6366F1,#4F46E5)', glow: '#6366F1', route: '/matches' },
  { key: 'sessions', label: 'Upcoming Sessions',  icon: Calendar,    gradient: 'linear-gradient(135deg,#22C55E,#16A34A)', glow: '#22C55E', route: '/sessions' },
]

function AnimatedCounter({ target, delay = 0 }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (target === 0) return
    let start = 0
    const timer = setInterval(() => {
      start += 1
      setCount(start)
      if (start >= target) clearInterval(timer)
    }, 60)
    return () => clearInterval(timer)
  }, [target])
  return <span>{Math.min(count, target)}</span>
}

function StatCard({ label, value, icon: Icon, gradient, glow, route, delay }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 120 }}
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(route)}
      style={{
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.9)',
        borderRadius: 20,
        padding: '24px 20px',
        cursor: 'pointer',
        boxShadow: `0 8px 32px ${glow}15, 0 2px 8px rgba(0,0,0,0.06)`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.3s',
      }}
    >
      {/* Gradient accent top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: gradient, borderRadius: '20px 20px 0 0' }} />

      {/* Background glow blob */}
      <div style={{
        position: 'absolute', bottom: -20, right: -20,
        width: 100, height: 100,
        background: `radial-gradient(circle, ${glow}18 0%, transparent 70%)`,
        borderRadius: '50%',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 48, height: 48, background: gradient, borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 16px ${glow}40`,
        }}>
          <Icon size={22} color="white" />
        </div>
        <div style={{
          background: `${glow}12`, borderRadius: 8, padding: '4px 8px',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <TrendingUp size={11} color={glow} />
          <span style={{ fontSize: 11, fontWeight: 700, color: glow, fontFamily: 'Inter' }}>Active</span>
        </div>
      </div>

      <div style={{ fontSize: 38, fontFamily: 'Outfit', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>
        <AnimatedCounter target={value} />
      </div>
      <div style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: 13, fontWeight: 500, marginTop: 6 }}>{label}</div>
    </motion.div>
  )
}

function MatchCard({ s, i, navigate }) {
  const gradients = [
    'linear-gradient(135deg,#3B82F6,#6366F1)',
    'linear-gradient(135deg,#A855F7,#EC4899)',
    'linear-gradient(135deg,#22C55E,#3B82F6)',
    'linear-gradient(135deg,#F59E0B,#EF4444)',
  ]
  return (
    <motion.div
      key={s.user.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + i * 0.08 }}
      whileHover={{ x: 4 }}
      onClick={() => navigate(`/profile/${s.user.id}`)}
      style={{
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.9)',
        borderRadius: 16, padding: '14px 16px',
        cursor: 'pointer', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 12px rgba(99,102,241,0.08)',
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: gradients[i % gradients.length],
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontFamily: 'Outfit', fontWeight: 800,
          color: 'white', fontSize: 16, boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
        }}>
          {s.user.name[0]}
        </div>
        <div>
          <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{s.user.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Inter', marginTop: 2 }}>
            {s.they_can_teach_you.length > 0 && `Can teach: ${s.they_can_teach_you.slice(0, 2).join(', ')}`}
          </div>
        </div>
      </div>
      <div style={{
        background: 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(99,102,241,0.12))',
        border: '1px solid rgba(99,102,241,0.2)',
        color: '#4338CA', borderRadius: 20, padding: '5px 12px',
        fontSize: 12, fontFamily: 'Inter', fontWeight: 700,
        whiteSpace: 'nowrap',
      }}>
        {s.match_score} match{s.match_score !== 1 ? 'es' : ''}
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [mySkills, setMySkills] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [sessions, setSessions] = useState([])
  const [allSessions, setAllSessions] = useState([])
  const [showAddSkill, setShowAddSkill] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    Promise.all([
      skillsAPI.mine(),
      matchesAPI.suggest(),
      sessionsAPI.list({ status: 'scheduled' }),
      sessionsAPI.list({}),
    ]).then(([s, m, sess, allSess]) => {
      const skills = Array.isArray(s.data) ? s.data : (s.data?.results ?? [])
      setMySkills(skills)
      setSuggestions((Array.isArray(m.data) ? m.data : (m.data?.results ?? [])).slice(0, 4))
      setSessions((Array.isArray(sess.data) ? sess.data : (sess.data?.results ?? [])).slice(0, 3))
      const all = Array.isArray(allSess.data) ? allSess.data : (allSess.data?.results ?? [])
      setAllSessions(all)

      // Show onboarding for new users OR users with zero skills
      // sessionStorage ensures it won't repeatedly pop up within the same session after dismissal
      if (skills.length === 0 && !sessionStorage.getItem('sc_onboarding_dismissed')) {
        setTimeout(() => setShowOnboarding(true), 800)
      }
    }).catch(() => toast.error('Failed to load dashboard data'))
    .finally(() => setLoading(false))
  }, [])

  const teachSkills = mySkills.filter(s => s.skill_type === 'teach')
  const learnSkills = mySkills.filter(s => s.skill_type === 'learn')
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const greetEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙'

  // Analytics
  const now = new Date()
  const thisMonth = allSessions.filter(s => {
    const d = new Date(s.scheduled_at || s.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const completedCount = allSessions.filter(s => s.status === 'completed').length
  const hoursLearned = completedCount  // Approximate: 1 session ≈ 1 hour


  const statValues = {
    teach: teachSkills.length,
    learn: learnSkills.length,
    matches: suggestions.length,
    sessions: sessions.length,
  }

  return (
    <div className="page-bg" style={{ display: 'flex', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Animated background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', top: '8%', left: '18%', width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
          borderRadius: '50%', animation: 'floatOrb 8s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 70%)',
          borderRadius: '50%', animation: 'floatOrb 11s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', top: '50%', right: '30%', width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)',
          borderRadius: '50%', animation: 'floatOrb 14s ease-in-out infinite',
        }} />
      </div>

      <Sidebar />

      <main style={{ marginLeft: 240, flex: 1, padding: '36px 44px', maxWidth: 'calc(100vw - 240px)', position: 'relative', zIndex: 1 }}>

        {/* Hero Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            <div style={{
              background: 'linear-gradient(135deg,#6366F1,#A855F7)',
              borderRadius: 16, padding: '10px 12px',
              boxShadow: '0 6px 24px rgba(99,102,241,0.35)',
            }}>
              <Sparkles size={20} color="white" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 32, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1 }}>
                Good {greeting}, {user?.name?.split(' ')[0]}! {greetEmoji}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: 14, marginTop: 4 }}>
                Here's your skill exchange journey at a glance.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Analytics Strip */}
        {!loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
            {[
              { icon: BarChart2, label: 'Sessions this month', value: `${thisMonth.length}`,   color: '#6366F1', bg: '#EEF2FF', border: '#C7D2FE' },
              { icon: Award,     label: 'Total completed',     value: `${completedCount}`,     color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
              { icon: Clock,     label: 'Hours learned',        value: `~${hoursLearned}h`,   color: '#0EA5E9', bg: '#F0F9FF', border: '#BAE6FD' },
            ].map((a, i) => (
              <motion.div key={i} whileHover={{ y: -3 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: a.bg, border: `1.5px solid ${a.border}`, borderRadius: 12, padding: '8px 14px', cursor: 'default', flexShrink: 0 }}>
                <a.icon size={15} color={a.color} />
                <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, color: a.color }}>{a.value}</span>
                <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#64748B', fontWeight: 500 }}>{a.label}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Subscription Banner */}
        {user?.is_premium ? (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            style={{
              background: 'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(99,102,241,0.10))',
              border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16,
              padding: '14px 20px', marginBottom: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              backdropFilter: 'blur(12px)',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#3B82F6,#6366F1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                <Zap size={16} color="white" fill="white" />
              </div>
              <div>
                <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: '#1E40AF' }}>SkillConnect Pro</span>
                {user?.premium_expires_at && (() => {
                  const exp = new Date(user.premium_expires_at)
                  const daysLeft = Math.max(0, Math.ceil((exp - new Date()) / 86400000))
                  return <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#64748B', marginTop: 1, display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={11} /> Active until {exp.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                })()}
              </div>
            </div>
            <button onClick={() => navigate('/pricing')} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#2563EB', borderRadius: 8, padding: '6px 14px', fontFamily: 'Inter', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Manage Plan</button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
            style={{
              background: 'linear-gradient(135deg,#1E1B4B,#4F46E5,#7C3AED)',
              borderRadius: 16, padding: '18px 24px', marginBottom: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 8px 32px rgba(79,70,229,0.35)', position: 'relative', overflow: 'hidden',
            }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, background: 'radial-gradient(circle,rgba(255,255,255,0.08),transparent)', borderRadius: '50%' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, background: 'rgba(255,255,255,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Zap size={20} color="white" fill="white" />
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 15, color: 'white' }}>Upgrade to Pro ✨</div>
                <div style={{ fontFamily: 'Inter', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Unlock messaging & session scheduling from ₹99/month</div>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/pricing')}
              style={{ background: 'white', border: 'none', color: '#4F46E5', borderRadius: 10, padding: '10px 20px', fontFamily: 'Inter', fontSize: 13, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', whiteSpace: 'nowrap' }}>
              View Plans →
            </motion.button>
          </motion.div>
        )}

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 40 }}>
          {loading
            ? [0,1,2,3].map(i => <SkeletonStatCard key={i} />)
            : STAT_CONFIGS.map((cfg, i) => (
                <StatCard key={cfg.key} {...cfg} value={statValues[cfg.key]} delay={i * 0.08} />
              ))
          }
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {/* My Skills */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 19, color: 'var(--text-primary)' }}>My Skills</h2>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setShowAddSkill(true)}
                style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)', border: 'none', borderRadius: 10, padding: '8px 16px', color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                <Plus size={14} /> Add Skill
              </motion.button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[0,1].map(i => <div key={i} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: 18, border: '1px solid rgba(255,255,255,0.9)' }}>
                  <div style={{ height: 14, width: '40%', background: 'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite', borderRadius: 6, marginBottom: 14 }} />
                  <div style={{ display: 'flex', gap: 8 }}>{[80,100,90].map((w,j) => <div key={j} style={{ height: 30, width: w, background: 'linear-gradient(90deg,#F1F5F9 25%,#E2E8F0 50%,#F1F5F9 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s ease-in-out infinite', borderRadius: 8 }} />)}</div>
                </div>)}
              </div>
            ) : mySkills.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.9)', padding: 40, textAlign: 'center', boxShadow: '0 4px 20px rgba(99,102,241,0.08)' }}>
                <BookOpen size={36} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#94A3B8', fontFamily: 'Inter', fontSize: 14, marginBottom: 16 }}>No skills yet. Add one to get started!</p>
                <motion.button whileHover={{ scale: 1.04 }} onClick={() => setShowAddSkill(true)} style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)', border: 'none', borderRadius: 10, padding: '10px 20px', color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Add First Skill</motion.button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Teaching */}
                <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', borderRadius: 20, border: '1px solid rgba(59,130,246,0.15)', padding: 18, boxShadow: '0 4px 20px rgba(59,130,246,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#3B82F6,#2563EB)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={13} color="white" />
                      </div>
                      <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: '#1E40AF' }}>Teaching</span>
                      <span style={{ background: 'rgba(59,130,246,0.12)', color: '#2563EB', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontFamily: 'Inter', fontWeight: 700 }}>{teachSkills.length}</span>
                    </div>
                    <button onClick={() => navigate('/skills?tab=mine&type=teach')} style={{ background: 'none', border: 'none', color: '#3B82F6', fontFamily: 'Inter', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>View all <ArrowRight size={12} /></button>
                  </div>
                  {teachSkills.length === 0 ? (
                    <p style={{ color: '#94A3B8', fontFamily: 'Inter', fontSize: 13 }}>No teaching skills yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {teachSkills.map(s => (
                        <motion.div key={s.id} whileHover={{ scale: 1.04 }} onClick={() => navigate('/skills?tab=mine&type=teach')}
                          style={{ background: 'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(99,102,241,0.08))', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '7px 13px', cursor: 'pointer' }}>
                          <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: '#60A5FA' }}>{s.skill_name}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Inter', marginTop: 1 }}>{s.category}</div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Learning */}
                <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', borderRadius: 20, border: '1px solid rgba(168,85,247,0.15)', padding: 18, boxShadow: '0 4px 20px rgba(168,85,247,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg,#A855F7,#7C3AED)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Star size={13} color="white" />
                      </div>
                      <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 14, color: '#7E22CE' }}>Learning</span>
                      <span style={{ background: 'rgba(168,85,247,0.12)', color: '#A855F7', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontFamily: 'Inter', fontWeight: 700 }}>{learnSkills.length}</span>
                    </div>
                    <button onClick={() => navigate('/skills?tab=mine&type=learn')} style={{ background: 'none', border: 'none', color: '#A855F7', fontFamily: 'Inter', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>View all <ArrowRight size={12} /></button>
                  </div>
                  {learnSkills.length === 0 ? (
                    <p style={{ color: '#94A3B8', fontFamily: 'Inter', fontSize: 13 }}>No learning skills yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {learnSkills.map(s => (
                        <motion.div key={s.id} whileHover={{ scale: 1.04 }} onClick={() => navigate('/skills?tab=mine&type=learn')}
                          style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.08),rgba(124,58,237,0.08))', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 10, padding: '7px 13px', cursor: 'pointer' }}>
                          <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: '#C084FC' }}>{s.skill_name}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'Inter', marginTop: 1 }}>{s.category}</div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Suggested Matches */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 19, color: 'var(--text-primary)' }}>Suggested Matches</h2>
              <button onClick={() => navigate('/matches')} style={{ background: 'none', border: 'none', color: '#6366F1', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {loading ? (
                [0,1,2].map(i => <SkeletonMatchCard key={i} />)
              ) : suggestions.length === 0 ? (
                <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(16px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.9)', padding: 40, textAlign: 'center', boxShadow: '0 4px 20px rgba(99,102,241,0.08)' }}>
                  <Users size={36} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: '#94A3B8', fontFamily: 'Inter', fontSize: 14 }}>Add more skills to get personalized matches!</p>
                </div>
              ) : (
                suggestions.map((s, i) => <MatchCard key={s.user.id} s={s} i={i} navigate={navigate} />)
              )}
            </div>
          </motion.div>
        </div>
        <SkeletonStyles />

        {/* Upcoming Sessions */}
        {sessions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ marginTop: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 19, color: 'var(--text-primary)' }}>Upcoming Sessions</h2>
              <button onClick={() => navigate('/sessions')} style={{ background: 'none', border: 'none', color: '#22C55E', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ArrowRight size={14} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {sessions.map((s, i) => {
                const partner = s.user1_detail?.id === user?.id ? s.user2_detail : s.user1_detail
                return (
                  <motion.div key={s.id} whileHover={{ y: -4 }} onClick={() => navigate('/sessions')}
                    style={{
                      background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)',
                      borderRadius: 18, border: '1px solid rgba(34,197,94,0.2)',
                      padding: '18px 20px', cursor: 'pointer',
                      boxShadow: '0 4px 20px rgba(34,197,94,0.08)',
                      position: 'relative', overflow: 'hidden',
                    }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#22C55E,#16A34A)' }} />
                    <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 6 }}>{s.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12, fontFamily: 'Inter', marginBottom: 6 }}>with <strong style={{ color: 'var(--text-primary)' }}>{partner?.name || 'Partner'}</strong></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.08)', borderRadius: 8, padding: '5px 10px' }}>
                      <Calendar size={12} color="#16A34A" />
                      <span style={{ color: '#15803D', fontSize: 12, fontFamily: 'Inter', fontWeight: 600 }}>{s.date} at {s.time?.slice(0, 5)}</span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </main>

      {showAddSkill && (
        <AddSkillModal
          onClose={() => setShowAddSkill(false)}
          onAdded={(skill) => { setMySkills(p => [skill, ...p]); setShowAddSkill(false); toast.success('Skill added!') }}
        />
      )}

      {showOnboarding && (
        <OnboardingWizard onClose={() => { sessionStorage.setItem('sc_onboarding_dismissed', '1'); setShowOnboarding(false) }} />
      )}

      <style>{`
        @keyframes floatOrb {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(30px,-20px) scale(1.08); }
          66%      { transform: translate(-20px,15px) scale(0.95); }
        }
      `}</style>
    </div>
  )
}
