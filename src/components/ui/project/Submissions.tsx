import Submission from '@/components/ui/project/Submission';
import { Project } from '@/types/payload-types';
import useTranslation from '@/lib/i18n/server';
import { Language } from '@/lib/i18n/languages';
import fetchSubmissions from '@/lib/fetchSubmissions';
import SubmissionsWithFilter from './experimental/submissionsFilter/SubmissionsWithFilter';

interface IProps {
	project: Omit<Project, 'flags' | 'devprops'> & {
		flags: string[];
		devprops: {
			[key: string]: string;
		};
	};
	lang: Language;
}

export default async function Submissions({ project, lang }: IProps) {
	const submissions = await fetchSubmissions(project);
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const { t } = await useTranslation(lang, 'project', 'submissions');

	if (project.flags.includes('tiledSubmissions')) {
		return (
			<div className="flex flex-col items-center pt-2">
				<div className="w-full max-w-full overflow-auto">
					<div className="flex size-full flex-wrap content-center justify-center">
						<div className="flex flex-wrap sm:w-11/12 md:w-10/12">
							{submissions.map((submission, index) => (
								<div className="w-1/2 min-w-80" key={submission.id}>
									<Submission
										submission={submission as any}
										index={index}
										key={submission.id}
										lang={lang}
									/>
								</div>
							))}
						</div>
					</div>
					<p>{t('end')}</p>
				</div>
			</div>
		);
	}

	if (project.flags.includes('filterableSubmissions')) {
		const filterOptions: { [key: string]: string[] } = {};

		/* eslint-disable no-restricted-syntax */
		for (const submission of submissions) {
			for (const attribute of submission.filterableAttributes!) {
				if (!filterOptions[attribute.name]) filterOptions[attribute.name] = [];

				for (const value of attribute.values!) {
					if (!filterOptions[attribute.name].includes(value.value)) {
						filterOptions[attribute.name].push(value.value);
					}
				}
			}
		}

		for (const key in filterOptions) {
			if (Object.hasOwnProperty.call(filterOptions, key)) {
				filterOptions[key].sort((a, b) => a.localeCompare(b));
			}
		}
		/* eslint-enable */

		return (
			<SubmissionsWithFilter
				submissions={submissions.map((submission) => ({
					data: submission,
					el: <Submission
						submission={submission as any}
						key={submission.id}
						lang={lang}
					/>,
				}))}
				filterOptions={filterOptions}
			/>
		);
	}

	return (
		<div className="flex flex-col items-center pt-2">
			<div className="w-full max-w-full overflow-auto">
				<div className="flex size-full justify-center">
					<div
						className={`h-full sm:w-11/12 md:w-10/12 ${project.flags.includes('sanaSendoff') ? 'w-full' : 'max-w-full'}`}
					>
						{submissions.map((submission, index) => (
							<Submission
								submission={submission as any}
								index={index}
								key={submission.id}
								lang={lang}
							/>
						))}
					</div>
				</div>
				<p>{t('end')}</p>
			</div>
		</div>
	);
}
