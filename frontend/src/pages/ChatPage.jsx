import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Send } from 'lucide-react'
import { messagesAPI, usersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import toast from 'react-hot-toast'

export default function ChatPage() {
  const { userId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [partner, setPartner] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const intervalRef = useRef(null)

  const fetchMessages = async () => {
    try {
      const { data } = await messagesAPI.thread(userId)
      setMessages(Array.isArray(data) ? data : (data?.results ?? []))
    } catch {}
  }

  useEffect(() => {
    usersAPI.detail(userId).then(r => setPartner(r.data)).catch(() => {})
    fetchMessages()
    intervalRef.current = setInterval(fetchMessages, 4000)
    return () => clearInterval(intervalRef.current)
  }, [userId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      await messagesAPI.send({ receiver: parseInt(userId), content: text.trim() })
      setText('')
      await fetchMessages()
    } catch { toast.error('Failed to send message') }
    finally { setSending(false) }
  }

  return (
    <div style={{ display: 'flex', background: 'linear-gradient(135deg, #EEF2FF 0%, #E8EDFB 60%, #EDE9FE 100%)', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ marginLeft: 240, flex: 1, display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* Header */}
        <div style={{ padding: '16px 28px', borderBottom: '1px solid rgba(199,210,254,0.6)', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, boxShadow: '0 2px 12px rgba(99,102,241,0.08)', backdropFilter: 'blur(8px)' }}>
          <button onClick={() => navigate('/messages')} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 6, borderRadius: 8, transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <ArrowLeft size={20} />
          </button>
          {partner && (
            <>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#3B82F6,#A855F7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit', fontWeight: 700, color: 'white', fontSize: 16, boxShadow: '0 0 12px rgba(59,130,246,0.35)' }}>
                {partner.name[0]}
              </div>
              <div>
                <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 15, color: '#0F172A' }}>{partner.name}</div>
                <div style={{ fontSize: 12, color: '#22C55E', fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, background: '#22C55E', borderRadius: '50%', display: 'inline-block' }} />
                  Active
                </div>
              </div>
            </>
          )}
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px', display: 'flex', flexDirection: 'column', gap: 12, background: 'transparent' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: 60, color: '#94A3B8', fontFamily: 'Inter', fontSize: 14 }}>
              No messages yet. Start the conversation! 👋
            </div>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender === user?.id
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '68%', padding: '10px 16px',
                  borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMe
                    ? 'linear-gradient(135deg, #4F46E5, #7C3AED)'
                    : 'rgba(255,255,255,0.85)',
                  color: isMe ? '#FFFFFF' : '#1E293B',
                  fontFamily: 'Inter', fontSize: 14, lineHeight: 1.5,
                  boxShadow: isMe ? '0 4px 16px rgba(99,102,241,0.3)' : '0 2px 8px rgba(99,102,241,0.07)',
                  border: isMe ? 'none' : '1px solid rgba(199,210,254,0.6)',
                  backdropFilter: isMe ? 'none' : 'blur(4px)',
                }}>
                  <p style={{ margin: 0 }}>{msg.content}</p>
                  <div style={{ fontSize: 11, marginTop: 4, opacity: 0.65, textAlign: isMe ? 'right' : 'left' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '16px 28px', borderTop: '1px solid rgba(199,210,254,0.6)', background: 'rgba(255,255,255,0.9)', flexShrink: 0, backdropFilter: 'blur(8px)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: 12 }}>
            <input className="input-field" placeholder="Type a message..." value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
              style={{ flex: 1 }} />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit"
              disabled={sending || !text.trim()} className="btn-neon-green"
              style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Send size={16} />
            </motion.button>
          </form>
          <p style={{ color: '#CBD5E1', fontFamily: 'Inter', fontSize: 11, marginTop: 8 }}>Auto-refreshes every 4 seconds</p>
        </div>
      </main>
    </div>
  )
}
