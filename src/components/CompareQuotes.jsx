import { useId } from 'react'
import { contactLinks } from '../vendorLinks.js'
import { EVENT_BY_ID } from '../data/events.js'
import { BOOKED_STAGES, STAGES, STAGE_BY_ID } from '../data/stages.js'
import { formatDate, formatRM } from '../figures.js'

// Vendors in one category side by side, so quotes are easy to weigh up. Figures only.
export default function CompareQuotes({ vendors, planned, colors, onUpdate }) {
  const id = useId()
  const quoted = vendors.filter((v) => v.estimatedCost > 0)
  const lowest = quoted.length > 1 ? Math.min(...quoted.map((v) => v.estimatedCost)) : null
  const rows = [
    {
      label: 'Stage',
      cell: (v) => (
        <>
          <label className="visually-hidden" htmlFor={`${id}-${v.id}`}>
            Stage for {v.name}
          </label>
          <select id={`${id}-${v.id}`} value={v.stage} onChange={(e) => onUpdate(v.id, { stage: e.target.value })}>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </>
      ),
    },
    {
      label: 'Quote',
      cell: (v) =>
        v.estimatedCost ? (
          <span className="compare-quote">
            {formatRM(v.estimatedCost)}
            {v.estimatedCost === lowest && <span className="compare-tag">Lowest</span>}
          </span>
        ) : (
          <span className="muted">No quote yet</span>
        ),
    },
    planned > 0 && {
      label: 'Against your plan',
      cell: (v) => {
        if (!v.estimatedCost) return <span className="muted">–</span>
        const diff = planned - v.estimatedCost
        return (
          <span className={diff < 0 ? 'compare-over' : 'compare-under'}>
            {diff < 0 ? `${formatRM(-diff)} over` : `${formatRM(diff)} under`}
          </span>
        )
      },
    },
    { label: 'Paid', cell: (v) => (v.amountPaid ? formatRM(v.amountPaid) : '–') },
    { label: 'Payment due', cell: (v) => (v.dueDate ? formatDate(v.dueDate) : '–') },
    { label: 'Events', cell: (v) => v.events.map((e) => EVENT_BY_ID[e]?.label).join(', ') || '–' },
    {
      label: 'Contact',
      cell: (v) => {
        const links = contactLinks(v)
        return (
          <span className="compare-links">
            {v.contactName && <span>{v.contactName}</span>}
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
            {!v.contactName && !links.length && '–'}
          </span>
        )
      },
    },
    { label: 'Notes', cell: (v) => v.notes || '–' },
  ].filter(Boolean)

  return (
    <>
      <p className="compare-hint">Swipe sideways to see all {vendors.length} vendors.</p>
      <div className="compare-wrap">
        <table className="compare">
          <caption className="visually-hidden">Vendors compared side by side</caption>
          <thead>
            <tr>
              <th scope="col" className="compare-corner">
                {planned > 0 && (
                  <span>
                    Planned
                    <strong>{formatRM(planned)}</strong>
                  </span>
                )}
              </th>
              {vendors.map((v) => (
                <th key={v.id} scope="col" className={BOOKED_STAGES.includes(v.stage) ? 'is-booked' : undefined}>
                  <span className="dot" style={{ background: colors[v.category] }} aria-hidden="true" /> {v.name}
                  {BOOKED_STAGES.includes(v.stage) && (
                    <span className="compare-booked">{STAGE_BY_ID[v.stage].label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                {vendors.map((v) => (
                  <td key={v.id}>{r.cell(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
