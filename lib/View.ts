import type {Mutable} from './geometry'
import type {Viewport} from './Viewport'
import type {Screen} from './Screen'
import type {Purpose} from './Theme'
import {Theme} from './Theme'
import {Container} from './Container'
import {System} from './System'
import {
  isMouseEnter,
  isMouseExit,
  isMousePressStart,
  isMousePressExit,
  type KeyEvent,
  type MouseEvent,
} from './events'
import {Point, Size, Rect} from './geometry'

export type Dimension = number | 'fill' | 'natural'
export type FlexSize = 'natural' | number
export type FlexShorthand = FlexSize | `flex${number}`

export function parseFlexShorthand(flex: FlexShorthand): FlexSize {
  if (flex === 'natural') {
    return 'natural'
  } else if (typeof flex === 'string') {
    return +flex.slice('flex'.length) // 'flexN'
  }
  return flex
}

export interface Props {
  theme?: Theme | Purpose
  // size and positioning
  x?: number
  y?: number
  width?: Dimension
  height?: Dimension
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  padding?: number | Partial<Edges>
  isVisible?: boolean
  // only used as a child of <Flex> views
  flex?: FlexShorthand
  // use this however you want
  debug?: boolean
}

interface Edges {
  top: number
  right: number
  bottom: number
  left: number
}

export abstract class View {
  parent: Container | null = null
  debug: boolean = false

  #screen: Screen | null = null
  #theme: Theme | undefined
  #prevSizeCache: Map<string, Size> = new Map()
  #viewportContentSize: Size = Size.zero
  #renderedContentSize: Size = Size.zero
  #invalidateParent = true

  #x: Props['x']
  #y: Props['y']
  #width: Props['width']
  #height: Props['height']
  #minWidth: Props['minWidth']
  #minHeight: Props['minHeight']
  #maxWidth: Props['maxWidth']
  #maxHeight: Props['maxHeight']
  #isVisible: NonNullable<Props['isVisible']> = true
  padding: Edges | undefined
  flex: FlexSize = 'natural'

  // mouse handling helpers
  #isHover = false
  #isPressed = false

  constructor(props: Props = {}) {
    this.#update(props)

    const render = this.render.bind(this)
    const naturalSize = this.naturalSize.bind(this)

    Object.defineProperties(this, {
      render: {
        enumerable: false,
        value: this.#renderWrap(render).bind(this),
      },
      naturalSize: {
        enumerable: false,
        value: this.#naturalSizeWrap(naturalSize).bind(this),
      },
      // don't want to include these in inspect output
      parent: {
        enumerable: false,
      },
      debug: {
        enumerable: false,
      },
    })
  }

  update(props: Props) {
    this.#update(props)
    this.invalidateSize()
  }

