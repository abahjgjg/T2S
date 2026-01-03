
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Header } from './components/Header';
import { TrendSearch } from './components/TrendSearch';
import { IdeaSelection } from './components/IdeaSelection';
import { BlueprintView } from './components/BlueprintView';
import { ToastNotifications } from './components/ToastNotifications';
import { getAIService } from './services/aiRegistry';
import { supabaseService } from '../services/supabaseService';
import { promptService } from './services/promptService';
import { SavedProject, SearchRegion, SearchTimeframe } from './types';
import { XCircle, Loader2 } from 'lucide-react';
import { useMetaTags } from './hooks/useMetaTags';
import { useResearch } from './hooks/useResearch';
import { indexedDBService } from './utils/storageUtils';
import { useAuth } from './contexts/AuthContext';
import { usePreferences } from './contexts/PreferencesContext';
import { useRouter } from './hooks/useRouter';

// Lazy Load Heavy Route Components
const PublicBlogView = React.lazy(() => import('./components/PublicBlogView').then(module => ({ default: module.PublicBlogView })));
const Directory = React.lazy(() => import('./components/Directory').then(module => ({ default: module.Directory })));
const AdminPanel = React.lazy(() => import('./components/AdminPanel').then(module => ({ default: module.AdminPanel })));
const UserDashboard = React.lazy(() => import('./components/UserDashboard').then(module => ({ default: module.UserDashboard })));
const ProjectLibrary = React.lazy(() => import('./components/ProjectLibrary').then(module => ({ default: module.ProjectLibrary })));

const LIBRARY_KEY = 'trendventures_library_v1';

const FullScreenLoader = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
    <p className="text-slate-400 font-medium animate-pulse">Loading Application Module...</p>
  </div>
);

