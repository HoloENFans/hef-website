'use client';

import { Application, extend } from '@pixi/react';
import {
	Container, Graphics, GraphicsContextSystem, Sprite, Text,
} from 'pixi.js';
import Button from '@/components/ui/pixi/Button';

GraphicsContextSystem.defaultOptions.bezierSmoothness = 0.8;

extend({
	Graphics,
	Container,
	Text,
	Sprite,
});

export default function PixiWrapper() {
	// TODO: Asset loading

	return (
		<Application
			backgroundColor={0xffffff}
			antialias
			resizeTo={window}
		>
			<Button
				x={400}
				y={400}
				width={200}
				height={100}
				label="Test button"
				onClick={() => {}}
			/>
		</Application>
	);
}
