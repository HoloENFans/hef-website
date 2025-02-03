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
	FocusEvent, MutableRefObject, useEffect, useRef, useState,
} from 'react';
import { IObservableNode, TAny, extendImmutable } from '@tripetto/runner';
import { IFormNodeBlock } from '../interfaces/block';

export interface IFocus {
	[key: string]: boolean | undefined;
}

export const useFocus = (props: {
	readonly gainFocus?: boolean;
	readonly initialFocus?: IFocus;
	readonly onFocus?: () => void;
	readonly hooks?: {
		hook: (type: 'restart', on: () => void) => void;
		onInteraction: () => void;
	};
	readonly page?: number;
}) => {
	const [focus, setFocus] = useState<IFocus>(props.initialFocus || {});
	const frameRef = useRef<HTMLDivElement>(undefined);
	const gainRef = useRef(true);
	const pageRef = useRef<number>(undefined);
	const autoFocusRef = useRef<string>(undefined);
	const elementsRef = useRef<{
		[key: string]: HTMLElement | undefined;
	}>({});

	if (pageRef.current !== props.page) {
		pageRef.current = props.page;
		gainRef.current = true;
	}

	useEffect(() => {
		if (gainRef.current && autoFocusRef.current) {
			const focusElement = elementsRef.current[autoFocusRef.current];

			if (focusElement && frameRef.current) {
				if (document.hasFocus()) {
					const { activeElement } = document;
					let allowFocus = activeElement && activeElement.isEqualNode(frameRef.current);

					if (props.gainFocus) {
						allowFocus = allowFocus || !activeElement || activeElement.tagName === 'BODY';
					}

					gainRef.current = false;

					if (allowFocus) {
						focusElement.focus({
							preventScroll: true,
						});
					}
				}

				delete elementsRef.current[autoFocusRef.current];
			}
		}
	});

	return [
		frameRef as MutableRefObject<HTMLIFrameElement>,
		() => setFocus({}),
		(ref: IObservableNode<IFormNodeBlock>) => focus[ref.key],
		(ref: IObservableNode<IFormNodeBlock>, hasFocus: boolean, on?: () => void) => () => {
			if (hasFocus) {
				gainRef.current = false;
			}

			setFocus(
				extendImmutable(focus, {
					[ref.key]: hasFocus,
				}),
			);

			if (hasFocus && props.onFocus) {
				props.onFocus();
			}

			if (on && focus[ref.key] !== hasFocus) {
				on();
			}
		},
		(ref: IObservableNode<IFormNodeBlock>) => (el: HTMLElement | null) => {
			if (el) {
				elementsRef.current[ref.key] = el;

				if (!autoFocusRef.current) {
					autoFocusRef.current = ref.key;
				}
			} else {
				if (autoFocusRef.current === ref.key) {
					autoFocusRef.current = undefined;
				}

				delete elementsRef.current[ref.key];
			}
		},
		focus,
	] as [
		MutableRefObject<HTMLDivElement>,
		() => void,
		(ref: IObservableNode<IFormNodeBlock>) => boolean | undefined,
		// eslint-disable-next-line max-len
		(ref: IObservableNode<IFormNodeBlock>, hasFocus: boolean, on?: () => void) => (e: FocusEvent) => TAny,
		(ref: IObservableNode<IFormNodeBlock>) => (el: HTMLElement | null) => void,
		IFocus,
	];
};
