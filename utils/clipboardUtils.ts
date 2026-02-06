
import { toast } from '../components/ToastNotifications';
import { UI_TIMING } from '../constants/uiConfig';

export interface ClipboardOptions {
  successMessage?: string;
  showToast?: boolean;
}

/**
 * Copy text to clipboard with optional toast notification
 * @param text - Text to copy
 * @param options - Configuration options
 * @returns Promise<boolean> - Success status
 */
export const copyToClipboard = async (
  text: string,
  options: ClipboardOptions = {}
): Promise<boolean> => {
  const { successMessage = 'Copied to clipboard', showToast = true } = options;
  
  try {
    await navigator.clipboard.writeText(text);
    if (showToast) {
      toast.success(successMessage);
    }
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    if (showToast) {
      toast.error('Failed to copy');
    }
    return false;
  }
};

/**
 * Copy text to clipboard with state management for feedback UI
 * @param text - Text to copy
 * @param setCopied - State setter for copy feedback
 * @param duration - Duration to show feedback (defaults to UI_TIMING.COPY_FEEDBACK_DURATION)
 */
export const copyWithFeedback = async (
  text: string,
  setCopied: (value: boolean) => void,
  duration: number = UI_TIMING.COPY_FEEDBACK_DURATION
): Promise<void> => {
  const success = await copyToClipboard(text, { showToast: false });
  
  if (success) {
    setCopied(true);
    setTimeout(() => setCopied(false), duration);
  }
};
