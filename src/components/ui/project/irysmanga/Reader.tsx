'use client';

import lod from 'lodash';
import classNames from 'classnames';
import NextImage from 'next/image';
import React, {
	useEffect, useMemo, useRef, useState,
} from 'react';
import { useMangaContext } from './context/MangaContext';
import { handlePageNavigation } from './utils/helper';
import ProgressBar from './ProgressBar';
import { getMangaDataOrThrow } from './utils/types';
import ReaderHeader from './ReaderHeader';
import styles from './styles/Reader.module.css';
import LoadingIcon from './LoadingIcon';

interface IProps {
	openSidebar: boolean
	setOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
	containerRef: React.RefObject<HTMLDivElement | null>;
}

export default function Reader({
	openSidebar,
	setOpenSidebar,
	containerRef,
}: IProps) {
	const {
		pageLayout,
		fitMode,
		page,
		setPage,
		setChapter,
		chapter,
		manga,
		mangaLanguage,
		optimizedImages,
	} = useMangaContext();

	const DEFAULT_HEIGHT = 1080;

	const mangaData = getMangaDataOrThrow(manga, mangaLanguage);
	const pageRefs = useRef<HTMLImageElement[]>([]);

	const isScrollCausedByUserScroll = useRef<boolean>(false);
	const isHandleScrollLocked = useRef<boolean>(false); // A check to "lock" the handleScroll event.

	const [loading, setLoading] = useState<boolean[]>(
		Array(mangaData.chapters[chapter].pageCount).fill(true),
	);
	const [imageSizes, setImageSizes] = useState(
		Array(mangaData.chapters[chapter].pageCount).fill({ width: 0, height: DEFAULT_HEIGHT }),
	);
	const [containerDimensions, setContainerDimensions] = useState({
		width: 0,
		height: 0,
	});
	const [currentlyLoadedChapter, setCurrentlyLoadedChapter] = useState(chapter);
	const [currentlyLoadedLanguage, setCurrentlyLoadedLanguage] = useState(mangaLanguage);

	/**
	 * A function to automatically set the "is user currently the one scrolling" state to false.
	 */
	const handleEndScroll = useMemo(() => lod.debounce(() => {
		isScrollCausedByUserScroll.current = false;
	}, 100), []);

	/**
	 * Update the page counter when the user scrolls.
	 * It chooses the page that has the closest middle point to the container's middle point
	 */
	const handleScroll = () => {
		if (!containerRef.current || (pageLayout === 'long' && isHandleScrollLocked.current)) {
			return;
		}

		if (pageLayout !== 'long') {
			return;
		}

		isScrollCausedByUserScroll.current = true;

		const containerRect = containerRef.current.getBoundingClientRect();
		const containerMiddleY = (containerRect.top + containerRect.bottom) / 2;
		let minDistY = Infinity;
		let chosenPage = -1;

		for (let i = 0; i < pageRefs.current.length; ++i) {
			const imgRect = pageRefs.current[i].getBoundingClientRect();
			const imgMiddleY = (imgRect.bottom + imgRect.top) / 2;
			const distY = Math.abs(containerMiddleY - imgMiddleY);

			if (distY < minDistY) {
				chosenPage = i;
				minDistY = distY;
			}
		}

		if (chosenPage !== -1) {
			setPage(chosenPage);
		}

		handleEndScroll();
	};

	/**
	 * Check whether we should preload an image for a page.
	 * Note we preload a few pages in advance (or behind just in case you try jumping pages)
	 * for a better reading experience, but we don't want to load all the images at once
	 * because that might be slow.
	 */
	const getLazyLoading = (numPages: number, pg: number): ('eager' | 'lazy') => (Math.abs(numPages - pg) <= 3 ? 'eager' : 'lazy');

	// Handle page turn on click
	const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
		const { clientX, target } = event;
		if (target === null) {
			return;
		}

		const { left, width } = (target as HTMLElement).getBoundingClientRect();
		const MOBILE_PAGE_WIDTH = 768;

		if (window && window.innerWidth < MOBILE_PAGE_WIDTH) {
			if (openSidebar) {
				setOpenSidebar(false);
				return;
			}
		}

		const position = clientX - left;
		const threshold = width / 2;

		if (position < threshold) {
			const diff = (pageLayout === 'ltr' || pageLayout === 'long') ? -1 : 1;
			handlePageNavigation(
				page + diff,
				setPage,
				setChapter,
				chapter,
				mangaLanguage,
				manga,
			);
		} else {
			const diff = (pageLayout === 'ltr' || pageLayout === 'long') ? 1 : -1;
			handlePageNavigation(
				page + diff,
				setPage,
				setChapter,
				chapter,
				mangaLanguage,
				manga,
			);
		}
	};

	useEffect(() => {
		if (!containerRef.current) {
			return () => { };
		}

		const resizeObserver = new ResizeObserver(() => {
			if (containerRef && containerRef.current) {
				const { clientWidth, clientHeight } = containerRef.current;
				setContainerDimensions({
					width: clientWidth,
					height: clientHeight,
				});
			}
		});

		resizeObserver.observe(containerRef.current);

		return () => resizeObserver.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (containerRef && containerRef.current) {
			const { clientWidth, clientHeight } = containerRef.current;
			setContainerDimensions({
				width: clientWidth,
				height: clientHeight,
			});
		}
	}, [containerRef, fitMode]);

	useEffect(() => {
		if (chapter !== currentlyLoadedChapter) {
			// Flush the page stuff after a new chapter is loaded.
			const { pageCount } = mangaData.chapters[chapter];

			setLoading(Array(pageCount).fill(true));
			setImageSizes(Array(pageCount).fill({ width: 0, height: DEFAULT_HEIGHT }));
			pageRefs.current = [];

			setCurrentlyLoadedChapter(chapter);
		}
	}, [chapter, mangaData.chapters, currentlyLoadedChapter]);

	useEffect(() => {
		if (mangaLanguage !== currentlyLoadedLanguage) {
			setLoading(loading.fill(true));
			setImageSizes(imageSizes.fill({ width: 0, height: DEFAULT_HEIGHT }));
			pageRefs.current = [];

			setCurrentlyLoadedLanguage(mangaLanguage);
		}
	}, [loading, imageSizes, mangaLanguage, currentlyLoadedLanguage]);

	useEffect(() => {
		if (pageLayout === 'long' && isScrollCausedByUserScroll.current) {
			return;
		}

		if (containerRef.current) {
			const targetImg = pageRefs.current[page];
			if (targetImg) {
				if (pageLayout === 'long') {
					// If:
					// - We are in long mode
					// - The page hasn't fully loaded yet
					// Then keep the scroll lock UNTIL the page (and the page after) is loaded and
					// we've scrolled to it!
					//
					// TODO: Maybe change it so it waits until pages load first? But eh, too lazy.

					const currentPageLoading = loading[page];
					const nextPageLoading = (page + 1) < mangaData.chapters[chapter].pages.length
						? loading[page + 1]
						: false;

					if (currentPageLoading || nextPageLoading) {
						isHandleScrollLocked.current = true;
					}

					// eslint-disable-next-line no-param-reassign
					containerRef.current.scrollTop = targetImg.offsetTop - containerRef.current.offsetTop;

					if (!currentPageLoading && !nextPageLoading) {
						isHandleScrollLocked.current = false;
					}
				} else {
					// eslint-disable-next-line no-param-reassign
					containerRef.current.scrollTop = targetImg.offsetTop - containerRef.current.offsetTop;
				}
			}
		}
	}, [
		page, chapter, pageLayout, loading, fitMode, containerRef, mangaData.chapters,
	]);

	let displayedPages: React.JSX.Element[] = [];
	if (mangaData.chapters[chapter]) {
		const currentChapter = mangaData.chapters[chapter];
		const maxPageCount = currentChapter.pageCount;
		// Use optimized pages if we have them, otherwise fall back to unoptimized I guess.
		const pageSources = optimizedImages.get(currentChapter.id) ?? currentChapter.pages;

		/**
		 * Returns class names for the page _container_.
		 */
		const getClassNamesContainer = (i: number) => {
			const blockStyle = (
				pageLayout !== 'long'
					? {
						block: i === page,
						hidden: i !== page,
					}
					: {
						block: true,
					}
			);

			const fitStyle = {
				// For height mode, we force the image to fit on the y-axis and then get width to scale
				// using manual calculations. Width will overflow on the container-level if necessary.
				'max-w-full h-full overflow-x-auto': fitMode === 'height',

				// For width mode, we force the image to fit on the x-axis and then get height to scale.
				// Note that height should overflow to the parent level.
				'w-full h-auto overflow-x-auto overflow-y-visible': fitMode === 'width',

				// Basically, overflow on width and then let the outer parent handle height.
				'max-w-full h-max overflow-x-auto overflow-y-visible ': fitMode === 'original',

				// Cap on container width and height; we use object-cover on the child to then make it fit.
				'max-w-full max-h-full overflow-auto': fitMode === 'fit-both',
			};

			const enableMargin = pageLayout !== 'long' && fitMode !== 'height' && !loading[i];
			const marginStyle = {
				'my-auto': enableMargin,
			};

			const loadingHeight = {
				'w-full h-full': loading[i],
			};

			return classNames(blockStyle, fitStyle, marginStyle, loadingHeight, 'relative flex shrink-0');
		};

		/**
		 * Returns class names for the page image itself.
		 */
		const getClassNamesPageImage = () => {
			const fitStyle = {
				// With fit-both, we can just use object-contain and call it a day.
				'object-contain': fitMode === 'fit-both',

				// For width, just make it follow width and let height auto-scale.
				'w-full h-auto': fitMode === 'width',
			};

			return classNames(fitStyle);
		};

		/**
		 * Return styles for the page image.
		 */
		const getPageImageFitStyles = (width: number, height: number) => {
			// I could probably move this to `getClassNamesPageImage` but eh, this works and I'm lazy.

			if (fitMode === 'original') {
				return {
					width, height, maxWidth: width, maxHeight: height,
				};
			}

			if (fitMode === 'fit-both') {
				// I hate this even more but I'm way too tired and it's too close to the deadline for
				// something nicer.

				if (height > 0 && width > 0) {
					let newWidth = 0;
					let newHeight = 0;

					if (containerDimensions.height > containerDimensions.width) {
						newWidth = containerDimensions.width;
						newHeight = (containerDimensions.width / width) * height;
					} else {
						newWidth = (containerDimensions.height / height) * width;
						newHeight = containerDimensions.height;
					}

					return {
						width: newWidth,
						height: newHeight,
						maxWidth: newWidth,
						maxHeight: newHeight,
					};
				}

				return {};
			}

			if (fitMode === 'height') {
				// I hate this but I'm too tired.
				// Note 'auto' is not necessarily correct but better than nothing I guess... I think the
				// only time it may trigger is if for _some_ reason images aren't available yet and thus
				// height is 0.
				const newWidth = height > 0 ? ((containerDimensions.height / height) * width) : 'auto';
				const newHeight = containerDimensions.height;

				return {
					width: newWidth,
					height: newHeight,
					maxWidth: newWidth,
					maxHeight: newHeight,
				};
			}

			return {};
		};

		if (currentlyLoadedChapter === chapter && currentlyLoadedLanguage === mangaLanguage) {
			displayedPages = Array.from({ length: maxPageCount }, (_, i) => {
				const fitStyles = getPageImageFitStyles(imageSizes[i].width, imageSizes[i].height);

				return (
					<div
						className={`${getClassNamesContainer(i)}`}
						key={`page-${i}`}
						ref={(el) => {
							pageRefs.current[i] = el as HTMLImageElement;
						}}
						style={{
							scrollbarWidth: 'none', msOverflowStyle: 'none',
						}}
					>
						{loading[i] && <LoadingIcon />}
						<NextImage
							src={pageSources[i]}
							className={getClassNamesPageImage()}
							quality={100}
							loading={getLazyLoading(i, page)}
							alt={`Page ${i + 1}`}
							width={imageSizes[i].width}
							height={imageSizes[i].height}
							style={{
								opacity: loading[i] ? '0' : '1', ...fitStyles,
							}}
							onLoad={(ele) => {
								setLoading((currentLoading) => currentLoading
									.map((curr, index) => (index === i ? false : curr)));

								const originalImage = ele.currentTarget;
								// eslint-disable-next-line max-len, implicit-arrow-linebreak
								setImageSizes((currentImageSizes) => currentImageSizes.map((curr, idx) => (idx === i ? { width: originalImage.naturalWidth, height: originalImage.naturalHeight } : curr)));
							}}
						/>
					</div>
				);
			});
		}
	}

	return (
		<div className="relative flex max-h-full max-w-full grow flex-col overflow-hidden">
			<ReaderHeader openSidebar={openSidebar} setOpenSidebar={setOpenSidebar} />
			{/* eslint-disable-next-line max-len */}
			{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
			<div
				ref={containerRef}
				className={classNames(styles.pagesWrapper)}
				onClick={handleClick}
				onScroll={handleScroll}
			>
				{displayedPages}
			</div>
			<div className="absolute bottom-0 left-0 w-full">
				<ProgressBar />
			</div>
		</div>
	);
}
