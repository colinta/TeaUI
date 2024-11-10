export type {MouseButton} from '../sys'
export type * from './mouse'
export * from './mouse'
export type * from './key'
export * from './key'
export type * from './window'
export * from './window'

import type {MouseEvent, SystemMouseEvent} from './mouse'
import type {KeyEvent} from './key'
import type {FocusEvent, ResizeEvent} from './window'

export type Event = MouseEvent | KeyEvent | FocusEvent | ResizeEvent
export type SystemEvent = SystemMouseEvent | KeyEvent | FocusEvent | ResizeEvent
