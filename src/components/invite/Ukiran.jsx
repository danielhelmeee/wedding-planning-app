// Gold Malay ornament for the Awan Larat Gold theme, after two traditional crafts: awan larat (the scrolling
// vine of Malay woodcarving, whose tendrils end in tight spirals, with leaves, buds and bunga cengkih) and
// telepuk (gold leaf stamped on cloth as small scattered flowers). Original drawings; everything is filled
// with the palette's gold foil and slightly raised, like gilded carving.
import { rng } from './artUtils.js'
import { curlingVine, f, point, ribbon, stem } from './artGeom.js'

const foil = (id) => `url(#${id}-foil)`

// Shared definitions: the raised look (a soft shadow under the gold) and a centred highlight for petals, which
// stays even when a petal is rotated. Put once inside each SVG that uses this ornament.
export function UkirDefs({ id, p }) {
  const [f1, f2, f3] = p.foil
  return (
    <>
      <filter id={`${id}-raise`} x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="0.8" stdDeviation="0.6" floodColor={p.art.deep} floodOpacity="0.35" />
      </filter>
      <radialGradient id={`${id}-boss`} cx="50%" cy="55%" r="60%">
        <stop offset="0" stopColor={f1} />
        <stop offset="0.6" stopColor={f2} />
        <stop offset="1" stopColor={f3} />
      </radialGradient>
    </>
  )
}

// A leaf of the vine: a curved blade, pointing up from (0, 0), with a carved midrib.
function Daun({ id, x, y, angle, len, curl, line }) {
  const w = len * 0.38
  const d =
    `M0 0C${f(w)} ${f(-len * 0.2)} ${f(w * 0.9 + curl * 0.5)} ${f(-len * 0.7)} ${f(curl)} ${f(-len)}` +
    `C${f(-w * 0.35 + curl * 0.6)} ${f(-len * 0.72)} ${f(-w * 0.8)} ${f(-len * 0.3)} 0 0Z`
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(angle)})`}>
      <path d={d} fill={foil(id)} stroke={line} strokeWidth="0.35" />
      <path
        d={`M0 -1Q${f(w * 0.25 + curl * 0.2)} ${f(-len * 0.5)} ${f(curl * 0.85)} ${f(-len * 0.88)}`}
        fill="none"
        stroke={line}
        strokeWidth="0.45"
        opacity="0.7"
      />
    </g>
  )
}

// Bunga cengkih (clove flower): four rounded petals, four small points between them and a ringed centre.
export function Cengkih({ id, x, y, r, rot = 45, line }) {
  const petal = `M0 0C${f(r * 0.62)} ${f(-r * 0.22)} ${f(r * 0.6)} ${f(-r * 0.92)} 0 ${f(-r)}C${f(-r * 0.6)} ${f(-r * 0.92)} ${f(-r * 0.62)} ${f(-r * 0.22)} 0 0Z`
  const point4 = `M0 0L${f(r * 0.14)} ${f(-r * 0.32)}L0 ${f(-r * 0.62)}L${f(-r * 0.14)} ${f(-r * 0.32)}Z`
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${rot})`}>
      {[0, 90, 180, 270].map((a) => (
        <g key={a}>
          <path d={petal} transform={`rotate(${a})`} fill={`url(#${id}-boss)`} stroke={line} strokeWidth="0.35" />
          <path
            d={`M0 ${f(-r * 0.3)}L0 ${f(-r * 0.72)}`}
            transform={`rotate(${a})`}
            stroke={line}
            strokeWidth="0.4"
            opacity="0.6"
          />
          <path d={point4} transform={`rotate(${a + 45})`} fill={foil(id)} stroke={line} strokeWidth="0.3" />
        </g>
      ))}
      <circle r={f(r * 0.24)} fill={foil(id)} stroke={line} strokeWidth="0.5" />
      <circle r={f(r * 0.08)} fill={line} />
    </g>
  )
}

