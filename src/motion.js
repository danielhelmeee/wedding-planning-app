import { flushSync } from 'react-dom'

// Runs a state change inside a view transition (styles.css, "Fluid motion"):
//   'page'  the old page fades out under the new one,
//   'list'  rows glide to their new places; the rest of the page stays still,
//   'swap'  rows glide and anything else that changed cross-fades (views, sections, steps),
//   'panel:<name>'  only the element marked data-tab-panel="<name>" cross-fades; the tabs and the
//          rest of the screen stay still.
// `dir` (1 or -1) slides the calendar grid towards the period you moved to.
// Older browsers and "reduce motion" get the change instantly. A change made while another is
// being applied joins it instead of starting a second transition.
let applying = false

export function smooth(update, kind = 'list', dir = 0) {
  const instant =
    applying ||
    !document.startViewTransition ||
    document.hidden ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (instant) return update()
  const root = document.documentElement
  const [vt, panel] = kind.split(':')
  root.dataset.vt = vt
  if (panel) root.dataset.panel = panel
  else delete root.dataset.panel
  if (dir) root.dataset.dir = dir > 0 ? 'next' : 'prev'
  const t = document.startViewTransition(() => {
    applying = true
    try {
      flushSync(update)
    } finally {
      applying = false
    }
  })
  t.finished.finally(() => {
    if (root.dataset.vt === vt && root.dataset.panel === panel) {
      delete root.dataset.vt
      delete root.dataset.dir
      delete root.dataset.panel
    }
  })
}
