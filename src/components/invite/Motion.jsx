import { useEffect, useRef, useState } from 'react'

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Drifting particles over the invitation: falling petals, rising gold dust, blossoms or twinkling stars.
// They keep drifting while the invitation is open; the couple can switch them off in the studio, and guests who
// ask their device to reduce motion never see them.
// Restarts only when the look changes (`look`), not on every re-render, and moves by elapsed time so the loop
// is smooth at any frame rate.
export function Particles({ kind, palette, look, running }) {
  const canvas = useRef(null)
  const paletteRef = useRef(palette)
  useEffect(() => {
    paletteRef.current = palette
  })

  useEffect(() => {
    const palette = paletteRef.current
    if (kind === 'none' || !running || reducedMotion()) return
    const el = canvas.current
    const ctx = el.getContext('2d')
    let w = 0
    let h = 0
    let raf = 0
    const dpr = Math.min(2, window.devicePixelRatio || 1)

    const resize = () => {
      w = el.clientWidth
      h = el.clientHeight
      el.width = w * dpr
      el.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const colours =
      kind === 'petals' || kind === 'blossoms'
        ? palette.art.petals
        : [palette.foil[0], palette.foil[1], palette.foil[3]]
    const count = kind === 'stars' ? 46 : kind === 'gold' ? 34 : 18

    // Each particle shape is drawn once per colour into a small sprite; frames only place sprites.
    // (Creating gradients every frame made the garbage collector pause the animation every few seconds.)
    const R = 12 // sprite radius in CSS px
    const makeSprite = (draw) => {
      const c = document.createElement('canvas')
      c.width = c.height = Math.ceil(R * 2 * dpr)
      const g = c.getContext('2d')
      g.setTransform(dpr, 0, 0, dpr, R * dpr, R * dpr)
      draw(g)
      return c
    }
    const petalSprite = (col) =>
      makeSprite((g) => {
        const gr = g.createRadialGradient(0, R * 0.4, 0, 0, 0, R)
        gr.addColorStop(0, col)
        gr.addColorStop(1, palette.art.petals[2])
        g.fillStyle = gr
        g.beginPath()
        g.moveTo(0, R)
        g.bezierCurveTo(-R, R * 0.2, -R * 0.7, -R, 0, -R * 0.8)
        g.bezierCurveTo(R * 0.7, -R, R, R * 0.2, 0, R)
        g.fill()
      })
    const blossomSprite = (col) =>
      makeSprite((g) => {
        g.fillStyle = col
        for (let i = 0; i < 5; i++) {
          g.rotate((Math.PI * 2) / 5)
          g.beginPath()
          g.ellipse(0, -R * 0.45, R * 0.28, R * 0.45, 0, 0, Math.PI * 2)
          g.fill()
        }
        g.fillStyle = palette.art.deep
        g.beginPath()
        g.arc(0, 0, R * 0.14, 0, Math.PI * 2)
        g.fill()
      })
    // A glint: faint halo + crisp core (+ a fine cross for bright stars). Drawn at unit size r = R / 5.
    const sparkSprite = (col, cross) =>
      makeSprite((g) => {
        const r = R / 5
        const gr = g.createRadialGradient(0, 0, 0, 0, 0, r * 3)
        gr.addColorStop(0, col)
        gr.addColorStop(1, 'rgba(0,0,0,0)')
        g.globalAlpha = 0.37
        g.fillStyle = gr
        g.beginPath()
        g.arc(0, 0, r * 3, 0, Math.PI * 2)
        g.fill()
        g.globalAlpha = 1
        g.fillStyle = col
        g.beginPath()
        g.arc(0, 0, r * 0.7, 0, Math.PI * 2)
        g.fill()
        if (cross) {
          g.strokeStyle = col
          g.lineWidth = 0.6
          g.beginPath()
          g.moveTo(-r * 5, 0)
          g.lineTo(r * 5, 0)
          g.moveTo(0, -r * 5)
          g.lineTo(0, r * 5)
          g.stroke()
        }
      })
    const sprites = colours.map((col) =>
      kind === 'petals' ? petalSprite(col) : kind === 'blossoms' ? blossomSprite(col) : sparkSprite(col, false),
    )
    const crossSprites = kind === 'stars' ? colours.map((col) => sparkSprite(col, true)) : sprites

    const make = (initial) => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : kind === 'gold' ? h + 10 : -20,
      r:
        kind === 'stars'
          ? Math.random() * 1.4 + 0.5
          : kind === 'gold'
            ? Math.random() * 1 + 0.5
            : Math.random() * 5 + 5,
      vx: (Math.random() - 0.5) * 0.35,
      vy: kind === 'gold' ? -(Math.random() * 0.35 + 0.15) : kind === 'stars' ? 0 : Math.random() * 0.5 + 0.35,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.03,
      sway: Math.random() * Math.PI * 2,
      phase: Math.random() * Math.PI * 2,
      ci: Math.floor(Math.random() * colours.length),
    })
    const parts = Array.from({ length: count }, () => make(true))
    // Reuse particle objects when they leave the screen (no allocation while running).
    const respawn = (p) => Object.assign(p, make(false))

    let last = 0
    const frame = (t) => {
      // Movement per 60 fps frame, scaled by real elapsed time (capped after a pause, e.g. a hidden tab).
      const k = last ? Math.min(3, (t - last) / 16.667) : 1
      last = t
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, el.width, el.height)
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i]
        p.sway += 0.012 * k
        p.x += (p.vx + Math.sin(p.sway) * (kind === 'stars' ? 0 : 0.35)) * k
        p.y += p.vy * k
        p.rot += p.vr * k
        if (p.y > h + 24 || p.y < -24 || p.x < -24 || p.x > w + 24) respawn(p)
        if (kind === 'petals' || kind === 'blossoms') {
          const s = p.r / R
          const sy = kind === 'petals' ? s * (0.55 + 0.45 * Math.abs(Math.sin(p.sway * 1.7))) : s
          const cos = Math.cos(p.rot)
          const sin = Math.sin(p.rot)
          ctx.globalAlpha = kind === 'petals' ? 0.75 : 0.45
          ctx.setTransform(dpr * cos * s, dpr * sin * s, -dpr * sin * sy, dpr * cos * sy, dpr * p.x, dpr * p.y)
          ctx.drawImage(sprites[p.ci], -R, -R, R * 2, R * 2)
        } else {
          const tw =
            kind === 'stars'
              ? 0.35 + 0.65 * Math.abs(Math.sin(t / 900 + p.phase))
              : 0.5 + 0.5 * Math.sin(t / 500 + p.phase)
          const s = p.r / (R / 5)
          ctx.globalAlpha = tw * 0.95
          ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * p.x, dpr * p.y)
          ctx.drawImage(p.r > 1.4 ? crossSprites[p.ci] : sprites[p.ci], -R, -R, R * 2, R * 2)
        }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [kind, look, running])

  if (kind === 'none') return null
  return <canvas ref={canvas} className="iv-particles" aria-hidden="true" />
}

