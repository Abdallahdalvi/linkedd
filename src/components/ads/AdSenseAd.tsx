import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  fullWidth?: boolean;
  className?: string;
}

export const AdSenseAd = ({ 
  adSlot, 
  adFormat = 'auto', 
  fullWidth = true,
  className = '' 
}: AdSenseAdProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (isLoaded.current) return;
    
    try {
      if (typeof window !== 'undefined' && adRef.current) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isLoaded.current = true;
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  // Your AdSense client ID
  const adClient = 'ca-pub-4440599855987610';

  // AdSense is always configured now
  if (!adClient) {
    return null;
  }

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={{ display: 'block' }}
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidth}
    />
  );
};

export default AdSenseAd;
