'use client';

import { useEffect } from 'react';

export default function MiniAppDetector() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const isMiniApp = 
      url.pathname.startsWith('/miniapp') ||
      url.searchParams.get('miniApp') === 'true' ||
      // Check if we're in a Farcaster environment
      (window.parent !== window && window.location !== window.parent.location);

    if (isMiniApp) {
      // Dynamically import and initialize the Farcaster SDK
      import('@farcaster/miniapp-sdk').then(({ sdk }) => {
        console.log('Farcaster Mini App SDK loaded');
        // Signal that the Mini App is ready
        sdk.actions.ready();
      }).catch((error) => {
        console.log('Farcaster SDK not available:', error);
      });
    }
  }, []);

  return null; // This component doesn't render anything
}
