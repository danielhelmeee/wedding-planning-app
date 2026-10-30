import { useState } from 'react'
import CountUp from './CountUp.jsx'
import GuestForm from './GuestForm.jsx'
import GuestRow from './GuestRow.jsx'
import GuestImport from './GuestImport.jsx'
import GuestReplies from './GuestReplies.jsx'
import AddLine from './AddLine.jsx'
import { GROUPS, RSVP, RSVP_BY_ID, SIDES, SIDE_BY_ID } from '../data/guestOptions.js'
import { EVENT_BY_ID } from '../data/events.js'
import { eventHeadcounts, guestSummary, headcount } from '../guests.js'
import { formatDate } from '../figures.js'
import { smooth } from '../motion.js'

const csvCell = (v) => {
  const t = String(v ?? '')
  return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
}

// The guest list as a spreadsheet file, e.g. for the caterer or family.
function downloadGuests(guests) {
  const rows = [['Name', 'Phone', 'Side', 'Group', 'Invited to', 'Reply', 'People', 'Dietary', 'Notes']]
  for (const g of [...guests].sort((a, b) => a.name.localeCompare(b.name))) {
    rows.push([
      g.name,
      g.phone,
      SIDE_BY_ID[g.side].label,
      g.group,
      g.events.map((e) => EVENT_BY_ID[e].label).join(', '),
      RSVP_BY_ID[g.status].label,
      headcount(g),
      g.dietary,
      g.notes,
    ])
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(
    new Blob([rows.map((r) => r.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }),
  )
  a.download = 'guest-list.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}

export default function GuestsPage({
  guests,
  settings,
  events,
  onAdd,
  onAddMany,
  onUpdate,
  onDelete,
  allGuests,
  giftTotals = {},
  replies,
  replyActions,
}) {
  const [tab, setTab] = useState('all')
  const [side, setSide] = useState('all')
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')
  const [sort, setSort] = useState('name')
  // Which form is open and where: { mode: 'one' | 'import', at: 'top' | 'bottom' }, or null.
  const [adding, setAdding] = useState(null)

  const summary = guestSummary(guests)
  const headcounts = eventHeadcounts(guests, settings)

  const q = query.trim().toLowerCase()
  const qDigits = q.replace(/\D/g, '')
  // Search names, groups, notes and phone numbers (digits only, so "012 345" finds "012-345 6789").
  const matches = (g) =>
    !q ||
    [g.name, g.group, g.notes, g.dietary].some((t) => t?.toLowerCase().includes(q)) ||
    (qDigits.length >= 3 && g.phone.replace(/\D/g, '').includes(qDigits))
  const SORTS = {
    name: (a, b) => a.name.localeCompare(b.name),
    side: (a, b) => a.side.localeCompare(b.side) || a.group.localeCompare(b.group) || a.name.localeCompare(b.name),
    replied: (a, b) => (b.repliedAt || '').localeCompare(a.repliedAt || '') || a.name.localeCompare(b.name),
    people: (a, b) => headcount(b) - headcount(a) || a.name.localeCompare(b.name),
  }
  const bySideAndName = guests
    .filter((g) => (side === 'all' || g.side === side) && (group === 'all' || g.group === group) && matches(g))
    .sort(SORTS[sort])
  const groupsInUse = GROUPS.filter((x) => guests.some((g) => g.group === x))
  const shown = tab === 'all' ? bySideAndName : bySideAndName.filter((g) => g.status === tab)
  const tabs = [{ id: 'all', label: 'All' }, ...RSVP].map((t) => ({
    ...t,
    count: t.id === 'all' ? bySideAndName.length : bySideAndName.filter((g) => g.status === t.id).length,
  }))

  const close = () => smooth(() => setAdding(null))
  const open = (mode, at) => smooth(() => setAdding({ mode, at }))

  const form = adding && (
    <>
      <h3 className="add-title">{adding.mode === 'import' ? 'Import guests' : 'Add a guest'}</h3>
      {adding.mode === 'import' ? (
        <GuestImport
          events={events}
          existingNames={guests.map((g) => g.name)}
          onImport={(list) => {
            onAddMany(list)
            close()
          }}
          onCancel={close}
        />
      ) : (
        <GuestForm
          events={events}
          onSubmit={(guest) => {
            onAdd(guest)
            close()
          }}
          onCancel={close}
        />
      )}
    </>
  )

  return (
    <>
      <header className="page-head page-head-actions">
        <div>
          <h1 className="page-title">Guests</h1>
          <p className="page-sub">
            {summary.invited} invited ({summary.invitedPeople} people) · {summary.attending} attending (
            {summary.attendingPeople} people) · {summary.pending} awaiting reply · {summary.declined} declined
          </p>
        </div>
        {guests.length > 0 && (
          <div className="head-actions">
            <button type="button" className="btn-add" onClick={() => open('one', 'top')}>
              <span aria-hidden="true">+</span> Add a guest
            </button>
            <button type="button" className="btn-secondary" onClick={() => open('import', 'top')}>
              Import guests
            </button>
            <button type="button" className="btn-secondary" onClick={() => downloadGuests(guests)}>
              Download CSV
            </button>
          </div>
        )}
      </header>

      {adding?.at === 'top' && <section className="surface add-surface">{form}</section>}

      <GuestReplies replies={replies} guests={allGuests} actions={replyActions} />

      {headcounts.length > 0 && (
        <section className="headcounts" aria-label="Attending headcount per event">
          {headcounts.map((e) => (
            <div key={e.id} className="headcount">
              <p className="headcount-label">
                {e.label}
                {settings.events[e.id].date && ` · ${formatDate(settings.events[e.id].date)}`}
              </p>
              <p className="headcount-figure">
                <CountUp value={e.attendingPeople} />
              </p>
              <p className="headcount-sub">
                people attending · {e.pending} {e.pending === 1 ? 'reply' : 'replies'} awaited
              </p>
            </div>
          ))}
        </section>
      )}

      <div className="guest-toolbar">
        <nav data-slide className="tabs" aria-label="Filter by reply">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tab tab-button${tab === t.id ? ' is-active' : ''}`}
              aria-pressed={tab === t.id}
              onClick={() => smooth(() => setTab(t.id))}
            >
              {t.label} <span className="tab-count">{t.count}</span>
            </button>
          ))}
        </nav>
        <div className="guest-filters">
          <div className="field">
            <label htmlFor="guest-side">Side</label>
            <select id="guest-side" value={side} onChange={(e) => smooth(() => setSide(e.target.value))}>
              <option value="all">All guests</option>
              {SIDES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="guest-group">Group</label>
            <select id="guest-group" value={group} onChange={(e) => smooth(() => setGroup(e.target.value))}>
              <option value="all">All groups</option>
              {groupsInUse.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="guest-sort">Sort</label>
            <select id="guest-sort" value={sort} onChange={(e) => smooth(() => setSort(e.target.value))}>
              <option value="name">Name A–Z</option>
              <option value="side">Side and group</option>
              <option value="people">Most people first</option>
              <option value="replied">Latest replies first</option>
            </select>
          </div>
          <div className="field guest-search">
            <label htmlFor="guest-search">Search</label>
            <input
              id="guest-search"
              type="search"
              placeholder="Name, group or phone"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {(shown.length > 0 || adding?.at === 'bottom') && (
        <section className="guest-surface" aria-label="Guest list">
          {shown.length > 0 && (
            <ul className="vendor-list guest-list">
              {shown.map((g) => (
                <GuestRow
                  key={g.id}
                  guest={g}
                  events={events}
                  gift={giftTotals[g.id]}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          )}
          {adding?.at === 'bottom' ? (
            <div className="add-panel">{form}</div>
          ) : (
            shown.length > 0 && !adding && <AddLine label="Add another guest" onClick={() => open('one', 'bottom')} />
          )}
        </section>
      )}

      {!adding && shown.length === 0 && (
        <div className="empty-inline">
          <div>
            <p>{guests.length ? 'No guests match this filter.' : 'No guests yet.'}</p>
            <p>
              {guests.length ? 'Try another reply, side, group or search.' : 'Add them one by one, or import a list.'}
            </p>
          </div>
          {/* With no guests at all, the buttons live here instead of the header. */}
          {guests.length === 0 && (
            <div className="add-actions">
              <button type="button" className="btn-add" onClick={() => open('one', 'bottom')}>
                <span aria-hidden="true">+</span> Add a guest
              </button>
              <button type="button" className="btn-secondary" onClick={() => open('import', 'bottom')}>
                Import guests
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
