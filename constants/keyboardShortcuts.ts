/**
 * Keyboard Shortcuts Configuration
 * Flexy: Centralized keyboard shortcuts for consistent UX across the application
 * All shortcuts can be customized via environment variables.
 */

import { getEnv, getEnvBoolean } from '../utils/envUtils';

// ============================================================================
// KEYBOARD MODIFIERS
// ============================================================================

export const MODIFIERS = {
  ctrl: getEnv('VITE_KB_MODIFIER_CTRL', 'ctrlKey'),
  cmd: getEnv('VITE_KB_MODIFIER_CMD', 'metaKey'),
  alt: getEnv('VITE_KB_MODIFIER_ALT', 'altKey'),
  shift: getEnv('VITE_KB_MODIFIER_SHIFT', 'shiftKey'),
} as const;

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

export const KEYBOARD_SHORTCUTS = {
  // Navigation
  navigation: {
    newResearch: {
      key: getEnv('VITE_KB_NEW_RESEARCH_KEY', 'r'),
      modifiers: [MODIFIERS.ctrl, MODIFIERS.cmd],
      description: 'Start new research',
      descriptionId: 'Start new research / Mulai riset baru',
      enabled: getEnvBoolean('VITE_KB_NEW_RESEARCH_ENABLED', true),
    },
    goHome: {
      key: getEnv('VITE_KB_GO_HOME_KEY', 'h'),
      modifiers: [MODIFIERS.ctrl, MODIFIERS.cmd],
      description: 'Go to home',
      descriptionId: 'Go to home / Ke beranda',
      enabled: getEnvBoolean('VITE_KB_GO_HOME_ENABLED', true),
    },
    openLibrary: {
      key: getEnv('VITE_KB_OPEN_LIBRARY_KEY', 'l'),
      modifiers: [MODIFIERS.ctrl, MODIFIERS.cmd],
      description: 'Open library',
      descriptionId: 'Open library / Buka perpustakaan',
      enabled: getEnvBoolean('VITE_KB_OPEN_LIBRARY_ENABLED', true),
    },
    openDirectory: {
      key: getEnv('VITE_KB_OPEN_DIRECTORY_KEY', 'd'),
      modifiers: [MODIFIERS.ctrl, MODIFIERS.cmd],
      description: 'Open directory',
      descriptionId: 'Open directory / Buka direktori',
      enabled: getEnvBoolean('VITE_KB_OPEN_DIRECTORY_ENABLED', true),
    },
  },
  
  // Actions
  actions: {
    submit: {
      key: getEnv('VITE_KB_SUBMIT_KEY', 'Enter'),
      modifiers: [],
      description: 'Submit form',
      descriptionId: 'Submit / Kirim',
      enabled: getEnvBoolean('VITE_KB_SUBMIT_ENABLED', true),
    },
    closeModal: {
      key: getEnv('VITE_KB_CLOSE_MODAL_KEY', 'Escape'),
      modifiers: [],
      description: 'Close modal',
      descriptionId: 'Close modal / Tutup modal',
      enabled: getEnvBoolean('VITE_KB_CLOSE_MODAL_ENABLED', true),
    },
    search: {
      key: getEnv('VITE_KB_SEARCH_KEY', 'k'),
      modifiers: [MODIFIERS.ctrl, MODIFIERS.cmd],
      description: 'Focus search',
      descriptionId: 'Focus search / Fokus pencarian',
      enabled: getEnvBoolean('VITE_KB_SEARCH_ENABLED', true),
    },
  },
  
  // Help
  help: {
    showShortcuts: {
      key: getEnv('VITE_KB_SHOW_SHORTCUTS_KEY', '?'),
      modifiers: [],
      description: 'Show keyboard shortcuts',
      descriptionId: 'Show shortcuts / Tampilkan pintasan',
      enabled: getEnvBoolean('VITE_KB_SHOW_SHORTCUTS_ENABLED', true),
    },
  },
  
  // Admin
  admin: {
    openAdmin: {
      key: getEnv('VITE_KB_OPEN_ADMIN_KEY', 'a'),
      modifiers: [MODIFIERS.ctrl, MODIFIERS.cmd, MODIFIERS.shift],
      description: 'Open admin panel',
      descriptionId: 'Open admin / Buka admin',
      enabled: getEnvBoolean('VITE_KB_OPEN_ADMIN_ENABLED', true),
    },
  },
} as const;

