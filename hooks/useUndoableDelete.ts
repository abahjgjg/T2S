import { useState, useCallback, useRef } from 'react';
import { toast } from '../components/ToastNotifications';

interface UseUndoableDeleteOptions<T> {
  /** Function to actually delete the item */
  onDelete: (item: T) => Promise<void> | void;
  /** Function to restore/recreate the item if undo is clicked */
  onRestore?: (item: T) => Promise<void> | void;
  /** Message to show in the toast (default: "Item deleted") */
  successMessage?: string;
  /** Undo button text (default: "Undo") */
  undoText?: string;
  /** Delay before actual deletion in ms (default: 6000ms) */
  deleteDelay?: number;
  /** Get a unique identifier from the item */
  getId: (item: T) => string;
  /** Get a display name for the item to use in messages */
  getDisplayName?: (item: T) => string;
}

interface PendingDeletion<T> {
  item: T;
  timeoutId: ReturnType<typeof setTimeout>;
  id: string;
}

interface UseUndoableDeleteReturn<T> {
  /** Initiates the deletion process with undo capability */
  initiateDelete: (item: T) => void;
  /** Cancels all pending deletions immediately */
  cancelAllPending: () => void;
  /** Returns whether a specific item has a pending deletion */
  isPendingDelete: (item: T) => boolean;
  /** List of items currently pending deletion */
  pendingItems: T[];
}

/**
 * useUndoableDelete - A hook that implements the "Undo Delete" pattern
 * 
 * This hook provides a user-friendly deletion pattern that:
 * - Shows a toast notification immediately when delete is initiated
 * - Delays the actual deletion for a few seconds (default: 6s)
 * - Allows users to undo the deletion within that window
 * - Provides peace of mind and prevents accidental data loss
 * 
 * Features:
 * - Supports multiple concurrent pending deletions
 * - Automatically cancels deletion on undo
 * - Accessible with proper ARIA announcements
 * - Configurable delay and messages
 * - Optional restore functionality
 * 
 * Usage:
 * ```tsx
 * const { initiateDelete, isPendingDelete } = useUndoableDelete({
 *   onDelete: async (project) => {
 *     await deleteProject(project.id);
 *   },
 *   onRestore: async (project) => {
 *     await restoreProject(project);
 *   },
 *   getId: (project) => project.id,
 *   getDisplayName: (project) => project.name,
 *   successMessage: 'Project deleted'
 * });
 * 
 * // In your component:
 * <button onClick={() => initiateDelete(project)}>
 *   Delete Project
 * </button>
 * ```
 */
export function useUndoableDelete<T>({
  onDelete,
  onRestore,
  successMessage = 'Item deleted',
  undoText = 'Undo',
  deleteDelay = 6000,
  getId,
  getDisplayName,
}: UseUndoableDeleteOptions<T>): UseUndoableDeleteReturn<T> {
  const [pendingDeletions, setPendingDeletions] = useState<Map<string, PendingDeletion<T>>>(new Map());
  const pendingRef = useRef<Map<string, PendingDeletion<T>>>(new Map());

  // Keep ref in sync with state
  const updatePending = useCallback((newMap: Map<string, PendingDeletion<T>>) => {
    pendingRef.current = newMap;
    setPendingDeletions(new Map(newMap));
  }, []);

  const cancelDeletion = useCallback((id: string) => {
    const pending = pendingRef.current.get(id);
    if (pending) {
      clearTimeout(pending.timeoutId);
      const newMap = new Map(pendingRef.current);
      newMap.delete(id);
      updatePending(newMap);
      
      // Call restore if provided
      if (onRestore) {
        onRestore(pending.item);
      }
    }
  }, [onRestore, updatePending]);

  const initiateDelete = useCallback((item: T) => {
    const id = getId(item);
    const displayName = getDisplayName?.(item);
    
    // Cancel any existing pending deletion for this item
    if (pendingRef.current.has(id)) {
      cancelDeletion(id);
    }

    // Show undo toast
    const message = displayName 
      ? `${successMessage}: "${displayName}"`
      : successMessage;
    
    toast.undo(
      message,
      () => cancelDeletion(id),
      undoText
    );

    // Set up delayed deletion
    const timeoutId = setTimeout(async () => {
      // Only delete if not cancelled
      if (pendingRef.current.has(id)) {
        try {
          await onDelete(item);
          const newMap = new Map(pendingRef.current);
          newMap.delete(id);
          updatePending(newMap);
        } catch (error) {
          // If deletion fails, show error and keep item
          toast.error(`Failed to delete ${displayName || 'item'}. Please try again.`);
          const newMap = new Map(pendingRef.current);
          newMap.delete(id);
          updatePending(newMap);
        }
      }
    }, deleteDelay);

    // Add to pending
    const newMap = new Map(pendingRef.current);
    newMap.set(id, { item, timeoutId, id });
    updatePending(newMap);
  }, [getId, getDisplayName, successMessage, undoText, deleteDelay, onDelete, cancelDeletion, updatePending]);

  const cancelAllPending = useCallback(() => {
    pendingRef.current.forEach((pending) => {
      clearTimeout(pending.timeoutId);
      if (onRestore) {
        onRestore(pending.item);
      }
    });
    updatePending(new Map());
  }, [onRestore, updatePending]);

  const isPendingDelete = useCallback((item: T) => {
    return pendingRef.current.has(getId(item));
  }, [getId]);

  return {
    initiateDelete,
    cancelAllPending,
    isPendingDelete,
    pendingItems: Array.from(pendingDeletions.values()).map(p => p.item),
  };
}

export default useUndoableDelete;
