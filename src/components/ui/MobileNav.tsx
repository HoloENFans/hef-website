'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Slant as Hamburger } from 'hamburger-react';
import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import localizePathname from '@/lib/util/localizePathname';
import { useLocale } from '@/components/contexts/LocaleContext';
import useTranslation from '@/lib/i18n/client';
import DarkModeToggleMobile from '@/components/ui/DarkModeToggleMobile';
import { usePathname } from 'next/navigation';

interface IProps {
	noticeBanner: ReactNode;
}

export default function MobileNav({ noticeBanner }: IProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [isInnerToggled, setIsInnerToggled] = useState(false);

	const { locale } = useLocale();
	const { t } = useTranslation('layout', 'nav');
	const pathName = usePathname();

	useEffect(() => {
		setIsOpen(false);
		setIsInnerToggled(false);
	}, [pathName]);

	return (
		<Dialog.Root open={isOpen}>
			<Dialog.Trigger>
				<Hamburger
					toggled={isOpen}
					toggle={setIsOpen}
					onToggle={() => {
						setTimeout(() => {
							setIsInnerToggled(true);
						}, 1);
					}}
				/>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-40 size-full bg-skin-header/50 backdrop-blur-2xl dark:bg-skin-header-dark/50 dark:text-skin-header-foreground" />
				<Dialog.Content className="fixed inset-0 z-50 text-skin-header-foreground dark:text-skin-header-foreground-dark">
					{noticeBanner}
					<div className="flex h-20 w-full items-center justify-between bg-skin-header px-4 text-skin-header-foreground dark:bg-skin-header-dark dark:text-skin-header-foreground-dark sm:px-8">
						<div className="relative flex w-full items-center justify-between sm:hidden">
							<Link
								href="/"
								className="rounded-lg focus:outline-hidden focus:ring-2 focus:ring-white/80"
								aria-label="Home"
							>
								<Icon />
							</Link>

							<Hamburger
								toggled={isInnerToggled}
								toggle={setIsOpen}
								onToggle={() => {
									setIsInnerToggled(false);
								}}
							/>
						</div>
					</div>
					<div className="relative grid size-full place-items-center px-12 font-semibold">
						<div className="flex w-full justify-between">
							<nav className="flex flex-col gap-4 text-2xl">
								<Link
									href="/"
									aria-label="Home"
								>
									{t('home')}
								</Link>
								<Link
									href={localizePathname(locale, '/projects')}
									aria-label="Projects"
								>
									{t('projects')}
								</Link>
								{/* <Link
									href={localizePathname(locale, '/about')}
									aria-label="About"
								>
									{t('about')}
								</Link> */}
							</nav>
							<div className="flex flex-col gap-4 text-lg">
								<div className="flex items-center whitespace-pre-wrap">
									<Link
										href={localizePathname('en', pathName)}
										hrefLang="en"
										type="button"
										className={`underline-offset-8 ${locale === 'en' ? 'underline' : ''}`}
									>
										EN
									</Link>
									{' | '}
									<Link
										href={localizePathname('jp', pathName)}
										hrefLang="jp"
										type="button"
										className={`underline-offset-8 ${locale === 'jp' ? 'underline' : ''}`}
									>
										JP
									</Link>
								</div>
							</div>
						</div>
						<div className="fixed bottom-12 right-8">
							<DarkModeToggleMobile />
						</div>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
