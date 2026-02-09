
import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
  className?: string;
  components?: Components;
  onLinkClick?: (href: string) => void;
}

/**
 * A security-hardened wrapper for ReactMarkdown.
 * Automatically sanitizes links to prevent XSS (javascript: protocols).
 * Allows other components to be overridden via props, but enforces safety on <a> tags.
 */
export const SafeMarkdown: React.FC<Props> = ({ content, className, components, onLinkClick }) => {
  const safeComponents: Components = {
    ...components,
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
      <ReactMarkdown
        components={safeComponents}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
