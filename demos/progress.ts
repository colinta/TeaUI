import {Button, Flow, Progress, Text} from 'wretched'

import {demo} from './demo'

const progressViews: Progress[] = []

progressViews.push(
  new Progress({
    direction: 'horizontal',
    width: 'fill',
    height: 5,
    progress: 0,
    theme: 'cancel',
  }),
)

progressViews.push(
  new Progress({
    direction: 'horizontal',
    width: 'fill',
    height: 1,
    progress: 0,
    theme: 'primary',
  }),
)

progressViews.push(
  new Progress({
    direction: 'horizontal',
    width: 'fill',
    height: 2,
    progress: 0,
    theme: 'secondary',
  }),
)

progressViews.push(
  new Progress({
    direction: 'vertical',
    width: 5,
    height: 20,
    progress: 0,
    theme: 'proceed',
  }),
)

progressViews.push(
  new Progress({
    direction: 'vertical',
    width: 1,
    height: 20,
    progress: 0,
    theme: 'selected',
  }),
)

progressViews.push(
  new Progress({
    direction: 'vertical',
    width: 2,
    height: 20,
    progress: 0,
  }),
)

class Timer {
  timerId: ReturnType<typeof setInterval> | undefined
  delta = 1
  value = 0

  constructor() {}

  toggle() {
    if (this.timerId) {
      this.stop()
    } else {
      this.start()
    }
  }

  start() {
    if (this.timerId) {
      return
    }

    this.timerId = setInterval(() => {
      this.value += this.delta
      if (this.value === 110) {
        this.delta = -1
      } else if (this.value === -10) {
        this.delta = 1
      }
      for (const progress of progressViews) {
        progress.progress = this.value
      }
    }, 10)
  }

  stop() {
    if (!this.timerId) {
      return
    }

    clearInterval(this.timerId)
    this.timerId = undefined
  }
}

const timer = new Timer()
timer.start()

const button = new Button({
  text: 'Pause',
  onClick() {
    timer.toggle()
  },
})

demo(
  Flow.down([
    ...progressViews.slice(0, 3),
    Flow.right(progressViews.slice(3)),
    button,
  ]),
)
