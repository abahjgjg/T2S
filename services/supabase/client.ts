
import { createClient } from '@supabase/supabase-js';
import { 
  isValidSupabaseUrl, 
  isValidSupabaseKey 
} from '../../constants/supabaseConfig';

// Flexy: Environment variables with validation - no hardcoded defaults!
const SUPABASE_URL = process.env.SUPABASE_URL || ''; 
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

// Flexy: Using modular validation functions from supabaseConfig
// All validation rules are now configurable via environment variables!

export const supabase = (isValidSupabaseUrl(SUPABASE_URL) && isValidSupabaseKey(SUPABASE_KEY)) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

export const isConfigured = () => !!supabase;

// Re-export validation functions for external use
export { isValidSupabaseUrl, isValidSupabaseKey };
