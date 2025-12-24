
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Loader2, Sparkles, TrendingUp, Minimize2 } from 'lucide-react';
import { Trend, ChatMessage, Language, AIProvider } from '../types';
import { getAIService } from '../services/aiRegistry';
import { SafeMarkdown } from './SafeMarkdown';

interface Props {
  niche: string;
  trends: Trend[];
  language: Language;
  provider: AIProvider;
  uiText: any;
  isOpen: boolean; // Now controlled
  onClose: () => void; // Now controlled
  externalMessage: string | null; // Trigger to send message automatically
  onClearExternalMessage: () => void;
}

export const ResearchChat: React.FC<Props> = ({ 
  niche, 
  trends, 
  language, 
  provider, 
  uiText,
  isOpen,
  onClose,
  externalMessage,
  onClearExternalMessage
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ 
        role: 'model', 
        content: language === 'id'
          ? `Halo! Saya Analis Riset AI Anda. Saya telah menganalisis **${trends.length} tren** terkait "${niche}". Apa yang ingin Anda ketahui lebih dalam?`
          : `Hello! I'm your AI Research Analyst. I've analyzed **${trends.length} trends** regarding "${niche}". What would you like to dig deeper into?`
      }]);
    }
  }, [isOpen]);

  // Handle External Trigger (Deep Dive Questions)
  useEffect(() => {
    if (externalMessage && !isLoading) {
      handleSend(undefined, externalMessage);
      onClearExternalMessage();
    }
  }, [externalMessage]);

  const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: textToSend.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const aiService = getAIService(provider);
      // Don't send the initial greeting to AI to avoid confusion, just user interaction
      const apiHistory = messages.filter((_, i) => i > 0); 
      
      const responseText = await aiService.chatWithResearchAnalyst(apiHistory, userMsg.content, niche, trends, language);
      
      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "I encountered an error connecting to the knowledge base. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!trends || trends.length === 0) return null;

  if (!isOpen) return null;

  return (
    <div className="fixed z-50 bottom-6 left-6 w-full max-w-sm md:max-w-md h-[500px] bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-out] print:hidden">
      
      {/* Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center bg-gradient-to-r from-slate-900 to-indigo-950">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Market Analyst</h3>
              <p className="text-[10px] text-indigo-300 font-mono flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Context: {trends.length} Trends
              </p>
            </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded">
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/80" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-indigo-900/50 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-indigo-400" />
              </div>
            )}
            
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
            }`}>
              <div className="prose prose-invert prose-xs max-w-none">
                <SafeMarkdown 
                  content={msg.content}
                  components={{
                    p: ({node, ...props}) => <p className="mb-1 last:mb-0 leading-relaxed" {...props} />
                  }}
                />
              </div>
            </div>

            {msg.role === 'user' && (
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
                <span className="text-xs text-slate-400">Analyzing market data...</span>
              </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={(e) => handleSend(e)} className="p-3 bg-slate-800 border-t border-slate-700">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about competitors, market size..."
            className="w-full bg-slate-900 border border-slate-700 text-white pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {messages.length === 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
              <button 
                  type="button"
                  onClick={() => handleSend(undefined, "Who are the key players here?")} 
                  className="whitespace-nowrap px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-[10px] text-slate-300 transition-colors"
              >
                  Key Players?
              </button>
              <button 
                  type="button"
                  onClick={() => handleSend(undefined, "What is the biggest risk?")} 
                  className="whitespace-nowrap px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-[10px] text-slate-300 transition-colors"
              >
                  Risks?
              </button>
              <button 
                  type="button"
                  onClick={() => handleSend(undefined, "Explain the revenue potential")} 
                  className="whitespace-nowrap px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded-full text-[10px] text-slate-300 transition-colors"
              >
                  Revenue?
              </button>
            </div>
        )}
      </form>

    </div>
  );
};
