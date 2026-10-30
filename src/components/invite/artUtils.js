// Helpers shared by the e-invite artwork.

// A small deterministic random generator, so artwork looks hand-placed but never changes between renders.
export function rng(seed) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

// Paper grain as a CSS background (an SVG noise tile), for sections and gates.
export const paperGrain = (dark) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${dark ? 1 : 0}  0 0 0 0 ${dark ? 1 : 0}  0 0 0 0 ${dark ? 1 : 0}  0 0 0 ${dark ? 0.07 : 0.09} 0'/></filter><rect width='220' height='220' filter='url(#n)'/></svg>`,
  )}")`

// True for dark colours (used to pick light or dark ink on artwork).
export function isDark(hex) {
  const n = hex.replace('#', '')
  if (n.length !== 6) return false
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.45
}
