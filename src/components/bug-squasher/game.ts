import { type Locale, localizePath } from '~/i18n/core'
import i18n from './bug-squasher.i18n.json'

/**
 * A single bug crawling over the page.
 */
interface Bug {
  el: HTMLButtonElement
  x: number
  y: number
  angle: number
  wobble: number
  entered: boolean
  bornAt: number
}

/**
 * Mutable state of one running round.
 */
interface RoundState {
  bugs: Bug[]
  score: number
  escaped: number
  elapsed: number
  sinceSpawn: number
  lastFrame: number
  frame: number
  over: boolean
}

const ROUND_MS = 30_000
const BUG_SIZE = 48
const EDGE_MARGIN = BUG_SIZE
const STATIC_BUG_MS = 1400
const STORAGE_KEY = 'bug-squasher-highscore'

const BUG_SVG = `<svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
<defs><linearGradient id="bs-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--bs-a)"/><stop offset="1" stop-color="var(--bs-b)"/></linearGradient></defs>
<g stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none">
<path d="M17 20 9 15M17 26H8M17 32l-8 5M31 20l8-5M31 26h9M31 32l8 5M21 10l-3-5M27 10l3-5"/></g>
<circle cx="24" cy="13" r="5" fill="currentColor"/>
<ellipse cx="24" cy="27" rx="9" ry="13" fill="url(#bs-g)"/>
<path d="M24 15v25" stroke="currentColor" stroke-width="1.5" opacity=".5"/></svg>`

const STYLES = `
*{box-sizing:border-box}
.bs-root{--bs-a:var(--color-turquoise-500,hsl(175deg 100% 60%));--bs-b:var(--color-purple-500,hsl(270deg 80% 60%));position:fixed;inset:0;z-index:2147483000;pointer-events:none;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#fff}
.bs-hud{position:absolute;top:calc(var(--nav_height,72px) + 12px);left:50%;translate:-50% 0;display:flex;gap:16px;align-items:center;padding:8px 8px 8px 16px;border-radius:999px;background:hsl(0deg 0% 4% / 92%);backdrop-filter:blur(12px);border:1px solid hsl(0deg 0% 100% / 15%);font-size:13px;letter-spacing:.04em;text-transform:uppercase;white-space:nowrap;pointer-events:auto;box-shadow:0 10px 30px hsl(0deg 0% 0% / 35%)}
.bs-hud b{font-size:16px;color:var(--bs-a)}
.bs-close,.bs-btn{cursor:pointer;border:1px solid hsl(0deg 0% 100% / 30%);background:transparent;color:inherit;font:inherit;border-radius:999px}
.bs-close{width:32px;height:32px;font-size:18px;line-height:1}
.bs-bug{position:absolute;top:0;left:0;width:${BUG_SIZE}px;height:${BUG_SIZE}px;padding:0;border:0;background:none;color:#111;cursor:crosshair;pointer-events:auto;touch-action:manipulation;filter:drop-shadow(0 4px 6px hsl(0deg 0% 0% / 35%))}
.bs-root[data-dark] .bs-bug{color:#f5f5f5}
.bs-bug svg{display:block}
.bs-splat{position:absolute;top:0;left:0;width:${BUG_SIZE}px;height:${BUG_SIZE}px;border-radius:50%;background:radial-gradient(circle,var(--bs-b) 0 30%,transparent 62%);animation:bs-fade .6s ease-out forwards}
.bs-plus{position:absolute;top:0;left:0;font-weight:700;color:var(--bs-a);animation:bs-rise .7s ease-out forwards}
.bs-panel{position:absolute;left:50%;top:50%;translate:-50% -50%;width:min(420px,calc(100vw - 32px));padding:28px;border-radius:24px;background:hsl(0deg 0% 4% / 92%);backdrop-filter:blur(16px);text-align:center;pointer-events:auto;box-shadow:0 20px 60px hsl(0deg 0% 0% / 50%);border:1px solid hsl(0deg 0% 100% / 12%)}
.bs-panel h2{margin:0 0 8px;font-size:24px;background:linear-gradient(90deg,var(--bs-a),var(--bs-b));-webkit-background-clip:text;background-clip:text;color:transparent}
.bs-panel p{margin:0 0 12px;font-size:14px;line-height:1.6;color:hsl(0deg 0% 85%)}
.bs-record{color:var(--bs-a);font-weight:700}
.bs-actions{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-top:20px}
.bs-btn{padding:10px 16px;font-size:13px;text-decoration:none;text-transform:uppercase;letter-spacing:.04em}
.bs-btn--primary{border:0;background:linear-gradient(90deg,var(--bs-a),var(--bs-b));color:#000;font-weight:700}
.bs-close:focus-visible,.bs-btn:focus-visible,.bs-bug:focus-visible{outline:2px solid var(--bs-a);outline-offset:2px}
@keyframes bs-fade{from{opacity:.9;scale:.6}to{opacity:0;scale:1.6}}
@keyframes bs-rise{from{opacity:1;translate:0 0}to{opacity:0;translate:0 -32px}}
@keyframes bs-pop{from{scale:0}to{scale:1}}
@media (prefers-reduced-motion:reduce){.bs-splat,.bs-plus{animation-duration:.01ms}.bs-bug{animation:none!important}}
`

