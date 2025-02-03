import classNames from 'classnames';
import { motion, useDragControls } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface IProps {
	src: string;
	className: string;
	width?: string;
	containerRef: React.RefObject<HTMLDivElement | null>;
}

const initialAnimation = {
	animate: { y: [0, -10, 0] },
	transition: { duration: 3, repeat: Infinity },
};

const fallingAnimation = {
	animate: { y: 3000 },
	transition: { duration: 2, ease: 'easeInOut' },
};

const dragStartAnimation = {
	animate: { x: [0, 5, -5, 5, -10, 10, 0] },
	transition: { duration: 0.3, ease: 'easeInOut' },
};

export default function FloatingDecoArtDraggable({
	src, className, width, containerRef,
}: IProps) {
	const controls = useDragControls();
	const [state, setState] = useState('initial');
	const [dragStarted, setDragStarted] = useState(false);
	const flatPlayed = useRef(false);
	const [animation, setAnimation] = useState<{ animate: {}; transition: {} }>(initialAnimation);

	const data: { [key: string]: { img: string; sfx: string } } = {
		initial: {
			img: src,
			sfx: 'https://cdn.holoen.fans/hefw/assets/anniversarys-2024/audio/dragging.mp3',
		},
		falling: {
			img: 'https://cdn.holoen.fans/hefw/assets/anniversarys-2024/chibi/fallingrys.png',
			sfx: 'https://cdn.holoen.fans/hefw/assets/anniversarys-2024/audio/fallsplat.mp3',
		},
		flat: {
			img: 'https://cdn.holoen.fans/hefw/assets/anniversarys-2024/chibi/flatrys.png',
			sfx: 'https://cdn.holoen.fans/hefw/assets/anniversarys-2024/audio/flatting.mp3',
		},
	};

	const audioRefDrag = useRef(new Audio(undefined));
	const audioRefFall = useRef(new Audio(undefined));
	const audioRefFlat = useRef(new Audio(undefined));
	const targetRef = useRef<HTMLImageElement>(null);

	useEffect(() => {
		audioRefDrag.current.src = data.initial.sfx;
		audioRefFall.current.src = data.falling.sfx;
		audioRefFlat.current.src = data.flat.sfx;

		audioRefDrag.current.load();
		audioRefFall.current.load();
		audioRefFlat.current.load();
	}, [data.falling.sfx, data.flat.sfx, data.initial.sfx]);

	useEffect(() => {
		const handleIntersection = (entries: IntersectionObserverEntry[]) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting && state === 'flat' && !flatPlayed.current) {
					audioRefFlat.current.play();
					flatPlayed.current = true;
				}
			});
		};

		const observer = new IntersectionObserver(handleIntersection, {
			root: null,
			rootMargin: '0px',
			threshold: 0.1,
		});
		const currentTarget = targetRef.current;

		if (currentTarget) {
			observer.observe(currentTarget);
		}

		return () => {
			if (currentTarget) {
				observer.unobserve(currentTarget);
			}
		};
	}, [state, flatPlayed]);

	const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
		if (state !== 'initial') {
			return;
		}
		controls.start(e);
		setState('initial');
		setDragStarted(true);
		audioRefDrag.current?.play();
	};

	const handleDragEnd = () => {
		if (state !== 'initial') {
			return;
		}
		setState('falling');
		setDragStarted(false);
		audioRefDrag.current?.pause();
		audioRefFall.current?.play();
	};

	const handleAnimationComplete = (def: {}) => {
		if (state === 'falling' && def === fallingAnimation.animate) {
			setState('flat');
		}
	};

	useEffect(() => {
		if (state === 'falling' || state === 'flat') {
			setAnimation(fallingAnimation);
			return;
		}
		if (dragStarted) {
			setAnimation(dragStartAnimation);
		}
	}, [state, dragStarted]);

	const [constraints, setConstraints] = useState<{
		left: number;
		right: number;
		top?: number;
		bottom?: number;
	}>();
	useEffect(() => {
		const handleResize = () => {
			if (containerRef.current && targetRef.current) {
				const targetRect = targetRef.current.getBoundingClientRect();
				const containerRect = containerRef.current.getBoundingClientRect();
				setConstraints({
					left: containerRect.left - targetRect.left,
					right: Math.abs(targetRect.right - containerRect.right),
					top: containerRect.top - targetRect.top,
					bottom: Math.abs(targetRect.bottom - containerRect.bottom),
				});
			}
		};
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [containerRef]);

	// Need this for avoid ios devices selecting the image
	// eslint-disable-next-line consistent-return
	useEffect(() => {
		const imgElement = targetRef.current;
		if (imgElement) {
			const preventDefault = (e: any) => {
				e.preventDefault();
			};

			imgElement.addEventListener('touchstart', preventDefault, { passive: false });
			imgElement.addEventListener('touchmove', preventDefault, { passive: false });

			return () => {
				imgElement.removeEventListener('touchstart', preventDefault);
				imgElement.removeEventListener('touchmove', preventDefault);
			};
		}
	}, []);

	return (
		<motion.img
			className={classNames(className, {
				'cursor-grab': state === 'initial' && !dragStarted,
				'cursor-grabbing': dragStarted,
			})}
			drag={state === 'initial'}
			dragControls={controls}
			dragElastic={{ top: 0.5, bottom: 0.5 }}
			dragListener={false}
			animate={animation.animate}
			transition={animation.transition}
			dragConstraints={constraints}
			onPointerDown={(e) => {
				handleDragStart(e);
			}}
			onPointerUp={handleDragEnd}
			onDragEnd={handleDragEnd}
			onAnimationComplete={(def) => {
				handleAnimationComplete(def);
			}}
			ref={targetRef}
			src={data[state].img}
			alt="bg-art"
			width={width}
			draggable={false}
			style={{
				touchAction: 'none',
				WebkitUserSelect: 'none',
				userSelect: 'none',
				WebkitTapHighlightColor: 'transparent',
			}}
		/>
	);
}
