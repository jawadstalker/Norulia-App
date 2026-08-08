import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, I18nManager } from 'react-native';
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
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { AssessmentProvider, useAssessment } from '../context/AssessmentContext';
import { SplashScreen as AppSplashScreen } from '../components/screens/SplashScreen';
import { AuthScreen } from '../components/screens/AuthScreen';
import { AssessmentScreen } from '../components/screens/AssessmentScreen';
import { BottomNavBar } from '../components/ui/BottomNavBar';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { useRouter, usePathname } from 'expo-router';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isCompleted: assessmentCompleted, isLoading: assessmentLoading, completeAssessment } = useAssessment();
  const { colors, theme } = useTheme();
  const { isRTL, language } = useLanguage();
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    } else {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
    }
  }, [isRTL]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    // Hide the native splash screen when our custom splash completes
    SplashScreen.hideAsync();
  };

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  if (showSplash) {
    return <AppSplashScreen onComplete={handleSplashComplete} />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (assessmentLoading) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  if (!assessmentCompleted) {
    return <AssessmentScreen onComplete={completeAssessment} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
      </Stack>
      <BottomNavBar currentRoute={pathname} onNavigate={handleNavigate} />
    </View>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Handle splash screen hiding when fonts are ready or if there's an error
  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the native splash screen
      SplashScreen.hideAsync().catch(error => {
        console.warn('Error hiding splash screen:', error);
      });
    }
  }, [fontsLoaded, fontError]);

  // Log any font loading errors
  useEffect(() => {
    if (fontError) {
      console.error('Font loading error:', fontError);
    }
  }, [fontError]);

  // Show nothing while fonts are loading, but don't block if there's an error
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.container}>
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
});