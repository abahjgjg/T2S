
import { SavedProject } from '../../types';
import { getSupabaseClient } from './client';

// --- Cloud Library (Personal Collections) ---

export const saveCloudProject = async (project: SavedProject, userId: string): Promise<{ error: any }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Database not configured" };
  
  // We assume a 'saved_projects' table exists with: id (uuid), user_id (uuid), data (jsonb), created_at
  const { error } = await supabase
    .from('saved_projects')
    .upsert({
      id: project.id, // Use same ID
      user_id: userId,
      data: project,
      updated_at: new Date().toISOString()
    });
    
  return { error };
};

export const getCloudProjects = async (userId: string): Promise<{ data: SavedProject[], error: any }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { data: [], error: "Database not configured" };

  const { data, error } = await supabase
    .from('saved_projects')
    .select('data')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) return { data: [], error };
  
  // Unwrap the JSONB 'data' column
  const projects = data?.map((row: any) => row.data) || [];
  return { data: projects, error: null };
};

export const deleteCloudProject = async (id: string, userId: string): Promise<{ error: any }> => {
  const supabase = getSupabaseClient();
  if (!supabase) return { error: "Database not configured" };

  const { error } = await supabase
    .from('saved_projects')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  return { error };
};
