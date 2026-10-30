// Suggested tasks, timed back from an event date. These are planning suggestions, not official deadlines.
// `event`: 'akad' | 'sanding' | 'reception' | 'first' (the earliest dated event that is on).
// `days`: how many days before that event the task is due (negative = after).
// `category`: hides the task when that category is switched off.
// `auto`: the task ticks itself when the app's data shows it is done (see checklist.js).
//   'procedure-*' recorded on the Marriage Procedure page
//   'booked' a vendor in the category is booked · 'budget' set · 'dates' set · 'guests' list started · 'seating' everyone attending is seated · 'invite' names and a venue filled in

const booking = (category, label, days) => ({
  id: `book-${category}`,
  title: `Book ${label}`,
  event: 'first',
  days,
  category,
  auto: 'booked',
  group: 'Vendors',
})

export const CHECKLIST_TEMPLATE = [
  // Getting started
  { id: 'set-dates', title: 'Set the dates for your events', event: 'first', days: 365, auto: 'dates', group: 'Getting started' },
  { id: 'set-budget', title: 'Set your total budget', event: 'first', days: 365, auto: 'budget', group: 'Getting started' },
  { id: 'guest-draft', title: 'Draft the guest list with both families', event: 'first', days: 240, auto: 'guests', group: 'Getting started' },

  // Marriage procedure (from the official steps; timing is a suggestion)
  {
    id: 'proc-course',
    auto: 'procedure-course',
    title: 'Attend the pre-marriage course (both of you)',
    note: 'Compulsory for the bride and groom. See Marriage Procedure.',
    event: 'akad',
    days: 180,
    group: 'Marriage procedure',
  },
  {
    id: 'proc-docs',
    auto: 'procedure-docs',
    title: 'Gather the documents for your marriage application',
    note: 'Each state has its own procedure and forms. Check the SPPIM document checklist.',
    event: 'akad',
    days: 110,
    group: 'Marriage procedure',
  },
  {
    id: 'proc-apply',
    auto: 'procedure-apply',
    title: 'Submit the marriage application',
    note: 'The permission letter is valid for 90 days from the date it is issued, so time it so your Akad Nikah falls within that window.',
    event: 'akad',
    days: 75,
    group: 'Marriage procedure',
  },
  {
    id: 'proc-registrar',
    title: 'Confirm the marriage registrar for the Akad Nikah',
    note: 'The akad is conducted by an authorised marriage registrar, based on your marriage permission.',
    event: 'akad',
    days: 30,
    group: 'Marriage procedure',
  },
  {
    id: 'proc-certificate',
    auto: 'procedure-certificate',
    title: 'Collect your marriage certificate',
    note: 'From the registrar or the religious office, after the akad.',
    event: 'akad',
    days: -7,
    group: 'Marriage procedure',
  },

  // Vendor bookings (tick themselves once a vendor in the category reaches Deposit Paid)
  booking('venue', 'the venue or khemah', 365),
  booking('planner', 'a wedding planner', 330),
  booking('catering', 'the caterer', 300),
  booking('photo', 'photography and videography', 300),
  booking('decor', 'the pelamin and decor', 270),
  booking('mua', 'the MUA and hair stylist', 240),
  booking('attire', 'the attire (baju nikah, songket, gown, suit)', 210),
  booking('emcee', 'the emcee and PA system', 180),
  booking('entertainment', 'entertainment', 180),
  booking('cards', 'the kad kahwin printer', 150),
  booking('hantaran', 'the hantaran and gubahan', 120),
  booking('doorgifts', 'door gifts', 120),
  booking('florist', 'the florist', 90),
  booking('inai', 'the inai / henna artist', 90),
  booking('bridal-party', 'pengapit outfits', 90),
  booking('transport', 'the wedding car', 60),

  // Closer to the day
  { id: 'e-invite', title: 'Prepare the e-invite', event: 'first', days: 90, auto: 'invite', group: 'Closer to the day' },
  { id: 'cards-send', title: 'Send out the invitations', event: 'sanding', days: 60, category: 'cards', group: 'Closer to the day' },
  { id: 'attire-fitting', title: 'Final attire fitting', event: 'first', days: 30, category: 'attire', group: 'Closer to the day' },
  { id: 'catering-numbers', title: 'Confirm final guest numbers with the caterer', event: 'sanding', days: 14, category: 'catering', group: 'Closer to the day' },
  { id: 'hantaran-ready', title: 'Prepare the hantaran trays', event: 'akad', days: 7, category: 'hantaran', group: 'Closer to the day' },
  { id: 'inai-night', title: 'Berinai night', event: 'akad', days: 1, category: 'inai', group: 'Closer to the day' },
  { id: 'seating', title: 'Finish the seating plan', event: 'first', days: 14, auto: 'seating', group: 'Closer to the day' },
  { id: 'final-payments', title: 'Settle final vendor balances', event: 'first', days: 7, group: 'Closer to the day' },
  { id: 'rundown', title: 'Share the day-of rundown with family and vendors', event: 'first', days: 7, group: 'Closer to the day' },
]
