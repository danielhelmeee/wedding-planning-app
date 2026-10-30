// Everything that happens on a date: event days, vendor payments due, and checklist tasks.
import { CATEGORY_BY_ID } from './data/categories.js'
import { enabledEvents, formatRM, isOverdue } from './figures.js'

// Returns a Map of "YYYY-MM-DD" → items, each day ordered events → payments → tasks.
export function calendarItems(settings, visibleVendors, tasks) {
  const byDay = new Map()
  const add = (date, item) => byDay.set(date, [...(byDay.get(date) ?? []), item])

  for (const e of enabledEvents(settings)) {
    const date = settings.events[e.id].date
    if (date) add(date, { kind: 'event', key: `event-${e.id}`, title: e.label })
  }

  for (const v of visibleVendors) {
    if (!v.dueDate || ['final', 'completed'].includes(v.stage)) continue
    add(v.dueDate, {
      kind: 'payment',
      key: `pay-${v.id}`,
      title: `Pay ${v.name}`,
      vendor: v,
      detail: `${CATEGORY_BY_ID[v.category].label} · ${formatRM(Math.max(0, v.estimatedCost - v.amountPaid))} still to pay`,
      overdue: isOverdue(v),
    })
  }

  for (const t of tasks) {
    if (t.dueDate) add(t.dueDate, { kind: 'task', key: `task-${t.id}`, title: t.title, task: t })
  }

  const order = { event: 0, payment: 1, task: 2 }
  for (const list of byDay.values()) list.sort((a, b) => order[a.kind] - order[b.kind])
  return byDay
}

// Items in [from, to] inclusive, as [date, items] pairs in date order.
export function itemsBetween(byDay, from, to) {
  return [...byDay.entries()].filter(([d]) => d >= from && d <= to).sort(([a], [b]) => a.localeCompare(b))
}
