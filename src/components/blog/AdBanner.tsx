'use client';

import { useEffect, useState } from 'react';

interface AdBannerProps {
  position: string;
  className?: string;
}

interface Ad {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
}

const AdBanner = ({ position, className = '' }: AdBannerProps) => {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch(`/api/ads?position=${position}`);
        const data = await res.json();
        setAd(data.ad);
      } catch {
        // Ignore errors
      }
    };
    fetchAd();
  }, [position]);

  if (!ad) return null;

  const handleClick = async () => {
    try {
      await fetch('/api/ads/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId: ad.id }),
      });
    } catch {
      // Ignore errors
    }
  };

  return (
    <div className={`text-center ${className}`}>
      <a
        href={ad.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
      >
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="mx-auto rounded-lg max-w-full"
        />
      </a>
      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
        Advertisement
      </p>
    </div>
  );
};

export default AdBanner;
