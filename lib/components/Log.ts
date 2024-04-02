import {fetchLogs, type Level, LogLine} from '../log'
import {centerPad} from '../util'
import {styled} from '../ansi'
import {Viewport} from '../Viewport'
import {View, type Props as ViewProps} from '../View'

import {Container} from '../Container'
import {Text} from './Text'
import {ScrollableList} from './ScrollableList'
import {Collapsible} from './Collapsible'
import {Flow} from './Flow'

export class Log extends Container {
  #logs: LogLine[] = []
  #scrollableList = new ScrollableList({
    scrollHeight: 10,
    items: this.#logs,
    cellForItem: log => {
      return new LogLineView(log)
    },
    keepAtBottom: true,
  })

  constructor(props: ViewProps = {}) {
    super(props)

    this.add(this.#scrollableList)
  }

  setLogs(logs: LogLine[]) {
    this.#logs = logs
    this.#scrollableList.updateItems(logs)
  }

  appendLog(log: LogLine) {
    this.#logs.push(log)
  }

  clear() {
    this.#logs = []
    this.#scrollableList.updateItems(this.#logs)
  }
}

interface LogLineViewProps {
  level: Level
  args: any[]
}

class LogLineView extends Container {
  constructor({level, args}: LogLineViewProps) {
    super({})

    let headerStyle: string
    switch (level) {
      case 'error':
        headerStyle = 'red bg'
        break
      case 'warn':
        headerStyle = 'yellow bg'
        break
      case 'info':
        headerStyle = 'white bg'
        break
      case 'debug':
        headerStyle = 'green bg'
        break
      default:
        headerStyle = 'white bg'
        break
    }

    const header = styled(
      centerPad(level.toUpperCase(), 7),
      `black fg;${headerStyle}`,
    )
    const lines = args.flatMap(arg => {
      return `${arg}`.split('\n').map(line => {
        switch (level) {
          case 'error':
            return styled(line, 'red fg')
          case 'warn':
            return styled(line, 'yellow fg')
          case 'info':
            return styled(line, 'white fg')
          case 'debug':
            return styled(line, 'green fg')
          default:
            return line
        }
      })
    })

    let logView: View
    const [firstLine, ..._] = lines
    if (lines.length > 1) {
      logView = new Collapsible({
        isCollapsed: false,
        collapsedView: new Text({
          text: firstLine,
          wrap: false,
        }),
        expandedView: new Text({
          lines: lines,
          wrap: true,
        }),
      })
    } else {
      logView = new Text({
        text: firstLine,
        wrap: true,
      })
    }

    this.add(
      new Flow({
        direction: 'leftToRight',
        spaceBetween: 1,
        children: [
          new Text({
            text: header,
            wrap: false,
          }),
          logView,
        ],
      }),
    )
  }
}

export class ConsoleLog extends Log {
  render(viewport: Viewport) {
    fetchLogs().forEach(log => this.appendLog(log))
    super.render(viewport)
  }
}
