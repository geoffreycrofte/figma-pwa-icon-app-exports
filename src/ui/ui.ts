/**
 * Plugin UI (iframe). Text is always inserted with `textContent`, never as HTML.
 */
import { detectLang, isLang, STRINGS, type Lang, type Strings } from '../shared/i18n.ts'
import type { ApplyReport, MainToUi, SelectionSummary, UiToMain } from '../shared/messages.ts'
import { DEFAULT_PRESET_IDS, isPresetId, PRESETS, type PresetId } from '../shared/presets.ts'

/** System language until the plugin sends the saved choice (`init`). */
let lang: Lang = detectLang(navigator.language)
let t: Strings = STRINGS[lang]

function byId<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id)
  if (!el) throw new Error(`Missing #${id}`)
  return el as T
}

const views = { home: byId('view-home'), export: byId('view-export') }
const exportHeading = byId('export-heading')
const btnGenerate = byId<HTMLButtonElement>('btn-generate')
const btnExport = byId<HTMLButtonElement>('btn-export')
const btnBack = byId<HTMLButtonElement>('btn-back')
const form = byId<HTMLFormElement>('export-form')
const presetList = byId<HTMLUListElement>('preset-list')
const presetError = byId('preset-error')
const selectionSummary = byId('selection-summary')
const selectionWarning = byId('selection-warning')
const selectionWarningText = byId('selection-warning-text')
const app = byId('app')
const langButtons = [...document.querySelectorAll<HTMLButtonElement>('.lang-switch button')]

/** Last selection received, kept to re-render it in another language. */
let lastSummary: SelectionSummary | null = null
const statusRegion = byId('status')
const alertRegion = byId('alert')

function send(message: UiToMain): void {
  parent.postMessage({ pluginMessage: message }, '*')
}

/* ---------- Static text ---------- */

function translatePage(): void {
  document.documentElement.lang = lang
  document.title = t.appTitle
  for (const el of document.querySelectorAll<HTMLElement>('[data-i18n]')) {
    const value = t[el.dataset.i18n as keyof Strings]
    if (typeof value === 'string') el.textContent = value
  }
}

function renderPresets(): void {
  // Re-rendered on language change: keep what the user had checked.
  const checked: readonly PresetId[] = presetList.children.length > 0 ? selectedPresets() : DEFAULT_PRESET_IDS
  presetList.replaceChildren()
  for (const preset of PRESETS) {
    const text = t.presets[preset.id]
    const inputId = `preset-${preset.id}`
    const descId = `${inputId}-desc`

    const item = document.createElement('li')
    item.className = 'preset'

    const input = document.createElement('input')
    input.type = 'checkbox'
    input.id = inputId
    input.name = 'preset'
    input.value = preset.id
    input.checked = checked.includes(preset.id)
    input.setAttribute('aria-describedby', descId)
    input.addEventListener('change', () => {
      if (selectedPresets().length > 0) presetError.textContent = ''
    })

    const label = document.createElement('label')
    label.htmlFor = inputId
    label.textContent = text.label

    const desc = document.createElement('p')
    desc.id = descId
    desc.className = 'preset-desc'
    desc.textContent = `${text.description} ${t.sizesLabel(preset.sizes, preset.svg)}`

    item.append(input, label, desc)
    presetList.append(item)
  }
}

function selectedPresets(): PresetId[] {
  return [...presetList.querySelectorAll<HTMLInputElement>('input:checked')]
    .map((input) => input.value)
    .filter(isPresetId)
}

function renderSelection(): void {
  if (!lastSummary) return
  selectionSummary.textContent = t.selection(lastSummary)
  selectionWarningText.textContent = t.nonSquareWarning(lastSummary.nonSquare)
  selectionWarning.hidden = lastSummary.nonSquare === 0
}

function renderLangButtons(): void {
  for (const button of langButtons) button.setAttribute('aria-pressed', String(button.dataset.lang === lang))
}

function setLang(next: Lang): void {
  lang = next
  t = STRINGS[next]
  translatePage()
  renderPresets()
  renderSelection()
  renderLangButtons()
  // Messages already shown are in the previous language.
  clearFeedback()
  presetError.textContent = ''
}