let active: (() => void) | null = null

/**
 * Creates an element with an optional class and text content.
 * @param tag - Element tag name
 * @param className - CSS class list
 * @param text - Text content
 */
const make = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  text = '',
): HTMLElementTagNameMap[K] => {
  const el = document.createElement(tag)
  el.className = className
  el.textContent = text
  return el
}

/**
 * Reads the stored best score, tolerating blocked storage.
 */
const readBest = (): number => {
  try {
    return Number(localStorage.getItem(STORAGE_KEY)) || 0
  } catch {
    return 0
  }
}

/**
 * Persists the best score, ignoring blocked storage.
 * @param value - New best score
 */
const writeBest = (value: number) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(value))
  } catch {
    return
  }
}

/**
 * Picks a random spawn point just outside a random viewport edge,
 * heading roughly towards the opposite side.
 * @param w - Viewport width
 * @param h - Viewport height
 */
const edgeSpawn = (w: number, h: number) => {
  const side = Math.floor(Math.random() * 4)
  const rx = Math.random() * w
  const ry = Math.random() * h
  const points = [
    { x: rx, y: -EDGE_MARGIN },
    { x: w + EDGE_MARGIN, y: ry },
    { x: rx, y: h + EDGE_MARGIN },
    { x: -EDGE_MARGIN, y: ry },
  ]
  const start = points[side]
  const target = {
    x: w * (0.2 + Math.random() * 0.6),
    y: h * (0.2 + Math.random() * 0.6),
  }
  return { ...start, angle: Math.atan2(target.y - start.y, target.x - start.x) }
}

/**
 * Whether a point lies inside the viewport.
 * @param x - Horizontal position
 * @param y - Vertical position
 */
const inViewport = (x: number, y: number) =>
  x >= 0 && y >= 0 && x <= innerWidth - BUG_SIZE && y <= innerHeight - BUG_SIZE

/**
 * Moves a bug element to its current position and heading.
 * @param bug - Bug to render
 */
const place = (bug: Bug) => {
  const deg = (bug.angle * 180) / Math.PI + 90
  bug.el.style.transform = `translate(${bug.x}px, ${bug.y}px) rotate(${deg}deg)`
}

/**
 * Launches the bug squasher easter egg on top of the current page.
 * Does nothing when a round is already running.
 * @param locale - Active site locale
 */
