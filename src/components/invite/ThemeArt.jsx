import { useId, useLayoutEffect, useRef, useState } from 'react'
import {
  ArtDefs,
  BatikLeaf,
  Bloom,
  Blossom,
  Breath,
  Bud,
  BungaRaya,
  BungaTabur,
  Leaf,
  Moon,
  PalmLine,
  Sprig,
  SongketBand,
} from './Art.jsx'
import { isDark, rng } from './artUtils.js'
import { FineBouquet, FineSprig, FineTwig } from './FineLine.jsx'
import { Cengkih, Gerbang, UkirDefs, UkirDivider, UkirSudut } from './Ukiran.jsx'

// Turns an SVG element into a bitmap (object URL) at `w` device pixels wide.
function bakeSvg(svg, w) {
  const vb = svg.viewBox.baseVal
  const h = Math.round((w * vb.height) / vb.width)
  const copy = svg.cloneNode(true)
  copy.setAttribute('width', w)
  copy.setAttribute('height', h)
  copy.removeAttribute('class')
  copy.removeAttribute('style')
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(copy))}`
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      c.getContext('2d').drawImage(img, 0, 0, w, h)
      // toBlob encodes off the main thread, so baking never stalls running animations.
      c.toBlob((blob) => (blob ? resolve(URL.createObjectURL(blob)) : reject(new Error('bake failed'))), 'image/png')
    }
    img.onerror = reject
    img.src = url
  })
}

// An SVG with its own gradient/filter definitions (ids are unique per instance).
// With `bake` (the default), the drawing is turned into a picture once it has rendered: painterly filters are
// expensive to repaint, and particles drifting over live filtered SVG made the animation stutter. The SVG stays
// in the page (hidden) and is re-baked whenever its markup changes (theme, colour, wording).
function Art({ p, viewBox, className, style, children, label, bake = true }) {
  const id = useId().replace(/:/g, '')
  const ref = useRef(null)
  const baked = useRef('')
  const [src, setSrc] = useState(null)

  useLayoutEffect(() => {
    if (!bake) return
    const svg = ref.current
    const markup = svg.innerHTML
    if (markup === baked.current) return
    baked.current = markup
    const shown = svg.getBoundingClientRect().width || 400
    const w = Math.min(1800, Math.round(Math.max(shown, 240) * Math.min(2, window.devicePixelRatio || 1)))
    let alive = true
    bakeSvg(svg, w)
      .then((url) => {
        if (!alive) return URL.revokeObjectURL(url)
        setSrc((old) => {
          if (old) URL.revokeObjectURL(old)
          return url
        })
      })
      .catch(() => alive && setSrc(null))
    return () => {
      alive = false
    }
  })

  const fill = className?.includes('art-fill')
  return (
    <>
      <svg
        ref={ref}
        className={className}
        style={src ? { ...style, display: 'none' } : style}
        viewBox={viewBox}
        preserveAspectRatio={fill ? 'xMidYMid slice' : undefined}
        aria-hidden={label ? undefined : 'true'}
        role={label ? 'img' : undefined}
        aria-label={label}
      >
        <ArtDefs id={id} p={p} />
        {children(id)}
      </svg>
      {src && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className={className}
          style={{ ...style, objectFit: fill ? 'cover' : undefined }}
          draggable="false"
        />
      )}
    </>
  )
}

// ---------- Garden ----------

function GardenCluster({ id, p, seed = 1, scale = 1 }) {
  const rand = rng(seed)
  const leaves = Array.from({ length: 11 }, (_, i) => ({
    x: 150 + (rand() - 0.5) * 60,
    y: 150 + (rand() - 0.5) * 60,
    rot: -170 + i * 33 + rand() * 14,
    len: 90 + rand() * 70,
    alt: i % 2 === 0,
  }))
  return (
    <g transform={`scale(${scale})`}>
      <g filter={`url(#${id}-wc)`}>
        {leaves.map((l, i) => (
          <Leaf key={i} id={id} x={l.x} y={l.y} len={l.len} rot={l.rot} alt={l.alt} />
        ))}
        <Sprig id={id} x={80} y={250} len={170} rot={-60} />
        <Sprig id={id} x={250} y={120} len={150} rot={70} n={6} />
        <Bud id={id} x={268} y={44} r={14} rot={40} />
        <Bud id={id} x={42} y={232} r={12} rot={-120} />
        <Bloom id={id} x={150} y={150} r={74} seed={seed + 1} rot={10} />
        <Bloom id={id} x={246} y={196} r={46} seed={seed + 2} rot={-30} tone="c" />
        <Bloom id={id} x={88} y={70} r={40} seed={seed + 3} rot={50} tone="b" />
        <Blossom id={id} x={214} y={94} r={18} rot={20} centre={p.art.deep} />
        <Blossom id={id} x={60} y={160} r={14} rot={-10} centre={p.art.deep} />
      </g>
      <Breath x={200} y={250} len={70} colour={p.art.petals[2]} rot={40} seed={seed + 5} />
      <Breath x={290} y={150} len={60} colour={p.art.petals[2]} rot={80} seed={seed + 6} />
    </g>
  )
}

