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
	FocusEvent, ReactNode, useEffect, useRef, useState, type JSX,
} from 'react';
import { cancelUITimeout, scheduleUITimeout, tripetto } from '@tripetto/runner';
import { Checkbox } from '@tripetto/block-checkbox/runner';
import { IFormNodeBlock, IFormNodeBlockProps } from '@/components/ui/form/interfaces/block';
import { DEBOUNCE_NORMAL } from '../../util/const';

/* eslint-disable react/destructuring-assignment */
export function CheckboxFabric(props: {
	readonly hideRequiredIndicator?: boolean;
	readonly label?: string | JSX.Element;
	readonly description?: string | JSX.Element;
	readonly required?: boolean;
	readonly disabled?: boolean;
	readonly readOnly?: boolean;
	readonly error?: boolean;
	readonly tabIndex?: number;
	readonly tabSubmit?: boolean;
	readonly value?:
	| boolean
	| {
		value: boolean;
		readonly isLocked: boolean;
		readonly isFrozen: boolean;
		readonly confirm: () => void;
	};
	readonly ariaDescribedBy?: string;
	readonly onChange?: (value: boolean) => void;
	readonly onFocus?: (e: FocusEvent) => void;
	readonly onBlur?: (e: FocusEvent) => void;
	readonly onAutoFocus?: (el: HTMLInputElement | null) => void;
	readonly onSubmit?: () => void;
	readonly onCancel?: () => void;
}) {
	const valueRef = props.value;
	const debounceRef = useRef<number>(0);
	const [proxy, setProxy] = useState((typeof valueRef !== 'object' && valueRef) || false);
	const [value, setValue] = typeof valueRef === 'object'
		? [
			debounceRef.current !== 0 ? proxy : valueRef.value,
			(val: boolean) => {
				cancelUITimeout(debounceRef.current);

				setProxy(val);

				debounceRef.current = scheduleUITimeout(() => {
					debounceRef.current = 0;

					valueRef.value = val;
				}, DEBOUNCE_NORMAL);
			},
		]
		: [proxy, setProxy];

	const changeValue = (val: boolean) => {
		setValue(val);

		if (props.onChange) {
			props.onChange(val);
		}
	};

	const disabled = props.disabled || props.readOnly || (typeof valueRef === 'object' && (valueRef.isFrozen || valueRef.isLocked)) || false;

	useEffect(() => () => {
		cancelUITimeout(debounceRef.current);
	}, []);

	if (typeof valueRef === 'object') {
		valueRef.confirm();
	}

	return (
		<div className="w-full">
			<label
				className="relative inline-flex min-h-5 cursor-pointer select-none items-center"
			>
				<input
					className="absolute size-0 cursor-pointer opacity-0"
					ref={props.onAutoFocus}
					type="checkbox"
					checked={value}
					tabIndex={props.tabIndex}
					aria-describedby={props.ariaDescribedBy}
					disabled={disabled}
					onChange={(e) => changeValue(e.target.checked)}
					onFocus={props.onFocus}
					onBlur={props.onBlur}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();

							if (e.shiftKey && props.onSubmit) {
								props.onSubmit();
							} else {
								changeValue(!value);
							}
						} else if (e.key === 'Escape') {
							e.currentTarget.blur();
						} else if (e.key === 'Tab') {
							if (e.shiftKey) {
								if (props.onCancel) {
									e.preventDefault();

									props.onCancel();
								}
							} else if ((props.tabSubmit || typeof props.tabSubmit !== 'boolean') && props.onSubmit) {
								e.preventDefault();

								props.onSubmit();
							}
						}
					}}
				/>
				<span
					className={`ml-6 box-content ${props.error ? 'text-red-500' : ''}`}
				>
					{props.label || '...'}
					{props.required && !props.hideRequiredIndicator && (
						<span
							className="relative left-[0.1rem] top-[0.18rem] text-[1.4rem] uppercase leading-[0.5rem] text-skin-heading after:content-['*'] dark:text-skin-heading-dark"
						/>
					)}
					{props.description && (
						<small className="text-sm">
							<br />
							{props.description}
						</small>
					)}
				</span>
				<span
					className={`absolute left-0 top-[0.095em] box-content size-4 rounded-xs border border-skin-primary bg-skin-secondary after:absolute after:left-[0.428571em] after:top-1 after:h-2 after:w-1 after:rotate-45 after:border-b-[0.142857em] after:border-r-[0.142857em] after:border-solid after:border-skin-secondary-foreground after:transition-transform after:content-[''] hover:shadow-[0_0_0_0.2rem_rgba(0,0,0,0.2)] active:shadow-[0_0_0_0.2rem_rgba(0,0,0,0.2)] dark:border-skin-primary-dark dark:bg-skin-secondary-dark dark:after:border-skin-secondary-foreground-dark ${value ? 'after:scale-100' : 'after:scale-0'}`}
				/>
			</label>
		</div>
	);
}

/* eslint-enable */

@tripetto({
	legacyBlock: true,
	type: 'node',
	identifier: '@tripetto/block-checkbox',
	alias: 'checkbox',
})
export default class CheckboxBlock extends Checkbox implements IFormNodeBlock {
	readonly hideRequiredIndicatorFromName = true;

	render(props: IFormNodeBlockProps): ReactNode {
		return (
			<>
				{props.placeholder && props.name}
				{props.description}
				<CheckboxFabric
					hideRequiredIndicator={this.hideRequiredIndicatorFromName}
					value={this.checkboxSlot}
					required={this.required}
					error={props.isFailed}
					label={props.label}
					tabIndex={props.tabIndex}
					ariaDescribedBy={props.ariaDescribedBy}
					onAutoFocus={props.autoFocus}
					onFocus={props.focus}
					onBlur={props.blur}
					onSubmit={props.onSubmit}
				/>
				<small className="text-sm">
					{props.ariaDescription}
				</small>
			</>
		);
	}
}
