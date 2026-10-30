// E-invite: default content (made-up sample names), wording per language, and the WhatsApp message.
// Themes and opening animations live in inviteThemes.js.
import { EVENTS } from './data/events.js'
import { fromISO } from './dates.js'
import { whatsappHref } from './contact.js'

export const WORDS = {
  ms: {
    title: 'Walimatul Urus',
    opening:
      'Dengan penuh kesyukuran ke hadrat Ilahi, kami mempersilakan Tuan / Puan / Encik / Cik seisi keluarga ke majlis perkahwinan anakanda kami',
    closing: 'Kehadiran dan doa restu tuan dan puan amatlah kami hargai.',
    and: '&',
    events: { akad: 'Akad Nikah', sanding: 'Majlis Bersanding', reception: 'Majlis Resepsi' },
    dress: 'Kod pakaian',
    rsvp: 'Sila sahkan kehadiran',
    rsvpBy: 'sebelum',
    maps: 'Peta',
    seal: 'BUKA',
    tagline: 'Dengan penuh kesyukuran, anda dijemput ke majlis perkahwinan kami',
    programme: 'Atur cara majlis',
    countdown: 'Menghitung hari',
    units: ['Hari', 'Jam', 'Minit', 'Saat'],
    doa: 'Semoga Allah memberkati majlis ini, melimpahkan rahmat dan kasih sayang kepada kedua mempelai, dan menyatukan mereka dalam kebaikan hingga ke jannah.',
    from: 'Jemputan ikhlas daripada',
    signOff: 'Kami Sekeluarga',
    date: 'Tarikh',
    time: 'Masa',
    venue: 'Tempat',
    saveDate: 'Simpan tarikh',
    nav: { calendar: 'Kalendar', contacts: 'Hubungi', location: 'Lokasi', rsvp: 'RSVP', gift: 'Hadiah', music: 'Lagu' },
    rsvpTitle: 'RSVP',
    rsvpButton: 'Sahkan kehadiran',
    yourName: 'Nama anda',
    attending: 'Hadir',
    notAttending: 'Tidak dapat hadir',
    people: 'Bilangan orang',
    peopleUnit: 'orang',
    whichEvents: 'Majlis yang akan dihadiri',
    noteLabel: 'Ucapan / catatan (pilihan)',
    phoneLabel: 'No. telefon',
    send: 'HANTAR',
    nameNeeded: 'Sila isi nama anda.',
    phoneNeeded: 'Sila isi nombor telefon yang sah, cth. 012-345 6789.',
    eventNeeded: 'Sila pilih sekurang-kurangnya satu majlis.',
    thanksTitle: 'Terima kasih',
    thanksComing: 'Jawapan anda telah diterima. Kami menantikan kehadiran anda!',
    thanksNotComing: 'Jawapan anda telah diterima. Terima kasih atas doa anda.',
    alsoWhatsApp: 'Beritahu melalui WhatsApp juga',
    changeReply: 'Ubah jawapan',
    rsvpMsg: {
      head: 'RSVP',
      name: 'Nama',
      phone: 'Telefon',
      attendance: 'Kehadiran',
      events: 'Majlis',
      note: 'Ucapan',
    },
    wishesTitle: 'Ucapan',
    wishName: 'Nama',
    wishMessage: 'Ucapan anda',
    wishSend: 'Hantar ucapan',
    wishPreview: 'Pratonton: ucapan baharu hanya kelihatan di peranti ini sehingga jemputan dalam talian.',
    noWishes: 'Jadilah yang pertama menghantar ucapan.',
    registryTitle: 'Senarai Hadiah',
    registryIntro: 'Jika ingin memberi hadiah, berikut antara keperluan kami. Tempah dahulu supaya tidak berulang.',
    reserve: 'Saya hadiahkan',
    reserved: 'Sudah ditempah',
    reservedByYou: 'Ditempah oleh anda',
    reserveSend: 'TEMPAH',
    reserveThanks: 'Terima kasih! Hadiah ini telah ditempah atas nama anda.',
    viewItem: 'Lihat',
    cancel: 'Batal',
    giftTitle: 'Salam Kaut',
    giftIntro: 'Bagi yang ingin menghulurkan sumbangan, boleh disalurkan melalui:',
    copy: 'Salin',
    copied: 'Disalin',
    scanQr: 'Imbas untuk menyumbang',
    gallery: 'Galeri',
    musicProblem: {
      'not-embeddable':
        'Video ini tidak boleh dimainkan di laman lain (dihalang oleh pemiliknya, atau video peribadi / dipadam).',
      unavailable: 'Video ini telah dipadam atau dijadikan peribadi.',
      'bad-link': 'Pautan lagu tidak sah.',
      'cannot-play': 'Pelayar ini tidak dapat memainkan video ini.',
      offline: 'YouTube tidak dapat dihubungi. Semak sambungan internet anda.',
      player: 'Pemain YouTube tidak dapat dimuatkan. Cuba muat semula halaman.',
    },
    play: 'Mainkan lagu',
    pause: 'Hentikan lagu',
    call: 'Telefon',
    noContacts: 'Tiada nombor untuk dihubungi.',
  },
  en: {
    title: 'Wedding Invitation',
    opening: 'With gratitude to Allah, we warmly invite you and your family to the wedding of our beloved children',
    closing: 'Your presence and prayers would mean the world to us.',
    and: '&',
    events: { akad: 'Akad Nikah (Solemnisation)', sanding: 'Sanding Ceremony', reception: 'Wedding Reception' },
    dress: 'Dress code',
    rsvp: 'Kindly reply',
    rsvpBy: 'by',
    maps: 'Map',
    seal: 'OPEN',
    tagline: 'Together with their families, we invite you to celebrate our wedding',
    programme: 'Programme',
    countdown: 'Counting down',
    units: ['Days', 'Hours', 'Minutes', 'Seconds'],
    doa: 'May Allah bless this union, fill the couple’s home with mercy and love, and keep them together in goodness, in this life and the next.',
    from: 'With love from',
    signOff: 'The families',
    date: 'Date',
    time: 'Time',
    venue: 'Venue',
    saveDate: 'Save the date',
    nav: {
      calendar: 'Calendar',
      contacts: 'Contact',
      location: 'Location',
      rsvp: 'RSVP',
      gift: 'Gifts',
      music: 'Music',
    },
    rsvpTitle: 'RSVP',
    rsvpButton: 'Reply now',
    yourName: 'Your name',
    attending: 'Attending',
    notAttending: 'Can’t attend',
    people: 'Number of people',
    peopleUnit: 'people',
    whichEvents: 'Which events',
    noteLabel: 'Message (optional)',
    phoneLabel: 'Phone number',
    send: 'SUBMIT',
    nameNeeded: 'Please enter your name.',
    phoneNeeded: 'Please enter a valid phone number, e.g. 012-345 6789.',
    eventNeeded: 'Please choose at least one event.',
    thanksTitle: 'Thank you',
    thanksComing: 'Your reply has been received. We look forward to seeing you!',
    thanksNotComing: 'Your reply has been received. Thank you for your prayers.',
    alsoWhatsApp: 'Also tell them on WhatsApp',
    changeReply: 'Change my reply',
    rsvpMsg: {
      head: 'RSVP',
      name: 'Name',
      phone: 'Phone',
      attendance: 'Attendance',
      events: 'Events',
      note: 'Message',
    },
    wishesTitle: 'Wishes',
    wishName: 'Name',
    wishMessage: 'Your wishes',
    wishSend: 'Send wishes',
    wishPreview: 'Preview: new wishes only show on this device until the invitation is online.',
    noWishes: 'Be the first to send your wishes.',
    registryTitle: 'Gift Wish List',
    registryIntro:
      'If you would like to give a present, here are a few things we need. Reserve one so gifts are not repeated.',
    reserve: 'I’ll give this',
    reserved: 'Reserved',
    reservedByYou: 'Reserved by you',
    reserveSend: 'RESERVE',
    reserveThanks: 'Thank you! This gift is now reserved in your name.',
    viewItem: 'View',
    cancel: 'Cancel',
    giftTitle: 'Wedding Gift',
    giftIntro: 'If you would like to send a gift, you can do so here:',
    copy: 'Copy',
    copied: 'Copied',
    scanQr: 'Scan to send a gift',
    gallery: 'Gallery',
    musicProblem: {
      'not-embeddable': 'This video cannot be played on other sites (blocked by its owner, or private / removed).',
      unavailable: 'This video has been removed or made private.',
      'bad-link': 'The song link is not valid.',
      'cannot-play': 'This browser cannot play this video.',
      offline: 'YouTube could not be reached. Check your internet connection.',
      player: 'The YouTube player could not load. Try refreshing the page.',
    },
    play: 'Play music',
    pause: 'Pause music',
    call: 'Call',
    noContacts: 'No contact numbers yet.',
  },
}

