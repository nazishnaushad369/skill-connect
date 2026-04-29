import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Zap, Users, MessageSquare, Calendar, Star, Shield, BookOpen, ChevronDown, Sparkles, TrendingUp, Clock } from 'lucide-react'

/* ─── Floating soft-color particles on light bg ─── */
function LightParticles() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    const particles = []
    const resize = () => { canvas.width = window.innerWidth; canvas.height = canvas.parentElement.offsetHeight }
    resize()
    window.addEventListener('resize', resize)
    const COLORS = ['#C7D2FE','#DDD6FE','#BAE6FD','#FBCFE8','#A5F3FC','#E9D5FF']
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2.5 + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      })
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color + 'BB'; ctx.fill()
      })
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const d = Math.hypot(p.x - q.x, p.y - q.y)
          if (d < 120) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(139,92,246,${0.09 * (1 - d / 120)})`
            ctx.lineWidth = 0.8; ctx.stroke()
          }
        })
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, borderRadius: 'inherit' }} />
}

const features = [
  { icon: Zap,           title: 'Smart Matching',     desc: 'AI algorithm finds users whose skills perfectly complement yours.',              color: '#6366F1', bg: '#EEF2FF' },
  { icon: Users,         title: 'Skill Exchange',      desc: 'Teach what you know, learn what you need — no money needed.',                  color: '#8B5CF6', bg: '#F5F3FF' },
  { icon: MessageSquare, title: 'Direct Messaging',    desc: 'Chat in real-time with skill partners in a clean interface.',                   color: '#0EA5E9', bg: '#F0F9FF' },
  { icon: Calendar,      title: 'Session Scheduling',  desc: 'Book and manage skill exchange sessions with an intuitive calendar.',           color: '#10B981', bg: '#ECFDF5' },
  { icon: Star,          title: 'Ratings & Reviews',   desc: 'Build your reputation through authentic peer reviews after every session.',      color: '#F59E0B', bg: '#FFFBEB' },
  { icon: Shield,        title: 'Secure Platform',     desc: 'JWT-authenticated accounts with role-based access for maximum safety.',         color: '#EC4899', bg: '#FDF2F8' },
]

const steps = [
  { num: '01', emoji: '👤', title: 'Create Profile',   desc: 'Sign up and list the skills you can teach and the ones you want to learn.', color: '#6366F1' },
  { num: '02', emoji: '🤝', title: 'Get Matched',      desc: 'Our algorithm finds users who perfectly complement your skill set.',          color: '#8B5CF6' },
  { num: '03', emoji: '💬', title: 'Start Chatting',   desc: 'Connect via messaging and schedule sessions at your convenience.',            color: '#0EA5E9' },
  { num: '04', emoji: '🚀', title: 'Learn & Grow',     desc: 'Exchange knowledge, grow together, and leave reviews to build trust.',        color: '#10B981' },
]

const stats = [
  { key: 'total_users',        label: 'Active Learners',    icon: Users,      color: '#6366F1', suffix: '+',  fallback: '10K+' },
  { key: 'total_skills',       label: 'Skills Listed',      icon: BookOpen,   color: '#8B5CF6', suffix: '+',  fallback: '500+' },
  { key: 'match_rate',         label: 'Match Success Rate', icon: TrendingUp, color: '#0EA5E9', suffix: '%',  fallback: '95%'  },
  { key: 'completed_sessions', label: 'Sessions Completed', icon: Clock,      color: '#10B981', suffix: '+',  fallback: '50K+' },
]

// Fallback shown when DB has fewer than 3 real reviews
const FALLBACK_TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Python & Spanish',    text: 'SkillConnect changed how I learn. Found a Python partner in 2 days — and we both grew!', rating: 5, avatar_color: '#6366F1', avatar_url: null },
  { name: 'Arjun Mehta',  role: 'React & Photography', text: 'No other platform makes skill exchange this seamless. The matching is remarkably accurate.', rating: 5, avatar_color: '#8B5CF6', avatar_url: null },
  { name: 'Sneha Reddy',  role: 'UI Design & Data',    text: 'I was skeptical at first but the session scheduling and chat made it effortless.', rating: 5, avatar_color: '#EC4899', avatar_url: null },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [liveStats, setLiveStats] = useState(null)        // null = loading
  const [counted, setCounted]   = useState({})            // animated display values
  const [testimonials, setTestimonials] = useState(FALLBACK_TESTIMONIALS)
  const statsRef = useRef(null)
  const animRef  = useRef(false)


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fetch real stats from public endpoint (no auth needed)
  useEffect(() => {
    fetch('/api/auth/public-stats/')
      .then(r => r.json())
      .then(data => setLiveStats(data))
      .catch(() => setLiveStats({ error: true }))
  }, [])

  // Fetch real testimonials (public — no auth needed)
  useEffect(() => {
    fetch('/api/feedback/public-testimonials/')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length >= 1) {
          // pad with fallback entries if fewer than 3 real reviews exist
          const merged = [...data]
          FALLBACK_TESTIMONIALS.forEach(fb => { if (merged.length < 3) merged.push(fb) })
          setTestimonials(merged.slice(0, 3))
        }
        // else keep the fallback
      })
      .catch(() => {})  // silently keep fallback on network error
  }, [])

  // Animated count-up
  const animateCounters = useCallback((data) => {
    if (animRef.current) return
    animRef.current = true
    const duration = 1800
    const start = performance.now()
    const targets = {
      total_users:        data.total_users        || 0,
      total_skills:       data.total_skills       || 0,
      match_rate:         95,
      completed_sessions: data.completed_sessions || 0,
    }
    const tick = (now) => {
      const elapsed = Math.min(now - start, duration)
      const ease = 1 - Math.pow(1 - elapsed / duration, 3)
      const current = {}
      Object.entries(targets).forEach(([k, v]) => { current[k] = Math.floor(v * ease) })
      setCounted(current)
      if (elapsed < duration) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [])

  // Trigger when stats section enters viewport
  useEffect(() => {
    if (!liveStats || liveStats.error || !statsRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) animateCounters(liveStats) },
      { threshold: 0.25 }
    )
    observer.observe(statsRef.current)
    return () => observer.disconnect()
  }, [liveStats, animateCounters])

  // Format large numbers: 12345 → "12K+", 1500000 → "1.5M+"
  const fmt = (n, suffix) => {
    if (n === undefined || n === null) return '—'
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M${suffix}`
    if (n >= 1_000)     return `${Math.floor(n / 1000)}K${suffix}`
    return `${n}${suffix}`
  }

  return (
    <div style={{ background: '#FAFBFF', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Sticky Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(99,102,241,0.12)' : '1px solid transparent',
        boxShadow: scrolled ? '0 4px 24px rgba(99,102,241,0.08)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.35)' }}>
              <Zap size={18} color="white" fill="white" />
            </div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: 21, color: '#0F172A' }}>Skill<span style={{ color: '#6366F1' }}>Connect</span></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[['#features','Features'],['#how-it-works','How It Works'],['#community','Community']].map(([href, label]) => (
              <a key={href} href={href} style={{ color: '#64748B', fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '8px 16px', borderRadius: 8, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#6366F1'; e.currentTarget.style.background = '#EEF2FF' }}
                onMouseLeave={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.background = 'transparent' }}>
                {label}
              </a>
            ))}
            <Link to="/login" style={{ color: '#64748B', fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '8px 16px', marginLeft: 4, borderRadius: 8, border: '1px solid #E2E8F0', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.color = '#6366F1' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#64748B' }}>
              Log in
            </Link>
            <Link to="/register" style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: 'white', fontSize: 14, fontWeight: 700, textDecoration: 'none', padding: '10px 22px', borderRadius: 10, boxShadow: '0 4px 14px rgba(99,102,241,0.3)', marginLeft: 8, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center',
        background: 'linear-gradient(135deg, #FAFBFF 0%, #EEF2FF 30%, #F5F3FF 60%, #F0F9FF 100%)',
        overflow: 'hidden',
      }}>
        {/* Soft color orbs */}
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-5%', right: '-5%', width: 700, height: 700, background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', right: '25%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '20%', left: '40%', width: 250, height: 250, background: 'radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <LightParticles />

        {/* Subtle grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)', backgroundSize: '64px 64px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 28px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', position: 'relative', zIndex: 1, width: '100%' }}>

          {/* Left — copy */}
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 9999, padding: '6px 16px', marginBottom: 28 }}>
              <div style={{ width: 7, height: 7, background: '#6366F1', borderRadius: '50%', boxShadow: '0 0 6px rgba(99,102,241,0.8)', animation: 'pulseDot 2s ease-in-out infinite' }} />
              <span style={{ color: '#6366F1', fontSize: 13, fontWeight: 600 }}>✨ Open Beta — Join 10,000+ Learners</span>
            </motion.div>

            <h1 style={{ fontSize: 'clamp(36px,4.5vw,60px)', fontFamily: 'Outfit, sans-serif', fontWeight: 900, lineHeight: 1.08, marginBottom: 24, color: '#0F172A', letterSpacing: '-0.03em' }}>
              Exchange Skills.<br />
              <span style={{ background: 'linear-gradient(135deg,#6366F1 0%,#8B5CF6 50%,#0EA5E9 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Unlock Your</span><br />
              Potential.
            </h1>

            <p style={{ fontSize: 18, color: '#475569', lineHeight: 1.75, marginBottom: 40, maxWidth: 460 }}>
              Connect with learners and mentors worldwide. Teach what you know, learn what you need — all through intelligent skill matching.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 48 }}>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.04, boxShadow: '0 8px 28px rgba(99,102,241,0.45)' }} whileTap={{ scale: 0.97 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, padding: '14px 30px', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', borderRadius: 14, color: 'white', fontFamily: 'Inter', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}>
                  <Sparkles size={18} /> Start Learning
                </motion.button>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <motion.button whileHover={{ scale: 1.04, background: '#EEF2FF' }} whileTap={{ scale: 0.97 }}
                  style={{ fontSize: 16, padding: '14px 28px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 14, color: '#374151', fontFamily: 'Inter', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  Teach a Skill
                </motion.button>
              </Link>
            </div>

            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex' }}>
                {['#6366F1','#8B5CF6','#0EA5E9','#EC4899'].map((c, i) => (
                  <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg,${c},${c}aa)`, border: '2.5px solid white', marginLeft: i > 0 ? -10 : 0, boxShadow: '0 2px 6px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, fontFamily: 'Outfit' }}>
                    {['A','B','C','D'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={13} color="#F59E0B" fill="#F59E0B" />)}
                </div>
                <span style={{ color: '#64748B', fontSize: 13, fontWeight: 500 }}>Loved by 10K+ learners worldwide</span>
              </div>
            </div>
          </motion.div>

          {/* Right — skill orbit visual */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 430, height: 430 }}>
              <svg viewBox="0 0 430 430" fill="none" style={{ width: '100%', height: '100%' }}>
                {/* Rings */}
                <circle cx="215" cy="215" r="185" stroke="rgba(99,102,241,0.12)" strokeWidth="1.5" strokeDasharray="8 8" />
                <circle cx="215" cy="215" r="130" stroke="rgba(139,92,246,0.10)" strokeWidth="1" />
                <circle cx="215" cy="215" r="75" stroke="rgba(14,165,233,0.12)" strokeWidth="1" strokeDasharray="4 4" />

                {/* YOU center */}
                <circle cx="215" cy="215" r="38" fill="url(#centerGrad)" />
                <text x="215" y="219" textAnchor="middle" fill="white" fontSize="12" fontFamily="Outfit" fontWeight="700">YOU</text>
                <defs>
                  <radialGradient id="centerGrad" cx="50%" cy="30%" r="80%">
                    <stop offset="0%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </radialGradient>
                </defs>

                {/* Skill nodes */}
                {[
                  { cx: 112, cy: 92,  label: 'React',    color: '#6366F1' },
                  { cx: 325, cy: 88,  label: 'Python',   color: '#8B5CF6' },
                  { cx: 358, cy: 248, label: 'Design',   color: '#0EA5E9' },
                  { cx: 288, cy: 355, label: 'ML',       color: '#10B981' },
                  { cx: 128, cy: 345, label: 'SQL',      color: '#F59E0B' },
                  { cx: 65,  cy: 228, label: 'UX',       color: '#EC4899' },
                ].map((n, i) => (
                  <g key={i}>
                    <line x1="215" y1="215" x2={n.cx} y2={n.cy} stroke={n.color} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 6" />
                    <circle cx={n.cx} cy={n.cy} r="28" fill="white" stroke={n.color} strokeWidth="1.5" filter="url(#shadow)" />
                    <circle cx={n.cx} cy={n.cy} r="28" fill={n.color} fillOpacity="0.06" />
                    <text x={n.cx} y={n.cy + 4} textAnchor="middle" fill={n.color} fontSize="10" fontFamily="Outfit" fontWeight="700">{n.label}</text>
                  </g>
                ))}
                <defs>
                  <filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" /></filter>
                </defs>

                {/* Animated pulse ring */}
                <circle cx="215" cy="215" r="185" stroke="rgba(99,102,241,0.25)" strokeWidth="1">
                  <animate attributeName="r" values="185;205;185" dur="3.5s" repeatCount="indefinite" />
                  <animate attributeName="stroke-opacity" values="0.25;0;0.25" dur="3.5s" repeatCount="indefinite" />
                </circle>
              </svg>

              {/* Floating label cards */}
              {[
                { label: '⚡ React Expert',  x: -30, y: 50,  color: '#6366F1', bg: '#EEF2FF', border: '#C7D2FE' },
                { label: '🎨 UI/UX Pro',     x: 310, y: 130, color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE' },
                { label: '🐍 Python Dev',    x: 285, y: 300, color: '#0EA5E9', bg: '#F0F9FF', border: '#BAE6FD' },
              ].map((b, i) => (
                <motion.div key={i} animate={{ y: [0, -8, 0] }} transition={{ duration: 3 + i * 0.5, delay: i * 0.8, repeat: Infinity }}
                  style={{ position: 'absolute', left: b.x, top: b.y, background: b.bg, border: `1.5px solid ${b.border}`, borderRadius: 10, padding: '7px 14px', fontSize: 12, fontFamily: 'Inter', fontWeight: 700, color: b.color, whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                  {b.label}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', color: '#A5B4FC', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 2 }}>
          <span style={{ fontSize: 12, fontWeight: 500 }}>Scroll to explore</span>
          <ChevronDown size={20} />
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: '110px 28px', background: 'white' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 70 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EEF2FF', borderRadius: 9999, padding: '5px 14px', marginBottom: 16, color: '#6366F1', fontSize: 13, fontWeight: 600 }}>
              <Sparkles size={13} /> Powerful Features
            </div>
            <h2 style={{ fontSize: 42, fontFamily: 'Outfit', fontWeight: 900, color: '#0F172A', marginBottom: 14, letterSpacing: '-0.02em' }}>
              Everything to <span style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6,#0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Accelerate</span> Your Growth
            </h2>
            <p style={{ color: '#64748B', fontSize: 18, maxWidth: 520, margin: '0 auto', lineHeight: 1.65 }}>A complete platform designed for the modern skill exchange economy.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {features.map((f, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }} viewport={{ once: true }}
                whileHover={{ y: -8, boxShadow: `0 16px 40px ${f.color}18` }}
                style={{ background: 'white', border: '1.5px solid #F1F5F9', borderRadius: 20, padding: '32px 28px', transition: 'all 0.3s', cursor: 'default', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', position: 'relative', overflow: 'hidden' }}>
                {/* Top accent line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${f.color}, ${f.color}aa)`, borderRadius: '20px 20px 0 0' }} />
                <div style={{ width: 52, height: 52, background: f.bg, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: `1.5px solid ${f.color}25` }}>
                  <f.icon size={24} color={f.color} />
                </div>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 18, marginBottom: 10, color: '#0F172A' }}>{f.title}</h3>
                <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.72 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" style={{ padding: '110px 28px', background: 'linear-gradient(135deg, #FAFBFF 0%, #F5F3FF 50%, #F0F9FF 100%)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 70 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F5F3FF', borderRadius: 9999, padding: '5px 14px', marginBottom: 16, color: '#8B5CF6', fontSize: 13, fontWeight: 600 }}>
              🗺️ The Journey
            </div>
            <h2 style={{ fontSize: 42, fontFamily: 'Outfit', fontWeight: 900, color: '#0F172A', marginBottom: 14, letterSpacing: '-0.02em' }}>
              How <span style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>SkillConnect</span> Works
            </h2>
            <p style={{ color: '#64748B', fontSize: 18, fontFamily: 'Inter' }}>From sign up to first session in under 5 minutes.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
            {steps.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }} viewport={{ once: true }}
                whileHover={{ y: -6 }}
                style={{ background: 'white', borderRadius: 20, padding: '32px 24px', textAlign: 'center', position: 'relative', boxShadow: '0 4px 20px rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.08)', transition: 'all 0.3s' }}>
                {/* Connector arrow */}
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', top: 42, right: -16, color: '#C7D2FE', fontSize: 24, fontWeight: 300, zIndex: 10 }}>→</div>
                )}

                {/* Step number pill */}
                <div style={{ display: 'inline-block', background: `${s.color}12`, border: `1.5px solid ${s.color}30`, borderRadius: 9999, padding: '3px 12px', marginBottom: 14 }}>
                  <span style={{ color: s.color, fontSize: 12, fontWeight: 700 }}>{s.num}</span>
                </div>

                <div style={{ fontSize: 40, marginBottom: 14 }}>{s.emoji}</div>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 17, marginBottom: 10, color: '#0F172A' }}>{s.title}</h3>
                <p style={{ color: '#64748B', fontSize: 13, lineHeight: 1.7 }}>{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats / Community ── */}
      <section id="community" style={{ padding: '90px 28px', background: 'white', borderTop: '1px solid #F1F5F9' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ECFDF5', borderRadius: 9999, padding: '5px 14px', marginBottom: 16, color: '#10B981', fontSize: 13, fontWeight: 600 }}>
              🌍 Our Community
            </div>
            <h2 style={{ fontSize: 40, fontFamily: 'Outfit', fontWeight: 900, color: '#0F172A', marginBottom: 12, letterSpacing: '-0.02em' }}>
              Trusted by <span style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Thousands</span>
            </h2>
            <p style={{ color: '#64748B', fontSize: 16 }}>Real learners, real growth — every single day.</p>
          </motion.div>

          <div ref={statsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 80 }}>
            {stats.map((s, i) => {
              let display
              if (!liveStats) {
                display = '…'  // loading
              } else if (liveStats.error) {
                display = s.fallback  // fallback to hardcoded
              } else {
                const raw = counted[s.key]
                display = s.key === 'match_rate'
                  ? `${raw ?? 0}${s.suffix}`
                  : fmt(raw ?? 0, s.suffix)
              }
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  whileHover={{ y: -5, boxShadow: `0 12px 32px ${s.color}15` }}
                  style={{ background: 'white', borderRadius: 18, padding: '28px 20px', textAlign: 'center', border: '1.5px solid #F1F5F9', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}>
                  {/* LIVE indicator */}
                  {liveStats && !liveStats.error && (
                    <div style={{ position: 'absolute', top: 10, right: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981', animation: 'pulseDot 2s ease-in-out infinite' }} />
                      <span style={{ fontSize: 10, color: '#10B981', fontWeight: 700, letterSpacing: '0.04em' }}>LIVE</span>
                    </div>
                  )}
                  <div style={{ width: 48, height: 48, background: `${s.color}10`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: `1.5px solid ${s.color}20` }}>
                    <s.icon size={22} color={s.color} />
                  </div>
                  <div style={{ fontSize: 38, fontFamily: 'Outfit', fontWeight: 900, color: '#0F172A', lineHeight: 1, marginBottom: 6 }}>{display}</div>
                  <div style={{ color: '#64748B', fontSize: 13, fontWeight: 500 }}>{s.label}</div>
                </motion.div>
              )
            })}
          </div>

          {/* Testimonials */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {testimonials.map((t, i) => {
              const color = t.avatar_color || '#6366F1'
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  style={{ background: 'white', borderRadius: 18, padding: '28px', border: '1.5px solid #F1F5F9', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}>
                  {/* Colour accent bar */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                  {/* Star rating */}
                  <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={14} color="#F59E0B" fill={s <= (t.rating || 5) ? '#F59E0B' : 'none'} />
                    ))}
                  </div>
                  <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.75, marginBottom: 18, fontStyle: 'italic' }}>"{t.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {t.avatar_url ? (
                      <img src={t.avatar_url} alt={t.name}
                        style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${color}40` }} />
                    ) : (
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${color},${color}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontFamily: 'Outfit', fontSize: 14 }}>
                        {t.name[0]}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0F172A' }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: '#94A3B8' }}>{t.role}</div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '110px 28px', background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #F0F9FF 100%)' }}>
        <div style={{ maxWidth: 740, margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
            <div style={{ background: 'white', borderRadius: 28, padding: '70px 48px', boxShadow: '0 20px 60px rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.12)', position: 'relative', overflow: 'hidden' }}>
              {/* Background decoration */}
              <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, background: 'radial-gradient(circle, rgba(99,102,241,0.08), transparent)', borderRadius: '50%', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: -40, left: -40, width: 180, height: 180, background: 'radial-gradient(circle, rgba(139,92,246,0.06), transparent)', borderRadius: '50%', pointerEvents: 'none' }} />

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#EEF2FF', borderRadius: 9999, padding: '5px 14px', marginBottom: 20, color: '#6366F1', fontSize: 13, fontWeight: 600 }}>
                🚀 Start Today — It's Free
              </div>
              <h2 style={{ fontSize: 42, fontFamily: 'Outfit', fontWeight: 900, marginBottom: 16, color: '#0F172A', letterSpacing: '-0.02em' }}>
                Ready to <span style={{ background: 'linear-gradient(135deg,#6366F1,#8B5CF6,#0EA5E9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Start Learning?</span>
              </h2>
              <p style={{ color: '#64748B', fontSize: 17, marginBottom: 40, lineHeight: 1.7 }}>
                Join thousands of learners and mentors exchanging skills on SkillConnect. No fees, just knowledge.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <motion.button whileHover={{ scale: 1.04, boxShadow: '0 10px 30px rgba(99,102,241,0.4)' }} whileTap={{ scale: 0.97 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, padding: '15px 34px', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', border: 'none', borderRadius: 14, color: 'white', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}>
                    Get Started Free <ArrowRight size={18} />
                  </motion.button>
                </Link>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <motion.button whileHover={{ scale: 1.04, background: '#F1F5F9' }} whileTap={{ scale: 0.97 }}
                    style={{ fontSize: 16, padding: '15px 32px', background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 14, color: '#374151', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    Sign In
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: 'linear-gradient(135deg, #F8F7FF 0%, #EEF2FF 50%, #F0F9FF 100%)', padding: '56px 28px 36px', borderTop: '1.5px solid rgba(99,102,241,0.1)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Top row: brand + nav links */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 32 }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
                  <Zap size={17} color="white" fill="white" />
                </div>
                <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 22, color: '#0F172A' }}>Skill<span style={{ color: '#6366F1' }}>Connect</span></span>
              </div>
              <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.7, maxWidth: 260 }}>
                Teach what you know.<br />Learn what you need. No fees, just knowledge.
              </p>
              {/* Social badges */}
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                {['🌐 Web', '📱 Mobile', '🔒 Secure'].map((badge, i) => (
                  <span key={i} style={{ background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#475569', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Link columns */}
            <div style={{ display: 'flex', gap: 56, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, color: '#6366F1', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Platform</div>
                {[['#features','Features'],['#how-it-works','How It Works'],['#community','Community']].map(([href, label]) => (
                  <div key={href} style={{ marginBottom: 10 }}>
                    <a href={href} style={{ color: '#475569', fontSize: 14, textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#6366F1'}
                      onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                      {label}
                    </a>
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, color: '#8B5CF6', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Account</div>
                {[['/login','Log In'],['/register','Register'],['/pricing','Pricing']].map(([href, label]) => (
                  <div key={href} style={{ marginBottom: 10 }}>
                    <Link to={href} style={{ color: '#475569', fontSize: 14, textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#8B5CF6'}
                      onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                      {label}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA mini card */}
            <div style={{ background: 'white', borderRadius: 18, padding: '24px 28px', border: '1.5px solid rgba(99,102,241,0.12)', boxShadow: '0 6px 24px rgba(99,102,241,0.08)', minWidth: 220 }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>🚀</div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 16, color: '#0F172A', marginBottom: 6 }}>Start for Free</div>
              <p style={{ color: '#64748B', fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>Join 10K+ learners today.</p>
              <Link to="/register" style={{ display: 'block', textDecoration: 'none', background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', color: 'white', textAlign: 'center', borderRadius: 10, padding: '10px 0', fontWeight: 700, fontSize: 14, boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
                Get Started →
              </Link>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1.5px solid rgba(99,102,241,0.1)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <p style={{ color: '#94A3B8', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              © 2026 SkillConnect. Built with <span style={{ color: '#EC4899' }}>❤️</span> for learners worldwide.
            </p>
            <div style={{ display: 'flex', gap: 6 }}>
              {['Privacy Policy', 'Terms of Service', 'Contact'].map((label, i) => (
                <span key={i} style={{ color: '#94A3B8', fontSize: 13, cursor: 'pointer', padding: '4px 10px', borderRadius: 6, transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#6366F1'; e.currentTarget.style.background = '#EEF2FF' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent' }}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.6; transform: scale(1.4); }
        }
      `}</style>

    </div>
  )
}
