'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import localizePathname from '@/lib/util/localizePathname';
import { LanguageIcon } from '@heroicons/react/24/outline';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export default function LocaleSelect() {
	const pathName = usePathname();

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger asChild>
				<button
					className="w-22 inline-flex justify-center rounded-md bg-black/20 px-4 py-2 text-sm font-medium text-white hover:bg-black/30 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white/75"
					type="button"
					aria-label="Select language"
				>
					<LanguageIcon height={24} />
					<ChevronDownIcon
						className="-mr-1 ml-2 size-5 text-white"
						aria-hidden="true"
					/>
				</button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Portal>
				<DropdownMenu.Content className="rounded-lg border border-white/20 bg-skin-secondary px-1 py-1.5 shadow-sm shadow-white/40 dark:bg-skin-secondary-dark dark:shadow-white/20">
					<DropdownMenu.Item className="rounded-lg text-black focus:bg-skin-primary/60 focus:outline-hidden dark:text-white dark:focus:bg-white/40">
						<Link
							href={localizePathname('en', pathName)}
							hrefLang="en"
							type="button"
							className="flex w-full items-center rounded-md p-2"
						>
							<img
								loading="lazy"
								width="20"
								height="20"
								src="/assets/site/english.svg"
								alt="EN flag"
							/>
							<span className="pl-2">English</span>
						</Link>
					</DropdownMenu.Item>
					<DropdownMenu.Item className="rounded-lg text-black focus:bg-skin-primary/60 focus:outline-hidden dark:text-white dark:focus:bg-white/40">
						<Link
							href={localizePathname('jp', pathName)}
							hrefLang="jp"
							type="button"
							className="flex w-full items-center rounded-md p-2"
						>
							<img
								loading="lazy"
								width="20"
								height="20"
								src="/assets/site/japan.svg"
								alt="JP flag"
							/>
							<span className="pl-2">日本語</span>
						</Link>
					</DropdownMenu.Item>

					<DropdownMenu.Arrow className="fill-skin-secondary dark:fill-white" />
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
