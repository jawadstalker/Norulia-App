import React, { useRef } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutChangeEvent,
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

import {
  Spacing,
} from '../../constants/theme';

/**
 * Mirrors the TabBar from complete.html:
 * - single "pill" highlight that SLIDES between tabs (framer-motion layoutId="tabpill")
 * - labels always visible under every icon (not just the active one)
 * - floating circular "Nova" button in the center, lifted above the bar,
 *   with an infinite pulsing ring when active (nova-pulse)
 * - translucent / glassy bar background
 */

const PILL_WIDTH = 44;
const PILL_HEIGHT = 32;

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

  /**
   * Normalize pathname.
   *
   * IMPORTANT: expo-router's usePathname() strips route-GROUP
   * segments like "(tabs)" from the URL — they only exist on disk
   * for file organization, never in the actual pathname. So the
   * "protocol" tab reports as "/protocol", not "/(tabs)/protocol".
   *
   * We strip any "(group)" segment defensively so this keeps working
   * regardless of which representation is passed in.
   */
  const stripGroups = (path: string) =>
    path
      .replace(/\/\([^)]+\)/g, '') // remove /(group) segments anywhere
      .replace(/\/{2,}/g, '/');    // collapse any resulting //

  const normalizedRoute = (() => {
    const stripped = stripGroups(currentRoute);
    return stripped === '' ? '/' : stripped;
  })();

  /**
   * Determine active navigation item.
   */
  const isActiveRoute = (item: NavItem) => {
    if (item.id === 'home') {
      return (
        normalizedRoute === '/' ||
        normalizedRoute === '/index'
      );
    }

    if (item.id === 'nova') {
      return (
        normalizedRoute === '/assistant' ||
        normalizedRoute.startsWith('/assistant/')
      );
    }

    if (item.id === 'brain') {
      return (
        normalizedRoute === '/protocol' ||
        normalizedRoute.startsWith('/protocol/')
      );
    }

    if (item.id === 'calendar') {
      return (
        normalizedRoute === '/schedule' ||
        normalizedRoute.startsWith('/schedule/')
      );
    }

    if (item.id === 'profile') {
      return (
        normalizedRoute === '/profile' ||
        normalizedRoute.startsWith('/profile/')
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

  /**
   * ----- Sliding pill (equivalent of layoutId="tabpill") -----
   * We measure each side-item's box on layout, then spring the
   * pill's translateX/width to the active item whenever the route changes.
   */
  const pillX = useSharedValue(0);
  const pillReady = useSharedValue(0);

  const itemLayouts = useRef<Record<string, { x: number; width: number }>>({});

  const movePillTo = (id: string) => {
    const layout = itemLayouts.current[id];

    if (!layout) return;

    const target = layout.x + layout.width / 2 - PILL_WIDTH / 2;

    pillX.value = withSpring(target, {
      stiffness: 420,
      damping: 32,
    });

    pillReady.value = withTiming(1, { duration: 150 });
  };

  const handleItemLayout = (item: NavItem) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;

    itemLayouts.current[item.id] = { x, width };

    if (isActiveRoute(item)) {
      movePillTo(item.id);
    }
  };

  React.useEffect(() => {
    const activeSideItem = navItems.find(
      (it) => !it.isCenter && isActiveRoute(it)
    );

    if (activeSideItem) {
      movePillTo(activeSideItem.id);
    } else {
      pillReady.value = withTiming(0, { duration: 150 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedRoute]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    opacity: pillReady.value,
  }));

  /**
   * ----- Nova pulse ring (equivalent of .nova-pulse) -----
   * Infinite scale 1 -> 1.7 / opacity .45 -> 0 while the Nova tab is active.
   */
  const isNovaActive = isActiveRoute(
    navItems.find((it) => it.id === 'nova')!
  );

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (isNovaActive) {
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
      pulseScale.value = 1;
      pulseOpacity.value = 0;
    }
  }, [isNovaActive]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? 'rgba(36,29,58,0.88)'
            : 'rgba(255,255,255,0.88)',

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
      {/* Sliding active pill (single shared indicator) */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pill,
          pillStyle,
          {
            top: Spacing.sm + 6,
            backgroundColor: colors.primary + '22',
          },
        ]}
      />

      {navItems.map((item) => {
        const isActive = isActiveRoute(item);

        const Icon = item.icon;

        const isCenter = item.isCenter === true;

        if (isCenter) {
          return (
            <View
              key={item.id}
              style={styles.centerWrap}
            >
              <TouchableOpacity
                onPress={() => handlePress(item.route)}
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
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.novaPulse,
                    pulseStyle,
                    { backgroundColor: colors.primary },
                  ]}
                />

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

        return (
          <TouchableOpacity
            key={item.id}
            onLayout={handleItemLayout(item)}
            onPress={() => handlePress(item.route)}
            style={styles.navItem}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={item.id}
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
                ? t.home
                : item.id === 'brain'
                ? t.brain
                : item.id === 'calendar'
                ? t.plan
                : t.profile}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',

    alignItems: 'center',

    paddingHorizontal: Spacing.sm,

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

    position: 'relative',
  },

  navItem: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    gap: 3,

    paddingVertical: Spacing.xs,

    minHeight: 56,
  },

  iconWrap: {
    width: PILL_WIDTH,

    height: 28,

    alignItems: 'center',

    justifyContent: 'center',
  },

  pill: {
    position: 'absolute',

    width: PILL_WIDTH,

    height: PILL_HEIGHT,

    borderRadius: 14,
  },

  label: {
    fontSize: 10,

    fontWeight: '600',

    letterSpacing: 0.2,

    textAlign: 'center',
  },

  centerWrap: {
    flex: 1.5,

    alignItems: 'center',

    justifyContent: 'center',

    transform: [{ translateY: -18 }],
  },

  novaButton: {
    width: 58,

    height: 58,

    borderRadius: 29,

    alignItems: 'center',

    justifyContent: 'center',

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