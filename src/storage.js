// The only file that touches localStorage, so a backend can replace it later.
import { CATEGORY_BY_ID } from './data/categories.js'
import { EVENT_IDS } from './data/events.js'
import { EMPTY_DETAILS, SAMPLE_SETTINGS, SAMPLE_VENDORS } from './data/sampleVendors.js'
import { EMPTY_GUEST, RSVP_BY_ID, SAMPLE_GUESTS, SIDE_BY_ID } from './data/guestOptions.js'
import { SAMPLE_INVITE } from './invite.js'
import { EMPTY_GIFT, EMPTY_ITEM, METHOD_BY_ID, SAMPLE_GIFTS } from './data/giftOptions.js'
import { deleteImage } from './media.js'

const VENDORS_KEY = 'wvt.vendors'
const SETTINGS_KEY = 'wvt.settings'

// Missing key → null; broken JSON → undefined.
function read(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? null : JSON.parse(raw)
  } catch {
    return undefined
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or blocked: keep working in memory.
  }
}

const text = (v) => (typeof v === 'string' ? v : '')
const amount = (v) => (Number.isFinite(v) ? v : 0)

// Brings a saved vendor up to the current shape (older saves have fewer fields).
function normaliseVendor(v) {
  const category = CATEGORY_BY_ID[v.category] ? v.category : 'venue'
  const events = Array.isArray(v.events)
    ? v.events.filter((e) => EVENT_IDS.includes(e))
    : CATEGORY_BY_ID[category].events
  return {
    ...EMPTY_DETAILS,
    id: text(v.id) || `v_${Math.random().toString(36).slice(2)}`,
    name: text(v.name),
    category,
    events,
    stage: text(v.stage) || 'prospecting',
    estimatedCost: amount(v.estimatedCost),
    amountPaid: amount(v.amountPaid),
    dueDate: text(v.dueDate),
    contactName: text(v.contactName),
    phone: text(v.phone) || text(v.contactPhone),
    email: text(v.email),
    instagram: text(v.instagram),
    facebook: text(v.facebook),
    tiktok: text(v.tiktok),
    website: text(v.website),
    link: text(v.link),
    notes: text(v.notes),
  }
}

// Samples load only the first time (key missing) or if the saved data is broken.
export function loadVendors() {
  const saved = read(VENDORS_KEY)
  return Array.isArray(saved) ? saved.filter((v) => v && typeof v === 'object').map(normaliseVendor) : SAMPLE_VENDORS
}

export function saveVendors(vendors) {
  write(VENDORS_KEY, vendors)
}

export function loadSettings() {
  const saved = read(SETTINGS_KEY)
  if (!saved || typeof saved !== 'object') return SAMPLE_SETTINGS

  // Older saves had one `weddingDate`; it becomes the Akad Nikah date.
  const events = Object.fromEntries(
    EVENT_IDS.map((id) => {
      const e = saved.events?.[id]
      if (e && typeof e === 'object') return [id, { on: e.on !== false, date: text(e.date) }]
      return [id, { on: true, date: id === 'akad' ? text(saved.weddingDate) : '' }]
    }),
  )

  return {
    events,
    totalBudget: amount(saved.totalBudget),
    categoryBudgets: Object.fromEntries(
      Object.entries(saved.categoryBudgets && typeof saved.categoryBudgets === 'object' ? saved.categoryBudgets : {}).filter(
        ([id, v]) => CATEGORY_BY_ID[id] && Number.isFinite(v) && v > 0,
      ),
    ),
    hiddenCategories: Array.isArray(saved.hiddenCategories) ? saved.hiddenCategories : [],
  }
}

export function saveSettings(settings) {
  write(SETTINGS_KEY, settings)
}

const CHECKLIST_KEY = 'wvt.checklist'

// { done: [task ids ticked by hand], dates: { suggested task id: moved date },
//   custom: [{ id, title, dueDate, category, done }] }
export function loadChecklist() {
  const saved = read(CHECKLIST_KEY)
  if (!saved || typeof saved !== 'object') return { done: [], dates: {}, custom: [] }
  const dates = saved.dates && typeof saved.dates === 'object' ? saved.dates : {}
  return {
    dates: Object.fromEntries(
      Object.entries(dates).filter(([, d]) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)),
    ),
    done: Array.isArray(saved.done) ? saved.done.filter((id) => typeof id === 'string') : [],
    custom: Array.isArray(saved.custom)
      ? saved.custom
          .filter((t) => t && typeof t === 'object' && text(t.title))
          .map((t) => ({
            id: text(t.id) || `t_${Math.random().toString(36).slice(2)}`,
            title: text(t.title),
            dueDate: text(t.dueDate),
            category: CATEGORY_BY_ID[t.category] ? t.category : '',
            done: t.done === true,
          }))
      : [],
  }
}

