import React, { useMemo, Suspense, lazy } from 'react';
import { UserProfile, PublishedBlueprint } from '../types';
import { supabaseService } from '../services/supabaseService';
import { LayoutDashboard, ArrowLeft, Heart, FileText, Loader2, Share2, BarChart2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from './ToastNotifications';
import { usePreferences } from '../contexts/PreferencesContext';
import { useConfirm } from '../contexts/ConfirmContext';
import { CACHE_CONFIG } from '../constants/appConfig';
import { TEXT_TRUNCATION, DISPLAY_LIMITS } from '../constants/displayConfig';
import { ANIMATION_DURATION, ANIMATION_EASING } from '../constants/animationConfig';

// Lazy load chart component to reduce initial bundle size
const DashboardChart = lazy(() => import('./DashboardChart'));

const ChartFallback = () => (
  <div className="h-[250px] w-full flex items-center justify-center">
    <div className="animate-pulse text-slate-500">Loading chart...</div>
  </div>
);

interface Props {
  user: UserProfile;
  onHome: () => void;
}

export const UserDashboard: React.FC<Props> = ({ user, onHome }) => {
  const { uiText } = usePreferences();
  const { confirm } = useConfirm();
  const queryClient = useQueryClient();

  // Query: Fetch User Blueprints
  const { data: blueprints = [], isLoading } = useQuery({
    queryKey: ['userBlueprints', user.id],
    queryFn: () => supabaseService.getUserPublishedBlueprints(user.id),
    staleTime: CACHE_CONFIG.DEFAULT_STALE_TIME_MS,
    enabled: !!user.id,
  });

  // Mutation: Delete Blueprint
  const deleteMutation = useMutation({
    mutationFn: (id: string) => supabaseService.deletePublishedBlueprint(id, user.id),
    onSuccess: (success, id) => {
      if (success) {
        // Optimistic Update
        queryClient.setQueryData(['userBlueprints', user.id], (old: PublishedBlueprint[] | undefined) => 
          old ? old.filter(b => b.id !== id) : []
        );
        toast.success("Blueprint deleted successfully");
      } else {
        toast.error("Failed to delete blueprint");
      }
    },
    onError: () => {
      toast.error("An error occurred while deleting");
    }
  });

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: 'Delete Blueprint?',
      message: 'Are you sure you want to delete this blueprint? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });
    if (confirmed) {
      deleteMutation.mutate(id);
    }
  };

  const totalVotes = useMemo(() => 
    blueprints.reduce((acc, curr) => acc + (curr.votes || 0), 0), 
  [blueprints]);
  
  // Analytics Data Preparation
  const topBlueprints = useMemo(() => 
    [...blueprints]
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, DISPLAY_LIMITS.DASHBOARD_RECENT_BLUEPRINTS)
      .map(b => ({
        name: b.title.length > TEXT_TRUNCATION.TITLE_SHORT ? b.title.slice(0, TEXT_TRUNCATION.TITLE_SHORT) + '...' : b.title,
        votes: b.votes || 0
      })),
  [blueprints]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <LayoutDashboard className="w-8 h-8 text-emerald-400" />
             <h1 className="text-3xl font-bold text-white">Creator Dashboard</h1>
           </div>
            <p className="text-slate-300">
             Manage your published blueprints and track performance.
           </p>
        </div>
        <button 
          onClick={onHome} 
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2 border border-slate-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 text-slate-300 mb-2 text-sm font-bold uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-blue-400" /> Published
               </div>
               <p className="text-4xl font-black text-white">{blueprints.length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-2 text-slate-300 mb-2 text-sm font-bold uppercase tracking-wider">
                  <Heart className="w-4 h-4 text-red-400" /> Total Votes
               </div>
               <p className="text-4xl font-black text-white">{totalVotes}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg flex flex-col justify-center items-center text-center">
                <p className="text-sm text-slate-300 mb-2">Account</p>
               <p className="text-white font-mono text-sm bg-slate-950 px-3 py-1 rounded-full border border-slate-800">{user.email}</p>
            </div>
          </div>

          {/* Charts & List Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Chart */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 h-fit">
              <div className="flex items-center gap-2 mb-6">
                <BarChart2 className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white">Top Performing Ideas</h3>
              </div>
              
               {topBlueprints.length > 0 && topBlueprints.some(b => b.votes > 0) ? (
                  <div className="h-[250px] w-full">
                     <Suspense fallback={<ChartFallback />}>
                        <DashboardChart data={topBlueprints} />
                     </Suspense>
                  </div>
               ) : (
                <div className="h-[200px] flex items-center justify-center text-slate-500 text-sm italic">
                  Not enough data to display chart.
                </div>
              )}
            </div>

            {/* Content List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-white text-lg">Your Blueprints</h3>
              
              {blueprints.length === 0 ? (
                <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl p-12 text-center text-slate-500">
                  You haven't published any blueprints yet. Start researching to create one!
                </div>
              ) : (
                blueprints.map(bp => (
                  <div key={bp.id} className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 transition-all group flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">
                          {bp.title}
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400">
                          {bp.niche}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {new Date(bp.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1 text-red-400">
                          <Heart className="w-3 h-3 fill-red-400/20" />
                          {bp.votes || 0} Votes
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <a 
                        href={`/blueprint?id=${bp.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg text-xs font-bold transition-colors border border-slate-700"
                      >
                         <Share2 className="w-3 h-3" /> View Public
                      </a>
                       <button 
                         onClick={() => handleDelete(bp.id)}
                         disabled={deleteMutation.isPending}
                         className="p-2 bg-slate-800 hover:bg-red-900/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-slate-700 hover:border-red-500/30 disabled:opacity-50"
                         title="Delete"
                         aria-label="Delete blueprint"
                       >
                         {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};