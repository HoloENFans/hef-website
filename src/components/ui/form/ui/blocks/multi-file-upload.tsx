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

import { MultiFileUpload } from '@holoenfans/tripetto-block-multi-file-upload/runner';
import { IFileService } from '@tripetto/runner-fabric/components/file';
import { Num, Str, tripetto } from '@tripetto/runner';
import type {
	DragEvent, FocusEvent, KeyboardEvent, JSX,
} from 'react';
import {
	ReactNode, useEffect, useMemo, useRef, useState,
} from 'react';
import { fileIcon } from '@tripetto/runner-fabric/icons/file';
import { IFormNodeBlock, IFormNodeBlockProps } from '../../interfaces/block';

interface IFileSlot {
	readonly hasValue: boolean;
	readonly string: string;
	readonly reference: string | undefined;
	readonly isLocked: boolean;
	readonly isFrozen: boolean;
}

interface IMultiFileController {
	readonly isImage: (i: number) => boolean;
	readonly maxFiles: number;
	readonly limit: number;
	readonly allowedExtensions: string[];
	// eslint-disable-next-line max-len
	readonly upload: (files: FileList, service: IFileService | undefined, onProgress: (percent: number) => void) => Promise<void>;
	readonly download: (i: number, service?: IFileService) => Promise<string>;
	readonly delete: (i: number, service?: IFileService) => Promise<void>;
	readonly clear: (service?: IFileService) => Promise<void>;
}

// eslint-disable-next-line max-len
/* eslint-disable react/destructuring-assignment,react/no-unused-prop-types,@typescript-eslint/no-unused-vars */
function FileThumbnailFabric(props: {
	readonly controller: IMultiFileController;
	readonly fileSlot: IFileSlot;
	readonly idx: number;
	readonly service?: IFileService;
	readonly host?: (props: { children: ReactNode }) => JSX.Element;
	readonly error?: ReactNode;
	readonly loading?: ReactNode;
}) {
	const [data, setData] = useState({
		loading: props.controller.isImage(props.idx),
		base64data: '',
	});

	useEffect(() => {
		if (props.controller.isImage(props.idx)) {
			if (!data.loading) {
				setData({
					loading: true,
					base64data: '',
				});
			}

			props.controller
				.download(props.idx, props.service)
				.then((base64data) => setData({
					loading: false,
					base64data,
				}))
				.catch(() => setData({
					loading: false,
					base64data: '',
				}));
		}
	}, [props.fileSlot.reference]);

	if (data.loading) {
		return props.loading;
	}

	return (
		(data.base64data && (props.host ? <props.host><img src={data.base64data} alt="" /></props.host>
			: <img className="max-h-28 object-contain" src={data.base64data} alt="" />)) || (
			props.error
		)
	);
}

