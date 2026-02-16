
import { getSupabaseClient } from './client';
import { STORAGE_CONFIG, SUPABASE_STORAGE_CONFIG } from '../../constants/appConfig';

const BUCKET_NAME = SUPABASE_STORAGE_CONFIG.BUCKET_NAME;

/**
 * Uploads a file to the public storage bucket.
 * Requires the 'public-assets' bucket to be public in Supabase.
 */
export const uploadPublicAsset = async (file: Blob, folder: 'images' | 'videos', extension: string): Promise<string | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const fileName = `${folder}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: String(STORAGE_CONFIG.CACHE_TTL),
        upsert: false
      });

    if (error) {
      // Gracefully handle missing bucket or permission errors
      console.warn(`[Supabase] Upload failed (Bucket '${BUCKET_NAME}' might be missing):`, error.message);
      return null;
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (e) {
    console.error("[Supabase] Storage exception:", e);
    return null;
  }
};
