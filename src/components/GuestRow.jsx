import { useState } from 'react'
import GuestForm from './GuestForm.jsx'
import { EVENT_BY_ID, EVENT_IDS } from '../data/events.js'
import { RSVP, SIDE_BY_ID } from '../data/guestOptions.js'
import { headcount } from '../guests.js'
import { whatsappHref } from '../contact.js'
import { formatRM } from '../figures.js'
import { smooth } from '../motion.js'

const TONE = { attending: 'emerald', pending: 'ochre', declined: 'terracotta' }

export default function GuestRow({ guest, events, gift, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const selectId = `rsvp-${guest.id}`
  const wa = whatsappHref(guest.phone)
  const eventNames = EVENT_IDS.filter((e) => guest.events.includes(e)).map((e) => EVENT_BY_ID[e].label)
  const people = headcount(guest)
  // Replied for only some of the events they're invited to.
  const comingTo =
    guest.status === 'attending' && guest.attendingEvents?.length
      ? EVENT_IDS.filter((e) => guest.events.includes(e) && guest.attendingEvents.includes(e))
      : null
  const partly = comingTo && comingTo.length < eventNames.length
  const replied = guest.repliedAt
    ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(guest.repliedAt))
    : ''

  if (editing) {
    return (
      <li className="vendor-row">
        <GuestForm
          guest={guest}
          events={events}
          onSubmit={(values) => {
            onUpdate(guest.id, values)
            smooth(() => setEditing(false))
          }}
          onCancel={() => smooth(() => setEditing(false))}
        />
      </li>
    )
  }

  const details = [
    guest.plusOnes > 0 && <span key="plus">+{guest.plusOnes}</span>,
    guest.dietary && (
      <span key="diet" className="guest-diet">
        {guest.dietary}
      </span>
    ),
    partly && <span key="coming">Coming to {comingTo.map((e) => EVENT_BY_ID[e].label).join(' · ')}</span>,
    wa ? (
      <a key="wa" href={wa} target="_blank" rel="noopener noreferrer">
        WhatsApp
        <span className="visually-hidden">
          {' '}
          {guest.name} {guest.phone} (opens in a new tab)
        </span>
      </a>
    ) : (
      guest.phone && <span key="phone">{guest.phone}</span>
    ),
    gift > 0 && (
      <span key="gift" className="guest-gift">
        Angpow {formatRM(gift)}
      </span>
    ),
    replied && (
      <span key="replied" className="guest-replied">
        Replied {replied}
      </span>
    ),
  ].filter(Boolean)

  // One compact line per guest, so long lists stay scannable: who, details, people, reply, actions.
  return (
    <li className={`guest-row${guest.status === 'declined' ? ' is-declined' : ''}`}>
      <span className={`row-mark tone-${TONE[guest.status]}`} aria-hidden="true" />
      <div className="guest-main">
        <p className="row-name">{guest.name}</p>
        <p className="guest-meta">
          {SIDE_BY_ID[guest.side].label} · {guest.group}
          {eventNames.length ? ` · ${eventNames.join(', ')}` : ' · No event picked'}
        </p>
        {details.length > 0 && <p className="guest-details">{details}</p>}
        {guest.notes && <p className="row-notes">{guest.notes}</p>}
      </div>
      <p className="guest-people">
        {people} {people === 1 ? 'person' : 'people'}
      </p>
      <div className="guest-reply-field">
        {/* The pill shows the reply itself; the label is for screen readers only. */}
        <label className="visually-hidden" htmlFor={selectId}>
          Reply from {guest.name}
        </label>
        <select
          id={selectId}
          className={`guest-reply is-${guest.status}`}
          value={guest.status}
          onChange={(e) => onUpdate(guest.id, { status: e.target.value })}
        >
          {RSVP.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
      <div className="guest-actions">
        <button type="button" className="btn-text" onClick={() => smooth(() => setEditing(true))}>
          Edit<span className="visually-hidden"> {guest.name}</span>
        </button>
        <button type="button" className="btn-text btn-delete" onClick={() => onDelete(guest.id)}>
          Delete<span className="visually-hidden"> {guest.name}</span>
        </button>
      </div>
    </li>
  )
}
