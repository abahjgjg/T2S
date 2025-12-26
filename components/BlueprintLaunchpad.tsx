

import React, { useState } from 'react';
import { LaunchAssets, Blueprint, BusinessIdea, Language, AIProvider } from '../types';
import { getAIService } from '../services/aiRegistry';
import { Rocket, Copy, Check, RefreshCcw, Loader2, Layout, Twitter, Mail, ExternalLink, Megaphone, Code, Calendar, FileText } from 'lucide-react';
import { toast } from './ToastNotifications';

interface Props {
  idea: BusinessIdea;
  blueprint: Blueprint;
  assets?: LaunchAssets;
  onUpdateBlueprint: (updates: Partial<Blueprint>) => void;
  uiText: any;
}

export const BlueprintLaunchpad: React.FC<Props> = ({ idea, blueprint, assets, onUpdateBlueprint, uiText }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isGeneratingCalendar, setIsGeneratingCalendar] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'landing' | 'social' | 'email' | 'code' | 'calendar'>('landing');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const provider = (localStorage.getItem('trendventures_provider') as AIProvider) || 'gemini';
      const lang = (localStorage.getItem('trendventures_lang') as Language) || 'id';
      const aiService = getAIService(provider);
      
      const newAssets = await aiService.generateLaunchAssets(idea, blueprint, lang);
      onUpdateBlueprint({ launchAssets: newAssets });
      toast.success("Launch Assets Generated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate launch assets.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCode = async () => {
    if (!assets) return;
    setIsGeneratingCode(true);
    try {
      const provider = (localStorage.getItem('trendventures_provider') as AIProvider) || 'gemini';
      const lang = (localStorage.getItem('trendventures_lang') as Language) || 'id';
      const aiService = getAIService(provider);
      
      const code = await aiService.generateLandingPageCode(idea, assets, lang);
      onUpdateBlueprint({ 
        launchAssets: { ...assets, landingPageCode: code } 
      });
      toast.success("React Code Generated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate code.");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleGenerateCalendar = async () => {
    if (!assets) return;
    setIsGeneratingCalendar(true);
    try {
      const provider = (localStorage.getItem('trendventures_provider') as AIProvider) || 'gemini';
      const lang = (localStorage.getItem('trendventures_lang') as Language) || 'id';
      const aiService = getAIService(provider);
      
      const calendar = await aiService.generateContentCalendar(idea, blueprint, lang);
      onUpdateBlueprint({ 
        launchAssets: { ...assets, contentCalendar: calendar } 
      });
      toast.success("Content Calendar Generated!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate calendar.");
    } finally {
      setIsGeneratingCalendar(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (isGenerating) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] mb-8 animate-[fadeIn_0.3s_ease-out]">
        <div className="w-16 h-16 bg-emerald-900/20 rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full animate-ping"></div>
          <Rocket className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Preparing Launch Pad...</h3>
        <p className="text-slate-400 max-w-sm">
          Writing high-converting copy for your landing page, social media, and cold outreach.
        </p>
      </div>
    );
  }

  if (!assets) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-8 text-center animate-[fadeIn_0.3s_ease-out] print:break-inside-avoid">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
          <Megaphone className="w-8 h-8 text-indigo-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Marketing Launchpad</h3>
        <p className="text-slate-400 max-w-md mx-auto mb-6">
          Ready to go to market? Generate instant copy for your landing page, social launch, and email outreach.
        </p>
        <button 
          onClick={handleGenerate}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all hover:scale-105 flex items-center gap-2 mx-auto shadow-lg shadow-indigo-900/20"
        >
          <Rocket className="w-5 h-5" /> Generate Assets
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 print:break-inside-avoid animate-[fadeIn_0.3s_ease-out]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Rocket className="w-5 h-5 text-indigo-400" /> Marketing Launchpad
        </h3>
        <button 
          onClick={handleGenerate}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
        >
          <RefreshCcw className="w-3 h-3" /> Regenerate
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-800 mb-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('landing')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'landing' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Layout className="w-4 h-4" /> Landing Page
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'social' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Twitter className="w-4 h-4" /> Social Launch
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'email' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Mail className="w-4 h-4" /> Cold Email
        </button>
        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'code' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Code className="w-4 h-4" /> React Code
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'calendar' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          <Calendar className="w-4 h-4" /> Content Plan
        </button>
      </div>

      <div className="min-h-[250px]">
        {activeTab === 'landing' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 relative group animate-[fadeIn_0.2s_ease-out]">
             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleCopy(
                    `${assets.landingPage.headline}\n${assets.landingPage.subheadline}\n${assets.landingPage.cta}\n${assets.landingPage.benefits.join('\n')}`, 
                    'landing'
                  )}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                >
                  {copiedField === 'landing' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
             </div>
             
             <div className="text-center max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                  {assets.landingPage.headline}
                </h1>
                <p className="text-lg text-slate-400">
                  {assets.landingPage.subheadline}
                </p>
                <button className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-full shadow-lg shadow-indigo-900/30 transform hover:scale-105 transition-all">
                  {assets.landingPage.cta}
                </button>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left">
                   {assets.landingPage.benefits.map((benefit, i) => (
                     <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {benefit}
                     </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 max-w-lg mx-auto relative group animate-[fadeIn_0.2s_ease-out]">
             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleCopy(assets.socialPost, 'social')}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                >
                  {copiedField === 'social' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
             </div>
             
             <div className="flex gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-full shrink-0"></div>
                <div className="space-y-2">
                   <div className="flex items-center gap-2">
                      <span className="font-bold text-white">Founder</span>
                      <span className="text-slate-500 text-sm">@founder</span>
                   </div>
                   <p className="text-slate-300 whitespace-pre-wrap leading-relaxed text-sm">
                     {assets.socialPost}
                   </p>
                   <div className="pt-2 text-slate-500 text-xs flex gap-4">
                      <span>💬 12</span>
                      <span>Retweet 45</span>
                      <span>❤️ 128</span>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="bg-white text-slate-900 rounded-xl p-8 max-w-2xl mx-auto shadow-xl relative group animate-[fadeIn_0.2s_ease-out]">
             <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleCopy(assets.emailPitch, 'email')}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                >
                  {copiedField === 'email' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
             </div>
             
             <div className="border-b border-slate-200 pb-4 mb-4">
               <div className="flex gap-2 text-sm mb-2">
                 <span className="text-slate-500">To:</span>
                 <span className="bg-slate-100 px-2 rounded text-slate-600">Prospect</span>
               </div>
               <div className="flex gap-2 text-sm font-bold">
                 <span className="text-slate-500 font-normal">Subject:</span>
                 <span>Quick question about {idea.type}</span>
               </div>
             </div>
             
             <div className="prose prose-slate prose-sm max-w-none whitespace-pre-wrap font-sans">
               {assets.emailPitch}
             </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="animate-[fadeIn_0.2s_ease-out]">
             {!assets.landingPageCode ? (
                <div className="text-center py-12 border border-slate-800 border-dashed rounded-xl">
                   <Code className="w-8 h-8 text-orange-400 mx-auto mb-3" />
                   <p className="text-slate-400 text-sm mb-4">Convert your launch assets into a styled React Component.</p>
                   <button 
                     onClick={handleGenerateCode}
                     disabled={isGeneratingCode}
                     className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                   >
                     {isGeneratingCode ? <Loader2 className="w-3 h-3 animate-spin" /> : <Code className="w-3 h-3" />}
                     Generate Component
                   </button>
                </div>
             ) : (
                <div className="relative group">
                   <div className="absolute top-4 right-4 z-10">
                      <button 
                        onClick={() => handleCopy(assets.landingPageCode!, 'code')}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors shadow-lg"
                      >
                        {copiedField === 'code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                   </div>
                   <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 max-h-[400px] overflow-auto custom-scrollbar">
                      <pre className="text-xs font-mono text-blue-300 whitespace-pre-wrap">{assets.landingPageCode}</pre>
                   </div>
                   <div className="mt-4 flex justify-end">
                      <button 
                        onClick={handleGenerateCode}
                        disabled={isGeneratingCode}
                        className="text-xs text-slate-500 hover:text-orange-400 transition-colors flex items-center gap-1"
                      >
                        <RefreshCcw className="w-3 h-3" /> Regenerate Code
                      </button>
                   </div>
                </div>
             )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="animate-[fadeIn_0.2s_ease-out]">
             {!assets.contentCalendar ? (
                <div className="text-center py-12 border border-slate-800 border-dashed rounded-xl">
                   <Calendar className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                   <p className="text-slate-400 text-sm mb-4">Create a 30-day content marketing plan.</p>
                   <button 
                     onClick={handleGenerateCalendar}
                     disabled={isGeneratingCalendar}
                     className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                   >
                     {isGeneratingCalendar ? <Loader2 className="w-3 h-3 animate-spin" /> : <Calendar className="w-3 h-3" />}
                     Generate 30-Day Plan
                   </button>
                </div>
             ) : (
                <div className="space-y-6">
                   {assets.contentCalendar.map((week) => (
                     <div key={week.weekNumber} className="bg-slate-950 border border-slate-800 rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                           <span className="text-xs font-bold bg-purple-900/20 text-purple-300 px-2 py-1 rounded">Week {week.weekNumber}</span>
                           <span className="text-sm font-bold text-white">{week.theme}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {week.posts.map((post, idx) => (
                             <div key={idx} className="bg-slate-900/50 p-4 rounded-lg border border-slate-800 hover:border-purple-500/30 transition-colors group relative">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                     onClick={() => handleCopy(post.content, `post-${week.weekNumber}-${idx}`)}
                                     className="p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-md"
                                   >
                                     {copiedField === `post-${week.weekNumber}-${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                   </button>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                   {post.platform === 'Twitter' ? <Twitter className="w-4 h-4 text-blue-400" /> : 
                                    post.platform === 'LinkedIn' ? <Layout className="w-4 h-4 text-blue-600" /> :
                                    <FileText className="w-4 h-4 text-emerald-400" />}
                                   <span className="text-[10px] uppercase font-bold text-slate-500">{post.platform}</span>
                                   <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{post.type}</span>
                                </div>
                                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                             </div>
                           ))}
                        </div>
                     </div>
                   ))}
                   <div className="flex justify-end">
                      <button 
                        onClick={handleGenerateCalendar}
                        disabled={isGeneratingCalendar}
                        className="text-xs text-slate-500 hover:text-purple-400 transition-colors flex items-center gap-1"
                      >
                        <RefreshCcw className="w-3 h-3" /> Regenerate Plan
                      </button>
                   </div>
                </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};