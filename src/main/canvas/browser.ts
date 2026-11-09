/**
 * A generic browser window (no real browser's branding) showing the favicon
 * in the active tab, in a light or dark theme.
 */
import { iconView } from './icon.ts'
import { box, place, solid, text, type Fonts } from './primitives.ts'

export const BROWSER = { width: 512, height: 150 } as const

const THEMES = {
  light: { strip: '#dee1e6', tab: '#ffffff', field: '#f1f3f4', text: '#1f1f1f', muted: '#5f6368', page: '#ffffff', bar: '#e8eaed' },
  dark: { strip: '#1f1f1f', tab: '#3c3c3c', field: '#282828', text: '#e8eaed', muted: '#9aa0a6', page: '#2b2b2b', bar: '#444444' },
} as const

export interface BrowserOptions {
  readonly theme: keyof typeof THEMES
  readonly title: string
  readonly url: string
  readonly newTab: string
}

export function browserMockup(fonts: Fonts, favicon: ComponentNode, options: BrowserOptions): FrameNode {
  const c = THEMES[options.theme]
  const window = box(`Browser · ${options.theme}`, BROWSER.width, BROWSER.height, {
    fills: [solid(c.page)],
    radius: 12,
    clip: true,
  })
  window.strokes = [solid('#000000', 0.15)]
  window.strokeWeight = 1

  // Tab strip
  place(window, box('Tab strip', BROWSER.width, 42, { fills: [solid(c.strip)] }), 0, 0)

  const active = place(window, box('Active tab', 210, 34, { fills: [solid(c.tab)] }), 10, 8)
  active.topLeftRadius = active.topRightRadius = 10
  place(active, iconView(favicon, 16, 'square'), 12, 9)
  place(active, text(options.title, { font: fonts.medium, size: 12, color: c.text }), 36, 9)
  place(active, text('×', { font: fonts.regular, size: 14, color: c.muted }), 190, 7)

  const inactive = place(window, box('Tab', 160, 34), 224, 8)
  place(inactive, box('Favicon', 16, 16, { fills: [solid(c.muted, 0.5)], radius: 8 }), 12, 9)
  place(inactive, text(options.newTab, { font: fonts.regular, size: 12, color: c.muted }), 36, 9)

  // Toolbar with address field
  place(window, box('Toolbar', BROWSER.width, 42, { fills: [solid(c.tab)] }), 0, 42)
  const field = place(window, box('Address', BROWSER.width - 24, 28, { fills: [solid(c.field)], radius: 14 }), 12, 49)
  place(field, text(options.url, { font: fonts.regular, size: 12, color: c.text }), 16, 6)

  // Page placeholder
  place(window, box('Heading', 180, 12, { fills: [solid(c.bar)], radius: 6 }), 24, 102)
  place(window, box('Line', 300, 8, { fills: [solid(c.bar)], radius: 4 }), 24, 124)

  return window
}
