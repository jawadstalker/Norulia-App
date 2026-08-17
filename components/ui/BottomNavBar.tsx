import React, {
  memo,
  useCallback,
  useMemo,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  useTheme,
} from '../../context/ThemeContext';

import {
  useLanguage,
} from '../../context/LanguageContext';

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

/* ================================================================
   TYPES
================================================================ */

type NavItemId =
  | 'home'
  | 'brain'
  | 'nova'
  | 'calendar'
  | 'profile';

interface NavItem {
  id: NavItemId;
  icon: typeof Home;
  route: string;
  isCenter?: boolean;
}

interface BottomNavBarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

/* ================================================================
   CONSTANTS
================================================================ */

const NAV_COUNT = 5;

const BAR_HEIGHT = 76;

const CONTENT_HEIGHT = 60;

const ACTIVE_HEIGHT = 50;

const ACTIVE_MARGIN = 5;

const NOVA_SIZE = 54;

/* ================================================================
   NAVIGATION ITEMS
================================================================ */

const NAV_ITEMS: readonly NavItem[] = [
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

/* ================================================================
   ROUTE NORMALIZATION
================================================================ */

function normalizeRoute(
  path: string
): string {
  if (!path) {
    return '/';
  }

  let result = path
    .replace(
      /\/\([^)]+\)/g,
      ''
    )
    .replace(
      /\/{2,}/g,
      '/'
    );

  if (
    result.length > 1 &&
    result.endsWith('/')
  ) {
    result =
      result.slice(
        0,
        -1
      );
  }

  return result || '/';
}

/* ================================================================
   ACTIVE ROUTE
================================================================ */

function getActiveItem(
  route: string
): NavItemId | null {
  const normalized =
    normalizeRoute(route);

  if (
    normalized === '/' ||
    normalized === '/index'
  ) {
    return 'home';
  }

  if (
    normalized === '/protocol' ||
    normalized.startsWith(
      '/protocol/'
    )
  ) {
    return 'brain';
  }

  if (
    normalized === '/assistant' ||
    normalized.startsWith(
      '/assistant/'
    )
  ) {
    return 'nova';
  }

  if (
    normalized === '/schedule' ||
    normalized.startsWith(
      '/schedule/'
    )
  ) {
    return 'calendar';
  }

  if (
    normalized === '/profile' ||
    normalized.startsWith(
      '/profile/'
    )
  ) {
    return 'profile';
  }

  /*
   * Important:
   *
   * Pages such as settings do not belong
   * to any bottom navigation item.
   *
   * Therefore we return null instead
   * of incorrectly activating another item.
   */
  return null;
}

/* ================================================================
   COMPONENT
================================================================ */

