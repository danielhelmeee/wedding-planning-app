import { useEffect, useId, useRef, useState } from 'react'
import { formatDate } from '../figures.js'
import { hrefFor } from '../useHashRoute.js'

function dueText(t) {
  if (!t.dueDate) return t.undatedHint || 'Add a date'
  if (t.done) return formatDate(t.dueDate)
  if (t.daysLeft < 0) return `Was due ${formatDate(t.dueDate)}`
  if (t.daysLeft === 0) return 'Due today'
  if (t.daysLeft === 1) return 'Due tomorrow'
  return `Due ${formatDate(t.dueDate)}`
}

function Pencil() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" aria-hidden="true" className="due-pencil">
      <path d="M11 2.5l2.5 2.5L6 12.5 3 13l.5-3z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  )
}

// One task with a tick box, used by the Checklist, the Calendar and Home.
// The due date is the control for changing it. `highlight` scrolls to the task and marks it briefly;
// `inChecklist` adds a link to the task's row in the Checklist (used by the Calendar).
export default function TaskRow({ task, onToggle, onDelete, onReschedule, hideDate = false, highlight = false, inChecklist = false }) {
  const id = useId()
  const [changing, setChanging] = useState(false)
  const row = useRef(null)
  const lateTask = !task.done && task.daysLeft !== null && task.daysLeft < 0

  useEffect(() => {
    if (highlight) row.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [highlight])

  // Where the task belongs: its vendor category, or the marriage procedure guide.
  const place = task.category ? (
    <a href={hrefFor({ page: 'category', category: task.category })}>{task.categoryLabel}</a>
  ) : task.group === 'Marriage procedure' ? (
    <a href="#/procedure">Marriage procedure</a>
  ) : null

  return (
    <li ref={row} className={`task-row${task.done ? ' is-done' : ''}${highlight ? ' is-highlight' : ''}`} id={`task-${task.id}`}>
      <label className="task-hit">
        <input
          id={id}
          type="checkbox"
          className="task-check"
          checked={task.done}
          disabled={Boolean(task.autoReason)}
          onChange={() => onToggle(task)}
        />
        <span className="visually-hidden">{task.done ? 'Mark as not done' : 'Mark as done'}</span>
      </label>
      <div className="task-body">
        <label htmlFor={id} className="task-title">
          {task.title}
        </label>
        <p className="task-meta">
          {!hideDate &&
            (task.done || !onReschedule ? (
              <span>{dueText(task)}</span>
            ) : (
              <button
                type="button"
                className={`due-button${lateTask ? ' is-late' : ''}`}
                onClick={() => setChanging((c) => !c)}
                aria-expanded={changing}
              >
                {dueText(task)}
                {task.moved && ' (moved)'}
                <Pencil />
                <span className="visually-hidden">, change the date for {task.title}</span>
              </button>
            ))}
          {place}
          {task.autoReason && <span className="task-auto">✓ {task.autoReason}</span>}
          {inChecklist && <a href={`#/checklist/task-${task.id}`}>In Checklist</a>}
        </p>
        {changing && (
          <div className="date-change">
            <label className="visually-hidden" htmlFor={`${id}-date`}>
              New date for {task.title}
            </label>
            <input
              id={`${id}-date`}
              type="date"
              value={task.dueDate}
              onChange={(e) => {
                if (e.target.value || task.custom) onReschedule(task, e.target.value)
              }}
            />
            {task.moved && (
              <button
                type="button"
                className="btn-text"
                onClick={() => {
                  onReschedule(task, null)
                  setChanging(false)
                }}
              >
                Use suggested date ({formatDate(task.suggestedDate)})
              </button>
            )}
            <button type="button" className="btn-text" onClick={() => setChanging(false)}>
              Done
            </button>
          </div>
        )}
        {task.note && !task.done && <p className="task-note">{task.note}</p>}
      </div>
      {task.custom && (
        <button
          type="button"
          className="btn-text btn-delete"
          onClick={() => onDelete(task.id)}
        >
          Delete<span className="visually-hidden"> {task.title}</span>
        </button>
      )}
    </li>
  )
}
