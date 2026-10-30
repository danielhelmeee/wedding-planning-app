import { useEffect, useRef, useState } from 'react'
import { SealFace } from './ThemeArt.jsx'
import { paperGrain } from './artUtils.js'

const SEAL = 148 // px
const PEEL_MS = 1300
const REVEAL_MS = { gates: 1300, envelope: 1700, curtain: 1400, fade: 900 }
const ANGLE = 40 // the fold runs diagonally: the seal peels from its lower-right edge towards the upper left

const ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2

// The seal: peeled like a sticker. A fold line sweeps across it; the part past the fold flips over and shows
// the sticker's paper back, shaded darker near the fold, then the whole seal lifts away.
function PeelSeal({ theme, initials, label, peeling, onPeeled, onPress }) {
  const [t, setT] = useState(0)
  const raf = useRef(0)
  const done = useRef(onPeeled)
  useEffect(() => {
    done.current = onPeeled
  })

  // Runs once when peeling starts (re-renders of the cover must not restart it).
  useEffect(() => {
    if (!peeling) return
    const start = performance.now()
    const tick = (now) => {
      const k = Math.min(1, (now - start) / PEEL_MS)
      setT(k)
      if (k < 1) raf.current = requestAnimationFrame(tick)
      else done.current()
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [peeling])

  const e = ease(Math.min(1, t / 0.8)) // the fold finishes crossing at 80%, then the sticker comes away
  const lift = ease(Math.max(0, (t - 0.68) / 0.32))
  const fold = SEAL * (1 - e * 1.02) // x of the fold line, in the rotated frame
  const curl = 110 + e * 26 // the flap stands up steeply and never lies flat, so it stays over the seal
  const back = theme.dark ? '#d9d2c3' : '#f4efe5'

  return (
    <div
      className="peel"
      style={{
        width: SEAL,
        height: SEAL,
        // Pulled off towards the upper left (the way it was peeled), turning slightly as it goes.
        transform: `translate(-50%, -50%) translate(${-lift * 70}px, ${-lift * 90}px) rotate(${-lift * 24}deg) scale(${1 - lift * 0.12})`,
        opacity: 1 - lift,
      }}
    >
      <div className={`peel-frame${peeling ? '' : ' is-breathing'}`} style={{ transform: `rotate(${ANGLE}deg)` }}>
        {/* Stuck-down part, left of the fold */}
        <div className="peel-front" style={{ clipPath: `inset(0 ${SEAL - fold}px 0 0)` }}>
          <div className="peel-upright" style={{ transform: `rotate(${-ANGLE}deg)` }}>
            <SealFace theme={theme} initials={initials} label={label} />
          </div>
        </div>
        {/* Peeled part: curls up around the fold in 3D, showing the paper back */}
        {t > 0 && (
          <>
            <div
              className="peel-shadow"
              style={{
                background: `linear-gradient(90deg, transparent ${fold - 34}px, rgba(0,0,0,0.45) ${fold}px, transparent ${fold + 1}px)`,
                opacity: 0.6 * (1 - lift),
              }}
            />
            <div
              className="peel-back"
              style={{
                clipPath: `inset(0 0 0 ${fold}px)`,
                transformOrigin: `${fold}px 50%`,
                transform: `rotateY(${-curl}deg)`,
                background: `linear-gradient(90deg, transparent ${fold}px, rgba(0,0,0,0.26) ${fold}px, rgba(0,0,0,0.05) ${fold + 22}px, rgba(255,255,255,0.45) ${fold + 52}px, rgba(0,0,0,0.08) ${SEAL}px), ${paperGrain(false)}, ${back}`,
              }}
            />
          </>
        )}
      </div>
      {!peeling && (
        <button type="button" className="peel-button" onClick={onPress} aria-label={label}>
          <span className="visually-hidden">{label}</span>
        </button>
      )}
    </div>
  )
}

// The cover over the invitation: gates (or an envelope / curtain / plain cover) with the seal on top.
// phase: closed → peeling → revealing → (parent removes the cover)
// `cover` is a copy of the invitation's cover, shown as the card inside the envelope.
export default function Opening({ theme, animation, initials, label, cover, onTap, onRevealing, onDone }) {
  const [phase, setPhase] = useState('closed')
  const timer = useRef(0)

  useEffect(() => () => clearTimeout(timer.current), [])

  function start() {
    onTap?.() // inside the tap, so the browser allows the music to start
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onRevealing()
      onDone()
      return
    }
    setPhase('peeling')
  }

  function peeled() {
    setPhase('revealing')
    onRevealing()
    timer.current = setTimeout(onDone, REVEAL_MS[animation] ?? 1200)
  }

  const p = theme.palette
  const paper = { backgroundColor: p.bg, backgroundImage: paperGrain(theme.dark) }

  return (
    <div
      className={`opening anim-${animation} is-${phase}`}
      style={{ '--seam': theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(60,45,25,0.22)' }}
    >
      {animation === 'gates' && (
        <>
          <div className="gate left" style={paper}>
            <div className="gate-line" />
          </div>
          <div className="gate right" style={paper}>
            <div className="gate-line" />
          </div>
          <div className="gate-seam" />
        </>
      )}
      {animation === 'curtain' && (
        <>
          <div className="drape left" />
          <div className="drape right" />
          <div className="drape-valance" />
        </>
      )}
      {animation === 'fade' && <div className="cover-plain" style={paper} />}
      {animation === 'envelope' && (
        // A full-screen vertical envelope: the flap comes down to a point in the middle, where the seal holds it.
        // Inside sits the invitation card (a copy of the cover). When the flap lifts, the card shows in the opening;
        // then the pocket drops away and the card grows to fill the screen, landing exactly on the real cover.
        <div className="env-full">
          <div className="env-inside" style={{ backgroundColor: p.bgAlt, backgroundImage: paperGrain(theme.dark) }} />
          <div className="env-card" aria-hidden="true">
            {cover}
          </div>
          <div className="env-front">
            <div className="env-body" style={paper}>
              <svg className="env-folds" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path
                  d="M0 100L50 52L100 100"
                  fill="none"
                  stroke="var(--seam)"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
            <div className="env-flap-wrap">
              <div className="env-flap" style={paper} />
            </div>
          </div>
        </div>
      )}

      <PeelSeal
        theme={theme}
        initials={initials}
        label={label}
        peeling={phase !== 'closed'}
        onPeeled={peeled}
        onPress={start}
      />
    </div>
  )
}
