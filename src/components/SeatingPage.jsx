import { useId, useRef, useState } from 'react'
import { FLOOR, SHAPES, SHAPE_BY_ID, findSpot, seatPositions, seatingFor, tableSize } from '../seating.js'
import { headcount } from '../guests.js'
import { SIDE_BY_ID } from '../data/guestOptions.js'
import { hrefFor } from '../useHashRoute.js'
import { smooth } from '../motion.js'

const people = (n) => `${n} ${n === 1 ? 'person' : 'people'}`
const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

function TableShape({ table, used, selected, dropTarget, picking }) {
  const { w, h, r } = tableSize(table)
  const over = used > table.seats
  const seats = seatPositions(table)
  return (
    <>
      {seats.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="8" className={`seat${i < used ? ' is-taken' : ''}`} />
      ))}
      {table.shape === 'round' ? (
        <circle r={r} className="table-top" />
      ) : (
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={table.shape === 'vip' ? 10 : 6} className="table-top" />
      )}
      {(selected || dropTarget || picking) &&
        (table.shape === 'round' ? (
          <circle r={r + 24} className={`table-ring${dropTarget || picking ? ' is-target' : ''}`} />
        ) : (
          <rect
            x={-w / 2 - 22}
            y={-h / 2 - 22}
            width={w + 44}
            height={h + 44}
            rx="14"
            className={`table-ring${dropTarget || picking ? ' is-target' : ''}`}
          />
        ))}
      <text y="-2" className={`table-name${table.shape === 'vip' ? ' is-vip' : ''}`}>
        {table.name}
      </text>
      <text y="17" className={`table-count${over ? ' is-over' : ''}`}>
        {used}/{table.seats}
      </text>
    </>
  )
}