const App: React.FC = () => {
  const { language, provider, setProvider, uiText } = usePreferences();
  const { pushState, getParams, getPath } = useRouter();
  const { user, openAuthModal } = useAuth();

  const aiService = getAIService(provider);
  const { state: rState, setters: rSetters, actions: rActions } = useResearch(aiService, language, user?.id);

  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  
  const handleRouting = useCallback(async (isInitialLoad = false) => {
    const params = getParams();
    const path = getPath();

    if (path.includes('/admin')) {
      rSetters.setAppState('ADMIN');
      return;
    }

    if (path.includes('/dashboard')) {
      rSetters.setAppState('DASHBOARD');
      return;
    }

    if (path.includes('/directory')) {
      rSetters.setAppState('DIRECTORY');
      return;
    }

    const sharedId = params.get('id');
    if (path.includes('/blueprint') && sharedId) {
      if (rState.appState === 'VIEWING' && rState.currentBlueprintId === sharedId) return;
      rSetters.setAppState('VIEWING_PUBLIC');
      return;
    }

    const sharedNiche = params.get('niche');
    if (path.includes('/idea') && sharedNiche) {
      if (rState.niche === sharedNiche && rState.ideas.length > 0) {
        rSetters.setSelectedIdea(null);
        rSetters.setBlueprint(null);
        rSetters.setAppState('ANALYZING');
      } else {
        if (isInitialLoad || rState.niche !== sharedNiche) {
          rActions.executeSearchSequence(sharedNiche, 'Global', '30d');
        }
      }
      return;
    }

    if (path === '/' || path === '') {
      if (!isInitialLoad) {
        rActions.resetResearch();
      }
      return;
    }
  }, [rState.appState, rState.currentBlueprintId, rState.ideas.length, rState.niche, rActions, rSetters, getParams, getPath]);

  useEffect(() => {
    const loadProjects = async () => {
      let projects = await indexedDBService.getItem<SavedProject[]>(LIBRARY_KEY);
      if (!projects) {
        const local = localStorage.getItem(LIBRARY_KEY);
        if (local) {
          try {
            projects = JSON.parse(local);
            await indexedDBService.setItem(LIBRARY_KEY, projects);
            localStorage.removeItem(LIBRARY_KEY);
          } catch(e) { projects = []; }
        } else {
          projects = [];
        }
      }
      setSavedProjects(projects || []);
    };
    loadProjects();
    promptService.syncWithCloud();
    handleRouting(true);
  }, []); 

  useEffect(() => {
    if (!user && window.location.pathname.includes('/dashboard')) {
        rSetters.setAppState('IDLE');
        pushState('/');
    }
  }, [user, rSetters, pushState]);

  useEffect(() => {
    const onPopState = () => handleRouting(false);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [handleRouting]);

  useEffect(() => {
    const saveProjects = async () => {
      await indexedDBService.setItem(LIBRARY_KEY, savedProjects);
    };
    saveProjects();
  }, [savedProjects]);

  useMetaTags(
    "TrendVentures AI | Market Research Suite",
    "Generate comprehensive business blueprints and revenue models from real-time news and trends.",
    "https://placehold.co/1200x630/0f172a/10b981?text=TrendVentures+AI&font=roboto",
    window.location.href
  );

  const handleReset = () => {
    const confirmMsg = language === 'id' 
      ? 'Mulai riset baru? Data saat ini akan dihapus.' 
      : 'Start new research? Current data will be cleared.';
      
    if (window.confirm(confirmMsg)) {
      rActions.resetResearch();
      pushState('/');
    }
  };

  const handleSearch = async (searchTerm: string, region: SearchRegion, timeframe: SearchTimeframe, deepMode: boolean, image?: string) => {
    const newUrl = `/idea?niche=${encodeURIComponent(searchTerm)}`;
    pushState(newUrl);
    rActions.executeSearchSequence(searchTerm, region, timeframe, deepMode, image);
  };

  const handleIdeaSelectionWrapper = async (idea: any) => {
    const publishedId = await rActions.handleSelectIdea(idea);
    if (publishedId) {
      pushState(`/blueprint?id=${publishedId}`);
    }
  };

  const handleBackToIdeasWrapper = () => {
    rActions.handleBackToIdeas();
    pushState(`/idea?niche=${encodeURIComponent(rState.niche)}`);
  };

  const handleSaveProject = async () => {
    if (!rState.selectedIdea || !rState.blueprint) return;
    
    if (!savedProjects.some(p => p.id === rState.selectedIdea!.id)) {
      const newProject: SavedProject = {
        id: rState.selectedIdea.id,
        timestamp: Date.now(),
        niche: rState.niche,
        idea: rState.selectedIdea,
        blueprint: rState.blueprint
      };
      setSavedProjects(prev => [...prev, newProject]);
      
      if (user) {
        const { error } = await supabaseService.saveCloudProject(newProject, user.id);
        if (error) {
           console.warn("Failed to save to cloud:", error);
           rSetters.setError("Project saved locally, but cloud sync failed.");
        }
      }
    } else {
       setSavedProjects(prev => prev.map(p => 
          p.id === rState.selectedIdea!.id 
          ? { ...p, blueprint: rState.blueprint! } 
          : p
       ));
       if (user) {
          const updatedProject = {
             id: rState.selectedIdea.id,
             timestamp: Date.now(),
             niche: rState.niche,
             idea: rState.selectedIdea,
             blueprint: rState.blueprint
          };
          supabaseService.saveCloudProject(updatedProject, user.id);
       }
    }
  };

  const handleLoadProject = (project: SavedProject) => {
    rActions.loadProject(project);
    setIsLibraryOpen(false);
  };

  if (rState.isRestoring) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Restoring Session...</h2>
      </div>
    );
  }

  if (rState.appState === 'VIEWING_PUBLIC') {
    const sharedId = new URLSearchParams(window.location.search).get('id');
    return (
      <Suspense fallback={<FullScreenLoader />}>
        <PublicBlogView 
          id={sharedId}
          onHome={() => {
            rSetters.setAppState('IDLE');
            pushState('/');
          }}
        />
        <ToastNotifications />
      </Suspense>
    );
  }

  if (rState.appState === 'ADMIN') {
    return (
      <Suspense fallback={<FullScreenLoader />}>
        <AdminPanel 
          onExit={() => {
            rSetters.setAppState('IDLE');
            pushState('/');
          }}
          user={user}
          onLogin={openAuthModal}
          provider={provider}
          setProvider={setProvider}
        />
        <ToastNotifications />
      </Suspense>
    );
  }

  if (rState.appState === 'DASHBOARD') {
    return (
      <Suspense fallback={<FullScreenLoader />}>
        {user ? (
          <UserDashboard 
            user={user}
            onHome={() => {
              rSetters.setAppState('IDLE');
              pushState('/');
            }}
          />
        ) : (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-bold text-white mb-4">Please Log In</h2>
            <p className="text-slate-400 mb-6">You need to be signed in to view your dashboard.</p>
            <button onClick={openAuthModal} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg">Log In</button>
            <button onClick={() => { rSetters.setAppState('IDLE'); pushState('/'); }} className="mt-4 text-slate-500 hover:text-white">Go Home</button>
          </div>
        )}
        <ToastNotifications />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      <Header 
        onReset={handleReset}
        showReset={rState.appState !== 'IDLE' && rState.appState !== 'DIRECTORY'}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenDirectory={() => {
          rSetters.setAppState('DIRECTORY');
          pushState('/directory');
        }}
        onOpenAdmin={() => {
          rSetters.setAppState('ADMIN');
          pushState('/admin');
        }}
        onLogin={() => {
          if (user) {
             rSetters.setAppState('DASHBOARD');
             pushState('/dashboard');
          } else {
             openAuthModal();
          }
        }}
      />
      
      <main className="pb-20">
        {rState.error && (
          <div className="max-w-2xl mx-auto mt-6 bg-red-900/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-start justify-between gap-4 animate-[fadeIn_0.3s_ease-out]">
            <p className="font-semibold">{rState.error}</p>
            <button onClick={rActions.dismissError} className="text-red-400 hover:text-white transition-colors">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {rState.appState === 'IDLE' && (
          <TrendSearch 
            onSearch={handleSearch} 
            isLoading={false} 
            initialNiche={rState.niche}
            initialRegion={rState.region}
            initialTimeframe={rState.timeframe}
            initialDeepMode={rState.deepMode}
          />
        )}
        
        {rState.appState === 'DIRECTORY' && (
           <Suspense fallback={<div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 text-emerald-500 animate-spin" /></div>}>
             <Directory 
               onViewBlueprint={(id) => {
                 pushState(`/blueprint?id=${id}`);
                 rSetters.setAppState('VIEWING_PUBLIC');
               }} 
              />
           </Suspense>
        )}

        {rState.appState === 'RESEARCHING' && (
           <TrendSearch 
             onSearch={() => {}} 
             isLoading={true} 
             initialNiche={rState.niche}
             initialRegion={rState.region}
             initialTimeframe={rState.timeframe}
             initialDeepMode={rState.deepMode}
           />
        )}

        {(rState.appState === 'ANALYZING' || rState.appState === 'BLUEPRINTING') && (
          <div className="flex flex-col items-center">
            {rState.isFromCache && rState.appState === 'ANALYZING' && (
              <div className="w-full max-w-6xl px-4 mt-6 mb-2 flex flex-col md:flex-row justify-between items-center bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4 gap-4 animate-[fadeIn_0.5s_ease-out]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/20 rounded-full">
                    <Loader2 className="w-5 h-5 text-indigo-400" /> 
                  </div>
                  <p className="text-indigo-200 text-sm font-medium">{uiText.cachedNotice}</p>
                </div>
                <button 
                  onClick={() => rActions.executeFreshAIResearch(rState.niche)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg border border-slate-700 transition-colors whitespace-nowrap"
                >
                  {uiText.newResearchBtn}
                </button>
              </div>
            )}

            <IdeaSelection 
              niche={rState.niche} 
              trends={rState.trends} 
              ideas={rState.ideas} 
              onSelectIdea={handleIdeaSelectionWrapper}
              onGenerateIdeas={rActions.generateIdeasFromTrends}
              isGeneratingBlueprint={rState.appState === 'BLUEPRINTING'}
              isGeneratingIdeas={rState.isGeneratingIdeas}
              onAnalyzeTrendDeepDive={rActions.analyzeTrendDeepDive}
            />
          </div>
        )}

        {rState.appState === 'VIEWING' && rState.selectedIdea && rState.blueprint && (
          <BlueprintView 
            idea={rState.selectedIdea} 
            blueprint={rState.blueprint} 
            onBack={handleBackToIdeasWrapper} 
            onSaveToLibrary={handleSaveProject}
            onUpdateBlueprint={rActions.updateBlueprint}
            isSaved={savedProjects.some(p => p.id === rState.selectedIdea!.id)}
            publishedUrl={rState.currentBlueprintId ? `${window.location.origin}/blueprint?id=${rState.currentBlueprintId}` : null}
          />
        )}
      </main>

      <Suspense fallback={null}>
        {isLibraryOpen && (
          <ProjectLibrary 
            isOpen={isLibraryOpen}
            onClose={() => setIsLibraryOpen(false)}
            projects={savedProjects}
            onLoad={handleLoadProject}
            onDelete={(id) => {
               if (window.confirm(uiText.delete + '?')) {
                 setSavedProjects(prev => prev.filter(p => p.id !== id));
               }
            }}
            onOpenLogin={() => {
              setIsLibraryOpen(false);
              openAuthModal();
            }}
            user={user}
          />
        )}
      </Suspense>
      <ToastNotifications />
    </div>
  );
};

export default App;
