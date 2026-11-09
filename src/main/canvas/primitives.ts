/**
 * Small helpers to draw on the canvas: colours, frames, auto-layout stacks, text.
 */

export interface Fonts {
  readonly regular: FontName
  readonly medium: FontName
  readonly semibold: FontName
  readonly mono: FontName
}

const INTER = 'Inter'

/** Loads every font the templates use, in parallel. Falls back to Inter for code. */
export async function loadFonts(): Promise<Fonts> {
  const regular: FontName = { family: INTER, style: 'Regular' }
  const medium: FontName = { family: INTER, style: 'Medium' }
  const semibold: FontName = { family: INTER, style: 'Semi Bold' }
  const mono: FontName = { family: 'Roboto Mono', style: 'Regular' }
  const [, , , monoLoaded] = await Promise.all([
    figma.loadFontAsync(regular),
    figma.loadFontAsync(medium),
    figma.loadFontAsync(semibold),
    figma.loadFontAsync(mono).then(
      () => true,
      () => false,
    ),
  ])
  return { regular, medium, semibold, mono: monoLoaded ? mono : regular }
}

export function rgb(hex: string): RGB {
  const n = Number.parseInt(hex.replace('#', ''), 16)
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 }
}

export function solid(hex: string, opacity = 1): SolidPaint {
  return { type: 'SOLID', color: rgb(hex), opacity }
}

/** Top-to-bottom linear gradient. */
export function verticalGradient(from: string, to: string): GradientPaint {
  return {
    type: 'GRADIENT_LINEAR',
    gradientTransform: [
      [0, 1, 0],
      [-1, 0, 1],
    ],
    gradientStops: [
      { position: 0, color: { ...rgb(from), a: 1 } },
      { position: 1, color: { ...rgb(to), a: 1 } },
    ],
  }
}

interface BoxOptions {
  readonly fills?: Paint[]
  readonly radius?: number
  readonly clip?: boolean
}

/** A plain frame with absolute positioning. */
export function box(name: string, width: number, height: number, options: BoxOptions = {}): FrameNode {
  const frame = figma.createFrame()
  frame.name = name
  frame.resize(width, height)
  frame.fills = options.fills ?? []
  frame.cornerRadius = options.radius ?? 0
  frame.clipsContent = options.clip ?? false
  return frame
}

/** Appends `node` to `parent` at (x, y) relative to the parent. */
export function place<T extends SceneNode>(parent: FrameNode | SectionNode, node: T, x: number, y: number): T {
  parent.appendChild(node)
  node.x = Math.round(x)
  node.y = Math.round(y)
  return node
}

interface StackOptions {
  readonly width?: number
  readonly gap?: number
  readonly padding?: number
  readonly fills?: Paint[]
  readonly radius?: number
}

/** A vertical auto-layout frame: fixed width (if given), height hugs its content. */
export function stack(name: string, options: StackOptions = {}): FrameNode {
  const frame = figma.createFrame()
  frame.name = name
  frame.layoutMode = 'VERTICAL'
  frame.itemSpacing = options.gap ?? 0
  const p = options.padding ?? 0
  frame.paddingTop = frame.paddingBottom = frame.paddingLeft = frame.paddingRight = p
  frame.fills = options.fills ?? []
  frame.cornerRadius = options.radius ?? 0
  frame.clipsContent = false
  frame.primaryAxisSizingMode = 'AUTO'
  if (options.width !== undefined) {
    frame.resize(options.width, frame.height)
    frame.counterAxisSizingMode = 'FIXED'
  } else {
    frame.counterAxisSizingMode = 'AUTO'
  }
  return frame
}

interface TextOptions {
  readonly font: FontName
  readonly size: number
  readonly color?: string
  readonly lineHeight?: number
  readonly align?: 'LEFT' | 'CENTER' | 'RIGHT'
  /** Fixed width: the text wraps and its height grows. Otherwise it hugs. */
  readonly width?: number
}

export function text(characters: string, options: TextOptions): TextNode {
  const node = figma.createText()
  node.fontName = options.font
  node.fontSize = options.size
  node.characters = characters
  node.fills = [solid(options.color ?? '#1e1e1e')]
  if (options.lineHeight) node.lineHeight = { unit: 'PERCENT', value: options.lineHeight }
  if (options.align) node.textAlignHorizontal = options.align
  if (options.width !== undefined) {
    node.resize(options.width, node.height)
    node.textAutoResize = 'HEIGHT'
  } else {
    node.textAutoResize = 'WIDTH_AND_HEIGHT'
  }
  return node
}

/** Appends a child to a vertical stack, stretched to the stack's width. */
export function appendFill(parent: FrameNode, child: FrameNode | TextNode): void {
  parent.appendChild(child)
  child.layoutSizingHorizontal = 'FILL'
  if (child.type === 'TEXT') child.textAutoResize = 'HEIGHT'
}