// ---------- Hero artwork per theme ----------

export function HeroArt({ theme }) {
  const p = theme.palette
  const ink = p.heroInk
  switch (theme.id) {
    case 'garden':
      return (
        <div className="iv-art" aria-hidden="true">
          <Art p={p} viewBox="0 0 400 380" className="art-garden-tl">
            {(id) => (
              <>
                <g opacity="0.14">
                  <PalmLine x={300} y={330} size={150} colour={ink} rot={-30} />
                </g>
                <GardenCluster id={id} p={p} seed={3} />
              </>
            )}
          </Art>
          <Art p={p} viewBox="0 0 400 380" className="art-garden-br">
            {(id) => <GardenCluster id={id} p={p} seed={9} scale={1} />}
          </Art>
        </div>
      )
    case 'champagne':
      return (
        <div className="iv-art art-champagne" aria-hidden="true">
          <Art p={p} viewBox="0 0 400 800" className="art-fill">
            {(id) => <Gerbang id={id} p={p} />}
          </Art>
        </div>
      )
    case 'songket':
      return (
        <div className="iv-art art-songket" aria-hidden="true">
          <Art p={p} viewBox="0 0 400 800" className="art-fill">
            {(id) => {
              const rand = rng(5)
              return (
                <g>
                  {Array.from({ length: 30 }, (_, i) => (
                    <BungaTabur
                      key={i}
                      id={id}
                      x={28 + (i % 5) * 86 + (Math.floor(i / 5) % 2) * 43}
                      y={150 + Math.floor(i / 5) * 96 + rand() * 2}
                      opacity={0.42}
                    />
                  ))}
                </g>
              )
            }}
          </Art>
          <Art p={p} viewBox="0 0 400 92" className="art-band top">
            {(id) => <SongketBand id={id} width={400} h={92} ground={p.heroBg} />}
          </Art>
          <Art p={p} viewBox="0 0 400 92" className="art-band bottom">
            {(id) => <SongketBand id={id} width={400} h={92} flip ground={p.heroBg} />}
          </Art>
        </div>
      )
    case 'batik':
      return (
        <div className="iv-art art-batik" aria-hidden="true">
          <Art p={p} viewBox="0 0 360 360" className="art-batik-tr">
            {(id) => (
              <g>
                <BatikLeaf id={id} x={170} y={190} len={150} rot={-140} deep={p.art.deep} />
                <BatikLeaf id={id} x={190} y={180} len={130} rot={150} deep={p.art.deep} />
                <BatikLeaf id={id} x={160} y={170} len={120} rot={-40} deep={p.art.deep} />
                <BungaRaya id={id} x={180} y={170} r={92} rot={-20} deep={p.art.deep} />
                <BungaRaya id={id} x={300} y={300} r={46} rot={30} deep={p.art.deep} />
                <BungaRaya id={id} x={70} y={70} r={34} rot={-50} deep={p.art.deep} />
              </g>
            )}
          </Art>
          <Art p={p} viewBox="0 0 360 360" className="art-batik-bl">
            {(id) => (
              <g>
                <BatikLeaf id={id} x={170} y={190} len={130} rot={20} deep={p.art.deep} />
                <BatikLeaf id={id} x={170} y={190} len={110} rot={-60} deep={p.art.deep} />
                <BungaRaya id={id} x={170} y={190} r={70} rot={10} deep={p.art.deep} />
              </g>
            )}
          </Art>
        </div>
      )
    case 'midnight':
      return (
        <div className="iv-art art-midnight" aria-hidden="true">
          <div className="art-sky" />
          <Art p={p} viewBox="0 0 400 800" className="art-fill" bake={false}>
            {(id) => {
              const rand = rng(17)
              return (
                <g>
                  {Array.from({ length: 70 }, (_, i) => (
                    <circle
                      key={i}
                      cx={rand() * 400}
                      cy={rand() * 560}
                      r={rand() * 1.3 + 0.3}
                      fill={p.foil[0]}
                      opacity={0.35 + rand() * 0.6}
                    />
                  ))}
                  <Moon id={id} x={310} y={110} r={34} />
                </g>
              )
            }}
          </Art>
          <Art p={p} viewBox="0 0 400 300" className="art-midnight-blooms">
            {(id) => (
              <g>
                <g filter={`url(#${id}-wc)`}>
                  <Leaf id={id} x={80} y={300} len={170} rot={-30} />
                  <Leaf id={id} x={320} y={300} len={170} rot={30} alt />
                  <Leaf id={id} x={200} y={300} len={150} rot={-8} />
                  <Sprig id={id} x={40} y={300} len={180} rot={-20} />
                  <Sprig id={id} x={360} y={300} len={180} rot={20} />
                  <Bloom id={id} x={120} y={220} r={58} seed={31} />
                  <Bloom id={id} x={280} y={230} r={50} seed={32} tone="b" />
                  <Bloom id={id} x={200} y={260} r={40} seed={33} tone="c" />
                </g>
                <Breath x={200} y={300} len={120} colour={p.foil[0]} seed={34} />
              </g>
            )}
          </Art>
        </div>
      )
    default:
      return (
        <div className="iv-art art-minimal" aria-hidden="true">
          <div className="art-frame thin" />
          <Art p={p} viewBox="0 0 200 320" className="art-sprig tl">
            {() => <FineSprig ink={p.accent} paper={p.heroBg} />}
          </Art>
          <Art p={p} viewBox="0 0 200 320" className="art-sprig br">
            {() => <FineBouquet ink={p.accent} paper={p.heroBg} />}
          </Art>
        </div>
      )
  }
}