const sampleEvent = (start, end, venue, address) => ({ show: true, start, end, venue, address, programme: [] })

export const SAMPLE_INVITE = {
  language: 'ms',
  theme: 'garden',
  palette: 'emerald',
  animation: 'gates',
  tagline: '',
  doa: '',
  signOff: '',
  // Gallery photos (ids in IndexedDB, see media.js).
  media: { gallery: [] },
  // Background music: a YouTube link, played and paused with the spinning disc.
  music: { url: '' },
  // Guests reply through WhatsApp to this number (blank = the first contact with a phone number).
  rsvp: { show: true, phone: '' },
  // Wishes the couple chooses to show (guests' own wishes are collected once the invite is online).
  wishes: {
    show: true,
    list: [
      { name: 'Sample Mak Long', message: 'Selamat pengantin baru! Semoga berkekalan hingga ke jannah.' },
      { name: 'Sample Kak Ina', message: 'Tahniah Aisyah & Hakim, semoga bahagia selalu.' },
    ],
  },
  // Salam kaut: bank details and an optional QR image (an id in IndexedDB). Made-up sample details.
  // The wish list from the Gifts page, shown as "Senarai Hadiah".
  registry: { show: true },
  gift: { show: true, bank: 'Sample Bank', holder: 'Sample Nur Aisyah', account: '0000 0000 0000', qr: '', note: '' },
  showBismillah: true,
  // Floating petals, gold dust, blossoms or stars over the invitation (themes that have them).
  particles: true,
  title: '',
  opening: '',
  closing: '',
  hosts: 'Sample Encik Ahmad bin Ali & Sample Puan Siti binti Omar',
  bride: 'Sample Nur Aisyah',
  groom: 'Sample Muhammad Hakim',
  events: {
    akad: sampleEvent('10:00', '12:00', 'Sample Masjid Al-Hidayah', 'Sample Jalan Masjid, Shah Alam, Selangor'),
    sanding: {
      ...sampleEvent('11:00', '16:00', 'Sample Dewan Seri Kenanga', 'Sample Jalan Kenanga, Shah Alam, Selangor'),
      programme: [
        { time: '11:00', item: 'Ketibaan tetamu' },
        { time: '12:30', item: 'Ketibaan pengantin' },
        { time: '13:00', item: 'Jamuan makan beradab' },
        { time: '15:00', item: 'Sesi bergambar' },
        { time: '16:00', item: 'Majlis bersurai' },
      ],
    },
    reception: sampleEvent('12:00', '16:00', 'Sample Dewan Teratai', 'Sample Jalan Teratai, Kuantan, Pahang'),
  },
  dressCode: 'Baju Melayu / Baju Kurung, tema emas dan krim',
  rsvpBy: '2027-05-15',
  contacts: [
    { name: 'Sample Puan Siti', phone: '012-345 6789' },
    { name: 'Sample Encik Ahmad', phone: '' },
  ],
}

