// Replies from the invitation's RSVP form, matched to the guest list by phone number.
// A reply: { id, at, name, phone, coming, people, events[], note, guestId, state }
// state: 'linked' (matched and applied automatically), 'review' (no single match yet),
// 'added' (added as a new guest), 'manual' (linked by the couple), 'dismissed'.
// Today replies arrive from this browser only; once the app is online they come from a database,
// and the matching below stays the same.

// "012-345 6789", "+60 12-345 6789" and "60123456789" → "60123456789". Too short → ''.
export function phoneKey(phone) {
  let digits = (phone || '').replace(/\D/g, '')
  if (digits.startsWith('0')) digits = `6${digits}`
  return digits.length >= 10 ? digits : ''
}

// The guests whose phone number matches the reply's.
export function phoneMatches(guests, phone) {
  const key = phoneKey(phone)
  return key ? guests.filter((g) => phoneKey(g.phone) === key) : []
}

// A guest with the same name (ignoring case and spacing), suggested when the phone does not match.
export function nameMatch(guests, name) {
  const clean = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim()
  const n = clean(name)
  return guests.find((g) => clean(g.name) === n) ?? null
}

// What a reply changes on a guest.
export function replyChanges(guest, reply) {
  const changes = {
    status: reply.coming ? 'attending' : 'declined',
    attendingEvents: reply.coming ? reply.events : [],
    repliedAt: reply.at,
  }
  if (reply.coming) {
    changes.plusOnes = Math.max(0, reply.people - 1)
    // Events they said they're coming to are added to the ones they're invited to.
    changes.events = [...new Set([...guest.events, ...reply.events])]
  }
  if (!guest.phone) changes.phone = reply.phone
  if (reply.note) changes.notes = [guest.notes, `RSVP: ${reply.note}`].filter(Boolean).join('\n')
  return changes
}

// A new guest made from a reply that matched nobody.
export function guestFromReply(reply, { side, group }) {
  return {
    name: reply.name,
    side,
    group,
    phone: reply.phone,
    events: reply.events,
    attendingEvents: reply.coming ? reply.events : [],
    status: reply.coming ? 'attending' : 'declined',
    plusOnes: reply.coming ? Math.max(0, reply.people - 1) : 0,
    dietary: '',
    notes: reply.note ? `RSVP: ${reply.note}` : '',
    repliedAt: reply.at,
  }
}

// Matches a new reply: exactly one guest with that phone number → applied automatically; otherwise it waits
// for the couple (no match, or several guests share the number).
export function receiveReply(guests, reply) {
  const matches = phoneMatches(guests, reply.phone)
  if (matches.length === 1) {
    const guest = matches[0]
    return {
      guests: guests.map((g) => (g.id === guest.id ? { ...g, ...replyChanges(g, reply) } : g)),
      reply: { ...reply, guestId: guest.id, state: 'linked' },
    }
  }
  return { guests, reply: { ...reply, guestId: null, state: 'review' } }
}
