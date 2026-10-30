import { useEffect, useState } from 'react'
import VendorForm from './VendorForm.jsx'
import { CATEGORY_BY_ID } from '../data/categories.js'
import { EVENT_BY_ID, EVENT_IDS } from '../data/events.js'
import { STAGES, STAGE_BY_ID } from '../data/stages.js'
import { contactLinks } from '../vendorLinks.js'
import { formatDate, formatRM, isOverdue, stageProgress } from '../figures.js'
import { smooth } from '../motion.js'

// One vendor row: stage select, inline edit, delete.
const PAID = ['final', 'completed']

export default function VendorCard({ vendor, color, categories, events, showCategory, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [celebrate, setCelebrate] = useState(null) // time the shimmer started, or null
  useEffect(() => {
    if (!celebrate) return
    const t = setTimeout(() => setCelebrate(null), 1700)
    return () => clearTimeout(t)
  }, [celebrate])
  const category = CATEGORY_BY_ID[vendor.category]
  const stage = STAGE_BY_ID[vendor.stage]
  const { step, total, left } = stageProgress(vendor.stage)
  const done = vendor.stage === 'completed'
  const selectId = `stage-${vendor.id}`
  const overdue = isOverdue(vendor)
  const links = contactLinks(vendor)
  const eventNames = EVENT_IDS.filter((e) => vendor.events.includes(e)).map((e) => EVENT_BY_ID[e].label)

  if (editing) {
    return (
      <li className="vendor-row">
        <VendorForm
          categories={categories}
          events={events}
          vendor={vendor}
          onSubmit={(values) => {
            onUpdate(vendor.id, values)
            smooth(() => setEditing(false))
          }}
          onCancel={() => smooth(() => setEditing(false))}
        />
      </li>
    )
  }

  function handleDelete() {
    onDelete(vendor.id)
  }

  return (
    <li className={`vendor-row${done ? ' is-done' : ''}${celebrate ? ' is-celebrating' : ''}`}>
      <div className="row-main">
        <span className="row-mark" style={{ background: color }} aria-hidden="true" />
        <div className="row-names">
          <p className="row-name">{vendor.name}</p>
          <p className="row-category">
            {[showCategory && category.label, eventNames.join(' · ') || 'No event picked'].filter(Boolean).join(' · ')}
          </p>
        </div>
        <p className="row-amount">{formatRM(vendor.estimatedCost)}</p>
      </div>

      <div className="row-progress">
        <div className="step-bar" aria-hidden="true">
          <span className="step-bar-fill" style={{ width: `${(step / total) * 100}%` }} />
        </div>
        <p className="row-meta">
          <span className="stage-text">
            <span className={`stage-mark tone-${stage.tone}`} aria-hidden="true" />
            {stage.label} · {step} of {total}
          </span>
          <span className="row-left">{done ? 'Completed' : `${left} left`}</span>
          <span className="row-paid">{formatRM(vendor.amountPaid)} paid</span>
          {vendor.dueDate && (
            <span className={overdue ? 'row-overdue' : undefined}>
              {overdue ? 'Overdue since' : 'Payment due'} {formatDate(vendor.dueDate)}
            </span>
          )}
        </p>
        {(vendor.contactName || links.length > 0) && (
          <p className="row-details">
            {vendor.contactName && <span>{vendor.contactName}</span>}
            {links.map((l) =>
              l.href ? (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              ) : (
                <span key={l.label}>{l.label}</span>
              ),
            )}
          </p>
        )}
        {vendor.notes && <p className="row-notes">{vendor.notes}</p>}
      </div>

      <div className="row-controls">
        <label className="row-select-label" htmlFor={selectId}>
          Stage<span className="visually-hidden"> for {vendor.name}</span>
        </label>
        <select
          id={selectId}
          value={vendor.stage}
          onChange={(e) => {
            const next = e.target.value
            // Reaching Final Balance Paid (or Completed) gets a brief golden shimmer.
            if (!PAID.includes(vendor.stage) && PAID.includes(next)) setCelebrate(Date.now())
            onUpdate(vendor.id, { stage: next })
          }}
        >
          {STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <button type="button" className="btn-text" onClick={() => smooth(() => setEditing(true))}>
          Edit<span className="visually-hidden"> {vendor.name}</span>
        </button>
        <button type="button" className="btn-text btn-delete" onClick={handleDelete}>
          Delete<span className="visually-hidden"> {vendor.name}</span>
        </button>
      </div>
    </li>
  )
}
