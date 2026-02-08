
/**
 * DateTime Configuration
 * Centralized date and time formatting patterns
 * Flexy: Eliminating hardcoded date format values
 */



// Standard date format options for Intl.DateTimeFormat
export const DATE_FORMATS: Record<string, globalThis.Intl.DateTimeFormatOptions> = {
  // Full locale date (e.g., "January 1, 2024")
  FULL_LOCALE: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  // Compact date (e.g., "Jan 1, 2024")
  COMPACT: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  // Date with time (e.g., "January 1, 2024, 2:30 PM")
  WITH_TIME: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  },
  // Short ISO format (YYYY-MM-DD)
  ISO_SHORT: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
  // Numeric only (e.g., "01/01/2024")
  NUMERIC: {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  },
  // Month and year only (e.g., "January 2024")
  MONTH_YEAR: {
    year: 'numeric',
    month: 'long',
  },
  // Day and month only (e.g., "January 1")
  DAY_MONTH: {
    month: 'long',
    day: 'numeric',
  },
} as const;

// Default locale for date formatting
export const DEFAULT_DATE_LOCALE = 'en-US';

// Timezone to region mapping for search configuration
export const TIMEZONE_REGION_MAP: Record<string, string> = {
  'America/New_York': 'us',
  'America/Chicago': 'us',
  'America/Denver': 'us',
  'America/Los_Angeles': 'us',
  'America/Toronto': 'ca',
  'America/Vancouver': 'ca',
  'Europe/London': 'gb',
  'Europe/Paris': 'fr',
  'Europe/Berlin': 'de',
  'Europe/Madrid': 'es',
  'Europe/Rome': 'it',
  'Europe/Amsterdam': 'nl',
  'Europe/Vienna': 'at',
  'Europe/Brussels': 'be',
  'Europe/Zurich': 'ch',
  'Europe/Stockholm': 'se',
  'Europe/Oslo': 'no',
  'Europe/Copenhagen': 'dk',
  'Europe/Helsinki': 'fi',
  'Europe/Dublin': 'ie',
  'Europe/Lisbon': 'pt',
  'Europe/Warsaw': 'pl',
  'Europe/Prague': 'cz',
  'Europe/Budapest': 'hu',
  'Europe/Bucharest': 'ro',
  'Europe/Athens': 'gr',
  'Europe/Sofia': 'bg',
  'Europe/Zagreb': 'hr',
  'Europe/Ljubljana': 'si',
  'Europe/Bratislava': 'sk',
  'Europe/Tallinn': 'ee',
  'Europe/Riga': 'lv',
  'Europe/Vilnius': 'lt',
  'Europe/Malta': 'mt',
  'Europe/Cyprus': 'cy',
  'Europe/Luxembourg': 'lu',
  'Asia/Tokyo': 'jp',
  'Asia/Seoul': 'kr',
  'Asia/Shanghai': 'cn',
  'Asia/Hong_Kong': 'hk',
  'Asia/Singapore': 'sg',
  'Asia/Taipei': 'tw',
  'Asia/Bangkok': 'th',
  'Asia/Jakarta': 'id',
  'Asia/Manila': 'ph',
  'Asia/Kuala_Lumpur': 'my',
  'Asia/Ho_Chi_Minh': 'vn',
  'Asia/Dubai': 'ae',
  'Asia/Qatar': 'qa',
  'Asia/Saudi_Arabia': 'sa',
  'Asia/Israel': 'il',
  'Asia/India': 'in',
  'Asia/Kolkata': 'in',
  'Australia/Sydney': 'au',
  'Australia/Melbourne': 'au',
  'Australia/Brisbane': 'au',
  'Australia/Perth': 'au',
  'Australia/Adelaide': 'au',
  'Pacific/Auckland': 'nz',
  'America/Sao_Paulo': 'br',
  'America/Mexico_City': 'mx',
  'America/Argentina/Buenos_Aires': 'ar',
  'America/Bogota': 'co',
  'America/Lima': 'pe',
  'America/Santiago': 'cl',
  'America/Caracas': 've',
  'Africa/Johannesburg': 'za',
  'Africa/Cairo': 'eg',
  'Africa/Lagos': 'ng',
  'Africa/Nairobi': 'ke',
};

// Helper function to format date with predefined formats
export const formatDate = (
  date: Date | string | number,
  formatKey: keyof typeof DATE_FORMATS = 'FULL_LOCALE',
  locale: string = DEFAULT_DATE_LOCALE
): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  const options = DATE_FORMATS[formatKey];
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

// Helper function to get region from timezone
export const getRegionFromTimezone = (timezone: string): string => {
  return TIMEZONE_REGION_MAP[timezone] || 'us';
};

export type DateFormatKey = keyof typeof DATE_FORMATS;
