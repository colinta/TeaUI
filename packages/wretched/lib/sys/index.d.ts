// Type definitions for wretched 1.0
// Project: https://github.com/colinta/wretched
// by Colin T.A. Gray
//
// Based on type definitions for blessed 0.1
// Project: https://github.com/chjj/blessed
// Definitions by: Bryn Austin Bellomy <https://github.com/brynbellomy>
//                 Steve Kellock <https://github.com/skellock>
//                 Max Brauer <https://github.com/mamachanko>
//                 Nathan Rajlich <https://github.com/TooTallNate>
//                 Daniel Berlanga <https://github.com/danikaze>
//                 Jeff Huijsmans <https://github.com/jeffhuys>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.1

/// <reference types="node" />

import {EventEmitter} from 'events'
import {Writable, Readable} from 'stream'
import type {ChildProcess} from 'child_process'

export type MouseAction =
  | 'mousemove'
  | 'mousedown'
  | 'mouseup'
  | 'wheeldown'
  | 'wheelup'
  | 'focus'
  | 'blur'
export type MouseButton = 'left' | 'middle' | 'right' | 'unknown'

export interface MouseEvent {
  name: 'mouse'
  type: string
  x: number
  y: number
  ctrl: boolean
  meta: boolean
  shift: boolean
  action: MouseAction
  button: MouseButton
}

export interface KeyEvent {
  /**
   * "Probably" the letter (a-z, etc) that was pressed. Blank (or nonsensical) for meta characters (escape, arrow keys, etc)
   * Also blank when ctrl/meta/shift are pressed
   */
  char: string
  /**
   * Named key, like "enter", "a", "escape", etc, or the printable character
   */
  name: string
  ctrl: boolean
  meta: boolean
  shift: boolean
  /**
   * The letter that was pressed, *plus* the modifiers (C-M-S- for control- meta- shift, always in that order)
   */
  full: string
}

interface IOptions {
  [name: string]: any
}

interface IHasOptions<T extends IOptions> {
  options: T
}

interface TputsOptions extends IOptions {
  terminal?: string | undefined
  extended?: boolean | undefined
  debug?: boolean | undefined
  termcap?: string | undefined
  terminfoFile?: string | undefined
  terminfoPrefix?: string | undefined
  termcapFile?: string | undefined
}

export class Tput implements IHasOptions<TputsOptions> {
  constructor(opts: TputsOptions)

  /**
   * Original options object.
   */
  options: TputsOptions

  debug: boolean
  padding: boolean
  extended: boolean
  printf: boolean
  termcap: string
  terminfoPrefix: string
  terminfoFile: string
  termcapFile: string
  error: Error
  terminal: string
  colors: number

  setup(): void
  term(is: any): boolean
  readTerminfo(term: string): string
  parseTerminfo(
    data: any,
    file: string,
  ): {
    header: {
      dataSize: number
      headerSize: number
      magicNumber: boolean
      namesSize: number
      boolCount: number
      numCount: number
      strCount: number
      strTableSize: number
      extended: {
        dataSize: number
        headerSize: number
        boolCount: number
        numCount: number
        strCount: number
        strTableSize: number
        lastStrTableOffset: number
      }
    }
    name: string
    names: string[]
    desc: string
    bools: any
    numbers: any
    strings: any
  }
}

export interface BlessedProgramOptions {
  input?: Readable | undefined
  output?: Writable | undefined
  zero?: boolean | undefined
  buffer?: boolean | undefined
  terminal?: string | undefined
  tput?: string | undefined
  debug?: boolean | undefined
  resizeTimeout?: boolean | undefined
}

export class BlessedProgram extends EventEmitter {
  type: string
  tput: Tput
  options: BlessedProgramOptions
  input: Readable
  output: Writable
  zero: boolean
  useBuffer: boolean
  x: number
  y: number
  savedX: number
  savedY: number
  cols: number
  rows: number
  scrollTop: number
  scrollBottom: number
  isOSXTerm: boolean
  isiTerm2: boolean
  isXFCE: boolean
  isTerminator: boolean
  isLXDE: boolean
  isVTE: boolean
  isRxvt: boolean
  isXterm: boolean
  tmux: boolean
  tmuxVersion: number

  constructor(options?: BlessedProgramOptions)

  setupTput(): void
  setTerminal(terminal: string): void
  has(name: string): boolean
  isTerminal(is: string): boolean

  listen(): void
  destroy(): void

  bindMouse(): void
  enableGpm(): void
  disableGpm(): void
  bindResponse(): void

