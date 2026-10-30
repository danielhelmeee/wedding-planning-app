// Curve helpers shared by the line artwork (fine-line botanicals, awan larat).

export const rad = (deg) => (deg * Math.PI) / 180
export const f = (n) => Math.round(n * 100) / 100

// A stem as a cubic curve: starts at (x, y), heads `angle` degrees from straight up, `len` long, bowing
// sideways by `bend` (a fraction of its length; positive bows right).
export function stem(x, y, angle, len, bend) {
  const dx = Math.sin(rad(angle))
  const dy = -Math.cos(rad(angle))
  const px = -dy
  const py = dx
  const at = (a, b) => [x + dx * len * a + px * len * b, y + dy * len * a + py * len * b]
  return [[x, y], at(0.34, bend * 0.4), at(0.7, bend * 0.62), at(1, bend * 0.4)]
}

export function point([p0, p1, p2, p3], t) {
  const u = 1 - t
  const pos = [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k])
  const d = [0, 1].map((k) => 3 * u * u * (p1[k] - p0[k]) + 6 * u * t * (p2[k] - p1[k]) + 3 * t * t * (p3[k] - p2[k]))
  // Direction as degrees from straight up, to match `stem`.
  return { x: pos[0], y: pos[1], angle: (Math.atan2(d[0], -d[1]) * 180) / Math.PI }
}

// A filled outline that tapers from w0 to w1 along the curve, like a pen stroke easing off.
export function taper(c, w0, w1) {
  const n = 30
  const left = []
  const right = []
  for (let i = 0; i <= n; i++) {
    const t = i / n
    const { x, y, angle } = point(c, t)
    const w = (w0 + (w1 - w0) * t) / 2
    const nx = Math.cos(rad(angle))
    const ny = Math.sin(rad(angle))
    left.push(`${f(x + nx * w)} ${f(y + ny * w)}`)
    right.push(`${f(x - nx * w)} ${f(y - ny * w)}`)
  }
  return `M${left.join('L')}L${right.reverse().join('L')}Z`
}

// A filled outline that tapers from w0 to w1 along a list of points (each { x, y }).
export function ribbon(pts, w0, w1) {
  const n = pts.length - 1
  const left = []
  const right = []
  for (let i = 0; i <= n; i++) {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(n, i + 1)]
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
    const nx = -(b.y - a.y) / len
    const ny = (b.x - a.x) / len
    const w = (w0 + (w1 - w0) * (i / n)) / 2
    left.push(`${f(pts[i].x + nx * w)} ${f(pts[i].y + ny * w)}`)
    right.push(`${f(pts[i].x - nx * w)} ${f(pts[i].y - ny * w)}`)
  }
  return `M${left.join('L')}L${right.reverse().join('L')}Z`
}

// A curve that ends in a spiral curl: the cubic `stem`, then a tightening spiral that carries on in the same
// direction and turns towards `side` (+1 right, -1 left of the direction of travel). Returns points.
export function curlingVine(c, curlR, side, turns = 0.85) {
  const pts = []
  for (let i = 0; i <= 24; i++) pts.push(point(c, i / 24))
  const end = pts[pts.length - 1]
  const a = rad(end.angle)
  const dir = [Math.sin(a), -Math.cos(a)]
  // The spiral's centre sits to the chosen side of the stem's end.
  const cx = end.x + Math.cos(a) * curlR * side
  const cy = end.y + Math.sin(a) * curlR * side
  const phi0 = Math.atan2(end.y - cy, end.x - cx)
  // Turn the way that continues the stem's direction.
  const sigma = -Math.sin(phi0) * dir[0] + Math.cos(phi0) * dir[1] >= 0 ? 1 : -1
  const T = turns * 2 * Math.PI
  const k = Math.log(1 / 0.16) / T
  for (let i = 1; i <= 40; i++) {
    const th = (T * i) / 40
    const r = curlR * Math.exp(-k * th)
    pts.push({ x: cx + r * Math.cos(phi0 + sigma * th), y: cy + r * Math.sin(phi0 + sigma * th) })
  }
  return pts
}
