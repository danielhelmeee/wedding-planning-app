import { useEffect, useId, useRef, useState } from 'react'
import InviteCard from './InviteCard.jsx'
import InviteView from './InviteView.jsx'
import { HeroArt } from './invite/ThemeArt.jsx'
import InviteMedia from './InviteMedia.jsx'
import { parseYouTube, useYouTubePlayer, youTubeProblem } from '../youtube.js'
import { WORDS, rsvpPhone, whatsappMessage } from '../invite.js'
import { whatsappHref } from '../contact.js'
import { deleteImage, saveImage, useImage } from '../media.js'
import { ANIMATIONS, INVITE_THEMES, animationFor, themeFor, themeVars } from '../inviteThemes.js'
import { formatDate } from '../figures.js'
import { inviteReadiness } from '../home.js'
import { smooth } from '../motion.js'

// `hideLabel` keeps the label for screen readers only (for repeated rows under one visible set of labels).
function Field({ label, children, wide = false, hint, hideLabel = false }) {
  const id = useId()
  return (
    <div className={`field${wide ? ' field-wide' : ''}`}>
      <label htmlFor={id} className={hideLabel ? 'visually-hidden' : undefined}>
        {label}
      </label>
      {children(id)}
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  )
}

// What each theme's particles are called in the studio.
const PARTICLE_NAMES = { petals: 'petals', gold: 'gold dust', blossoms: 'blossoms', stars: 'stars' }

const MUSIC_PROBLEMS = {
  'not-embeddable':
    "YouTube won't play this video on other sites. Usually the owner has turned that off (common for official music videos); it can also mean the video is private or removed. Try another upload of the song, such as a lyric, cover or instrumental version.",
  unavailable: 'This video has been removed or made private. Choose another one.',
  'bad-link': 'YouTube says this link is not valid. Copy it again from the Share button.',
  'cannot-play': "This browser can't play this video. Try another upload of the song.",
  offline: "YouTube couldn't be reached. Check your internet connection.",
  player: 'The YouTube player had a problem loading. Refresh the page and try again.',
}

// Loads the song in a small player so problems (e.g. embedding turned off) show here, before guests see them.
function MusicCheck({ song, onRemove }) {
  const host = useRef(null)
  const check = useYouTubePlayer(host, song)
  const start = song.start
    ? `Starts at ${Math.floor(song.start / 60)}:${String(song.start % 60).padStart(2, '0')}`
    : 'Starts from the beginning'
  return (
    <div className="music-found">
      <div className="music-check-player" ref={host} />
      <div className="music-info">
        {check.error ? (
          <p className="field-error" role="alert">
            {MUSIC_PROBLEMS[youTubeProblem(check.error)]}
          </p>
        ) : check.ready ? (
          <p className="music-status is-ok">This video can play on your invitation</p>
        ) : (
          <p className="music-status" role="status">
            Checking the video…
          </p>
        )}
        <p className="music-start">{start}</p>
        <button type="button" className="btn-text btn-delete" onClick={onRemove}>
          Remove music
        </button>
      </div>
    </div>
  )
}

