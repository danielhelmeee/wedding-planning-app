import { useId, useState } from 'react'
import { EVENT_BY_ID } from '../data/events.js'
import { GROUPS, SIDES } from '../data/guestOptions.js'
import { nameMatch, phoneMatches } from '../rsvp.js'

const when = (iso) =>
  iso
    ? new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(iso))
    : ''

const answer = (r) =>
  r.coming
    ? `Attending · ${r.people} ${r.people === 1 ? 'person' : 'people'}${r.events.length ? ` · ${r.events.map((e) => EVENT_BY_ID[e].label).join(', ')}` : ''}`
    : "Can't attend"

const OUTCOME = {
  linked: 'updated automatically (phone number matched)',
  manual: 'linked by you',
  added: 'added as a new guest',
}

// A reply nobody matched: link it to a guest, add it as a new guest, or dismiss it.
function ReviewCard({ reply, guests, actions }) {
  const id = useId()
  const shared = phoneMatches(guests, reply.phone)
  const suggested = shared.length ? null : nameMatch(guests, reply.name)
  const [guestId, setGuestId] = useState(suggested?.id ?? '')
  const [side, setSide] = useState('bride')
  const [group, setGroup] = useState('Other')
  const sorted = [...guests].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <li className="reply-card">
      <div className="reply-head">
        <p className="row-name">{reply.name}</p>
        <p className="reply-when">{when(reply.at)}</p>
      </div>
      <p className="reply-answer">
        <span className={`reply-dot tone-${reply.coming ? 'emerald' : 'terracotta'}`} aria-hidden="true" />
        {answer(reply)}
      </p>
      <p className="row-category">
        {reply.phone}
        {shared.length > 1
          ? ` · this number belongs to ${shared.length} guests (${shared.map((g) => g.name).join(', ')}), so pick one`
          : ' · no guest has this phone number yet'}
      </p>
      {reply.note && <p className="row-notes">“{reply.note}”</p>}

      <div className="reply-actions">
        <div className="reply-action">
          <div className="field">
            <label htmlFor={`${id}-guest`}>Link to a guest on your list</label>
            <select id={`${id}-guest`} value={guestId} onChange={(e) => setGuestId(e.target.value)}>
              <option value="">Choose a guest…</option>
              {(shared.length > 1 ? shared : sorted).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                  {g.phone ? ` (${g.phone})` : ''}
                </option>
              ))}
            </select>
            {suggested && <p className="field-hint">Same name as a guest on your list.</p>}
          </div>
          <button type="button" className="btn-add-small" disabled={!guestId} onClick={() => actions.link(reply, guestId)}>
            Link reply
          </button>
        </div>
        <div className="reply-action">
          <div className="field">
            <label htmlFor={`${id}-side`}>Or add as a new guest</label>
            <div className="reply-new">
              <select id={`${id}-side`} value={side} onChange={(e) => setSide(e.target.value)}>
                {SIDES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <select aria-label="Group" value={group} onChange={(e) => setGroup(e.target.value)}>
                {GROUPS.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="button" className="btn-add-small" onClick={() => actions.add(reply, { side, group })}>
            Add guest
          </button>
        </div>
      </div>
      <button type="button" className="btn-text btn-delete reply-dismiss" onClick={() => actions.dismiss(reply)}>
        Dismiss<span className="visually-hidden"> reply from {reply.name}</span>
      </button>
    </li>
  )
}

export default function GuestReplies({ replies, guests, actions }) {
  const [showAll, setShowAll] = useState(false)
  const review = replies.filter((r) => r.state === 'review')
  const done = replies.filter((r) => OUTCOME[r.state])
  if (!review.length && !done.length) return null
  const nameOf = (gid) => guests.find((g) => g.id === gid)?.name
  const recent = showAll ? done : done.slice(0, 4)

  return (
    <section className="surface replies" aria-labelledby="replies-title">
      <div className="replies-head">
        <h2 id="replies-title">Replies from the invitation</h2>
        <p className="field-hint">
          Matched to your list by phone number. Replies from guests&apos; own phones arrive once the app is online.
        </p>
      </div>

      {review.length > 0 && (
        <>
          <h3 className="replies-sub">
            {review.length} {review.length === 1 ? 'reply needs' : 'replies need'} you
          </h3>
          <ul className="reply-list">
            {review.map((r) => (
              <ReviewCard key={r.id} reply={r} guests={guests} actions={actions} />
            ))}
          </ul>
        </>
      )}

      {done.length > 0 && (
        <>
          <h3 className="replies-sub">Recent replies</h3>
          <ul className="reply-log">
            {recent.map((r) => (
              <li key={r.id}>
                <span className={`reply-dot tone-${r.coming ? 'emerald' : 'terracotta'}`} aria-hidden="true" />
                <span>
                  <strong>{r.name}</strong> · {answer(r)}
                  <span className="reply-outcome">
                    {nameOf(r.guestId) && r.state !== 'added' ? `${nameOf(r.guestId)} ` : ''}
                    {OUTCOME[r.state]} · {when(r.at)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <div className="replies-foot">
            {done.length > 4 && (
              <button type="button" className="btn-text" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Show fewer' : `Show all ${done.length}`}
              </button>
            )}
            <button type="button" className="btn-text" onClick={actions.clear}>
              Clear this history
            </button>
          </div>
        </>
      )}
    </section>
  )
}
