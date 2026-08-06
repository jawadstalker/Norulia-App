import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';
import { Sparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface CharacterProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showGreeting?: boolean;
}

export function Character({ message, size = 'md', showGreeting = false }: CharacterProps) {
  const { colors } = useTheme();
  const { t } = useLanguage();

  const getSize = () => {
    const sizes = {
      sm: { width: 60, height: 60, fontSize: 24 },
      md: { width: 100, height: 100, fontSize: 40 },
      lg: { width: 140, height: 140, fontSize: 56 },
    };
    return sizes[size];
  };

  const sizeStyle = getSize();

  return (
    <View style={styles.container}>
      <MotiView
        from={{ scale: 0, rotate: '-180deg' }}
        animate={{ scale: 1, rotate: '0deg' }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <View
          style={[
            styles.character,
            {
              width: sizeStyle.width,
              height: sizeStyle.height,
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Text style={[styles.emoji, { fontSize: sizeStyle.fontSize }]}>
            🧠
          </Text>
          <MotiView
            from={{ scale: 1 }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ type: 'timing', duration: 2000, loop: true }}
            style={[styles.sparkle, { top: -5, right: -5 }]}
          >
            <Sparkles size={size === 'lg' ? 24 : 16} color={colors.warning} />
          </MotiView>
        </View>
      </MotiView>

      {(message || showGreeting) && (
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 300 }}
          style={[
            styles.bubble,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.message, { color: colors.text }]}>
            {message || t.characterGreeting}
          </Text>
        </MotiView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  character: {
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  emoji: {
    textAlign: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  bubble: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    maxWidth: width - 64,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
