
import { User } from '@supabase/supabase-js';
import { getSupabaseClient } from './client';

export const auth = {
  signUp: async (email: string, password: string): Promise<{ user: User | null, error: any }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { user: null, error: "Supabase not configured" };
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { user: data.user, error };
  },

  signIn: async (email: string, password: string): Promise<{ user: User | null, error: any }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { user: null, error: "Supabase not configured" };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { user: data.user, error };
  },

  signOut: async (): Promise<{ error: any }> => {
    const supabase = getSupabaseClient();
    if (!supabase) return { error: "Supabase not configured" };
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getUser: async (): Promise<User | null> => {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  onAuthStateChange: (callback: (user: User | null) => void) => {
    const supabase = getSupabaseClient();
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
  }
};
