import { isLoglensHost } from './host'

/**
 * Animated tab icon (favicon), drawn to an offscreen <canvas> and pushed to the
 * <link rel="icon"> as a PNG data-URL each frame.
 *
 * Browsers don't animate SVG or (reliably) GIF favicons, so repainting a canvas
 * is the only portable way. Chrome/Firefox/Edge animate; Safari ignores the
 * rapid swaps and shows whichever frame it last read — which is why the
 * reduced-motion path paints a single clean, legible pose.
 *
 *  - portfolio (apex): an orange line-figure sprinting (forward lean, full
 *    arm/leg swing) with the "SV" monogram as its head, on a cream tile.
 *  - loglens (subdomain): the green prompt tile with a log line sweeping past
 *    the "›" cursor.
 *
 * Honours prefers-reduced-motion (one static frame, no loop) and pauses while
 * the tab is hidden, so it never spins the CPU in the background.
 */

const SIZE = 64 // drawn crisp; the browser downscales to the 16/32px tab slot
const FPS = 20
const TAU = Math.PI * 2

function line(c: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  c.beginPath()
  c.moveTo(x1, y1)
  c.lineTo(x2, y2)
  c.stroke()
}

/** Rounded-square tile filling the icon (matches the static SVG favicons). */
function tile(c: CanvasRenderingContext2D, color: string) {
  const s = SIZE
  const r = 13
  c.beginPath()
  c.moveTo(r, 0)
  c.arcTo(s, 0, s, s, r)
  c.arcTo(s, s, 0, s, r)
  c.arcTo(0, s, 0, 0, r)
  c.arcTo(0, 0, s, 0, r)
  c.closePath()
  c.fillStyle = color
  c.fill()
}

/** Portfolio: SV-headed figure sprinting — lean + big swing. */
function drawRunner(c: CanvasRenderingContext2D, t: number) {
  tile(c, '#eeefe4')
  const ph = t * TAU
  const bob = -Math.abs(Math.sin(ph)) * 2
  const cx = 32
  const lean = 5
  const shoulderY = 26 + bob
  const hipY = 40 + bob
  const headY = 17 + bob
  const legA = Math.sin(ph) * 0.85
  const armA = -Math.sin(ph) * 0.7
  const legLen = 13
  const armLen = 9
  const shX = cx + lean * 0.6
  const hdX = cx + lean

  c.strokeStyle = '#f54e00'
  c.fillStyle = '#f54e00'
  c.lineWidth = 3
  c.lineCap = 'round'
  c.lineJoin = 'round'

  // torso (leaning forward), legs and arms swinging in opposition
  line(c, shX, shoulderY, cx, hipY)
  line(c, cx, hipY, cx + Math.sin(legA) * legLen, hipY + Math.cos(legA) * legLen)
  line(c, cx, hipY, cx - Math.sin(legA) * legLen, hipY + Math.cos(legA) * legLen)
  const ay = shoulderY + 2
  line(c, shX, ay, shX + Math.sin(armA) * armLen, ay + Math.cos(armA) * armLen * 0.9)
  line(c, shX, ay, shX - Math.sin(armA) * armLen, ay + Math.cos(armA) * armLen * 0.9)

  // head = "SV" monogram
  c.font = '800 12px Inter, system-ui, sans-serif'
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillText('SV', hdX, headY)
}

/** loglens: a log line sweeping down past the "›" prompt. */
function drawScan(c: CanvasRenderingContext2D, t: number) {
  tile(c, '#2f9e57')
  c.fillStyle = '#fff'
  c.textAlign = 'left'
  c.textBaseline = 'alphabetic'
  c.font = '800 30px Inter, system-ui, sans-serif'
  c.fillText('›', 14, 42)
  const y = 14 + t * 38
  c.strokeStyle = 'rgba(255,255,255,0.75)'
  c.lineWidth = 2.4
  c.lineCap = 'round'
  line(c, 33, y, 52, y)
}

export function initAnimatedFavicon() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Reuse the existing <link rel="icon"> (a static SVG data-URI in the HTML);
  // swap it to the PNG we repaint. Falls back to creating one if absent.
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.type = 'image/png'

  const loglens = isLoglensHost
  const draw = loglens ? drawScan : drawRunner
  const cycleMs = loglens ? 1400 : 620
  const staticT = loglens ? 0.5 : 0.12 // a poised, legible frame for the static case

  const paint = (t: number) => {
    draw(ctx, t)
    link!.href = canvas.toDataURL('image/png')
  }

  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    paint(staticT)
    return
  }

  let raf = 0
  let start = 0
  let lastFrame = -1
  const frameDur = 1000 / FPS
  const loop = (now: number) => {
    if (!start) start = now
    const elapsed = now - start
    const idx = Math.floor(elapsed / frameDur)
    if (idx !== lastFrame) {
      lastFrame = idx
      paint((elapsed % cycleMs) / cycleMs)
    }
    raf = requestAnimationFrame(loop)
  }
  const startLoop = () => {
    if (!raf) {
      start = 0
      lastFrame = -1
      raf = requestAnimationFrame(loop)
    }
  }
  const stopLoop = () => {
    if (raf) {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop()
    else startLoop()
  })
  startLoop()
}
