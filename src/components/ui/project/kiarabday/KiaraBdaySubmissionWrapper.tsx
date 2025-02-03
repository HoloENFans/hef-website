import { Project, Guild } from '@/types/payload-types';
import TextHeader from '@/components/ui/legacy/TextHeader';
import useTranslation from '@/lib/i18n/server';
import { Language } from '@/lib/i18n/languages';
import {
	PayloadLexicalReactRenderer,
	PayloadLexicalReactRendererContent,
} from '@atelier-disko/payload-lexical-react-renderer';
import ReactPlayerWrapper from '@/components/ui/project/util/ReactPlayerWrapper';
import fetchSubmissions from '@/lib/fetchSubmissions';
import Image, { getImageUrl } from '@/components/ui/legacy/Image';
import { LinkIcon } from '@heroicons/react/20/solid';

interface IProps {
	project: Omit<Project, 'flags' | 'devprops'> & {
		flags: string[];
		devprops: {
			[key: string]: string;
		};
	};
	lang: Language;
}

export default async function KiaraBdaySubmissionWrapper({ project, lang }: IProps) {
	const submissions = await fetchSubmissions(project);

	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { t } = await useTranslation(lang, 'project', 'page');

	const descriptionWithProxy = project.description.root.children.map((node) => {
		if (node.type !== 'upload') return node;
		// @ts-ignore
		return {
			...node,
			value: {
				...node.value as any,
				url: getImageUrl({
					src: (node.value as any).url,
					width: 8000,
					quality: 90,
					action: 'resize',
				}),
			},
		};
	});
	const desc = { root: { children: descriptionWithProxy } };

	return (
		<div className="flex h-full min-h-screen flex-col bg-skin-background text-skin-text dark:bg-skin-background-dark dark:text-skin-text-dark">
			<div className="grow">
				<div className="my-16 flex w-full flex-col items-center px-4 md:px-16 lg:px-24 2xl:px-56">
					<div className="w-full max-w-full break-words px-4 sm:max-w-6xl! md:break-normal">
						<div className="flex justify-between">
							<TextHeader>
								{t('description.left')}
								<span className="text-skin-heading dark:text-skin-heading-dark">
									{t('description.right')}
								</span>
							</TextHeader>
							<div className="flex flex-col text-right">
								<span className="font-semibold">
									Organized by:
									{' '}
									<span className="text-skin-heading dark:text-skin-heading-dark">
										{(project.organizers as Guild[]).map((guild) => guild.name).join(', ')}
									</span>
								</span>
								<span>
									Event date:
									{' '}
									{
										(new Intl.DateTimeFormat('en-GB', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
										})
											.format(new Date(project.date)))
									}
								</span>
							</div>
						</div>
						<div className="description-body text-lg">
							<PayloadLexicalReactRenderer
								content={desc as PayloadLexicalReactRendererContent}
							/>
						</div>
						<div className="mt-16">
							<TextHeader>
								All
								<span className="text-skin-heading dark:text-skin-heading-dark">
									{' '}
									Submissions
								</span>
							</TextHeader>
						</div>
						<div className="grid grid-cols-1 grid-rows-[masonry] gap-8 lg:grid-cols-2" style={{ contentVisibility: 'auto' }}>
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
													<div className="mb-2 mt-4 flex max-h-[750px] justify-center">
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
