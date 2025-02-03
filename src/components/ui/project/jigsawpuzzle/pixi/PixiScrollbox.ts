/*
The MIT License (MIT)

Copyright (c) 2018 YOPEY YOPEY LLC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */
/*
Adapted to Pixi.JS v7 by GoldElysium
Modifications licensed under:
MIT License

Copyright (c) 2021 GoldElysium

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

/* eslint-disable @typescript-eslint/no-dupe-class-members,max-len */
import {
	Container, Graphics, type FederatedPointerEvent, type Application,
} from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import Penner from 'penner';
import type { Scrollbox, ScrollBoxOptions } from 'pixi-scrollbox';

const scrollboxOptions = {
	boxWidth: 100,
	boxHeight: 100,
	scrollbarSize: 10,
	scrollbarBackground: 14540253,
	scrollbarBackgroundAlpha: 1,
	scrollbarForeground: 8947848,
	scrollbarForegroundAlpha: 1,
	dragScroll: true,
	stopPropagation: true,
	scrollbarOffsetHorizontal: 0,
	scrollbarOffsetVertical: 0,
	underflow: 'top-left',
	fadeScrollbar: false,
	fadeScrollbarTime: 1000,
	fadeScrollboxWait: 3000,
	fadeScrollboxEase: 'easeInOutSine',
	passiveWheel: false,
	clampWheel: true,
};

interface FixedScrollBoxOptions extends ScrollBoxOptions {
	app: Application;
}

/**
 * pixi.js scrollbox: a masked content box that can scroll vertically or horizontally with scrollbars
 */
export default class PixiScrollbox extends Container implements Scrollbox {
	content: Viewport;

	scrollbar: Graphics;

	options: FixedScrollBoxOptions;

	ease: any;

	private _maskContent: Graphics;

	// @ts-ignore
	private tickerFunction: () => void;

	private _disabled = false;

	private fade: any;

	private _isScrollbarVertical: boolean = false;

	private _isScrollbarHorizontal: boolean = false;

	private _scrollWidth?: number;

	private _scrollHeight?: number;

	private scrollbarTop?: number;

	private scrollbarHeight?: number;

	private scrollbarLeft?: number;

	private scrollbarWidth?: number;

	private pointerDown?: { last: any; type: string } | null;

	constructor(options: FixedScrollBoxOptions) {
		super();
		this.options = { ...scrollboxOptions, ...options };
		if (options.overflow) {
			// eslint-disable-next-line no-multi-assign
			this.options.overflowX = this.options.overflowY = options.overflow;
		}
		// @ts-ignore
		this.ease = typeof this.options.fadeScrollboxEase === 'function' ? this.options.fadeScrollboxEase : Penner[this.options.fadeScrollboxEase ?? 'easeInOutSine'];

		this.content = super.addChild(new Viewport({
			passiveWheel: false,
			stopPropagation: this.options.stopPropagation,
			screenWidth: this.options.boxWidth,
			screenHeight: this.options.boxHeight,
			ticker: this.options.app.ticker,
			events: this.options.app.renderer.events,
		}));
		this.content
			.decelerate()
			.on('moved', () => this._drawScrollbars());

		// this.content.scrollbox = this;

		this.options.ticker = this.options.app.ticker;

		/**
				 * graphics element for drawing the scrollbars
				 * @type {PIXI.Graphics}
				 */
		this.scrollbar = super.addChild(new Graphics());
		this.scrollbar.eventMode = 'static';
		this.scrollbar.on('pointerdown', this.scrollbarDown, this);
		this.eventMode = 'static';
		this.on('pointermove', this.scrollbarMove, this);
		this.on('pointerup', this.scrollbarUp, this);
		this.on('pointercancel', this.scrollbarUp, this);
		this.on('pointerupoutside', this.scrollbarUp, this);
		this._maskContent = super.addChild(new Graphics());
		this.update();

		if (!this.options.noTicker) {
			// eslint-disable-next-line max-len
			this.tickerFunction = () => this.updateLoop(Math.min(this.options.ticker!.elapsedMS, 16.6667));
			this.options.ticker.add(this.tickerFunction);
		}
	}

	/**
		 * offset of horizontal scrollbar (in pixels)
		 * @type {number}
		 */
	get scrollbarOffsetHorizontal() {
		return this.options.scrollbarOffsetHorizontal!;
	}

	// eslint-disable-next-line @typescript-eslint/no-dupe-class-members
	set scrollbarOffsetHorizontal(value) {
		this.options.scrollbarOffsetHorizontal = value;
	}

