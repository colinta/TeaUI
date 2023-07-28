import type {Viewport} from '../Viewport'
import {type Props as ViewProps, View} from '../View'
import {Container} from '../Container'
import {Style} from '../Style'
import {Rect, Point, Size, interpolate} from '../geometry'
import {type MouseEvent, isMouseDragging} from '../events'

interface Props<T> extends ViewProps {
  items: T[]
  cellForItem: (item: T, row: number) => View
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
  /**
   * Useful for log views
   */
  keepAtBottom?: boolean
}

interface ContentOffset {
  row: number
  offset: number
}

const MAX_ROW = 100000

export class ScrollableList<T> extends Container {
  /**
   * Your function here need not return "stable" views; the views returned by this
   * function will be cached until you call `scrollableList.invalidateCache()` or
   * `scrollableList.invalidateRow(row)`.
   */
  #items: T[]
  #cellForItem: Props<T>['cellForItem']
  #keepAtBottom: boolean
  #isAtBottom = true
  #showScrollbars: boolean
  #scrollHeight: number

  #contentOffset: ContentOffset
  #maxWidth: number = 0
  #viewCache: Map<T, View> = new Map()
  #sizeCache: Map<T, Size> = new Map()
  #totalHeight?: number

  constructor({
    cellForItem,
    items,
    keepAtBottom,
    scrollHeight,
    showScrollbars,
    ...viewProps
  }: Props<T>) {
    super(viewProps)
    this.#showScrollbars = showScrollbars ?? true
    this.#contentOffset = {row: 0, offset: 0}
    this.#cellForItem = cellForItem
    this.#scrollHeight = scrollHeight ?? 1
    this.#items = items
    this.#keepAtBottom = keepAtBottom ?? false
  }

  /**
   * Tells ScrollableList to re-fetch the visible rows.
   * @param forCache: 'size' | 'view'   representing which cache to invalidate
   */
  invalidateAllRows(forCache: 'size' | 'view') {
    if (forCache === 'view') {
      this.#viewCache = new Map()
    }
    this.#sizeCache = new Map()
  }

  /**
   * Tells ScrollableList to refetch a specific row
   * @param row: the row to invalidate
   * @param forCache: 'size' | 'view'   representing which cache to invalidate
   */
  invalidateItem(item: T, forCache: 'size' | 'view') {
    if (forCache === 'view') {
      this.#viewCache.delete(item)
    }
    this.#sizeCache.delete(item)
  }

  invalidateSize(): void {
    this.invalidateAllRows('size')
    super.invalidateSize()
  }

