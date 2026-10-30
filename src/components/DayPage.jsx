import { CATEGORY_BY_ID } from '../data/categories.js'
import CountUp from './CountUp.jsx'
import { BOOKED_STAGES } from '../data/stages.js'
import { daysRemaining, formatDate, formatRM } from '../figures.js'
import { eventHeadcounts, goingTo, headcount } from '../guests.js'
import { seatingFor } from '../seating.js'
import { inviteTime, mapLinks, timeRange } from '../invite.js'
import { whatsappHref } from '../contact.js'
import { hrefFor } from '../useHashRoute.js'

const telHref = (phone) => `tel:${(phone || '').replace(/[^\d+]/g, '')}`

function PhoneLinks({ phone }) {
  if (!phone) return null
  const wa = whatsappHref(phone)
  return (
    <span className="day-phone">
      <a href={telHref(phone)}>Call {phone}</a>
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer">
          WhatsApp<span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      )}
    </span>
  )
}

function Block({ title, link, linkLabel, children, className = '' }) {
  return (
    <section className={`surface day-block ${className}`}>
      <div className="section-head">
        <h2>{title}</h2>
        {link && (
          <a className="section-note no-print" href={link}>
            {linkLabel}
          </a>
        )}
      </div>
      {children}
    </section>
  )
}