// Wording with the couple's own text where they wrote some.
export const wordsFor = (invite) => {
  const w = WORDS[invite.language] ?? WORDS.ms
  return {
    ...w,
    title: invite.title || w.title,
    opening: invite.opening || w.opening,
    closing: invite.closing || w.closing,
    tagline: invite.tagline || w.tagline,
    doa: invite.doa || w.doa,
    signOff: invite.signOff || w.signOff,
  }
}

const locale = (lang) => (lang === 'en' ? 'en-GB' : 'ms-MY')

export function inviteDate(iso, lang) {
  return new Intl.DateTimeFormat(locale(lang), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(fromISO(iso))
}

// "14:00" → "2.00 petang" (Malay) or "2:00 pm" (English).
export function inviteTime(hhmm, lang) {
  if (!hhmm) return ''
  const [h, m] = hhmm.split(':').map(Number)
  const h12 = ((h + 11) % 12) + 1
  const mm = String(m).padStart(2, '0')
  if (lang === 'en') return `${h12}:${mm} ${h < 12 ? 'am' : 'pm'}`
  const part = h < 12 ? 'pagi' : h < 14 ? 'tengah hari' : h < 19 ? 'petang' : 'malam'
  return `${h12}.${mm} ${part}`
}

export const timeRange = (e, lang) => [inviteTime(e.start, lang), inviteTime(e.end, lang)].filter(Boolean).join(' – ')

export function mapLinks(e) {
  const q = encodeURIComponent([e.venue, e.address].filter(Boolean).join(', '))
  if (!q) return null
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${q}`,
    waze: `https://waze.com/ul?q=${q}&navigate=yes`,
  }
}

