
import React, { useState, useRef, useEffect } from 'react';
import { AgentProfile, ChatMessage } from '../types';
import { getAIService } from '../services/aiRegistry';
import { Send, Bot, Loader2, Sparkles, PlayCircle } from 'lucide-react';
import { SafeMarkdown } from './SafeMarkdown';
import { Modal } from './ui/Modal';
import { usePreferences } from '../contexts/PreferencesContext';
import { CHAT_ROLES } from '../constants/chatRoles';
import { DIMENSIONS } from '../constants/dimensionConfig';

interface Props {
  agent: AgentProfile;
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string | null;
}

export const AgentChatModal: React.FC<Props> = ({ agent, isOpen, onClose, initialMessage }) => {
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
    if (isOpen) {
      if (initialMessage) {
        setMessages([]); 
        handleSend(undefined, initialMessage);
      } else if (messages.length === 0) {
        setMessages([{ 
          role: CHAT_ROLES.MODEL, 
          content: language === 'id' 
            ? `Halo! Saya ${agent.name}, ${agent.role} Anda. Apa yang bisa saya bantu?` 
            : `Hello! I am ${agent.name}, your ${agent.role}. How can I assist you today?`
        }]);
      }
    }
  }, [isOpen, initialMessage]);

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
      const apiHistory = messages.filter(m => m.role !== CHAT_ROLES.MODEL || messages.indexOf(m) > 0); 
      const responseText = await aiService.chatWithAgent(apiHistory, userMsg.content, agent, language);
      setMessages(prev => [...prev, { role: CHAT_ROLES.MODEL, content: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: CHAT_ROLES.MODEL, content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const Header = (
    <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700"><Bot className="w-6 h-6 text-pink-500" /></div>
        <div><h3 className="font-bold text-white flex items-center gap-2">{agent.name} {initialMessage && <span className="text-[10px] bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-mono flex items-center gap-1"><PlayCircle className="w-3 h-3" /> WORKING</span>}</h3><p className="text-xs text-slate-400">{agent.role}</p></div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={Header} className="max-w-lg" style={{ height: DIMENSIONS.modal.chatHeightMd }}>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/30" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-pink-900/20 border border-pink-500/20 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-pink-400" /></div>}
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'}`}><div className="prose prose-invert prose-xs max-w-none"><SafeMarkdown content={msg.content} /></div></div>
            </div>
          ))}
          {isLoading && (<div className="flex gap-3 justify-start"><div className="w-8 h-8 rounded-full bg-pink-900/20 border border-pink-500/20 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-pink-400" /></div><div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2"><Loader2 className="w-4 h-4 text-pink-400 animate-spin" /><span className="text-xs text-slate-400">{initialMessage && messages.length === 1 ? 'Executing task...' : 'Thinking...'}</span></div></div>)}
        </div>
        <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
            <div className="relative"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Message ${agent.name}...`} aria-label={`Message ${agent.name}`} className="w-full bg-slate-900 border border-slate-700 text-white pl-4 pr-12 py-3 rounded-xl focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all" autoFocus /><button type="submit" disabled={!input.trim() || isLoading} className="absolute right-2 top-1.5 p-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors" aria-label="Send message"><Send className="w-4 h-4" /></button></div>
           <div className="mt-2 flex items-center gap-1 justify-center text-[10px] text-slate-500"><Sparkles className="w-3 h-3" /><span>Interacting with {agent.name}</span></div>
        </form>
      </div>
    </Modal>
  );
};
