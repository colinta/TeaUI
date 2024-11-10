import {Scrollable, Stack, Text} from '@wretched-tui/wretched'

import {demo} from './demo'

demo(
  new Scrollable({
    child: Stack.down({
      children: Array(100)
        .fill(0)
        .map(
          (_, index) =>
            new Text({
              text: (index % 2
                ? 'abcdefghijklmnopqrstuvwxyz'
                : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
              ).repeat(12),
            }),
        ),
    }),
  }),
)