// ---------- Section corners ----------

export function SectionArt({ theme, side = 'right' }) {
  const p = theme.palette
  const cls = `iv-section-art ${side}`
  switch (theme.id) {
    case 'garden':
      return (
        <div className={cls} aria-hidden="true">
          <Art p={p} viewBox="0 0 220 220" className="corner-art">
            {(id) => (
              <>
                <g opacity="0.16">
                  <PalmLine x={110} y={200} size={120} colour={p.ink} rot={side === 'right' ? -20 : 20} />
                </g>
                <g filter={`url(#${id}-wc)`}>
                  <Leaf id={id} x={110} y={110} len={90} rot={-130} />
                  <Leaf id={id} x={110} y={110} len={80} rot={160} alt />
                  <Sprig id={id} x={110} y={110} len={100} rot={-60} n={5} />
                  <Bloom id={id} x={110} y={110} r={34} seed={side === 'right' ? 41 : 42} />
                  <Blossom id={id} x={150} y={70} r={12} centre={p.art.deep} />
                </g>
              </>
            )}
          </Art>
        </div>
      )
    case 'champagne':
      return (
        <div className={cls} aria-hidden="true">
          <Art p={p} viewBox="0 0 160 160" className="corner-art small">
            {(id) => <UkirSudut id={id} p={p} />}
          </Art>
        </div>
      )
    case 'songket':
      return null
    case 'batik':
      return (
        <div className={cls} aria-hidden="true">
          <Art p={p} viewBox="0 0 220 220" className="corner-art">
            {(id) => (
              <g opacity="0.85">
                <BatikLeaf id={id} x={110} y={120} len={90} rot={-120} deep={p.art.deep} />
                <BungaRaya id={id} x={110} y={110} r={44} rot={15} deep={p.art.deep} />
              </g>
            )}
          </Art>
        </div>
      )
    case 'midnight':
      return (
        <div className={cls} aria-hidden="true">
          <Art p={p} viewBox="0 0 220 220" className="corner-art">
            {(id) => (
              <g>
                <g filter={`url(#${id}-wc)`}>
                  <Leaf id={id} x={110} y={120} len={90} rot={-120} />
                  <Sprig id={id} x={110} y={120} len={100} rot={-50} n={5} />
                  <Bloom id={id} x={110} y={110} r={32} seed={51} />
                </g>
                <Breath x={110} y={120} len={70} colour={p.foil[0]} rot={-40} seed={52} />
              </g>
            )}
          </Art>
        </div>
      )
    default: {
      // Sprays alternate down the page so they never stack where two sections meet: the hero ends with a
      // bouquet bottom-right, so each section opens with a sprig hanging top-left and may close with a bouquet
      // rising bottom-right.
      const rise = side === 'right'
      return (
        <div className={`iv-section-art ${rise ? 'rise-right' : 'hang-left'}`} aria-hidden="true">
          <Art p={p} viewBox="0 0 200 320" className="corner-art">
            {() =>
              rise ? (
                <FineBouquet ink={p.accent} paper={p.bg} seed={11} />
              ) : (
                <FineSprig ink={p.accent} paper={p.bg} seed={9} mirror />
              )
            }
          </Art>
        </div>
      )
    }
  }
}