	/**
		 * offset of vertical scrollbar (in pixels)
		 * @type {number}
		 */
	get scrollbarOffsetVertical() {
		return this.options.scrollbarOffsetVertical!;
	}

	set scrollbarOffsetVertical(value) {
		this.options.scrollbarOffsetVertical = value;
	}

	/**
		 * disable the scrollbox (if set to true this will also remove the mask)
		 * @type {boolean}
		 */
	get disable() {
		return this._disabled;
	}

	set disable(value) {
		if (this._disabled !== value) {
			this._disabled = value;
			this.update();
		}
	}

	/**
		 * call stopPropagation on any events that impact scrollbox
		 * @type {boolean}
		 */
	get stopPropagation() {
		return this.options.stopPropagation!;
	}

	set stopPropagation(value) {
		this.options.stopPropagation = value;
	}

	/**
		 * user may drag the content area to scroll content
		 * @type {boolean}
		 */
	get dragScroll() {
		return this.options.dragScroll!;
	}

	set dragScroll(value) {
		this.options.dragScroll = value;
		if (value) {
			this.content.drag();
		} else {
			this.content.plugins.remove('drag');
		}
		this.update();
	}

	/**
		 * width of scrollbox including the scrollbar (if visible)- this changes the size and not the scale of the box
		 * @type {number}
		 */
	get boxWidth() {
		return this.options.boxWidth!;
	}

	set boxWidth(value) {
		this.options.boxWidth = value;
		this.content.screenWidth = value;
		this.update();
	}

	/**
		 * sets overflowX and overflowY to (scroll, hidden, auto) changing whether the scrollbar is shown
		 * scroll = always show scrollbar
		 * hidden = hide overflow and do not show scrollbar
		 * auto = if content is larger than box size, then show scrollbar
		 * @type {string}
		 */
	get overflow() {
		return this.options.overflow!;
	}

	set overflow(value) {
		this.options.overflow = value;
		this.options.overflowX = value;
		this.options.overflowY = value;
		this.update();
	}

	/**
		 * sets overflowX to (scroll, hidden, auto) changing whether the scrollbar is shown
		 * scroll = always show scrollbar
		 * hidden = hide overflow and do not show scrollbar
		 * auto = if content is larger than box size, then show scrollbar
		 * @type {string}
		 */
	get overflowX() {
		return this.options.overflowX!;
	}

	set overflowX(value) {
		this.options.overflowX = value;
		this.update();
	}

	/**
		 * sets overflowY to (scroll, hidden, auto) changing whether the scrollbar is shown
		 * scroll = always show scrollbar
		 * hidden = hide overflow and do not show scrollbar
		 * auto = if content is larger than box size, then show scrollbar
		 * @type {string}
		 */
	get overflowY() {
		return this.options.overflowY!;
	}

	set overflowY(value) {
		this.options.overflowY = value;
		this.update();
	}

	/**
		 * height of scrollbox including the scrollbar (if visible) - this changes the size and not the scale of the box
		 * @type {number}
		 */
	get boxHeight() {
		return this.options.boxHeight!;
	}

	set boxHeight(value) {
		this.options.boxHeight = value;
		this.content.screenHeight = value;
		this.update();
	}

	/**
		 * scrollbar size in pixels
		 * @type {number}
		 */
	get scrollbarSize() {
		return this.options.scrollbarSize!;
	}

	set scrollbarSize(value) {
		this.options.scrollbarSize = value;
	}

	/**
		 * width of scrollbox less the scrollbar (if visible)
		 * @type {number}
		 * @readonly
		 */
	get contentWidth() {
		return this.options.boxWidth! - (this.isScrollbarVertical ? this.options.scrollbarSize! : 0);
	}

	/**
		 * height of scrollbox less the scrollbar (if visible)
		 * @type {number}
		 * @readonly
		 */
	get contentHeight() {
		return this.options.boxHeight! - (this.isScrollbarHorizontal ? this.options.scrollbarSize! : 0);
	}

	/**
		 * is the vertical scrollbar visible
		 * @type {boolean}
		 * @readonly
		 */
	get isScrollbarVertical() {
		return this._isScrollbarVertical;
	}

	/**
		 * is the horizontal scrollbar visible
		 * @type {boolean}
		 * @readonly
		 */
	get isScrollbarHorizontal() {
		return this._isScrollbarHorizontal;
	}

	/**
		 * top coordinate of scrollbar
		 */
	get scrollTop() {
		return this.content.top;
	}

	set scrollTop(top) {
		this.content.top = top;
		this._drawScrollbars();
	}

	/**
		 * left coordinate of scrollbar
		 */
	get scrollLeft() {
		return this.content.left;
	}

