import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { CANVAS_TEXT } from '../src/shared/guides.ts'
import { PRESET_IDS } from '../src/shared/presets.ts'

describe('canvas guides', () => {
  for (const [lang, t] of Object.entries(CANVAS_TEXT)) {
    it(`has complete content for every preset in ${lang}`, () => {
      for (const id of PRESET_IDS) {
        const guide = t.guides[id]
        for (const field of [guide.title, guide.intro, guide.code, guide.previewTitle, guide.previewCaption]) {
          assert.ok(field.trim().length > 0, `${lang}.${id}`)
        }
        assert.ok(guide.tips.length >= 2, `${lang}.${id}.tips`)
      }
    })
  }

  it('references the file names the presets really export', () => {
    for (const t of Object.values(CANVAS_TEXT)) {
      assert.match(t.guides.maskable.code, /icon-maskable-512x512\.png/)
      assert.match(t.guides.apple.code, /apple-touch-icon-180x180\.png/)
      assert.match(t.guides.favicon.code, /favicon\.svg/)
    }
  })
})
