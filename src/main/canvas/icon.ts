/**
 * Live views of a template: an instance of its component, scaled and cropped
 * to a platform shape. Editing the template updates every view.
 */
import { box, place } from './primitives.ts'

export type IconShape = 'square' | 'circle' | 'squircle' | 'rounded' | 'teardrop' | 'ios'

function applyShape(frame: FrameNode, shape: IconShape, size: number): void {
  switch (shape) {
    case 'square':
      break
    case 'circle':
      frame.cornerRadius = size / 2
      break
    case 'squircle':
      frame.cornerRadius = size * 0.36
      frame.cornerSmoothing = 1
      break
    case 'rounded':
      frame.cornerRadius = size * 0.18
      break
    case 'teardrop':
      frame.topLeftRadius = frame.topRightRadius = frame.bottomLeftRadius = size / 2
      frame.bottomRightRadius = size * 0.12
      break
    case 'ios':
      // Continuous corners, close to the iOS home screen mask.
      frame.cornerRadius = size * 0.2237
      frame.cornerSmoothing = 0.6
      break
  }
}

/**
 * Previews must never be exported (their names would collide with the
 * templates' files) nor show the maskable guide grid.
 */
function createPreviewInstance(component: ComponentNode): InstanceNode {
  const instance = component.createInstance()
  instance.name = `${component.name} · preview`
  instance.exportSettings = []
  try {
    instance.layoutGrids = []
  } catch {
    // Cosmetic only: grids are hidden by default outside the main component's frame.
  }
  return instance
}

interface IconViewOptions {
  /** Share of the shape occupied by the icon (Android's legacy white disc). */
  readonly inset?: number
  readonly background?: Paint[]
}

export function iconView(
  component: ComponentNode,
  size: number,
  shape: IconShape,
  options: IconViewOptions = {},
): FrameNode {
  const frame = box(`${component.name} · ${shape}`, size, size, { fills: options.background ?? [], clip: true })
  applyShape(frame, shape, size)
  const instance = createPreviewInstance(component)
  instance.rescale((size * (options.inset ?? 1)) / component.width)
  place(frame, instance, (size - instance.width) / 2, (size - instance.height) / 2)
  return frame
}

/** A grey placeholder app icon in the same shape. */
export function placeholderIcon(size: number, shape: IconShape, fills: Paint[]): FrameNode {
  const frame = box('App', size, size, { fills })
  applyShape(frame, shape, size)
  return frame
}
