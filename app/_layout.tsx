import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  Stack,
  useRouter,
  usePathname,
} from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import {
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';

import {
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import { useFonts } from 'expo-font';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';

import {
  ThemeProvider,
  useTheme,
} from '../context/ThemeContext';

import {
  LanguageProvider,
} from '../context/LanguageContext';

import {
  AuthProvider,
  useAuth,
} from '../context/AuthContext';

import {
  AssessmentProvider,
} from '../context/AssessmentContext';

import {
  SplashScreen as AppSplashScreen,
} from '../components/screens/SplashScreen';

import {
  BottomNavBar,
} from '../components/ui/BottomNavBar';

import {
  AuthScreen,
} from '../components/screens/AuthScreen';

import {
  useFrameworkReady,
} from '../hooks/useFrameworkReady';

/* ================================================================
   NATIVE SPLASH
================================================================ */

SplashScreen.preventAutoHideAsync().catch(
  () => {}
);

/* ================================================================
   FONT FAMILY
================================================================ */

export const FONT_FAMILY = {
  persian: 'XBNiloofar',

  english: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
};

/* ================================================================
   ROUTE NORMALIZER
================================================================ */

function normalizeRoute(
  value: string
): string {
  if (!value) {
    return '/';
  }

  const normalized =
    value
      .replace(
        /\/\([^)]+\)/g,
        ''
      )
      .replace(
        /\/{2,}/g,
        '/'
      );

  if (
    normalized.length > 1 &&
    normalized.endsWith('/')
  ) {
    return normalized.slice(
      0,
      -1
    );
  }

  return normalized || '/';
}

/* ================================================================
   ANDROID SYSTEM NAVIGATION BAR
================================================================ */

async function hideAndroidNavigationBar() {
  if (
    Platform.OS !== 'android'
  ) {
    return;
  }

  try {
    await NavigationBar.setVisibilityAsync(
      'hidden'
    );

    await NavigationBar.setBehaviorAsync(
      'overlay-swipe'
    );

    await NavigationBar.setBackgroundColorAsync(
      '#00000000'
    );

    await NavigationBar.setButtonStyleAsync(
      'light'
    );
  } catch {
    /*
     * Some Android versions or Expo Go
     * versions may not support every
     * navigation-bar API.
     */
  }
}

/* ================================================================
   APP CONTENT
================================================================ */

function AppContent() {
  const {
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const {
    colors,
    theme,
  } = useTheme();

  const router =
    useRouter();

  const pathname =
    usePathname();

  const [
    showSplash,
    setShowSplash,
  ] = useState(true);

  /* ==============================================================
     SYSTEM NAVIGATION BAR
  ============================================================== */

  useEffect(() => {
    hideAndroidNavigationBar();
  }, []);

  /*
   * Android can occasionally restore its
   * navigation bar after focus changes,
   * dialogs or transitions.
   */
  useEffect(() => {
    if (
      Platform.OS !== 'android'
    ) {
      return;
    }

    const interval =
      setInterval(() => {
        hideAndroidNavigationBar();
      }, 2000);

    return () => {
      clearInterval(
        interval
      );
    };
  }, []);

  /* ==============================================================
     SPLASH COMPLETE
  ============================================================== */

  const handleSplashComplete =
    useCallback(() => {
      setShowSplash(false);

      SplashScreen
        .hideAsync()
        .catch(() => {});

      hideAndroidNavigationBar();
    }, []);

  /* ==============================================================
     BOTTOM NAVIGATION
  ============================================================== */

  const handleBottomNavigation =
    useCallback(
      (route: string) => {
        if (!route) {
          return;
        }

        const current =
          normalizeRoute(
            pathname || '/'
          );

        const target =
          normalizeRoute(route);

        /*
         * Already on this route.
         * Do absolutely nothing.
         */
        if (
          current === target
        ) {
          return;
        }

        /*
         * replace() prevents the navigation
         * stack from growing every time the
         * user changes a bottom tab.
         */
        router.replace(
          route as any
        );

        /*
         * Restore Android immersive
         * navigation after route change.
         */
        if (
          Platform.OS === 'android'
        ) {
          setTimeout(() => {
            hideAndroidNavigationBar();
          }, 150);
        }
      },
      [
        pathname,
        router,
      ]
    );

  /* ==============================================================
     CUSTOM SPLASH
  ============================================================== */

  if (showSplash) {
    return (
      <AppSplashScreen
        onComplete={
          handleSplashComplete
        }
      />
    );
  }

  /* ==============================================================
     AUTH LOADING
  ============================================================== */

  if (authLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              colors.background,

            justifyContent:
              'center',

            alignItems:
              'center',
          },
        ]}
      >
        <StatusBar
          style={
            theme === 'dark'
              ? 'light'
              : 'dark'
          }
        />

        <ActivityIndicator
          size="large"
          color={
            colors.primary
          }
        />
      </View>
    );
  }

  /* ==============================================================
     LOGIN / REGISTER
  ============================================================== */

  if (!isAuthenticated) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <StatusBar
          style={
            theme === 'dark'
              ? 'light'
              : 'dark'
          }
        />

        <AuthScreen />
      </View>
    );
  }

  /* ==============================================================
     AUTHENTICATED APPLICATION
  ============================================================== */

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <StatusBar
        style={
          theme === 'dark'
            ? 'light'
            : 'dark'
        }
      />

      {/* ========================================================
          MAIN ROUTER

          IMPORTANT:
          BottomNavBar is NOT inside this Stack.
          It exists exactly once below the Stack.
      ======================================================== */}

      <View
        style={
          styles.contentContainer
        }
      >
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'none',
          }}
        />
      </View>

      {/* ========================================================
          SINGLE GLOBAL BOTTOM NAVIGATION

          This is the ONLY BottomNavBar in the app.
          
          Because it is outside Stack:
          
          - Home        -> visible
          - Protocol    -> visible
          - Nova        -> visible
          - Schedule    -> visible
          - Profile     -> visible
          - Settings    -> visible
          
          And it won't be duplicated by
          the tabs navigator.
      ======================================================== */}

      <BottomNavBar
        currentRoute={
          pathname || '/'
        }
        onNavigate={
          handleBottomNavigation
        }
      />
    </View>
  );
}

/* ================================================================
   ROOT LAYOUT
================================================================ */

export default function RootLayout() {
  useFrameworkReady();

  /* ==============================================================
     FONTS
  ============================================================== */

  const [
    fontsLoaded,
    fontError,
  ] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,

    XBNiloofar:
      require(
        '../XB Niloofar.ttf'
      ),
  });

  /* ==============================================================
     NATIVE SPLASH
  ============================================================== */

  useEffect(() => {
    if (
      fontsLoaded ||
      fontError
    ) {
      SplashScreen
        .hideAsync()
        .catch(() => {});

      hideAndroidNavigationBar();
    }
  }, [
    fontsLoaded,
    fontError,
  ]);

  /* ==============================================================
     WAIT FOR FONTS
  ============================================================== */

  if (
    !fontsLoaded &&
    !fontError
  ) {
    return null;
  }

  /* ==============================================================
     PROVIDERS
  ============================================================== */

  return (
    <GestureHandlerRootView
      style={
        styles.container
      }
    >
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AssessmentProvider>
                <AppContent />
              </AssessmentProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/* ================================================================
   STYLES
================================================================ */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    contentContainer: {
      flex: 1,
    },
  });