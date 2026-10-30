import { useId, useState } from 'react'
import { STAGES } from '../data/stages.js'
import { CATEGORY_BY_ID } from '../data/categories.js'
import { EMPTY_DETAILS } from '../data/sampleVendors.js'
import { autofill } from '../autofill.js'

const EMPTY = {
  ...EMPTY_DETAILS,
  name: '',
  stage: 'prospecting',
  estimatedCost: '',
  amountPaid: '',
}

const FILL_LABELS = {
  name: 'name',
  phone: 'phone',
  email: 'email',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  website: 'website',
}

// Whole ringgit, never below 0.
const toAmount = (value) => Math.max(0, Math.round(Number(value) || 0))

const hasDetails = (v) =>
  ['dueDate', 'contactName', 'phone', 'email', 'instagram', 'facebook', 'tiktok', 'website', 'link'].some(
    (k) => v[k],
  )

// Adding: `category` is fixed by the page and `defaultEvents` pre-ticks events.
// Editing: pass `vendor`; the category can be changed from `categories`.
export default function VendorForm({ category, categories, events, defaultEvents, vendor, onSubmit, onCancel }) {
  const id = useId()
  const editing = Boolean(vendor)
  const [values, setValues] = useState(() =>
    vendor
      ? { ...EMPTY, ...vendor, estimatedCost: String(vendor.estimatedCost), amountPaid: String(vendor.amountPaid) }
      : { ...EMPTY, category },
  )
  const [picked, setPicked] = useState(() => (vendor ? vendor.events : defaultEvents))
  const [source, setSource] = useState('')
  const [pasted, setPasted] = useState('')
  const [fillNote, setFillNote] = useState('')
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => {
    const { value } = e.target
    setValues((v) => ({ ...v, [field]: value }))
    if (errors[field]) setErrors((x) => ({ ...x, [field]: '' }))
  }

  function toggleEvent(eventId) {
    setPicked((list) => (list.includes(eventId) ? list.filter((e) => e !== eventId) : [...list, eventId]))
    setErrors((x) => ({ ...x, events: '' }))
  }

  // Fills only fields that are still empty, then says what it filled.
  // `quiet` (leaving the link field) says nothing when there is nothing new.
  function fill(quiet = false) {
    if (!source.trim() && !pasted.trim()) return
    const found = autofill(source, pasted)
    if (found.suggestedName) found.name = found.suggestedName
    const next = { ...values }
    const filled = []
    for (const key of Object.keys(FILL_LABELS)) {
      if (found[key] && !values[key].trim()) {
        next[key] = found[key]
        filled.push(FILL_LABELS[key])
      }
    }
    if (filled.length) {
      setValues(next)
      setErrors((x) => ({ ...x, name: '' }))
      setFillNote(`Filled ${filled.join(', ')}. Check them before saving.`)
    } else if (!quiet) {
      setFillNote('Nothing new found. Only empty fields are filled.')
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const name = values.name.trim()
    const nextErrors = {}
    if (!name) nextErrors.name = 'Give the vendor a name.'
    if (events.length && !picked.some((p) => events.some((ev) => ev.id === p))) {
      nextErrors.events = 'Tick at least one event.'
    }
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors)
      return
    }
    // Events switched off in Settings stay on the vendor, so switching them back on restores them.
    onSubmit({
      name,
      category: values.category,
      events: picked,
      stage: values.stage,
      estimatedCost: toAmount(values.estimatedCost),
      amountPaid: toAmount(values.amountPaid),
      dueDate: values.dueDate,
      contactName: values.contactName.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      instagram: values.instagram.trim(),
      facebook: values.facebook.trim(),
      tiktok: values.tiktok.trim(),
      website: values.website.trim(),
      link: values.link.trim(),
      notes: values.notes.trim(),
    })
    if (!editing) {
      setValues({ ...EMPTY, category })
      setPicked(defaultEvents)
      setSource('')
      setPasted('')
      setFillNote('')
    }
  }

  const textField = (field, label, props = {}) => (
    <div className="field">
      <label htmlFor={`${id}-${field}`}>{label}</label>
      <input
        id={`${id}-${field}`}
        type="text"
        autoComplete="off"
        value={values[field]}
        onChange={set(field)}
        {...props}
      />
    </div>
  )

  return (
    <form className={`vendor-form${editing ? ' is-editing' : ''}`} onSubmit={handleSubmit} noValidate>
      <div className="quick-fill">
        <div className="field">
          <label htmlFor={`${id}-source`}>Website or social link (optional)</label>
          <input
            id={`${id}-source`}
            type="url"
            placeholder="instagram.com/vendor, wa.me/60…, or their website"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            onBlur={() => fill(true)}
            autoFocus={!editing}
          />
        </div>
        <details className="paste-box">
          <summary>Or paste their contact text</summary>
          <label className="visually-hidden" htmlFor={`${id}-pasted`}>
            Vendor contact text
          </label>
          <textarea
            id={`${id}-pasted`}
            rows="3"
            placeholder="Paste their bio or contact details: phone, email, @handle, links"
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
          />
        </details>
        <div className="quick-fill-actions">
          <button type="button" className="btn-secondary" onClick={() => fill()}>
            Fill in from these
          </button>
          <p className="fill-note" role="status">
            {fillNote}
          </p>
        </div>
      </div>

      <div className="form-grid">
        <div className="field field-wide">
          <label htmlFor={`${id}-name`}>Vendor name</label>
          <input
            id={`${id}-name`}
            type="text"
            placeholder="e.g. Sample Butik Songket Seri"
            value={values.name}
            onChange={set('name')}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${id}-name-error` : undefined}
          />
          {errors.name && (
            <p id={`${id}-name-error`} className="field-error">
              {errors.name}
            </p>
          )}
        </div>
        {editing && (
          <div className="field">
            <label htmlFor={`${id}-category`}>Category</label>
            <select id={`${id}-category`} value={values.category} onChange={set('category')}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="field">
          <label htmlFor={`${id}-stage`}>Stage</label>
          <select id={`${id}-stage`} value={values.stage} onChange={set('stage')}>
            {STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={`${id}-cost`}>Estimated cost (RM)</label>
          <input
            id={`${id}-cost`}
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            placeholder="0"
            value={values.estimatedCost}
            onChange={set('estimatedCost')}
          />
        </div>
        <div className="field">
          <label htmlFor={`${id}-paid`}>Amount paid (RM)</label>
          <input
            id={`${id}-paid`}
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            placeholder="0"
            value={values.amountPaid}
            onChange={set('amountPaid')}
          />
        </div>
      </div>

      {events.length > 0 && (
        <fieldset className="event-picks" aria-describedby={errors.events ? `${id}-events-error` : undefined}>
          <legend>For which events?</legend>
          <div className="event-pick-list">
            {events.map((ev) => (
              <label key={ev.id} className="event-pick">
                <input type="checkbox" checked={picked.includes(ev.id)} onChange={() => toggleEvent(ev.id)} />
                <span>{ev.label}</span>
              </label>
            ))}
          </div>
          {errors.events && (
            <p id={`${id}-events-error`} className="field-error">
              {errors.events}
            </p>
          )}
        </fieldset>
      )}

      <div className="field">
        <label htmlFor={`${id}-notes`}>Notes (optional)</label>
        <textarea
          id={`${id}-notes`}
          rows="3"
          placeholder="Anything to remember: package details, what was agreed, questions to ask"
          value={values.notes}
          onChange={set('notes')}
        />
      </div>

      <details className="form-details" open={editing && hasDetails(vendor)}>
        <summary>Contact, socials and payment date (optional)</summary>
        <div className="form-details-grid">
          <div className="field">
            <label htmlFor={`${id}-due`}>Payment due date</label>
            <input id={`${id}-due`} type="date" value={values.dueDate} onChange={set('dueDate')} />
          </div>
          {textField('contactName', 'Contact name')}
          {textField('phone', 'Phone / WhatsApp', { type: 'tel' })}
          {textField('email', 'Email', { type: 'email' })}
          {textField('instagram', 'Instagram', { placeholder: '@handle' })}
          {textField('tiktok', 'TikTok', { placeholder: '@handle' })}
          {textField('facebook', 'Facebook page', { type: 'url', placeholder: 'facebook.com/…' })}
          {textField('website', 'Website', { type: 'url', placeholder: 'https://' })}
          {textField('link', 'Quote or contract link', { type: 'url', placeholder: 'https://' })}
        </div>
      </details>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {editing ? 'Save' : `Add to ${CATEGORY_BY_ID[values.category]?.label ?? 'vendors'}`}
        </button>
        <button type="button" className="btn-text" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
