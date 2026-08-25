import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
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

interface AnimatedNavItemProps {
  item: NavItem;
  active: boolean;
  colors: any;
  isDark: boolean;
  inactiveColor: string;
  activeColor: string;
  label: string;
  onPress: () => void;
}

/* ================================================================
   CONSTANTS
================================================================ */

const BAR_HEIGHT = 82;
const CONTENT_HEIGHT = 68;
const CENTER_BUTTON_SIZE = 58;

/*
 * Shine
 *
 * Shine از خارج سمت چپ وارد می‌شود،
 * از کل نوبار عبور می‌کند و از سمت راست خارج می‌شود.
 *
 * مقدار rotate باعث می‌شود نور کمی مورب باشد.
 */

const SHINE_WIDTH = 70;
const SHINE_HEIGHT = 190;

const SHINE_START = -150;
const SHINE_END = 650;

const SHINE_DELAY = 1700;
const SHINE_IN_DURATION = 220;
const SHINE_MOVE_DURATION = 2100;
const SHINE_OUT_DURATION = 220;

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

function normalizeRoute(path: string): string {
  if (!path) {
    return '/';
  }

  let result = path
    .replace(/\/\([^)]+\)/g, '')
    .replace(/\/{2,}/g, '/');

  if (
    result.length > 1 &&
    result.endsWith('/')
  ) {
    result = result.slice(0, -1);
  }

  return result || '/';
}

/* ================================================================
   ACTIVE ROUTE
================================================================ */

function getActiveItem(
  route: string,
): NavItemId | null {
  const normalized = normalizeRoute(route);

  if (
    normalized === '/' ||
    normalized === '/index'
  ) {
    return 'home';
  }

  if (
    normalized === '/protocol' ||
    normalized.startsWith('/protocol/')
  ) {
    return 'brain';
  }

  if (
    normalized === '/assistant' ||
    normalized.startsWith('/assistant/')
  ) {
    return 'nova';
  }

  if (
    normalized === '/schedule' ||
    normalized.startsWith('/schedule/')
  ) {
    return 'calendar';
  }

  if (
    normalized === '/profile' ||
    normalized.startsWith('/profile/')
  ) {
    return 'profile';
  }

  return null;
}

/* ================================================================
   ANIMATED NAV ITEM
================================================================ */

