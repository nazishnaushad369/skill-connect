import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, Search } from 'lucide-react'
import { messagesAPI } from '../services/api'
import Sidebar from '../components/Sidebar'
import toast from 'react-hot-toast'

export default function MessagesPage() {
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    messagesAPI.threads()
      .then(res => setThreads(Array.isArray(res.data) ? res.data : (res.data?.results ?? [])))
      .catch(() => toast.error('Failed to load messages'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = threads.filter(t => t.user?.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ display: 'flex', background: 'linear-gradient(135deg, #EEF2FF 0%, #E8EDFB 60%, #EDE9FE 100%)', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: '32px 40px' }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 28, marginBottom: 6, color: '#0F172A' }}>Messages</h1>
          <p style={{ color: '#64748B', fontFamily: 'Inter', fontSize: 14 }}>Stay connected with your skill exchange partners.</p>
        </motion.div>

        <div style={{ maxWidth: 640 }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input className="input-field" style={{ paddingLeft: 36 }} placeholder="Search conversations..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <div className="spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#94A3B8', fontFamily: 'Inter' }}>Loading conversations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <MessageSquare size={48} color="#CBD5E1" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: '#94A3B8', fontFamily: 'Inter', fontSize: 16 }}>
                {search ? 'No conversations match your search.' : 'No conversations yet. Start by messaging someone from Matches!'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {filtered.map((t, i) => (
                <motion.div key={t.user.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/messages/${t.user.id}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, cursor: 'pointer', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(199,210,254,0.5)', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(99,102,241,0.05)', backdropFilter: 'blur(4px)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.97)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(199,210,254,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(99,102,241,0.05)' }}>
                  {/* Avatar */}
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 800, color: 'white', fontSize: 16, flexShrink: 0, position: 'relative' }}>
                    {t.user.name[0]}
                    {t.unread_count > 0 && (
                      <div style={{ position: 'absolute', top: -2, right: -2, width: 18, height: 18, background: '#6366F1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'white', border: '2px solid #EEF2FF' }}>
                        {t.unread_count}
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontFamily: 'Inter', fontWeight: t.unread_count > 0 ? 700 : 600, fontSize: 15, color: '#0F172A' }}>{t.user.name}</span>
                      <span style={{ color: '#94A3B8', fontFamily: 'Inter', fontSize: 12 }}>{new Date(t.timestamp).toLocaleDateString()}</span>
                    </div>
                    <p style={{ color: t.unread_count > 0 ? '#334155' : '#94A3B8', fontFamily: 'Inter', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: t.unread_count > 0 ? 500 : 400 }}>
                      {t.last_message}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
