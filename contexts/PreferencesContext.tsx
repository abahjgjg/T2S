
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Language, AIProvider } from '../types';
import { safeLocalStorage } from '../utils/storageUtils';
import { TRANSLATIONS } from '../constants/translations';

interface PreferencesContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  provider: AIProvider;
  setProvider: (provider: AIProvider) => void;
  uiText: any;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

const LANG_KEY = 'trendventures_lang';
const PROVIDER_KEY = 'trendventures_provider';

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('id');
  const [provider, setProviderState] = useState<AIProvider>('gemini');

  useEffect(() => {
    const savedLang = safeLocalStorage.getItem<Language>(LANG_KEY, 'id');
    const savedProvider = safeLocalStorage.getItem<AIProvider>(PROVIDER_KEY, 'gemini');
    setLanguageState(savedLang);
    setProviderState(savedProvider);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    safeLocalStorage.setItem(LANG_KEY, lang);
  };

  const setProvider = (prov: AIProvider) => {
    setProviderState(prov);
    safeLocalStorage.setItem(PROVIDER_KEY, prov);
  };

  const uiText = TRANSLATIONS[language];

  return (
    <PreferencesContext.Provider value={{ language, setLanguage, provider, setProvider, uiText }}>
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
