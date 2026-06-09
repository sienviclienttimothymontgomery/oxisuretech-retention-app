'use client'

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { captureAttribution } from '@/utils/analytics';

function TrackerContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams) {
      captureAttribution(searchParams);
    }
  }, [searchParams]);

  return null;
}

export default function AttributionTracker() {
  return (
    <Suspense fallback={null}>
      <TrackerContent />
    </Suspense>
  );
}
