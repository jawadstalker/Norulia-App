import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MotiView } from 'moti';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

import {
  Home,
  Brain,
  Calendar,
  User,
  Sparkles,
} from 'lucide-react-native';

import { Spacing } from '../../constants/theme';

/* =========================================================
   TYPES
   ========================================================= */

interface NavItem {
  id: 'home' | 'brain' | 'nova' | 'calendar' | 'profile';
  icon: typeof Home;
  route: string;
  isCenter?: boolean;
}

/* =========================================================
   CONSTANTS
   ========================================================= */

const PILL_WIDTH = 48;
const PILL_HEIGHT = 34;

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
    id: 'nova',
    icon: Sparkles,
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

/* =========================================================
   COMPONENT
   ========================================================= */

interface BottomNavBarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export function BottomNavBar({
  currentRoute,
  onNavigate,
}: BottomNavBarProps) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  /* =======================================================
     NORMALIZE ROUTE
     ======================================================= */

  const stripGroups = (path: string) => {
    return path
      .replace(/\/\([^)]+\)/g, '')
      .replace(/\/{2,}/g, '/');
  };

  const normalizedRoute = (() => {
    const stripped = stripGroups(currentRoute || '/');

    if (!stripped || stripped === '') {
      return '/';
    }

    return stripped;
  })();

  /* =======================================================
     ACTIVE ITEM
     ======================================================= */

  const isActiveRoute = (item: NavItem) => {
    switch (item.id) {
      case 'home':
        return (
          normalizedRoute === '/' ||
          normalizedRoute === '/index'
        );

      case 'brain':
        return (
          normalizedRoute === '/protocol' ||
          normalizedRoute.startsWith('/protocol/')
        );

      case 'nova':
        return (
          normalizedRoute === '/assistant' ||
          normalizedRoute.startsWith('/assistant/')
        );

      case 'calendar':
        return (
          normalizedRoute === '/schedule' ||
          normalizedRoute.startsWith('/schedule/')
        );

      case 'profile':
        return (
          normalizedRoute === '/profile' ||
          normalizedRoute.startsWith('/profile/')
        );

      default:
        return false;
    }
  };

  /* =======================================================
     ACTIVE INDEX
     ======================================================= */

  const activeIndex = Math.max(
    0,
    navItems.findIndex((item) => isActiveRoute(item))
  );

  /* =======================================================
     SLIDING HIGHLIGHT
     ======================================================= */

  const pillPosition = useSharedValue(activeIndex);

  React.useEffect(() => {
    pillPosition.value = withSpring(activeIndex, {
      stiffness: 500,
      damping: 35,
      mass: 0.7,
    });
  }, [activeIndex, pillPosition]);

  /*
   * IMPORTANT:
   *
   * The navbar is divided into exactly 5 equal slots.
   *
   * Each slot has flex: 1.
   *
   * Therefore:
   *
   * slot 0 = Home
   * slot 1 = Brain
   * slot 2 = Nova
   * slot 3 = Calendar
   * slot 4 = Profile
   *
   * The highlight uses percentage-based positioning.
   *
   * This prevents the old problem where the highlight
   * was calculated from individual onLayout values and
   * appeared slightly left/right of the selected icon.
   */

  const pillAnimatedStyle = useAnimatedStyle(() => {
    return {
      left: `${pillPosition.value * 20}%`,
    };
  });

  /* =======================================================
     NOVA PULSE
     ======================================================= */

  const novaActive = isActiveRoute(
    navItems.find((item) => item.id === 'nova')!
  );

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (novaActive) {
      pulseScale.value = 1;
      pulseOpacity.value = 0.45;

      pulseScale.value = withRepeat(
        withTiming(1.7, {
          duration: 1600,
          easing: Easing.out(Easing.ease),
        }),
        -1,
        false
      );

      pulseOpacity.value = withRepeat(
        withTiming(0, {
          duration: 1600,
          easing: Easing.out(Easing.ease),
        }),
        -1,
        false
      );
    } else {
      pulseScale.value = withTiming(1, {
        duration: 200,
      });

      pulseOpacity.value = withTiming(0, {
        duration: 200,
      });
    }
  }, [novaActive, pulseOpacity, pulseScale]);

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: pulseScale.value,
        },
      ],
      opacity: pulseOpacity.value,
    };
  });

  /* =======================================================
     NAVIGATION
     ======================================================= */

  const handlePress = (route: string) => {
    const normalizedTarget = stripGroups(route);

    if (normalizedTarget === normalizedRoute) {
      return;
    }

    onNavigate(route);
  };

  /* =======================================================
     LABELS
     ======================================================= */

  const getLabel = (id: NavItem['id']) => {
    switch (id) {
      case 'home':
        return t.home;

      case 'brain':
        return t.brain;

      case 'calendar':
        return t.plan;

      case 'profile':
        return t.profile;

      case 'nova':
        return 'Nova';

      default:
        return '';
    }
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? 'rgba(36,29,58,0.94)'
            : 'rgba(255,255,255,0.96)',

          borderTopColor: colors.border,

          paddingBottom:
            Math.max(insets.bottom, 0) + Spacing.sm,
        },
      ]}
    >
      {/* =================================================
          ACTIVE HIGHLIGHT
          ================================================= */}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.pill,
          pillAnimatedStyle,
          {
            backgroundColor: colors.primary + '20',
          },
        ]}
      />

      {/* =================================================
          NAV ITEMS
          ================================================= */}

      {navItems.map((item) => {
        const isActive = isActiveRoute(item);

        const Icon = item.icon;

        /* ===============================================
           NOVA CENTER BUTTON
           =============================================== */

        if (item.isCenter) {
          return (
            <View
              key={item.id}
              style={styles.navSlot}
            >
              <TouchableOpacity
                onPress={() =>
                  handlePress(item.route)
                }
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Nova AI"
                style={[
                  styles.novaButton,
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
                {/* Pulse ring */}

                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.novaPulse,
                    pulseAnimatedStyle,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                />

                {/* Nova icon */}

                <MotiView
                  animate={{
                    scale: isActive
                      ? [1, 1.08, 1]
                      : 1,
                  }}
                  transition={{
                    loop: isActive,
                    duration: 1800,
                    type: 'timing',
                  }}
                >
                  <Sparkles
                    size={24}
                    color={
                      isActive
                        ? '#FFFFFF'
                        : colors.textTertiary
                    }
                    strokeWidth={
                      isActive ? 2.4 : 1.9
                    }
                  />
                </MotiView>
              </TouchableOpacity>
            </View>
          );
        }

        /* ===============================================
           NORMAL NAV ITEM
           =============================================== */

        return (
          <TouchableOpacity
            key={item.id}
            onPress={() =>
              handlePress(item.route)
            }
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={getLabel(item.id)}
            style={styles.navSlot}
          >
            <MotiView
              animate={{
                scale: isActive ? 1.08 : 1,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 18,
              }}
              style={styles.iconWrap}
            >
              <Icon
                size={23}
                color={
                  isActive
                    ? colors.primary
                    : colors.textTertiary
                }
                strokeWidth={
                  isActive ? 2.3 : 1.9
                }
              />
            </MotiView>

            <Text
              numberOfLines={1}
              style={[
                styles.label,
                {
                  color: isActive
                    ? colors.primary
                    : colors.textTertiary,
                },
              ]}
            >
              {getLabel(item.id)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/* =========================================================
   STYLES
   ========================================================= */

const styles = StyleSheet.create({
  container: {
    position: 'relative',

    flexDirection: 'row',

    alignItems: 'center',

    width: '100%',

    minHeight: 76,

    paddingHorizontal: 0,

    paddingTop: Spacing.sm,

    borderTopWidth: 1,

    zIndex: 100,

    elevation: 12,

    shadowOffset: {
      width: 0,
      height: -4,
    },

    shadowOpacity: 0.08,

    shadowRadius: 12,
  },

  /*
   * EVERY ITEM HAS EXACTLY THE SAME WIDTH.
   *
   * This is the important part of the fix.
   */

  navSlot: {
    flex: 1,

    height: 62,

    alignItems: 'center',

    justifyContent: 'center',

    position: 'relative',

    zIndex: 2,
  },

  /*
   * Icon area is also centered.
   */

  iconWrap: {
    width: PILL_WIDTH,

    height: 30,

    alignItems: 'center',

    justifyContent: 'center',
  },


  pill: {
    position: 'absolute',

top: Spacing.sm + 5,

width: '20%',

height: PILL_HEIGHT,

borderRadius: 17,

zIndex: 0,

alignSelf: 'center',
  },

  label: {
    marginTop: 3,

    fontSize: 10,

    lineHeight: 13,

    fontWeight: '600',

    letterSpacing: 0.15,

    textAlign: 'center',

    maxWidth: 72,
  },

  /*
   * NOVA
   */

  novaButton: {
    width: 58,

    height: 58,

    borderRadius: 29,

    alignItems: 'center',

    justifyContent: 'center',

    position: 'relative',

    marginTop: -18,

    shadowOffset: {
      width: 0,

      height: 10,
    },

    shadowOpacity: 0.35,

    shadowRadius: 20,

    elevation: 10,
  },

  novaPulse: {
    position: 'absolute',

    width: 58,

    height: 58,

    borderRadius: 29,
  },
});