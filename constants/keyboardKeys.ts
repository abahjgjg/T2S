/**
 * Keyboard Key Constants
 * Flexy: Centralized keyboard key definitions for consistent handling across the application
 * Eliminates hardcoded keyboard key strings
 * All values can be overridden via environment variables.
 */

import { getEnv } from '../utils/envUtils';

/**
 * Navigation keys
 */
export const NAVIGATION_KEYS = {
  ARROW_UP: getEnv('VITE_KEY_ARROW_UP', 'ArrowUp'),
  ARROW_DOWN: getEnv('VITE_KEY_ARROW_DOWN', 'ArrowDown'),
  ARROW_LEFT: getEnv('VITE_KEY_ARROW_LEFT', 'ArrowLeft'),
  ARROW_RIGHT: getEnv('VITE_KEY_ARROW_RIGHT', 'ArrowRight'),
  HOME: getEnv('VITE_KEY_HOME', 'Home'),
  END: getEnv('VITE_KEY_END', 'End'),
  PAGE_UP: getEnv('VITE_KEY_PAGE_UP', 'PageUp'),
  PAGE_DOWN: getEnv('VITE_KEY_PAGE_DOWN', 'PageDown'),
} as const;

/**
 * Action keys
 */
export const ACTION_KEYS = {
  ENTER: getEnv('VITE_KEY_ENTER', 'Enter'),
  ESCAPE: getEnv('VITE_KEY_ESCAPE', 'Escape'),
  SPACE: getEnv('VITE_KEY_SPACE', ' '),
  TAB: getEnv('VITE_KEY_TAB', 'Tab'),
  BACKSPACE: getEnv('VITE_KEY_BACKSPACE', 'Backspace'),
  DELETE: getEnv('VITE_KEY_DELETE', 'Delete'),
} as const;

/**
 * Modifier keys
 */
export const MODIFIER_KEYS = {
  CONTROL: getEnv('VITE_KEY_CONTROL', 'Control'),
  ALT: getEnv('VITE_KEY_ALT', 'Alt'),
  SHIFT: getEnv('VITE_KEY_SHIFT', 'Shift'),
  META: getEnv('VITE_KEY_META', 'Meta'),
} as const;

/**
 * Alphanumeric keys (common ones)
 */
export const ALPHA_KEYS = {
  A: getEnv('VITE_KEY_A', 'a'),
  B: getEnv('VITE_KEY_B', 'b'),
  C: getEnv('VITE_KEY_C', 'c'),
  D: getEnv('VITE_KEY_D', 'd'),
  E: getEnv('VITE_KEY_E', 'e'),
  F: getEnv('VITE_KEY_F', 'f'),
  G: getEnv('VITE_KEY_G', 'g'),
  H: getEnv('VITE_KEY_H', 'h'),
  I: getEnv('VITE_KEY_I', 'i'),
  J: getEnv('VITE_KEY_J', 'j'),
  K: getEnv('VITE_KEY_K', 'k'),
  L: getEnv('VITE_KEY_L', 'l'),
  M: getEnv('VITE_KEY_M', 'm'),
  N: getEnv('VITE_KEY_N', 'n'),
  O: getEnv('VITE_KEY_O', 'o'),
  P: getEnv('VITE_KEY_P', 'p'),
  Q: getEnv('VITE_KEY_Q', 'q'),
  R: getEnv('VITE_KEY_R', 'r'),
  S: getEnv('VITE_KEY_S', 's'),
  T: getEnv('VITE_KEY_T', 't'),
  U: getEnv('VITE_KEY_U', 'u'),
  V: getEnv('VITE_KEY_V', 'v'),
  W: getEnv('VITE_KEY_W', 'w'),
  X: getEnv('VITE_KEY_X', 'x'),
  Y: getEnv('VITE_KEY_Y', 'y'),
  Z: getEnv('VITE_KEY_Z', 'z'),
} as const;

/**
 * Numeric keys
 */
export const NUMBER_KEYS = {
  ZERO: getEnv('VITE_KEY_0', '0'),
  ONE: getEnv('VITE_KEY_1', '1'),
  TWO: getEnv('VITE_KEY_2', '2'),
  THREE: getEnv('VITE_KEY_3', '3'),
  FOUR: getEnv('VITE_KEY_4', '4'),
  FIVE: getEnv('VITE_KEY_5', '5'),
  SIX: getEnv('VITE_KEY_6', '6'),
  SEVEN: getEnv('VITE_KEY_7', '7'),
  EIGHT: getEnv('VITE_KEY_8', '8'),
  NINE: getEnv('VITE_KEY_9', '9'),
} as const;

