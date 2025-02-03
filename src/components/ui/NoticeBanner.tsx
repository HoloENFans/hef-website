'use client';

import { Fragment, Suspense, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Notice as APINoticeBanner } from '@/types/payload-types';
import useTranslation from '@/lib/i18n/client';
import {
	PayloadLexicalReactRenderer,
	PayloadLexicalReactRendererContent,
} from '@atelier-disko/payload-lexical-react-renderer';

export default function NoticeBanner({ data }: { data: APINoticeBanner }) {
	const { t } = useTranslation('layout', 'notice-banner');
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<div>
			<div
				className="min-w-screen max-w-screen overflow-none flex h-16 items-center justify-center gap-4 bg-skin-secondary p-2 text-skin-secondary-foreground dark:bg-skin-secondary-dark dark:text-skin-secondary-foreground-dark"
			>
				<span className="font-semibold  md:text-lg">
					{data.description}
				</span>
				<button
					type="button"
					className="rounded-full bg-skin-primary px-4 py-2 text-skin-primary-foreground hover:bg-skin-primary/80 dark:bg-skin-primary-dark dark:text-skin-primary-foreground-dark dark:hover:bg-skin-primary-dark/80 md:text-lg"
					onClick={() => setDialogOpen(true)}
				>
					{t('open')}
				</button>
			</div>

			<Suspense fallback={null}>
				<Transition show={dialogOpen} as={Fragment}>
					<Dialog as="div" className="relative z-10" onClose={() => setDialogOpen(false)}>
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300"
							enterFrom="opacity-0"
							enterTo="opacity-100"
							leave="ease-in duration-200"
							leaveFrom="opacity-100"
							leaveTo="opacity-0"
						>
							<div className="fixed inset-0 bg-black/60" />
						</Transition.Child>

						<div className="fixed inset-0 overflow-y-auto">
							<div className="flex min-h-full items-center justify-center p-4 text-center">
								<Transition.Child
									as={Fragment}
									enter="ease-out duration-300"
									enterFrom="opacity-0 scale-95"
									enterTo="opacity-100 scale-100"
									leave="ease-in duration-200"
									leaveFrom="opacity-100 scale-100"
									leaveTo="opacity-0 scale-95"
								>
									<Dialog.Panel
										className="w-full max-w-4xl overflow-hidden rounded-2xl bg-skin-secondary p-6 text-left align-middle text-skin-secondary-foreground shadow-xl transition-all dark:bg-skin-background-dark dark:text-skin-secondary-foreground-dark"
									>
										<Dialog.Title
											as="h3"
											className="text-lg font-semibold leading-6 md:text-2xl"
										>
											{data.description}
										</Dialog.Title>
										<div className="mt-4">
											<p className="md:text-lg">
												<PayloadLexicalReactRenderer
													content={data.message as PayloadLexicalReactRendererContent}
												/>
											</p>
										</div>

										<div className="mt-6">
											<button
												type="button"
												className="inline-flex justify-center rounded-full border border-transparent bg-skin-primary px-4 py-2 font-medium text-white  hover:bg-skin-primary/80 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:bg-skin-primary-dark dark:hover:bg-skin-primary-dark/80"
												onClick={() => setDialogOpen(false)}
											>
												{t('close')}
											</button>
										</div>
									</Dialog.Panel>
								</Transition.Child>
							</div>
						</div>
					</Dialog>
				</Transition>
			</Suspense>
		</div>
	);
}
