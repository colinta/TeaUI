import {Button, Stack, Separator, Space} from '@wretched-tui/wretched'

import {demo} from './demo'

demo(
  Stack.down({
    children: [
      new Separator({
        direction: 'horizontal',
        border: 'trailing',
        padding: 1,
      }),

      ['flex1', new Space()],
      Stack.right({
        children: Array(8)
          .fill(0)
          .map((_, index): ['flex1', Button] => [
            'flex1',
            new Button({
              height: 1,
              theme: 'primary',
              text: `Launch ${8 - index}`,
            }),
          ]),
      }),
      ['flex1', new Space()],
      new Button({
        height: 3,
        border: 'none',
        theme: 'proceed',
        text: 'Proceed',
      }),

      ['flex1', new Space()],
      new Button({
        height: 3,
        border: 'none',
        theme: 'cancel',
        text: 'Cancel',
      }),

      ['flex1', new Space()],
      new Button({
        height: 3,
        border: 'none',
        theme: 'secondary',
        text: 'Do it!',
      }),

      ['flex1', new Space()],
      new Button({theme: 'plain', height: 3, text: 'Do it!'}),
      new Button({theme: 'selected', height: 3, text: 'Do it!'}),
      ['flex1', new Space()],
      new Separator({
        direction: 'horizontal',
        border: 'trailing',
        padding: 1,
      }),
    ],
  }),
)
