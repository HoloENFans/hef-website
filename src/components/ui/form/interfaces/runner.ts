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
	IDefinition, Instance, ISnapshot, L10n, TL10n,
} from '@tripetto/runner';
import { IRunnerAttachments, TRunnerViews } from '@tripetto/runner-react-hook';
import { TRunnerDisplay, TRunnerPause } from './props';
import { IRunnerSnapshot } from './snapshot';
import { IBuilderInstance } from './builder';

/* eslint-disable max-len */
export interface IRunner {
	/** Specifies the parent element for the runner. */
	readonly element?: HTMLElement | null;

	/** Specifies the definition to run. */
	readonly definition?: IDefinition | Promise<IDefinition | undefined>;

	/** Specifies the snapshot that should be restored. */
	readonly snapshot?: ISnapshot<IRunnerSnapshot> | Promise<ISnapshot<IRunnerSnapshot> | undefined>;

	/** Specifies the localization (locale and translation) information. */
	readonly l10n?: TL10n | Promise<TL10n | undefined>;

	/** Specifies the initial view mode of the runner. */
	readonly view?: TRunnerViews;

	/** Specifies the display mode of the runner. */
	readonly display?: TRunnerDisplay;

	/** Try to store sessions in the local store to preserve persistency on navigation between multiple pages that host the runner. */
	readonly persistent?: boolean;

	/** Specifies a license code for the runner. */
	readonly license?: string | Promise<string | undefined>;

	/** Removes all Tripetto branding when a valid license is supplied. */
	readonly removeBranding?: boolean;

	/** Specifies the attachments handler. */
	readonly attachments?: IRunnerAttachments;

	/** Specifies the preferred language (when no language is specified in the definition). */
	readonly language?: string;

	/** Provides locale information. */
	readonly locale?: L10n.ILocale | ((locale: string) => L10n.ILocale | Promise<L10n.ILocale | undefined> | undefined);

	/** Provides translations. */
	readonly translations?:
	| L10n.TTranslation
	| L10n.TTranslation[]
	| ((
		language: string,
		name: string,
		version: string
	) => L10n.TTranslation | L10n.TTranslation[] | Promise<L10n.TTranslation | L10n.TTranslation[] | undefined> | undefined);

	/** Reference to a builder instance to enable live preview for the builder. */
	readonly builder?: IBuilderInstance;

	/** Specifies a function that is invoked when the runner is ready. */
	readonly onReady?: (instance?: Instance) => void;

	/** Specifies a function that is invoked when the runner is touched by a user. */
	readonly onTouch?: () => void;

	/** Specifies a function that is invoked when the user performs an action. */
	readonly onAction?: (
		type: 'start' | 'stage' | 'unstage' | 'focus' | 'blur-sm' | 'pause' | 'complete',
		definition: {
			readonly fingerprint: string;
			readonly name: string;
		},
		block?: {
			readonly id: string;
			readonly name: string;
			readonly alias?: string;
		}
	) => void;

	/** Invoked when data can be imported into the instance. */
	readonly onImport?: (instance: Instance) => void;

	/** Invoked when there is a change. */
	readonly onChange?: (instance: Instance) => void;

	/** Invoked when there is a data change. */
	readonly onData?: (instance: Instance) => void;

	/** Specifies a function that is invoked when the runner wants to pause. */
	readonly onPause?: TRunnerPause;

	/** Specifies a function that is invoked when the runner submits data. */
	readonly onSubmit?: (
		instance: Instance,
		language: string,
		locale: string,
		namespace?: string
	) => Promise<string | undefined> | boolean | void;

	/** Invoked when the runner is completed (after the data is submitted). */
	readonly onComplete?: (instance: Instance, id?: string) => void;

	/** Invoked when the runner wants to reload the definition. */
	readonly onReload?: () => IDefinition | Promise<IDefinition>;

	/** Specifies a function that is invoked when an edit action is requested. */
	readonly onEdit?: (type: 'prologue' | 'epilogue' | 'styles' | 'l10n' | 'block', id?: string) => void;

	/** Specifies a function that is invoked when the runner is destroyed. */
	readonly onDestroy?: () => void;
}
