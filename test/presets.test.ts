import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  exportKey,
  exportSettingsFor,
  exportSettingsForMany,
  isPresetId,
  mergeExportSettings,
  PRESETS,
} from '../src/shared/presets.ts'

const png = (width: number, suffix = `-${width}`): ExportSettings => ({
  format: 'PNG',
  suffix,
  constraint: { type: 'WIDTH', value: width },
})

describe('presets', () => {
  it('keeps the 10 v1 sizes in the standard preset', () => {
    const widths = exportSettingsFor('standard').map((s) => (s.format === 'PNG' ? s.constraint?.value : null))
    assert.deepEqual(widths, [72, 96, 120, 128, 144, 152, 180, 192, 384, 512])
  })

  it('names files <layer>-<w>x<h> in sRGB', () => {
    const [first] = exportSettingsFor('maskable')
    assert.deepEqual(first, {
      format: 'PNG',
      suffix: '-192x192',
      constraint: { type: 'WIDTH', value: 192 },
      colorProfile: 'SRGB',
    })
  })

  it('adds an SVG without suffix to favicons', () => {
    const svg = exportSettingsFor('favicon').filter((s) => s.format === 'SVG')
    assert.equal(svg.length, 1)
    assert.equal(svg[0]?.suffix, '')
  })

  it('has unique ids and template names', () => {
    assert.equal(new Set(PRESETS.map((p) => p.id)).size, PRESETS.length)
    assert.equal(new Set(PRESETS.map((p) => p.templateName)).size, PRESETS.length)
  })

  it('validates preset ids', () => {
    assert.ok(isPresetId('apple'))
    assert.ok(!isPresetId('__proto__'))
    assert.ok(!isPresetId(42))
  })

  it('deduplicates sizes shared by several presets', () => {
    // 152 and 180 are in both "standard" and "apple".
    const keys = exportSettingsForMany(['standard', 'apple']).map(exportKey)
    assert.equal(keys.length, new Set(keys).size)
    assert.equal(keys.length, 11) // 10 standard + 167
  })
})

describe('mergeExportSettings', () => {
  it('keeps unrelated existing settings', () => {
    const own: ExportSettings = { format: 'PDF' }
    const { settings, added } = mergeExportSettings([own], exportSettingsFor('maskable'))
    assert.equal(settings[0], own)
    assert.equal(settings.length, 3)
    assert.equal(added, 2)
  })

  it('replaces v1 settings of the same size instead of duplicating them', () => {
    const { settings, added } = mergeExportSettings([png(192), png(512)], exportSettingsFor('maskable'))
    assert.equal(settings.length, 2)
    assert.equal(added, 0)
    assert.ok(settings.every((s) => s.suffix?.includes('x')))
  })

  it('is idempotent', () => {
    const once = mergeExportSettings([], exportSettingsFor('standard')).settings
    const twice = mergeExportSettings(once, exportSettingsFor('standard'))
    assert.deepEqual(twice.settings, once)
    assert.equal(twice.added, 0)
  })
})
