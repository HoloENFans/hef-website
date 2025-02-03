import React, { useEffect, useState } from 'react';
import { Assets, FederatedPointerEvent } from 'pixi.js';
import { useApplication } from '@pixi/react';

export interface CursorOffsets {
	offsets: {
		default: {
			x: number;
			y: number;
		}
		pointer: {
			x: number;
			y: number;
		}
	}
}

export default function Cursor({ offsets }: CursorOffsets) {
	return null;

	const { app } = useApplication();

	const [assetsLoaded, setAssetsLoaded] = useState(false);

	useEffect(() => {
		(async () => {
			await Assets.load(['cursor-default', 'cursor-pointer']);
			setAssetsLoaded(true);
		})();
	}, []);

	const [currentCursor, setCurrentCursor] = useState('default');
	const [cursorLocation, setCursorLocation] = useState({ x: 0, y: 0 });

	useEffect(() => {
		app.renderer.events.cursorStyles.default = () => {
			setCurrentCursor('default');
		};
		app.renderer.events.cursorStyles.pointer = () => {
			setCurrentCursor('pointer');
		};

		app.stage.eventMode = 'dynamic';
		app.stage.on('pointermove', (e: FederatedPointerEvent) => {
			setCursorLocation({ x: e.x, y: e.y });
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return null;

	if (!assetsLoaded) return null;

	return (
		<>
			<gifSprite
				source={Assets.get('cursor-default')}
				x={cursorLocation.x + offsets.default.x}
				y={cursorLocation.y + offsets.default.y}
				width={96}
				height={86}
				visible={currentCursor === 'default'}
			/>
			<gifSprite
				source={Assets.get('cursor-pointer')}
				x={cursorLocation.x + offsets.pointer.x}
				y={cursorLocation.y + offsets.pointer.y}
				width={96}
				height={86}
				visible={currentCursor === 'pointer'}
			/>
		</>
	);
}
