import React, { useEffect, useRef, useState } from 'react';
import {
	Container, Texture, FederatedPointerEvent, Assets,
} from 'pixi.js';

interface Props {
	puzzleImgUrl: string;
	setShowPreview(value: boolean): void;
}

export default function PuzzlePreview({
	puzzleImgUrl,
	setShowPreview,
}: Props) {
	const [dragging, setDragging] = useState(false);
	const [dragStartPosition, setDragStartPosition] = useState<{ x: number; y: number } | null>(null);
	const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
	const [parent, setParent] = useState(null as any);
	const [ready, setReady] = useState(false);

	const containerRef = useRef<Container>(null);
	const handleDragStart = (event: FederatedPointerEvent) => {
		if (dragging) return;

		const tempParent = event.target!.parent!;
		if (tempParent != null) {
			setParent(tempParent);
		}
		setDragStartPosition(containerRef.current!.toLocal(event.global));
		setDragging(true);
	};

	const handleDragMove = (event: FederatedPointerEvent) => {
		if (!dragging) {
			return;
		}

		const { x, y } = event.getLocalPosition(parent);

		setCurrentPosition({ x: x - dragStartPosition!.x, y: y - dragStartPosition!.y });
	};

	const handleDragEnd = (event: FederatedPointerEvent) => {
		if (!dragging) {
			return;
		}

		const { x, y } = event.getLocalPosition(parent);

		setCurrentPosition({ x: x - dragStartPosition!.x, y: y - dragStartPosition!.y });

		setDragging(false);
	};

	useEffect(() => {
		if (!ready) {
			(async () => {
				await Assets.load([
					'https://cdn.holoen.fans/hefw/assets/jigsawpuzzle/x-mark.svg',
					'https://cdn.holoen.fans/hefw/assets/jigsawpuzzle/pop.svg',
					puzzleImgUrl,
				]);

				setReady(true);
			})();
		}
	}, []);

	if (!ready) return null;

	return (
		<pixiContainer
			x={currentPosition.x}
			y={currentPosition.y}
			eventMode="static"
			onPointerDown={handleDragStart}
			onPointerMove={handleDragMove}
			onGlobalPointerMove={handleDragMove}
			onPointerUp={handleDragEnd}
			onPointerUpOutside={handleDragEnd}
			onTouchStart={handleDragEnd}
			onTouchMove={handleDragEnd}
			onTouchEnd={handleDragEnd}
			onTouchEndOutside={handleDragEnd}
			ref={containerRef}
		>
			<pixiGraphics
				draw={(g) => {
					g
						.clear()
						.roundRect(0, 0, 450, 268, 8)
						.fill(0x001E47)
						.stroke({ color: 0xffffff });
				}}
			/>
			<pixiSprite
				texture={Texture.from(puzzleImgUrl)}
				x={8}
				y={41}
				width={434}
				height={217}
			/>
			<pixiSprite
				texture={Texture.from('https://cdn.holoen.fans/hefw/assets/jigsawpuzzle/x-mark.svg')}
				x={418}
				y={8}
				width={24}
				height={24}
				eventMode="static"
				onClick={() => setShowPreview(false)}
				cursor="pointer"
			/>

			<pixiSprite
				texture={Texture.from('https://cdn.holoen.fans/hefw/assets/jigsawpuzzle/pop.svg')}
				x={386}
				y={8}
				width={24}
				height={24}
				eventMode="static"
				onClick={() => window.open(puzzleImgUrl, '_blank', 'noopener')}
				cursor="pointer"
			/>

		</pixiContainer>
	);
}
