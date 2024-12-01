/**
 * colors.js - color-related functions for blessed.
 * Copyright (c) 2013-2015, Christopher Jeffrey and contributors (MIT License).
 * https://github.com/chjj/blessed
 */

var colorNames = {
  // special
  default: -1,
  // normal
  black: 0,
  red: 1,
  green: 2,
  yellow: 3,
  blue: 4,
  magenta: 5,
  cyan: 6,
  white: 7,
  grey: 8,
  gray: 8,
  brightRed: 9,
  brightGreen: 10,
  brightYellow: 11,
  brightBlue: 12,
  brightMagenta: 13,
  brightCyan: 14,
  brightWhite: 15,
}
export const nameToIndex = name => nameToIndex[name] ?? -1

export const toHex = function (n) {
  n = n.toString(16)
  if (n.length < 2) n = '0' + n
  return n
}

// Seed all 256 colors. Assume xterm defaults.
// Ported from the xterm color generation script.
const [indexToRGB_table, indexToHex_table] = (function () {
  var rgb = [],
    hex = [],
    r,
    g,
    b,
    i,
    l
  const xtermColors = [
    '#000000', // black
    '#800000', // red3
    '#008000', // green3
    '#808000', // yellow3
    '#000080', // blue2
    '#800080', // magenta3
    '#008080', // cyan3
    '#c0c0c0', // gray90
    '#808080', // gray50
    '#ff0000', // red
    '#00ff00', // green
    '#ffff00', // yellow
    '#0000ff', // rgb:5c/5c/ff
    '#ff00ff', // magenta
    '#00ffff', // cyan
    '#ffffff', // white
  ]

  function set(i, r, g, b) {
    rgb[i] = [r, g, b]
    hex[i] = '#' + toHex(r) + toHex(g) + toHex(b)
  }

  // 0 - 15
  xtermColors.forEach(function (c, i) {
    c = parseInt(c.substring(1), 16)
    set(i, (c >> 16) & 0xff, (c >> 8) & 0xff, c & 0xff)
  })

  // 16 - 231
  for (r = 0; r < 6; r++) {
    for (g = 0; g < 6; g++) {
      for (b = 0; b < 6; b++) {
        i = 16 + r * 36 + g * 6 + b
        set(i, r ? r * 40 + 55 : 0, g ? g * 40 + 55 : 0, b ? b * 40 + 55 : 0)
      }
    }
  }

  // 232 - 255 are grey.
  for (g = 0; g < 24; g++) {
    l = g * 10 + 8
    i = 232 + g
    set(i, l, l, l)
  }

  return [rgb, hex]
})()

export const indexToRGB = index => indexToRGB_table[~~index % 255]
export const indexToHex = index => indexToHex_table[~~index % 255]

const _cache = {}
export const match = function (r1, g1, b1, lookup) {
  if (typeof r1 === 'string') {
    const colorName = r1.replace(/[\- ]/g, '').toLowerCase()
    if (colorNames[colorName] != null) {
      return colorNames[colorName]
    }

    if (r1[0] !== '#') {
      return -1
    }

    const match = /^#([a-zA-Z0-9]+)\((\d+)\)$/.exec(r1)
    if (match) {
      return +match[2]
    }

    ;[r1, g1, b1] = hexToRGB(r1)
  } else if (Array.isArray(r1)) {
    ;(b1 = r1[2]), (g1 = r1[1]), (r1 = r1[0])
  }

  const hash = (r1 << 16) | (g1 << 8) | b1

  if (_cache[hash] !== undefined) {
    return _cache[hash]
  }

  // assign (or convert) lookup as a list of color index (using the 8-bit table)
  // 0-15: user configurable
  // 16-231: 6-bit color cube (16 === black, 231 === white)
  // 232-255: grayscale
  let setCache = false
  if (!lookup) {
    setCache = true
    // special handling for grayscale, uses black and grays from the color cube,
    // and the grayscale palette
    if (r1 === g1 && g1 === b1) {
      lookup = indexToRGB_table
        .slice(231, 256)
        .map((rgb, index) => [231 + index, rgb])
      lookup.push([16, [0, 0, 0]])
      lookup.push([59, [95, 95, 95]])
      lookup.push([102, [135, 135, 135]])
      lookup.push([139, [175, 135, 175]])
      lookup.push([145, [175, 175, 175]])
      lookup.push([188, [215, 215, 215]])
    } else {
      // default case: don't rely on colors 0-15, they are user-configurable
      lookup = indexToRGB_table.slice(16).map((rgb, index) => [16 + index, rgb])
    }
  } else {
    lookup = lookup.map((rgb, index) => [index, rgb])
  }

  var ldiff = Infinity,
    li = lookup[0][0]

  for (const [index, rgb] of lookup) {
    const r2 = rgb[0]
    const g2 = rgb[1]
    const b2 = rgb[2]

    const diff = colorDistance(r1, g1, b1, r2, g2, b2)

    if (diff === 0) {
      li = index
      break
    }

    if (diff < ldiff) {
      ldiff = diff
      li = index
    }
  }

  if (setCache) {
    _cache[hash] = li
  }
  return li
}

