import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users, Calendar, BookOpen, Trash2, Eye, Shield,
  BarChart3, CheckCircle, XCircle, TrendingUp, AlertCircle
} from 'lucide-react'
import { usersAPI, sessionsAPI, skillsAPI } from '../services/api'
import Sidebar from '../components/Sidebar'
import toast from 'react-hot-toast'

function StatCard({ label, value, icon: Icon, color, sub, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: `0 8px 28px ${color}18` }}
      whileTap={{ scale: 0.97 }}
      className="card"
      onClick={onClick}
      style={{ display: 'flex', gap: 16, alignItems: 'center', cursor: onClick ? 'pointer' : 'default' }}>
      <div style={{ width: 54, height: 54, background: `${color}15`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${color}25` }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 32, fontFamily: 'Outfit', fontWeight: 800, lineHeight: 1, color: '#0F172A' }}>{value}</div>
        <div style={{ color: '#64748B', fontFamily: 'Inter', fontSize: 13, marginTop: 4 }}>{label}</div>
        {sub && <div style={{ color, fontFamily: 'Inter', fontSize: 12, marginTop: 2 }}>{sub}</div>}
      </div>
    </motion.div>
  )
}

const TABS = [
  { v: 'overview',  l: '📊 Overview'  },
  { v: 'users',     l: '👥 Users'     },
  { v: 'sessions',  l: '📅 Sessions'  },
  { v: 'skills',    l: '🛠️ Skills'    },
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') || 'overview'

  const [stats, setStats]       = useState(null)
  const [users, setUsers]       = useState([])
  const [sessions, setSessions] = useState([])
  const [skills, setSkills]     = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      usersAPI.stats(),
      usersAPI.list(),
      sessionsAPI.all(),
      skillsAPI.list(),
    ]).then(([s, u, sess, sk]) => {
      setStats(s.data)
      setUsers(Array.isArray(u.data) ? u.data : (u.data?.results ?? []))
      setSessions(Array.isArray(sess.data) ? sess.data : (sess.data?.results ?? []))
      setSkills(Array.isArray(sk.data) ? sk.data : (sk.data?.results ?? []))
    }).catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false))
  }, [])

  const handleDeleteUser = async (id) => {
    if (!confirm('Permanently delete this user and all their data?')) return
    try {
      await usersAPI.delete(id)
      setUsers(p => p.filter(u => u.id !== id))
      toast.success('User deleted')
    } catch { toast.error('Failed to delete user') }
  }

  const handleDeleteSkill = async (id) => {
    if (!confirm('Remove this skill from the platform?')) return
    try {
      await skillsAPI.delete(id)
      setSkills(p => p.filter(s => s.id !== id))
      toast.success('Skill removed')
    } catch { toast.error('Failed to remove skill') }
  }

  const handleSessionStatus = async (id, status) => {
    try {
      const { data } = await sessionsAPI.update(id, { status })
      setSessions(p => p.map(s => s.id === id ? data : s))
      toast.success(`Session marked ${status}`)
    } catch { toast.error('Failed to update session') }
  }

  const setTab = (t) => setSearchParams(t === 'overview' ? {} : { tab: t })

  return (
    <div style={{ display: 'flex', background: '#F8FAFC', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '32px 40px' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 38, height: 38, background: 'rgba(168,85,247,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(168,85,247,0.25)' }}>
              <Shield size={20} color="#A855F7" />
            </div>
            <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 28, color: '#0F172A' }}>Admin Control Panel</h1>
          </div>
          <p style={{ color: '#64748B', fontFamily: 'Inter', fontSize: 14 }}>
            Manage users, sessions, and platform content from one place.
          </p>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 10, padding: 4, gap: 4, width: 'fit-content', marginBottom: 32 }}>
          {TABS.map(t => (
            <button key={t.v} onClick={() => setTab(t.v)} style={{
              padding: '8px 20px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: tab === t.v ? '#3B82F6' : 'transparent',
              color: tab === t.v ? 'white' : '#64748B',
              fontFamily: 'Inter', fontWeight: 600, fontSize: 13, transition: 'all 0.2s'
            }}>{t.l}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#94A3B8', fontFamily: 'Inter' }}>Loading platform data...</p>
          </div>
        ) : tab === 'overview' ? (

          /* ── OVERVIEW ── */
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20, marginBottom: 32 }}>
              <StatCard label="Total Users"     value={stats?.total_users    || 0} icon={Users}    color="#3B82F6" sub={`${stats?.active_users || 0} with skills`} onClick={() => setTab('users')} />
              <StatCard label="Total Skills"    value={stats?.total_skills   || 0} icon={BookOpen}  color="#6366F1" onClick={() => setTab('skills')} />
              <StatCard label="Total Sessions"  value={stats?.total_sessions || 0} icon={Calendar}  color="#A855F7" sub={`${stats?.scheduled_sessions || 0} scheduled · ${stats?.completed_sessions || 0} completed`} onClick={() => setTab('sessions')} />
              <StatCard label="Teach Listings"  value={skills.filter(s => s.skill_type === 'teach').length} icon={TrendingUp} color="#22C55E" onClick={() => setTab('skills')} />
            </div>

            {/* Quick summary table */}
            <div className="card">
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BarChart3 size={18} color="#3B82F6" /> Recent Users
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    {['Name', 'Email', 'Role', 'Skills', 'Joined'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#64748B', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 8).map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 12px', color: '#0F172A', fontWeight: 500 }}>{u.name}</td>
                      <td style={{ padding: '12px 12px', color: '#64748B' }}>{u.email}</td>
                      <td style={{ padding: '12px 12px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: 'Inter',
                          background: u.role === 'admin' ? 'rgba(168,85,247,0.15)' : 'rgba(59,130,246,0.1)',
                          color: u.role === 'admin' ? '#A855F7' : '#3B82F6',
                          border: `1px solid ${u.role === 'admin' ? 'rgba(168,85,247,0.25)' : 'rgba(59,130,246,0.2)'}`,
                        }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '12px 12px', color: '#64748B' }}>{u.skill_count}</td>
                      <td style={{ padding: '12px 12px', color: '#64748B' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        ) : tab === 'users' ? (

          /* ── USERS ── */
          <div className="card">
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users size={18} color="#3B82F6" /> All Users ({users.length})
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  {['#', 'Name', 'Email', 'Role', 'Skills', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#64748B', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...users].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 12px', color: '#94A3B8' }}>{i + 1}</td>
                    <td style={{ padding: '12px 12px', color: '#0F172A', fontWeight: 500 }}>{u.name}</td>
                    <td style={{ padding: '12px 12px', color: '#64748B' }}>{u.email}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: 'Inter',
                        background: u.role === 'admin' ? 'rgba(168,85,247,0.15)' : 'rgba(59,130,246,0.1)',
                        color: u.role === 'admin' ? '#A855F7' : '#3B82F6',
                        border: `1px solid ${u.role === 'admin' ? 'rgba(168,85,247,0.25)' : 'rgba(59,130,246,0.2)'}`,
                      }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '12px 12px', color: '#64748B' }}>{u.skill_count}</td>
                    <td style={{ padding: '12px 12px', color: '#64748B', fontSize: 13 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => navigate(`/profile/${u.id}`)}
                          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#3B82F6', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Eye size={12} /> View
                        </button>
                        {u.role !== 'admin' && (
                          <button onClick={() => handleDeleteUser(u.id)}
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Trash2 size={12} /> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

        ) : tab === 'sessions' ? (

          /* ── SESSIONS ── */
          <div className="card">
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} color="#A855F7" /> All Sessions ({sessions.length})
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  {['Title', 'User 1', 'User 2', 'Date', 'Time', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#64748B', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 12px', color: '#0F172A', fontWeight: 500 }}>{s.title}</td>
                    <td style={{ padding: '12px 12px', color: '#64748B' }}>{s.user1_detail?.name}</td>
                    <td style={{ padding: '12px 12px', color: '#64748B' }}>{s.user2_detail?.name}</td>
                    <td style={{ padding: '12px 12px', color: '#64748B' }}>{s.date}</td>
                    <td style={{ padding: '12px 12px', color: '#64748B' }}>{s.time?.slice(0, 5)}</td>
                    <td style={{ padding: '12px 12px' }}><span className={`badge badge-${s.status}`}>{s.status}</span></td>
                    <td style={{ padding: '12px 12px' }}>
                      {s.status === 'scheduled' && (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleSessionStatus(s.id, 'completed')}
                            style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 11, fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <CheckCircle size={11} /> Done
                          </button>
                          <button onClick={() => handleSessionStatus(s.id, 'cancelled')}
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: 11, fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <XCircle size={11} /> Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

        ) : (

          /* ── SKILLS ── */
          <div className="card">
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 18, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={18} color="#6366F1" /> All Skills ({skills.length})
            </h2>
            <p style={{ color: '#94A3B8', fontFamily: 'Inter', fontSize: 13, marginBottom: 20 }}>
              Review and moderate skills listed on the platform.
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Inter', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                  {['Skill', 'Category', 'Type', 'Listed By', 'Action'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: '#64748B', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skills.map((s, i) => (
                  <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.015 }}
                    style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 12px', color: '#0F172A', fontWeight: 500 }}>{s.skill_name}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <span className="skill-tag skill-tag-category">{s.category}</span>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <span className={`skill-tag skill-tag-${s.skill_type}`}>
                        {s.skill_type === 'teach' ? '📚 Teaching' : '🎯 Learning'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px', color: '#64748B' }}>{s.user_name}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <button onClick={() => handleDeleteSkill(s.id)}
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Trash2 size={12} /> Remove
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
