// Seating chart: tables per event, and which attending guest sits at which table.
// Saved shape: { tables: [{ id, event, name, shape, seats, x, y }], assign: { [event]: { [guestId]: tableId } } }
import { goingTo, headcount } from './guests.js'

export const SHAPES = [
  { id: 'round', label: 'Round table', seats: 10 },
  { id: 'long', label: 'Long banquet table', seats: 12 },
  { id: 'vip', label: 'VIP table', seats: 8 },
]
export const SHAPE_BY_ID = Object.fromEntries(SHAPES.map((s) => [s.id, s]))

// The floor plan is drawn in a fixed 1000 × 680 space and scaled to fit the screen.
export const FLOOR = { width: 1000, height: 680 }

// Table size on the floor plan, from its shape and number of seats.
export function tableSize(table) {
  const n = table.seats
  if (table.shape === 'round') {
    const r = 34 + n * 1.6
    return { w: r * 2, h: r * 2, r }
  }
  if (table.shape === 'vip') return { w: Math.max(150, n * 30), h: 42 }
  return { w: Math.max(120, Math.ceil(n / 2) * 30), h: 46 }
}

// Where each seat dot goes, relative to the table's centre.
export function seatPositions(table) {
  const n = table.seats
  const { w, h, r } = tableSize(table)
  if (table.shape === 'round') {
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2
      return { x: Math.cos(a) * (r + 13), y: Math.sin(a) * (r + 13) }
    })
  }
  if (table.shape === 'vip') {
    // Seats on one side only, facing the pelamin.
    return Array.from({ length: n }, (_, i) => ({ x: -w / 2 + (w / n) * (i + 0.5), y: h / 2 + 13 }))
  }
  const top = Math.ceil(n / 2)
  const bottom = n - top
  return [
    ...Array.from({ length: top }, (_, i) => ({ x: -w / 2 + (w / top) * (i + 0.5), y: -h / 2 - 13 })),
    ...Array.from({ length: bottom }, (_, i) => ({ x: -w / 2 + (w / bottom) * (i + 0.5), y: h / 2 + 13 })),
  ]
}

// The space a table takes on the floor, seats included, plus a gap around it.
function footprint(table, x, y) {
  const { w, h } = tableSize(table)
  const pad = 34
  return { left: x - w / 2 - pad, right: x + w / 2 + pad, top: y - h / 2 - pad, bottom: y + h / 2 + pad }
}

const overlaps = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom

// The first free spot for a new table, scanning rows below the pelamin from left to right.
// Falls back to the centre if the floor is full (the couple can then drag it).
export function findSpot(table, others) {
  const { w, h } = tableSize(table)
  const taken = others.map((t) => footprint(t, t.x, t.y))
  for (let y = 140 + h / 2 + 20; y <= FLOOR.height - h / 2 - 20; y += 20) {
    for (let x = w / 2 + 40; x <= FLOOR.width - w / 2 - 40; x += 20) {
      const box = footprint(table, x, y)
      if (!taken.some((t) => overlaps(box, t))) return { x, y }
    }
  }
  return { x: FLOOR.width / 2, y: FLOOR.height / 2 }
}

// Guests attending a given event.
export const attendingAt = (guests, eventId) => guests.filter((g) => goingTo(g, eventId))

// Everything the page needs for one event.
export function seatingFor(seating, guests, eventId) {
  const tables = seating.tables.filter((t) => t.event === eventId)
  const tableIds = new Set(tables.map((t) => t.id))
  const attending = attendingAt(guests, eventId)
  const assign = seating.assign[eventId] ?? {}

  // Ignore assignments to tables that no longer exist, or guests who are no longer attending.
  const seatedAt = (g) => (tableIds.has(assign[g.id]) ? assign[g.id] : null)
  const byTable = Object.fromEntries(tables.map((t) => [t.id, attending.filter((g) => seatedAt(g) === t.id)]))
  const used = Object.fromEntries(tables.map((t) => [t.id, byTable[t.id].reduce((n, g) => n + headcount(g), 0)]))
  const unassigned = attending.filter((g) => !seatedAt(g))

  return {
    tables,
    byTable,
    used,
    unassigned,
    seats: tables.reduce((n, t) => n + t.seats, 0),
    seatedPeople: attending.filter(seatedAt).reduce((n, g) => n + headcount(g), 0),
    attendingPeople: attending.reduce((n, g) => n + headcount(g), 0),
    unassignedPeople: unassigned.reduce((n, g) => n + headcount(g), 0),
  }
}

// Unseated people across the events that have at least one table (events with free seating are left out).
export function unassignedTotal(seating, guests, eventIds) {
  return eventIds
    .filter((e) => seating.tables.some((t) => t.event === e))
    .reduce((n, e) => n + seatingFor(seating, guests, e).unassignedPeople, 0)
}
