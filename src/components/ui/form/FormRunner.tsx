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

'use client';

import { TRunnerPreviewData } from '@tripetto/runner-react-hook';
import { useEffect, useRef, useState } from 'react';
import {
	compare,
	Export,
	fingerprint,
	IDefinition,
	IHookPayload,
	Instance,
	isFunction,
	ISnapshot,
	isPromise,
	L10n,
	TL10n,
	checksum,
	powSolve,
} from '@tripetto/runner';
import './ui/blocks';
import { Turnstile } from '@marsidev/react-turnstile';
import Prologue from './ui/messages/prologue';
import Epilogue from './ui/messages/epilogue';
import { IRunnerSnapshot } from './interfaces/snapshot';
import { IRunnerProps, IRunnerUIProps } from './interfaces/props';
import { IBuilderInstance } from './interfaces/builder';
import { IRunnerController } from './hooks/controller';
import useFormRunner from './hooks/runner';

let runCounter = 0;

export function FormRunnerUI(props: IRunnerUIProps) {
	const {
		frameRef,
		turnstileRef,
		prologue,
		blocks,
		epilogue,
	} = useFormRunner({
		...props,
		onSubmit: async (instance: Instance): Promise<string | undefined> => {
			/* eslint-disable prefer-promise-reject-errors */
			const data = {
				exportables: Export.exportables(instance),
				actionables: Export.actionables(instance),
			};

			const announcementRes = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/forms/announce`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					// eslint-disable-next-line react/destructuring-assignment
					formId: props.id,
					checksum: checksum(data, true),
				}),
			}).catch();

			if (!announcementRes) {
				return Promise.reject();
			}

			if (announcementRes.status > 400) {
				return Promise.reject('reject');
			}

			const announcement = await announcementRes.json();

			let answer;
			try {
				answer = powSolve(
					data,
					10,
					announcement.id,
					16,
					1000 * 60 * 5,
					announcement.timestamp,
				);
			} catch {
				return Promise.reject('Failed to solve the challenge');
			}

			if (!answer) {
				return Promise.reject();
			}

			turnstileRef.current?.reset();
			turnstileRef.current?.execute();

			let turnstileResponse;
			try {
				turnstileResponse = await turnstileRef.current?.getResponsePromise();
			} catch {
				return Promise.reject('reject');
			}
			if (!turnstileResponse) {
				return Promise.reject('reject');
			}

			const res = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/forms/submit`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					...data,
					id: announcement.id,
					turnstileResponse,
					answer,
				}),
			}).catch();

			if (!res) {
				return Promise.reject();
			}

			if (res.status > 400) {
				return Promise.reject('reject');
			}

			return undefined;
			/* eslint-enable */
		},
	});

	return (
		(
			<div
				ref={frameRef}
			>
				{
				// eslint-disable-next-line react/jsx-props-no-spreading
					(prologue && <Prologue {...prologue} />)
				|| (
					blocks && (
						// eslint-disable-next-line react/jsx-no-useless-fragment
						<>
							{blocks}
						</>

					)
				)
				// eslint-disable-next-line react/jsx-props-no-spreading
				|| (epilogue && <Epilogue {...epilogue} />)
				}
				{turnstileRef && (
					<Turnstile
						className="mt-4"
						siteKey={process.env.NEXT_PUBLIC_TURNSTILE_KEY as string}
						ref={turnstileRef}
						options={{
							execution: 'render',
							appearance: 'always',
							responseField: false,
							refreshExpired: 'manual',
						}}
						onError={() => {}}
					/>
				)}
			</div>
		)
	);
}