	set scrollLeft(left) {
		this.content.left = left;
		this._drawScrollbars();
	}

	/**
		 * width of content area
		 * if not set then it uses content.width to calculate width
		 */
	get scrollWidth() {
		return this._scrollWidth || this.content.width;
	}

	set scrollWidth(value) {
		this._scrollWidth = value;
	}

	/**
		 * height of content area
		 * if not set then it uses content.height to calculate height
		 */
	get scrollHeight() {
		return this._scrollHeight || this.content.height;
	}

	set scrollHeight(value) {
		this._scrollHeight = value;
	}

	/**
		 * draws scrollbars
		 * @private
		 */
	_drawScrollbars() {
		this.content.x = 0;

		// eslint-disable-next-line no-nested-ternary
		this._isScrollbarHorizontal = this.overflowX === 'scroll' ? true : ['hidden', 'none'].indexOf(this.overflowX) !== -1 ? false : this.scrollWidth > this.options.boxWidth!;
		// eslint-disable-next-line no-nested-ternary
		this._isScrollbarVertical = this.overflowY === 'scroll' ? true : ['hidden', 'none'].indexOf(this.overflowY) !== -1 ? false : this.scrollHeight > this.options.boxHeight!;
		this.scrollbar.clear();
		const options: any = {};
		options.left = 0;
		options.right = this.scrollWidth + (this._isScrollbarVertical ? this.options.scrollbarSize! : 0);
		options.top = 0;
		options.bottom = this.scrollHeight + (this.isScrollbarHorizontal ? this.options.scrollbarSize! : 0);
		const width = this.scrollWidth + (this.isScrollbarVertical ? this.options.scrollbarSize! : 0);
		const height = this.scrollHeight + (this.isScrollbarHorizontal ? this.options.scrollbarSize! : 0);
		this.scrollbarTop = (this.content.top / height) * this.boxHeight;
		this.scrollbarTop = this.scrollbarTop < 0 ? 0 : this.scrollbarTop;
		this.scrollbarHeight = (this.boxHeight / height) * this.boxHeight;
		this.scrollbarHeight = this.scrollbarTop + this.scrollbarHeight > this.boxHeight ? this.boxHeight - this.scrollbarTop : this.scrollbarHeight;
		this.scrollbarLeft = (this.content.left / width) * this.boxWidth;
		this.scrollbarLeft = this.scrollbarLeft < 0 ? 0 : this.scrollbarLeft;
		this.scrollbarWidth = (this.boxWidth / width) * this.boxWidth;
		this.scrollbarWidth = this.scrollbarWidth + this.scrollbarLeft > this.boxWidth ? this.boxWidth - this.scrollbarLeft : this.scrollbarWidth;
		if (this.isScrollbarVertical) {
			this.scrollbar
				.rect(this.boxWidth - this.scrollbarSize + this.options.scrollbarOffsetVertical!, 0, this.scrollbarSize, this.boxHeight)
				.fill({ color: this.options.scrollbarBackground, alpha: this.options.scrollbarBackgroundAlpha });
		}
		if (this.isScrollbarHorizontal) {
			this.scrollbar
				.rect(0, this.boxHeight - this.scrollbarSize + this.options.scrollbarOffsetHorizontal!, this.boxWidth, this.scrollbarSize)
				.fill({ color: this.options.scrollbarBackground, alpha: this.options.scrollbarBackgroundAlpha });
		}
		if (this.isScrollbarVertical) {
			this.scrollbar
				.rect(this.boxWidth - this.scrollbarSize + this.options.scrollbarOffsetVertical!, this.scrollbarTop, this.scrollbarSize, this.scrollbarHeight)
				.fill({ color: this.options.scrollbarBackground, alpha: this.options.scrollbarBackgroundAlpha });
		}
		if (this.isScrollbarHorizontal) {
			this.scrollbar
				.rect(this.scrollbarLeft, this.boxHeight - this.scrollbarSize + this.options.scrollbarOffsetHorizontal!, this.scrollbarWidth, this.scrollbarSize)
				.fill({ color: this.options.scrollbarBackground, alpha: this.options.scrollbarBackgroundAlpha });
		}
		// this.content.forceHitArea = new PIXI.Rectangle(0, 0 , this.boxWidth, this.boxHeight)
		this.activateFade();
	}

	/**
		 * draws mask layer
		 * @private
		 */
	_drawMask() {
		this._maskContent
			.rect(0, 0, this.boxWidth, this.boxHeight)
			.fill(0);
		this.content.mask = this._maskContent;
	}

