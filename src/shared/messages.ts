/**
 * Message protocol between the plugin sandbox (main) and the UI iframe.
 * Both sides import these types; never post an untyped object.
 */
import { isLang, type Lang } from './i18n.ts'
import { isPresetId, type PresetId } from './presets.ts'

export interface SelectionSummary {
  /** Selected layers that can hold export settings. */
  readonly eligible: number
  /** Selected layers that cannot (sections, pages…). */
  readonly ineligible: number
  /** Eligible layers whose width differs from their height. */
  readonly nonSquare: number
}

export interface ApplyReport extends SelectionSummary {
  /** Layers whose export settings were written. */
  readonly updated: number
  /** Layers Figma refused to update. */
  readonly failed: number
  /** New export settings created across all layers. */
  readonly added: number
}

export type UiToMain =
  /** UI loaded; `lang` is the system language, used when nothing is saved. */
  | { readonly type: 'ready'; readonly lang: Lang }
  /** UI translated and measured: it can be shown. */
  | { readonly type: 'rendered' }
  | { readonly type: 'set-lang'; readonly lang: Lang }
  | { readonly type: 'generate-templates' }
  | { readonly type: 'resize'; readonly height: number }
  | { readonly type: 'apply-presets'; readonly presets: readonly PresetId[] }

export type MainToUi =
  | { readonly type: 'init'; readonly lang: Lang }
  | { readonly type: 'selection'; readonly summary: SelectionSummary }
  | { readonly type: 'templates-done'; readonly count: number }
  | { readonly type: 'apply-done'; readonly report: ApplyReport }
  | { readonly type: 'error'; readonly message: string }

/**
 * Messages cross a trust boundary (postMessage): validate their shape rather
 * than trusting the static type.
 */
export function parseUiMessage(data: unknown): UiToMain | null {
  if (typeof data !== 'object' || data === null) return null
  const msg = data as Record<string, unknown>
  switch (msg.type) {
    case 'ready':
      return { type: 'ready', lang: isLang(msg.lang) ? msg.lang : 'en' }
    case 'rendered':
      return { type: 'rendered' }
    case 'set-lang':
      return isLang(msg.lang) ? { type: 'set-lang', lang: msg.lang } : null
    case 'generate-templates':
      return { type: 'generate-templates' }
    case 'resize':
      return typeof msg.height === 'number' && Number.isFinite(msg.height)
        ? { type: 'resize', height: msg.height }
        : null
    case 'apply-presets': {
      if (!Array.isArray(msg.presets) || !msg.presets.every(isPresetId)) return null
      return { type: 'apply-presets', presets: [...new Set(msg.presets as PresetId[])] }
    }
    default:
      return null
  }
}
