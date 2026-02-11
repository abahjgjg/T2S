import React, { useState, useMemo } from 'react';
import { SavedProject, UserProfile } from '../types';
import { supabaseService } from '../services/supabaseService';
import { Trash2, FolderOpen, Calendar, ArrowRight, Cloud, HardDrive, Loader2, AlertTriangle, LogIn, Search, History, Clock } from 'lucide-react';
import { ProjectCardSkeleton } from './ui/ProjectCardSkeleton';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from './ToastNotifications';
import { Modal } from './ui/Modal';
import { usePreferences } from '../contexts/PreferencesContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { CACHE_CONFIG } from '../constants/appConfig';
import { STORAGE_KEYS } from '../constants/storageConfig';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects: SavedProject[];
  onLoad: (project: SavedProject) => void;
  onDelete: (_id: string) => void; 
  user: UserProfile | null;
  onOpenLogin: () => void;
}

const BUSINESS_TYPES = ['All', 'SaaS', 'Agency', 'Content', 'E-commerce', 'Platform'];

export const ProjectLibrary: React.FC<Props> = ({ isOpen, onClose, projects: localProjects, onLoad, onDelete, user, onOpenLogin }) => {
  const { uiText } = usePreferences();
  const { confirm } = useConfirm();
  const [activeTab, setActiveTab] = useState<'local' | 'cloud' | 'recent'>('local');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  
  const queryClient = useQueryClient();

  const { 
    data: cloudProjects = [], 
    isLoading: loadingCloud, 
    error: cloudError 
  } = useQuery({
    queryKey: ['cloudProjects', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabaseService.getCloudProjects(user.id);
      if (error) throw new Error(error.message || "Failed to load cloud projects");
      return data;
    },
    enabled: isOpen && activeTab === 'cloud' && !!user,
    staleTime: CACHE_CONFIG.DEFAULT_STALE_TIME_MS,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabaseService.deleteCloudProject(id, user.id);
      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(['cloudProjects', user?.id], (old: SavedProject[] | undefined) => 
        old ? old.filter(p => p.id !== deletedId) : []
      );
      toast.success("Project deleted from cloud");
    },
    onError: () => {
      toast.error("Failed to delete project");
    }
  });

  const handleDeleteCloud = async (id: string) => {
    if (!user) return;
    const confirmed = await confirm({
      title: 'Delete from Cloud?',
      message: 'This project will be permanently deleted from the cloud. This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Keep',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteMutation.mutate(id);
  };

  const recentSearches = useMemo(() => {
    if (!isOpen) return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }, [isOpen]);

  const filteredProjects = useMemo(() => {
    const source = activeTab === 'local' ? localProjects : cloudProjects;
    if (activeTab === 'recent') return [];
    return source
      .filter(p => {
        const matchesSearch = p.idea.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.niche.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || p.idea.type === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [activeTab, localProjects, cloudProjects, searchTerm, filterType]);

  const Header = (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center gap-2">
        <FolderOpen className="text-emerald-400 w-5 h-5" />
        <span className="text-xl font-bold text-white">{uiText.library}</span>
      </div>

      <div className="flex gap-4 border-b border-slate-800/50">
        <button
          onClick={() => setActiveTab('local')}
          className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'local' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          <HardDrive className="w-4 h-4" /> Local
        </button>
        <button
          onClick={() => setActiveTab('cloud')}
          className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'cloud' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          <Cloud className="w-4 h-4" /> Cloud
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={`pb-2 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'recent' ? 'border-orange-500 text-orange-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
        >
          <History className="w-4 h-4" /> Recent
        </button>
      </div>

      <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {BUSINESS_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                  filterType === type 
                  ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/50' 
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={Header} className="max-w-2xl h-[85vh]">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {activeTab === 'cloud' && !user && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
               <Cloud className="w-16 h-16 mb-4 opacity-20" />
               <p className="text-lg font-medium mb-2">Sync Your Projects</p>
               <p className="text-sm opacity-60 max-w-xs text-center mb-6">Log in to save your blueprints to the cloud.</p>
               <button 
                 onClick={onOpenLogin}
                 className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
               >
                 <LogIn className="w-4 h-4" /> Log In
               </button>
            </div>
          )}

          {activeTab === 'cloud' && user && loadingCloud && (
            <ProjectCardSkeleton count={4} />
          )}

          {activeTab === 'cloud' && user && cloudError && (
             <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400">
               <AlertTriangle className="w-5 h-5 shrink-0" />
               <p className="text-sm">{(cloudError as Error).message}</p>
             </div>
          )}

          {activeTab === 'recent' && (
            <div className="space-y-2">
               {recentSearches.length === 0 ? (
                 <div className="text-center py-12 text-slate-500">
                    <History className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No recent searches.</p>
                 </div>
               ) : (
                 recentSearches.map((term: string, i: number) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-orange-500/50 transition-colors">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-slate-900 rounded-full">
                            <Clock className="w-4 h-4 text-slate-500" />
                         </div>
                         <span className="text-slate-200 font-medium">{term}</span>
                      </div>
                      <button
                        onClick={() => {
                           onClose();
                           window.dispatchEvent(new CustomEvent('re-search', { detail: term }));
                        }}
                        className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
                      >
                         Re-scan <ArrowRight className="w-3 h-3" />
                      </button>
                   </div>
                 ))
               )}
            </div>
          )}

          {((activeTab === 'local' && filteredProjects.length === 0) || (activeTab === 'cloud' && user && !loadingCloud && !cloudError && filteredProjects.length === 0)) && (
            <div className="text-center py-12 text-slate-500">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">
                {searchTerm || filterType !== 'All' ? "No matches found." : (activeTab === 'local' ? uiText.noProjects : "No cloud saves yet.")}
              </p>
            </div>
          )}

          {(activeTab === 'local' || (activeTab === 'cloud' && user)) && filteredProjects.map((project) => (
              <div 
                key={project.id} 
                className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 transition-all duration-300 ease-out group relative cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/10"
                role="button"
                tabIndex={0}
                onClick={() => onLoad(project)}
                onKeyDown={(e) => e.key === 'Enter' && onLoad(project)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors duration-300 mb-1.5 text-lg">
                      {project.idea.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="bg-slate-900 border border-slate-700 px-2 py-0.5 rounded text-slate-400 font-mono">
                        {project.idea.type}
                      </span>
                      <span className="text-slate-400 font-medium px-2 py-0.5 bg-slate-800/50 rounded">
                        {project.niche}
                      </span>
                      <span className="flex items-center gap-1 opacity-75">
                        <Calendar className="w-3 h-3" />
                        {new Date(project.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                     <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onLoad(project);
                        }}
                        className="flex items-center gap-1 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg transition-all duration-300 border border-emerald-500/20 hover:scale-105 active:scale-95"
                     >
                       {uiText.load} <ArrowRight className="w-3 h-3" />
                     </button>
                      <button 
                         onClick={(e) => { 
                           e.stopPropagation(); 
                           activeTab === 'local' ? onDelete(project.id) : handleDeleteCloud(project.id); 
                         }}
                         disabled={deleteMutation.isPending}
                         className="p-2 text-slate-500 hover:text-red-400 transition-all duration-300 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 disabled:opacity-50 hover:scale-105 active:scale-95"
                         aria-label="Delete project"
                      >
                        {activeTab === 'cloud' && deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
        
        <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500 bg-slate-950/30">
          {filteredProjects.length} {uiText.savedProjects} found
        </div>
    </Modal>
  );
};