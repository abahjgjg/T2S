
import { AffiliateProduct, Lead } from '../../types';
import { supabase } from './client';
import { APP_URLS } from '../../constants/appConfig';

// --- Admin Security (Cloud Lock) ---

/**
 * Checks who owns the admin panel.
 * STRICT SECURITY: Only checks Supabase. No LocalStorage fallback.
 * If Supabase is not connected or the lock table doesn't exist, returns null.
 */
export const getAdminOwner = async (): Promise<string | null> => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('affiliate_products')
      .select('description')
      .eq('id', 'ADMIN_LOCK')
      .single();
    
    if (!error && data) {
      return data.description;
    }
    
    // If error is "Row not found" (PGRST116), it means no one has claimed it yet.
    // If error is connection related, we fail secure (return null).
    return null;

  } catch (e) {
    console.error("Admin lock check failed:", e);
    return null;
  }
};

/**
 * Claims the admin panel for a specific email.
 * STRICT SECURITY: Only succeeds if Supabase write succeeds.
 */
export const claimAdminLock = async (email: string): Promise<boolean> => {
  if (!supabase) {
    console.error("Cannot claim admin lock: Database not configured.");
    return false;
  }

  const { error } = await supabase
    .from('affiliate_products')
    .upsert({
      id: 'ADMIN_LOCK',
      name: 'SYSTEM_LOCK',
      affiliateUrl: APP_URLS.ADMIN, // Dummy
      description: email,
      keywords: [] // No keywords = no injection
    });
  
  if (error) {
    console.error("Failed to claim admin lock:", error);
    return false;
  }
  
  return true;
};

/**
 * Releases the admin lock.
 */
export const releaseAdminLock = async (): Promise<boolean> => {
  if (!supabase) return false;
  
  const { error } = await supabase.from('affiliate_products').delete().eq('id', 'ADMIN_LOCK');
  return !error;
};

// --- Affiliate System (Supabase Only) ---

export const getAffiliateProducts = async (): Promise<AffiliateProduct[]> => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('affiliate_products')
      .select('*')
      .neq('id', 'ADMIN_LOCK'); // Filter out the security lock
      
    if (error) throw error;
    return data as AffiliateProduct[];
  } catch (e) {
    console.error("Failed to fetch affiliate products", e);
    return [];
  }
};

export const saveAffiliateProduct = async (product: AffiliateProduct): Promise<void> => {
  if (!supabase) return;

  const { error } = await supabase.from('affiliate_products').upsert(product);
  if (error) console.error("Supabase affiliate save error", error);
};

export const deleteAffiliateProduct = async (id: string): Promise<void> => {
  if (!supabase) return;

  const { error } = await supabase.from('affiliate_products').delete().eq('id', id);
  if (error) console.error("Supabase affiliate delete error", error);
};

export const incrementAffiliateClick = async (id: string): Promise<void> => {
  if (!supabase) return;

  try {
    const { data } = await supabase
      .from('affiliate_products')
      .select('clicks')
      .eq('id', id)
      .single();
    
    if (data) {
      const newCount = (data.clicks || 0) + 1;
      await supabase.from('affiliate_products').update({ clicks: newCount }).eq('id', id);
    }
  } catch (e) {
    console.warn("Supabase click tracking failed (Column might be missing)", e);
  }
};

// --- Lead Capture System (Supabase Only) ---

export const saveLead = async (blueprintId: string, email: string, sourceTitle?: string): Promise<boolean> => {
  const lead: Lead = {
    id: crypto.randomUUID(),
    blueprintId: blueprintId,
    email: email,
    createdAt: new Date().toISOString(),
    sourceTitle: sourceTitle
  };

  if (!supabase) {
    console.warn("Supabase not configured. Lead not saved.");
    return false;
  }

  const { error } = await supabase.from('leads').insert([{
    blueprint_id: blueprintId,
    email: email,
    source_title: sourceTitle
  }]);

  if (error) {
    console.error("Supabase lead save error", error);
    return false;
  }
  
  return true;
};

export const getLeads = async (): Promise<Lead[]> => {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    
    // Map back to Lead interface
    return data.map((d: any) => ({
      id: d.id,
      blueprintId: d.blueprint_id,
      email: d.email,
      createdAt: d.created_at,
      sourceTitle: d.source_title
    }));
  } catch (e) {
    console.warn("Failed to fetch leads from Supabase", e);
    return [];
  }
};
