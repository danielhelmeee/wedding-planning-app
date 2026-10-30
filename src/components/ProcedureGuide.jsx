import { useEffect, useId, useState } from 'react'
import { celebrate } from '../celebrate.js'
import { PROCEDURE_SOURCE, PROCEDURE_STEPS } from '../data/procedureSteps.js'
import { COURSE_STATUSES, STATUSES, docsGathered, letterWindow, nextAction, stepStatus } from '../procedure.js'
import { formatDate } from '../figures.js'
import { inviteTime } from '../invite.js'

const STATUS_LABEL = Object.fromEntries(STATUSES.map((s) => [s.id, s.label]))
const COURSE_SUMMARY = { todo: 'not registered yet', doing: 'registered', done: 'completed' }
const STEP_KEYS = ['course', 'application', 'akad']

function Source({ className }) {
  return (
    <p className={`source-line ${className}`}>
      Source:{' '}
      <a href={PROCEDURE_SOURCE} target="_blank" rel="noopener noreferrer">
        malaysia.gov.my, Marriage procedures for Muslim couples
        <span className="visually-hidden"> (opens in a new tab)</span>
      </a>
    </p>
  )
}

function ExternalLink({ href, children }) {
  return (
    <a className="step-link" href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  )
}

// One milestone: a round tick, its label, and optional extra fields beneath.
function Milestone({ done, label, note, onToggle, auto, children }) {
  return (
    <li className={`milestone${done ? ' is-done' : ''}`}>
      <button
        type="button"
        className="milestone-check"
        aria-pressed={done}
        aria-label={`${label}: ${done ? 'done' : 'not yet'}`}
        disabled={auto}
        onClick={onToggle}
      >
        {done ? '✓' : ''}
      </button>
      <div className="milestone-body">
        <p className="milestone-label">{label}</p>
        {note && <p className="milestone-note">{note}</p>}
        {children}
      </div>
    </li>
  )
}

// Fields that slide open and closed (height and fade) instead of popping in and out.
// Closed content stays in the page but is inert, so it cannot be tabbed into.
function Reveal({ open, children }) {
  return (
    <div className={`fold${open ? ' is-open' : ''}`} inert={!open}>
      <div className="fold-inner">{children}</div>
    </div>
  )
}

// Counts the moments a step becomes done while the page is open (not on load), so the
// light-up plays once per completion; the count doubles as a key that replays it.
function useJustDone(status) {
  const [prev, setPrev] = useState(status)
  const [lit, setLit] = useState(0)
  if (prev !== status) {
    setPrev(status)
    if (status === 'done') setLit((n) => n + 1)
  }
  return lit
}