export function MultiFileFabric(props: {
	readonly controller: IMultiFileController;
	readonly slots: IFileSlot[];
	readonly labels: (
		id:
		| 'explanation'
		| 'dragging'
		| 'limit'
		| 'extensions'
		| 'retry'
		| 'progress'
		| 'delete'
		| 'clear'
		| 'invalid-file'
		| 'invalid-amount'
		| 'invalid-extension'
		| 'invalid-size'
		| 'error',
		message: string
	) => string;
	readonly service?: IFileService;
	readonly disabled?: boolean;
	readonly readOnly?: boolean;
	readonly error?: boolean;
	readonly tabIndex?: number;
	readonly ariaDescribedBy?: string;
	readonly onFocus?: (e: FocusEvent) => void;
	readonly onBlur?: (e: FocusEvent) => void;
	readonly onAutoFocus?: (el: HTMLDivElement | null) => void;
	readonly onSubmit?: () => void;
	readonly onCancel?: () => void;
}) {
	const [dragging, setDragging] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [progress, setProgress] = useState(-1);
	const [error, setError] = useState<'invalid-amount' | 'invalid-extension' | 'invalid-size' | string>('');
	const [errorVisible, makeErrorVisible] = useState(false);
	const inputRef = useRef<HTMLInputElement | null>(undefined);

	const disabled = (
		props.disabled
		|| props.slots.findIndex((slot) => slot.isFrozen || slot.isLocked) > -1
		|| false
	);

	const handleUpload = (files: FileList) => {
		if (!disabled) {
			setProgress(0);
			makeErrorVisible(true);

			props.controller
				.upload(files, props.service, (percent) => setProgress(Num.floor(percent)))
				.then(() => setProgress(-1))
				.catch((err: 'invalid-amount' | 'invalid-extension' | 'invalid-size' | string) => {
					setError(err);
					setProgress(-1);
				});
		}
	};

	const handleDelete = (i: number) => {
		if (props.slots[i].hasValue && !error && progress === -1) {
			setDeleting(true);
			makeErrorVisible(true);

			props.controller
				.delete(i, props.service)
				.then(() => setDeleting(false))
				.catch(() => setDeleting(false));
		}
	};

	const slotsInfo = useMemo(() => ({
		hasValue: props.slots.findIndex((slot) => slot.hasValue) > -1,
		filledSlots: props.slots
			.map((slot, idx) => ({ slot, idx }))
			.filter(({ slot }) => slot.hasValue),
	}), [props.slots]);

	const handleClear = () => {
		if (slotsInfo.hasValue && !error && progress === -1) {
			setDeleting(true);
			makeErrorVisible(true);

			props.controller
				.clear(props.service)
				.then(() => setDeleting(false))
				.catch(() => setDeleting(false));
		}
	};

	return (
		(
			// eslint-disable-next-line max-len
			// eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions,jsx-a11y/no-static-element-interactions
			<div
				className="relative box-border block h-56 w-full overflow-hidden rounded-md border-2 border-skin-primary bg-skin-secondary px-1.5 py-3 font-normal text-skin-secondary-foreground outline-hidden dark:border-skin-primary-dark dark:bg-skin-secondary-dark dark:text-skin-primary-foreground-dark"
				ref={props.onAutoFocus}
				tabIndex={props.tabIndex || 0}
				onFocus={props.onFocus}
				onBlur={props.onBlur}
				onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
					if (e.key === 'Enter') {
						if (!e.shiftKey) {
							if (!error && progress === -1) {
								if (slotsInfo.hasValue && props.onSubmit) {
									e.preventDefault();

									props.onSubmit();
								} else if (inputRef.current) {
									e.preventDefault();

									inputRef.current.click();
								}
							}
						} else if (props.onSubmit) {
							e.preventDefault();

							props.onSubmit();
						}
					} else if (e.key === 'Escape') {
						e.currentTarget.blur();
					} else if (e.key === 'Tab') {
						if (props.onSubmit) {
							e.preventDefault();

							props.onSubmit();
						}
					}
				}}
			>
				{!slotsInfo.hasValue && !error && progress === -1 && (
					<label
						className="absolute inset-1.5 flex cursor-pointer flex-col items-center justify-center"
						onDragEnter={(e: DragEvent<HTMLLabelElement>) => {
							e.preventDefault();
							e.stopPropagation();

							if (!disabled && progress === -1) {
								setDragging(true);
							}
						}}
						onDragOver={(e: DragEvent<HTMLLabelElement>) => {
							e.preventDefault();
							e.stopPropagation();
						}}
						onDragLeave={(e: DragEvent<HTMLLabelElement>) => {
							e.preventDefault();
							e.stopPropagation();

							setDragging(false);
						}}
						onDrop={(e: DragEvent<HTMLLabelElement>) => {
							e.preventDefault();
							e.stopPropagation();

							setDragging(false);

							if (!disabled && progress === -1) {
								const { files } = e.dataTransfer;

								if (files) {
									handleUpload(files);
								}
							}
						}}
					>
						<svg className="mb-1.5 block h-16" fill="currentColor" viewBox="0 0 10240 10240">
							<path
								d="M640 5760l640 0c248,0 461,132 572,354l607 1212c111,222 324,354 572,354l4178 0c248,0 461,-132 572,-354l607 -1212c111,-222 324,-354 572,-354l640 0 0 3520c0,176 -144,320 -320,320l-8320 0c-176,0 -320,-144 -320,-320l0 -3520z"
							/>
							<path
								d="M7887 6400l-160 320 -5214 0 -160 -320 5534 0zm-320 640l-72 143c-57,114 -159,177 -286,177l-4178 0c-127,0 -229,-63 -286,-177l-72 -143 4894 0z"
							/>
							<path
								d="M6853 4293l-1507 1506c-124,124 -328,124 -452,0l-1507 -1506c-124,-125 -187,-277 -187,-453l0 -1159c0,-66 38,-122 99,-147 61,-26 127,-13 174,34l1007 1007 0 -2135c0,-88 72,-160 160,-160l960 0c88,0 160,72 160,160l0 2135 1007 -1007c47,-47 113,-60 174,-34 61,25 99,81 99,147l0 1159c0,176 -63,328 -187,453z"
							/>
						</svg>
						<input
							className="absolute -z-1 size-px overflow-hidden opacity-0"
							ref={(el) => {
								inputRef.current = el;
							}}
							type="file"
							multiple
							tabIndex={-1}
							disabled={disabled}
							aria-describedby={props.ariaDescribedBy}
							onChange={(e) => {
								if (e.target && e.target.files) {
									handleUpload(e.target.files);
								}
							}}
						/>
						<span className="block text-center">{props.labels(dragging ? 'dragging' : 'explanation', '')}</span>
						{props.controller.limit > 0 && (
							<small
								className="block text-center"
							>
								{props.labels('limit', `${props.controller.limit}MB`)}
							</small>
						)}
						{props.controller.allowedExtensions.length > 0 && (
							<small
								className="block text-center"
							>
								{props.labels('extensions', Str.iterateToString(props.controller.allowedExtensions, ', '))}
							</small>
						)}
					</label>
				)}
				{!error && progress !== -1 && (
					<div
						onDragOver={(e: DragEvent<HTMLDivElement>) => {
							e.preventDefault();
						}}
						onDrop={(e: DragEvent<HTMLDivElement>) => {
							e.preventDefault();
						}}
					>
						<div
							className="m-1.5 inline h-4 w-4/5 max-w-[300px] overflow-hidden rounded-[4px] bg-skin-primary/25 dark:bg-skin-primary/25"
						>
							<div
								className="h-4 w-0 bg-skin-primary dark:bg-skin-primary"
								style={{
									width: `${Num.range(progress, 0, 100)}%`,
									transition: 'width 0.5s ease-out',
								}}
							>
								{/* */}
							</div>
						</div>
						<span className="text-center">{props.labels('progress', `${Num.range(progress, 0, 100)}%`)}</span>
					</div>
				)}
				{error && (
					<div
						className="grid h-full place-items-center"
						onDragOver={(e: DragEvent<HTMLDivElement>) => {
							e.preventDefault();
						}}
						onDrop={(e: DragEvent<HTMLDivElement>) => {
							e.preventDefault();
						}}
					>
						<div className="text-center font-bold">{props.labels('invalid-file', '')}</div>
						<div className="mb-1.5 text-center">
							{/* eslint-disable-next-line no-nested-ternary */}
							{error === 'invalid-amount'
								? props.labels('invalid-amount', '')
							// eslint-disable-next-line no-nested-ternary
								: error === 'invalid-extension'
									? props.labels('invalid-extension', '')
									: error === 'invalid-size'
										? props.labels('invalid-size', '')
										: props.labels('error', error)}
						</div>
						<button
							type="button"
							tabIndex={props.tabIndex || 0}
							className="rounded-md border-2 border-skin-primary px-2 py-1.5 dark:border-skin-primary-dark"
							onClick={() => setError('')}
						>
							{props.labels('retry', '')}
						</button>
					</div>
				)}
				{slotsInfo.hasValue && !error && progress === -1 && (
					<div
						className="flex flex-wrap items-center gap-4 px-4"
						onDragOver={(e: DragEvent<HTMLDivElement>) => {
							if (slotsInfo.filledSlots.length === props.controller.maxFiles) e.preventDefault();
						}}
						onDrop={(e: DragEvent<HTMLDivElement>) => {
							if (slotsInfo.filledSlots.length === props.controller.maxFiles) e.preventDefault();
						}}
					>
						{slotsInfo.filledSlots.map(({ slot, idx }) => (
							<div key={slot.reference}>
								{props.controller.isImage(idx) ? (
									<FileThumbnailFabric
										fileSlot={slot}
										idx={idx}
										controller={props.controller}
										service={props.service}
										loading={fileIcon}
										error={fileIcon}
									/>
								) : (
									fileIcon
								)}
								<div>{slot.string}</div>
							</div>
						))}
						<button
							type="button"
							tabIndex={props.tabIndex || 0}
							className="h-10 rounded-md border-2 border-skin-primary px-2 py-1.5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-skin-primary-dark"
							onClick={handleClear}
							disabled={deleting}
						>
							{props.labels('clear', '')}
						</button>
					</div>
				)}
			</div>
		)
	);
}

