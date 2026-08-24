import React, { ReactNode, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius } from '../../constants/theme';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  animate?: boolean;
  delay?: number;
}

export function Card({
  children,
  style,
  variant = 'elevated',
  padding = 'md',
  animate = true,
  delay = 0,
}: CardProps) {
  const { colors, isDark } = useTheme();

  const cardStyle = useMemo<StyleProp<ViewStyle>>(
    () => [
      styles.card,

      {
        padding:
          padding === 'none'
            ? 0
            : padding === 'sm'
              ? Spacing.sm
              : padding === 'lg'
                ? Spacing.lg
                : Spacing.md,
      },

      variant === 'outlined'
        ? {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }
        : variant === 'filled'
          ? {
              backgroundColor: colors.surfaceSecondary,
            }
          : {
              backgroundColor: colors.surface,

              shadowColor: isDark
                ? colors.primary
                : '#000000',

              shadowOffset: {
                width: 0,
                height: 4,
              },

              shadowOpacity: isDark
                ? 0.15
                : 0.08,

              shadowRadius: 12,

              elevation: 8,
            },

      style,
    ],
    [
      colors,
      isDark,
      padding,
      variant,
      style,
    ],
  );
  if (animate) {
    return (
      <MotiView
        from={{
          opacity: 0,
          translateY: 12,
          scale: 0.985,
        }}
        animate={{
          opacity: 1,
          translateY: 0,
          scale: 1,
        }}
        transition={{
          type: 'timing',
          duration: 260,
          delay,
        }}
        style={cardStyle}
      >
        {children}
      </MotiView>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
});