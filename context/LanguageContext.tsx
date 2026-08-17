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

/*
 * translations.fa و translations.en در پروژه فعلی
 * دقیقاً ساختار یکسانی ندارند.
 *
 * بنابراین نباید t را فقط به typeof translations.fa
 * محدود کنیم.
 *
 * این type اجازه می‌دهد t مطابق زبان انتخاب‌شده
 * از ساختار واقعی translations گرفته شود.
 */
type TranslationValue =
  (typeof translations)[keyof typeof translations];

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

    loadLanguage();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==============================================================
     SET LANGUAGE
  ============================================================== */

  const setLanguage = useCallback(
    async (newLanguage: Language) => {
      /*
       * جلوگیری از update غیرضروری.
       */
      if (newLanguage === language) {
        return;
      }

      /*
       * ابتدا UI را تغییر می‌دهیم تا کاربر
       * مجبور نباشد منتظر AsyncStorage بماند.
       */
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

      /*
       * ذخیره‌سازی خارج از render انجام می‌شود.
       */
      AsyncStorage.setItem(
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

  const t = useMemo<TranslationValue>(() => {
    /*
     * Language از نوع پروژه است و translations
     * شامل fa/en است.
     *
     * این cast فقط برای هماهنگ کردن TypeScript
     * با ساختار فعلی پروژه استفاده شده است.
     */
    return translations[
      language as keyof typeof translations
    ];
  }, [language]);

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