// The events shown on the invite: on in Settings, ticked "show", in date order.
export function inviteEvents(invite, settings) {
  return EVENTS.filter((e) => settings.events[e.id]?.on && invite.events[e.id]?.show)
    .map((e) => ({ id: e.id, date: settings.events[e.id].date, ...invite.events[e.id] }))
    .sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999'))
}

// Plain text for WhatsApp (*bold* is WhatsApp formatting).
export function whatsappMessage(invite, settings) {
  const w = wordsFor(invite)
  const lang = invite.language
  const lines = []
  if (invite.showBismillah) lines.push('بسم الله الرحمن الرحيم', '')
  lines.push(`*${w.title}*`, '')
  if (invite.hosts) lines.push(invite.hosts, '')
  lines.push(w.opening, '')
  lines.push(`*${invite.bride || '…'}* ${w.and} *${invite.groom || '…'}*`, '')
  for (const e of inviteEvents(invite, settings)) {
    lines.push(`*${w.events[e.id]}*`)
    if (e.date) lines.push(inviteDate(e.date, lang))
    const t = timeRange(e, lang)
    if (t) lines.push(t)
    if (e.venue) lines.push(e.venue)
    if (e.address) lines.push(e.address)
    const maps = mapLinks(e)
    if (maps) lines.push(`${w.maps}: ${maps.google}`)
    lines.push('')
  }
  if (invite.dressCode) lines.push(`${w.dress}: ${invite.dressCode}`, '')
  const contacts = invite.contacts.filter((c) => c.name || c.phone)
  if (contacts.length || invite.rsvpBy) {
    lines.push(`${w.rsvp}${invite.rsvpBy ? ` ${w.rsvpBy} ${inviteDate(invite.rsvpBy, lang)}` : ''}`)
    for (const c of contacts) lines.push([c.name, c.phone].filter(Boolean).join(' · '))
    lines.push('')
  }
  lines.push(w.closing)
  return lines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// The couple's initials for the seal ("Sample" placeholders are skipped).
export const initialsOf = (invite) =>
  [invite.bride, invite.groom].map((n) =>
    (n || '')
      .replace(/^sample\s+/i, '')
      .trim()
      .charAt(0)
      .toUpperCase(),
  )

// A calendar file (.ics) for one event, as a download link. Times are local (floating) times.
export function icsHref(e, invite, w) {
  if (!e.date) return null
  const day = e.date.replace(/-/g, '')
  const hhmm = (t, fallback) => (t || fallback).replace(':', '') + '00'
  const esc = (v) =>
    String(v || '')
      .replace(/([,;\\])/g, '\\$1')
      .replace(/\n/g, '\\n')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Restu//E-invite//EN',
    'BEGIN:VEVENT',
    `UID:${e.id}-${day}@restu`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')}`,
    `DTSTART:${day}T${hhmm(e.start, '10:00')}`,
    `DTEND:${day}T${hhmm(e.end || e.start, '12:00')}`,
    `SUMMARY:${esc(`${w.events[e.id]}: ${invite.bride} & ${invite.groom}`)}`,
    `LOCATION:${esc([e.venue, e.address].filter(Boolean).join(', '))}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`
}

// The WhatsApp number guests reply to: the one set for RSVP, else the first contact with a usable number.
export function rsvpPhone(invite) {
  if (whatsappHref(invite.rsvp?.phone)) return invite.rsvp.phone
  return invite.contacts.find((c) => whatsappHref(c.phone))?.phone ?? ''
}

// A wa.me link with the guest's reply written out.
export function rsvpHref(invite, w, reply) {
  const base = whatsappHref(rsvpPhone(invite))
  if (!base) return null
  const m = w.rsvpMsg
  const lines = [
    `*${m.head}: ${invite.bride} & ${invite.groom}*`,
    `${m.name}: ${reply.name}`,
    `${m.phone}: ${reply.phone}`,
  ]
  lines.push(`${m.attendance}: ${reply.coming ? `${w.attending} (${reply.people} ${w.peopleUnit})` : w.notAttending}`)
  if (reply.coming && reply.events.length)
    lines.push(`${m.events}: ${reply.events.map((id) => w.events[id]).join(', ')}`)
  if (reply.note) lines.push(`${m.note}: ${reply.note}`)
  return `${base}?text=${encodeURIComponent(lines.join('\n'))}`
}

// When the first shown event starts (for the countdown), or null.
export function firstStart(invite, settings) {
  const e = inviteEvents(invite, settings).find((x) => x.date)
  if (!e) return null
  const [y, m, d] = e.date.split('-').map(Number)
  const [hh, mm] = (e.start || '00:00').split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm)
}
