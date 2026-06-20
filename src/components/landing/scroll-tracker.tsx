'use client';

import { useEffect } from 'react';
import { ANALYTICS_EVENTS, trackEvent } from '@/lib/analytics/events';

export function ScrollTracker() {
  useEffect(() => {
    let fired = false;
    const onScroll = () => {
      if (fired) return;
      const scrollPercent =
        (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
      if (scrollPercent >= 0.75) {
        fired = true;
        trackEvent(ANALYTICS_EVENTS.SCROLL_75);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return null;
}
