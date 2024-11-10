"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TickManager = void 0;
class TickManager {
    #render;
    #tickTimer;
    #tickViews = new Set();
    #needsRender = false;
    constructor(render) {
        this.#render = render;
    }
    reset() {
        this.#tickViews = new Set();
    }
    endRender() {
        if (!this.#tickViews.size) {
            this.#stop();
        }
        else if (this.#tickViews.size) {
            this.#start();
        }
    }
    stop() {
        this.#stop();
    }
    #start() {
        if (this.#tickTimer) {
            return;
        }
        let prevTime = Date.now();
        this.#tickTimer = setInterval(() => {
            const nextTime = Date.now();
            this.triggerTick(nextTime - (prevTime ?? nextTime));
            prevTime = nextTime;
        }, 16);
    }
    #stop() {
        if (!this.#tickTimer) {
            return;
        }
        clearInterval(this.#tickTimer);
        this.#tickTimer = undefined;
    }
    registerTick(view) {
        this.#tickViews.add(view);
    }
    needsRender() {
        this.#needsRender = true;
        this.#start();
    }
    triggerTick(dt) {
        let needsRender = this.#needsRender;
        for (const view of this.#tickViews) {
            needsRender = view.receiveTick(dt) || needsRender;
        }
        if (needsRender) {
            this.#render();
            this.#needsRender = false;
        }
    }
}
exports.TickManager = TickManager;
//# sourceMappingURL=TickManager.js.map