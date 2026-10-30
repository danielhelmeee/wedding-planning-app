// Guest figures. Counts only: invited, replies, and headcounts (a guest plus their +1s).
import { enabledEvents } from './figures.js'

export const headcount = (g) => 1 + (g.plusOnes || 0)

// Attending this event: replied yes, invited to it, and (if they picked events when replying) picked it.
export const goingTo = (g, eventId) =>
  g.status === 'attending' &&
  g.events.includes(eventId) &&
  (!g.attendingEvents?.length || g.attendingEvents.includes(eventId))

// Guests invited to at least one event that is on (or to no event yet).
export function visibleGuests(guests, settings) {
  const on = new Set(enabledEvents(settings).map((e) => e.id))
  return guests.filter((g) => g.events.length === 0 || g.events.some((e) => on.has(e)))
}

export function guestSummary(guests) {
  const by = (status) => guests.filter((g) => g.status === status)
  const attending = by('attending')
  return {
    invited: guests.length,
    invitedPeople: guests.reduce((n, g) => n + headcount(g), 0),
    attending: attending.length,
    attendingPeople: attending.reduce((n, g) => n + headcount(g), 0),
    declined: by('declined').length,
    pending: by('pending').length,
    dietary: attending.filter((g) => g.dietary).length,
  }
}

// Attending headcount per event that is on (a guest counts in each event they are invited to).
export function eventHeadcounts(guests, settings) {
  return enabledEvents(settings).map((e) => {
    const invited = guests.filter((g) => g.events.includes(e.id))
    const attending = invited.filter((g) => goingTo(g, e.id))
    return {
      ...e,
      invited: invited.length,
      attendingPeople: attending.reduce((n, g) => n + headcount(g), 0),
      pending: invited.filter((g) => g.status === 'pending').length,
    }
  })
}