/**
 * Function keys
 */
export const FUNCTION_KEYS = {
  F1: getEnv('VITE_KEY_F1', 'F1'),
  F2: getEnv('VITE_KEY_F2', 'F2'),
  F3: getEnv('VITE_KEY_F3', 'F3'),
  F4: getEnv('VITE_KEY_F4', 'F4'),
  F5: getEnv('VITE_KEY_F5', 'F5'),
  F6: getEnv('VITE_KEY_F6', 'F6'),
  F7: getEnv('VITE_KEY_F7', 'F7'),
  F8: getEnv('VITE_KEY_F8', 'F8'),
  F9: getEnv('VITE_KEY_F9', 'F9'),
  F10: getEnv('VITE_KEY_F10', 'F10'),
  F11: getEnv('VITE_KEY_F11', 'F11'),
  F12: getEnv('VITE_KEY_F12', 'F12'),
} as const;

/**
 * Special character keys
 */
export const SPECIAL_KEYS = {
  QUESTION_MARK: getEnv('VITE_KEY_QUESTION', '?'),
  SLASH: getEnv('VITE_KEY_SLASH', '/'),
  BACKSLASH: getEnv('VITE_KEY_BACKSLASH', '\\'),
  PERIOD: getEnv('VITE_KEY_PERIOD', '.'),
  COMMA: getEnv('VITE_KEY_COMMA', ','),
  SEMICOLON: getEnv('VITE_KEY_SEMICOLON', ';'),
  QUOTE: getEnv('VITE_KEY_QUOTE', "'"),
  DOUBLE_QUOTE: getEnv('VITE_KEY_DOUBLE_QUOTE', '"'),
  BACKTICK: getEnv('VITE_KEY_BACKTICK', '`'),
  MINUS: getEnv('VITE_KEY_MINUS', '-'),
  EQUAL: getEnv('VITE_KEY_EQUAL', '='),
  BRACKET_LEFT: getEnv('VITE_KEY_BRACKET_LEFT', '['),
  BRACKET_RIGHT: getEnv('VITE_KEY_BRACKET_RIGHT', ']'),
} as const;

/**
 * Combined keyboard keys export
 */
export const KEYBOARD_KEYS = {
  ...NAVIGATION_KEYS,
  ...ACTION_KEYS,
  ...MODIFIER_KEYS,
  ...ALPHA_KEYS,
  ...NUMBER_KEYS,
  ...FUNCTION_KEYS,
  ...SPECIAL_KEYS,
} as const;

/**
 * Type for all keyboard key values
 */
export type KeyboardKey = typeof KEYBOARD_KEYS[keyof typeof KEYBOARD_KEYS];

/**
 * Check if a key is a navigation key
 */
export const isNavigationKey = (key: string): boolean => 
  Object.values(NAVIGATION_KEYS).includes(key as any);

/**
 * Check if a key is an action key
 */
export const isActionKey = (key: string): boolean => 
  Object.values(ACTION_KEYS).includes(key as any);

/**
 * Check if a key is a modifier key
 */
export const isModifierKey = (key: string): boolean => 
  Object.values(MODIFIER_KEYS).includes(key as any);

/**
 * Helper to check if keyboard event matches a specific key
 */
export const isKey = (event: KeyboardEvent, key: KeyboardKey): boolean => 
  event.key === key;

/**
 * Helper to check if keyboard event matches any of the given keys
 */
export const isAnyKey = (event: KeyboardEvent, keys: KeyboardKey[]): boolean => 
  keys.includes(event.key as KeyboardKey);

/**
 * Prevent default browser behavior for specific keys
 * Commonly used for modal close on Escape, etc.
 */
export const preventDefaultForKeys = (
  event: KeyboardEvent, 
  keys: KeyboardKey[]
): void => {
  if (isAnyKey(event, keys)) {
    event.preventDefault();
  }
};

/**
 * Stop propagation for specific keys
 */
export const stopPropagationForKeys = (
  event: KeyboardEvent, 
  keys: KeyboardKey[]
): void => {
  if (isAnyKey(event, keys)) {
    event.stopPropagation();
  }
};

export default {
  NAVIGATION_KEYS,
  ACTION_KEYS,
  MODIFIER_KEYS,
  ALPHA_KEYS,
  NUMBER_KEYS,
  FUNCTION_KEYS,
  SPECIAL_KEYS,
  KEYBOARD_KEYS,
  isNavigationKey,
  isActionKey,
  isModifierKey,
  isKey,
  isAnyKey,
  preventDefaultForKeys,
  stopPropagationForKeys,
};
