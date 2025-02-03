// global.d.ts
import { type PixiReactElementProps } from '@pixi/react';
import { type GifSprite } from 'pixi.js/gif';
import { type Viewport } from './pixi/Viewport';
import { type Scrollbox } from './pixi/PixiScrollbox';
import type IntermittentGif from './pixi/IntermittentGif';

declare module '@pixi/react' {
	interface PixiElements {
		viewport: PixiReactElementProps<typeof Viewport>;
		scrollbox: PixiReactElementProps<typeof Scrollbox>;
		gifSprite: PixiReactElementProps<typeof GifSprite>;
		intermittentGif: PixiReactElementProps<typeof IntermittentGif>
	}
}
