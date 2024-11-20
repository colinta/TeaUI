# TeaUI + React

See [TeaUI](https://github.com/colinta/teaui) for more info about
TeaUI itself. This library adds a React renderer/reconciler.

```tsx
import {useReducer} from 'react'
import {interceptConsoleLog} from '@teaui/core'
import {
  Box,
  Button,
  Stack,
  run,
} from '@teaui/react'

// Recommended:
interceptConsoleLog()

function App() {
  const [bang, goto10] = useReducer((state) => state + '!', '')

  return <Box border="single">
    <Stack.down>
      First there was Ncurses{bang}
      <Button onClick={goto10}>Tell me more!</Button>
    </Stack.down>
  </Box>
}

run()
```
