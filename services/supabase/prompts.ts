
import { supabase } from './client';

export const getRemotePrompts = async (): Promise<Record<string, string>> => {
  if (!supabase) return {};

  try {
    const { data, error } = await supabase
      .from('system_prompts')
      .select('key, template');

    if (error) {
      console.warn("Failed to fetch remote prompts:", error.message);
      return {};
    }

    // Convert array to record
    const prompts: Record<string, string> = {};
    data.forEach((row: any) => {
      prompts[row.key] = row.template;
    });
    return prompts;
  } catch (e) {
    console.error("Supabase prompt fetch error", e);
    return {};
  }
};

export const saveRemotePrompt = async (key: string, template: string): Promise<boolean> => {
  if (!supabase) return false;

  const { error } = await supabase
    .from('system_prompts')
    .upsert({ 
      key, 
      template, 
      updated_at: new Date().toISOString() 
    });

  if (error) {
    console.error("Failed to save prompt remotely:", error);
    return false;
  }
  return true;
};

export const deleteRemotePrompt = async (key: string): Promise<boolean> => {
  if (!supabase) return false;

  const { error } = await supabase
    .from('system_prompts')
    .delete()
    .eq('key', key);

  if (error) {
    console.error("Failed to reset prompt remotely:", error);
    return false;
  }
  return true;
};