// Kudup: a closed bud on the end of a stalk, pointing along `angle`.
function Kudup({ id, x, y, angle, size, line }) {
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(angle)})`}>
      <path
        d={`M0 ${f(-size * 0.2)}C${f(size * 0.5)} ${f(-size * 0.55)} ${f(size * 0.32)} ${f(-size * 1.3)} 0 ${f(-size * 1.6)}C${f(-size * 0.32)} ${f(-size * 1.3)} ${f(-size * 0.5)} ${f(-size * 0.55)} 0 ${f(-size * 0.2)}Z`}
        fill={foil(id)}
        stroke={line}
        strokeWidth="0.35"
      />
      <path
        d={`M${f(-size * 0.45)} ${f(-size * 0.2)}Q${f(-size * 0.4)} ${f(-size * 0.62)} 0 ${f(-size * 0.7)}Q${f(size * 0.4)} ${f(-size * 0.62)} ${f(size * 0.45)} ${f(-size * 0.2)}Q0 ${f(-size * 0.36)} ${f(-size * 0.45)} ${f(-size * 0.2)}Z`}
        fill={foil(id)}
        stroke={line}
        strokeWidth="0.35"
      />
    </g>
  )
}

// One spray of awan larat, growing up from (0, 0): a main vine that bows to the right and rolls into a spiral,
// with side tendrils that curl outwards, a leaf at each fork and, optionally, a bud and a bunga cengkih.
// `forks` lists where side tendrils leave the main vine (0-1 along it) and which side they go (+1 right).
export function Sulur({
  id,
  line,
  len = 120,
  bend = 0.3,
  forks = [
    [0.2, -1],
    [0.38, 1],
    [0.56, -1],
    [0.74, 1],
  ],
  flower = true,
  bud = true,
  width = 3,
}) {
  const c = stem(0, 0, 0, len, bend)
  const main = curlingVine(c, len * 0.15, -1, 1.15)
  const tip = main[main.length - 1]
  return (
    <g>
      <path d={ribbon(main, width, width * 0.28)} fill={foil(id)} stroke={line} strokeWidth="0.3" />
      <circle cx={f(tip.x)} cy={f(tip.y)} r={f(width * 0.42)} fill={foil(id)} />
      {forks.map(([t, side], i) => {
        const p = point(c, t)
        const bl = len * (0.5 - t * 0.22)
        const bc = stem(p.x, p.y, p.angle + side * 52, bl, side * 0.26)
        const pts = curlingVine(bc, bl * 0.3, side, 1.05)
        const end = pts[pts.length - 1]
        const mid = point(bc, 0.55)
        return (
          <g key={i}>
            <path d={ribbon(pts, width * 0.7, width * 0.22)} fill={foil(id)} stroke={line} strokeWidth="0.3" />
            <circle cx={f(end.x)} cy={f(end.y)} r={f(width * 0.32)} fill={foil(id)} />
            <Daun
              id={id}
              x={p.x}
              y={p.y}
              angle={p.angle - side * 42}
              len={len * 0.22}
              curl={-side * len * 0.03}
              line={line}
            />
            {bud && i === 1 && (
              <Kudup id={id} x={mid.x} y={mid.y} angle={mid.angle + side * 70} size={len * 0.06} line={line} />
            )}
          </g>
        )
      })}
      {flower &&
        (() => {
          const p = point(c, 0.62)
          const sc = stem(p.x, p.y, p.angle + 50, len * 0.16, 0.1)
          const e = point(sc, 1)
          return (
            <g>
              <path
                d={ribbon(
                  [0, 0.5, 1].map((t) => point(sc, t)),
                  width * 0.6,
                  width * 0.4,
                )}
                fill={foil(id)}
              />
              <Cengkih id={id} x={e.x} y={e.y} r={len * 0.075} rot={e.angle + 45} line={line} />
            </g>
          )
        })()}
    </g>
  )
}

// Telepuk: small gold flowers stamped across the cloth in a half-drop grid. `skip(x, y)` leaves gaps.
export function Telepuk({ id, line, w, h, gap = 54, r = 6, opacity = 0.24, skip = () => false }) {
  const marks = []
  for (let row = 0; row * gap * 0.5 < h + gap; row++) {
    for (let col = 0; col * gap < w + gap; col++) {
      const x = col * gap + (row % 2 ? gap / 2 : 0)
      const y = row * gap * 0.5
      if (!skip(x, y)) marks.push([x, y])
    }
  }
  return (
    <g opacity={opacity}>
      {marks.map(([x, y]) => (
        <Cengkih key={`${x}-${y}`} id={id} x={x} y={y} r={r} rot={0} line={line} />
      ))}
    </g>
  )
}

// The pointed Malay arch (gerbang) framing the cover, 400 × 800, with a crown of awan larat at its peak.
export function Gerbang({ id, p }) {
  const line = p.foil[2]
  const outer =
    'M24 800L24 340C24 230 136 212 170 164C187 140 196 120 200 94C204 120 213 140 230 164C264 212 376 230 376 340L376 800'
  const inner =
    'M35 800L35 344C35 242 144 224 178 176C191 156 198 138 200 118C202 138 209 156 222 176C256 224 365 242 365 344L365 800'
  // Outside the arch (telepuk goes there only).
  const inside = (x, y) => {
    if (x < 14 || x > 386) return false
    if (y > 340) return true
    const dx = Math.abs(x - 200)
    // A rough outline of the arch's upper part, padded so flowers keep clear of its lines.
    const top = 94 + (dx / 176) ** 1.6 * 250
    return y > top - 14
  }
  const rand = rng(17)
  return (
    <g>
      <UkirDefs id={id} p={p} />
      <Telepuk id={id} line={line} w={400} h={800} skip={(x, y) => inside(x, y) || rand() < 0.04} />
      <g filter={`url(#${id}-raise)`}>
        <path d={outer} fill="none" stroke={foil(id)} strokeWidth="2.4" />
        <path d={inner} fill="none" stroke={foil(id)} strokeWidth="0.9" />
        {/* Crown: a bunga cengkih with a bud above and a spray rolling down each shoulder. */}
        <g transform="translate(193 102) rotate(-104)">
          <Sulur id={id} line={line} len={124} bend={0.34} width={3} />
        </g>
        <g transform="translate(207 102) scale(-1 1) rotate(-104)">
          <Sulur id={id} line={line} len={124} bend={0.34} width={3} />
        </g>
        <Kudup id={id} x={200} y={74} angle={0} size={10} line={line} />
        <Cengkih id={id} x={200} y={86} r={12} line={line} />
      </g>
    </g>
  )
}

