
import React, { useState, useCallback } from 'react';
import { Check, Copy } from 'lucide-react';
import { SafeMarkdown } from '../SafeMarkdown';
import { usePreferences } from '../../contexts/PreferencesContext';
import { toast } from '../ToastNotifications';
import { UI_TIMING } from '../../constants/uiConfig';

interface Props {
  content: string;
  affiliateMap: Map<string, string>;
  onAffiliateClick: (id: string) => void;
}

export const BlueprintMarkdownViewer: React.FC<Props> = React.memo(({ content, affiliateMap, onAffiliateClick }) => {
  const { uiText } = usePreferences();
  const [copied, setCopied] = useState(false);

  const handleCopyMarkdown = useCallback(() => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.info("Full guide copied to clipboard");
    setTimeout(() => setCopied(false), UI_TIMING.COPY_FEEDBACK_DURATION);
  }, [content]);

  const handleLinkClick = useCallback((href: string) => {
    if (affiliateMap.has(href)) {
      onAffiliateClick(affiliateMap.get(href)!);
    }
  }, [affiliateMap, onAffiliateClick]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 md:p-10 mb-20 print:border-none print:bg-white print:text-black">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h3 className="text-xl font-bold text-white">Full Implementation Guide</h3>
        <button 
          onClick={handleCopyMarkdown}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? uiText.copied : uiText.copy}
        </button>
      </div>
      <article className="prose prose-invert prose-emerald max-w-none print:prose-black">
        <SafeMarkdown 
           content={content}
           onLinkClick={handleLinkClick}
           components={{
             a: ({node, href, ...props}) => {
               return (
                 <a 
                   href={href} 
                   className="text-emerald-400 hover:text-emerald-300 font-bold" 
                   target="_blank"
                   rel="noopener noreferrer"
                   {...props} 
                 />
               );
             }
           }}
        />
      </article>
    </div>
  );
});
