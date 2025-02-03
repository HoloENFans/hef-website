import { Metadata } from 'next';
import PayloadResponse from '@/types/PayloadResponse';
import { Media, Project } from '@/types/payload-types';
import { notFound } from 'next/navigation';
import Image, { getImageUrl } from '@/components/ui/legacy/Image';
import { Language } from '@/lib/i18n/languages';
import fetchSubmissions, { ISubmission } from '@/lib/fetchSubmissions';
import TextHeader from '@/components/ui/legacy/TextHeader';
import ReactPlayerWrapper from '@/components/ui/project/util/ReactPlayerWrapper';
import SubmissionGallery from '@/components/ui/project/SubmissionGallery';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { ArrowLeftIcon, LinkIcon } from '@heroicons/react/20/solid';
import ButtonLink from '@/components/ui/ButtonLink';

interface IProps {
	params: Promise<{
		slug: string;
		lang: Language;
	}>
}

async function fetchProject(slug: string, lang: Language) {
	const projectRes = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL!}/api/projects?where[slug][like]=${slug}&depth=0&locale=${lang}&fallback-locale=en`, {
		headers: {
			'X-RateLimit-Bypass': process.env.PAYLOAD_BYPASS_RATE_LIMIT_KEY ?? undefined,
			Authorization: process.env.PAYLOAD_API_KEY ? `users API-Key ${process.env.PAYLOAD_API_KEY}` : undefined,
		} as Record<string, string>,
		next: {
			tags: [slug],
		},
	});

	const res = (await projectRes.json() as PayloadResponse<Project>);
	if (res.totalDocs === 0) return null;

	return res.docs[0];
}

export function RandomSubmissions({ submissions }: { submissions: ISubmission[] }) {
	const randomSubmissions: ISubmission[] = [];

	for (let i = 0; i < Math.min(submissions.length, 3); i++) {
		let idx = Math.floor(Math.random() * submissions.length);
		let randomSubmission = submissions[idx];

		// eslint-disable-next-line @typescript-eslint/no-loop-func
		while ((randomSubmissions.findIndex((sub) => sub.id === randomSubmission.id) !== -1)) {
			idx = Math.floor(Math.random() * submissions.length);
			randomSubmission = submissions[idx];
		}

		randomSubmissions.push(randomSubmission);
	}

	return randomSubmissions.map((submission) => (
		<div
			className="rounded-md bg-skin-secondary px-8 py-4 dark:bg-skin-secondary-dark lg:max-w-[32%]"
			key={`rand-${submission.id}`}
		>
			<div className="flex">
				{submission.srcIcon && (
					<Image
						className="size-14 rounded-full object-cover"
						src={submission.srcIcon.url!}
						width={
							submission.srcIcon.width! < 56 ? submission.srcIcon.width! : 56
						}
						height={
							submission.srcIcon.width! < 56
								? submission.srcIcon.height!
								: (submission.srcIcon.height! / submission.srcIcon.width!) * 56
						}
						alt={`Profile picture of ${submission.author}`}
					/>
				)}
				<h3 className="font-bold text-skin-heading dark:text-skin-heading-dark">{submission.author}</h3>
				<div className="grow" />
				<a
					className="flex items-center gap-2 text-skin-link hover:font-bold dark:text-skin-link-dark"
					href={`#${submission.id}`}
				>
					<ChevronRightIcon width={16} height={16} />
					Go to submission
				</a>
			</div>
			<div className="flex">
				{submission.message && (
					<p className="mx-4 mb-4 h-full w-auto overflow-auto whitespace-pre-line dark:text-gray-300">
						{submission.message}
					</p>
				)}
				{
					submission.media.length > 0 && (
						<>
							{submission.media[0].type === 'video' && (
								<ReactPlayerWrapper
									width="100%"
									height="100%"
									url={submission.media[0].url!}
									controls
									light
									className="my-4"
								/>
							)}
							{submission.media[0].type === 'image' && (
								<div className="mb-2 mt-4 flex size-full max-h-[350px] justify-center">
									<Image
										className="mb-4 max-w-10/12 object-contain"
										src={submission.media[0].image.url!}
										width={
											submission.media[0].image.width! < 1024
												? submission.media[0].image.width! : 1024
										}
										height={
											submission.media[0].image.width! < 1024
												? submission.media[0].image.height!
												// eslint-disable-next-line max-len
												: (submission.media[0].image.height! / submission.media[0].image.width!) * 1024
										}
										alt={`Image submission from ${submission.author}`}
									/>
								</div>
							)}
						</>
					)
				}
			</div>
		</div>
	));
}

