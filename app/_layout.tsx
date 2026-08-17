import { useEffect, useState } from 'react';
import { Stack, useRouter, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
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

SplashScreen.preventAutoHideAsync().catch(() => {});

const PERSIAN_FONT = 'XBNiloofar';

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
    language,
  } = useLanguage();

  const router = useRouter();
  const pathname = usePathname();

  const [showSplash, setShowSplash] = useState(true);

  // Keep RTL behavior synchronized with the selected language.
  useEffect(() => {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }, [isRTL]);

  // Use XB Niloofar as the default font for the entire Persian UI.
  // English continues to use Inter. Components that explicitly provide
  // a fontFamily keep their own font setting.
  useEffect(() => {
    Text.defaultProps = {
      ...(Text.defaultProps || {}),
      style: [
        ...(Array.isArray(Text.defaultProps?.style)
          ? Text.defaultProps.style
          : Text.defaultProps?.style
            ? [Text.defaultProps.style]
            : []),
        {
          fontFamily: language === 'fa' ? PERSIAN_FONT : 'Inter_400Regular',
        },
      ],
    };
  }, [language]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    SplashScreen.hideAsync().catch(() => {});
  };

  if (showSplash) {
    return (
      <AppSplashScreen
        onComplete={handleSplashComplete}
      />
    );
  }

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

      <BottomNavBar
        currentRoute={pathname}
        onNavigate={(route) => {
          router.navigate(route as any);
        }}
      />
    </View>
  );
}

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
    XBNiloofar: require('../XB Niloofar.ttf'),
  });

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