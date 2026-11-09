/**
 * A generic smartphone home screen (no real device or brand), with the user's
 * icon among placeholder apps.
 */
import { placeholderIcon, type IconShape } from './icon.ts'
import { box, place, solid, text, verticalGradient, type Fonts } from './primitives.ts'

export const PHONE = { width: 300, height: 600 } as const

const BEZEL = 8
const SCREEN = { width: PHONE.width - 2 * BEZEL, height: PHONE.height - 2 * BEZEL }
const ICON = 52
const COLUMNS = 4
const ROWS = 4
const MARGIN_X = 20
const GAP_X = (SCREEN.width - 2 * MARGIN_X - COLUMNS * ICON) / (COLUMNS - 1)
const GRID_TOP = 64
const ROW_HEIGHT = 90

export interface PhoneOptions {
  readonly platform: 'android' | 'ios'
  readonly appName: string
  readonly time: string
  /** Builds the user's icon at the requested size. */
  readonly userIcon: (size: number) => FrameNode
  /** Also put the user's icon in the dock. */
  readonly inDock?: boolean
}

const WALLPAPER = {
  android: ['#1b4d6b', '#3a8f8a'],
  ios: ['#3b2a6b', '#c0577a'],
} as const

function appLabel(screen: FrameNode, x: number, y: number): void {
  const bar = box('Label', 30, 6, { fills: [solid('#ffffff', 0.55)], radius: 3 })
  place(screen, bar, x + (ICON - 30) / 2, y + ICON + 9)
}

export function phoneMockup(fonts: Fonts, options: PhoneOptions): FrameNode {
  const { platform } = options
  const shape: IconShape = platform === 'ios' ? 'ios' : 'circle'
  const placeholderFill = [solid('#ffffff', 0.28)]

  const phone = box(platform === 'ios' ? 'Phone · iOS' : 'Phone · Android', PHONE.width, PHONE.height, {
    fills: [solid('#111111')],
    radius: 46,
  })
  const [from, to] = WALLPAPER[platform]
  const screen = place(
    phone,
    box('Screen', SCREEN.width, SCREEN.height, { fills: [verticalGradient(from, to)], radius: 38, clip: true }),
    BEZEL,
    BEZEL,
  )

  // Status bar
  place(screen, text(options.time, { font: fonts.semibold, size: 13, color: '#ffffff' }), 26, 14)
  if (platform === 'ios') {
    place(screen, box('Island', 90, 26, { fills: [solid('#000000')], radius: 13 }), (SCREEN.width - 90) / 2, 10)
  } else {
    place(screen, box('Camera', 12, 12, { fills: [solid('#000000')], radius: 6 }), (SCREEN.width - 12) / 2, 16)
  }

  // App grid: the user's icon is the second app of the first row.
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLUMNS; col++) {
      const x = MARGIN_X + col * (ICON + GAP_X)
      const y = GRID_TOP + row * ROW_HEIGHT
      if (row === 0 && col === 1) {
        place(screen, options.userIcon(ICON), x, y)
        const label = text(options.appName, { font: fonts.medium, size: 11, color: '#ffffff', align: 'CENTER', width: 76 })
        place(screen, label, x + (ICON - 76) / 2, y + ICON + 5)
      } else {
        place(screen, placeholderIcon(ICON, shape, placeholderFill), x, y)
        appLabel(screen, x, y)
      }
    }
  }

  // Dock
  const dockY = SCREEN.height - 104
  place(screen, box('Dock', SCREEN.width - 24, 76, { fills: [solid('#ffffff', 0.2)], radius: 32 }), 12, dockY)
  for (let col = 0; col < COLUMNS; col++) {
    const x = MARGIN_X + col * (ICON + GAP_X)
    const icon = options.inDock && col === 0 ? options.userIcon(ICON) : placeholderIcon(ICON, shape, placeholderFill)
    place(screen, icon, x, dockY + 12)
  }

  // Home indicator / navigation handle
  place(screen, box('Home indicator', 110, 5, { fills: [solid('#ffffff', 0.8)], radius: 3 }), (SCREEN.width - 110) / 2, SCREEN.height - 14)

  return phone
}
