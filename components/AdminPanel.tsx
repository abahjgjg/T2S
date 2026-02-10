
import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { AffiliateProduct, Lead, UserProfile, AIProvider } from '../types';
import { ShieldCheck, ShieldAlert, LogIn, UserCheck, X, Package, Users, Settings, Lock, Loader2, MessageSquareCode, Unlock, Database, Activity } from 'lucide-react';
import { toast } from './ToastNotifications';
import { useConfirm } from '../contexts/ConfirmContext';

// Sub-components
import { AdminAffiliates } from './admin/AdminAffiliates';
import { AdminLeads } from './admin/AdminLeads';
import { AdminSettings } from './admin/AdminSettings';
import { AdminPrompts } from './admin/AdminPrompts';
import { AdminLogs } from './admin/AdminLogs'; // New Import

interface Props {
  onExit: () => void;
  user: UserProfile | null;
  onLogin: () => void;
  provider: AIProvider;
  setProvider: (provider: AIProvider) => void;
}

export const AdminPanel: React.FC<Props> = ({ onExit, user, onLogin, provider, setProvider }) => {
  const [activeTab, setActiveTab] = useState<'affiliates' | 'leads' | 'settings' | 'prompts' | 'logs'>('affiliates');
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { confirm } = useConfirm();
  
  // Data State
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  
  const isAuthorized = user && ownerEmail && user.email === ownerEmail;
  const isDbConfigured = supabaseService.isConfigured();

  useEffect(() => {
    if (isDbConfigured) {
      checkOwner();
    } else {
      setCheckingAuth(false);
    }
  }, [isDbConfigured]);

  useEffect(() => {
    if (isAuthorized) {
      loadData();
    }
  }, [isAuthorized, activeTab]);

  const checkOwner = async () => {
    setCheckingAuth(true);
    const owner = await supabaseService.getAdminOwner();
    setOwnerEmail(owner);
    setCheckingAuth(false);
  };

  const loadData = async () => {
    if (activeTab === 'affiliates') {
      const data = await supabaseService.getAffiliateProducts();
      setProducts(data);
    } else if (activeTab === 'leads') {
      const data = await supabaseService.getLeads();
      setLeads(data);
    }
  };

  const handleClaimOwnership = async () => {
    if (user && !ownerEmail) {
      const confirmed = await confirm({
        title: 'Claim Admin Ownership?',
        message: `Set ${user.email} as the permanent Admin Owner for this device and cloud? This can only be reset by the current owner.`,
        confirmText: 'Claim Ownership',
        cancelText: 'Cancel',
        variant: 'warning',
      });
      if (confirmed) {
        const success = await supabaseService.claimAdminLock(user.email);
        if (success) {
           setOwnerEmail(user.email);
           toast.success("Ownership claimed successfully");
        } else {
           toast.error("Failed to claim ownership. Database write failed.");
        }
      }
    }
  };

  const handleResetOwnership = async () => {
    const confirmed = await confirm({
      title: 'Reset Admin Ownership?',
      message: 'Reset Admin Ownership? This will allow a new user to claim admin rights.',
      confirmText: 'Reset Ownership',
      cancelText: 'Keep Current Owner',
      variant: 'danger',
    });
    if (confirmed) {
      const success = await supabaseService.releaseAdminLock();
      if (success) {
        setOwnerEmail(null);
        toast.warning("Ownership reset");
      } else {
        toast.error("Failed to reset ownership.");
      }
    }
  };

  // --- Access Control Rendering ---

  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
         <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
         <p className="text-slate-400">Verifying permissions...</p>
      </div>
    );
  }

  // CRITICAL SECURITY: If DB is not configured, Admin Panel is disabled.
  if (!isDbConfigured) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-[fadeIn_0.5s_ease-out]">
        <div className="bg-slate-900 p-8 rounded-2xl border border-red-500/30 shadow-2xl w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Database className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Configuration Required</h2>
          <p className="text-slate-400 text-sm mb-6">
            The Admin Panel requires a secure database connection. 
            Supabase is not currently configured in the environment.
          </p>
          <div className="bg-slate-950 p-4 rounded-lg mb-6 border border-slate-800 text-left">
            <p className="text-xs text-slate-500 font-mono">SUPABASE_URL: Not Found</p>
            <p className="text-xs text-slate-500 font-mono">SUPABASE_KEY: Not Found</p>
          </div>
          <button onClick={onExit} className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg text-sm font-bold transition-colors">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-[fadeIn_0.5s_ease-out]">
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-md text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${ownerEmail ? 'bg-red-900/20' : 'bg-emerald-900/20'}`}>
            {ownerEmail ? (
               <Lock className="w-8 h-8 text-red-500" />
            ) : (
               <Unlock className="w-8 h-8 text-emerald-500" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Admin Panel</h2>
          
          {ownerEmail ? (
            <div className="bg-slate-950 border border-red-500/20 rounded-lg p-3 mb-6">
              <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-1">System Locked</p>
              <p className="text-slate-400 text-sm">
                Owned by: <span className="text-white font-mono">{ownerEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3")}</span>
              </p>
              <p className="text-slate-500 text-xs mt-2">Log in with this account to manage.</p>
            </div>
          ) : (
            <div className="bg-slate-950 border border-emerald-500/20 rounded-lg p-3 mb-6">
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">System Unclaimed</p>
              <p className="text-slate-400 text-sm">
                No admin configured. Log in to claim ownership.
              </p>
            </div>
          )}
          
          <button 
            onClick={onLogin}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <LogIn className="w-4 h-4" /> Log In / Sign Up
          </button>
          
          <button onClick={onExit} className="w-full text-slate-500 hover:text-white py-2 text-sm">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // First time setup: No owner defined yet
  if (!ownerEmail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-[fadeIn_0.5s_ease-out]">
        <div className="bg-slate-900 p-8 rounded-2xl border border-emerald-500/30 shadow-2xl w-full max-w-md text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          <div className="w-16 h-16 bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Claim Admin Access</h2>
          <p className="text-slate-400 text-sm mb-6">
            No administrator is currently configured for this deployment. 
            Would you like to claim ownership using your current account?
          </p>
          
          <div className="bg-slate-950 p-4 rounded-lg mb-8 border border-slate-800">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Current Account</p>
            <p className="text-white font-mono">{user.email}</p>
          </div>

          <button 
            onClick={handleClaimOwnership}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <UserCheck className="w-4 h-4" /> Set as Admin Owner
          </button>
          
          <button onClick={onExit} className="w-full text-slate-500 hover:text-white py-2 text-sm">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Access Denied: Logged in but not owner
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-[fadeIn_0.5s_ease-out]">
        <div className="bg-slate-900 p-8 rounded-2xl border border-red-500/30 shadow-2xl w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400 text-sm mb-6">
            Your account is not authorized to access this administration panel.
          </p>
          
          <div className="bg-slate-950 p-3 rounded-lg mb-6 border border-slate-800">
            <p className="text-xs text-slate-500">Logged in as: {user.email}</p>
            <p className="text-xs text-slate-500 mt-1">Admin Owner: {ownerEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3")}</p>
          </div>

          <button onClick={onExit} className="w-full text-slate-500 hover:text-white py-2 text-sm">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Authorized View
  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
              <h1 className="text-3xl font-bold text-white">Administration</h1>
            </div>
            <p className="text-slate-400">Manage affiliate products, leads, and system settings.</p>
          </div>
          <button 
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-slate-700"
          >
            <X className="w-4 h-4" /> Exit
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-slate-800 mb-8 pb-1">
           <button
             onClick={() => setActiveTab('affiliates')}
             className={`px-4 py-2 rounded-t-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'affiliates' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-white'}`}
           >
             <Package className="w-4 h-4" /> Affiliates
           </button>
           <button
             onClick={() => setActiveTab('leads')}
             className={`px-4 py-2 rounded-t-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'leads' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-white'}`}
           >
             <Users className="w-4 h-4" /> Leads
           </button>
           <button
             onClick={() => setActiveTab('prompts')}
             className={`px-4 py-2 rounded-t-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'prompts' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-white'}`}
           >
             <MessageSquareCode className="w-4 h-4" /> Prompts
           </button>
           <button
             onClick={() => setActiveTab('logs')}
             className={`px-4 py-2 rounded-t-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'logs' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-white'}`}
           >
             <Activity className="w-4 h-4" /> System Logs
           </button>
           <button
             onClick={() => setActiveTab('settings')}
             className={`px-4 py-2 rounded-t-lg font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === 'settings' ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-500 hover:text-white'}`}
           >
             <Settings className="w-4 h-4" /> System
           </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'affiliates' && (
          <AdminAffiliates products={products} onRefresh={loadData} />
        )}

        {activeTab === 'leads' && (
           <AdminLeads leads={leads} />
        )}

        {activeTab === 'prompts' && (
           <AdminPrompts />
        )}

        {activeTab === 'logs' && (
           <AdminLogs />
        )}

        {activeTab === 'settings' && (
          <AdminSettings 
            provider={provider} 
            setProvider={setProvider} 
            ownerEmail={ownerEmail}
            onResetOwnership={handleResetOwnership}
          />
        )}

      </div>
    </div>
  );
};
