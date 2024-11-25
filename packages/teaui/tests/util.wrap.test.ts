import test from 'ava'
import {wrap} from '../lib/util'

// desc, input, expected characters
const specs = [] as [string, string, any][]

specs.push([
  'width:1',
  'undefined',
  'undefined'.split('').map(char => [char, 1]),
])

specs.push([
  'width:1 w/ ansi',
  '\x1b[30mundefined',
  ['\x1b[30mu', ...'ndefined'.split('')].map(char => [char, 1]),
])

for (const [desc, input, expected] of specs) {
  test(`${desc}`, t => {
    const wrapped = wrap(input, 1)
    t.deepEqual(wrapped, expected)
  })
}
