// Small touches applied across the app: a champagne ripple where buttons are tapped, and sliding
// indicators under tab rows (any container marked data-slide), and the menu's gliding active pill
// (data-slide-pill). Installed once from main.jsx.
const RIPPLE = '.btn-add, .btn-primary, .btn-secondary, .btn-add-small, .add-line, .phone-tab, .filter-pill, .attention-card, .studio-tab'

export function installFx() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  document.addEventListener(
    'pointerdown',
    (e) => {
      const el = e.target.closest(RIPPLE)
      if (!el || reduce) return
      const r = el.getBoundingClientRect()
      const d = Math.max(r.width, r.height) * 2
      const s = document.createElement('span')
      s.className = 'ripple'
      s.setAttribute('aria-hidden', 'true')
      s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`
      el.appendChild(s)
      s.addEventListener('animationend', () => s.remove())
    },
    { passive: true },
  )

  // Each [data-slide] row gets --ind-x / --ind-w for its .is-active item; CSS slides one bar between them.
  let queued = false
  const update = () => {
    queued = false
    document.querySelectorAll('[data-slide]').forEach((c) => {
      const a = c.querySelector(':scope > .is-active')
      c.classList.toggle('has-indicator', Boolean(a))
      if (!a) return
      c.style.setProperty('--ind-x', `${a.offsetLeft}px`)
      c.style.setProperty('--ind-w', `${a.offsetWidth}px`)
    })
    // The menu's active-page pill ([data-slide-pill]) glides between items, across groups.
    document.querySelectorAll('[data-slide-pill]').forEach((c) => {
      const a = [...c.querySelectorAll('.nav-link.is-active')].find(
        (el) => el.offsetHeight > 0 && !el.closest('.nav-collapse:not(.is-open)'),
      )
      c.classList.toggle('has-pill', Boolean(a))
      if (!a) return
      const cr = c.getBoundingClientRect()
      const ar = a.getBoundingClientRect()
      c.style.setProperty('--pill-y', `${ar.top - cr.top + c.scrollTop}px`)
      c.style.setProperty('--pill-x', `${ar.left - cr.left}px`)
      c.style.setProperty('--pill-w', `${ar.width}px`)
      c.style.setProperty('--pill-h', `${ar.height}px`)
    })
  }
  const queue = () => {
    if (!queued) {
      queued = true
      requestAnimationFrame(update)
    }
  }
  new MutationObserver(queue).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] })
  window.addEventListener('resize', queue)
  document.addEventListener('transitionend', queue)
  document.fonts?.ready.then(queue)
  queue()
}