export function saveChecklist(checklist) {
  write(CHECKLIST_KEY, checklist)
}

const GUESTS_KEY = 'wvt.guests'

// Samples load only the first time (key missing) or if the saved data is broken.
export function loadGuests() {
  const saved = read(GUESTS_KEY)
  if (!Array.isArray(saved)) return SAMPLE_GUESTS
  return saved
    .filter((g) => g && typeof g === 'object' && text(g.name))
    .map((g) => ({
      ...EMPTY_GUEST,
      id: text(g.id) || `g_${Math.random().toString(36).slice(2)}`,
      name: text(g.name),
      side: SIDE_BY_ID[g.side] ? g.side : 'bride',
      group: text(g.group) || 'Other',
      phone: text(g.phone),
      events: Array.isArray(g.events) ? g.events.filter((e) => EVENT_IDS.includes(e)) : [],
      attendingEvents: Array.isArray(g.attendingEvents) ? g.attendingEvents.filter((e) => EVENT_IDS.includes(e)) : [],
      repliedAt: text(g.repliedAt),
      status: RSVP_BY_ID[g.status] ? g.status : 'pending',
      plusOnes: Number.isFinite(g.plusOnes) ? Math.max(0, Math.round(g.plusOnes)) : 0,
      dietary: text(g.dietary),
      notes: text(g.notes),
    }))
}

export function saveGuests(guests) {
  write(GUESTS_KEY, guests)
}

const PROCEDURE_KEY = 'wvt.procedure'
const STATUS_IDS = ['todo', 'doing', 'done']

// The marriage procedure tracker (see procedure.js). Older saves (one status per step) are carried over.
export function loadProcedure() {
  const saved = read(PROCEDURE_KEY)
  const o = (v) => (v && typeof v === 'object' ? v : {})
  const st = (v) => (STATUS_IDS.includes(v) ? v : 'todo')
  const yes = (v) => v === true
  const c = o(saved?.course)
  const a = o(saved?.application)
  const k = o(saved?.akad)
  const letterIssued = text(a.letterIssued)
  const sentOn = text(a.sentOn) || text(a.submitted)
  return {
    course: {
      bride: st(c.bride),
      groom: st(c.groom),
      brideDate: text(c.brideDate),
      groomDate: text(c.groomDate),
      brideTime: text(c.brideTime),
      groomTime: text(c.groomTime),
      brideLocation: text(c.brideLocation),
      groomLocation: text(c.groomLocation),
    },
    application: {
      docs: yes(a.docs),
      sent: yes(a.sent) || Boolean(sentOn) || Boolean(letterIssued) || a.status === 'done',
      sentOn,
      letter: yes(a.letter) || Boolean(letterIssued) || a.status === 'done',
      letterIssued,
    },
    akad: {
      registrar: text(k.registrar),
      registrarDone: yes(k.registrarDone),
      held: yes(k.held) || k.status === 'done' || yes(k.certificate),
      certificate: yes(k.certificate),
    },
    documents: Array.isArray(saved?.documents)
      ? saved.documents
          .filter((d) => d && typeof d === 'object' && text(d.id) && text(d.label))
          .map((d) => ({ id: d.id, label: d.label, done: d.done === true }))
      : [],
  }
}

export function saveProcedure(procedure) {
  write(PROCEDURE_KEY, procedure)
}

const UI_KEY = 'wvt.ui'

// Small interface preferences: { vendorsOpen } (the sidebar's Vendors section).
export function loadUi() {
  const saved = read(UI_KEY)
  return { vendorsOpen: saved?.vendorsOpen !== false }
}

export function saveUi(ui) {
  write(UI_KEY, ui)
}

const SETUP_KEY = 'wvt.setup'

// The first-launch setup: { done, start: 'sample' (explore the samples) | 'kept' | 'cleared', at, hideSteps }.
export function loadSetup() {
  const saved = read(SETUP_KEY)
  if (!saved || typeof saved !== 'object' || saved.done !== true) return { done: false, start: 'sample', at: '', hideSteps: false }
  return {
    done: true,
    start: ['sample', 'kept', 'cleared'].includes(saved.start) ? saved.start : 'kept',
    at: text(saved.at),
    // The couple hid the "First steps" card on Home.
    hideSteps: saved.hideSteps === true,
  }
}

