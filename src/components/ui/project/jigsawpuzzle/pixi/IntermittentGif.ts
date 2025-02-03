import { GifSprite, type GifSpriteOptions } from 'pixi.js/gif';

export interface IntermittentGifOptions extends GifSpriteOptions {
	intermittence: number;
}

export default class IntermittentGif extends GifSprite {
	override loop = false;

	private readonly intermittence;

	private timer;

	constructor({ intermittence, ...options }: IntermittentGifOptions) {
		super(options);
		this.intermittence = intermittence;

		this.play();

		this.timer = setTimeout(() => {
			this.visible = true;
			this.play();
		}, intermittence);
	}

	override onComplete = () => {
		this.visible = false;
		this.timer = setTimeout(() => {
			this.visible = true;
			this.play();
		}, this.intermittence);
	};
}
