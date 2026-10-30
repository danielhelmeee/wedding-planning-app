// Images for the e-invite, kept in this browser's IndexedDB (localStorage is too small for photos).
// Images are resized before saving. Only ids are stored in the invite (wvt.invite).
import { useEffect, useState } from 'react'

const DB = 'wvt-media'
const STORE = 'images'

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function tx(mode, run) {
  const db = await open()
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode)
    const result = run(t.objectStore(STORE))
    t.oncomplete = () => resolve(result?.result ?? result)
    t.onerror = () => reject(t.error)
  })
}

// Shrinks an image file so its longest side is at most `max` px. Keeps PNG (transparency) as PNG.
function resize(file, max) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
      const w = Math.round(img.naturalWidth * scale)
      const h = Math.round(img.naturalHeight * scale)
      const c = document.createElement('canvas')
      c.width = w
      c.height = h
      c.getContext('2d').drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      c.toBlob((blob) => (blob ? resolve({ blob, w, h }) : reject(new Error('Could not read the image'))), type, 0.86)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That file is not an image this browser can open.'))
    }
    img.src = url
  })
}

const cache = new Map() // id → object URL

export async function saveImage(file, max = 1800) {
  const { blob, w, h } = await resize(file, max)
  const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  await tx('readwrite', (s) => s.put({ id, blob, w, h, name: file.name, created: Date.now() }))
  return id
}

export async function deleteImage(id) {
  if (!id) return
  if (cache.has(id)) {
    URL.revokeObjectURL(cache.get(id))
    cache.delete(id)
  }
  await tx('readwrite', (s) => s.delete(id))
}

export async function imageURL(id) {
  if (!id) return null
  if (cache.has(id)) return cache.get(id)
  const rec = await tx('readonly', (s) => s.get(id))
  if (!rec) return null
  const url = URL.createObjectURL(rec.blob)
  cache.set(id, url)
  return url
}

// The object URL for an image id (null while loading or if missing).
export function useImage(id) {
  const [loaded, setLoaded] = useState({ id: null, url: null })
  useEffect(() => {
    if (!id) return
    let alive = true
    imageURL(id)
      .then((url) => alive && setLoaded({ id, url }))
      .catch(() => alive && setLoaded({ id, url: null }))
    return () => {
      alive = false
    }
  }, [id])
  return id && loaded.id === id ? loaded.url : null
}
