/* ─────────────────────────────────────────────────
   Skeleton.jsx — Reusable shimmer loading skeletons
   ───────────────────────────────────────────────── */

const shimmerStyle = {
  background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.4s ease-in-out infinite',
  borderRadius: 8,
}

/* Base shimmer block */
export function SkeletonBlock({ width = '100%', height = 16, radius = 8, style = {} }) {
  return (
    <div style={{
      ...shimmerStyle,
      width,
      height,
      borderRadius: radius,
      flexShrink: 0,
      ...style,
    }} />
  )
}

/* ── Stat card skeleton (4 per row on Dashboard) ── */
export function SkeletonStatCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.7)',
      border: '1px solid rgba(255,255,255,0.9)',
      borderRadius: 20, padding: '24px 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, ...shimmerStyle }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <SkeletonBlock width={48} height={48} radius={14} />
        <SkeletonBlock width={54} height={22} radius={8} />
      </div>
      <SkeletonBlock width={48} height={38} radius={6} style={{ marginBottom: 8 }} />
      <SkeletonBlock width={110} height={14} radius={6} />
    </div>
  )
}

/* ── Skill card skeleton ── */
export function SkeletonSkillCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.78)',
      border: '1px solid rgba(255,255,255,0.92)',
      borderRadius: 20, padding: 20,
      boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, ...shimmerStyle }} />
      <SkeletonBlock width="60%" height={20} radius={6} style={{ marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <SkeletonBlock width={80} height={22} radius={20} />
        <SkeletonBlock width={90} height={22} radius={20} />
        <SkeletonBlock width={70} height={22} radius={20} />
      </div>
      <SkeletonBlock width="90%" height={13} radius={5} style={{ marginBottom: 6 }} />
      <SkeletonBlock width="75%" height={13} radius={5} style={{ marginBottom: 16 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
        <SkeletonBlock width={30} height={30} radius="50%" />
        <SkeletonBlock width={90} height={13} radius={5} />
      </div>
    </div>
  )
}

/* ── Match card skeleton ── */
export function SkeletonMatchCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.75)',
      border: '1px solid rgba(255,255,255,0.9)',
      borderRadius: 16, padding: '14px 16px',
      boxShadow: '0 2px 12px rgba(99,102,241,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <SkeletonBlock width={44} height={44} radius="50%" />
        <div>
          <SkeletonBlock width={120} height={14} radius={5} style={{ marginBottom: 8 }} />
          <SkeletonBlock width={160} height={12} radius={5} />
        </div>
      </div>
      <SkeletonBlock width={70} height={26} radius={20} />
    </div>
  )
}

/* ── Session card skeleton ── */
export function SkeletonSessionCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.75)',
      border: '1px solid rgba(255,255,255,0.9)',
      borderRadius: 20, padding: '20px 22px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, ...shimmerStyle }} />
      <SkeletonBlock width="55%" height={18} radius={6} style={{ marginBottom: 10 }} />
      <SkeletonBlock width="40%" height={13} radius={5} style={{ marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <SkeletonBlock width={90} height={22} radius={20} />
        <SkeletonBlock width={70} height={22} radius={20} />
      </div>
      <SkeletonBlock width="100%" height={50} radius={12} />
    </div>
  )
}

/* ── Message thread row skeleton ── */
export function SkeletonThreadRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid #F1F5F9' }}>
      <SkeletonBlock width={44} height={44} radius="50%" />
      <div style={{ flex: 1 }}>
        <SkeletonBlock width="45%" height={14} radius={5} style={{ marginBottom: 8 }} />
        <SkeletonBlock width="70%" height={12} radius={5} />
      </div>
      <SkeletonBlock width={40} height={12} radius={5} />
    </div>
  )
}

/* ── Profile page skeleton ── */
export function SkeletonProfile() {
  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
        <SkeletonBlock width={80} height={80} radius="50%" />
        <div style={{ flex: 1 }}>
          <SkeletonBlock width="40%" height={22} radius={6} style={{ marginBottom: 10 }} />
          <SkeletonBlock width="60%" height={14} radius={5} />
        </div>
      </div>
      <SkeletonBlock width="100%" height={80} radius={12} style={{ marginBottom: 20 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[1,2,3,4].map(i => <SkeletonBlock key={i} width="100%" height={90} radius={14} />)}
      </div>
    </div>
  )
}

/* Inject keyframe once */
export function SkeletonStyles() {
  return (
    <style>{`
      @keyframes shimmer {
        0%   { background-position: -200% 0; }
        100% { background-position:  200% 0; }
      }
    `}</style>
  )
}
