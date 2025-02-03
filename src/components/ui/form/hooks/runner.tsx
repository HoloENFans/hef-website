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

import { useRef, useState } from 'react';
import {
	castToBoolean,
	DateTime,
	each,
	findFirst,
	IObservableNode,
	isString,
	markdownifyToString,
	markdownifyToURL,
} from '@tripetto/runner';
import { markdownifyToJSX } from '@tripetto/runner-react-hook';
import { useOverlay } from '@tripetto/runner-fabric/overlay';
import { TurnstileInstance } from '@marsidev/react-turnstile';
import { IRunnerUIProps } from '../interfaces/props';
import { IFormNodeBlock } from '../interfaces/block';
import { useRunnerController } from './controller';
import { useFocus } from './focus';
import '../ui/blocks';

/* eslint-disable max-len */
const useFormRunner = (props: IRunnerUIProps) => {
	const [clientId] = useState(crypto.randomUUID());

	const [runner, cache, l10n, , doAction] = useRunnerController({
		...props,
		onSnapshot: () => ({
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			b: initialFocus,
			d: props.snapshot && props.snapshot.b && props.snapshot.b.d,
			e: DateTime.now,
		}),
		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		onRestart: () => blur(),
		onScrollIntoView: (id) => {
			const node = findFirst(runner.storyline?.all, (n) => n.node.id === id);

			if (node) {
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				const element = blocksRef.current[node.key];

				if (element) {
					element.scrollIntoView({
						behavior: 'smooth',
						block: 'center',
						inline: 'center',
					});

					return true;
				}
			}

			return false;
		},
	});

	const [OverlayProvider, overlay] = useOverlay();

	const [frameRef, blur, , handleFocus, handleAutoFocus, initialFocus] = useFocus({
		page: runner.page,
		gainFocus: runner.view === 'live' && props.display === 'page',
		initialFocus: props.snapshot && props.snapshot.b && props.snapshot.b.b,
	});

	const turnstileRef = useRef<TurnstileInstance>(undefined);

	const blocksRef = useRef<{
		[key: string]: HTMLElement | undefined;
	}>({});

	const tabRef = useRef<
	{
		node: string;
		first: number;
		last: number;
	}[]
	>([]);

	const stagedRef = useRef<{
		[key: string]: IObservableNode<IFormNodeBlock> | undefined;
	}>({});

	const mode = runner.storyline?.mode || 'progressive';
	const { status } = runner;
	const { view } = runner;
	const isPage = view !== 'live' || props.display === 'page';
	const isEvaluating = (runner.storyline && view !== 'preview' && runner.storyline.isEvaluating) || false;
	const staged: {
		[key: string]: IObservableNode<IFormNodeBlock>;
	} = {};
	let submitCount = 0;
	let total = 0;
	const allowSubmit = runner.storyline
		&& !runner.storyline.isFailed
		&& !runner.storyline.isAtFinish
		&& !runner.storyline.isFinishable
		&& !findFirst(runner.storyline.all, (n) => {
			if (n.node.slots.count > 0) {
				submitCount += 1;
			}

			return submitCount > 1;
		})
		&& submitCount === 1;

	const blocks = (
		runner.storyline
		&& !runner.storyline.isEmpty
		&& (
			<>
				{runner.storyline.map((moment, page) => (
					// eslint-disable-next-line react/no-array-index-key
					<div key={`form-page-${page}`}>
						<h1 className="text-4xl font-bold">{moment.section.props.name}</h1>
						<div className="flex flex-col gap-4">
							{moment.nodes.map(
								(node) => {
									// eslint-disable-next-line no-plusplus
									const index = total++;
									const previousTab = (index > 0 && index - 1 < tabRef.current.length && tabRef.current[index - 1]) || undefined;
									let currentTab = (index < tabRef.current.length && tabRef.current[index]) || undefined;

									if (!currentTab || currentTab.node !== node.key || (previousTab && previousTab.last !== currentTab.first)) {
										currentTab = {
											node: node.key,
											first: previousTab?.last || 0,
											last: previousTab?.last || 0,
										};

										tabRef.current.splice(index, tabRef.current.length - index, currentTab);
									}

									staged[node.key] = node;

									return cache.fetch(
										() => {
											currentTab!.last = currentTab!.first;

											const fnEdit = (props.onEdit && view !== 'live' && node.id && (() => props.onEdit!('block', node.id))) || undefined;

											const block = node.block?.render
												? node.block.render({
													overlay,
													l10n: undefined as any,
													attachments: {
														/* eslint-disable prefer-promise-reject-errors */
														async get(key) {
															const res = await fetch(`${process.env.NEXT_PUBLIC_CDN_URL}/form-submissions/tmp/${key}`);

															return res.blob();
														},
														async put(file) {
															turnstileRef.current?.execute();

															let turnstileResponse;
															try {
																turnstileResponse = await turnstileRef.current?.getResponsePromise();
															} catch {
																return Promise.reject('Failed captcha, try again.');
															}
															if (!turnstileResponse) {
																return Promise.reject('Failed captcha, try again.');
															}

															const res = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/forms/upload`, {
																method: 'POST',
																body: JSON.stringify({
																	fileExt: file.name.split('.').pop(),
																	turnstileResponse,
																	clientId,
																}),
																headers: {
																	'Content-Type': 'application/json',
																},
															});

															const { fields, url, filename } = await res.json();
															const formData = new FormData();
															Object.entries(fields).forEach(([field, value]) => {
																formData.append(field, value as string);
															});
															formData.append('file', file);

															await fetch(url, {
																body: formData,
																method: 'POST',
															});

															return filename as string;
														},
														async delete(key) {
															turnstileRef.current?.execute();

															const turnstileResponse = await turnstileRef.current?.getResponsePromise();
															if (!turnstileResponse) {
																return Promise.reject('Failed captcha, try again.');
															}

															fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/forms/upload`, {
																method: 'DELETE',
																body: JSON.stringify({
																	key,
																	turnstileResponse,
																	clientId,
																}),
																headers: {
																	'Content-Type': 'application/json',
																},
															}).then();

															return Promise.resolve();
														},
														/* eslint-enable */
													},
													get id() {
														return node.block?.key() || '';
													},
													// eslint-disable-next-line react/no-unstable-nested-components
													get name() {
														return (
															(node.props.name && castToBoolean(node.props.nameVisible, true) && (
																<label
																	className="text-lg font-bold"
																	htmlFor={node.block?.key()}
																	key={node.block?.key('label')}
																>
																	{markdownifyToJSX(node.props.name, node.context)}
																	{node.block?.required
																		&& !node.block.hideRequiredIndicatorFromName && (
																		<span
																			className="relative top-[0.2rem] ml-1 text-2xl font-bold text-skin-primary"
																		>
																			*
																		</span>
																	)}
																</label>
															))
															|| undefined
														);
													},
													// eslint-disable-next-line react/no-unstable-nested-components
													get description() {
														return (
															(node.props.description && (
																<p
																	key={node.block?.key('description')}
																>
																	{markdownifyToJSX(node.props.description, node.context)}
																</p>
															))
															|| undefined
														);
													},
													get explanation() {
														return (
															(
																node.props.explanation
																&& markdownifyToJSX(node.props.explanation, node.context)
															) || undefined
														);
													},
													get placeholder() {
														return markdownifyToString(node.props.placeholder || '', node.context) || '';
													},
													get label() {
														return markdownifyToJSX(
															node.props.placeholder || node.props.name || '...',
															node.context,
															false,
														);
													},
													get tabIndex(): number {
														return 0;
													},
													get isFailed() {
														return false;
													},
													get ariaDescribedBy() {
														return (node.props.explanation && node.block?.key('explanation')) || undefined;
													},
													// eslint-disable-next-line react/no-unstable-nested-components
													get ariaDescription() {
														return (
															(node.props.explanation && (
																<p id={node.block?.key('explanation')}>
																	{markdownifyToJSX(node.props.explanation, node.context)}
																</p>
															))
															|| undefined
														);
													},
													focus: handleFocus(node, true, () => doAction('focus', node)),
													blur: handleFocus(node, false, () => doAction('blur', node)),
													autoFocus: handleAutoFocus(node),
													onSubmit:
														(allowSubmit
															&& (() => {
																if (runner.storyline) {
																	let count = 0;

																	each(runner.storyline.all, (n) => {
																		if (n.node.slots.count > 0) {
																			// eslint-disable-next-line no-plusplus
																			count++;
																		}
																	});

																	if (
																		count === 1
																		&& !runner.storyline.isFailed
																		&& !(runner.storyline.isAtFinish
																			&& !runner.storyline.isFinishable)
																	) {
																		runner.storyline.stepForward();
																	}
																}
															}))
														|| undefined,
													// eslint-disable-next-line max-len
													markdownifyToJSX: (md: string, lineBreaks?: boolean) => markdownifyToJSX(md, node.context, lineBreaks),
													markdownifyToURL: (md: string) => markdownifyToURL(md, node.context),
													// eslint-disable-next-line max-len
													markdownifyToImage: (md: string) => markdownifyToURL(md, node.context, undefined, [
														'image/jpeg',
														'image/png',
														'image/svg',
														'image/gif',
													]) || '',
													// eslint-disable-next-line max-len
													markdownifyToString: (md: string, lineBreaks?: boolean) => markdownifyToString(md, node.context, undefined, lineBreaks),
												})
												: (
													<div key={node.key}>
														{castToBoolean(node.props.nameVisible, true) && (
															<h3 className="text-xl font-bold">{markdownifyToJSX(node.props.name || '...', node.context)}</h3>
														)}
														{node.props.description && (
															<p className="text-lg">{markdownifyToJSX(node.props.description, node.context, true)}</p>
														)}
													</div>
												);

											return (
												(
													<div
														key={node.key}
														className="flex flex-col gap-1"
														ref={(el: HTMLDivElement) => {
															blocksRef.current[node.key] = el || undefined;
														}}
														data-block={node.block?.type.identifier || undefined}
													>
														{block || (
															<>
																{isString(node.props.name)
																&& castToBoolean(node.props.nameVisible, true)
																&& (

																	// eslint-disable-next-line max-len
																	// eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
																	<h2 onClick={fnEdit}>
																		{markdownifyToJSX(node.props.name, node.context)}
																	</h2>

																)}
																{node.props.description && (
																// eslint-disable-next-line max-len
																// eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-noninteractive-element-interactions
																	<p onClick={fnEdit}>
																		{markdownifyToJSX(node.props.description, node.context)}
																	</p>

																)}
															</>
														)}
													</div>
												)
											);
										},
										node,
										status,
										currentTab.first,
									);
								},
							)}
						</div>
						<nav className="mt-8 flex gap-4">
							<button
								type="button"
								className="rounded-md bg-skin-primary px-4 py-2 text-skin-primary-foreground disabled:bg-skin-secondary disabled:text-skin-secondary-foreground dark:bg-skin-primary-dark dark:text-skin-primary-foreground-dark dark:disabled:bg-skin-secondary-dark dark:disabled:text-skin-secondary-foreground-dark"
								disabled={runner.storyline?.isAtStart}
								onClick={() => runner.storyline?.stepBackward()}
							>
								Back
							</button>
							<button
								type="button"
								className="rounded-md bg-skin-primary px-4 py-2 text-skin-primary-foreground disabled:bg-skin-secondary disabled:text-skin-secondary-foreground dark:bg-skin-primary-dark dark:text-skin-primary-foreground-dark dark:disabled:bg-skin-secondary-dark dark:disabled:text-skin-secondary-foreground-dark"
								disabled={
									runner.storyline?.isFailed
									|| (runner.storyline?.isAtFinish
									&& !runner.storyline?.isFinishable)
								}
								onClick={() => runner.storyline?.stepForward()}
							>
								{runner.storyline?.isAtFinish ? 'Finish' : 'Next'}
							</button>
						</nav>
					</div>
				))}
				<OverlayProvider />
			</>
		)
	);

	if (props.onAction) {
		each(stagedRef.current, (node) => {
			if (node && !staged[node.key]) {
				stagedRef.current[node.key] = undefined;

				doAction('unstage', node);
			}
		});

		each(staged, (node) => {
			if (!stagedRef.current[node.key]) {
				stagedRef.current[node.key] = node;

				doAction('stage', node);
			}
		});
	}

	return {
		frameRef,
		turnstileRef,
		status,
		view,
		isPage,
		mode,
		title: runner.title,
		l10n,
		prologue: runner.prologue && {
			...runner.prologue,
			l10n,
			view,
			isPage,
			start: runner.preview === 'prologue' ? runner.resetPreview : runner.start,
			edit: (view !== 'live' && props.onEdit && (() => props.onEdit!('prologue'))) || undefined,
		},
		blocks,
		buttons:
			(view !== 'preview'
				&& status !== 'pausing'
				&& runner.storyline && {
				previous:
					(!runner.storyline.isAtStart && (() => runner.storyline!.stepBackward()))
					|| undefined,
				next:
						(!runner.storyline.isFailed
							&& !(runner.storyline.isAtFinish && !runner.storyline.isFinishable)
							&& (() => runner.storyline!.stepForward()))
						|| undefined,
				finish: (runner.storyline.isFinishable && (() => runner.storyline!.finish())) || undefined,
				finishable: view !== 'live' || props.onSubmit || !(runner.storyline && runner.storyline.hasDataCollected),
				pause: runner.pause,
				reload: runner.reload,
			})
			|| undefined,
		epilogue: runner.epilogue && {
			...runner.epilogue,
			l10n,
			view,
			isPage,
			repeat: runner.restart,
			edit: (view !== 'live' && props.onEdit && (() => props.onEdit!('epilogue', runner.epilogue?.branch))) || undefined,
		},
		pausing: runner.pausing,
		isEvaluating,
		progressPercentage: runner.storyline?.percentage || 0,
		pages: runner.storyline?.pages || [],
		tabIndex: tabRef.current.length > 0 ? tabRef.current[tabRef.current.length - 1].last : 0,
		OverlayProvider,
	};
};

export default useFormRunner;
