import type {BlessedProgram} from './sys'
import type {Style} from './Style'

export interface Terminal {
  writeChar(char: string, x: number, y: number, style: Style): void
  writeMeta(str: string): void
}

export type SGRTerminal = Pick<
  BlessedProgram,
  'cols' | 'rows' | 'move' | 'write' | 'on' | 'once' | 'flush'
>