/* ---------- Feedback ---------- */

function clearFeedback(): void {
  statusRegion.textContent = ''
  alertRegion.textContent = ''
}

function showStatus(text: string): void {
  alertRegion.textContent = ''
  statusRegion.textContent = text
}

function showError(text: string): void {
  statusRegion.textContent = ''
  alertRegion.textContent = text
}

/* ---------- Navigation ---------- */

type View = keyof typeof views

function showView(view: View, focusTarget: HTMLElement): void {
  for (const [name, el] of Object.entries(views)) el.hidden = name !== view
  clearFeedback()
  presetError.textContent = ''
  focusTarget.focus()
}

/* ---------- Messages from the plugin ---------- */

function isCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function isSummary(value: unknown): value is SelectionSummary {
  if (typeof value !== 'object' || value === null) return false
  const s = value as Record<string, unknown>
  return isCount(s.eligible) && isCount(s.ineligible) && isCount(s.nonSquare)
}

function isReport(value: unknown): value is ApplyReport {
  if (!isSummary(value)) return false
  const r = value as unknown as Record<string, unknown>
  return isCount(r.updated) && isCount(r.failed) && isCount(r.added)
}

function parseMainMessage(data: unknown): MainToUi | null {
  if (typeof data !== 'object' || data === null) return null
  const msg = data as Record<string, unknown>
  switch (msg.type) {
    case 'init':
      return isLang(msg.lang) ? { type: 'init', lang: msg.lang } : null
    case 'selection':
      return isSummary(msg.summary) ? { type: 'selection', summary: msg.summary } : null
    case 'templates-done':
      return isCount(msg.count) ? { type: 'templates-done', count: msg.count } : null
    case 'apply-done':
      return isReport(msg.report) ? { type: 'apply-done', report: msg.report } : null
    case 'error':
      return typeof msg.message === 'string' ? { type: 'error', message: msg.message } : null
    default:
      return null
  }
}

window.addEventListener('message', (event: MessageEvent) => {
  const data: unknown = event.data
  const message = parseMainMessage(
    typeof data === 'object' && data !== null ? (data as { pluginMessage?: unknown }).pluginMessage : null,
  )
  if (!message) return
  switch (message.type) {
    case 'init':
      if (message.lang !== lang) setLang(message.lang)
      reportHeight()
      send({ type: 'rendered' })
      break
    case 'selection':
      lastSummary = message.summary
      renderSelection()
      break
    case 'templates-done':
      showStatus(t.templatesDone(message.count))
      break
    case 'apply-done':
      if (message.report.failed > 0 && message.report.updated === 0) showError(t.applyDone(message.report))
      else showStatus(t.applyDone(message.report))
      break
    case 'error':
      showError(message.message)
      break
  }
})

/* ---------- Events ---------- */

btnGenerate.addEventListener('click', () => {
  clearFeedback()
  send({ type: 'generate-templates' })
})

for (const button of langButtons) {
  button.addEventListener('click', () => {
    const next = button.dataset.lang
    if (!isLang(next) || next === lang) return
    setLang(next)
    send({ type: 'set-lang', lang: next })
  })
}

btnExport.addEventListener('click', () => showView('export', exportHeading))
btnBack.addEventListener('click', () => showView('home', btnExport))

form.addEventListener('submit', (event) => {
  event.preventDefault()
  clearFeedback()
  const presets = selectedPresets()
  if (presets.length === 0) {
    presetError.textContent = t.noPresetError
    presetList.querySelector<HTMLInputElement>('input')?.focus()
    return
  }
  presetError.textContent = ''
  send({ type: 'apply-presets', presets })
})

/* ---------- Window size follows the content ---------- */

// Measure #app, not <body>: Figma may stretch the body to the window height,
// which would then never shrink to fit the content.
let lastHeight = 0
function reportHeight(): void {
  const height = Math.ceil(app.getBoundingClientRect().height)
  if (height === lastHeight) return
  lastHeight = height
  send({ type: 'resize', height })
}
new ResizeObserver(() => requestAnimationFrame(reportHeight)).observe(app)

/* ---------- Start ---------- */

translatePage()
renderPresets()
renderLangButtons()
reportHeight()
send({ type: 'ready', lang })
