
import { createClient } from '@supabase/supabase-js';

// NOTE: In a real production app, these should be in process.env
// Users must provide their own Supabase URL and Anon Key
const SUPABASE_URL = process.env.SUPABASE_URL || ''; 
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

export const supabase = (SUPABASE_URL && SUPABASE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

export const isConfigured = () => !!supabase;
