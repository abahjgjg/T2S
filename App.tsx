
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Header } from './components/Header';
import { TrendSearch } from './components/TrendSearch';
import { IdeaSelection } from './components/IdeaSelection';
import { ToastNotifications } from './components/ToastNotifications';

// Lazy load BlueprintView - only needed when viewing a blueprint
const BlueprintView = React.lazy(() => import('./components/BlueprintView').then(module => ({ default: module.BlueprintView })));
import { getAIService } from './services/aiRegistry';
import { supabaseService } from './services/supabaseService';
import { promptService } from './services/promptService';
import { SavedProject, SearchRegion, SearchTimeframe } from './types';
import { XCircle, Loader2, ArrowUp } from 'lucide-react';
import { useMetaTags } from './hooks/useMetaTags';
import { useResearch } from './hooks/useResearch';
import { indexedDBService } from './utils/storageUtils';
import { useAuth } from './contexts/AuthContext';
import { usePreferences } from './contexts/PreferencesContext';
import { useConfirm } from './contexts/ConfirmContext';
import { useRouter } from './hooks/useRouter';
import { STORAGE_KEYS } from './constants/storageConfig';
import { SEO_CONFIG, getOgImageUrl, SCROLL_CONFIG } from './constants/appConfig';
import { DEFAULT_SEARCH_CONFIG } from './constants/searchConfig';
import { ROUTES, buildRoute } from './constants/routes';

// Lazy Load Heavy Route Components
const PublicBlogView = React.lazy(() => import('./components/PublicBlogView').then(module => ({ default: module.PublicBlogView })));
const Directory = React.lazy(() => import('./components/Directory').then(module => ({ default: module.Directory })));
const AdminPanel = React.lazy(() => import('./components/AdminPanel').then(module => ({ default: module.AdminPanel })));
const UserDashboard = React.lazy(() => import('./components/UserDashboard').then(module => ({ default: module.UserDashboard })));
const ProjectLibrary = React.lazy(() => import('./components/ProjectLibrary').then(module => ({ default: module.ProjectLibrary })));

