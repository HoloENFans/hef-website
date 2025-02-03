'use client';

import { Project, Submission } from '@/types/payload-types';
import { Application, extend } from '@pixi/react';
import React, {
	useContext, useEffect, useMemo, useState,
} from 'react';
import {
	Assets, Container, Graphics, GraphicsContextSystem, Sprite, Text,
} from 'pixi.js';
import OS from 'phaser/src/device/OS';
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { useTheme } from 'next-themes';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import ReactPlayer from 'react-player/file';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { GifSprite } from 'pixi.js/gif';
import PuzzleStoreContext from './providers/PuzzleStoreContext';
import ThemeContext, { IThemeContext } from './providers/ThemeContext';
import PixiPuzzleContainer from './PixiPuzzleContainer';
import usePuzzleStore from './providers/PuzzleStoreConsumer';
import SubmissionsModal from './SubmissionsModal';
import Viewport from './pixi/Viewport';
import Scrollbox from './pixi/PixiScrollbox';
import IntermittentGif from './pixi/IntermittentGif';

interface IProps {
	project: Omit<Project, 'flags' | 'devprops'> & {
		flags: string[];
		devprops: {
			[key: string]: string;
		};
	};
	submissions: Submission[];
}

export interface StageSize {
	width: number;
	height: number;
}

function rgbToHex(rgb: string) {
	const [r, g, b] = rgb.substring(4, rgb.length - 1).split(' ');
	const red = parseInt(r, 10);
	const green = parseInt(g, 10);
	const blue = parseInt(b, 10);

	// eslint-disable-next-line no-bitwise
	return (red << 16) + (green << 8) + blue;
}

GraphicsContextSystem.defaultOptions.bezierSmoothness = 0.8;

extend({
	Graphics,
	Container,
	Text,
	Sprite,
	Viewport,
	Scrollbox,
	GifSprite,
	IntermittentGIF: IntermittentGif,
});