  response(
    name: string,
    text: string,
    callback: Function,
    noBypass?: boolean,
  ): boolean
  response(name: string, callback?: Function): boolean

  write(text: string): boolean
  flush(): void
  print(text: string, attr?: boolean): boolean
  echo(text: string, attr?: boolean): boolean

  setx(x: number): boolean
  sety(y: number): boolean
  move(x: number, y: number): boolean
  omove(x: number, y: number): void
  rsetx(x: number): boolean
  rsety(y: number): boolean
  rmove(x: number, y: number): void

  simpleInsert(ch: string, i?: number, attr?: boolean): boolean
  repeat(ch: string, i?: number): string
  copyToClipboard(text: string): boolean

  cursorShape(shape: string, blink?: boolean): boolean
  cursorColor(color: string): boolean
  cursorReset(): boolean
  resetCursor(): boolean

  getTextParams(param: string, callback: Function): boolean
  getCursorColor(callback: Function): boolean

  nul(): boolean

  bell(): boolean
  bel(): boolean

  vtab(): boolean

  form(): boolean
  ff(): boolean

  backspace(): boolean
  kbs(): boolean

  tab(): boolean
  ht(): boolean

  shiftOut(): boolean
  shiftIn(): boolean

  return(): boolean
  cr(): boolean

  feed(): boolean
  newline(): boolean
  nl(): boolean

  index(): boolean
  ind(): boolean

  reverseIndex(): boolean
  reverse(): boolean
  ri(): boolean

  nextLine(): boolean
  reset(): boolean
  tabSet(): boolean

  saveCursor(key: string): boolean
  sc(key: string): boolean

  restoreCursor(key?: string, hide?: boolean): boolean
  rc(key?: string, hide?: boolean): boolean

  lsaveCursor(key?: string): void
  lrestoreCursor(key?: string, hide?: boolean): void

  lineHeight(): boolean

  charset(val?: string, level?: number): boolean

  enter_alt_charset_mode(): boolean
  as(): boolean
  smacs(): boolean

  exit_alt_charset_mode(): boolean
  ae(): boolean
  rmacs(): boolean

  setG(val: number): boolean

  setTitle(title: string): boolean

  resetColors(param?: string): boolean

  dynamicColors(param?: string): boolean

  selData(a: string, b: string): boolean

  cursorUp(param?: number): boolean
  cuu(param?: number): boolean
  up(param?: number): boolean

  cursorDown(param?: number): boolean
  cud(param?: number): boolean
  down(param?: number): boolean

  cursorForward(param?: number): boolean
  cuf(param?: number): boolean
  right(param?: number): boolean
  forward(param?: number): boolean

  cursorBackward(param?: number): boolean
  cub(param?: number): boolean
  left(param?: number): boolean
  back(param?: number): boolean

  cursorPos(row?: number, col?: number): boolean
  cup(row?: number, col?: number): boolean
  pos(row?: number, col?: number): boolean

  eraseInDisplay(param?: string): boolean
  ed(param?: string): boolean

  clear(): boolean

  eraseInLine(param?: string): boolean
  el(param?: string): boolean

  charAttributes(param: string, val?: boolean): boolean
  charAttributes(param: string[], val?: boolean): boolean

  style(attr: string | string[], enabled?: boolean): string
  text(text: string, attr: string): string
  setForeground(color: string, val?: boolean): boolean
  fg(color: string, val?: boolean): boolean

  setBackground(color: string, val?: boolean): boolean
  bg(color: string, val?: boolean): boolean

  deviceStatuses(
    param?: string,
    callback?: Function,
    dec?: boolean,
    noBypass?: boolean,
  ): boolean
  dsr(
    param?: string,
    callback?: Function,
    dec?: boolean,
    noBypass?: boolean,
  ): boolean

  getCursor(callback: Function): boolean
  saveReportedCursor(callback: Function): void

  restoreReportedCursor: () => boolean

  insertChars(param?: number): boolean
  ich(param?: number): boolean

  cursorNextLine(param?: number): boolean
  cnl(param?: number): boolean

  cursorPrecedingLine(param?: number): boolean
  cpl(param?: number): boolean

  cursorCharAbsolute(param?: number): boolean
  cha(param?: number): boolean

  insertLines(param?: number): boolean
  il(param?: number): boolean

  deleteLines(param?: number): boolean
  dl(param?: number): boolean

  deleteChars(param?: number): boolean
  dch(param?: number): boolean

