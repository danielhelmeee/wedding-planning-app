import { useCallback, useEffect, useId, useRef, useState } from 'react'
import '../invite.css'
import Opening from './invite/Opening.jsx'
import { BandArt, Divider, HeroArt, SectionArt } from './invite/ThemeArt.jsx'
import { Icon, Particles, Reveal } from './invite/Motion.jsx'
import { isDark, paperGrain } from './invite/artUtils.js'
import {
  firstStart,
  icsHref,
  initialsOf,
  inviteDate,
  inviteEvents,
  mapLinks,
  rsvpHref,
  timeRange,
  inviteTime,
  wordsFor,
} from '../invite.js'
import { animationFor, themeFor, themeVars } from '../inviteThemes.js'
import { whatsappHref } from '../contact.js'
import { useImage } from '../media.js'
import { parseYouTube, useYouTubePlayer, youTubeProblem } from '../youtube.js'
import { phoneKey } from '../rsvp.js'

// `target` is a timestamp (ms), so the timer is not restarted by re-renders.
function useCountdown(target, running) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!running || !target) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [running, target])
  if (!target) return null
  const ms = Math.max(0, target - now)
  return [
    Math.floor(ms / 86400000),
    Math.floor(ms / 3600000) % 24,
    Math.floor(ms / 60000) % 60,
    Math.floor(ms / 1000) % 60,
  ]
}

