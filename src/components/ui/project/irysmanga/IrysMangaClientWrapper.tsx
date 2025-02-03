'use client';

import dynamic from 'next/dynamic';

const IrysManga = dynamic(() => import('./IrysManga'), { ssr: false });

export default IrysManga;
