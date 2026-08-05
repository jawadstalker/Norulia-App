import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';
import { Brain, Sparkles } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 150, damping: 15 }}
        >
          <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
            <Brain size={60} color="#FFFFFF" strokeWidth={2} />
            <MotiView
              from={{ rotate: '0deg' }}
              animate={{ rotate: '360deg' }}
              transition={{ type: 'timing', duration: 8000, loop: true }}
              style={styles.orbit}
            >
              <Sparkles size={20} color={colors.warning} />
            </MotiView>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 600, delay: 500 }}
        >
          <Text style={[styles.title, { color: colors.text }]}>
            {t.appName}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Your Mental Wellness Companion
          </Text>
        </MotiView>

        <MotiView
          from={{ width: 0 }}
          animate={{ width: width * 0.5 }}
          transition={{ type: 'timing', duration: 2000, delay: 800 }}
          style={[styles.progressBar, { backgroundColor: colors.primary }]}
        />
      </View>

      <View style={styles.particles}>
        {[...Array(6)].map((_, i) => (
          <MotiView
            key={i}
            from={{
              opacity: 0,
              translateX: Math.random() * 100 - 50,
              translateY: height,
            }}
            animate={{
              opacity: [0, 1, 0],
              translateX: Math.random() * 200 - 100,
              translateY: -100,
            }}
            transition={{
              type: 'timing',
              duration: 3000,
              delay: i * 300,
              loop: true,
            }}
            style={[
              styles.particle,
              { backgroundColor: colors.primary + '40' },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  orbit: {
    position: 'absolute',
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  progressBar: {
    height: 4,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xxl,
  },
  particles: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
  },
});
