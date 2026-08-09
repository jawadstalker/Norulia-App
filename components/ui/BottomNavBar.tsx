
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useTheme } from '../../context/ThemeContext';
import {
  Home,
  Brain,
  MessageCircle,
  Calendar,
  User,
  Sparkles,
} from 'lucide-react-native';
import { Spacing, BorderRadius } from '../../constants/theme';

interface NavItem {
  id: string;
  icon: typeof Home;
  route: string;
  isCenter?: boolean;
}

const navItems: NavItem[] = [
  {
    id: 'home',
    icon: Home,
    route: '/(tabs)',
  },
  {
    id: 'brain',
    icon: Brain,
    route: '/(tabs)/protocol',
  },
  {
    id: 'assistant',
    icon: MessageCircle,
    route: '/(tabs)/assistant',
    isCenter: true,
  },
  {
    id: 'calendar',
    icon: Calendar,
    route: '/(tabs)/schedule',
  },
  {
    id: 'profile',
    icon: User,
    route: '/(tabs)/profile',
  },
];

interface BottomNavBarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export function BottomNavBar({
  currentRoute,
  onNavigate,
}: BottomNavBarProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // ==========================================
  // تشخیص صفحه فعال
  // ==========================================
  const isActiveRoute = (item: NavItem) => {
    // Home
    if (item.id === 'home') {
      return (
        currentRoute === '/(tabs)' ||
        currentRoute === '/' ||
        currentRoute === '/(tabs)/index'
      );
    }

    return (
      currentRoute === item.route ||
      currentRoute.startsWith(`${item.route}/`)
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? colors.surface : '#FFFFFF',
          paddingBottom: insets.bottom + Spacing.sm,
          borderTopColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: isDark ? 0.3 : 0.06,
          shadowRadius: 12,
          elevation: 8,
        },
      ]}
    >
      {navItems.map((item) => {
        const isActive = isActiveRoute(item);
        const Icon = item.icon;
        const isCenter = item.isCenter;

        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => onNavigate(item.route)}
            style={[
              styles.navItem,
              isCenter && styles.centerItem,
            ]}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>

              {/* =========================
                  ACTIVE BACKGROUND
              ========================== */}
              {isActive && !isCenter && (
                <MotiView
                  from={{
                    scale: 0.5,
                    opacity: 0,
                    translateY: 10,
                  }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    translateY: 0,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 18,
                  }}
                  style={[
                    styles.activeBackground,
                    {
                      backgroundColor: colors.primary + '15',
                    },
                  ]}
                />
              )}

              {/* =========================
                  CENTER BUTTON
              ========================== */}
              {isCenter ? (
                <MotiView
                  animate={{
                    scale: isActive ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    loop: isActive,
                    duration: 2000,
                    type: 'timing',
                  }}
                  style={[
                    styles.centerButton,
                    {
                      backgroundColor: isActive
                        ? colors.primary
                        : colors.surfaceSecondary,
                      shadowColor: isActive
                        ? colors.primary
                        : 'transparent',
                    },
                  ]}
                >
                  <Sparkles
                    size={24}
                    color={
                      isActive
                        ? '#FFFFFF'
                        : colors.textTertiary
                    }
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </MotiView>
              ) : (

                /* =========================
                    NORMAL ICON
                ========================== */
                <MotiView
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 18,
                  }}
                >
                  <Icon
                    size={24}
                    color={
                      isActive
                        ? colors.primary
                        : colors.textTertiary
                    }
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </MotiView>
              )}
            </View>

            {/* =========================
                LABEL
            ========================== */}
            {!isCenter && (
              <MotiView
                animate={{
                  opacity: isActive ? 1 : 0,
                  translateY: isActive ? 0 : 10,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 18,
                }}
                style={styles.labelContainer}
              >
                <Text
                  style={[
                    styles.label,
                    {
                      color: isActive
                        ? colors.primary
                        : colors.textTertiary,
                    },
                  ]}
                >
                  {item.id === 'home'
                    ? 'Home'
                    : item.id === 'brain'
                    ? 'Brain'
                    : item.id === 'calendar'
                    ? 'Plan'
                    : 'Profile'}
                </Text>
              </MotiView>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },

  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
    position: 'relative',
  },

  centerItem: {
    flex: 1.2,
  },

  iconWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    position: 'relative',
  },

  activeBackground: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
  },

  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  labelContainer: {
    position: 'absolute',
    bottom: -2,
  },

  label: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});