export function saveSetup(setup) {
  write(SETUP_KEY, setup)
}

const REPLIES_KEY = 'wvt.replies'
const REPLY_STATES = ['linked', 'review', 'added', 'manual', 'dismissed']

// Replies from the invitation's RSVP form (see rsvp.js). Newest first.
export function loadReplies() {
  const saved = read(REPLIES_KEY)
  if (!Array.isArray(saved)) return []
  return saved
    .filter((r) => r && typeof r === 'object' && text(r.id))
    .map((r) => ({
      id: r.id,
      at: text(r.at),
      name: text(r.name),
      phone: text(r.phone),
      coming: r.coming === true,
      people: Number.isFinite(r.people) ? Math.max(1, Math.round(r.people)) : 1,
      events: Array.isArray(r.events) ? r.events.filter((e) => EVENT_IDS.includes(e)) : [],
      note: text(r.note),
      guestId: typeof r.guestId === 'string' ? r.guestId : null,
      state: REPLY_STATES.includes(r.state) ? r.state : 'review',
    }))
}

export function saveReplies(replies) {
  write(REPLIES_KEY, replies)
}

const GIFTS_KEY = 'wvt.gifts'

// { log: [gift], wishlist: [item] } (see data/giftOptions.js).
export function loadGifts() {
  const saved = read(GIFTS_KEY)
  if (!saved || typeof saved !== 'object') return SAMPLE_GIFTS
  const list = (v) => (Array.isArray(v) ? v.filter((x) => x && typeof x === 'object' && text(x.id)) : [])
  const money = (v) => (Number.isFinite(v) ? Math.max(0, v) : 0)
  const id = (v) => (typeof v === 'string' ? v : null)
  return {
    log: list(saved.log).map((g) => ({
      ...EMPTY_GIFT,
      id: g.id,
      from: text(g.from),
      guestId: id(g.guestId),
      amount: money(g.amount),
      method: METHOD_BY_ID[g.method] ? g.method : 'cash',
      event: EVENT_IDS.includes(g.event) ? g.event : '',
      date: text(g.date),
      note: text(g.note),
      thanked: g.thanked === true,
    })),
    wishlist: list(saved.wishlist).map((it) => ({
      ...EMPTY_ITEM,
      id: it.id,
      name: text(it.name),
      price: money(it.price),
      link: text(it.link),
      note: text(it.note),
      reservedBy: text(it.reservedBy),
      reservedPhone: text(it.reservedPhone),
      guestId: id(it.guestId),
      reservedAt: text(it.reservedAt),
      received: it.received === true,
    })),
  }
}

export function saveGifts(gifts) {
  write(GIFTS_KEY, gifts)
}

const SEATING_KEY = 'wvt.seating'

// { tables: [{ id, event, name, shape, seats, x, y }], assign: { [event]: { [guestId]: tableId } } }
export function loadSeating() {
  const saved = read(SEATING_KEY)
  if (!saved || typeof saved !== 'object') return { tables: [], assign: {} }
  const tables = Array.isArray(saved.tables)
    ? saved.tables
        .filter((t) => t && typeof t === 'object' && EVENT_IDS.includes(t.event))
        .map((t) => ({
          id: text(t.id) || `tb_${Math.random().toString(36).slice(2)}`,
          event: t.event,
          name: text(t.name) || 'Table',
          shape: ['round', 'long', 'vip'].includes(t.shape) ? t.shape : 'round',
          seats: Number.isFinite(t.seats) ? Math.max(1, Math.min(40, Math.round(t.seats))) : 10,
          x: Number.isFinite(t.x) ? t.x : 500,
          y: Number.isFinite(t.y) ? t.y : 300,
        }))
    : []
  const assign = {}
  for (const e of EVENT_IDS) {
    const a = saved.assign?.[e]
    if (a && typeof a === 'object') {
      assign[e] = Object.fromEntries(Object.entries(a).filter(([, tableId]) => typeof tableId === 'string'))
    }
  }
  return { tables, assign }
}

export function saveSeating(seating) {
  write(SEATING_KEY, seating)
}

const INVITE_KEY = 'wvt.invite'

