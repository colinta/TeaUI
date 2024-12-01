import type {Viewport} from '../Viewport'
import type {Dimension, Props as ViewProps} from '../View'
import type {Color} from '../Color'
import {Style} from '../Style'
import {View} from '../View'
import {Size} from '../geometry'

interface Props extends ViewProps {
  background?: Color
}

export class Space extends View {
  background?: Color

  static horizontal(value: Dimension, extraProps: Props = {}) {
    return new Space({width: value, ...extraProps})
  }

  static vertical(value: Dimension, extraProps: Props = {}) {
    return new Space({height: value, ...extraProps})
  }

  constructor(props: Props = {}) {
    super(props)
    this.#update(props)
  }

  update(props: Props) {
    this.#update(props)
    super.update(props)
  }

  #update({background}: Props) {
    this.background = background
  }

  naturalSize(): Size {
    return Size.zero
  }

  #prev = this.background
  render(viewport: Viewport) {
    if (viewport.isEmpty) {
      return
    }

    if (!this.background) {
      return
    }

    if (this.#prev !== this.background) {
      this.#prev = this.background
    }
    const style = new Style({background: this.background})
    viewport.paint(style)
  }
}
