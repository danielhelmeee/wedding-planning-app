import { useId, useState } from 'react'
import { DIETARY_SUGGESTIONS, EMPTY_GUEST, GROUPS, RSVP, SIDES } from '../data/guestOptions.js'

export function EventPicks({ id, events, picked, onToggle, error, legend = 'Invited to' }) {
  if (!events.length) return null
  return (
    <fieldset className="event-picks" aria-describedby={error ? `${id}-events-error` : undefined}>
      <legend>{legend}</legend>
      <div className="event-pick-list">
        {events.map((ev) => (
          <label key={ev.id} className="event-pick">
            <input type="checkbox" checked={picked.includes(ev.id)} onChange={() => onToggle(ev.id)} />
            <span>{ev.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <p id={`${id}-events-error`} className="field-error">
          {error}
        </p>
      )}
    </fieldset>
  )
}

export function SharedFields({ id, values, set }) {
  return (
    <>
      <div className="field">
        <label htmlFor={`${id}-side`}>Side</label>
        <select id={`${id}-side`} value={values.side} onChange={set('side')}>
          {SIDES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`${id}-group`}>Group</label>
        <select id={`${id}-group`} value={values.group} onChange={set('group')}>
          {GROUPS.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor={`${id}-status`}>Reply</label>
        <select id={`${id}-status`} value={values.status} onChange={set('status')}>
          {RSVP.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}

// Add or edit one guest. (Many at once: GuestImport.jsx.)
export default function GuestForm({ guest, events, onSubmit, onCancel }) {
  const id = useId()
  const editing = Boolean(guest)
  const [values, setValues] = useState(() =>
    guest
      ? { ...EMPTY_GUEST, ...guest, plusOnes: String(guest.plusOnes) }
      : { ...EMPTY_GUEST, plusOnes: '0' },
  )
  const [picked, setPicked] = useState(() => (guest ? guest.events : events.map((e) => e.id)))
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => {
    const { value } = e.target
    setValues((v) => ({ ...v, [field]: value }))
    setErrors((x) => ({ ...x, [field]: '' }))
  }
  const toggleEvent = (eventId) => {
    setPicked((list) => (list.includes(eventId) ? list.filter((e) => e !== eventId) : [...list, eventId]))
    setErrors((x) => ({ ...x, events: '' }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!values.name.trim()) next.name = 'Give the guest a name.'
    if (events.length && !picked.length) next.events = 'Tick at least one event.'
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }
    const shared = { side: values.side, group: values.group, status: values.status, events: picked }
    onSubmit({
      ...shared,
      name: values.name.trim(),
      phone: values.phone.trim(),
      plusOnes: Math.max(0, Math.min(20, Math.round(Number(values.plusOnes) || 0))),
      dietary: values.dietary.trim(),
      notes: values.notes.trim(),
    })
  }

  return (
    <form className="vendor-form guest-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="field field-wide">
          <label htmlFor={`${id}-name`}>Guest or family name</label>
          <input
            id={`${id}-name`}
            type="text"
            autoFocus={!editing}
            placeholder="e.g. Sample Mak Ngah & family"
            value={values.name}
            onChange={set('name')}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        <div className="field">
          <label htmlFor={`${id}-phone`}>Phone / WhatsApp</label>
          <input id={`${id}-phone`} type="tel" autoComplete="off" value={values.phone} onChange={set('phone')} />
        </div>
        <div className="field">
          <label htmlFor={`${id}-plus`}>Extra people (+1s)</label>
          <input
            id={`${id}-plus`}
            type="number"
            min="0"
            max="20"
            step="1"
            inputMode="numeric"
            value={values.plusOnes}
            onChange={set('plusOnes')}
          />
        </div>
        <SharedFields id={id} values={values} set={set} />
        <div className="field">
          <label htmlFor={`${id}-diet`}>Dietary needs</label>
          <input
            id={`${id}-diet`}
            type="text"
            list={`${id}-diet-list`}
            placeholder="e.g. Vegetarian"
            value={values.dietary}
            onChange={set('dietary')}
          />
          <datalist id={`${id}-diet-list`}>
            {DIETARY_SUGGESTIONS.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>
      </div>

      <EventPicks id={id} events={events} picked={picked} onToggle={toggleEvent} error={errors.events} />

      <div className="field">
        <label htmlFor={`${id}-notes`}>Notes (optional)</label>
        <textarea
          id={`${id}-notes`}
          rows="2"
          placeholder="e.g. Needs a seat near the door, coming from Johor"
          value={values.notes}
          onChange={set('notes')}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {editing ? 'Save' : 'Add guest'}
        </button>
        <button type="button" className="btn-text" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
