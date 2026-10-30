// Fine-line botanicals for the Minimal Editorial theme: tapered hairline stems, slender outlined leaves with a
// midrib, small solid leaflets, jasmine (melati) flowers and buds, and seed sprays. Everything is drawn in one
// ink colour on the paper, like a pen drawing.
import { rng } from './artUtils.js'
import { f, point, stem, taper } from './artGeom.js'

// A slender leaf pointing up from (0, 0); `curl` moves the tip sideways so it is never stiffly straight.
const leafShape = (len, w, curl) =>
  `M0 0C${f(w)} ${f(-len * 0.26)} ${f(w * 0.72 + curl * 0.6)} ${f(-len * 0.72)} ${f(curl)} ${f(-len)}` +
  `C${f(-w * 0.72 + curl * 0.6)} ${f(-len * 0.72)} ${f(-w)} ${f(-len * 0.26)} 0 0Z`

function Leaf({ x, y, angle, len, curl = 0, solid, veins = true, ink, paper }) {
  const w = len * (solid ? 0.2 : 0.14)
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(angle)})`}>
      <path d={`M0 0L0 ${f(-len * 0.08)}`} stroke={ink} strokeWidth="0.8" />
      <g transform={`translate(0 ${f(-len * 0.08)})`}>
        {solid ? (
          <>
            <path d={leafShape(len, w, curl)} fill={ink} />
            <path
              d={`M0 0Q${f(curl * 0.3)} ${f(-len * 0.5)} ${f(curl * 0.85)} ${f(-len * 0.86)}`}
              fill="none"
              stroke={paper}
              strokeWidth="0.45"
            />
          </>
        ) : (
          <>
            <path d={leafShape(len, w, curl)} fill={paper} stroke={ink} strokeWidth="0.85" strokeLinejoin="round" />
            <path
              d={`M0 1Q${f(curl * 0.3)} ${f(-len * 0.5)} ${f(curl * 0.88)} ${f(-len * 0.9)}`}
              fill="none"
              stroke={ink}
              strokeWidth="0.6"
            />
            {veins &&
              [0.3, 0.46, 0.62].map((t) => {
                const mx = curl * 0.3 * t * 2 * (1 - t) + curl * 0.88 * t * t
                return (
                  <path
                    key={t}
                    d={`M${f(mx)} ${f(-len * t)}l${f(-w * 0.62)} ${f(-len * 0.1)}M${f(mx)} ${f(-len * t)}l${f(w * 0.62)} ${f(-len * 0.1)}`}
                    fill="none"
                    stroke={ink}
                    strokeWidth="0.45"
                  />
                )
              })}
          </>
        )}
      </g>
    </g>
  )
}

// Jasmine: five pointed petals, open, with a small eye.
function Jasmine({ x, y, r, rot = 0, ink, paper }) {
  const petal = `M0 0C${f(r * 0.34)} ${f(-r * 0.3)} ${f(r * 0.3)} ${f(-r * 0.86)} 0 ${f(-r)}C${f(-r * 0.3)} ${f(-r * 0.86)} ${f(-r * 0.34)} ${f(-r * 0.3)} 0 0Z`
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d={petal} fill={paper} stroke={ink} strokeWidth="0.8" strokeLinejoin="round" />
          <path d={`M0 ${f(-r * 0.2)}L0 ${f(-r * 0.6)}`} stroke={ink} strokeWidth="0.4" />
        </g>
      ))}
      <circle r={f(r * 0.16)} fill={ink} />
    </g>
  )
}

// A closed jasmine bud on a short stalk.
function Bud({ x, y, angle, size, ink, paper }) {
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(angle)})`}>
      <path d={`M0 0L0 ${f(-size * 0.7)}`} stroke={ink} strokeWidth="0.7" />
      <path
        d={`M0 ${f(-size * 0.62)}C${f(size * 0.32)} ${f(-size * 0.9)} ${f(size * 0.26)} ${f(-size * 1.6)} 0 ${f(-size * 1.9)}C${f(-size * 0.26)} ${f(-size * 1.6)} ${f(-size * 0.32)} ${f(-size * 0.9)} 0 ${f(-size * 0.62)}Z`}
        fill={paper}
        stroke={ink}
        strokeWidth="0.8"
      />
      <path
        d={`M${f(-size * 0.2)} ${f(-size * 0.7)}L0 ${f(-size * 0.95)}L${f(size * 0.2)} ${f(-size * 0.7)}`}
        fill="none"
        stroke={ink}
        strokeWidth="0.6"
      />
    </g>
  )
}

