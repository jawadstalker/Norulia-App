import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, I18nManager, ActivityIndicator } from 'react-native';
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
import { BottomNavBar } from '../components/ui/BottomNavBar';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { useRouter, usePathname } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isCompleted: assessmentCompleted, isLoading: assessmentLoading } = useAssessment();
  const { colors, theme } = useTheme();
  const { isRTL } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    } else {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
    }
  }, [isRTL]);

  useEffect(() => {
    if (authLoading || assessmentLoading || showSplash) return;
    
    if (!isAuthenticated) {
      router.replace('/auth');
    } else if (!assessmentCompleted) {
      router.replace('/assessment');
    }
  }, [authLoading, assessmentLoading, isAuthenticated, assessmentCompleted, showSplash]);

  const handleSplashComplete = () => {
    setShowSplash(false);
    SplashScreen.hideAsync();
  };

  if (showSplash) {
    return <AppSplashScreen onComplete={handleSplashComplete} />;
  }

  if (authLoading || assessmentLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="assessment" options={{ headerShown: false }} />
      </Stack>
      {isAuthenticated && assessmentCompleted && (
        <BottomNavBar currentRoute={pathname} onNavigate={(r) => router.push(r as any)} />
      )}
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

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(error => {
        console.warn('Error hiding splash screen:', error);
      });
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (fontError) {
      console.error('Font loading error:', fontError);
    }
  }, [fontError]);

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