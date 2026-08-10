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

  useEffect(() => {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
  }, [isRTL]);

  useEffect(() => {
    let mounted = true;
    const loadAssessmentStatus = async () => {
      try {
        const saved = await AsyncStorage.getItem(
          ASSESSMENT_KEY
        );
        if (mounted) {
          setAssessmentCompleted(
            saved === 'true'
          );
        }
      } catch (error) {
        if (mounted) {
          setAssessmentCompleted(false);
        }
      } finally {
        if (mounted) {
          setAssessmentLoading(false);
        }
      }
    };
    loadAssessmentStatus();
    return () => {
      mounted = false;
    };
  }, []);

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

  if (!assessmentCompleted) {
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
            try {
              await AsyncStorage.setItem(
                ASSESSMENT_KEY,
                'true'
              );
              setAssessmentCompleted(true);
            } catch (error) {
              console.error(error);
            }
          }}
        />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
});