// A wide band of artwork behind the programme card.
export function BandArt({ theme }) {
  const p = theme.palette
  if (theme.id === 'songket') {
    return (
      <div className="iv-art art-songket" aria-hidden="true">
        <Art p={p} viewBox="0 0 400 92" className="art-band top">
          {(id) => <SongketBand id={id} width={400} h={92} ground={p.heroBg} />}
        </Art>
        <Art p={p} viewBox="0 0 400 92" className="art-band bottom">
          {(id) => <SongketBand id={id} width={400} h={92} flip ground={p.heroBg} />}
        </Art>
      </div>
    )
  }
  if (theme.id === 'minimal' || theme.id === 'champagne') {
    return (
      <div className="iv-art" aria-hidden="true">
        <SectionArt theme={theme} side="left" />
        <SectionArt theme={theme} side="right" />
      </div>
    )
  }
  return (
    <div className="iv-art" aria-hidden="true">
      <div className="band-left">
        <HeroCluster theme={theme} seed={61} />
      </div>
      <div className="band-right">
        <HeroCluster theme={theme} seed={71} />
      </div>
    </div>
  )
}

function HeroCluster({ theme, seed }) {
  const p = theme.palette
  if (theme.id === 'batik') {
    return (
      <Art p={p} viewBox="0 0 220 220" className="corner-art">
        {(id) => (
          <g>
            <BatikLeaf id={id} x={110} y={120} len={110} rot={-140} deep={p.art.deep} />
            <BatikLeaf id={id} x={110} y={120} len={100} rot={40} deep={p.art.deep} />
            <BungaRaya id={id} x={110} y={110} r={58} rot={seed} deep={p.art.deep} />
          </g>
        )}
      </Art>
    )
  }
  return (
    <Art p={p} viewBox="0 0 400 380">
      {(id) => <GardenCluster id={id} p={p} seed={seed} />}
    </Art>
  )
}

// ---------- Dividers ----------

export function Divider({ theme }) {
  const p = theme.palette
  return (
    <Art p={p} viewBox="0 0 200 30" className="iv-divider" bake={false}>
      {(id) => {
        switch (theme.id) {
          case 'champagne':
            return <UkirDivider id={id} p={p} />
          case 'songket':
            return (
              <g>
                <path d="M10 15h70M120 15h70" stroke={`url(#${id}-foil)`} strokeWidth="1" />
                {[86, 100, 114].map((x, i) => (
                  <path
                    key={x}
                    d={`M${x} ${15 - (i === 1 ? 8 : 5)}l${i === 1 ? 8 : 5} ${i === 1 ? 8 : 5}l${-(i === 1 ? 8 : 5)} ${i === 1 ? 8 : 5}l${-(i === 1 ? 8 : 5)} ${-(i === 1 ? 8 : 5)}z`}
                    fill={`url(#${id}-foil)`}
                  />
                ))}
              </g>
            )
          case 'batik':
            return (
              <g>
                <path d="M20 15h60M120 15h60" stroke={p.accent} strokeWidth="1" />
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse key={a} cx="100" cy="9" rx="3" ry="6" transform={`rotate(${a} 100 15)`} fill={p.accent} />
                ))}
                {[30, 45, 155, 170].map((x) => (
                  <circle key={x} cx={x} cy="15" r="1.6" fill={p.accent} />
                ))}
              </g>
            )
          case 'midnight':
            return (
              <g>
                <path d="M20 15h66M114 15h66" stroke={`url(#${id}-foil)`} strokeWidth="1" />
                <path d="M100 3l2.6 9.4L112 15l-9.4 2.6L100 27l-2.6-9.4L88 15l9.4-2.6z" fill={`url(#${id}-foil)`} />
              </g>
            )
          case 'minimal':
            return <FineTwig ink={p.accent} paper={p.bg} />
          default:
            return (
              <g>
                <path d="M20 15h62M118 15h62" stroke={p.accent} strokeWidth="0.9" opacity="0.7" />
                <g filter={`url(#${id}-wc)`}>
                  <Leaf id={id} x={100} y={17} len={14} rot={-60} />
                  <Leaf id={id} x={100} y={17} len={14} rot={60} alt />
                  <Blossom id={id} x={100} y={14} r={6} centre={p.art.deep} />
                </g>
              </g>
            )
        }
      }}
    </Art>
  )
}

