'use client';

import dynamic from 'next/dynamic';

const Tabs = dynamic(() => import('./Tabs'), {
	ssr: false,
});

export default Tabs;
