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

import { IRunnerProps as IHookRunnerProps, TRunnerViews } from '@tripetto/runner-react-hook';
import {
	IDefinition, ISnapshot, L10n, TL10n,
} from '@tripetto/runner';
import { MutableRefObject, type JSX } from 'react';
import { IRunnerController } from '../hooks/controller';
import { IBuilderInstance } from './builder';
import { IRunnerSnapshot } from './snapshot';

/* eslint-disable max-len */
export type TRunnerDisplay = 'inline' | 'page';

export type TRunnerPause =
	| {
		readonly recipe: 'email';
		readonly onPause: (
			emailAddress: string,
			snapshot: ISnapshot,
			language: string,
			locale: string,
		) => Promise<void> | boolean | void;
	}
	| ((snapshot: ISnapshot, language: string, locale: string) => Promise<void> | boolean | void);

export interface IRunnerUIProps extends IHookRunnerProps<IRunnerSnapshot> {
	/** Form id */
	readonly id: string;

	/** Specifies the localization (locale and translation) information. */
	readonly l10n?: TL10n;

	/** Specifies the initial view mode of the runner. */
	readonly view?: TRunnerViews;

	/** Specifies the display mode of the runner. */
	readonly display?: TRunnerDisplay;

	/** Specifies a license code for the runner. */
	readonly license?: string;

	/** Removes all Tripetto branding when a valid license is supplied. */
	readonly removeBranding?: boolean;

	/** Specifies a function that is invoked when the runner needs a locale or translation. */
	readonly onL10n?: (l10n: TL10n) => Promise<void>;

	/** Specifies a function that is invoked when the runner wants to reload the definition. */
	readonly onReload?: () => IDefinition | Promise<IDefinition>;

	/** Specifies a function that is invoked when an edit action is requested. */
	readonly onEdit?: (type: 'prologue' | 'epilogue' | 'styles' | 'l10n' | 'block', id?: string) => void;

	/** Specifies a function or recipe that is invoked when the runner wants to pause. */
	readonly onPause?: TRunnerPause;

	/** Specifies a function that is invoked when the runner is "touched" by a user. */
	readonly onTouch?: () => void;

	/** Reference to the runner controller. */
	readonly controller?: MutableRefObject<IRunnerController | undefined>;

	/** Specifies a function that is invoked when the runner controller is available. */
	readonly onController?: (controller: MutableRefObject<IRunnerController>) => void;
}

export type IRunnerProps = Omit<
IRunnerUIProps,
'definition' | 'snapshot' | 'styles' | 'license' | 'l10n' | 'onL10n' | 'l10nNamespace'
> & {
	/** Specifies the definition to run. */
	readonly definition?: IDefinition | Promise<IDefinition | undefined>;

	/** Specifies the snapshot that should be restored. */
	readonly snapshot?: ISnapshot<IRunnerSnapshot> | Promise<ISnapshot<IRunnerSnapshot> | undefined>;

	/** Specifies a license code for the runner. */
	readonly license?: string | Promise<string | undefined>;

	/** Removes all Tripetto branding when a valid license is supplied. */
	readonly removeBranding?: boolean;

	/** Try to store sessions in the local store to preserve persistency on navigation between multiple pages that host the runner. */
	readonly persistent?: boolean;

	/** Specifies the localization information. */
	readonly l10n?: TL10n | Promise<TL10n | undefined>;

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

	/** Specifies a loader that is shown when the runner is loading. */
	readonly loader?: JSX.Element;

	/** Reference to a builder instance to enable live preview for the builder. */
	readonly builder?: MutableRefObject<IBuilderInstance | undefined>;
};
