import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap, LayoutDashboard, BookOpen, Users, MessageSquare, Calendar,
  LogOut, Shield, User, BarChart3, Lock, Trophy, Bell, Search
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState, useRef } from 'react'
import { messagesAPI, sessionsAPI } from '../services/api'
import SearchModal from './SearchModal'

const USER_NAV = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/skills',      icon: BookOpen,        label: 'Skills'      },
  { to: '/matches',     icon: Users,           label: 'Matches'     },
  { to: '/messages',    icon: MessageSquare,   label: 'Messages'    },
  { to: '/sessions',    icon: Calendar,        label: 'Sessions'    },
  { to: '/leaderboard', icon: Trophy,          label: 'Leaderboard' },
]

const ADMIN_NAV = [
  { to: '/admin',              icon: BarChart3, label: 'Overview'  },
  { to: '/admin?tab=users',    icon: Users,     label: 'Users'     },
  { to: '/admin?tab=sessions', icon: Calendar,  label: 'Sessions'  },
  { to: '/admin?tab=skills',   icon: BookOpen,  label: 'Skills'    },
]

function NotificationBell({ user }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const bellRef = useRef(null)

  useEffect(() => {
    if (!user || user.role === 'admin') return
    const fetchNotifs = async () => {
      setLoading(true)
      try {
        const items = []

        // Unread message threads
        try {
          const { data: threads } = await messagesAPI.threads()
          const threadList = Array.isArray(threads) ? threads : (threads?.results ?? [])
          const unreadThreads = threadList.filter(t => t.unread_count > 0)
          unreadThreads.forEach(t => items.push({
            id: `msg-${t.user.id}`,
            type: 'message',
            icon: '💬',
            text: `New message from ${t.user.name}`,
            sub: `${t.unread_count} unread`,
            color: '#3B82F6',
            action: () => navigate(`/messages/${t.user.id}`),
          }))
        } catch { /* skip if not premium */ }

        // Sessions today
        try {
          const today = new Date().toISOString().split('T')[0]
          const { data: sessData } = await sessionsAPI.list({ status: 'scheduled' })
          const sessions = Array.isArray(sessData) ? sessData : (sessData?.results ?? [])
          const todaySessions = sessions.filter(s => s.date === today)
          todaySessions.forEach(s => {
            const partnerName = s.user1_detail?.id === user?.id ? s.user2_detail?.name : s.user1_detail?.name
            items.push({
              id: `sess-${s.id}`,
              type: 'session',
              icon: '📅',
              text: `Session today: ${s.title}`,
              sub: `with ${partnerName} at ${s.time?.slice(0, 5)}`,
              color: '#22C55E',
              action: () => navigate('/sessions'),
            })
          })
        } catch { /* skip if not premium */ }

        setNotifications(items)
      } catch { /* silently ignore */ }
      finally { setLoading(false) }
    }
    fetchNotifs()
  }, [user])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const count = notifications.length

  return (
    <div ref={bellRef} style={{ position: 'relative' }}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative', background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
          width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
        }}
      >
        <Bell size={16} color={count > 0 ? '#FCD34D' : 'rgba(255,255,255,0.6)'} />
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              position: 'absolute', top: -5, right: -5,
              background: '#EF4444', color: 'white',
              borderRadius: '50%', width: 17, height: 17,
              fontSize: 10, fontWeight: 800, fontFamily: 'Inter',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid #1E3A8A',
            }}
          >{count > 9 ? '9+' : count}</motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', top: 40, left: 0, width: 280, zIndex: 200,
              background: 'white', borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
              border: '1px solid #E2E8F0', overflow: 'hidden',
            }}
          >
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: '#0F172A' }}>Notifications</span>
              {count > 0 && <span style={{ background: '#EF4444', color: 'white', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700, fontFamily: 'Inter' }}>{count}</span>}
            </div>
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#94A3B8', fontFamily: 'Inter', fontSize: 13 }}>Loading...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <Bell size={28} color="#CBD5E1" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: '#94A3B8', fontFamily: 'Inter', fontSize: 13, margin: 0 }}>You're all caught up! 🎉</p>
              </div>
            ) : (
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {notifications.map(n => (
                  <motion.button
                    key={n.id}
                    whileHover={{ background: '#F8FAFC' }}
                    onClick={() => { n.action(); setOpen(false) }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '12px 16px', background: 'white', border: 'none',
                      borderBottom: '1px solid #F8FAFC', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                      background: `${n.color}15`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 15,
                    }}>{n.icon}</div>
                    <div>
                      <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: '#0F172A' }}>{n.text}</div>
                      <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{n.sub}</div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isAdmin = user?.role === 'admin'
  const navItems = isAdmin ? ADMIN_NAV : USER_NAV

  const isActive = (to) => {
    const path = to.split('?')[0]
    const search = to.includes('?') ? to.split('?')[1] : null
    if (search) return location.pathname === path && location.search === `?${search}`
    if (path === '/admin') return location.pathname === '/admin' && !location.search
    return location.pathname === path
  }

  const handleLogout = () => { logout(); navigate('/login') }
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearch(s => !s)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div style={{
      width: 240, height: '100vh', position: 'fixed', top: 0, left: 0,
      background: 'linear-gradient(175deg, #1E1B4B 0%, #1E3A8A 50%, #1E40AF 100%)',
      borderRight: '1px solid rgba(99,102,241,0.3)',
      display: 'flex', flexDirection: 'column', zIndex: 50,
      boxShadow: '4px 0 24px rgba(79,70,229,0.2)',
    }}>
      {/* Logo + Bell */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, background: 'rgba(255,255,255,0.2)',
              borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}>
              <Zap size={18} color="white" fill="white" />
            </div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 19, color: 'white' }}>
              Skill<span style={{ color: '#93C5FD' }}>Connect</span>
            </span>
          </div>
          {!isAdmin && <NotificationBell user={user} />}
        </div>
      </div>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {!isAdmin && (
            <motion.button
              whileHover={{ background: 'rgba(255,255,255,0.12)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowSearch(true)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
              }}
            >
              <Search size={14} />
              <span style={{ fontFamily: 'Inter', fontSize: 13, flex: 1, textAlign: 'left' }}>Search...</span>
              <kbd style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 5, padding: '1px 6px', fontSize: 10, fontFamily: 'Inter', fontWeight: 700, color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.15)' }}>⌘K</kbd>
            </motion.button>
          )}
        </div>

      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: isAdmin ? 'linear-gradient(135deg,#A855F7,#6366F1)' : 'linear-gradient(135deg,#60A5FA,#A78BFA)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: 'white', fontFamily: 'Outfit', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}>
            {isAdmin ? <Shield size={16} /> : (user?.name?.[0] || '?')}
          </div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              {user?.is_premium && (
                <span style={{ background: 'linear-gradient(135deg,#F59E0B,#EF4444)', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 800, color: 'white', letterSpacing: 0.5, flexShrink: 0 }}>PRO</span>
              )}
            </div>
            <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: isAdmin ? '#C4B5FD' : '#93C5FD' }}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: '16px 20px 8px' }}>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Inter', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          {isAdmin ? 'Admin Controls' : 'Navigation'}
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = isActive(to)
          const locked = !isAdmin && !user?.is_premium && (to === '/messages' || to === '/sessions')
          return (
            <motion.button key={to} whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate(to)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                borderLeft: active ? '2px solid #93C5FD' : '2px solid transparent',
                transition: 'all 0.15s',
              }}>
              <Icon size={17} color={active ? '#93C5FD' : locked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)'} />
              <span style={{
                fontFamily: 'Inter', fontWeight: active ? 600 : 500, fontSize: 14,
                color: active ? 'white' : locked ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.7)',
                flex: 1,
              }}>{label}</span>
              {locked && <Lock size={11} color="rgba(255,255,255,0.25)" />}
            </motion.button>
          )
        })}

        {/* Profile link — users only */}
        {!isAdmin && (
          <motion.button key="profile" whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/profile/${user?.id}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
              borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
              background: location.pathname.startsWith('/profile') ? 'rgba(255,255,255,0.15)' : 'transparent',
              borderLeft: location.pathname.startsWith('/profile') ? '2px solid #93C5FD' : '2px solid transparent',
              transition: 'all 0.15s',
            }}>
            <User size={17} color={location.pathname.startsWith('/profile') ? '#93C5FD' : 'rgba(255,255,255,0.5)'} />
            <span style={{
              fontFamily: 'Inter', fontWeight: location.pathname.startsWith('/profile') ? 600 : 500, fontSize: 14,
              color: location.pathname.startsWith('/profile') ? 'white' : 'rgba(255,255,255,0.7)',
            }}>Profile</span>
          </motion.button>
        )}
      </nav>

      {/* Upgrade banner — free users only */}
      {!isAdmin && !user?.is_premium && (
        <div style={{ padding: '0 12px 10px' }}>
          <motion.div whileHover={{ scale: 1.02 }} onClick={() => navigate('/pricing')}
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 12, padding: '12px 14px', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <Zap size={13} color="#FCD34D" fill="#FCD34D" />
              <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, color: 'white' }}>Upgrade to Pro</span>
            </div>
            <p style={{ fontFamily: 'Inter', fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.4 }}>Unlock chat &amp; sessions</p>
          </motion.div>
        </div>
      )}

      {/* Logout */}
      <div style={{ padding: '8px 12px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <motion.button whileHover={{ x: 2 }} whileTap={{ scale: 0.98 }} onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
            borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
            background: 'transparent', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
          <LogOut size={17} color="#FCA5A5" />
          <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 14, color: '#FCA5A5' }}>Log Out</span>
        </motion.button>
      </div>
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}
    </div>
  )
}
