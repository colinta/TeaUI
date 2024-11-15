import type {BlessedProgram} from './sys'
import {program as blessedProgram} from './sys'

import type {SGRTerminal} from './terminal'
import type {Rect, Point} from './geometry'
import {Size} from './geometry'
import {View} from './View'
import {Viewport} from './Viewport'
import {flushLogs} from './log'
import {Buffer} from './Buffer'
import type {
  HotKeyDef,
  KeyEvent,
  MouseEventListenerName,
  SystemEvent,
  SystemMouseEvent,
  SystemMouseEventName,
} from './events'
import {FocusManager} from './managers/FocusManager'
import {ModalManager} from './managers/ModalManager'
import {MouseManager} from './managers/MouseManager'
import {TickManager} from './managers/TickManager'
import {Window} from './components/Window'
import {System, UnboundSystem} from './System'

type ViewConstructor<T extends View> = (
  program: BlessedProgram,
) => T | Promise<T>

export class Screen {
  #program: SGRTerminal
  #onExit?: () => void

  rootView: View

  #buffer: Buffer
  #focusManager = new FocusManager()
  #modalManager = new ModalManager()
  #mouseManager = new MouseManager()
  #tickManager = new TickManager(() => this.render())

  static reset() {
    const program = blessedProgram({
      useBuffer: true,
      tput: true,
    })

    program.alternateBuffer()
    program.enableMouse()
    program.setMouse({sendFocus: true}, true)
    program.clear()
    program.disableMouse()
    program.showCursor()
    program.normalBuffer()
    flushLogs()
    process.exit(0)
  }

  static async start(): Promise<[Screen, BlessedProgram, Window]>

  static async start<T extends View>(
    viewConstructor: T | ViewConstructor<T>,
    opts: {
      quitChar?: 'c' | 'q' | '' | undefined | false
    },
  ): Promise<[Screen, BlessedProgram, T]>

  static async start<T extends View>(
    viewConstructor: T | ViewConstructor<T>,
  ): Promise<[Screen, BlessedProgram, T]>

  static async start<T extends View = Window>(
    viewConstructor: T | ViewConstructor<T> = new Window() as unknown as T,
    opts: {
      quitChar?: 'c' | 'q' | '' | undefined | false
    } = {quitChar: 'c'},
  ): Promise<[Screen, BlessedProgram, T]> {
    const program = blessedProgram({
      useBuffer: true,
      tput: true,
    })

    program.alternateBuffer()
    program.enableMouse()
    program.hideCursor()
    program.clear()
    program.setMouse({sendFocus: true}, true)

    // weird quirk of blessed - bind anything to 'keypress' before
    // attaching the screen or else I-don't-remember-what will happen.
    const fn = function () {}
    program.on('keypress', fn)
    program.off('keypress', fn)

    const rootView =
      viewConstructor instanceof View
        ? viewConstructor
        : await viewConstructor(program)

    const screen = new Screen(program, rootView)
    screen.onExit(() => {
      program.clear()
      program.disableMouse()
      program.showCursor()
      program.normalBuffer()
    })

    program.on('focus', function () {
      screen.trigger({type: 'focus'})
    })

    program.on('blur', function () {
      screen.trigger({type: 'blur'})
    })

    program.on('resize', function () {
      screen.trigger({type: 'resize'})
    })

    if (opts?.quitChar) {
      program.key(`C-${opts.quitChar}`, () => {
        screen.exit()
      })
    }

    program.on('keypress', (char, key) => {
      screen.trigger({type: 'key', ...key})
    })

    program.on('mouse', function (data) {
      let action = data.action
      if (action === 'focus' || action === 'blur') {
        return
      }
      if (data.button === 'unknown') {
        return
      }

      screen.trigger({
        ...data,
        name: translateMouseAction(action),
        type: 'mouse',
      })
    })

    screen.start()

    return [screen, program, rootView]
  }

  constructor(program: SGRTerminal, rootView: View) {
    this.#program = program
    this.#buffer = new Buffer()
    this.rootView = rootView

    Object.defineProperty(this, 'program', {
      enumerable: false,
    })
  }

