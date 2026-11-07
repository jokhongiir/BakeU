import { useEffect, useRef } from 'react'
import logo from '../public/logo.webp'
import './Bakeu.css'

/* ---- Bu yerni tahrirlang ---- */
const WORDS = ['Uyda', 'pishirilgan,', 'eshikka', 'yetkazilgan']
const STATUS = 'Tez kunda'
const DOMAIN = 'bakeu.uz'
const LINKS = [
  { label: 'Telegram', href: 'https://t.me/bakeu_uz', icon: 'send' },
  { label: 'Instagram', href: 'https://instagram.com/bakeu.uz', icon: 'instagram' },
]
const CRUMB_COLORS = ['#3F1A0E', '#5A2A14', '#F5A623', '#E0601A', '#C98A4B']
/* ----------------------------- */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Icon({ name }) {
  const p = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  return name === 'send' ? (
    <svg {...p}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
  ) : (
    <svg {...p}><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4z" /><path d="M17.5 6.5h.01" /></svg>
  )
}

/* Sichqoncha bo'yicha logotip qiyshayishi va yorug'lik ergashishi */
function useParallax(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el || reduced()) return
    let tx = 0, ty = 0, x = 0, y = 0, raf
    const set = (k, v) => el.style.setProperty(k, v)
    const onMove = (e) => {
      tx = (e.clientX / innerWidth - 0.5) * 2
      ty = (e.clientY / innerHeight - 0.5) * 2
      set('--gx', `${50 + tx * 9}%`)
      set('--gy', `${46 + ty * 9}%`)
    }
    const loop = () => {
      x += (tx - x) * 0.08
      y += (ty - y) * 0.08
      set('--ry', `${(x * 7).toFixed(2)}deg`)
      set('--rx', `${(-y * 6).toFixed(2)}deg`)
      set('--tx', `${(x * 10).toFixed(1)}px`)
      set('--ty', `${(y * 8).toFixed(1)}px`)
      raf = requestAnimationFrame(loop)
    }
    addEventListener('pointermove', onMove, { passive: true })
    loop()
    return () => { removeEventListener('pointermove', onMove); cancelAnimationFrame(raf) }
  }, [ref])
}

/* Suzib yuruvchi ushoqlar + bosganda sochilish */
function useCrumbs(ref) {
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const cx = cv.getContext('2d')
    const calm = reduced()
    let W = 0, H = 0, raf, last = performance.now()
    const rnd = (a, b) => a + Math.random() * (b - a)
    const pick = () => CRUMB_COLORS[(Math.random() * CRUMB_COLORS.length) | 0]
    const fit = () => {
      const d = Math.min(devicePixelRatio || 1, 2)
      W = innerWidth; H = innerHeight
      cv.width = W * d; cv.height = H * d
      cx.setTransform(d, 0, 0, d, 0, 0)
    }
    const mk = (anyY) => ({ x: rnd(0, W), y: anyY ? rnd(0, H) : H + 20, r: rnd(2, 7), vy: -rnd(0.012, 0.042), ph: rnd(0, 6.28), sw: rnd(0.3, 1), rot: rnd(0, 6.28), vr: rnd(-0.001, 0.001), c: pick(), a: rnd(0.25, 0.65), sq: Math.random() < 0.4 })
    fit()
    const count = calm ? 0 : Math.round(Math.min(34, Math.max(16, (W * H) / 38000)))
    let ps = Array.from({ length: count }, () => mk(true))
    let bursts = []
    const draw = (p, r) => {
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.beginPath()
      p.sq ? cx.rect(-r, -r * 0.7, r * 2, r * 1.4) : cx.arc(0, 0, r, 0, 6.283)
      cx.fill(); cx.restore()
    }
    const tick = (t) => {
      const dt = Math.min(40, t - last); last = t
      cx.clearRect(0, 0, W, H)
      ps = ps.map((p) => {
        p.y += p.vy * dt
        p.x += Math.sin((t / 1800) * p.sw + p.ph) * 0.12 * (dt / 16)
        p.rot += p.vr * dt
        return p.y < -20 ? mk(false) : p
      })
      ps.forEach((p) => { cx.globalAlpha = p.a; cx.fillStyle = p.c; draw(p, p.r) })
      bursts = bursts.filter((b) => (b.t += dt) < b.life)
      bursts.forEach((b) => {
        b.vy += 0.0014 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += 0.006 * dt
        cx.globalAlpha = Math.max(0, 1 - b.t / b.life); cx.fillStyle = b.c; draw(b, b.r)
      })
      cx.globalAlpha = 1
      raf = requestAnimationFrame(tick)
    }
    const onDown = (e) => {
      if (calm || e.target.closest('a')) return
      for (let i = 0; i < 18; i++) {
        const a = rnd(0, 6.28), s = rnd(0.15, 0.6)
        bursts.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.25, r: rnd(2, 6.5), rot: rnd(0, 6.28), c: pick(), t: 0, life: rnd(900, 1600), sq: Math.random() < 0.5 })
      }
    }
    addEventListener('resize', fit)
    addEventListener('pointerdown', onDown)
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', fit); removeEventListener('pointerdown', onDown) }
  }, [ref])
}

