/* eslint-disable max-len */
/* Based on components provided by @tripetto/runner-fabric and @tripetto/runner-classic */
/*
Copyright 2019 Tripetto B.V.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/*
MIT License

Copyright (c) 2021 GoldElysium

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */
/* eslint-enable */

import {
	MutableRefObject, useEffect, useRef,
} from 'react';
import {
	TRunnerPreviewData, TRunnerViews, useL10n, useRunner,
} from '@tripetto/runner-react-hook';
import {
	IDefinition,
	ISnapshot,
	Instance,
	L10n,
	TL10n,
	findLast,
	isBoolean,
	isFunction,
	scheduleAction,
	set,
} from '@tripetto/runner';
import EmailBlock from '@/components/ui/form/ui/blocks/email';
import { IFormNodeBlock } from '../interfaces/block';
import type { IRunnerUIProps } from '../interfaces/props';
import { IRunnerSnapshot } from '../interfaces/snapshot';
import { IPausingRecipeEmail } from '../interfaces/pausing';
import { useCache } from './cache';

export interface IRunnerController {
	definition: IDefinition;
	l10n: TL10n;
	view: TRunnerViews;
	readonly instance: Instance | undefined;
	readonly fingerprint: string;
	readonly snapshot: ISnapshot<IRunnerSnapshot> | undefined;
	readonly isRunning: boolean;
	readonly isFinishing: boolean;
	readonly isPausing: boolean;
	readonly isLicensed: boolean;
	readonly allowStart: boolean;
	readonly allowRestart: boolean;
	readonly allowPause: boolean;
	readonly allowStop: boolean;
	readonly start: () => void;
	readonly restart: () => void;
	// eslint-disable-next-line max-len
	readonly pause: () => ISnapshot<IRunnerSnapshot> | Promise<ISnapshot<IRunnerSnapshot>> | undefined;
	readonly stop: () => void;
	readonly doPreview: (data: TRunnerPreviewData) => void;
}

