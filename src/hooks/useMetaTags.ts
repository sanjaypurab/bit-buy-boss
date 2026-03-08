import { useEffect } from 'react';

interface MetaTagsOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export const useMetaTags = ({ title, description, image, url }: MetaTagsOptions) => {
  useEffect(() => {
    const originalTitle = document.title;
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) ||
               document.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(property.startsWith('og:') || property.startsWith('twitter:') ? 'property' : 'name', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (title) {
      document.title = `${title} — BitBuyBoss`;
      setMeta('og:title', title);
      setMeta('twitter:title', title);
    }
    if (description) {
      setMeta('description', description);
      setMeta('og:description', description);
      setMeta('twitter:description', description);
    }
    if (image) {
      setMeta('og:image', image);
      setMeta('twitter:image', image);
    }
    if (url) {
      setMeta('og:url', url);
    }

    return () => {
      document.title = originalTitle;
    };
  }, [title, description, image, url]);
};
