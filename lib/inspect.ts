import {colorize, red} from './ansi'

let _debug = false
export function isDebugging(enabled?: boolean) {
  if (enabled !== undefined) {
    _debug = enabled
  }
  return _debug
}

function isEmpty(object: object) {
  for (const key in object) {
    return false
  }
  return true
}

export function inspect(
  value: any,
  wrap: boolean = true,
  recursionDepth = 0,
  visited = new Set(),
): string {
  if (value && (typeof value === 'object' || typeof value === 'function')) {
    if (visited.has(value)) {
      return red('[Circular]')
    } else {
      visited.add(value)
    }
  }

  if (recursionDepth >= 10) {
    return red('...')
  }

  if (value instanceof Set) {
    return `new Set(${inspect(
      Array.from(value.values()),
      wrap,
      recursionDepth,
      visited,
    )})`
  }

  if (value instanceof Map) {
    return `new Map(${inspect(value.entries(), wrap, recursionDepth, visited)})`
  }

  const tab = '  '.repeat(recursionDepth)
  const innerTab = tab + '  '

  if (
    value instanceof Object &&
    value.constructor !== Object &&
    isEmpty(value)
  ) {
    return `{${Object.entries(value)
      .map(([key, val]) => [
        inspect(key, wrap, recursionDepth + 1, visited),
        inspect(value, wrap, recursionDepth + 1, visited),
      ])
      .reduce((memo, [key, value]) => memo.concat(key + ': ' + value), [])
      .join(', ')}}`
  } else if (typeof value === 'string') {
    return colorize.string(value, recursionDepth > 0)
  } else if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value === undefined ||
    value === null
  ) {
    return colorize.format(value)
  } else if (typeof value === 'function') {
    return `function${value.name ? ` ${value.name}` : ''}() {…}`
  } else if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]'
    }

    const values = value.map(val =>
      inspect(val, wrap, recursionDepth + 1, visited),
    )
    const count = values.reduce((len, val) => len + val.length, 0)
    const newline = wrap && count > 100
    let inner: string
    if (newline) {
      inner = values.join(`,\n${innerTab}`)
    } else {
      inner = values.join(', ')
    }

    return newline ? `[\n${innerTab}${inner}\n${tab}]` : `[ ${inner} ]`
  }

  const name =
    value.constructor === undefined
      ? ''
      : value.constructor.name === 'Object'
      ? ''
      : value.constructor.name.concat(' ')
  const keys = Object.keys(value)
  if (keys.length === 0) {
    return '{}'
  }

  // weird ReactFiberNode one-off
  if ('$$typeof' in value && '_owner' in value) {
    const {_owner: _, ...remainder} = value
    return inspect(remainder, wrap, recursionDepth, visited)
  }

  const values = keys.map(
    key =>
      `${colorize.key(key)}: ${inspect(
        value[key],
        wrap,
        recursionDepth + 1,
        visited,
      )}`,
  )
  const count = values.reduce((len, val) => len + val.length, 0)
  const newline = wrap && count > 100
  let inner: string
  if (newline) {
    inner = values.join(`,\n${innerTab}`)
  } else {
    inner = values.join(', ')
  }

  return newline
    ? `${name}{\n${innerTab}${inner}\n${tab}}`
    : `${name}{ ${inner} }`
}
