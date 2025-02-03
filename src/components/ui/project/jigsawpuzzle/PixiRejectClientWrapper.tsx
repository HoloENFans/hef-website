'use client';

import dynamic from 'next/dynamic';

const PixiRejectWrapper = dynamic(() => import('./PixiRejectWrapper'), {
	ssr: false,
});

export default PixiRejectWrapper;
