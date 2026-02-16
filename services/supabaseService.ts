
import { getSupabaseClient, isConfigured } from './supabase/client';
import { auth } from './supabase/auth';
import { saveCloudProject, getCloudProjects, deleteCloudProject } from './supabase/projects';
import { 
  publishBlueprint, fetchBlueprint, findBlueprintsByNiche, searchPublicBlueprints, 
  getUserPublishedBlueprints, deletePublishedBlueprint, hasVoted, voteBlueprint, 
  fetchComments, postComment 
} from './supabase/community';
import { 
  getAdminOwner, claimAdminLock, releaseAdminLock, getAffiliateProducts, 
  saveAffiliateProduct, deleteAffiliateProduct, incrementAffiliateClick, 
  saveLead, getLeads 
} from './supabase/admin';
import { getRemotePrompts, saveRemotePrompt, deleteRemotePrompt } from './supabase/prompts';
import { uploadPublicAsset } from './supabase/storage';

// Unified Service Facade for Backward Compatibility
export const supabaseService = {
  isConfigured,
  get client() { return getSupabaseClient(); }, // Lazy getter for client
  
  // Auth Module
  auth,
  
  // Projects Module (Private Library)
  saveCloudProject,
  getCloudProjects,
  deleteCloudProject,

  // Community Module (Public Directory)
  publishBlueprint,
  fetchBlueprint,
  findBlueprintsByNiche,
  searchPublicBlueprints,
  getUserPublishedBlueprints,
  deletePublishedBlueprint,
  hasVoted,
  voteBlueprint,
  fetchComments,
  postComment,

  // Admin Module (Affiliates, Leads, Security)
  getAdminOwner,
  claimAdminLock,
  releaseAdminLock,
  getAffiliateProducts,
  saveAffiliateProduct,
  deleteAffiliateProduct,
  incrementAffiliateClick,
  saveLead,
  getLeads,

  // Config Module (Prompts)
  getRemotePrompts,
  saveRemotePrompt,
  deleteRemotePrompt,

  // Storage Module (Assets)
  uploadPublicAsset
};
