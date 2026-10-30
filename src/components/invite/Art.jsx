import { rng } from './artUtils.js'

// Painterly artwork primitives for the e-invite, drawn in SVG with filters (watercolour edges, paper grain,
// gold foil). Original designs; colours come from the theme palette.

// Shared gradients and filters. Rendered once inside each SVG that uses them (ids are prefixed per SVG).
export function ArtDefs({ id, p }) {
  const [pa, pb, pc] = p.art.petals
  const [la, lb] = p.art.leaves
  const [f1, f2, f3, f4] = p.foil
  return (
    <defs>
      <radialGradient id={`${id}-petal-a`} cx="50%" cy="85%" r="85%">
        <stop offset="0" stopColor={pb} />
        <stop offset="0.55" stopColor={pa} />
        <stop offset="1" stopColor={pc} />
      </radialGradient>
      <radialGradient id={`${id}-petal-b`} cx="50%" cy="90%" r="90%">
        <stop offset="0" stopColor={pb} stopOpacity="0.95" />
        <stop offset="1" stopColor={pa} />
      </radialGradient>
      <radialGradient id={`${id}-petal-c`} cx="50%" cy="85%" r="85%">
        <stop offset="0" stopColor={pa} />
        <stop offset="1" stopColor={pc} />
      </radialGradient>
      <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={la} />
        <stop offset="1" stopColor={lb} />
      </linearGradient>
      <linearGradient id={`${id}-leaf-b`} x1="1" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={lb} />
        <stop offset="1" stopColor={la} />
      </linearGradient>
      <linearGradient id={`${id}-foil`} x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
        <stop offset="0" stopColor={f3} />
        <stop offset="0.3" stopColor={f2} />
        <stop offset="0.48" stopColor={f1} />
        <stop offset="0.62" stopColor={f4} />
        <stop offset="1" stopColor={f3} />
      </linearGradient>
      {/* Gold weft threads: thin horizontal threads with a darker gap, for woven (songket) motifs. */}
      <pattern id={`${id}-weft`} width="6" height="3" patternUnits="userSpaceOnUse">
        <rect width="6" height="3" fill={f3} />
        <rect y="0.3" width="6" height="1.9" fill={f2} />
        <rect y="0.5" width="6" height="0.7" fill={f1} opacity="0.85" />
      </pattern>
      <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor={f1} stopOpacity="0.55" />
        <stop offset="1" stopColor={f1} stopOpacity="0" />
      </radialGradient>

      {/* Watercolour: wobbly edges, darker pigment at the rim, paper grain inside. */}
      <filter id={`${id}-wc`} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="7" result="warp" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="warp"
          scale="6"
          xChannelSelector="R"
          yChannelSelector="G"
          result="wobbly"
        />
        <feGaussianBlur in="wobbly" stdDeviation="0.45" result="soft" />
        <feMorphology in="soft" operator="erode" radius="1.4" result="inner" />
        <feComposite in="soft" in2="inner" operator="out" result="rim" />
        <feColorMatrix
          in="rim"
          type="matrix"
          values="0.7 0 0 0 0  0 0.7 0 0 0  0 0 0.7 0 0  0 0 0 0.5 0"
          result="rimDark"
        />
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="grain" />
        <feColorMatrix in="grain" type="saturate" values="0" result="grainGrey" />
        <feComposite
          in="soft"
          in2="grainGrey"
          operator="arithmetic"
          k1="0.35"
          k2="0.78"
          k3="0"
          k4="0"
          result="textured"
        />
        <feMerge>
          <feMergeNode in="textured" />
          <feMergeNode in="rimDark" />
        </feMerge>
      </filter>

      {/* Soft halo for glowing elements (moon, lanterns). */}
      <filter id={`${id}-halo`} x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="8" />
      </filter>
    </defs>
  )
}

