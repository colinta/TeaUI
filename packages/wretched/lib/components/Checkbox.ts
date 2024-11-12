import {unicode} from '../sys'

import type {Viewport} from '../Viewport'
import {type View} from '../View'
import {type Props as ContainerProps, Container} from '../Container'
import {Text} from './Text'
import {Rect, Point, Size} from '../geometry'
import {
  type HotKey,
  type MouseEvent,
  isMouseClicked,
  styleTextForHotKey,
} from '../events'
import {childTheme} from '../UI'
import {System} from '../System'

interface StyleProps {
  text?: string
  value: boolean
  onChange?: (value: boolean) => void
  hotKey?: HotKey
}

type Props = StyleProps & ContainerProps

export class Checkbox extends Container {
  #value: boolean = false
  #hotKey?: HotKey
  #onChange: StyleProps['onChange']
  #textView: Text

  constructor(props: Props) {
    super(props)

    this.#textView = new Text({alignment: 'center'})
    this.add(this.#textView)

    this.#update(props)
  }

  get value() {
    return this.#value
  }
  set value(value: boolean) {
    if (value === this.#value) {
      return
    }
    this.#value = value
    this.invalidateRender()
  }

  childTheme(view: View) {
    return childTheme(super.childTheme(view), this.isPressed, this.isHover)
  }

  update(props: Props) {
    this.#update(props)
    super.update(props)
  }

  #update({text, hotKey, value, onChange}: Props) {
    const styledText = hotKey ? styleTextForHotKey(text ?? '', hotKey) : text
    this.#textView.text = styledText ?? ''
    this.#value = value
    this.#hotKey = hotKey
    this.#onChange = onChange
  }

  get text() {
    return this.#textView?.text
  }

  set text(value: string | undefined) {
    const styledText = this.#hotKey
      ? styleTextForHotKey(value ?? '', this.#hotKey)
      : value
    this.#textView.text = styledText ?? ''
    this.invalidateSize()
  }

  naturalSize(available: Size): Size {
    return super.naturalSize(available).grow(BOX_WIDTH, 0)
  }

  receiveMouse(event: MouseEvent, system: System) {
    super.receiveMouse(event, system)

    if (isMouseClicked(event)) {
      this.#value = !this.#value
      this.#onChange?.(this.#value)
    }
  }

  render(viewport: Viewport) {
    if (viewport.isEmpty) {
      return super.render(viewport)
    }

    viewport.registerMouse(['mouse.button.left', 'mouse.move'])

    const uiStyle = this.theme.ui({
      isPressed: this.isPressed,
      isHover: this.isHover,
    })

    viewport.paint(uiStyle)

    const boxWidth = BOX_WIDTH
    const naturalSize = super.naturalSize(
      viewport.contentSize.shrink(boxWidth, 0),
    )
    const offset = new Point(
      boxWidth,
      Math.round((viewport.contentSize.height - naturalSize.height) / 2),
    )

    const box = this.boxChars()[this.#value ? 'checked' : 'unchecked']
    viewport.write(box, Point.zero, uiStyle)
    viewport.clipped(new Rect(offset, naturalSize), uiStyle, inside => {
      super.render(inside)
    })
  }

  boxChars(): Record<'unchecked' | 'checked', string> {
    return BOX.checkbox
  }
}

export class Radio extends Checkbox {
  boxChars(): Record<'unchecked' | 'checked', string> {
    return BOX.radio
  }
}

const BOX: Record<
  'checkbox' | 'radio',
  Record<'unchecked' | 'checked', string>
> = {
  checkbox: {
    unchecked: '☐ ',
    checked: '☑ ',
  },
  radio: {
    unchecked: '◯ ',
    checked: '⦿ ',
  },
}

const BOX_WIDTH = unicode.lineWidth(BOX.checkbox.unchecked)
