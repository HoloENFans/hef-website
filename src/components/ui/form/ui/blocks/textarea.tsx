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
	ReactNode, ChangeEvent, FocusEvent, KeyboardEvent, useEffect, useRef, useState,
} from 'react';
import {
	tripetto, DateTime, Num, TSerializeTypes,
	cancelUITimeout, castToString, scheduleUITimeout,
} from '@tripetto/runner';
import { Textarea } from '@tripetto/block-textarea/runner';
import { IFormNodeBlockProps, IFormNodeBlock } from '../../interfaces/block';
import { handleBlur, handleFocus, setReturnValue } from '../../util/helpers';
import { DEBOUNCE_MAX, DEBOUNCE_MIN } from '../../util/const';

/* eslint-disable react/destructuring-assignment */
function TextareaFabric(props: {
	readonly id?: string;
	readonly placeholder?: string;
	readonly required?: boolean;
	readonly disabled?: boolean;
	readonly readOnly?: boolean;
	readonly rows?: number;
	readonly autoSize?: boolean;
	readonly error?: boolean;
	readonly tabIndex?: number;
	readonly maxLength?: number;
	readonly value?:
	| string
	| {
		pristine: TSerializeTypes;
		readonly string: string;
		readonly isLocked: boolean;
		readonly isFrozen: boolean;
	};
	readonly ariaDescribedBy?: string;
	readonly onChange?: (value: string) => string | void;
	readonly onFocus?: (e: FocusEvent) => string | void;
	readonly onBlur?: (e: FocusEvent) => string | void;
	readonly onAutoFocus?: (el: HTMLTextAreaElement | null) => void;
	readonly onSubmit?: () => void;
	readonly onCancel?: () => void;
}) {
	const valueRef = props.value;
	const debounceRef = useRef<{
		duration: number;
		handle: number;
		update?:() => void;
	}>({
				duration: 0,
				handle: 0,
			});
	const [focus, setFocus] = useState(false);
	const [focusValue, setFocusValue] = useState(typeof valueRef === 'object' ? castToString(valueRef.pristine) : valueRef || '');
	const [value, setValue] =		typeof valueRef === 'object'
		? [
			focus ? focusValue : valueRef.string,
			(val: string) => {
				cancelUITimeout(debounceRef.current.handle);

				setFocusValue(val);

				const nTimeout = Num.range(debounceRef.current.duration * 2, DEBOUNCE_MIN, DEBOUNCE_MAX);

				debounceRef.current.handle = scheduleUITimeout(() => {
					const start = DateTime.precise;

					debounceRef.current.handle = 0;
					debounceRef.current.update = () => {
						debounceRef.current.duration = DateTime.elapsed(start, true);
						debounceRef.current.update = undefined;
					};

					valueRef.pristine = val || undefined;
				}, nTimeout);
			},
		]
		: [focusValue, setFocusValue];
	const [, makeErrorVisible] = useState(!!value);
	const [height, setHeight] = useState('auto');
	const minHeight = useRef<number>(undefined);
	const ref = useRef<HTMLTextAreaElement | null>(undefined);
	const setRef = (el: HTMLTextAreaElement | null) => {
		if (props.onAutoFocus) {
			props.onAutoFocus(el);
		}

		ref.current = el;
	};

	useEffect(() => {
		if (ref.current) {
			if (!focus) {
				ref.current.value = value;
			}

			if (props.autoSize) {
				if (typeof minHeight.current !== 'number') {
					minHeight.current = ref.current.getBoundingClientRect().height;
				}

				const current = ref.current.style.height;

				ref.current.style.height = 'auto';

				const n = Math.max(minHeight.current, ref.current.scrollHeight);

				setHeight(n > 10 ? `${n}px` : 'auto');

				ref.current.style.height = current;
			}
		}
	}, [value]);

	useEffect(() => () => {
		cancelUITimeout(debounceRef.current.handle);
	}, []);

	if (debounceRef.current.update) {
		debounceRef.current.update();
	}

	return (
		<textarea
			className={`resize-none rounded-lg px-4 py-2 ${props.error ? 'border-2 border-red-600' : 'border border-skin-primary dark:border-skin-primary-dark'}`}
			id={props.id}
			ref={setRef}
			tabIndex={props.tabIndex}
			placeholder={props.placeholder}
			required={props.required || false}
			disabled={props.disabled || false}
			readOnly={props.readOnly || (typeof valueRef === 'object' && (valueRef.isFrozen || valueRef.isLocked)) || false}
			rows={props.rows || 2}
			maxLength={props.maxLength || undefined}
			defaultValue={value}
			autoComplete="off"
			inputMode="text"
			aria-describedby={props.ariaDescribedBy}
			style={{
				height,
				overflowY: (props.autoSize && 'hidden') || undefined,
			}}
			onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
				setValue(e.target.value);
				makeErrorVisible(true);

				if (props.onChange) {
					setReturnValue(setValue, props.onChange(e.target.value));
				}
			}}
			onFocus={handleFocus(setFocus, setValue, props.onFocus)}
			onBlur={handleBlur(setFocus, setValue, props.onBlur)}
			onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
				if (e.shiftKey && e.key === 'Enter' && props.onSubmit) {
					e.preventDefault();

					props.onSubmit();
				} else if (e.key === 'Escape') {
					e.currentTarget.blur();
				} else if (e.key === 'Tab') {
					if (e.shiftKey) {
						if (props.onCancel) {
							e.preventDefault();

							props.onCancel();
						}
					} else if (props.onSubmit) {
						e.preventDefault();

						props.onSubmit();
					}
				}
			}}
		/>
	);
}
/* eslint-enable */

@tripetto({
	legacyBlock: true,
	type: 'node',
	identifier: '@tripetto/block-textarea',
})
export default class TextareaBlock extends Textarea implements IFormNodeBlock {
	render(props: IFormNodeBlockProps): ReactNode {
		return (
			<>
				{props.name}
				{props.description}
				<TextareaFabric
					id={props.id}
					value={this.textareaSlot}
					required={this.required}
					error={props.isFailed}
					autoSize
					tabIndex={props.tabIndex}
					placeholder={props.placeholder}
					maxLength={this.maxLength}
					ariaDescribedBy={props.ariaDescribedBy}
					onAutoFocus={props.autoFocus}
					onSubmit={props.onSubmit}
				/>
				{props.ariaDescription}
			</>
		);
	}
}