  #update({
    theme,
    x,
    y,
    width,
    height,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    isVisible,
    padding,
    flex,
    debug,
  }: Props) {
    this.#theme = typeof theme === 'string' ? Theme[theme] : theme
    this.#x = x
    this.#y = y
    this.#width = width
    this.#height = height
    this.#minWidth = minWidth
    this.#minHeight = minHeight
    this.#maxWidth = maxWidth
    this.#maxHeight = maxHeight
    this.#isVisible = isVisible ?? true

    this.padding = toEdges(padding)
    this.flex = flex === undefined ? 'natural' : parseFlexShorthand(flex)
    this.debug = debug ?? false

    Object.defineProperties(this, {
      // only include these if they were defined
      padding: {
        enumerable: padding !== undefined,
      },
      flex: {
        enumerable: flex !== undefined,
      },
    })
  }

  get theme(): Theme {
    return this.#theme ?? this.parent?.childTheme(this) ?? Theme.plain
  }

  set theme(value: Theme | undefined) {
    this.#theme = value
  }

  childTheme(_view: View) {
    return this.theme
  }

  get isVisible(): boolean {
    return this.#isVisible
  }

  set isVisible(value: boolean) {
    this.#isVisible = value
    this.invalidateSize()
  }

  get screen(): Screen | null {
    return this.#screen
  }

  get children(): View[] {
    return []
  }

  get contentSize(): Size {
    return this.#renderedContentSize
  }

  get isHover() {
    return this.#isHover
  }

  get isPressed() {
    return this.#isPressed
  }

  abstract naturalSize(available: Size): Size
  abstract render(viewport: Viewport): void

  /**
   * Called from a view when a property change could affect naturalSize
   */
  invalidateSize() {
    this.#prevSizeCache = new Map()
    if (this.#invalidateParent) {
      this.parent?.invalidateSize()
    }
    this.invalidateRender()
  }

  /**
   * Indicates that a rerender is needed (but size is not affected)
   */
  invalidateRender() {
    this.#screen?.needsRender()
  }

  #toDimension(
    dim: Dimension,
    available: number,
    natural: () => number,
  ): number {
    if (dim === 'fill') {
      return available
    } else if (dim === 'natural') {
      return natural()
    }
    return dim
  }

  #restrictSize(
    _calcSize: () => Size,
    available: Size,
    prefer: 'grow' | 'shrink',
  ): Mutable<Size> {
    let memo: Size | undefined
    const calcSize = () => {
      return (memo ??= _calcSize())
    }

    if (this.#width !== undefined && this.#height !== undefined) {
      // shortcut for explicit or 'fill' on both width & height, skip all the rest
      const width = this.#toDimension(
          this.#width,
          available.width,
          () => calcSize().width,
        ),
        height = this.#toDimension(
          this.#height,
          available.height,
          () => calcSize().height,
        )
      return new Size(width, height).mutableCopy()
    }

    const size = (prefer === 'shrink' ? calcSize() : available).mutableCopy()

    if (this.#width !== undefined) {
      size.width = this.#toDimension(
        this.#width,
        available.width,
        () => calcSize().width,
      )
    } else {
      if (this.#minWidth !== undefined) {
        size.width = Math.max(this.#minWidth, size.width)
      }

      if (this.#maxWidth !== undefined) {
        size.width = Math.min(this.#maxWidth, size.width)
      }
    }

    if (this.#height !== undefined) {
      size.height = this.#toDimension(
        this.#height,
        available.height,
        () => calcSize().height,
      )
    } else {
      if (this.#minHeight !== undefined) {
        size.height = Math.max(this.#minHeight, size.height)
      }
      if (this.#maxHeight !== undefined) {
        size.height = Math.min(this.#maxHeight, size.height)
      }
    }

    return size
  }

  #calculateAvailableSize(parentAvailableSize: Size): Size {
    const available = parentAvailableSize.mutableCopy()
    if (this.#x || this.#y) {
      available.width -= this.#x ?? 0
      available.height -= this.#y ?? 0
    }

    if (typeof this.#width === 'number') {
      available.width = this.#width
    } else {
      if (this.#maxWidth !== undefined) {
        available.width = Math.min(this.#maxWidth, available.width)
      }

      if (this.#minWidth !== undefined) {
        available.width = Math.max(this.#minWidth, available.width)
      }
    }

    if (typeof this.#height === 'number') {
      available.height = this.#height
    } else {
      if (this.#maxHeight !== undefined) {
        available.height = Math.min(this.#maxHeight, available.height)
      }

      if (this.#minHeight !== undefined) {
        available.height = Math.max(this.#minHeight, available.height)
      }
    }

    if (this.padding) {
      available.width -= this.padding.left + this.padding.right
      available.height -= this.padding.top + this.padding.bottom
    }

    available.width = Math.max(0, available.width)
    available.height = Math.max(0, available.height)

    return available
  }

  #naturalSizeWrap(
    naturalSize: (available: Size) => Size,
  ): (available: Size) => Size {
    return parentAvailableSize => {
      const cached = this.#prevSizeCache.get(cacheKey(parentAvailableSize))
      if (cached) {
        return cached
      }

      const available = this.#calculateAvailableSize(parentAvailableSize)

      const size = this.#restrictSize(
        () => {
          let size = naturalSize(available)
          if (this.padding) {
            size = size.grow(
              this.padding.left + this.padding.right,
              this.padding.top + this.padding.bottom,
            )
          }
          return size
        },
        available,
        'shrink',
      )

      if (this.#x) {
        size.width += this.#x
      }
      if (this.#y) {
        size.height += this.#y
      }

      this.#prevSizeCache.set(cacheKey(available), size)
      return size
    }
  }

  #renderWrap(
    render: (viewport: Viewport) => void,
  ): (viewport: Viewport) => void {
    return viewport => {
      if (
        this.#viewportContentSize.width !== viewport.contentSize.width ||
        this.#viewportContentSize.height !== viewport.contentSize.height
      ) {
        this.#invalidateParent = false
        this.invalidateSize()
        this.#invalidateParent = true
      }

      this.#viewportContentSize = viewport.contentSize

      let origin: Point
      const contentSize = viewport.contentSize.mutableCopy()
      if (this.#x || this.#y) {
        origin = new Point(this.#x ?? 0, this.#y ?? 0)
        contentSize.width -= origin.x
        contentSize.height -= origin.y
      } else {
        origin = Point.zero
      }

      if (this.padding) {
        origin = origin.offset(this.padding.left, this.padding.top)
        contentSize.width -= this.padding.left + this.padding.right
        contentSize.height -= this.padding.top + this.padding.bottom
      }

      this.#renderedContentSize = this.#restrictSize(
        () => this.naturalSize(contentSize),
        contentSize,
        'grow',
      )

      const rect = new Rect(origin, this.#renderedContentSize)
      viewport._render(this, rect, render)
    }
  }

  /**
   * Called before being added to the parent View
   */
  willMoveTo(parent: View) {}
  /**
   * Called after being removed from the parent View
   */
  didMoveFrom(parent: View) {}
  /**
   * Called after being added to a Screen
   */
  didMount(screen: Screen) {}
  /**
   * Called after being removed from a Screen (even when about to be moved to a new
   * screen).
   */
  didUnmount(screen: Screen) {}

  removeFromParent() {
    if (!this.parent) {
      return
    }

    this.parent.removeChild(this)
  }

  moveToScreen(screen: Screen | null) {
    if (this.#screen === screen) {
      return
    }

    const prev = this.#screen
    this.#screen = screen

    if (screen) {
      if (prev) {
        this.didUnmount(prev)
      }
      this.didMount(screen)
    } else {
      this.didUnmount(prev!)
    }
  }

  /**
   * To register for this event, call `viewport.registerFocus()`, which returns `true`
   * if the current view has the keyboard focus.
   */
  receiveKey(event: KeyEvent) {}
  /**
   * To register for this event, call `viewport.registerMouse()`
   */
  receiveMouse(event: MouseEvent, system: System) {
    if (isMousePressStart(event)) {
      this.#isPressed = true
    } else if (isMousePressExit(event)) {
      this.#isPressed = false
    }

    if (isMouseEnter(event)) {
      this.#isHover = true
    } else if (isMouseExit(event)) {
      this.#isHover = false
    }
  }

  /**
   * Receives the time-delta between previous and current render. Return 'true' if
   * this function causes the view to need a rerender.
   *
   * To register for this event, call `viewport.registerTick()`
   */
  receiveTick(dt: number): boolean {
    return false
  }
}

function toEdges(
  edges: number | Partial<Edges> | undefined,
): Edges | undefined {
  if (!edges) {
    return
  }

  if (typeof edges === 'number') {
    return {
      top: edges,
      right: edges,
      bottom: edges,
      left: edges,
    }
  }

  return {
    top: edges.top ?? 0,
    right: edges.right ?? 0,
    bottom: edges.bottom ?? 0,
    left: edges.left ?? 0,
  }
}

function cacheKey(size: Size) {
  return `${size.width}x${size.height}`
}
