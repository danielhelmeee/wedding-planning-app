// Booking stages in order. `tone` picks the stage mark colour from design.md.
export const STAGES = [
  { id: 'prospecting', label: 'Prospecting', step: 1, tone: 'terracotta' },
  { id: 'quoted', label: 'Quoted', step: 2, tone: 'terracotta' },
  { id: 'shortlisted', label: 'Shortlisted', step: 3, tone: 'terracotta' },
  { id: 'deposit', label: 'Deposit Paid', step: 4, tone: 'ochre' },
  { id: 'final', label: 'Final Balance Paid', step: 5, tone: 'emerald' },
  { id: 'completed', label: 'Completed', step: 6, tone: 'emerald' },
]

export const STAGE_BY_ID = Object.fromEntries(STAGES.map((s) => [s.id, s]))

export const TOTAL_STEPS = STAGES.length

// A vendor at Deposit Paid or later counts as booked (and committed).
export const BOOKED_STAGES = ['deposit', 'final', 'completed']
