"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wretched_1 = require("wretched");
const demo_1 = require("./demo");
const firstInput = new wretched_1.Input({
    text: "family: 👨‍👩‍👧‍👦 smiley: 😀 some other text that isn't very interesting.",
});
const dontClickMe = new wretched_1.Button({
    text: 'Not me!',
    onClick() {
        console.info("You DIDN'T");
        firstInput.removeFromParent();
    },
});
let drawer;
const changeLocation = new wretched_1.Button({
    text: 'Change Drawer Location',
    onClick() {
        switch (drawer.location) {
            case 'top':
                drawer.location = 'right';
                break;
            case 'right':
                drawer.location = 'bottom';
                break;
            case 'bottom':
                drawer.location = 'left';
                break;
            case 'left':
                drawer.location = 'top';
                break;
        }
    },
});
drawer = new wretched_1.Drawer({
    // theme: 'primary',
    drawer: new wretched_1.Text({
        maxWidth: 40,
        wrap: true,
        text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc consectetur molestie faucibus. Phasellus iaculis pellentesque felis eu fringilla. Ut in sollicitudin nisi. Praesent in mauris tortor. Nam interdum, magna eu pellentesque scelerisque, dui ipsum adipiscing ante, vel ullamcorper nisl sapien id arcu. Nullam egestas diam eu felis mollis sit amet cursus enim vehicula. Quisque eu tellus id erat pellentesque consequat. Maecenas fermentum faucibus magna, eget dictum nisi congue sed. Quisque a justo a nisi eleifend facilisis sit amet at augue. Sed a sapien vitae augue hendrerit porta vel eu ligula. Proin enim urna, faucibus in vestibulum tincidunt, commodo sit amet orci. Vestibulum ac sem urna, quis mattis urna. Nam eget ullamcorper ligula. Nam volutpat, arcu vel auctor dignissim, tortor nisi sodales enim, et vestibulum nulla dui id ligula. Nam ullamcorper, augue ut interdum vulputate, eros mauris lobortis sapien, ac sodales dui eros ac elit.`,
    }),
    content: wretched_1.Stack.down({
        children: [
            wretched_1.Stack.right({
                children: [
                    ['flex1', new wretched_1.Text({ text: 'flex1-left' })],
                    ['flex1', firstInput],
                    ['flex1', new wretched_1.Text({ text: 'flex1-right', alignment: 'right' })],
                ],
            }),
            wretched_1.Stack.right({
                children: [
                    ['flex3', new wretched_1.Text({ text: 'flex3-left' })],
                    [
                        'flex1',
                        new wretched_1.Input({
                            text: "family: 👨‍👩‍👧‍👦 smiley: 😀 some other text that isn't very interesting.",
                        }),
                    ],
                    ['flex3', new wretched_1.Text({ text: 'flex3-right', alignment: 'right' })],
                ],
            }),
            wretched_1.Stack.right({
                children: [
                    ['flex1', new wretched_1.Text({ text: 'flex1-left' })],
                    [
                        'flex3',
                        new wretched_1.Input({
                            text: "family: 👨‍👩‍👧‍👦 smiley: 😀 some other text that isn't very interesting.",
                        }),
                    ],
                    ['flex1', new wretched_1.Text({ text: 'flex1-right', alignment: 'right' })],
                ],
            }),
            [
                'flex1',
                new wretched_1.Box({
                    border: 'single',
                    children: [
                        wretched_1.Stack.right({
                            children: [
                                ['flex1', new wretched_1.Space()],
                                [
                                    'flex1',
                                    wretched_1.Stack.down([
                                        new wretched_1.Button({
                                            text: 'Click me!🙂',
                                            width: 'natural',
                                            onClick() {
                                                console.info('You did!');
                                            },
                                        }),
                                        new wretched_1.Space({ height: 1 }),
                                        dontClickMe,
                                    ]),
                                ],
                                ['flex1', new wretched_1.Space()],
                            ],
                        }),
                    ],
                }),
            ],
            changeLocation,
        ],
    }),
});
(0, demo_1.demo)(drawer);
//# sourceMappingURL=drawer.js.map