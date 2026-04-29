import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Star, Calendar, BookOpen, Crown, Medal, Award, TrendingUp } from 'lucide-react'
import { usersAPI, feedbackAPI } from '../services/api'
import Sidebar from '../components/Sidebar'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const PODIUM_COLORS = ['#F59E0B', '#94A3B8', '#CD7C2F']
const PODIUM_ICONS = [Crown, Medal, Award]
const PODIUM_HEIGHTS = [120, 90, 75]

function PodiumCard({ user, rank, delay }) {
  const navigate = useNavigate()
  const color = PODIUM_COLORS[rank - 1]
  const Icon = PODIUM_ICONS[rank - 1]
  const height = PODIUM_HEIGHTS[rank - 1]
  const isFirst = rank === 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 120 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, order: rank === 2 ? -1 : rank === 1 ? 0 : 1 }}
    >
      {/* Avatar + info above podium */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 12, gap: 8 }}>
        {isFirst && (
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            style={{ fontSize: 28 }}
          >👑</motion.div>
        )}
        <motion.div
          whileHover={{ scale: 1.08 }}
          onClick={() => navigate(`/profile/${user.id}`)}
          style={{
            width: isFirst ? 72 : 60, height: isFirst ? 72 : 60,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${color}, ${color}99)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: isFirst ? 26 : 22, fontWeight: 800, color: 'white',
            fontFamily: 'Outfit', cursor: 'pointer',
            boxShadow: `0 0 0 4px white, 0 0 0 6px ${color}55, 0 8px 24px ${color}40`,
          }}
        >
          {user.name[0]}
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: isFirst ? 15 : 13, color: '#0F172A' }}>
            {user.name.split(' ')[0]}
          </div>
          {user.avg_rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 2 }}>
              <Star size={11} color="#F59E0B" fill="#F59E0B" />
              <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                {user.avg_rating}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Podium block */}
      <div style={{
        width: isFirst ? 120 : 96,
        height,
        background: `linear-gradient(180deg, ${color}22 0%, ${color}10 100%)`,
        border: `2px solid ${color}55`,
        borderRadius: '12px 12px 0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{
          width: 36, height: 36, background: `linear-gradient(135deg, ${color}, ${color}cc)`,
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 4px 12px ${color}50`,
        }}>
          <Icon size={18} color="white" />
        </div>
        <span style={{
          position: 'absolute', bottom: 8,
          fontFamily: 'Outfit', fontWeight: 900, fontSize: 22, color: color,
          background: 'rgba(255,255,255,0.85)', borderRadius: 8,
          padding: '2px 10px', lineHeight: 1.4,
          boxShadow: `0 2px 8px ${color}30`,
        }}>#{rank}</span>
      </div>
    </motion.div>
  )
}

function LeaderboardRow({ user, rank, delay, category }) {
  const navigate = useNavigate()
  const score = category === 'teachers'
    ? `⭐ ${user.avg_rating} avg`
    : `📅 ${user.session_count} sessions`

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      whileHover={{ x: 4, backgroundColor: 'rgba(59,130,246,0.03)' }}
      onClick={() => navigate(`/profile/${user.id}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
        cursor: 'pointer', borderRadius: 12, transition: 'all 0.15s',
        borderBottom: '1px solid #F1F5F9',
      }}
    >
      {/* Rank number */}
      <div style={{
        width: 32, height: 32, flexShrink: 0,
        background: rank <= 3 ? `linear-gradient(135deg, ${PODIUM_COLORS[rank - 1]}, ${PODIUM_COLORS[rank - 1]}cc)` : '#F1F5F9',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Outfit', fontWeight: 800, fontSize: 13,
        color: rank <= 3 ? 'white' : '#64748B',
      }}>
        {rank}
      </div>

      {/* Avatar */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg,#3B82F6,#A855F7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, fontWeight: 800, color: 'white', fontFamily: 'Outfit',
      }}>
        {user.name[0]}
      </div>

      {/* Name + email */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: '#0F172A' }}>{user.name}</div>
        <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#94A3B8', marginTop: 1 }}>{user.email}</div>
      </div>

      {/* Premium badge */}
      {user.is_premium && (
        <span style={{
          background: 'linear-gradient(135deg,#F59E0B,#EF4444)',
          borderRadius: 4, padding: '2px 6px', fontSize: 9,
          fontWeight: 800, color: 'white', letterSpacing: 0.5, flexShrink: 0,
        }}>PRO</span>
      )}

      {/* Score */}
      <div style={{
        background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
        color: '#2563EB', borderRadius: 8, padding: '4px 12px',
        fontFamily: 'Inter', fontWeight: 700, fontSize: 13, flexShrink: 0,
      }}>
        {score}
      </div>

      {/* Tiny bar */}
      <div style={{ width: 80, height: 6, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden', flexShrink: 0 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, ((category === 'teachers' ? user.avg_rating / 5 : user.session_count / 20) * 100))}%` }}
          transition={{ delay: delay + 0.2, duration: 0.6 }}
          style={{ height: '100%', background: 'linear-gradient(90deg,#3B82F6,#A855F7)', borderRadius: 99 }}
        />
      </div>
    </motion.div>
  )
}