export default async function SubmissionsPage({ params }: IProps) {
	const {
		slug,
		lang,
	} = await params;

	const project = await fetchProject(slug, lang);
	if (!project || !project.hasSubmissions) {
		notFound();
	}

	const submissions = await fetchSubmissions(project);

	return (
		<div className="flex h-full min-h-screen flex-col bg-skin-background text-skin-text dark:bg-skin-background-dark dark:text-skin-text-dark">
			<div className="grow">
				<div className="my-16 flex w-full flex-col items-center px-4 md:px-16 lg:px-24 2xl:px-56">
					<div className="w-full max-w-full break-words px-4 md:break-normal">
						<ButtonLink
							className="mb-8 w-fit"
							url={`/projects/${slug}`}
							lang={lang}
							internal
						>
							<ArrowLeftIcon className="size-6" />
							Go back
						</ButtonLink>

						<TextHeader>
							Random
							<span className="text-skin-heading dark:text-skin-heading-dark">
								{' '}
								Submissions
							</span>
						</TextHeader>
						<div className="mb-16 flex flex-wrap justify-between gap-4">
							<RandomSubmissions submissions={submissions} />
						</div>

						<TextHeader>
							All
							<span className="text-skin-heading dark:text-skin-heading-dark">
								{' '}
								Submissions
							</span>
						</TextHeader>
						<div className="grid grid-cols-1 grid-rows-[masonry] gap-8 lg:grid-cols-3" style={{ contentVisibility: 'auto' }}>
							{submissions.map((submission) => (
								<div
									className="rounded-md bg-skin-secondary px-8 py-4 dark:bg-skin-secondary-dark"
									id={submission.id}
									key={submission.id}
								>
									<div className="flex">
										{submission.srcIcon && (
											<Image
												className="size-14 rounded-full object-cover"
												src={submission.srcIcon.url!}
												width={
													submission.srcIcon.width! < 56 ? submission.srcIcon.width! : 56
												}
												height={
													submission.srcIcon.width! < 56
														? submission.srcIcon.height!
														: (submission.srcIcon.height! / submission.srcIcon.width!) * 56
												}
												alt={`Profile picture of ${submission.author}`}
											/>
										)}
										<h3 className="font-bold text-skin-heading dark:text-skin-heading-dark">{submission.author}</h3>

										<div className="grow" />
										<a
											className="flex items-center gap-2 text-skin-link dark:text-skin-link-dark"
											href={`#${submission.id}`}
										>
											<LinkIcon width={16} height={16} />
											Link
										</a>
									</div>
									{
										submission.media.length === 1 && (
											<>
												{submission.media[0].type === 'video' && (
													<ReactPlayerWrapper
														width="100%"
														height="100%"
														url={submission.media[0].url!}
														controls
														light
														className="my-4"
													/>
												)}
												{submission.media[0].type === 'image' && (
													<div className="mb-2 mt-4 flex size-full max-h-[750px] justify-center">
														<Image
															className="mb-4 max-w-10/12 object-contain"
															src={submission.media[0].image.url!}
															width={
																submission.media[0].image.width! < 1024
																	? submission.media[0].image.width! : 1024
															}
															height={
																submission.media[0].image.width! < 1024
																	? submission.media[0].image.height!
																	// eslint-disable-next-line max-len
																	: (submission.media[0].image.height! / submission.media[0].image.width!) * 1024
															}
															alt={`Image submission from ${submission.author}`}
														/>
													</div>
												)}
											</>
										)
									}
									{
										submission.media.length > 1 && (
											<SubmissionGallery
												submission={submission}
												elements={submission.media!.map((media, submissionIndex) => {
													if (media.type === 'video') {
														return (
															<ReactPlayerWrapper
																width="100%"
																height="100%"
																key={media.id!}
																url={media.url!}
																controls
																light
															/>
														);
													}
													if (media.type === 'image') {
														if (!media.image.url) {
															return <p key={media.id!}>Invalid media</p>;
														}

														return (
															<Image
																className="mb-4 max-w-10/12 object-contain"
																key={media.id!}
																src={media.image.url!}
																width={
																	media.image.width! < 1024 ? media.image.width! : 1024
																}
																height={
																	media.image.width! < 1024
																		? media.image.height!
																		: (media.image.height! / media.image.width!) * 1024
																}
																alt=""
																loading={submissionIndex > 0 ? 'eager' : 'lazy'}
															/>
														);
													}

													return <p key={media.id!}>Invalid media</p>;
												})}
											/>
										)
									}
									{submission.message && (
										<p className="mx-4 mb-4 h-full w-auto overflow-auto whitespace-pre-line dark:text-gray-300">
											{submission.message}
										</p>
									)}
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
	const {
		slug,
		lang,
	} = await params;

	const projectRes = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL!}/api/projects?where[slug][like]=${slug}&depth=2&locale=${lang}&fallback-locale=en`, {
		headers: {
			'X-RateLimit-Bypass': process.env.PAYLOAD_BYPASS_RATE_LIMIT_KEY ?? undefined,
			Authorization: process.env.PAYLOAD_API_KEY ? `users API-Key ${process.env.PAYLOAD_API_KEY}` : undefined,
		} as Record<string, string>,
		next: {
			tags: [slug],
		},
	});
	const parsedProjectRes = (await projectRes.json() as PayloadResponse<Project>);
	if (parsedProjectRes.totalDocs === 0) return notFound();

	const {
		title, shortDescription, ogImage, image,
	} = parsedProjectRes.docs[0];

	return {
		title: `${title} - Submissions`,
		description: shortDescription,
		alternates: {
			canonical: `/projects/${slug}`,
			languages: {
				en: `/en/projects/${slug}`,
				ja: `/jp/projects/${slug}`,
			},
		},
		openGraph: {
			title: `${title} - Submissions`,
			description: shortDescription,
			siteName: 'HoloEN Fan Website',
			// eslint-disable-next-line max-len
			images: getImageUrl({ src: (ogImage as Media | undefined)?.url ?? (image as Media).url!, width: 1024 }),
		},
		twitter: {
			title: `${title} - Submissions`,
			description: shortDescription,
			// eslint-disable-next-line max-len
			images: getImageUrl({ src: (ogImage as Media | undefined)?.url ?? (image as Media).url!, width: 1024 }),
			site: '@HEF_Website',
			card: 'summary_large_image',
		},
	};
}
