// Budget per category: planned amounts set by the couple against what is committed. Figures only.
import { BOOKED_STAGES } from './data/stages.js'
import { committed, paidSoFar } from './figures.js'

// One row per category: planned, committed (booked vendors), the lowest quote among vendors not booked yet, paid.
export function budgetRows(visible, settings, categories) {
  const plans = settings.categoryBudgets ?? {}
  return categories.map((c) => {
    const list = visible.filter((v) => v.category === c.id)
    const quotes = list.filter((v) => !BOOKED_STAGES.includes(v.stage) && v.estimatedCost > 0).map((v) => v.estimatedCost)
    const planned = plans[c.id] ?? 0
    const used = committed(list)
    return {
      ...c,
      vendors: list.length,
      planned,
      committed: used,
      paid: paidSoFar(list),
      lowestQuote: quotes.length ? Math.min(...quotes) : null,
      // Positive = left within the plan, negative = over it; null when there is no plan.
      left: planned ? planned - used : null,
    }
  })
}

export function budgetTotals(rows, totalBudget) {
  const planned = rows.reduce((n, r) => n + r.planned, 0)
  return {
    planned,
    committed: rows.reduce((n, r) => n + r.committed, 0),
    paid: rows.reduce((n, r) => n + r.paid, 0),
    plannedCount: rows.filter((r) => r.planned).length,
    unallocated: totalBudget - planned,
  }
}
