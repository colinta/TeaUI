import {
  Screen,
  TrackMouse,
  ConsoleLog,
  Stack,
  Window,
  type View,
  interceptConsoleLog,
} from '@wretched-tui/wretched'

export async function demo(
  demoContent: View,
  showConsoleLog: boolean | number = true,
) {
  interceptConsoleLog()

  process.title = 'Wretched'
  if (process.argv.includes('--no-log')) {
    showConsoleLog = false
  }

  const consoleLog = new ConsoleLog({
    height: typeof showConsoleLog === 'number' ? showConsoleLog : 10,
  })
  const [screen, program] = await Screen.start(
    async program => {
      // await iTerm2.setBackground(program, [23, 23, 23])

      return new Window({
        child: new TrackMouse({
          content: Stack.down({
            children: showConsoleLog
              ? [
                  ['flex1', demoContent],
                  ['natural', consoleLog],
                ]
              : [['flex1', demoContent]],
          }),
        }),
      })
    },
    {quitChar: 'q'},
  )

  program.key('escape', function () {
    consoleLog.clear()
    screen.render()
  })
}
