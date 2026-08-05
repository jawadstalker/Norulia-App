import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useTheme } from '../../context/ThemeContext';
import { Home, Brain, MessageCircle, Calendar, User } from 'lucide-react-native';
import { Spacing, BorderRadius } from '../../constants/theme';

interface NavItem {
  id: string;
  icon: typeof Home;
  route: string;
}

const navItems: NavItem[] = [
  { id: 'home', icon: Home, route: '/(tabs)' },
  { id: 'brain', icon: Brain, route: '/(tabs)/protocol' },
  { id: 'assistant', icon: MessageCircle, route: '/(tabs)/assistant' },
  { id: 'calendar', icon: Calendar, route: '/(tabs)/schedule' },
  { id: 'profile', icon: User, route: '/(tabs)/profile' },
];

interface BottomNavBarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export function BottomNavBar({ currentRoute, onNavigate }: BottomNavBarProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surface : colors.surface,
          paddingBottom: insets.bottom + Spacing.sm,
          borderTopColor: colors.border,
        },
      ]}
    >
      {navItems.map((item, index) => {
        const isActive = currentRoute.includes(item.route.split('/')[2] || '');
        const Icon = item.icon;

        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => onNavigate(item.route)}
            style={styles.navItem}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              {isActive && (
                <MotiView
                  from={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  style={[
                    styles.activeBackground,
                    { backgroundColor: colors.primary + '20' },
                  ]}
                />
              )}
              <Icon
                size={24}
                color={isActive ? colors.primary : colors.textTertiary}
                strokeWidth={isActive ? 2.5 : 2}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
  },
  activeBackground: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
  },
});
