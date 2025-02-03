import useTranslation from '@/lib/i18n/server';
import localizePathname from '@/lib/util/localizePathname';
import Link from 'next/link';
import DarkModeToggle from '@/components/ui/DarkModeToggle';
import LocaleSelect from '@/components/ui/util/LocaleSelect';
import { ReactNode } from 'react';
import MobileNav from '@/components/ui/MobileNav';
import Icon from '@/components/ui/Icon';
import { Language } from '@/lib/i18n/languages';

interface IProps {
	flags: string[];
	noticeBanner: ReactNode;
	locale: Language;
}

export default async function Navbar({ flags, noticeBanner, locale }: IProps) {
	if (flags.includes('disableNavbar')) return null;

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { t } = await useTranslation(locale, 'layout', 'nav');

	return (
		<header>
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

					<MobileNav noticeBanner={noticeBanner} />
				</div>

				<div className="hidden w-full items-center justify-between sm:flex">
					<nav className="flex items-center space-x-4 text-lg">
						<Link
							href="/"
							className="rounded-lg focus:outline-hidden focus:ring-2 focus:ring-white/80"
							aria-label="Home"
						>
							<Icon />
						</Link>

						<Link
							href={localizePathname(locale, '/projects')}
							hrefLang={locale}
							className="rounded-lg px-2 py-1 font-semibold hover:text-opacity-80 focus:outline-hidden focus:ring-2 focus:ring-white/80"
						>
							{t('projects')}
						</Link>
						{/* eslint-disable */}
						{/* <Link
							href={localizePathname(locale, '/about')}
							hrefLang={locale}
							className="rounded-lg px-2 py-1 font-semibold text-white hover:text-opacity-80 focus:outline-hidden focus:ring-2 focus:ring-white/80"
						>
							{t('about')}
						</Link> */}
						{/* eslint-enable */}
					</nav>
					<div className="flex flex-row">
						<LocaleSelect />
						<DarkModeToggle />
					</div>
				</div>
			</div>
		</header>
	);
}
