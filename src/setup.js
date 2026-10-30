// Removing the made-up sample data after the setup. Only samples go: anything the couple added stays.
import { SAMPLE_INVITE } from './invite.js'

const isSample = (id) => typeof id === 'string' && /_sample_/.test(id)
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
// A field still holding the sample value is cleared; one the couple changed is kept.
const unlessSample = (value, sample, blank) => (same(value, sample) ? blank : value)

export function withoutSamples({ vendors, guests, gifts, replies, invite }) {
  const blankEvent = { show: true, start: '', end: '', venue: '', address: '', programme: [] }
  const events = Object.fromEntries(
    Object.entries(invite.events).map(([id, e]) => {
      const s = SAMPLE_INVITE.events[id] ?? {}
      return [
        id,
        {
          ...e,
          start: unlessSample(e.start, s.start, ''),
          end: unlessSample(e.end, s.end, ''),
          venue: unlessSample(e.venue, s.venue, ''),
          address: unlessSample(e.address, s.address, ''),
          programme: unlessSample(e.programme, s.programme, blankEvent.programme),
        },
      ]
    }),
  )
  const g = SAMPLE_INVITE.gift
  return {
    vendors: vendors.filter((v) => !isSample(v.id)),
    guests: guests.filter((x) => !isSample(x.id)),
    gifts: { log: gifts.log.filter((x) => !isSample(x.id)), wishlist: gifts.wishlist.filter((x) => !isSample(x.id)) },
    replies: replies.filter((r) => !isSample(r.guestId)),
    invite: {
      ...invite,
      bride: unlessSample(invite.bride, SAMPLE_INVITE.bride, ''),
      groom: unlessSample(invite.groom, SAMPLE_INVITE.groom, ''),
      hosts: unlessSample(invite.hosts, SAMPLE_INVITE.hosts, ''),
      dressCode: unlessSample(invite.dressCode, SAMPLE_INVITE.dressCode, ''),
      rsvpBy: unlessSample(invite.rsvpBy, SAMPLE_INVITE.rsvpBy, ''),
      contacts: unlessSample(invite.contacts, SAMPLE_INVITE.contacts, [{ name: '', phone: '' }]),
      events,
      wishes: { ...invite.wishes, list: unlessSample(invite.wishes.list, SAMPLE_INVITE.wishes.list, []) },
      gift: {
        ...invite.gift,
        bank: unlessSample(invite.gift.bank, g.bank, ''),
        holder: unlessSample(invite.gift.holder, g.holder, ''),
        account: unlessSample(invite.gift.account, g.account, ''),
      },
    },
  }
}

// How many sample items are still in the planner (shown in the last setup step).
export function sampleCounts({ vendors, guests, gifts }) {
  return {
    vendors: vendors.filter((v) => isSample(v.id)).length,
    guests: guests.filter((x) => isSample(x.id)).length,
    gifts: gifts.log.filter((x) => isSample(x.id)).length + gifts.wishlist.filter((x) => isSample(x.id)).length,
  }
}
