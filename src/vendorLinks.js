// A vendor's contact links (shared by the vendor card and the quote comparison).
import { whatsappHref } from './contact.js'
import { safeLink } from './figures.js'

const handle = (h) => h.replace(/^@/, '')

// Builds the vendor's contact links; only safe http(s), mailto and wa.me links are made.
export function contactLinks(v) {
  const links = []
  const wa = whatsappHref(v.phone)
  if (wa) {
    links.push({ label: `WhatsApp ${v.phone}`, href: wa })
  } else if (v.phone) {
    links.push({ label: v.phone })
  }
  if (/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(v.email)) links.push({ label: v.email, href: `mailto:${v.email}` })
  if (v.instagram) {
    links.push({ label: `IG @${handle(v.instagram)}`, href: `https://instagram.com/${encodeURIComponent(handle(v.instagram))}` })
  }
  if (v.tiktok) {
    links.push({ label: `TikTok @${handle(v.tiktok)}`, href: `https://tiktok.com/@${encodeURIComponent(handle(v.tiktok))}` })
  }
  const fb = safeLink(v.facebook)
  if (fb) links.push({ label: 'Facebook', href: fb })
  const site = safeLink(v.website)
  if (site) links.push({ label: 'Website', href: site })
  const quote = safeLink(v.link)
  if (quote) links.push({ label: 'Quote / contract', href: quote })
  return links
}
