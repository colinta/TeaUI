import {unicode} from './sys'

let _debug = false
/**
 * A global function to turn debugging on/off, useful to test things that would
 * otherwise output way too much, ie console in render()
 */
export function debug(value?: boolean): boolean {
  return (_debug = value ?? _debug)
}

/**
 * Left pads (with spaces) according to terminal width
 */
export function leftPad(str: string, length: number): string {
  const lines = str.split('\n')
  if (lines.length > 1) {
    return lines.map(line => leftPad(line, length)).join('\n')
  }
  const width = unicode.lineWidth(str)
  if (width >= length) {
    return str
  }

  return ' '.repeat(length - width).concat(str)
}

/**
 * Right pads (with spaces) according to terminal width
 */
export function rightPad(str: string, length: number): string {
  const lines = str.split('\n')
  if (lines.length > 1) {
    return lines.map(line => rightPad(line, length)).join('\n')
  }
  const width = unicode.lineWidth(str)
  if (width >= length) {
    return str
  }

  return str.concat(' '.repeat(length - width))
}

/**
 * Center pads (with spaces) according to terminal width
 */
export function centerPad(str: string, length: number): string {
  const lines = str.split('\n')
  if (lines.length > 1) {
    return lines.map(line => centerPad(line, length)).join('\n')
  }
  const width = unicode.lineWidth(str)
  if (width >= length) {
    return str
  }

  const left = ' '.repeat(~~((length - width) / 2))
  const right = ' '.repeat(~~((length - width) / 2 + 0.5))
  return left.concat(str, right)
}

/**
 * Used to add {enumerable: true} to defined properties on Components, so they
 * are picked up by inspect().
 */
export function define<T extends object>(
  object: T,
  property: keyof T,
  attributes: PropertyDescriptor,
) {
  let kls = object
  do {
    const descriptor = Object.getOwnPropertyDescriptor(kls, property)
    if (descriptor) {
      const modified_descriptor = Object.assign(descriptor, attributes)
      Object.defineProperty(object, property, modified_descriptor)
      return
    } else {
      kls = Object.getPrototypeOf(kls)
    }
  } while (kls && kls !== Object.prototype)
}

export function wrap(input: string, contentWidth: number) {
  debugger
  const lines = input
    .split('\n')
    .map(line => [line, unicode.lineWidth(line)] as const)
  return lines.flatMap(([line, width]): [string, number][] => {
    debugger
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

          if (wordChars === STOP && currentLine.length) {
            pushTrimmed(currentLine.join(''))
            currentLine = []
            currentWidth = 0
          }
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
}
