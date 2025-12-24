
import React, { useState } from 'react';
import { SavedProject, UserProfile } from '../types';
import { supabaseService } from '../services/supabaseService';
import { X, Trash2, FolderOpen, Calendar, ArrowRight, Cloud, HardDrive, Loader2, AlertTriangle, LogIn } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from './ToastNotifications';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projects: SavedProject[];
  onLoad: (project: SavedProject) => void;
  onDelete: (id: string) => void; // Deletes from local state in parent
  uiText: any;
  user: UserProfile | null;
  onOpenLogin: () => void;
}

export const ProjectLibrary: React.FC<Props> = ({ isOpen, onClose, projects: localProjects, onLoad, onDelete, uiText, user, onOpenLogin }) => {
  const [activeTab, setActiveTab] = useState<'local' | 'cloud'>('local');
  const queryClient = useQueryClient();

  // Query: Fetch Cloud Projects
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
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation: Delete Cloud Project
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
    if (!window.confirm("Delete from cloud permanently?")) return;
    deleteMutation.mutate(id);
  };

  if (!isOpen) return null;

  const projectsToRender = activeTab === 'local' ? localProjects : cloudProjects;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh] animate-[slideUp_0.3s_ease-out] relative h-full">
        
        {/* Header */}
        <div className="p-6 pb-0 border-b border-slate-800 flex flex-col gap-4 bg-slate-950/50 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FolderOpen className="text-emerald-400" />
              {uiText.library}
            </h2>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-full"
              aria-label="Close library"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('local')}
              className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'local' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              <HardDrive className="w-4 h-4" /> Local Storage
            </button>
            <button
              onClick={() => setActiveTab('cloud')}
              className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'cloud' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              <Cloud className="w-4 h-4" /> Cloud Saves
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          
          {/* Cloud Login Prompt */}
          {activeTab === 'cloud' && !user && (
            <div className="flex flex-col items-center justify-center h-full py-12 text-slate-500">
               <Cloud className="w-16 h-16 mb-4 opacity-20" />
               <p className="text-lg font-medium mb-2">Sync Your Projects</p>
               <p className="text-sm opacity-60 max-w-xs text-center mb-6">Log in to save your blueprints to the cloud and access them from any device.</p>
               <button 
                 onClick={onOpenLogin}
                 className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
               >
                 <LogIn className="w-4 h-4" /> Log In / Sign Up
               </button>
            </div>
          )}

          {/* Cloud Loading / Error */}
          {activeTab === 'cloud' && user && loadingCloud && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          )}

          {activeTab === 'cloud' && user && cloudError && (
             <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400">
               <AlertTriangle className="w-5 h-5 shrink-0" />
               <p className="text-sm">{(cloudError as Error).message}</p>
             </div>
          )}

          {/* Empty State */}
          {((activeTab === 'local' && projectsToRender.length === 0) || (activeTab === 'cloud' && user && !loadingCloud && !cloudError && projectsToRender.length === 0)) && (
            <div className="text-center py-12 text-slate-500">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">{activeTab === 'local' ? uiText.noProjects : "No cloud saves yet."}</p>
              <p className="text-sm mt-2 opacity-60">Generated blueprints can be saved here.</p>
            </div>
          )}

          {/* Project List */}
          {(activeTab === 'local' || (activeTab === 'cloud' && user)) && projectsToRender.length > 0 && projectsToRender.sort((a,b) => b.timestamp - a.timestamp).map((project) => (
              <div key={project.id} className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 transition-all group relative">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 cursor-pointer" onClick={() => onLoad(project)}>
                    <h3 className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors mb-1.5 text-lg">
                      {project.idea.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
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
                        onClick={() => onLoad(project)}
                        className="flex items-center gap-1 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg transition-colors border border-emerald-500/20"
                        aria-label="Load project"
                     >
                       {uiText.load} <ArrowRight className="w-3 h-3" />
                     </button>
                     <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          activeTab === 'local' ? onDelete(project.id) : handleDeleteCloud(project.id); 
                        }}
                        disabled={deleteMutation.isPending}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 disabled:opacity-50"
                        title={uiText.delete}
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
        
        <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500 bg-slate-950/30 rounded-b-2xl">
          {projectsToRender.length} {uiText.savedProjects} in {activeTab === 'local' ? 'Browser' : 'Cloud'}
        </div>
      </div>
    </div>
  );
};
