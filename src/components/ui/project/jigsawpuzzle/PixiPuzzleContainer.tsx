'use client';

import { useApplication } from '@pixi/react';
import {
	Assets, Graphics, GraphicsContextSystem, TextStyle,
} from 'pixi.js';
import React, {
	Dispatch, SetStateAction, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { Submission } from '@/types/payload-types';
import { initDevtools } from '@pixi/devtools';
import AbritraryIntermittentGif from '@/components/ui/project/jigsawpuzzle/pixi/AbritraryIntermittentGif';
import ThemeContext from './providers/ThemeContext';
import PuzzleStoreContext from './providers/PuzzleStoreContext';
import type { StageSize } from './PixiWrapper';
import Sidebar from './pixi/Sidebar';
import Puzzle, { BGMConfig } from './puzzle/Puzzle';
import ViewportContext from './providers/ViewportContext';
import PuzzleCompleteModal from './pixi/PuzzleCompleteModal';
import PieceDisplay from './pixi/PieceDisplay';
import PieceInfo from './puzzle/PieceInfo';
import {
	PUZZLE_WIDTH, SIDEBAR_WIDTH, WORLD_HEIGHT, WORLD_WIDTH,
} from './puzzle/PuzzleConfig';
import Button from './pixi/Button';
import Preview from './pixi/Preview';
import AboutModal from './pixi/AboutModal';
import Cursor, { CursorOffsets } from './pixi/Cursor';
import usePuzzleStore from './providers/PuzzleStoreConsumer';
import PuzzleStartModal from './pixi/PuzzleStartModal';

interface PopInGIF {
	key: string;
	width: number;
	height: number;
	x: 'l' | 'r' | number;
	y: 't' | 'b';
	intermittence: number;
}

type VictoryScreenConfig = {
	type: 'kronii'
} | {
	type: 'video';
	src: string;
};

interface IProps {
	stageSize: StageSize;
	aboutText: string;
	credits: object;
	puzzleImgUrl: string;
	gifsConfig: PopInGIF[];
	bgmConfig: BGMConfig;
	victoryScreenConfig: VictoryScreenConfig;
	cursorOffsets: CursorOffsets['offsets'];
	kroniiEnabled: boolean;
	submissions: Submission[];
	setShowAllSubmissions: Dispatch<SetStateAction<boolean>>;
	setShowVictoryVideo: Dispatch<SetStateAction<boolean>>;
}

export default function PixiPuzzleContainer({
	// eslint-disable-next-line max-len
	stageSize, aboutText, credits, puzzleImgUrl, gifsConfig, bgmConfig, victoryScreenConfig, cursorOffsets, kroniiEnabled, submissions, setShowAllSubmissions, setShowVictoryVideo,
}: IProps) {
	const { app, isInitialised } = useApplication();

	const puzzleStore = useContext(PuzzleStoreContext)!;

	const [showPreview, setShowPreview] = useState(false);
	const [showExitModal, setShowExitModal] = useState(false);
	const [showSettingsModal, setShowSettingsModal] = useState(false);
	const [showPuzzleCompleteModal, setShowPuzzleCompleteModal] = useState(false);
	const [disableDragging, setDisableDragging] = useState(false);
	const [selectedPiece, setSelectedPiece] = useState<PieceInfo | undefined>(undefined);
	const [resetTrigger, setResetTrigger] = useState(false);

	const showPuzzleStartModal = usePuzzleStore((state) => state.firstLoad);

	const { colors: themeColors, resolvedTheme } = useContext(ThemeContext);

	const viewportContextMemo = useMemo(
		() => (
			{
				disableDragging,
				setDisableDragging,
			}
		),
		[disableDragging],
	);

	useEffect(() => {
		GraphicsContextSystem.defaultOptions.bezierSmoothness = 0.8;
		// eslint-disable-next-line no-void
		void initDevtools({ app }).catch();
		// eslint-disable-next-line react-hooks/exhaustive-deps

		// eslint-disable-next-line no-void
		void Assets.loadBundle('puzzle');
	}, []);

	/* useEffect(() => {
		app.renderer.resize(stageSize.width, stageSize.height);
		viewportRef.current?.fit();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [stageSize]); */

	const drawPuzzleContainer = useCallback((g: Graphics) => {
		g
			.clear()
			.rect(SIDEBAR_WIDTH, 0, stageSize.width, stageSize.height)
			.fill(themeColors[resolvedTheme].background)
			.roundRect(SIDEBAR_WIDTH, 16, stageSize.width - SIDEBAR_WIDTH - 16, stageSize.height - 32, 8)
			.cut();
	}, [stageSize.width, stageSize.height, resolvedTheme, themeColors]);

	const gifs = useMemo(() => {
		// eslint-disable-next-line max-len
		const temp: { key: string, x: number, y: number, width: number, height: number, intermittence: number }[] = [];

		// eslint-disable-next-line no-restricted-syntax
		for (const gif of gifsConfig) {
			let x = 0;
			if (typeof gif.x === 'number') x = SIDEBAR_WIDTH + ((window.innerWidth - SIDEBAR_WIDTH) * gif.x);
			else if (gif.x === 'l') x = SIDEBAR_WIDTH;
			else if (gif.x === 'r') x = window.innerWidth - gif.width;

			const y = gif.y === 't' ? 0 : window.innerHeight - gif.height;

			temp.push({
				key: gif.key,
				x,
				y,
				width: gif.width,
				height: gif.height,
				intermittence: gif.intermittence,
			});
		}

		return temp;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [window.innerWidth, window.innerHeight]);

	if (!isInitialised) return null;

	return (
		<ViewportContext.Provider value={viewportContextMemo}>
			<viewport
				worldWidth={WORLD_WIDTH}
				worldHeight={WORLD_HEIGHT}
				disableDragging={disableDragging}
				app={app}
				events={app.renderer.events}
			>
				<Puzzle
					x={SIDEBAR_WIDTH + PUZZLE_WIDTH / 2}
					y={(WORLD_HEIGHT / 2 + (PUZZLE_WIDTH * 1.2) / 4) - WORLD_WIDTH / 4}
					width={PUZZLE_WIDTH}
					height={PUZZLE_WIDTH / 2}
					kroniiEnabled={kroniiEnabled}
					resetTrigger={resetTrigger}
					bgmConfig={bgmConfig}
					puzzleFinished={() => {
						switch (victoryScreenConfig.type) {
							case 'kronii':
								setShowPuzzleCompleteModal(true);
								break;
							case 'video':
								setShowVictoryVideo(true);
								break;
							default:
								break;
						}
					}}
					onPieceSelected={(piece: PieceInfo) => {
						if (piece.id !== selectedPiece?.id) {
							setSelectedPiece(piece);
						}
					}}
					submissions={submissions}
				/>
			</viewport>
			<pixiGraphics
				draw={drawPuzzleContainer}
			/>
			<Sidebar
				width={SIDEBAR_WIDTH}
				height={stageSize.height}
				setShowPreview={setShowPreview}
				setShowExitModal={setShowExitModal}
				setShowSettingsModal={setShowSettingsModal}
			>
				<PieceDisplay
					x={16}
					y={stageSize.height * 0.15}
					width={SIDEBAR_WIDTH - 32}
					height={stageSize.height * 0.75 - 16}
					pieceInfo={selectedPiece}
				/>
			</Sidebar>

			{gifs.map((gif) => (
				<AbritraryIntermittentGif
					key={gif.key}
					x={gif.x}
					y={gif.y}
					source={gif.key}
					width={gif.width}
					height={gif.height}
					intermittence={gif.intermittence}
				/>
			))}

			{showPreview && (
				<Preview
					puzzleImgUrl={puzzleImgUrl}
					setShowPreview={setShowPreview}
				/>
			)}

			{
				showExitModal && (
					<pixiContainer>
						<pixiGraphics
							draw={(g) => {
								g
									.clear()
									.rect(0, 0, stageSize.width, stageSize.height)
									.fill(0x222222);
							}}
						/>
						<pixiText
							text="Are you sure you want to leave?"
							style={{
								fill: 'white',
								fontSize: 32,
								fontWeight: 'bold',
								align: 'center',
							} as TextStyle}
							x={stageSize.width / 2}
							y={stageSize.height / 2 - 50}
							anchor={0.5}
							scale={1}
						/>
						<Button
							x={stageSize.width / 2 - 145}
							y={stageSize.height / 2}
							width={120}
							height={60}
							label="Exit"
							color={0xAA2222}
							radius={8}
							onClick={() => {
								window.location.href = '/projects';
							}}
						/>
						<Button
							x={stageSize.width / 2 + 25}
							y={stageSize.height / 2}
							width={120}
							height={60}
							label="Cancel"
							radius={8}
							onClick={() => setShowExitModal(false)}
						/>
					</pixiContainer>
				)
			}

			{showPuzzleStartModal && (
				<PuzzleStartModal
					width={stageSize.width}
					height={stageSize.height}
					closeModal={() => {
						puzzleStore.getState().setFirstLoad(false);
					}}
					text={aboutText}
				/>
			)}

			{showPuzzleCompleteModal && (
				<PuzzleCompleteModal
					x={0}
					y={0}
					width={stageSize.width}
					height={stageSize.height}
					closeModal={() => setShowPuzzleCompleteModal(false)}
					openSettings={() => setShowSettingsModal(true)}
				/>
			)}

			{showSettingsModal && (
				<AboutModal
					x={0}
					y={0}
					width={stageSize.width}
					height={stageSize.height}
					aboutText={aboutText}
					credits={credits as any}
					setResetTrigger={setResetTrigger}
					setShowSettingsModal={setShowSettingsModal}
					setShowAllSubmissions={setShowAllSubmissions}
				/>
			)}

			<Cursor
				offsets={cursorOffsets}
			/>
		</ViewportContext.Provider>
	);
}
