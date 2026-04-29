import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen } from 'lucide-react'
import { skillsAPI } from '../services/api'
import toast from 'react-hot-toast'

const CATEGORIES = ['Programming', 'Design', 'Data Science', 'Marketing', 'Creative', 'Business', 'Language', 'Music', 'Sports', 'Other']

const LEVELS = [
  { v: 'beginner',     label: '🌱 Beginner',     color: '#22C55E', bg: 'rgba(34,197,94,0.08)'   },
  { v: 'intermediate', label: '⚡ Intermediate',  color: '#3B82F6', bg: 'rgba(59,130,246,0.08)'  },
  { v: 'advanced',     label: '🔥 Advanced',      color: '#F59E0B', bg: 'rgba(245,158,11,0.08)'  },
  { v: 'expert',       label: '💎 Expert',        color: '#A855F7', bg: 'rgba(168,85,247,0.08)'  },
]

export default function AddSkillModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ skill_name: '', category: 'Programming', description: '', skill_type: 'teach', level: 'intermediate' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await skillsAPI.create(form)
      onAdded(data)
    } catch (err) {
      toast.error(err.response?.data?.skill_name?.[0] || 'Failed to add skill')
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}
        onClick={onClose}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: 32, width: '100%', maxWidth: 500, position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', maxHeight: '90vh', overflowY: 'auto' }}
          onClick={e => e.stopPropagation()}>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}><X size={20} /></button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, background: 'rgba(59,130,246,0.15)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(59,130,246,0.25)' }}>
              <BookOpen size={20} color="#3B82F6" />
            </div>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, color: '#0F172A' }}>Add a Skill</h2>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', color: '#334155', fontFamily: 'Inter', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Skill Name *</label>
              <input required className="input-field" placeholder="e.g. React.js, Python, Figma..."
                value={form.skill_name} onChange={e => setForm(p => ({ ...p, skill_name: e.target.value }))} />
            </div>

            <div>
              <label style={{ display: 'block', color: '#334155', fontFamily: 'Inter', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Type *</label>
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { v: 'teach', label: '📚 I can Teach', color: '#3B82F6' },
                  { v: 'learn', label: '🎯 I want to Learn', color: '#A855F7' }
                ].map(opt => (
                  <button key={opt.v} type="button" onClick={() => setForm(p => ({ ...p, skill_type: opt.v }))}
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: 8,
                      border: `2px solid ${form.skill_type === opt.v ? opt.color : '#E2E8F0'}`,
                      background: form.skill_type === opt.v ? `${opt.color}10` : '#F8FAFC',
                      color: form.skill_type === opt.v ? opt.color : '#64748B',
                      fontFamily: 'Inter', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Proficiency Level */}
            <div>
              <label style={{ display: 'block', color: '#334155', fontFamily: 'Inter', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                Proficiency Level
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {LEVELS.map(lvl => (
                  <button key={lvl.v} type="button" onClick={() => setForm(p => ({ ...p, level: lvl.v }))}
                    style={{
                      padding: '9px 12px', borderRadius: 8, textAlign: 'left',
                      border: `2px solid ${form.level === lvl.v ? lvl.color : '#E2E8F0'}`,
                      background: form.level === lvl.v ? lvl.bg : '#F8FAFC',
                      color: form.level === lvl.v ? lvl.color : '#64748B',
                      fontFamily: 'Inter', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                    {lvl.label}
                  </button>
                ))}
              </div>

              {/* Progress bar preview */}
              {(() => {
                const lvl = LEVELS.find(l => l.v === form.level)
                const widths = { beginner: '25%', intermediate: '50%', advanced: '75%', expert: '100%' }
                return (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ height: 6, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
                      <motion.div
                        key={form.level}
                        initial={{ width: 0 }}
                        animate={{ width: widths[form.level] }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{ height: '100%', background: `linear-gradient(90deg, ${lvl.color}, ${lvl.color}99)`, borderRadius: 99 }}
                      />
                    </div>
                    <div style={{ fontFamily: 'Inter', fontSize: 11, color: lvl.color, marginTop: 4, fontWeight: 600 }}>
                      {form.level.charAt(0).toUpperCase() + form.level.slice(1)} level
                    </div>
                  </div>
                )
              })()}
            </div>

            <div>
              <label style={{ display: 'block', color: '#334155', fontFamily: 'Inter', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Category</label>
              <select className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', color: '#334155', fontFamily: 'Inter', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Description <span style={{ color: '#94A3B8' }}>(optional)</span></label>
              <textarea className="input-field" style={{ resize: 'none', height: 70 }} placeholder="What's your specific focus areas?"
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>

            <button type="submit" disabled={loading} className="btn-neon-green" style={{ marginTop: 8, padding: '13px', fontSize: 15 }}>
              {loading ? 'Adding...' : 'Add Skill'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
