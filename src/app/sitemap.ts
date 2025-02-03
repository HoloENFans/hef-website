/* eslint-disable import/prefer-default-export */
import { Project } from '@/types/payload-types';
import PayloadResponse from '@/types/PayloadResponse';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	let projects: Project[] = [];
	let moreProjects = true;
	let page = 1;

	async function fetchNextProjects() {
		// Fetch next page
		const projectsRes = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL!}/api/projects?depth=0&limit=100&page=${page}&where[status][not_equals]=hidden`, {
			headers: {
				'X-RateLimit-Bypass': process.env.PAYLOAD_BYPASS_RATE_LIMIT_KEY ?? undefined,
				Authorization: process.env.PAYLOAD_API_KEY ? `users API-Key ${process.env.PAYLOAD_API_KEY}` : undefined,
			} as Record<string, string>,
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

	const map: MetadataRoute.Sitemap = [
		{
			url: 'https://holoen.fans',
			lastModified: new Date(),
			alternates: {
				languages: {
					en: 'https://holoen.fans/en',
					ja: 'https://holoen.fans/jp',
				},
			},
		},
		{
			url: 'https://holoen.fans/projects',
			lastModified: new Date(),
			alternates: {
				languages: {
					en: 'https://holoen.fans/en/projects',
					ja: 'https://holoen.fans/jp/projects',
				},
			},
		},
	];

	// eslint-disable-next-line no-restricted-syntax
	for (const project of projects) {
		map.push({
			url: `https://holoen.fans/projects/${project.slug}`,
			lastModified: project.updatedAt,
			alternates: {
				languages: {
					en: `https://holoen.fans/en/projects/${project.slug}`,
					ja: `https://holoen.fans/jp/projects/${project.slug}`,
				},
			},
		});
	}

	return map;
}