// Saved invite merged over the sample, so new fields always have a value.
export function loadInvite() {
  const saved = read(INVITE_KEY)
  if (!saved || typeof saved !== 'object') return SAMPLE_INVITE
  const events = Object.fromEntries(
    EVENT_IDS.map((id) => {
      const e = { ...SAMPLE_INVITE.events[id], ...(saved.events?.[id] ?? {}) }
      const programme = Array.isArray(e.programme)
        ? e.programme.filter((r) => r && typeof r === 'object').map((r) => ({ time: text(r.time), item: text(r.item) }))
        : []
      return [id, { ...e, programme }]
    }),
  )
  const contacts = Array.isArray(saved.contacts)
    ? saved.contacts.filter((c) => c && typeof c === 'object').map((c) => ({ name: text(c.name), phone: text(c.phone) }))
    : SAMPLE_INVITE.contacts
  const m = saved.media && typeof saved.media === 'object' ? saved.media : {}
  // Own cover / page backgrounds were removed: delete any that were saved earlier.
  for (const old of [m.cover, m.page]) if (typeof old === 'string') deleteImage(old).catch(() => {})
  const media = { gallery: Array.isArray(m.gallery) ? m.gallery.filter((x) => typeof x === 'string').slice(0, 12) : [] }
  const music = { url: text(saved.music?.url) }
  const obj = (v) => (v && typeof v === 'object' ? v : {})
  const flag = (v, fallback) => (typeof v === 'boolean' ? v : fallback)
  const r = obj(saved.rsvp)
  const rsvp = { show: flag(r.show, true), phone: text(r.phone) }
  const wi = obj(saved.wishes)
  const wishes = {
    show: flag(wi.show, true),
    list: Array.isArray(wi.list)
      ? wi.list.filter((x) => x && typeof x === 'object').map((x) => ({ name: text(x.name), message: text(x.message) }))
      : SAMPLE_INVITE.wishes.list,
  }
  const registry = { show: flag(obj(saved.registry).show, true) }
  const g = { ...SAMPLE_INVITE.gift, ...obj(saved.gift) }
  const gift = {
    show: flag(g.show, true),
    ...Object.fromEntries(['bank', 'holder', 'account', 'qr', 'note'].map((k) => [k, text(g[k])])),
  }
  return {
    ...SAMPLE_INVITE,
    ...Object.fromEntries(Object.entries(saved).filter(([k, v]) => k in SAMPLE_INVITE && typeof v === typeof SAMPLE_INVITE[k])),
    events,
    contacts,
    media,
    music,
    rsvp,
    wishes,
    gift,
    registry,
  }
}

export function saveInvite(invite) {
  write(INVITE_KEY, invite)
}

// Backup: every saved part of the planner as one file. Photos and the QR image live in IndexedDB and are not included.
const BACKUP_PREFIX = 'wvt.'

export function exportBackup() {
  const data = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(BACKUP_PREFIX)) data[key] = read(key)
  }
  return { app: 'Restu', version: 1, savedAt: new Date().toISOString(), data }
}

// Checks a file is a Restu backup before anything is replaced. Returns its saved parts; throws with a reason if not.
export function backupParts(backup) {
  if (!backup || backup.app !== 'Restu' || !backup.data || typeof backup.data !== 'object') {
    throw new Error('This file is not a Restu backup.')
  }
  const keys = Object.keys(backup.data).filter((k) => k.startsWith(BACKUP_PREFIX))
  if (!keys.length) throw new Error('This backup is empty.')
  return keys
}

// Restores a backup made by exportBackup. Returns the number of parts restored.
export function importBackup(backup) {
  const keys = backupParts(backup)
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i)
    if (key?.startsWith(BACKUP_PREFIX)) localStorage.removeItem(key)
  }
  for (const k of keys) write(k, backup.data[k])
  return keys.length
}

const CELEBRATED_KEY = 'wvt.celebrated'

// Milestones already celebrated with petals, so each one only ever celebrates once.
export function wasCelebrated(key) {
  const list = read(CELEBRATED_KEY)
  return Array.isArray(list) && list.includes(key)
}

export function markCelebrated(key) {
  const list = read(CELEBRATED_KEY)
  write(CELEBRATED_KEY, [...(Array.isArray(list) ? list : []), key])
}

// True the first time something is seen today (e.g. Home's names ink-in plays once a day).
export function firstTimeToday(key) {
  const seen = read('wvt.seen')
  const today = new Date().toDateString()
  if (seen && typeof seen === 'object' && seen[key] === today) return false
  write('wvt.seen', { ...(seen && typeof seen === 'object' ? seen : {}), [key]: today })
  return true
}
