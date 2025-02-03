import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import PayloadResponse from '@/types/PayloadResponse';
import { Flag, Project } from '@/types/payload-types';
import Header from '@/components/ui/Header';
import NoticeBannerWrapper from '@/components/ui/NoticeBannerWrapper';
import { Language } from '@/lib/i18n/languages';
import DarkModeProvider from '@/components/contexts/DarkModeProvider';
import skins from '@/styles/skins.module.css';

interface IProps {
	children: React.ReactNode;
	params: Promise<{
		slug?: string;
		lang: Language;
	}>
}

interface PropsProject {
	flags: string[];
	title: string;
	description: string;
	skin: Project['skin'];
	devprops: Project['devprops'];
}

async function getProject(slug: string, lang: Language): Promise<PropsProject | null> {
	const res = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL!}/api/projects?where[slug][like]=${slug}&depth=2&locale=${lang}&fallback-locale=en`, {
		headers: {
			'X-RateLimit-Bypass': process.env.PAYLOAD_BYPASS_RATE_LIMIT_KEY ?? undefined,
			Authorization: process.env.PAYLOAD_API_KEY ? `users API-Key ${process.env.PAYLOAD_API_KEY}` : undefined,
		} as Record<string, string>,
		next: {
			tags: [slug],
		},
	});
	const parsedRes = (await res.json() as PayloadResponse<Project>);
	if (parsedRes.totalDocs === 0) return null;

	const project = parsedRes.docs[0];

	return {
		title: project.title,
		description: project.shortDescription,
		skin: project.skin,
		flags: (project.flags as Flag[] ?? []).map((flag) => flag.code),
		devprops: project.devprops,
	};
}

export default async function RootLayout({ params, children }: IProps) {
	const {
		slug,
		lang,
	} = await params;

	let project: PropsProject | null = null;

	if (slug) {
		project = await getProject(slug, lang);
	}

	return (
		<body className={project ? skins[project.skin] ?? undefined : undefined}>
			<DarkModeProvider>
				<Navbar
					flags={project?.flags ?? []}
					noticeBanner={
						<NoticeBannerWrapper lang={lang} />
					}
					locale={lang}
				/>
				{
					project && !project.flags.includes('disableHeader') && (
						<Header
							title={project.title}
							description={project.description}
							devprops={project.devprops}
						/>
					)
				}
				<main>
					{children}
				</main>
				<Footer flags={project?.flags ?? []} />
			</DarkModeProvider>
		</body>
	);
}
