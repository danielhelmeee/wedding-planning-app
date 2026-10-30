import { useState } from 'react'
import BrandMark from './BrandMark.jsx'
import { hrefFor } from '../useHashRoute.js'

function NavLink({ href, active, children, onClick, status, className }) {
  return (
    <li className={className}>
      <a
        href={href}
        className={`nav-link${active ? ' is-active' : ''}`}
        aria-current={active ? 'page' : undefined}
        onClick={onClick}
      >
        <span className="nav-label">{children}</span>
        {status && (
          <span className={`nav-status is-${status}`} aria-hidden="true">
            {status === 'booked' ? '✓' : ''}
          </span>
        )}
        {status && <span className="visually-hidden"> ({STATUS_TEXT[status]})</span>}
      </a>
    </li>
  )
}

export function Brand() {
  return (
    <a href="#/home" className="brand">
      <BrandMark size={34} />
      <span className="brand-name">Restu</span>
    </a>
  )
}

const STATUS_TEXT = { booked: 'all booked', started: 'started' }

// Grouped menu: Plan, Guests & Invite, then the vendor categories (in booking order, collapsible),
// with Settings pinned at the bottom.
export default function Sidebar({
  route,
  categories,
  status = {},
  hiddenCount,
  sample = true,
  countdown,
  vendorsOpen,
  onToggleVendors,
  open,
  onClose,
}) {
  const is = (page) => route.page === page
  // Collapsed, the Vendors section still shows the category you are on.
  // Folded, the Vendors section still shows the category you are on.
  const current = categories.find((c) => is('category') && route.category === c.id)
  // Categories switched on since the last render grow into the menu (see .is-new).
  const idsKey = categories.map((c) => c.id).join(',')
  const [seen, setSeen] = useState({ key: idsKey, added: [] })
  if (seen.key !== idsKey) {
    const before = new Set(seen.key.split(','))
    setSeen({ key: idsKey, added: categories.filter((c) => !before.has(c.id)).map((c) => c.id) })
  }
  const vendorLink = (c) => (
    <NavLink
      key={c.id}
      href={hrefFor({ page: 'category', category: c.id })}
      active={is('category') && route.category === c.id}
      onClick={onClose}
      status={status[c.id]}
      className={seen.added.includes(c.id) ? 'is-new' : undefined}
    >
      {c.menu ?? c.label}
    </NavLink>
  )
  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} aria-hidden="true" />}
      <nav id="sidebar" className={`sidebar${open ? ' is-open' : ''}`} aria-label="Main">
        <div className="sidebar-top">
          <Brand />
          {countdown && <p className="brand-countdown">{countdown}</p>}
          {sample && <p className="brand-sample">Includes sample data</p>}
        </div>

        <div className="sidebar-scroll" data-slide-pill>
          <p className="nav-heading">Plan</p>
          <ul className="nav-list">
            <NavLink href="#/home" active={is('home')} onClick={onClose}>
              Home
            </NavLink>
            <NavLink href="#/procedure" active={is('procedure')} onClick={onClose}>
              Marriage Procedure
            </NavLink>
            <NavLink href="#/budget" active={is('budget')} onClick={onClose}>
              Budget
            </NavLink>
            <NavLink href="#/checklist" active={is('checklist')} onClick={onClose}>
              Checklist
            </NavLink>
            <NavLink href="#/calendar" active={is('calendar')} onClick={onClose}>
              Calendar
            </NavLink>
            <NavLink href="#/day" active={is('day')} onClick={onClose}>
              Hari Majlis
            </NavLink>
          </ul>

          <p className="nav-heading">Guests & Invite</p>
          <ul className="nav-list">
            <NavLink href="#/guests" active={is('guests')} onClick={onClose}>
              Guests
            </NavLink>
            <NavLink href="#/seating" active={is('seating')} onClick={onClose}>
              Seating
            </NavLink>
            <NavLink href="#/invite" active={is('invite')} onClick={onClose}>
              E-invite
            </NavLink>
            <NavLink href="#/gifts" active={is('gifts')} onClick={onClose}>
              Gifts & Angpow
            </NavLink>
          </ul>

          <button
            type="button"
            className="nav-heading nav-toggle"
            aria-expanded={vendorsOpen}
            aria-controls="nav-vendors"
            onClick={onToggleVendors}
          >
            Vendors
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </button>
          {/* The list eases open and closed (height and opacity) rather than snapping. */}
          <div className={`nav-collapse${vendorsOpen ? ' is-open' : ''}`} inert={!vendorsOpen}>
            <div className="nav-collapse-inner">
              <ul className="nav-list" id="nav-vendors">
                {categories.map(vendorLink)}
              </ul>
            </div>
          </div>
          {!vendorsOpen && current && <ul className="nav-list">{vendorLink(current)}</ul>}
          {vendorsOpen && hiddenCount > 0 && (
            <a className="nav-hidden" href="#/settings" onClick={onClose}>
              {hiddenCount} hidden · Show in Settings
            </a>
          )}
        </div>

        <ul className="nav-list nav-bottom">
          <NavLink href="#/settings" active={is('settings')} onClick={onClose}>
            Settings
          </NavLink>
        </ul>
      </nav>
    </>
  )
}