const petalPath = (w, h) =>
  `M0 0C${-w * 0.95} ${-h * 0.25} ${-w * 0.8} ${-h * 1.02} 0 ${-h}C${w * 0.8} ${-h * 1.02} ${w * 0.95} ${-h * 0.25} 0 0Z`

// A layered peony / garden rose: three rings of cupped petals and a curled centre.
export function Bloom({ x, y, r, id, rot = 0, seed = 1, tone = 'a' }) {
  const rand = rng(seed)
  const rings = [
    { n: 8, w: r * 0.62, h: r, o: 0.95, grad: tone },
    { n: 7, w: r * 0.5, h: r * 0.74, o: 0.95, grad: 'b' },
    { n: 6, w: r * 0.38, h: r * 0.5, o: 1, grad: 'c' },
  ]
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {rings.map((ring, ri) =>
        Array.from({ length: ring.n }, (_, i) => {
          const a = (360 / ring.n) * i + ri * 17 + rand() * 12
          const s = 0.88 + rand() * 0.24
          return (
            <path
              key={`${ri}-${i}`}
              d={petalPath(ring.w * s, ring.h * s)}
              transform={`rotate(${a})`}
              fill={`url(#${id}-petal-${ring.grad})`}
              opacity={ring.o}
              stroke={`url(#${id}-petal-b)`}
              strokeOpacity="0.35"
              strokeWidth="0.8"
            />
          )
        }),
      )}
      <path
        d={`M${-r * 0.16} 0c0 ${-r * 0.2} ${r * 0.32} ${-r * 0.2} ${r * 0.3} ${r * 0.02}c-0.02 ${r * 0.16} ${-r * 0.22} ${r * 0.16} ${-r * 0.2} ${r * 0.02}`}
        fill="none"
        stroke={`url(#${id}-petal-b)`}
        strokeWidth={r * 0.06}
        strokeLinecap="round"
        opacity="0.8"
      />
    </g>
  )
}

// A five-petal blossom (filler flower / bunga melur style).
export function Blossom({ x, y, r, id, rot = 0, tone = 'c', centre }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path
          key={a}
          d={petalPath(r * 0.6, r)}
          transform={`rotate(${a})`}
          fill={`url(#${id}-petal-${tone})`}
          opacity="0.95"
        />
      ))}
      <circle r={r * 0.2} fill={centre} opacity="0.85" />
    </g>
  )
}

// A bud on a short stem with two sepals.
export function Bud({ x, y, r, id, rot = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path
        d={`M0 ${r * 1.6}C${r * 0.1} ${r} 0 ${r * 0.6} 0 ${r * 0.2}`}
        stroke={`url(#${id}-leaf)`}
        strokeWidth="1.6"
        fill="none"
      />
      <path
        d={`M0 ${r * 0.3}C${-r * 0.75} ${-r * 0.1} ${-r * 0.35} ${-r * 1.1} 0 ${-r * 1.15}C${r * 0.35} ${-r * 1.1} ${r * 0.75} ${-r * 0.1} 0 ${r * 0.3}Z`}
        fill={`url(#${id}-petal-a)`}
      />
      <path
        d={`M0 ${r * 0.35}C${-r * 0.6} ${r * 0.1} ${-r * 0.7} ${-r * 0.35} ${-r * 0.45} ${-r * 0.55}`}
        fill="none"
        stroke={`url(#${id}-leaf-b)`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d={`M0 ${r * 0.35}C${r * 0.6} ${r * 0.1} ${r * 0.7} ${-r * 0.35} ${r * 0.45} ${-r * 0.55}`}
        fill="none"
        stroke={`url(#${id}-leaf-b)`}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </g>
  )
}

// A veined leaf. `len` long, pointing up before rotation.
export function Leaf({ x, y, len, id, rot = 0, wide = 0.32, alt = false }) {
  const w = len * wide
  const veins = [0.25, 0.42, 0.58, 0.74]
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path
        d={`M0 0C${-w} ${-len * 0.25} ${-w * 0.9} ${-len * 0.78} 0 ${-len}C${w * 0.9} ${-len * 0.78} ${w} ${-len * 0.25} 0 0Z`}
        fill={`url(#${id}-${alt ? 'leaf-b' : 'leaf'})`}
      />
      <path
        d={`M0 0Q${w * 0.08} ${-len * 0.5} 0 ${-len * 0.96}`}
        stroke="#ffffff"
        strokeOpacity="0.32"
        strokeWidth="1"
        fill="none"
      />
      {veins.map((v) => (
        <g key={v} stroke="#ffffff" strokeOpacity="0.2" strokeWidth="0.7" fill="none">
          <path d={`M0 ${-len * v}q${-w * 0.45} ${-len * 0.04} ${-w * 0.7} ${-len * 0.13}`} />
          <path d={`M0 ${-len * v}q${w * 0.45} ${-len * 0.04} ${w * 0.7} ${-len * 0.13}`} />
        </g>
      ))}
    </g>
  )
}