export const useRunnerController = (
	props: IRunnerUIProps & {
		readonly onSnapshot: (type: 'pause' | 'snapshot') => IRunnerSnapshot;
		readonly onRestart?: () => void;
		readonly onScrollIntoView?: (id: string) => boolean;
	},
) => {
	const previewRef = useRef<string>(undefined);
	const onRestartRef = useRef<() => void>(undefined);

	const runner = useRunner<IFormNodeBlock>(props, {
		mode: 'paginated',
		onPreview: (action: 'start' | 'end', type: 'prologue' | 'block' | 'epilogue', id?: string) => {
			if (action === 'start' && props.onScrollIntoView && type === 'block' && id && !props.onScrollIntoView(id)) {
				previewRef.current = id;
			} else if (action === 'end') {
				previewRef.current = undefined;
			}
		},
		onRestart: () => {
			if (onRestartRef.current) {
				onRestartRef.current();
			}
		},
		onDestroy: () => {
			if (props.controller?.current) {
				// eslint-disable-next-line no-param-reassign
				props.controller.current = undefined;
			}
		},
	});

	const cache = useCache();
	// eslint-disable-next-line max-len
	// const [hasLicense] = useState(() => (props.license && verify(PACKAGE_NAME, props.license)) || false);
	// eslint-disable-next-line max-len
	const [l10n, setL10n, updateL10n] = useL10n(props.l10n, props.onL10n, runner, () => cache.purge());
	const controllerRef = useRef<IRunnerController>(undefined);
	const snapshotRef = useRef<ISnapshot<IRunnerSnapshot>>(undefined);
	const pauseRef = useRef<IPausingRecipeEmail>(undefined);
	const reloadRef = useRef(false);

	const pause = () => {
		if (props.onPause) {
			return runner.pause<IRunnerSnapshot>(
				props.onSnapshot('pause'),
				(snapshot: ISnapshot<IRunnerSnapshot>, cb: (result: 'succeeded' | 'failed' | 'canceled', retry?: () => void) => void) => {
					const done = (result: 'succeeded' | 'failed' | 'canceled', retry?: () => void) => {
						pauseRef.current = undefined;

						cb(result, retry);
					};
					const handlePause = (handler: () => boolean | void | Promise<void>) => {
						const request = handler();

						if (!request || isBoolean(request)) {
							done(isBoolean(request) && !request ? 'failed' : 'succeeded', () => handlePause(handler));
						} else {
							request
								.then(() => {
									done('succeeded');
								})
								.catch((reason?: string) => {
									done('failed', () => handlePause(handler));

									if (reason) {
										console.log(reason);
									}
								});
						}
					};

					if (isFunction(props.onPause)) {
						const pauseHandler = props.onPause;

						handlePause(() => pauseHandler(
							snapshot,
							(props.l10nNamespace || L10n.Namespace.global).current,
							(props.l10nNamespace || L10n.Namespace.global).locale.identifier,
						));
					} else if (props.onPause && props.onPause.recipe === 'email') {
						const pauseHandler = props.onPause.onPause;

						pauseRef.current = {
							recipe: 'email',
							isCompleting: false,
							complete: (emailAddress: string) => {
								pauseRef.current = { ...pauseRef.current!, isCompleting: true };

								if (!snapshot.b) {
									set(snapshot, 'b', {
										d: emailAddress,
									});
								} else {
									set(snapshot.b, 'd', emailAddress);
								}

								snapshotRef.current = snapshot;

								runner.update();

								handlePause(() => pauseHandler(
									emailAddress,
									snapshot,
									(props.l10nNamespace || L10n.Namespace.global).current,
									(props.l10nNamespace || L10n.Namespace.global).locale.identifier,
								));
							},
							cancel: () => done('canceled'),
							get emailAddress() {
								const previousSnapshot = snapshotRef.current || props.snapshot;
								const emailBlock =									runner.storyline
									&& findLast(
										runner.storyline.all,
										(node) => ((node.isPassed && node.block instanceof EmailBlock)),
									);

								return (
									(previousSnapshot && previousSnapshot.b && previousSnapshot.b.d)
									|| (emailBlock
										&& emailBlock.block instanceof EmailBlock
										&& emailBlock.block.emailSlot.isSealed
										&& emailBlock.block.emailSlot.value)
									|| ''
								);
							},
						};
					} else {
						done('succeeded');
					}
				},
			);
		}

		return runner.pause(props.onSnapshot('pause'));
	};

	const controller = {
		title: runner.definition.name,
		view: runner.view,
		preview: runner.preview,
		storyline: runner.storyline,
		start: runner.start,
		restart: runner.restart,
		reload:
			runner.status === 'error-outdated'
			&& props.onReload
			&& (async () => {
				reloadRef.current = true;
				runner.update();

				const definition = await props.onReload!();

				reloadRef.current = false;

				runner.reload(definition);
			}),
		pause: (runner.allowPause && props.onPause && pause) || undefined,
		pausing: pauseRef.current,
		status: reloadRef.current ? ('reloading' as const) : runner.status,
		prologue: ((runner.status === 'stopped' || runner.preview === 'prologue') && runner.prologue) || undefined,
		epilogue: runner.status === 'finished' || runner.preview === 'epilogue' ? runner.epilogue || {} : undefined,
		page: runner.storyline?.activePage?.number || 0,
		resetPreview: runner.resetPreview,
	};

	onRestartRef.current = props.onRestart;

	if (props.controller || props.onController) {
		controllerRef.current = {
			get definition() {
				return runner.definition;
			},
			set definition(definition: IDefinition) {
				runner.definition = definition;

				updateL10n(runner.definition && runner.definition.language);
			},
			get instance() {
				return runner.instance;
			},
			get fingerprint() {
				return runner.fingerprint;
			},
			get l10n() {
				return l10n;
			},
			set l10n(newL10n: TL10n) {
				setL10n(newL10n);
			},
			get view() {
				return runner.view;
			},
			set view(newView: TRunnerViews) {
				runner.view = newView;
			},
			get snapshot() {
				return runner.snapshot(props.onSnapshot('snapshot'));
			},
			get isRunning() {
				return runner.isRunning;
			},
			get isFinishing() {
				return runner.isFinishing;
			},
			get isPausing() {
				return runner.isPausing;
			},
			get isLicensed() {
				return false;
				// return hasLicense;
			},
			get allowStart() {
				return runner.allowStart;
			},
			get allowRestart() {
				return runner.allowRestart;
			},
			get allowPause() {
				return runner.allowPause;
			},
			get allowStop() {
				return runner.allowStop;
			},
			start: runner.start,
			restart: runner.restart,
			pause,
			stop: runner.stop,
			doPreview: runner.doPreview,
		};

		if (props.controller) {
			// eslint-disable-next-line no-param-reassign
			props.controller.current = controllerRef.current;
		}

		if (props.onController) {
			props.onController(controllerRef as MutableRefObject<IRunnerController>);
		}
	}

	useEffect(() => {
		if (previewRef.current && runner.view === 'preview') {
			scheduleAction(() => {
				if (
					previewRef.current
					&& (runner.view !== 'preview' || !props.onScrollIntoView || props.onScrollIntoView(previewRef.current))
				) {
					previewRef.current = undefined;
				}
			});
		}
	});

	return [controller, cache, runner.l10n, props.attachments, runner.doAction] as [
		typeof controller,
		typeof cache,
		typeof runner.l10n,
		typeof props.attachments,
		typeof runner.doAction,
	];
};
