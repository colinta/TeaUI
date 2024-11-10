# Wretched

I wanted a curses-style fullscreen application framework that could be powered by React. Check out https://github.com/colinta/wretched-react for the React renderer for Wretched.

### colors.ts

```
bun demo colors.ts
```

![example of output](https://raw.githubusercontent.com/colinta/wretched/9afe0235a7191a4b47568ef4e631ac1c3ab5829b/readme/colors.png)

### inputs.ts

```
bun demo inputs.ts
```

![example of output](https://raw.githubusercontent.com/colinta/wretched/9afe0235a7191a4b47568ef4e631ac1c3ab5829b/readme/inputs.png)

### demo code

```tsx
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

It's got way less "stuff" in it than _blessed_... but then again blessed had a truly mind-blowing amount of "stuff" to it.