// A eucalyptus-style sprig: round leaves along a curved stem.
export function Sprig({ x, y, len, id, rot = 0, n = 7 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path
        d={`M0 0C${len * 0.08} ${-len * 0.35} ${-len * 0.05} ${-len * 0.7} ${len * 0.06} ${-len}`}
        stroke={`url(#${id}-leaf-b)`}
        strokeWidth="1.4"
        fill="none"
      />
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 1) / (n + 1)
        const side = i % 2 ? 1 : -1
        const r = len * (0.11 - t * 0.04)
        return (
          <ellipse
            key={i}
            cx={side * r * 1.05 + len * 0.02}
            cy={-len * t}
            rx={r}
            ry={r * 0.82}
            fill={`url(#${id}-${i % 2 ? 'leaf' : 'leaf-b'})`}
            opacity="0.9"
          />
        )
      })}
    </g>
  )
}

// Baby's-breath: tiny dots on fine stems.
export function Breath({ x, y, len, colour, rot = 0, seed = 3 }) {
  const rand = rng(seed)
  const tips = Array.from({ length: 9 }, () => [(rand() - 0.5) * len * 0.8, -len * (0.55 + rand() * 0.45)])
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity="0.9">
      {tips.map(([tx, ty], i) => (
        <g key={i}>
          <path
            d={`M0 0Q${tx * 0.3} ${ty * 0.6} ${tx} ${ty}`}
            stroke={colour}
            strokeOpacity="0.45"
            strokeWidth="0.7"
            fill="none"
          />
          <circle cx={tx} cy={ty} r={1.8 + rand() * 1.6} fill={colour} />
          <circle cx={tx + 3} cy={ty - 2} r={1.2 + rand()} fill={colour} opacity="0.8" />
        </g>
      ))}
    </g>
  )
}

