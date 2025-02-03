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

import { L10n, NodeBlock } from '@tripetto/runner';
import { type FocusEvent, ReactNode, type JSX } from 'react';
import { TOverlayContext } from '@tripetto/runner-fabric/overlay';
import { IRunnerAttachments } from '@tripetto/runner-react-hook';

export interface IFormNodeBlock extends NodeBlock {
	readonly required?: boolean;
	readonly marginAroundBlock?: boolean;
	readonly hideRequiredIndicatorFromName?: boolean;
	readonly render?: (props: IFormNodeBlockProps) => ReactNode;
}

export interface IFormNodeBlockProps {
	readonly id: string;
	readonly l10n: L10n.Namespace;
	readonly overlay: TOverlayContext;
	readonly name: JSX.Element | undefined;
	readonly description: JSX.Element | undefined;
	readonly explanation: JSX.Element | undefined;
	readonly label: JSX.Element | undefined;
	readonly placeholder: string;
	readonly tabIndex: number;
	readonly isFailed: boolean;
	readonly ariaDescribedBy: string | undefined;
	readonly ariaDescription: JSX.Element | undefined;
	readonly autoFocus: (element: HTMLElement | null) => void;
	readonly onSubmit: (() => void) | undefined;
	readonly focus: ((event: FocusEvent) => void) | undefined;
	readonly blur: ((event: FocusEvent) => void) | undefined;
	readonly attachments: IRunnerAttachments | undefined;
	readonly markdownifyToJSX: (md: string, lineBreaks?: boolean) => JSX.Element;
	readonly markdownifyToURL: (md: string) => string;
	readonly markdownifyToImage: (md: string) => string;
	readonly markdownifyToString: (md: string) => string;
}
