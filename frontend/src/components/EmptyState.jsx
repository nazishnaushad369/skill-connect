/* ─────────────────────────────────────────────────────
   EmptyState.jsx — Reusable illustrated empty states
   ───────────────────────────────────────────────────── */
import { motion } from 'framer-motion'

const CONFIGS = {
  skills: {
    emoji: '📚',
    title: 'No skills yet',
    desc: 'Add your first skill to start teaching or learning with the community.',
    color: '#6366F1', bg: '#EEF2FF',
  },
  matches: {
    emoji: '🤝',
    title: 'No matches yet',
    desc: 'Add more skills to your profile and our algorithm will find your perfect learning partners.',
    color: '#8B5CF6', bg: '#F5F3FF',
  },
  sessions: {
    emoji: '📅',
    title: 'No sessions scheduled',
    desc: 'Connect with a match and schedule your first skill exchange session.',
    color: '#0EA5E9', bg: '#F0F9FF',
  },
  messages: {
    emoji: '💬',
    title: 'No conversations yet',
    desc: 'Start a conversation with one of your skill matches to get going.',
    color: '#10B981', bg: '#ECFDF5',
  },
  notifications: {
    emoji: '🎉',
    title: "You're all caught up!",
    desc: 'No new notifications right now. Check back later.',
    color: '#6366F1', bg: '#EEF2FF',
  },
  search: {
    emoji: '🔍',
    title: 'No results found',
    desc: "We couldn't find anything matching your search. Try different keywords.",
    color: '#64748B', bg: '#F8FAFC',
  },
  reviews: {
    emoji: '⭐',
    title: 'No reviews yet',
    desc: 'Complete a session to receive your first peer review.',
    color: '#F59E0B', bg: '#FFFBEB',
  },
  leaderboard: {
    emoji: '🏆',
    title: 'Leaderboard is empty',
    desc: 'Complete sessions and earn points to appear on the leaderboard.',
    color: '#F59E0B', bg: '#FFFBEB',
  },
}

export default function EmptyState({ type = 'skills', cta, onCta, compact = false }) {
  const cfg = CONFIGS[type] || CONFIGS.skills

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center',
        padding: compact ? '32px 24px' : '56px 32px',
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(12px)',
        border: `1.5px solid ${cfg.color}18`,
        borderRadius: 24,
        boxShadow: `0 4px 24px ${cfg.color}08`,
      }}
    >
      {/* Emoji in colored circle */}
      <div style={{
        width: compact ? 56 : 76,
        height: compact ? 56 : 76,
        background: cfg.bg,
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: compact ? 26 : 36,
        marginBottom: 16,
        border: `2px solid ${cfg.color}20`,
        boxShadow: `0 4px 16px ${cfg.color}15`,
      }}>
        {cfg.emoji}
      </div>

      <h3 style={{
        fontFamily: 'Outfit, sans-serif', fontWeight: 800,
        fontSize: compact ? 16 : 20, color: '#0F172A',
        marginBottom: 8, letterSpacing: '-0.01em',
      }}>
        {cfg.title}
      </h3>

      <p style={{
        fontFamily: 'Inter, sans-serif', fontSize: compact ? 13 : 14,
        color: '#64748B', lineHeight: 1.65,
        maxWidth: 320, marginBottom: cta ? 24 : 0,
      }}>
        {cfg.desc}
      </p>

      {cta && (
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: `0 6px 20px ${cfg.color}35` }}
          whileTap={{ scale: 0.97 }}
          onClick={onCta}
          style={{
            background: `linear-gradient(135deg, ${cfg.color}, ${cfg.color}cc)`,
            border: 'none', borderRadius: 12, padding: '10px 22px',
            color: 'white', fontFamily: 'Inter', fontWeight: 700,
            fontSize: 14, cursor: 'pointer',
            boxShadow: `0 4px 14px ${cfg.color}30`,
          }}
        >
          {cta}
        </motion.button>
      )}
    </motion.div>
  )
}