function BottomNavBarComponent({
  currentRoute,
  onNavigate,
}: BottomNavBarProps) {
  const {
    colors,
    isDark,
  } = useTheme();

  const {
    t,
  } = useLanguage();

  const insets =
    useSafeAreaInsets();

  /* ==============================================================
     ROUTE
  ============================================================== */

  const normalizedRoute =
    useMemo(
      () =>
        normalizeRoute(
          currentRoute
        ),
      [currentRoute]
    );

  /* ==============================================================
     ACTIVE ITEM
  ============================================================== */

  const activeItem =
    useMemo(
      () =>
        getActiveItem(
          normalizedRoute
        ),
      [normalizedRoute]
    );

  /* ==============================================================
     ACTIVE INDEX
  ============================================================== */

  const activeIndex =
    useMemo(() => {
      if (!activeItem) {
        return -1;
      }

      return NAV_ITEMS.findIndex(
        (item) =>
          item.id ===
          activeItem
      );
    }, [activeItem]);

  /* ==============================================================
     INDICATOR POSITION
  ============================================================== */

  const indicatorX =
    useSharedValue(
      activeIndex >= 0
        ? activeIndex /
          NAV_COUNT
        : 0
    );

  const indicatorOpacity =
    useSharedValue(
      activeIndex >= 0
        ? 1
        : 0
    );

  /*
   * The indicator uses a normalized
   * 0..1 position.
   *
   * This avoids onLayout,
   * refs and layout callbacks.
   *
   * Much less work for React Native.
   */

  React.useEffect(() => {
    if (
      activeIndex < 0
    ) {
      indicatorOpacity.value =
        withTiming(
          0,
          {
            duration: 100,
          }
        );

      return;
    }

    indicatorX.value =
      withTiming(
        activeIndex /
          NAV_COUNT,
        {
          duration: 180,
        }
      );

    indicatorOpacity.value =
      withTiming(
        1,
        {
          duration: 120,
        }
      );
  }, [
    activeIndex,
    indicatorOpacity,
    indicatorX,
  ]);

  /* ==============================================================
     INDICATOR STYLE
  ============================================================== */

  const indicatorStyle =
    useAnimatedStyle(
      () => ({
        left: `${indicatorX.value * 100}%`,

        opacity:
          indicatorOpacity.value,

        width: `${100 / NAV_COUNT}%`,
      }),
      []
    );

  /* ==============================================================
     NAVIGATION
  ============================================================== */

  const handleNavigate =
    useCallback(
      (route: string) => {
        const target =
          normalizeRoute(
            route
          );

        if (
          target ===
          normalizedRoute
        ) {
          return;
        }

        onNavigate(route);
      },
      [
        normalizedRoute,
        onNavigate,
      ]
    );

  /* ==============================================================
     LABEL
  ============================================================== */

  const getLabel =
    useCallback(
      (
        id: NavItemId
      ): string => {
        switch (id) {
          case 'home':
            return (
              t.home ||
              'Home'
            );

          case 'brain':
            return (
              t.brain ||
              'Protocol'
            );

          case 'nova':
            return 'Nova';

          case 'calendar':
            return (
              t.plan ||
              'Plan'
            );

          case 'profile':
            return (
              t.profile ||
              'Profile'
            );

          default:
            return '';
        }
      },
      [t]
    );

  /* ==============================================================
     COLORS
  ============================================================== */

  const backgroundColor =
    isDark
      ? '#17131F'
      : '#FFFFFF';

  const borderColor =
    isDark
      ? 'rgba(255,255,255,0.08)'
      : colors.border;

  const inactiveColor =
    isDark
      ? 'rgba(255,255,255,0.55)'
      : colors.textTertiary;

  const activeColor =
    colors.primary;

  const indicatorBackground =
    isDark
      ? `${colors.primary}1C`
      : `${colors.primary}12`;

  const indicatorBorder =
    isDark
      ? `${colors.primary}30`
      : `${colors.primary}18`;

  /* ==============================================================
     RENDER
  ============================================================== */

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderTopColor:
            borderColor,

          paddingBottom:
            Math.max(
              insets.bottom,
              0
            ) +
            Spacing.sm,

          shadowColor:
            '#000000',

          shadowOpacity:
            isDark
              ? 0.24
              : 0.06,

          shadowRadius:
            isDark
              ? 14
              : 10,

          shadowOffset: {
            width: 0,
            height: -3,
          },

          elevation: 10,
        },
      ]}
    >
      {/* ==========================================================
          NAVIGATION AREA

          IMPORTANT:

          The active background belongs to the
          navigation column itself.

          There is only ONE active indicator.
      ========================================================== */}

      <View
        style={
          styles.navigationArea
        }
      >
        {/* ========================================================
            ACTIVE INDICATOR
        ======================================================== */}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.activeIndicator,
            indicatorStyle,
            {
              backgroundColor:
                indicatorBackground,

              borderColor:
                indicatorBorder,
            },
          ]}
        />

        {/* ========================================================
            ITEMS
        ======================================================== */}

        {NAV_ITEMS.map(
          (item) => {
            const Icon =
              item.icon;

            const isActive =
              activeItem ===
              item.id;

            /* ====================================================
               NOVA
            ==================================================== */

            if (
              item.isCenter
            ) {
              return (
                <View
                  key={item.id}
                  style={
                    styles.navColumn
                  }
                >
                  <Pressable
                    onPress={() =>
                      handleNavigate(
                        item.route
                      )
                    }
                    accessibilityRole="button"
                    accessibilityLabel="Nova AI"
                    android_ripple={
                      {
                        color:
                          'transparent',
                        borderless:
                          false,
                      }
                    }
                    style={({ pressed }) => [
                      styles.novaButton,

                      {
                        backgroundColor:
                          isActive
                            ? colors.primary
                            : isDark
                            ? '#292231'
                            : '#F1EFF5',

                        borderColor:
                          isDark
                            ? '#17131F'
                            : '#FFFFFF',

                        opacity:
                          pressed
                            ? 0.82
                            : 1,

                        shadowColor:
                          isActive
                            ? colors.primary
                            : '#000000',

                        shadowOpacity:
                          isActive
                            ? isDark
                              ? 0.30
                              : 0.18
                            : isDark
                            ? 0.12
                            : 0.06,
                      },
                    ]}
                  >
                    <Sparkles
                      size={23}
                      color={
                        isActive
                          ? '#FFFFFF'
                          : isDark
                          ? colors.textSecondary
                          : colors.textTertiary
                      }
                      strokeWidth={
                        isActive
                          ? 2.4
                          : 2
                      }
                    />
                  </Pressable>

                  <Text
                    numberOfLines={
                      1
                    }
                    style={[
                      styles.label,
                      {
                        color:
                          isActive
                            ? activeColor
                            : inactiveColor,
                      },
                    ]}
                  >
                    Nova
                  </Text>
                </View>
              );
            }

            /* ====================================================
               NORMAL ITEM
            ==================================================== */

            return (
              <View
                key={item.id}
                style={
                  styles.navColumn
                }
              >
                <Pressable
                  onPress={() =>
                    handleNavigate(
                      item.route
                    )
                  }
                  accessibilityRole="button"
                  accessibilityLabel={getLabel(
                    item.id
                  )}
                  android_ripple={{
                    color:
                      'transparent',
                    borderless:
                      false,
                  }}
                  style={({ pressed }) => [
                    styles.navButton,

                    {
                      opacity:
                        pressed
                          ? 0.70
                          : 1,
                    },
                  ]}
                >
                  <View
                    style={
                      styles.iconBox
                    }
                  >
                    <Icon
                      size={21}
                      color={
                        isActive
                          ? activeColor
                          : inactiveColor
                      }
                      strokeWidth={
                        isActive
                          ? 2.35
                          : 1.9
                      }
                    />
                  </View>

                  <Text
                    numberOfLines={
                      1
                    }
                    style={[
                      styles.label,
                      {
                        color:
                          isActive
                            ? activeColor
                            : inactiveColor,
                      },
                    ]}
                  >
                    {getLabel(
                      item.id
                    )}
                  </Text>
                </Pressable>
              </View>
            );
          }
        )}
      </View>
    </View>
  );
}

