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
 */
export type TranslationValue =
  Record<string, string>;

interface LanguageContextType {
  /**
   * Current application language.
   *
   * fa = Persian
   * en = English
   */
  language: Language;

  /**
   * Whether the current language uses RTL layout.
   */
  isRTL: boolean;

  /**
   * True when the saved language has been loaded
   * from AsyncStorage.
   *
   * This is important for services such as local
   * notifications which must know the user's real
   * language before they run.
   */
  isLanguageLoaded: boolean;

  /**
   * Current translation object.
   */
  t: TranslationValue;

  /**
   * Change application language.
   */
  setLanguage: (
    lang: Language
  ) => Promise<void>;

  /**
   * Toggle between Persian and English.
   */
  toggleLanguage: () => void;
}

/* ================================================================
   CONTEXT
================================================================ */

const LanguageContext =
  createContext<
    LanguageContextType | undefined
  >(undefined);

/* ================================================================
   STORAGE
================================================================ */

const LANGUAGE_KEY =
  '@neurolia_language';

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
  /*
   * --------------------------------------------------------------
   * Language
   *
   * Persian remains the initial fallback because that is the
   * existing default language of the application.
   * --------------------------------------------------------------
   */
  const [
    language,
    setLanguageState,
  ] = useState<Language>('fa');

  /*
   * --------------------------------------------------------------
   * Language loading state
   *
   * false = AsyncStorage has not been checked yet.
   * true  = saved language has been loaded or no saved language
   *         exists.
   * --------------------------------------------------------------
   */
  const [
    isLanguageLoaded,
    setIsLanguageLoaded,
  ] = useState(false);

  /* ==============================================================
     LOAD SAVED LANGUAGE
  ============================================================== */

  useEffect(() => {
    let mounted = true;

    const loadLanguage =
      async () => {
        try {
          const savedLanguage =
            await AsyncStorage.getItem(
              LANGUAGE_KEY
            );

          /*
           * Component was unmounted while
           * AsyncStorage was reading.
           */
          if (!mounted) {
            return;
          }

          /*
           * Only accept valid application
           * languages.
           */
          if (
            savedLanguage === 'fa' ||
            savedLanguage === 'en'
          ) {
            setLanguageState(
              savedLanguage
            );
          }
        } catch (error) {
          console.error(
            '[LANGUAGE] Failed to load language:',
            error
          );
        } finally {
          /*
           * Notification and other services
           * can now safely use `language`.
           */
          if (mounted) {
            setIsLanguageLoaded(
              true
            );
          }
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

  const setLanguage =
    useCallback(
      async (
        newLanguage: Language
      ) => {
        /*
         * No change required.
         */
        if (
          newLanguage ===
          language
        ) {
          return;
        }

        /*
         * Update UI immediately.
         */
        setLanguageState(
          newLanguage
        );

        try {
          /*
           * Persist selected language.
           */
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

  const toggleLanguage =
    useCallback(() => {
      setLanguageState(
        (
          currentLanguage
        ) => {
          const nextLanguage: Language =
            currentLanguage ===
            'fa'
              ? 'en'
              : 'fa';

          /*
           * Persist the new language.
           */
          void AsyncStorage.setItem(
            LANGUAGE_KEY,
            nextLanguage
          ).catch(
            (error) => {
              console.error(
                '[LANGUAGE] Failed to persist language:',
                error
              );
            }
          );

          return nextLanguage;
        }
      );
    }, []);

  /* ==============================================================
     RTL
  ============================================================== */

  const isRTL =
    language === 'fa';

  /* ==============================================================
     TRANSLATIONS
  ============================================================== */

  const t =
    useMemo<TranslationValue>(
      () =>
        getTranslations(
          language
        ),
      [language]
    );

  /* ==============================================================
     CONTEXT VALUE
  ============================================================== */

  const value =
    useMemo<LanguageContextType>(
      () => ({
        language,

        isRTL,

        isLanguageLoaded,

        t,

        setLanguage,

        toggleLanguage,
      }),
      [
        language,
        isRTL,
        isLanguageLoaded,
        t,
        setLanguage,
        toggleLanguage,
      ]
    );

  /* ==============================================================
     PROVIDER
  ============================================================== */

  return (
    <LanguageContext.Provider
      value={value}
    >
      {children}
    </LanguageContext.Provider>
  );
}

/* ================================================================
   HOOK
================================================================ */

export function useLanguage(): LanguageContextType {
  const context =
    useContext(
      LanguageContext
    );

  if (!context) {
    throw new Error(
      'useLanguage must be used within a LanguageProvider'
    );
  }

  return context;
}