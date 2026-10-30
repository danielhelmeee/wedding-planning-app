import { useId, useState } from 'react'

// `inline` drops the surface, for use inside an existing list (the Calendar's day lists).
export default function AddTaskForm({ categories, defaultCategory = '', defaultDate = '', inline = false, onAdd, onCancel }) {
  const id = useId()
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(defaultDate)
  const [category, setCategory] = useState(defaultCategory)
  const [error, setError] = useState('')

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) {
      setError('Give the task a name.')
      return
    }
    onAdd({ id: `t_${Date.now()}`, title: title.trim(), dueDate, category, done: false })
  }

  return (
    <form className={`task-form${inline ? ' is-inline' : ' surface'}`} onSubmit={submit} noValidate>
      <h3 className="add-title">Add a task</h3>
      <div className="form-grid">
        <div className="field field-wide">
          <label htmlFor={`${id}-title`}>Task</label>
          <input
            id={`${id}-title`}
            type="text"
            autoFocus
            placeholder="e.g. Book a hotel room for family from out of town"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setError('')
            }}
            aria-invalid={Boolean(error)}
          />
          {error && <p className="field-error">{error}</p>}
        </div>
        <div className="field">
          <label htmlFor={`${id}-due`}>Due date (optional)</label>
          <input id={`${id}-due`} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor={`${id}-cat`}>Category (optional)</label>
          <select id={`${id}-cat`} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary">
          Add task
        </button>
        <button type="button" className="btn-text" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
