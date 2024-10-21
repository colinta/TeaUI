import {Box, Button, Drawer, Flex, Flow, Input, Space, Text} from 'wretched'

import {demo} from './demo'

const firstInput = new Input({
  text: "family: 👨‍👩‍👧‍👦 smiley: 😀 some other text that isn't very interesting.",
})

const dontClickMe = new Button({
  text: 'Not me!',
  onClick() {
    console.info("You DIDN'T")
    firstInput.removeFromParent()
  },
})

let drawer: Drawer
const changeLocation = new Button({
  text: 'Change Drawer Location',
  onClick() {
    switch (drawer.location) {
      case 'top':
        drawer.location = 'right'
        break
      case 'right':
        drawer.location = 'bottom'
        break
      case 'bottom':
        drawer.location = 'left'
        break
      case 'left':
        drawer.location = 'top'
        break
    }
  },
})

drawer = new Drawer({
  // theme: 'primary',
  drawerView: new Text({
    maxWidth: 40,
    wrap: true,
    text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc consectetur molestie faucibus. Phasellus iaculis pellentesque felis eu fringilla. Ut in sollicitudin nisi. Praesent in mauris tortor. Nam interdum, magna eu pellentesque scelerisque, dui ipsum adipiscing ante, vel ullamcorper nisl sapien id arcu. Nullam egestas diam eu felis mollis sit amet cursus enim vehicula. Quisque eu tellus id erat pellentesque consequat. Maecenas fermentum faucibus magna, eget dictum nisi congue sed. Quisque a justo a nisi eleifend facilisis sit amet at augue. Sed a sapien vitae augue hendrerit porta vel eu ligula. Proin enim urna, faucibus in vestibulum tincidunt, commodo sit amet orci. Vestibulum ac sem urna, quis mattis urna. Nam eget ullamcorper ligula. Nam volutpat, arcu vel auctor dignissim, tortor nisi sodales enim, et vestibulum nulla dui id ligula. Nam ullamcorper, augue ut interdum vulputate, eros mauris lobortis sapien, ac sodales dui eros ac elit.`,
  }),
  contentView: Flex.down({
    children: [
      Flex.right({
        children: [
          ['flex1', new Text({text: 'flex1-left'})],
          ['flex1', firstInput],
          ['flex1', new Text({text: 'flex1-right', alignment: 'right'})],
        ],
      }),
      Flex.right({
        children: [
          ['flex3', new Text({text: 'flex3-left'})],
          [
            'flex1',
            new Input({
              text: "family: 👨‍👩‍👧‍👦 smiley: 😀 some other text that isn't very interesting.",
            }),
          ],
          ['flex3', new Text({text: 'flex3-right', alignment: 'right'})],
        ],
      }),
      Flex.right({
        children: [
          ['flex1', new Text({text: 'flex1-left'})],
          [
            'flex3',
            new Input({
              text: "family: 👨‍👩‍👧‍👦 smiley: 😀 some other text that isn't very interesting.",
            }),
          ],
          ['flex1', new Text({text: 'flex1-right', alignment: 'right'})],
        ],
      }),
      [
        'flex1',
        new Box({
          border: 'single',
          children: [
            Flex.right({
              children: [
                ['flex1', new Space()],
                [
                  'flex1',
                  new Flow({
                    direction: 'topToBottom',
                    children: [
                      new Button({
                        text: 'Click me!🙂',
                        width: 'natural',
                        onClick() {
                          console.info('You did!')
                        },
                      }),
                      new Space({height: 1}),
                      dontClickMe,
                    ],
                  }),
                ],
                ['flex1', new Space()],
              ],
            }),
          ],
        }),
      ],
      changeLocation,
    ],
  }),
})

demo(drawer)
