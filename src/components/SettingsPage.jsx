import { useState } from 'react'
import { CATEGORIES } from '../data/categories.js'
import { backupParts, exportBackup, importBackup } from '../storage.js'
import { formatRM } from '../figures.js'
import { todayISO } from '../dates.js'
import { EVENTS } from '../data/events.js'

// Download everything as a file, or restore from one. Restoring reloads the page so every part reads the backup.
function YourData() {
  const [message, setMessage] = useState({ text: '', error: false })
  const [pending, setPending] = useState(null) // a checked backup, waiting for "Replace"
  const backupDate = (b) =>
    b?.savedAt ? new Date(b.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
  function download() {
    const backup = exportBackup()
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
    a.download = `restu-backup-${todayISO()}.json`
    a.click()
    URL.revokeObjectURL(a.href)
    setMessage({ text: 'Backup downloaded. Keep it somewhere safe, e.g. your cloud drive.', error: false })
  }
  async function restore(file) {
    try {
      const backup = JSON.parse(await file.text())
      backupParts(backup) // stops here, with the reason, if the file is not a backup
      setMessage({ text: '', error: false })
      setPending(backup)
    } catch (e) {
      setMessage({ text: e instanceof SyntaxError ? 'This file is not a Restu backup.' : e.message, error: true })
    }
  }
  return (
    <section className="side-section" aria-labelledby="data-title">
      <h2 id="data-title">Your data</h2>
      <p className="muted section-intro">
        Every change saves automatically, in this browser only. Clearing the browser&apos;s data, or switching to another
        computer or phone, starts empty, so download a backup now and then. Photos and the QR image are not included.
      </p>
      <div className="data-actions">
        <button type="button" className="btn-secondary" onClick={download}>
          Download a backup
        </button>
        <label className="btn-secondary file-button">
          Restore from a backup
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              const f = e.target.files[0]
              e.target.value = ''
              if (f) restore(f)
            }}
          />
        </label>
      </div>
      {pending && (
        <div className="restore-confirm" role="alertdialog" aria-labelledby="restore-title">
          <p id="restore-title">
            <strong>Replace everything with the backup{backupDate(pending) && ` from ${backupDate(pending)}`}?</strong> What is in
            this browser now will be overwritten. Download a backup of it first if you might need it.
          </p>
          <div className="data-actions">
            <button
              type="button"
              className="btn-add"
              onClick={() => {
                importBackup(pending)
                window.location.hash = '#/home'
                window.location.reload()
              }}
            >
              Replace with the backup
            </button>
            <button type="button" className="btn-secondary" onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {message.text && (
        <p className={`${message.error ? 'field-error' : 'field-hint'} data-message`} role={message.error ? 'alert' : 'status'}>
          {message.text}
        </p>
      )}
    </section>
  )
}

export default function SettingsPage({ settings, onChange, onEventChange, onToggleCategory, onRunSetup }) {
  const hidden = new Set(settings.hiddenCategories)

  return (
    <>
      <header className="page-head">
        <h1 className="page-title">Settings</h1>
        <p className="page-sub">Dates, budget, and which events and categories you are planning. Changes save automatically.</p>
      </header>

      <div className="settings-page">
        <section className="side-section" aria-labelledby="ev-title">
          <h2 id="ev-title">Events</h2>
          <p className="muted section-intro">
            Switch off an event you are not holding, for example a combined Sanding and Reception. Its tab disappears;
            vendors keep their event ticks.
          </p>
          <div className="event-settings">
            {EVENTS.map((e) => {
              const ev = settings.events[e.id]
              return (
                <div key={e.id} className={`event-setting${ev.on ? '' : ' is-off'}`}>
                  <label className="toggle">
                    <input type="checkbox" checked={ev.on} onChange={() => onEventChange(e.id, { on: !ev.on })} />
                    <span>
                      {e.label}
                      {!ev.on && ' (off)'}
                    </span>
                  </label>
                  <div className="field">
                    <label htmlFor={`date-${e.id}`}>{e.label} date</label>
                    <input
                      id={`date-${e.id}`}
                      type="date"
                      value={ev.date}
                      disabled={!ev.on}
                      onChange={(x) => onEventChange(e.id, { date: x.target.value })}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="side-section" aria-labelledby="budget-title">
          <h2 id="budget-title">Budget</h2>
          <div className="field budget-field">
            <label htmlFor="set-budget">Total budget (RM)</label>
            <input
              id="set-budget"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="0"
              value={settings.totalBudget || ''}
              onChange={(e) => onChange({ totalBudget: Math.max(0, Math.round(Number(e.target.value) || 0)) })}
            />
            {settings.totalBudget > 0 && <p className="field-hint">{formatRM(settings.totalBudget)}</p>}
            <p className="field-hint">
              Split it by category on the <a href="#/budget">Budget</a> page.
            </p>
          </div>
        </section>

        <section className="side-section" aria-labelledby="cats-title">
          <h2 id="cats-title">Vendor categories</h2>
          <p className="muted section-intro">
            Untick a category you do not need. It leaves the sidebar and the budget; its vendors are kept.
          </p>
          <fieldset className="toggles">
            <legend className="visually-hidden">Categories</legend>
            {CATEGORIES.map((c) => {
              const off = hidden.has(c.id)
              return (
                <label key={c.id} className={`toggle${off ? ' is-off' : ''}`}>
                  <input type="checkbox" checked={!off} onChange={() => onToggleCategory(c.id)} />
                  <span>
                    {c.label}
                    {off && ' (hidden)'}
                  </span>
                </label>
              )
            })}
          </fieldset>
        </section>

        <YourData />

        <section className="side-section" aria-labelledby="setup-title">
          <h2 id="setup-title">Setup</h2>
          <p className="muted section-intro">
            Go through the first-launch questions again: names, events and dates, budget, vendor categories, and removing
            the sample data.
          </p>
          <button type="button" className="btn-secondary" onClick={onRunSetup}>
            Run the setup again
          </button>
        </section>

      </div>
    </>
  )
}
