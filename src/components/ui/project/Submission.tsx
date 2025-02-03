import { Submission as ISubmission, SubmissionMedia } from '@/types/payload-types';
import ReactPlayerWrapper from '@/components/ui/project/util/ReactPlayerWrapper';
import Image from '@/components/ui/legacy/Image';
import useTranslation from '@/lib/i18n/server';
import { Language } from '@/lib/i18n/languages';
import SubmissionGallery from './SubmissionGallery';

interface IProps {
	submission: Omit<ISubmission, 'media' | 'srcIcon'> & { media: Array<NonNullable<Required<ISubmission>['media']>[number] & { image: SubmissionMedia }>; srcIcon: SubmissionMedia };
	index?: number;
	lang: Language;
}

export default async function Submission({ submission, index, lang }: IProps) {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { t } = await useTranslation(lang, 'project', 'submission');

	return (
		<div className="max-h-full w-full text-black dark:text-white">
			<div className="mt-4 flex h-14 w-full">
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
				{submission.author && (
					<div className="ml-4 mt-3 text-lg">
						{t('author')}
						{submission.author}
					</div>
				)}
				<div className="grow" />
				{index !== undefined && (
					<p className="mr-4 mt-3 text-xl">{`#${index + 1}`}</p>
				)}
			</div>
			<div className="mt-3 w-full">
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
							elements={submission.media.map((media, submissionIndex) => {
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

								return <p key={media.id!}>{t('invalid-media')}</p>;
							})}
						/>
					)
				}
				{submission.message && (
					<p className="mx-4 mb-4 h-full w-auto overflow-auto whitespace-pre-line dark:text-gray-300">
						{submission.message}
					</p>
				)}
				<hr className="border-t-1 border-dashed border-gray-400" />
			</div>
		</div>
	);
}
