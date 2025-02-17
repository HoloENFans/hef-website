'use client';

import dynamic from 'next/dynamic';

const PixiWrapper = dynamic(() => import('./PixiWrapper'), {
	ssr: false,
});

export default PixiWrapper;
