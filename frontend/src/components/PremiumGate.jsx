import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Zap } from 'lucide-react'
import Sidebar from './Sidebar'

export default function PremiumGate({ user, featureName = 'this feature' }) {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', background: '#F8FAFC', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: 240, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: '56px 48px', maxWidth: 480, width: '100%', textAlign: 'center', boxShadow: '0 16px 48px rgba(0,0,0,0.07)' }}>

          <div style={{ width: 72, height: 72, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Lock size={30} color="#6366F1" />
          </div>

          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 26, color: '#0F172A', marginBottom: 10 }}>
            Premium Feature
          </h2>
          <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#64748B', marginBottom: 8, lineHeight: 1.6 }}>
            <strong style={{ color: '#0F172A' }}>{featureName}</strong> is available for SkillConnect Pro members.
            Upgrade to unlock unlimited messaging, session scheduling, and more.
          </p>

          <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: '14px 20px', margin: '20px 0 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, textAlign: 'left' }}>
            {['💬 Unlimited Chat', '📅 Book Sessions', '🔍 Priority Matches', '⭐ Pro Badge'].map((f, i) => (
              <div key={i} style={{ fontFamily: 'Inter', fontSize: 13, color: '#475569', fontWeight: 500 }}>{f}</div>
            ))}
          </div>

          <button onClick={() => navigate('/pricing')}
            style={{ width: '100%', background: 'linear-gradient(135deg,#3B82F6,#6366F1)', border: 'none', color: 'white', borderRadius: 12, padding: '14px', fontFamily: 'Inter', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <Zap size={16} fill="white" /> Upgrade to Pro
          </button>
          <button onClick={() => navigate('/dashboard')}
            style={{ width: '100%', background: 'none', border: '1px solid #E2E8F0', color: '#64748B', borderRadius: 12, padding: '12px', fontFamily: 'Inter', fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>
            Maybe later
          </button>
        </motion.div>
      </div>
    </div>
  )
}