  eraseChars(param?: number): boolean
  ech(param?: number): boolean

  charPosAbsolute(param?: number): boolean
  hpa(param?: number): boolean

  HPositionRelative(param?: number): boolean

  sendDeviceAttributes(param?: number, callback?: Function): boolean
  da(param?: number, callback?: Function): boolean

  linePosAbsolute(param?: number): boolean
  vpa(param?: number): boolean

  VPositionRelative(param?: number): boolean
  vpr(param?: number): boolean

  HVPosition(row?: number, col?: number): boolean
  hvp(row?: number, col?: number): boolean

  setMode(...args: string[]): boolean
  sm(...args: string[]): boolean

  decset(...args: string[]): boolean

  showCursor(): boolean

  alternateBuffer(): boolean
  smcup(): boolean
  alternate(): boolean

  resetMode(...args: string[]): boolean
  rm(...args: string[]): boolean

  decrst(...args: string[]): boolean

  hideCursor(): boolean
  civis(): boolean
  vi(): boolean
  cursor_invisible(): boolean
  dectcemh(): boolean

  normalBuffer(): boolean
  rmcup(): boolean

  enableMouse(): void
  disableMouse(): void

  setMouse(opt?: {}, enable?: boolean): void

  setScrollRegion(top: number, bottom: number): boolean
  csr(top: number, bottom: number): boolean
  decstbm(top: number, bottom: number): boolean

  saveCursorA(): boolean
  scA(): boolean

  restoreCursorA(): boolean
  rcA(): boolean

  cursorForwardTab(param?: number): boolean
  cht(param?: number): boolean

  scrollUp(param?: number): boolean
  su(param?: number): boolean

  scrollDown(param?: number): boolean
  sd(param?: number): boolean

  initMouseTracking(...args: string[]): boolean

  resetTitleModes(...args: string[]): boolean

  cursorBackwardTab(param?: number): boolean
  cbt(param?: number): boolean

  repeatPrecedingCharacter(param?: number): boolean
  rep(param?: number): boolean

  tabClear(param?: number): boolean
  tbc(param?: number): boolean

  mediaCopy(...args: string[]): boolean
  mc(...args: string[]): boolean

  mc0(): boolean
  print_screen(): boolean
  ps(): boolean

  mc5(): boolean
  prtr_on(): boolean
  po(): boolean

  mc4(): boolean
  prtr_off(): boolean
  pf(): boolean

  mc5p(): boolean
  prtr_non(): boolean
  p0(): boolean

  setResources(...args: string[]): boolean

  disableModifieres(...args: string[]): boolean

  setPointerMode(...args: string[]): boolean

  softReset(): boolean
  rs2(): boolean
  decstr(): boolean

  requestAnsiMode(param?: number): boolean
  decrqm(param?: number): boolean

  requestPrivateMode(param?: number): boolean
  decrqmp(param?: number): boolean

  setConformanceLevel(...args: string[]): boolean
  decscl(...args: string[]): boolean

  loadLEDs(param?: number): boolean
  decll(param?: number): boolean

  setCursorStyle(param?: string): boolean
  decscursr(param?: string): boolean

  setCharProtectionAttr(param?: number): boolean
  decsca(param?: number): boolean

  restorePrivateValues(...args: string[]): boolean

  setAttrInRectangle(...args: string[]): boolean
  deccara(...args: string[]): boolean

  savePrivateValues(...args: string[]): boolean

  manipulateWindow(...args: any[]): boolean

  getWindowSize(callback?: Function): boolean

  reverseAttrInRectangle(...args: string[]): boolean
  decrara(...args: string[]): boolean

  setTitleModeFeature(...args: string[]): boolean

  setWarningBellVolume(param?: number): boolean
  decswbv(param?: number): boolean

  setMarginBellVolume(param?: number): boolean

  copyRectangle(...args: string[]): boolean
  deccra(...args: string[]): boolean

  enableFilterRectangle(...args: string[]): boolean
  decefr(...args: string[]): boolean

  requestParameters(param?: number): boolean
  decreqtparm(param: number): boolean

  selectChangeExtent(param?: number): boolean
  decsace(param?: number): boolean

  fillRectangle(...args: string[]): boolean
  decfra(...args: string[]): boolean

  enableLocatorReporting(...args: string[]): boolean
  decelr(...args: string[]): boolean

  eraseRectangle(...args: string[]): boolean
  decera(...args: string[]): boolean

  setLocatorEvents(...args: string[]): boolean
  decsle(...args: string[]): boolean

