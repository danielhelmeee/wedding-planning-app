// Petal celebrations for real milestones. Each key celebrates once (remembered in wvt.celebrated).
import { markCelebrated, wasCelebrated } from './storage.js'

export function celebrate(key, message = '') {
  if (!key || wasCelebrated(key)) return
  markCelebrated(key)
  window.dispatchEvent(new CustomEvent('restu:celebrate', { detail: { message } }))
}
