'use client';

import React, {
	Dispatch, SetStateAction, useCallback, useContext, useEffect, useRef, useState,
} from 'react';
import { useApplication } from '@pixi/react';
import { Graphics, TextStyle, Texture } from 'pixi.js';
import ThemeContext from '@/components/ui/project/jigsawpuzzle/providers/ThemeContext';
import usePuzzleStore from '../providers/PuzzleStoreConsumer';
import Button from './Button';
import PuzzleStoreContext from '../providers/PuzzleStoreContext';
import CreditsRenderer, { CreditNode } from './CreditsRenderer';
import type PixiScrollbox from './PixiScrollbox';

export interface Credits {
	length: number;
	nodes: CreditNode[];
}

interface AboutModalProps {
	x: number;
	y: number;
	width: number;
	height: number;
	aboutText: string;
	credits: Credits;
	setResetTrigger: Dispatch<SetStateAction<boolean>>;
	setShowSettingsModal: Dispatch<SetStateAction<boolean>>;
	setShowAllSubmissions: Dispatch<SetStateAction<boolean>>;
}

export default function AboutModal({
	x,
	y,
	width,
	height,
	aboutText,
	credits,
	setResetTrigger,
	setShowSettingsModal,
	setShowAllSubmissions,
}: AboutModalProps) {
	const { app } = useApplication();
	const [message, setMessage] = useState<string | null>(null);

	const puzzleStore = useContext(PuzzleStoreContext)!;
	const difficultyName = usePuzzleStore((state) => state.difficultyName);
	const setDifficulty = usePuzzleStore((state) => state.setDifficulty);

	const aboutBoxRef = useRef<PixiScrollbox>(null);
	const creditsBoxRef = useRef<PixiScrollbox>(null);

	const { colors: themeColors, resolvedTheme } = useContext(ThemeContext);

	const drawBackground = useCallback((g: Graphics) => {
		g
			.clear()
			.rect(0, 0, width, height)
			.fill(themeColors[resolvedTheme].background);
	}, [themeColors, resolvedTheme, width, height]);

	const drawSettingsBox = useCallback((g: Graphics) => {
		g
			.clear()
			.roundRect(0, 0, 700, 400, 8)
			.fill(themeColors[resolvedTheme].secondary);
	}, [resolvedTheme, themeColors]);

	const drawCreditsBox = useCallback((g: Graphics) => {
		g
			.clear()
			.roundRect(0, 0, 700, 864, 8)
			.fill(themeColors[resolvedTheme].secondary);
	}, [resolvedTheme, themeColors]);

	const drawExitButton = useCallback((g: Graphics) => {
		g
			.clear()
			.circle(16, 16, 20)
			.fill(themeColors[resolvedTheme].secondary);
	}, [resolvedTheme, themeColors]);

	useEffect(() => {
		if (aboutBoxRef.current) aboutBoxRef.current.overflowY = 'scroll';
		if (creditsBoxRef.current) creditsBoxRef.current.overflowY = 'scroll';
	}, [aboutBoxRef, creditsBoxRef]);

	return (
		<pixiContainer
			x={x}
			y={y}
		>
			<pixiGraphics
				draw={drawBackground}
			/>
			<pixiContainer x={width / 2} y={height / 2} anchor={0.5}>
				<pixiContainer
					x={-732}
					y={-432}
				>
					<pixiGraphics
						draw={drawSettingsBox}
					/>
					<scrollbox
						boxWidth={700}
						scrollWidth={700}
						boxHeight={400}
						app={app}
						scrollbarForeground={0x00000}
						scrollbarOffsetHorizontal={-4}
						overflowX="none"
						overflowY="scroll"
						passiveWheel
						ref={aboutBoxRef}
					>
						<pixiText
							text="About"
							style={{
								fill: themeColors[resolvedTheme].secondaryForeground,
								fontWeight: 'bold',
								fontSize: 24,
							} as TextStyle}
							x={350}
							y={32}
							anchor={{ x: 0.5, y: 0 }}
						/>
						<pixiText
							text={aboutText}
							style={{
								fill: themeColors[resolvedTheme].secondaryForeground,
								fontSize: 18,
								wordWrap: true,
								wordWrapWidth: 636,
							}}
							x={32}
							y={64}
							width={636}
							scale={1}
						/>
						<pixiGraphics
							y={600}
							draw={(g) => {
								g
									.clear()
									.rect(0, 0, 0, 0)
									.fill(0);
							}}
						/>
					</scrollbox>
				</pixiContainer>
				<pixiContainer
					x={-732}
					y={32}
				>
					<pixiGraphics
						draw={drawSettingsBox}
					/>
					<pixiText
						text="Settings"
						style={{
							fill: themeColors[resolvedTheme].secondaryForeground,
							fontWeight: 'bold',
							fontSize: 24,
						} as TextStyle}
						x={350}
						y={32}
						anchor={{ x: 0.5, y: 0 }}
					/>
					<Button
						x={180}
						y={96}
						width={150}
						height={60}
						radius={12}
						color={0xAA2222}
						label="Reset puzzle"
						onClick={() => {
							const puzzleState = puzzleStore.getState();
							puzzleState.reset();
							setMessage('Puzzle has been reset!');
							setResetTrigger((prevVal) => !prevVal);
						}}
					/>
					<Button
						x={370}
						y={96}
						width={150}
						height={60}
						radius={12}
						color={0xAA2222}
						label="Full reset"
						onClick={() => {
							const puzzleState = puzzleStore.getState();
							puzzleState.reset();
							puzzleState.setFirstLoad(true);
							if (puzzleState.difficultyName !== 'default') puzzleState.setDifficulty(null);
							setMessage('Puzzle has been reset!');
							window.location.reload();
						}}
					/>
					{difficultyName !== 'default' && (
						<Button
							x={250}
							y={182}
							width={200}
							height={60}
							radius={12}
							color={0xAA2222}
							label="Change difficulty"
							onClick={() => {
								setDifficulty(null);
								setShowSettingsModal(false);
							}}
						/>
					)}
					<Button
						x={225}
						y={280}
						width={250}
						height={60}
						radius={12}
						color={themeColors[resolvedTheme].primary}
						textColor={themeColors[resolvedTheme].primaryForeground}
						label="See all submissions"
						onClick={() => setShowAllSubmissions(true)}
					/>
					{message && (
						<pixiText
							text={message}
							style={{
								fill: themeColors[resolvedTheme].secondaryForeground,
								fontSize: 20,
							} as TextStyle}
							x={350}
							y={352}
							anchor={{ x: 0.5, y: 0 }}
						/>
					)}
				</pixiContainer>
				<pixiContainer
					x={32}
					y={-432}
				>
					<pixiGraphics
						draw={drawCreditsBox}
						x={0}
						y={0}
					/>
					<scrollbox
						boxWidth={700}
						scrollWidth={700}
						boxHeight={864}
						scrollHeight={credits.length}
						app={app}
						scrollbarForeground={0x00000}
						scrollbarOffsetHorizontal={-4}
						overflowX="none"
						overflowY="scroll"
						passiveWheel
						ref={creditsBoxRef}
					>
						<pixiText
							text="Credits"
							style={{
								fill: themeColors[resolvedTheme].secondaryForeground,
								fontWeight: 'bold',
								fontSize: 40,
							} as TextStyle}
							x={350}
							y={32}
							anchor={{ x: 0.5, y: 0 }}
							scale={1}
						/>
						<CreditsRenderer
							nodes={credits.nodes}
							textColor={themeColors[resolvedTheme].secondaryForeground}
							linkColor={themeColors[resolvedTheme].link}
						/>

						<pixiGraphics
							y={credits.length}
							draw={(g) => {
								g
									.clear()
									.rect(0, 0, 0, 0)
									.fill(0);
							}}
						/>
					</scrollbox>
				</pixiContainer>
			</pixiContainer>
			<pixiContainer
				x={width - 64}
				y={32}
				eventMode="static"
				onClick={() => setShowSettingsModal(false)}
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
