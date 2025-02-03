import useTranslation from '@/lib/i18n/client';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';
import { useRef } from 'react';
import CreditBlock from './CreditBlock';
import ModalTabContent from './ModalTabContent';
import { useMangaContext } from '../context/MangaContext';
import FloatingDecoArtDraggable from './FloatingDecoArtDraggable';
import { getLocalisedModalData, getModalDataRoot } from '../utils/types';

const bgDecoSrc: { [key: string]: string } = {
	dark: 'https://cdn.holoen.fans/hefw/assets/anniversarys-2024/chibi/keychainrys.png',
	light: 'https://cdn.holoen.fans/hefw/assets/anniversarys-2024/chibi/iryshood.png',
};

export default function ModalTabGeneral() {
	const { manga, readerLanguage } = useMangaContext();
	const { t } = useTranslation('reader', 'modal-general');
	const { resolvedTheme } = useTheme();
	const modalData = getLocalisedModalData(getModalDataRoot(manga), readerLanguage);

	const containerRef = useRef<HTMLDivElement>(null);
	return (
		<ModalTabContent ref={containerRef}>
			<h1 className="mb-4 flex items-center gap-1 text-4xl font-bold">
				{modalData.generalGreeting}
				{' '}
				<SparklesIcon width="2.5rem" />
			</h1>
			<p className="mb-4 whitespace-pre-line">{modalData.generalEssay}</p>
			<div className="relative">
				<h2 className="mb-4 text-3xl font-bold underline">{t('credits')}</h2>
				{manga.contributors && (
					<div className="-z-1 grid w-full lg:grid-rows-2 min-[1260px]:grid-cols-2">
						<CreditBlock
							label="organizers"
							contributors={manga.contributors.filter((e) => e.role === 'organizer')}
						/>
						<CreditBlock
							label="authors"
							contributors={manga.contributors.filter((e) => e.role === 'writer')}
						/>
						<CreditBlock
							label="lead-artists"
							contributors={manga.contributors.filter(
								(e) => e.role === 'lead-artist',
							)}
						/>
						<CreditBlock
							label="artists"
							contributors={manga.contributors.filter((e) => e.role === 'artist')}
						/>
						<CreditBlock
							label="translators"
							contributors={manga.contributors.filter((e) => e.role === 'translator')}
						/>
						<CreditBlock
							label="programmers"
							contributors={manga.contributors.filter((e) => e.role === 'developer')}
						/>
						<CreditBlock
							label="special-thanks"
							contributors={manga.contributors.filter(
								(e) => e.role === 'special-thanks',
							)}
						/>
					</div>
				)}
				<FloatingDecoArtDraggable
					src={bgDecoSrc[resolvedTheme as string]}
					className="absolute right-0 top-[5%] z-0 w-1/2 opacity-50 lg:max-w-[200px]"
					containerRef={containerRef}
				/>
			</div>
		</ModalTabContent>
	);
}