function FloorPlan({ info, selectedId, pickedGuest, justSeated, onTableClick, onMove, onDropGuest }) {
  const svgRef = useRef(null)
  const drag = useRef(null)
  const [dragPos, setDragPos] = useState(null) // { id, x, y } while dragging
  const [dropOn, setDropOn] = useState(null)

  const toSvg = (e) => {
    const pt = svgRef.current.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    return pt.matrixTransform(svgRef.current.getScreenCTM().inverse())
  }

  function down(e, t) {
    if (e.button !== 0) return
    const p = toSvg(e)
    drag.current = { id: t.id, dx: p.x - t.x, dy: p.y - t.y, startX: e.clientX, startY: e.clientY, moved: false }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function move(e, t) {
    const d = drag.current
    if (!d || d.id !== t.id) return
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 4) return
    d.moved = true
    const p = toSvg(e)
    const { w, h } = tableSize(t)
    setDragPos({
      id: t.id,
      x: clamp(p.x - d.dx, w / 2 + 20, FLOOR.width - w / 2 - 20),
      y: clamp(p.y - d.dy, 120 + h / 2, FLOOR.height - h / 2 - 20),
    })
  }

  function up(t) {
    const d = drag.current
    drag.current = null
    if (!d) return
    if (d.moved && dragPos?.id === t.id) onMove(t.id, { x: Math.round(dragPos.x), y: Math.round(dragPos.y) })
    else onTableClick(t)
    setDragPos(null)
  }

  function key(e, t) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onTableClick(t)
      return
    }
    const step = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[e.key]
    if (step && selectedId === t.id) {
      e.preventDefault()
      const { w, h } = tableSize(t)
      onMove(t.id, {
        x: clamp(t.x + step[0], w / 2 + 20, FLOOR.width - w / 2 - 20),
        y: clamp(t.y + step[1], 120 + h / 2, FLOOR.height - h / 2 - 20),
      })
    }
  }

  return (
    <svg
      ref={svgRef}
      className="floor"
      viewBox={`0 0 ${FLOOR.width} ${FLOOR.height}`}
      role="group"
      aria-label="Floor plan. Drag tables to arrange them."
    >
      <rect x="0" y="0" width={FLOOR.width} height={FLOOR.height} className="floor-bg" />
      <g transform={`translate(${FLOOR.width / 2} 50)`}>
        <rect x="-150" y="-26" width="300" height="52" rx="8" className="pelamin" />
        <text y="6" className="pelamin-label">
          Pelamin
        </text>
      </g>
      {info.tables.map((t) => {
        const pos = dragPos?.id === t.id ? dragPos : t
        const label = `${t.name}, ${SHAPE_BY_ID[t.shape].label}, ${info.used[t.id]} of ${t.seats} seats taken`
        return (
          <g
            key={t.id}
            transform={`translate(${pos.x} ${pos.y})`}
            className={`floor-table${selectedId === t.id ? ' is-selected' : ''}${justSeated?.id === t.id ? ' just-seated' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={pickedGuest ? `Seat ${pickedGuest.name} at ${label}` : label}
            aria-pressed={selectedId === t.id}
            onPointerDown={(e) => down(e, t)}
            onPointerMove={(e) => move(e, t)}
            onPointerUp={() => up(t)}
            onPointerCancel={() => {
              drag.current = null
              setDragPos(null)
            }}
            onKeyDown={(e) => key(e, t)}
            onDragOver={(e) => {
              e.preventDefault()
              setDropOn(t.id)
            }}
            onDragLeave={() => setDropOn((d) => (d === t.id ? null : d))}
            onDrop={(e) => {
              e.preventDefault()
              setDropOn(null)
              onDropGuest(e.dataTransfer.getData('text/plain'), t)
            }}
          >
            <TableShape
              table={t}
              used={info.used[t.id]}
              selected={selectedId === t.id}
              dropTarget={dropOn === t.id}
              picking={Boolean(pickedGuest)}
            />
          </g>
        )
      })}
    </svg>
  )
}

function AddTableForm({ count, onAdd, onCancel }) {
  const id = useId()
  const [shape, setShape] = useState('round')
  const [seats, setSeats] = useState('10')
  const [name, setName] = useState('')

  function submit(e) {
    e.preventDefault()
    const n = Math.max(1, Math.min(40, Math.round(Number(seats) || SHAPE_BY_ID[shape].seats)))
    onAdd({ shape, seats: n, name: name.trim() || (shape === 'vip' ? 'VIP' : `Table ${count + 1}`) })
  }

  return (
    <form className="table-form" onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor={`${id}-shape`}>Shape</label>
        <select
          id={`${id}-shape`}
          value={shape}
          onChange={(e) => {
            setShape(e.target.value)
            setSeats(String(SHAPE_BY_ID[e.target.value].seats))
          }}
        >
          {SHAPES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`${id}-seats`}>Seats</label>
        <input
          id={`${id}-seats`}
          type="number"
          min="1"
          max="40"
          inputMode="numeric"
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor={`${id}-name`}>Name (optional)</label>
        <input
          id={`${id}-name`}
          type="text"
          placeholder={shape === 'vip' ? 'VIP' : `Table ${count + 1}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary">
          Add table
        </button>
        <button type="button" className="btn-text" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function TablePanel({ table, info, onUpdate, onDelete, onSeat, onUnseat, onClose }) {
  const id = useId()
  const seated = info.byTable[table.id]
  const used = info.used[table.id]
  const free = table.seats - used
  return (
    <section className="seat-panel" aria-labelledby={`${id}-title`}>
      <div className="section-head">
        <h2 id={`${id}-title`}>{table.name}</h2>
        <button type="button" className="btn-text" onClick={onClose}>
          Close
        </button>
      </div>
      <p className={`seat-free${free < 0 ? ' row-overdue' : ''}`}>
        {free >= 0
          ? `${used} of ${table.seats} seats taken · ${free} free`
          : `Over by ${-free}: remove someone or add seats`}
      </p>

      <div className="table-edit">
        <div className="field">
          <label htmlFor={`${id}-name`}>Name</label>
          <input
            id={`${id}-name`}
            type="text"
            value={table.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
          />
        </div>
        <div className="field">
          <label htmlFor={`${id}-seats`}>Seats</label>
          <input
            id={`${id}-seats`}
            type="number"
            min="1"
            max="40"
            inputMode="numeric"
            value={table.seats}
            onChange={(e) => onUpdate({ seats: Math.max(1, Math.min(40, Math.round(Number(e.target.value) || 1))) })}
          />
        </div>
        <div className="field">
          <label htmlFor={`${id}-shape`}>Shape</label>
          <select id={`${id}-shape`} value={table.shape} onChange={(e) => onUpdate({ shape: e.target.value })}>
            {SHAPES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h3 className="seat-subtitle">Seated here</h3>
      {seated.length ? (
        <ul className="seat-list">
          {seated.map((g) => (
            <li key={g.id}>
              <span>
                <strong>{g.name}</strong> · {people(headcount(g))}
              </span>
              <button type="button" className="btn-text btn-delete" onClick={() => onUnseat(g)}>
                Remove
                <span className="visually-hidden">
                  {' '}
                  {g.name} from {table.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="agenda-empty">Nobody yet.</p>
      )}

      {info.unassigned.length > 0 && (
        <div className="field seat-add">
          <label htmlFor={`${id}-seat`}>Seat a guest here</label>
          <select
            id={`${id}-seat`}
            value=""
            onChange={(e) => {
              const g = info.unassigned.find((x) => x.id === e.target.value)
              if (g) onSeat(g)
            }}
          >
            <option value="">Choose a guest…</option>
            {info.unassigned.map((g) => (
              <option key={g.id} value={g.id} disabled={headcount(g) > free}>
                {g.name} ({people(headcount(g))}){headcount(g) > free ? ', does not fit' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      <button type="button" className="btn-text btn-delete table-delete" onClick={() => onDelete()}>
        Delete this table
      </button>
    </section>
  )
}

export default function SeatingPage({
  tab,
  events,
  guests,
  seating,
  onAddTable,
  onUpdateTable,
  onDeleteTable,
  onAssign,
}) {
  const event = events.find((e) => e.id === tab) ?? events.find((e) => e.id === 'sanding') ?? events[0]
  const [selectedId, setSelectedId] = useState(null)
  const [pickedId, setPickedId] = useState(null)
  const [draggingId, setDraggingId] = useState(null)
  const [justSeated, setJustSeated] = useState(null) // { id, at }: the table that just got a guest
  const [adding, setAdding] = useState(false)
  // Event tabs change in place now: start each event with nothing selected and the form closed.
  const [shownTab, setShownTab] = useState(tab)
  if (shownTab !== tab) {
    setShownTab(tab)
    setSelectedId(null)
    setPickedId(null)
    setAdding(false)
  }
  const [message, setMessage] = useState(null) // { text, tone }

  if (!event) {
    return (
      <>
        <header className="page-head">
          <h1 className="page-title">Seating</h1>
        </header>
        <p className="muted">All events are switched off in Settings.</p>
      </>
    )
  }

  const info = seatingFor(seating, guests, event.id)
  const selected = info.tables.find((t) => t.id === selectedId) ?? null
  const picked = info.unassigned.find((g) => g.id === pickedId) ?? null

  // Seats a guest at a table if their whole party fits.
  function seat(guest, table) {
    const free = table.seats - info.used[table.id]
    if (headcount(guest) > free) {
      setMessage({
        tone: 'error',
        text: `${table.name} has ${free} free seat${free === 1 ? '' : 's'}; ${guest.name} needs ${headcount(guest)}.`,
      })
      return
    }
    onAssign(event.id, guest.id, table.id)
    // A brief golden pulse on the table confirms where they went.
    setJustSeated({ id: table.id, at: Date.now() })
    setPickedId(null)
    setMessage({ tone: 'ok', text: `${guest.name} seated at ${table.name}.` })
  }

  function tableClick(t) {
    if (picked) seat(picked, t)
    else setSelectedId((id) => (id === t.id ? null : t.id))
  }

  return (
    <>
      <header className="page-head page-head-actions">
        <div>
          <h1 className="page-title">Seating</h1>
          <p className="page-sub">
            {info.tables.length === 0 ? (
              `No tables yet · ${info.attendingPeople} attending ${info.attendingPeople === 1 ? 'person' : 'people'} to seat`
            ) : (
              <>
                {info.tables.length} table{info.tables.length === 1 ? '' : 's'} · {info.seats} seats ·{' '}
                {info.seatedPeople} of {info.attendingPeople} attending people seated
                {info.unassignedPeople > 0 && ` · ${info.unassignedPeople} still to seat`}
                {info.seats < info.attendingPeople && ` · ${info.attendingPeople - info.seats} more seats needed`}
              </>
            )}
          </p>
        </div>
        <div className="head-actions">
          <button type="button" className="btn-add" onClick={() => smooth(() => setAdding(true))}>
            <span aria-hidden="true">+</span> Add a table
          </button>
        </div>
      </header>

      <nav data-slide className="tabs" aria-label="Events">
        {events.map((e) => (
          <a
            key={e.id}
            href={hrefFor({ page: 'seating', tab: e.id })}
            className={`tab${e.id === event.id ? ' is-active' : ''}`}
            aria-current={e.id === event.id ? 'page' : undefined}
          >
            {e.label}
          </a>
        ))}
      </nav>

      <div data-tab-panel="seating">
        {adding && (
          <section className="surface add-surface">
            <h3 className="add-title">Add a table for {event.label}</h3>
            <AddTableForm
              count={info.tables.length}
              onAdd={(t) =>
                smooth(() => {
                  const id = `tb_${Date.now()}`
                  onAddTable({ id, event: event.id, ...t, ...findSpot(t, info.tables) })
                  setAdding(false)
                  setSelectedId(id)
                }, 'swap')
              }
              onCancel={() => smooth(() => setAdding(false))}
            />
          </section>
        )}

        {message && (
          <p className={`seat-message${message.tone === 'error' ? ' is-error' : ''}`} role="status">
            {message.text}
          </p>
        )}

        <div className="seating-layout">
          <section className="surface floor-surface" aria-label={`Floor plan for ${event.label}`}>
            {info.tables.length ? (
              <div className="floor-scroll">
                <FloorPlan
                  key={justSeated?.at}
                  info={info}
                  justSeated={justSeated}
                  selectedId={selectedId}
                  pickedGuest={picked}
                  onTableClick={tableClick}
                  onMove={onUpdateTable}
                  onDropGuest={(guestId, t) => {
                    const g = info.unassigned.find((x) => x.id === guestId) ?? guests.find((x) => x.id === guestId)
                    if (g) seat(g, t)
                  }}
                />
              </div>
            ) : (
              <div className="empty-inline floor-empty">
                <div>
                  <p>No tables for {event.label} yet.</p>
                  <p>Add round, long banquet or VIP tables, then seat your attending guests.</p>
                </div>
                {!adding && (
                  <button type="button" className="btn-add" onClick={() => smooth(() => setAdding(true))}>
                    <span aria-hidden="true">+</span> Add a table
                  </button>
                )}
              </div>
            )}
            {info.tables.length > 0 && (
              <p className="floor-hint">
                Drag tables to arrange them. Drag a guest onto a table, or tap a guest and then a table.
              </p>
            )}
          </section>

          <aside className="seating-side">
            {selected ? (
              <TablePanel
                key={selected.id}
                table={selected}
                info={info}
                onUpdate={(changes) => onUpdateTable(selected.id, changes)}
                onDelete={() => {
                  onDeleteTable(selected.id)
                  setSelectedId(null)
                }}
                onSeat={(g) => seat(g, selected)}
                onUnseat={(g) => {
                  onAssign(event.id, g.id, null)
                  setMessage(null)
                }}
                onClose={() => setSelectedId(null)}
              />
            ) : (
              <section className="seat-panel" aria-labelledby="unassigned-title">
                <div className="section-head">
                  <h2 id="unassigned-title">Unassigned</h2>
                  <span className="section-note">{people(info.unassignedPeople)}</span>
                </div>
                {info.unassigned.length ? (
                  <ul className="guest-picks">
                    {info.unassigned.map((g) => (
                      <li key={g.id}>
                        <button
                          type="button"
                          draggable
                          className={`guest-pick${pickedId === g.id ? ' is-picked' : ''}${draggingId === g.id ? ' is-dragging' : ''}`}
                          aria-pressed={pickedId === g.id}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', g.id)
                            e.dataTransfer.effectAllowed = 'move'
                            setDraggingId(g.id)
                          }}
                          onDragEnd={() => setDraggingId(null)}
                          onClick={() => {
                            setPickedId((id) => (id === g.id ? null : g.id))
                            setMessage(
                              pickedId === g.id ? null : { tone: 'ok', text: `Now tap a table to seat ${g.name}.` },
                            )
                          }}
                        >
                          <span className="guest-pick-name">{g.name}</span>
                          <span className="guest-pick-meta">
                            {people(headcount(g))} · {SIDE_BY_ID[g.side].label}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : info.attendingPeople ? (
                  <p className="agenda-empty">Everyone attending {event.label} has a seat.</p>
                ) : (
                  <p className="agenda-empty">
                    No attending guests for {event.label} yet. Mark replies on the <a href="#/guests">Guests</a> page.
                  </p>
                )}
                {info.tables.length > 0 && (
                  <p className="fine-print">Select a table to rename it, change seats or remove guests.</p>
                )}
              </section>
            )}
          </aside>
        </div>
      </div>
    </>
  )
}
