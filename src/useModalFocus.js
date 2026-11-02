import { useEffect, useRef } from 'react'

// Keep a dialog's keyboard focus and scrolling inside it, then return to its opener.
export function useModalFocus(ref, onClose) {
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose }, [onClose])
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const opener = document.activeElement
    const overflow = document.body.style.overflow
    const background = []
    for (let node = dialog; node.parentElement; node = node.parentElement) {
      for (const sibling of node.parentElement.children) {
        if (sibling !== node && sibling instanceof HTMLElement) {
          background.push([sibling, sibling.inert])
          sibling.setAttribute('inert', '')
        }
      }
      if (node.parentElement === document.body) break
    }
    document.body.style.overflow = 'hidden'
    const scroller = dialog.closest('.iv-shell')?.querySelector('.iv-scroll')
    const scrollOverflow = scroller?.style.overflow
    if (scroller) scroller.style.setProperty('overflow', 'hidden')
    const focusable = () => [...dialog.querySelectorAll('a[href],button,input,select,textarea,[tabindex]')]
      .filter((el) => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length)
    if (!dialog.contains(document.activeElement)) focusable()[0]?.focus({ preventScroll: true })
    const keydown = (event) => {
      if (event.key === 'Escape' && closeRef.current) {
        event.preventDefault()
        closeRef.current()
      }
      if (event.key !== 'Tab') return
      const fields = focusable()
      const first = fields[0]
      const last = fields.at(-1)
      if (!first) return event.preventDefault()
      if (event.shiftKey && (document.activeElement === first || !fields.includes(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !fields.includes(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }
    dialog.addEventListener('keydown', keydown)
    return () => {
      dialog.removeEventListener('keydown', keydown)
      background.forEach(([el, inert]) => { if (!inert) el.removeAttribute('inert') })
      document.body.style.overflow = overflow
      if (scroller) scroller.style.setProperty('overflow', scrollOverflow)
      if (opener?.isConnected && opener !== document.body) opener.focus({ preventScroll: true })
    }
  }, [ref])
}