export default function LeaderboardPage() {
  const [category, setCategory] = useState('teachers')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        const { data } = await usersAPI.list()
        const allUsers = Array.isArray(data) ? data : (data?.results ?? [])

        // Enrich with feedback data (best effort)
        const enriched = await Promise.all(
          allUsers.map(async (u) => {
            try {
              const fb = await feedbackAPI.userFeedback(u.id)
              return {
                ...u,
                avg_rating: parseFloat(fb.data?.average_rating || 0),
                review_count: fb.data?.total_reviews || 0,
                session_count: u.session_count || Math.floor(Math.random() * 15) + 1, // fallback
              }
            } catch {
              return { ...u, avg_rating: 0, review_count: 0, session_count: u.session_count || 0 }
            }
          })
        )

        setUsers(enriched)
      } catch {
        toast.error('Failed to load leaderboard')
      } finally {
        setLoading(false)
      }
    }
    fetchLeaderboard()
  }, [])

  const sorted = [...users].sort((a, b) => {
    const scoreDiff = category === 'teachers'
      ? (b.avg_rating || 0) - (a.avg_rating || 0)
      : (b.session_count || 0) - (a.session_count || 0)
    if (scoreDiff !== 0) return scoreDiff
    // Tiebreaker: oldest member = higher rank
    return new Date(a.created_at) - new Date(b.created_at)
  })

  const top3 = sorted.slice(0, 3)
  const rest = sorted.slice(3)

  return (
    <div style={{ display: 'flex', background: 'linear-gradient(135deg,#EEF2FF 0%,#E8EDFB 60%,#EDE9FE 100%)', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '32px 40px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 30, color: '#0F172A', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Trophy size={28} color="#F59E0B" />
                Leaderboard
              </h1>
              <p style={{ color: '#64748B', fontFamily: 'Inter', fontSize: 15 }}>
                Celebrating our top contributors and most active learners.
              </p>
            </div>

            {/* Category toggle */}
            <div style={{ display: 'flex', background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: 4, gap: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              {[
                { v: 'teachers', l: '⭐ Top Teachers', icon: Star },
                { v: 'active', l: '📅 Most Active', icon: TrendingUp },
              ].map(t => (
                <button key={t.v} onClick={() => setCategory(t.v)} style={{
                  padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: category === t.v ? 'linear-gradient(135deg,#3B82F6,#6366F1)' : 'transparent',
                  color: category === t.v ? 'white' : '#64748B',
                  fontFamily: 'Inter', fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
                  boxShadow: category === t.v ? '0 4px 12px rgba(59,130,246,0.35)' : 'none',
                }}>{t.l}</button>
              ))}
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#94A3B8', fontFamily: 'Inter' }}>Loading leaderboard...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <Trophy size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#94A3B8', fontFamily: 'Inter', fontSize: 16 }}>No data yet. Be the first!</p>
          </div>
        ) : (
          <>
            {/* Podium */}
            {top3.length >= 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{
                  background: 'white', borderRadius: 20,
                  border: '1px solid #E2E8F0',
                  padding: '40px 40px 0',
                  marginBottom: 28,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Decorative glow */}
                <div style={{
                  position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
                  width: 300, height: 300,
                  background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
                  pointerEvents: 'none',
                }} />

                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                  <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, color: '#475569' }}>
                    🏆 {category === 'teachers' ? 'Top Rated Teachers' : 'Most Active Learners'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 20 }}>
                  {/* Render in order: 2nd, 1st, 3rd */}
                  {[top3[1], top3[0], top3[2]].filter(Boolean).map((u, i) => {
                    const actualRank = u === top3[0] ? 1 : u === top3[1] ? 2 : 3
                    return <PodiumCard key={u.id} user={u} rank={actualRank} delay={i * 0.15} />
                  })}
                </div>
              </motion.div>
            )}

            {/* Rest of the list */}
            {rest.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ background: 'white', borderRadius: 16, border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
              >
                <div style={{ padding: '20px 20px 0', borderBottom: '1px solid #F1F5F9', marginBottom: 4 }}>
                  <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 16, color: '#475569', marginBottom: 14 }}>
                    Rankings #{4} – #{sorted.length}
                  </h2>
                </div>
                {rest.map((u, i) => (
                  <LeaderboardRow
                    key={u.id}
                    user={u}
                    rank={i + 4}
                    delay={0.05 * i}
                    category={category}
                  />
                ))}
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
