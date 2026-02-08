
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Loader2, Minimize2, Maximize2, Zap } from 'lucide-react';
import { Blueprint, ChatMessage } from '../types';
import { getAIService } from '../services/aiRegistry';
import { toast } from './ToastNotifications';
import { GEMINI_MODELS, OPENAI_MODELS } from '../constants/aiConfig';
import { SafeMarkdown } from './SafeMarkdown';
import { usePreferences } from '../contexts/PreferencesContext';
import { MODAL_DIMENSIONS, MODAL_Z_INDEX, MODAL_ANIMATION } from '../constants/modalConfig';
import { Z_INDEX } from '../constants/zIndex';
import { ANIMATION_TIMING, ANIMATION_EASING } from '../constants/uiConfig';

interface Props {
  blueprint: Blueprint;
  onUpdateBlueprint: (updates: Partial<Blueprint>) => void;
}

export const BlueprintChat: React.FC<Props> = ({ blueprint, onUpdateBlueprint }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { provider, language, uiText } = usePreferences();
  const aiService = getAIService(provider);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { text, updates } = await aiService.sendBlueprintChat(messages, userMsg.content, blueprint, language);
      
      if (updates) {
        onUpdateBlueprint(updates);
        toast.success("Blueprint updated based on your request.");
        
        setMessages(prev => [
          ...prev, 
          { role: 'model', content: text || "✅ I've updated the blueprint with your changes." }
        ]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: text }]);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const modelDisplayName = provider === 'gemini' ? GEMINI_MODELS.BASIC : OPENAI_MODELS.BASIC;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed ${MODAL_Z_INDEX.FLOATING_BUTTON} bottom-6 right-6 p-4 rounded-full shadow-lg transition-all transform hover:scale-105 ${
            isOpen
            ? 'bg-slate-700 text-slate-300'
            : 'bg-emerald-600 text-white shadow-emerald-500/30'
        } print:hidden`}
        aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className={`fixed ${Z_INDEX.OVERLAY} bottom-24 right-6 ${MODAL_DIMENSIONS.CHAT.width} ${MODAL_DIMENSIONS.CHAT.height} bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-[slideUp_${ANIMATION_TIMING.SLIDE_UP}s_${ANIMATION_EASING.DEFAULT}] print:hidden`}>
          <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-2">
               <Bot className="w-5 h-5 text-emerald-400" />
               <div>
                 <h3 className="font-bold text-white text-sm">Blueprint Editor AI</h3>
                 <p className="text-xs text-emerald-400 font-mono">
                   {modelDisplayName}
                 </p>
               </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white" aria-label="Minimize Chat">
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50" ref={scrollRef}>
            {messages.length === 0 && (
              <div className="text-center text-slate-500 mt-10">
                <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Ask me to modify this blueprint.</p>
                <div className="mt-4 flex flex-col gap-2">
                   <button onClick={() => { setInput("Change revenue model to Subscription"); }} className="text-xs bg-slate-800 hover:bg-slate-700 p-2 rounded-lg text-slate-300 transition-colors border border-slate-700">"Change revenue model to Subscription"</button>
                   <button onClick={() => { setInput("Add SEO to marketing strategy"); }} className="text-xs bg-slate-800 hover:bg-slate-700 p-2 rounded-lg text-slate-300 transition-colors border border-slate-700">"Add SEO to marketing strategy"</button>
                </div>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-900/50 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
                
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'}`}>
                  <div className="prose prose-invert prose-xs max-w-none">
                    <SafeMarkdown content={msg.content} components={{ p: ({node, ...props}) => <p className="mb-1 last:mb-0" {...props} /> }} />
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
                 <div className="w-8 h-8 rounded-full bg-emerald-900/50 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-emerald-400" />
                 </div>
                 <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                    <span className="text-xs text-slate-400">Processing changes...</span>
                 </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="p-3 bg-slate-800 border-t border-slate-700">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask to change something..."
                className="w-full bg-slate-900 border border-slate-700 text-white pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                aria-label="Message Blueprint Editor"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1.5 p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

        </div>
      )}
    </>
  );
};