/* eslint-disable react/destructuring-assignment */
export default function FormRunner(props: IRunnerProps) {
	const emptyDefinition = {
		sections: [],
		builder: {
			name: '',
			version: '',
		},
	} as IDefinition;

	const definition = useRef<IDefinition | false>(undefined);
	const snapshot = useRef<ISnapshot<IRunnerSnapshot> | false>(undefined);
	const l10n = useRef<TL10n | false>(undefined);
	const license = useRef<string | false>(undefined);
	const isReady = useRef<true>(undefined);
	const runOnce = useRef<true>(undefined);
	const builderRef = useRef<IBuilderInstance>(undefined);
	const builderAwait = useRef<boolean>(undefined);
	const isLive = props.view !== 'test' && props.view !== 'preview';
	const controllerInternal = useRef<IRunnerController>(undefined);
	const controller = props.controller || controllerInternal;
	const [, updateProc] = useState({});
	const componentState = useRef<'mounted' | 'dirty'>(undefined);
	const updateRef = useRef<typeof updateProc>(undefined);
	const update = (apply: () => void) => {
		apply();

		if (componentState.current === 'mounted') {
			updateRef.current!({});
		} else {
			componentState.current = 'dirty';
		}
	};

	updateRef.current = updateProc;

	if (!runOnce.current) {
		runOnce.current = true;
		builderAwait.current = !!props.builder;

		if (isPromise(props.definition)) {
			definition.current = false;

			props.definition
				// eslint-disable-next-line no-return-assign
				.then((data) => update(() => (definition.current = data || emptyDefinition)))
				// eslint-disable-next-line no-return-assign
				?.catch(() => update(() => (definition.current = emptyDefinition)));
		} else {
			definition.current = props.definition || emptyDefinition;
		}

		if (isPromise(props.snapshot)) {
			snapshot.current = false;

			props.snapshot
				// eslint-disable-next-line no-return-assign
				.then((data) => update(() => (snapshot.current = data)))
				// eslint-disable-next-line no-return-assign
				?.catch(() => update(() => (snapshot.current = undefined)));
		} else {
			snapshot.current = props.snapshot || undefined;
		}

		if (isPromise(props.l10n)) {
			l10n.current = false;

			// eslint-disable-next-line no-return-assign,max-len
			props.l10n.then((data) => update(() => (l10n.current = data)))?.catch(() => update(() => (l10n.current = undefined)));
		} else {
			l10n.current = props.l10n || undefined;
		}

		if (isPromise(props.license)) {
			license.current = false;

			// eslint-disable-next-line no-return-assign,max-len
			props.license.then((data) => update(() => (license.current = data)))?.catch(() => update(() => (license.current = undefined)));
		} else {
			license.current = props.license || undefined;
		}
	}

	const l10nNamespace = useRef<L10n.Namespace>(undefined);
	const l10nCache = useRef<{
		locales: {
			[domain: string]: {
				locale: L10n.ILocale | undefined;
			};
		};
		translations: {
			[domain: string]: {
				translation: L10n.TTranslation | L10n.TTranslation[] | undefined;
			};
		};
	}>({
		locales: {},
		translations: {},
	});

	const processL10n = async (data: TL10n) => {
		const currentDefinition = controller.current?.definition || definition.current;

		l10nNamespace.current!.reset(
			(data.language !== 'auto' && data.language)
			|| (currentDefinition && currentDefinition.language)
			|| props.language
			|| navigator.language,
		);

		if (props.translations || props.locale) {
			const localeDomain = data.locale || 'auto';
			// eslint-disable-next-line no-nested-ternary
			const localeResult = l10nCache.current.locales[localeDomain]
				? l10nCache.current.locales[localeDomain].locale
				: isFunction(props.locale)
					? props.locale(localeDomain)
					: props.locale;
			const translationResult = l10nCache.current.translations[l10nNamespace.current!.current]
				? l10nCache.current.translations[l10nNamespace.current!.current].translation
				: (isFunction(props.translations)
					? props.translations(l10nNamespace.current!.current, 'hefw-forms', '')
					: props.translations) || undefined;
			// eslint-disable-next-line max-len
			const [locale, translation] =	await Promise.all([Promise.resolve(localeResult), Promise.resolve(translationResult)]);

			l10nCache.current.locales[localeDomain] = {
				locale,
			};

			l10nCache.current.translations[l10nNamespace.current!.current] = {
				translation,
			};

			if (locale) {
				l10nNamespace.current!.locale.load(locale);
			}

			if (translation) {
				l10nNamespace.current!.load(translation, false);
			}
		}

		if (data.translations) {
			l10nNamespace.current!.load(data.translations, false, 'overwrite');
		}
	};

	const localSnapshot = useRef({
		data: undefined as ISnapshot<IRunnerSnapshot> | undefined,
		save: () => {
			if (controller.current && localStorage) {
				const key = `hefw-forms-${controller.current.fingerprint}`;
				const data = controller.current.snapshot;

				if (data) {
					localStorage.setItem(key, JSON.stringify(data));
				} else {
					localStorage.removeItem(key);
				}
			}
		},
	});

	if (!l10nNamespace.current && definition.current !== false && l10n.current !== false) {
		// eslint-disable-next-line no-plusplus
		l10nNamespace.current = L10n.Namespace.create(`hefw-forms:${runCounter++}`);

		processL10n(l10n.current || {})
			// eslint-disable-next-line no-return-assign
			.then(() => update(() => (isReady.current = true)))
			// eslint-disable-next-line no-return-assign
			.catch(() => update(() => (isReady.current = true)));
	}

	if (props.persistent && isLive && definition.current !== false && typeof window !== 'undefined' && localStorage) {
		localSnapshot.current.data = JSON.parse(localStorage.getItem(`hefw-forms-${fingerprint(definition.current || emptyDefinition)}`) || 'null')
			|| undefined;
	}

	useEffect(() => {
		const isDirty = componentState.current === 'dirty';
		const allowListener = props.persistent && isLive && typeof window !== 'undefined' && localStorage;
		let handle = 0;

		componentState.current = 'mounted';

		if (allowListener) {
			window.addEventListener('unload', localSnapshot.current.save);
		}

		if (props.builder && !builderRef.current) {
			new Promise((resolve: (builder: IBuilderInstance) => void) => {
				const fnAwait = () => {
					handle = 0;

					if (props.builder?.current) {
						resolve(props.builder?.current);
					} else {
						handle = requestAnimationFrame(fnAwait);
					}
				};

				fnAwait();
			}).then((builder) => {
				if (!builderRef.current) {
					builderRef.current = builder;

					update(() => {
						definition.current = builder.definition;
						builderAwait.current = false;
					});

					builder.hook<
					'OnChange',
					IHookPayload<'OnChange'> & {
						readonly definition: IDefinition;
					}
					>('OnChange', 'synchronous', (changeEvent) => {
						if (controller.current) {
							controller.current.definition = changeEvent.definition;
						}
					});

					builder.hook<'OnEdit', IHookPayload<'OnEdit'> & { readonly data: TRunnerPreviewData }>(
						'OnEdit',
						'synchronous',
						(editEvent) => {
							controller.current?.doPreview(editEvent.data);
						},
					);
				}
			});
		}

		if (isDirty) {
			updateProc({});
		}

		return () => {
			if (allowListener) {
				localSnapshot.current.save();
				window.removeEventListener('unload', localSnapshot.current.save);
			}

			if (handle !== 0) {
				cancelAnimationFrame(handle);
			}
		};
	});

	if (controller.current) {
		if (props.view) {
			controller.current.view = props.view;
		}

		if (!isPromise(props.definition)
			&& props.definition && !compare(props.definition, controller.current.definition, true)) {
			// eslint-disable-next-line no-multi-assign
			controller.current.definition = definition.current = props.definition;
		}

		if (!isPromise(props.l10n)
			&& props.l10n && !compare(props.l10n, controller.current.l10n, true)) {
			// eslint-disable-next-line no-multi-assign
			controller.current.l10n = l10n.current = props.l10n;
		}
	}

	return (
		// eslint-disable-next-line react/jsx-no-useless-fragment
		<>
			{!isReady.current
			|| definition.current === false
			|| snapshot.current === false
			|| license.current === false
			|| l10n.current === false
			|| builderAwait.current ? (
					props.loader
				) : (
					<FormRunnerUI
						// eslint-disable-next-line react/jsx-props-no-spreading
						{...props}
						controller={controller}
						definition={definition.current || emptyDefinition}
						snapshot={snapshot.current || localSnapshot.current.data}
						license={license.current}
						l10nNamespace={l10nNamespace.current}
						l10n={l10n.current}
						onL10n={processL10n}
						onEdit={
							props.builder
								? (type: 'prologue' | 'epilogue' | 'styles' | 'l10n' | 'block', id?: string) => {
									if (props.builder?.current) {
										// eslint-disable-next-line default-case
										switch (type) {
											case 'prologue':
												props.builder.current.edit('prologue');
												break;
											case 'epilogue':
												props.builder.current.edit('epilogue', id);
												break;
											case 'block':
												if (id) {
													props.builder.current.edit('node', id);
												}
												break;
										}
									}

									if (props.onEdit) {
										props.onEdit(type, id);
									}
								}
								: props.onEdit
						}
					/>
				)}
		</>
	);
}
/* eslint-enable */
