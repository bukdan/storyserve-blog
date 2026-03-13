import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdBannerProps {
  position: string;
  className?: string;
}

import { useState } from 'react';

interface Ad {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
}

const AdBanner = ({ position, className = '' }: AdBannerProps) => {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('ads')
        .select('id, title, image_url, link_url, ad_slots!inner(position)')
        .eq('active', true)
        .eq('ad_slots.position', position)
        .lte('start_date', now)
        .gte('end_date', now)
        .limit(1)
        .maybeSingle();

      if (data) {
        setAd({ id: data.id, title: data.title, image_url: data.image_url, link_url: data.link_url });
        // Track impression
        supabase.from('ad_impressions').insert({ ad_id: data.id }).then(() => {});
      }
    };
    fetchAd();
  }, [position]);

  if (!ad) return null;

  const handleClick = () => {
    supabase.from('ad_clicks').insert({ ad_id: ad.id }).then(() => {});
  };

  return (
    <div className={`text-center ${className}`}>
      <a href={ad.link_url} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
        <img src={ad.image_url} alt={ad.title} className="mx-auto rounded-lg max-w-full" />
      </a>
      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">Advertisement</p>
    </div>
  );
};

export default AdBanner;
