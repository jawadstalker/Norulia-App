
import { useEffect, useState } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  StyleSheet,
  I18nManager,
  ActivityIndicator,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  SplashScreen as AppSplashScreen,
} from '../components/screens/SplashScreen';

import {
  BottomNavBar,
} from '../components/ui/BottomNavBar';

import {
  AuthScreen,
} from '../components/screens/AuthScreen';

import {
  AssessmentScreen,
} from '../components/screens/AssessmentScreen';

import { useFrameworkReady } from '../hooks/useFrameworkReady';

SplashScreen.preventAutoHideAsync().catch(() => {});

const ASSESSMENT_KEY = '@neurolia_assessment_completed';

function AppContent() {
  const {
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();

  const {
    colors,
    theme,
  } = useTheme();

  const {
    isRTL,
  } = useLanguage();

  /*
   * IMPORTANT:
   * router was missing in your previous version.
   */
  const router = useRouter();
  const pathname = usePathname();

  const [showSplash, setShowSplash] = useState(true);

  const [
    assessmentCompleted,
    setAssessmentCompleted,
  ] = useState(false);

  const [
    assessmentLoading,
    setAssessmentLoading,
  ] = useState(true);

  /*
   * ==========================================
   * RTL
   * ==========================================
   */

  useEffect(() => {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }, [isRTL]);

  /*
   * ==========================================
   * LOAD ASSESSMENT STATUS
   * ==========================================
   */

  useEffect(() => {
    let mounted = true;

    const loadAssessmentStatus = async () => {
      console.log('================================');
      console.log('[ASSESSMENT] Loading saved status');

      try {
        const saved = await AsyncStorage.getItem(
          ASSESSMENT_KEY
        );

        console.log(
          '[ASSESSMENT] Saved value:',
          saved
        );

        if (mounted) {
          setAssessmentCompleted(
            saved === 'true'
          );
        }
      } catch (error) {
        console.error(
          '[ASSESSMENT] Load error:',
          error
        );

        if (mounted) {
          setAssessmentCompleted(false);
        }
      } finally {
        if (mounted) {
          setAssessmentLoading(false);
        }
      }

      console.log('================================');
    };

    loadAssessmentStatus();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ==========================================
   * APP SPLASH COMPLETE
   * ==========================================
   */

  const handleSplashComplete = () => {
    console.log(
      '[NORULIA] Application splash completed'
    );

    setShowSplash(false);

    SplashScreen.hideAsync().catch(() => {});
  };

  /*
   * ==========================================
   * DEBUG STATE
   * ==========================================
   */

  useEffect(() => {
    console.log('================================');
    console.log('[NORULIA APP STATE]');
    console.log(
      'isAuthenticated:',
      isAuthenticated
    );
    console.log(
      'authLoading:',
      authLoading
    );
    console.log(
      'assessmentCompleted:',
      assessmentCompleted
    );
    console.log(
      'assessmentLoading:',
      assessmentLoading
    );
    console.log(
      'showSplash:',
      showSplash
    );
    console.log(
      'pathname:',
      pathname
    );
    console.log('================================');
  }, [
    isAuthenticated,
    authLoading,
    assessmentCompleted,
    assessmentLoading,
    showSplash,
    pathname,
  ]);

  /*
   * ==========================================
   * APP SPLASH
   * ==========================================
   */

  if (showSplash) {
    return (
      <AppSplashScreen
        onComplete={handleSplashComplete}
      />
    );
  }

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (
    authLoading ||
    assessmentLoading
  ) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              colors.background,
            justifyContent: 'center',
            alignItems: 'center',
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
          color={colors.primary}
        />
      </View>
    );
  }

  /*
   * ==========================================
   * NOT AUTHENTICATED
   * ==========================================
   */

  if (!isAuthenticated) {
    console.log(
      '[NORULIA] No authenticated user -> AuthScreen'
    );

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

  /*
   * ==========================================
   * AUTHENTICATED BUT ASSESSMENT NOT DONE
   * ==========================================
   *
   * IMPORTANT:
   *
   * We DO NOT call router.replace()
   * after assessment.
   *
   * Instead:
   *
   * setAssessmentCompleted(true)
   *
   * changes this component's state.
   *
   * React then renders the MAIN APP section
   * below automatically.
   */

  if (!assessmentCompleted) {
    console.log(
      '[NORULIA] Authenticated user -> AssessmentScreen'
    );

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

        <AssessmentScreen
          onComplete={async (results) => {
            console.log(
              '================================'
            );

            console.log(
              '[ASSESSMENT] onComplete CALLED'
            );

            console.log(
              '[ASSESSMENT] Results:',
              results
            );

            try {
              /*
               * Save results if needed later.
               *
               * For now we only mark the
               * assessment as completed.
               */

              await AsyncStorage.setItem(
                ASSESSMENT_KEY,
                'true'
              );

              console.log(
                '[ASSESSMENT] Completion saved'
              );

              /*
               * THIS IS THE IMPORTANT PART.
               *
               * This causes AppContent to
               * render the Main App.
               */
              setAssessmentCompleted(true);

              console.log(
                '[ASSESSMENT] assessmentCompleted -> true'
              );

              console.log(
                '[NORULIA] Main App should render now'
              );

              console.log(
                '================================'
              );
            } catch (error) {
              console.error(
                '[ASSESSMENT] Completion error:',
                error
              );
            }
          }}
        />
      </View>
    );
  }

  /*
   * ==========================================
   * MAIN APP
   * ==========================================
   */

  console.log(
    '[NORULIA] Rendering MAIN APP'
  );

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
        style={styles.contentContainer}
      >
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen
            name="(tabs)"
          />

          <Stack.Screen
            name="settings"
          />
        </Stack>
      </View>

      <BottomNavBar
        currentRoute={pathname}
        onNavigate={(route) => {
          console.log(
            '[NAV] Going to:',
            route
          );

          router.push(route as any);
        }}
      />
    </View>
  );
}

/*
 * ==========================================
 * ROOT LAYOUT
 * ==========================================
 */

export default function RootLayout() {
  useFrameworkReady();

  const [
    fontsLoaded,
    fontError,
  ] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (
      fontsLoaded ||
      fontError
    ) {
      SplashScreen.hideAsync()
        .catch(() => {});
    }
  }, [
    fontsLoaded,
    fontError,
  ]);

  if (
    !fontsLoaded &&
    !fontError
  ) {
    return null;
  }

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

/*
 * ==========================================
 * STYLES
 * ==========================================
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentContainer: {
    flex: 1,
  },
});

