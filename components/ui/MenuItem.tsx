import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface MenuItemProps {
  titleKey: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
  delay?: number;
  badge?: string | number;
  style?: ViewStyle;
}

export function MenuItem({
  titleKey,
  icon,
  color,
  onPress,
  delay = 0,
  badge,
  style,
}: MenuItemProps) {
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <MotiView
      from={{ opacity: 0, translateX: isRTL ? 20 : -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: 'timing', duration: 350, delay }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[
          styles.container,
          { backgroundColor: colors.surface },
          style,
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          {icon}
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t[titleKey as keyof typeof t]}
          </Text>
          {badge && (
            <View style={[styles.badge, { backgroundColor: color }]}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <ChevronIcon size={20} color={colors.textTertiary} />
      </TouchableOpacity>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.sm,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
