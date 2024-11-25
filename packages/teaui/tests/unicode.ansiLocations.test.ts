import test from 'ava'
import {ansiLocations} from '../lib/sys/unicode'

// desc, input, expected w/ last, expected without last
const specs = [] as [string, string, any, any][]

specs.push([
  'begin only',
  '\x1b[30mundefined',
  [
    {start: 0, stop: 5, ansi: '\x1b[30m'},
    {start: 14, stop: 14, ansi: ''},
  ],
  [{start: 0, stop: 5, ansi: '\x1b[30m'}],
])

specs.push([
  'middle only',
  'test-\x1b[30m-ing',
  [
    {start: 5, stop: 10, ansi: '\x1b[30m'},
    {start: 14, stop: 14, ansi: ''},
  ],
  [{start: 5, stop: 10, ansi: '\x1b[30m'}],
])

specs.push([
  'end only',
  'undefined\x1b[0m',
  [{start: 9, stop: 13, ansi: '\x1b[0m'}],
  [{start: 9, stop: 13, ansi: '\x1b[0m'}],
])

specs.push([
  'begin & end',
  '\x1b[30mundefined\x1b[31m',
  [
    {start: 0, stop: 5, ansi: '\x1b[30m'},
    {start: 14, stop: 19, ansi: '\x1b[31m'},
  ],
  [
    {start: 0, stop: 5, ansi: '\x1b[30m'},
    {start: 14, stop: 19, ansi: '\x1b[31m'},
  ],
])

specs.push([
  'multiple begin & end',
  '\x1b[30;40mundefined\x1b[31;41m',
  [
    {start: 0, stop: 8, ansi: '\x1b[30;40m'},
    {start: 17, stop: 25, ansi: '\x1b[31;41m'},
  ],
  [
    {start: 0, stop: 8, ansi: '\x1b[30;40m'},
    {start: 17, stop: 25, ansi: '\x1b[31;41m'},
  ],
])

for (const [desc, input, expectedWithLast, expectedWithoutLast] of specs) {
  test(`${desc} ▹ includeLast:true`, t => {
    const locations = ansiLocations(input, true)
    t.deepEqual(locations, expectedWithLast)
  })
  test(`${desc} ▹ includeLast:false`, t => {
    const locations = ansiLocations(input, false)
    t.deepEqual(locations, expectedWithoutLast)
  })
}
