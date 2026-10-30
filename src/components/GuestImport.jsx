import { useId, useState } from 'react'
import { EventPicks, SharedFields } from './GuestForm.jsx'
import { RSVP_BY_ID, SIDE_BY_ID } from '../data/guestOptions.js'
import { EVENT_BY_ID } from '../data/events.js'
import { readGuests, TEMPLATE_CSV } from '../guestImport.js'

const PREVIEW_ROWS = 8
const templateHref = `data:text/csv;charset=utf-8,${encodeURIComponent(TEMPLATE_CSV)}`

// Many guests at once: upload a CSV, paste cells from a spreadsheet, or paste a list of names.
export default function GuestImport({ events, existingNames, onImport, onCancel }) {
  const id = useId()
  const [text, setText] = useState('')
  const [fileNote, setFileNote] = useState('')
  const [defaults, setDefaults] = useState({ side: 'bride', group: 'Family', status: 'pending' })
  const [picked, setPicked] = useState(() => events.map((e) => e.id))
  const [skipExisting, setSkipExisting] = useState(true)
  const [error, setError] = useState('')

  const set = (field) => (e) => setDefaults((d) => ({ ...d, [field]: e.target.value }))
  const toggleEvent = (eventId) =>
    setPicked((list) => (list.includes(eventId) ? list.filter((e) => e !== eventId) : [...list, eventId]))

  const known = new Set(existingNames.map((n) => n.trim().toLowerCase()))
  const { guests, skipped, usedHeadings } = readGuests(text, { ...defaults, events: picked }, events.map((e) => e.id))
  const isKnown = (g) => known.has(g.name.toLowerCase())
  const already = guests.filter(isKnown).length
  const toAdd = skipExisting ? guests.filter((g) => !isKnown(g)) : guests

  function readFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (/\.(xlsx|xls|numbers|ods)$/i.test(file.name)) {
      setFileNote(
        `"${file.name}" is a spreadsheet file. In Excel or Google Sheets choose File → Save as / Download → CSV, then upload that. Or select the cells, copy, and paste them in the box below.`,
      )
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setText(String(reader.result).replace(/^﻿/, ''))
      setFileNote(`Loaded "${file.name}". Check the preview, then add.`)
      setError('')
    }
    reader.readAsText(file)
  }

  function submit(e) {
    e.preventDefault()
    if (!toAdd.length) {
      setError(guests.length ? 'Everyone in this list is already on your guest list.' : 'Add at least one name.')
      return
    }
    onImport(toAdd)
  }

  return (
    <form className="vendor-form guest-import" onSubmit={submit} noValidate>
      <p className="import-intro">
        Upload a CSV file, paste cells copied from Excel or Google Sheets, or paste a list of names (one per line, with
        a phone after a comma if you have one). Columns are matched by their heading: Name, Phone, Side, Group, Plus
        ones, Reply, Events, Dietary, Notes. Malay headings work too (Nama, Telefon, Pihak, Hadir, Majlis).
      </p>

      <div className="import-actions">
        <label className="btn-secondary file-button">
          Upload CSV file
          <input type="file" accept=".csv,.tsv,.txt,text/csv,.xlsx,.xls" onChange={readFile} />
        </label>
        <a className="link-button" href={templateHref} download="guest-list-template.csv">
          Download a template
        </a>
      </div>
      {fileNote && (
        <p className="fill-note" role="status">
          {fileNote}
        </p>
      )}

      <div className="field">
        <label htmlFor={`${id}-text`}>Names or spreadsheet cells</label>
        <textarea
          id={`${id}-text`}
          rows="6"
          autoFocus
          placeholder={'Sample Mak Ngah, 012-345 6789\nSample Cousin Faiz\nSample Kak Yan'}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setError('')
          }}
          aria-invalid={Boolean(error)}
        />
        {error && <p className="field-error">{error}</p>}
      </div>

      <fieldset className="import-defaults">
        <legend>For rows that do not say</legend>
        <div className="form-grid">
          <SharedFields id={id} values={defaults} set={set} />
        </div>
        <EventPicks id={id} events={events} picked={picked} onToggle={toggleEvent} legend="Invited to" />
      </fieldset>

      {guests.length > 0 && (
        <section className="import-preview" aria-live="polite">
          <p className="import-summary">
            <strong>
              {toAdd.length} guest{toAdd.length === 1 ? '' : 's'} ready to add
            </strong>
            {usedHeadings ? ' · columns read from the headings' : ' · read as a list of names'}
            {skipped > 0 && ` · ${skipped} row${skipped === 1 ? '' : 's'} without a name left out`}
          </p>
          {already > 0 && (
            <label className="toggle">
              <input type="checkbox" checked={skipExisting} onChange={() => setSkipExisting((v) => !v)} />
              <span>
                Skip {already} name{already === 1 ? '' : 's'} already on your list
              </span>
            </label>
          )}
          <ul className="preview-list">
            {guests.slice(0, PREVIEW_ROWS).map((g, i) => (
              <li key={i} className={skipExisting && isKnown(g) ? 'is-skipped' : undefined}>
                <span className="preview-name">{g.name}</span>
                <span>
                  {SIDE_BY_ID[g.side].label} · {RSVP_BY_ID[g.status].label} ·{' '}
                  {g.events.map((e) => EVENT_BY_ID[e].label).join(', ') || 'No event'}
                  {g.plusOnes > 0 && ` · +${g.plusOnes}`}
                  {g.phone && ` · ${g.phone}`}
                  {skipExisting && isKnown(g) && ' · already on your list'}
                </span>
              </li>
            ))}
          </ul>
          {guests.length > PREVIEW_ROWS && <p className="fill-note">and {guests.length - PREVIEW_ROWS} more</p>}
        </section>
      )}

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {toAdd.length ? `Add ${toAdd.length} guest${toAdd.length === 1 ? '' : 's'}` : 'Add guests'}
        </button>
        <button type="button" className="btn-text" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
