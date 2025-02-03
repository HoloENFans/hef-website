import { Graphics, Texture, TextStyle } from 'pixi.js';
import React, { useCallback, useContext } from 'react';
import ThemeContext from '@/components/ui/project/jigsawpuzzle/providers/ThemeContext';
import Button from './Button';

interface ModalProps {
	width: number;
	height: number;
	text: string;
	closeModal: () => void;
}

export default function PuzzleStartModal({
	width, height, text, closeModal,
}: ModalProps) {
	const { colors: themeColors, resolvedTheme } = useContext(ThemeContext);

	const drawExitButton = useCallback((g: Graphics) => {
		g
			.clear()
			.circle(16, 16, 20)
			.fill(themeColors[resolvedTheme].secondary);
	}, [resolvedTheme, themeColors]);

	return (
		<pixiContainer>
			<pixiGraphics
				draw={(g: Graphics) => {
					g
						.clear()
						.rect(0, 0, width, height)
						.fill(0x222222);
				}}
			/>
			<pixiText
				text={text}
				style={{
					fill: 'white',
					fontSize: 20,
					wordWrap: true,
					wordWrapWidth: Math.min(width * 0.6, 1000),
				} as TextStyle}
				anchor={0.5}
				width={Math.min(width * 0.6, 1000)}
				x={width / 2}
				y={height / 2 - 60}
				scale={1}
			/>
			<Button
				x={width / 2 - 110}
				y={height / 2 + 240}
				width={220}
				height={60}
				radius={16}
				color={themeColors[resolvedTheme].primary}
				textColor={themeColors[resolvedTheme].primaryForeground}
				label="Begin"
				onClick={closeModal}
			/>

			<pixiContainer
				x={width - 64}
				y={32}
				eventMode="static"
				onClick={closeModal}
				cursor="pointer"
			>
				<pixiGraphics
					draw={drawExitButton}
				/>
				<pixiSprite
					texture={Texture.from('https://cdn.holoen.fans/hefw/assets/jigsawpuzzle/x-mark.svg')}
					tint={themeColors[resolvedTheme].secondaryForeground}
					width={32}
					height={32}
				/>
			</pixiContainer>
		</pixiContainer>
	);
}
