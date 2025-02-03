'use client';

import { Assets } from 'pixi.js';
import React, { useEffect, useState } from 'react';
import { GifSource } from 'pixi.js/gif';
import { IntermittentGifOptions } from './IntermittentGif';

// @ts-ignore
interface Props extends IntermittentGifOptions {
	source: string;
}

export default function AbritraryIntermittentGif({ source, ...props }: Props) {
	const [gifSource, setGifSource] = useState<GifSource | null>(null);

	useEffect(() => {
		(async () => {
			const loadedGifSource: GifSource = await Assets.load(source);
			setGifSource(loadedGifSource);
		})();
	}, []);

	if (!gifSource) return null;

	return (
		<intermittentGif
			// eslint-disable-next-line react/jsx-props-no-spreading
			{...props}
			source={gifSource}
			// eslint-disable-next-line react/no-children-prop
			children={undefined}
		/>
	);
}