const AnimatedNavItem = memo(
  function AnimatedNavItem({
    item,
    active,
    colors,
    isDark,
    inactiveColor,
    activeColor,
    label,
    onPress,
  }: AnimatedNavItemProps) {
    const Icon = item.icon;

    /* ============================================================
       ICON ANIMATION
    ============================================================ */

    const scale = useSharedValue(
      active ? 1 : 0.94,
    );

    const opacity = useSharedValue(
      active ? 1 : 0.72,
    );

    useEffect(() => {
      scale.value = withSpring(
        active ? 1 : 0.94,
        {
          damping: 16,
          stiffness: 220,
          mass: 0.7,
        },
      );

      opacity.value = withTiming(
        active ? 1 : 0.72,
        {
          duration: 160,
        },
      );
    }, [
      active,
      opacity,
      scale,
    ]);

    const animatedIconStyle =
      useAnimatedStyle(() => ({
        transform: [
          {
            scale: scale.value,
          },
        ],

        opacity:
          opacity.value,
      }));

    /* ============================================================
       CENTER NEUROLIA BUTTON
    ============================================================ */

    if (item.isCenter) {
      return (
        <View style={styles.centerColumn}>

          <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            hitSlop={8}
            android_ripple={null}
            style={({ pressed }) => [
              styles.centerButton,

              {
                backgroundColor: active
                  ? colors.primary
                  : isDark
                    ? '#2A2433'
                    : '#F2EFF7',

                borderColor: isDark
                  ? '#17131F'
                  : '#FFFFFF',

                shadowColor: active
                  ? colors.primary
                  : '#000000',

                shadowOpacity: active
                  ? isDark
                    ? 0.32
                    : 0.20
                  : isDark
                    ? 0.14
                    : 0.07,

                shadowRadius: active
                  ? 13
                  : 9,

                shadowOffset: {
                  width: 0,
                  height: 4,
                },

                elevation: active
                  ? 9
                  : 5,

                transform: [
                  {
                    scale: pressed
                      ? 0.92
                      : 1,
                  },
                ],
              },
            ]}
          >
            <Animated.View
              style={animatedIconStyle}
            >
              <Sparkles
                size={24}
                color={
                  active
                    ? '#FFFFFF'
                    : colors.textSecondary
                }
                strokeWidth={
                  active
                    ? 2.5
                    : 2.1
                }
              />
            </Animated.View>
          </Pressable>

          <Text
            numberOfLines={1}
            style={[
              styles.centerLabel,
              {
                color: active
                  ? activeColor
                  : inactiveColor,
              },
            ]}
          >
            {label}
          </Text>

        </View>
      );
    }

    /* ============================================================
       NORMAL NAVIGATION ITEM
    ============================================================ */

    return (
      <View style={styles.navColumn}>

        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={label}
          hitSlop={6}
          android_ripple={null}
          style={({ pressed }) => [
            styles.navButton,

            {
              opacity:
                pressed
                  ? 0.68
                  : 1,
            },
          ]}
        >

          {/* ------------------------------------------------------
             ACTIVE HIGHLIGHT

             این قسمت عمداً باقی مانده است.

             وقتی آیتم فعال باشد،
             فقط پشت آیکون یک highlight نرم قرار می‌گیرد.
          ------------------------------------------------------ */}

          <Animated.View
            style={[
              styles.iconWrapper,

              animatedIconStyle,

              {
                backgroundColor:
                  active
                    ? isDark
                      ? `${colors.primary}24`
                      : `${colors.primary}12`
                    : 'transparent',

                borderWidth:
                  active
                    ? 1
                    : 0,

                borderColor:
                  active
                    ? isDark
                      ? `${colors.primary}38`
                      : `${colors.primary}20`
                    : 'transparent',

                shadowColor:
                  active
                    ? colors.primary
                    : 'transparent',

                shadowOpacity:
                  active
                    ? isDark
                      ? 0.18
                      : 0.10
                    : 0,

                shadowRadius:
                  active
                    ? 8
                    : 0,

                shadowOffset: {
                  width: 0,
                  height: 2,
                },

                elevation:
                  active
                    ? 2
                    : 0,
              },
            ]}
          >

            <Icon
              size={21}
              color={
                active
                  ? activeColor
                  : inactiveColor
              }
              strokeWidth={
                active
                  ? 2.35
                  : 1.85
              }
            />

          </Animated.View>

          {/* ------------------------------------------------------
             LABEL
          ------------------------------------------------------ */}

          <Text
            numberOfLines={1}
            style={[
              styles.navLabel,

              {
                color:
                  active
                    ? activeColor
                    : inactiveColor,

                fontWeight:
                  active
                    ? '800'
                    : '600',
              },
            ]}
          >
            {label}
          </Text>

          {/* ------------------------------------------------------
             ACTIVE DOT
          ------------------------------------------------------ */}

          {active && (
            <View
              style={[
                styles.activeDot,
                {
                  backgroundColor:
                    activeColor,

                  shadowColor:
                    activeColor,

                  shadowOpacity:
                    0.45,

                  shadowRadius:
                    4,

                  shadowOffset: {
                    width: 0,
                    height: 1,
                  },

                  elevation: 2,
                },
              ]}
            />
          )}

        </Pressable>

      </View>
    );
  },
);

