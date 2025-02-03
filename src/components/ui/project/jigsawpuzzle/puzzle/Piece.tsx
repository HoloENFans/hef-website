'use client';

import React, {
	useContext, useEffect, useImperativeHandle, useMemo, useRef,
} from 'react';
import { Container, Texture } from 'pixi.js';
import { PUZZLE_WIDTH } from '@/components/ui/project/jigsawpuzzle/puzzle/PuzzleConfig';
import PuzzleStoreContext from '../providers/PuzzleStoreContext';
import Message from './Message';
import PieceInfo from './PieceInfo';
import usePuzzleStore from '../providers/PuzzleStoreConsumer';

interface PieceProps {
	c: number;
	r: number;
	texture: Texture;
	setSelectedPiece: (piece: PieceInfo) => void;
	message?: Message;
}

export type IsNearAdjacentPieceRes = {
	near: false;
} | {
	near: true;
	data: {
		x: number;
		y: number;
		side: 'left' | 'top' | 'right' | 'bottom';
		groupKey: string;
	}
};

export interface PieceActions {
	isNearAdjacentPiece(): IsNearAdjacentPieceRes;
	updateGlobalPosition(): void;
	updateLocalPosition(newPosition: { x: number, y: number }): void;
	checkIsSelectedPiece(pos: { x: number, y:number }): boolean;
}

