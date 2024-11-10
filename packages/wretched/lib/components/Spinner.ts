import type {Viewport} from '../Viewport'
import type {Props as ViewProps} from '../View'
import {View} from '../View'
import {Point, Size} from '../geometry'

interface Props extends ViewProps {
  isAnimating?: boolean
}

export class Spinner extends View {
  #isAnimating = false
  #tick = 0
  #frame = 0
  #frameLen = 1

  constructor({isAnimating, ...props}: Props = {}) {
    super(props)
    this.#update({isAnimating})
  }

  update({isAnimating, ...props}: Props) {
    super.update(props)
    this.#update(props)
  }

  #update({isAnimating}: Props) {
    this.#isAnimating = isAnimating ?? true
  }

  naturalSize() {
    return new Size(1, 1)
  }

  receiveTick(dt: number) {
    this.#tick = this.#tick + dt
    if (this.#tick > HZ) {
      this.#tick %= HZ
      this.#frame = (this.#frame + 1) % this.#frameLen
    }

    return true
  }

  render(viewport: Viewport) {
    if (viewport.isEmpty) {
      return
    }

    if (this.#isAnimating) {
      viewport.registerTick()
    }

    const char = ONE[this.#frame]
    viewport.write(char, Point.zero)
    this.#frameLen = ONE.length
  }
}

const ONE = ['⣾', '⣷', '⣯', '⣟', '⡿', '⢿', '⣻', '⣽'] as const
const HZ = 1000 / 10
