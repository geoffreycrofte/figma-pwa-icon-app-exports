/**
 * Single source of truth for every icon preset the plugin knows about.
 * Pure module: no access to the `figma` global, so it can be unit-tested in Node
 * and imported by both the plugin sandbox and the UI.
 */

export type PresetId = 'standard' | 'maskable' | 'apple' | 'favicon'

export interface Preset {
  readonly id: PresetId
  /** Exported PNG widths, in pixels. Icons are square, so width = height. */
  readonly sizes: readonly number[]
  /** Also export an SVG (with no suffix), e.g. `favicon.svg`. */
  readonly svg: boolean
  /**
   * Layer name of the generated template. Figma prefixes every exported file
   * with the layer name, so this drives the final file names
   * (`icon-maskable` + `-192x192` → `icon-maskable-192x192.png`).
   */
  readonly templateName: string
  /** The template frame has a transparent background (favicons). */
  readonly transparent: boolean
  /** The template shows the maskable safe zone as a layout grid. */
  readonly safeZone: boolean
}

/** Side of the template frames, in pixels. */
export const TEMPLATE_SIZE = 512

/**
 * Maskable icons: the safe zone is a centred circle whose diameter is 80 % of the
 * icon. The template shows the 80 % square that contains it.
 * @see https://www.w3.org/TR/appmanifest/#icon-masks
 */
export const MASKABLE_SAFE_ZONE_RATIO = 0.8

export const PRESETS: readonly Preset[] = [
  {
    id: 'standard',
    // Same 10 sizes as v1 so existing users get the same files.
    sizes: [72, 96, 120, 128, 144, 152, 180, 192, 384, 512],
    svg: false,
    templateName: 'icon',
    transparent: false,
    safeZone: false,
  },
  {
    id: 'maskable',
    sizes: [192, 512],
    svg: false,
    templateName: 'icon-maskable',
    transparent: false,
    safeZone: true,
  },
  {
    id: 'apple',
    // iPad, iPad Pro, iPhone. iOS ignores transparency: keep the background opaque.
    sizes: [152, 167, 180],
    svg: false,
    templateName: 'apple-touch-icon',
    transparent: false,
    safeZone: false,
  },
  {
    id: 'favicon',
    sizes: [16, 32, 48],
    svg: true,
    templateName: 'favicon',
    transparent: true,
    safeZone: false,
  },
]

export const PRESET_IDS: readonly PresetId[] = PRESETS.map((p) => p.id)

/** Presets checked by default in the UI. */
export const DEFAULT_PRESET_IDS: readonly PresetId[] = ['standard']

export function isPresetId(value: unknown): value is PresetId {
  return typeof value === 'string' && (PRESET_IDS as readonly string[]).includes(value)
}

export function getPreset(id: PresetId): Preset {
  const preset = PRESETS.find((p) => p.id === id)
  if (!preset) throw new Error(`Unknown preset: ${id}`)
  return preset
}

/** Web icons are always delivered in sRGB, whatever the document colour profile. */
const COLOR_PROFILE = 'SRGB' as const

export function exportSettingsFor(id: PresetId): ExportSettings[] {
  const preset = getPreset(id)
  const settings: ExportSettings[] = preset.sizes.map((size) => ({
    format: 'PNG',
    suffix: `-${size}x${size}`,
    constraint: { type: 'WIDTH', value: size },
    colorProfile: COLOR_PROFILE,
  }))
  if (preset.svg) settings.push({ format: 'SVG', suffix: '', colorProfile: COLOR_PROFILE })
  return settings
}

/** Export settings of several presets, without duplicates. */
export function exportSettingsForMany(ids: readonly PresetId[]): ExportSettings[] {
  const byKey = new Map<string, ExportSettings>()
  for (const id of ids) {
    for (const setting of exportSettingsFor(id)) byKey.set(exportKey(setting), setting)
  }
  return [...byKey.values()]
}

/**
 * Two export settings with the same key produce the same image, so they must not
 * both exist on a node. Raster exports are identified by their format and size
 * (which also recognises the v1 `-192` suffixes); others by format and suffix.
 */
export function exportKey(setting: ExportSettings): string {
  if (setting.format === 'PNG' || setting.format === 'JPG') {
    const c = setting.constraint ?? { type: 'SCALE', value: 1 }
    return `${setting.format}|${c.type}|${c.value}`
  }
  return `${setting.format}|${setting.suffix ?? ''}`
}

export interface MergeResult {
  readonly settings: ExportSettings[]
  /** Incoming settings that did not exist on the node. */
  readonly added: number
}

/**
 * Keeps the node's own export settings and adds the incoming ones. An existing
 * setting producing the same image as an incoming one is replaced by it.
 */
export function mergeExportSettings(
  existing: readonly ExportSettings[],
  incoming: readonly ExportSettings[],
): MergeResult {
  const incomingKeys = new Set(incoming.map(exportKey))
  const existingKeys = new Set(existing.map(exportKey))
  const kept = existing.filter((s) => !incomingKeys.has(exportKey(s)))
  const added = incoming.filter((s) => !existingKeys.has(exportKey(s))).length
  return { settings: [...kept, ...incoming], added }
}
