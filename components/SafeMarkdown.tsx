import React, { Suspense, lazy, useState, useEffect } from 'react';
import type { Components } from 'react-markdown';
import { FONT_SIZES } from '../config';

// Lazy load ReactMarkdown to reduce initial bundle size
const ReactMarkdown = lazy(() => import('react-markdown'));

interface Props {
  content: string;
  className?: string;
  components?: Components;
  onLinkClick?: (href: string) => void;
}

// Simple loading fallback that doesn't add visual clutter
const MarkdownFallback = () => (
  <div className="animate-pulse space-y-2">
    <div className="h-4 bg-slate-800/50 rounded w-3/4"></div>
    <div className="h-4 bg-slate-800/50 rounded w-full"></div>
    <div className="h-4 bg-slate-800/50 rounded w-5/6"></div>
  </div>
);

/**
 * A security-hardened wrapper for ReactMarkdown.
 * Automatically sanitizes links to prevent XSS (javascript: protocols).
 * Uses dynamic imports to reduce initial bundle size.
 */
export const SafeMarkdown: React.FC<Props> = ({ content, className, components, onLinkClick }) => {
  const [remarkPlugins, setRemarkPlugins] = useState<any[]>([]);

  // Dynamically load remark-gfm plugin
  useEffect(() => {
    let isMounted = true;
    import('remark-gfm').then((mod) => {
      if (isMounted) {
        setRemarkPlugins([mod.default]);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const safeComponents: Components = {
    ...components,
    table: ({ ...props }) => (
      <div className="overflow-x-auto my-6 rounded-xl border border-slate-800">
        <table className="w-full border-collapse text-sm text-left" {...props} />
      </div>
    ),
    thead: ({ ...props }) => (
      <thead className="bg-slate-800/50 text-slate-200 border-b border-slate-700" {...props} />
    ),
    th: ({ ...props }) => (
      <th className={`px-4 py-3 font-bold uppercase tracking-wider ${FONT_SIZES['2xs']}`} {...props} />
    ),
    td: ({ ...props }) => (
      <td className="px-4 py-3 border-b border-slate-800/50 text-slate-300" {...props} />
    ),
    tr: ({ ...props }) => (
      <tr className="hover:bg-slate-800/30 transition-colors even:bg-slate-900/30" {...props} />
    ),
    // Enforce safe link rendering, overriding any passed 'a' component if necessary
    a: ({ href, ...props }) => {
      // Whitelist allowed protocols
      const isSafe = href && (
        href.startsWith('http://') || 
        href.startsWith('https://') || 
        href.startsWith('mailto:') || 
        href.startsWith('tel:') || 
        href.startsWith('#')
      );
      
      const safeHref = isSafe ? href : undefined;
      const target = isSafe && href?.startsWith('#') ? undefined : '_blank';
      
      return (
        <a
          href={safeHref}
          target={target}
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
          onClick={(e) => {
             if (!isSafe) {
               e.preventDefault();
               console.warn(`Blocked unsafe link navigation: ${href}`);
             } else if (onLinkClick && href) {
               onLinkClick(href);
             }
          }}
          {...props}
        />
      );
    }
  };

  return (
    <div className={className}>
      <Suspense fallback={<MarkdownFallback />}>
        <ReactMarkdown
          components={safeComponents}
          remarkPlugins={remarkPlugins}
        >
          {content}
        </ReactMarkdown>
      </Suspense>
    </div>
  );
};
