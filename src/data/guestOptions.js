// Options for the guest list, and made-up sample guests (never real people).
export const SIDES = [
  { id: 'bride', label: "Bride's side" },
  { id: 'groom', label: "Groom's side" },
  { id: 'both', label: 'Both families' },
]

export const GROUPS = ['Family', 'Relatives', 'Friends', 'Colleagues', 'Neighbours', 'VIP', 'Other']

export const RSVP = [
  { id: 'pending', label: 'Awaiting reply' },
  { id: 'attending', label: 'Attending' },
  { id: 'declined', label: 'Declined' },
]

export const RSVP_BY_ID = Object.fromEntries(RSVP.map((r) => [r.id, r]))
export const SIDE_BY_ID = Object.fromEntries(SIDES.map((s) => [s.id, s]))

export const DIETARY_SUGGESTIONS = ['Vegetarian', 'Vegan', 'No seafood', 'Nut allergy', 'No beef', 'Gluten free', 'Diabetic']

export const EMPTY_GUEST = {
  name: '',
  side: 'bride',
  group: 'Family',
  phone: '',
  events: [],
  // Events they said they're coming to when replying (empty = all the events they're invited to).
  attendingEvents: [],
  status: 'pending',
  plusOnes: 0,
  dietary: '',
  notes: '',
  // When they replied through the invitation (ISO date-time), or ''.
  repliedAt: '',
}

const sample = (id, name, side, group, status, plusOnes, events, dietary = '', phone = '') => ({
  ...EMPTY_GUEST,
  id,
  name,
  side,
  group,
  status,
  plusOnes,
  events,
  dietary,
  phone,
})

export const SAMPLE_GUESTS = [
  sample('g_sample_1', 'Sample Mak Long Family', 'bride', 'Family', 'attending', 3, ['akad', 'sanding', 'reception']),
  sample('g_sample_2', 'Sample Pak Su', 'bride', 'Relatives', 'attending', 1, ['sanding']),
  sample('g_sample_3', 'Sample Aisyah (uni friend)', 'bride', 'Friends', 'pending', 1, ['sanding'], 'Vegetarian', '012-000 0003'),
  sample('g_sample_4', 'Sample Encik Hakim', 'groom', 'Colleagues', 'declined', 0, ['reception']),
  sample('g_sample_5', 'Sample Opah & Atok', 'groom', 'Family', 'attending', 1, ['akad', 'reception'], 'Diabetic'),
  sample('g_sample_6', 'Sample Danial', 'groom', 'Friends', 'pending', 0, ['reception'], '', '019-000 0006'),
]