// Fades and lifts its children into view the first time they scroll into sight.
export function Reveal({ children, as: Tag = 'div', className = '', delay = 0, effect = 'up' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(reducedMotion)
  useEffect(() => {
    const el = ref.current
    if (!el || shown) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [shown])
  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${effect}${shown ? ' is-shown' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}

// Line icons for the invitation (24 × 24, stroke = currentColor).
const ICONS = {
  calendar: 'M4 6.5h16v13H4zM4 10.5h16M8.5 3.5v4M15.5 3.5v4',
  clock: 'M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 1 0 0-17zM12 7.5V12l3 2',
  pin: 'M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21zM12 7.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5z',
  phone: 'M6.5 3.5h3l1.5 4-2 1.3a10 10 0 0 0 6.2 6.2l1.3-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5.5a2 2 0 0 1 2-2z',
  map: 'M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2zM9 4.5v13M15 6.5v13',
  car: 'M5 15.5l1.6-5a2 2 0 0 1 1.9-1.4h7a2 2 0 0 1 1.9 1.4l1.6 5M4.5 15.5h15v3h-15zM7.5 18.5v1.5M16.5 18.5v1.5M7.5 13.5h.01M16.5 13.5h.01',
  dress: 'M9 3.5h6l-1 3 3.5 13.5h-11L10 6.5z',
  heart: 'M12 19.5s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 6.8a4.3 4.3 0 0 1 7.5 2.7c0 5.4-7.5 10-7.5 10z',
  close: 'M6 6l12 12M18 6L6 18',
  download: 'M12 4.5v10M8 10.5l4 4 4-4M5 18.5h14',
  reply: 'M4 6.5h16v11H4zM4 7l8 6 8-6',
  gift: 'M4.5 10h15v10h-15zM3.5 7h17v3h-17zM12 7v13M12 7c-1.5-3.5-5.5-3.5-5.5-1.2C6.5 7 9 7 12 7zM12 7c1.5-3.5 5.5-3.5 5.5-1.2C17.5 7 15 7 12 7z',
  copy: 'M9 9h10v11H9zM5 15V4h10',
  music: 'M9 17.5V6l10-2v11.5M9 17.5a2.5 2.5 0 1 1-5 0a2.5 2.5 0 1 1 5 0zM19 15.5a2.5 2.5 0 1 1-5 0a2.5 2.5 0 1 1 5 0z',
}

export function Icon({ name, size = 20 }) {
  return (
    <svg
      className="iv-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  )
}