// Leaves along a stem, alternating sides, shrinking towards the tip.
function leavesAlong(c, { from = 0.18, to = 0.88, count, len, spread = 42, solid, paired, ink, paper, rand, veins }) {
  const out = []
  for (let i = 0; i < count; i++) {
    const t = from + ((to - from) * i) / Math.max(1, count - 1)
    const { x, y, angle } = point(c, t)
    // Largest a little above the base, smaller near the ground and towards the tip.
    const u = (t - from) / (to - from || 1)
    const size = len * (1 - 0.55 * u) * (0.72 + 0.28 * Math.min(1, u / 0.25)) * (0.88 + rand() * 0.24)
    const sides = paired ? [-1, 1] : [i % 2 ? 1 : -1]
    for (const side of sides) {
      out.push(
        <Leaf
          key={`${i}${side}`}
          x={x}
          y={y}
          angle={angle + side * (spread + rand() * 12)}
          len={size}
          curl={side * size * (0.08 + rand() * 0.08)}
          solid={solid}
          veins={veins}
          ink={ink}
          paper={paper}
        />,
      )
    }
  }
  return out
}

// A fine stem that ends in a spray of seed heads (tiny rings on hair-thin stalks).
function SeedSpray({ c, ink, rand }) {
  const twigs = []
  for (const t of [0.42, 0.56, 0.7, 0.82, 0.93]) {
    const { x, y, angle } = point(c, t)
    const side = twigs.length % 2 ? 1 : -1
    const tc = stem(x, y, angle + side * (28 + rand() * 16), 10 + rand() * 9, side * 0.15)
    const end = point(tc, 1)
    twigs.push(
      <g key={t}>
        <path d={taper(tc, 0.6, 0.25)} fill={ink} />
        <circle cx={f(end.x)} cy={f(end.y)} r="1.7" fill="none" stroke={ink} strokeWidth="0.6" />
        <circle cx={f(end.x)} cy={f(end.y)} r="0.55" fill={ink} />
      </g>,
    )
  }
  const tip = point(c, 1)
  return (
    <g>
      <path d={taper(c, 1, 0.3)} fill={ink} />
      {twigs}
      <circle cx={f(tip.x)} cy={f(tip.y)} r="2" fill="none" stroke={ink} strokeWidth="0.6" />
      <circle cx={f(tip.x)} cy={f(tip.y)} r="0.6" fill={ink} />
    </g>
  )
}