const LIBRARY_KEY = STORAGE_KEYS.PROJECT_LIBRARY;

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
  const { confirm } = useConfirm();

  const aiService = getAIService(provider);
  const { state: rState, setters: rSetters, actions: rActions } = useResearch(aiService, language, user?.id);

  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > SCROLL_CONFIG.THRESHOLD);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: SCROLL_CONFIG.TOP_POSITION, behavior: 'smooth' });
  }, []);
  
  const handleReset = useCallback(async () => {
    const confirmed = await confirm({
      title: uiText.resetConfirmationTitle || 'Start New Research?',
      message: uiText.resetConfirmation || 'This will clear your current research. Any unsaved progress will be lost.',
      confirmText: uiText.confirm || 'Start New',
      cancelText: uiText.cancel || 'Keep Working',
      variant: 'warning',
    });

    if (confirmed) {
      rActions.resetResearch();
      pushState(ROUTES.HOME);
    }
  }, [uiText.resetConfirmation, uiText.resetConfirmationTitle, uiText.confirm, uiText.cancel, rActions, pushState, confirm]);

  const handleSearch = useCallback(async (searchTerm: string, region: SearchRegion, timeframe: SearchTimeframe, deepMode: boolean, image?: string) => {
    const newUrl = buildRoute.idea({ niche: searchTerm });
    pushState(newUrl);
    rActions.executeSearchSequence(searchTerm, region, timeframe, deepMode, image);
  }, [pushState, rActions]);

  const handleIdeaSelectionWrapper = useCallback(async (idea: any) => {
    const publishedId = await rActions.handleSelectIdea(idea);
    if (publishedId) {
      pushState(buildRoute.blueprint({ id: publishedId }));
    }
  }, [pushState, rActions]);

  const handleBackToIdeasWrapper = useCallback(() => {
    rActions.handleBackToIdeas();
    pushState(buildRoute.idea({ niche: rState.niche }));
  }, [pushState, rActions, rState.niche]);

  const handleRouting = useCallback(async (isInitialLoad = false) => {
    if (rState.isRestoring) return; // Wait for hydration

    const params = getParams();
    const path = getPath();

    if (path.includes(ROUTES.ADMIN)) {
      rSetters.setAppState('ADMIN');
      return;
    }

    if (path.includes(ROUTES.DASHBOARD)) {
      rSetters.setAppState('DASHBOARD');
      return;
    }

    if (path.includes(ROUTES.DIRECTORY)) {
      rSetters.setAppState('DIRECTORY');
      return;
    }

    const sharedId = params.get('id');
    if (path.includes(ROUTES.BLUEPRINT) && sharedId) {
      if (rState.appState === 'VIEWING' && rState.currentBlueprintId === sharedId) return;
      rSetters.setAppState('VIEWING_PUBLIC');
      return;
    }

    const sharedNiche = params.get('niche');
    if (path.includes(ROUTES.IDEA) && sharedNiche) {
      if (rState.niche === sharedNiche && rState.ideas.length > 0) {
        rSetters.setSelectedIdea(null);
        rSetters.setBlueprint(null);
        rSetters.setAppState('ANALYZING');
      } else {
        if (isInitialLoad || rState.niche !== sharedNiche) {
          rActions.executeSearchSequence(sharedNiche, DEFAULT_SEARCH_CONFIG.REGION, DEFAULT_SEARCH_CONFIG.TIMEFRAME);
        }
      }
      return;
    }

    if (path === ROUTES.HOME || path === '') {
      if (!isInitialLoad) {
        rActions.resetResearch();
      }
      return;
    }
  }, [rState.isRestoring, rState.appState, rState.currentBlueprintId, rState.ideas.length, rState.niche, rActions, rSetters, getParams, getPath]);

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
  }, []); 

  useEffect(() => {
    if (!rState.isRestoring) {
      handleRouting(true);
    }
  }, [rState.isRestoring, handleRouting]);

  useEffect(() => {
    if (!user && window.location.pathname.includes(ROUTES.DASHBOARD)) {
        rSetters.setAppState('IDLE');
        pushState(ROUTES.HOME);
    }
  }, [user, rSetters, pushState]);

  useEffect(() => {
    const onPopState = () => handleRouting(false);
    window.addEventListener('popstate', onPopState);

    const onReSearch = (e: any) => {
      handleSearch(e.detail, DEFAULT_SEARCH_CONFIG.REGION, DEFAULT_SEARCH_CONFIG.TIMEFRAME, DEFAULT_SEARCH_CONFIG.DEEP_MODE);
    };
    window.addEventListener('re-search', onReSearch);

    return () => {
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('re-search', onReSearch);
    };
  }, [handleRouting, handleSearch]);

  useEffect(() => {
    const saveProjects = async () => {
      await indexedDBService.setItem(LIBRARY_KEY, savedProjects);
    };
    saveProjects();
  }, [savedProjects]);

  useMetaTags(
    SEO_CONFIG.DEFAULT_TITLE,
    SEO_CONFIG.DEFAULT_DESCRIPTION,
    getOgImageUrl(),
    window.location.href
  );

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
            pushState(ROUTES.HOME);
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
            pushState(ROUTES.HOME);
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
              pushState(ROUTES.HOME);
            }}
          />
        ) : (
          <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <h2 className="text-2xl font-bold text-white mb-4">Please Log In</h2>
            <p className="text-slate-400 mb-6">You need to be signed in to view your dashboard.</p>
            <button onClick={openAuthModal} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg">Log In</button>
            <button onClick={() => { rSetters.setAppState('IDLE'); pushState(ROUTES.HOME); }} className="mt-4 text-slate-500 hover:text-white">Go Home</button>
          </div>
        )}
        <ToastNotifications />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
      {/* Accessibility: Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:rounded-lg focus:font-bold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>
      <Header 
        onReset={handleReset}
        showReset={rState.appState !== 'IDLE' && rState.appState !== 'DIRECTORY'}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenDirectory={() => {
          rSetters.setAppState('DIRECTORY');
          pushState(ROUTES.DIRECTORY);
        }}
        onOpenAdmin={() => {
          rSetters.setAppState('ADMIN');
          pushState(ROUTES.ADMIN);
        }}
        onLogin={() => {
          if (user) {
             rSetters.setAppState('DASHBOARD');
             pushState(ROUTES.DASHBOARD);
          } else {
             openAuthModal();
          }
        }}
      />
      
      <main id="main-content" className="pb-20" tabIndex={-1}>
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
            initialImage={rState.image}
            savedNiches={savedProjects.map(p => p.niche)}
          />
        )}
        
        {rState.appState === 'DIRECTORY' && (
           <Suspense fallback={<div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 text-emerald-500 animate-spin" /></div>}>
             <Directory 
               onViewBlueprint={(id) => {
                 pushState(buildRoute.blueprint({ id }));
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
             initialImage={rState.image}
             savedNiches={savedProjects.map(p => p.niche)}
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
          <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
              <p className="text-slate-400 font-medium animate-pulse">Loading Blueprint...</p>
            </div>
          }>
            <BlueprintView 
              idea={rState.selectedIdea} 
              blueprint={rState.blueprint} 
              onBack={handleBackToIdeasWrapper} 
              onSaveToLibrary={handleSaveProject}
              onUpdateBlueprint={rActions.updateBlueprint}
              onUpdateIdea={rActions.updateIdea}
              isSaved={savedProjects.some(p => p.id === rState.selectedIdea!.id)}
              publishedUrl={rState.currentBlueprintId ? `${window.location.origin}/blueprint?id=${rState.currentBlueprintId}` : null}
            />
          </Suspense>
        )}
      </main>

      <Suspense fallback={null}>
        {isLibraryOpen && (
          <ProjectLibrary 
            isOpen={isLibraryOpen}
            onClose={() => setIsLibraryOpen(false)}
            projects={savedProjects}
            onLoad={handleLoadProject}
            onDelete={async (id) => {
               const confirmed = await confirm({
                 title: uiText.deleteConfirmationTitle || 'Delete Project?',
                 message: uiText.deleteConfirmation || 'This project will be permanently deleted. This action cannot be undone.',
                 confirmText: uiText.delete || 'Delete',
                 cancelText: uiText.cancel || 'Cancel',
                 variant: 'danger',
               });
               if (confirmed) {
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
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl transition-all animate-[fadeIn_0.3s_ease-out] z-50 group hover:scale-110 active:scale-95 border border-emerald-400/20"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6" />
          <div className="absolute -top-10 right-0 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Scroll Top
          </div>
        </button>
      )}
      <ToastNotifications />
    </div>
  );
};

export default App;