// Fine line-art palm frond (used faintly behind content).
export function PalmLine({ x, y, size, colour, rot = 0 }) {
  const ribs = Array.from({ length: 13 }, (_, i) => -78 + i * 13)
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rot})`}
      stroke={colour}
      fill="none"
      strokeWidth="1"
      strokeLinecap="round"
    >
      <path d={`M0 0L0 ${size * 0.55}`} />
      {ribs.map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d={`M0 0C${size * 0.05} ${-size * 0.35} ${-size * 0.04} ${-size * 0.7} 0 ${-size}`} />
          <path d={`M0 ${-size * 0.2}L${size * 0.03} ${-size * 0.95}`} opacity="0.5" />
        </g>
      ))}
    </g>
  )
}

// Woven motifs are built from rows of "weft" (gold thread), so their edges step like real songket.
// `rows` lists, per row, one [x, width] segment or several, in cell units; each row is `ch` tall.
function Woven({ x, y, cell, ch, rows, fill }) {
  const segs = rows.flatMap((row, i) => (Array.isArray(row[0]) ? row : [row]).map(([cx, cw]) => [i, cx, cw]))
  return (
    <g transform={`translate(${x} ${y})`}>
      {segs.map(([i, cx, cw], k) =>
        cw > 0 ? <rect key={k} x={cx * cell} y={i * ch} width={cw * cell} height={ch} fill={fill} /> : null,
      )}
    </g>
  )
}

// One pucuk rebung (bamboo-shoot) motif: a stepped triangle, hollowed, with a stepped lozenge inside.
function PucukRebung({ x, y, id, ground, cell = 3, ch = 3.4, n = 13 }) {
  const rowsOuter = Array.from({ length: n }, (_, r) => [n - 1 - r, r * 2 + 1])
  const rowsHollow = Array.from({ length: n }, (_, r) =>
    r >= 4 && r <= n - 2 ? [n - 1 - r + 2, Math.max(0, (r + 1) * 2 - 5)] : [0, 0],
  )
  const mid = Math.round(n * 0.62)
  const rowsCore = Array.from({ length: n }, (_, r) => {
    const d = Math.abs(r - mid)
    return d <= 2 ? [n - 1 - (2 - d) + 0, (2 - d) * 2 + 1] : [0, 0]
  })
  return (
    <g>
      <Woven x={x} y={y} cell={cell} ch={ch} rows={rowsOuter} fill={`url(#${id}-weft)`} />
      <Woven x={x} y={y} cell={cell} ch={ch} rows={rowsHollow} fill={ground} />
      <Woven x={x} y={y} cell={cell} ch={ch} rows={rowsCore} fill={`url(#${id}-weft)`} />
    </g>
  )
}

// A small stepped lozenge (the chain between borders).
function Lozenge({ x, y, id, cell = 3, ch = 3 }) {
  const rows = [
    [2, 1],
    [1, 3],
    [0, 5],
    [1, 3],
    [2, 1],
  ]
  return <Woven x={x} y={y} cell={cell} ch={ch} rows={rows} fill={`url(#${id}-weft)`} />
}

// A songket border: gold rules, a chain of lozenges, then a row of woven pucuk rebung.
export function SongketBand({ id, width, h = 92, flip = false, ground = '#000' }) {
  const unit = 78 // one pucuk rebung (25 cells of 3) plus a gap
  // Centre the pattern: one motif (centre at x + 37.5) and one lozenge (centre at x + 7.5) sit on width / 2.
  const half = Math.ceil(width / 2 / unit) + 1
  const start = width / 2 - 37.5 - half * unit
  const count = half * 2 + 1
  const lozStart = width / 2 - 7.5 - Math.ceil(width / 2 / 26 + 1) * 26
  return (
    <g transform={flip ? `translate(0 ${h}) scale(1 -1)` : undefined}>
      <rect y="0" width={width} height="4" fill={`url(#${id}-weft)`} />
      <rect y="7" width={width} height="1.2" fill={`url(#${id}-foil)`} />
      {Array.from({ length: Math.ceil(width / 26) + 3 }, (_, i) => (
        <Lozenge key={i} x={lozStart + i * 26} y={12} id={id} />
      ))}
      <rect y="30" width={width} height="1.2" fill={`url(#${id}-foil)`} />
      <rect y="33" width={width} height="3" fill={`url(#${id}-weft)`} />
      {Array.from({ length: count }, (_, i) => (
        <PucukRebung key={i} x={start + i * unit} y={h - 13 * 3.4 - 6} id={id} ground={ground} />
      ))}
      <rect y={h - 4} width={width} height="4" fill={`url(#${id}-weft)`} />
    </g>
  )
}

// A bunga tabur (scattered flower): a stepped eight-point star woven in gold thread.
const STAR = [
  [4, 1],
  [
    [1, 1],
    [3, 3],
    [7, 1],
  ],
  [2, 5],
  [1, 7],
  [0, 9],
  [1, 7],
  [2, 5],
  [
    [1, 1],
    [3, 3],
    [7, 1],
  ],
  [4, 1],
]