const Piece = React.forwardRef<PieceActions, PieceProps>(({
	c,
	r,
	texture,
	setSelectedPiece,
	message,
}, ref) => {
	const pieceContainerRef = useRef<Container | null>(null);

	const puzzleStore = useContext(PuzzleStoreContext)!;

	/* eslint-disable @typescript-eslint/no-unused-vars */
	// Use refs to not trigger re-renders every time these update
	const thisPiece = usePuzzleStore((state) => state.pieces[`${r}-${c}`]);
	const difficulty = usePuzzleStore((state) => state.difficulty!);
	const pieceLeft = useRef(c !== 0 && puzzleStore.getState().pieces[`${r}-${c - 1}`]);
	const pieceTop = useRef(r !== 0 && puzzleStore.getState().pieces[`${r - 1}-${c}`]);
	const pieceRight = useRef(c !== difficulty.cols - 1 && puzzleStore.getState().pieces[`${r}-${c + 1}`]);
	const pieceBottom = useRef(r !== difficulty.rows - 1 && puzzleStore.getState().pieces[`${r + 1}-${c}`]);
	const [updatePiecePosition, updatePieceLocalPosition] = puzzleStore((state) => [state.updatePiecePosition(`${r}-${c}`), state.updatePieceLocalPosition]);
	const pieceGroups = puzzleStore((state) => state.pieceGroups);

	const pieceSize = useMemo(() => PUZZLE_WIDTH / difficulty.cols, [difficulty.cols]);
	// eslint-disable-next-line max-len
	const pieceMargin = useMemo(() => pieceSize / difficulty.marginDivider, [pieceSize, difficulty.marginDivider]);

	/* eslint-enable */

	// Subscribe to all side pieces
	/* eslint-disable react-hooks/rules-of-hooks,no-return-assign */
	if (c !== 0) {
		useEffect(() => puzzleStore.subscribe(
			(state) => (pieceLeft.current = state.pieces[`${r}-${c - 1}`]),
			// eslint-disable-next-line react-hooks/exhaustive-deps
		), []);
	}
	if (r !== 0) {
		useEffect(() => puzzleStore.subscribe(
			(state) => (pieceTop.current = state.pieces[`${r - 1}-${c}`]),
			// eslint-disable-next-line react-hooks/exhaustive-deps
		), []);
	}
	if (c !== difficulty.cols - 1) {
		useEffect(() => puzzleStore.subscribe(
			(state) => (pieceRight.current = state.pieces[`${r}-${c + 1}`]),
			// eslint-disable-next-line react-hooks/exhaustive-deps
		), []);
	}
	if (r !== difficulty.rows - 1) {
		useEffect(() => puzzleStore.subscribe(
			(state) => (pieceBottom.current = state.pieces[`${r + 1}-${c}`]),
			// eslint-disable-next-line react-hooks/exhaustive-deps
		), []);
	}
	/* eslint-enable */

	function updateGlobalPosition() {
		const container = pieceContainerRef.current!;
		const calcPos = container.parent!.parent!.toLocal(container.position, container.parent!);
		updatePiecePosition({
			x: calcPos.x,
			y: calcPos.y,
		});
	}

	function updateLocalPosition(newPos: { x: number, y: number }) {
		updatePieceLocalPosition(`${r}-${c}`, newPos);
	}

	function isNearPosition(current: any, target: any, dir: string) {
		let xShift = 0;
		let yShift = 0;
		let xShiftTarget = 0;
		let yShiftTarget = 0;

		switch (dir) {
			case 'left':
				yShift = pieceSize / 2;
				xShiftTarget = pieceSize;
				yShiftTarget = pieceSize / 2;
				break;
			case 'right':
				xShift = pieceSize;
				yShift = pieceSize / 2;
				yShiftTarget = pieceSize / 2;
				break;
			case 'top':
				xShift = pieceSize / 2;
				xShiftTarget = pieceSize / 2;
				yShiftTarget = pieceSize;
				break;
			case 'bottom':
				xShift = pieceSize / 2;
				yShift = pieceSize;
				xShiftTarget = pieceSize / 2;
				break;
			default: break;
		}

		const currentX = current.position.x + xShift;
		const currentY = current.position.y + yShift;
		const targetX = target.position.x + xShiftTarget;
		const targetY = target.position.y + yShiftTarget;

		const deltaX = Math.abs(currentX - targetX);
		const deltaY = Math.abs(currentY - targetY);

		return deltaX < 20 && deltaY < 20;
	}

	function isNearAdjacentPiece(): IsNearAdjacentPieceRes {
		const nearData: any = {
			near: false,
		};

		if (
			pieceLeft.current
			&& !pieceGroups[pieceLeft.current.pieceGroup].correct
			&& isNearPosition(
				thisPiece,
				pieceLeft.current,
				'left',
			)
			&& thisPiece.pieceGroup !== pieceLeft.current.pieceGroup
		) {
			nearData.near = true;
			nearData.data = {
				x: pieceLeft.current.localPosition.x,
				y: pieceLeft.current.localPosition.y,
				side: 'left',
				groupKey: pieceLeft.current.pieceGroup,
			};
		} else if (
			pieceTop.current
			&& !pieceGroups[pieceTop.current.pieceGroup].correct
			&& isNearPosition(
				thisPiece,
				pieceTop.current,
				'top',
			)
			&& thisPiece.pieceGroup !== pieceTop.current.pieceGroup
		) {
			nearData.near = true;
			nearData.data = {
				x: pieceTop.current.localPosition.x,
				y: pieceTop.current.localPosition.y,
				side: 'top',
				groupKey: pieceTop.current.pieceGroup,
			};
		} else if (
			pieceRight.current
			&& !pieceGroups[pieceRight.current.pieceGroup].correct
			&& isNearPosition(
				thisPiece,
				pieceRight.current,
				'right',
			)
			&& thisPiece.pieceGroup !== pieceRight.current.pieceGroup
		) {
			nearData.near = true;
			nearData.data = {
				x: pieceRight.current.localPosition.x,
				y: pieceRight.current.localPosition.y,
				side: 'right',
				groupKey: pieceRight.current.pieceGroup,
			};
		} else if (
			pieceBottom.current
			&& !pieceGroups[pieceBottom.current.pieceGroup].correct
			&& isNearPosition(
				thisPiece,
				pieceBottom.current,
				'bottom',
			)
			&& thisPiece.pieceGroup !== pieceBottom.current.pieceGroup
		) {
			nearData.near = true;
			nearData.data = {
				x: pieceBottom.current.localPosition.x,
				y: pieceBottom.current.localPosition.y,
				side: 'bottom',
				groupKey: pieceBottom.current.pieceGroup,
			};
		}

		return nearData;
	}

	function checkIsSelectedPiece(pos: { x: number, y: number }): boolean {
		if (!pieceContainerRef.current) return false;

		const localPos = pieceContainerRef.current!.toLocal(pos);
		if (
			(localPos.x >= -10 && localPos.x <= pieceSize)
			&& (localPos.y >= -10 && localPos.y <= pieceSize)
		) {
			setSelectedPiece({
				id: `${r}-${c}`,
				message,
			} as PieceInfo);
			return true;
		}

		return false;
	}

	useImperativeHandle(ref, () => ({
		isNearAdjacentPiece,
		updateGlobalPosition,
		updateLocalPosition,
		checkIsSelectedPiece,
	}));

	return (
		<pixiContainer
			x={thisPiece.localPosition.x}
			y={thisPiece.localPosition.y}
			ref={pieceContainerRef}
		>
			<pixiSprite
				texture={texture}
				x={-pieceMargin}
				y={-pieceMargin}
				width={pieceSize + 2 * pieceMargin}
				height={pieceSize + 2 * pieceMargin}
			/>
		</pixiContainer>
	);
});

Piece.displayName = 'Piece';
export default Piece;
