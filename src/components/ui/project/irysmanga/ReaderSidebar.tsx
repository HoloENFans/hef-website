import classNames from 'classnames';
import { XMarkIcon } from '@heroicons/react/24/solid';
import {
	Bars3Icon,
	BookOpenIcon,
	DocumentIcon,
	InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useRef } from 'react';
import useTranslation from '@/lib/i18n/client';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import SelectBox from './SelectBox';
import { useMangaContext } from './context/MangaContext';
import {
	fitModes,
	getMangaDataOrThrow,
	headerVisibilities,
	languages,
	pageLayouts,
	progressVisibilities,
	ReaderSetting,
	ReaderTheme,
	readerThemes,
} from './utils/types';
import SettingButton from './SettingButton';
import styles from './styles/Sidebar.module.css';
import ReaderModal from './modal-components/ReaderModal';

interface IProps {
	openSidebar: boolean;
	setOpenSidebar: React.Dispatch<React.SetStateAction<boolean>>;
	modalRef: React.RefObject<HTMLDialogElement | null>;
}

export default function ReaderSidebar({
	openSidebar,
	setOpenSidebar,
	modalRef,
}: IProps) {
	const { resolvedTheme, setTheme } = useTheme();

	const {
		pageLayout,
		page,
		chapter,
		fitMode,
		readerLanguage,
		mangaLanguage,
		headerVisibility,
		progressVisibility,
		manga,
		hasVisited,
		setPageLayout,
		setFitMode,
		setReaderLanguage,
		setMangaLanguage,
		setHeaderVisibility,
		setProgressVisibility,
		setHasVisited,
	} = useMangaContext();
	const { t, i18n } = useTranslation('reader');
	const mangaData = getMangaDataOrThrow(manga, mangaLanguage);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		i18n.changeLanguage(readerLanguage);
	}, [readerLanguage, i18n]);

	useEffect(() => {
		const width = containerRef.current?.getBoundingClientRect().width;
		document.documentElement.style.setProperty(
			'--sidebar-width',
			`${width!}px`,
		);
	}, []);

	useEffect(() => {
		if (!hasVisited) {
			setHasVisited(true);
			modalRef.current?.showModal();
		}
	}, [hasVisited, modalRef, setHasVisited]);

	const mangaLanguages: ReaderSetting[] = languages.filter((value) => {
		// If no chapters don't allow it as a selectable target.
		if (manga.data[value].chapterCount === 0) {
			return false;
		}

		return manga.data[value].chapters[chapter] !== null;
	});

	return (
		<>
			{/* This is a hamburger menu if both the header and the menu is closed. */}
			<button
				type="button"
				aria-label="Open the sidebar"
				className={classNames(
					'z-10 absolute right-4 top-4 cursor-pointer flex justify-end items-start',
					{
						hidden:
                            openSidebar || headerVisibility === 'header-shown',
						block: !(
							openSidebar || headerVisibility === 'header-shown'
						),
					},
				)}
				onClick={() => setOpenSidebar(true)}
				disabled={openSidebar}
			>
				<Bars3Icon
					className="transition-all top-0 right-0 opacity-50 hover:opacity-100"
					width={30}
				/>
			</button>

			<div
				className={classNames(styles.fakeSidebarContainer, {
					[styles.fakeSidebarContainerOpen]: openSidebar,
					[styles.fakeSidebarContainerHidden]: !openSidebar,
				})}
			/>

			<div
				className={classNames(styles.sidebarContainer, {
					[styles.sidebarContainerOpen]: openSidebar,
					[styles.sidebarContainerHidden]: !openSidebar,
				})}
				ref={containerRef}
			>
				{/* Manga info */}
				<div className="400 flex flex-col gap-2">
					<div className="flex flex-col gap-1">
						<div className="flex flex-row content-center items-center justify-between">
							<div className="flex items-center gap-1">
								<BookOpenIcon width={30} />
								<strong className="whitespace-nowrap">
									{mangaData.title}
								</strong>
							</div>
							<button
								type="button"
								aria-label="Close the sidebar"
								onClick={() => setOpenSidebar(false)}
							>
								<XMarkIcon
									className={styles.xButton}
									width={30}
								/>
							</button>
						</div>
						<div className="flex items-center gap-1">
							<DocumentIcon width={30} />
							<strong className="whitespace-nowrap">
								{mangaData.chapters[chapter].title
									? mangaData.chapters[chapter].title
									: `${t('chapter')} ${chapter + 1}`}
							</strong>
						</div>
					</div>
					<button
						className="button relative mt-4 justify-between whitespace-nowrap text-nowrap"
						type="button"
						aria-label="Open an information modal"
						onClick={() => modalRef.current?.showModal()}
					>
						{t('details')}
						<InformationCircleIcon className="setting-icon" />
						<Image
							src="https://cdn.holoen.fans/hefw/assets/anniversarys-2024/chibi/ebi.png"
							className="pointer-events-none absolute right-8 top-0 h-auto w-[90px] -translate-y-full opacity-50"
							width={0}
							height={0}
							alt="ebi"
							priority
						/>
					</button>
					<div className="flex w-full gap-1">
						<SettingButton
							value={mangaLanguage}
							valueList={mangaLanguages}
							disabled={mangaLanguages.length < 2}
							// @ts-ignore
							setValue={setMangaLanguage}
							label="manga"
						/>
						<SettingButton
							value={readerLanguage}
							valueList={languages}
							// @ts-ignore
							setValue={setReaderLanguage}
							label="reader"
						/>
					</div>
				</div>
				<div className="divider" />
				{/* Chapter and page selection */}
				<div className="flex flex-col items-center gap-2">
					<SelectBox value={page} label="page" />
					<SelectBox value={chapter} label="chapter" />
				</div>
				<div className="divider" />
				{/* Reader settings */}
				<div className="flex flex-col gap-2">
					<SettingButton
						value={pageLayout}
						valueList={pageLayouts}
						// @ts-ignore
						setValue={setPageLayout}
					/>
					<SettingButton
						value={fitMode}
						valueList={fitModes}
						// @ts-ignore
						setValue={setFitMode}
					/>
					<SettingButton
						value={headerVisibility}
						valueList={headerVisibilities}
						// @ts-ignore
						setValue={setHeaderVisibility}
					/>
					<SettingButton
						value={progressVisibility}
						valueList={progressVisibilities}
						// @ts-ignore
						setValue={setProgressVisibility}
					/>
					<SettingButton
						value={(resolvedTheme as ReaderTheme) ?? 'light'}
						valueList={readerThemes}
						onClick={() => setTheme(
							resolvedTheme === 'light' ? 'dark' : 'light',
						)}
						// @ts-ignore
						setValue={() => {}}
						label="theme"
					/>
				</div>
			</div>
			<ReaderModal modalRef={modalRef} />
		</>
	);
}
