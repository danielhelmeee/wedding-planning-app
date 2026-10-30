import { useState } from 'react'
import TaskRow from './TaskRow.jsx'
import AddTaskForm from './AddTaskForm.jsx'
import { calendarItems } from '../calendar.js'
import {
  addDays,
  addMonths,
  dayLabel,
  fromISO,
  monthGrid,
  monthLabel,
  sameMonth,
  shortDayLabel,
  todayISO,
  weekDays,
  weekLabel,
} from '../dates.js'
import { hrefFor } from '../useHashRoute.js'
import { smooth } from '../motion.js'

const VIEWS = [
  { id: 'month', label: 'Month' },
  { id: 'week', label: 'Week' },
  { id: 'day', label: 'Day' },
  { id: 'year', label: 'Year' },
]
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_SHORT = new Intl.DateTimeFormat('en-GB', { month: 'long' })

const isLate = (i) => i.overdue || (i.task && !i.task.done && i.task.daysLeft < 0)
// What the grids show: events, payments and open tasks (done tasks stay in the day panel).
const openItems = (items) => items.filter((i) => !i.task?.done)

// The full list for one day: event banner, payments, tasks you can tick, then "+ Add a task".
function DayAgenda({ date, items, handlers, categories, onAdd }) {
  const [adding, setAdding] = useState(false)
  const tasks = items.filter((i) => i.kind === 'task')
  return (
    <>
      {!items.length && <p className="agenda-empty">Nothing planned.</p>}
      {items
        .filter((i) => i.kind === 'event')
        .map((i) => (
          <p key={i.key} className="agenda-event">
            <span className="agenda-mark mark-event" aria-hidden="true" />
            {i.title}
          </p>
        ))}
      {items
        .filter((i) => i.kind === 'payment')
        .map((i) => (
          <div key={i.key} className="agenda-payment">
            <span className="agenda-mark mark-payment" aria-hidden="true" />
            <div>
              <a href={hrefFor({ page: 'category', category: i.vendor.category })} className="agenda-title">
                {i.title}
              </a>
              <p className={`task-meta${i.overdue ? ' row-overdue' : ''}`}>
                {i.overdue ? 'Overdue · ' : ''}
                {i.detail}
              </p>
            </div>
          </div>
        ))}
      {tasks.length > 0 && (
        <ul className="task-list">
          {tasks.map((i) => (
            <TaskRow key={i.key} task={i.task} hideDate inChecklist {...handlers} />
          ))}
        </ul>
      )}
      {adding ? (
        <AddTaskForm
          inline
          categories={categories}
          defaultDate={date}
          onAdd={(task) => {
            onAdd(task)
            setAdding(false)
          }}
          onCancel={() => setAdding(false)}
        />
      ) : (
        <button type="button" className="btn-add-small" onClick={() => setAdding(true)}>
          <span aria-hidden="true">+</span> Add a task
        </button>
      )}
    </>
  )
}

// One item inside a grid cell. The full title shows on hover.
function CellItem({ item }) {
  return (
    <span
      className={`cell-item kind-${item.kind}${isLate(item) ? ' is-overdue' : ''}`}
      title={item.kind === 'payment' ? `${item.title} · ${item.detail}` : item.title}
    >
      {item.title}
    </span>
  )
}

function DayCell({ day, cursor, selected, today, items, onSelect, max = 2, showOther = true }) {
  const open = openItems(items)
  const event = open.find((i) => i.kind === 'event')
  const rest = open.filter((i) => i.kind !== 'event')
  const classes = [
    'month-cell',
    showOther && !sameMonth(day, cursor) && 'is-other',
    day === today && 'is-today',
    day === selected && 'is-selected',
    event && 'is-event',
  ]
  return (
    <button
      type="button"
      role="gridcell"
      className={classes.filter(Boolean).join(' ')}
      aria-pressed={day === selected}
      aria-label={`${dayLabel(day)}${open.length ? `, ${open.length} item${open.length > 1 ? 's' : ''}` : ''}${event ? `, ${event.title}` : ''}`}
      onClick={() => onSelect(day)}
    >
      <span className="cell-day">{fromISO(day).getDate()}</span>
      {event && (
        <span className="cell-event" aria-hidden="true">
          {open
            .filter((i) => i.kind === 'event')
            .map((i) => i.title)
            .join(' · ')}
        </span>
      )}
      <span className="cell-items" aria-hidden="true">
        {rest.slice(0, max).map((i) => (
          <CellItem key={i.key} item={i} />
        ))}
        {rest.length > max && <span className="cell-more">+{rest.length - max} more</span>}
      </span>
      <span className="cell-dots" aria-hidden="true">
        {open.slice(0, 4).map((i) => (
          <span key={i.key} className={`dot kind-${i.kind}`} />
        ))}
      </span>
    </button>
  )
}

