'use client';

import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const useSEO = ({
  title,
  description,
  image,
  url,
  type = 'website',
}: SEOProps) => {
  useEffect(() => {
    const siteName = 'TheMag';
    const fullTitle = title ? `${title} — ${siteName}` : siteName;

    document.title = fullTitle;

    const setMeta = (name: string, content: string, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (description) {
      setMeta('description', description);
      setMeta('og:description', description, 'property');
      setMeta('twitter:description', description, 'name');
    }
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:type', type, 'property');
    setMeta('twitter:card', image ? 'summary_large_image' : 'summary', 'name');
    setMeta('twitter:title', fullTitle, 'name');

    if (image) {
      setMeta('og:image', image, 'property');
      setMeta('twitter:image', image, 'name');
    }
    if (url) {
      setMeta('og:url', url, 'property');
    }

    return () => {
      document.title = siteName;
    };
  }, [title, description, image, url, type]);
};

export default useSEO;
