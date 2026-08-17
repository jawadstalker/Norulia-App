import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { translations } from '../constants/translations';
import { Language } from '../types';

/* ================================================================
   TYPES
================================================================ */

/**
 * Translation objects in the project have evolved over time and
 * are not guaranteed to expose exactly the same keys in both
 * languages.
 *
 * Using a string-keyed translation map keeps the context type
 * compatible with the real translation objects while preserving
 * proper string values for the UI.
 */
export type TranslationValue = Record<string, string>;

interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  t: TranslationValue;
  setLanguage: (lang: Language) => Promise<void>;
  toggleLanguage: () => void;
}

/* ================================================================
   CONTEXT
================================================================ */

const LanguageContext =
  createContext<LanguageContextType | undefined>(
    undefined
  );

const LANGUAGE_KEY = '@neurolia_language';

/* ================================================================
   TRANSLATION RESOLVER
================================================================ */

function getTranslations(
  language: Language
): TranslationValue {
  const selected =
    translations[
      language as keyof typeof translations
    ];

  return selected as TranslationValue;
}

/* ================================================================
   PROVIDER
================================================================ */

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] =
    useState<Language>('fa');

  /* ==============================================================
     LOAD SAVED LANGUAGE
  ============================================================== */

  useEffect(() => {
    let mounted = true;

    const loadLanguage = async () => {
      try {
        const savedLanguage =
          await AsyncStorage.getItem(
            LANGUAGE_KEY
          );

        if (!mounted) {
          return;
        }

        if (
          savedLanguage === 'fa' ||
          savedLanguage === 'en'
        ) {
          setLanguageState(savedLanguage);
        }
      } catch (error) {
        console.error(
          '[LANGUAGE] Failed to load language:',
          error
        );
      }
    };

    void loadLanguage();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==============================================================
     SET LANGUAGE
  ============================================================== */

  const setLanguage = useCallback(
    async (newLanguage: Language) => {
      if (newLanguage === language) {
        return;
      }

      setLanguageState(newLanguage);

      try {
        await AsyncStorage.setItem(
          LANGUAGE_KEY,
          newLanguage
        );
      } catch (error) {
        console.error(
          '[LANGUAGE] Failed to save language:',
          error
        );
      }
    },
    [language]
  );

  /* ==============================================================
     TOGGLE LANGUAGE
  ============================================================== */

  const toggleLanguage = useCallback(() => {
    setLanguageState((currentLanguage) => {
      const nextLanguage: Language =
        currentLanguage === 'fa'
          ? 'en'
          : 'fa';

      void AsyncStorage.setItem(
        LANGUAGE_KEY,
        nextLanguage
      ).catch((error) => {
        console.error(
          '[LANGUAGE] Failed to persist language:',
          error
        );
      });

      return nextLanguage;
    });
  }, []);

  /* ==============================================================
     RTL
  ============================================================== */

  const isRTL = language === 'fa';

  /* ==============================================================
     TRANSLATIONS
  ============================================================== */

  const t = useMemo<TranslationValue>(
    () => getTranslations(language),
    [language]
  );

  /* ==============================================================
     CONTEXT VALUE
  ============================================================== */

  const value = useMemo<LanguageContextType>(
    () => ({
      language,
      isRTL,
      t,
      setLanguage,
      toggleLanguage,
    }),
    [
      language,
      isRTL,
      t,
      setLanguage,
      toggleLanguage,
    ]
  );

  /* ==============================================================
     PROVIDER
  ============================================================== */

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/* ================================================================
   HOOK
================================================================ */

export function useLanguage(): LanguageContextType {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      'useLanguage must be used within a LanguageProvider'
    );
  }

  return context;
}