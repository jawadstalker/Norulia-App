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

import { useFrameworkReady } from '../hooks/useFrameworkReady';


// Prevent native splash from hiding automatically
SplashScreen.preventAutoHideAsync().catch(() => {});


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

  const router = useRouter();
  const pathname = usePathname();

  const [showSplash, setShowSplash] = useState(true);


  // --------------------------------------------------
  // RTL
  // --------------------------------------------------

  useEffect(() => {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }, [isRTL]);


  // --------------------------------------------------
  // Splash completion
  // --------------------------------------------------

  const handleSplashComplete = () => {
    setShowSplash(false);

    SplashScreen.hideAsync().catch(() => {});
  };


  // --------------------------------------------------
  // APP SPLASH
  // --------------------------------------------------

  if (showSplash) {
    return (
      <AppSplashScreen
        onComplete={handleSplashComplete}
      />
    );
  }


  // --------------------------------------------------
  // AUTH LOADING
  // --------------------------------------------------

  if (authLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
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


  // --------------------------------------------------
  // LOGIN / REGISTER
  // --------------------------------------------------

  if (!isAuthenticated) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
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


  // --------------------------------------------------
  // AUTHENTICATED APP
  //
  // IMPORTANT:
  // Assessment is completely removed from the
  // initial authentication flow.
  //
  // Login → App directly
  // --------------------------------------------------

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
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

      {/* Main application */}
      <View style={styles.contentContainer}>
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


      {/* Bottom Navigation */}
      <BottomNavBar
        currentRoute={pathname}
        onNavigate={(route) => {
          router.navigate(route as any);
        }}
      />
    </View>
  );
}


// --------------------------------------------------
// ROOT LAYOUT
// --------------------------------------------------

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


  // Hide native splash after fonts load
  useEffect(() => {
    if (
      fontsLoaded ||
      fontError
    ) {
      SplashScreen
        .hideAsync()
        .catch(() => {});
    }
  }, [
    fontsLoaded,
    fontError,
  ]);


  // Wait for fonts
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
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  contentContainer: {
    flex: 1,
  },
});