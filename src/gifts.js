// Gift figures: totals and counts only. Plus reserving a wish-list item from the invitation.
import { phoneMatches } from './rsvp.js'

export function giftSummary(log) {
  const cash = log.filter((g) => g.method !== 'present')
  const sum = (list) => list.reduce((n, g) => n + (g.amount || 0), 0)
  return {
    count: log.length,
    total: sum(cash),
    byMethod: {
      cash: sum(cash.filter((g) => g.method === 'cash')),
      online: sum(cash.filter((g) => g.method === 'transfer' || g.method === 'qr')),
    },
    presents: log.filter((g) => g.method === 'present').length,
    toThank: log.filter((g) => !g.thanked).length,
  }
}

export const itemState = (item) => (item.received ? 'received' : item.reservedBy ? 'reserved' : 'open')

// Money given per guest (for the Guests page).
export function giftsByGuest(log) {
  const out = {}
  for (const g of log) if (g.guestId) out[g.guestId] = (out[g.guestId] || 0) + (g.method === 'present' ? 0 : g.amount || 0)
  return out
}

// A guest reserving an item on the invitation. Matched to the guest list by phone number when possible.
export function reserveItem(wishlist, guests, itemId, { name, phone }) {
  const matches = phoneMatches(guests, phone)
  return wishlist.map((it) =>
    it.id === itemId && !it.reservedBy
      ? {
          ...it,
          reservedBy: name,
          reservedPhone: phone,
          guestId: matches.length === 1 ? matches[0].id : null,
          reservedAt: new Date().toISOString(),
        }
      : it,
  )
}

const csvCell = (v) => {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function giftsCSV(log, methodLabel, eventLabel) {
  const rows = [['Date', 'From', 'How', 'Event', 'Amount (RM)', 'Note', 'Thank-you sent']]
  for (const g of log) {
    rows.push([g.date, g.from, methodLabel(g.method), g.event ? eventLabel(g.event) : '', g.method === 'present' ? '' : g.amount, g.note, g.thanked ? 'Yes' : 'No'])
  }
  return rows.map((r) => r.map(csvCell).join(',')).join('\r\n')
}
