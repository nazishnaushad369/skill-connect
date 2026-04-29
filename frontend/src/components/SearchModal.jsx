/* ────────────────────────────────────────────────────────
   SearchModal.jsx — Global Ctrl+K spotlight search
   ──────────────────────────────────────────────────────── */
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, X, BookOpen, Users, Calendar, MessageSquare, LayoutDashboard, Trophy, User, Settings, ArrowRight } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard',    route: '/dashboard',  icon: LayoutDashboard, color: '#6366F1', cat: 'Pages' },
  { label: 'Skill Browser',route: '/skills',     icon: BookOpen,        color: '#8B5CF6', cat: 'Pages' },
  { label: 'Matches',      route: '/matches',    icon: Users,           color: '#0EA5E9', cat: 'Pages' },
  { label: 'Messages',     route: '/messages',   icon: MessageSquare,   color: '#10B981', cat: 'Pages' },
  { label: 'Sessions',     route: '/sessions',   icon: Calendar,        color: '#F59E0B', cat: 'Pages' },
  { label: 'Leaderboard',  route: '/leaderboard',icon: Trophy,          color: '#EC4899', cat: 'Pages' },
  { label: 'My Profile',   route: '/profile/me', icon: User,            color: '#6366F1', cat: 'Pages' },
  { label: 'Pricing',      route: '/pricing',    icon: Settings,        color: '#94A3B8', cat: 'Pages' },
]

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const g = item[key]
    if (!acc[g]) acc[g] = []
    acc[g].push(item)
    return acc
  }, {})
}

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const filtered = query.trim()
    ? NAV_ITEMS.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : NAV_ITEMS

  const grouped = groupBy(filtered, 'cat')

  const flat = filtered

  useEffect(() => { setActiveIdx(0) }, [query])

  const go = (item) => {
    navigate(item.route)
    onClose()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, flat.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter')     { if (flat[activeIdx]) go(flat[activeIdx]) }
    if (e.key === 'Escape')    { onClose() }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-start',
          justifyContent: 'center', zIndex: 2000, padding: '80px 24px 24px',
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: -16 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          style={{
            width: '100%', maxWidth: 560,
            background: 'white', borderRadius: 20,
            boxShadow: '0 24px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(99,102,241,0.12)',
            overflow: 'hidden',
          }}
          onKeyDown={handleKeyDown}
        >
          {/* Search input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1.5px solid #F1F5F9' }}>
            <Search size={18} color="#6366F1" style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search pages, skills, users..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'Inter', fontSize: 16, color: '#0F172A', background: 'transparent' }}
            />
            <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#64748B', fontSize: 11, fontFamily: 'Inter', fontWeight: 600 }}>
              Esc
            </button>
          </div>

          {/* Results */}
          <div style={{ maxHeight: 400, overflowY: 'auto', padding: '8px 8px' }}>
            {flat.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94A3B8', fontFamily: 'Inter', fontSize: 14 }}>
                <Search size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.4 }} />
                No results for "<strong>{query}</strong>"
              </div>
            ) : (
              Object.entries(grouped).map(([cat, items]) => (
                <div key={cat}>
                  <div style={{ padding: '6px 10px 4px', color: '#94A3B8', fontFamily: 'Inter', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{cat}</div>
                  {items.map((item, i) => {
                    const globalIdx = flat.indexOf(item)
                    const isActive = globalIdx === activeIdx
                    return (
                      <motion.button
                        key={item.route}
                        whileHover={{ x: 4 }}
                        onClick={() => go(item)}
                        onMouseEnter={() => setActiveIdx(globalIdx)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                          padding: '10px 12px', border: 'none', borderRadius: 12, cursor: 'pointer',
                          background: isActive ? `${item.color}10` : 'transparent',
                          textAlign: 'left', transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ width: 34, height: 34, background: `${item.color}15`, border: `1.5px solid ${item.color}25`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <item.icon size={16} color={item.color} />
                        </div>
                        <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 14, color: '#0F172A', flex: 1 }}>{item.label}</span>
                        {isActive && <ArrowRight size={14} color={item.color} />}
                      </motion.button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid #F1F5F9', padding: '8px 18px', display: 'flex', gap: 16, alignItems: 'center' }}>
            {[['↑↓', 'navigate'], ['↵', 'select'], ['Esc', 'close']].map(([key, desc]) => (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <kbd style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 5, padding: '2px 7px', fontFamily: 'Inter', fontSize: 11, fontWeight: 700, color: '#475569' }}>{key}</kbd>
                <span style={{ color: '#94A3B8', fontFamily: 'Inter', fontSize: 11 }}>{desc}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