  onExit(callback: () => void) {
    if (this.#onExit) {
      const prev = this.#onExit
      this.#onExit = () => {
        prev()
        callback()
      }
    } else {
      this.#onExit = callback
    }
  }

  start() {
    this.rootView.moveToScreen(this)
    this.render()
  }

  exit() {
    this.#tickManager.stop()
    this.rootView.moveToScreen(undefined)

    this.#onExit?.()
    flushLogs()
    process.exit(0)
  }

  trigger(event: SystemEvent) {
    switch (event.type) {
      case 'resize':
      case 'focus':
      case 'blur':
        break
      case 'key':
        this.triggerKeyboard(event)
        break
      case 'mouse': {
        this.triggerMouse(event)
        break
      }
    }

    this.render()
  }

  /**
   * Requests a modal. A modal will be created if:
   * (a) no modal is already displayed
   * or
   * (b) a modal is requesting a nested modal
   */
  requestModal(parent: View, modal: View, onClose: () => void, rect: Rect) {
    return this.#modalManager.requestModal(parent, modal, onClose, rect)
  }

  /**
   * @return boolean Whether the current view has focus
   */
  registerFocus(view: View): boolean {
    return this.#focusManager.registerFocus(view)
  }

  registerHotKey(view: View, key: HotKeyDef) {
    return this.#focusManager.registerHotKey(view, key)
  }

  requestFocus(view: View) {
    return this.#focusManager.requestFocus(view)
  }

  nextFocus() {
    this.#focusManager.nextFocus()
  }

  prevFocus() {
    this.#focusManager.prevFocus()
  }

  triggerKeyboard(event: KeyEvent) {
    event = translateKeyEvent(event)
    this.#focusManager.trigger(event)
  }

  /**
   * @see MouseManager.registerMouse
   */
  registerMouse(
    view: View,
    offset: Point,
    point: Point,
    eventNames: MouseEventListenerName[],
  ) {
    this.#mouseManager.registerMouse(view, offset, point, eventNames)
  }

  checkMouse(view: View, x: number, y: number) {
    this.#mouseManager.checkMouse(view, x, y)
  }

  triggerMouse(systemEvent: SystemMouseEvent): void {
    const system = new UnboundSystem(this.#focusManager)
    this.#mouseManager.trigger(systemEvent, system)
  }

  registerTick(view: View) {
    this.#tickManager.registerTick(view)
  }

  triggerTick(dt: number) {}

  preRender(view: View) {
    this.#modalManager.reset()
    this.#tickManager.reset()
    this.#mouseManager.reset()
    this.#focusManager.reset(view === this.rootView)
  }

  /**
   * @return boolean Whether or not to rerender the view due to focus or mouse change
   */
  commit() {
    const system = new UnboundSystem(this.#focusManager)
    const focusNeedsRender = this.#focusManager.commit()
    const mouseNeedsRender = this.#mouseManager.commit(system)
    return focusNeedsRender || mouseNeedsRender
  }

  needsRender() {
    this.#tickManager.needsRender()
  }

  render() {
    const screenSize = new Size(this.#program.cols, this.#program.rows)
    this.#buffer.resize(screenSize)

    // this may be called again by renderModals, before the last modal renders
    this.preRender(this.rootView)

    const size = this.rootView.naturalSize(screenSize).max(screenSize)
    const viewport = new Viewport(this, this.#buffer, size)
    this.rootView.render(viewport)
    const rerenderView = this.#modalManager.renderModals(this, viewport)
    const needsRerender = this.commit()

    // one -and only one- re-render if a change is detected to focus or mouse-hover
    if (needsRerender) {
      rerenderView.render(viewport)
    }

    this.#tickManager.endRender()

    this.#buffer.flush(this.#program)
  }
}

function translateMouseAction(
  action:
    | 'mousemove'
    | 'mousedown'
    | 'mouseup'
    | 'wheeldown'
    | 'wheelup'
    | 'wheelleft'
    | 'wheelright',
): SystemMouseEventName {
  switch (action) {
    case 'mousemove':
      return 'mouse.move.in'
    case 'mousedown':
      return `mouse.button.down`
    case 'mouseup':
      return `mouse.button.up`
    case 'wheeldown':
      return 'mouse.wheel.down'
    case 'wheelup':
      return 'mouse.wheel.up'
    case 'wheelleft':
      return 'mouse.wheel.left'
    case 'wheelright':
      return 'mouse.wheel.right'
  }
}

/**
 * These are mostly due to my own terminal keybindings; would be better to have
 * these configured in some .rc file.
 */
function translateKeyEvent(event: KeyEvent): KeyEvent {
  if (event.full === 'M-b') {
    return {
      type: 'key',
      full: 'M-left',
      name: 'left',
      ctrl: false,
      meta: true,
      shift: false,
      char: '1;9D',
    }
  }
  if (event.full === 'M-f') {
    return {
      type: 'key',
      full: 'M-right',
      name: 'right',
      ctrl: false,
      meta: true,
      shift: false,
      char: '1;9C',
    }
  }
  return event
}
