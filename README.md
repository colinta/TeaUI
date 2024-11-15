# Wretched

I wanted a curses-style fullscreen application framework that could be powered by React.

This repo is organized as a pnpm. The main library is in `packages/wretched`, and the demo code is in `apps/demo`. There are also React and Preact renders.

### Demo: components

###### [apps/demo/components.ts](https://github.com/colinta/wretched/blob/master/apps/demos/components.ts)

```
pnpm demo components
```

![example of output](https://raw.githubusercontent.com/colinta/wretched/refs/heads/main/readme/components.png)

### Demo: colors.ts

###### [apps/demo/colors.ts](https://github.com/colinta/wretched/blob/master/apps/demos/colors.ts)

```
pnpm demo colors
```

![example of output](https://raw.githubusercontent.com/colinta/wretched/refs/heads/main/readme/colors.png)

### Demo: inputs.ts

###### [apps/demo/inputs.ts](https://github.com/colinta/wretched/blob/master/apps/demos/inputs.ts)

```
pnpm demo inputs.ts
```

![example of output](https://raw.githubusercontent.com/colinta/wretched/refs/heads/main/readme/inputs.png)

### Example using React

I'll use TypeScript's JSX support here, if you want to use something else go ahead.

###### tsconfig.json
```json
{
  "include": ["./"],
  "exclude": [".dist/"],
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "moduleResolution": "node",
    "declaration": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true,
    "skipLibCheck": true,
    "allowJs": true,
    "outDir": ".dist",
    "jsx": "react"
  }
}
```

```bash
pnpm install @wretched-tui/wretched @wretched-tui/react react @types/react
```

###### index.tsx
```tsx
import React, {useReducer} from 'react'
import {interceptConsoleLog} from '@wretched-tui/wretched'
import {
  Box,
  Button,
  Stack,
  run,
} from '@wretched-tui/react'

// Recommended:
interceptConsoleLog()

function App() {
  const [bang, goto10] = useReducer((state) => state + '!', '')

  return (
    <Box border="single">
      <Stack.down>
        First there was Ncurses{bang}
        <Button onClick={goto10}>Tell me more!</Button>
      </Stack.down>
    </Box>
  )
}

run(<App />)
```

```bash
pnpm tsc
node .dist/index.js
```

### Example using core Wretched

###### example.js
```javascript
import {Screen, Box, Stack, Text, Button, interceptConsoleLog} from '@wretched-tui/wretched'

// Recommended:
interceptConsoleLog()
// While the terminal is in full screen mode, you probably don't want to log
// debug info to stdout - it will appear wherever the cursor happens to be,
// and will clobber your output. You can mount the <ConsoleLog /> to view logs,
// otherwise when you exit (Ctrl-C) the logs will be flushed to stdout.

Screen.start(
  new Box({
    border: 'single',
    children: [
      Stack.down([
        new Text({text: 'First, there was Ncurses'}),
        new Button({text: 'Tell me more!'}),
      ]),
    ],
  }),
)
```

## History

First there was [Ncurses](https://en.wikipedia.org/wiki/Ncurses). Well wait, before Ncurses there was _Curses_, so first there was, ah wait, there was _termcap_, then _curses_, then ~Ncurses~ _pcurses_ and then Ncurses. tput and terminfo were in there somewhere, too.

Then came about twenty years of other stuff.

Then came [blessed](https://github.com/chjj/blessed), and it was really amazing! Look through the source and imagine writing all that by yourself. Mind blown.

Fast-forward a few years and Flexbox and React and declarative UI showed up, and blessed didn't notice or care by then.

And now comes `wretched`. I stripped down _blessed_ to only the tput/program/events/colors/unicode parts, and reimplemented React components and Stack layouts.

Enjoy!
