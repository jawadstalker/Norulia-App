import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutChangeEvent,
} from 'react-native';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
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

interface NavItem {
  id:
    | 'home'
    | 'brain'
    | 'nova'
    | 'calendar'
    | 'profile';

  icon: typeof Home;

  route: string;

  isCenter?: boolean;
}

interface BottomNavBarProps {
  currentRoute: string;

  onNavigate: (
    route: string
  ) => void;
}

interface ItemLayout {
  x: number;
  width: number;
}

/* ================================================================
   CONSTANTS
================================================================ */

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

const ACTIVE_PILL_HEIGHT = 54;

const CENTER_BUTTON_SIZE = 60;

/* ================================================================
   HELPERS
================================================================ */

/*
 * Convert:
 *
 * /(tabs)/schedule
 *
 * to:
 *
 * /schedule
 *
 * This prevents route-group differences from causing
 * unnecessary navigation.
 */
function normalizeRoute(
  path: string
): string {
  const normalized =
    path
      .replace(
        /\/\([^)]+\)/g,
        ''
      )
      .replace(
        /\/{2,}/g,
        '/'
      );

  return normalized || '/';
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

  const { t } =
    useLanguage();

  const insets =
    useSafeAreaInsets();

  /* ==============================================================
     ROUTE
  ============================================================== */

  const normalizedRoute =
    useMemo(
      () =>
        normalizeRoute(
          currentRoute || '/'
        ),
      [currentRoute]
    );

  /* ==============================================================
     ACTIVE ROUTE
  ============================================================== */

  const isActiveRoute =
    useCallback(
      (item: NavItem) => {
        switch (item.id) {
          case 'home':
            return (
              normalizedRoute ===
                '/' ||
              normalizedRoute ===
                '/index'
            );

          case 'brain':
            return (
              normalizedRoute ===
                '/protocol' ||
              normalizedRoute.startsWith(
                '/protocol/'
              )
            );

          case 'nova':
            return (
              normalizedRoute ===
                '/assistant' ||
              normalizedRoute.startsWith(
                '/assistant/'
              )
            );

          case 'calendar':
            return (
              normalizedRoute ===
                '/schedule' ||
              normalizedRoute.startsWith(
                '/schedule/'
              )
            );

          case 'profile':
            return (
              normalizedRoute ===
                '/profile' ||
              normalizedRoute.startsWith(
                '/profile/'
              )
            );

          default:
            return false;
        }
      },
      [normalizedRoute]
    );

  /* ==============================================================
     NAVIGATION
  ============================================================== */

  const handlePress =
    useCallback(
      (route: string) => {
        const target =
          normalizeRoute(
            route
          );

        /*
         * Never navigate to the current
         * tab again.
         */
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
     ACTIVE PILL
  ============================================================== */

  const pillX =
    useSharedValue(0);

  const pillWidth =
    useSharedValue(0);

  const pillOpacity =
    useSharedValue(0);

  const itemLayouts =
    useRef<
      Record<
        string,
        ItemLayout
      >
    >({});

  const movePillTo =
    useCallback(
      (itemId: string) => {
        const layout =
          itemLayouts.current[
            itemId
          ];

        if (!layout) {
          return;
        }

        const horizontalMargin = 6;

        const targetX =
          layout.x +
          horizontalMargin;

        const targetWidth =
          Math.max(
            layout.width -
              horizontalMargin *
                2,
            48
          );

        pillX.value =
          withSpring(
            targetX,
            {
              stiffness: 360,
              damping: 30,
              mass: 0.7,
            }
          );

        pillWidth.value =
          withSpring(
            targetWidth,
            {
              stiffness: 360,
              damping: 30,
              mass: 0.7,
            }
          );

        pillOpacity.value =
          withTiming(1, {
            duration: 140,
          });
      },
      [
        pillX,
        pillWidth,
        pillOpacity,
      ]
    );

  /* ==============================================================
     ITEM LAYOUT
  ============================================================== */

  const handleItemLayout =
    useCallback(
      (item: NavItem) =>
        (
          event: LayoutChangeEvent
        ) => {
          const {
            x,
            width,
          } =
            event.nativeEvent
              .layout;

          itemLayouts.current[
            item.id
          ] = {
            x,
            width,
          };

          if (
            !item.isCenter &&
            isActiveRoute(item)
          ) {
            movePillTo(
              item.id
            );
          }
        },
      [
        isActiveRoute,
        movePillTo,
      ]
    );

  /* ==============================================================
     ACTIVE PILL SYNC
  ============================================================== */

  useEffect(() => {
    const activeItem =
      navItems.find(
        (item) =>
          !item.isCenter &&
          isActiveRoute(item)
      );

    if (!activeItem) {
      pillOpacity.value =
        withTiming(0, {
          duration: 120,
        });

      return;
    }

    movePillTo(
      activeItem.id
    );
  }, [
    normalizedRoute,
    isActiveRoute,
    movePillTo,
    pillOpacity,
  ]);

  /* ==============================================================
     ANIMATED PILL
  ============================================================== */

  const pillStyle =
    useAnimatedStyle(
      () => ({
        transform: [
          {
            translateX:
              pillX.value,
          },
        ],

        width:
          pillWidth.value,

        opacity:
          pillOpacity.value,
      }),
      []
    );

  /* ==============================================================
     LABELS
  ============================================================== */

  const getLabel =
    useCallback(
      (
        id: NavItem['id']
      ) => {
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

          case 'nova':
            return 'Nova';

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
      ? 'rgba(28, 23, 45, 0.97)'
      : 'rgba(255, 255, 255, 0.97)';

  const borderColor =
    isDark
      ? 'rgba(255,255,255,0.07)'
      : colors.border;

  const activeBackground =
    `${colors.primary}18`;

  const activeBorder =
    `${colors.primary}22`;

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
              ? 0.18
              : 0.06,

          shadowRadius: 12,

          shadowOffset: {
            width: 0,
            height: -4,
          },

          elevation: 10,
        },
      ]}
    >
      {/* ==========================================================
          ACTIVE PILL
      ========================================================== */}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.activePill,
          pillStyle,
          {
            backgroundColor:
              activeBackground,

            borderColor:
              activeBorder,
          },
        ]}
      />

      {/* ==========================================================
          NAV ITEMS
      ========================================================== */}

      {navItems.map(
        (item) => {
          const Icon =
            item.icon;

          const isActive =
            isActiveRoute(
              item
            );

          /* ========================================================
             CENTER NOVA
          ======================================================== */

          if (
            item.isCenter
          ) {
            return (
              <View
                key={item.id}
                style={
                  styles.centerContainer
                }
              >
                <TouchableOpacity
                  onPress={() =>
                    handlePress(
                      item.route
                    )
                  }
                  activeOpacity={
                    0.88
                  }
                  accessibilityRole="button"
                  accessibilityLabel="Nova AI"
                  style={[
                    styles.novaButton,
                    {
                      backgroundColor:
                        isActive
                          ? colors.primary
                          : colors.surfaceSecondary,

                      shadowColor:
                        isActive
                          ? colors.primary
                          : 'transparent',
                    },
                  ]}
                >
                  <Sparkles
                    size={25}
                    color={
                      isActive
                        ? '#FFFFFF'
                        : colors.textTertiary
                    }
                    strokeWidth={
                      isActive
                        ? 2.4
                        : 1.9
                    }
                  />
                </TouchableOpacity>
              </View>
            );
          }

          /* ========================================================
             NORMAL ITEM
          ======================================================== */

          return (
            <TouchableOpacity
              key={item.id}
              onLayout={handleItemLayout(
                item
              )}
              onPress={() =>
                handlePress(
                  item.route
                )
              }
              activeOpacity={0.78}
              accessibilityRole="button"
              accessibilityLabel={getLabel(
                item.id
              )}
              style={
                styles.navItem
              }
            >
              <View
                style={
                  styles.iconContainer
                }
              >
                <Icon
                  size={22}
                  color={
                    isActive
                      ? colors.primary
                      : colors.textTertiary
                  }
                  strokeWidth={
                    isActive
                      ? 2.35
                      : 1.9
                  }
                />
              </View>

              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  {
                    color:
                      isActive
                        ? colors.primary
                        : colors.textTertiary,
                  },
                ]}
              >
                {getLabel(
                  item.id
                )}
              </Text>
            </TouchableOpacity>
          );
        }
      )}
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
    container: {
      position:
        'relative',

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      width: '100%',

      height: 76,

      minHeight: 76,

      paddingHorizontal: 6,

      paddingTop: 9,

      borderTopWidth:
        StyleSheet.hairlineWidth,

      zIndex: 100,

      elevation: 10,

      overflow:
        'visible',
    },

    activePill: {
      position:
        'absolute',

      left: 0,

      top: 8,

      height:
        ACTIVE_PILL_HEIGHT,

      borderRadius:
        ACTIVE_PILL_HEIGHT /
        2,

      borderWidth: 1,

      zIndex: 0,
    },

    navItem: {
      flex: 1,

      minWidth: 0,

      height: 60,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 2,

      paddingVertical: 4,

      gap: 3,

      zIndex: 2,
    },

    iconContainer: {
      width: 30,

      height: 28,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    label: {
      fontSize: 10,

      lineHeight: 13,

      fontWeight: '600',

      letterSpacing: 0.1,

      textAlign:
        'center',

      includeFontPadding:
        false,
    },

    centerContainer: {
      flex: 1,

      height: 76,

      alignItems:
        'center',

      justifyContent:
        'center',

      zIndex: 20,

      position:
        'relative',
    },

    novaButton: {
      position:
        'absolute',

      top: -18,

      width:
        CENTER_BUTTON_SIZE,

      height:
        CENTER_BUTTON_SIZE,

      borderRadius:
        CENTER_BUTTON_SIZE /
        2,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth: 3,

      borderColor:
        '#FFFFFF',

      shadowColor:
        '#000000',

      shadowOffset: {
        width: 0,
        height: 5,
      },

      shadowOpacity:
        0.18,

      shadowRadius: 8,

      elevation: 10,

      zIndex: 30,
    },
  });