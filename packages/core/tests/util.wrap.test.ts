import test from 'ava'
import {wrap} from '../lib/util'
import {inspect} from '../lib/inspect'

// desc, input, expected characters
const specs = [] as [[string, number], string, any][]

// specs.push([
//   ['width:1', 1],
//   'undefined',
//   'undefined'.split('').map(char => [char, 1]),
// ])

// specs.push([
//   ['width:1 w/ ansi', 1],
//   '\x1b[30mundefined',
//   ['\x1b[30mu', ...'ndefined'.split('')].map(char => [char, 1]),
// ])

// specs.push([
//   ['width:2 w/ ansi', 2],
//   '\x1b[30mundefined.\x1b[31m',
//   ['\x1b[30mun', 'de', 'fi', 'ne', 'd.\x1b[31m'].map(char => [char, 2]),
// ])

specs.push([
  ['width:1 w/ lots of ansi', 1],
  inspect({a: 1, b: [2], c: '3'}),
  [
    '{',
    '\x1b[36ma\x1b[0m',
    ':',
    '\x1b[33m1\x1b[0m',
    ',',
    '\x1b[36mb\x1b[0m',
    ':',
    '[',
    '\x1b[33m2\x1b[0m',
    ']',
    ',',
    '\x1b[36mc\x1b[0m',
    ':',
    "\x1b[32m'",
    '3',
    "'\x1b[0m",
    '}',
  ].map(char => [char, 1]),
])

for (const [[desc, width], input, expected] of specs) {
  test(`${desc}`, t => {
    const actual = wrap(input, width)
    try {
      t.deepEqual(actual, expected)
    } catch (fail) {
      console.log('input:', input)
      console.log('expected:', expected)
      console.log('actual:', actual)
      throw fail
    }
  })
}
