
import { createClient } from '@supabase/supabase-js';

// NOTE: In a real production app, these should be in process.env
// Users must provide their own Supabase URL and Anon Key
const SUPABASE_URL = process.env.SUPABASE_URL || ''; 
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

// Validate Supabase URL - reject dummy/placeholder URLs
const isValidSupabaseUrl = (url: string): boolean => {
  if (!url || url.includes('dummy') || url.includes('placeholder')) {
    return false;
  }
  try {
    const urlObj = new URL(url);
    // Must be a valid https URL with supabase.co domain
    return urlObj.protocol === 'https:' && urlObj.hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
};

export const supabase = (isValidSupabaseUrl(SUPABASE_URL) && SUPABASE_KEY && !SUPABASE_KEY.includes('dummy')) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

export const isConfigured = () => !!supabase;
