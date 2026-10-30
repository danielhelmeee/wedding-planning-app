import { useEffect, useRef, useState } from 'react'

const COLOURS = ['#d9c3cf', '#e9dbe3', '#b896aa', '#f6eef2', '#b39b74', '#d8c7a8']

// A short shower of mauve petals and brass flecks for real milestones (see celebrate.js).
// With "reduce motion" on, a small gold tick appears instead.
export default function Petals() {
  const canvas = useRef(null)
  const [burst, setBurst] = useState(null) // { id, message }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    const on = (e) => setBurst({ id: Date.now(), message: e.detail?.message ?? '' })
    window.addEventListener('restu:celebrate', on)
    return () => window.removeEventListener('restu:celebrate', on)
  }, [])

  useEffect(() => {
    if (!burst) return
    const done = setTimeout(() => setBurst(null), reduce ? 1400 : 2600)
    if (reduce || !canvas.current) return () => clearTimeout(done)
    const c = canvas.current
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    c.width = innerWidth * dpr
    c.height = innerHeight * dpr
    const ctx = c.getContext('2d')
    ctx.scale(dpr, dpr)
    const n = Math.min(90, Math.round(innerWidth / 12))
    const bits = Array.from({ length: n }, (_, i) => {
      const gold = i % 4 === 0
      return {
        x: Math.random() * innerWidth,
        y: -20 - Math.random() * innerHeight * 0.5,
        vy: 1.4 + Math.random() * 2.2,
        sway: 0.6 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.12,
        size: gold ? 2 + Math.random() * 2.5 : 6 + Math.random() * 7,
        gold,
        colour: gold ? COLOURS[4 + (i % 2)] : COLOURS[i % 4],
      }
    })
    const start = performance.now()
    let raf
    const frame = (now) => {
      const t = (now - start) / 2400
      ctx.clearRect(0, 0, innerWidth, innerHeight)
      ctx.globalAlpha = t > 0.75 ? Math.max(0, 1 - (t - 0.75) / 0.25) : 1
      for (const b of bits) {
        b.y += b.vy
        b.phase += 0.03
        b.rot += b.spin
        const x = b.x + Math.sin(b.phase) * b.sway * 12
        ctx.save()
        ctx.translate(x, b.y)
        ctx.rotate(b.rot)
        ctx.fillStyle = b.colour
        ctx.beginPath()
        if (b.gold) ctx.arc(0, 0, b.size, 0, Math.PI * 2)
        else ctx.ellipse(0, 0, b.size, b.size * 0.55, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      if (t < 1) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(done)
    }
  }, [burst, reduce])

  if (!burst) return null
  return (
    <div className="petals" aria-live="polite">
      {!reduce && <canvas ref={canvas} aria-hidden="true" />}
      {burst.message && (
        <p className="petals-message" key={burst.id}>
          <svg className="petal-mark" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 15C3 11 3.5 4.5 8 1c4.5 3.5 5 10 0 14z" />
          </svg>{' '}
          {burst.message}
        </p>
      )}
    </div>
  )
}
