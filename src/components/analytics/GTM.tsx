'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useRef } from 'react';
import { pushToDataLayer } from '@/lib/gtm';

/**
 * GTM Component - Production-grade Google Tag Manager integration.
 * Injects the base GTM script and handles SPA pageview tracking.
 */
export default function GTM() {
  const pathname = usePathname();
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const isFirstRender = useRef(true);

  // SPA Pageview Tracking
  useEffect(() => {
    // Avoid double firing on initial mount if GTM base script already handles it
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!pathname || !gtmId) return;

    pushToDataLayer({
      event: 'page_view',
      page_path: pathname,
    });
  }, [pathname, gtmId]);

  if (!gtmId) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[GTM] Missing NEXT_PUBLIC_GTM_ID environment variable.');
    }
    return null;
  }

  return (
    <Script
      id="gtm-base"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `,
      }}
    />
  );
}

/**
 * GTMNoScript Component - Fallback for users with JavaScript disabled.
 * Should be placed immediately after the opening <body> tag.
 */
export function GTMNoScript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  
  if (!gtmId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}
