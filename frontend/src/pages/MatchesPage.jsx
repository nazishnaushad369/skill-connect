import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, MessageSquare, Zap } from 'lucide-react'
import { matchesAPI } from '../services/api'
import Sidebar from '../components/Sidebar'
import EmptyState from '../components/EmptyState'
import { SkeletonMatchCard, SkeletonStyles } from '../components/Skeleton'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const GRAD = ['135deg,#6366F1,#8B5CF6','135deg,#8B5CF6,#EC4899','135deg,#0EA5E9,#6366F1','135deg,#10B981,#0EA5E9']

function MatchCard({ match, type, index = 0 }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const other = type === 'suggestion'
    ? match.user
    : (match.user1_detail?.id === user?.id ? match.user2_detail : match.user1_detail)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -5 }}
      style={{
        background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(255,255,255,0.95)',
        borderRadius: 20, padding: 22,
        display: 'flex', flexDirection: 'column', gap: 16,
        boxShadow: '0 4px 20px rgba(99,102,241,0.08)',
        transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
      }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(${GRAD[index % GRAD.length]})` }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(${GRAD[index % GRAD.length]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 800, color: 'white', fontSize: 18, flexShrink: 0, boxShadow: '0 4px 12px rgba(99,102,241,0.25)' }}>
          {(other?.name || '?')[0]}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)' }}>{other?.name || 'Unknown'}</div>
          <div style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{other?.bio?.slice(0, 60) || 'No bio yet'}</div>
        </div>
        {type === 'suggestion' && (
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#4338CA', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontFamily: 'Inter', fontWeight: 700, flexShrink: 0 }}>
            <Zap size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />{match.match_score} match
          </div>
        )}
        {type === 'match' && (
          <span style={{ background: match.status === 'accepted' ? '#ECFDF5' : '#FFF7ED', color: match.status === 'accepted' ? '#059669' : '#D97706', border: `1px solid ${match.status === 'accepted' ? '#A7F3D0' : '#FDE68A'}`, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontFamily: 'Inter', fontWeight: 700 }}>
            {match.status}
          </span>
        )}
      </div>

      {type === 'suggestion' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(99,102,241,0.06)', borderRadius: 12, padding: '12px 14px' }}>
          {match.they_can_teach_you.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>They teach:</span>
              {match.they_can_teach_you.map(s => <span key={s} style={{ background: 'rgba(99,102,241,0.12)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, fontFamily: 'Inter' }}>{s}</span>)}
            </div>
          )}
          {match.you_can_teach_them.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>You teach:</span>
              {match.you_can_teach_them.map(s => <span key={s} style={{ background: 'rgba(168,85,247,0.12)', color: '#C084FC', border: '1px solid rgba(168,85,247,0.25)', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600, fontFamily: 'Inter' }}>{s}</span>)}
            </div>
          )}
        </div>
      )}

      {type === 'match' && match.matched_skill && (
        <div style={{ background: '#F0F9FF', borderRadius: 10, padding: '8px 12px' }}>
          <span style={{ background: '#BAE6FD', color: '#0369A1', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600, fontFamily: 'Inter' }}>{match.matched_skill}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/messages/${other?.id}`)}
          style={{ flex: 1, padding: '10px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', borderRadius: 11, color: 'white', fontFamily: 'Inter', fontWeight: 700, cursor: 'pointer', boxShadow: '0 3px 10px rgba(99,102,241,0.3)' }}>
          <MessageSquare size={14} /> Message
        </motion.button>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => navigate(`/profile/${other?.id}`)}
          style={{ flex: 1, padding: '10px', fontSize: 13, background: 'var(--card-bg)', border: '1.5px solid var(--input-border)', borderRadius: 11, color: 'var(--text-primary)', fontFamily: 'Inter', fontWeight: 600, cursor: 'pointer' }}>
          View Profile
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function MatchesPage() {
  const [suggestions, setSuggestions] = useState([])
  const [matches, setMatches] = useState([])
  const [tab, setTab] = useState('suggestions')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([matchesAPI.suggest(), matchesAPI.list()])
      .then(([s, m]) => {
        setSuggestions(Array.isArray(s.data) ? s.data : (s.data?.results ?? []))
        setMatches(Array.isArray(m.data) ? m.data : (m.data?.results ?? []))
      })
      .catch(() => toast.error('Failed to load matches'))
      .finally(() => setLoading(false))
  }, [])

  const display = tab === 'suggestions' ? suggestions : matches

  return (
    <div className="page-bg" style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', left: '20%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 380, height: 380, background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '36px 44px', position: 'relative', zIndex: 1 }}>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 30, marginBottom: 6, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Skill Matches</h1>
          <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: 14 }}>Discover people who perfectly complement your skill set.</p>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 12, padding: 4, gap: 4, width: 'fit-content', marginBottom: 28 }}>
          {[
            { v: 'suggestions', l: `💡 Suggestions (${suggestions.length})` },
            { v: 'matches',     l: `🤝 My Matches (${matches.length})` }
          ].map(t => (
            <button key={t.v} onClick={() => setTab(t.v)} style={{
              padding: '8px 20px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: tab === t.v ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : 'transparent',
              color: tab === t.v ? 'white' : '#64748B',
              fontFamily: 'Inter', fontWeight: 700, fontSize: 13, transition: 'all 0.2s',
              boxShadow: tab === t.v ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
            }}>{t.l}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px,1fr))', gap: 20 }}>
            {[0,1,2,3].map(i => <SkeletonMatchCard key={i} />)}
          </div>
        ) : display.length === 0 ? (
          <EmptyState
            type="matches"
            cta={tab === 'suggestions' ? 'Add Skills to Get Matched' : 'View Suggestions'}
            onCta={() => tab === 'suggestions' ? navigate('/skills') : setTab('suggestions')}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px,1fr))', gap: 20 }}>
            {display.map((item, i) => (
              <MatchCard key={item.user?.id || item.id} match={item} type={tab === 'suggestions' ? 'suggestion' : 'match'} index={i} />
            ))}
          </div>
        )}

        <SkeletonStyles />
      </main>
    </div>
  )
}
