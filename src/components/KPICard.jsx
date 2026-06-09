import { TrendingUp, TrendingDown } from 'lucide-react'

const ACCENT_MAP = {
  blue:   ['var(--ac)',  'var(--ac-bg)'],
  green:  ['var(--gr)',  'var(--gr-bg)'],
  amber:  ['var(--am)',  'var(--am-bg)'],
  red:    ['var(--rd)',  'var(--rd-bg)'],
  purple: ['var(--pu)',  'var(--pu-bg)'],
}

export default function KPICard({ label, value, sub, trend, trendLabel, accent = 'blue', icon: Ic, alert, delta }) {
  const [ac, acBg] = ACCENT_MAP[accent] || ACCENT_MAP.blue

  const trendVal = trend !== undefined ? trend : (delta ? parseFloat(delta) : undefined)

  return (
    <div style={{
      background: 'var(--s1)', border: '1px solid var(--bd)', borderRadius: 'var(--radius)',
      padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: -24, right: -24, width: 90, height: 90,
        borderRadius: '50%', background: ac, opacity: .06,
        filter: 'blur(28px)', pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--tx2)', letterSpacing: '.01em' }}>
          {label}
        </span>
        {Ic && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: acBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: ac,
          }}>
            <Ic size={15} />
          </div>
        )}
      </div>

      <div>
        <div style={{
          fontSize: 26, fontWeight: 700, letterSpacing: '-.025em',
          color: alert ? 'var(--rd)' : 'var(--tx1)', lineHeight: 1,
        }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 5 }}>{sub}</div>}
        {trendVal !== undefined && (
          <div style={{
            marginTop: 6, display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 12, color: trendVal >= 0 ? 'var(--gr)' : 'var(--rd)',
          }}>
            {trendVal >= 0
              ? <TrendingUp size={12} />
              : <TrendingDown size={12} />
            }
            <span style={{ fontWeight: 600 }}>{Math.abs(trendVal)}%</span>
            {trendLabel && <span style={{ color: 'var(--tx3)', marginLeft: 1 }}>{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
