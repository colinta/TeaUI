import type {Viewport} from '../Viewport'
import {type Props as ContainerProps, Container} from '../Container'
import {Point, Rect, Size, interpolate} from '../geometry'
import {type MouseEvent} from '../events'
import {Style} from '../Style'

interface Props extends ContainerProps {
  /**
   * Show/hide the scrollbars
   * @default true
   */
  showScrollbars?: boolean
  /**
   * How many rows to scroll by when using the mouse wheel.
   * @default 1
   */
  scrollHeight?: number
}

interface ContentOffset {
  x: number
  y: number
}

/**
 * Scrollable is meant to scroll _a single view_, ie a Flow view. But all the
 * container views are optimized to check their _visibleRect_, and won't render
 * children that are not in view, saving some CPU cycles.
 */
export class Scrollable extends Container {
  #showScrollbars: boolean = true
  #scrollHeight: number = 1
  #contentOffset: ContentOffset
  #contentSize: Size = Size.zero
  #visibleSize: Size = Size.zero
  #prevMouseDown?: 'horizontal' | 'vertical' = undefined

  constructor(props: Props) {
    super(props)

    this.#contentOffset = {x: 0, y: 0}
    this.#update(props)
  }

  update(props: Props) {
    this.#update(props)
    super.update(props)
  }

