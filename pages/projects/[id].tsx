import ReactPlayer from 'react-player';
import { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';
import Error from 'next/error';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import TextHeader from '../../components/TextHeader';
import { IProject } from '../../models/Project';
import 'github-markdown-css';

export default function ProjectPage() {
	const router = useRouter();

	const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
	const [currentSubmissionIndex, setCurrentSubmissionIndex] = useState(0);
	const [submissionText, setSubmissionText] = useState('Loading...');

	const [doc, setDoc] = useState<IProject>({} as IProject);

	const [errorCode, setErrorCode] = useState<boolean | number>(false);

	useEffect(() => {
		// eslint-disable-next-line consistent-return
		async function run() {
			if (!router.query.id) return;
			const res = await fetch(`/api/projects/${router.query.id}`, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json;charset=UTF-8',
				},
			});
			// eslint-disable-next-line consistent-return
			if (!res.ok) return setErrorCode(res.status);

			const json: IProject = await res.json();
			setDoc(json);
		}

		run();
	}, [router.query]);
	
	function CurrentGalleryItem() {
		if (!doc.media) return <></>;
		if (doc.media[currentMediaIndex].type === 'video') {
			return (
				<ReactPlayer
					width="100%"
					height="100%"
					url={doc.media[currentMediaIndex].src}
					controls
					light
				/>
			);
		}
		if (doc.media[currentMediaIndex].type === 'image') {
			return (
				<img
					className="w-full h-full object-none"
					src={doc.media[currentMediaIndex].src}
					alt=""
				/>
			);
		}
		return <p>Invalid media</p>;
	}

	useEffect(() => {
		// eslint-disable-next-line consistent-return
		async function load() {
			if (!doc.submissions || !(doc.submissions.length > 0)) return;
			setSubmissionText('Loading...');
			if (doc.submissions[currentSubmissionIndex].type === 'text') {
				const res = await fetch(doc.submissions[currentSubmissionIndex].src, {
					headers: {
						Accept: '*/*',
					},
				});
				// eslint-disable-next-line consistent-return
				if (!res.ok) return <p>Error</p>;

				setSubmissionText(await res.text());
			}
		}
		load();
	}, [currentSubmissionIndex, doc.submissions]);

	function CurrentSubmissionItem() {
		if (!doc.submissions) return <></>;
		if (doc.submissions[currentSubmissionIndex].type === 'video') {
			return (
				<ReactPlayer
					width="100%"
					height="100%"
					url={doc.submissions[currentSubmissionIndex].src}
					controls
					light
				/>
			);
		}
		if (doc.submissions[currentSubmissionIndex].type === 'image') {
			return (
				<img
					className="w-full h-full object-none"
					src={doc.submissions[currentSubmissionIndex].src}
					alt=""
				/>
			);
		}
		if (doc.submissions[currentSubmissionIndex].type === 'text') {
			return (
				<p className="w-full h-full overflow-auto whitespace-pre-line text-black dark:text-white dark:text-opacity-80">
					{submissionText}
				</p>
			);
		}
		return <p className="text-black dark:text-white dark:text-opacity-80">Invalid media</p>;
	}

	if (errorCode) {
		return <Error statusCode={errorCode as number} />;
	}

	// let theme = '';
	// if (doc.guild === '8O2KtsEhpru3rnQudlV5p') {
	// 	theme = 'theme-ina';
	// };

	return (
		<div className="theme-ina">
			<div className="flex flex-col h-full min-h-screen bg-skin-background-1 dark:bg-skin-dark-background-1">
				<Navbar />

				<Header
					title={doc.title ?? 'unknown'}
					description={doc.shortDescription ?? ''}
				/>

				<div className="flex-grow">
					<div className="my-16 w-full flex flex-col items-center">
						<div className="max-w-4xl w-full mx-4 break-words md:break-normal">
							<div>
								<TextHeader text="Description" />
								<div className="markdown-body">
									<ReactMarkdown className="px-4 sm:px-0 text-black dark:text-white dark:text-opacity-80">
										{doc.description}
									</ReactMarkdown>
								</div>
							</div>
							{(doc.media?.length ?? 0) > 0 && (
								<div className="mt-4">
									<TextHeader text="Gallery" />
									<div className="flex flex-col items-center pt-2">
										<div className="w-full h-52 sm:w-8/12 sm:h-96">
											<CurrentGalleryItem />
										</div>
										<div className="flex mt-2 font-bold items-center justify-center text-center">
											<ChevronLeftIcon
												className={
													currentMediaIndex > 0
														? 'h-8 w-8 cursor-pointer text-black dark:text-white'
														: 'h-8 w-8 text-skin-primary-1 text-opacity-30 dark:text-skin-dark-primary-1 dark:text-opacity-30'
												}
												onClick={() => {
													if (currentMediaIndex > 0)
														setCurrentMediaIndex(currentMediaIndex - 1);
												}}
											/>
											<span className="text-black dark:text-white">
												{currentMediaIndex + 1}/{doc.media ? doc.media.length : 0}
											</span>
											<ChevronRightIcon
												className={
													currentMediaIndex + 1 <
													(doc.media ? doc.media.length : 0)
														? 'h-8 w-8 cursor-pointer text-black dark:text-white'
														: 'h-8 w-8 text-skin-primary-1 text-opacity-30 dark:text-skin-dark-primary-1 dark:text-opacity-30'
												}
												onClick={() => {
													if (
														currentMediaIndex + 1 <
														(doc.media ? doc.media.length : 0)
													)
														setCurrentMediaIndex(currentMediaIndex + 1);
												}}
											/>
										</div>
									</div>
								</div>
							)}
							{(doc.submissions?.length ?? 0) > 0 && (
								<div className="mt-4">
									<TextHeader text="Submissions" />
									<div className="flex flex-col items-center pt-2">
										<div className="w-full h-52 sm:w-8/12 sm:h-96">
											<CurrentSubmissionItem />
										</div>
										<div className="flex mt-2 font-bold items-center justify-center text-center">
											<ChevronLeftIcon
												className={
													currentSubmissionIndex > 0
														? 'h-8 w-8 cursor-pointer text-black dark:text-white'
														: 'h-8 w-8 text-skin-primary-1 text-opacity-30 dark:text-skin-dark-primary-1 dark:text-opacity-30'
												}
												onClick={() => {
													if (currentSubmissionIndex > 0)
														setCurrentSubmissionIndex(currentSubmissionIndex - 1);
												}}
											/>
											<span className="text-black dark:text-white">
												{currentSubmissionIndex + 1}/
												{doc.submissions?.length ?? 0}
											</span>
											<ChevronRightIcon
												className={
													currentSubmissionIndex + 1 <
													(doc.submissions?.length ?? 0)
														? 'h-8 w-8 cursor-pointer text-black dark:text-white'
														: 'h-8 w-8 text-skin-primary-1 text-opacity-30 dark:text-skin-dark-primary-1 dark:text-opacity-30'
												}
												onClick={() => {
													if (
														currentSubmissionIndex + 1 <
														(doc.submissions?.length ?? 0)
													)
														setCurrentSubmissionIndex(currentSubmissionIndex + 1);
												}}
											/>
										</div>
									</div>
								</div>
							)}
							{(doc.links?.length ?? 0) > 0 && (
								<div className="mt-4">
									<TextHeader text="Links" />
									<div className="flex px-4 sm:px-0">
										{doc.links &&
											doc.links.map((link, index) => (
												<div
													key={`link-${index}`}
													className="rounded-3xl font-bold w-20 h-10 flex items-center justify-center mt-4 content-end mr-4
													bg-skin-secondary-1 dark:bg-skin-dark-secondary-1 text-white hover:text-opacity-70"
												>
													<a href={link.link} target="_blank" rel="noreferrer">
														{link.name}
													</a>
												</div>
											))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				<Footer />
			</div>
		</div>
	);
}
