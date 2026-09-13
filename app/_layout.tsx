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

import * as Notifications from 'expo-notifications';

import {
  ThemeProvider,
  useTheme,
} from '../context/ThemeContext';

import {
  LanguageProvider,
  useLanguage,
} from '../context/LanguageContext';

import {
  AuthProvider,
  useAuth,
} from '../context/AuthContext';

import {
  AssessmentProvider,
} from '../context/AssessmentContext';

import {
  GameExitGuardProvider,
  useGameExitGuard,
} from '../context/GameExitGuard';

import { GameDataProvider } from '../context/GameDataContext';

import AppSplashScreen from '../components/screens/SplashScreen';

import {
  BottomNavBar,
} from '../components/ui/BottomNavBar';

import {
  AuthScreen,
} from '../components/screens/AuthScreen';

import {
  useFrameworkReady,
} from '../hooks/useFrameworkReady';

/* ============================================================
   NATIVE SPLASH
============================================================ */

SplashScreen
  .preventAutoHideAsync()
  .catch(() => {});

/* ============================================================
   NOTIFICATION CONFIGURATION
============================================================ */

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/* ============================================================
   FONT FAMILY
============================================================ */

export const FONT_FAMILY = {
  persian: 'EstedadMedium',

  english: {
    regular: 'Inter_400Regular',
    medium: 'Inter_500Medium',
    semiBold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
  },
};

/* ============================================================
   ROUTE NORMALIZER
============================================================ */

function normalizeRoute(value: string): string {
  if (!value) {
    return '/';
  }

  const normalized = value
    .replace(/\/\([^)]+\)/g, '')
    .replace(/\/{2,}/g, '/');

  if (
    normalized.length > 1 &&
    normalized.endsWith('/')
  ) {
    return normalized.slice(0, -1);
  }

  return normalized || '/';
}

/* ============================================================
   ANDROID SYSTEM NAVIGATION BAR
============================================================ */

async function hideAndroidNavigationBar() {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await NavigationBar.setVisibilityAsync('hidden');

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
    // بعضی نسخه‌های اندروید/Expo این APIها را پشتیبانی نمی‌کنند.
  }
}

/* ============================================================
   WORKOUT REMINDER NOTIFICATION
============================================================ */

