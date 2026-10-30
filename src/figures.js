// Every number on the page is worked out here. Figures only: sums, counts, what is left.
import { CATEGORIES, PALETTE } from './data/categories.js'
import { EVENTS } from './data/events.js'
import { BOOKED_STAGES, STAGE_BY_ID, TOTAL_STEPS } from './data/stages.js'

const rmFormat = new Intl.NumberFormat('en-MY', { maximumFractionDigits: 0 })

export function formatRM(amount) {
  const sign = amount < 0 ? '−' : ''
  return `${sign}RM ${rmFormat.format(Math.abs(Math.round(amount)))}`
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

// "2027-01-15" → "15 Jan 2027"
export function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return dateFormat.format(new Date(y, m - 1, d))
}

// A payment is overdue when its due date has passed and the final balance is not yet paid.
export function isOverdue(vendor, today = new Date()) {
  if (!vendor.dueDate || ['final', 'completed'].includes(vendor.stage)) return false
  return daysRemaining(vendor.dueDate, today) < 0
}

// Only plain web links are shown as links; "www.example.my" gets https:// added.
export function safeLink(url) {
  if (!url) return null
  if (/^https?:\/\//i.test(url)) return url
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(url)) return `https://${url}`
  return null
}

export function enabledEvents(settings) {
  return EVENTS.filter((e) => settings.events[e.id]?.on)
}

// A vendor shows when its category is on and at least one of its events is on
// (a vendor with no events ticked still shows, under "All").
export function visibleVendors(vendors, settings) {
  const hidden = new Set(settings.hiddenCategories)
  const on = new Set(enabledEvents(settings).map((e) => e.id))
  return vendors.filter(
    (v) => !hidden.has(v.category) && (v.events.length === 0 || v.events.some((e) => on.has(e))),
  )
}

const isBooked = (v) => BOOKED_STAGES.includes(v.stage)

export function committed(vendors) {
  return vendors.filter(isBooked).reduce((sum, v) => sum + v.estimatedCost, 0)
}

export function paidSoFar(vendors) {
  return vendors.reduce((sum, v) => sum + v.amountPaid, 0)
}

export function bookedCount(vendors) {
  return vendors.filter(isBooked).length
}

// Whole days from today to a date; null when no date is set.
export function daysRemaining(isoDate, today = new Date()) {
  if (!isoDate) return null
  const [y, m, d] = isoDate.split('-').map(Number)
  const wedding = new Date(y, m - 1, d)
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((wedding - start) / 86400000)
}

// Colour per category, handed out in category order to the categories that have vendors,
// so the first five on screen never share a colour.
export function categoryColors(vendors) {
  const used = CATEGORIES.filter((c) => vendors.some((v) => v.category === c.id))
  return Object.fromEntries(used.map((c, i) => [c.id, PALETTE[i % PALETTE.length]]))
}

// Committed amount per enabled category, in category order, for the hero bar.
export function categoryShares(vendors, colors) {
  return CATEGORIES.map((c) => ({
    ...c,
    color: colors[c.id],
    amount: committed(vendors.filter((v) => v.category === c.id)),
  })).filter((c) => c.amount > 0)
}

export function stageProgress(stageId) {
  const step = STAGE_BY_ID[stageId].step
  return { step, total: TOTAL_STEPS, left: TOTAL_STEPS - step }
}

// The next event that is on and dated: { event, days }. If every dated event has passed,
// the latest one with negative days. null when no event has a date.
export function nextEvent(settings, today = new Date()) {
  const dated = enabledEvents(settings)
    .map((event) => ({ event, days: daysRemaining(settings.events[event.id].date, today) }))
    .filter((x) => x.days !== null)
  if (!dated.length) return null
  const upcoming = dated.filter((x) => x.days >= 0).sort((a, b) => a.days - b.days)
  return upcoming[0] ?? dated.sort((a, b) => b.days - a.days)[0]
}

// Whole percent, or null when the total is 0.
export function percent(part, total) {
  return total > 0 ? Math.round((part / total) * 100) : null
}

// Per event: vendors serving it, how many are booked, and their committed cost.
// A vendor shared by several events counts in each, so these do not add up to the total.
export function eventSummaries(visible, settings) {
  return enabledEvents(settings).map((event) => {
    const list = visible.filter((v) => v.events.includes(event.id))
    return {
      ...event,
      date: settings.events[event.id].date,
      count: list.length,
      booked: bookedCount(list),
      committed: committed(list),
    }
  })
}

// Per enabled category: vendor count, booked count, committed cost.
export function categoryStats(visible, settings) {
  const hidden = new Set(settings.hiddenCategories)
  return CATEGORIES.filter((c) => !hidden.has(c.id)).map((c) => {
    const list = visible.filter((v) => v.category === c.id)
    return { ...c, count: list.length, booked: bookedCount(list), committed: committed(list) }
  })
}

// Payments not yet settled, soonest due first.
export function upcomingPayments(visible, limit = 5) {
  return visible
    .filter((v) => v.dueDate && !['final', 'completed'].includes(v.stage))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, limit)
}

export function summarise(vendors, settings) {
  const visible = visibleVendors(vendors, settings)
  const committedTotal = committed(visible)
  const colors = categoryColors(visible)
  const booked = bookedCount(visible)
  return {
    visible,
    committed: committedTotal,
    left: settings.totalBudget - committedTotal,
    paid: paidSoFar(visible),
    booked,
    budgetUsedPct: percent(committedTotal, settings.totalBudget),
    bookedPct: percent(booked, visible.length),
    next: nextEvent(settings),
    colors,
    shares: categoryShares(visible, colors),
  }
}

export function daysText(next) {
  if (!next) return null
  const { event, days } = next
  if (days < 0) return `${event.label} has passed`
  if (days === 0) return `${event.label} is today`
  return `${days} ${days === 1 ? 'day' : 'days'} to ${event.label}`
}
