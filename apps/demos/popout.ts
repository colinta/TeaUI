import {Box, Text} from '@teaui/core'

import {demo} from './demo'

demo(
  new Box({
    border: 'popout',
    width: 10,
    height: 5,
    children: [new Text({text: ''})],
  }),
)
