import {unicode} from '../sys'

import type {Viewport} from '../Viewport'
import type {Props as ViewProps} from '../View'
import {View} from '../View'
import {Style} from '../Style'
import {Point, Size} from '../geometry'
import {Alignment, FontFamily} from './types'
import {FONTS} from './fonts'
import {define} from '../util'

interface TextProps {
  text?: string
  lines?: undefined
}

interface LinesProps {
  text?: undefined
  lines: string[]
}

interface StyleProps {
  style?: Style
  alignment: Alignment
  wrap: boolean
  font?: FontFamily
}

type Props = Partial<StyleProps> & (TextProps | LinesProps) & ViewProps

const DEFAULTS = {
  alignment: 'left',
  wrap: false,
  font: 'default',
} as const

export class Text extends View {
  #style: StyleProps['style']
  #text: string = ''
  #lines: [string, number][] = []
  #alignment: StyleProps['alignment'] = DEFAULTS.alignment
  #wrap: StyleProps['wrap'] = DEFAULTS.wrap
  #wrappedLines?: [number, [string, number][]]
  #font: FontFamily = DEFAULTS.font

  constructor(props: Props = {}) {
    super(props)

    this.#update(props)

    define(this, 'text', {enumerable: true})
    define(this, 'font', {enumerable: true})
  }

  get text() {
    return this.#text
  }
  set text(value: string) {
    if (this.#text === value) {
      return
    }

    this.#updateLines(value, value.split('\n'), this.#font)
  }

  get font() {
    return this.#font
  }
  set font(value: FontFamily) {
    if (this.#font === value) {
      return
    }

    this.#updateLines(this.#text, undefined, value)
  }

  get style() {
    return this.#style
  }

  set style(value: Style | undefined) {
    if (this.#style === value) {
      return
    }

    this.#style = value
    this.invalidateRender()
  }

  update(props: Props) {
    this.#update(props)
    super.update(props)
  }

