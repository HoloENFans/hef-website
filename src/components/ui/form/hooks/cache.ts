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

import { ReactNode, useRef } from 'react';
import { IObservableNode, TStatus, each } from '@tripetto/runner';
import { TRunnerStatus } from '@tripetto/runner-react-hook';
import { IFormNodeBlock } from '../interfaces/block';

export interface ICache {
	readonly fetch: (
		create: () => ReactNode,
		node: IObservableNode<IFormNodeBlock>,
		status: TRunnerStatus | TStatus | 'reloading',
		tabIndex: number
	) => ReactNode;

	readonly purge: () => void;
}

export function useCache(): ICache {
	const cacheRef = useRef<ICache>(undefined);

	if (!cacheRef.current) {
		const cache: {
			[node: string]:
			| {
				readonly buffer: ReactNode;
				readonly status: TRunnerStatus | TStatus | 'reloading';
				readonly isPassed: boolean;
				readonly tabIndex: number;
			}
			| undefined;
		} = {};

		cacheRef.current = {
			fetch: (
				create: () => ReactNode,
				node: IObservableNode<IFormNodeBlock>,
				status: TRunnerStatus | TStatus | 'reloading',
				tabIndex: number,
			) => {
				const { key } = node;
				const current = !node.hasChanged() && cache[key];

				if (current && current.status === status
					&& current.isPassed === node.isPassed && current.tabIndex === tabIndex) {
					return current.buffer;
				}

				cache[key] = {
					buffer: create(),
					status,
					isPassed: node.isPassed,
					tabIndex,
				};

				return cache[key]!.buffer;
			},
			purge: () => {
				each(
					cache,
					(_node, key: string) => {
						delete cache[key];
					},
					{
						keys: true,
					},
				);
			},
		};
	}

	return cacheRef.current;
}
