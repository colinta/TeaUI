import type {Viewport} from '../Viewport'
import type {MouseEvent} from '../events'
import type {Props as ViewProps} from '../View'

import {View} from '../View'
import {Style} from '../Style'
import {Container} from '../Container'
import {Rect, Point, Size} from '../geometry'
import {
  isMousePressed,
  isMouseReleased,
  isMouseEnter,
  isMouseExit,
  isMouseClicked,
} from '../events'

interface StyleProps {
  isCollapsed?: boolean
  collapsedView: View
  expandedView: View
  onClick?: () => void
}

type Props = StyleProps & ViewProps

export class Collapsible extends Container {
  #collapsedView: View
  #expandedView: View
  #isCollapsed = true
  #isPressed = false
  #isHover = false
  #onClick?: () => void
  constructor({isCollapsed, collapsedView, expandedView, onClick, ...viewProps}: Props) {
    super(viewProps)

    this.#isCollapsed = isCollapsed ?? false
    this.#collapsedView = collapsedView
    this.#expandedView = expandedView
    this.#onClick = onClick

    this.add(collapsedView)
    this.add(expandedView)
  }

  naturalSize(availableSize: Size): Size {
    if (this.#isCollapsed) {
      return this.#collapsedView.naturalSize(availableSize).grow(2, 0)
    } else {
      return this.#expandedView.naturalSize(availableSize).grow(2, 0)
    }
  }

  receiveMouse(event: MouseEvent) {
    if (isMousePressed(event)) {
      this.#isPressed = true
    } else if (isMouseReleased(event)) {
      this.#isPressed = false

      if (isMouseClicked(event)) {
        this.#isCollapsed = !this.#isCollapsed
        this.invalidateSize()
        if (this.#onClick) this.#onClick()
      }
    }

    if (isMouseEnter(event)) {
      this.#isHover = true
    } else if (isMouseExit(event)) {
      this.#isHover = false
    }
  }

  render(viewport: Viewport) {
    viewport.registerMouse(['mouse.button.left', 'mouse.move'])

    const textStyle = this.theme.text({
      isPressed: this.#isPressed,
      isHover: this.#isHover,
    })

    viewport.visibleRect.forEachPoint(pt => {
      viewport.write(' ', pt, textStyle)
    })

    const contentSize = viewport.contentSize.shrink(2, 0)
    const naturalSize = this.#isCollapsed
      ? this.#collapsedView.naturalSize(contentSize)
      : this.#expandedView.naturalSize(contentSize)
    const offset = new Point(2, 0)

    viewport.write(
      this.#isCollapsed ? '►' : '▼',
      new Point(0, offset.y),
      textStyle,
    )
    viewport.clipped(new Rect(offset, naturalSize), inside => {
      if (this.#isCollapsed) {
        this.#collapsedView.render(inside)
      } else {
        this.#expandedView.render(inside)
      }
    })
  }
}
