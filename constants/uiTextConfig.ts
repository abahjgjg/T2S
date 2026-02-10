/**
 * UI Text Configuration
 * Centralized text content for UI components
 * Flexy: Uses centralized env utilities for modularity
 * All values can be overridden via environment variables.
 */

import { getEnv } from '../utils/envUtils';

// Error messages
export const UI_TEXT = {
  errors: {
    genericTitle: getEnv('VITE_UI_ERROR_TITLE', 'Something went wrong'),
    genericDescription: getEnv('VITE_UI_ERROR_DESCRIPTION', 'The application encountered an unexpected error. This might be due to a temporary glitch or data issue.'),
    reloadButton: getEnv('VITE_UI_ERROR_RELOAD', 'Reload Application'),
    notFound: getEnv('VITE_UI_ERROR_NOT_FOUND', 'Page not found'),
    forbidden: getEnv('VITE_UI_ERROR_FORBIDDEN', 'Access denied'),
    networkError: getEnv('VITE_UI_ERROR_NETWORK', 'Network connection error. Please check your internet connection.'),
    timeoutError: getEnv('VITE_UI_ERROR_TIMEOUT', 'Request timed out. Please try again.'),
    unknownError: getEnv('VITE_UI_ERROR_UNKNOWN', 'An unknown error occurred.'),
  },
  
  buttons: {
    submit: getEnv('VITE_UI_BUTTON_SUBMIT', 'Submit'),
    cancel: getEnv('VITE_UI_BUTTON_CANCEL', 'Cancel'),
    save: getEnv('VITE_UI_BUTTON_SAVE', 'Save'),
    delete: getEnv('VITE_UI_BUTTON_DELETE', 'Delete'),
    edit: getEnv('VITE_UI_BUTTON_EDIT', 'Edit'),
    close: getEnv('VITE_UI_BUTTON_CLOSE', 'Close'),
    continue: getEnv('VITE_UI_BUTTON_CONTINUE', 'Continue'),
    back: getEnv('VITE_UI_BUTTON_BACK', 'Back'),
    next: getEnv('VITE_UI_BUTTON_NEXT', 'Next'),
    loading: getEnv('VITE_UI_BUTTON_LOADING', 'Loading...'),
    retry: getEnv('VITE_UI_BUTTON_RETRY', 'Retry'),
  },
  
  loading: {
    default: getEnv('VITE_UI_LOADING_DEFAULT', 'Loading...'),
    generating: getEnv('VITE_UI_LOADING_GENERATING', 'Generating...'),
    processing: getEnv('VITE_UI_LOADING_PROCESSING', 'Processing...'),
    analyzing: getEnv('VITE_UI_LOADING_ANALYZING', 'Analyzing...'),
    searching: getEnv('VITE_UI_LOADING_SEARCHING', 'Searching...'),
    saving: getEnv('VITE_UI_LOADING_SAVING', 'Saving...'),
    pleaseWait: getEnv('VITE_UI_LOADING_PLEASE_WAIT', 'Please wait...'),
  },
  
  emptyStates: {
    noData: getEnv('VITE_UI_EMPTY_NO_DATA', 'No data available'),
    noResults: getEnv('VITE_UI_EMPTY_NO_RESULTS', 'No results found'),
    noProjects: getEnv('VITE_UI_EMPTY_NO_PROJECTS', 'No projects yet'),
    noTrends: getEnv('VITE_UI_EMPTY_NO_TRENDS', 'No trends found'),
    noIdeas: getEnv('VITE_UI_EMPTY_NO_IDEAS', 'No ideas generated yet'),
    startSearch: getEnv('VITE_UI_EMPTY_START_SEARCH', 'Enter a search term to begin'),
  },
  
  confirmation: {
    delete: getEnv('VITE_UI_CONFIRM_DELETE', 'Are you sure you want to delete this?'),
    discard: getEnv('VITE_UI_CONFIRM_DISCARD', 'Discard changes?'),
    logout: getEnv('VITE_UI_CONFIRM_LOGOUT', 'Are you sure you want to log out?'),
    unsaved: getEnv('VITE_UI_CONFIRM_UNSAVED', 'You have unsaved changes. Are you sure you want to leave?'),
  },
  
  accessibility: {
    skipToContent: getEnv('VITE_UI_A11Y_SKIP_TO_CONTENT', 'Skip to main content'),
    loading: getEnv('VITE_UI_A11Y_LOADING', 'Loading content'),
    closeModal: getEnv('VITE_UI_A11Y_CLOSE_MODAL', 'Close modal'),
    openMenu: getEnv('VITE_UI_A11Y_OPEN_MENU', 'Open menu'),
    goHome: getEnv('VITE_UI_A11Y_GO_HOME', 'Go to Home / Reset'),
  },
  
  placeholders: {
    search: getEnv('VITE_UI_PLACEHOLDER_SEARCH', 'Search...'),
    input: getEnv('VITE_UI_PLACEHOLDER_INPUT', 'Enter value...'),
    select: getEnv('VITE_UI_PLACEHOLDER_SELECT', 'Select an option...'),
  },
} as const;

// Default export for convenience
export default {
  UI_TEXT,
};