function Countdown({ target, running, words, bg }) {
  const count = useCountdown(target, running)
  if (!count) return null
  return (
    <section className="iv-sec" style={bg('var(--iv-bg)')}>
      <div className="iv-sec-inner">
        <Reveal as="h2" className="iv-section-title">
          {words.countdown}
        </Reveal>
        <Reveal className="iv-count" effect="zoom">
          {count.map((n, i) => (
            <div key={words.units[i]} className="iv-count-cell">
              <span className="iv-count-n">{String(n).padStart(2, '0')}</span>
              <span className="iv-count-u">{words.units[i]}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}

function GalleryPhoto({ id, index }) {
  const url = useImage(id)
  return (
    <li className="iv-slide">
      {url ? (
        <img src={url} alt={`Photo ${index + 1}`} loading="lazy" draggable="false" />
      ) : (
        <span className="iv-slide-empty" />
      )}
    </li>
  )
}

// Swipeable photos (scroll-snap) with dots showing where you are.
function Gallery({ ids, title, style }) {
  const [at, setAt] = useState(0)
  const onScroll = (e) => {
    const el = e.currentTarget
    setAt(Math.round(el.scrollLeft / el.clientWidth))
  }
  return (
    <section className="iv-sec iv-gallery" style={style}>
      <div className="iv-sec-inner">
        <Reveal as="h2" className="iv-section-title">
          {title}
        </Reveal>
      </div>
      <Reveal effect="zoom">
        <ul className="iv-slides" onScroll={onScroll} aria-label={title}>
          {ids.map((id, i) => (
            <GalleryPhoto key={id} id={id} index={i} />
          ))}
        </ul>
        {ids.length > 1 && (
          <div className="iv-dots" aria-hidden="true">
            {ids.map((id, i) => (
              <span key={id} className={i === at ? 'is-on' : undefined} />
            ))}
          </div>
        )}
      </Reveal>
    </section>
  )
}

function MapButtons({ e }) {
  const maps = mapLinks(e)
  if (!maps) return null
  return (
    <div className="iv-buttons">
      <a className="iv-btn" href={maps.google} target="_blank" rel="noopener noreferrer">
        <Icon name="map" size={16} /> Google Maps<span className="visually-hidden"> (opens in a new tab)</span>
      </a>
      <a className="iv-btn" href={maps.waze} target="_blank" rel="noopener noreferrer">
        <Icon name="car" size={16} /> Waze<span className="visually-hidden"> (opens in a new tab)</span>
      </a>
    </div>
  )
}

// A bottom sheet (Calendar / Contacts / Location). It glides up from the bottom; closing plays the reverse
// before it is removed.
function Sheet({ title, onClose, closing = false, children }) {
  const id = useId()
  const [leavingSelf, setLeaving] = useState(false)
  const leaving = leavingSelf || closing
  const closeBtn = useRef(null)
  const close = () => setLeaving(true)
  // Focus the close button without scrolling: autofocus scrolled the page to the still-hidden sheet,
  // which made the content behind it jump.
  useEffect(() => {
    closeBtn.current?.focus({ preventScroll: true })
  }, [])
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setLeaving(true)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => {
    if (!leaving) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = setTimeout(onClose, reduced ? 0 : 320)
    return () => clearTimeout(t)
  }, [leaving, onClose])
  return (
    <div className={`iv-sheet-layer${leaving ? ' is-leaving' : ''}`} onClick={close}>
      <section
        className="iv-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="iv-sheet-handle" aria-hidden="true" />
        <div className="iv-sheet-head">
          <h2 id={id}>{title}</h2>
          <button type="button" className="iv-sheet-close" onClick={close} aria-label="Close" ref={closeBtn}>
            <Icon name="close" size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  )
}

// The guest's reply. It is saved and matched to the guest list by phone number (see rsvp.js);
// afterwards the guest can also send it on WhatsApp.
function RsvpForm({ invite, events, w, onReply }) {
  const blank = { name: '', phone: '', coming: true, people: 1, events: events.map((e) => e.id), note: '' }
  const [reply, setReply] = useState(blank)
  const [problem, setProblem] = useState('')
  const [sent, setSent] = useState(null)
  const set = (changes) => {
    setReply((r) => ({ ...r, ...changes }))
    setProblem('')
  }
  const nameId = useId()
  const phoneId = useId()
  const noteId = useId()
  const peopleId = useId()

  function send(e) {
    e.preventDefault()
    if (!reply.name.trim()) return setProblem(w.nameNeeded)
    if (!phoneKey(reply.phone)) return setProblem(w.phoneNeeded)
    if (reply.coming && events.length > 1 && reply.events.length === 0) return setProblem(w.eventNeeded)
    const clean = {
      ...reply,
      name: reply.name.trim(),
      phone: reply.phone.trim(),
      note: reply.note.trim(),
      events: reply.coming ? (events.length > 1 ? reply.events : events.map((x) => x.id)) : [],
    }
    onReply?.(clean)
    setSent(clean)
  }

  if (sent) {
    const wa = rsvpHref(invite, w, sent)
    return (
      <div className="iv-thanks" role="status">
        <span className="iv-thanks-mark" aria-hidden="true">
          <Icon name="heart" size={26} />
        </span>
        <p className="iv-sheet-strong">
          {w.thanksTitle}, {sent.name}
        </p>
        <p className="iv-sheet-muted">{sent.coming ? w.thanksComing : w.thanksNotComing}</p>
        <p className="iv-thanks-summary">
          {sent.coming ? `${w.attending} · ${sent.people} ${w.peopleUnit}` : w.notAttending}
          {sent.coming && events.length > 1 && <span>{sent.events.map((id) => w.events[id]).join(' · ')}</span>}
        </p>
        <div className="iv-buttons">
          {wa && (
            <a className="iv-btn" href={wa} target="_blank" rel="noopener noreferrer">
              <Icon name="phone" size={16} /> {w.alsoWhatsApp}
            </a>
          )}
          <button type="button" className="iv-btn" onClick={() => setSent(null)}>
            {w.changeReply}
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="iv-form" onSubmit={send} noValidate>
      {invite.rsvpBy && (
        <p className="iv-sheet-muted iv-form-note">
          {w.rsvp} {w.rsvpBy} {inviteDate(invite.rsvpBy, invite.language)}
        </p>
      )}
      <label className="iv-field" htmlFor={nameId}>
        <span>{w.yourName}</span>
        <input
          id={nameId}
          type="text"
          autoComplete="name"
          value={reply.name}
          onChange={(e) => set({ name: e.target.value })}
        />
      </label>
      <label className="iv-field" htmlFor={phoneId}>
        <span>{w.phoneLabel}</span>
        <input
          id={phoneId}
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="012-345 6789"
          value={reply.phone}
          onChange={(e) => set({ phone: e.target.value })}
        />
      </label>
      <div className="iv-choice" role="radiogroup" aria-label={w.rsvpMsg.attendance}>
        {[
          [true, w.attending],
          [false, w.notAttending],
        ].map(([value, label]) => (
          <label key={label} className={reply.coming === value ? 'is-on' : undefined}>
            <input
              type="radio"
              name="iv-coming"
              checked={reply.coming === value}
              onChange={() => set({ coming: value })}
            />
            {label}
          </label>
        ))}
      </div>
      {reply.coming && (
        <>
          <label className="iv-field" htmlFor={peopleId}>
            <span>{w.people}</span>
            <select id={peopleId} value={reply.people} onChange={(e) => set({ people: Number(e.target.value) })}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          {events.length > 1 && (
            <fieldset className="iv-field iv-events-pick">
              <legend>{w.whichEvents}</legend>
              {events.map((e) => (
                <label key={e.id} className="iv-check">
                  <input
                    type="checkbox"
                    checked={reply.events.includes(e.id)}
                    onChange={() =>
                      set({
                        events: reply.events.includes(e.id)
                          ? reply.events.filter((x) => x !== e.id)
                          : events.map((x) => x.id).filter((x) => x === e.id || reply.events.includes(x)),
                      })
                    }
                  />
                  {w.events[e.id]}
                </label>
              ))}
            </fieldset>
          )}
        </>
      )}
      <label className="iv-field" htmlFor={noteId}>
        <span>{w.noteLabel}</span>
        <textarea id={noteId} rows="2" value={reply.note} onChange={(e) => set({ note: e.target.value })} />
      </label>
      {problem && (
        <p className="iv-form-error" role="alert">
          {problem}
        </p>
      )}
      <button type="submit" className="iv-btn iv-btn-solid iv-btn-wide">
        <Icon name="reply" size={16} /> {w.send}
      </button>
    </form>
  )
}

// Wishes from the couple's list. A guest's new wish shows at the top on their own device (preview only).
function Wishes({ list, w, style }) {
  const [mine, setMine] = useState([])
  const [draft, setDraft] = useState({ name: '', message: '' })
  const nameId = useId()
  const msgId = useId()
  const all = [...mine, ...list.filter((x) => x.name || x.message)]
  function add(e) {
    e.preventDefault()
    if (!draft.name.trim() || !draft.message.trim()) return
    setMine((m) => [{ name: draft.name.trim(), message: draft.message.trim(), mine: true }, ...m])
    setDraft({ name: '', message: '' })
  }
  return (
    <section className="iv-sec" style={style}>
      <div className="iv-sec-inner">
        <Reveal as="h2" className="iv-section-title">
          {w.wishesTitle}
        </Reveal>
        <Reveal as="ul" className="iv-wishes">
          {all.length === 0 && <li className="iv-wish is-empty">{w.noWishes}</li>}
          {all.map((x, i) => (
            <li key={`${i}-${x.name}`} className={`iv-wish${x.mine ? ' is-mine' : ''}`}>
              <p className="iv-wish-msg">{x.message}</p>
              <p className="iv-wish-name">{x.name}</p>
            </li>
          ))}
        </Reveal>
        <Reveal>
          <form className="iv-form iv-wish-form" onSubmit={add}>
            <label className="iv-field" htmlFor={nameId}>
              <span>{w.wishName}</span>
              <input
                id={nameId}
                type="text"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label className="iv-field" htmlFor={msgId}>
              <span>{w.wishMessage}</span>
              <textarea
                id={msgId}
                rows="3"
                value={draft.message}
                onChange={(e) => setDraft({ ...draft, message: e.target.value })}
              />
            </label>
            <button
              type="submit"
              className="iv-btn iv-btn-solid iv-btn-wide"
              disabled={!draft.name.trim() || !draft.message.trim()}
            >
              <Icon name="heart" size={16} /> {w.wishSend}
            </button>
            <p className="iv-sheet-muted iv-form-note">{w.wishPreview}</p>
          </form>
        </Reveal>
      </div>
    </section>
  )
}

// The couple's wish list. A guest reserves an item with their name and phone (matched to the guest list).
function Registry({ items, w, onReserve, mine, onMine }) {
  const [open, setOpen] = useState(null)
  const [who, setWho] = useState({ name: '', phone: '' })
  const [problem, setProblem] = useState('')
  const nameId = useId()
  const phoneId = useId()
  function reserve(e) {
    e.preventDefault()
    if (!who.name.trim()) return setProblem(w.nameNeeded)
    if (!phoneKey(who.phone)) return setProblem(w.phoneNeeded)
    onReserve?.(open, { name: who.name.trim(), phone: who.phone.trim() })
    onMine(open)
    setOpen(null)
  }
  return (
    <div className="iv-sheet-block">
      <h3 className="iv-sheet-sub">{w.registryTitle}</h3>
      <p className="iv-sheet-muted">{w.registryIntro}</p>
      <ul className="iv-registry">
        {items.map((it) => {
          const taken = !!it.reservedBy || it.received
          const byMe = mine.includes(it.id)
          const link = /^https?:\/\//i.test(it.link) ? it.link : it.link ? `https://${it.link}` : ''
          return (
            <li key={it.id} className={`iv-registry-item${byMe ? ' is-mine' : taken ? ' is-taken' : ''}`}>
              <div className="iv-registry-head">
                <div>
                  <p className="iv-registry-name">{it.name}</p>
                  {it.price > 0 && (
                    <p className="iv-registry-price">± RM {Math.round(it.price).toLocaleString('en-MY')}</p>
                  )}
                  {it.note && <p className="iv-sheet-muted">{it.note}</p>}
                </div>
                {taken ? (
                  <span className="iv-registry-taken">
                    <Icon name="heart" size={14} /> {byMe ? w.reservedByYou : w.reserved}
                  </span>
                ) : (
                  open !== it.id && (
                    <button
                      type="button"
                      className="iv-btn iv-btn-small"
                      onClick={() => {
                        setOpen(it.id)
                        setProblem('')
                      }}
                    >
                      {w.reserve}
                    </button>
                  )
                )}
              </div>
              {byMe && (
                <p className="iv-registry-thanks" role="status">
                  {w.reserveThanks}
                </p>
              )}
              {link && !taken && (
                <a className="iv-registry-link" href={link} target="_blank" rel="noopener noreferrer">
                  {w.viewItem} ↗
                </a>
              )}
              {open === it.id && (
                <form className="iv-form iv-registry-form" onSubmit={reserve} noValidate>
                  <label className="iv-field" htmlFor={nameId}>
                    <span>{w.yourName}</span>
                    <input
                      id={nameId}
                      type="text"
                      autoComplete="name"
                      value={who.name}
                      onChange={(e) => {
                        setWho({ ...who, name: e.target.value })
                        setProblem('')
                      }}
                    />
                  </label>
                  <label className="iv-field" htmlFor={phoneId}>
                    <span>{w.phoneLabel}</span>
                    <input
                      id={phoneId}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="012-345 6789"
                      value={who.phone}
                      onChange={(e) => {
                        setWho({ ...who, phone: e.target.value })
                        setProblem('')
                      }}
                    />
                  </label>
                  {problem && (
                    <p className="iv-form-error" role="alert">
                      {problem}
                    </p>
                  )}
                  <div className="iv-registry-actions">
                    <button type="button" className="iv-btn" onClick={() => setOpen(null)}>
                      {w.cancel}
                    </button>
                    <button type="submit" className="iv-btn iv-btn-solid">
                      {w.reserveSend}
                    </button>
                  </div>
                </form>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// Salam kaut: bank details with a copy button, and the couple's QR image if they added one.
function Gift({ gift, w }) {
  const qr = useImage(gift.qr)
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(gift.account.replace(/\s/g, ''))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // the number stays visible to copy by hand
    }
  }
  return (
    <div className="iv-sheet-block">
      <h3 className="iv-sheet-sub">{w.giftTitle}</h3>
      <p className="iv-sheet-muted">{w.giftIntro}</p>
      <div className="iv-gift-card">
        <Icon name="gift" size={22} />
        {gift.bank && <p className="iv-gift-bank">{gift.bank}</p>}
        {gift.account && <p className="iv-gift-account">{gift.account}</p>}
        {gift.holder && <p className="iv-gift-holder">{gift.holder}</p>}
        {gift.account && (
          <button type="button" className="iv-btn" onClick={copy}>
            <Icon name="copy" size={16} /> {copied ? w.copied : w.copy}
          </button>
        )}
        {qr && (
          <figure className="iv-gift-qr">
            <img src={qr} alt="" />
            <figcaption>{w.scanQr}</figcaption>
          </figure>
        )}
      </div>
      {gift.note && <p className="iv-sheet-muted iv-gift-note">{gift.note}</p>}
    </div>
  )
}

// The guest invitation. `contained` keeps it inside the studio's phone frame instead of the whole screen.
export default function InviteView({ invite, settings, onReply, wishlist = [], onReserve, contained = false }) {
  const theme = themeFor(invite.theme, invite.palette)
  const NamesTag = contained ? 'p' : 'h1'
  const p = theme.palette
  const animation = animationFor(invite.animation)
  const w = wordsFor(invite)
  const lang = invite.language
  const events = inviteEvents(invite, settings)
  const contacts = invite.contacts.filter((c) => c.name || c.phone)
  const withProgramme = events.filter((e) => e.programme?.some((r) => r.time || r.item))
  const [opened, setOpened] = useState(animation === 'none')
  const [revealed, setRevealed] = useState(animation === 'none')
  const [sheet, setSheet] = useState(null)
  const [sheetClosing, setSheetClosing] = useState(false)
  const [reservedByMe, setReservedByMe] = useState([])
  const video = parseYouTube(invite.music?.url)
  const playerHost = useRef(null)
  const music = useYouTubePlayer(playerHost, video)
  const closeSheet = useCallback(() => {
    setSheet(null)
    setSheetClosing(false)
  }, [setSheet, setSheetClosing])
  // Menu buttons: tap to open; tap the open one again to slide it back down; tap another to switch.
  const toggleSheet = (key) => {
    if (sheet === key) setSheetClosing(true)
    else {
      setSheet(key)
      setSheetClosing(false)
    }
  }
  // The music sheet (no menu button: the disc plays and pauses) stays mounted so the song keeps playing;
  // it only slides up when the song can't play, and closes with the same slide-down.
  useEffect(() => {
    if (sheet !== 'music' || !sheetClosing) return
    const t = setTimeout(closeSheet, 320)
    return () => clearTimeout(t)
  }, [sheet, sheetClosing, closeSheet])

  const startsAt = firstStart(invite, settings)?.getTime() ?? null
  const firstDated = events.find((e) => e.date)
  const grain = paperGrain(theme.dark)
  const media = invite.media ?? { gallery: [] }
  const sectionBg = (colour) => ({ backgroundColor: colour, backgroundImage: grain })
  const heroDark = isDark(p.heroBg)
  const particles = invite.particles === false ? 'none' : theme.particles
  const heroParticles = particles === 'stars'
  const arcId = useId().replace(/:/g, '')
  const showGift = invite.gift?.show && !!(invite.gift.account || invite.gift.qr)
  const showRegistry = invite.registry?.show && wishlist.length > 0

  const names = (
    <>
      <span className="iv-name">{invite.bride || '…'}</span>
      <span className="iv-amp">&amp;</span>
      <span className="iv-name">{invite.groom || '…'}</span>
    </>
  )

  // The cover's wording. `Tag` is the element for the names (h1 on the guest page; a plain p in the studio and in
  // the copy of the cover that sits inside the envelope).
  const heroText = (Tag) => (
    <div className="iv-hero-text">
      <p className="iv-hero-tagline hero-step" style={{ '--step': 0 }}>
        {w.tagline}
      </p>
      <Tag className="iv-hero-names hero-step" style={{ '--step': 1 }}>
        {names}
      </Tag>
      {firstDated && (
        <p className="iv-hero-date hero-step" style={{ '--step': 2 }}>
          {inviteDate(firstDated.date, lang)}
        </p>
      )}
      {firstDated?.venue && (
        <p className="iv-hero-venue hero-step" style={{ '--step': 3 }}>
          {firstDated.venue}
        </p>
      )}
    </div>
  )
  const heroClass = `iv-hero${heroDark ? ' on-dark' : ''}`
  const heroStyle = { backgroundColor: p.heroBg, backgroundImage: grain }
  // With the envelope, guests already see the finished cover on the card as it rises, so the real cover skips its
  // staged entrance (otherwise the wording would vanish and fade in again when the envelope is removed).
  const envelope = animation === 'envelope'

  return (
    <div
      className={`iv-shell theme-${theme.id}${contained ? ' is-contained' : ''}${theme.dark ? ' is-dark' : ''}${revealed ? ' is-revealed' : ''}${opened ? ' is-open' : ''}${envelope ? ' cover-ready' : ''}`}
      style={themeVars(theme)}
      lang={lang === 'en' ? 'en' : 'ms'}
    >
      <div className="iv-scroll">
        <div className="iv-page">
          {/* Hero: fills the screen */}
          <header className={heroClass} style={heroStyle}>
            <HeroArt theme={theme} />
            {/* Stars belong to the night sky on the cover; over the content sections they read as see-through. */}
            {heroParticles && (
              <Particles kind={particles} palette={p} look={`${theme.id}-${p.id}`} running={revealed} />
            )}
            {/* In the studio preview the page already has its h1, so the names use a plain element there. */}
            {heroText(NamesTag)}
          </header>

          {/* The invitation */}
          <section className="iv-sec" style={sectionBg(p.bg)}>
            <SectionArt theme={theme} side="right" />
            <SectionArt theme={theme} side="left-bottom" />
            <div className="iv-sec-inner">
              {invite.showBismillah && (
                <Reveal as="p" className="iv-bismillah" effect="fade">
                  <span lang="ar" dir="rtl">
                    بسم الله الرحمن الرحيم
                  </span>
                </Reveal>
              )}
              <Reveal as="p" className="iv-kicker">
                {w.title}
              </Reveal>
              <Reveal>
                <Divider theme={theme} />
              </Reveal>
              {invite.hosts && (
                <Reveal as="p" className="iv-hosts">
                  {invite.hosts}
                </Reveal>
              )}
              <Reveal as="p" className="iv-body" delay={80}>
                {w.opening}
              </Reveal>
              <Reveal as="p" className="iv-couple" effect="zoom" delay={120}>
                {names}
              </Reveal>
            </div>
          </section>

          {/* Event details */}
          <section className="iv-sec alt" style={sectionBg(p.bgAlt)}>
            <SectionArt theme={theme} side="left" />
            <div className="iv-sec-inner">
              {events.map((e, i) => {
                const ics = icsHref(e, invite, w)
                return (
                  <Reveal key={e.id} className="iv-event" delay={i * 60}>
                    <h2 className="iv-event-name">{w.events[e.id]}</h2>
                    <Divider theme={theme} />
                    <dl className="iv-facts">
                      {e.date && (
                        <div>
                          <dt>
                            <Icon name="calendar" /> {w.date}
                          </dt>
                          <dd>{inviteDate(e.date, lang)}</dd>
                        </div>
                      )}
                      {timeRange(e, lang) && (
                        <div>
                          <dt>
                            <Icon name="clock" /> {w.time}
                          </dt>
                          <dd>{timeRange(e, lang)}</dd>
                        </div>
                      )}
                      {(e.venue || e.address) && (
                        <div>
                          <dt>
                            <Icon name="pin" /> {w.venue}
                          </dt>
                          <dd>
                            <strong>{e.venue}</strong>
                            {e.address && <span>{e.address}</span>}
                          </dd>
                        </div>
                      )}
                    </dl>
                    <MapButtons e={e} />
                    {ics && (
                      <a className="iv-btn iv-btn-solid" href={ics} download={`${e.id}-${e.date}.ics`}>
                        <Icon name="calendar" size={16} /> {w.saveDate}
                      </a>
                    )}
                  </Reveal>
                )
              })}
            </div>
          </section>

          {/* Programme on a frosted card over artwork */}
          {withProgramme.length > 0 && (
            <section className="iv-band" style={{ backgroundColor: p.heroBg, backgroundImage: grain }}>
              <BandArt theme={theme} />
              {withProgramme.map((e) => (
                <Reveal key={e.id} className="iv-glass" effect="zoom">
                  <h2 className="iv-glass-title">{w.programme}</h2>
                  <p className="iv-glass-sub">{w.events[e.id]}</p>
                  <ol className="iv-timeline">
                    {e.programme
                      .filter((r) => r.time || r.item)
                      .map((r, i) => (
                        <li key={i}>
                          <span className="iv-timeline-time">{inviteTime(r.time, lang)}</span>
                          <span className="iv-timeline-item">{r.item}</span>
                        </li>
                      ))}
                  </ol>
                </Reveal>
              ))}
            </section>
          )}

          {media.gallery.length > 0 && <Gallery ids={media.gallery} title={w.gallery} style={sectionBg(p.bg)} />}

          {/* Countdown (its own component, so its tick re-renders only the numbers) */}
          <Countdown target={startsAt} running={revealed} words={w} bg={sectionBg} />

          {/* RSVP */}
          {invite.rsvp?.show && (
            <section className="iv-sec" style={sectionBg(p.bgAlt)}>
              <SectionArt theme={theme} side="right" />
              <div className="iv-sec-inner">
                <Reveal as="h2" className="iv-section-title">
                  {w.rsvpTitle}
                </Reveal>
                <Reveal as="p" className="iv-body">
                  {w.rsvp}
                  {invite.rsvpBy && ` ${w.rsvpBy} ${inviteDate(invite.rsvpBy, lang)}`}
                </Reveal>
                <Reveal>
                  <button type="button" className="iv-btn iv-btn-solid" onClick={() => toggleSheet('rsvp')}>
                    <Icon name="reply" size={16} /> {w.rsvpButton}
                  </button>
                </Reveal>
              </div>
            </section>
          )}

          {invite.wishes?.show && (
            <Wishes list={invite.wishes.list} w={w} style={sectionBg(invite.rsvp?.show ? p.bg : p.bgAlt)} />
          )}

          {/* Dress code and doa */}
          <section className="iv-sec alt" style={sectionBg(p.bgAlt)}>
            <SectionArt theme={theme} side="right" />
            <div className="iv-sec-inner">
              {invite.dressCode && (
                <Reveal className="iv-dress">
                  <p className="iv-label">
                    <Icon name="dress" size={16} /> {w.dress}
                  </p>
                  <p>{invite.dressCode}</p>
                </Reveal>
              )}
              <Reveal>
                <Divider theme={theme} />
              </Reveal>
              <Reveal as="p" className="iv-doa">
                {w.doa}
              </Reveal>
              <Reveal as="p" className="iv-closing-line" delay={80}>
                {w.closing}
              </Reveal>
            </div>
          </section>

          {/* Closing arch with curved text */}
          <section className="iv-arch-wrap" style={sectionBg(p.bgAlt)}>
            <Reveal className="iv-arch" effect="up">
              <svg viewBox="0 0 400 230" className="iv-arch-svg" aria-hidden="true">
                <path d="M0 230V200C0 89.5 89.5 0 200 0s200 89.5 200 200v30z" fill={heroDark ? p.heroBg : p.accent} />
                <path id={arcId} d="M70 175a130 130 0 0 1 260 0" fill="none" />
                <text className="iv-arch-from" fill={heroDark ? p.heroInk : p.onAccent}>
                  <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
                    {w.from.toUpperCase()}
                  </textPath>
                </text>
              </svg>
              <p className="iv-arch-sign" style={{ color: heroDark ? p.heroInk : p.onAccent }}>
                {w.signOff}
              </p>
            </Reveal>
          </section>

          {/* Docked menu */}
          <nav className="iv-dock" aria-label="Invitation menu">
            {[
              ['calendar', 'calendar'],
              ['contacts', 'phone'],
              ['location', 'pin'],
              ...(invite.rsvp?.show ? [['rsvp', 'reply']] : []),
              ...(showGift || showRegistry ? [['gift', 'gift']] : []),
            ].map(([key, icon]) => (
              <button
                key={key}
                type="button"
                className={`iv-dock-btn${sheet === key && !sheetClosing ? ' is-active' : ''}`}
                aria-expanded={sheet === key && !sheetClosing}
                onClick={() => toggleSheet(key)}
              >
                <Icon name={icon} size={20} />
                <span>{w.nav[key]}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {!heroParticles && <Particles kind={particles} palette={p} look={`${theme.id}-${p.id}`} running={revealed} />}

      {sheet === 'calendar' && (
        <Sheet title={w.nav.calendar} onClose={closeSheet} closing={sheetClosing}>
          {events.map((e) => (
            <div key={e.id} className="iv-sheet-row">
              <p className="iv-sheet-strong">{w.events[e.id]}</p>
              {e.date && <p>{inviteDate(e.date, lang)}</p>}
              <p className="iv-sheet-muted">{timeRange(e, lang)}</p>
              {icsHref(e, invite, w) && (
                <a className="iv-btn iv-btn-solid" href={icsHref(e, invite, w)} download={`${e.id}-${e.date}.ics`}>
                  <Icon name="download" size={16} /> {w.saveDate}
                </a>
              )}
            </div>
          ))}
        </Sheet>
      )}
      {sheet === 'contacts' && (
        <Sheet title={w.nav.contacts} onClose={closeSheet} closing={sheetClosing}>
          {contacts.length ? (
            contacts.map((c, i) => {
              const wa = whatsappHref(c.phone)
              return (
                <div key={i} className="iv-sheet-row">
                  <p className="iv-sheet-strong">{c.name || c.phone}</p>
                  {c.phone && (
                    <div className="iv-buttons">
                      {wa && (
                        <a className="iv-btn" href={wa} target="_blank" rel="noopener noreferrer">
                          <Icon name="phone" size={16} /> WhatsApp
                        </a>
                      )}
                      <a className="iv-btn" href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}>
                        <Icon name="phone" size={16} /> {w.call}
                      </a>
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <p className="iv-sheet-muted">{w.noContacts}</p>
          )}
        </Sheet>
      )}
      {sheet === 'location' && (
        <Sheet title={w.nav.location} onClose={closeSheet} closing={sheetClosing}>
          {events.map((e) => (
            <div key={e.id} className="iv-sheet-row">
              <p className="iv-sheet-strong">{w.events[e.id]}</p>
              <p>{e.venue}</p>
              <p className="iv-sheet-muted">{e.address}</p>
              <MapButtons e={e} />
            </div>
          ))}
        </Sheet>
      )}
      {sheet === 'rsvp' && (
        <Sheet title={w.rsvpTitle} onClose={closeSheet} closing={sheetClosing}>
          <RsvpForm invite={invite} events={events} w={w} onReply={onReply} />
        </Sheet>
      )}

      {sheet === 'gift' && (
        <Sheet title={w.nav.gift} onClose={closeSheet} closing={sheetClosing}>
          {showGift && <Gift gift={invite.gift} w={w} />}
          {showRegistry && (
            <Registry
              items={wishlist}
              w={w}
              onReserve={onReserve}
              mine={reservedByMe}
              onMine={(id) => setReservedByMe((m) => [...m, id])}
            />
          )}
        </Sheet>
      )}

      {video && (
        <div
          className={`iv-music-layer${sheet === 'music' && !sheetClosing ? ' is-open' : ''}`}
          onClick={() => setSheetClosing(true)}
          aria-hidden={sheet !== 'music'}
        >
          <section
            className="iv-sheet iv-music-sheet"
            role="dialog"
            aria-label={w.nav.music}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="iv-sheet-handle" aria-hidden="true" />
            <div className="iv-sheet-head">
              <h2>{w.nav.music}</h2>
              <button type="button" className="iv-sheet-close" onClick={() => setSheetClosing(true)} aria-label="Close">
                <Icon name="close" size={18} />
              </button>
            </div>
            <div className="iv-music-player" ref={playerHost} />
            {music.error && (
              <p className="iv-sheet-muted iv-music-note">{w.musicProblem[youTubeProblem(music.error)]}</p>
            )}
          </section>
        </div>
      )}

      {video && revealed && (
        <button
          type="button"
          className={`iv-music-btn${music.playing ? ' is-playing' : ''}`}
          // If YouTube can't play the song, show the player with the reason instead.
          onClick={music.error ? () => toggleSheet('music') : music.toggle}
          aria-label={music.playing ? w.pause : w.play}
          aria-pressed={music.playing}
        >
          <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">
            <g className="iv-disc">
              <circle cx="20" cy="20" r="17" fill="currentColor" opacity="0.92" />
              <circle cx="20" cy="20" r="12" fill="none" stroke="var(--iv-on-accent)" strokeOpacity="0.25" />
              <circle cx="20" cy="20" r="8" fill="none" stroke="var(--iv-on-accent)" strokeOpacity="0.25" />
              <circle cx="20" cy="20" r="3.4" fill="var(--iv-on-accent)" />
            </g>
            {!music.playing && <path d="M17 14l9 6-9 6z" fill="var(--iv-on-accent)" />}
          </svg>
        </button>
      )}

      {!opened && (
        <Opening
          onTap={video ? music.play : undefined}
          theme={theme}
          animation={animation}
          initials={initialsOf(invite)}
          label={w.seal}
          cover={
            envelope && (
              <div className={heroClass} style={heroStyle}>
                <HeroArt theme={theme} />
                {heroText('p')}
              </div>
            )
          }
          onRevealing={() => setRevealed(true)}
          onDone={() => setOpened(true)}
        />
      )}
    </div>
  )
}
