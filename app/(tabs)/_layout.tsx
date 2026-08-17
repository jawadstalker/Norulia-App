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

import {
  ThemeProvider,
  useTheme,
} from '../../context/ThemeContext';

import {
  LanguageProvider,
} from '../../context/LanguageContext';

import {
  AuthProvider,
  useAuth,
} from '../../context/AuthContext';

import {
  AssessmentProvider,
} from '../../context/AssessmentContext';

import {
  SplashScreen as AppSplashScreen,
} from '../../components/screens/SplashScreen';

import {
  BottomNavBar,
} from '../../components/ui/BottomNavBar';

import {
  AuthScreen,
} from '../../components/screens/AuthScreen';

import {
  useFrameworkReady,
} from '../../hooks/useFrameworkReady';

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

  const router = useRouter();
  const pathname = usePathname();

  const [
    showSplash,
    setShowSplash,
  ] = useState(true);

  /* ==============================================================
     SPLASH COMPLETE
  ============================================================== */

  const handleSplashComplete =
    useCallback(() => {
      setShowSplash(false);

      SplashScreen.hideAsync().catch(
        () => {}
      );
    }, []);

  /* ==============================================================
     TAB NAVIGATION
     
     IMPORTANT:
     
     Do NOT use router.navigate() here.
     
     Bottom navigation represents application sections,
     not a history stack.
     
     router.replace() prevents the navigation stack from
     growing every time the user changes tabs.
  ============================================================== */

  const handleBottomNavigation =
    useCallback(
      (route: string) => {
        if (!route) {
          return;
        }

        /*
         * Normalize route comparison.
         *
         * Example:
         *
         * /(tabs)/schedule
         *
         * and
         *
         * /schedule
         *
         * represent the same section.
         */
        const normalizeRoute = (
          value: string
        ) => {
          return value
            .replace(
              /\/\([^)]+\)/g,
              ''
            )
            .replace(
              /\/{2,}/g,
              '/'
            );
        };

        const current =
          normalizeRoute(
            pathname || ''
          );

        const target =
          normalizeRoute(route);

        /*
         * Already on this page.
         * Do absolutely nothing.
         */
        if (current === target) {
          return;
        }

        /*
         * Replace instead of navigate.
         *
         * This is the important performance fix.
         */
        router.replace(
          route as any
        );
      },
      [
        pathname,
        router,
      ]
    );

  /* ==============================================================
     APP SPLASH
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

      <View
        style={
          styles.contentContainer
        }
      >
        <Stack
          screenOptions={{
            headerShown: false,

            /*
             * Avoid unnecessary transition
             * animations for the root navigator.
             */
            animation: 'none',
          }}
        >
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="settings"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </View>

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

    XBNiloofar: require(
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
      SplashScreen.hideAsync().catch(
        () => {}
      );
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
      style={styles.container}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentContainer: {
    flex: 1,
  },
});