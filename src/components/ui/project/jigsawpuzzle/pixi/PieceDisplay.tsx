import React, {
	useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import {
	type Graphics, type Text, Texture, TextStyle,
} from 'pixi.js';
import { useApplication } from '@pixi/react';
import ThemeContext from '../providers/ThemeContext';
import PieceInfo from '../puzzle/PieceInfo';
import type PixiScrollbox from './PixiScrollbox';

interface PieceDisplayProps {
	x?: number;
	y?: number;
	width: number;
	height: number;
	pieceInfo?: PieceInfo;
	children?: React.ReactNode;
}

export default function PieceDisplay({
	x, y, width, height, pieceInfo, children,
}: PieceDisplayProps) {
	const congratulations = pieceInfo?.message?.congratulations ?? '';
	const favoriteMoment = pieceInfo?.message?.favoriteMoment
		? `

<b>My Favorite Moment:</b>
${pieceInfo.message.favoriteMoment}
` : '';
	const text: string | undefined = pieceInfo?.message
		&& `From: ${pieceInfo.message.from}
${congratulations}${favoriteMoment}`;

	const { app } = useApplication();

	const scrollboxRef = useRef<PixiScrollbox>(null);
	const textRef = useRef<Text>(null);

	const [spriteY, setSpriteY] = useState(height);

	const { colors: themeColors, resolvedTheme } = useContext(ThemeContext);

	useEffect(() => {
		scrollboxRef.current?.update();

		if (textRef.current) {
			setSpriteY(textRef.current.getLocalBounds().height);
			scrollboxRef.current?.update();
		}
	}, [pieceInfo]);

	const drawColorForPieceDisplay = useCallback((g: Graphics) => {
		g
			.clear()
			.roundRect(0, 0, width, height, 8)
			.fill(themeColors[resolvedTheme].secondary);
	}, [width, height, resolvedTheme, themeColors]);

	return (
		<pixiContainer
			x={x}
			y={y}
		>
			<pixiGraphics
				draw={drawColorForPieceDisplay}
				x={0}
				y={0}
			/>
			<scrollbox
				boxWidth={width}
				scrollWidth={width}
				boxHeight={height - 16}
				app={app}
				ref={scrollboxRef}
				x={0}
				y={8}
				scrollbarForeground={0x00000}
				scrollbarOffsetHorizontal={-4}
				overflowX="none"
				overflowY="auto"
				passiveWheel
			>
				{!pieceInfo && (
					<pixiText
						text="No puzzle piece has been selected"
						style={{
							fill: 0x000,
							align: 'center',
							fontSize: 25,
							fontWeight: 'bold',
							wordWrap: true,
							wordWrapWidth: width - 32,
						} as TextStyle}
						y={height / 2}
						x={width / 2}
						width={width - 32}
						anchor={0.5}
						scale={1}
					/>
				)}
				{pieceInfo && !pieceInfo.message && (
					<pixiText
						text="This puzzle piece has no message"
						style={{
							fill: themeColors[resolvedTheme].secondaryForeground,
							align: 'center',
							fontSize: 25,
							fontWeight: 'bold',
							wordWrap: true,
							wordWrapWidth: width - 32,
						} as TextStyle}
						y={height / 2}
						x={width / 2}
						width={width - 32}
						anchor={0.5}
						scale={1}
					/>
				)}
				{text
				&& (
					<pixiText
						text={text}
						style={{
							fill: themeColors[resolvedTheme].secondaryForeground,
							fontSize: 20,
							wordWrap: true,
							wordWrapWidth: width - 32,
						}}
						x={16}
						y={16}
						width={width - 32}
						height={height - 16}
						scale={{ x: 1, y: 1 }}
						ref={textRef}
					/>
				)}
				{pieceInfo?.message?.kronie
				&& (
					<>
						<pixiSprite
							texture={Texture.from(pieceInfo.message.kronie)}
							x={16}
							y={pieceInfo.message
								? Math.max(height - 250, spriteY + 75)
								: 16}
							scale={1}
						/>
						<pixiGraphics
							x={16}
							y={pieceInfo.message
								? Math.max(height - 250, spriteY + 75)
								: 16}
							draw={(g) => {
								g
									.clear()
									.rect(0, 0, 0, 74)
									.fill(0);
							}}
						/>
					</>
				)}
				{children}
			</scrollbox>
		</pixiContainer>
	);
}
