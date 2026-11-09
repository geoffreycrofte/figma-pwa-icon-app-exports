/**
 * "In context" previews: each template shown where it will really live.
 * Every icon is an instance of the template, so previews update live.
 */
import type { CanvasText } from '../../shared/guides.ts'
import type { Preset, PresetId } from '../../shared/presets.ts'
import { browserMockup } from './browser.ts'
import { iconView, type IconShape } from './icon.ts'
import { PHONE, phoneMockup } from './phone.ts'
import { appendFill, box, place, solid, stack, text, type Fonts } from './primitives.ts'

export type TemplateComponents = Readonly<Record<PresetId, ComponentNode>>

/** Text drawn directly on the section (fill: SECTION_FILL): white, 9.7:1. */
const ON_SECTION = '#ffffff'
const MASKS: readonly Exclude<IconShape, 'square' | 'ios'>[] = ['circle', 'squircle', 'rounded', 'teardrop']
const MASK_SIZE = 72

interface Context {
  readonly fonts: Fonts
  readonly components: TemplateComponents
  readonly t: CanvasText
  readonly width: number
}

function standardMockup({ fonts, components, t, width }: Context): FrameNode {
  const area = box('Mockup', width, PHONE.height)
  const phone = phoneMockup(fonts, {
    platform: 'android',
    appName: t.appName,
    time: t.time,
    // Android's fallback for non-maskable icons: shrunk into a white disc.
    userIcon: (size) => iconView(components.standard, size, 'circle', { inset: 0.7, background: [solid('#ffffff')] }),
  })
  place(area, phone, (width - PHONE.width) / 2, 0)
  return area
}

function maskableMockup({ fonts, components, t, width }: Context): FrameNode {
  const area = box('Mockup', width, PHONE.height)
  const phone = phoneMockup(fonts, {
    platform: 'android',
    appName: t.appName,
    time: t.time,
    inDock: true,
    userIcon: (size) => iconView(components.maskable, size, 'circle'),
  })
  place(area, phone, 0, 0)

  const columnX = PHONE.width + 24
  const columnWidth = width - columnX
  const step = PHONE.height / MASKS.length
  MASKS.forEach((shape, index) => {
    const y = index * step + (step - MASK_SIZE - 28) / 2
    place(area, iconView(components.maskable, MASK_SIZE, shape), columnX + (columnWidth - MASK_SIZE) / 2, y)
    const label = text(t.masks[shape], { font: fonts.medium, size: 13, color: ON_SECTION, align: 'CENTER', width: columnWidth })
    place(area, label, columnX, y + MASK_SIZE + 10)
  })
  return area
}

function appleMockup({ fonts, components, t, width }: Context): FrameNode {
  const area = box('Mockup', width, PHONE.height)
  const phone = phoneMockup(fonts, {
    platform: 'ios',
    appName: t.appName,
    time: t.time,
    // iOS fills transparent pixels with black.
    userIcon: (size) => iconView(components.apple, size, 'ios', { background: [solid('#000000')] }),
  })
  place(area, phone, (width - PHONE.width) / 2, 0)
  return area
}

function faviconMockup({ fonts, components, t, width }: Context): FrameNode {
  const area = stack('Mockup', { width, gap: 10 })
  for (const theme of ['light', 'dark'] as const) {
    appendFill(area, text(theme === 'light' ? t.themeLight : t.themeDark, { font: fonts.medium, size: 13, color: ON_SECTION }))
    const browser = browserMockup(fonts, components.favicon, { theme, title: t.appName, url: t.url, newTab: t.newTab })
    area.appendChild(browser)
  }
  return area
}

const MOCKUPS: Readonly<Record<PresetId, (context: Context) => FrameNode>> = {
  standard: standardMockup,
  maskable: maskableMockup,
  apple: appleMockup,
  favicon: faviconMockup,
}

export function previewBlock(
  fonts: Fonts,
  preset: Preset,
  components: TemplateComponents,
  t: CanvasText,
  width: number,
): FrameNode {
  const guide = t.guides[preset.id]
  const block = stack(`Preview · ${preset.templateName}`, { width, gap: 16 })
  appendFill(block, text(guide.previewTitle, { font: fonts.semibold, size: 20, color: ON_SECTION }))
  block.appendChild(MOCKUPS[preset.id]({ fonts, components, t, width }))
  appendFill(block, text(guide.previewCaption, { font: fonts.regular, size: 14, color: ON_SECTION, lineHeight: 150 }))
  return block
}