/* ================================================================
   MEMO
================================================================ */

export const BottomNavBar =
  memo(
    BottomNavBarComponent
  );

/* ================================================================
   STYLES
================================================================ */

const styles =
  StyleSheet.create({
    /* ============================================================
       OUTER BAR
    ============================================================ */

    container: {
      width: '100%',

      height:
        BAR_HEIGHT,

      minHeight:
        BAR_HEIGHT,

      borderTopWidth:
        StyleSheet.hairlineWidth,

      overflow:
        'visible',

      zIndex: 100,

      elevation: 10,
    },

    /* ============================================================
       NAVIGATION AREA
    ============================================================ */

    navigationArea: {
      position: 'relative',

      flex: 1,

      flexDirection: 'row',

      alignItems: 'center',

      justifyContent:
        'space-between',

      width: '100%',

      height:
        CONTENT_HEIGHT,

      minHeight:
        CONTENT_HEIGHT,

      paddingHorizontal: 4,

      paddingTop: 2,
    },

    /* ============================================================
       ACTIVE INDICATOR

       IMPORTANT:

       The indicator is INSIDE the navigation area.

       Therefore it can never move outside
       the bottom navigation.
    ============================================================ */

    activeIndicator: {
      position: 'absolute',

      top:
        ACTIVE_MARGIN,

      height:
        ACTIVE_HEIGHT,

      borderRadius:
        ACTIVE_HEIGHT / 2,

      borderWidth: 1,

      marginHorizontal: 1,

      zIndex: 0,
    },

    /* ============================================================
       COLUMN
    ============================================================ */

    navColumn: {
      flex: 1,

      height:
        CONTENT_HEIGHT,

      minWidth: 0,

      alignItems:
        'center',

      justifyContent:
        'center',

      zIndex: 2,

      overflow:
        'visible',
    },

    /* ============================================================
       NORMAL BUTTON

       No fixed Touchable opacity highlight.
       No negative margins.
       No absolute positioning.
    ============================================================ */

    navButton: {
      width: '100%',

      height:
        CONTENT_HEIGHT,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 2,

      paddingVertical: 3,

      borderRadius: 12,

      backgroundColor:
        'transparent',

      overflow:
        'hidden',
    },

    /* ============================================================
       ICON BOX
    ============================================================ */

    iconBox: {
      width: 28,

      height: 25,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginBottom: 2,
    },

    /* ============================================================
       LABEL
    ============================================================ */

    label: {
      fontSize: 10,

      lineHeight: 13,

      fontWeight: '600',

      letterSpacing: 0.1,

      textAlign:
        'center',

      includeFontPadding:
        false,

      maxWidth:
        '100%',
    },

    /* ============================================================
       NOVA BUTTON

       No negative top.

       This is the important fix for the
       icon/button escaping the navbar.
    ============================================================ */

    novaButton: {
      width:
        NOVA_SIZE,

      height:
        NOVA_SIZE,

      maxWidth:
        NOVA_SIZE,

      maxHeight:
        NOVA_SIZE,

      borderRadius:
        NOVA_SIZE / 2,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth: 3,

      shadowOffset: {
        width: 0,

        height: 3,
      },

      shadowRadius: 7,

      elevation: 7,

      marginBottom: 1,
    },
  });