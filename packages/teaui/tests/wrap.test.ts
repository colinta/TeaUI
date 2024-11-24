import test from 'ava'
import {wrap} from '../lib/util'

test('passes', t => {
  t.pass()
})

test('wrap', t => {
  const lines = wrap('\x1b[30mundefined', 1)
  t.deepEqual(
    lines,
    'undefined'.split('').map(letter => [letter, 1] as [string, number]),
  )
})