/* ================================================================
   MAIN COMPONENT
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
          currentRoute,
        ),
      [currentRoute],
    );

  /* ==============================================================
     ACTIVE ITEM
  ============================================================== */

  const activeItem =
    useMemo(
      () =>
        getActiveItem(
          normalizedRoute,
        ),
      [normalizedRoute],
    );

  /* ==============================================================
     NAVIGATION
  ============================================================== */

  const handleNavigate =
    useCallback(
      (route: string) => {

        const target =
          normalizeRoute(route);

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
      ],
    );

  /* ==============================================================
     LABELS
  ============================================================== */

  const getLabel =
    useCallback(
      (
        id: NavItemId,
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
            return t.language === 'fa'
              ? 'نورولیا'
              : 'Neurolia';

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
      [t],
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
      ? 'rgba(255,255,255,0.07)'
      : 'rgba(30,25,45,0.07)';

  const inactiveColor =
    isDark
      ? 'rgba(255,255,255,0.52)'
      : colors.textTertiary;

  const activeColor =
    colors.primary;

  /* ==============================================================
     SHINE ANIMATION

     نکته مهم:

     قبلاً Shine با left: 18% شروع می‌شد.
     بنابراین روی بعضی دستگاه‌ها به نظر می‌رسید
     از وسط نوبار شروع شده.

     حالا translateX از -150 شروع می‌شود
     و کاملاً از بیرون سمت چپ وارد می‌شود.
  ============================================================== */

  const shineX =
    useSharedValue(
      SHINE_START,
    );

  const shineOpacity =
    useSharedValue(0);

  useEffect(() => {

    shineX.value =
      SHINE_START;

    shineOpacity.value =
      0;

    /* ------------------------------------------------------------
       MOVEMENT
    ------------------------------------------------------------ */

    shineX.value =
      withRepeat(
        withSequence(

          /* انتظار قبل از شروع */
          withTiming(
            SHINE_START,
            {
              duration:
                SHINE_DELAY,
            },
          ),

          /* ورود نرم */
          withTiming(
            SHINE_START + 35,
            {
              duration:
                SHINE_IN_DURATION,
            },
          ),

          /* حرکت اصلی */
          withTiming(
            SHINE_END,
            {
              duration:
                SHINE_MOVE_DURATION,
            },
          ),

          /* خروج */
          withTiming(
            SHINE_END + 70,
            {
              duration:
                SHINE_OUT_DURATION,
            },
          ),

          /* فاصله */
          withTiming(
            SHINE_END + 70,
            {
              duration:
                SHINE_DELAY,
            },
          ),
        ),

        -1,
        false,
      );

    /* ------------------------------------------------------------
       OPACITY
    ------------------------------------------------------------ */

    shineOpacity.value =
      withRepeat(
        withSequence(

          /* مخفی */
          withTiming(
            0,
            {
              duration:
                SHINE_DELAY,
            },
          ),

          /* ظاهر شدن */
          withTiming(
            0.95,
            {
              duration:
                SHINE_IN_DURATION,
            },
          ),

          /* عبور */
          withTiming(
            0.95,
            {
              duration:
                SHINE_MOVE_DURATION,
            },
          ),

          /* محو شدن */
          withTiming(
            0,
            {
              duration:
                SHINE_OUT_DURATION,
            },
          ),

          /* فاصله */
          withTiming(
            0,
            {
              duration:
                SHINE_DELAY,
            },
          ),
        ),

        -1,
        false,
      );

  }, [
    shineX,
    shineOpacity,
  ]);

  /* ==============================================================
     SHINE STYLE
  ============================================================== */

  const shineStyle =
    useAnimatedStyle(
      () => ({
        transform: [
          {
            translateX:
              shineX.value,
          },

          /*
           * Shine کمی مورب است.
           *
           * مقدار مثبت یعنی به سمت پایین
           * در هنگام حرکت.
           */
          {
            rotate:
              '18deg',
          },
        ],

        opacity:
          shineOpacity.value,
      }),
    );

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
              0,
            ) + 5,

          shadowColor:
            '#000000',

          shadowOpacity:
            isDark
              ? 0.28
              : 0.055,

          shadowRadius:
            isDark
              ? 18
              : 12,

          shadowOffset: {
            width: 0,
            height: -4,
          },

          elevation: 14,
        },
      ]}
    >

      <View
        pointerEvents="none"
        style={styles.shineClip}
      >

        <Animated.View
          pointerEvents="none"
          style={[
            styles.shine,
            shineStyle,

            {
              backgroundColor:
                isDark
                  ? 'rgba(255,255,255,0.28)'
                  : 'rgba(255,255,255,0.88)',
            },
          ]}
        />

      </View>

      <View
        style={
          styles.navigationArea
        }
      >

        {NAV_ITEMS.map(
          (item) => (

            <AnimatedNavItem
              key={item.id}

              item={item}

              active={
                activeItem ===
                item.id
              }

              colors={
                colors
              }

              isDark={
                isDark
              }

              inactiveColor={
                inactiveColor
              }

              activeColor={
                activeColor
              }

              label={
                getLabel(
                  item.id,
                )
              }

              onPress={() =>
                handleNavigate(
                  item.route,
                )
              }
            />

          ),
        )}

      </View>

    </View>
  );
}

