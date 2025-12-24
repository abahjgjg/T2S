
import { supabase, isConfigured } from './supabase/client';
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

// Unified Service Facade for Backward Compatibility
export const supabaseService = {
  isConfigured,
  client: supabase, // Expose client for direct usage if needed
  
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
  getLeads
};