  #update({scrollHeight, showScrollbars}: Props) {
    this.#showScrollbars = showScrollbars ?? true
    this.#scrollHeight = scrollHeight ?? 1
  }

  naturalSize(availableSize: Size) {
    const size = super.naturalSize(availableSize)
    return size
  }

  #maxOffsetX() {
    const tooTall = this.#contentSize.height > this.contentSize.height

    return this.#visibleSize.width - this.#contentSize.width + (tooTall ? 0 : 1)
  }

  #maxOffsetY() {
    const tooWide = this.#contentSize.width > this.contentSize.width

    return (
      this.#visibleSize.height - this.#contentSize.height + (tooWide ? 0 : 1)
    )
  }

  receiveMouse(event: MouseEvent) {
    if (event.name === 'mouse.wheel.up' || event.name === 'mouse.wheel.down') {
      this.receiveWheel(event)
      return
    }

    if (event.name === 'mouse.button.up') {
      this.#prevMouseDown = undefined
      return
    }

    const tooWide = this.#contentSize.width > this.contentSize.width
    const tooTall = this.#contentSize.height > this.contentSize.height

    if (
      tooWide &&
      tooTall &&
      event.position.y === this.contentSize.height - 1 &&
      event.position.x === this.contentSize.width - 1
    ) {
      // bottom-right corner click
      return
    }

    if (this.#prevMouseDown === undefined) {
      if (tooWide && event.position.y === this.contentSize.height) {
        this.#prevMouseDown = 'horizontal'
      } else if (tooTall && event.position.x === this.contentSize.width) {
        this.#prevMouseDown = 'vertical'
      } else {
        return
      }
    }

    this.receiveMouseDown(event)
  }

  receiveMouseDown(event: MouseEvent) {
    const tooWide = this.#contentSize.width > this.contentSize.width
    const tooTall = this.#contentSize.height > this.contentSize.height

    if (tooWide && this.#prevMouseDown === 'horizontal') {
      const maxX = this.#maxOffsetX()
      const offsetX = Math.round(
        interpolate(
          event.position.x,
          [0, this.contentSize.width - (tooTall ? 1 : 0)],
          [0, maxX],
        ),
      )
      this.#contentOffset = {
        x: Math.max(maxX, Math.min(0, offsetX)),
        y: this.#contentOffset.y,
      }
    } else if (tooTall && this.#prevMouseDown === 'vertical') {
      const maxY = this.#maxOffsetY()
      const offsetY = Math.round(
        interpolate(
          event.position.y,
          [0, this.contentSize.height - (tooWide ? 1 : 0)],
          [0, maxY],
        ),
      )
      this.#contentOffset = {
        x: this.#contentOffset.x,
        y: Math.max(maxY, Math.min(0, offsetY)),
      }
    }
  }

  receiveWheel(event: MouseEvent) {
    let delta = 0
    if (event.name === 'mouse.wheel.up') {
      delta = this.#scrollHeight * -1
    } else if (event.name === 'mouse.wheel.down') {
      delta = this.#scrollHeight
    }

    const tooTall = (this.#contentSize?.height ?? 0) > this.contentSize.height

    if (event.ctrl) {
      delta *= 5
    }

    if (event.shift || !tooTall) {
      this.scrollBy(delta, 0)
    } else {
      this.scrollBy(0, delta)
    }
  }

  /**
   * Moves the visible region. The visible region is stored as a pointer to the
   * top-most row and an offset from the top of that row (see `interface ContentOffset`)
   *
   * Positive offset scrolls *down* (currentOffset goes more negative)
   *
   * When current cell is entirely above the top, we set the `contentOffset` to the
   * row that is at the top of the screen and still visible, similarly if the current
   * cell is below the top, we fetch enough rows about and update the `contentOffset`
   * to point to the top-most row.
   */
  scrollBy(offsetX: number, offsetY: number) {
    if (offsetX === 0 && offsetY === 0) {
      return
    }

    const tooWide = this.#contentSize.width > this.contentSize.width
    const tooTall = this.#contentSize.height > this.contentSize.height

    let {x, y} = this.#contentOffset
    const maxX = this.#maxOffsetX()
    const maxY = this.#maxOffsetY()
    x = Math.min(0, Math.max(maxX, x - offsetX))
    y = Math.min(0, Math.max(maxY, y - offsetY))
    this.#contentOffset = {x, y}
  }

  get contentSize(): Size {
    const delta = this.#showScrollbars ? 1 : 0
    return super.contentSize.shrink(delta, delta)
  }

  render(viewport: Viewport) {
    if (viewport.isEmpty) {
      return super.render(viewport)
    }

    viewport.registerMouse('mouse.wheel')

    let contentSize = Size.zero.mutableCopy()
    for (const child of this.children) {
      const childSize = child.naturalSize(viewport.contentSize)
      contentSize.width = Math.max(contentSize.width, childSize.width)
      contentSize.height = Math.max(contentSize.height, childSize.height)
    }
    this.#contentSize = contentSize

    const tooWide = contentSize.width > viewport.contentSize.width
    const tooTall = contentSize.height > viewport.contentSize.height

    // #contentOffset is _negative_ (indicates the amount to move the view away
    // from the origin, which will always be up/left of 0,0)
    const outside = new Rect(
      [this.#contentOffset.x, this.#contentOffset.y],
      viewport.contentSize
        .shrink(this.#contentOffset.x, this.#contentOffset.y)
        .shrink(
          this.#showScrollbars && tooTall ? 1 : 0,
          this.#showScrollbars && tooWide ? 1 : 0,
        ),
    )
    viewport.clipped(outside, inside => {
      for (const child of this.children) {
        child.render(inside)
      }
    })

    this.#visibleSize = viewport.visibleRect.size.shrink(
      tooWide ? 1 : 0,
      tooTall ? 1 : 0,
    )

    if (this.#showScrollbars && (tooWide || tooTall)) {
      const scrollBar: Style = new Style({
        foreground: this.theme.darkenColor,
        background: this.theme.darkenColor,
      })
      const scrollControl: Style = new Style({
        foreground: this.theme.highlightColor,
        background: this.theme.highlightColor,
      })

      // scrollMaxX: x of the last column of the view
      // scrollMaxY: y of the last row of the view
      // scrollMaxHorizX: horizontal scroll bar is drawn from 0 to scrollMaxHorizX
      // scrollMaxHorizY: vertical scroll bar is drawn from 0 to scrollMaxHorizY
      const scrollMaxX = viewport.contentSize.width - 1,
        scrollMaxY = viewport.contentSize.height - 1,
        scrollMaxHorizX = scrollMaxX - (tooTall ? 1 : 0),
        scrollMaxVertY = scrollMaxY - (tooWide ? 1 : 0)
      if (tooWide && tooTall) {
        viewport.write('█', new Point(scrollMaxX, scrollMaxY), scrollBar)
      }

      if (tooWide) {
        viewport.registerMouse(
          'mouse.button.left',
          new Rect(new Point(0, scrollMaxY), new Size(scrollMaxHorizX + 1, 1)),
        )

        const contentOffsetX = -this.#contentOffset.x
        const viewX = Math.round(
          interpolate(
            contentOffsetX,
            [
              0,
              contentSize.width -
                viewport.contentSize.width +
                (tooTall ? 1 : 0),
            ],
            [0, scrollMaxHorizX],
          ),
        )
        for (let x = 0; x <= scrollMaxHorizX; x++) {
          const inRange = x === viewX
          viewport.write(
            inRange ? '█' : ' ',
            new Point(x, scrollMaxY),
            inRange ? scrollControl : scrollBar,
          )
        }
      }

      if (tooTall) {
        viewport.registerMouse(
          'mouse.button.left',
          new Rect(new Point(scrollMaxX, 0), new Size(1, scrollMaxVertY + 1)),
        )

        const contentOffsetY = -this.#contentOffset.y
        const viewY = Math.round(
          interpolate(
            contentOffsetY,
            [
              0,
              contentSize.height -
                viewport.contentSize.height +
                (tooWide ? 1 : 0),
            ],
            [0, scrollMaxVertY],
          ),
        )
        for (let y = 0; y <= scrollMaxVertY; y++) {
          const inRange = y === viewY
          viewport.write(
            inRange ? '█' : ' ',
            new Point(scrollMaxX, y),
            inRange ? scrollControl : scrollBar,
          )
        }
      }
    }
  }
}
