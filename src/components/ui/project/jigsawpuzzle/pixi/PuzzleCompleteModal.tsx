import React, { useEffect, useMemo, useState } from 'react';
import { Assets, TextStyle, Texture } from 'pixi.js';
import Button from './Button';

interface ModalProps {
	x: number;
	y: number;
	width: number;
	height: number;
	closeModal: () => void;
	openSettings: () => void;
}

export default function PuzzleCompleteModal({
	x, y, width, height, closeModal, openSettings,
}: ModalProps) {
	const [assetsLoaded, setAssetsLoaded] = useState(false);

	useEffect(() => {
		(async () => {
			await Assets.load('congrats_kronii');
			setAssetsLoaded(true);
		})();
	}, []);

	const {
		gifWidth, gifHeight, gifX, gifY,
	} = useMemo(() => {
		const calcWidth = window.innerWidth > window.innerHeight
			? (window.innerHeight / 1125) * 1922
			: window.innerWidth;

		const calcHeight = window.innerWidth > window.innerHeight
			? window.innerHeight
			: (window.innerWidth / 1922) * 1125;

		return {
			gifWidth: calcWidth,
			gifHeight: calcHeight,
			gifX: (window.innerWidth - calcWidth) / 2,
			gifY: (window.innerHeight - calcHeight) / 2,
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [window.innerWidth, window.innerHeight]);

	if (!assetsLoaded) return null;

	return (
		<pixiContainer x={x} y={y}>
			<pixiGraphics
				draw={(g) => {
					g
						.clear()
						.rect(0, 0, width, height)
						.fill(0x222222);
				}}
			/>
			<pixiText
				text="Happy 2 Year Anniversary, Kronii!"
				style={{
					fill: 'white',
					fontSize: 40,
					fontWeight: 'bold',
				} as TextStyle}
				anchor={0.5}
				x={width / 2}
				y={height / 2}
			/>
			<Button
				x={width / 2 - 110}
				y={height / 2 + 40}
				width={220}
				height={60}
				radius={16}
				label="Credits / reset puzzle"
				onClick={openSettings}
			/>
			<gifSprite
				x={-x + gifX}
				y={-y + gifY}
				source={Assets.get('congrats_kronii')}
				width={gifWidth}
				height={gifHeight}
			/>

			<pixiContainer
				x={width - 64}
				y={32}
				eventMode="static"
				onClick={closeModal}
				cursor="pointer"
			>
				<pixiGraphics
					draw={(g) => {
						g
							.clear()
							.circle(16, 16, 20)
							.fill(0xBDD1EC);
					}}
				/>
				<pixiSprite
					texture={Texture.from('https://cdn.holoen.fans/hefw/assets/jigsawpuzzle/x-mark.svg')}
					tint={0x000000}
					width={32}
					height={32}
				/>
			</pixiContainer>
		</pixiContainer>
	);
}
