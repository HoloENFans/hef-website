import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Select from 'react-select';
import { useId } from 'react';
import classNames from 'classnames';
import useTranslation from '@/lib/i18n/client';
import { useMangaContext } from './context/MangaContext';
import { handlePageNavigation } from './utils/helper';
import { getMangaDataOrThrow } from './utils/types';

interface SelectBoxProps {
	value: number;
	label: 'page' | 'chapter';
}

export default function SelectBox({ value, label }: SelectBoxProps) {
	const {
		mangaLanguage, setPage, chapter, setChapter, manga, pageLayout,
	} = useMangaContext();
	const mangaData = getMangaDataOrThrow(manga, mangaLanguage);
	const { t } = useTranslation('reader');

	const maxValue = label === 'page' ? mangaData.chapters[chapter].pageCount : mangaData.chapterCount;

	function handleSelectValue(selectedValue: number) {
		const maxChapterIndex = mangaData.chapterCount - 1;
		if (label === 'page') {
			handlePageNavigation(selectedValue, setPage, setChapter, chapter, mangaLanguage, manga);
			return;
		}
		if (selectedValue >= 0 && selectedValue <= maxChapterIndex) {
			setPage(0);
			setChapter(selectedValue);
		}
	}

	function generateOptions() {
		if (label === 'chapter') {
			const labelList = mangaData.chapters.map((obj) => {
				if (obj.isCover) {
					return t('cover');
				}

				if (obj.isBackCover) {
					return t('back-cover');
				}

				return `${t(label)} ${obj.displayChapterNumber}`;
			});
			return labelList.map((item, index) => ({
				value: index.toString(),
				label: item,
			}));
		}

		const labelList = Array.from(Array(maxValue).keys()).map((key) => `${t(label)} ${key + 1}`);
		return labelList.map((item, index) => ({
			value: index.toString(),
			label: item,
		}));
	}

	const options = generateOptions();

	const nextButtonClasses = 'button shrink-0 disabled:opacity-50';
	const direction = pageLayout !== 'rtl' ? 1 : -1;

	return (
		<div className="flex w-full justify-center gap-2">
			<button
				className={nextButtonClasses}
				aria-label="left-page"
				type="button"
				onClick={() => handleSelectValue(value - 1 * direction)}
				disabled={(() => {
					if (label === 'page') {
						if (direction === 1) {
							return value === 0 && chapter === 0;
						}
						return value + 1 === maxValue && chapter + 1 === mangaData.chapterCount;
					}
					if (direction === 1) {
						return value === 0;
					}
					return value + 1 === maxValue;
				})()}
			>
				<ChevronLeftIcon className="size-5" />
			</button>

			{/* eslint-disable-next-line max-len */}
			{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
			<Select
				value={options[value]}
				onChange={(selectedOption) => handleSelectValue(parseInt(selectedOption!.value, 10))}
				unstyled
				options={options}
				isSearchable={false}
				classNamePrefix="react-select"
				className="h-full grow hover:cursor-pointer"
				instanceId={useId()}
				openMenuOnClick
				classNames={{
					valueContainer: () => 'w-full',
					control: () => 'rounded-md w-full h-full px-2 hover:cursor-pointer transition-all bg-skin-secondary dark:bg-skin-secondary-dark text-skin-secondary-foreground dark:text-skin-secondary-foreground-dark hover:bg-[color-mix(in_srgb,rgb(var(--color-secondary))_90%,black)] dark:hover:bg-[color-mix(in_srgb,rgb(var(--color-secondary-dark))_90%,black)]',

					singleValue: () => 'w-full truncate',
					menu: () => classNames(
						'mt-2 p-1 bg-skin-secondary dark:bg-skin-secondary-dark border border-skin-secondary-foreground dark:border-skin-secondary-foreground-dark rounded-md transition-all',
					),
					menuList: () => 'scroll-smooth',
					option: ({ isFocused, isSelected }) => classNames('hover:cursor-pointer p-2 font-sm rounded-sm truncate', {
						'bg-skin-header dark:bg-skin-header-dark text-skin-header-foreground dark:text-skin-header-foreground-dark':
                                isSelected,
						'hover:bg-[color-mix(in_srgb,rgb(var(--color-secondary))_90%,black)] dark:hover:bg-[color-mix(in_srgb,rgb(var(--color-secondary-dark))_90%,black)]':
                                isFocused && !isSelected,
						'text-skin-secondary-foreground  dark:text-skin-secondary-foreground-dark':
                                !isSelected && !isFocused,
					}),
				}}
			/>

			<button
				className={nextButtonClasses}
				aria-label="right-page"
				type="button"
				onClick={() => handleSelectValue(value + 1 * direction)}
				disabled={(() => {
					if (label === 'page') {
						if (direction === 1) {
							return value + 1 === maxValue && chapter + 1 === mangaData.chapterCount;
						}
						return value === 0 && chapter === 0;
					}
					if (direction === 1) {
						return value + 1 === maxValue;
					}
					return value === 0;
				})()}
			>
				<ChevronRightIcon width={20} />
			</button>
		</div>
	);
}
