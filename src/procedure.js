// The marriage procedure tracker: statuses, dates, and the 90-day window of the marriage permission letter.
// The 90 days come from the official source (see data/procedureSteps.js); everything else is the couple's own record.
import { addDays, todayISO } from './dates.js'
import { formatDate } from './figures.js'

export const LETTER_DAYS = 90

export const EMPTY_PROCEDURE = {
  // Per person: status, and the course date, time and location (all optional).
  course: { bride: 'todo', groom: 'todo', brideDate: '', groomDate: '', brideTime: '', groomTime: '', brideLocation: '', groomLocation: '' },
  // Milestones in order: documents gathered → application sent → permission letter issued.
  application: { docs: false, sent: false, sentOn: '', letter: false, letterIssued: '' },
  // Registrar confirmed → Akad Nikah held → certificate collected.
  akad: { registrar: '', registrarDone: false, held: false, certificate: false },
  documents: [],
}

export const STATUSES = [
  { id: 'todo', label: 'Not started' },
  { id: 'doing', label: 'In progress' },
  { id: 'done', label: 'Done' },
]

// The course, per person.
export const COURSE_STATUSES = [
  { id: 'todo', label: 'Not yet' },
  { id: 'doing', label: 'Registered' },
  { id: 'done', label: 'Completed' },
]

// Documents count as gathered once every listed one is ticked, or when the couple ticks the milestone.
export const docsGathered = (p) => p.application.docs || (p.documents.length > 0 && p.documents.every((d) => d.done))

// Each step's status, worked out from its milestones.
export function stepStatus(p) {
  const { bride, groom } = p.course
  const course = bride === 'done' && groom === 'done' ? 'done' : bride !== 'todo' || groom !== 'todo' ? 'doing' : 'todo'
  const a = p.application
  const application = a.letter ? 'done' : docsGathered(p) || a.sent || p.documents.some((d) => d.done) ? 'doing' : 'todo'
  const k = p.akad
  const akad = k.certificate ? 'done' : k.registrarDone || k.held ? 'doing' : 'todo'
  return { course, application, akad }
}

// The one thing to do next: { step, text, link?, linkLabel? }, or null when everything is done.
export function nextAction(p, links = {}) {
  const { bride, groom } = p.course
  if (bride === 'todo' || groom === 'todo')
    return { step: 'course', text: 'Register for the pre-marriage course', link: links.course, linkLabel: 'Apply on SPPIM' }
  if (bride !== 'done' || groom !== 'done') return { step: 'course', text: 'Finish the pre-marriage course (both of you)' }
  const a = p.application
  if (!docsGathered(p))
    return { step: 'application', text: 'Gather the documents for your marriage application', link: links.application, linkLabel: 'SPPIM document checklist' }
  if (!a.sent) return { step: 'application', text: 'Submit your marriage application' }
  if (!a.letter) return { step: 'application', text: 'Wait for your marriage permission letter' }
  const k = p.akad
  if (!k.registrarDone) return { step: 'akad', text: 'Confirm your marriage registrar' }
  if (!k.held) return { step: 'akad', text: 'Your Akad Nikah' }
  if (!k.certificate) return { step: 'akad', text: 'Collect your marriage certificate' }
  return null
}

// Does the permission letter cover the Akad Nikah date? Returns null when there is nothing to say.
// { tone: 'ok' | 'warn' | 'info', title, text, validUntil }
export function letterWindow(p, akadDate) {
  const issued = p.application.letterIssued
  if (!issued) {
    if (!akadDate) return null
    const earliest = addDays(akadDate, -LETTER_DAYS)
    return {
      tone: 'info',
      title: 'Timing your application',
      text: `The letter is valid for ${LETTER_DAYS} days from the date it is issued. To cover your Akad Nikah on ${formatDate(akadDate)}, it should be issued on or after ${formatDate(earliest)}.`,
      earliest,
    }
  }
  const validUntil = addDays(issued, LETTER_DAYS)
  if (!akadDate)
    return { tone: 'info', title: `Valid until ${formatDate(validUntil)}`, text: 'Set your Akad Nikah date to check it is covered.', validUntil }
  if (akadDate < issued)
    return { tone: 'warn', title: 'Check the dates', text: `Your Akad Nikah (${formatDate(akadDate)}) is before the letter's issue date.`, validUntil }
  if (akadDate > validUntil)
    return {
      tone: 'warn',
      title: `Expires before your Akad Nikah`,
      text: `The letter is valid until ${formatDate(validUntil)}, but your Akad Nikah is on ${formatDate(akadDate)}. Check with your religious office about renewing it.`,
      validUntil,
    }
  return {
    tone: 'ok',
    title: `Valid until ${formatDate(validUntil)}`,
    text: `Covers your Akad Nikah on ${formatDate(akadDate)}.`,
    validUntil,
  }
}

// For the checklist's automatic ticks. Returns why a procedure task is done, or null.
export function procedureAuto(kind, p) {
  if (!p) return null
  if (kind === 'course') return stepStatus(p).course === 'done' ? 'Both of you finished the course' : null
  if (kind === 'docs') return docsGathered(p) ? 'Documents gathered' : p.application.sent ? 'Application submitted' : null
  if (kind === 'apply') return p.application.sent || p.application.letter ? 'Application submitted' : null
  if (kind === 'certificate') return p.akad.certificate ? 'Certificate collected' : null
  return null
}

export const isPast = (iso) => Boolean(iso) && iso < todayISO()