/* eslint-enable */

@tripetto({
	type: 'node',
	identifier: '@holoenfans/tripetto-block-multi-file-upload',
})
export default class MultiUploadBlock extends MultiFileUpload implements IFormNodeBlock {
	render(props: IFormNodeBlockProps) {
		const slots = Array.from({ length: this.maxFiles }, (_, i) => this.valueOf<string>(`file-${i}`) as IFileSlot);

		return (
			<>
				{props.name}
				{props.description}
				<MultiFileFabric
					controller={this}
					slots={slots}
					service={props.attachments}
					error={props.isFailed}
					tabIndex={props.tabIndex}
					ariaDescribedBy={props.ariaDescribedBy}
					onAutoFocus={props.autoFocus}
					onFocus={props.focus as any}
					onBlur={props.blur as any}
					onSubmit={props.onSubmit}
					labels={(id, message) => {
						switch (id) {
							case 'explanation':
								return 'Choose or drag files here';
							case 'dragging':
								return 'Drop your files now';
							case 'limit':
								return `Size limit: ${message}`;
							case 'extensions':
								return `Allowed extensions: ${message}`;
							case 'retry':
								return 'Try again';
							case 'progress':
								return `Uploading (${message})`;
							case 'delete':
								return 'Delete';
							case 'clear':
								return 'Clear files';
							case 'invalid-file':
								return "This file can't be used.";
							case 'invalid-amount':
								return 'Too many files selected.';
							case 'invalid-extension':
								return 'Extension is not allowed.';
							case 'invalid-size':
								return 'File size is too large.';
							case 'error':
								return `Something went wrong while uploading${(message && ` (${message})`) || ''}`;
							default:
								return message;
						}
					}}
				/>
				<small className="text-sm">
					If your upload seems to be stuck, check the captcha at the bottom of the page.
				</small>
				{props.ariaDescription}
			</>
		);
	}
}
