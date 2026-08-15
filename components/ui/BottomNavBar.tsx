import React, { useEffect, useRef } from 'react';
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
import { Spacing } from '../../constants/theme';

interface NavItem {
  id: 'home' | 'brain' | 'nova' | 'calendar' | 'profile';
  icon: typeof Home;
  route: string;
  isCenter?: boolean;
}

interface BottomNavBarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

interface ItemLayout {
  x: number;
  width: number;
}

const navItems: NavItem[] = [
  { id: 'home', icon: Home, route: '/(tabs)' },
  { id: 'brain', icon: Brain, route: '/(tabs)/protocol' },
  { id: 'nova', icon: Sparkles, route: '/(tabs)/assistant', isCenter: true },
  { id: 'calendar', icon: Calendar, route: '/(tabs)/schedule' },
  { id: 'profile', icon: User, route: '/(tabs)/profile' },
];

const ACTIVE_PILL_HEIGHT = 54;
const CENTER_BUTTON_SIZE = 60;

export function BottomNavBar({ currentRoute, onNavigate }: BottomNavBarProps) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const stripGroups = (path: string) => {
    return path.replace(/\/\([^)]+\)/g, '').replace(/\/{2,}/g, '/');
  };

  const normalizedRoute = (() => {
    const stripped = stripGroups(currentRoute || '');
    if (!stripped || stripped === '') return '/';
    return stripped;
  })();

  const isActiveRoute = (item: NavItem) => {
    switch (item.id) {
      case 'home':
        return normalizedRoute === '/' || normalizedRoute === '/index';
      case 'brain':
        return normalizedRoute === '/protocol' || normalizedRoute.startsWith('/protocol/');
      case 'nova':
        return normalizedRoute === '/assistant' || normalizedRoute.startsWith('/assistant/');
      case 'calendar':
        return normalizedRoute === '/schedule' || normalizedRoute.startsWith('/schedule/');
      case 'profile':
        return normalizedRoute === '/profile' || normalizedRoute.startsWith('/profile/');
      default:
        return false;
    }
  };

  const handlePress = (route: string) => {
    const normalizedTarget = stripGroups(route);
    if (normalizedTarget === normalizedRoute) return;
    onNavigate(route);
  };

  const pillX = useSharedValue(0);
  const pillWidth = useSharedValue(0);
  const pillOpacity = useSharedValue(0);
  const itemLayouts = useRef<Record<string, ItemLayout>>({});

  const movePillTo = (itemId: string) => {
    const layout = itemLayouts.current[itemId];
    if (!layout) return;

    const horizontalMargin = 6;
    const targetX = layout.x + horizontalMargin;
    const targetWidth = Math.max(layout.width - horizontalMargin * 2, 48);

    pillX.value = withSpring(targetX, { stiffness: 420, damping: 32, mass: 0.7 });
    pillWidth.value = withSpring(targetWidth, { stiffness: 420, damping: 32, mass: 0.7 });
    pillOpacity.value = withTiming(1, { duration: 180 });
  };

  const handleItemLayout = (item: NavItem) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    itemLayouts.current[item.id] = { x, width };
    if (!item.isCenter && isActiveRoute(item)) {
      movePillTo(item.id);
    }
  };

  useEffect(() => {
    const activeItem = navItems.find((item) => !item.isCenter && isActiveRoute(item));
    if (activeItem) {
      movePillTo(activeItem.id);
      const timer = setTimeout(() => movePillTo(activeItem.id), 50);
      return () => clearTimeout(timer);
    }
    pillOpacity.value = withTiming(0, { duration: 150 });
  }, [normalizedRoute]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: pillWidth.value,
    opacity: pillOpacity.value,
  }));

  const novaItem = navItems.find((item) => item.id === 'nova');
  const isNovaActive = novaItem ? isActiveRoute(novaItem) : false;

  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  useEffect(() => {
    if (isNovaActive) {
      pulseScale.value = 1;
      pulseOpacity.value = 0.45;
      pulseScale.value = withRepeat(
        withTiming(1.65, { duration: 1600, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
      pulseOpacity.value = withRepeat(
        withTiming(0, { duration: 1600, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
      pulseOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [isNovaActive]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const getLabel = (id: NavItem['id']) => {
    switch (id) {
      case 'home': return t.home || 'Home';
      case 'brain': return t.brain || 'Protocol';
      case 'calendar': return t.plan || 'Plan';
      case 'profile': return t.profile || 'Profile';
      case 'nova': return 'Nova';
      default: return '';
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? 'rgba(28, 23, 45, 0.96)' : 'rgba(255, 255, 255, 0.96)',
          borderTopColor: colors.border,
          paddingBottom: Math.max(insets.bottom, 0) + Spacing.sm,
          shadowColor: '#000',
          shadowOpacity: isDark ? 0.28 : 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: -6 },
          elevation: 16,
        },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.activePill,
          pillStyle,
          {
            backgroundColor: colors.primary + '18',
            borderColor: colors.primary + '22',
          },
        ]}
      />

      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = isActiveRoute(item);

        if (item.isCenter) {
          return (
            <View key={item.id} style={styles.centerContainer}>
              <TouchableOpacity
                onPress={() => handlePress(item.route)}
                activeOpacity={0.88}
                accessibilityRole="button"
                accessibilityLabel="Nova AI"
                style={[
                  styles.novaButton,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surfaceSecondary,
                    shadowColor: isActive ? colors.primary : 'transparent',
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
                    scale: isActive ? [1, 1.08, 1] : 1,
                  }}
                  transition={{
                    loop: isActive,
                    duration: 1800,
                    type: 'timing',
                  }}
                >
                  <Sparkles
                    size={25}
                    color={isActive ? '#FFFFFF' : colors.textTertiary}
                    strokeWidth={isActive ? 2.4 : 1.9}
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
            activeOpacity={0.78}
            accessibilityRole="button"
            accessibilityLabel={getLabel(item.id)}
            style={styles.navItem}
          >
            <MotiView
              animate={{ scale: isActive ? 1.08 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 18 }}
              style={styles.iconContainer}
            >
              <Icon
                size={22}
                color={isActive ? colors.primary : colors.textTertiary}
                strokeWidth={isActive ? 2.35 : 1.9}
              />
            </MotiView>
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                { color: isActive ? colors.primary : colors.textTertiary },
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

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 76,
    minHeight: 76,
    paddingHorizontal: 6,
    paddingTop: 9,
    borderTopWidth: 1,
    zIndex: 100,
    elevation: 16,
    overflow: 'visible',
  },

  activePill: {
    position: 'absolute',
    left: 0,
    top: 8,
    height: ACTIVE_PILL_HEIGHT,
    borderRadius: ACTIVE_PILL_HEIGHT / 2,
    borderWidth: 1,
    zIndex: 0,
  },

  navItem: {
    flex: 1,
    minWidth: 0,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    paddingVertical: 4,
    gap: 3,
    zIndex: 2,
  },

  iconContainer: {
    width: 30,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
    textAlign: 'center',
    includeFontPadding: false,
  },

  centerContainer: {
    flex: 1,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    position: 'relative',
  },

  novaButton: {
    position: 'absolute',
    top: -18,
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 14,
    zIndex: 30,
  },

  novaPulse: {
    position: 'absolute',
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    transform: [{ translateY: -20 }],
    borderRadius: CENTER_BUTTON_SIZE / 2,
  },
});