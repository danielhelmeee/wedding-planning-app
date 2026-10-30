import { useEffect, useId, useRef, useState } from 'react'
import { CATEGORIES } from '../data/categories.js'
import { EVENTS } from '../data/events.js'
import { formatDate, formatRM } from '../figures.js'
import { SAMPLE_SETTINGS } from '../data/sampleVendors.js'
import { smooth } from '../motion.js'
import BrandMark from './BrandMark.jsx'

const STEPS = ['Names', 'Events', 'Budget', 'Categories', 'Sample data']
const clean = (name) => (/^sample\s/i.test(name || '') ? '' : name || '')
// Dates and budget still holding the made-up sample values start blank.
const ownDates = (events) =>
  Object.fromEntries(
    Object.entries(events).map(([id, e]) => [
      id,
      { ...e, date: e.date === SAMPLE_SETTINGS.events[id]?.date ? '' : e.date },
    ]),
  )
const ownBudget = (n) => (n && n !== SAMPLE_SETTINGS.totalBudget ? String(n) : '')

// First-launch setup (also from Settings → "Run the setup again").
// onFinish({ mode: 'sample' }) to explore the samples, or
// onFinish({ mode: 'setup', names, settings, removeSamples }).
export default function SetupWizard({ settings, invite, samples, again = false, onFinish, onClose }) {
  const id = useId()
  const [step, setStep] = useState(again ? 1 : 0) // 0 = welcome
  const [names, setNames] = useState({ bride: clean(invite.bride), groom: clean(invite.groom) })
  const [events, setEvents] = useState(() => ownDates(settings.events))
  const [budget, setBudget] = useState(() => ownBudget(settings.totalBudget))
  const [hidden, setHidden] = useState(() => new Set(settings.hiddenCategories))
  const anySamples = samples.vendors + samples.guests + samples.gifts > 0
  const [removeSamples, setRemoveSamples] = useState(false)
  const [error, setError] = useState('')
  const heading = useRef(null)

  // Move focus to each step's heading so screen readers hear the new step.
  useEffect(() => {
    heading.current?.focus()
  }, [step])

  const setEvent = (eid, changes) => setEvents((e) => ({ ...e, [eid]: { ...e[eid], ...changes } }))
  const toggleCategory = (cid) =>
    setHidden((h) => {
      const next = new Set(h)
      if (next.has(cid)) next.delete(cid)
      else next.add(cid)
      return next
    })
  const budgetValue = Math.max(0, Math.round(Number(budget.replace(/[^\d.]/g, '')) || 0))
  const onCount = EVENTS.filter((e) => events[e.id].on).length
  const lastStep = anySamples ? 5 : 4

  function next() {
    if (step === 2 && onCount === 0) return setError('Keep at least one event switched on.')
    if (step === 4 && hidden.size === CATEGORIES.length) return setError('Keep at least one category.')
    setError('')
    if (step < lastStep) smooth(() => setStep(step + 1), 'swap')
    else finish()
  }
  function finish() {
    onFinish({
      mode: 'setup',
      names: { bride: names.bride.trim(), groom: names.groom.trim() },
      settings: { ...settings, events, totalBudget: budgetValue, hiddenCategories: [...hidden] },
      removeSamples: anySamples && removeSamples,
    })
  }

  return (
    <div className="wizard" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
      <div className="wizard-card">
        {step === 0 ? (
          <div className="wizard-welcome">
            <BrandMark size={52} className="wizard-ring" />
            <p className="wizard-brand">Welcome to Restu</p>
            <h1 id={`${id}-title`} className="wizard-title" tabIndex={-1} ref={heading}>
              Plan your wedding, your way
            </h1>
            <p className="wizard-lead">
              Vendors, budget, checklist, guests, seating, your e-invite and gifts, all in one place. Everything stays
              in this browser.
            </p>
            <p className="wizard-lead">A few questions to set it up for your wedding. It takes about a minute.</p>
            <div className="wizard-choices">
              <button type="button" className="btn-primary wizard-go" onClick={() => smooth(() => setStep(1), 'swap')}>
                Set up my wedding
              </button>
              <button type="button" className="btn-secondary" onClick={() => onFinish({ mode: 'sample' })}>
                Explore with sample data first
              </button>
            </div>
            <p className="fine-print">
              Sample names and figures are made up. You can run the setup any time from Settings.
            </p>
          </div>
        ) : (
          <>
            <div className="wizard-top">
              <p className="wizard-step">
                Step {step} of {lastStep} · {STEPS[step - 1]}
              </p>
              {again && (
                <button type="button" className="btn-text" onClick={onClose}>
                  Close
                </button>
              )}
            </div>
            <div className="wizard-progress" aria-hidden="true">
              <span style={{ width: `${(step / lastStep) * 100}%` }} />
            </div>

            {step === 1 && (
              <section className="wizard-body">
                <h1 id={`${id}-title`} className="wizard-title" tabIndex={-1} ref={heading}>
                  Who&apos;s getting married?
                </h1>
                <p className="wizard-lead">Used on your e-invite and its seal. You can leave this for later.</p>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor={`${id}-bride`}>Bride&apos;s name</label>
                    <input
                      id={`${id}-bride`}
                      type="text"
                      placeholder="e.g. Nur Aisyah"
                      value={names.bride}
                      onChange={(e) => setNames({ ...names, bride: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor={`${id}-groom`}>Groom&apos;s name</label>
                    <input
                      id={`${id}-groom`}
                      type="text"
                      placeholder="e.g. Muhammad Hakim"
                      value={names.groom}
                      onChange={(e) => setNames({ ...names, groom: e.target.value })}
                    />
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="wizard-body">
                <h1 id={`${id}-title`} className="wizard-title" tabIndex={-1} ref={heading}>
                  Which events are you holding?
                </h1>
                <p className="wizard-lead">
                  Switch off any you are not holding, for example a combined Sanding and Reception. Add the dates you
                  know; the checklist and countdown are worked out from them.
                </p>
                <div className="wizard-events">
                  {EVENTS.map((e) => {
                    const ev = events[e.id]
                    return (
                      <div key={e.id} className={`wizard-event${ev.on ? '' : ' is-off'}`}>
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={ev.on}
                            onChange={() => {
                              setEvent(e.id, { on: !ev.on })
                              setError('')
                            }}
                          />
                          <span>{e.label}</span>
                        </label>
                        <div className="field">
                          <label htmlFor={`${id}-${e.id}`}>Date</label>
                          <input
                            id={`${id}-${e.id}`}
                            type="date"
                            value={ev.date}
                            disabled={!ev.on}
                            onChange={(x) => setEvent(e.id, { date: x.target.value })}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="wizard-body">
                <h1 id={`${id}-title`} className="wizard-title" tabIndex={-1} ref={heading}>
                  What is your total budget?
                </h1>
                <p className="wizard-lead">
                  Used to show how much of it your vendors add up to. Figures only; leave it blank if you have not
                  decided.
                </p>
                <div className="field wizard-budget">
                  <label htmlFor={`${id}-budget`}>Total budget (RM)</label>
                  <input
                    id={`${id}-budget`}
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 40000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                  />
                  {budgetValue > 0 && <p className="field-hint">{formatRM(budgetValue)}</p>}
                </div>
              </section>
            )}

            {step === 4 && (
              <section className="wizard-body">
                <h1 id={`${id}-title`} className="wizard-title" tabIndex={-1} ref={heading}>
                  Which vendors will you need?
                </h1>
                <p className="wizard-lead">
                  Untick what you don&apos;t need. Each one ticked gets its own page in the menu and its own checklist
                  tasks.
                </p>
                <div className="wizard-cat-actions">
                  <button type="button" className="btn-text" onClick={() => setHidden(new Set())}>
                    Tick all
                  </button>
                  <button
                    type="button"
                    className="btn-text"
                    onClick={() => setHidden(new Set(CATEGORIES.map((c) => c.id)))}
                  >
                    Untick all
                  </button>
                  <span className="field-hint">
                    {CATEGORIES.length - hidden.size} of {CATEGORIES.length} ticked
                  </span>
                </div>
                <fieldset className="wizard-cats">
                  <legend className="visually-hidden">Vendor categories</legend>
                  {CATEGORIES.map((c) => {
                    const on = !hidden.has(c.id)
                    return (
                      <label key={c.id} className={`wizard-cat${on ? ' is-on' : ''}`}>
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => {
                            toggleCategory(c.id)
                            setError('')
                          }}
                        />
                        <span>{c.label}</span>
                      </label>
                    )
                  })}
                </fieldset>
              </section>
            )}

            {step === 5 && (
              <section className="wizard-body">
                <h1 id={`${id}-title`} className="wizard-title" tabIndex={-1} ref={heading}>
                  Keep the sample data?
                </h1>
                <p className="wizard-lead">
                  The planner came filled with made-up examples: {samples.vendors} vendors, {samples.guests} guests and{' '}
                  {samples.gifts} gift entries, plus sample details on the e-invite.
                </p>
                <fieldset className="wizard-options">
                  <legend className="visually-hidden">Sample data</legend>
                  <label className={`wizard-option${removeSamples ? ' is-on' : ''}`}>
                    <input
                      type="radio"
                      name={`${id}-samples`}
                      checked={removeSamples}
                      onChange={() => setRemoveSamples(true)}
                    />
                    <span>
                      <strong>Remove the samples and start fresh</strong>
                      <span className="field-hint">
                        Only the made-up examples go. Anything you added or changed yourself stays, including your
                        e-invite design, photos and music.
                      </span>
                    </span>
                  </label>
                  <label className={`wizard-option${!removeSamples ? ' is-on' : ''}`}>
                    <input
                      type="radio"
                      name={`${id}-samples`}
                      checked={!removeSamples}
                      onChange={() => setRemoveSamples(false)}
                    />
                    <span>
                      <strong>Keep them for now</strong>
                      <span className="field-hint">Handy to see how things work. Delete them one by one later.</span>
                    </span>
                  </label>
                </fieldset>
              </section>
            )}

            {error && (
              <p className="field-error wizard-error" role="alert">
                {error}
              </p>
            )}

            <div className="wizard-nav">
              <button
                type="button"
                className="btn-text"
                onClick={() => (step > 1 || !again ? smooth(() => setStep(step - 1), 'swap') : onClose())}
              >
                ‹ Back
              </button>
              <div className="wizard-nav-right">
                {step === 1 && !names.bride && !names.groom && (
                  <button type="button" className="btn-text" onClick={next}>
                    Skip
                  </button>
                )}
                <button type="button" className="btn-primary" onClick={next}>
                  {step === lastStep ? 'Finish setup' : 'Next'}
                </button>
              </div>
            </div>

            {step === lastStep && (
              <p className="fine-print wizard-summary">
                {onCount} {onCount === 1 ? 'event' : 'events'}
                {EVENTS.filter((e) => events[e.id].on && events[e.id].date).length > 0 &&
                  ` (${EVENTS.filter((e) => events[e.id].on && events[e.id].date)
                    .map((e) => `${e.label} ${formatDate(events[e.id].date)}`)
                    .join(', ')})`}
                {' · '}
                {budgetValue ? `budget ${formatRM(budgetValue)}` : 'no budget yet'} · {CATEGORIES.length - hidden.size}{' '}
                vendor categories
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
