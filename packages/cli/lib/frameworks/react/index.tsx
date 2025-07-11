import React from 'react'
import {interceptConsoleLog, type Screen} from '@teaui/core'
import {Button, ConsoleLog, Separator, Space, Stack, run} from '@teaui/react'

function App() {
  function onExit() {
    screen?.exit()
  }

  const name = '{{name}}'

  return (
    <Stack.down>
      <Stack.down flex={1}>
        Hello to "{name}"
        <Separator direction="horizontal" border="trailing" padding={1} />
        <Space flex={1} />
        <Button title="Exit" onClick={onExit} />
        <Space flex={1} />
      </Stack.down>
      <ConsoleLog height={10} />
    </Stack.down>
  )
}

let screen: Screen | undefined
;(async () => {
  interceptConsoleLog()

  const [screen_] = await run(<App />)
  screen = screen_
})()
