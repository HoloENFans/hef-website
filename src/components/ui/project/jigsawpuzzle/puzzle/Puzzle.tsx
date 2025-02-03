'use client';

/* eslint-disable react/no-array-index-key */
import React, {
	createRef, ReactElement, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { Assets, Graphics, Spritesheet } from 'pixi.js';
import { IMediaInstance, Sound } from '@pixi/sound';
import { shallow } from 'zustand/shallow';
import { Submission, SubmissionMedia } from '@/types/payload-types';
import ThemeContext from '@/components/ui/project/jigsawpuzzle/providers/ThemeContext';
import PuzzleStoreContext from '../providers/PuzzleStoreContext';
import Piece, { PieceActions } from './Piece';
import Message from './Message';
import PieceInfo from './PieceInfo';
import usePuzzleStore from '../providers/PuzzleStoreConsumer';
import PieceGroup from './PieceGroup';

type NextTrack = {
	random: false;
	name: string;
} | {
	random: true;
	options: {
		name: string;
		weight: number;
	}[];
};

export interface BGMConfig {
	intro: string;
	fallback: string;
	url: string;
	tracks: {
		[key: string]: NextTrack;
	}
}
interface PuzzleProps {
	x: number;
	y: number;
	width: number;
	height: number;
	kroniiEnabled: boolean;
	bgmConfig: BGMConfig;
	resetTrigger: boolean;
	puzzleFinished: () => void;
	onPieceSelected: (piece: PieceInfo) => void;
	submissions: Submission[];
}

const getRandom = (arr: { name: string, weight: number }[]) => {
	const totalWeight = arr.reduce((sum, item) => sum + item.weight, 0);
	let randomNum = Math.random() * totalWeight;

	let { name } = arr[arr.length - 1];
	// eslint-disable-next-line no-restricted-syntax
	for (const item of arr) {
		randomNum -= item.weight;
		if (randomNum <= 0) {
			name = item.name;
			break;
		}
	}

	return name;
};

export default function Puzzle({
	// eslint-disable-next-line max-len
	x, y, width, height, kroniiEnabled, bgmConfig, resetTrigger, puzzleFinished, onPieceSelected, submissions,
}: PuzzleProps) {
	const [sounds, setSounds] = useState<Record<string, Sound> | null>(null);
	const [spritesheet, setSpritesheet] = useState<Spritesheet | null>(null);
	const [spritesheetDifficulty, setSpritesheetDifficulty] = useState('');
	const [currentBgmInstance, setCurrentBgmInstance] = useState<IMediaInstance>();

	const { volume, muted } = usePuzzleStore((state) => state.audio);

	const puzzleStore = useContext(PuzzleStoreContext)!;
	const difficulty = usePuzzleStore((state) => state.difficulty);
	const difficultyName = usePuzzleStore((state) => state.difficultyName);
	const correctCount = usePuzzleStore((state) => state.correctCount);
	const pieceGroups = usePuzzleStore((state) => Object.keys(state.pieceGroups), shallow);

	const { colors: themeColors } = useContext(ThemeContext);

	useEffect(() => {
		if (!difficulty) return;
		if (correctCount >= difficulty.cols * difficulty.rows) {
			puzzleFinished();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [difficulty, correctCount]);

	const drawPuzzleBounds = useCallback((g: Graphics) => {
		const lineWidth = 8;
		g
			.clear()
			.rect(-lineWidth / 2, -lineWidth / 2, width + lineWidth, height + lineWidth)
			.stroke({ width: lineWidth, color: themeColors.light.headerForeground });
	}, [height, width, themeColors]);

	useEffect(() => {
		const bgmTrackNames = Object.keys(bgmConfig.tracks);
		const sfxTrackNames = ['tick', 'tock'];
		const loadedSounds: Record<string, Sound> = {};

		function loadCallback(name: string, sound: Sound) {
			loadedSounds[name] = sound;
			// Very lazy way to check if everything is loaded
			if (Object.keys(loadedSounds).length === bgmTrackNames.length + sfxTrackNames.length) {
				setSounds(loadedSounds);
			}
		}

		const defaultSettings = {
			preload: true, volume: 0.25, singleInstance: true,
		};

		const loadBgmTrack = (name: string) => {
			Sound.from({
				url: bgmConfig.url.replace('{name}', name),
				loaded: (_, sound) => loadCallback(name, sound!),
				...defaultSettings,
			});
		};

		const loadSfxTrack = (name: string) => {
			Sound.from({
				url: `https://cdn.holoen.fans/hefw/assets/jigsawpuzzle/sfx/${name}.wav`,
				loaded: (_, sound) => loadCallback(name, sound!),
				...{
					preload: true, volume: 0.25, singleInstance: true,
				},
			});
		};

		// eslint-disable-next-line no-restricted-syntax
		for (const name of bgmTrackNames) {
			loadBgmTrack(name);
		}

		// eslint-disable-next-line no-restricted-syntax
		for (const name of sfxTrackNames) {
			loadSfxTrack(name);
		}

		return () => {
			// eslint-disable-next-line no-restricted-syntax
			for (const name of bgmTrackNames) {
				if (loadedSounds[name]) {
					loadedSounds[name].stop();
					loadedSounds[name].destroy();
				}
			}

			// eslint-disable-next-line no-restricted-syntax
			for (const name of sfxTrackNames) {
				if (loadedSounds[name]) {
					loadedSounds[name].stop();
					loadedSounds[name].destroy();
				}
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!sounds) return;

		let sound = bgmConfig.intro;

		// eslint-disable-next-line max-len
		const startVolume = puzzleStore.getState().audio.volume;
		// eslint-disable-next-line max-len
		const introInstance = sounds[bgmConfig.intro].play({ volume: muted ? 0 : startVolume }) as IMediaInstance;
		if (muted) {
			introInstance.set('paused', true);
			introInstance.set('volume', startVolume);
		}
		setCurrentBgmInstance(introInstance);

		function nextSound() {
			const next = bgmConfig.tracks[sound];

			sound = next.random ? getRandom(next.options) : next.name;
			if (!sounds![sound]) sound = bgmConfig.fallback;

			const currentVolume = puzzleStore.getState().audio.volume;
			const instance = sounds![sound].play({ volume: currentVolume }) as IMediaInstance;

			const timer = setInterval(() => {
				if (instance.progress === 1) {
					nextSound();
				}
			}, 5000);

			setCurrentBgmInstance(instance);
			instance.on('end', () => {
				instance.destroy();
				nextSound();
				clearInterval(timer);
			});
		}

		introInstance.on('end', () => {
			introInstance.destroy();
			nextSound();
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sounds]);

	useEffect(() => {
		currentBgmInstance?.set('volume', volume);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [volume]);

	useEffect(() => {
		currentBgmInstance?.set('paused', muted);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [muted]);

	useEffect(() => {
		if (!difficultyName || spritesheetDifficulty === difficultyName) return;

		(async () => {
			const newSpritesheet: Spritesheet = await Assets.load(`pieces${difficultyName !== 'default' ? `-${difficultyName.toLowerCase()}` : ''}`);
			setSpritesheet(newSpritesheet);
			setSpritesheetDifficulty(difficultyName);
		})();
	}, [difficultyName]);

	const puzzlePiecesRefs = useMemo(() => {
		if (!difficulty) return null;

		const refs: Record<string, React.RefObject<PieceActions>> = {};

		for (let r = 0; r < difficulty.rows; r++) {
			for (let c = 0; c < difficulty.cols; c++) {
				refs[`${r}-${c}`] = createRef<PieceActions>() as any;
			}
		}

		return refs;
	}, [difficulty]);

	const puzzlePieces = useMemo(() => {
		if (
			spritesheetDifficulty !== difficultyName
			|| !spritesheet
			|| !difficulty
			|| !difficultyName
			|| !puzzlePiecesRefs
		) return null;

		const temp: Record<string, { ref: React.RefObject<any>, piece: ReactElement<any> }> = {};

		for (let r = 0; r < difficulty.rows; r++) {
			for (let c = 0; c < difficulty.cols; c++) {
				const message = submissions[r * difficulty.cols + c];

				const pieceRef = puzzlePiecesRefs[`${r}-${c}`];

				const piece = (
					<Piece
						key={`piece-${r}-${c}`}
						c={c}
						r={r}
						texture={spritesheet.textures[`${r}-${c}`]}
						setSelectedPiece={onPieceSelected}
						message={message ? {
							from: message.author,
							congratulations: message.devprops?.find((prop) => prop.key === 'congratulations')?.value,
							favoriteMoment: message.devprops?.find((prop) => prop.key === 'favoriteMoment')?.value,
							// eslint-disable-next-line max-len
							kronie: kroniiEnabled && message.media && message.media.length > 0 ? (message.media[0].image as SubmissionMedia).url : undefined,
						} satisfies Message : undefined}
						ref={pieceRef}
					/>
				);
				if (!piece) {
					// eslint-disable-next-line no-continue
					continue;
				}
				temp[`${r}-${c}`] = {
					ref: pieceRef, piece,
				};
			}
		}

		return temp;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [spritesheet, spritesheetDifficulty, difficulty, difficultyName, puzzlePiecesRefs]);

	const groupElements = useMemo(() => {
		if (!puzzlePieces) return null;
		const groups = puzzleStore.getState().pieceGroups;

		return pieceGroups.map((groupKey) => {
			const { position } = groups[groupKey];

			return (
				<PieceGroup
					key={groupKey}
					groupKey={groupKey}
					pieces={puzzlePieces}
					initialX={position.x}
					initialY={position.y}
					playTick={() => sounds?.tick.play()}
					playTock={() => sounds?.tock.play()}
				/>
			);
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resetTrigger, puzzlePieces, pieceGroups, sounds?.tick, sounds?.tock]);

	if (!puzzlePieces) return null;

	return (
		// eslint-disable-next-line react/jsx-boolean-value
		<pixiContainer x={x} y={y} sortableChildren={true}>
			<pixiGraphics
				width={width}
				height={height}
				draw={drawPuzzleBounds}
				zIndex={-2}
			/>
			{groupElements}
		</pixiContainer>
	);
}
