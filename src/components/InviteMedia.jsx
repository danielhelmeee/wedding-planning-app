import { useState } from 'react'
import { deleteImage, saveImage, useImage } from '../media.js'

const MAX_PHOTOS = 12

function Thumb({ id }) {
  const url = useImage(id)
  return url ? <img className="media-thumb" src={url} alt="" /> : <span className="media-thumb is-empty" />
}

// A file picker styled as an outlined button.
function Pick({ label, multiple = false, onFiles, disabled }) {
  return (
    <label className={`btn-secondary file-button${disabled ? ' is-disabled' : ''}`}>
      {label}
      <input
        type="file"
        accept="image/*"
        multiple={multiple}
        disabled={disabled}
        onChange={(e) => {
          const files = [...e.target.files]
          e.target.value = ''
          if (files.length) onFiles(files)
        }}
      />
    </label>
  )
}

export default function InviteMedia({ media, onChange }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const set = (changes) => onChange({ ...media, ...changes })

  async function run(task) {
    setBusy(true)
    setError('')
    try {
      await task()
    } catch (e) {
      setError(e.message || 'Could not save that image.')
    } finally {
      setBusy(false)
    }
  }

  const addPhotos = (files) =>
    run(async () => {
      const room = MAX_PHOTOS - media.gallery.length
      const ids = []
      for (const f of files.slice(0, room)) ids.push(await saveImage(f, 1400))
      set({ gallery: [...media.gallery, ...ids] })
      if (files.length > room) setError(`Only ${MAX_PHOTOS} photos fit in the gallery; the rest were left out.`)
    })

  const move = (i, dir) => {
    const g = [...media.gallery]
    const j = i + dir
    if (j < 0 || j >= g.length) return
    ;[g[i], g[j]] = [g[j], g[i]]
    set({ gallery: g })
  }

  const removePhoto = (id) =>
    run(async () => {
      set({ gallery: media.gallery.filter((x) => x !== id) })
      await deleteImage(id)
    })

  return (
    <section className="invite-section">
      <h2>Photo gallery</h2>
      <p className="field-hint">
        Photos are resized and kept in this browser only (they go online with the invitation in Build & Ship).
      </p>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {busy && (
        <p className="fill-note" role="status">
          Saving image…
        </p>
      )}

      <div className="media-slot">
        <div className="media-slot-head">
          <p className="field-label-strong">
            {media.gallery.length} of {MAX_PHOTOS} photos
          </p>
          <p className="field-hint">Guests swipe through these. Use the arrows to change the order.</p>
        </div>
        {media.gallery.length > 0 && (
          <ul className="media-grid">
            {media.gallery.map((id, i) => (
              <li key={id}>
                <Thumb id={id} />
                <div className="media-grid-actions">
                  <button type="button" className="icon-button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move photo ${i + 1} earlier`}>
                    ‹
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => move(i, 1)}
                    disabled={i === media.gallery.length - 1}
                    aria-label={`Move photo ${i + 1} later`}
                  >
                    ›
                  </button>
                  <button type="button" className="btn-text btn-delete" onClick={() => removePhoto(id)}>
                    Remove<span className="visually-hidden"> photo {i + 1}</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Pick
          label="+ Add photos"
          multiple
          onFiles={addPhotos}
          disabled={busy || media.gallery.length >= MAX_PHOTOS}
        />
      </div>
    </section>
  )
}
