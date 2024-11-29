import type {SGRTerminal} from '../lib/terminal'
import type {Color} from '../lib/Color'

export class TestTerminal implements SGRTerminal {
  chars = ''
  setForeground(_fg: Color) {}
  setBackground(_bg: Color) {}
  move(x: number, y: number) {
    this.x = x
    this.y = y
  }
  write(str: string) {
    console.info(`x: ${this.x}, y: ${this.y}: ${str}`)
  }

  cols: number = 5
  rows: number = 1
  x: number = 0
  y: number = 0
}
