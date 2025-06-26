
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', greeting: 'Welcome to Kigali Ride!' },
  { code: 'kn', name: 'Kinyarwanda', flag: '🇷🇼', greeting: 'Murakaze kuri Kigali Ride!' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', greeting: 'Bienvenue sur Kigali Ride!' }
] as const;

export type LanguageCode = typeof LANGUAGES[number]['code'];

export type Language = typeof LANGUAGES[number];
