import { useId } from 'react'
import CountUp from './CountUp.jsx'
import { budgetRows, budgetTotals } from '../budget.js'
import { formatRM } from '../figures.js'
import { hrefFor } from '../useHashRoute.js'

const toAmount = (text) => Math.max(0, Math.round(Number(String(text).replace(/[^\d.]/g, '')) || 0))

function PlannedInput({ row, onChange }) {
  const id = useId()
  return (
    <div className="field budget-planned">
      {/* Shown on phones, where the column header is hidden; read by screen readers everywhere. */}
      <label htmlFor={id} className="budget-planned-label">
        Planned (RM)<span className="visually-hidden"> for {row.label}</span>
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        placeholder="Not planned"
        value={row.planned ? row.planned.toLocaleString('en-MY') : ''}
        onChange={(e) => onChange(toAmount(e.target.value))}
      />
    </div>
  )
}

// How much of the plan is used: committed against planned, gold within it, terracotta over it.
function PlanBar({ row }) {
  if (!row.planned) return null
  const pct = Math.min(100, (row.committed / row.planned) * 100)
  return (
    <div className="budget-bar" aria-hidden="true">
      <span className={row.left < 0 ? 'is-over' : undefined} style={{ width: `${pct}%` }} />
    </div>
  )
}

function status(row) {
  if (!row.planned)
    return row.committed ? { text: `${formatRM(row.committed)} committed, no plan`, tone: 'muted' } : null
  if (row.left < 0) return { text: `${formatRM(-row.left)} over`, tone: 'over' }
  return { text: `${formatRM(row.left)} left`, tone: row.committed ? 'ok' : 'muted' }
}

export default function BudgetPage({ settings, vendors, categories, onChange }) {
  const totalId = useId()
  const rows = budgetRows(vendors, settings, categories)
  const t = budgetTotals(rows, settings.totalBudget)
  const setPlan = (id, amount) => {
    const next = { ...(settings.categoryBudgets ?? {}) }
    if (amount) next[id] = amount
    else delete next[id]
    onChange({ categoryBudgets: next })
  }

  return (
    <>
      <header className="page-head">
        <h1 className="page-title">Budget</h1>
        <p className="page-sub">
          Plan how your total splits across vendor categories, then see what you have committed against each. Figures
          only.
        </p>
      </header>

      <section className="headcounts budget-figures" aria-label="Budget figures">
        <div className="headcount">
          <label className="headcount-label" htmlFor={totalId}>
            Total budget
          </label>
          <div className="budget-total-input">
            <span aria-hidden="true">RM</span>
            <input
              id={totalId}
              type="text"
              inputMode="numeric"
              placeholder="Set a total"
              value={settings.totalBudget ? settings.totalBudget.toLocaleString('en-MY') : ''}
              onChange={(e) => onChange({ totalBudget: toAmount(e.target.value) })}
            />
          </div>
        </div>
        <div className="headcount">
          <p className="headcount-label">Planned</p>
          <p className="headcount-figure"><CountUp value={t.planned} format={formatRM} /></p>
          <p className={`headcount-sub${t.unallocated < 0 ? ' is-over' : ''}`}>
            {settings.totalBudget
              ? t.unallocated >= 0
                ? `${formatRM(t.unallocated)} not yet planned`
                : `${formatRM(-t.unallocated)} more than your total`
              : 'Set a total to compare'}
          </p>
        </div>
        <div className="headcount">
          <p className="headcount-label">Committed</p>
          <p className="headcount-figure"><CountUp value={t.committed} format={formatRM} /></p>
          <p className="headcount-sub">booked vendors</p>
        </div>
        <div className="headcount">
          <p className="headcount-label">Paid so far</p>
          <p className="headcount-figure"><CountUp value={t.paid} format={formatRM} /></p>
          <p className="headcount-sub">{formatRM(Math.max(0, t.committed - t.paid))} still to pay</p>
        </div>
      </section>

      <section className="surface list-surface" aria-labelledby="budget-cats">
        <div className="section-head">
          <h2 id="budget-cats">By category</h2>
          <p className="section-note">
            {t.plannedCount} of {rows.length} planned
          </p>
        </div>
        <div className="budget-head" aria-hidden="true">
          <span>Category</span>
          <span>Planned (RM)</span>
          <span>Committed</span>
          <span>Lowest quote</span>
          <span>Against the plan</span>
        </div>
        <ul className="budget-rows">
          {rows.map((r) => {
            const s = status(r)
            return (
              <li key={r.id} className="budget-row">
                <div className="budget-name">
                  <a href={hrefFor({ page: 'category', category: r.id })} className="row-link row-name">
                    {r.menu ?? r.label}
                  </a>
                  <span className="budget-vendors">
                    {r.vendors ? `${r.vendors} ${r.vendors === 1 ? 'vendor' : 'vendors'}` : 'No vendors yet'}
                  </span>
                </div>
                <PlannedInput row={r} onChange={(amount) => setPlan(r.id, amount)} />
                <p className="budget-num" data-label="Committed">
                  {r.committed ? formatRM(r.committed) : '–'}
                </p>
                <p className="budget-num" data-label="Lowest quote">
                  {r.lowestQuote ? formatRM(r.lowestQuote) : '–'}
                </p>
                <div className="budget-status">
                  <PlanBar row={r} />
                  {s && <p className={`budget-left is-${s.tone}`}>{s.text}</p>}
                </div>
              </li>
            )
          })}
        </ul>
        <p className="fine-print">
          Committed counts vendors at Deposit Paid or later. Lowest quote is among the vendors you have not booked yet.
          Hidden categories are left out; switch them on in <a href="#/settings">Settings</a>.
        </p>
      </section>
    </>
  )
}
