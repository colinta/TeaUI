"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scrollable = void 0;
const Container_1 = require("../Container");
const geometry_1 = require("../geometry");
const Style_1 = require("../Style");
/**
 * Scrollable is meant to scroll _a single view_, ie a Stack view. But all the
 * container views are optimized to check their _visibleRect_, and won't render
 * children that are not in view, saving some CPU cycles.
 */
class Scrollable extends Container_1.Container {
    #showScrollbars = true;
    #scrollHeight = 1;
    #contentOffset;
    #contentSize = geometry_1.Size.zero;
    #visibleSize = geometry_1.Size.zero;
    #prevMouseDown = undefined;
    constructor(props) {
        super(props);
        this.#contentOffset = { x: 0, y: 0 };
        this.#update(props);
    }
    update(props) {
        this.#update(props);
        super.update(props);
    }
    #update({ scrollHeight, showScrollbars }) {
        this.#showScrollbars = showScrollbars ?? true;
        this.#scrollHeight = scrollHeight ?? 1;
    }
    naturalSize(available) {
        const size = super.naturalSize(available);
        return size.withHeight(available.height);
    }
    #maxOffsetX() {
        const tooTall = this.#contentSize.height > this.contentSize.height;
        return this.#visibleSize.width - this.#contentSize.width + (tooTall ? 0 : 1);
    }
    #maxOffsetY() {
        const tooWide = this.#contentSize.width > this.contentSize.width;
        return (this.#visibleSize.height - this.#contentSize.height + (tooWide ? 0 : 1));
    }
    receiveMouse(event) {
        if (event.name === 'mouse.wheel.up' || event.name === 'mouse.wheel.down') {
            this.receiveWheel(event);
            return;
        }
        if (event.name === 'mouse.button.up') {
            this.#prevMouseDown = undefined;
            return;
        }
        const tooWide = this.#contentSize.width > this.contentSize.width;
        const tooTall = this.#contentSize.height > this.contentSize.height;
        if (tooWide &&
            tooTall &&
            event.position.y === this.contentSize.height - 1 &&
            event.position.x === this.contentSize.width - 1) {
            // bottom-right corner click
            return;
        }
        if (this.#prevMouseDown === undefined) {
            if (tooWide && event.position.y === this.contentSize.height) {
                this.#prevMouseDown = 'horizontal';
            }
            else if (tooTall && event.position.x === this.contentSize.width) {
                this.#prevMouseDown = 'vertical';
            }
            else {
                return;
            }
        }
        this.receiveMouseDown(event);
    }
    receiveMouseDown(event) {
        const tooWide = this.#contentSize.width > this.contentSize.width;
        const tooTall = this.#contentSize.height > this.contentSize.height;
        if (tooWide && this.#prevMouseDown === 'horizontal') {
            const maxX = this.#maxOffsetX();
            const offsetX = Math.round((0, geometry_1.interpolate)(event.position.x, [0, this.contentSize.width - (tooTall ? 1 : 0)], [0, maxX]));
            this.#contentOffset = {
                x: Math.max(maxX, Math.min(0, offsetX)),
                y: this.#contentOffset.y,
            };
        }
        else if (tooTall && this.#prevMouseDown === 'vertical') {
            const maxY = this.#maxOffsetY();
            const offsetY = Math.round((0, geometry_1.interpolate)(event.position.y, [0, this.contentSize.height - (tooWide ? 1 : 0)], [0, maxY]));
            this.#contentOffset = {
                x: this.#contentOffset.x,
                y: Math.max(maxY, Math.min(0, offsetY)),
            };
        }
    }
    receiveWheel(event) {
        let delta = 0;
        if (event.name === 'mouse.wheel.up') {
            delta = this.#scrollHeight * -1;
        }
        else if (event.name === 'mouse.wheel.down') {
            delta = this.#scrollHeight;
        }
        const tooTall = (this.#contentSize?.height ?? 0) > this.contentSize.height;
        if (event.ctrl) {
            delta *= 5;
        }
        if (event.shift || !tooTall) {
            this.scrollBy(-delta, 0);
        }
        else {
            this.scrollBy(0, delta);
        }
    }
    /**
     * Moves the visible region. The visible region is stored as a pointer to the
     * top-most row and an offset from the top of that row (see `interface ContentOffset`)
     *
     * Positive offset scrolls *down* (currentOffset goes more negative)
     *
     * When current cell is entirely above the top, we set the `contentOffset` to the
     * row that is at the top of the screen and still visible, similarly if the current
     * cell is below the top, we fetch enough rows about and update the `contentOffset`
     * to point to the top-most row.
     */
    scrollBy(offsetX, offsetY) {
        if (offsetX === 0 && offsetY === 0) {
            return;
        }
        const tooWide = this.#contentSize.width > this.contentSize.width;
        const tooTall = this.#contentSize.height > this.contentSize.height;
        let { x, y } = this.#contentOffset;
        const maxX = this.#maxOffsetX();
        const maxY = this.#maxOffsetY();
        x = Math.min(0, Math.max(maxX, x - offsetX));
        y = Math.min(0, Math.max(maxY, y - offsetY));
        this.#contentOffset = { x, y };
    }
    get contentSize() {
        const delta = this.#showScrollbars ? 1 : 0;
        return super.contentSize.shrink(delta, delta);
    }
    render(viewport) {
        if (viewport.isEmpty) {
            return super.render(viewport);
        }
        viewport.registerMouse('mouse.wheel');
        let contentSize = geometry_1.Size.zero.mutableCopy();
        for (const child of this.children) {
            const childSize = child.naturalSize(viewport.contentSize);
            contentSize.width = Math.max(contentSize.width, childSize.width);
            contentSize.height = Math.max(contentSize.height, childSize.height);
        }
        this.#contentSize = contentSize;
        const tooWide = contentSize.width > viewport.contentSize.width;
        const tooTall = contentSize.height > viewport.contentSize.height;
        // #contentOffset is _negative_ (indicates the amount to move the view away
        // from the origin, which will always be up/left of 0,0)
        const outside = new geometry_1.Rect([this.#contentOffset.x, this.#contentOffset.y], viewport.contentSize
            .shrink(this.#contentOffset.x, this.#contentOffset.y)
            .shrink(this.#showScrollbars && tooTall ? 1 : 0, this.#showScrollbars && tooWide ? 1 : 0));
        viewport.clipped(outside, inside => {
            for (const child of this.children) {
                child.render(inside);
            }
        });
        this.#visibleSize = viewport.visibleRect.size.shrink(tooWide ? 1 : 0, tooTall ? 1 : 0);
        if (this.#showScrollbars && (tooWide || tooTall)) {
            const scrollBar = new Style_1.Style({
                foreground: this.theme.darkenColor,
                background: this.theme.darkenColor,
            });
            const scrollControl = new Style_1.Style({
                foreground: this.theme.highlightColor,
                background: this.theme.highlightColor,
            });
            // scrollMaxX: x of the last column of the view
            // scrollMaxY: y of the last row of the view
            // scrollMaxHorizX: horizontal scroll bar is drawn from 0 to scrollMaxHorizX
            // scrollMaxHorizY: vertical scroll bar is drawn from 0 to scrollMaxHorizY
            const scrollMaxX = viewport.contentSize.width - 1, scrollMaxY = viewport.contentSize.height - 1, scrollMaxHorizX = scrollMaxX - (tooTall ? 1 : 0), scrollMaxVertY = scrollMaxY - (tooWide ? 1 : 0);
            if (tooWide && tooTall) {
                viewport.write('█', new geometry_1.Point(scrollMaxX, scrollMaxY), scrollBar);
            }
            if (tooWide) {
                viewport.registerMouse('mouse.button.left', new geometry_1.Rect(new geometry_1.Point(0, scrollMaxY), new geometry_1.Size(scrollMaxHorizX + 1, 1)));
                const contentOffsetX = -this.#contentOffset.x;
                const viewX = Math.round((0, geometry_1.interpolate)(contentOffsetX, [
                    0,
                    contentSize.width -
                        viewport.contentSize.width +
                        (tooTall ? 1 : 0),
                ], [0, scrollMaxHorizX]));
                for (let x = 0; x <= scrollMaxHorizX; x++) {
                    const inRange = x === viewX;
                    viewport.write(inRange ? '█' : ' ', new geometry_1.Point(x, scrollMaxY), inRange ? scrollControl : scrollBar);
                }
            }
            if (tooTall) {
                viewport.registerMouse('mouse.button.left', new geometry_1.Rect(new geometry_1.Point(scrollMaxX, 0), new geometry_1.Size(1, scrollMaxVertY + 1)));
                const contentOffsetY = -this.#contentOffset.y;
                const viewY = Math.round((0, geometry_1.interpolate)(contentOffsetY, [
                    0,
                    contentSize.height -
                        viewport.contentSize.height +
                        (tooWide ? 1 : 0),
                ], [0, scrollMaxVertY]));
                for (let y = 0; y <= scrollMaxVertY; y++) {
                    const inRange = y === viewY;
                    viewport.write(inRange ? '█' : ' ', new geometry_1.Point(scrollMaxX, y), inRange ? scrollControl : scrollBar);
                }
            }
        }
    }
}
exports.Scrollable = Scrollable;
//# sourceMappingURL=Scrollable.js.map