  #update({text, lines, style, alignment, wrap, font}: Props) {
    this.#style = style
    this.#alignment = alignment ?? DEFAULTS.alignment
    this.#wrap = wrap ?? DEFAULTS.wrap
    this.#updateLines(text, lines, font)
  }

  #updateLines(
    text: string | undefined,
    lines: string[] | undefined,
    font: FontFamily | undefined,
  ) {
    this.#font = font ?? DEFAULTS.font
    const fontMap = font && FONTS[font]

    if (text !== undefined) {
      this.#text = text
      lines = text === '' ? [] : text.split('\n')
    } else if (lines !== undefined) {
      this.#text = lines.join('\n')
    } else {
      this.#text = ''
      lines = []
    }

    this.#lines = lines.map(line => {
      if (fontMap) {
        line = [...line].map(c => fontMap.get(c) ?? c).join('')
      }

      return [line, unicode.lineWidth(line)]
    })
    this.#wrappedLines = undefined

    this.invalidateSize()
  }

  naturalSize(available: Size): Size {
    if (this.#lines.length === 0) {
      return Size.zero
    }

    return this.#lines.reduce((size, [, width]) => {
      if (this.#wrap) {
        const lineHeight = Math.ceil(width / available.width)
        size.width = Math.max(size.width, Math.min(width, available.width))
        size.height += lineHeight
        return size
      }

      size.width = Math.max(size.width, width)
      size.height += 1
      return size
    }, Size.zero.mutableCopy())
  }

  render(viewport: Viewport) {
    if (viewport.isEmpty) {
      return
    }

    let lines: [string, number][]
    if (this.#wrap) {
      lines = this.#wrapLines(viewport.contentSize.width, this.#lines)
      // cache for future render
      this.#wrappedLines = [viewport.contentSize.width, lines]
    } else {
      lines = this.#lines
    }

    const startingStyle: Style = this.#style ?? Style.NONE
    viewport.usingPen(startingStyle, pen => {
      const point = new Point(0, 0).mutableCopy()
      for (let [line, lineWidth] of lines) {
        if (!line.length) {
          point.y += 1
          continue
        }

        let didWrap = false
        if (this.#wrap) {
          lineWidth = Math.min(lineWidth, viewport.contentSize.width)
        }
        const offsetX =
          this.#alignment === 'left'
            ? 0
            : this.#alignment === 'center'
              ? ~~((viewport.contentSize.width - lineWidth) / 2)
              : viewport.contentSize.width - lineWidth
        point.x = offsetX
        for (const char of unicode.printableChars(line)) {
          const charWidth = unicode.charWidth(char)
          if (charWidth === 0) {
            // track the current style regardless of wether we are printing
            pen.mergePen(Style.fromSGR(char, startingStyle))
            continue
          }

          if (this.#wrap && point.x >= viewport.contentSize.width) {
            didWrap = true
            point.x = 0
            point.y += 1
          }

          if (didWrap && char.match(/\s/)) {
            continue
          }
          didWrap = false

          if (
            point.x >= viewport.visibleRect.minX() &&
            point.x + charWidth - 1 < viewport.visibleRect.maxX()
          ) {
            viewport.write(char, point)
          }

          point.x += charWidth
          // do not early exit when point.x >= maxX. 'line' may contain ANSI codes that
          // need to be picked up by mergePen.
        }

        point.y += 1
      }
    })
  }

  #wrapLines(
    contentWidth: number,
    lines: [string, number][],
  ): [string, number][] {
    if (contentWidth === 0) {
      return []
    }

    if (
      this.#wrap &&
      this.#wrappedLines &&
      this.#wrappedLines[0] === contentWidth
    ) {
      return this.#wrappedLines[1]
    }

    const wrapped = lines.flatMap(([line, width]): [string, number][] => {
      if (width <= contentWidth) {
        return [[line, width]]
      }

      const lines: [string, number][] = []
      let currentLine: string[] = []
      let currentWidth = 0
      const STOP = null

      function pushTrimmed(line: string) {
        const trimmed = line.replace(/\s+$/, '')
        lines.push([trimmed, unicode.lineWidth(trimmed)])
      }

      for (let [wordChars] of [...unicode.words(line), [STOP]]) {
        const wordWidth = wordChars ? unicode.lineWidth(wordChars) : 0
        if (
          (!currentWidth || currentWidth + wordWidth <= contentWidth) &&
          wordChars !== STOP
        ) {
          // there's enough room on the line (and it's not the sentinel STOP)
          // or the line is empty
          currentLine.push(...wordChars)
          currentWidth += wordWidth
        } else {
          if (currentWidth <= contentWidth) {
            pushTrimmed(currentLine.join(''))
            currentLine = []
            currentWidth = 0
          } else {
            // if currentLine is _already_ longer than contentWidth, wrap it, leaving the
            // remainder on currentLine
            do {
              let buffer = '',
                bufferWidth = 0
              for (let [index, char] of currentLine.entries()) {
                const charWidth = unicode.charWidth(char)
                if (bufferWidth + charWidth > contentWidth) {
                  pushTrimmed(buffer)

                  // scan past whitespace
                  while (currentLine[index]?.match(/^\s+$/)) {
                    index += 1
                  }
                  currentLine = currentLine.slice(index)
                  currentWidth = unicode.lineWidth(currentLine)
                  break
                }

                buffer += char
                bufferWidth += charWidth
              }
            } while (currentWidth > contentWidth)
          }

          if (wordChars) {
            // remove preceding whitespace if currentLine is empty
            if (currentLine.length === 0) {
              while (wordChars.length && wordChars[0].match(/^\s+$/)) {
                wordChars = wordChars.slice(1)
              }
            }
            currentLine.push(...wordChars)
            currentWidth = unicode.lineWidth(currentLine)
          }
        }
      }

      return lines
    })

    this.#wrappedLines = [contentWidth, wrapped]
    return wrapped
  }
}
