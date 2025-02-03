'use client';

import React, {
	useCallback, useContext, useEffect, useState,
} from 'react';
import { Assets, Graphics, TextStyle } from 'pixi.js';
import Button from './Button';
import { SIDEBAR_WIDTH } from '../puzzle/PuzzleConfig';
import ThemeContext from '../providers/ThemeContext';

interface SidebarProps {
	x?: number;
	y?: number;
	width: number;
	height: number;
	setShowPreview: (val: boolean) => void;
	setShowExitModal: (val: boolean) => void;
	setShowSettingsModal: (val: boolean) => void;
	children?: React.ReactNode;
}

export default function Sidebar({
	x, y, width, height, setShowPreview, setShowExitModal, setShowSettingsModal, children,
}: SidebarProps) {
	const [assetsLoaded, setAssetsLoaded] = useState(false);

	const { colors: themeColors, resolvedTheme } = useContext(ThemeContext);

	useEffect(() => {
		(async () => {
			await Assets.load('back-arrow');
			setAssetsLoaded(true);
		})();
	}, []);

	const drawColorForSidebar = useCallback((g: Graphics) => {
		g
			.clear()
			.rect(0, 0, width, height)
			.fill(themeColors[resolvedTheme].background);
	}, [themeColors, resolvedTheme, width, height]);

	const drawExitButton = useCallback((g: Graphics) => {
		g
			.clear()
			.roundRect(0, 0, 100, 40, 8)
			.stroke({ width: 2, color: themeColors[resolvedTheme].text });
	}, [themeColors, resolvedTheme]);

	return (
		<pixiContainer x={x ?? 0} y={y ?? 0}>
			<pixiGraphics
				draw={drawColorForSidebar}
			/>
			{children}
			<pixiContainer
				eventMode="static"
				onClick={() => setShowExitModal(true)}
				cursor="pointer"
				x={16}
				y={22}
				width={100}
				height={40}
			>
				<pixiGraphics
					draw={drawExitButton}
				/>
				<pixiContainer
					anchor={0.5}
					x={22}
					y={10}
				>
					{assetsLoaded && (
						<pixiSprite
							width={18}
							height={18}
							texture={Assets.get('back-arrow')}
							tint={themeColors[resolvedTheme].text}
							x={0}
							y={0}
						/>
					)}
					<pixiText
						x={24}
						y={0}
						text="Exit"
						style={{
							fill: themeColors[resolvedTheme].text,
							fontSize: 16,
							fontWeight: '400',
						} as TextStyle}
					/>
				</pixiContainer>
			</pixiContainer>
			<Button
				x={SIDEBAR_WIDTH - 166}
				y={16}
				width={150}
				height={50}
				label="Preview"
				onClick={() => {
					setShowPreview(true);
				}}
				color={themeColors[resolvedTheme].primary}
				textColor={themeColors[resolvedTheme].primaryForeground}
				radius={8}
			/>

			<Button
				x={SIDEBAR_WIDTH - 166}
				y={82}
				width={150}
				height={50}
				label="About"
				onClick={() => { setShowSettingsModal(true); }}
				color={themeColors[resolvedTheme].secondary}
				textColor={themeColors[resolvedTheme].secondaryForeground}
				radius={8}
			/>
		</pixiContainer>
	);
}