// The numbered circle on the rail: the number gives way to a check that draws itself in.
function StepNumber({ n, status }) {
  const lit = useJustDone(status)
  return (
    <span key={lit} className={`procedure-num${lit ? ' is-lit' : ''}`}>
      <span className="num-digit">{n}</span>
      <svg className="num-check" width="18" height="18" viewBox="0 0 18 18">
        <path
          d="M4 9.5l3.2 3.2L14 5.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function StepBadge({ status }) {
  const lit = useJustDone(status)
  return (
    <span key={lit} className={`status-badge is-${status}${lit ? ' is-lit' : ''}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

function DateInput({ label, value, onChange, type = 'date', className = 'milestone-date', placeholder }) {
  const id = useId()
  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

// "13 Dec 2026, 9:00 am · Sample Dewan Kursus"
const courseWhen = (c, who) =>
  [c[`${who}Date`] && formatDate(c[`${who}Date`]), c[`${who}Time`] && inviteTime(c[`${who}Time`], 'en')]
    .filter(Boolean)
    .join(', ')

function LetterCard({ window: w }) {
  if (!w) return null
  return (
    <div className={`letter-card tone-${w.tone}`} role={w.tone === 'warn' ? 'alert' : undefined}>
      <p className="letter-title">
        {w.tone === 'ok' ? '✓ ' : w.tone === 'warn' ? '! ' : ''}
        {w.title}
      </p>
      <p>{w.text}</p>
    </div>
  )
}

// The couple's own document list: empty to start, because each state asks for different things.
function Documents({ documents, onChange }) {
  const id = useId()
  const [label, setLabel] = useState('')
  function add(e) {
    e.preventDefault()
    if (!label.trim()) return
    onChange([...documents, { id: `doc_${Date.now()}`, label: label.trim(), done: false }])
    setLabel('')
  }
  return (
    <div className="documents">
      {documents.length > 0 && (
        <ul className="doc-list">
          {documents.map((d) => (
            <li key={d.id} className={d.done ? 'is-done' : undefined}>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={d.done}
                  onChange={() => onChange(documents.map((x) => (x.id === d.id ? { ...x, done: !x.done } : x)))}
                />
                <span>{d.label}</span>
              </label>
              <button
                type="button"
                className="btn-text btn-delete"
                onClick={() => onChange(documents.filter((x) => x.id !== d.id))}
              >
                Remove<span className="visually-hidden"> {d.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <form className="doc-add" onSubmit={add}>
        <label className="visually-hidden" htmlFor={id}>
          Add a document
        </label>
        <input
          id={id}
          type="text"
          placeholder="Add a document, e.g. Copy of IC"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <button type="submit" className="btn-add-small" disabled={!label.trim()}>
          <span aria-hidden="true">+</span> Add
        </button>
      </form>
    </div>
  )
}

// What a folded step shows in one line (a step not started yet shows what it is about).
function summaryOf(key, p, status, step) {
  if (status === 'todo') return step.lines[0]
  if (key === 'course') {
    const one = (label, who) => {
      const when = courseWhen(p.course, who)
      return `${label} ${COURSE_SUMMARY[p.course[who]]}${when ? ` (${when})` : ''}`
    }
    return `${one('Bride', 'bride')} · ${one('Groom', 'groom')}`
  }
  if (key === 'application') {
    const a = p.application
    if (a.letter) return `Permission letter issued${a.letterIssued ? ` ${formatDate(a.letterIssued)}` : ''}`
    if (a.sent) return `Submitted${a.sentOn ? ` ${formatDate(a.sentOn)}` : ''}, waiting for the letter`
    const n = p.documents.filter((d) => d.done).length
    return p.documents.length ? `${n} of ${p.documents.length} documents gathered` : 'Not started'
  }
  const k = p.akad
  return k.certificate
    ? 'Certificate collected'
    : k.held
      ? 'Akad Nikah held'
      : k.registrarDone
        ? `Registrar confirmed${k.registrar ? `: ${k.registrar}` : ''}`
        : 'Not started'
}

export default function ProcedureGuide({ procedure: p, settings, onChange }) {
  const status = stepStatus(p)
  // Open / folded, as chosen by the couple; otherwise the current step is open. A step being edited stays open,
  // so it does not fold the moment its last milestone is ticked.
  const [opened, setOpened] = useState({})
  const set = (part, changes) => {
    setOpened((o) => (part in o ? o : { ...o, [part]: true }))
    onChange((x) => ({ ...x, [part]: { ...x[part], ...changes } }))
  }
  const akadOn = settings.events.akad?.on
  const akadDate = akadOn ? settings.events.akad.date : ''
  const letter = letterWindow(p, akadDate)
  const doneCount = Object.values(status).filter((s) => s === 'done').length
  useEffect(() => {
    if (doneCount === 3) celebrate('procedure-done', 'All three marriage procedure steps are done')
  }, [doneCount])
  const [course, application, akad] = PROCEDURE_STEPS
  const steps = { course, application, akad }
  const next = nextAction(p, { course: course.link, application: application.link })
  const current = next?.step ?? null
  const isOpenStep = (key) => opened[key] ?? key === current
  const toggleOpen = (key) => setOpened((o) => ({ ...o, [key]: !isOpenStep(key) }))
  const gathered = docsGathered(p)
  const docsAuto = p.documents.length > 0 && p.documents.every((d) => d.done)

  const keyDates = [
    ['Bride’s course', p.course.brideDate, courseWhen(p.course, 'bride'), p.course.brideLocation],
    ['Groom’s course', p.course.groomDate, courseWhen(p.course, 'groom'), p.course.groomLocation],
    ['Application submitted', p.application.sentOn],
    ['Letter issued', p.application.letterIssued],
    ['Letter valid until', letter?.validUntil],
    ['Akad Nikah', akadDate],
  ].filter(([, d]) => d)

  return (
    <section aria-labelledby="guide-title">
      <header className="page-head">
        <h1 id="guide-title" className="page-title">
          Marriage Procedure
        </h1>
        <p className="page-sub">
          The three official steps for Muslim couples in Malaysia. Tick each milestone as you go.
        </p>
      </header>

      <div className="procedure-layout">
        <ol className="procedure-steps">
          {STEP_KEYS.map((key, i) => {
            const step = steps[key]
            const isOpen = isOpenStep(key)
            return (
              <li key={key} className={`procedure-step is-${status[key]}${current === key ? ' is-current' : ''}`}>
                <div className="procedure-rail" aria-hidden="true">
                  <StepNumber n={i + 1} status={status[key]} />
                </div>
                <div className="procedure-card surface">
                  <button
                    type="button"
                    className="procedure-card-head"
                    aria-expanded={isOpen}
                    aria-controls={`step-${key}`}
                    onClick={() => toggleOpen(key)}
                  >
                    <span className="procedure-head-text">
                      {current === key && <span className="up-next-tag">Up next</span>}
                      <span className="procedure-title">{step.title}</span>
                      {!isOpen && (
                        <span className="procedure-summary-line">{summaryOf(key, p, status[key], step)}</span>
                      )}
                    </span>
                    <StepBadge status={status[key]} />
                    <svg className="procedure-chevron" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                      <path
                        d="M2.5 4.5l3.5 3.5 3.5-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>

                  {/* The step opens and closes with a slide; closed content stays out of the tab order. */}
                  <Reveal open={isOpen}>
                    <div className="procedure-body" id={`step-${key}`}>
                      <div className="step-official">
                        {step.lines.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                        {step.link && <ExternalLink href={step.link}>{step.linkLabel}</ExternalLink>}
                      </div>

                      {key === 'course' && (
                        <div className="procedure-fields course-fields">
                          <div className="course-people">
                            {[
                              ['bride', 'Bride'],
                              ['groom', 'Groom'],
                            ].map(([who, label]) => {
                              const c = p.course
                              const has = (w) => Boolean(c[`${w}Date`] || c[`${w}Time`] || c[`${w}Location`])
                              // Couples often attend the same session.
                              const canCopy = who === 'groom' && c.groom !== 'todo' && has('bride') && !has('groom')
                              return (
                                <section
                                  key={who}
                                  className={`person-card is-${c[who]}`}
                                  aria-label={`${label}: pre-marriage course`}
                                >
                                  <div className="person-card-head">
                                    <h3 className="person-name">{label}</h3>
                                    {canCopy && (
                                      <button
                                        type="button"
                                        className="link-button course-same"
                                        onClick={() =>
                                          set('course', {
                                            groomDate: c.brideDate,
                                            groomTime: c.brideTime,
                                            groomLocation: c.brideLocation,
                                          })
                                        }
                                      >
                                        Same as bride
                                      </button>
                                    )}
                                  </div>
                                  <div
                                    className="status-picker is-full"
                                    role="radiogroup"
                                    aria-label={`${label}: course status`}
                                  >
                                    {COURSE_STATUSES.map((s) => (
                                      <label
                                        key={s.id}
                                        className={`status-option is-${s.id}${c[who] === s.id ? ' is-on' : ''}`}
                                      >
                                        <input
                                          type="radio"
                                          checked={c[who] === s.id}
                                          onChange={() => set('course', { [who]: s.id })}
                                        />
                                        {s.label}
                                      </label>
                                    ))}
                                  </div>
                                  {/* The hint and the fields swap with a slide, not a jump. */}
                                  <div className="course-swap">
                                    <Reveal open={c[who] === 'todo'}>
                                      <p className="milestone-note person-hint">
                                        Once registered, you can add the course date, time and place.
                                      </p>
                                    </Reveal>
                                    <Reveal open={c[who] !== 'todo'}>
                                      <div className="course-details">
                                        <DateInput
                                          label="Date"
                                          className="course-date"
                                          value={c[`${who}Date`]}
                                          onChange={(v) => set('course', { [`${who}Date`]: v })}
                                        />
                                        <DateInput
                                          label="Time"
                                          type="time"
                                          className="course-time"
                                          value={c[`${who}Time`]}
                                          onChange={(v) => set('course', { [`${who}Time`]: v })}
                                        />
                                        <DateInput
                                          label="Location"
                                          type="text"
                                          className="course-location"
                                          placeholder="Hall, mosque or online"
                                          value={c[`${who}Location`]}
                                          onChange={(v) => set('course', { [`${who}Location`]: v })}
                                        />
                                      </div>
                                    </Reveal>
                                  </div>
                                </section>
                              )
                            })}
                          </div>
                          <p className="field-hint course-hint">Date, time and location are optional.</p>
                        </div>
                      )}

                      {key === 'application' && (
                        <ol className="milestones">
                          <Milestone
                            done={gathered}
                            auto={docsAuto}
                            label="Documents gathered"
                            note={
                              docsAuto
                                ? 'Every document on your list is ticked.'
                                : 'List what your state asks for (see the SPPIM checklist above) and tick each one off, or tick this when you have everything.'
                            }
                            onToggle={() => set('application', { docs: !p.application.docs })}
                          >
                            <Documents
                              documents={p.documents}
                              onChange={(documents) => {
                                setOpened((o) => ('application' in o ? o : { ...o, application: true }))
                                onChange((x) => ({ ...x, documents }))
                              }}
                            />
                          </Milestone>
                          <Milestone
                            done={p.application.sent}
                            label="Application submitted"
                            onToggle={() => set('application', { sent: !p.application.sent })}
                          >
                            <Reveal open={p.application.sent}>
                              <DateInput
                                label="Submitted on"
                                value={p.application.sentOn}
                                onChange={(v) => set('application', { sentOn: v })}
                              />
                            </Reveal>
                          </Milestone>
                          <Milestone
                            done={p.application.letter}
                            label="Marriage permission letter issued"
                            note={`Valid for 90 days from the date it is issued.`}
                            onToggle={() =>
                              set('application', {
                                letter: !p.application.letter,
                                ...(p.application.letter ? {} : { sent: true }),
                              })
                            }
                          >
                            <Reveal open={p.application.letter}>
                              <DateInput
                                label="Issued on"
                                value={p.application.letterIssued}
                                onChange={(v) => set('application', { letterIssued: v })}
                              />
                            </Reveal>
                            <LetterCard window={letter} />
                          </Milestone>
                        </ol>
                      )}

                      {key === 'akad' && (
                        <ol className="milestones">
                          <Milestone
                            done={p.akad.registrarDone}
                            label="Marriage registrar confirmed"
                            onToggle={() => set('akad', { registrarDone: !p.akad.registrarDone })}
                          >
                            <div className="field milestone-date">
                              <label htmlFor="registrar">Registrar&apos;s name (optional)</label>
                              <input
                                id="registrar"
                                type="text"
                                value={p.akad.registrar}
                                onChange={(e) => set('akad', { registrar: e.target.value })}
                              />
                            </div>
                          </Milestone>
                          <Milestone
                            done={p.akad.held}
                            label="Akad Nikah held"
                            note={
                              <>
                                {akadDate
                                  ? formatDate(akadDate)
                                  : akadOn
                                    ? 'No date yet'
                                    : 'Akad Nikah is switched off'}{' '}
                                · <a href="#/settings">Change in Settings</a>
                              </>
                            }
                            onToggle={() => set('akad', { held: !p.akad.held })}
                          />
                          <Milestone
                            done={p.akad.certificate}
                            label="Marriage certificate collected"
                            note="From the registrar or the religious office."
                            onToggle={() =>
                              set('akad', {
                                certificate: !p.akad.certificate,
                                ...(p.akad.certificate ? {} : { held: true }),
                              })
                            }
                          />
                        </ol>
                      )}
                    </div>
                  </Reveal>
                </div>
              </li>
            )
          })}
        </ol>

        <aside className="procedure-side">
          <div className="surface procedure-summary">
            <p className="hero-label">Your progress</p>
            <p className="procedure-summary-figure">
              {doneCount} <span>of 3 steps done</span>
            </p>
            <div className="first-steps-bar" aria-hidden="true">
              <span style={{ width: `${(doneCount / 3) * 100}%` }} />
            </div>

            <div className="up-next">
              {next ? (
                <>
                  <p className="up-next-label">Up next</p>
                  <p className="up-next-text">{next.text}</p>
                  {next.step === 'akad' && next.text === 'Your Akad Nikah' && akadDate && (
                    <p className="milestone-note">{formatDate(akadDate)}</p>
                  )}
                  {next.link && <ExternalLink href={next.link}>{next.linkLabel}</ExternalLink>}
                </>
              ) : (
                <p className="up-next-text">All three steps are done.</p>
              )}
            </div>

            {letter?.tone === 'warn' && <LetterCard window={letter} />}

            {keyDates.length > 0 && (
              <div className="key-dates">
                <p className="up-next-label">Key dates</p>
                <ul>
                  {keyDates.map(([label, d, when, where]) => (
                    <li key={label}>
                      <span className="key-date-label">{label}</span>
                      <span className="key-date-value">{when || formatDate(d)}</span>
                      {where && <span className="key-date-where">{where}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className="fine-print">
              Your ticks here also tick the matching tasks in the <a href="#/checklist/procedure">Checklist</a>.
            </p>
          </div>
          <Source className="source-wide" />
        </aside>
      </div>
      <Source className="source-narrow" />
    </section>
  )
}