function MonthView({ cursor, selected, onSelect, byDay, today }) {
  return (
    <div className="month" role="grid" aria-label={monthLabel(cursor)}>
      <div className="month-head" role="row">
        {WEEKDAYS.map((d) => (
          <span key={d} role="columnheader">
            {d}
          </span>
        ))}
      </div>
      <div className="month-grid">
        {monthGrid(cursor).map((day) => (
          <DayCell
            key={day}
            day={day}
            cursor={cursor}
            selected={selected}
            today={today}
            items={byDay.get(day) ?? []}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

// Seven columns, like the month grid but taller, so titles have room.
function WeekView({ cursor, selected, onSelect, byDay, today }) {
  return (
    <div className="month week-grid" role="grid" aria-label={weekLabel(cursor)}>
      <div className="month-head" role="row">
        {weekDays(cursor).map((d) => (
          <span key={d} role="columnheader" className={d === today ? 'is-today' : undefined}>
            {shortDayLabel(d).replace(/ \w+$/, '')}
          </span>
        ))}
      </div>
      <div className="month-grid">
        {weekDays(cursor).map((day) => (
          <DayCell
            key={day}
            day={day}
            cursor={cursor}
            selected={selected}
            today={today}
            items={byDay.get(day) ?? []}
            onSelect={onSelect}
            max={6}
            showOther={false}
          />
        ))}
      </div>
    </div>
  )
}

// Twelve small months from the cursor's month: the whole planning road at a glance.
function YearView({ cursor, byDay, today, onPickDay, onPickMonth }) {
  const first = addMonths(cursor, 0)
  const months = Array.from({ length: 12 }, (_, i) => addMonths(first, i))
  return (
    <div className="year-grid">
      {months.map((m) => {
        const days = monthGrid(m)
        const count = days.filter((d) => sameMonth(d, m)).reduce((n, d) => n + openItems(byDay.get(d) ?? []).length, 0)
        return (
          <section key={m} className="year-month surface">
            <button type="button" className="year-month-title" onClick={() => onPickMonth(m)}>
              {MONTH_SHORT.format(fromISO(m))} {m.slice(0, 4)}
              <span>{count ? `${count} item${count > 1 ? 's' : ''}` : ''}</span>
            </button>
            <div className="year-days" role="grid" aria-label={monthLabel(m)}>
              {WEEKDAYS.map((d) => (
                <span key={d} className="year-wd" aria-hidden="true">
                  {d[0]}
                </span>
              ))}
              {days.map((d) => {
                if (!sameMonth(d, m)) return <span key={d} className="year-day is-blank" />
                const items = openItems(byDay.get(d) ?? [])
                const kind = items.some((i) => i.kind === 'event')
                  ? 'event'
                  : items.some((i) => i.kind === 'payment')
                    ? 'payment'
                    : items.length
                      ? 'task'
                      : ''
                return (
                  <button
                    key={d}
                    type="button"
                    className={`year-day${kind ? ` has-${kind}` : ''}${d === today ? ' is-today' : ''}`}
                    aria-label={`${dayLabel(d)}${items.length ? `, ${items.length} item${items.length > 1 ? 's' : ''}` : ''}`}
                    onClick={() => onPickDay(d)}
                  >
                    {fromISO(d).getDate()}
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default function CalendarPage({ settings, vendors, tasks, categories, onAdd, handlers }) {
  const today = todayISO()
  const [view, setView] = useState('month')
  const [cursor, setCursor] = useState(today)
  const byDay = calendarItems(settings, vendors, tasks)
  const late = tasks.filter((t) => !t.done && t.daysLeft !== null && t.daysLeft < 0).length

  const step = (dir) =>
    smooth(
      () => {
        if (view === 'month') setCursor((c) => addMonths(c, dir))
        else if (view === 'year') setCursor((c) => addMonths(c, 12 * dir))
        else setCursor((c) => addDays(c, view === 'week' ? 7 * dir : dir))
      },
      'swap',
      dir,
    )
  // The selected day is the cursor; moving months selects the 1st of the new month.
  const selected = cursor
  const lastMonth = addMonths(cursor, 11)
  const label =
    view === 'month'
      ? monthLabel(cursor)
      : view === 'week'
        ? weekLabel(cursor)
        : view === 'year'
          ? `${monthLabel(addMonths(cursor, 0))} – ${monthLabel(lastMonth)}`
          : dayLabel(cursor)

  // Next dated event, for the "Jump to" shortcut.
  const nextEventDay = [...byDay.entries()]
    .filter(([d, items]) => d >= today && items.some((i) => i.kind === 'event'))
    .sort(([a], [b]) => a.localeCompare(b))[0]

  const panel = (
    <section className="day-panel" aria-labelledby="day-panel-title">
      <h2 id="day-panel-title" className="day-panel-title">
        {dayLabel(selected)}
        {selected === today && <span className="today-tag">Today</span>}
      </h2>
      <DayAgenda
        key={selected}
        date={selected}
        items={byDay.get(selected) ?? []}
        handlers={handlers}
        categories={categories}
        onAdd={onAdd}
      />
    </section>
  )

  return (
    <>
      <header className="page-head">
        <h1 className="page-title">Calendar</h1>
        <p className="page-sub">Your event days, vendor payments and checklist tasks, by date.</p>
      </header>

      {late > 0 && (
        <p className="calendar-alert">
          <span className="row-catch-up">
            {late} {late > 1 ? 'tasks' : 'task'} to catch up on
          </span>{' '}
          · <a href="#/checklist">See them in the Checklist</a>
        </p>
      )}

      <div className="calendar-toolbar">
        <div className="calendar-nav">
          <button type="button" className="btn-secondary" onClick={() => smooth(() => setCursor(today), 'swap')}>
            Today
          </button>
          <button type="button" className="icon-button" onClick={() => step(-1)} aria-label={`Previous ${view}`}>
            ‹
          </button>
          <button type="button" className="icon-button" onClick={() => step(1)} aria-label={`Next ${view}`}>
            ›
          </button>
          <h2 className="calendar-label" aria-live="polite">
            {label}
          </h2>
          {nextEventDay && (
            <button
              type="button"
              className="btn-text calendar-jump"
              onClick={() =>
                smooth(() => {
                  setCursor(nextEventDay[0])
                  if (view === 'year') setView('month')
                }, 'swap')
              }
            >
              Jump to {nextEventDay[1].find((i) => i.kind === 'event').title}
            </button>
          )}
        </div>
        <div data-slide className="view-switch" role="group" aria-label="Calendar view">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              className={`view-option${view === v.id ? ' is-active' : ''}`}
              aria-pressed={view === v.id}
              onClick={() =>
                smooth(() => {
                  setView(v.id)
                  // The year view always starts from this month, so it shows the road to the wedding.
                  if (v.id === 'year') setCursor(today)
                }, 'swap')
              }
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <p className="calendar-legend">
        <span>
          <span className="dot kind-event" aria-hidden="true" /> Event day
        </span>
        <span>
          <span className="dot kind-payment" aria-hidden="true" /> Payment due
        </span>
        <span>
          <span className="dot kind-task" aria-hidden="true" /> Task
        </span>
      </p>

      {(view === 'month' || view === 'week') && (
        <div className="calendar-layout">
          <section className="surface calendar-surface">
            {view === 'month' ? (
              <MonthView cursor={cursor} selected={selected} onSelect={setCursor} byDay={byDay} today={today} />
            ) : (
              <WeekView cursor={cursor} selected={selected} onSelect={setCursor} byDay={byDay} today={today} />
            )}
          </section>
          {panel}
        </div>
      )}

      {view === 'day' && <section className="surface list-surface day-only">{panel}</section>}

      {view === 'year' && (
        <YearView
          cursor={cursor}
          byDay={byDay}
          today={today}
          onPickMonth={(m) =>
            smooth(() => {
              setCursor(m)
              setView('month')
            }, 'swap')
          }
          onPickDay={(d) =>
            smooth(() => {
              setCursor(d)
              setView('month')
            }, 'swap')
          }
        />
      )}
    </>
  )
}
