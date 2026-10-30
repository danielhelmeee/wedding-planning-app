// Calendar-date helpers. Dates are plain "YYYY-MM-DD" strings in local time.
const pad = (n) => String(n).padStart(2, '0')

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const todayISO = () => toISO(new Date())

export function addDays(iso, n) {
  const d = fromISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

// First day of the month `n` months away.
export function addMonths(iso, n) {
  const d = fromISO(iso)
  return toISO(new Date(d.getFullYear(), d.getMonth() + n, 1))
}

// Weeks start on Monday.
export function startOfWeek(iso) {
  const day = (fromISO(iso).getDay() + 6) % 7
  return addDays(iso, -day)
}

export const sameMonth = (a, b) => a.slice(0, 7) === b.slice(0, 7)

// The days shown on a month grid: whole weeks from the Monday before the 1st.
export function monthGrid(iso) {
  const first = `${iso.slice(0, 7)}-01`
  const start = startOfWeek(first)
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i))
  return sameMonth(days[35], first) ? days : days.slice(0, 35)
}

export const weekDays = (iso) => Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(iso), i))

const fmt = (options) => new Intl.DateTimeFormat('en-GB', options)
export const monthLabel = (iso) => fmt({ month: 'long', year: 'numeric' }).format(fromISO(iso))
export const dayLabel = (iso) => fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(fromISO(iso))
export const shortDayLabel = (iso) => fmt({ weekday: 'short', day: 'numeric', month: 'short' }).format(fromISO(iso))

export function weekLabel(iso) {
  const days = weekDays(iso)
  const a = fromISO(days[0])
  const b = fromISO(days[6])
  const sameM = a.getMonth() === b.getMonth()
  const left = fmt(sameM ? { day: 'numeric' } : { day: 'numeric', month: 'short' }).format(a)
  return `${left} – ${fmt({ day: 'numeric', month: 'short', year: 'numeric' }).format(b)}`
}
