
import React, { useState } from 'react';
import { MapPin, Loader2, Navigation, ExternalLink, Map as MapIcon, PlusCircle, Check } from 'lucide-react';
import { LocationAnalysis, BusinessIdea } from '../types';
import { getAIService } from '../services/aiRegistry';
import { toast } from './ToastNotifications';
import { SafeMarkdown } from './SafeMarkdown';
import { Modal } from './ui/Modal';
import { usePreferences } from '../contexts/PreferencesContext';
import { COORDINATE_PRECISION, TEXT_TRUNCATION } from '../constants/displayLimits';
import { ANIMATION_CLASSES } from '../constants/animationConfig';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  idea: BusinessIdea;
  onSaveToBlueprint: (_strategy: string) => void;
}

export const LocationScoutModal: React.FC<Props> = ({ isOpen, onClose, idea, onSaveToBlueprint }) => {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LocationAnalysis | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const { language, uiText, provider } = usePreferences();

  const handleScout = async () => {
    if (!location.trim()) return;
    
    setLoading(true);
    setResult(null);
    setIsSaved(false);

    try {
      const aiService = getAIService(provider); 
      const data = await aiService.scoutLocation(idea.type + " " + idea.name, location, language);
      setResult(data);
    } catch (e) {
      console.error("Location scout error:", e);
      toast.error("Failed to scout location. Try a different city.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.info("Requesting location access...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLocation(`${latitude.toFixed(COORDINATE_PRECISION.latitude)}, ${longitude.toFixed(COORDINATE_PRECISION.longitude)}`);
        toast.success("Coordinates acquired!");
      },
      (error) => {
        toast.error("Unable to retrieve your location");
      }
    );
  };

  const handleAddToBlueprint = () => {
    if (!result) return;
    const strategy = `Target Expansion in ${location}: ${result.summary.slice(0, TEXT_TRUNCATION.insight)}...`;
    onSaveToBlueprint(strategy);
    setIsSaved(true);
    toast.success("Added to Marketing Strategy");
  };

  const Header = (
    <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center border border-blue-500/30"><MapIcon className="w-5 h-5 text-blue-400" /></div>
        <div><h2 className="text-xl font-bold text-white">{uiText.locationScout}</h2><p className="text-xs text-slate-400">Powered by {provider === 'gemini' ? 'Google Maps Grounding' : 'AI Reasoning'}</p></div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={Header}>
      <div className="p-6">
           {!result && (
             <div className="mb-6">
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">Analyze specific cities or regions to find competitors, assess market density, and identify the best spots for your <strong>{idea.type}</strong> business.</p>
                <div className="flex gap-2">
                   <div className="relative flex-1"><MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-500" /><input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={uiText.locationPrompt} className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors" onKeyDown={(e) => e.key === 'Enter' && handleScout()} /></div>
                    <button onClick={handleUseMyLocation} className="px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors" title={uiText.useMyLocation} aria-label="Use my location"><Navigation className="w-4 h-4" /></button>
                   <button onClick={handleScout} disabled={loading || !location} className="px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : uiText.scoutLocation}</button>
                </div>
             </div>
           )}
           {loading && (<div className="flex flex-col items-center justify-center py-12"><Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" /><p className="text-slate-400 animate-pulse">{uiText.findingPlaces}</p></div>)}
            {result && (
              <div className={`${ANIMATION_CLASSES.fadeIn.slow}`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-white text-lg flex items-center gap-2"><MapPin className="w-5 h-5 text-red-500" /> Results for {location}</h3>
                  <div className="flex gap-3"><button onClick={handleAddToBlueprint} disabled={isSaved} className={`text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${isSaved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>{isSaved ? <Check className="w-3 h-3" /> : <PlusCircle className="w-3 h-3" />}{isSaved ? "Strategy Added" : "Add to Plan"}</button><button onClick={() => setResult(null)} className="text-xs text-blue-400 hover:text-blue-300 underline">New Search</button></div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-5 mb-6 border border-slate-800"><div className="prose prose-invert prose-sm max-w-none"><SafeMarkdown content={result.summary} /></div></div>
                <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-3">{uiText.placesFound}</h4>
                <div className="grid grid-cols-1 gap-3">
                  {result.places.map((place, i) => (
                    <a key={i} href={place.uri} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all group">
                       <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 group-hover:bg-blue-900/20 group-hover:text-blue-400 transition-colors"><MapPin className="w-4 h-4" /></div>
                       <div className="flex-1 min-w-0"><div className="flex items-center gap-2 mb-1"><h5 className="font-bold text-white truncate">{place.title}</h5><ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-blue-400" /></div><p className="text-xs text-slate-400 truncate">{place.address}</p></div>
                    </a>
                  ))}
                  {result.places.length === 0 && (<div className="text-center py-8 text-slate-500 text-sm">No specific places returned from map data. See summary for details.</div>)}
                </div>
             </div>
           )}
      </div>
    </Modal>
  );
};
