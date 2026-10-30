// Builds the checklist from the suggested template, the couple's own tasks, settings and vendors.
import { CHECKLIST_TEMPLATE } from './data/checklistTemplate.js'
import { CATEGORY_BY_ID } from './data/categories.js'
import { EVENT_BY_ID } from './data/events.js'
import { BOOKED_STAGES } from './data/stages.js'
import { daysRemaining, enabledEvents } from './figures.js'
import { addDays } from './dates.js'
import { unassignedTotal } from './seating.js'
import { procedureAuto } from './procedure.js'

function firstEventDate(settings) {
  return enabledEvents(settings)
    .map((e) => settings.events[e.id].date)
    .filter(Boolean)
    .sort()[0]
}

// Why an automatic task counts as done, or null.
function autoDone(task, settings, vendors, guests, seating, invite, procedure) {
  if (task.auto?.startsWith('procedure-')) return procedureAuto(task.auto.slice(10), procedure)
  if (task.auto === 'booked') {
    const booked = vendors.find((v) => v.category === task.category && BOOKED_STAGES.includes(v.stage))
    return booked ? `${booked.name} is booked` : null
  }
  if (task.auto === 'invite') {
    const named = invite?.bride.trim() && invite?.groom.trim() && !/^sample /i.test(invite.bride)
    const venue = invite && Object.values(invite.events).some((e) => e.show && e.venue.trim())
    return named && venue ? 'Names and a venue are filled in' : null
  }
  if (task.auto === 'seating') {
    const withTables = enabledEvents(settings).filter((e) => seating.tables.some((t) => t.event === e.id))
    if (!withTables.length) return null
    return unassignedTotal(seating, guests, withTables.map((e) => e.id)) === 0 ? 'Everyone attending has a seat' : null
  }
  if (task.auto === 'guests') return guests.length ? `${guests.length} guests on the list` : null
  if (task.auto === 'budget') return settings.totalBudget > 0 ? 'Budget is set' : null
  if (task.auto === 'dates') {
    const on = enabledEvents(settings)
    return on.length && on.every((e) => settings.events[e.id].date) ? 'All event dates are set' : null
  }
  return null
}

// Every task that applies right now, with its due date and done state.
export function buildChecklist(
  settings,
  vendors,
  checklist,
  guests = [],
  seating = { tables: [], assign: {} },
  invite = null,
  procedure = null,
) {
  const hidden = new Set(settings.hiddenCategories)
  const on = new Set(enabledEvents(settings).map((e) => e.id))
  const first = firstEventDate(settings)
  const done = new Set(checklist.done ?? [])

  const suggested = CHECKLIST_TEMPLATE.filter(
    (t) => !(t.category && hidden.has(t.category)) && (t.event === 'first' || on.has(t.event)),
  ).map((t) => {
    const base = t.event === 'first' ? first : settings.events[t.event].date
    const autoReason = t.auto ? autoDone(t, settings, vendors, guests, seating, invite, procedure) : null
    const suggestedDate = base ? addDays(base, -t.days) : ''
    const moved = checklist.dates?.[t.id]
    return {
      ...t,
      dueDate: moved || suggestedDate,
      suggestedDate,
      moved: Boolean(moved),
      undatedHint: base || moved
        ? ''
        : t.event === 'first'
          ? 'Set an event date to schedule this'
          : `Set the ${EVENT_BY_ID[t.event].label} date to schedule this`,
      done: Boolean(autoReason) || done.has(t.id),
      autoReason,
      custom: false,
    }
  })

  const custom = (checklist.custom ?? [])
    .filter((t) => !(t.category && hidden.has(t.category)))
    .map((t) => ({ ...t, group: 'Your tasks', custom: true, autoReason: null, undatedHint: '' }))

  return [...suggested, ...custom].map((t) => ({
    ...t,
    categoryLabel: t.category ? CATEGORY_BY_ID[t.category]?.label : '',
    daysLeft: t.dueDate ? daysRemaining(t.dueDate) : null,
  }))
}

const monthFormat = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' })

// Open tasks in time buckets, then done tasks. Each bucket is sorted by due date.
export function groupChecklist(items) {
  const open = items.filter((t) => !t.done).sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
  const groups = []
  const push = (label, list, tone) => list.length && groups.push({ label, items: list, tone })

  push('Catch up', open.filter((t) => t.daysLeft !== null && t.daysLeft < 0), 'overdue')
  push('Next 30 days', open.filter((t) => t.daysLeft !== null && t.daysLeft >= 0 && t.daysLeft <= 30))

  const later = open.filter((t) => t.daysLeft !== null && t.daysLeft > 30)
  const months = new Map()
  for (const t of later) {
    const [y, m] = t.dueDate.split('-').map(Number)
    const label = monthFormat.format(new Date(y, m - 1, 1))
    months.set(label, [...(months.get(label) ?? []), t])
  }
  for (const [label, list] of months) push(label, list)

  push('No date yet', open.filter((t) => t.daysLeft === null))
  return { groups, done: items.filter((t) => t.done) }
}

export function checklistSummary(items) {
  const done = items.filter((t) => t.done).length
  const overdue = items.filter((t) => !t.done && t.daysLeft !== null && t.daysLeft < 0).length
  return { total: items.length, done, overdue }
}
