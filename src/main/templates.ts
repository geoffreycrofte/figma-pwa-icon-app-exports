/**
 * "Generate templates": one column per preset, in a section placed next to the
 * existing content of the page:
 *   1. a guide card (what it is, how to draw it, how to use the files),
 *   2. the template itself: a component with its export settings,
 *   3. an in-context preview made of live instances of that component.
 */
import { CANVAS_TEXT } from '../shared/guides.ts'
import type { Lang } from '../shared/i18n.ts'
import {
  exportSettingsFor,
  MASKABLE_SAFE_ZONE_RATIO,
  PRESETS,
  TEMPLATE_SIZE,
  type Preset,
} from '../shared/presets.ts'
import { guideCard } from './canvas/guide-card.ts'
import { previewBlock, type TemplateComponents } from './canvas/previews.ts'
import { loadFonts, place, solid } from './canvas/primitives.ts'

const PADDING = 120
const COLUMN_GAP = 160
const ROW_GAP = 72
/** Distance between the new section and existing content. */
const PAGE_GAP = 400
/**
 * Explicit section background, so the white preview texts stay readable
 * whatever Figma's theme (sections are otherwise light in the light theme).
 */
const SECTION_FILL = '#444444'
const SAFE_ZONE_COLOR: RGBA = { r: 1, g: 0, b: 0.4, a: 0.12 }

/** Layout grids are visible while drawing but never exported. */
function safeZoneGrids(): LayoutGrid[] {
  const sectionSize = TEMPLATE_SIZE * MASKABLE_SAFE_ZONE_RATIO
  return (['COLUMNS', 'ROWS'] as const).map((pattern) => ({
    pattern,
    alignment: 'CENTER',
    count: 1,
    gutterSize: 0,
    sectionSize,
    visible: true,
    color: SAFE_ZONE_COLOR,
  }))
}

function createTemplate(preset: Preset, description: string): ComponentNode {
  const component = figma.createComponent()
  component.name = preset.templateName
  component.description = description
  component.resize(TEMPLATE_SIZE, TEMPLATE_SIZE)
  component.fills = preset.transparent ? [] : [solid('#ffffff')]
  component.clipsContent = true
  if (preset.safeZone) component.layoutGrids = safeZoneGrids()
  component.exportSettings = exportSettingsFor(preset.id)
  return component
}

/** Top-left corner for the new section: right of everything on the page. */
function freeSpot(): Vector {
  const nodes = figma.currentPage.children
  if (nodes.length === 0) return figma.viewport.center
  let right = -Infinity
  let top = Infinity
  for (const node of nodes) {
    right = Math.max(right, node.x + node.width)
    top = Math.min(top, node.y)
  }
  return { x: right + PAGE_GAP, y: top }
}

export async function generateTemplates(lang: Lang, sectionName: string): Promise<ComponentNode[]> {
  const fonts = await loadFonts()
  const t = CANVAS_TEXT[lang]
  const origin = freeSpot()

  const section = figma.createSection()
  section.name = sectionName
  section.fills = [solid(SECTION_FILL)]

  const components = PRESETS.map((preset) => {
    const component = createTemplate(preset, t.guides[preset.id].intro)
    section.appendChild(component)
    return component
  })
  const componentsById = Object.fromEntries(PRESETS.map((p, i) => [p.id, components[i]])) as TemplateComponents

  const guides = PRESETS.map((preset) =>
    place(section, guideCard(fonts, preset, t.guides[preset.id], t, TEMPLATE_SIZE), 0, 0),
  )
  const previews = PRESETS.map((preset) =>
    place(section, previewBlock(fonts, preset, componentsById, t, TEMPLATE_SIZE), 0, 0),
  )

  // Rows are aligned across columns: guides, then templates, then previews.
  const guideHeight = Math.max(...guides.map((g) => g.height))
  const previewHeight = Math.max(...previews.map((p) => p.height))
  const templateY = PADDING + guideHeight + ROW_GAP
  const previewY = templateY + TEMPLATE_SIZE + ROW_GAP

  PRESETS.forEach((_, index) => {
    const x = PADDING + index * (TEMPLATE_SIZE + COLUMN_GAP)
    const guide = guides[index]
    const component = components[index]
    const preview = previews[index]
    if (!guide || !component || !preview) return
    guide.x = x
    guide.y = PADDING
    component.x = x
    component.y = templateY
    preview.x = x
    preview.y = previewY
  })

  const width = 2 * PADDING + PRESETS.length * TEMPLATE_SIZE + (PRESETS.length - 1) * COLUMN_GAP
  const height = previewY + previewHeight + PADDING
  section.resizeWithoutConstraints(width, height)
  section.x = Math.round(origin.x)
  section.y = Math.round(origin.y)

  figma.currentPage.selection = components
  figma.viewport.scrollAndZoomIntoView([section])
  return components
}
