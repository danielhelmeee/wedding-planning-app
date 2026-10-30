// Guest import from a CSV file, cells pasted from a spreadsheet, or a plain list of names.
// Columns are matched by their heading (English or Malay); anything missing uses the form's defaults.
import { EMPTY_GUEST } from './data/guestOptions.js'

// Splits CSV or tab-separated text into rows of cells (handles quotes, commas and line breaks in quotes).
export function parseTable(text) {
  const sep = text.includes('\t') ? '\t' : ','
  const rows = []
  let row = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"' && cell === '') quoted = true
    else if (ch === sep) {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += ch
  }
  row.push(cell)
  rows.push(row)
  return rows.map((r) => r.map((c) => c.trim())).filter((r) => r.some(Boolean))
}

const HEADINGS = {
  name: ['name', 'nama', 'guest', 'tetamu', 'full name', 'nama penuh'],
  phone: ['phone', 'telefon', 'no telefon', 'no. telefon', 'mobile', 'whatsapp', 'tel', 'no tel', 'h/p'],
  side: ['side', 'pihak'],
  group: ['group', 'kumpulan', 'category', 'hubungan', 'relation'],
  plusOnes: ['plus ones', '+1', '+1s', 'plus one', 'extra', 'extra people', 'tambahan', 'pax tambahan'],
  status: ['reply', 'rsvp', 'status', 'hadir', 'attending', 'kehadiran'],
  events: ['events', 'event', 'majlis', 'invited to', 'jemputan'],
  dietary: ['dietary', 'diet', 'pemakanan', 'makanan', 'allergy', 'alahan'],
  notes: ['notes', 'note', 'catatan', 'nota'],
}

const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim()

function columnMap(header) {
  const map = {}
  header.forEach((h, i) => {
    const key = Object.keys(HEADINGS).find((k) => HEADINGS[k].includes(norm(h)))
    if (key && map[key] === undefined) map[key] = i
  })
  return map.name === undefined ? null : map
}

function readSide(v) {
  const s = norm(v)
  if (/^(bride|b|perempuan|pengantin perempuan|pihak perempuan|p)$/.test(s)) return 'bride'
  if (/^(groom|g|lelaki|pengantin lelaki|pihak lelaki|l)$/.test(s)) return 'groom'
  if (/^(both|both families|kedua|kedua-dua|keduanya)$/.test(s)) return 'both'
  return null
}

function readStatus(v) {
  const s = norm(v)
  if (/^(attending|yes|y|hadir|datang|ya|confirmed|coming)$/.test(s)) return 'attending'
  if (/^(declined|no|n|tidak|tak|tidak hadir|not coming)$/.test(s)) return 'declined'
  if (/^(pending|awaiting|awaiting reply|belum|maybe|-)$/.test(s)) return 'pending'
  return null
}

function readEvents(v, onIds) {
  const s = norm(v)
  if (!s) return null
  if (/^(all|semua)$/.test(s)) return onIds
  const found = []
  if (/akad|nikah/.test(s)) found.push('akad')
  if (/sanding/.test(s)) found.push('sanding')
  if (/reception|resepsi|kenduri|bertandang/.test(s)) found.push('reception')
  return found.length ? found.filter((e) => onIds.includes(e)) : null
}

const PHONE_RE = /(?:\+?6?0)1\d[\d\s-]{7,10}\d/

// → { guests: [...], skipped: number (rows without a name), usedHeadings: bool }
export function readGuests(text, defaults, onIds) {
  const rows = parseTable(text)
  if (!rows.length) return { guests: [], skipped: 0, usedHeadings: false }
  const map = columnMap(rows[0])
  const body = map ? rows.slice(1) : rows
  let skipped = 0

  const guests = body
    .map((cells) => {
      const get = (k) => (map && map[k] !== undefined ? cells[map[k]] ?? '' : '')
      let name
      let phone
      if (map) {
        name = get('name')
        phone = get('phone')
      } else {
        // No headings: a plain list. "Name, phone" or "Name<tab>phone" or just a name; list numbering is dropped.
        const line = cells.join(', ')
        phone = line.match(PHONE_RE)?.[0] ?? ''
        name = line.replace(phone, '').replace(/[,;\s]+$/, '').replace(/,\s*,/g, ',')
      }
      name = name.replace(/^\s*\d+[.)]\s*/, '').trim()
      if (!name) {
        skipped++
        return null
      }
      const plus = Number.parseInt(get('plusOnes'), 10)
      return {
        ...EMPTY_GUEST,
        name,
        phone: phone.trim(),
        side: readSide(get('side')) ?? defaults.side,
        group: get('group') || defaults.group,
        status: readStatus(get('status')) ?? defaults.status,
        events: readEvents(get('events'), onIds) ?? defaults.events,
        plusOnes: Number.isFinite(plus) ? Math.max(0, Math.min(20, plus)) : 0,
        dietary: get('dietary'),
        notes: get('notes'),
      }
    })
    .filter(Boolean)

  return { guests, skipped, usedHeadings: Boolean(map) }
}

export const TEMPLATE_CSV = [
  'Name,Phone,Side,Group,Plus ones,Reply,Events,Dietary,Notes',
  'Sample Mak Ngah & family,012-345 6789,Bride,Family,3,Attending,All,No seafood,',
  'Sample Encik Hakim,,Groom,Colleagues,0,Awaiting,Reception,,Office friend',
].join('\n')