// ============================================================================
// SHORTCUT DISPLAY FORMATTING
// ============================================================================

export const SHORTCUT_DISPLAY = {
  // Platform detection for displaying correct modifier symbols
  isMac: typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform),
  
  // Modifier symbols
  symbols: {
    ctrl: '⌃',
    cmd: '⌘',
    alt: '⌥',
    shift: '⇧',
    windows: '⊞',
  },
  
  // Modifier labels
  labels: {
    ctrl: 'Ctrl',
    cmd: 'Cmd',
    alt: 'Alt',
    shift: 'Shift',
    windows: 'Win',
  },
} as const;

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface ShortcutConfig {
  key: string;
  modifiers: readonly string[];
  description: string;
  descriptionId: string;
  enabled: boolean;
}

export type ShortcutCategory = keyof typeof KEYBOARD_SHORTCUTS;
export type ShortcutAction<T extends ShortcutCategory> = keyof typeof KEYBOARD_SHORTCUTS[T];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format a shortcut for display
 * Flexy loves this modular approach!
 */
export const formatShortcut = (shortcut: ShortcutConfig): string => {
  const { isMac, symbols, labels } = SHORTCUT_DISPLAY;
  
  const modifierSymbols = shortcut.modifiers.map(mod => {
    switch (mod) {
      case MODIFIERS.ctrl:
        return isMac ? symbols.ctrl : labels.ctrl;
      case MODIFIERS.cmd:
        return isMac ? symbols.cmd : labels.ctrl;
      case MODIFIERS.alt:
        return isMac ? symbols.alt : labels.alt;
      case MODIFIERS.shift:
        return isMac ? symbols.shift : labels.shift;
      default:
        return '';
    }
  });
  
  const key = shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
  
  return [...modifierSymbols, key].join(isMac ? '' : '+');
};

/**
 * Check if a keyboard event matches a shortcut
 */
export const matchesShortcut = (
  event: KeyboardEvent,
  shortcut: ShortcutConfig
): boolean => {
  if (!shortcut.enabled) return false;
  
  // Check if key matches
  if (event.key !== shortcut.key && event.code !== `Key${shortcut.key.toUpperCase()}`) {
    return false;
  }
  
  // Check modifiers
  for (const modifier of shortcut.modifiers) {
    if (modifier === MODIFIERS.ctrl && !event.ctrlKey) return false;
    if (modifier === MODIFIERS.cmd && !event.metaKey) return false;
    if (modifier === MODIFIERS.alt && !event.altKey) return false;
    if (modifier === MODIFIERS.shift && !event.shiftKey) return false;
  }
  
  return true;
};

/**
 * Check if the event matches any modifier requirement
 */
export const hasRequiredModifiers = (
  event: KeyboardEvent,
  shortcut: ShortcutConfig
): boolean => {
  if (shortcut.modifiers.length === 0) return true;
  
  return shortcut.modifiers.some(modifier => {
    switch (modifier) {
      case MODIFIERS.ctrl:
      case MODIFIERS.cmd:
        return event.ctrlKey || event.metaKey;
      case MODIFIERS.alt:
        return event.altKey;
      case MODIFIERS.shift:
        return event.shiftKey;
      default:
        return false;
    }
  });
};

/**
 * Get all enabled shortcuts as an array for display
 */
export const getEnabledShortcuts = (): Array<{
  category: string;
  action: string;
  shortcut: ShortcutConfig;
  display: string;
}> => {
  const shortcuts: Array<{
    category: string;
    action: string;
    shortcut: ShortcutConfig;
    display: string;
  }> = [];
  
  Object.entries(KEYBOARD_SHORTCUTS).forEach(([category, actions]) => {
    Object.entries(actions).forEach(([action, shortcut]) => {
      if (shortcut.enabled) {
        shortcuts.push({
          category,
          action,
          shortcut,
          display: formatShortcut(shortcut),
        });
      }
    });
  });
  
  return shortcuts;
};

/**
 * Check if an element is an input field
 */
export const isInputElement = (element: Element | null): boolean => {
  if (!element) return false;
  
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement ||
    element instanceof HTMLSelectElement ||
    element.getAttribute('contenteditable') === 'true'
  );
};

export default {
  MODIFIERS,
  KEYBOARD_SHORTCUTS,
  SHORTCUT_DISPLAY,
  formatShortcut,
  matchesShortcut,
  hasRequiredModifiers,
  getEnabledShortcuts,
  isInputElement,
};
