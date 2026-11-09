import type { SelectionSummary } from '../shared/messages.ts'

export type ExportableNode = SceneNode & ExportMixin

/** Sections, for instance, have no export settings. */
export function isExportable(node: SceneNode): node is ExportableNode {
  return 'exportSettings' in node
}

function isSquare(node: SceneNode): boolean {
  if (!('width' in node)) return true
  return Math.abs(node.width - node.height) < 0.01
}

export function summarizeSelection(nodes: readonly SceneNode[]): SelectionSummary {
  let eligible = 0
  let nonSquare = 0
  for (const node of nodes) {
    if (!isExportable(node)) continue
    eligible++
    if (!isSquare(node)) nonSquare++
  }
  return { eligible, ineligible: nodes.length - eligible, nonSquare }
}
