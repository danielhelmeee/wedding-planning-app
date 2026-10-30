// The three wedding events. A vendor can serve one, two or all three.
export const EVENTS = [
  { id: 'akad', label: 'Akad Nikah' },
  { id: 'sanding', label: 'Sanding' },
  { id: 'reception', label: 'Reception' },
]

export const EVENT_BY_ID = Object.fromEntries(EVENTS.map((e) => [e.id, e]))

export const EVENT_IDS = EVENTS.map((e) => e.id)
