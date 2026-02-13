
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, X, Loader2, Sparkles, User } from 'lucide-react';
import { ChatMessage, Trend } from '../types';
import { getAIService } from '../services/aiRegistry';
import { usePreferences } from '../contexts/PreferencesContext';
import { SafeMarkdown } from './SafeMarkdown';
import { CHAT_ROLES } from '../constants/chatRoles';
import { DIMENSIONS } from '../constants/dimensionConfig';
import { TEXT_TRUNCATION } from '../constants/displayLimits';

interface Props {
  niche: string;
  trends: Trend[];
  isOpen: boolean;
  onClose: () => void;
  externalMessage: string | null;
  onClearExternalMessage: () => void;
}

export const ResearchChat: React.FC<Props> = ({
  niche,
  trends,
  isOpen,
  onClose,
  externalMessage,
  onClearExternalMessage
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { provider, language } = usePreferences();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && externalMessage) {
      handleSend(undefined, externalMessage);
      onClearExternalMessage();
    }
  }, [externalMessage, isOpen]);

  const handleSend = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();
    const textToSend = overrideText || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = { role: CHAT_ROLES.USER, content: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const aiService = getAIService(provider);
      // Filter out system messages or keep conversation history appropriate for the API
      // We pass the full message history to the service, it handles formatting
      const responseText = await aiService.chatWithResearchAnalyst(messages, userMsg.content, niche, trends, language);
      setMessages(prev => [...prev, { role: CHAT_ROLES.MODEL, content: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: CHAT_ROLES.MODEL, content: "I'm having trouble analyzing the data right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 bottom-24 left-6 w-full max-w-sm md:max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-out] print:hidden" style={{ height: DIMENSIONS.modal.chatHeight }}>
      {/* Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
             <Sparkles className="w-5 h-5 text-white" />
           </div>
           <div>
             <h3 className="font-bold text-white text-sm">Market Analyst AI</h3>
             <p className="text-xs text-indigo-400 font-mono">
                Context: {niche.slice(0, TEXT_TRUNCATION.niche)}{niche.length > TEXT_TRUNCATION.niche ? '...' : ''}
             </p>
           </div>
        </div>
         <button onClick={onClose} className="text-slate-300 hover:text-white" aria-label="Close Chat">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="text-center text-slate-500 mt-10">
            <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Ask me about these market trends.</p>
            <p className="text-xs mt-2 opacity-60">I have access to the {trends.length} trends identified.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === CHAT_ROLES.USER ? 'justify-end' : 'justify-start'}`}>
            {msg.role === CHAT_ROLES.MODEL && (
              <div className="w-8 h-8 rounded-full bg-indigo-900/50 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
            )}

            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === CHAT_ROLES.USER ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'}`}>
              <div className="prose prose-invert prose-xs max-w-none">
                <SafeMarkdown content={msg.content} />
              </div>
            </div>

            {msg.role === CHAT_ROLES.USER && (
              <div className="w-8 h-8 rounded-full bg-blue-900/50 border border-blue-500/20 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-blue-400" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
             <div className="w-8 h-8 rounded-full bg-indigo-900/50 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-400" />
             </div>
             <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                <span className="text-xs text-slate-400">Analyzing trends...</span>
             </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={(e) => handleSend(e)} className="p-3 bg-slate-800 border-t border-slate-700">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            aria-label="Ask a research question"
            className="w-full bg-slate-900 border border-slate-700 text-white pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
