import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Plus, Trash2, BookOpen, Target, ExternalLink } from 'lucide-react'
import { skillsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import AddSkillModal from '../components/AddSkillModal'
import { SkeletonSkillCard, SkeletonStyles } from '../components/Skeleton'
import toast from 'react-hot-toast'

const LEVEL_META = {
  Beginner:     { color: '#22C55E', bg: 'rgba(34,197,94,0.1)',   label: '🌱 Beginner' },
  Intermediate: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',  label: '⚡ Intermediate' },
  Advanced:     { color: '#A855F7', bg: 'rgba(168,85,247,0.1)',  label: '🔥 Advanced' },
  Expert:       { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  label: '👑 Expert' },
}

const CARD_GRADIENTS = ['135deg,#3B82F6,#6366F1','135deg,#A855F7,#EC4899','135deg,#22C55E,#3B82F6','135deg,#F59E0B,#EF4444','135deg,#06B6D4,#3B82F6','135deg,#6366F1,#A855F7']

function SkillCard({ s, user, onDelete, accentColor, index = 0 }) {
  const navigate = useNavigate()
  const isOwn = s.user_id === user?.id
  const levelMeta = LEVEL_META[s.level]
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length]
  const isTeach = s.skill_type === 'teach'

  const handleCardClick = () => {
    if (s.user_id) navigate(`/profile/${s.user_id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 120 }}
      whileHover={{ y: -6, scale: 1.01 }}
      onClick={handleCardClick}
      className="glass-card"
      style={{
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
        boxShadow: `0 6px 24px ${accentColor}12, 0 2px 6px rgba(0,0,0,0.05)`,
        transition: 'box-shadow 0.3s',
      }}
    >
      {/* Gradient accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(${gradient})` }} />

      {/* Background blob */}
      <div style={{
        position: 'absolute', bottom: -30, right: -30,
        width: 120, height: 120,
        background: `radial-gradient(circle, ${accentColor}10 0%, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ flex: 1, paddingRight: 8 }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 17, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.2 }}>{s.skill_name}</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{
              background: isTeach ? 'rgba(59,130,246,0.1)' : 'rgba(168,85,247,0.1)',
              color: isTeach ? '#2563EB' : '#7C3AED',
              border: `1px solid ${isTeach ? 'rgba(59,130,246,0.25)' : 'rgba(168,85,247,0.25)'}`,
              borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, fontFamily: 'Inter',
            }}>
              {isTeach ? '📚 Teaching' : '🎯 Learning'}
            </span>
            <span style={{ background: 'rgba(99,102,241,0.08)', color: '#4338CA', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, fontFamily: 'Inter' }}>
              {s.category}
            </span>
            {levelMeta && (
              <span style={{ background: levelMeta.bg, color: levelMeta.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, fontFamily: 'Inter' }}>
                {levelMeta.label}
              </span>
            )}
          </div>
        </div>
        {isOwn && (
          <motion.button
            whileHover={{ scale: 1.15, color: '#EF4444' }}
            onClick={e => { e.stopPropagation(); onDelete(s.id) }}
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', color: '#94A3B8', cursor: 'pointer', padding: '6px 7px', borderRadius: 9, transition: 'all 0.2s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'rgba(239,68,68,0.06)' }}
          >
            <Trash2 size={13} />
          </motion.button>
        )}
      </div>

      {s.description && (
        <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: 13, lineHeight: 1.65, marginBottom: 14 }}>{s.description}</p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: '1px solid rgba(241,245,249,0.8)' }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: `linear-gradient(${gradient})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800, color: 'white', fontFamily: 'Outfit',
          boxShadow: `0 3px 10px ${accentColor}35`, flexShrink: 0,
        }}>
          {s.user_name?.[0] || '?'}
        </div>
        <span style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: 13, fontWeight: 500, flex: 1 }}>{s.user_name || 'Unknown'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: accentColor, fontFamily: 'Inter', fontSize: 11, fontWeight: 600, opacity: 0.75 }}>
          View Profile <ExternalLink size={10} />
        </span>
      </div>
    </motion.div>
  )
}

