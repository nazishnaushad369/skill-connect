import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Plus, X, CheckCircle, XCircle, Clock, List, ChevronLeft, ChevronRight, Video, Link2, ExternalLink } from 'lucide-react'
import { sessionsAPI, usersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import EmptyState from '../components/EmptyState'
import { SkeletonSessionCard, SkeletonStyles } from '../components/Skeleton'
import RatingPrompt from '../components/RatingPrompt'
import toast from 'react-hot-toast'

/* ── Countdown hook ── */
function useCountdown(dateStr, timeStr) {
  const getRemaining = useCallback(() => {
    if (!dateStr || !timeStr) return null
    const target = new Date(`${dateStr}T${timeStr}`)
    const now = new Date()
    const diff = target - now
    if (diff <= 0) return { expired: true, text: 'Started', urgent: false }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hrs  = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const urgent = diff < 2 * 60 * 60 * 1000
    let text = ''
    if (days > 0) text = `${days}d ${hrs}h left`
    else if (hrs > 0) text = `${hrs}h ${mins}m left`
    else text = `${mins}m left`
    return { expired: false, text, urgent, diff }
  }, [dateStr, timeStr])

  const [remaining, setRemaining] = useState(getRemaining)
  useEffect(() => {
    setRemaining(getRemaining())
    const id = setInterval(() => setRemaining(getRemaining()), 30000)
    return () => clearInterval(id)
  }, [getRemaining])
  return remaining
}

/* ── Schedule modal ── */
function ScheduleModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ user2: '', title: '', date: '', time: '', notes: '', meet_link: '' })
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    usersAPI.list()
      .then(r => {
        const all = Array.isArray(r.data) ? r.data : (r.data?.results ?? [])
        setUsers(all.filter(u => u.id !== user?.id))
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.user2) { toast.error('Please select a partner'); return }
    setLoading(true)
    try {
      const { data } = await sessionsAPI.create({ ...form, user2: parseInt(form.user2) })
      onAdded(data)
      toast.success('Session scheduled!')
    } catch { toast.error('Failed to schedule session'); setLoading(false) }
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
        onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
          style={{ background: 'white', border: '1.5px solid rgba(99,102,241,0.12)', borderRadius: 24, padding: '36px 32px', width: '100%', maxWidth: 480, position: 'relative', boxShadow: '0 24px 60px rgba(0,0,0,0.15)' }}
          onClick={e => e.stopPropagation()}>
          <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={14} color="#64748B" />
          </button>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 22, marginBottom: 24, color: '#0F172A' }}>📅 Schedule a Session</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Session Title', field: 'title', type: 'text', placeholder: 'e.g. Python Basics' },
              { label: 'Date', field: 'date', type: 'date' },
              { label: 'Time', field: 'time', type: 'time' },
            ].map(f => (
              <div key={f.field}>
                <label style={{ display: 'block', color: '#334155', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{f.label}</label>
                <input type={f.type} required placeholder={f.placeholder} value={form[f.field]} onChange={e => setForm(p => ({ ...p, [f.field]: e.target.value }))}
                  style={{ width: '100%', height: 44, padding: '0 14px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 11, fontFamily: 'Inter', fontSize: 14, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#6366F1'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', color: '#334155', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Partner</label>
              <select required value={form.user2} onChange={e => setForm(p => ({ ...p, user2: e.target.value }))}
                style={{ width: '100%', height: 44, padding: '0 14px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 11, fontFamily: 'Inter', fontSize: 14, color: '#0F172A', outline: 'none', boxSizing: 'border-box', cursor: 'pointer' }}>
                <option value="">Select a partner...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', color: '#334155', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Notes <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional)</span></label>
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Any agenda or notes..."
                style={{ width: '100%', padding: '12px 14px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 11, fontFamily: 'Inter', fontSize: 13, color: '#0F172A', resize: 'none', height: 72, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#334155', fontFamily: 'Inter', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Video size={14} color="#00897B" /> Google Meet Link <span style={{ color: '#94A3B8', fontWeight: 400 }}>(optional)</span>
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <input type="url" value={form.meet_link} onChange={e => setForm(p => ({ ...p, meet_link: e.target.value }))}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  style={{ width: '100%', height: 44, padding: '0 14px 0 40px', background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 11, fontFamily: 'Inter', fontSize: 13, color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#00897B'} onBlur={e => e.target.style.borderColor = '#E2E8F0'} />
                <Video size={14} color="#94A3B8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
              <button type="button"
                onClick={() => window.open('https://meet.google.com/new', '_blank')}
                style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,137,123,0.08)', border: '1px solid rgba(0,137,123,0.25)', color: '#00897B', borderRadius: 8, padding: '6px 12px', fontFamily: 'Inter', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <ExternalLink size={11} /> Create a new Google Meet link
              </button>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
              style={{ padding: '13px', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', borderRadius: 12, color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
              {loading ? 'Scheduling...' : 'Schedule Session'}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

/* ── Session card ── */
function MeetLinkInput({ sessionId, onSaved }) {
  const [editing, setEditing] = useState(false)
  const [link, setLink] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!link.trim()) return
    setSaving(true)
    try {
      const { data } = await sessionsAPI.update(sessionId, { meet_link: link.trim() })
      onSaved(data.meet_link)
      toast.success('Google Meet link saved!')
    } catch { toast.error('Failed to save link'); setSaving(false) }
  }

  if (!editing) return (
    <button onClick={() => setEditing(true)}
      style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '9px 12px', background: 'rgba(0,137,123,0.06)', border: '1.5px dashed rgba(0,137,123,0.3)', borderRadius: 10, color: '#00897B', fontFamily: 'Inter', fontWeight: 600, fontSize: 12, cursor: 'pointer', marginBottom: 10, justifyContent: 'center' }}>
      <Link2 size={13} /> Add Google Meet Link
    </button>
  )

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        <input autoFocus value={link} onChange={e => setLink(e.target.value)}
          placeholder="https://meet.google.com/xxx-xxxx-xxx"
          style={{ flex: 1, height: 38, padding: '0 12px', background: '#F8FAFC', border: '1.5px solid #00897B', borderRadius: 9, fontFamily: 'Inter', fontSize: 13, color: '#0F172A', outline: 'none' }} />
        <button onClick={handleSave} disabled={saving}
          style={{ padding: '0 14px', background: '#00897B', border: 'none', borderRadius: 9, color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
          {saving ? '...' : 'Save'}
        </button>
        <button onClick={() => setEditing(false)}
          style={{ padding: '0 10px', background: '#F1F5F9', border: 'none', borderRadius: 9, color: '#64748B', cursor: 'pointer' }}>
          <X size={13} />
        </button>
      </div>
      <button type="button" onClick={() => window.open('https://meet.google.com/new', '_blank')}
        style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: '#00897B', fontFamily: 'Inter', fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: 0 }}>
        <ExternalLink size={10} /> Create a new Google Meet
      </button>
    </div>
  )
}

function SessionCard({ s, index, user, onStatusUpdate }) {
  const partner = s.user1_detail?.id === user?.id ? s.user2_detail : s.user1_detail
  const countdown = useCountdown(s.date, s.time)
  const STATUS_COLORS = { scheduled: '#6366F1', completed: '#10B981', cancelled: '#EF4444' }
  const color = STATUS_COLORS[s.status] || '#6366F1'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }} whileHover={{ y: -5 }}
      style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(16px)', border: '1.5px solid rgba(255,255,255,0.95)', borderRadius: 20, padding: '20px 22px', position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'all 0.3s' }}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, color: 'var(--text-primary)', flex: 1, paddingRight: 12 }}>{s.title}</div>
        <span style={{ background: `${color}15`, color, border: `1px solid ${color}30`, borderRadius: 20, padding: '3px 10px', fontFamily: 'Inter', fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap' }}>{s.status}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', fontFamily: 'Outfit' }}>
          {partner?.name?.[0] || '?'}
        </div>
        <span style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: 13 }}>with <strong style={{ color: 'var(--text-primary)' }}>{partner?.name || 'Unknown'}</strong></span>
      </div>
      <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
        <div style={{ color: '#6366F1', fontFamily: 'Inter', fontWeight: 600, fontSize: 13 }}>
          📅 {s.date} &nbsp;⏰ {s.time?.slice(0, 5)}
        </div>
        {s.notes && <div style={{ color: '#64748B', fontFamily: 'Inter', fontSize: 12, marginTop: 5 }}>{s.notes}</div>}
      </div>
      {/* Google Meet */}
      {s.meet_link ? (
        <motion.a
          href={s.meet_link} target="_blank" rel="noopener noreferrer"
          whileHover={{ scale: 1.02, boxShadow: '0 6px 20px rgba(0,137,123,0.3)' }}
          whileTap={{ scale: 0.97 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px', background: 'linear-gradient(135deg,#00897B,#00796B)', borderRadius: 11, color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 13, textDecoration: 'none', marginBottom: 10 }}
        >
          <Video size={15} /> Join Google Meet
        </motion.a>
      ) : s.status === 'scheduled' ? (
        <MeetLinkInput sessionId={s.id} onSaved={(link) => onStatusUpdate(s.id, null, link)} />
      ) : null}
      {countdown && s.status === 'scheduled' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, background: countdown.urgent ? 'rgba(239,68,68,0.06)' : 'rgba(34,197,94,0.06)', border: `1px solid ${countdown.urgent ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)'}`, borderRadius: 8, padding: '7px 12px' }}>
          <Clock size={13} color={countdown.urgent ? '#EF4444' : '#10B981'} />
          <span style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: countdown.urgent ? '#EF4444' : '#10B981' }}>
            {countdown.expired ? 'Started' : countdown.text}
          </span>
        </div>
      )}
      {s.status === 'scheduled' && (
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => onStatusUpdate(s.id, 'completed')}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px', background: 'linear-gradient(135deg,#10B981,#059669)', border: 'none', borderRadius: 10, color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
            <CheckCircle size={14} /> Complete
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => onStatusUpdate(s.id, 'cancelled')}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px', background: 'var(--card-bg)', border: '1.5px solid var(--input-border)', borderRadius: 10, color: '#EF4444', fontFamily: 'Inter', fontWeight: 600, fontSize: 12, cursor: 'pointer' }}>
            <XCircle size={14} /> Cancel
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}

/* ── Calendar view ── */
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function CalendarView({ sessions }) {
  const [current, setCurrent] = useState(new Date())
  const year = current.getFullYear()
  const month = current.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const sessionMap = {}
  sessions.forEach(s => {
    if (!s.date) return
    const d = new Date(s.date)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate()
      if (!sessionMap[key]) sessionMap[key] = []
      sessionMap[key].push(s)
    }
  })

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const today = new Date()

  return (
    <div style={{ background: 'var(--card-bg)', backdropFilter: 'blur(16px)', border: '1.5px solid var(--card-border)', borderRadius: 20, padding: '24px', boxShadow: '0 4px 20px rgba(99,102,241,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <button onClick={() => setCurrent(new Date(year, month - 1, 1))} style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>
          <ChevronLeft size={16} color="#6366F1" />
        </button>
        <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>{MONTHS[month]} {year}</h3>
        <button onClick={() => setCurrent(new Date(year, month + 1, 1))} style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>
          <ChevronRight size={16} color="#6366F1" />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontFamily: 'Inter', fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', padding: '4px 0' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
        {cells.map((day, i) => {
          const hasSessions = day && sessionMap[day]
          const isToday = day && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
          return (
            <div key={i} style={{ minHeight: 52, padding: '6px 4px', borderRadius: 10, textAlign: 'center', background: isToday ? 'rgba(99,102,241,0.12)' : hasSessions ? 'rgba(16,185,129,0.06)' : 'transparent', border: isToday ? '1.5px solid rgba(99,102,241,0.4)' : hasSessions ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent' }}>
              {day && (
                <>
                  <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: isToday ? 800 : 500, color: isToday ? '#818CF8' : 'var(--text-primary)' }}>{day}</div>
                  {hasSessions && sessionMap[day].map((s, si) => (
                    <div key={si} title={s.title} style={{ background: s.status === 'completed' ? '#10B981' : s.status === 'cancelled' ? '#EF4444' : '#6366F1', borderRadius: 3, height: 4, margin: '2px auto', width: '60%' }} />
                  ))}
                </>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 14, borderTop: '1px solid #F1F5F9', flexWrap: 'wrap' }}>
        {[['#6366F1','Scheduled'],['#10B981','Completed'],['#EF4444','Cancelled']].map(([c,l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
            <span style={{ fontFamily: 'Inter', fontSize: 12, color: '#64748B' }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main page ── */
export default function SessionsPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [showSchedule, setShowSchedule] = useState(false)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list')
  const [ratingSession, setRatingSession] = useState(null)

  const fetchSessions = async () => {
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      const { data } = await sessionsAPI.list(params)
      setSessions(Array.isArray(data) ? data : (data?.results ?? []))
    } catch { toast.error('Failed to load sessions') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchSessions() }, [statusFilter])

  const handleStatusUpdate = async (id, status, meet_link) => {
    try {
      const payload = {}
      if (status) payload.status = status
      if (meet_link !== undefined) payload.meet_link = meet_link
      const { data } = await sessionsAPI.update(id, payload)
      setSessions(p => p.map(s => s.id === id ? data : s))
      if (status) toast.success(`Session marked as ${status}`)
      // Show rating prompt immediately when a session is completed
      if (status === 'completed') {
        const partner = data.user1_detail?.id === user?.id ? data.user2_detail : data.user1_detail
        setRatingSession({
          ...data,
          partner_name: partner?.name || 'your partner',
          skill_name: data.title,
        })
      }
    } catch { toast.error('Failed to update session') }
  }

  const handleRatingClose = () => {
    const rated = JSON.parse(localStorage.getItem('sc_rated_sessions') || '[]')
    if (ratingSession) rated.push(ratingSession.id)
    localStorage.setItem('sc_rated_sessions', JSON.stringify(rated))
    setRatingSession(null)
  }

  return (
    <div className="page-bg" style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle,rgba(99,102,241,0.07) 0%,transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '15%', width: 300, height: 300, background: 'radial-gradient(circle,rgba(16,185,129,0.06) 0%,transparent 70%)', borderRadius: '50%' }} />
      </div>

      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '36px 44px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 30, marginBottom: 5, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Sessions</h1>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'Inter', fontSize: 14 }}>Schedule and manage your skill exchange sessions.</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* List/Calendar toggle */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 10, padding: 3 }}>
              {[['list', List, 'List'], ['calendar', Calendar, 'Calendar']].map(([v, Icon, label]) => (
                <button key={v} onClick={() => setViewMode(v)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: viewMode === v ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : 'transparent', color: viewMode === v ? 'white' : '#64748B', fontFamily: 'Inter', fontWeight: 600, fontSize: 13, transition: 'all 0.2s' }}>
                  <Icon size={14} /> {label}
                </button>
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => setShowSchedule(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', borderRadius: 12, color: 'white', fontFamily: 'Inter', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
              <Plus size={16} /> Schedule
            </motion.button>
          </div>
        </motion.div>

        {/* Status filter — list mode only */}
        {viewMode === 'list' && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
            {[{ v: '', l: 'All' }, { v: 'scheduled', l: '📅 Scheduled' }, { v: 'completed', l: '✅ Completed' }, { v: 'cancelled', l: '❌ Cancelled' }].map(f => (
              <button key={f.v} onClick={() => setStatusFilter(f.v)} style={{
                padding: '7px 16px', borderRadius: 9, border: 'none',
                background: statusFilter === f.v ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : 'transparent',
                color: statusFilter === f.v ? 'white' : '#64748B',
                fontFamily: 'Inter', fontWeight: statusFilter === f.v ? 700 : 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
              }}>{f.l}</button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px,1fr))', gap: 20 }}>
            {[0,1,2,3].map(i => <SkeletonSessionCard key={i} />)}
          </div>
        ) : viewMode === 'calendar' ? (
          <CalendarView sessions={sessions} />
        ) : sessions.length === 0 ? (
          <EmptyState type="sessions" cta="Schedule Your First Session" onCta={() => setShowSchedule(true)} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px,1fr))', gap: 20 }}>
            {sessions.map((s, i) => (
              <SessionCard key={s.id} s={s} index={i} user={user} onStatusUpdate={handleStatusUpdate} />
            ))}
          </div>
        )}

        <SkeletonStyles />
      </main>

      {showSchedule && (
        <ScheduleModal
          onClose={() => setShowSchedule(false)}
          onAdded={(s) => { setSessions(p => [s, ...p]); setShowSchedule(false) }}
        />
      )}

      {ratingSession && (
        <RatingPrompt
          session={ratingSession}
          onClose={handleRatingClose}
          onSubmitted={handleRatingClose}
        />
      )}
    </div>
  )
}
