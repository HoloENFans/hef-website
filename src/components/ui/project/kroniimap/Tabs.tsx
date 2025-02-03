'use client';

import {
	Guild, Project, Submission as ISubmission, SubmissionMedia,
} from '@/types/payload-types';
import { useEffect, useState } from 'react';
import TextHeader from '@/components/ui/legacy/TextHeader';
import Submissions from '@/components/ui/project/experimental/sana/Submissions';
import useTranslation from '@/lib/i18n/client';
import { useTheme } from 'next-themes';
import {
	PayloadLexicalReactRenderer,
	PayloadLexicalReactRendererContent,
} from '@atelier-disko/payload-lexical-react-renderer';
import KroniiMap, { MarkerMap } from './KroniiMap';

interface IProps {
	project: Omit<Project, 'flags' | 'devprops'> & {
		flags: string[];
		devprops: {
			[key: string]: string;
		};
	};
	submissions: Array<Omit<ISubmission, 'media' | 'srcIcon'> & { media: Array<NonNullable<Required<ISubmission>['media']>[number] & { image: SubmissionMedia }>; srcIcon: SubmissionMedia }>;
	markerMap: MarkerMap;
}

export default function Tabs({ project, submissions, markerMap }: IProps) {
	const [selectedTab, setSelectedTab] = useState('about');
	const { setTheme } = useTheme();
	const { t } = useTranslation('project', 'page');

	useEffect(() => {
		// Enforce light mode on load
		setTheme('light');
	}, []);

	return (
		<div className="bg-skin-background text-skin-text dark:bg-skin-background-dark dark:text-skin-text-dark">
			<div
				className="flex flex-row flex-wrap content-center justify-evenly border-b-2 border-skin-secondary py-4"
			>
				<button type="button">
					{/* eslint-disable-next-line max-len */}
					{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */}
					<h2
						className={
							`select-none text-center text-xl text-skin-link dark:text-skin-link-dark ${
								(selectedTab === 'about') ? 'font-bold' : ''}`
						}
						onClick={(e) => e.button === 0 && setSelectedTab('about')}
					>
						About
					</h2>
				</button>
				<button type="button">
					{/* eslint-disable-next-line max-len */}
					{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */}
					<h2
						className={
							`select-none text-center text-xl text-skin-link dark:text-skin-link-dark ${
								(selectedTab === 'map') ? 'font-bold' : ''}`
						}
						onClick={(e) => e.button === 0 && setSelectedTab('map')}
					>
						Map
					</h2>
				</button>
				<button type="button">
					{/* eslint-disable-next-line max-len */}
					{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */}
					<h2
						className={
							`select-none text-center text-xl text-skin-link dark:text-skin-link-dark ${
								(selectedTab === 'submissions') ? 'font-bold' : ''}`
						}
						onClick={(e) => e.button === 0 && setSelectedTab('submissions')}
					>
						Submissions
					</h2>
				</button>
				<button type="button">
					{/* eslint-disable-next-line max-len */}
					{/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions */}
					<h2
						className={
							`select-none text-center text-xl text-skin-link dark:text-skin-link-dark ${
								(selectedTab === 'credits') ? 'font-bold' : ''}`
						}
						onClick={(e) => e.button === 0 && setSelectedTab('credits')}
					>
						Credits
					</h2>
				</button>
			</div>

			<div className="w-full">
				{(() => {
					if (selectedTab === 'about') {
						return (
							<div className="flex h-full min-h-screen flex-col">
								<div className="grow">
									<div
										className="my-16 flex w-full flex-col items-center px-4 md:px-16 lg:px-24 2xl:px-56"
									>
										<div
											className="w-full max-w-full break-words px-4 sm:max-w-4xl! md:break-normal"
										>
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
													content={project.description as PayloadLexicalReactRendererContent}
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
						);
					}
					if (selectedTab === 'map') {
						return (
							<KroniiMap
								submissions={submissions}
								markerMap={markerMap}
							/>
						);
					}
					if (selectedTab === 'submissions') {
						return (
							<div className="flex w-full justify-center">
								<div className="max-w-4xl">
									<Submissions
										project={project}
										submissions={submissions}
									/>
								</div>
							</div>
						);
					}

					if (selectedTab === 'credits') {
						return (
							<div className="flex h-full min-h-screen flex-col">
								<div className="grow">
									<div className="my-16 flex w-full flex-col items-center px-4 md:px-16 lg:px-24 2xl:px-56">
										<div
											className="flex w-full max-w-full flex-col items-center gap-10 break-words px-4 sm:max-w-4xl! md:break-normal"
										>
											<div className="flex flex-col items-center gap-4">
												<h3 className="text-2xl font-semibold text-skin-text dark:text-skin-text-dark">Organizers</h3>
												<div className="flex gap-12">
													<div className="flex flex-col items-center gap-2">
														<img
															src="https://cdn.holoen.fans/hefw/assets/kroniimap/avatars/helicobtor.webp"
															alt="Helicobtor"
															className="size-24 rounded-full"
														/>
														<span className="font-bold">Helicobtor</span>
														<div className="flex gap-2">
															<a
																href="https://twitter.com/helicobtor"
																rel="noopener"
																target="_blank"
																className="size-4 text-black dark:text-white"
															>
																<svg
																	role="img"
																	viewBox="0 0 24 24"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="currentColor"
																>
																	<title>X</title>
																	<path
																		d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
																	/>
																</svg>
															</a>
														</div>
													</div>
													<div className="flex flex-col items-center gap-2">
														<img
															src="https://cdn.holoen.fans/hefw/assets/kroniimap/avatars/zame.webp"
															alt="Zame"
															className="size-24 rounded-full"
														/>
														<span className="font-bold">Zaめ</span>
														<div className="flex gap-2">
															<a
																href="https://twitter.com/Ztynz1"
																rel="noopener"
																target="_blank"
																className="size-4 text-black dark:text-white"
															>
																<svg
																	role="img"
																	viewBox="0 0 24 24"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="currentColor"
																>
																	<title>X</title>
																	<path
																		d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
																	/>
																</svg>
															</a>
														</div>
													</div>
												</div>
											</div>
											<div className="flex flex-col items-center gap-4">
												<h3 className="text-2xl font-semibold text-skin-text dark:text-skin-text-dark">Developers</h3>
												<div className="flex gap-12">
													<div className="flex flex-col items-center gap-2">
														<img
															src="https://cdn.holoen.fans/hefw/assets/kroniimap/avatars/GoldElysium.webp"
															alt="GoldElysium"
															className="size-24 rounded-full"
														/>
														<span className="font-bold">GoldElysium</span>
														<div className="flex gap-2">
															<a
																href="https://github.com/GoldElysium/hef-website"
																rel="noopener"
																target="_blank"
																className="size-4 text-black dark:text-white"
															>
																<svg
																	role="img"
																	viewBox="0 0 24 24"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="currentColor"
																>
																	<title>GitHub</title>
																	<path
																		d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
																	/>
																</svg>
															</a>
														</div>
													</div>
													<div className="flex flex-col items-center gap-2">
														<img
															src="https://cdn.holoen.fans/hefw/assets/kroniimap/avatars/george.webp"
															alt="George"
															className="size-24 rounded-full"
														/>
														<span className="font-bold">george</span>
														<div className="flex gap-2">
															<a
																href="https://twitter.com/j1george_"
																rel="noopener"
																target="_blank"
																className="size-4 text-black dark:text-white"
															>
																<svg
																	role="img"
																	viewBox="0 0 24 24"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="currentColor"
																>
																	<title>X</title>
																	<path
																		d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
																	/>
																</svg>
															</a>
														</div>
													</div>
												</div>
											</div>
											<div className="flex flex-col items-center gap-4">
												<h3 className="text-2xl font-semibold text-skin-text dark:text-skin-text-dark">Editors</h3>
												<div className="flex max-w-xl flex-wrap justify-center gap-12">
													<div className="flex flex-col items-center gap-2">
														<img
															src="https://cdn.holoen.fans/hefw/assets/kroniimap/avatars/Agiri.webp"
															alt="Agiri"
															className="size-24 rounded-full"
														/>
														<span className="font-bold">Agiri</span>
														<div className="flex gap-2">
															<a
																href="https://twitter.com/Akahito_San"
																rel="noopener"
																target="_blank"
																className="size-4 text-black dark:text-white"
															>
																<svg
																	role="img"
																	viewBox="0 0 24 24"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="currentColor"
																>
																	<title>X</title>
																	<path
																		d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
																	/>
																</svg>
															</a>
														</div>
													</div>
													<div className="flex flex-col items-center gap-2">
														<img
															src="https://cdn.holoen.fans/hefw/assets/kroniimap/avatars/Ant.webp"
															alt="Ant"
															className="size-24 rounded-full"
														/>
														<span className="font-bold">Ant</span>
														<div className="flex gap-2">
															<a
																href="https://twitter.com/Antzk_3"
																rel="noopener"
																target="_blank"
																className="size-4 text-black dark:text-white"
															>
																<svg
																	role="img"
																	viewBox="0 0 24 24"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="currentColor"
																>
																	<title>X</title>
																	<path
																		d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
																	/>
																</svg>
															</a>
														</div>
													</div>
													<div className="flex flex-col items-center gap-2">
														<img
															src="https://cdn.holoen.fans/hefw/assets/kroniimap/avatars/freyja.webp"
															alt="Freyja"
															className="size-24 rounded-full"
														/>
														<span className="font-bold">Freyja</span>
														<div className="flex gap-2">
															<a
																href="https://twitter.com/FreyjaBK"
																rel="noopener"
																target="_blank"
																className="size-4 text-black dark:text-white"
															>
																<svg
																	role="img"
																	viewBox="0 0 24 24"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="currentColor"
																>
																	<title>X</title>
																	<path
																		d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
																	/>
																</svg>
															</a>
														</div>
													</div>
													<div className="flex flex-col items-center gap-2">
														<img
															src="https://cdn.holoen.fans/hefw/assets/kroniimap/avatars/hasaan.webp"
															alt="Hasaan"
															className="size-24 rounded-full"
														/>
														<span className="font-bold">Hasaan</span>
														<div className="flex gap-2">
															<a
																href="https://twitter.com/HasaanMohammed"
																rel="noopener"
																target="_blank"
																className="size-4 text-black dark:text-white"
															>
																<svg
																	role="img"
																	viewBox="0 0 24 24"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="currentColor"
																>
																	<title>X</title>
																	<path
																		d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
																	/>
																</svg>
															</a>
														</div>
													</div>
													<div className="flex flex-col items-center gap-2">
														<img
															src="https://cdn.holoen.fans/hefw/assets/kroniimap/avatars/karona.webp"
															alt="karona"
															className="size-24 rounded-full"
														/>
														<span className="font-bold">karona</span>
													</div>
													<div className="flex flex-col items-center gap-2">
														<img
															src="https://cdn.holoen.fans/hefw/assets/kroniimap/avatars/Lucy.webp"
															alt="Lucy"
															className="size-24 rounded-full"
														/>
														<span className="font-bold">Lucy</span>
														<div className="flex gap-2">
															<a
																href="https://twitter.com/SirLuciMx"
																rel="noopener"
																target="_blank"
																className="size-4 text-black dark:text-white"
															>
																<svg
																	role="img"
																	viewBox="0 0 24 24"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="currentColor"
																>
																	<title>X</title>
																	<path
																		d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
																	/>
																</svg>
															</a>
														</div>
													</div>
												</div>
											</div>
											<div className="flex gap-32">
												<div className="flex flex-col items-center gap-4">
													<h3 className="text-2xl font-semibold text-skin-text dark:text-skin-text-dark">Animation</h3>
													<div className="flex flex-col items-center gap-2">
														<img
															src="https://cdn.holoen.fans/hefw/assets/kroniimap/avatars/rjseka.webp"
															alt="끌나(rjseka7758)"
															className="size-24 rounded-full"
														/>
														<span className="font-bold">끌나(rjseka7758)</span>
														<div className="flex gap-2">
															<a
																href="https://twitter.com/rjseka7758"
																rel="noopener"
																target="_blank"
																className="size-4 text-black dark:text-white"
															>
																<svg
																	role="img"
																	viewBox="0 0 24 24"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="currentColor"
																>
																	<title>X</title>
																	<path
																		d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
																	/>
																</svg>
															</a>
														</div>
													</div>
												</div>
												<div className="flex flex-col items-center gap-4">
													<h3 className="text-2xl font-semibold text-skin-text dark:text-skin-text-dark">Banner</h3>
													<div className="flex flex-col items-center gap-2">
														<img
															src="https://cdn.holoen.fans/hefw/assets/kroniimap/avatars/Cahryos.webp"
															alt="Cahryos"
															className="size-24 rounded-full"
														/>
														<span className="font-bold">Cahryos</span>
														<div className="flex gap-2">
															<a
																href="https://twitter.com/cahryos"
																rel="noopener"
																target="_blank"
																className="size-4 text-black dark:text-white"
															>
																<svg
																	role="img"
																	viewBox="0 0 24 24"
																	xmlns="http://www.w3.org/2000/svg"
																	fill="currentColor"
																>
																	<title>X</title>
																	<path
																		d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
																	/>
																</svg>
															</a>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						);
					}

					return null;
				})()}
			</div>
		</div>
	);
}