	/**
		 * call when scrollbox content changes
		 */
	update() {
		this.content.mask = null;
		this._maskContent.clear();
		if (!this._disabled) {
			this._drawScrollbars();
			this._drawMask();
			// eslint-disable-next-line no-nested-ternary
			const direction = this.isScrollbarHorizontal && this.isScrollbarVertical ? 'all' : this.isScrollbarHorizontal ? 'x' : 'y';
			if (direction !== null) {
				if (this.options.dragScroll) {
					this.content.drag({
						clampWheel: this.options.clampWheel,
						direction,
					});
				}
				this.content.clamp({
					direction,
					underflow: this.options.underflow,
				});
			}
		}
	}

	/**
		 * called on each frame to update fade scrollbars (if enabled)
		 * @param {number} elapsed since last frame in milliseconds (usually capped at 16.6667)
		 */
	updateLoop(elapsed: number) {
		if (this.fade) {
			if (this.fade.wait > 0) {
				this.fade.wait -= elapsed;
				if (this.fade.wait <= 0) {
					// eslint-disable-next-line no-param-reassign
					elapsed += this.fade.wait;
				} else {
					return;
				}
			}
			this.fade.duration += elapsed;
			if (this.fade.duration >= this.options.fadeScrollbarTime!) {
				this.fade = null;
				this.scrollbar.alpha = 0;
			} else {
				this.scrollbar.alpha = this.ease(this.fade.duration, 1, -1, this.options.fadeScrollbarTime);
			}
			this.content.dirty = true;
		}
	}

	/**
		 * dirty value (used for optimizing draws) for underlying viewport (scrollbox.content)
		 * @type {boolean}
		 */
	get dirty() {
		return this.content.dirty;
	}

	set dirty(value) {
		this.content.dirty = value;
	}

	/**
		 * show the scrollbar and restart the timer for fade if options.fade is set
		 */
	activateFade() {
		if (!this.fade && this.options.fade) {
			this.scrollbar.alpha = 1;
			this.fade = {
				wait: this.options.fadeScrollboxWait,
				duration: 0,
			};
		}
	}

	/**
		 * handle pointer down on scrollbar
		 * @param {FederatedPointerEvent} e
		 * @private
		 */
	scrollbarDown(e: FederatedPointerEvent) {
		const local = this.toLocal(e.global);
		if (this.isScrollbarHorizontal) {
			if (local.y > this.boxHeight - this.scrollbarSize) {
				if (local.x >= this.scrollbarLeft! && local.x <= this.scrollbarLeft! + this.scrollbarWidth!) {
					this.pointerDown = {
						type: 'horizontal',
						last: local,
					};
				} else if (local.x > this.scrollbarLeft!) {
					this.content.left += this.content.worldScreenWidth;
					this.update();
				} else {
					this.content.left -= this.content.worldScreenWidth;
					this.update();
				}
				if (this.options.stopPropagation) {
					e.stopPropagation();
				}
				return;
			}
		}
		if (this.isScrollbarVertical) {
			if (local.x > this.boxWidth - this.scrollbarSize) {
				if (local.y >= this.scrollbarTop! && local.y <= this.scrollbarTop! + this.scrollbarWidth!) {
					this.pointerDown = {
						type: 'vertical',
						last: local,
					};
				} else if (local.y > this.scrollbarTop!) {
					this.content.top += this.content.worldScreenHeight;
					this.update();
				} else {
					this.content.top -= this.content.worldScreenHeight;
					this.update();
				}
				if (this.options.stopPropagation) {
					e.stopPropagation();
				}
			}
		}
	}

	/**
		 * handle pointer move on scrollbar
		 * @param {FederatedPointerEvent} e
		 * @private
		 */
	scrollbarMove(e: FederatedPointerEvent) {
		if (this.pointerDown) {
			if (this.pointerDown.type === 'horizontal') {
				const local = this.toLocal(e.global);
				const width = this.scrollWidth + (this.isScrollbarVertical ? this.options.scrollbarSize! : 0);
				this.scrollbarLeft! += local.x - this.pointerDown.last.x;
				// eslint-disable-next-line no-mixed-operators
				this.content.left = this.scrollbarLeft! / this.boxWidth * width;
				this.pointerDown.last = local;
				this.update();
			} else if (this.pointerDown.type === 'vertical') {
				const local = this.toLocal(e.global);
				const height = this.scrollHeight + (this.isScrollbarHorizontal ? this.options.scrollbarSize! : 0);
				this.scrollbarTop! += local.y - this.pointerDown.last.y;
				// eslint-disable-next-line no-mixed-operators
				this.content.top = this.scrollbarTop! / this.boxHeight * height;
				this.pointerDown.last = local;
				this.update();
			}
			if (this.options.stopPropagation) {
				e.stopPropagation();
			}
		}
	}