export function BungaTabur({ x, y, id, opacity = 0.5, cell = 2.2 }) {
  return (
    <g transform={`translate(${x - 4.5 * cell} ${y - 4.5 * cell})`} opacity={opacity}>
      <Woven x={0} y={0} cell={cell} ch={cell} rows={STAR} fill={`url(#${id}-weft)`} />
    </g>
  )
}

// A batik-style bunga raya (hibiscus): ridged petals, long stamen, dotted fill.
export function BungaRaya({ x, y, r, id, rot = 0, deep }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path
            d={`M0 0C${-r * 0.55} ${-r * 0.15} ${-r * 0.75} ${-r * 0.85} ${-r * 0.3} ${-r}C${-r * 0.1} ${-r * 1.08} ${r * 0.1} ${-r * 0.9} ${r * 0.18} ${-r * 1.02}C${r * 0.6} ${-r * 0.95} ${r * 0.55} ${-r * 0.2} 0 0Z`}
            fill={`url(#${id}-petal-a)`}
            stroke={deep}
            strokeWidth="1.4"
          />
          {[-0.2, -0.05, 0.1].map((o) => (
            <path
              key={o}
              d={`M0 ${-r * 0.12}Q${r * o} ${-r * 0.5} ${r * o * 1.6} ${-r * 0.88}`}
              stroke={deep}
              strokeOpacity="0.55"
              strokeWidth="0.9"
              fill="none"
            />
          ))}
          {[0.35, 0.55, 0.72].map((t) => (
            <circle key={t} cx={r * 0.32} cy={-r * t} r="1.3" fill={deep} opacity="0.6" />
          ))}
        </g>
      ))}
      <path d={`M0 0Q${r * 0.25} ${-r * 0.6} ${r * 0.55} ${-r * 1.15}`} stroke={deep} strokeWidth="1.6" fill="none" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          cx={r * 0.55 + Math.cos(i * 1.3) * r * 0.08}
          cy={-r * 1.15 + Math.sin(i * 1.3) * r * 0.08}
          r="2.2"
          fill={`url(#${id}-foil)`}
        />
      ))}
      <circle r={r * 0.12} fill={deep} />
    </g>
  )
}

// A batik leaf with isen-isen (parallel line) fill.
export function BatikLeaf({ x, y, len, id, rot = 0, deep }) {
  const w = len * 0.34
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path
        d={`M0 0C${-w} ${-len * 0.25} ${-w * 0.9} ${-len * 0.78} 0 ${-len}C${w * 0.9} ${-len * 0.78} ${w} ${-len * 0.25} 0 0Z`}
        fill={`url(#${id}-leaf)`}
        stroke={deep}
        strokeWidth="1.3"
      />
      <path d={`M0 0L0 ${-len * 0.95}`} stroke={deep} strokeWidth="1" />
      {[0.18, 0.3, 0.42, 0.54, 0.66, 0.78].map((t) => (
        <g key={t} stroke={deep} strokeOpacity="0.5" strokeWidth="0.8">
          <path d={`M0 ${-len * t}l${-w * 0.6} ${-len * 0.08}`} />
          <path d={`M0 ${-len * t}l${w * 0.6} ${-len * 0.08}`} />
        </g>
      ))}
    </g>
  )
}

// A crescent moon. Its glow gently breathes (CSS), the crescent itself stays still.
export function Moon({ x, y, r, id }) {
  const crescent = `M${r * 0.2} ${-r}A${r} ${r} 0 1 0 ${r * 0.95} ${r * 0.55}A${r * 0.82} ${r * 0.82} 0 1 1 ${r * 0.2} ${-r}Z`
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r * 2.6} fill={`url(#${id}-glow)`} className="moon-glow" />
      <path d={crescent} fill={`url(#${id}-foil)`} filter={`url(#${id}-halo)`} className="moon-halo" />
      <path d={crescent} fill={`url(#${id}-foil)`} />
    </g>
  )
}
