// What Home shows: things that need the couple now, first steps for a new planner, and e-invite readiness.
// Counts and figures only.
import { formatRM, isOverdue, upcomingPayments } from './figures.js'
import { inviteEvents } from './invite.js'
import { todayISO, addDays } from './dates.js'
import { letterWindow } from './procedure.js'

const isSample = (id) => typeof id === 'string' && /_sample_/.test(id)
const real = (text) => Boolean(text && text.trim() && !/^sample\s/i.test(text.trim()))

// Cards for "Needs your attention", most pressing first. Each: { id, count, title, note, href, tone }.
export function attentionItems({ tasks, visibleVendors, guests, replies, gifts, invite, unseated, procedure, settings }) {
  const today = todayISO()
  const items = []

  // The marriage permission letter does not cover the Akad Nikah date.
  const akadDate = settings?.events.akad?.on ? settings.events.akad.date : ''
  const letter = procedure && letterWindow(procedure, akadDate)
  if (letter?.tone === 'warn')
    items.push({ id: 'letter', count: '!', title: letter.title, note: 'Marriage permission letter', href: '#/procedure', tone: 'terracotta' })

  const overdueTasks = tasks.filter((t) => !t.done && t.daysLeft !== null && t.daysLeft < 0)
  if (overdueTasks.length)
    items.push({
      id: 'catch-up',
      count: overdueTasks.length,
      title: `${overdueTasks.length === 1 ? 'Task' : 'Tasks'} to catch up on`,
      note: overdueTasks[0].title,
      href: '#/checklist',
      tone: 'ochre',
    })

  const unpaid = upcomingPayments(visibleVendors, 99)
  const latePayments = unpaid.filter((v) => isOverdue(v))
  if (latePayments.length)
    items.push({
      id: 'late-payments',
      count: latePayments.length,
      title: `${latePayments.length === 1 ? 'Payment' : 'Payments'} overdue`,
      note: latePayments.map((v) => v.name).join(', '),
      href: '#/calendar',
      tone: 'terracotta',
    })
  const soon = unpaid.filter((v) => !isOverdue(v) && v.dueDate <= addDays(today, 30))
  if (soon.length)
    items.push({
      id: 'payments-soon',
      count: soon.length,
      title: `${soon.length === 1 ? 'Payment' : 'Payments'} due in 30 days`,
      note: `${formatRM(soon.reduce((n, v) => n + Math.max(0, v.estimatedCost - v.amountPaid), 0))} still to pay`,
      href: '#/calendar',
      tone: 'ochre',
    })

  const weekTasks = tasks.filter((t) => !t.done && t.daysLeft !== null && t.daysLeft >= 0 && t.daysLeft <= 7)
  if (weekTasks.length)
    items.push({
      id: 'week-tasks',
      count: weekTasks.length,
      title: `${weekTasks.length === 1 ? 'Task' : 'Tasks'} due this week`,
      note: weekTasks[0].title,
      href: '#/checklist',
      tone: 'gold',
    })

  const toReview = replies.filter((r) => r.state === 'review').length
  if (toReview)
    items.push({
      id: 'replies',
      count: toReview,
      title: `RSVP ${toReview === 1 ? 'reply' : 'replies'} to review`,
      note: 'No matching phone number on your list',
      href: '#/guests',
      tone: 'ochre',
    })

  const pending = guests.filter((g) => g.status === 'pending').length
  if (pending && invite.rsvpBy && invite.rsvpBy < today)
    items.push({
      id: 'no-reply',
      count: pending,
      title: `${pending === 1 ? 'Guest has' : 'Guests have'} not replied`,
      note: 'The reply-by date has passed',
      href: '#/guests',
      tone: 'ochre',
    })

  if (unseated > 0)
    items.push({
      id: 'unseated',
      count: unseated,
      title: `${unseated === 1 ? 'Person' : 'People'} not seated yet`,
      note: 'Attending, with no table',
      href: '#/seating',
      tone: 'gold',
    })

  const toThank = gifts.log.filter((g) => !g.thanked).length
  if (toThank)
    items.push({
      id: 'thanks',
      count: toThank,
      title: `${toThank === 1 ? 'Thank-you' : 'Thank-yous'} to send`,
      note: 'For gifts you have logged',
      href: '#/gifts',
      tone: 'gold',
    })

  return items
}

// Is the e-invite ready to send? Each check: { label, done, optional }.
export function inviteReadiness(invite, settings) {
  const shown = inviteEvents(invite, settings)
  const checks = [
    { label: "Couple's names", done: real(invite.bride) && real(invite.groom) },
    { label: 'Date for each event shown', done: shown.length > 0 && shown.every((e) => e.date) },
    { label: 'Venue for each event shown', done: shown.length > 0 && shown.every((e) => real(e.venue)) },
    { label: 'A contact for enquiries', done: invite.contacts.some((c) => real(c.name) && c.phone) },
    { label: 'Background music', done: Boolean(invite.music?.url), optional: true },
    { label: 'Photo gallery', done: (invite.media?.gallery?.length ?? 0) > 0, optional: true },
  ]
  const needed = checks.filter((c) => !c.optional)
  return { checks, ready: needed.every((c) => c.done), done: needed.filter((c) => c.done).length, total: needed.length }
}

// First steps for a new planner. Only the couple's own entries count, not the samples.
export function firstSteps({ settings, vendors, guests, invite, gifts, firstCategory = 'venue' }) {
  const on = Object.values(settings.events).filter((e) => e.on)
  return [
    {
      id: 'dates',
      label: 'Set your event dates',
      note: 'The countdown and checklist are worked out from them.',
      href: '#/settings',
      done: on.length > 0 && on.every((e) => e.date),
    },
    {
      id: 'vendor',
      label: 'Add your first vendor',
      note: 'Pick a category in the menu, then "Add a vendor".',
      href: `#/vendors/${firstCategory}`,
      done: vendors.some((v) => !isSample(v.id)),
    },
    {
      id: 'guests',
      label: 'Start your guest list',
      note: 'Add guests one by one, or import a list.',
      href: '#/guests',
      done: guests.some((g) => !isSample(g.id)),
    },
    {
      id: 'invite',
      label: 'Design your e-invite',
      note: 'Names, venue, theme and opening.',
      href: '#/invite',
      done: inviteReadiness(invite, settings).ready,
    },
    {
      id: 'gifts',
      label: 'Set up gifts',
      note: 'Bank details for salam kaut, or a wish list.',
      href: '#/gifts/wishlist',
      // The sample account number is all zeros.
      done: /[1-9]/.test(invite.gift?.account ?? '') || gifts.wishlist.some((i) => !isSample(i.id)),
    },
  ]
}
