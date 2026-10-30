import { formatRM } from '../figures.js'
import CountUp from './CountUp.jsx'

// Hero: what is left in the budget, and each category's share of what is committed.
export default function StatsBar({ summary, totalBudget, planned = 0 }) {
  const { committed, left, booked, visible, shares } = summary
  // Shares are of the total budget; if committed is over budget, scale to committed instead.
  const scale = Math.max(totalBudget, committed) || 1

  return (
    <section className="hero surface" aria-labelledby="hero-label">
      <p id="hero-label" className="hero-label">
        Left in budget
      </p>
      <p className="hero-figure"><CountUp value={left} format={formatRM} /></p>
      <p className="hero-line">
        {totalBudget > 0 ? (
          <>
            {formatRM(committed)} committed of {formatRM(totalBudget)}
          </>
        ) : (
          <>
            {formatRM(committed)} committed · <a href="#/settings">Set your total budget</a>
          </>
        )}
        {' · '}
        {visible.length ? `${booked} of ${visible.length} vendors booked` : 'no vendors yet'}
      </p>

      <div className="stack-bar" role="img" aria-label="Committed budget by category">
        <div className="stack-bar-fill">
          {shares.map((s) => (
            <span
              key={s.id}
              className="stack-bar-segment"
              style={{ width: `${(s.amount / scale) * 100}%`, background: s.color }}
            />
          ))}
        </div>
      </div>

      <p className="hero-plan">
        {planned
          ? `${formatRM(planned)} planned by category${totalBudget ? ` · ${formatRM(Math.max(0, totalBudget - planned))} not yet planned` : ''}`
          : 'Not split by category yet'}
        {' · '}
        <a href="#/budget">Open the budget</a>
      </p>

      {shares.length > 0 && (
        <ul className="legend">
          {shares.map((s) => (
            <li key={s.id}>
              <span className="legend-mark" style={{ background: s.color }} aria-hidden="true" />
              <span className="legend-name">{s.label}</span>
              <span className="legend-amount">{formatRM(s.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
