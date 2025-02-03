import { Project } from '@/types/payload-types';
import PayloadResponse from '@/types/PayloadResponse';
import Header from '@/components/ui/Header';
import { Metadata } from 'next';
import useTranslation from '@/lib/i18n/server';
import { Language } from '@/lib/i18n/languages';
import ProjectCard from '@/components/ui/ProjectCard';

import type { JSX } from 'react';

interface IProps {
	params: Promise<{
		lang: Language;
	}>
}

async function fetchProjects(lang: Language): Promise<Project[]> {
	let moreProjects = true;
	let page = 1;
	let projects: Project[] = [];

	async function fetchNextProjects() {
		// Fetch next page
		const projectsRes = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL!}/api/projects?limit=100&page=${page}&depth=2&locale=${lang}&fallback-locale=en&where[status][not_equals]=hidden`, {
			headers: {
				'X-RateLimit-Bypass': process.env.PAYLOAD_BYPASS_RATE_LIMIT_KEY ?? undefined,
				Authorization: process.env.PAYLOAD_API_KEY ? `users API-Key ${process.env.PAYLOAD_API_KEY}` : undefined,
			} as Record<string, string>,
			next: {
				tags: ['projectList'],
			},
		});
		const body: PayloadResponse<Project> = await projectsRes.json();

		projects = projects.concat(body.docs);

		// Set variables for next fetch
		page += 1;
		moreProjects = body.hasNextPage;
	}

	while (moreProjects) {
		// eslint-disable-next-line no-await-in-loop
		await fetchNextProjects();
	}

	return projects;
}

function formatProjects(projects: Project[], lang: Language): JSX.Element[] {
	return projects.map((project) => (
		<ProjectCard
			key={project.id}
			project={project}
			lang={lang}
		/>
	));
}

export default async function Page({ params }: IProps) {
	const {
		lang,
	} = await params;

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { t } = await useTranslation(lang, 'projects', 'page');
	const projects = await fetchProjects(lang);
	const projectsHtml = formatProjects(projects, lang);

	return (
		<div className="flex h-full min-h-screen flex-col bg-skin-background dark:bg-skin-background-dark">
			<Header
				title="Projects"
				description="A list of all the projects organized by Hololive EN Fan servers!"
			/>
			<div className="grow">
				<div className="my-16 flex w-full flex-col items-center px-4 md:px-16 lg:px-24 2xl:px-56">
					<div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
						{projectsHtml.length > 0 ? (
							projectsHtml
						) : (
							<div className="mt-4 text-2xl font-bold text-black dark:text-white">
								{t('none')}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export async function generateMetadata(props: IProps): Promise<Metadata> {
	const params = await props.params;

	const {
		lang,
	} = params;

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { t } = await useTranslation(lang, 'projects', 'head');

	const title = t('title');
	const description = t('description');

	return {
		title,
		description,
		alternates: {
			canonical: '/projects',
			languages: {
				en: '/en/projects',
				ja: '/jp/projects',
			},
		},
		openGraph: {
			title,
			description,
			images: 'https://holoen.fans/img/logo.png',
			type: 'website',
			siteName: 'HoloEN Fan Website',
		},
		twitter: {
			title,
			description,
			images: 'https://holoen.fans/img/logo.png',
			site: '@HEF_Website',
			card: 'summary_large_image',
		},
	};
}
