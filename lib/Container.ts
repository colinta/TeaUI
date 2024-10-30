import {Size} from './geometry'
import type {Viewport} from './Viewport'
import {type Props as ViewProps, View} from './View'
import {Screen} from './Screen'

export interface Props extends ViewProps {
  child?: View
  children?: View[]
}

export abstract class Container extends View {
  #children: View[] = []

  constructor({child, children, ...viewProps}: Props = {}) {
    super(viewProps)

    if (child) {
      this.add(child)
    } else if (children) {
      this.addAll(children)
    }
  }

  update(props: Props) {
    this.#update(props)
    super.update(props)
  }

  #update({child, children}: Props) {
    if (child) {
      children = [child]
    }

    if (children !== undefined) {
      if (children.length) {
        const childrenSet = new Set(children)
        for (const child of this.#children) {
          if (!childrenSet.has(child)) {
            this.#removeChild(child)
          }
        }

        for (const child of children) {
          this.add(child)
        }
      } else {
        this.removeAllChildren()
      }
    }
  }

  get children() {
    return this.#children
  }

  naturalSize(available: Size): Size {
    let width = 0
    let height = 0
    for (const child of this.#children) {
      const naturalSize = child.naturalSize(available)
      width = Math.max(width, naturalSize.width)
      height = Math.max(height, naturalSize.height)
    }
    return new Size(width, height)
  }

  render(viewport: Viewport) {
    this.renderChildren(viewport)
  }

  renderChildren(viewport: Viewport) {
    for (const child of this.#children) {
      child.render(viewport)
    }
  }

  addAll(children: View[], at?: number) {
    for (const view of children) {
      this.add(view, at)
      at = at !== undefined ? at + 1 : undefined
    }
  }

  add(child: View, at?: number) {
    // early exit for adding child at its current index
    if (
      this.#children.length &&
      this.#children[at ?? this.#children.length - 1] === child
    ) {
      return
    }

    if (child.parent === this) {
      // only changing the order - remove it from this.#children, and add it back
      // below at the correct index
      this.#children = this.#children.filter(view => view !== child)
    } else {
      child.willMoveTo(this)

      if (child.parent && child.parent instanceof Container) {
        const index = child.parent.#children.indexOf(child)
        if (~index) {
          child.parent.#children.splice(index, 1)
        }
      }
    }

    this.#children.splice(at ?? this.#children.length, 0, child)

    if (child.parent !== this) {
      const parent = child.parent
      child.parent = this
      if (parent) {
        child.didMoveFrom(parent)
      }
    }
    // in theory we could call 'didReorder' in the else clause

    // takes care of didMount, noop if screen == this.screen
    child.moveToScreen(this.screen)

    this.invalidateSize()
  }

  #removeChild(child: View) {
    child.parent = null
    child.didMoveFrom(this)

    // takes care of didUnmount
    child.moveToScreen(null)
  }

  removeAllChildren() {
    for (const child of this.#children) {
      this.#removeChild(child)
    }

    this.#children = []
  }

  removeChild(remove: View | number) {
    if (typeof remove === 'number') {
      if (remove >= 0 && remove < this.#children.length) {
        const child = this.#children[remove]
        this.#children.splice(remove, 1)

        this.#removeChild(child)
      }
    } else {
      if (remove.parent !== this) {
        return
      }

      const index = this.#children.indexOf(remove)
      if (~index) {
        this.removeChild(index)
      }
    }
  }

  moveToScreen(screen: Screen | null) {
    super.moveToScreen(screen)

    for (const child of this.#children) {
      child.moveToScreen(this.screen)
    }
  }
}
