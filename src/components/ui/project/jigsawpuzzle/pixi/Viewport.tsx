// eslint-disable-next-line max-classes-per-file
import {
	InputManager,
	IViewportOptions,
	Viewport,
} from 'pixi-viewport';
import { SIDEBAR_WIDTH } from '../puzzle/PuzzleConfig';

class FixedInputManager extends InputManager {
	public override handleWheel(event: WheelEvent): void {
		if (this.viewport.pause || !this.viewport.visible) {
			return;
		}

		// only handle wheel events where the mouse is over the viewport
		const point = this.viewport.toLocal(this.getPointerPosition(event));

		// Modify the function to only zoom whenever the user is not scrolling on the sidebar
		if (
			SIDEBAR_WIDTH <= event.x
			&& this.viewport.left <= point.x
			&& point.x <= this.viewport.right
			&& this.viewport.top <= point.y
			&& point.y <= this.viewport.bottom) {
			const stop = this.viewport.plugins.wheel(event);

			if (stop && !this.viewport.options.passiveWheel) {
				event.preventDefault();
			}
		}
	}
}

export default class FixedPixiViewport extends Viewport {
	public override readonly input: FixedInputManager;

	private draggingDisabled = false;

	constructor(options: IViewportOptions) {
		super(options);
		// Destroy the input manager created by the super call
		// @ts-expect-error
		this.input?.destroy();

		// Create our own
		this.input = new FixedInputManager(this);

		this.drag()
			.pinch()
			.decelerate()
			.wheel()
			.bounce({
				// @ts-ignore
				bounceBox: {
					x: -this.worldWidth,
					width: this.worldWidth * 2,
					y: -this.worldHeight,
					height: this.worldHeight * 2,
				},
			})
			.clamp({
				left: -(this.worldWidth / 2),
				right: this.worldWidth * 1.5,
				top: -(this.worldHeight / 2),
				bottom: this.worldHeight * 1.5,
				underflow: 'none',
			})
			.clampZoom({ minScale: 0.2, maxScale: 10 });
	}

	public get disableDragging() {
		return this.draggingDisabled;
	}

	public set disableDragging(disabled: boolean) {
		this.draggingDisabled = disabled;
		if (disabled) {
			this.plugins.pause('drag');
		} else {
			this.plugins.resume('drag');
		}
	}
}
