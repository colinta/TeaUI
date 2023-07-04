import type {Viewport} from '../Viewport'
import {View} from '../View'
import {Rect, Point, Size, MutablePoint} from '../geometry'

type Direction = 'leftToRight' | 'rightToLeft' | 'topToBottom' | 'bottomToTop'

interface Props {
  children: View[]
  direction: Direction
}

export class Flow extends View {
  direction: Direction

  constructor({children, direction}: Props) {
    super()
    this.direction = direction

    for (const child of children) {
      this.add(child)
    }
  }

  intrinsicSize(availableSize: Size): Size {
    const size = Size.zero.mutableCopy()
    const remainingSize = availableSize.mutableCopy()
    for (const child of this.children) {
      const childSize = child.intrinsicSize(availableSize)
      switch (this.direction) {
        case 'leftToRight':
        case 'rightToLeft':
          remainingSize.width = Math.max(
            0,
            remainingSize.width - childSize.width,
          )
          size.width += childSize.width
          size.height = Math.max(size.height, childSize.height)
          break
        case 'topToBottom':
        case 'bottomToTop':
          remainingSize.height = Math.max(
            0,
            remainingSize.height - childSize.height,
          )
          size.width = Math.max(size.width, childSize.width)
          size.height += childSize.height
          break
      }
    }

    return size
  }

  render(viewport: Viewport) {
    const remainingSize = viewport.contentSize.mutableCopy()
    let origin: MutablePoint
    switch (this.direction) {
      case 'leftToRight':
      case 'topToBottom':
        origin = Point.zero.mutableCopy()
        break
      case 'rightToLeft':
        origin = new Point(viewport.contentSize.width, 0)
        break
      case 'bottomToTop':
        origin = new Point(0, viewport.contentSize.height)
        break
    }

    for (const child of this.children) {
      const childSize = child.intrinsicSize(viewport.contentSize).mutableCopy()
      switch (this.direction) {
        case 'leftToRight':
        case 'rightToLeft':
          childSize.height = viewport.contentSize.height
          break
        case 'topToBottom':
        case 'bottomToTop':
          childSize.width = viewport.contentSize.width
          break
      }

      if (this.direction === 'rightToLeft') {
        origin.x -= childSize.width
      } else if (this.direction === 'bottomToTop') {
        origin.y -= childSize.height
      }

      child.render(viewport.clipped(new Rect(origin, childSize)))

      if (this.direction === 'leftToRight') {
        origin.x += childSize.width
      } else if (this.direction === 'topToBottom') {
        origin.y += childSize.height
      }

      switch (this.direction) {
        case 'leftToRight':
        case 'rightToLeft':
          remainingSize.width = Math.max(
            0,
            remainingSize.width - childSize.width,
          )
          break
        case 'topToBottom':
        case 'bottomToTop':
          remainingSize.height = Math.max(
            0,
            remainingSize.height - childSize.height,
          )
          break
      }
    }
  }
}
