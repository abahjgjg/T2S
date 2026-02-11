import React, { useState } from 'react';
import { Palette, Loader2, ImageIcon, Download, Video, Play, AlertCircle } from 'lucide-react';
import { Blueprint } from '../types';
import { toast } from './ToastNotifications';
import { useAsset } from '../hooks/useAsset';
import { usePreferences } from '../contexts/PreferencesContext';
import { SmartImage } from './ui/SmartImage';

interface Props {
  blueprint: Blueprint;
  ideaName: string;
  isGeneratingLogo: boolean;
  isGeneratingVideo: boolean;
  onGenerateLogo: (style: string) => void;
  onGenerateVideo: () => void;
}

export const BlueprintVisuals: React.FC<Props> = ({ 
  blueprint, 
  ideaName, 
  isGeneratingLogo, 
  isGeneratingVideo, 
  onGenerateLogo, 
  onGenerateVideo 
}) => {
  const [logoStyle, setLogoStyle] = useState('');
  
  // Resolve persistent assets
  const { url: resolvedVideoUrl, isLoading: isResolvingVideo, error: videoError } = useAsset(blueprint.marketingVideoUrl);
  const { url: resolvedImageUrl, isLoading: isResolvingImage, error: imageError } = useAsset(blueprint.brandImageUrl);
  
  // Use context for provider check in UI
  const { provider, uiText } = usePreferences();

  const handleDownloadLogo = () => {
    if (!resolvedImageUrl) return;
    const link = document.createElement('a');
    link.href = resolvedImageUrl;
    link.download = `${ideaName.replace(/\s+/g, '_')}_Logo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Logo Downloaded");
  };

  const handleDownloadVideo = () => {
    if (!resolvedVideoUrl) return;
    const link = document.createElement('a');
    link.href = resolvedVideoUrl;
    link.download = `${ideaName.replace(/\s+/g, '_')}_Teaser.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Video Downloaded");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-full print:break-inside-avoid">
       <div className="flex items-center gap-2 mb-4 text-white font-bold text-lg">
          <Palette className="w-5 h-5 text-pink-400" />
          <h3>{uiText.brandIdentity}</h3>
       </div>

       {/* Tabs: Logo or Video */}
       <div className="flex-1 flex flex-col gap-4">
         {/* Logo Section */}
         <div className="relative group min-h-[160px] bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
            {blueprint.brandImageUrl ? (
               isResolvingImage ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
                    <p className="text-[10px] text-slate-500 mt-2">Loading asset...</p>
                  </div>
               ) : imageError ? (
                  <div className="text-center p-4 text-red-400 text-xs">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                    Image expired or missing.
                  </div>
                ) : (
                  <>
                    <SmartImage 
                      src={resolvedImageUrl || ''} 
                      alt="Generated Logo" 
                      className="w-full h-full object-contain"
                      containerClassName="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button 
                         onClick={handleDownloadLogo}
                         className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-full font-bold text-sm transform scale-90 group-hover:scale-100 transition-transform"
                       >
                          <Download className="w-4 h-4" /> Download
                       </button>
                    </div>
                  </>
                )
            ) : isGeneratingLogo ? (
               <div className="flex flex-col items-center">
                  <Loader2 className="w-8 h-8 text-pink-500 animate-spin mb-2" />
                  <p className="text-xs text-slate-500 animate-pulse">{uiText.generatingLogo}</p>
               </div>
            ) : (
               <div className="text-center p-4">
                  <ImageIcon className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No logo generated.</p>
                  <button 
                     onClick={() => onGenerateLogo(logoStyle)}
                     className="mt-2 text-xs text-pink-400 hover:text-pink-300 font-bold"
                     disabled={isGeneratingLogo}
                  >
                     Generate Logo
                  </button>
               </div>
            )}
         </div>

         {/* Video Section (Veo) */}
         <div className="relative group min-h-[160px] bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
             {blueprint.marketingVideoUrl ? (
                isResolvingVideo ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                    <p className="text-[10px] text-slate-500 mt-2">Loading asset...</p>
                  </div>
                ) : videoError ? (
                  <div className="text-center p-4 text-red-400 text-xs">
                    <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                    Video expired or missing.
                  </div>
                ) : (
                  <>
                      <video controls className="w-full h-full object-cover" src={resolvedVideoUrl || ''}></video>
                      <button 
                          onClick={handleDownloadVideo}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                          title="Download Video"
                          aria-label="Download video"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                  </>
                )
             ) : isGeneratingVideo ? (
                <div className="flex flex-col items-center p-4 text-center">
                   <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-2" />
                   <p className="text-xs text-slate-500 animate-pulse">{uiText.generatingVideo}</p>
                   <p className="text-[10px] text-slate-600 mt-1">This takes about a minute.</p>
                </div>
             ) : (
                <div className="text-center p-4">
                   <Video className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                   <p className="text-xs text-slate-500 mb-2">No marketing video.</p>
                   {provider === 'gemini' ? (
                     <button 
                       onClick={onGenerateVideo}
                       className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-900/20 hover:bg-purple-900/30 text-purple-400 border border-purple-500/30 rounded-lg text-xs font-bold transition-colors mx-auto"
                       disabled={isGeneratingVideo}
                     >
                       <Play className="w-3 h-3" /> {uiText.generateVideo}
                     </button>
                   ) : (
                     <p className="text-[10px] text-slate-600">Switch to Gemini for Veo Video.</p>
                   )}
                </div>
             )}
         </div>
       </div>
       
       {/* Warning / Prompt */}
       <div className="mt-4">
          {(blueprint.brandImageUrl || blueprint.marketingVideoUrl) ? (
             <div className="flex items-start gap-2 bg-yellow-900/10 border border-yellow-500/20 p-2 rounded-lg text-[10px] text-yellow-500/80">
                <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                <p>Media assets are saved locally. Clearing browser data will remove them.</p>
             </div>
          ) : (
             <input 
               type="text" 
               placeholder={uiText.logoPrompt}
               className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white mb-2 focus:border-pink-500 outline-none"
               value={logoStyle}
               onChange={(e) => setLogoStyle(e.target.value)}
               disabled={isGeneratingLogo}
             />
          )}
       </div>
    </div>
  );
};