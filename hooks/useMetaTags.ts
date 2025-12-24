
import { useEffect } from 'react';

/**
 * Custom hook to manage document title and meta tags (Open Graph).
 * Provides a client-side "best effort" for SEO and social sharing previews.
 */
export const useMetaTags = (
  title: string,
  description: string,
  image?: string,
  url?: string
) => {
  useEffect(() => {
    // 1. Update Title
    document.title = title;

    // 2. Helper to update or create meta tags
    const setMeta = (attribute: string, attributeValue: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}='${attributeValue}']`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 3. Update Meta Tags
    setMeta('name', 'description', description);
    
    // Open Graph
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    if (image) setMeta('property', 'og:image', image);
    setMeta('property', 'og:url', url || window.location.href);
    setMeta('property', 'og:type', 'website');

    // Twitter Card
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    if (image) setMeta('name', 'twitter:image', image);
    setMeta('name', 'twitter:card', 'summary_large_image');

  }, [title, description, image, url]);
};
