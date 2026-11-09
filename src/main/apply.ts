import type { ApplyReport } from '../shared/messages.ts'
import { exportSettingsForMany, mergeExportSettings, type PresetId } from '../shared/presets.ts'
import { isExportable, summarizeSelection } from './selection.ts'

/**
 * Adds the export settings of the given presets to every exportable node,
 * keeping the settings the node already had (see `mergeExportSettings`).
 */
export function applyPresets(nodes: readonly SceneNode[], presetIds: readonly PresetId[]): ApplyReport {
  const incoming = exportSettingsForMany(presetIds)
  let updated = 0
  let failed = 0
  let added = 0

  for (const node of nodes) {
    if (!isExportable(node)) continue
    const merged = mergeExportSettings(node.exportSettings, incoming)
    try {
      node.exportSettings = merged.settings
      updated++
      added += merged.added
    } catch {
      failed++
    }
  }

  return { ...summarizeSelection(nodes), updated, failed, added }
}
