import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { applyPresets } from '../src/main/apply.ts'
import { STRINGS } from '../src/shared/i18n.ts'
import { parseUiMessage } from '../src/shared/messages.ts'

/** Minimal stand-ins for Figma nodes: only what the code reads. */
function frame(width = 512, height = width, exportSettings: ExportSettings[] = []) {
  return { type: 'FRAME', width, height, exportSettings } as unknown as SceneNode & ExportMixin
}
const section = { type: 'SECTION', width: 10, height: 10 } as unknown as SceneNode

function lockedFrame() {
  const node = frame()
  Object.defineProperty(node, 'exportSettings', {
    get: () => [],
    set: () => {
      throw new Error('locked')
    },
  })
  return node
}

describe('applyPresets', () => {
  it('updates exportable layers and reports the rest', () => {
    const a = frame()
    const b = frame(512, 256)
    const report = applyPresets([a, b, section, lockedFrame()], ['maskable'])
    assert.deepEqual(report, { eligible: 3, ineligible: 1, nonSquare: 1, updated: 2, failed: 1, added: 4 })
    assert.equal(a.exportSettings.length, 2)
  })

  it('reports nothing eligible for an empty selection', () => {
    assert.equal(applyPresets([], ['standard']).eligible, 0)
  })
})

describe('parseUiMessage', () => {
  it('accepts valid messages and deduplicates presets', () => {
    assert.deepEqual(parseUiMessage({ type: 'apply-presets', presets: ['apple', 'apple'] }), {
      type: 'apply-presets',
      presets: ['apple'],
    })
    assert.deepEqual(parseUiMessage({ type: 'ready', lang: 'de' }), { type: 'ready', lang: 'en' })
  })

  it('rejects malformed messages', () => {
    assert.equal(parseUiMessage(null), null)
    assert.equal(parseUiMessage({ type: 'apply-presets', presets: ['nope'] }), null)
    assert.equal(parseUiMessage({ type: 'apply-presets', presets: 'apple' }), null)
    assert.equal(parseUiMessage({ type: 'delete-everything' }), null)
  })
})

describe('i18n', () => {
  it('pluralises in both languages', () => {
    const summary = { eligible: 1, ineligible: 0, nonSquare: 0 }
    assert.equal(STRINGS.en.selection({ ...summary, nonSquare: 3 }), '1 layer selected.')
    assert.equal(STRINGS.en.nonSquareWarning(0), '')
    assert.match(STRINGS.fr.nonSquareWarning(2), /^2 calques ne sont pas carrés/)
    assert.equal(STRINGS.fr.selection({ ...summary, eligible: 2 }), '2 calques sélectionnés.')
  })

  it('defines every preset in every language', () => {
    for (const strings of Object.values(STRINGS)) {
      for (const id of ['standard', 'maskable', 'apple', 'favicon'] as const) {
        assert.ok(strings.presets[id].label.length > 0)
      }
    }
  })
})

describe('resize message', () => {
  it('accepts a finite height only', () => {
    assert.deepEqual(parseUiMessage({ type: 'resize', height: 312.4 }), { type: 'resize', height: 312.4 })
    assert.equal(parseUiMessage({ type: 'resize', height: Infinity }), null)
    assert.equal(parseUiMessage({ type: 'resize', height: '300' }), null)
  })
})

describe('language messages', () => {
  it('validates the language of set-lang and ready', () => {
    assert.deepEqual(parseUiMessage({ type: 'set-lang', lang: 'fr' }), { type: 'set-lang', lang: 'fr' })
    assert.equal(parseUiMessage({ type: 'set-lang', lang: 'de' }), null)
    assert.deepEqual(parseUiMessage({ type: 'rendered' }), { type: 'rendered' })
  })
})
