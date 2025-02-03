import { Project, SubmissionMedia } from '@/types/payload-types';
import fetchSubmissions, { ISubmission } from '@/lib/fetchSubmissions';
import { getImageUrl } from '@/components/ui/legacy/Image';
import PixiRejectClientWrapper from './PixiRejectClientWrapper';

interface IProps {
	project: Omit<Project, 'flags' | 'devprops'> & {
		flags: string[];
		devprops: {
			[key: string]: string;
		};
	};
}

async function fetchSubmissionsWithImageProxy(project: { id: string, slug: string }) {
	const submissions = await fetchSubmissions(project);

	return submissions.map((submission) => {
		const mediaDocs: ISubmission['media'] = [];

		(submission.media ?? []).forEach((item, index) => {
			if (item.type !== 'image') {
				mediaDocs[index] = item;
				return;
			}

			mediaDocs[index] = {
				...item,
				image: {
					...item.image as SubmissionMedia,
					url: getImageUrl({
						src: item.image!.url!,
						width: item.image!.width! < 1024 ? item.image!.width! : 1024,
						// eslint-disable-next-line max-len
						height: item.image.width! < 1024 ? item.image!.height! : (item.image.height! / item.image.width!) * 1024,
						quality: 80,
						action: 'resize',
					}),
				},
			};
		});

		return {
			...submission,
			media: mediaDocs,
		} satisfies ISubmission;
	});
}

export default async function JigsawPuzzleSubmissionWrapper({ project }: IProps) {
	const submissions = await fetchSubmissionsWithImageProxy(project);

	return (
		<PixiRejectClientWrapper project={project} submissions={submissions} />
	);
}
