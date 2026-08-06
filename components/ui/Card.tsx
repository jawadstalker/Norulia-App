import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, BorderRadius } from '../../constants/theme';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
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

  const getPaddingStyle = (): ViewStyle => {
    const paddingStyles: Record<string, ViewStyle> = {
      none: { padding: 0 },
      sm: { padding: Spacing.sm },
      md: { padding: Spacing.md },
      lg: { padding: Spacing.lg },
    };
    return paddingStyles[padding];
  };

  const getVariantStyle = (): ViewStyle => {
    const variantStyles: Record<string, ViewStyle> = {
      elevated: {
        backgroundColor: colors.surface,
        shadowColor: isDark ? colors.primary : '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.15 : 0.08,
        shadowRadius: 12,
        elevation: 8,
      },
      outlined: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      },
      filled: {
        backgroundColor: colors.surfaceSecondary,
      },
    };
    return variantStyles[variant];
  };

  const cardStyle = [
    styles.card,
    getPaddingStyle(),
    getVariantStyle(),
    style,
  ];

  if (animate) {
    return (
      <MotiView
        from={{ opacity: 0, translateY: 20, scale: 0.95 }}
        animate={{ opacity: 1, translateY: 0, scale: 1 }}
        transition={{ type: 'timing', duration: 400, delay }}
        style={cardStyle}
      >
        {children}
      </MotiView>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
});
