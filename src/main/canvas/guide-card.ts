import type { CanvasText, Guide } from '../../shared/guides.ts'
import type { Preset } from '../../shared/presets.ts'
import { appendFill, solid, stack, text, type Fonts } from './primitives.ts'

const TEXT = '#1e1e1e'
const MUTED = '#555555'

/** Explains what the template is for, how to draw it and how to use the files. */
export function guideCard(fonts: Fonts, preset: Preset, guide: Guide, labels: CanvasText, width: number): FrameNode {
  const card = stack(`Guide · ${preset.templateName}`, {
    width,
    gap: 14,
    padding: 32,
    fills: [solid('#f5f5f7')],
    radius: 24,
  })

  appendFill(card, text(preset.templateName, { font: fonts.mono, size: 13, color: MUTED }))
  appendFill(card, text(guide.title, { font: fonts.semibold, size: 28, color: TEXT }))
  appendFill(card, text(guide.intro, { font: fonts.regular, size: 16, color: TEXT, lineHeight: 150 }))
  appendFill(
    card,
    text(guide.tips.map((tip) => `•  ${tip}`).join('\n'), {
      font: fonts.regular,
      size: 15,
      color: TEXT,
      lineHeight: 160,
    }),
  )

  const sizes = `${preset.sizes.join(', ')} px${preset.svg ? ' + SVG' : ''}`
  appendFill(card, text(`${labels.sizesLabel} ${sizes}`, { font: fonts.medium, size: 13, color: MUTED }))

  appendFill(card, text(labels.codeLabel, { font: fonts.medium, size: 13, color: MUTED }))
  const code = stack('Code', { padding: 16, fills: [solid('#1e1e1e')], radius: 12 })
  appendFill(card, code)
  appendFill(code, text(guide.code, { font: fonts.mono, size: 12, color: '#f5f5f5', lineHeight: 150 }))

  return card
}