  selectiveEraseRectangle(...args: string[]): boolean
  decsera(...args: string[]): boolean

  requestLocatorPosition(param?: string, callback?: Function): boolean
  reqmp(param?: string, callback?: Function): boolean
  req_mouse_pos(param?: string, callback?: Function): boolean
  decrqlp(param?: string, callback?: Function): boolean

  insertColumns(...args: string[]): boolean
  decic(...args: string[]): boolean

  deleteColumns(...args: string[]): boolean
  decdc(...args: string[]): boolean

  out(param: string, ...args: any[]): boolean

  sigtstp(callback?: Function): boolean

  pause(callback?: Function): Function

  resume: () => void

  on(event: 'mouse', fn: (data: MouseEvent) => void): this
  on(event: 'keypress', fn: (char: string, key: KeyEvent) => void): this
  on(event: 'resize' | 'focus' | 'blur', fn: () => void): this
  on(event: string, fn: (...args: any[]) => void): this

  once(event: 'mouse', fn: (data: MouseEvent) => void): this
  once(event: 'keypress', fn: (char: string, key: KeyEvent) => void): this
  once(event: 'resize' | 'focus' | 'blur', fn: () => void): this
  once(event: string, fn: (...args: any[]) => void): this

  off(event: 'mouse', fn: (data: MouseEvent) => void): this
  off(event: 'keypress', fn: (char: string, key: KeyEvent) => void): this
  off(event: 'resize' | 'focus' | 'blur', fn: () => void): this
  off(event: string, fn: (...args: any[]) => void): this

  key(
    key: string | string[],
    listener: (char: string, key: KeyEvent) => void,
  ): void
  onceKey(
    key: string | string[],
    listener: (char: string, key: KeyEvent) => void,
  ): void
  removeKey(key: string | string[], listener: Function): void
}

interface Program {
  (options?: Widgets.IScreenOptions): BlessedProgram
  global: BlessedProgram | undefined
}

export const program: Program

export const colors: {
  match(text: `#${string}`): number
  match(r: number, g: number, b: number): number
  match(rgb: [r: number, g: number, b: number]): number
  hexToRGB(text: string): [number, number, number]
  RGBtoHex(r: number, g: number, b: number): `#${string}`
  RGBtoHex(rgb: [r: number, g: number, b: number]): `#${string}`
  /**
   * RGB is in range 0..255, HSB is in range 0..1
   */
  RGBtoHSB(r: number, g: number, b: number): [number, number, number]
  RGBtoHSB(rgb: [r: number, g: number, b: number]): [number, number, number]
  /**
   * HSB is in range 0..1, RGB is in range 0..255
   */
  HSBtoRGB(h: number, s: number, v: number): [number, number, number]
  HSBtoRGB(hsv: [h: number, s: number, v: number]): [number, number, number]
  nameToIndex(name: string): number
  indexToRGB(index: number): [number, number, number]
  indexToHex(index: number): `#{string}`
  reduce(input: number, total: number): number
  toHex(input: number): string
}

export const unicode: {
  /**
   * Removes ANSI color/style sequences (/\x1b[[\d;]+m/)
   */
  removeAnsi(input: string): string
  /**
   * Returns the number of *cells* that the first character of the string takes up.
   *
   * "Cell" refers to a terminal space: ASCII characters take 1 cell, Emoji and Asian
   * characters take 2 cells. ANSI codes (\x1b[...) return 0.
   */
  charWidth(text: string, atIndex?: number): 0 | 1 | 2
  /**
   * Returns the number of *cells* that the first line of the string takes up.
   */
  lineWidth(text: string | string[]): number
  /**
   * Return the cell width and height of the entire string. Width is the maximum
   * length of all the lines, and height is the number of lines, assuming no lines
   * wrap.
   */
  stringSize(text: string | string[]): {width: number; height: number}
  /**
   * Return the width and height of the entire string, taking max-width into account.
   */
  stringSize(
    text: string | string[],
    maxWidth: number,
  ): {width: number; height: number}
  /**
   * Breaks the string up into graphemes: single ASCII characters, Emoji characters,
   * and ANSI sequences.
   */
  printableChars(text: string): string[]
  /**
   * @param input String or array of graphemes
   * @returns [graphemes, offset][] Array of tuples. Each tuple is an array of graphemes and the offset
   */
  words(input: string | string[]): [string[], number][]
  /**
   * The current locale. Uses `process.env.LANG`,
   * @default 'en'
   */
  locale: string
}
