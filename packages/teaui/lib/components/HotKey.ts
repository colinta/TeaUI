import type {Viewport} from '../Viewport'
import {type Props as ContainerProps, Container} from '../Container'
import {Size} from '../geometry'
import {HotKey as HotKeyProp, toHotKeyDef} from '../events'

export interface Props extends ContainerProps {
  hotKey: HotKeyProp
}

export class HotKey extends Container {
  #hotKey: HotKeyProp = {char: ''}

  constructor(props: Props) {
    super(props)

    this.#update(props)
  }

  update(props: Props) {
    this.#update(props)
    super.update(props)
  }

  #update({hotKey}: Props) {
    this.#hotKey = hotKey
  }

  naturalSize(): Size {
    return Size.zero
  }

  render(viewport: Viewport) {
    if (viewport.isEmpty) {
      return super.render(viewport)
    }

    viewport.registerHotKey(toHotKeyDef(this.#hotKey))
  }
}