// A loose bunch of wild stems: a tall leafy stem with a jasmine bud, a fern-like stem of small solid leaflets,
// a jasmine flower, grass blades and a seed spray, all rising from one point. Drawn upright in a 200 × 320 box.
export function FineBouquet({ ink, paper, seed = 7, mirror = false }) {
  const rand = rng(seed)
  const bx = 100
  const by = 316
  const main = stem(bx, by, -6, 270, 0.16)
  const fern = stem(bx + 1, by, 20, 205, -0.22)
  const flower = stem(bx - 1, by, -30, 170, 0.28)
  const blades = [stem(bx, by, -18, 230, 0.34), stem(bx + 1, by, 10, 200, -0.32), stem(bx, by, 34, 140, 0.24)]
  const seeds = stem(bx, by, -43, 125, 0.2)
  const mainTip = point(main, 1)
  const flowerTip = point(flower, 1)
  const flowerMid = point(flower, 0.8)
  return (
    <g transform={mirror ? 'translate(200 0) scale(-1 1)' : undefined}>
      {blades.map((c, i) => (
        <path key={i} d={taper(c, 1.6, 0)} fill={ink} />
      ))}
      <SeedSpray c={seeds} ink={ink} rand={rand} />
      <path d={taper(fern, 1.3, 0.3)} fill={ink} />
      {leavesAlong(fern, {
        from: 0.2,
        to: 0.96,
        count: 9,
        len: 17,
        spread: 52,
        solid: true,
        paired: true,
        ink,
        paper,
        rand,
      })}
      <path d={taper(flower, 1.2, 0.4)} fill={ink} />
      {leavesAlong(flower, { from: 0.3, to: 0.7, count: 2, len: 30, spread: 40, ink, paper, rand, veins: false })}
      <Bud x={flowerMid.x} y={flowerMid.y} angle={flowerMid.angle + 34} size={7} ink={ink} paper={paper} />
      <Jasmine x={flowerTip.x} y={flowerTip.y} r={11} rot={rand() * 40} ink={ink} paper={paper} />
      <path d={taper(main, 1.8, 0.4)} fill={ink} />
      {leavesAlong(main, { from: 0.24, to: 0.88, count: 7, len: 50, spread: 34, ink, paper, rand })}
      <Bud x={mainTip.x} y={mainTip.y} angle={mainTip.angle} size={8} ink={ink} paper={paper} />
      <Bud x={mainTip.x} y={mainTip.y} angle={mainTip.angle - 38} size={6} ink={ink} paper={paper} />
    </g>
  )
}

// A single arching sprig, lighter than the bouquet: one leafy stem, a side stem of solid leaflets and a seed
// spray. Drawn upright in a 200 × 320 box.
export function FineSprig({ ink, paper, seed = 3, mirror = false }) {
  const rand = rng(seed)
  const main = stem(96, 316, 4, 285, -0.24)
  const side = stem(97, 316, -24, 185, -0.06)
  const seeds = stem(98, 316, 18, 170, 0.18)
  const tip = point(main, 1)
  return (
    <g transform={mirror ? 'translate(200 0) scale(-1 1)' : undefined}>
      <path d={taper(stem(96, 316, -10, 200, -0.14), 1.4, 0)} fill={ink} />
      <SeedSpray c={seeds} ink={ink} rand={rand} />
      <path d={taper(side, 1.1, 0.3)} fill={ink} />
      {leavesAlong(side, {
        from: 0.24,
        to: 0.97,
        count: 8,
        len: 14,
        spread: 50,
        solid: true,
        paired: true,
        ink,
        paper,
        rand,
      })}
      <path d={taper(main, 1.7, 0.35)} fill={ink} />
      {leavesAlong(main, { from: 0.2, to: 0.9, count: 8, len: 46, spread: 36, ink, paper, rand })}
      <Bud x={tip.x} y={tip.y} angle={tip.angle} size={7} ink={ink} paper={paper} />
    </g>
  )
}

// The section divider: a small jasmine with a leafy twig reaching out to each side, then hairlines.
export function FineTwig({ ink, paper }) {
  const rand = rng(5)
  const twigs = [stem(93, 15.5, -90, 30, -0.12), stem(107, 15.5, 90, 30, 0.12)]
  return (
    <g>
      <path d="M14 15.5h48M138 15.5h48" stroke={ink} strokeWidth="0.6" />
      {twigs.map((c, i) => {
        const tip = point(c, 1)
        return (
          <g key={i}>
            <path d={taper(c, 0.9, 0.3)} fill={ink} />
            {leavesAlong(c, {
              from: 0.3,
              to: 0.88,
              count: 3,
              len: 7,
              spread: 46,
              solid: true,
              paired: true,
              ink,
              paper,
              rand,
            })}
            <circle cx={f(tip.x)} cy={f(tip.y)} r="1.4" fill="none" stroke={ink} strokeWidth="0.55" />
          </g>
        )
      })}
      <Jasmine x={100} y={15.5} r={6} rot={-8} ink={ink} paper={paper} />
    </g>
  )
}
