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
	ChangeEvent, ReactNode, FocusEvent, KeyboardEvent, MouseEvent, useRef, useState,
} from 'react';
import {
	DateTime, Num, arrayItem, compare, each, eachReverse, filter, findFirst,
	tripetto,
} from '@tripetto/runner';
import { MultiSelect } from '@tripetto/block-multi-select/runner';
import { TOverlayContext } from '@tripetto/runner-fabric/overlay';
import { IMultiSelectOption } from '@tripetto/runner-fabric';
import { XMarkIcon } from '@heroicons/react/20/solid';
import { handleBlur, handleFocus } from '../../util/helpers';
import { IFormNodeBlockProps, IFormNodeBlock } from '../../interfaces/block';

/* eslint-disable react/destructuring-assignment,react/no-unused-prop-types */
function MultiSelectFabric(props: {
	readonly overlay: TOverlayContext;
	readonly id: string;
	readonly options: IMultiSelectOption[];
	readonly placeholder?: string;
	readonly required?: boolean;
	readonly error?: boolean;
	readonly tabIndex?: number;
	readonly maxSelected?: number;
	readonly ariaDescribedBy?: string;
	readonly onChange?: (value: string) => void;
	readonly onFocus?: (e: FocusEvent) => void;
	readonly onBlur?: (e: FocusEvent) => void;
	readonly onAutoFocus?: (el: HTMLInputElement | null) => void;
	readonly onSubmit?: () => void;
	readonly onCancel?: () => void;
}) {
	const { overlay: Overlay } = props;

	// eslint-disable-next-line max-len
	const selected = filter(props.options, (option) => (!!(option.value?.value === true && option.name)));
	const [focus, setFocus] = useState(false);
	const [query, setQuery] = useState('');
	const [cursor, setCursor] = useState('');
	const [position, setPosition] = useState<{
		left: number;
		top: number;
		width: number;
		height: number;
	}>();
	const [, makeErrorVisible] = useState(selected.length > 0);
	const scrollPosition = useRef({
		position: 0,
		time: 0,
	});
	const scrollIntoView = useRef(false);
	const ref = useRef<HTMLInputElement | null>(undefined);
	const componentRef = useRef<HTMLDivElement>(null);
	const optionsRef = useRef<HTMLDivElement>(null);
	const scrollToRef = useRef<HTMLDivElement>(null);
	const setRef = (el: HTMLInputElement | null) => {
		if (props.onAutoFocus && selected.length === 0) {
			props.onAutoFocus(el);
		}

		ref.current = el;
	};
	const options =		(focus
			&& filter(
				props.options,
				(option) => (option.value?.value !== true
						&& option.name
						&& !option.disabled
						&& (!query || option.name.toLowerCase().indexOf(query.toLowerCase()) !== -1))
					|| false,
			))
		|| [];

	const updateScrollPosition = () => {
		scrollPosition.current = {
			position: optionsRef.current?.firstElementChild?.scrollTop || 0,
			time: DateTime.now,
		};
	};

	if (!focus && cursor) {
		setCursor('');

		scrollIntoView.current = false;
	}

	if (!focus && position) {
		setPosition(undefined);
	}

	return (
		// eslint-disable-next-line jsx-a11y/interactive-supports-focus
		<div
			className="rounded-md border border-skin-primary bg-transparent dark:border-skin-primary-dark"
			ref={componentRef}
			onMouseDown={(e: MouseEvent<HTMLDivElement>) => {
				const tagName = (e.target as HTMLElement).tagName.toLowerCase();

				if (focus && tagName !== 'button' && (tagName !== 'input' || !query)) {
					e.preventDefault();
					e.stopPropagation();

					if (ref.current) {
						ref.current.blur();
					}
				} else if (tagName !== 'input') {
					e.preventDefault();
					e.stopPropagation();

					if (ref.current) {
						ref.current.focus();
					}
				}
			}}
			role="combobox"
			aria-haspopup="listbox"
			aria-owns={(focus && `${props.id}-options`) || undefined}
			aria-controls={props.id}
			aria-expanded={focus}
			aria-describedby={props.ariaDescribedBy}
		>
			<div
				className="flex flex-wrap items-center"
			>
				{selected.map((option, index) => (
					<div
						className="my-2 ml-2 flex max-w-6/12 items-stretch rounded-md border border-skin-primary pl-2 dark:border-skin-primary-dark"
						key={option.id || index}
					>
						<div className="truncate">
							{option.label || option.name}
						</div>
						{/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
						<button
							className="w-6"
							type="button"
							onClick={() => {
								if (option.value
									&& !option.disabled
									&& !option.value?.isFrozen && !option.value?.isLocked) {
									// eslint-disable-next-line no-param-reassign
									option.value.value = false;

									updateScrollPosition();
									makeErrorVisible(true);
								}
							}}
						>
							<XMarkIcon className="size-5 pl-1" />
						</button>
					</div>
				))}
				<input
					className="min-w-16 flex-[1_1_0%] rounded-lg bg-transparent! px-4 py-2 focus:bg-transparent focus:outline-hidden active:bg-transparent"
					ref={setRef}
					id={props.id}
					type="search"
					autoComplete="off"
					spellCheck="false"
					inputMode="text"
					value={(focus && query) || ''}
					placeholder={(!selected.length && props.placeholder) || ''}
					onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value || '')}
					onFocus={handleFocus(setFocus, setQuery, props.onFocus)}
					onBlur={handleBlur(setFocus, setQuery, props.onBlur)}
					onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
						if (e.key === 'Enter' && cursor) {
							e.preventDefault();

							let index = 0;
							const option = findFirst(options, (o) => {
								index += 1;

								return o.id === cursor;
							});

							if (
								option
								&& !option.disabled
								&& option.value
								&& !option.value.isFrozen
								&& !option.value.isLocked
								&& (!props.maxSelected || selected.length < props.maxSelected)
							) {
								option.value.value = true;

								updateScrollPosition();
								setCursor(arrayItem(options, index)?.id || '');
								makeErrorVisible(true);
							}
						} else if (e.key === 'Escape') {
							e.currentTarget.blur();
						} else if (e.key === 'Tab') {
							e.currentTarget.blur();

							if (e.shiftKey) {
								if (props.onCancel) {
									e.preventDefault();

									props.onCancel();
								}
							} else if (props.onSubmit) {
								e.preventDefault();

								props.onSubmit();
							}
						} else if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
							scrollIntoView.current = true;

							if (cursor) {
								let found = false;
								let next = '';

								(e.key === 'ArrowDown' || e.key === 'ArrowRight' ? eachReverse : each)(options, (option) => {
									if (option.id === cursor) {
										found = true;
									} else if (!found) {
										next = option.id;
									}
								});

								if (found && next) {
									setCursor(next);

									return;
								}
							}

							setCursor(arrayItem(options, e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? options.length - 1 : 0)?.id || '');
						} else if (e.key === 'Backspace' && !query && selected.length > 0) {
							const lastOption = selected[selected.length - 1];

							if (lastOption.value) {
								lastOption.value.value = false;

								updateScrollPosition();
								makeErrorVisible(true);
							}
						}
					}}
				/>
			</div>
			{focus && options.length > 0 && (
				<Overlay
					onEffect={() => {
						const updatePosition = () => {
							if (componentRef.current && optionsRef.current) {
								const componentRect = componentRef.current.getBoundingClientRect();
								const optionsRect = optionsRef.current.getBoundingClientRect();
								const scrollRect = optionsRef.current.firstElementChild?.getBoundingClientRect()
									|| optionsRect;
									// eslint-disable-next-line max-len
								const viewportHeight = componentRef.current.ownerDocument.documentElement.clientHeight
									|| window.innerHeight;
								const availableHeight = viewportHeight - componentRect.bottom;
								const positionAbove = (optionsRef.current.firstElementChild?.scrollHeight || 0)
									> availableHeight && componentRect.top > availableHeight;
								const newPosition = {
									left: optionsRect.left + (componentRect.left - optionsRect.left),
									top:
										optionsRect.top
										+ (positionAbove
											? componentRect.top - optionsRect.height - optionsRect.top - 1
											: componentRect.bottom - optionsRect.top + 1),
									width: componentRect.width,
									height: Num.max(
										(positionAbove ? componentRect.top : availableHeight)
										- Num.max(optionsRect.height - scrollRect.height, 0),
										120,
									),
								};

								if (!compare(position, newPosition, true)) {
									setPosition(newPosition);
								}
							}
						};

						if (!position) {
							updatePosition();
						}

						if (DateTime.elapsed(scrollPosition.current.time) < 300
							&& optionsRef.current?.firstElementChild) {
							optionsRef.current.firstElementChild.scrollTo(0, scrollPosition.current.position);
						}

						if (scrollToRef.current) {
							scrollToRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });

							scrollIntoView.current = false;
						}

						if (componentRef.current) {
							const resizeObserver = 'ResizeObserver' in window && new ResizeObserver(() => updatePosition());
							const componentRect = componentRef.current.getBoundingClientRect();
							const currentPosition = componentRect.top;
							const currentWidth = componentRect.width;
							const scrollObserverFunc = () => {
								if (componentRef.current) {
									const rect = componentRef.current.getBoundingClientRect();

									if (rect.top !== currentPosition || rect.width !== currentWidth) {
										updatePosition();
									} else {
										// eslint-disable-next-line @typescript-eslint/no-use-before-define
										scrollObserver = requestAnimationFrame(scrollObserverFunc);
									}
								}
							};
							let scrollObserver = requestAnimationFrame(scrollObserverFunc);

							if (resizeObserver) {
								resizeObserver.observe(componentRef.current);
							}

							return () => {
								if (resizeObserver) {
									resizeObserver.disconnect();
								}

								cancelAnimationFrame(scrollObserver);
							};
						}

						return undefined;
					}}
				>
					<div
						className="fixed left-0 top-0 z-50 rounded-md border border-skin-primary bg-skin-secondary text-skin-secondary-foreground shadow-md dark:border-skin-primary-dark dark:bg-skin-secondary-dark dark:text-skin-secondary-foreground-dark"
						key={`${props.id}-options`}
						ref={optionsRef}
						id={`${props.id}-options`}
						style={{
							transform: `translate(${position?.left || 0}px,${position?.top || 0}px)`,
							maxWidth: position?.width,
							opacity: position ? 1 : 0,
						}}
					>
						<div
							key={`${props.id}-list`}
							style={{
								maxHeight: position?.height,
							}}
						>
							{options.map((option, index) => (
								(
								// eslint-disable-next-line max-len
								// eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/interactive-supports-focus
									<div
										className={`flex w-full flex-col px-4 py-1 pr-16 hover:bg-skin-primary hover:text-skin-primary-foreground dark:hover:bg-skin-primary-dark dark:hover:text-skin-primary-foreground ${option.disabled ? 'opacity-50' : ''}`}
										key={option.id || index}
										// eslint-disable-next-line max-len
										ref={(scrollIntoView.current && cursor === option.id && scrollToRef) || undefined}
										data-id={option.id}
										role="option"
										aria-selected={cursor === option.id}
										onMouseMove={() => setCursor(option.id)}
										onMouseDown={(e: MouseEvent<HTMLDivElement>) => {
											e.preventDefault();
											e.stopPropagation();
										}}
										onClick={() => {
											if (
												option.value
											&& !option.disabled
											&& !option.value.isFrozen
											&& !option.value.isLocked
											&& (!props.maxSelected || selected.length < props.maxSelected)
											) {
												// eslint-disable-next-line no-param-reassign
												option.value.value = true;

												updateScrollPosition();
												setCursor(arrayItem(options, index + 1)?.id || '');
												makeErrorVisible(true);
											}
										}}
									>
										<div>{option.label || option.name}</div>
										{option.description && <div className="text-sm">{option.description}</div>}
									</div>
								)
							))}
						</div>
					</div>
				</Overlay>
			)}
		</div>
	);
}
/* eslint-enable */

@tripetto({
	legacyBlock: true,
	type: 'node',
	identifier: '@tripetto/block-multi-select',
})
export default class MultiSelectBlock extends MultiSelect implements IFormNodeBlock {
	render(props: IFormNodeBlockProps, done?: () => void, cancel?: () => void): ReactNode {
		return (
			<>
				{props.name}
				{props.description}
				<MultiSelectFabric
					id={props.id}
					overlay={props.overlay}
					options={this.options(props)}
					required={this.required}
					error={props.isFailed}
					tabIndex={props.tabIndex}
					placeholder={props.placeholder}
					ariaDescribedBy={props.ariaDescribedBy}
					onAutoFocus={props.autoFocus}
					onFocus={props.focus}
					onBlur={props.blur}
					onSubmit={done}
					onCancel={cancel}
				/>
				{props.ariaDescription}
			</>
		);
	}
}
