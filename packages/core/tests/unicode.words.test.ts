import test from 'ava'
import {words} from '../lib/sys/unicode'

// desc, input, expected
const specs = [] as [string, string, any][]

function simpleWords(input: string) {
  return input.split(' ').reduce(
    ([acc, offset], word, index, words): [[string[], number][], number] => {
      acc.push([word.split(''), offset] as const)
      offset += word.length
      if (index < words.length - 1) {
        acc.push([[' '], offset] as const)
        offset += 1
      }
      return [acc, offset] as const
    },
    [[], 0] as [[string[], number][], number],
  )[0]
}

specs.push(['one word', 'word', simpleWords('word')])
specs.push(['two words', 'hello dolly', simpleWords('hello dolly')])
specs.push(['ansi+word', '\x1b[0mhello', [[['\x1b[0m', 'h', 'e', 'l', 'l', 'o'], 0]])

for (const [desc, input, expected] of specs) {
  test(`${desc}`, t => {
    const splitWords = words(input)
    t.deepEqual(splitWords, expected)
  })
}