	/**
		 * handle pointer down on scrollbar
		 * @private
		 */
	scrollbarUp() {
		this.pointerDown = null;
	}

	/**
		 * resize the mask for the container
		 * @param {object} options
		 * @param {number} [options.boxWidth] width of scrollbox including scrollbar (in pixels)
		 * @param {number} [options.boxHeight] height of scrollbox including scrollbar (in pixels)
		 * @param {number} [options.scrollWidth] set the width of the inside of the scrollbox (leave null to use content.width)
		 * @param {number} [options.scrollHeight] set the height of the inside of the scrollbox (leave null to use content.height)
		 */
	resize(options: any) {
		this.options.boxWidth = typeof options.boxWidth !== 'undefined' ? options.boxWidth : this.options.boxWidth;
		this.options.boxHeight = typeof options.boxHeight !== 'undefined' ? options.boxHeight : this.options.boxHeight;
		if (options.scrollWidth) {
			this.scrollWidth = options.scrollWidth;
		}
		if (options.scrollHeight) {
			this.scrollHeight = options.scrollHeight;
		}
		this.content.resize(this.options.boxWidth, this.options.boxHeight, this.scrollWidth, this.scrollHeight);
		this.update();
	}

	/**
		 * ensure that the bounding box is visible
		 * @param {number} x - relative to content's coordinate system
		 * @param {number} y
		 * @param {number} width
		 * @param {number} height
		 */
	ensureVisible(x: number, y: number, width: number, height: number) {
		this.content.ensureVisible(x, y, width, height);
		this._drawScrollbars();
	}

	/**
		 * Redirecting addChild method to the Viewport to make it easy to wrap scrollbox into a react component,
		 * because the Viewport is the real container for child elements
		 * @param children
		 * @returns {*}
		 */
	// @ts-ignore
	addChild(...children: DisplayObject[]) {
		return this.content.addChild(...children);
	}

	/**
		 * Redirecting addChildAt methods to the Viewport to make it easy to wrap scrollbox into a react component,
		 * because the Viewport is the real container for child elements
		 * @param child
		 * @param index
		 * @returns {*}
		 */
	// @ts-ignore
	addChildAt(child: DisplayObject, index: number) {
		return this.content.addChildAt(child, index);
	}

	/**
		 * Redirecting removeChild methods to the Viewport to make it easy to wrap scrollbox into a react component,
		 * because the Viewport is the real container for child elements
		 * @param child
		 * @returns {*}
		 */
	// @ts-ignore
	removeChild(child: any) {
		return this.content.removeChild(child);
	}

	/**
		 * Redirecting swapChildren methods to the Viewport to make it easy to wrap scrollbox into a react component,
		 * because the Viewport is the real container for child elements
		 * @param child
		 * @param child2
		 */
	// @ts-ignore
	swapChildren(child: Container, child2: Container) {
		this.content.swapChildren(child, child2);
	}

	/**
		 * Redirecting getChildIndex methods to the Viewport to make it easy to wrap scrollbox into a react component,
		 * because the Viewport is the real container for child elements
		 * @param child
		 * @returns {*}
		 */
	getChildIndex(child: Container) {
		return this.content.getChildIndex(child);
	}

	/**
		 * Redirecting setChildIndex methods to the Viewport to make it easy to wrap scrollbox into a react component,
		 * because the Viewport is the real container for child elements
		 * @param child
		 * @param index
		 */
	// @ts-ignore
	setChildIndex(child: DisplayObject, index: number) {
		this.content.setChildIndex(child, index);
	}

	/**
		 * Redirecting getChildAt methods to the Viewport to make it easy to wrap scrollbox into a react component,
		 * because the Viewport is the real container for child elements
		 * @param index
		 * @returns {*}
		 */
	// @ts-ignore
	getChildAt(index: number) {
		return this.content.getChildAt(index);
	}

	/**
		 * Redirecting removeChildren methods to the Viewport to make it easy to wrap scrollbox into a react component,
		 * because the Viewport is the real container for child elements
		 * @param beginIndex
		 * @param endIndex
		 * @returns {*}
		 */
	removeChildren(beginIndex: number, endIndex: number) {
		return this.content.removeChildren(beginIndex, endIndex);
	}

	/**
		 * Redirecting sortChildren methods to the Viewport to make it easy to wrap scrollbox into a react component,
		 * because the Viewport is the real container for child elements
		 */
	// @ts-ignore
	sortChildren() {
		this.content.sortChildren();
	}
}
