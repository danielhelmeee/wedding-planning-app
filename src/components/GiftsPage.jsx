import { useId, useState } from 'react'
import CountUp from './CountUp.jsx'
import { EVENT_BY_ID } from '../data/events.js'
import { EMPTY_GIFT, EMPTY_ITEM, METHODS, METHOD_BY_ID } from '../data/giftOptions.js'
import { giftSummary, giftsCSV, itemState } from '../gifts.js'
import { formatDate, formatRM, safeLink } from '../figures.js'
import { todayISO } from '../dates.js'
import { hrefFor } from '../useHashRoute.js'
import AddLine from './AddLine.jsx'
import { smooth } from '../motion.js'

const newId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
const toNumber = (v) => Math.max(0, Number(String(v).replace(/[^\d.]/g, '')) || 0)

// Log one gift: who, how much, how, at which event.
function GiftForm({ gift, guests, events, onSubmit, onCancel }) {
  const id = useId()
  const [v, setV] = useState(() => ({
    ...EMPTY_GIFT,
    date: todayISO(),
    ...gift,
    amount: gift?.amount ? String(gift.amount) : '',
  }))
  const [errors, setErrors] = useState({})
  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setV((x) => ({ ...x, [field]: value }))
    setErrors((x) => ({ ...x, [field]: '' }))
  }
  const present = v.method === 'present'

  function submit(e) {
    e.preventDefault()
    const next = {}
    if (!v.from.trim()) next.from = 'Who is it from?'
    if (!present && !toNumber(v.amount)) next.amount = 'Enter the amount in RM.'
    if (Object.keys(next).length) return setErrors(next)
    const from = v.from.trim()
    // Linked to a guest when the name is exactly one on the guest list.
    const guest = guests.find((g) => g.name.toLowerCase() === from.toLowerCase())
    onSubmit({
      ...v,
      from,
      guestId: guest?.id ?? null,
      amount: present ? 0 : toNumber(v.amount),
      note: v.note.trim(),
    })
  }

  return (
    <form className="vendor-form gift-form" onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="field field-wide">
          <label htmlFor={`${id}-from`}>From</label>
          <input
            id={`${id}-from`}
            type="text"
            list={`${id}-guests`}
            autoFocus={!gift}
            placeholder="Start typing a guest's name, or any name"
            value={v.from}
            onChange={set('from')}
            aria-invalid={Boolean(errors.from)}
          />
          <datalist id={`${id}-guests`}>
            {guests.map((g) => (
              <option key={g.id} value={g.name} />
            ))}
          </datalist>
          {errors.from && <p className="field-error">{errors.from}</p>}
        </div>
        <div className="field">
          <label htmlFor={`${id}-method`}>How</label>
          <select id={`${id}-method`} value={v.method} onChange={set('method')}>
            {METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        {!present && (
          <div className="field">
            <label htmlFor={`${id}-amount`}>Amount (RM)</label>
            <input
              id={`${id}-amount`}
              type="text"
              inputMode="decimal"
              placeholder="e.g. 50"
              value={v.amount}
              onChange={set('amount')}
              aria-invalid={Boolean(errors.amount)}
            />
            {errors.amount && <p className="field-error">{errors.amount}</p>}
          </div>
        )}
        <div className="field">
          <label htmlFor={`${id}-event`}>Event</label>
          <select id={`${id}-event`} value={v.event} onChange={set('event')}>
            <option value="">Not at an event</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${id}-date`}>Date received</label>
          <input id={`${id}-date`} type="date" value={v.date} onChange={set('date')} />
        </div>
        <div className="field field-wide">
          <label htmlFor={`${id}-note`}>{present ? 'What it is' : 'Note (optional)'}</label>
          <input
            id={`${id}-note`}
            type="text"
            placeholder={present ? 'e.g. Set of towels' : 'e.g. Given with Mak Ngah'}
            value={v.note}
            onChange={set('note')}
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {gift ? 'Save' : 'Add to the log'}
        </button>
        <button type="button" className="btn-text" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function GiftRow({ gift, guests, events, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const id = useId()
  if (editing) {
    return (
      <li className="vendor-row">
        <GiftForm
          gift={gift}
          guests={guests}
          events={events}
          onSubmit={(values) => {
            onUpdate(gift.id, values)
            smooth(() => setEditing(false))
          }}
          onCancel={() => smooth(() => setEditing(false))}
        />
      </li>
    )
  }
  const onList = gift.guestId && guests.some((g) => g.id === gift.guestId)
  return (
    <li className="vendor-row gift-row">
      <div className="row-main">
        <span className={`row-mark tone-${gift.thanked ? 'emerald' : 'ochre'}`} aria-hidden="true" />
        <div className="row-names">
          <p className="row-name">{gift.from}</p>
          <p className="row-category">
            {METHOD_BY_ID[gift.method].label}
            {gift.event && ` · ${EVENT_BY_ID[gift.event].label}`}
            {gift.date && ` · ${formatDate(gift.date)}`}
            {onList && ' · on your guest list'}
          </p>
          {gift.note && <p className="row-notes">{gift.note}</p>}
        </div>
        <p className="row-amount">{gift.method === 'present' ? 'Present' : formatRM(gift.amount)}</p>
      </div>
      <div className="row-controls">
        <label className="toggle gift-thanked" htmlFor={`${id}-thanked`}>
          <input
            id={`${id}-thanked`}
            type="checkbox"
            checked={gift.thanked}
            onChange={(e) => onUpdate(gift.id, { thanked: e.target.checked })}
          />
          <span>Thank-you sent</span>
        </label>
        <button type="button" className="btn-text" onClick={() => smooth(() => setEditing(true))}>
          Edit<span className="visually-hidden"> gift from {gift.from}</span>
        </button>
        <button type="button" className="btn-text btn-delete" onClick={() => onDelete(gift.id)}>
          Delete<span className="visually-hidden"> gift from {gift.from}</span>
        </button>
      </div>
    </li>
  )
}

// Add or edit a wish-list item.
function ItemForm({ item, onSubmit, onCancel }) {
  const id = useId()
  const [v, setV] = useState(() => ({ ...EMPTY_ITEM, ...item, price: item?.price ? String(item.price) : '' }))
  const [error, setError] = useState('')
  const set = (field) => (e) => {
    setV((x) => ({ ...x, [field]: e.target.value }))
    setError('')
  }
  function submit(e) {
    e.preventDefault()
    if (!v.name.trim()) return setError('Name the item.')
    onSubmit({ ...v, name: v.name.trim(), price: toNumber(v.price), link: v.link.trim(), note: v.note.trim() })
  }
  return (
    <form className="vendor-form gift-form" onSubmit={submit} noValidate>
      <div className="form-grid">
        <div className="field field-wide">
          <label htmlFor={`${id}-name`}>Item</label>
          <input
            id={`${id}-name`}
            type="text"
            autoFocus={!item}
            placeholder="e.g. Rice cooker"
            value={v.name}
            onChange={set('name')}
            aria-invalid={Boolean(error)}
          />
          {error && <p className="field-error">{error}</p>}
        </div>
        <div className="field">
          <label htmlFor={`${id}-price`}>Price around (RM, optional)</label>
          <input id={`${id}-price`} type="text" inputMode="decimal" value={v.price} onChange={set('price')} />
        </div>
        <div className="field">
          <label htmlFor={`${id}-link`}>Shop link (optional)</label>
          <input id={`${id}-link`} type="url" placeholder="https://…" value={v.link} onChange={set('link')} />
        </div>
        <div className="field field-wide">
          <label htmlFor={`${id}-note`}>Note for guests (optional)</label>
          <input
            id={`${id}-note`}
            type="text"
            placeholder="e.g. Any colour is fine"
            value={v.note}
            onChange={set('note')}
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {item ? 'Save' : 'Add to the wish list'}
        </button>
        <button type="button" className="btn-text" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

const STATE_LABEL = { open: 'Available', reserved: 'Reserved', received: 'Received' }
const STATE_TONE = { open: 'line', reserved: 'ochre', received: 'emerald' }

function ItemRow({ item, guests, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [marking, setMarking] = useState(false)
  const [who, setWho] = useState('')
  const id = useId()
  const state = itemState(item)
  const link = safeLink(item.link)
  const guest = item.guestId && guests.find((g) => g.id === item.guestId)

  if (editing) {
    return (
      <li className="vendor-row">
        <ItemForm
          item={item}
          onSubmit={(values) => {
            onUpdate(item.id, values)
            smooth(() => setEditing(false))
          }}
          onCancel={() => smooth(() => setEditing(false))}
        />
      </li>
    )
  }
  const clear = { reservedBy: '', reservedPhone: '', guestId: null, reservedAt: '', received: false }
  return (
    <li className={`vendor-row wish-item${state === 'received' ? ' is-done' : ''}`}>
      <div className="row-main">
        <span className={`row-mark tone-${STATE_TONE[state]}`} aria-hidden="true" />
        <div className="row-names">
          <p className="row-name">
            {link ? (
              <a className="row-link" href={link} target="_blank" rel="noopener noreferrer">
                {item.name}
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            ) : (
              item.name
            )}
          </p>
          <p className="row-category">
            {STATE_LABEL[state]}
            {item.reservedBy && ` · by ${item.reservedBy}`}
            {item.reservedPhone && ` (${item.reservedPhone})`}
            {guest && guest.name !== item.reservedBy && ` · matched to ${guest.name}`}
            {guest && guest.name === item.reservedBy && ' · on your guest list'}
            {item.reservedAt && item.reservedPhone && ' · via the invitation'}
          </p>
          {item.note && <p className="row-notes">{item.note}</p>}
        </div>
        <p className="row-amount">{item.price ? formatRM(item.price) : ''}</p>
      </div>
      {marking ? (
        <form
          className="wish-mark"
          onSubmit={(e) => {
            e.preventDefault()
            if (!who.trim()) return
            const g = guests.find((x) => x.name.toLowerCase() === who.trim().toLowerCase())
            onUpdate(item.id, { reservedBy: who.trim(), reservedPhone: '', guestId: g?.id ?? null, reservedAt: '' })
            setMarking(false)
          }}
        >
          <div className="field">
            <label htmlFor={`${id}-who`}>Reserved by</label>
            <input
              id={`${id}-who`}
              type="text"
              list={`${id}-guests`}
              autoFocus
              value={who}
              onChange={(e) => setWho(e.target.value)}
            />
            <datalist id={`${id}-guests`}>
              {guests.map((g) => (
                <option key={g.id} value={g.name} />
              ))}
            </datalist>
          </div>
          <button type="submit" className="btn-add-small" disabled={!who.trim()}>
            Mark reserved
          </button>
          <button type="button" className="btn-text" onClick={() => setMarking(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <div className="row-controls">
          {state === 'open' && (
            <button type="button" className="btn-add-small" onClick={() => setMarking(true)}>
              Mark reserved
            </button>
          )}
          <label className="toggle gift-thanked" htmlFor={`${id}-received`}>
            <input
              id={`${id}-received`}
              type="checkbox"
              checked={item.received}
              onChange={(e) => onUpdate(item.id, { received: e.target.checked })}
            />
            <span>Received</span>
          </label>
          {state !== 'open' && (
            <button type="button" className="btn-text" onClick={() => onUpdate(item.id, clear)}>
              Make available again
            </button>
          )}
          <button type="button" className="btn-text" onClick={() => smooth(() => setEditing(true))}>
            Edit<span className="visually-hidden"> {item.name}</span>
          </button>
          <button type="button" className="btn-text btn-delete" onClick={() => onDelete(item.id)}>
            Delete<span className="visually-hidden"> {item.name}</span>
          </button>
        </div>
      )}
    </li>
  )
}

export default function GiftsPage({ tab, gifts, guests, events, invite, onChange, onDeleted }) {
  const [adding, setAdding] = useState(null) // 'top' | 'bottom' | null
  const [eventFilter, setEventFilter] = useState('all')
  // Tabs change in place now, so an open form closes on a switch (each tab has its own form).
  const [formTab, setFormTab] = useState(tab)
  if (formTab !== tab) {
    setFormTab(tab)
    setAdding(null)
  }
  const wishTab = tab === 'wishlist'
  const summary = giftSummary(gifts.log)
  const counts = {
    open: gifts.wishlist.filter((i) => itemState(i) === 'open').length,
    reserved: gifts.wishlist.filter((i) => itemState(i) === 'reserved').length,
    received: gifts.wishlist.filter((i) => itemState(i) === 'received').length,
  }

  const update = (list) => (id, changes) =>
    onChange((g) => ({ ...g, [list]: g[list].map((x) => (x.id === id ? { ...x, ...changes } : x)) }))
  // Deleting is instant; Undo (in the toast) puts the entry back where it was.
  const remove = (list) => (id) => {
    const i = gifts[list].findIndex((x) => x.id === id)
    if (i < 0) return
    const item = gifts[list][i]
    onChange((g) => ({ ...g, [list]: g[list].filter((x) => x.id !== id) }))
    onDeleted?.(`Deleted ${item.from ?? item.name}`, () =>
      onChange((g) => ({ ...g, [list]: [...g[list].slice(0, i), item, ...g[list].slice(i)] })),
    )
  }
  const add = (list, prefix) => (values) =>
    smooth(() => {
      onChange((g) => ({ ...g, [list]: [{ ...values, id: newId(prefix) }, ...g[list]] }))
      setAdding(null)
    })

  const log = [...gifts.log]
    .filter((g) => eventFilter === 'all' || (eventFilter === 'none' ? !g.event : g.event === eventFilter))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

  function downloadCSV() {
    const csv = giftsCSV(
      gifts.log,
      (m) => METHOD_BY_ID[m].label,
      (e) => EVENT_BY_ID[e].label,
    )
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    a.download = 'gift-log.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const form =
    adding &&
    (wishTab ? (
      <ItemForm onSubmit={add('wishlist', 'wish')} onCancel={() => smooth(() => setAdding(null))} />
    ) : (
      <GiftForm
        guests={guests}
        events={events}
        onSubmit={add('log', 'gift')}
        onCancel={() => smooth(() => setAdding(null))}
      />
    ))
  const addLabel = wishTab ? 'Add an item' : 'Log a gift'
  const anotherLabel = wishTab ? 'Add another item' : 'Log another gift'
  const listCount = wishTab ? gifts.wishlist.length : gifts.log.length

  return (
    <>
      <header className="page-head page-head-actions">
        <div>
          <h1 className="page-title">Gifts & Angpow</h1>
          <p className="page-sub">A record of what you receive, and a wish list guests can reserve from.</p>
        </div>
        <div className="head-actions">
          {listCount > 0 && (
            <button type="button" className="btn-add" onClick={() => smooth(() => setAdding('top'))}>
              <span aria-hidden="true">+</span> {addLabel}
            </button>
          )}
          {!wishTab && gifts.log.length > 0 && (
            <button type="button" className="btn-secondary" onClick={downloadCSV}>
              Download as CSV
            </button>
          )}
        </div>
      </header>

      <section className="headcounts" aria-label="Gift figures">
        <div className="headcount">
          <p className="headcount-label">Received in total</p>
          <p className="headcount-figure">
            <CountUp value={summary.total} format={formatRM} />
          </p>
          <p className="headcount-sub">
            {summary.count} {summary.count === 1 ? 'gift' : 'gifts'}
            {summary.presents > 0 && ` · ${summary.presents} ${summary.presents === 1 ? 'present' : 'presents'}`}
          </p>
        </div>
        <div className="headcount">
          <p className="headcount-label">Cash</p>
          <p className="headcount-figure">
            <CountUp value={summary.byMethod.cash} format={formatRM} />
          </p>
          <p className="headcount-sub">in envelopes</p>
        </div>
        <div className="headcount">
          <p className="headcount-label">Transfer & QR</p>
          <p className="headcount-figure">
            <CountUp value={summary.byMethod.online} format={formatRM} />
          </p>
          <p className="headcount-sub">into your account</p>
        </div>
        <div className="headcount">
          <p className="headcount-label">Thank-yous to send</p>
          <p className="headcount-figure">{summary.toThank}</p>
          <p className="headcount-sub">of {summary.count} gifts logged</p>
        </div>
      </section>

      <div className="guest-toolbar">
        <nav data-slide className="tabs" aria-label="Gift sections">
          <a
            href={hrefFor({ page: 'gifts' })}
            className={`tab${!wishTab ? ' is-active' : ''}`}
            aria-current={!wishTab ? 'page' : undefined}
          >
            Gift log <span className="tab-count">{gifts.log.length}</span>
          </a>
          <a
            href={hrefFor({ page: 'gifts', tab: 'wishlist' })}
            className={`tab${wishTab ? ' is-active' : ''}`}
            aria-current={wishTab ? 'page' : undefined}
          >
            Wish list <span className="tab-count">{gifts.wishlist.length}</span>
          </a>
        </nav>
        {!wishTab && gifts.log.length > 0 && (
          <div className="guest-filters">
            <div className="field">
              <label htmlFor="gift-event">Event</label>
              <select
                id="gift-event"
                value={eventFilter}
                onChange={(e) => smooth(() => setEventFilter(e.target.value))}
              >
                <option value="all">All gifts</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
                <option value="none">Not at an event</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {wishTab && (
        <p className="fine-print wish-note">
          {counts.reserved} reserved · {counts.received} received · {counts.open} available.{' '}
          {invite.registry?.show ? (
            <>
              Shown on your invitation under &ldquo;Hadiah&rdquo; in the bottom menu: guests reserve an item with their
              name and phone number, so two people don&apos;t buy the same thing.{' '}
              <a href="#/invite">Change in E-invite</a>.
            </>
          ) : (
            <>
              Not shown on your invitation. <a href="#/invite">Turn it on in E-invite</a> to let guests reserve items.
            </>
          )}
        </p>
      )}

      {adding === 'top' && <section className="surface add-surface">{form}</section>}

      {(wishTab ? gifts.wishlist.length : log.length) > 0 || adding === 'bottom' ? (
        <section className="card-stack" aria-label={wishTab ? 'Wish list' : 'Gift log'}>
          <ul className="vendor-list item-cards">
            {wishTab
              ? gifts.wishlist.map((it) => (
                  <ItemRow
                    key={it.id}
                    item={it}
                    guests={guests}
                    onUpdate={update('wishlist')}
                    onDelete={remove('wishlist')}
                  />
                ))
              : log.map((g) => (
                  <GiftRow
                    key={g.id}
                    gift={g}
                    guests={guests}
                    events={events}
                    onUpdate={update('log')}
                    onDelete={remove('log')}
                  />
                ))}
          </ul>
          {adding === 'bottom' ? (
            <div className="add-panel">{form}</div>
          ) : (
            !adding && <AddLine label={anotherLabel} onClick={() => smooth(() => setAdding('bottom'))} />
          )}
        </section>
      ) : null}

      {!adding && (wishTab ? gifts.wishlist.length : log.length) === 0 && (
        <div className="empty-inline">
          <div>
            <p>
              {wishTab
                ? 'No items on your wish list yet.'
                : gifts.log.length
                  ? 'No gifts for this event.'
                  : 'No gifts logged yet.'}
            </p>
            <p>
              {wishTab
                ? 'Add things you would love to receive.'
                : gifts.log.length
                  ? 'Pick another event above.'
                  : 'Log each angpow or present as it comes in.'}
            </p>
          </div>
          {/* With nothing logged yet, the button lives here instead of the header. */}
          {listCount === 0 && (
            <div className="add-actions">
              <button type="button" className="btn-add" onClick={() => smooth(() => setAdding('bottom'))}>
                <span aria-hidden="true">+</span> {addLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
