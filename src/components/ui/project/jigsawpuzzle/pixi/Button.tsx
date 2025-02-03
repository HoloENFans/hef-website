import React from 'react';
import { TextStyle } from 'pixi.js';

interface ButtonProps {
	x: number;
	y: number;
	width: number;
	height: number;
	label: string;
	color?: number;
	textColor?: number | string;
	radius?: number;
	onClick?: () => void;
}

export default function Button({
	x, y, width, height, label, onClick, color = 0x0869EC, textColor = 'white', radius = 0,
}: ButtonProps) {
	const handleClick = () => {
		if (onClick) {
			onClick();
		}
	};

	return (
		<pixiContainer
			eventMode={onClick ? 'static' : 'auto'}
			onPointerDown={handleClick}
			x={x}
			y={y}
			cursor={onClick ? 'pointer' : undefined}
		>
			<pixiGraphics
				draw={(g) => {
					if (color) {
						g
							.clear()
							.roundRect(0, 0, width, height, radius)
							.fill(color);
					}
				}}
			/>
			<pixiText
				text={label}
				style={{
					fill: textColor,
					fontSize: 18,
					fontWeight: 'bold',
				} as TextStyle}
				anchor={0.5}
				x={width / 2}
				y={height / 2}
			/>
		</pixiContainer>
	);
}
