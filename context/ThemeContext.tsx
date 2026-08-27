import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';

import {
  useColorScheme,
} from 'react-native';

import AsyncStorage from
  '@react-native-async-storage/async-storage';

import {
  Colors,
  Fonts,
  Typography,
} from '../constants/theme';

import {
  ThemeMode,
} from '../types';

// =======================================================
// CONTEXT TYPE
// =======================================================

interface ThemeContextType {
  theme: ThemeMode;

  isDark: boolean;

  isAthlete: boolean;

  colors:
    typeof Colors.light;

  fonts: typeof Fonts;

  typography:
    typeof Typography;

  toggleTheme: () => void;

  setTheme: (
    theme: ThemeMode
  ) => Promise<void>;
}

// =======================================================
// CONTEXT
// =======================================================

const ThemeContext =
  createContext<
    ThemeContextType | undefined
  >(undefined);

const THEME_KEY =
  '@neurolia_theme';

// =======================================================
// PROVIDER
// =======================================================

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const systemColorScheme =
    useColorScheme();

  const [
    theme,
    setThemeState,
  ] = useState<ThemeMode>('light');

  // =====================================================
  // LOAD THEME
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const loadTheme =
      async () => {
        try {
          const savedTheme =
            await AsyncStorage.getItem(
              THEME_KEY,
            );

          if (!mounted) {
            return;
          }

          if (
            savedTheme === 'light' ||
            savedTheme === 'dark' ||
            savedTheme === 'athlete'
          ) {
            setThemeState(
              savedTheme,
            );

            return;
          }

          setThemeState(
            systemColorScheme === 'dark'
              ? 'dark'
              : 'light',
          );
        } catch (error) {
          console.error(
            '[THEME] Failed to load theme:',
            error,
          );

          if (mounted) {
            setThemeState(
              systemColorScheme === 'dark'
                ? 'dark'
                : 'light',
            );
          }
        }
      };

    loadTheme();

    return () => {
      mounted = false;
    };
  }, [systemColorScheme]);

  // =====================================================
  // SET THEME
  // =====================================================

  const setTheme =
    useCallback(
      async (
        newTheme: ThemeMode,
      ) => {
        try {
          setThemeState(
            newTheme,
          );

          await AsyncStorage.setItem(
            THEME_KEY,
            newTheme,
          );
        } catch (error) {
          console.error(
            '[THEME] Failed to save theme:',
            error,
          );
        }
      },
      [],
    );

  // =====================================================
  // TOGGLE THEME
  // =====================================================

  const toggleTheme =
    useCallback(() => {
      setThemeState(
        currentTheme => {
          let nextTheme: ThemeMode;

          if (
            currentTheme === 'light'
          ) {
            nextTheme = 'dark';
          } else if (
            currentTheme === 'dark'
          ) {
            nextTheme = 'athlete';
          } else {
            nextTheme = 'light';
          }

          AsyncStorage.setItem(
            THEME_KEY,
            nextTheme,
          ).catch(error => {
            console.error(
              '[THEME] Failed to persist theme:',
              error,
            );
          });

          return nextTheme;
        },
      );
    }, []);

  // =====================================================
  // DERIVED STATE
  // =====================================================

  const isDark =
    theme === 'dark' ||
    theme === 'athlete';

  const isAthlete =
    theme === 'athlete';

  const colors =
    useMemo(
      () => Colors[theme],
      [theme],
    );

  // =====================================================
  // TYPOGRAPHY
  // =====================================================

  const fonts =
    useMemo(
      () => Fonts,
      [],
    );

  const typography =
    useMemo(
      () => Typography,
      [],
    );

  // =====================================================
  // CONTEXT VALUE
  // =====================================================

  const value =
    useMemo<ThemeContextType>(
      () => ({
        theme,

        isDark,

        isAthlete,

        colors,

        fonts,

        typography,

        toggleTheme,

        setTheme,
      }),
      [
        theme,
        isDark,
        isAthlete,
        colors,
        fonts,
        typography,
        toggleTheme,
        setTheme,
      ],
    );

  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// =======================================================
// HOOK
// =======================================================

export function useTheme():
  ThemeContextType {
  const context =
    useContext(
      ThemeContext,
    );

  if (!context) {
    throw new Error(
      'useTheme must be used within a ThemeProvider',
    );
  }

  return context;
}