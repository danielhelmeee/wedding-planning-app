// Phones only: the most-used pages one tap away, plus "More" for the full menu.
const TABS = [
  { page: 'home', href: '#/home', label: 'Home', icon: 'M4 11.5 12 5l8 6.5V20h-5.5v-5h-5v5H4z' },
  { page: 'checklist', href: '#/checklist', label: 'Checklist', icon: 'M5 6.5l1.5 1.5L9 5.5M5 12.5l1.5 1.5L9 11.5M5 18.5l1.5 1.5L9 17.5M12 7h7M12 13h7M12 19h7' },
  { page: 'guests', href: '#/guests', label: 'Guests', icon: 'M9 11a3.5 3.5 0 1 0 0-7a3.5 3.5 0 0 0 0 7zM3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 5.2a3.2 3.2 0 0 1 0 6.1M17.5 14.8c2 .6 3.5 2.4 3.5 5.2' },
  { page: 'invite', href: '#/invite', label: 'E-invite', icon: 'M3.5 6.5h17v12h-17zM3.5 7l8.5 6.5L20.5 7' },
]

export default function PhoneTabs({ page, menuOpen, onMore }) {
  return (
    <nav className="phone-tabs" aria-label="Quick menu">
      {TABS.map((t) => {
        const active = page === t.page && !menuOpen
        return (
          <a key={t.page} href={t.href} className={`phone-tab${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path d={t.icon} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t.label}
          </a>
        )
      })}
      <button type="button" className={`phone-tab${menuOpen ? ' is-active' : ''}`} aria-expanded={menuOpen} aria-controls="sidebar" onClick={onMore}>
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h.01M12 12h.01M19 12h.01" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        More
      </button>
    </nav>
  )
}