// A carved corner, 160 × 160: a bunga cengkih in the corner with awan larat running along both edges.
export function UkirSudut({ id, p }) {
  const line = p.foil[2]
  const forks = [
    [0.34, 1],
    [0.66, -1],
  ]
  return (
    <g>
      <UkirDefs id={id} p={p} />
      <g filter={`url(#${id}-raise)`}>
        <g transform="translate(26 18) rotate(90)">
          <Sulur id={id} line={line} len={118} bend={0.22} forks={forks} flower={false} width={2.4} />
        </g>
        <g transform="translate(18 26) rotate(180) scale(-1 1)">
          <Sulur id={id} line={line} len={118} bend={0.22} forks={forks} flower={false} bud={false} width={2.4} />
        </g>
        <Cengkih id={id} x={18} y={18} r={13} line={line} />
      </g>
    </g>
  )
}

// The section divider, 200 × 30: a bunga cengkih with a short scrolling vine to each side.
export function UkirDivider({ id, p }) {
  const line = p.foil[2]
  const forks = [[0.5, -1]]
  return (
    <g>
      <UkirDefs id={id} p={p} />
      <g filter={`url(#${id}-raise)`}>
        <g transform="translate(89 16) rotate(-90)">
          <Sulur id={id} line={line} len={62} bend={-0.22} forks={forks} flower={false} bud={false} width={1.6} />
        </g>
        <g transform="translate(111 16) scale(-1 1) rotate(-90)">
          <Sulur id={id} line={line} len={62} bend={-0.22} forks={forks} flower={false} bud={false} width={1.6} />
        </g>
        <Cengkih id={id} x={100} y={15} r={8.5} line={line} />
      </g>
    </g>
  )
}
