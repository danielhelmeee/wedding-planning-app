import { useEffect, useRef, useState } from 'react'
import AddTaskForm from './AddTaskForm.jsx'
import { checklistSummary, groupChecklist } from '../checklist.js'
import { percent } from '../figures.js'
import { addDays, addMonths, todayISO } from '../dates.js'
import TaskRow from './TaskRow.jsx'
import { hrefFor } from '../useHashRoute.js'
import { smooth } from '../motion.js'

// Simple filters; any single category is picked from the dropdown instead of a long row of tabs.
const FILTERS = [
  { id: 'all', label: 'All', match: () => true },
  { id: 'vendors', label: 'Vendors', match: (t) => t.group === 'Vendors' || Boolean(t.category) },
  { id: 'procedure', label: 'Marriage procedure', match: (t) => t.group === 'Marriage procedure' },
  { id: 'yours', label: 'Your tasks', match: (t) => t.custom },
]

// Spread late tasks evenly over the next four weeks, in their original order.
function spreadDates(tasks) {
  const today = todayISO()
  return tasks.map((t, i) => [t, addDays(today, Math.round(((i + 1) * 28) / tasks.length))])
}

export default function ChecklistPage({ tab, items, categories, onToggle, onAdd, onDelete, onReschedule }) {
  const [adding, setAdding] = useState(false)
  const [undo, setUndo] = useState(null) // the task just ticked
  const undoTimer = useRef(null)
  useEffect(() => () => clearTimeout(undoTimer.current), [])

  // "#/checklist/task-<id>" (from Home or the Calendar) opens All and points at that task.
  const focusTask = tab?.startsWith('task-') ? tab.slice(5) : null
  const category = categories.find((c) => c.id === tab)
  const filter = FILTERS.find((f) => f.id === tab) ?? FILTERS[0]
  const shown = category ? items.filter((t) => t.category === category.id) : items.filter(filter.match)
  const withTasks = categories.filter((c) => items.some((t) => t.category === c.id))

  const { groups, done } = groupChecklist(shown)
  const summary = checklistSummary(shown)
  const pct = percent(summary.done, summary.total) ?? 0
  const today = todayISO()
  const monthOf = (iso) => iso.slice(0, 7)
  const open = shown.filter((t) => !t.done && t.dueDate && t.daysLeft >= 0)
  const thisMonth = open.filter((t) => monthOf(t.dueDate) === monthOf(today)).length
  const nextMonth = open.filter((t) => monthOf(t.dueDate) === monthOf(addMonths(today, 1))).length

  function toggle(task) {
    onToggle(task)
    clearTimeout(undoTimer.current)
    if (!task.done) {
      setUndo(task)
      undoTimer.current = setTimeout(() => setUndo(null), 6000)
    } else setUndo(null)
  }

  const rowProps = { onToggle: toggle, onDelete, onReschedule }

  return (
    <>
      <header className="page-head">
        <h1 className="page-title">{category ? `Checklist: ${category.label}` : 'Checklist'}</h1>
        <p className="page-sub">
          {summary.done} of {summary.total} done · This month: {thisMonth} to do · Next month: {nextMonth}
        </p>
        <div className="checklist-bar" aria-hidden="true">
          <span className="step-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="fine-print">Suggested timing, worked back from your event dates. Move any date to suit you.</p>
      </header>

      <div className="checklist-toolbar">
        <nav className="filter-pills" aria-label="Show tasks">
          {FILTERS.map((f) => {
            const n = items.filter(f.match).filter((t) => !t.done).length
            const active = !category && filter.id === f.id
            if (f.id === 'yours' && !items.some(f.match)) return null
            return (
              <a
                key={f.id}
                href={hrefFor({ page: 'checklist', tab: f.id })}
                className={`filter-pill${active ? ' is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {f.label} <span className="tab-count">{n}</span>
              </a>
            )
          })}
        </nav>
        <div className="field checklist-category">
          <label htmlFor="checklist-category">Category</label>
          <select
            id="checklist-category"
            value={category?.id ?? ''}
            onChange={(e) => {
              window.location.hash = hrefFor({ page: 'checklist', tab: e.target.value || 'all' })
            }}
          >
            <option value="">Every category</option>
            {withTasks.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        {!adding && (
          <button type="button" className="btn-add checklist-add" onClick={() => smooth(() => setAdding(true))}>
            <span aria-hidden="true">+</span> Add a task
          </button>
        )}
      </div>

      {adding && (
        <AddTaskForm
          categories={categories}
          defaultCategory={category?.id ?? ''}
          onAdd={(task) =>
            smooth(() => {
              onAdd(task)
              setAdding(false)
            })
          }
          onCancel={() => smooth(() => setAdding(false))}
        />
      )}

      {groups.length > 0 ? (
        <section className="checklist checklist-groups" aria-label="Tasks to do">
          {groups.map((g) => (
            <div key={g.label} className={`task-group${g.tone === 'overdue' ? ' is-catch-up' : ''}`}>
              <div className="task-group-head">
                <h2 className="task-group-title">
                  {g.label} <span className="tab-count">{g.items.length}</span>
                </h2>
                {g.tone === 'overdue' && (
                  <button
                    type="button"
                    className="btn-add-small"
                    onClick={() => spreadDates(g.items).forEach(([t, date]) => onReschedule(t, date))}
                  >
                    Spread over the next 4 weeks
                  </button>
                )}
              </div>
              {g.tone === 'overdue' && (
                <p className="task-group-note">
                  Their suggested dates have passed, often because planning started later than the timing assumes. Do
                  them when you can, or spread them out.
                </p>
              )}
              <ul className="task-list">
                {g.items.map((t) => (
                  <TaskRow key={t.id} task={t} highlight={t.id === focusTask} {...rowProps} />
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : (
        <div className="empty-inline">
          <div>
            <p>{shown.length ? 'Everything here is done.' : 'No tasks here yet.'}</p>
            <p>Add a task of your own if something comes up.</p>
          </div>
        </div>
      )}

      {done.length > 0 && (
        <details className="done-tasks" open={done.some((t) => t.id === focusTask) || undefined}>
          <summary>
            Done <span className="tab-count">{done.length}</span>
          </summary>
          <ul className="task-list">
            {done.map((t) => (
              <TaskRow key={t.id} task={t} highlight={t.id === focusTask} {...rowProps} />
            ))}
          </ul>
        </details>
      )}

      {undo && (
        <div className="toast" role="status">
          <span>
            Ticked: <strong>{undo.title}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              onToggle({ ...undo, done: true })
              clearTimeout(undoTimer.current)
              setUndo(null)
            }}
          >
            Undo
          </button>
        </div>
      )}
    </>
  )
}