function useWorkoutReminderNotification() {
  const {
    language,
    isLanguageLoaded,
  } = useLanguage();

  useEffect(() => {
    let mounted = true;

    let timer:
      ReturnType<typeof setTimeout> | null = null;

    const setupNotification = async () => {
      try {
        if (!isLanguageLoaded) {
          return;
        }

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync(
            'daily-reminder',
            {
              name:
                language === 'fa'
                  ? 'یادآوری‌های روزانه'
                  : 'Daily Reminders',

              importance:
                Notifications.AndroidImportance.HIGH,

              vibrationPattern: [
                0,
                250,
                250,
                250,
              ],

              sound: 'default',

              lockscreenVisibility:
                Notifications
                  .AndroidNotificationVisibility
                  .PUBLIC,
            }
          );
        }

        const currentPermissions =
          await Notifications.getPermissionsAsync();

        let permissionStatus =
          currentPermissions.status;

        if (
          permissionStatus !== 'granted'
        ) {
          const requestedPermissions =
            await Notifications.requestPermissionsAsync();

          permissionStatus =
            requestedPermissions.status;
        }

        if (
          permissionStatus !== 'granted' ||
          !mounted
        ) {
          return;
        }

        await new Promise<void>((resolve) => {
          timer = setTimeout(
            resolve,
            10000
          );
        });

        if (!mounted) {
          return;
        }

        const notificationTitle =
          language === 'fa'
            ? 'نورولیا'
            : 'Neurolia';

        const notificationBody =
          language === 'fa'
            ? 'هنوز تمرین امروزت را کامل نکرده‌ای. فراموش نکن که از بدنت مراقبت کنی!'
            : "You haven't completed today's workout yet. Don't forget to take care of your body!";

        await Notifications.scheduleNotificationAsync({
          content: {
            title: notificationTitle,

            body: notificationBody,

            sound: 'default',

            data: {
              type: 'workout-reminder',
              source: 'app-launch',
              language,
            },
          },

          trigger: null,
        });
      } catch (error) {
        console.warn(
          'Neurolia notification error:',
          error
        );
      }
    };

    void setupNotification();

    return () => {
      mounted = false;

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [
    language,
    isLanguageLoaded,
  ]);
}

/* ============================================================
   APP CONTENT
============================================================ */

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

  const {
    confirmExit,
  } = useGameExitGuard();

  const [
    showSplash,
    setShowSplash,
  ] = useState(true);

  /* ==========================================================
     DEBUG AUTH
  ========================================================== */

  useEffect(() => {
    console.log(
      '[APP AUTH]',
      {
        isAuthenticated,
        authLoading,
        pathname,
      }
    );
  }, [
    isAuthenticated,
    authLoading,
    pathname,
  ]);

  /* ==========================================================
     LOGIN SUCCESS → HOME
  ========================================================== */

  useEffect(() => {
    /*
     * وقتی Login موفق شد، AuthContext مقدار
     * isAuthenticated را true می‌کند.
     *
     * اگر هنوز روی صفحه login باشیم،
     * کاربر را به route اصلی می‌فرستیم.
     */

    if (
      !authLoading &&
      isAuthenticated
    ) {
      const currentRoute =
        normalizeRoute(
          pathname || '/'
        );

      console.log(
        '[AUTH ROUTER] User authenticated:',
        currentRoute
      );

      /*
       * اگر روی login یا routeهای عمومی هستیم،
       * برو به صفحه اصلی.
       *
       * اگر همین الان داخل اپ هستیم،
       * route را دستکاری نمی‌کنیم.
       */
      if (
        currentRoute === '/login' ||
        currentRoute === '/auth' ||
        currentRoute === '/signin'
      ) {
        console.log(
          '[AUTH ROUTER] Redirecting to /'
        );

        router.replace('/');
      }
    }
  }, [
    isAuthenticated,
    authLoading,
    pathname,
    router,
  ]);

  /* ==========================================================
     AUTHENTICATED USER ON LOGIN ROUTE
  ========================================================== */

  useEffect(() => {
    if (
      authLoading ||
      !isAuthenticated
    ) {
      return;
    }

    const currentRoute =
      normalizeRoute(
        pathname || '/'
      );

    /*
     * در بعضی ساختارهای Expo Router،
     * AuthScreen ممکن است روی route اصلی نمایش داده شود.
     *
     * اگر authenticated هستیم، اجازه نمی‌دهیم
     * صفحه Login دوباره نمایش داده شود.
     */

    if (
      currentRoute === '/login' ||
      currentRoute === '/auth' ||
      currentRoute === '/signin'
    ) {
      router.replace('/');
    }
  }, [
    authLoading,
    isAuthenticated,
    pathname,
    router,
  ]);

  /* ==========================================================
     LOCALIZED WORKOUT REMINDER
  ========================================================== */

  useWorkoutReminderNotification();

  /* ==========================================================
     SYSTEM NAVIGATION BAR
  ========================================================== */

  useEffect(() => {
    void hideAndroidNavigationBar();
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const interval =
      setInterval(() => {
        void hideAndroidNavigationBar();
      }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  /* ==========================================================
     SPLASH COMPLETE
  ========================================================== */

  const handleSplashComplete =
    useCallback(() => {
      setShowSplash(false);

      SplashScreen
        .hideAsync()
        .catch(() => {});

      void hideAndroidNavigationBar();
    }, []);

  /* ==========================================================
     BOTTOM NAVIGATION
  ========================================================== */

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

        if (current === target) {
          return;
        }

        const navigate = () => {
          console.log(
            '[BOTTOM NAV] Navigating:',
            route
          );

          router.replace(
            route as any
          );

          if (
            Platform.OS === 'android'
          ) {
            setTimeout(() => {
              void hideAndroidNavigationBar();
            }, 150);
          }
        };

        confirmExit(navigate);
      },
      [
        pathname,
        router,
        confirmExit,
      ]
    );

  /* ==========================================================
     CUSTOM SPLASH
  ========================================================== */

  if (showSplash) {
    return (
      <AppSplashScreen
        onComplete={
          handleSplashComplete
        }
      />
    );
  }

  /* ==========================================================
     AUTH LOADING
  ========================================================== */

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

  /* ==========================================================
     NOT AUTHENTICATED
  ========================================================== */

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

  /* ==========================================================
     AUTHENTICATED APPLICATION
  ========================================================== */

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

      {/* ======================================================
          MAIN ROUTER
      ====================================================== */}

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

      {/* ======================================================
          GLOBAL BOTTOM NAVIGATION
      ====================================================== */}

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

/* ============================================================
   ROOT LAYOUT
============================================================ */

export default function RootLayout() {
  useFrameworkReady();

  /* ==========================================================
     FONTS
  ========================================================== */

  const [
    fontsLoaded,
    fontError,
  ] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,

    EstedadMedium:
      require(
        '../assets/fonts/Estedad-Medium.ttf'
      ),
  });

  /* ==========================================================
     NATIVE SPLASH
  ========================================================== */

  useEffect(() => {
    if (
      fontsLoaded ||
      fontError
    ) {
      SplashScreen
        .hideAsync()
        .catch(() => {});

      void hideAndroidNavigationBar();
    }
  }, [
    fontsLoaded,
    fontError,
  ]);

  /* ==========================================================
     WAIT FOR FONTS
  ========================================================== */

  if (
    !fontsLoaded &&
    !fontError
  ) {
    return null;
  }

  /* ==========================================================
     PROVIDERS
  ========================================================== */

  return (
    <GestureHandlerRootView
      style={
        styles.container
      }
    >
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>

            <GameDataProvider>

              <AuthProvider>

                <AssessmentProvider>

                  <GameExitGuardProvider>

                    <AppContent />

                  </GameExitGuardProvider>

                </AssessmentProvider>

              </AuthProvider>

            </GameDataProvider>

          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    contentContainer: {
      flex: 1,
    },
  });