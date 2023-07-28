import {underline} from '../ansi';
import type {KeyEvent as WretchedKeyEvent} from '../sys'

export type KeyEvent = WretchedKeyEvent & {type: 'key'}
export type HotKey = {char: string; ctrl?: boolean; meta?: boolean; shift?: boolean}

export function isKeyPrintable(event: KeyEvent) {
  switch (event.name) {
    case 'up':
    case 'down':
    case 'left':
    case 'right':
    case 'pageup':
    case 'pagedown':
    case 'home':
    case 'end':
    case 'insert':
    case 'clear':
    case 'enter':
    case 'return':
    case 'escape':
    case 'tab':
    case 'delete':
    case 'backspace':
    case 'f1':
    case 'f2':
    case 'f3':
    case 'f4':
    case 'f1':
    case 'f2':
    case 'f3':
    case 'f4':
    case 'f1':
    case 'f2':
    case 'f3':
    case 'f4':
    case 'f5':
    case 'f5':
    case 'f6':
    case 'f7':
    case 'f8':
    case 'f9':
    case 'f10':
    case 'f11':
    case 'f12':
      return false
  }
  if ((event.char.codePointAt(0) ?? 0) < 32) {
    return false
  }
  return true
}

export const match = (key: HotKey, event: KeyEvent) => {
  if ((key.ctrl ?? false) !== event.ctrl) {
    return false
  }
  if ((key.meta ?? false) !== event.meta) {
    return false
  }
  if ((key.shift ?? false) !== event.shift) {
    return false
  }

  return key.char === event.name
}

export const styleTextForHotKey = (text: string, key: HotKey,) => {
  const alt = '⌥'
  const shift = '⇧'
  const ctrl = '⌃'
  let mod = ''

  if (key.ctrl) {
    mod += ctrl
  }
  if (key.meta) {
    mod += alt
  }
  if (key.shift) {
    mod += shift
  }

  return `${text} ${underline(mod + key.char)}`
}