export default function PixiWrapper({ project, submissions }: IProps) {
	const [stageSize, setStageSize] = useState<StageSize | null>(null);
	const [ready, setReady] = useState(false);
	const [loadProgress, setLoadProgress] = useState(0);
	const [orientation, setOrientation] = useState('');
	const [showAllSubmissions, setShowAllSubmissions] = useState(false);
	const [showVictoryVideo, setShowVictoryVideo] = useState(false);
	const [assetsHasBeenInit, setAssetsHasBeenInit] = useState(false);

	const puzzleStore = useContext(PuzzleStoreContext);
	const { volume, muted } = usePuzzleStore((state) => state.audio);
	const difficultyName = usePuzzleStore((state) => state.difficultyName);
	const firstLoad = usePuzzleStore((state) => state.firstLoad);
	const [
		setVolume,
		setMuted,
		setDifficulty,
	] = usePuzzleStore((state) => [
		state.setVolume,
		state.setMuted,
		state.setDifficulty,
	]);
	const { resolvedTheme, setTheme } = useTheme();

	// Resize logic
	useEffect(() => {
		const onResize = () => {
			setStageSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		onResize();

		window.addEventListener('resize', onResize);

		return () => {
			window.removeEventListener('resize', onResize);
		};
	}, []);

	useEffect(() => {
		const onOrientationChange = () => {
			setOrientation(window.screen.orientation.type);
		};

		onOrientationChange();

		window.addEventListener('orientationchange', onOrientationChange);

		return () => {
			window.removeEventListener('orientationchange', onOrientationChange);
		};
	}, []);

	useEffect(() => {
		GraphicsContextSystem.defaultOptions.bezierSmoothness = 0.8;
		let firstRun = true;

		(async () => {
			if (firstRun && !assetsHasBeenInit) {
				setAssetsHasBeenInit(true);
				firstRun = false;
				await Assets.init({ manifest: '/assets/dev/gura-xmas-2024/manifest.json' });
			}
			await Assets.loadBundle('puzzle', (progress) => {
				setLoadProgress(progress * 100);
			});

			setReady(true);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		// @ts-ignore
		if (typeof InstallTrigger !== 'undefined') {
			// eslint-disable-next-line no-alert
			alert("Hello there!\nIt seems like you're one of the few others using Firefox. Sadly this game is known to perform quite poorly on Firefox, so we recommend you use Chrome/Edge to play this.");
		} else if (
			// @ts-ignore
			!window.chrome
			// @ts-ignore
			|| typeof window.opr !== 'undefined'
		) {
			// eslint-disable-next-line no-alert
			alert("Unsupported browser\nIt seems like you're not using Chrome or Edge, your browser has not been tested and you may encounter issues while playing. We recommend you use Chrome/Edge to play this.");
		}
	}, []);

	const themeColors = useMemo((): IThemeContext['colors'] => {
		if (project.devprops.customTheme) return JSON.parse(project.devprops.customTheme);

		const computedStyle = getComputedStyle(document.body);

		return {
			light: {
				background: rgbToHex(computedStyle.getPropertyValue('--color-background')),
				primary: rgbToHex(computedStyle.getPropertyValue('--color-primary')),
				primaryForeground: rgbToHex(computedStyle.getPropertyValue('--color-primary-foreground')),
				secondary: rgbToHex(computedStyle.getPropertyValue('--color-secondary')),
				secondaryForeground: rgbToHex(computedStyle.getPropertyValue('--color-secondary-foreground')),
				secondaryHeading: rgbToHex(computedStyle.getPropertyValue('--color-secondary-heading')),
				text: rgbToHex(computedStyle.getPropertyValue('--color-text')),
				header: rgbToHex(computedStyle.getPropertyValue('--color-header')),
				headerForeground: rgbToHex(computedStyle.getPropertyValue('--color-header-foreground')),
				heading: rgbToHex(computedStyle.getPropertyValue('--color-heading')),
				link: rgbToHex(computedStyle.getPropertyValue('--color-link')),
			},
			dark: {
				background: rgbToHex(computedStyle.getPropertyValue('--color-background-dark')),
				primary: rgbToHex(computedStyle.getPropertyValue('--color-primary-dark')),
				primaryForeground: rgbToHex(computedStyle.getPropertyValue('--color-primary-foreground-dark')),
				secondary: rgbToHex(computedStyle.getPropertyValue('--color-secondary-dark')),
				secondaryForeground: rgbToHex(computedStyle.getPropertyValue('--color-secondary-foreground-dark')),
				secondaryHeading: rgbToHex(computedStyle.getPropertyValue('--color-secondary-heading-dark')),
				text: rgbToHex(computedStyle.getPropertyValue('--color-text-dark')),
				header: rgbToHex(computedStyle.getPropertyValue('--color-header-dark')),
				headerForeground: rgbToHex(computedStyle.getPropertyValue('--color-header-foreground-dark')),
				heading: rgbToHex(computedStyle.getPropertyValue('--color-heading-dark')),
				link: rgbToHex(computedStyle.getPropertyValue('--color-link-dark')),
			},
		} satisfies IThemeContext['colors'];
	}, [project.devprops.customTheme]);

	const puzzleConfig = useMemo(() => ({
		aboutText: project.devprops.aboutText.replace(/\\n/g, '\n'),
		puzzleImgUrl: project.devprops.puzzleImgUrl,
		credits: JSON.parse(project.devprops.credits),
		gifs: project.devprops.gifs ? JSON.parse(project.devprops.gifs) : [],
		bgm: JSON.parse(project.devprops.bgm),
		victoryScreen: project.devprops.victoryScreen ? JSON.parse(project.devprops.victoryScreen) : { type: 'kronii' },
		cursorOffsets: JSON.parse(project.devprops.cursorOffsets),
		allowThemeSwitching: project.devprops.allowThemeSwitching === 'true',
		kroniiEnabled: project.devprops.kroniiEnabled === 'true',
	}), [project.devprops]);

	const themeContextValue = useMemo(() => (
		{
			colors: themeColors,
			resolvedTheme: (puzzleConfig.allowThemeSwitching ? (resolvedTheme ?? 'light') : 'dark') as 'light' | 'dark',
		}
	), [resolvedTheme, themeColors, puzzleConfig.allowThemeSwitching]);

	if (!stageSize) return null;

	if (!ready) {
		return (
			<div className="min-w-screen grid size-full min-h-screen place-items-center bg-skin-background text-skin-text dark:bg-skin-background-dark dark:text-skin-text-dark">
				<div>
					<p className="text-lg">
						Loading...
					</p>
					<progress value={loadProgress.toFixed(0)} max={100} className="progress progress-info w-96 max-w-lg" />
				</div>
			</div>
		);
	}

	return (
		<>
			{showVictoryVideo && (
				<div className="absolute left-0 z-20 grid min-h-screen w-full place-items-center bg-skin-background dark:bg-skin-background-dark">
					{/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
					<button
						type="button"
						className="fixed right-6 top-6 grid size-12 place-items-center rounded-full bg-skin-primary text-skin-primary-foreground dark:bg-skin-primary-dark dark:text-skin-primary-foreground-dark"
						onClick={() => setShowVictoryVideo(false)}
					>
						<XMarkIcon className="size-12" />
					</button>
					<div className="aspect-video max-h-screen max-w-[100vw]">
						<ReactPlayer
							url={puzzleConfig.victoryScreen.src}
							playing
							muted
							loop
							width="100%"
							height="100%"
						/>
					</div>
				</div>
			)}

			{showAllSubmissions && (
				<SubmissionsModal
					submissions={submissions}
					project={project}
					closeModal={() => setShowAllSubmissions(false)}
				/>
			)}

			{!difficultyName && !firstLoad && (
				<div className="absolute left-0 z-20 grid min-h-screen w-full place-items-center bg-skin-background dark:bg-skin-background-dark">
					<div className="mx-auto md:max-w-2xl">
						<h1 className="relative mb-4 mt-8 flex items-center justify-center border-b-2 border-skin-text/30 pb-2 text-4xl font-bold text-skin-text dark:border-skin-text-dark/30 dark:text-skin-text-dark">
							Choose difficulty
						</h1>
						<div className="flex flex-col gap-4">
							{Object.keys(JSON.parse(project.devprops.difficulties)).map((name) => (
								<button
									key={name}
									className="rounded-md bg-skin-primary px-6 py-4 text-skin-primary-foreground dark:bg-skin-primary-dark dark:text-skin-primary-foreground-dark"
									type="button"
									onClick={() => {
										setDifficulty(name);
									}}
								>
									{name}
								</button>
							))}
						</div>
					</div>
				</div>
			)}

			{!OS.desktop && (orientation.startsWith('portrait') || !document.fullscreenElement) && (
				<button
					className="min-w-screen absolute z-10 size-full min-h-screen bg-black text-center text-white"
					type="button"
					onClick={() => {
						document.documentElement.requestFullscreen();
						try {
							// @ts-expect-error Chromium Android only
							window.screen.orientation.lock('landscape');
							// eslint-disable-next-line no-empty
						} catch {
						}
					}}
				>
					This app may not work correctly on mobile devices, we recommend using a large screen.
					Click on screen to fullscreen
				</button>
			)}

			<Application
				backgroundColor={themeColors.light.header}
				antialias
				className={`${((!OS.desktop && orientation.startsWith('portrait')) || showAllSubmissions) ? 'hidden' : ''} cursor-none`}
				resizeTo={window}
			>
				<ThemeContext.Provider value={themeContextValue}>
					<PuzzleStoreContext.Provider value={puzzleStore}>
						<PixiPuzzleContainer
							aboutText={puzzleConfig.aboutText}
							puzzleImgUrl={puzzleConfig.puzzleImgUrl}
							credits={puzzleConfig.credits}
							gifsConfig={puzzleConfig.gifs}
							bgmConfig={puzzleConfig.bgm}
							victoryScreenConfig={puzzleConfig.victoryScreen}
							cursorOffsets={puzzleConfig.cursorOffsets}
							kroniiEnabled={puzzleConfig.kroniiEnabled}
							stageSize={stageSize}
							submissions={submissions}
							setShowAllSubmissions={setShowAllSubmissions}
							setShowVictoryVideo={setShowVictoryVideo}
						/>
					</PuzzleStoreContext.Provider>
				</ThemeContext.Provider>
			</Application>

			<div
				className="text-secondary-foreground fixed bottom-6 left-6 z-50 flex h-16 w-[350px] items-center justify-between gap-2 rounded-lg bg-skin-secondary px-4 py-2 dark:bg-skin-secondary-dark dark:text-skin-secondary-foreground-dark"
			>
				<label className="swap swap-flip">
					<input
						type="checkbox"
						className="bg-inherit! text-skin-secondary-foreground dark:text-skin-secondary-foreground-dark"
						checked={muted}
						onChange={() => setMuted(!muted)}
					/>

					<SpeakerWaveIcon className="swap-off size-6 text-skin-secondary-foreground dark:text-skin-secondary-foreground-dark" />
					<SpeakerXMarkIcon className="swap-on size-6 text-skin-secondary-foreground dark:text-skin-secondary-foreground-dark" />
				</label>
				<input
					type="range"
					disabled={muted}
					max={1}
					min={0}
					step={0.01}
					value={volume}
					onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
					className="range-s range range-accent bg-inherit! disabled:range-xs"
				/>
			</div>

			{puzzleConfig.allowThemeSwitching && (
				<label
					className="text-secondary-foreground swap swap-flip fixed bottom-24 left-6 z-50 grid size-16 place-items-center rounded-full bg-skin-secondary dark:bg-skin-secondary-dark dark:text-skin-secondary-foreground-dark"
				>
					<input
						type="checkbox"
						className="bg-inherit! text-skin-secondary-foreground dark:text-skin-secondary-foreground-dark"
						checked={resolvedTheme === 'dark'}
						onChange={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
					/>

					<SunIcon
						className="swap-off size-6 text-skin-secondary-foreground dark:text-skin-secondary-foreground-dark"
					/>
					<MoonIcon
						className="swap-on size-6 text-skin-secondary-foreground dark:text-skin-secondary-foreground-dark"
					/>
				</label>
			)}
		</>
	);
}