// ---------- Seal ----------

// The round seal face: theme colour, a little artwork, the initials split by a fine line, and BUKA / OPEN
// curved along the bottom.
export function SealFace({ theme, initials, label }) {
  const p = theme.palette
  const bg = isDark(p.heroBg) ? p.heroBg : p.accent
  const ink = isDark(bg) ? '#fbf7ee' : p.ink
  const [a = '', b = ''] = initials
  return (
    <Art p={p} viewBox="0 0 200 200" className="seal-face" bake={false}>
      {(id) => (
        <>
          <clipPath id={`${id}-clip`}>
            <circle cx="100" cy="100" r="99" />
          </clipPath>
          <g clipPath={`url(#${id}-clip)`}>
            <circle cx="100" cy="100" r="100" fill={bg} />
            <radialGradient id={`${id}-sheen`} cx="30%" cy="22%" r="80%">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
              <stop offset="0.6" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            {theme.id === 'garden' || theme.id === 'midnight' ? (
              <>
                <g transform="translate(-40 -46) scale(0.42)" filter={`url(#${id}-wc)`}>
                  <GardenCluster id={id} p={p} seed={81} />
                </g>
                <g transform="translate(240 246) rotate(180) scale(0.36)" filter={`url(#${id}-wc)`}>
                  <GardenCluster id={id} p={p} seed={83} />
                </g>
              </>
            ) : null}
            {theme.id === 'batik' && (
              <g transform="translate(150 40) scale(0.5)">
                <BungaRaya id={id} x={0} y={0} r={60} rot={20} deep={p.art.deep} />
              </g>
            )}
            {theme.id === 'songket' &&
              Array.from({ length: 24 }, (_, i) => (
                <path
                  key={i}
                  d="M100 10l4 6-4 6-4-6z"
                  transform={`rotate(${i * 15} 100 100)`}
                  fill={`url(#${id}-foil)`}
                />
              ))}
            <circle cx="100" cy="100" r="100" fill={`url(#${id}-sheen)`} />
          </g>
          <circle
            cx="100"
            cy="100"
            r="91"
            fill="none"
            stroke={`url(#${id}-foil)`}
            strokeWidth={theme.id === 'champagne' ? 2 : 1.2}
            opacity="0.9"
          />
          {theme.id === 'champagne' && (
            <>
              <circle cx="100" cy="100" r="86" fill="none" stroke={`url(#${id}-foil)`} strokeWidth="0.6" />
              <UkirDefs id={id} p={p} />
              <Cengkih id={id} x={100} y={46} r={10} line={p.foil[2]} />
            </>
          )}
          <text x="72" y="114" textAnchor="middle" className="seal-letter" fill={ink}>
            {a}
          </text>
          <text x="128" y="114" textAnchor="middle" className="seal-letter" fill={ink}>
            {b}
          </text>
          <path d="M100 70v62" stroke={ink} strokeWidth="1" opacity="0.8" />
          <path id={`${id}-arc`} d="M44 118a56 56 0 0 0 112 0" fill="none" />
          <text className="seal-label" fill={ink}>
            <textPath href={`#${id}-arc`} startOffset="50%" textAnchor="middle">
              {label}
            </textPath>
          </text>
        </>
      )}
    </Art>
  )
}
