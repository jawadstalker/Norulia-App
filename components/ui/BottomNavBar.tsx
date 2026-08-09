import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

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

import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';

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

  /**
   * Normalize pathname.
   *
   * Expo Router can report different representations
   * of route groups depending on navigation state.
   */
  const normalizedRoute =
    currentRoute === '/'
      ? '/(tabs)'
      : currentRoute;

  /**
   * Determine active navigation item.
   */
  const isActiveRoute = (item: NavItem) => {
    /**
     * HOME
     */
    if (item.id === 'home') {
      return (
        normalizedRoute === '/(tabs)' ||
        normalizedRoute === '/(tabs)/' ||
        normalizedRoute === '/'
      );
    }

    /**
     * ASSISTANT
     */
    if (item.id === 'assistant') {
      return (
        normalizedRoute === '/(tabs)/assistant' ||
        normalizedRoute.startsWith('/(tabs)/assistant/')
      );
    }

    /**
     * BRAIN / PROTOCOL
     */
    if (item.id === 'brain') {
      return (
        normalizedRoute === '/(tabs)/protocol' ||
        normalizedRoute.startsWith('/(tabs)/protocol/')
      );
    }

    /**
     * CALENDAR / SCHEDULE
     */
    if (item.id === 'calendar') {
      return (
        normalizedRoute === '/(tabs)/schedule' ||
        normalizedRoute.startsWith('/(tabs)/schedule/')
      );
    }

    /**
     * PROFILE
     */
    if (item.id === 'profile') {
      return (
        normalizedRoute === '/(tabs)/profile' ||
        normalizedRoute.startsWith('/(tabs)/profile/')
      );
    }

    return false;
  };

  /**
   * Handle navigation safely.
   */
  const handlePress = (route: string) => {
    if (route === normalizedRoute) {
      return;
    }

    onNavigate(route);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? colors.surface
            : '#FFFFFF',

          /**
           * Android / iPhone bottom safe area.
           */
          paddingBottom:
            Math.max(insets.bottom, 0) + Spacing.sm,

          borderTopColor: colors.border,

          shadowColor: '#000',

          shadowOffset: {
            width: 0,
            height: -4,
          },

          shadowOpacity: isDark
            ? 0.3
            : 0.06,

          shadowRadius: 12,

          elevation: 12,
        },
      ]}
    >
      {navItems.map((item) => {
        const isActive = isActiveRoute(item);

        const Icon = item.icon;

        const isCenter = item.isCenter === true;

        return (
          <TouchableOpacity
            key={item.id}
            onPress={() => handlePress(item.route)}
            style={[
              styles.navItem,
              isCenter && styles.centerItem,
            ]}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={item.id}
          >
            <View style={styles.iconWrapper}>

              {/* Active background */}
              {isActive && (
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
                      backgroundColor: isCenter
                        ? colors.primary + '30'
                        : colors.primary + '15',
                    },
                  ]}
                />
              )}

              {/* Center Nova button */}
              {isCenter ? (
                <MotiView
                  animate={{
                    scale: isActive
                      ? [1, 1.1, 1]
                      : 1,
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
                    strokeWidth={
                      isActive ? 2.5 : 2
                    }
                  />
                </MotiView>
              ) : (
                <MotiView
                  animate={{
                    scale: isActive
                      ? 1.1
                      : 1,
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
                    strokeWidth={
                      isActive ? 2.5 : 2
                    }
                  />
                </MotiView>
              )}
            </View>

            {/* Label */}
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

    /**
     * Prevent Android from collapsing the navbar
     * when the content above changes.
     */
    minHeight: 72,

    /**
     * Keep navbar above normal screen content.
     */
    zIndex: 100,

    elevation: 12,
  },

  navItem: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    paddingVertical: Spacing.xs,

    position: 'relative',

    minHeight: 56,
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

    elevation: 8,
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