function SectionHeader({ icon: Icon, title, count, color, bgColor, borderColor }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: `2px solid ${borderColor}` }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: bgColor, border: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 20, color, margin: 0 }}>{title}</h2>
        <p style={{ fontFamily: 'Inter', fontSize: 12, color: '#94A3B8', margin: 0, marginTop: 2 }}>{count} skill{count !== 1 ? 's' : ''}</p>
      </div>
      <span style={{ marginLeft: 'auto', background: bgColor, border: `1px solid ${borderColor}`, color, borderRadius: 20, padding: '3px 12px', fontFamily: 'Inter', fontWeight: 700, fontSize: 13 }}>
        {count}
      </span>
    </div>
  )
}

export default function SkillBrowser() {
  const { user } = useAuth()
  const location = useLocation()

  const urlParams   = new URLSearchParams(location.search)
  const initialTab  = urlParams.get('tab')  || 'all'
  const initialType = urlParams.get('type') || ''

  const [skills,     setSkills]     = useState([])
  const [search,     setSearch]     = useState('')
  const [typeFilter, setTypeFilter] = useState(initialType)
  const [loading,    setLoading]    = useState(true)
  const [showAdd,    setShowAdd]    = useState(false)
  const [activeTab,  setActiveTab]  = useState(initialTab)

  const teachRef = useRef(null)
  const learnRef = useRef(null)

  const fetchSkills = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      const { data } = activeTab === 'mine' ? await skillsAPI.mine() : await skillsAPI.list(params)
      setSkills(Array.isArray(data) ? data : (data?.results ?? []))
    } catch { toast.error('Failed to load skills') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchSkills() }, [search, activeTab])

  // Auto-scroll to the correct section when arriving from dashboard
  useEffect(() => {
    if (activeTab === 'mine' && !loading) {
      const timeout = setTimeout(() => {
        if (initialType === 'teach' && teachRef.current) {
          teachRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else if (initialType === 'learn' && learnRef.current) {
          learnRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 200)
      return () => clearTimeout(timeout)
    }
  }, [loading, activeTab])

  const handleDelete = async (id) => {
    try {
      await skillsAPI.delete(id)
      setSkills(p => p.filter(s => s.id !== id))
      toast.success('Skill deleted')
    } catch { toast.error('Failed to delete skill') }
  }

  const displayedAll = skills.filter(s =>
    !typeFilter || s.skill_type === typeFilter
  ).filter(s =>
    !search || s.skill_name.toLowerCase().includes(search.toLowerCase())
  )

  const myTeach = skills.filter(s => s.skill_type === 'teach')
  const myLearn = skills.filter(s => s.skill_type === 'learn')

  return (
    <div className="page-bg" style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Ambient orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', left: '20%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%)', borderRadius: '50%', animation: 'floatOrb 9s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '5%', right: '8%', width: 380, height: 380, background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)', borderRadius: '50%', animation: 'floatOrb 12s ease-in-out infinite reverse' }} />
      </div>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '36px 44px', position: 'relative', zIndex: 1 }}>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 30, marginBottom: 4, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Skill Browser</h1>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: 14 }}>Explore skills being taught and learned across the community.</p>
          </div>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setShowAdd(true)}
            style={{ background: 'linear-gradient(135deg,#3B82F6,#6366F1)', border: 'none', borderRadius: 12, padding: '12px 22px', color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 6px 20px rgba(99,102,241,0.35)' }}>
            <Plus size={16} /> Add Skill
          </motion.button>
        </motion.div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Tab toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 12, padding: 4, gap: 4 }}>
            {[{ v: 'all', l: 'All Skills' }, { v: 'mine', l: 'My Skills' }].map(t => (
              <button key={t.v} onClick={() => setActiveTab(t.v)} style={{
                padding: '7px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
                background: activeTab === t.v ? 'linear-gradient(135deg,#3B82F6,#6366F1)' : 'transparent',
                color: activeTab === t.v ? 'white' : '#64748B',
                fontFamily: 'Inter', fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
                boxShadow: activeTab === t.v ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
              }}>{t.l}</button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
            <Search size={15} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input style={{
              width: '100%', paddingLeft: 38, height: 42, background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(12px)', border: '1.5px solid rgba(199,210,254,0.8)',
              borderRadius: 11, color: '#0F172A', fontFamily: 'Inter', fontSize: 14,
              outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
            }} placeholder="Search skills..."
              value={search} onChange={e => setSearch(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#6366F1'}
              onBlur={e => e.target.style.borderColor = 'rgba(199,210,254,0.8)'}
            />
          </div>

          {/* Type filter chips */}
          {activeTab === 'all' && (
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ v: '', l: '✦ All' }, { v: 'teach', l: '📚 Teaching' }, { v: 'learn', l: '🎯 Learning' }].map(f => (
                <motion.button key={f.v} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => setTypeFilter(f.v)} style={{
                  padding: '8px 16px', borderRadius: 10,
                  border: `1.5px solid ${typeFilter === f.v ? '#6366F1' : 'rgba(199,210,254,0.8)'}`,
                  background: typeFilter === f.v ? 'linear-gradient(135deg,rgba(99,102,241,0.12),rgba(168,85,247,0.10))' : 'rgba(255,255,255,0.7)',
                  color: typeFilter === f.v ? '#4338CA' : '#64748B',
                  fontFamily: 'Inter', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  backdropFilter: 'blur(8px)', transition: 'all 0.2s',
                  boxShadow: typeFilter === f.v ? '0 2px 10px rgba(99,102,241,0.2)' : 'none',
                }}>{f.l}</motion.button>
              ))}
            </div>
          )}
        </div>

        {/* ─── Content ─── */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 20 }}>
            {[0,1,2,3,4,5].map(i => <SkeletonSkillCard key={i} />)}
          </div>

        ) : activeTab === 'mine' ? (
          /* ── MY SKILLS: split Teaching / Learning ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>

            {/* Teaching Section */}
            <div ref={teachRef}>
              <SectionHeader
                icon={BookOpen}
                title="Teaching Skills"
                count={myTeach.length}
                color="#1E40AF"
                bgColor="rgba(59,130,246,0.08)"
                borderColor="rgba(59,130,246,0.25)"
              />
              {myTeach.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 48, borderTop: '3px solid rgba(59,130,246,0.25)' }}>
                  <BookOpen size={36} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: '#94A3B8', fontFamily: 'Inter', fontSize: 14 }}>
                    You haven't added any teaching skills yet.
                  </p>
                  <button onClick={() => setShowAdd(true)} className="btn-neon-green" style={{ marginTop: 16, padding: '10px 20px', fontSize: 13 }}>
                    + Add Teaching Skill
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 18 }}>
                  {myTeach.map((s, i) => (
                    <SkillCard key={s.id} s={s} user={user} onDelete={handleDelete} accentColor="#3B82F6" index={i} />
                  ))}
                </div>
              )}
            </div>

            {/* Learning Section */}
            <div ref={learnRef}>
              <SectionHeader
                icon={Target}
                title="Learning Skills"
                count={myLearn.length}
                color="#7E22CE"
                bgColor="rgba(168,85,247,0.08)"
                borderColor="rgba(168,85,247,0.25)"
              />
              {myLearn.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 48, borderTop: '3px solid rgba(168,85,247,0.25)' }}>
                  <Target size={36} color="#CBD5E1" style={{ margin: '0 auto 12px' }} />
                  <p style={{ color: '#94A3B8', fontFamily: 'Inter', fontSize: 14 }}>
                    You haven't added any learning goals yet.
                  </p>
                  <button onClick={() => setShowAdd(true)} className="btn-neon-green" style={{ marginTop: 16, padding: '10px 20px', fontSize: 13 }}>
                    + Add Learning Skill
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 18 }}>
                  {myLearn.map((s, i) => (
                    <SkillCard key={s.id} s={s} user={user} onDelete={handleDelete} accentColor="#A855F7" index={i} />
                  ))}
                </div>
              )}
            </div>

          </div>

        ) : displayedAll.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <p style={{ color: '#94A3B8', fontFamily: 'Inter', fontSize: 16 }}>No skills found. Be the first to add one!</p>
          </div>
        ) : (
          /* ── ALL SKILLS: flat grid ── */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 20 }}>
            {displayedAll.map((s, i) => (
              <SkillCard key={s.id} s={s} user={user} onDelete={handleDelete}
                accentColor={s.skill_type === 'teach' ? '#3B82F6' : '#A855F7'} index={i} />
            ))}
          </div>
        )}

      </main>
      {showAdd && <AddSkillModal onClose={() => setShowAdd(false)} onAdded={(sk) => { setSkills(p => [sk, ...p]); setShowAdd(false); toast.success('Skill added!') }} />}
      <SkeletonStyles />
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
