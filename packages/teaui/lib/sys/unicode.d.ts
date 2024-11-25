/**
 * Returns the number of *cells* that the first character of the string takes up.
 *
 * "Cell" refers to a terminal space: ASCII characters take 1 cell, Emoji and Asian
 * characters take 2 cells. ANSI codes (\x1b[...) return 0.
 *
 * This code came straight from blessed, and includes snippets from
 * https://github.com/vangie/east-asian-width and
 * https://github.com/komagata/eastasianwidth (last updated ~2015)
 *
 * Note: does not check to make sure 'text' is only one character, but it is
 * expected to be. Use `lineWidth` (expects one line only) or `stringSize` (most
 * general use) for other use cases.
 */
export function charWidth(text: string): 0 | 1 | 2
/**
 * Returns the number of cells that the first line of the string takes up. Some
 * characters like 🙂 take up two cells in a terminal.
 */
export function lineWidth(text: string | string[]): number
/**
 * Return the cell width and height of the entire string. Width is the maximum
 * length of all the lines, and height is the number of lines. Assumes no lines
 * wrap.
 */
export function stringSize(text: string | string[]): {
  width: number
  height: number
}
/**
 * Returns the width and height of the entire string, wrapping lines to fix within
 * maxWidth.
 */
export function stringSize(
  text: string | string[],
  maxWidth: number,
): {width: number; height: number}
/**
 * Breaks the string up into graphemes: single ASCII/Emoji characters, and ANSI
 * sequences.
 */
export function printableChars(text: string): string[]
/**
 * @param input String or array of graphemes.
 * @returns [grapheme[], offset][] Array of tuples. Each tuple is an array of
 * graphemes (string[]) and starting string offset. ANSI codes are preserved by tagging their
 * location in the original string, and then inserting it back into the word
 * segements.
 */
export function words(input: string | string[]): [string[], number][]
/**
 * Returns an array of ranges ({start: number, stop: number, ansi: string})
 * indicating where the string includes ANSI sequences (including the sequence). With code from
 * https://github.com/chalk/ansi-regex/
 * @param input The string to scan.
 * @param includeLast If true, there will always be a range at the end of the
 * string, to make looping over the ranges easier.
 */
export function ansiLocations(
  input: string,
  includeLast?: boolean,
): {start: number; stop: number; ansi: string}[]
/**
 * Removes ANSI sequences (/\x1b[[\d;]+m/). With code from
 * https://github.com/chalk/ansi-regex/
 */
export function removeAnsi(input: string): string
/**
 * The current locale.
 * @default process.env.LANG
 */
export function getLocale(): string
/**
 * Assign the current locale. Affects word segmentation and character graphemes.
 * Does not re-render, this is meant to be called at startup before Screen.start()
 */
export function setLocale(value: string): void
