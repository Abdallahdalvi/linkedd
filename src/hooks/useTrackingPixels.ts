import { useEffect, useCallback } from 'react';

interface TrackingConfig {
  metaPixelId?: string | null;
  googleAdsId?: string | null;
}

/**
 * Injects Meta Pixel and Google Ads (gtag) scripts into the page
 * and provides event tracking functions.
 */
export function useTrackingPixels({ metaPixelId, googleAdsId }: TrackingConfig) {
  // Inject Meta Pixel
  useEffect(() => {
    if (!metaPixelId) return;

    // Avoid duplicate injection
    if (document.getElementById('meta-pixel-script')) return;

    const script = document.createElement('script');
    script.id = 'meta-pixel-script';
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window,document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${metaPixelId}');
      fbq('track', 'PageView');
    `;
    document.head.appendChild(script);

    // Add noscript fallback
    const noscript = document.createElement('noscript');
    noscript.id = 'meta-pixel-noscript';
    noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1"/>`;
    document.head.appendChild(noscript);

    return () => {
      document.getElementById('meta-pixel-script')?.remove();
      document.getElementById('meta-pixel-noscript')?.remove();
    };
  }, [metaPixelId]);

  // Inject Google Ads (gtag.js)
  useEffect(() => {
    if (!googleAdsId) return;

    // Avoid duplicate injection
    if (document.getElementById('gtag-script')) return;

    const gtagScript = document.createElement('script');
    gtagScript.id = 'gtag-script';
    gtagScript.async = true;
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`;
    document.head.appendChild(gtagScript);

    const configScript = document.createElement('script');
    configScript.id = 'gtag-config-script';
    configScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${googleAdsId}');
    `;
    document.head.appendChild(configScript);

    return () => {
      document.getElementById('gtag-script')?.remove();
      document.getElementById('gtag-config-script')?.remove();
    };
  }, [googleAdsId]);

  // Track link click events
  const trackClick = useCallback((blockTitle?: string | null) => {
    if (metaPixelId && typeof (window as any).fbq === 'function') {
      (window as any).fbq('trackCustom', 'LinkClick', { content_name: blockTitle || 'link' });
    }
    if (googleAdsId && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'click', {
        event_category: 'link',
        event_label: blockTitle || 'link',
      });
    }
  }, [metaPixelId, googleAdsId]);

  // Track lead submission events
  const trackLead = useCallback((blockTitle?: string | null) => {
    if (metaPixelId && typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'Lead', { content_name: blockTitle || 'lead_form' });
    }
    if (googleAdsId && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'generate_lead', {
        event_category: 'lead',
        event_label: blockTitle || 'lead_form',
      });
    }
  }, [metaPixelId, googleAdsId]);

  return { trackClick, trackLead };
}