export const RGBtoHex = function (r, g, b) {
  if (Array.isArray(r)) {
    ;(b = r[2]), (g = r[1]), (r = r[0])
  }

  return '#' + toHex(r) + toHex(g) + toHex(b)
}

export const RGBtoHSB = function (r, g, b) {
  if (Array.isArray(r)) {
    ;(b = r[2]), (g = r[1]), (r = r[0])
  }

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    d = max - min,
    s = max === 0 ? 0 : d / max,
    v = max / 255

  let h
  switch (max) {
    case min:
      h = 0
      break
    case r:
      h = g - b + d * (g < b ? 6 : 0)
      h /= 6 * d
      break
    case g:
      h = b - r + d * 2
      h /= 6 * d
      break
    case b:
      h = r - g + d * 4
      h /= 6 * d
      break
  }

  return [h, s, v]
}

export const HSBtoRGB = function (h, s, v) {
  if (Array.isArray(h)) {
    ;(v = h[2]), (s = h[1]), (h = h[0])
  }

  const i = Math.floor(h * 6),
    f = h * 6 - i,
    p = v * (1 - s),
    q = v * (1 - f * s),
    t = v * (1 - (1 - f) * s)
  let r, g, b
  switch (i % 6) {
    case 0:
      ;(r = v), (g = t), (b = p)
      break
    case 1:
      ;(r = q), (g = v), (b = p)
      break
    case 2:
      ;(r = p), (g = v), (b = t)
      break
    case 3:
      ;(r = p), (g = q), (b = v)
      break
    case 4:
      ;(r = t), (g = p), (b = v)
      break
    case 5:
      ;(r = v), (g = p), (b = q)
      break
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

export const hexToRGB = function (hex) {
  if (hex[0] !== '#') {
    hex = '#' + hex
  }

  // #rgb
  if (hex.length === 4) {
    hex = hex[0] + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3]
  }

  var col = parseInt(hex.substring(1), 16),
    r = (col >> 16) & 0xff,
    g = (col >> 8) & 0xff,
    b = col & 0xff

  return [r, g, b]
}

// As it happens, comparing how similar two colors are is really hard. Here is
// one of the simplest solutions, which doesn't require conversion to another
// color space, posted on stackoverflow[1]. Maybe someone better at math can
// propose a superior solution.
// [1] http://stackoverflow.com/questions/1633828

function colorDistance(r1, g1, b1, r2, g2, b2) {
  // return (
  //   Math.pow(30 * (r1 - r2), 2) +
  //   Math.pow(59 * (g1 - g2), 2) +
  //   Math.pow(11 * (b1 - b2), 2)
  // )
  return Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
}

// Map higher colors to the first 8 colors.
// This allows translation of high colors to low colors on 8-color terminals.
const fourBitColors = (function () {
  const lookupCopy = indexToRGB_table.slice(0, 16)
  return indexToHex_table.map(color =>
    match(color, undefined, undefined, lookupCopy),
  )
})()

const threeBitColors = (function () {
  const lookupCopy = indexToRGB_table.slice(0, 8)
  return indexToHex_table.map(color =>
    match(color, undefined, undefined, lookupCopy),
  )
})()

export const reduce = function (color, total) {
  if (total <= 16) {
    return color >= 16 ? fourBitColors[color] : color
  } else if (total <= 8) {
    return color >= 8 ? threeBitColors[color] : color
  } else if (total <= 2) {
    return color % 2
  }

  return color
}
