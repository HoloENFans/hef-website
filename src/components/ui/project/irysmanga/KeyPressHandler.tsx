import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { useMangaContext } from './context/MangaContext';
import {
	getNextOption,
	handleChapterNavigation,
	handlePageNavigation,
} from './utils/helper';
import {
	fitModes,
	headerVisibilities,
	languages,
	pageLayouts,
	progressVisibilities,
} from './utils/types';

interface IProps {
	setOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
	readerContainerRef: React.RefObject<HTMLDivElement | null>;
	modalRef: React.RefObject<HTMLDialogElement | null>;
}

export default function KeyPressHandler({
	setOpenSidebar,
	readerContainerRef,
	modalRef,
}: IProps) {
	const {
		setPage,
		setChapter,
		setPageLayout,
		setFitMode,
		setProgressVisibility,
		setMangaLanguage,
		setReaderLanguage,
		page,
		chapter,
		pageLayout,
		mangaLanguage,
		manga,
		setHeaderVisibility,
	} = useMangaContext();

	const scrollIntervalRef = useRef<any>(undefined);
	const scrollDirectionRef = useRef<number>(undefined);

	const { resolvedTheme, setTheme } = useTheme();

	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (modalRef.current?.open) {
				return;
			}

			if (event.key === 'ArrowLeft') {
				if (pageLayout === 'ltr' || pageLayout === 'long') {
					handlePageNavigation(
						page - 1,
						setPage,
						setChapter,
						chapter,
						mangaLanguage,
						manga,
					);
				} else {
					handlePageNavigation(
						page + 1,
						setPage,
						setChapter,
						chapter,
						mangaLanguage,
						manga,
					);
				}
			}
			if (event.key === 'ArrowRight') {
				if (pageLayout === 'ltr' || pageLayout === 'long') {
					handlePageNavigation(
						page + 1,
						setPage,
						setChapter,
						chapter,
						mangaLanguage,
						manga,
					);
				} else {
					handlePageNavigation(
						page - 1,
						setPage,
						setChapter,
						chapter,
						mangaLanguage,
						manga,
					);
				}
			}

			if (event.key === ',') {
				if (pageLayout === 'ltr' || pageLayout === 'long') {
					handleChapterNavigation(
						setChapter,
						setPage,
						chapter - 1,
						mangaLanguage,
						manga,
					);
				} else {
					handleChapterNavigation(
						setChapter,
						setPage,
						chapter + 1,
						mangaLanguage,
						manga,
					);
				}
			}

			if (event.key === '.') {
				if (pageLayout === 'ltr' || pageLayout === 'long') {
					handleChapterNavigation(
						setChapter,
						setPage,
						chapter + 1,
						mangaLanguage,
						manga,
					);
				} else {
					handleChapterNavigation(
						setChapter,
						setPage,
						chapter - 1,
						mangaLanguage,
						manga,
					);
				}
			}

			if (event.key === 'm') {
				setOpenSidebar((prev) => !prev);
			}

			if (event.key === 'h') {
				setHeaderVisibility((prev) => getNextOption(prev, headerVisibilities));
			}

			if (event.key === 't') {
				setTheme(resolvedTheme === 'light' ? 'dark' : 'light');
			}

			if (event.key === 'f') {
				setFitMode((prev) => getNextOption(prev, fitModes));
			}

			if (event.key === 's') {
				setPageLayout((prev) => getNextOption(prev, pageLayouts));
			}

			if (event.key === 'p') {
				setProgressVisibility((prev) => getNextOption(prev, progressVisibilities));
			}

			if (event.key === 'j') {
				setMangaLanguage((prev) => getNextOption(prev, languages));
			}

			if (event.key === 'k') {
				setReaderLanguage((prev) => getNextOption(prev, languages));
			}

			if (event.key === 'i') {
				modalRef.current?.showModal();
			}
		};

		window.addEventListener('keydown', handleKeyPress);

		return () => {
			window.removeEventListener('keydown', handleKeyPress);
		};
	}, [
		chapter,
		mangaLanguage,
		manga,
		page,
		pageLayout,
		scrollIntervalRef,
		scrollDirectionRef,
		setChapter,
		setPage,
		setHeaderVisibility,
		setFitMode,
		setMangaLanguage,
		setReaderLanguage,
		setOpenSidebar,
		setPageLayout,
		setProgressVisibility,
		setTheme,
		resolvedTheme,
		modalRef,
	]);

	useEffect(() => {
		const startScrolling = (scrollDirection: number) => {
			if (!scrollIntervalRef.current) {
				scrollDirectionRef.current = scrollDirection;
				scrollIntervalRef.current = setInterval(() => {
					// eslint-disable-next-line
                    readerContainerRef.current!.scrollTop +=
                        scrollDirectionRef.current! * 10; // Adjust scrolling speed as needed
				}, 10); // Adjust interval as needed for smoother scrolling
			}
		};

		const stopScrolling = () => {
			if (scrollIntervalRef.current) {
				clearInterval(scrollIntervalRef.current);
				scrollIntervalRef.current = undefined;
				scrollDirectionRef.current = undefined;
			}
		};

		const handleKeyRelease = () => {
			stopScrolling();
		};

		const handleKeyPressUpDown = (event: KeyboardEvent) => {
			if (modalRef.current?.open) {
				return;
			}
			if (event.key === 'ArrowUp') {
				event.preventDefault();
				startScrolling(-1);
			}
			if (event.key === 'ArrowDown') {
				event.preventDefault();
				startScrolling(1);
			}
		};

		window.addEventListener('keydown', handleKeyPressUpDown);
		window.addEventListener('keyup', handleKeyRelease);
		return () => {
			window.removeEventListener('keydown', handleKeyPressUpDown);
			window.removeEventListener('keyup', handleKeyRelease);
			stopScrolling();
		};
	}, [readerContainerRef, modalRef]);

	return null;
}
