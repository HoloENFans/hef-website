import { RefObject, useEffect, useState } from 'react';
import { languages } from '@/lib/i18n/settings';
import { LanguageIcon, XMarkIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import useTranslation from '@/lib/i18n/client';
import ModalTab from './ModalTab';
import ModalTabGeneral from './ModalTabGeneral';
import ModalTabStory from './ModalTabStory';
import ModalTabReader from './ModalTabReader';
import { getNextOption } from '../utils/helper';
import { useMangaContext } from '../context/MangaContext';
import ThemeController from './ThemeController';
import styles from '../styles/Sidebar.module.css';
import ModalTabLicences from './ModalTabLicences';

interface IProps {
	modalRef: RefObject<HTMLDialogElement | null>;
}

export default function ReaderModal({ modalRef }: IProps) {
	const [selected, setSelected] = useState('general');
	const { readerLanguage, setReaderLanguage } = useMangaContext();
	const options = ['general', 'story', 'reader', 'licenses'];
	const { t } = useTranslation('reader');

	const SMALL_MOBILE_PAGE_WIDTH = 576;
	const [showMobileCloseButton, setShowMobileCloseButton] = useState(
		window && window.innerWidth < SMALL_MOBILE_PAGE_WIDTH,
	);

	useEffect(() => {
		const handleResize = () => {
			setShowMobileCloseButton(window && window.innerWidth < SMALL_MOBILE_PAGE_WIDTH);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, [setShowMobileCloseButton]);

	return (
		<dialog id="info_modal" className="modal invisible bg-linear-to-r" ref={modalRef}>
			<div className="modal-box relative flex h-[85%] max-h-[65rem] min-w-[50%] max-w-[80%] flex-col justify-between overflow-hidden">
				<button
					className="absolute right-4 top-4"
					type="button"
					aria-label="Close the modal"
					onClick={() => modalRef.current?.close()}
				>
					{!showMobileCloseButton && (
						<XMarkIcon className={classNames(styles.xButton)} width={30} />
					)}
				</button>
				<div className="flex max-h-[87%] grow flex-col overflow-hidden">
					<div className="tabs-lifted flex h-[32px] self-center">
						<ModalTab
							label={options[0]}
							selected={selected}
							setSelected={setSelected}
						/>
						<ModalTab
							label={options[1]}
							selected={selected}
							setSelected={setSelected}
						/>
						<ModalTab
							label={options[2]}
							selected={selected}
							setSelected={setSelected}
						/>
						<ModalTab
							label={options[3]}
							selected={selected}
							setSelected={setSelected}
						/>
					</div>

					{selected === 'general' && <ModalTabGeneral />}
					{selected === 'story' && <ModalTabStory />}
					{selected === 'reader' && <ModalTabReader />}
					{selected === 'licenses' && <ModalTabLicences />}
				</div>
				<div className="modal-action flex items-center justify-between">
					<div className="self-start">
						<ThemeController />
					</div>
					<div className="flex gap-1 self-end">
						<button
							type="button"
							className="flex h-12 min-h-12 items-center gap-2 whitespace-nowrap rounded-md border border-transparent bg-skin-primary p-4 text-sm font-semibold leading-4 text-skin-primary-foreground transition-all hover:bg-[color-mix(in_srgb,rgb(var(--color-primary))_90%,black)] disabled:cursor-not-allowed disabled:bg-[color-mix(in_srgb,rgb(var(--color-primary))_90%,black)] dark:bg-skin-primary-dark dark:text-skin-primary-foreground-dark dark:hover:bg-[color-mix(in_srgb,rgb(var(--color-primary-dark))_90%,black)]"
							onClick={() => setReaderLanguage(getNextOption(readerLanguage, languages))}
						>
							<LanguageIcon width="1rem" />
							{readerLanguage.toLocaleUpperCase()}
						</button>
						{showMobileCloseButton && (
							<button
								type="button"
								className="flex h-12 min-h-12 items-center gap-2 whitespace-nowrap rounded-md border-[1px] border-solid border-[rgb(var(--color-primary))] bg-transparent p-4 text-sm font-semibold leading-4 transition-all hover:bg-black/10 dark:border-[rgb(var(--color-primary-dark))] dark:hover:bg-white/10"
								onClick={() => modalRef.current?.close()}
							>
								{t('close')}
							</button>
						)}
					</div>
				</div>
			</div>
			<form method="dialog" className="modal-backdrop">
				<button type="submit" className="hover:cursor-default">
					Close
				</button>
			</form>
		</dialog>
	);
}