  receiveMouse(event: MouseEvent) {
    if (event.name === 'mouse.wheel.up') {
      this.scrollBy(this.#scrollHeight * -1)
    } else if (event.name === 'mouse.wheel.down') {
      this.scrollBy(this.#scrollHeight)
    } else if (isMouseDragging(event) && this.#totalHeight) {
      if (this.#totalHeight <= this.contentSize.height) {
        this.#contentOffset = {row: 0, offset: 0}
        return
      }

      const maxY = this.#totalHeight - this.contentSize.height
      const heightY = Math.round(
        interpolate(
          Math.max(0, Math.min(this.contentSize.height - 1, event.position.y)),
          [0, this.contentSize.height - 1],
          [0, maxY],
        ),
      )
      this.#isAtBottom = heightY === maxY
      const cellWidth = this.contentSize.width
      for (let row = 0, y = 0; row < this.#items.length; row++) {
        const rowHeight = this.sizeForRow(row, cellWidth)?.height
        if (rowHeight === undefined) {
          break
        }

        if (y + rowHeight >= heightY) {
          this.#contentOffset = {row, offset: y - heightY}
          return
        }

        y += rowHeight
      }
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
  scrollBy(offset: number) {
    if (offset === 0) {
      return
    }

    this.invalidateSize()

    const {row, offset: currentOffset} = this.#contentOffset

    let height = this.sizeForRow(row, this.contentSize.width)?.height
    if (height === undefined) {
      this.#contentOffset = {row: 0, offset: 0}
      return
    }

    // prevent scrolling if there is no more content
    if (offset > 0) {
      const doScroll = this.#checkScrollDown(row, currentOffset, height)
      if (!doScroll) {
        this.#isAtBottom = true
        return
      }
    } else if (row === 0 && currentOffset >= 0) {
      // no helper function necessary here - if offset < 0, do not scroll if we are
      // already at the top
      return
    }
    this.#isAtBottom = false

    let nextOffset = currentOffset - offset
    if (nextOffset <= -height) {
      this.#contentOffset = this.#scrollDownToNextRow(row, nextOffset, height)
    } else if (nextOffset > 0) {
      this.#contentOffset = this.#scrollUpToPrevRow(row, nextOffset, height)
    } else {
      this.#contentOffset = {row: row, offset: nextOffset}
    }
  }

  viewForRow(row: number): View | undefined {
    if (row < 0 || row >= this.#items.length) {
      return
    }

    const item = this.#items[row]
    let view = this.#viewCache.get(item)
    if (!view) {
      view = this.#cellForItem(item, row)
      if (view) {
        this.#viewCache.set(item, view)
      }
    }

    return view
  }

  sizeForRow(row: number, contentWidth: number, view: View): Size
  sizeForRow(row: number, contentWidth: number): Size | undefined
  sizeForRow(row: number, contentWidth: number, view?: View): Size | undefined {
    const item = this.#items[row]
    if (contentWidth === this.contentSize.width && item) {
      const size = this.#sizeCache.get(item)
      if (size !== undefined) {
        return size
      }
    }

    view = view ?? this.viewForRow(row)
    if (view === undefined) {
      return undefined
    }

    const size = view.naturalSize(new Size(contentWidth, 0))
    if (contentWidth === this.contentSize.width && item) {
      this.#sizeCache.set(item, size)
    }
    return size
  }

  naturalSize(availableSize: Size): Size {
    let row = Math.max(0, this.#contentOffset.row)
    let y = this.#contentOffset.offset

    while (y < availableSize.height) {
      const view = this.viewForRow(row)
      if (!view) {
        break
      }

      const rowSize = this.sizeForRow(row, availableSize.width, view)
      this.#maxWidth = Math.max(this.#maxWidth, rowSize.width)
      y += rowSize.height
      row += 1
    }

    return new Size(
      this.#maxWidth + (this.#showScrollbars ? 1 : 0),
      availableSize.height,
    )
  }

  get contentSize(): Size {
    return super.contentSize.shrink(this.#showScrollbars ? 1 : 0, 0)
  }

  lastOffset() {
    const cellCount = this.#items.length
    const cellWidth = this.contentSize.width
    let row = cellCount - 1
    let y = 0
    while (y < this.contentSize.height) {
      const height = this.sizeForRow(row, cellWidth)?.height
      if (height === undefined) {
        return this.#contentOffset
      }

      y += height
      if (y >= this.contentSize.height) {
        break
      }

      row -= 1
    }
    return {row: row, offset: this.contentSize.height - y}
  }

  render(viewport: Viewport) {
    viewport.registerMouse('mouse.wheel')

    if (this.#keepAtBottom && this.#isAtBottom) {
      this.#contentOffset = this.lastOffset()
    }
    const prevRows = new Set(this.children)
    const visibleRows = new Set<View>()
    let row = Math.max(0, this.#contentOffset.row)
    const cellWidth = this.contentSize.width

    let heights: [number, number, number] = [0, 0, 0]

    if (this.#showScrollbars) {
      for (let i = 0; i < row; i++) {
        heights[0] += this.sizeForRow(i, cellWidth)?.height ?? 0
      }
      heights[1] = heights[0]
    }

    let y = this.#contentOffset.offset
    while (y < viewport.contentSize.height) {
      const view = this.viewForRow(row)
      if (!view) {
        break
      }

      const height = this.sizeForRow(row, cellWidth, view)?.height

      if (y === this.#contentOffset.offset && y + height <= 0) {
        y = 0
        this.#contentOffset.offset = 0
      }

      row += 1
      heights[1] += height

      if (view.parent !== this) {
        this.add(view)
      }

      visibleRows.add(view)

      if (
        y < viewport.visibleRect.maxY() &&
        y + height >= viewport.visibleRect.minY()
      ) {
        const rect = new Rect(new Point(0, y), new Size(cellWidth, height))
        viewport.clipped(rect, inside => {
          view.render(inside)
        })
      }

      y += height
      if (y >= viewport.contentSize.height) {
        break
      }
    }

    for (const prevRow of prevRows) {
      if (!visibleRows.has(prevRow)) {
        this.remove(prevRow)
      }
    }

    if (this.#showScrollbars) {
      viewport.registerMouse(
        'mouse.button.left',
        new Rect(
          new Point(cellWidth, 0),
          new Size(1, viewport.contentSize.height),
        ),
      )

      heights[2] = heights[1]
      for (let i = row; i < this.#items.length; i++) {
        const rowHeight = this.sizeForRow(i, cellWidth)?.height
        if (rowHeight === undefined) {
          break
        }
        heights[2] += rowHeight
      }
      this.#totalHeight = heights[2]

      for (let y = 0; y < viewport.contentSize.height; y++) {
        const h = interpolate(
          y,
          [0, viewport.contentSize.height - 1],
          [0, heights[2]],
        )
        const inRange = ~~h >= heights[0] && ~~h <= heights[1] + 1
        viewport.write(
          inRange ? '█' : ' ',
          new Point(cellWidth, y),
          new Style(
            inRange
              ? {
                  foreground: this.theme.highlight,
                  background: this.theme.highlight,
                }
              : {
                  foreground: this.theme.darken,
                  background: this.theme.darken,
                },
          ),
        )
      }
    }
  }

  /**
   * Returns 'true' if the scroll should be allowed, returns 'false' if there
   * is no more content to be shown (do not scroll down)
   */
  #checkScrollDown(row: number, currentOffset: number, height: number) {
    // add heights of visible cells – if we run out of cells before
    // y > this.contentSize, exit. Otherwise, scroll.
    let y = currentOffset
    let nextRow = row
    let nextHeight: number | undefined = height
    while (nextHeight !== undefined) {
      y += nextHeight
      if (y > this.contentSize.height) {
        return true
      }
      nextHeight = this.sizeForRow(++nextRow, this.contentSize.width)?.height
      if (nextHeight === undefined) {
        return false
      }
    }
  }

  #scrollDownToNextRow(row: number, nextOffset: number, height: number) {
    let nextRow = row
    while (nextOffset <= -height) {
      const nextHeight = this.sizeForRow(
        nextRow + 1,
        this.contentSize.width,
      )?.height
      if (nextHeight === undefined) {
        nextOffset = -height
        break
      }
      nextOffset += height
      height = nextHeight
      nextRow += 1
    }

    return {row: nextRow, offset: nextOffset}
  }

  #scrollUpToPrevRow(row: number, nextOffset: number, height: number) {
    let nextRow = row
    while (nextOffset > 0) {
      const nextHeight = this.sizeForRow(
        nextRow - 1,
        this.contentSize.width,
      )?.height
      if (nextHeight === undefined) {
        nextOffset = 0
        break
      }
      height = nextHeight
      nextOffset -= height
      nextRow -= 1
    }

    return {row: nextRow, offset: nextOffset}
  }
}
