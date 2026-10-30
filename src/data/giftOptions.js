// Options for the gift log and wish list, and made-up sample entries (no real people or amounts).
export const METHODS = [
  { id: 'cash', label: 'Cash (envelope)' },
  { id: 'transfer', label: 'Bank transfer' },
  { id: 'qr', label: 'DuitNow QR' },
  { id: 'present', label: 'A present (not cash)' },
]
export const METHOD_BY_ID = Object.fromEntries(METHODS.map((m) => [m.id, m]))

export const EMPTY_GIFT = {
  from: '',
  guestId: null,
  amount: 0,
  method: 'cash',
  event: '',
  date: '',
  note: '',
  thanked: false,
}

export const EMPTY_ITEM = {
  name: '',
  price: 0,
  link: '',
  note: '',
  // Reserved: by whom (a guest on the invitation, or marked by the couple).
  reservedBy: '',
  reservedPhone: '',
  guestId: null,
  reservedAt: '',
  received: false,
}

export const SAMPLE_GIFTS = {
  log: [
    { ...EMPTY_GIFT, id: 'gift_sample_1', from: 'Sample Mak Long Family', guestId: 'g_sample_1', amount: 200, method: 'transfer', event: 'sanding', date: '2026-10-20', thanked: true },
    { ...EMPTY_GIFT, id: 'gift_sample_2', from: 'Sample Pak Su', guestId: 'g_sample_2', amount: 100, method: 'qr', event: 'sanding', date: '2026-10-25' },
    { ...EMPTY_GIFT, id: 'gift_sample_3', from: 'Sample Kak Ina', amount: 0, method: 'present', date: '2026-10-27', note: 'Set of towels' },
  ],
  wishlist: [
    { ...EMPTY_ITEM, id: 'wish_sample_1', name: 'Rice cooker', price: 250, reservedBy: 'Sample Pak Su', guestId: 'g_sample_2', reservedAt: '2026-10-25T10:00:00.000Z' },
    { ...EMPTY_ITEM, id: 'wish_sample_2', name: 'Dinnerware set for 6', price: 180 },
    { ...EMPTY_ITEM, id: 'wish_sample_3', name: 'Bedsheet and comforter set (king)', price: 220 },
    { ...EMPTY_ITEM, id: 'wish_sample_4', name: 'Water filter', price: 400, reservedBy: 'Sample Opah & Atok', guestId: 'g_sample_5', received: true },
  ],
}
