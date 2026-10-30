// Vendor categories for a Malay wedding. `short` is used where space is tight (checklist tabs).
// `events` = the events a category usually serves (used to upgrade older saves without events).
// Colours come from the five-colour palette in design.md, handed out in order to the categories
// that have vendors (see figures.js).
export const PALETTE = ['var(--cat-1)', 'var(--cat-2)', 'var(--cat-3)', 'var(--cat-4)', 'var(--cat-5)']

const ALL = ['akad', 'sanding', 'reception']
const KENDURI = ['sanding', 'reception']

// In booking order (the order the checklist suggests booking them), so the menu reads as "what to book next".
// `menu` is a shorter name for the sidebar where the full one would wrap.
export const CATEGORIES = [
  { id: 'venue', short: 'Venue', label: 'Venue & Khemah', events: ALL },
  { id: 'planner', short: 'Planner', label: 'Wedding Planner', events: ALL },
  { id: 'catering', short: 'Catering', label: 'Catering & Desserts', events: ALL },
  { id: 'photo', short: 'Photo & Video', menu: 'Photo & Video', label: 'Photography & Videography', events: ALL },
  { id: 'decor', short: 'Pelamin', label: 'Pelamin & Decor', events: KENDURI },
  { id: 'mua', short: 'MUA', label: 'MUA & Hair Stylist', events: ALL },
  { id: 'attire', short: 'Attire', menu: 'Attire', label: 'Attire (Baju Nikah, Songket, Gown, Suit)', events: ALL },
  { id: 'emcee', short: 'Emcee', label: 'Emcee & PA System', events: KENDURI },
  { id: 'entertainment', short: 'Entertainment', menu: 'Entertainment', label: 'Entertainment (Band, DJ, Kompang, Silat)', events: KENDURI },
  { id: 'cards', short: 'Kad Kahwin', label: 'Kad Kahwin / Printed Cards', events: KENDURI },
  { id: 'hantaran', short: 'Hantaran', label: 'Hantaran & Gubahan', events: ['akad'] },
  { id: 'doorgifts', short: 'Door Gifts', label: 'Door Gifts', events: KENDURI },
  { id: 'florist', short: 'Florist', label: 'Florist & Bouquets', events: ALL },
  { id: 'inai', short: 'Inai', label: 'Inai / Henna Artist', events: ['akad'] },
  { id: 'bridal-party', short: 'Pengapit', label: 'Pengapit & Bridal Party', events: KENDURI },
  { id: 'transport', short: 'Car', label: 'Wedding Car & Transport', events: KENDURI },
]

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]))
