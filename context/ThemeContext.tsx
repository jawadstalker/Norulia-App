import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Colors } from '../constants/theme';
import { ThemeMode } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: typeof Colors.light;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

const THEME_KEY = '@neurolia_theme';

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const systemColorScheme = useColorScheme();

  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    let mounted = true;

    const loadTheme = async () => {
      try {
        const savedTheme =
          await AsyncStorage.getItem(THEME_KEY);

        if (!mounted) {
          return;
        }

        if (
          savedTheme === 'light' ||
          savedTheme === 'dark'
        ) {
          setThemeState(savedTheme);
          return;
        }

        setThemeState(
          systemColorScheme === 'dark'
            ? 'dark'
            : 'light'
        );
      } catch (error) {
        console.error(
          '[THEME] Failed to load theme:',
          error
        );

        if (mounted) {
          setThemeState(
            systemColorScheme === 'dark'
              ? 'dark'
              : 'light'
          );
        }
      }
    };

    loadTheme();

    return () => {
      mounted = false;
    };
  }, [systemColorScheme]);

  const setTheme = useCallback(
    async (newTheme: ThemeMode) => {
      if (newTheme === theme) {
        return;
      }

      try {
        setThemeState(newTheme);

        await AsyncStorage.setItem(
          THEME_KEY,
          newTheme
        );
      } catch (error) {
        console.error(
          '[THEME] Failed to save theme:',
          error
        );
      }
    },
    [theme]
  );

  const toggleTheme = useCallback(() => {
    setThemeState((currentTheme) => {
      const nextTheme =
        currentTheme === 'light'
          ? 'dark'
          : 'light';

      AsyncStorage.setItem(
        THEME_KEY,
        nextTheme
      ).catch((error) => {
        console.error(
          '[THEME] Failed to persist theme:',
          error
        );
      });

      return nextTheme;
    });
  }, []);

  const isDark = theme === 'dark';

  const colors = useMemo(
    () => Colors[theme],
    [theme]
  );

  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      isDark,
      colors,
      toggleTheme,
      setTheme,
    }),
    [
      theme,
      isDark,
      colors,
      toggleTheme,
      setTheme,
    ]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useTheme must be used within a ThemeProvider'
    );
  }

  return context;
}