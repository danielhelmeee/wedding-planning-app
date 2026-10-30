import { useEffect, useState } from 'react'
import { firstTimeToday } from '../storage.js'
import StatsBar from './StatsBar.jsx'
import { celebrate } from '../celebrate.js'
import CountUp from './CountUp.jsx'
import { HeroArt } from './invite/ThemeArt.jsx'
import { PROCEDURE_STEPS } from '../data/procedureSteps.js'
import { categoryStats, daysRemaining, enabledEvents, formatDate, formatRM, nextEvent } from '../figures.js'
import { hrefFor } from '../useHashRoute.js'
import { checklistSummary } from '../checklist.js'
import { eventHeadcounts, guestSummary } from '../guests.js'
import { giftSummary, itemState } from '../gifts.js'
import { calendarItems, itemsBetween } from '../calendar.js'
import { addDays, dayLabel, shortDayLabel, todayISO } from '../dates.js'
import { attentionItems, firstSteps, inviteReadiness } from '../home.js'
import { themeFor, themeVars } from '../inviteThemes.js'
import { STATUSES, stepStatus } from '../procedure.js'

// The couple, and how long until their next event.
function Hero({ invite, settings }) {
  // The names ink in on the first visit of the day only.
  const [ink] = useState(() => firstTimeToday('home-ink'))
  const next = nextEvent(settings)
  const events = enabledEvents(settings)
  const named = invite.bride?.trim() || invite.groom?.trim()
  const lastDate = events.map((e) => settings.events[e.id].date).filter(Boolean).sort().at(-1)
  const allPassed = lastDate && daysRemaining(lastDate) < 0

  return (
    <header className="home-hero">
      <div className="home-hero-main">
        <p className="home-today">{dayLabel(todayISO())}</p>
        <h1 className={`home-names${ink ? ' is-ink' : ''}`}>
          {named ? (
            <>
              {invite.bride || '…'} <span className="home-amp">&amp;</span> {invite.groom || '…'}
            </>
          ) : (
            'Your wedding'
          )}
        </h1>
        <ul className="home-chips" aria-label="Your events">
          {events.map((e) => {
            const date = settings.events[e.id].date
            const days = daysRemaining(date)
            return (
              <li key={e.id} className={`home-chip${days !== null && days < 0 ? ' is-past' : ''}`}>
                <strong>{e.label}</strong>
                {date ? formatDate(date) : <a href="#/settings">Add a date</a>}
              </li>
            )
          })}
        </ul>
      </div>
      <div className="home-countdown" aria-live="polite">
        {allPassed ? (
          <p className="home-count-text">Selamat pengantin baru</p>
        ) : next && next.days >= 0 ? (
          next.days === 0 ? (
            <p className="home-count-text">Today is {next.event.label}</p>
          ) : (
            <>
              <p className="home-count"><CountUp value={next.days} duration={1100} /></p>
              <p className="home-count-label">
                {next.days === 1 ? 'day' : 'days'} to {next.event.label}
              </p>
            </>
          )
        ) : (
          <a className="home-count-text home-count-link" href="#/settings">
            Set your dates to start the countdown
          </a>
        )}
      </div>
    </header>
  )
}

