// Background music from a YouTube link: parse the link, load YouTube's player API once, and control a player.
import { useEffect, useRef, useState } from 'react'

// "1m30s", "90", "90s" → seconds
function toSeconds(t) {
  if (!t) return 0
  if (/^\d+$/.test(t)) return Number(t)
  const m = t.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/)
  return m ? Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0) : 0
}

// → { id, start } or null. Accepts youtube.com/watch?v=, youtu.be/, /shorts/, /embed/, /live/, music.youtube.com.
export function parseYouTube(link) {
  if (!link) return null
  let url
  try {
    url = new URL(/^https?:\/\//i.test(link.trim()) ? link.trim() : `https://${link.trim()}`)
  } catch {
    return null
  }
  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, '')
  let id = null
  if (host === 'youtu.be') id = url.pathname.split('/')[1]
  else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    id = url.searchParams.get('v') || url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/)?.[1] || null
  }
  if (!id || !/^[\w-]{11}$/.test(id)) return null
  return { id, start: toSeconds(url.searchParams.get('t') || url.searchParams.get('start')) }
}

export const thumbnailOf = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

let apiPromise = null
function loadApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previous?.()
        resolve(window.YT)
      }
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      s.async = true
      s.onerror = () => {
        apiPromise = null
        reject(new Error('Could not reach YouTube'))
      }
      document.head.appendChild(s)
    })
  }
  return apiPromise
}

// YouTube's error codes → what went wrong (see the IFrame API docs).
export function youTubeProblem(code) {
  if (code === 101 || code === 150) return 'not-embeddable' // the owner does not allow playing on other sites
  if (code === 100) return 'unavailable' // removed or private
  if (code === 2) return 'bad-link'
  if (code === 5) return 'cannot-play' // this browser cannot play it
  if (code === 'offline') return 'offline'
  return 'player' // e.g. 153, a player configuration problem
}

const BLANK = { ready: false, playing: false, error: null }

// A YouTube player inside `host` (a ref to an element). Returns { ready, playing, error, play, pause, toggle };
// `error` is a YouTube error code (or 'offline' when YouTube could not be reached).
// play() should be called from a tap: browsers only allow sound to start after the guest touches the page.
export function useYouTubePlayer(host, video) {
  const player = useRef(null)
  const wantPlay = useRef(false)
  const id = video?.id
  const start = video?.start ?? 0
  const key = `${id}@${start}`
  // State is tagged with the video it belongs to, so a new link starts clean without a reset.
  const [raw, setRaw] = useState({ key: null, ...BLANK })
  const state = raw.key === key ? raw : BLANK

  useEffect(() => {
    if (!id || !host.current) return
    let alive = true
    const k = `${id}@${start}`
    const update = (patch) => setRaw((r) => ({ ...(r.key === k ? r : BLANK), ...patch, key: k }))
    const mount = document.createElement('div')
    host.current.appendChild(mount)
    loadApi()
      .then((YT) => {
        if (!alive) return
        player.current = new YT.Player(mount, {
          videoId: id,
          width: '100%',
          height: '100%',
          // origin / widget_referrer tell YouTube which site embeds the player (missing it causes error 153).
          playerVars: {
            start,
            loop: 1,
            playlist: id,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
            widget_referrer: window.location.href,
          },
          events: {
            onReady: () => {
              if (!alive) return
              update({ ready: true })
              if (wantPlay.current) player.current.playVideo()
            },
            onStateChange: (e) => alive && update({ playing: e.data === YT.PlayerState.PLAYING }),
            onError: (e) => alive && update({ error: e.data, playing: false }),
          },
        })
      })
      .catch(() => alive && update({ error: 'offline' }))
    return () => {
      alive = false
      try {
        player.current?.destroy()
      } catch {
        // the player may not have finished loading
      }
      player.current = null
      mount.remove()
    }
  }, [host, id, start])

  const play = () => {
    wantPlay.current = true
    player.current?.playVideo?.()
  }
  const pause = () => {
    wantPlay.current = false
    player.current?.pauseVideo?.()
  }
  return { ...state, play, pause, toggle: () => (state.playing ? pause() : play()) }
}
