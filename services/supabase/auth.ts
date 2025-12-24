
import { User } from '@supabase/supabase-js';
import { supabase } from './client';

export const auth = {
  signUp: async (email: string, password: string): Promise<{ user: User | null, error: any }> => {
    if (!supabase) return { user: null, error: "Supabase not configured" };
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { user: data.user, error };
  },

  signIn: async (email: string, password: string): Promise<{ user: User | null, error: any }> => {
    if (!supabase) return { user: null, error: "Supabase not configured" };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { user: data.user, error };
  },

  signOut: async (): Promise<{ error: any }> => {
    if (!supabase) return { error: "Supabase not configured" };
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getUser: async (): Promise<User | null> => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  onAuthStateChange: (callback: (user: User | null) => void) => {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
  }
};
