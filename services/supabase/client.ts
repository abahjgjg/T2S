
import { createClient } from '@supabase/supabase-js';
import { 
  isValidSupabaseUrl, 
  isValidSupabaseKey 
} from '../../constants/supabaseConfig';

// Flexy: Environment variables with validation - no hardcoded defaults!
const SUPABASE_URL = process.env.SUPABASE_URL || ''; 
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

// BroCula: Lazy initialization - client created only when first accessed
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const getSupabaseClient = () => {
  if (!supabaseInstance && isValidSupabaseUrl(SUPABASE_URL) && isValidSupabaseKey(SUPABASE_KEY)) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabaseInstance;
};

// Backward compatibility - but now lazy
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase not configured');
    }
    return client[prop as keyof typeof client];
  }
});

export const isConfigured = () => {
  return isValidSupabaseUrl(SUPABASE_URL) && isValidSupabaseKey(SUPABASE_KEY);
};

// Re-export validation functions for external use
export { isValidSupabaseUrl, isValidSupabaseKey };
