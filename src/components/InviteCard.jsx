import { inviteDate, inviteEvents, mapLinks, timeRange, wordsFor } from '../invite.js'
import { themeFor, themeVars } from '../inviteThemes.js'
import { whatsappHref } from '../contact.js'

function Ornament() {
  return (
    <svg className="invite-ornament" width="120" height="16" viewBox="0 0 120 16" aria-hidden="true">
      <path d="M0 8h48M72 8h48" stroke="currentColor" strokeWidth="1" />
      <path d="M60 2l6 6-6 6-6-6z" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="60" cy="8" r="1.6" fill="currentColor" />
    </svg>
  )
}

// The invitation content. `variant`: 'card' (a framed card, used for print) or 'panel' (inside InviteView,
// on the theme background).
export default function InviteCard({ invite, settings, variant = 'card' }) {
  const w = wordsFor(invite)
  const theme = themeFor(invite.theme, invite.palette)
  const lang = invite.language
  const events = inviteEvents(invite, settings)
  const contacts = invite.contacts.filter((c) => c.name || c.phone)

  return (
    <article
      className={`invite-card is-${variant}`}
      lang={lang === 'en' ? 'en' : 'ms'}
      style={variant === 'card' ? themeVars(theme) : undefined}
    >
      {invite.showBismillah && (
        <p className="invite-bismillah" lang="ar" dir="rtl">
          بسم الله الرحمن الرحيم
        </p>
      )}
      <p className="invite-title">{w.title}</p>
      <Ornament />

      {invite.hosts && <p className="invite-hosts">{invite.hosts}</p>}
      <p className="invite-opening">{w.opening}</p>

      <div className="invite-couple">
        <p className="invite-name">{invite.bride || '…'}</p>
        <p className="invite-amp">{w.and}</p>
        <p className="invite-name">{invite.groom || '…'}</p>
      </div>

      <Ornament />

      {events.map((e) => {
        const maps = mapLinks(e)
        return (
          <section key={e.id} className="invite-event">
            <h3 className="invite-event-name">{w.events[e.id]}</h3>
            {e.date && <p className="invite-event-date">{inviteDate(e.date, lang)}</p>}
            {timeRange(e, lang) && <p>{timeRange(e, lang)}</p>}
            {e.venue && <p className="invite-venue">{e.venue}</p>}
            {e.address && <p className="invite-address">{e.address}</p>}
            {maps && (
              <p className="invite-maps">
                <a href={maps.google} target="_blank" rel="noopener noreferrer">
                  Google Maps<span className="visually-hidden"> (opens in a new tab)</span>
                </a>
                <span aria-hidden="true"> · </span>
                <a href={maps.waze} target="_blank" rel="noopener noreferrer">
                  Waze<span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </p>
            )}
          </section>
        )
      })}

      {invite.dressCode && (
        <p className="invite-dress">
          <span>{w.dress}</span>
          {invite.dressCode}
        </p>
      )}

      {(contacts.length > 0 || invite.rsvpBy) && (
        <div className="invite-rsvp">
          <p className="invite-rsvp-title">
            {w.rsvp}
            {invite.rsvpBy && ` ${w.rsvpBy} ${inviteDate(invite.rsvpBy, lang)}`}
          </p>
          {contacts.map((c, i) => {
            const wa = whatsappHref(c.phone)
            return (
              <p key={i}>
                {c.name}
                {c.phone &&
                  (wa ? (
                    <>
                      {c.name && ' · '}
                      <a href={wa} target="_blank" rel="noopener noreferrer">
                        {c.phone}
                        <span className="visually-hidden"> on WhatsApp (opens in a new tab)</span>
                      </a>
                    </>
                  ) : (
                    ` · ${c.phone}`
                  ))}
              </p>
            )
          })}
        </div>
      )}

      <p className="invite-closing">{w.closing}</p>
    </article>
  )
}
