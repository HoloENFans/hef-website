import useTranslation from '@/lib/i18n/client';
import {
	CommandLineIcon,
	LanguageIcon,
	LightBulbIcon,
	PaintBrushIcon,
	PencilIcon,
	StarIcon,
} from '@heroicons/react/24/outline';
import type { JSX } from 'react';
import { Contributor } from '../utils/types';

const iconWidth = '1.5rem';
const contributorIcons: { [key: string]: JSX.Element } = {
	organizers: <LightBulbIcon width={iconWidth} />,
	authors: <PencilIcon width={iconWidth} />,
	'lead-artists': <PaintBrushIcon width={iconWidth} />,
	artists: <PaintBrushIcon width={iconWidth} />,
	translators: <LanguageIcon width={iconWidth} />,
	programmers: <CommandLineIcon width={iconWidth} />,
	'special-thanks': <StarIcon width={iconWidth} />,
};

interface IProps {
	label: string;
	contributors: Contributor[];
}

interface RCProps {
	label: string;
	contributor: Contributor;
}

function RenderedContributor({ label, contributor }: RCProps) {
	if (contributor.socials.length === 0) {
		return <li>{contributor.name}</li>;
	}

	return (
		<li>
			{contributor.name}
			{' '}
			-
			{' '}
			{contributor.socials.map((social) => (
				<span
					key={`span-${label}-${contributor.name}-${social.platform}`}
				>
					<a
						href={social.link}
						className="link"
						target="_blank"
						rel="noopener noreferrer"
					>
						{social.platform}
					</a>
					{' '}
				</span>
			))}
		</li>
	);
}

export default function CreditBlock({ label, contributors }: IProps) {
	const { t } = useTranslation('reader', 'modal-general');

	return (
		<div className="mb-4">
			<h3 className="mb-1 flex items-center gap-1 text-2xl font-semibold">
				{contributorIcons[label] ?? null}
				{t(label)}
			</h3>
			<ul className="ml-4 list-inside list-disc">
				{contributors.map((contributor) => (
					<RenderedContributor
						key={`rc-${label}-${contributor.name}`}
						label={label}
						contributor={contributor}
					/>
				))}
			</ul>
		</div>
	);
}
