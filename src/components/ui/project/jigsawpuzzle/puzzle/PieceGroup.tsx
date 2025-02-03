'use client';

import React, {
	ReactElement, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { Container, FederatedPointerEvent } from 'pixi.js';
import PuzzleStoreContext from '../providers/PuzzleStoreContext';
import usePuzzleStore from '../providers/PuzzleStoreConsumer';
import { PUZZLE_WIDTH } from './PuzzleConfig';
import ViewportContext from '../providers/ViewportContext';
import { PieceActions } from './Piece';

interface PieceGroupProps {
	groupKey: string;
	pieces: Record<string, { ref: React.RefObject<PieceActions>, piece: ReactElement<any> }>;
	initialX: number;
	initialY: number;
	playTick: () => void;
	playTock: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function PieceGroup({
	groupKey, pieces, initialX, initialY, playTick, playTock,
}: PieceGroupProps) {
	const [dragging, setDragging] = useState(false);
	const [dragStartPosition, setDragStartPosition] = useState<{ x: number; y: number } | null>(null);
	const [currentPosition, setCurrentPosition] = useState({ x: initialX, y: initialY });
	const [lastUpdatedAt, setLastUpdatedAt] = useState(Date.now());
	const [parent, setParent] = useState(null as any);

	const puzzleStore = useContext(PuzzleStoreContext)!;

	const difficulty = usePuzzleStore((state) => state.difficulty!);
	const pieceSize = useMemo(() => PUZZLE_WIDTH / difficulty.cols, [difficulty.cols]);

	const containerRef = useRef<Container>(null);

	const { setDisableDragging } = useContext(ViewportContext);

	const thisPieceGroup = usePuzzleStore((state) => state.pieceGroups[groupKey]);
	const [
		updatePieceGroupPosition,
		setCorrect,
		changePieceGroup,
	] = usePuzzleStore(
		(state) => [
			state.updatePieceGroupPosition(groupKey),
			state.setCorrect(groupKey),
			state.changePieceGroup(groupKey),
		],
	);

	// Set initial position in store
	useEffect(() => {
		const initialPosition = {
			x: initialX,
			y: initialY,
		};

		setCurrentPosition(initialPosition);
		updatePieceGroupPosition(initialPosition);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialX, initialY]);

	useEffect(() => {
		if (thisPieceGroup.correct) {
			setCurrentPosition({
				x: thisPieceGroup.targetPosition.x,
				y: thisPieceGroup.targetPosition.y,
			});
		} else {
			setCurrentPosition({ x: thisPieceGroup.position.x, y: thisPieceGroup.position.y });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [thisPieceGroup.correct]);

	useEffect(() => {
		// eslint-disable-next-line no-restricted-syntax
		for (const pieceKey of thisPieceGroup.pieces) {
			pieces[pieceKey].ref.current.updateGlobalPosition();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const pieceElements = useMemo(
		() => thisPieceGroup.pieces.map((pieceKey) => pieces[pieceKey].piece),
		[pieces, thisPieceGroup.pieces],
	);

	const isNearPosition = (currentX: number, currentY: number, targetX: number, targetY: number) => {
		const deltaX = Math.abs(currentX - targetX);
		const deltaY = Math.abs(currentY - targetY);
		return deltaX < 45 && deltaY < 45;
	};

	const notNearTargetPositionLogic = (x: number, y: number) => {
		let nearData: {
			x: number;
			y: number;
			side: 'left' | 'top' | 'right' | 'bottom';
			groupKey: string;
		} | undefined;
		let nearPieceKey: string;
		const statePieces = puzzleStore.getState().pieces;

		// eslint-disable-next-line no-restricted-syntax
		for (const pieceKey of thisPieceGroup.pieces) {
			const piece = pieces[pieceKey].ref.current;
			piece.updateGlobalPosition();
			const nearRes = piece.isNearAdjacentPiece();
			if (nearRes.near) {
				nearData = nearRes.data;
				nearPieceKey = pieceKey;
				break;
			}
		}

		if (!nearData) {
			const newPos = { x, y };
			setCurrentPosition(newPos);
			updatePieceGroupPosition(newPos);

			playTock();
			return;
		}

		const nearPiece = statePieces[nearPieceKey!];
		let wantedX = nearData.x;

		if (nearData.side === 'left') {
			wantedX += pieceSize;
		} else if (nearData.side === 'right') {
			wantedX -= pieceSize;
		}

		let wantedY = nearData.y;
		if (nearData.side === 'top') {
			wantedY += pieceSize;
		} else if (nearData.side === 'bottom') {
			wantedY -= pieceSize;
		}

		const deltaX = wantedX - nearPiece.localPosition.x;
		const deltaY = wantedY - nearPiece.localPosition.y;

		const positionData: Record<string, { x: number; y: number; }> = {};
		// eslint-disable-next-line no-restricted-syntax
		for (const pieceKey of thisPieceGroup.pieces) {
			positionData[pieceKey] = {
				x: deltaX + statePieces[pieceKey].localPosition.x,
				y: deltaY + statePieces[pieceKey].localPosition.y,
			};
		}

		const newGroupKey = nearData.groupKey;

		changePieceGroup(newGroupKey, positionData);

		playTick();
	};

	const settlePieceGroup = (targetPosition: { x: number, y: number }) => {
		const newPos = { x: targetPosition.x, y: targetPosition.y };
		setCurrentPosition(newPos);
		updatePieceGroupPosition(newPos);
		setCorrect();
		// Force to background when correct, otherwise can interfere with other pieces behind it
		setLastUpdatedAt(-1);
		// eslint-disable-next-line no-restricted-syntax
		for (const pieceKey of thisPieceGroup.pieces) {
			pieces[pieceKey].ref.current.updateGlobalPosition();
		}

		playTick();
	};

	const checkSelectPieces = async (event: FederatedPointerEvent) => {
		// eslint-disable-next-line no-restricted-syntax
		for (const pieceKey of thisPieceGroup.pieces) {
			// eslint-disable-next-line max-len
			if (pieces[pieceKey].ref.current.checkIsSelectedPiece({ x: event.globalX, y: event.globalY })) break;
		}
	};

	const handleDragStart = (event: FederatedPointerEvent) => {
		if (dragging) return;
		checkSelectPieces(event);

		if (thisPieceGroup.correct) return;

		const tempParent = event.target!.parent!;
		if (tempParent != null) {
			setParent(tempParent);
		}
		setDragStartPosition(containerRef.current!.toLocal(event.global));
		setDragging(true);
		setDisableDragging(true);
		const now = Date.now();
		setLastUpdatedAt(now);
		playTick();
	};

	const handleDragMove = (event: FederatedPointerEvent) => {
		if (!dragging) {
			return;
		}

		const { x, y } = event.getLocalPosition(parent);

		setCurrentPosition({ x: x - dragStartPosition!.x, y: y - dragStartPosition!.y });
	};

	const handleDragEnd = (event: FederatedPointerEvent) => {
		if (!dragging) {
			return;
		}

		const { x, y } = event.getLocalPosition(parent);
		const actualX = x - dragStartPosition!.x;
		const actualY = y - dragStartPosition!.y;
		const { targetPosition } = thisPieceGroup;

		// Check if near target
		if (isNearPosition(actualX, actualY, targetPosition.x, targetPosition.y)) {
			settlePieceGroup(targetPosition);
		} else {
			notNearTargetPositionLogic(actualX, actualY);
		}

		setDragging(false);
		setDisableDragging(false);
	};

	return (
		<pixiContainer
			x={currentPosition.x}
			y={currentPosition.y}
			eventMode="static"
			onPointerDown={handleDragStart}
			onPointerMove={handleDragMove}
			onGlobalPointerMove={handleDragMove}
			onPointerUp={handleDragEnd}
			onPointerUpOutside={handleDragEnd}
			onTouchStart={handleDragEnd}
			onTouchMove={handleDragEnd}
			onTouchEnd={handleDragEnd}
			onTouchEndOutside={handleDragEnd}
			zIndex={lastUpdatedAt}
			ref={containerRef}
			cursor={thisPieceGroup.correct ? undefined : 'pointer'}
		>
			{pieceElements}
		</pixiContainer>
	);
}
