import React, { type JSX } from 'react';
import {
	ArrowsPointingOutIcon,
	ArrowLongDownIcon,
	ArrowLongUpIcon,
	ArrowLongLeftIcon,
	ArrowLongRightIcon,
} from '@heroicons/react/24/solid';
import {
	ArrowRightIcon,
	ArrowLeftIcon,
	SunIcon,
	MoonIcon,
	ArrowsUpDownIcon,
	Bars2Icon,
	MinusIcon,
	DocumentIcon,
} from '@heroicons/react/24/outline';
import useTranslation from '@/lib/i18n/client';
import classNames from 'classnames';
import { ReaderSetting } from './utils/types';
import { getNextOption } from './utils/helper';
import { ShowHeaderIcon, HideHeaderIcon } from './HeaderIcons';

interface IProps {
	value: ReaderSetting;
	valueList: ReadonlyArray<ReaderSetting>;
	setValue: React.Dispatch<React.SetStateAction<ReaderSetting>>;
	onClick?: () => void;
	label?: string;
	disabled?: boolean;
}

type SettingIcons = {
	[key in ReaderSetting]: JSX.Element | null;
};

const settingIcons: SettingIcons = {
	long: <ArrowsUpDownIcon className="setting-icon" />,
	height: (
		<div className="relative h-full min-h-[20px] w-[20px]">
			<ArrowLongUpIcon className="setting-icon absolute left-0 top-0" />
			<ArrowLongDownIcon className="setting-icon absolute left-0 top-0" />
		</div>
	),
	width: (
		<div className="relative h-full min-h-[20px] w-[20px]">
			<ArrowLongLeftIcon className="setting-icon absolute left-0 top-0" />
			<ArrowLongRightIcon className="setting-icon absolute left-0 top-0" />
		</div>
	),
	original: <DocumentIcon className="setting-icon" />,
	'fit-both': <ArrowsPointingOutIcon className="setting-icon" />,
	ltr: <ArrowRightIcon className="setting-icon" />,
	rtl: <ArrowLeftIcon className="setting-icon" />,
	'header-hidden': <HideHeaderIcon />,
	'header-shown': <ShowHeaderIcon />,
	'progress-hidden': <MinusIcon className="setting-icon" />,
	'progress-shown': <Bars2Icon className="setting-icon" />,
	light: <SunIcon className="setting-icon" />,
	dark: <MoonIcon className="setting-icon" />,
	en: null,
	jp: null,
};

export default function SettingButton({
	value,
	valueList,
	setValue,
	label,
	disabled,
	onClick,
}: IProps) {
	const { t } = useTranslation('reader');

	return (
		<button
			className={classNames('button flex-1', {
				'justify-between': settingIcons[value] !== null,
				'justify-center': settingIcons[value] === null,
			})}
			type="button"
			disabled={disabled}
			onClick={onClick ?? (() => setValue((prev) => getNextOption(prev, valueList)))}
		>
			<div>
				{label ? `${t(label)}: ` : ''}
				{t(value)}
			</div>
			{settingIcons[value]}
		</button>
	);
}