// Hari Majlis: everything for one event day on one page (and one printout).
export default function DayPage({ tab, events, settings, vendors, guests, seating, invite }) {
  if (!events.length) {
    return (
      <header className="page-head">
        <h1 className="page-title">Hari Majlis</h1>
        <p className="page-sub">
          All events are switched off. <a href="#/settings">Turn one on in Settings</a>.
        </p>
      </header>
    )
  }
  // The open tab, or the next event still to come, or the first.
  const upcoming = events.find((e) => (daysRemaining(settings.events[e.id].date) ?? -1) >= 0)
  const event = events.find((e) => e.id === tab) ?? upcoming ?? events[0]
  const date = settings.events[event.id].date
  const days = daysRemaining(date)
  const ev = invite.events[event.id] ?? {}
  const programme = (ev.programme ?? []).filter((r) => r.time || r.item)
  const maps = mapLinks(ev)

  const head = eventHeadcounts(guests, settings).find((e) => e.id === event.id)
  const going = guests.filter((g) => goingTo(g, event.id))
  const dietary = going.filter((g) => g.dietary)
  const seats = seatingFor(seating, guests, event.id)

  const forEvent = vendors.filter((v) => v.events.includes(event.id))
  const booked = forEvent.filter((v) => BOOKED_STAGES.includes(v.stage))
  const notBooked = forEvent.length - booked.length
  const owed = (v) => (v.stage === 'final' || v.stage === 'completed' ? 0 : Math.max(0, v.estimatedCost - v.amountPaid))
  const toSettle = booked.reduce((n, v) => n + owed(v), 0)
  const contacts = invite.contacts.filter((c) => c.name || c.phone)

  return (
    <div className="day-page print-too">
      <header className="page-head page-head-actions">
        <div>
          <h1 className="page-title">Hari Majlis</h1>
          <p className="page-sub">
            Everything for the day in one place. Print it for family and the people helping out.
          </p>
        </div>
        <div className="head-actions no-print">
          <button type="button" className="btn-secondary" onClick={() => window.print()}>
            Print this day sheet
          </button>
        </div>
      </header>

      {events.length > 1 && (
        <nav data-slide className="tabs no-print" aria-label="Events">
          {events.map((e) => (
            <a
              key={e.id}
              href={hrefFor({ page: 'day', tab: e.id })}
              className={`tab${e.id === event.id ? ' is-active' : ''}`}
              aria-current={e.id === event.id ? 'page' : undefined}
            >
              {e.label}
            </a>
          ))}
        </nav>
      )}

      <div data-tab-panel="day">
        <section className="day-hero">
          <div>
            <p className="home-today">{date ? formatDate(date) : 'No date yet'}</p>
            <h2 className="day-title">{event.label}</h2>
            <p className="day-where">
              {[timeRange(ev, 'en'), ev.venue].filter(Boolean).join(' · ') ||
                'Add the time and venue in the E-invite studio.'}
            </p>
            {ev.address && <p className="day-address">{ev.address}</p>}
            {maps && (
              <p className="day-maps no-print">
                <a href={maps.google} target="_blank" rel="noopener noreferrer">
                  Google Maps<span className="visually-hidden"> (opens in a new tab)</span>
                </a>
                <a href={maps.waze} target="_blank" rel="noopener noreferrer">
                  Waze<span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </p>
            )}
          </div>
          {days !== null && (
            <p className="day-count">
              {days > 0 ? (
                <>
                  <strong>
                    <CountUp value={days} />
                  </strong>{' '}
                  {days === 1 ? 'day' : 'days'} to go
                </>
              ) : days === 0 ? (
                <strong>Today</strong>
              ) : (
                'This day has passed'
              )}
            </p>
          )}
        </section>

        <div className="day-grid">
          <Block title="Atur cara" link="#/invite" linkLabel="Edit in E-invite">
            {programme.length ? (
              <ol className="day-programme">
                {programme.map((r, i) => (
                  <li key={i}>
                    <span className="day-time">{inviteTime(r.time, 'en')}</span>
                    <span>{r.item}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="muted">No programme yet. Add it under Details in the E-invite studio.</p>
            )}
          </Block>

          <Block title="Guests" link={hrefFor({ page: 'seating', tab: event.id })} linkLabel="Seating">
            <p className="card-figure">
              <CountUp value={head?.attendingPeople ?? 0} /> <span>people attending</span>
            </p>
            <ul className="plain-list card-list">
              <li className="plain-row plain-row-inline">
                <span>Still to reply</span>
                <span className="plain-row-figure">{head?.pending ?? 0}</span>
              </li>
              <li className="plain-row plain-row-inline">
                <span>Tables</span>
                <span className="plain-row-figure">
                  {seats.tables.length ? `${seats.tables.length} · ${seats.seats} seats` : 'Free seating'}
                </span>
              </li>
              {seats.tables.length > 0 && (
                <li className="plain-row plain-row-inline">
                  <span>Still to seat</span>
                  <span className="plain-row-figure">{seats.unassignedPeople} people</span>
                </li>
              )}
            </ul>
            <p className="day-sub">Dietary needs ({dietary.length})</p>
            {dietary.length ? (
              <ul className="day-list day-diet">
                {dietary.map((g) => (
                  <li key={g.id}>
                    <strong>{g.dietary}</strong>
                    <span>
                      {g.name} · {headcount(g)} {headcount(g) === 1 ? 'person' : 'people'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">None noted.</p>
            )}
          </Block>

          <Block
            title="Vendors on the day"
            link={hrefFor({ page: 'calendar' })}
            linkLabel="Payments in the calendar"
            className="day-wide"
          >
            {booked.length ? (
              <ul className="day-vendors">
                {booked.map((v) => (
                  <li key={v.id}>
                    <div>
                      <p className="row-name">{v.name}</p>
                      <p className="guest-meta">
                        {CATEGORY_BY_ID[v.category]?.label}
                        {v.contactName && ` · ${v.contactName}`}
                      </p>
                      <PhoneLinks phone={v.phone} />
                    </div>
                    <p className="day-owed">
                      {owed(v) > 0 ? (
                        <>
                          {formatRM(owed(v))}{' '}
                          <span>still to pay{v.dueDate ? ` · due ${formatDate(v.dueDate)}` : ''}</span>
                        </>
                      ) : (
                        <span className="day-paid">Paid in full</span>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No vendors booked for this event yet.</p>
            )}
            <p className="day-total">
              {booked.length > 0 && (
                <>
                  Balances to settle: <strong>{formatRM(toSettle)}</strong>
                </>
              )}
              {notBooked > 0 && (
                <span className="day-warn">
                  {notBooked} {notBooked === 1 ? 'vendor is' : 'vendors are'} not booked yet
                </span>
              )}
            </p>
          </Block>

          <Block title="Family contacts" link="#/invite" linkLabel="Edit in E-invite">
            {contacts.length ? (
              <ul className="day-list">
                {contacts.map((c, i) => (
                  <li key={i}>
                    <strong>{c.name || c.phone}</strong>
                    <PhoneLinks phone={c.phone} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No contacts yet. Add them under Details in the E-invite studio.</p>
            )}
          </Block>
        </div>
      </div>
    </div>
  )
}