export default function Bakeu() {
  const stage = useRef(null)
  const canvas = useRef(null)
  useParallax(stage)
  useCrumbs(canvas)

  return (
    <main className="bk" ref={stage} style={{ '--logo': `url(${logo})` }}>
      <div className="bk-glow" />
      <div className="bk-ring" aria-hidden="true">
        <svg viewBox="-100 -100 200 200">
          <g className="bk-spin">
            <circle r="96" fill="none" stroke="#3F1A0E" strokeOpacity=".16" strokeWidth=".5" strokeDasharray="1.2 3.2" />
            <circle cx="96" cy="0" r="3.4" fill="#F5A623" /><circle cx="-48" cy="83" r="2.4" fill="#3F1A0E" /><circle cx="-48" cy="-83" r="2.8" fill="#E0601A" />
          </g>
          <g className="bk-spin bk-spin--rev">
            <circle r="74" fill="none" stroke="#E0601A" strokeOpacity=".22" strokeWidth=".5" />
            <circle cx="0" cy="-74" r="2.2" fill="#3F1A0E" /><circle cx="64" cy="37" r="2.8" fill="#F5A623" />
          </g>
        </svg>
      </div>
      <canvas className="bk-fx" ref={canvas} aria-hidden="true" />

      <div className="bk-tilt">
        <div className="bk-float">
          <div className="bk-logo">
            <img src={logo} width="782" height="501" alt="BAKEU logotipi: A harfi shokoladli kuki shaklida" draggable="false" />
            <svg className="bk-steam" viewBox="0 0 91 223" aria-hidden="true">
              <path pathLength="100" d="M12 223C-4 195 26 172 12 142S28 88 12 58 20 18 12 0" />
              <path pathLength="100" d="M46 223C30 195 62 172 46 142S62 88 46 58 54 18 46 0" />
              <path pathLength="100" d="M80 223C64 195 96 172 80 142S96 88 80 58 88 18 80 0" />
            </svg>
          </div>
        </div>
      </div>

      <h1 className="bk-tag" aria-label={WORDS.join(' ')}>
        {WORDS.map((w, i) => <span key={w} aria-hidden="true">{w}{i < WORDS.length - 1 ? ' ' : ''}</span>)}
      </h1>
      <svg className="bk-under" viewBox="0 0 260 14" preserveAspectRatio="none" aria-hidden="true">
        <path pathLength="1" d="M4 8Q36 0 68 8T132 8T196 8T256 8" />
      </svg>

      <footer className="bk-foot">
        <span className="bk-pill"><i className="bk-dot" />{STATUS}</span>
        <nav className="bk-links" aria-label="Aloqa">
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} title={l.label}><Icon name={l.icon} /></a>
          ))}
        </nav>
        <span className="bk-site">{DOMAIN}</span>
      </footer>

      <div className="bk-grain" aria-hidden="true" />
      <div className="bk-curtain" aria-hidden="true" />
    </main>
  )
}
