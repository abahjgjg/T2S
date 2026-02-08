
import { BusinessIdea, Blueprint, PublishedBlueprint, Comment } from '../../types';
import { supabase } from './client';
import { QUERY_LIMITS } from '../../constants/aiConfig';
import { DATABASE_TABLES } from '../../constants/databaseTables';
import { STORAGE_KEYS } from '../../constants/storageConfig';

const VOTES_STORAGE_KEY = STORAGE_KEYS.VOTES;

// --- DB Row Definition ---
interface DBBlueprintRow {
  id: string;
  niche: string;
  title: string;
  summary: string;
  full_data: {
    idea: BusinessIdea;
    blueprint: Blueprint;
  };
  votes: number;
  created_at: string;
  user_id?: string;
}

// --- Public Blueprints ---

interface PublishPayload {
  niche: string;
  title: string;
  summary: string;
  full_data: {
    idea: BusinessIdea;
    blueprint: Blueprint;
  };
  votes: number;
  user_id?: string;
}

export const publishBlueprint = async (niche: string, idea: BusinessIdea, blueprint: Blueprint, userId?: string): Promise<string | null> => {
  if (!supabase) return null; // Fail silently if not configured

  // Check if duplicate exists to prevent spamming DB with same generations
  const { data: existing } = await supabase
    .from(DATABASE_TABLES.PUBLISHED_BLUEPRINTS)
    .select('id')
    .eq('niche', niche)
    .eq('title', idea.name)
    .limit(1);

  if (existing && existing.length > 0) {
    return existing[0].id;
  }

  const payload: PublishPayload = { 
    niche, 
    title: idea.name,
    summary: blueprint.executiveSummary,
    full_data: { idea, blueprint },
    votes: 0
  };

  if (userId) {
    payload.user_id = userId;
  }

  const { data, error } = await supabase
    .from(DATABASE_TABLES.PUBLISHED_BLUEPRINTS)
    .insert([payload])
    .select('id')
    .single();

  if (error) {
    console.error("Supabase error:", error);
    return null;
  }

  return data?.id || null;
};

export const fetchBlueprint = async (id: string): Promise<PublishedBlueprint | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(DATABASE_TABLES.PUBLISHED_BLUEPRINTS)
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Supabase fetch error:", error);
    return null;
  }

  return data as PublishedBlueprint;
};

export const findBlueprintsByNiche = async (niche: string): Promise<BusinessIdea[]> => {
  if (!supabase) return [];

  // Simple text search on niche column
  const { data, error } = await supabase
    .from(DATABASE_TABLES.PUBLISHED_BLUEPRINTS)
    .select('*')
    .ilike('niche', `%${niche}%`) 
    .order('votes', { ascending: false }) // Prioritize popular ones
    .limit(QUERY_LIMITS.FEATURED_ITEMS);

  if (error || !data) return [];

  // Map published blueprints back to BusinessIdea structure
  // We attach the full blueprint to 'cachedBlueprint' so we don't need AI to generate it again
  return (data as DBBlueprintRow[]).map((item) => {
    const full = item.full_data;
    return {
      ...full.idea,
      id: item.id, // Use Supabase ID
      rationale: `COMMUNITY (${item.votes || 0} Votes)`, // Custom label
      cachedBlueprint: full.blueprint
    };
  });
};

export const searchPublicBlueprints = async (
  searchTerm: string,
  sortBy: 'newest' | 'popular',
  page: number = 0,
  limit: number = QUERY_LIMITS.DEFAULT_PAGE_SIZE
): Promise<PublishedBlueprint[]> => {
  if (!supabase) return [];

  const from = page * limit;
  const to = from + limit - 1;

  let query = supabase
    .from(DATABASE_TABLES.PUBLISHED_BLUEPRINTS)
    .select('*')
    .range(from, to);

  // Server-side filtering
  if (searchTerm) {
    // Search in both title and niche
    query = query.or(`title.ilike.%${searchTerm}%,niche.ilike.%${searchTerm}%`);
  }

  if (sortBy === 'popular') {
    query = query.order('votes', { ascending: false, nullsFirst: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase search directory error:", error);
    return [];
  }

  return data as PublishedBlueprint[];
};

export const getUserPublishedBlueprints = async (userId: string): Promise<PublishedBlueprint[]> => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(DATABASE_TABLES.PUBLISHED_BLUEPRINTS)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Failed to fetch user blueprints:", error);
    return [];
  }

  return data as PublishedBlueprint[];
};

export const deletePublishedBlueprint = async (id: string, userId: string): Promise<boolean> => {
  if (!supabase) return false;

  const { error } = await supabase
    .from(DATABASE_TABLES.PUBLISHED_BLUEPRINTS)
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error("Failed to delete blueprint:", error);
    return false;
  }
  return true;
};

// --- Voting System ---

export const hasVoted = (id: string): boolean => {
  const votedIds = JSON.parse(localStorage.getItem(VOTES_STORAGE_KEY) || '[]');
  return votedIds.includes(id);
};

export const voteBlueprint = async (id: string): Promise<number | null> => {
  if (!supabase) return null;
  if (hasVoted(id)) return null;

  try {
    // 1. Fetch current
    const { data } = await supabase
      .from(DATABASE_TABLES.PUBLISHED_BLUEPRINTS)
      .select('votes')
      .eq('id', id)
      .single();
    
    if (data) {
      const newCount = (data.votes || 0) + 1;
      
      // 2. Update
      const { error } = await supabase
        .from(DATABASE_TABLES.PUBLISHED_BLUEPRINTS)
        .update({ votes: newCount })
        .eq('id', id);

      if (!error) {
        // 3. Mark locally
        const votedIds = JSON.parse(localStorage.getItem(VOTES_STORAGE_KEY) || '[]');
        votedIds.push(id);
        localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(votedIds));
        
        return newCount;
      }
    }
  } catch (e) {
    console.warn("Vote failed", e);
  }
  return null;
};

// --- Comment System ---

export const fetchComments = async (blueprintId: string): Promise<Comment[]> => {
  if (!supabase) return [];
  
  // We try to fetch. If table doesn't exist, it will return error, we catch it.
  try {
    const { data, error } = await supabase
      .from(DATABASE_TABLES.COMMENTS)
      .select('*')
      .eq('blueprint_id', blueprintId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Could not fetch comments (Table might not exist yet)", error.message);
      return [];
    }
    return data as Comment[];
  } catch (e) {
    return [];
  }
};

export const postComment = async (blueprintId: string, authorName: string, content: string): Promise<Comment | null> => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from(DATABASE_TABLES.COMMENTS)
      .insert([{
        blueprint_id: blueprintId,
        author_name: authorName,
        content: content
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data as Comment;
  } catch (e) {
    console.error("Failed to post comment", e);
    return null;
  }
};
