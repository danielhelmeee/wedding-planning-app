// Browser-only auto-fill: reads what is inside a link address or pasted contact text.
// It never fetches the vendor's website (browsers block that without a server).

// "lensacahaya.studio" / "lensa_cahaya" → "Lensacahaya Studio" / "Lensa Cahaya"
export function nameFromHandle(handle) {
  return handle
    .replace(/^@/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

// "60123456789" → "012-345 6789"; other numbers are returned as typed.
export function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '')
  const local = digits.startsWith('60') ? `0${digits.slice(2)}` : digits
  const m = local.match(/^(01\d)(\d{3,4})(\d{4})$/)
  if (m) return `${m[1]}-${m[2]} ${m[3]}`
  return raw.trim()
}

function toUrl(text) {
  const value = text.trim()
  if (!value) return null
  try {
    return new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
  } catch {
    return null
  }
}

const IGNORED_PATHS = new Set(['p', 'reel', 'reels', 'stories', 'explore', 'share', 'profile.php', 'pages', 'groups', 'watch'])

// What can be read from one link: { instagram?, facebook?, tiktok?, phone?, website?, suggestedName? }
export function parseLink(text) {
  const url = toUrl(text)
  if (!url || !url.hostname.includes('.')) return {}
  const host = url.hostname.replace(/^(www\.|m\.|web\.)/, '').toLowerCase()
  const first = url.pathname.split('/').filter(Boolean)[0] ?? ''

  const profile = first && !IGNORED_PATHS.has(first)
  if (host === 'instagram.com') {
    return profile ? { instagram: `@${first}`, suggestedName: nameFromHandle(first) } : {}
  }
  if (host === 'facebook.com' || host === 'fb.com') {
    return profile ? { facebook: `https://facebook.com/${first}`, suggestedName: nameFromHandle(first) } : {}
  }
  if (host === 'tiktok.com') {
    return first.startsWith('@') ? { tiktok: first, suggestedName: nameFromHandle(first) } : {}
  }
  if (host === 'wa.me' && /^\d{8,15}$/.test(first)) {
    return { phone: formatPhone(first) }
  }
  if (host === 'api.whatsapp.com' && url.searchParams.get('phone')) {
    return { phone: formatPhone(url.searchParams.get('phone')) }
  }
  if (host === 'linktr.ee' && first) {
    return { website: url.href, suggestedName: nameFromHandle(first) }
  }
  // Any other site: keep the link, suggest a name from the domain.
  const domainName = host.split('.')[0]
  return { website: url.href, suggestedName: nameFromHandle(domainName) }
}

const PHONE_RE = /(?:\+?6?0)1\d[\d\s-]{7,10}\d/g
const EMAIL_RE = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g
const URL_RE = /(?:https?:\/\/|www\.)[^\s,;)]+|\b(?:instagram\.com|facebook\.com|tiktok\.com|wa\.me|linktr\.ee)\/[^\s,;)]+/gi
const HANDLE_RE = /(?:^|[\s(])@([A-Za-z0-9._]{2,30})/g

// What can be read from pasted contact text (a bio, a "Contact us" block, a WhatsApp message).
export function parseText(text) {
  const found = {}
  const emails = text.match(EMAIL_RE) ?? []
  if (emails[0]) found.email = emails[0]

  // Links first, so their details win over loose text.
  for (const link of text.match(URL_RE) ?? []) {
    const parsed = parseLink(link)
    for (const [key, value] of Object.entries(parsed)) {
      if (!found[key]) found[key] = value
    }
  }

  const withoutEmails = emails.reduce((t, e) => t.replace(e, ' '), text)
  const phone = withoutEmails.match(PHONE_RE)?.[0]
  if (phone && !found.phone) found.phone = formatPhone(phone)

  const handle = [...withoutEmails.matchAll(HANDLE_RE)][0]?.[1]
  if (handle && !found.instagram) {
    found.instagram = `@${handle}`
    if (!found.suggestedName) found.suggestedName = nameFromHandle(handle)
  }
  return found
}

// Link + pasted text together. The link's suggested name wins.
export function autofill(link, pasted) {
  const fromLink = parseLink(link)
  const fromText = pasted ? parseText(pasted) : {}
  return { ...fromText, ...Object.fromEntries(Object.entries(fromLink).filter(([, v]) => v)) }
}
