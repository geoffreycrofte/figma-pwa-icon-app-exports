/**
 * Plugin entry point (Figma sandbox).
 * - "Open…" shows the UI.
 * - "Quick apply: …" menu commands apply one preset to the selection without UI,
 *   so "Run last plugin" re-applies it instantly.
 */
import { STRINGS, type Lang, type Strings } from '../shared/i18n.ts'
import { parseUiMessage, type MainToUi } from '../shared/messages.ts'
import { isPresetId, type PresetId } from '../shared/presets.ts'
import { applyPresets } from './apply.ts'
import { summarizeSelection } from './selection.ts'
import { readLangPreference, saveLangPreference } from './lang-preference.ts'
import { generateTemplates } from './templates.ts'

const QUICK_APPLY_PREFIX = 'apply:'
/** The window height follows the UI content, within these bounds. */
const UI_WIDTH = 360
const UI_MIN_HEIGHT = 160
const UI_MAX_HEIGHT = 800

/**
 * Saved choice, else the system language (only the UI can read it).
 * English until one of them is known.
 */
let lang: Lang = 'en'
const t = (): Strings => STRINGS[lang]

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

async function runQuickApply(presetId: PresetId): Promise<void> {
  lang = (await readLangPreference()) ?? lang
  const report = applyPresets(figma.currentPage.selection, [presetId])
  const message =
    report.eligible === 0
      ? t().noSelectionError
      : [t().applyDone(report), t().nonSquareWarning(report.nonSquare)].filter(Boolean).join(' ')
  figma.closePlugin(message)
}

function openUi(): void {
  // Started now, read while the UI loads.
  const savedLang = readLangPreference()

  // Hidden until the UI is translated and measured, to avoid a visible jump.
  figma.showUI(__html__, { width: UI_WIDTH, height: 400, title: t().appTitle, themeColors: true, visible: false })

  const post = (message: MainToUi): void => figma.ui.postMessage(message)
  const postSelection = (): void =>
    post({ type: 'selection', summary: summarizeSelection(figma.currentPage.selection) })

  figma.on('selectionchange', postSelection)
  figma.on('currentpagechange', postSelection)

  figma.ui.onmessage = async (raw: unknown) => {
    const message = parseUiMessage(raw)
    if (!message) return
    try {
      switch (message.type) {
        case 'ready':
          lang = (await savedLang) ?? message.lang
          post({ type: 'init', lang })
          postSelection()
          break
        case 'rendered':
          figma.ui.show()
          break
        case 'set-lang':
          lang = message.lang
          // The UI has already switched; only persistence can fail.
          saveLangPreference(lang).catch(() => post({ type: 'error', message: t().langSaveError }))
          break
        case 'resize': {
          const height = Math.min(UI_MAX_HEIGHT, Math.max(UI_MIN_HEIGHT, Math.ceil(message.height)))
          figma.ui.resize(UI_WIDTH, height)
          break
        }
        case 'generate-templates': {
          const templates = await generateTemplates(lang, t().templatesSectionName)
          figma.commitUndo()
          post({ type: 'templates-done', count: templates.length })
          break
        }
        case 'apply-presets': {
          const report = applyPresets(figma.currentPage.selection, message.presets)
          if (report.eligible === 0) {
            post({ type: 'error', message: t().noSelectionError })
            break
          }
          figma.commitUndo()
          post({ type: 'apply-done', report })
          break
        }
      }
    } catch (error) {
      post({ type: 'error', message: t().unexpectedError(errorMessage(error)) })
    }
  }
}

try {
  const command = figma.command
  const presetId = command.startsWith(QUICK_APPLY_PREFIX) ? command.slice(QUICK_APPLY_PREFIX.length) : null
  if (isPresetId(presetId)) {
    runQuickApply(presetId).catch((error) => figma.closePlugin(t().unexpectedError(errorMessage(error))))
  } else {
    openUi()
  }
} catch (error) {
  figma.closePlugin(t().unexpectedError(errorMessage(error)))
}