function Attention({ items }) {
  return (
    <section className="home-attention" aria-labelledby="attention-title">
      <h2 id="attention-title" className="home-section-title">
        Needs your attention
      </h2>
      {items.length ? (
        <ul className="attention-grid">
          {items.map((i) => (
            <li key={i.id}>
              <a className={`attention-card tone-line-${i.tone}`} href={i.href}>
                <span className="attention-count">{i.count}</span>
                <span className="attention-text">
                  <span className="attention-title">{i.title}</span>
                  <span className="attention-note">{i.note}</span>
                </span>
                <span className="attention-arrow" aria-hidden="true">
                  ›
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="attention-clear">
          <span className="attention-tick" aria-hidden="true">
            ✓
          </span>
          All caught up. Nothing needs you right now.
        </p>
      )}
    </section>
  )
}

function FirstSteps({ steps, onHide }) {
  const done = steps.filter((s) => s.done).length
  return (
    <section className="surface first-steps" aria-labelledby="steps-title">
      <div className="first-steps-head">
        <div>
          <h2 id="steps-title" className="home-section-title">
            First steps
          </h2>
          <p className="muted">
            {done} of {steps.length} done
          </p>
        </div>
        <button type="button" className="btn-text" onClick={onHide}>
          Hide
        </button>
      </div>
      <div className="first-steps-bar" aria-hidden="true">
        <span style={{ width: `${(done / steps.length) * 100}%` }} />
      </div>
      <ol className="first-steps-list">
        {steps.map((s) => (
          <li key={s.id} className={s.done ? 'is-done' : undefined}>
            <span className="step-check" aria-hidden="true">
              {s.done ? '✓' : ''}
            </span>
            <span className="step-text">
              {s.done ? (
                <span className="step-label">{s.label}</span>
              ) : (
                <a className="step-label" href={s.href}>
                  {s.label}
                </a>
              )}
              {!s.done && <span className="step-note">{s.note}</span>}
              <span className="visually-hidden">{s.done ? ' (done)' : ''}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

// One overview card: title, a link, and its content.
function Card({ title, link, linkLabel, className = '', children }) {
  const id = `card-${title.toLowerCase().replace(/[^a-z]+/g, '-')}`
  return (
    <section className={`surface home-card ${className}`} aria-labelledby={id}>
      <div className="section-head">
        <h2 id={id}>{title}</h2>
        {link && (
          <a className="section-note" href={link}>
            {linkLabel}
          </a>
        )}
      </div>
      {children}
    </section>
  )
}

// The next few dated things (events, payments, open tasks), however far ahead they are.
function ComingUp({ settings, visible, tasks }) {
  const today = todayISO()
  const upcoming = itemsBetween(calendarItems(settings, visible, tasks), today, '9999-12-31')
    .flatMap(([day, items]) => items.filter((i) => !i.task?.done).map((i) => ({ ...i, day })))
  const rows = upcoming.slice(0, 5)
  const inTwoWeeks = upcoming.filter((i) => i.day <= addDays(today, 13)).length
  return (
    <Card title="Coming up" link="#/calendar" linkLabel="Open calendar">
      {rows.length ? (
        <>
          <ul className="plain-list">
            {rows.map((i) => (
              <li key={i.key} className="plain-row">
                <div className="plain-row-top">
                  <a
                    className="plain-row-name"
                    href={i.kind === 'task' ? `#/checklist/${i.key}` : i.kind === 'payment' ? hrefFor({ page: 'category', category: i.vendor.category }) : '#/calendar'}
                  >
                    <span className={`dot kind-${i.kind}`} aria-hidden="true" /> {i.title}
                  </a>
                </div>
                <p className="plain-row-meta">
                  {i.day === today ? 'Today' : shortDayLabel(i.day)}
                  {i.day.slice(0, 4) !== today.slice(0, 4) && ` ${i.day.slice(0, 4)}`}
                  {i.kind === 'payment' && ` · ${i.detail}`}
                  {i.kind === 'event' && ' · Event day'}
                </p>
              </li>
            ))}
          </ul>
          <p className="fine-print">
            {inTwoWeeks ? `${inTwoWeeks} in the next two weeks` : 'Nothing in the next two weeks'} · {upcoming.length} still ahead
          </p>
        </>
      ) : (
        <p className="muted">Nothing dated yet. Set your event dates and the checklist fills this in.</p>
      )}
    </Card>
  )
}

function GuestsCard({ guests, settings }) {
  const s = guestSummary(guests)
  const heads = eventHeadcounts(guests, settings)
  const parts = [
    { id: 'attending', n: s.attending, label: 'attending' },
    { id: 'pending', n: s.pending, label: 'awaiting reply' },
    { id: 'declined', n: s.declined, label: 'declined' },
  ]
  return (
    <Card title="Guests" link="#/guests" linkLabel="Guest list">
      {s.invited ? (
        <>
          <p className="card-figure">
            <CountUp value={s.attendingPeople} /> <span>people attending</span>
          </p>
          <div className="reply-bar" role="img" aria-label={parts.map((p) => `${p.n} ${p.label}`).join(', ')}>
            {parts.map((p) => p.n > 0 && <span key={p.id} className={`reply-seg seg-${p.id}`} style={{ flexGrow: p.n }} />)}
          </div>
          <ul className="reply-legend">
            {parts.map((p) => (
              <li key={p.id}>
                <span className={`legend-mark seg-${p.id}`} aria-hidden="true" />
                {p.n} {p.label}
              </li>
            ))}
          </ul>
          <ul className="plain-list card-list">
            {heads.map((e) => (
              <li key={e.id} className="plain-row plain-row-inline">
                <span>{e.label}</span>
                <span className="plain-row-figure">{e.attendingPeople} people</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="card-empty">
          <p>No guests yet.</p>
          <a className="btn-add-small" href="#/guests">
            <span aria-hidden="true">+</span> Add guests
          </a>
        </div>
      )}
    </Card>
  )
}

function VendorsCard({ visible, settings, colors, firstCategory }) {
  const stats = categoryStats(visible, settings)
  const started = stats.filter((c) => c.count > 0).sort((a, b) => b.committed - a.committed)
  const notStarted = stats.filter((c) => c.count === 0)
  const booked = started.filter((c) => c.booked === c.count).length
  return (
    <Card title="Vendors" link={hrefFor({ page: 'category', category: firstCategory })} linkLabel="Add a vendor">
      {started.length ? (
        <>
          <p className="card-figure">
            <CountUp value={booked} /> <span>of {stats.length} categories fully booked</span>
          </p>
          <ul className="plain-list card-list">
            {started.slice(0, 5).map((c) => (
              <li key={c.id} className="plain-row plain-row-inline">
                <a className="plain-row-name" href={hrefFor({ page: 'category', category: c.id })}>
                  <span className="dot" style={{ background: colors[c.id] }} aria-hidden="true" /> {c.label}
                </a>
                <span className={`card-status${c.booked === c.count ? ' is-done' : ''}`}>
                  {c.booked === c.count ? 'Booked' : `${c.booked} of ${c.count} booked`}
                </span>
              </li>
            ))}
          </ul>
          {started.length > 5 && <p className="fine-print">and {started.length - 5} more categories</p>}
        </>
      ) : (
        <div className="card-empty">
          <p>No vendors yet.</p>
          <a className="btn-add-small" href={hrefFor({ page: 'category', category: firstCategory })}>
            <span aria-hidden="true">+</span> Add your first vendor
          </a>
        </div>
      )}
      {notStarted.length > 0 && (
        <details className="not-started-list">
          <summary>
            {notStarted.length} {notStarted.length === 1 ? 'category' : 'categories'} not started
          </summary>
          <ul className="chip-list">
            {notStarted.map((c) => (
              <li key={c.id}>
                <a className="chip-link" href={hrefFor({ page: 'category', category: c.id })}>
                  {c.short ?? c.label}
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}
    </Card>
  )
}

function InviteCardSummary({ invite, settings }) {
  const theme = themeFor(invite.theme, invite.palette)
  const r = inviteReadiness(invite, settings)
  return (
    <Card title="E-invite" link="#/invite" linkLabel="Edit the invitation">
      <div className="invite-summary">
        <a
          href="#/invite/preview"
          className={`theme-swatch theme-${theme.id} invite-summary-swatch`}
          style={{ ...themeVars(theme), backgroundColor: theme.palette.heroBg }}
          aria-label="Open the full preview"
        >
          <HeroArt theme={theme} />
          <span className="theme-swatch-name">
            {(invite.bride || '…').replace(/^sample\s+/i, '').split(' ')[0]} &amp;{' '}
            {(invite.groom || '…').replace(/^sample\s+/i, '').split(' ')[0]}
          </span>
        </a>
        <div className="invite-summary-info">
          <p className={`card-status${r.ready ? ' is-done' : ''}`}>
            {r.ready ? 'Ready to send' : `${r.done} of ${r.total} essentials done`}
          </p>
          <p className="muted invite-summary-theme">
            {theme.label} · {theme.palette.label}
          </p>
          <ul className="readiness">
            {r.checks.map((c) => (
              <li key={c.label} className={c.done ? 'is-done' : undefined}>
                <span className="readiness-mark" aria-hidden="true">
                  {c.done ? '✓' : ''}
                </span>
                {c.label}
                {c.optional && <span className="readiness-optional"> (optional)</span>}
                <span className="visually-hidden">{c.done ? ', done' : ', not yet'}</span>
              </li>
            ))}
          </ul>
          <a className="btn-add-small" href="#/invite/preview">
            Full preview
          </a>
        </div>
      </div>
    </Card>
  )
}

function GiftsCard({ gifts }) {
  const s = giftSummary(gifts.log)
  const reserved = gifts.wishlist.filter((i) => itemState(i) !== 'open').length
  return (
    <Card title="Gifts & Angpow" link="#/gifts" linkLabel="Gift log">
      {s.count || gifts.wishlist.length ? (
        <>
          <p className="card-figure">
            <CountUp value={s.total} format={formatRM} /> <span>received</span>
          </p>
          <ul className="plain-list card-list">
            <li className="plain-row plain-row-inline">
              <span>Gifts logged</span>
              <span className="plain-row-figure">{s.count}</span>
            </li>
            <li className="plain-row plain-row-inline">
              <span>Thank-yous to send</span>
              <span className="plain-row-figure">{s.toThank}</span>
            </li>
            <li className="plain-row plain-row-inline">
              <a href="#/gifts/wishlist">Wish list reserved</a>
              <span className="plain-row-figure">
                {reserved} of {gifts.wishlist.length}
              </span>
            </li>
          </ul>
        </>
      ) : (
        <div className="card-empty">
          <p>Log angpow as it comes in, and share a wish list on your e-invite.</p>
          <a className="btn-add-small" href="#/gifts">
            Log a gift
          </a>
        </div>
      )}
    </Card>
  )
}

function ProcedureCard({ procedure }) {
  const status = Object.values(stepStatus(procedure))
  const label = Object.fromEntries(STATUSES.map((s) => [s.id, s.label]))
  return (
    <Card title="Marriage procedure" link="#/procedure" linkLabel="Track the steps">
      <p className="muted card-lead">The official steps for Muslim couples in Malaysia, in order.</p>
      <ol className="procedure-mini">
        {PROCEDURE_STEPS.map((s, i) => (
          <li key={s.title} className={`is-${status[i]}`}>
            <span className="procedure-mini-n">{status[i] === 'done' ? '✓' : i + 1}</span>
            <span className="procedure-mini-title">{s.title}</span>
            <span className={`status-badge is-${status[i]}`}>{label[status[i]]}</span>
          </li>
        ))}
      </ol>
    </Card>
  )
}

export default function HomePage({
  summary,
  settings,
  tasks,
  guests,
  vendors,
  invite,
  gifts,
  replies,
  procedure,
  unseated,
  setup,
  categories,
  onHideSteps,
  onRunSetup,
}) {
  const firstCategory = categories[0]?.id ?? 'venue'
  const attention = attentionItems({ tasks, visibleVendors: summary.visible, guests, replies, gifts, invite, unseated, procedure, settings })
  const steps = firstSteps({ settings, vendors, guests, invite, gifts, firstCategory })
  const showSteps = !setup.hideSteps && steps.some((s) => !s.done)
  const allStepsDone = steps.every((s) => s.done)
  const next = nextEvent(settings)
  // Milestones: every first step done; the eve of an event (each celebrates once).
  useEffect(() => {
    if (allStepsDone) celebrate('first-steps', 'All your first steps are done')
  }, [allStepsDone])
  const eveKey = next?.days === 1 ? `eve:${next.event.id}:${settings.events[next.event.id].date}` : null
  const eveMessage = next?.days === 1 ? `${next.event.label} is tomorrow` : ''
  useEffect(() => {
    if (eveKey) celebrate(eveKey, eveMessage)
  }, [eveKey, eveMessage])
  const taskSummary = checklistSummary(tasks)

  return (
    <div className="home">
      {setup.start === 'sample' && (
        <div className="setup-banner">
          <p>
            <strong>You&apos;re exploring sample data.</strong> The names and figures are made up.
          </p>
          <button type="button" className="btn-add-small" onClick={onRunSetup}>
            Set up my wedding
          </button>
        </div>
      )}

      <Hero invite={invite} settings={settings} />

      <Attention items={attention} />

      {showSteps && <FirstSteps steps={steps} onHide={onHideSteps} />}

      <StatsBar
        summary={summary}
        totalBudget={settings.totalBudget}
        planned={Object.values(settings.categoryBudgets ?? {}).reduce((n, v) => n + v, 0)}
      />

      <div className="home-grid">
        <ComingUp settings={settings} visible={summary.visible} tasks={tasks} />
        <GuestsCard guests={guests} settings={settings} />
        <VendorsCard visible={summary.visible} settings={settings} colors={summary.colors} firstCategory={firstCategory} />
        <InviteCardSummary invite={invite} settings={settings} />
        <GiftsCard gifts={gifts} />
        <ProcedureCard procedure={procedure} />
      </div>

      <p className="fine-print home-foot">
        Checklist: {taskSummary.done} of {taskSummary.total} tasks done · <a href="#/checklist">Open the checklist</a>
      </p>
    </div>
  )
}
