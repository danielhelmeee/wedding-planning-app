import { useEffect, useRef, useState } from 'react'

const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// A figure that counts up to its value when it first appears, and glides to new values after.
export default function CountUp({ value, format = (n) => String(n), duration = 700 }) {
  const [shown, setShown] = useState(reduce ? value : 0)
  const from = useRef(reduce ? value : 0)
  useEffect(() => {
    if (reduce) return
    const start = performance.now()
    const a = from.current
    let raf
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 4)
      const n = Math.round(a + (value - a) * eased)
      from.current = n
      setShown(n)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return <span className="count-up">{format(reduce ? value : shown)}</span>
}