/* ================================================================
   EXPORT
================================================================ */

export const BottomNavBar =
  memo(
    BottomNavBarComponent,
  );

export default BottomNavBar;

/* ================================================================
   STYLES
================================================================ */

const styles =
  StyleSheet.create({

    /* ============================================================
       CONTAINER
    ============================================================ */

    container: {

      width: '100%',

      minHeight:
        BAR_HEIGHT,

      height:
        BAR_HEIGHT,

      borderTopWidth:
        StyleSheet.hairlineWidth,

      overflow:
        'visible',

      zIndex: 100,

      elevation: 14,

      ...(Platform.OS ===
        'ios'
        ? {
            shadowOffset: {
              width: 0,
              height: -4,
            },
          }
        : {}),
    },
    shineClip: {

      position:
        'absolute',

      top: 0,

      left: 0,

      right: 0,

      bottom: 0,

      overflow:
        'hidden',

      zIndex: 50,

      pointerEvents:
        'none',
    },


    shine: {

      position:
        'absolute',

      top:
        -55,

      left:
        0,

      width:
        SHINE_WIDTH,

      height:
        SHINE_HEIGHT,

      borderRadius:
        100,


      shadowColor:
        '#FFFFFF',

      shadowOpacity:
        0.85,

      shadowRadius:
        20,

      shadowOffset: {
        width: 0,
        height: 0,
      },

      elevation: 8,

      pointerEvents:
        'none',
    },

    /* ============================================================
       NAVIGATION AREA
    ============================================================ */

    navigationArea: {

      position:
        'relative',

      width:
        '100%',

      height:
        CONTENT_HEIGHT,

      minHeight:
        CONTENT_HEIGHT,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      paddingHorizontal:
        4,

      paddingTop:
        1,

      zIndex: 2,
    },

    /* ============================================================
       NORMAL COLUMN
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
    },

    /* ============================================================
       NORMAL BUTTON
    ============================================================ */

    navButton: {

      width:
        '100%',

      height:
        CONTENT_HEIGHT,

      alignItems:
        'center',

      justifyContent:
        'center',

      position:
        'relative',

      paddingTop:
        2,

      backgroundColor:
        'transparent',
    },

    /* ============================================================
       ACTIVE ICON WRAPPER
    ============================================================ */

    iconWrapper: {

      width:
        38,

      height:
        32,

      borderRadius:
        12,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginBottom:
        2,
    },

    /* ============================================================
       LABEL
    ============================================================ */

    navLabel: {

      fontSize:
        9.5,

      lineHeight:
        13,

      textAlign:
        'center',

      maxWidth:
        66,
    },

    /* ============================================================
       ACTIVE DOT
    ============================================================ */

    activeDot: {

      position:
        'absolute',

      bottom:
        3,

      width:
        4,

      height:
        4,

      borderRadius:
        2,
    },

    /* ============================================================
       CENTER NEUROLIA COLUMN
    ============================================================ */

    centerColumn: {
      flex: 1,
      height:
        CONTENT_HEIGHT,
      minWidth: 0,
      alignItems:
        'center',
      justifyContent:
        'center',
      zIndex:
        4,
      overflow:
        'visible',
    },

    /* ============================================================
       CENTER BUTTON
    ============================================================ */

    centerButton: {
marginBottom: 3,
      width:
        CENTER_BUTTON_SIZE,

      height:
        CENTER_BUTTON_SIZE,

      borderRadius:
        CENTER_BUTTON_SIZE / 2,

      borderWidth:
        3,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        -10,
    },

    /* ============================================================
       CENTER LABEL
    ============================================================ */

    centerLabel: {

      fontSize:
        9.5,

      lineHeight:
        13,

      fontWeight:
        '800',

      textAlign:
        'center',

      marginTop:
        -4,

      maxWidth:
        66,
    },

  });