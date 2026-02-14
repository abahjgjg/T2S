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
  
  placeholders: {
    search: getEnv('VITE_UI_PLACEHOLDER_SEARCH', 'Search...'),
    input: getEnv('VITE_UI_PLACEHOLDER_INPUT', 'Enter value...'),
    select: getEnv('VITE_UI_PLACEHOLDER_SELECT', 'Select an option...'),
    chatBlueprint: getEnv('VITE_UI_PLACEHOLDER_CHAT_BLUEPRINT', 'Ask to change something...'),
    chatResearch: getEnv('VITE_UI_PLACEHOLDER_CHAT_RESEARCH', 'Ask a question...'),
    chatAgent: getEnv('VITE_UI_PLACEHOLDER_CHAT_AGENT', 'Message'),
    email: getEnv('VITE_UI_PLACEHOLDER_EMAIL', 'you@example.com'),
    password: getEnv('VITE_UI_PLACEHOLDER_PASSWORD', '••••••••'),
    name: getEnv('VITE_UI_PLACEHOLDER_NAME', 'e.g. Alex'),
    comment: getEnv('VITE_UI_PLACEHOLDER_COMMENT', '...'),
    affiliateName: getEnv('VITE_UI_PLACEHOLDER_AFFILIATE_NAME', 'e.g. Bluehost'),
    affiliateUrl: getEnv('VITE_UI_PLACEHOLDER_AFFILIATE_URL', 'https://...'),
    affiliateTags: getEnv('VITE_UI_PLACEHOLDER_AFFILIATE_TAGS', 'hosting, server, vps'),
    affiliateDescription: getEnv('VITE_UI_PLACEHOLDER_AFFILIATE_DESC', 'Short recommendation text...'),
  },
  
  chat: {
    blueprintTitle: getEnv('VITE_UI_CHAT_BLUEPRINT_TITLE', 'Blueprint Editor AI'),
    blueprintIntro: getEnv('VITE_UI_CHAT_BLUEPRINT_INTRO', 'Ask me to modify this blueprint.'),
    researchTitle: getEnv('VITE_UI_CHAT_RESEARCH_TITLE', 'Market Analyst AI'),
    researchIntro: getEnv('VITE_UI_CHAT_RESEARCH_INTRO', 'Ask me about these market trends.'),
    researchContext: getEnv('VITE_UI_CHAT_RESEARCH_CONTEXT', 'I have access to the'),
    trendsCount: getEnv('VITE_UI_CHAT_TRENDS_COUNT', 'trends identified.'),
    analyzing: getEnv('VITE_UI_CHAT_ANALYZING', 'Analyzing trends...'),
    errorMessage: getEnv('VITE_UI_CHAT_ERROR', 'Sorry, I encountered an error. Please try again.'),
    researchError: getEnv('VITE_UI_CHAT_RESEARCH_ERROR', "I'm having trouble analyzing the data right now. Please try again."),
    updatedSuccess: getEnv('VITE_UI_CHAT_UPDATED', "✅ I've updated the blueprint with your changes."),
  },
  
  accessibility: {
    skipToContent: getEnv('VITE_UI_A11Y_SKIP_TO_CONTENT', 'Skip to main content'),
    loading: getEnv('VITE_UI_A11Y_LOADING', 'Loading content'),
    closeModal: getEnv('VITE_UI_A11Y_CLOSE_MODAL', 'Close modal'),
    openMenu: getEnv('VITE_UI_A11Y_OPEN_MENU', 'Open menu'),
    goHome: getEnv('VITE_UI_A11Y_GO_HOME', 'Go to Home / Reset'),
    closeAI: getEnv('VITE_UI_A11Y_CLOSE_AI', 'Close AI Assistant'),
    openAI: getEnv('VITE_UI_A11Y_OPEN_AI', 'Open AI Assistant'),
    minimizeChat: getEnv('VITE_UI_A11Y_MINIMIZE_CHAT', 'Minimize Chat'),
    messageBlueprint: getEnv('VITE_UI_A11Y_MSG_BLUEPRINT', 'Message Blueprint Editor'),
    messageAgent: getEnv('VITE_UI_A11Y_MSG_AGENT', 'Message'),
    sendMessage: getEnv('VITE_UI_A11Y_SEND_MSG', 'Send Message'),
    aiTyping: getEnv('VITE_UI_A11Y_AI_TYPING', 'AI is typing'),
    closeChat: getEnv('VITE_UI_A11Y_CLOSE_CHAT', 'Close Chat'),
    askResearch: getEnv('VITE_UI_A11Y_ASK_RESEARCH', 'Ask a research question'),
    copyLanding: getEnv('VITE_UI_A11Y_COPY_LANDING', 'Copy landing page content'),
    copySocial: getEnv('VITE_UI_A11Y_COPY_SOCIAL', 'Copy social post'),
    copyEmail: getEnv('VITE_UI_A11Y_COPY_EMAIL', 'Copy email pitch'),
    copyCode: getEnv('VITE_UI_A11Y_COPY_CODE', 'Copy landing page code'),
    copyPost: getEnv('VITE_UI_A11Y_COPY_POST', 'Copy post content'),
    newResearch: getEnv('VITE_UI_A11Y_NEW_RESEARCH', 'Start New Research (Ctrl+R)'),
    openAdmin: getEnv('VITE_UI_A11Y_OPEN_ADMIN', 'Open Admin Panel'),
    openDashboard: getEnv('VITE_UI_A11Y_OPEN_DASH', 'Open Dashboard'),
    login: getEnv('VITE_UI_A11Y_LOGIN', 'Log In'),
    langId: getEnv('VITE_UI_A11Y_LANG_ID', 'ID - Switch to Indonesian'),
    langEn: getEnv('VITE_UI_A11Y_LANG_EN', 'Switch to English'),
    keyboardHelp: getEnv('VITE_UI_A11Y_KEYBOARD_HELP', 'Open keyboard shortcuts help'),
    dismissError: getEnv('VITE_UI_A11Y_DISMISS_ERROR', 'Dismiss error message'),
    dismissNotif: getEnv('VITE_UI_A11Y_DISMISS_NOTIF', 'Dismiss notification'),
    selectRegion: getEnv('VITE_UI_A11Y_SELECT_REGION', 'Select Region'),
  },
} as const;

// Default export for convenience
export default {
  UI_TEXT,
};