export const startGame = (locale: Locale) => {
  if (active) return
  const t = i18n[locale]
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
  const previousFocus = document.activeElement as HTMLElement | null
  const host = make('div')
  const shadow = host.attachShadow({ mode: 'open' })
  const style = make('style', '', STYLES)
  const root = make('div', 'bs-root')
  root.toggleAttribute(
    'data-dark',
    document.documentElement.dataset.theme === 'dark',
  )
  const hud = make('div', 'bs-hud')
  const scoreEl = make('b', '', '0')
  const timeEl = make('b', '', String(ROUND_MS / 1000))
  const escapedEl = make('b', '', '0')
  const closeBtn = make('button', 'bs-close', '×')
  closeBtn.type = 'button'
  closeBtn.setAttribute('aria-label', t.close)
  hud.append(
    make('span', '', `${t.score} `),
    scoreEl,
    make('span', '', `${t.time} `),
    timeEl,
    make('span', '', `${t.escaped} `),
    escapedEl,
    closeBtn,
  )
  root.append(hud)
  shadow.append(style, root)
  document.body.append(host)

  let state: RoundState

  /**
   * Removes a bug from the field and the DOM.
   * @param bug - Bug to remove
   */
  const removeBug = (bug: Bug) => {
    state.bugs = state.bugs.filter((b) => b !== bug)
    bug.el.remove()
  }

  /**
   * Shows a short-lived effect element at a position.
   * @param className - Effect class
   * @param x - Horizontal position
   * @param y - Vertical position
   * @param text - Optional text
   */
  const effect = (className: string, x: number, y: number, text = '') => {
    const el = make('span', className, text)
    el.style.transform = `translate(${x}px, ${y}px)`
    root.append(el)
    el.addEventListener('animationend', () => el.remove())
  }

  /**
   * Squashes a bug and awards a point.
   * @param bug - Bug that was hit
   */
  const squash = (bug: Bug) => {
    if (state.over || !state.bugs.includes(bug)) return
    state.score += 1
    scoreEl.textContent = String(state.score)
    effect('bs-splat', bug.x, bug.y)
    effect('bs-plus', bug.x + BUG_SIZE / 2, bug.y, '+1')
    removeBug(bug)
  }

  /**
   * Counts a bug that slipped away.
   * @param bug - Bug that escaped
   */
  const escape = (bug: Bug) => {
    state.escaped += 1
    escapedEl.textContent = String(state.escaped)
    removeBug(bug)
  }

  /**
   * Adds a new bug, crawling in from an edge or popping up in place
   * when reduced motion is preferred.
   */
  const spawn = () => {
    const el = make('button', 'bs-bug')
    el.type = 'button'
    el.setAttribute('aria-label', t.bugLabel)
    el.innerHTML = BUG_SVG
    const spot = reducedMotion
      ? {
          x: Math.random() * (innerWidth - BUG_SIZE),
          y: 80 + Math.random() * (innerHeight - BUG_SIZE - 80),
          angle: Math.random() * Math.PI * 2,
        }
      : edgeSpawn(innerWidth, innerHeight)
    const bug: Bug = {
      el,
      ...spot,
      wobble: Math.random() * Math.PI * 2,
      entered: reducedMotion,
      bornAt: state.elapsed,
    }
    el.addEventListener('pointerdown', (event) => {
      event.preventDefault()
      squash(bug)
    })
    el.addEventListener('click', () => squash(bug))
    place(bug)
    root.append(el)
    state.bugs.push(bug)
  }

  /**
   * Advances one bug by the elapsed frame time.
   * @param bug - Bug to move
   * @param dt - Frame time in milliseconds
   * @param speed - Current speed in pixels per second
   */
  const crawl = (bug: Bug, dt: number, speed: number) => {
    bug.wobble += dt / 260
    bug.angle += Math.sin(bug.wobble) * 0.02
    bug.x += Math.cos(bug.angle) * speed * (dt / 1000)
    bug.y += Math.sin(bug.angle) * speed * (dt / 1000)
    const inside = inViewport(bug.x, bug.y)
    bug.entered ||= inside
    if (bug.entered && !inside) return escape(bug)
    place(bug)
  }

  /**
   * Updates bugs for one frame in either motion mode.
   * @param dt - Frame time in milliseconds
   * @param progress - Round progress from 0 to 1
   */
  const updateBugs = (dt: number, progress: number) => {
    const speed = 70 + 150 * progress
    for (const bug of state.bugs) {
      if (!reducedMotion) {
        crawl(bug, dt, speed)
        continue
      }
      if (state.elapsed - bug.bornAt > STATIC_BUG_MS - 600 * progress)
        escape(bug)
    }
  }

  /**
   * Main animation loop driven by requestAnimationFrame.
   * Frame time is clamped so a hidden tab effectively pauses the round.
   * @param now - High resolution timestamp
   */
  const tick = (now: number) => {
    if (state.over) return
    const dt = Math.min(now - state.lastFrame, 50)
    state.lastFrame = now
    state.elapsed += dt
    state.sinceSpawn += dt
    const progress = Math.min(state.elapsed / ROUND_MS, 1)
    const interval = 900 - 550 * progress
    if (state.sinceSpawn >= interval) {
      state.sinceSpawn = 0
      spawn()
    }
    updateBugs(dt, progress)
    timeEl.textContent = String(Math.ceil((ROUND_MS - state.elapsed) / 1000))
    if (state.elapsed >= ROUND_MS) return finish()
    state.frame = requestAnimationFrame(tick)
  }

  /**
   * Builds the end-of-round panel with result, record and calls to action.
   * @param isRecord - Whether this round set a new best score
   * @param best - Best score after this round
   */
  const showPanel = (isRecord: boolean, best: number) => {
    const panel = make('div', 'bs-panel')
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-modal', 'false')
    panel.setAttribute('aria-label', t.gameOver)
    const result = t.result
      .replace('{score}', String(state.score))
      .replace('{escaped}', String(state.escaped))
    const record = isRecord
      ? make('p', 'bs-record', t.newRecord)
      : make('p', '', `${t.best}: ${best}`)
    const actions = make('div', 'bs-actions')
    const contact = make('a', 'bs-btn bs-btn--primary', t.contact)
    contact.href = localizePath('/#contact', locale)
    contact.addEventListener('click', () => close())
    const again = make('button', 'bs-btn', t.playAgain)
    again.type = 'button'
    again.addEventListener('click', () => {
      panel.remove()
      begin()
    })
    const dismiss = make('button', 'bs-btn', t.dismiss)
    dismiss.type = 'button'
    dismiss.addEventListener('click', () => close())
    actions.append(contact, again, dismiss)
    panel.append(
      make('h2', '', t.gameOver),
      make('p', '', result),
      record,
      make('p', '', t.cta),
      actions,
    )
    root.append(panel)
    contact.focus()
  }

  /**
   * Ends the round, stores a new record and shows the result.
   */
  const finish = () => {
    state.over = true
    cancelAnimationFrame(state.frame)
    for (const bug of state.bugs) removeBug(bug)
    timeEl.textContent = '0'
    const best = readBest()
    const isRecord = state.score > best
    if (isRecord) writeBest(state.score)
    showPanel(isRecord, Math.max(best, state.score))
  }

  /**
   * Starts a fresh round.
   */
  const begin = () => {
    state = {
      bugs: [],
      score: 0,
      escaped: 0,
      elapsed: 0,
      sinceSpawn: 900,
      lastFrame: performance.now(),
      frame: 0,
      over: false,
    }
    scoreEl.textContent = '0'
    escapedEl.textContent = '0'
    state.frame = requestAnimationFrame(tick)
  }

  /**
   * Closes the game on Escape.
   * @param event - Keyboard event
   */
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') close()
  }

  /**
   * Tears the game down and restores focus.
   */
  const close = () => {
    state.over = true
    cancelAnimationFrame(state.frame)
    removeEventListener('keydown', onKey)
    host.remove()
    active = null
    previousFocus?.focus?.()
  }

  closeBtn.addEventListener('click', close)
  addEventListener('keydown', onKey)
  active = close
  begin()
}
