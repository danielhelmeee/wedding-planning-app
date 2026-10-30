import { useEffect, useRef, useState } from 'react'
import { smooth } from './motion.js'

// Routes live in the URL hash so refresh and the back button work without a router library:
// #/home, #/procedure, #/checklist, #/checklist/<tab>, #/calendar, #/guests, #/seating/<event>, #/gifts[/wishlist], #/day[/<event>], #/invite, #/invite/preview, #/settings, #/vendors/<category>, #/vendors/<category>/<event>
function parse() {
  const parts = window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  if (parts[0] === 'vendors' && parts[1]) {
    return { page: 'category', category: parts[1], event: parts[2] ?? 'all' }
  }
  if (parts[0] === 'checklist') return { page: 'checklist', tab: parts[1] ?? 'all' }
  if (parts[0] === 'seating') return { page: 'seating', tab: parts[1] ?? '' }
  if (parts[0] === 'gifts') return { page: 'gifts', tab: parts[1] ?? '' }
  if (parts[0] === 'day') return { page: 'day', tab: parts[1] ?? '' }
  if (parts[0] === 'invite') return { page: parts[1] === 'preview' ? 'invite-preview' : 'invite' }
  if (['procedure', 'calendar', 'guests', 'settings', 'budget'].includes(parts[0])) return { page: parts[0] }
  return { page: 'home' }
}

export function hrefFor(route) {
  if (route.page === 'category') {
    return `#/vendors/${route.category}${route.event && route.event !== 'all' ? `/${route.event}` : ''}`
  }
  if (route.page === 'checklist' && route.tab && route.tab !== 'all') return `#/checklist/${route.tab}`
  if (route.page === 'seating' && route.tab) return `#/seating/${route.tab}`
  if (route.page === 'gifts' && route.tab) return `#/gifts/${route.tab}`
  if (route.page === 'day' && route.tab) return `#/day/${route.tab}`
  return `#/${route.page}`
}

// Tabs inside one page change in place: lists glide on list pages, the content cross-fades on the others.
const TAB_KIND = { category: 'list', checklist: 'list', gifts: 'list', seating: 'panel:seating', day: 'panel:day' }
const isTabChange = (a, b) =>
  a.page === b.page && a.page in TAB_KIND && (a.page !== 'category' || a.category === b.category)

export function useHashRoute() {
  const [route, setRoute] = useState(parse)
  const current = useRef(route)
  useEffect(() => {
    const onChange = () => {
      const next = parse()
      // A tab on the same page: no page change, and the scroll stays put.
      const tabOnly = isTabChange(current.current, next)
      current.current = next
      smooth(
        () => {
          setRoute(next)
          if (!tabOnly) window.scrollTo(0, 0)
        },
        tabOnly ? TAB_KIND[next.page] : 'page',
      )
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