// The couple's payment QR image (e.g. a DuitNow QR screenshot), kept in this browser.
function GiftQr({ id, onChange }) {
  const url = useImage(id)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  async function pick(file) {
    setBusy(true)
    setError('')
    try {
      const next = await saveImage(file, 900)
      onChange(next)
      if (id) await deleteImage(id)
    } catch (e) {
      setError(e.message || 'Could not save that image.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="gift-qr-edit">
      {url && <img className="gift-qr-thumb" src={url} alt="Your QR code" />}
      <div className="gift-qr-actions">
        <label className={`btn-secondary file-button${busy ? ' is-disabled' : ''}`}>
          {id ? 'Replace QR image' : '+ Add a QR image'}
          <input
            type="file"
            accept="image/*"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files[0]
              e.target.value = ''
              if (file) pick(file)
            }}
          />
        </label>
        {id && (
          <button
            type="button"
            className="btn-text btn-delete"
            onClick={() => {
              onChange('')
              deleteImage(id).catch(() => {})
            }}
          >
            Remove QR
          </button>
        )}
        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

const STUDIO_TABS = [
  { id: 'details', label: 'Details' },
  { id: 'design', label: 'Design' },
  { id: 'wording', label: 'Wording' },
  { id: 'media', label: 'Photos & music' },
  { id: 'guests', label: 'RSVP & gifts' },
]

// The studio's sections as tabs, with what is still missing before the invite is ready to send.
function InviteTabs({ tab, onTab, readiness }) {
  const missing = readiness.checks.filter((c) => !c.optional && !c.done)
  return (
    <div className="studio-top">
      <p className={`studio-ready${readiness.ready ? ' is-ready' : ''}`}>
        {readiness.ready ? (
          <>✓ Ready to send. Copy the WhatsApp message or save the PDF above.</>
        ) : (
          <>
            <strong>
              {readiness.done} of {readiness.total} essentials done.
            </strong>{' '}
            Still to add: {missing.map((c) => c.label.toLowerCase()).join(', ')}.{' '}
            {tab !== 'details' && (
              <button type="button" className="link-button" onClick={() => onTab('details')}>
                Go to Details
              </button>
            )}
          </>
        )}
      </p>
      <nav data-slide className="studio-tabs" aria-label="Studio sections">
        {STUDIO_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`studio-tab${tab === t.id ? ' is-active' : ''}`}
            aria-pressed={tab === t.id}
            onClick={() => onTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default function InvitePage({ invite, settings, events, onChange, onReply, wishlist, onReserve }) {
  const [view, setView] = useState('edit') // phones only: 'edit' | 'preview'
  const [tab, setTab] = useState('details')
  const [copied, setCopied] = useState('')
  const [replay, setReplay] = useState(0)
  // Scale the true-size iPhone frame (422 x 894 with bezel) to fit the window and the preview column.
  const previewRef = useRef(null)
  const [zoom, setZoom] = useState(0.8)
  useEffect(() => {
    const el = previewRef.current
    if (!el) return
    const fit = () => {
      if (!el.clientWidth) return
      setZoom(Math.min(1, (window.innerHeight - 150) / 894, el.clientWidth / 422))
    }
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    window.addEventListener('resize', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [])
  const w = WORDS[invite.language] ?? WORDS.ms
  const current = themeFor(invite.theme, invite.palette)
  const song = parseYouTube(invite.music?.url)
  const animation = animationFor(invite.animation)
  const readiness = inviteReadiness(invite, settings)

  const set = (field) => (e) => onChange({ [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const setEvent = (id, changes) =>
    onChange({ events: { ...invite.events, [id]: { ...invite.events[id], ...changes } } })
  const setPart = (part, changes) => onChange({ [part]: { ...invite[part], ...changes } })
  const setWish = (i, changes) =>
    setPart('wishes', { list: invite.wishes.list.map((x, j) => (j === i ? { ...x, ...changes } : x)) })
  const replyTo = rsvpPhone(invite)
  const setContact = (i, changes) =>
    onChange({ contacts: invite.contacts.map((c, j) => (j === i ? { ...c, ...changes } : c)) })

  async function copyMessage() {
    const text = whatsappMessage(invite, settings)
    try {
      await navigator.clipboard.writeText(text)
      setCopied('Copied. Paste it into WhatsApp.')
    } catch {
      setCopied('Could not copy automatically. Select the text in the full preview and copy it.')
    }
  }

  return (
    <>
      <header className="page-head page-head-actions">
        <div>
          <h1 className="page-title">E-invite</h1>
          <p className="page-sub">Build your invitation, then copy it to WhatsApp or save it as a PDF.</p>
        </div>
        <div className="head-actions invite-actions">
          <button type="button" className="btn-add" onClick={copyMessage}>
            Copy WhatsApp message
          </button>
          <button type="button" className="btn-secondary" onClick={() => window.print()}>
            Print or save as PDF
          </button>
          <a className="btn-secondary" href="#/invite/preview">
            Full preview
          </a>
        </div>
      </header>
      {copied && (
        <p className="seat-message" role="status">
          {copied}
        </p>
      )}
      <p className="fine-print invite-note">
        Sharing the invite as a web link needs the app online (taught in Build & Ship). Until then, send the WhatsApp
        message or the PDF.
      </p>

      <div data-slide className="view-switch invite-switch" role="group" aria-label="Edit or preview">
        {['edit', 'preview'].map((v) => (
          <button
            key={v}
            type="button"
            className={`view-option${view === v ? ' is-active' : ''}`}
            aria-pressed={view === v}
            onClick={() => smooth(() => setView(v), 'panel:view')}
          >
            {v === 'edit' ? 'Edit' : 'Preview'}
          </button>
        ))}
      </div>

      <div className={`invite-layout show-${view}`} data-tab-panel="view">
        <form className="invite-editor" onSubmit={(e) => e.preventDefault()}>
          <InviteTabs tab={tab} onTab={(t) => smooth(() => setTab(t), 'panel:studio')} readiness={readiness} />

          <div className="studio-panel" data-tab-panel="studio">
            {tab === 'details' && (
              <>
                <section className="invite-section">
                  <h2>Couple and family</h2>
                  <div className="form-grid">
                    <Field label="Bride's name">
                      {(id) => <input id={id} type="text" value={invite.bride} onChange={set('bride')} />}
                    </Field>
                    <Field label="Groom's name">
                      {(id) => <input id={id} type="text" value={invite.groom} onChange={set('groom')} />}
                    </Field>
                    <Field label="Hosts (parents)" wide>
                      {(id) => <textarea id={id} rows={1} value={invite.hosts} onChange={set('hosts')} />}
                    </Field>
                  </div>
                </section>
                <section className="invite-section">
                  <h2>Events</h2>
                  {events.length === 0 && <p className="muted">All events are switched off in Settings.</p>}
                  {events.map((e) => {
                    const ev = invite.events[e.id]
                    const date = settings.events[e.id].date
                    return (
                      <div key={e.id} className={`invite-event-edit${ev.show ? '' : ' is-off'}`}>
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={ev.show}
                            onChange={() => setEvent(e.id, { show: !ev.show })}
                          />
                          <span>
                            <strong>{w.events[e.id]}</strong> · {date ? formatDate(date) : 'no date yet'} (
                            <a href="#/settings">change in Settings</a>)
                          </span>
                        </label>
                        {ev.show && (
                          <div className="form-grid">
                            <Field label="Starts">
                              {(id) => (
                                <input
                                  id={id}
                                  type="time"
                                  value={ev.start}
                                  onChange={(x) => setEvent(e.id, { start: x.target.value })}
                                />
                              )}
                            </Field>
                            <Field label="Ends">
                              {(id) => (
                                <input
                                  id={id}
                                  type="time"
                                  value={ev.end}
                                  onChange={(x) => setEvent(e.id, { end: x.target.value })}
                                />
                              )}
                            </Field>
                            <Field label="Venue" wide>
                              {(id) => (
                                <input
                                  id={id}
                                  type="text"
                                  value={ev.venue}
                                  onChange={(x) => setEvent(e.id, { venue: x.target.value })}
                                />
                              )}
                            </Field>
                            <Field
                              label="Address"
                              wide
                              hint="Google Maps and Waze links are made from the venue and address."
                            >
                              {(id) => (
                                <input
                                  id={id}
                                  type="text"
                                  value={ev.address}
                                  onChange={(x) => setEvent(e.id, { address: x.target.value })}
                                />
                              )}
                            </Field>
                          </div>
                        )}
                        {ev.show && (
                          <div className="programme-edit">
                            <p className="field-label-strong">Atur cara (programme), optional</p>
                            {(ev.programme ?? []).map((r, i) => {
                              const rows = ev.programme
                              const setRow = (changes) =>
                                setEvent(e.id, { programme: rows.map((x, j) => (j === i ? { ...x, ...changes } : x)) })
                              return (
                                <div key={i} className="programme-row">
                                  <Field label="Time" hideLabel={i > 0}>
                                    {(id) => (
                                      <input
                                        id={id}
                                        type="time"
                                        value={r.time}
                                        onChange={(x) => setRow({ time: x.target.value })}
                                      />
                                    )}
                                  </Field>
                                  <Field label="What happens" hideLabel={i > 0}>
                                    {(id) => (
                                      <input
                                        id={id}
                                        type="text"
                                        placeholder="e.g. Ketibaan pengantin"
                                        value={r.item}
                                        onChange={(x) => setRow({ item: x.target.value })}
                                      />
                                    )}
                                  </Field>
                                  {/* The word on wider screens, a cross on phones; the name says which item. */}
                                  <button
                                    type="button"
                                    className="btn-text btn-delete programme-remove"
                                    aria-label={`Remove programme item ${i + 1}`}
                                    onClick={() => setEvent(e.id, { programme: rows.filter((_, j) => j !== i) })}
                                  >
                                    <span className="programme-remove-word" aria-hidden="true">
                                      Remove
                                    </span>
                                    <span className="programme-remove-cross" aria-hidden="true">
                                      ×
                                    </span>
                                  </button>
                                </div>
                              )
                            })}
                            <button
                              type="button"
                              className="btn-add-small"
                              onClick={() =>
                                setEvent(e.id, { programme: [...(ev.programme ?? []), { time: '', item: '' }] })
                              }
                            >
                              <span aria-hidden="true">+</span> Add a programme item
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </section>
                <section className="invite-section">
                  <h2>Dress code and contacts</h2>
                  <div className="form-grid">
                    <Field label="Dress code / theme" wide>
                      {(id) => <input id={id} type="text" value={invite.dressCode} onChange={set('dressCode')} />}
                    </Field>
                  </div>
                  <p className="field-label-strong">Contacts for enquiries</p>
                  {invite.contacts.map((c, i) => (
                    <div key={i} className="contact-row">
                      <Field label={`Name ${i + 1}`}>
                        {(id) => (
                          <input
                            id={id}
                            type="text"
                            value={c.name}
                            onChange={(x) => setContact(i, { name: x.target.value })}
                          />
                        )}
                      </Field>
                      <Field label="Phone / WhatsApp">
                        {(id) => (
                          <input
                            id={id}
                            type="tel"
                            value={c.phone}
                            onChange={(x) => setContact(i, { phone: x.target.value })}
                          />
                        )}
                      </Field>
                      <button
                        type="button"
                        className="btn-text btn-delete"
                        onClick={() => onChange({ contacts: invite.contacts.filter((_, j) => j !== i) })}
                      >
                        Remove<span className="visually-hidden"> contact {i + 1}</span>
                      </button>
                    </div>
                  ))}
                  {invite.contacts.length < 4 && (
                    <button
                      type="button"
                      className="btn-add-small"
                      onClick={() => onChange({ contacts: [...invite.contacts, { name: '', phone: '' }] })}
                    >
                      <span aria-hidden="true">+</span> Add a contact
                    </button>
                  )}
                </section>
              </>
            )}
            {tab === 'design' && (
              <>
                <section className="invite-section">
                  <h2>Theme</h2>
                  <fieldset className="theme-grid">
                    <legend className="visually-hidden">Theme</legend>
                    {INVITE_THEMES.map((t) => {
                      const look = themeFor(t.id, t.id === current.id ? current.palette.id : undefined)
                      return (
                        <label key={t.id} className={`theme-option${current.id === t.id ? ' is-active' : ''}`}>
                          <input
                            type="radio"
                            name="invite-theme"
                            value={t.id}
                            checked={current.id === t.id}
                            onChange={() => {
                              onChange({ theme: t.id, palette: t.palettes[0].id })
                              setReplay((r) => r + 1)
                            }}
                            className="visually-hidden"
                          />
                          <span
                            className={`theme-swatch theme-${t.id}`}
                            style={{ ...themeVars(look), backgroundColor: look.palette.heroBg }}
                            aria-hidden="true"
                          >
                            <HeroArt theme={look} />
                            <span className="theme-swatch-name">Aisyah & Hakim</span>
                          </span>
                          <span className="theme-label">{t.label}</span>
                        </label>
                      )
                    })}
                  </fieldset>
                  <fieldset className="palette-row">
                    <legend>Colour for {current.label}</legend>
                    {current.palettes.map((pal) => (
                      <label
                        key={pal.id}
                        className={`palette-option${current.palette.id === pal.id ? ' is-active' : ''}`}
                      >
                        <input
                          type="radio"
                          name="invite-palette"
                          className="visually-hidden"
                          checked={current.palette.id === pal.id}
                          onChange={() => onChange({ theme: current.id, palette: pal.id })}
                        />
                        <span
                          className="palette-dot"
                          style={{ '--a': pal.heroBg, '--b': pal.accent }}
                          aria-hidden="true"
                        />
                        {pal.label}
                      </label>
                    ))}
                  </fieldset>
                </section>
                <section className="invite-section">
                  <h2>Opening</h2>
                  <p className="field-hint">
                    Guests first see your seal with your initials. When they tap it, it peels away and the invitation is
                    revealed like this:
                  </p>
                  <fieldset className="anim-list">
                    <legend className="visually-hidden">Reveal after the seal</legend>
                    {ANIMATIONS.map((a) => (
                      <label key={a.id} className={`anim-option${animation === a.id ? ' is-active' : ''}`}>
                        <input
                          type="radio"
                          name="invite-animation"
                          value={a.id}
                          checked={animation === a.id}
                          onChange={() => {
                            onChange({ animation: a.id })
                            setReplay((r) => r + 1)
                          }}
                        />
                        <span>
                          <strong>{a.label}</strong>
                          <span className="anim-note">{a.note}</span>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                </section>
                <section className="invite-section">
                  <h2>Look</h2>
                  <div className="form-grid">
                    <Field label="Language">
                      {(id) => (
                        <select id={id} value={invite.language} onChange={set('language')}>
                          <option value="ms">Bahasa Melayu</option>
                          <option value="en">English</option>
                        </select>
                      )}
                    </Field>
                    <label className="toggle invite-toggle">
                      <input type="checkbox" checked={invite.showBismillah} onChange={set('showBismillah')} />
                      <span>Show Bismillah at the top</span>
                    </label>
                    {current.particles === 'none' ? (
                      <p className="field-hint">{current.label} has no floating particles.</p>
                    ) : (
                      <label className="toggle invite-toggle">
                        {/* Older saved invitations have no setting yet: treat that as on. */}
                        <input
                          type="checkbox"
                          checked={invite.particles !== false}
                          onChange={(e) => onChange({ particles: e.target.checked })}
                        />
                        <span>Floating {PARTICLE_NAMES[current.particles]} over the invitation</span>
                      </label>
                    )}
                  </div>
                </section>
              </>
            )}
            {tab === 'wording' && (
              <>
                <section className="invite-section">
                  <h2>Wording</h2>
                  <p className="field-hint">Leave blank to use the standard wording shown in grey.</p>
                  <div className="form-grid">
                    <Field label="Title" wide>
                      {(id) => (
                        <input id={id} type="text" placeholder={w.title} value={invite.title} onChange={set('title')} />
                      )}
                    </Field>
                    <Field label="Line on the cover page" wide>
                      {(id) => (
                        <textarea
                          id={id}
                          rows={2}
                          placeholder={w.tagline}
                          value={invite.tagline}
                          onChange={set('tagline')}
                        />
                      )}
                    </Field>
                    <Field label="Opening" wide>
                      {(id) => (
                        <textarea
                          id={id}
                          rows="3"
                          placeholder={w.opening}
                          value={invite.opening}
                          onChange={set('opening')}
                        />
                      )}
                    </Field>
                    <Field label="Doa" wide>
                      {(id) => (
                        <textarea id={id} rows="3" placeholder={w.doa} value={invite.doa} onChange={set('doa')} />
                      )}
                    </Field>
                    <Field label="Closing" wide>
                      {(id) => (
                        <textarea
                          id={id}
                          rows="2"
                          placeholder={w.closing}
                          value={invite.closing}
                          onChange={set('closing')}
                        />
                      )}
                    </Field>
                    <Field label="Sign-off on the closing arch" wide>
                      {(id) => (
                        <input
                          id={id}
                          type="text"
                          placeholder={w.signOff}
                          value={invite.signOff}
                          onChange={set('signOff')}
                        />
                      )}
                    </Field>
                  </div>
                </section>
              </>
            )}
            {tab === 'media' && (
              <>
                <InviteMedia media={invite.media} onChange={(media) => onChange({ media })} />
                <section className="invite-section">
                  <h2>Background music</h2>
                  <Field
                    label="YouTube link"
                    wide
                    hint="The song starts when guests open the invitation and loops. Guests play and pause it with the spinning disc. Needs internet."
                  >
                    {(id) => (
                      <input
                        id={id}
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=…"
                        value={invite.music?.url ?? ''}
                        onChange={(e) => onChange({ music: { url: e.target.value } })}
                      />
                    )}
                  </Field>
                  {invite.music?.url &&
                    (song ? (
                      <MusicCheck song={song} onRemove={() => onChange({ music: { url: '' } })} />
                    ) : (
                      <p className="field-error">That does not look like a YouTube video link.</p>
                    ))}
                </section>
              </>
            )}
            {tab === 'guests' && (
              <>
                <section className="invite-section">
                  <h2>RSVP</h2>
                  <label className="toggle invite-toggle">
                    <input
                      type="checkbox"
                      checked={invite.rsvp.show}
                      onChange={(e) => setPart('rsvp', { show: e.target.checked })}
                    />
                    <span>Show the RSVP section and menu button</span>
                  </label>
                  {invite.rsvp.show && (
                    <>
                      <p className="field-hint">
                        Guests fill in a short form: name, phone number, attending or not, how many people and which
                        events. Each reply goes straight to your <a href="#/guests">Guests</a> page. If the phone number
                        matches a guest, their reply, number of people and events update automatically; otherwise it
                        waits there for you to review. For now this works for replies made in this browser (try it in
                        the preview); replies from guests&apos; own phones arrive once the app is online (Build & Ship).
                      </p>
                      <div className="form-grid">
                        <Field label="Reply by (optional)">
                          {(id) => <input id={id} type="date" value={invite.rsvpBy} onChange={set('rsvpBy')} />}
                        </Field>
                        <Field
                          label="WhatsApp number (optional)"
                          hint={
                            invite.rsvp.phone
                              ? whatsappHref(invite.rsvp.phone)
                                ? 'After replying, guests can also send their reply to this number on WhatsApp.'
                                : 'This number looks too short.'
                              : replyTo
                                ? `After replying, guests can also send it on WhatsApp. Leave blank to use the first contact's number (${replyTo}).`
                                : 'Add a number if you also want replies on WhatsApp.'
                          }
                        >
                          {(id) => (
                            <input
                              id={id}
                              type="tel"
                              placeholder={replyTo || '012-345 6789'}
                              value={invite.rsvp.phone}
                              onChange={(e) => setPart('rsvp', { phone: e.target.value })}
                            />
                          )}
                        </Field>
                      </div>
                    </>
                  )}
                </section>
                <section className="invite-section">
                  <h2>Wedding gift (salam kaut)</h2>
                  <label className="toggle invite-toggle">
                    <input
                      type="checkbox"
                      checked={invite.gift.show}
                      onChange={(e) => setPart('gift', { show: e.target.checked })}
                    />
                    <span>Show bank details for gifts</span>
                  </label>
                  {invite.gift.show && (
                    <>
                      <p className="field-hint">
                        Shown under &ldquo;Hadiah&rdquo; in the invitation&apos;s bottom menu, together with your wish
                        list. Anyone with the invitation can see these details, so check the account number carefully.
                        They only show once there is an account number or a QR image.
                      </p>
                      <div className="form-grid">
                        <Field label="Bank">
                          {(id) => (
                            <input
                              id={id}
                              type="text"
                              value={invite.gift.bank}
                              onChange={(e) => setPart('gift', { bank: e.target.value })}
                            />
                          )}
                        </Field>
                        <Field label="Account number">
                          {(id) => (
                            <input
                              id={id}
                              type="text"
                              inputMode="numeric"
                              value={invite.gift.account}
                              onChange={(e) => setPart('gift', { account: e.target.value })}
                            />
                          )}
                        </Field>
                        <Field label="Account holder's name" wide>
                          {(id) => (
                            <input
                              id={id}
                              type="text"
                              value={invite.gift.holder}
                              onChange={(e) => setPart('gift', { holder: e.target.value })}
                            />
                          )}
                        </Field>
                        <Field label="Short note (optional)" wide>
                          {(id) => (
                            <input
                              id={id}
                              type="text"
                              placeholder="e.g. Your prayers are the best gift of all."
                              value={invite.gift.note}
                              onChange={(e) => setPart('gift', { note: e.target.value })}
                            />
                          )}
                        </Field>
                      </div>
                      <p className="field-label-strong">QR image (optional)</p>
                      <p className="field-hint">
                        A screenshot of your bank's DuitNow QR works well. It is shown on a white card.
                      </p>
                      <GiftQr id={invite.gift.qr} onChange={(qr) => setPart('gift', { qr })} />
                    </>
                  )}
                </section>
                <section className="invite-section">
                  <h2>Gift wish list</h2>
                  <label className="toggle invite-toggle">
                    <input
                      type="checkbox"
                      checked={invite.registry.show}
                      onChange={(e) => setPart('registry', { show: e.target.checked })}
                    />
                    <span>Show your wish list (&ldquo;Senarai Hadiah&rdquo;)</span>
                  </label>
                  <p className="field-hint">
                    {wishlist?.length
                      ? `${wishlist.length} ${wishlist.length === 1 ? 'item' : 'items'} on your list. `
                      : 'Your wish list is empty, so nothing shows yet. '}
                    It shows under &ldquo;Hadiah&rdquo; in the bottom menu, below your bank details. Guests reserve an
                    item with their name and phone number. <a href="#/gifts/wishlist">Edit the wish list</a>.
                  </p>
                </section>
                <section className="invite-section">
                  <h2>Wishes</h2>
                  <label className="toggle invite-toggle">
                    <input
                      type="checkbox"
                      checked={invite.wishes.show}
                      onChange={(e) => setPart('wishes', { show: e.target.checked })}
                    />
                    <span>Show the wishes wall</span>
                  </label>
                  {invite.wishes.show && (
                    <>
                      <p className="field-hint">
                        Guests can write wishes on the invitation. Until it is online (Build & Ship), a guest&apos;s
                        wish only shows on their own screen, so add the wishes you&apos;ve received here to show them to
                        everyone.
                      </p>
                      {invite.wishes.list.map((x, i) => (
                        <div key={i} className="wish-row">
                          <Field label={`From ${i + 1}`}>
                            {(id) => (
                              <input
                                id={id}
                                type="text"
                                value={x.name}
                                onChange={(e) => setWish(i, { name: e.target.value })}
                              />
                            )}
                          </Field>
                          <Field label="Wish">
                            {(id) => (
                              <textarea
                                id={id}
                                rows="2"
                                value={x.message}
                                onChange={(e) => setWish(i, { message: e.target.value })}
                              />
                            )}
                          </Field>
                          <button
                            type="button"
                            className="btn-text btn-delete"
                            onClick={() => setPart('wishes', { list: invite.wishes.list.filter((_, j) => j !== i) })}
                          >
                            Remove<span className="visually-hidden"> wish {i + 1}</span>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn-add-small"
                        onClick={() => setPart('wishes', { list: [...invite.wishes.list, { name: '', message: '' }] })}
                      >
                        <span aria-hidden="true">+</span> Add a wish
                      </button>
                    </>
                  )}
                </section>
              </>
            )}
          </div>
        </form>

        <aside className="invite-preview" aria-label="Preview, as guests see it on an iPhone" ref={previewRef}>
          <div className="phone-frame" style={{ zoom }}>
            <InviteView
              key={`${replay}-${invite.animation}`}
              invite={invite}
              settings={settings}
              onReply={onReply}
              wishlist={wishlist}
              onReserve={onReserve}
              contained
            />
          </div>
          {animation !== 'none' && (
            <button type="button" className="btn-add-small replay" onClick={() => setReplay((r) => r + 1)}>
              Replay opening
            </button>
          )}
        </aside>
      </div>

      {/* What "Print or save as PDF" prints: the card on its own. */}
      <div className="print-only">
        <InviteCard invite={invite} settings={settings} />
      </div>
    </>
  )
}
