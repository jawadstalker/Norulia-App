import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../ui/Card';
import { useRouter } from 'expo-router';

import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';

import {
  BrainCircuit,
  BookOpen,
  Sparkles,
  Pill,
  Stethoscope,
  SlidersHorizontal,
  TrendingUp,
  LayoutGrid,
} from 'lucide-react-native';

/* =========================================================
   QUICK ACCESS ITEMS
========================================================= */

const menuItems = [
  {
    id: 'psycho',
    titleKey: 'psychoPhysical',
    icon: BrainCircuit,
    route: '/psycho',
  },
  {
    id: 'cultural',
    titleKey: 'culturalInterventions',
    icon: BookOpen,
    route: '/cultural',
  },
  {
    id: 'plus',
    titleKey: 'plusModule',
    icon: Sparkles,
    route: '/(tabs)/plus',
  },
  {
    id: 'medication',
    titleKey: 'medicationManagement',
    icon: Pill,
    route: '/medication',
  },
  {
    id: 'consultation',
    titleKey: 'consultation',
    icon: Stethoscope,
    route: '/consultation',
  },
  {
    id: 'settings',
    titleKey: 'settings',
    icon: SlidersHorizontal,
    route: '/(tabs)/profile',
  },
];

/* =========================================================
   GREETING
========================================================= */

function getGreeting(t: any) {
  const hour = new Date().getHours();

  if (hour < 12) {
    return t.goodMorning;
  }

  if (hour < 18) {
    return t.goodAfternoon;
  }

  return t.goodEvening;
}

/* =========================================================
   DASHBOARD
========================================================= */

export function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const [refreshing, setRefreshing] = React.useState(false);

  const refreshTimerRef =
    React.useRef<ReturnType<typeof setTimeout> | null>(null);

  /* =======================================================
     HERO GRADIENT
  ======================================================= */

  const heroGradient = isDark
    ? ['#3D2E70', '#261268']
    : ['#F0ECFA', '#E3DCF5'];

  /* =======================================================
     REFRESH
  ======================================================= */

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    refreshTimerRef.current = setTimeout(() => {
      setRefreshing(false);
      refreshTimerRef.current = null;
    }, 1500);
  }, []);

  React.useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  /* =======================================================
     MENU CARD
  ======================================================= */

  const renderMenuCard = (
    item: (typeof menuItems)[number],
    index: number
  ) => {
    const IconComponent = item.icon;

    const title =
      t[item.titleKey as keyof typeof t] ||
      item.titleKey;

    return (
      <MotiView
        key={item.id}
        from={{
          opacity: 0,
          translateY: 20,
          scale: 0.94,
        }}
        animate={{
          opacity: 1,
          translateY: 0,
          scale: 1,
        }}
        transition={{
          type: 'timing',
          duration: 380,
          delay: 320 + index * 70,
        }}
        style={styles.menuCardWrapper}
      >
        <TouchableOpacity
          activeOpacity={0.78}
          onPress={() =>
            router.push(item.route as any)
          }
          accessibilityRole="button"
          accessibilityLabel={title}
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* ICON */}

          <View
            style={[
              styles.menuIconContainer,
              {
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(107,90,166,0.07)',
              },
            ]}
          >
            <IconComponent
              size={24}
              color={colors.primary}
              strokeWidth={1.9}
            />
          </View>

          {/* TITLE */}

          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={[
              styles.menuCardTitle,
              {
                color: colors.text,
                textAlign: 'center',
                writingDirection: isRTL
                  ? 'rtl'
                  : 'ltr',
              },
            ]}
          >
            {title}
          </Text>
        </TouchableOpacity>
      </MotiView>
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* =================================================
            HEADER
        ================================================== */}

        <MotiView
          from={{
            opacity: 0,
            translateY: -20,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 400,
          }}
          style={[
            styles.header,
            {
              alignItems: isRTL
                ? 'flex-end'
                : 'flex-start',
            },
          ]}
        >
          {/* Greeting */}

          <View
            style={[
              styles.greetingChip,
              {
                backgroundColor: isDark
                  ? 'rgba(123,97,255,0.12)'
                  : 'rgba(107,90,166,0.09)',
              },
            ]}
          >
            <Text
              style={[
                styles.greetingText,
                {
                  color: colors.primary,
                  textAlign: isRTL
                    ? 'right'
                    : 'left',
                  writingDirection: isRTL
                    ? 'rtl'
                    : 'ltr',
                },
              ]}
            >
              {getGreeting(t)}
            </Text>
          </View>

          {/* Title */}

          <Text
            style={[
              styles.dashboardTitle,
              {
                color: colors.text,
                textAlign: isRTL
                  ? 'right'
                  : 'left',
                writingDirection: isRTL
                  ? 'rtl'
                  : 'ltr',
              },
            ]}
          >
            {t.dashboardNeuroTitle}
          </Text>

          {/* Subtitle */}

          <Text
            style={[
              styles.dashboardSubtitle,
              {
                color: colors.textSecondary,
                textAlign: isRTL
                  ? 'right'
                  : 'left',
                writingDirection: isRTL
                  ? 'rtl'
                  : 'ltr',
              },
            ]}
          >
            {t.dashboardSubtitle}
          </Text>
        </MotiView>

        {/* =================================================
            CHARACTER / AI CARD
        ================================================== */}

        <MotiView
          from={{
            opacity: 0,
            scale: 0.94,
            translateY: 14,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 450,
            delay: 100,
          }}
        >
          <LinearGradient
            colors={heroGradient}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={[
              styles.characterCard,
              {
                borderColor: isDark
                  ? 'rgba(255,255,255,0.10)'
                  : 'rgba(107,90,166,0.06)',

                shadowColor: isDark
                  ? '#000000'
                  : '#6B5AA6',

                shadowOpacity: isDark
                  ? 0.20
                  : 0.08,

                elevation: isDark
                  ? 8
                  : 3,
              },
            ]}
          >
            {/* Decorative blobs */}

            <View
              style={[
                styles.heroBlobA,
                {
                  backgroundColor: isDark
                    ? '#FFFFFF'
                    : '#6B5AA6',
                },
              ]}
            />

            <View
              style={[
                styles.heroBlobB,
                {
                  backgroundColor: isDark
                    ? '#FFFFFF'
                    : '#6B5AA6',
                },
              ]}
            />

            {/* CHARACTER */}

            <View style={styles.characterWrapper}>
              <View
                // style={[
                //   styles.avatarRing,
                //   {
                //     backgroundColor: isDark
                //       ? 'rgba(255,255,255,0.18)'
                //       : 'rgba(107,90,166,0.10)',

                //     shadowColor: isDark
                //       ? '#000000'
                //       : '#6B5AA6',

                //     shadowOpacity: isDark
                //       ? 0.20
                //       : 0.06,

                //     elevation: isDark
                //       ? 5
                //       : 2,
                //   },
                // ]}
              >
                <View
                  style={[
                    styles.avatarContainer,
                    // {
                    //   backgroundColor: isDark
                    //     ? 'rgba(255,255,255,0.96)'
                    //     : 'rgba(255,255,255,0.82)',
                    // },
                  ]}
                >
                  <Image
                    source={require('../../assets/avatars/model.png')}
                    style={styles.avatar}
                  />
                </View>
              </View>

              {/* TITLE */}

              <Text
                style={[
                  styles.characterTitle,
                  {
                    color: isDark
                      ? '#FFFFFF'
                      : '#2F2850',

                    textAlign: isRTL
                      ? 'right'
                      : 'left',

                    writingDirection: isRTL
                      ? 'rtl'
                      : 'ltr',
                  },
                ]}
              >
                {t.dashboardReadyHelp}
              </Text>

              {/* SUBTITLE */}

              <Text
                style={[
                  styles.characterSubtitle,
                  {
                    color: isDark
                      ? 'rgba(255,255,255,0.80)'
                      : '#675F7E',

                    textAlign: isRTL
                      ? 'right'
                      : 'left',

                    writingDirection: isRTL
                      ? 'rtl'
                      : 'ltr',
                  },
                ]}
              >
                {t.dashboardWellnessJourney}
              </Text>
            </View>
          </LinearGradient>
        </MotiView>

        {/* =================================================
            COGNITIVE PROGRESS
        ================================================== */}

        <MotiView
          from={{
            opacity: 0,
            translateY: 14,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 400,
            delay: 200,
          }}
        >
          <Card
            style={{
              ...styles.progressCard,
              backgroundColor: colors.surface,
            }}
          >
            <View
              style={[
                styles.progressHeader,
                {
                  flexDirection: isRTL
                    ? 'row-reverse'
                    : 'row',
                },
              ]}
            >
              <View
                style={[
                  styles.progressIconWrap,
                  {
                    backgroundColor: isDark
                      ? 'rgba(123,97,255,0.12)'
                      : 'rgba(107,90,166,0.08)',
                  },
                ]}
              >
                <TrendingUp
                  size={18}
                  color={colors.primary}
                  strokeWidth={2}
                />
              </View>

              <Text
                style={[
                  styles.progressTitle,
                  {
                    color: colors.text,
                    textAlign: isRTL
                      ? 'right'
                      : 'left',
                    writingDirection: isRTL
                      ? 'rtl'
                      : 'ltr',
                  },
                ]}
              >
                {t.dashboardCognitiveProgress}
              </Text>

              <Text
                style={[
                  styles.progressPercent,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                82%
              </Text>
            </View>

            {/* Progress bar */}

            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarBg,
                  {
                    backgroundColor: colors.border,
                  },
                ]}
              />

              <MotiView
                from={{
                  width: '0%',
                }}
                animate={{
                  width: '82%',
                }}
                transition={{
                  type: 'timing',
                  duration: 1100,
                  delay: 250,
                }}
                style={[
                  styles.progressBarFillWrap,
                  {
                    alignSelf: isRTL
                      ? 'flex-end'
                      : 'flex-start',
                  },
                ]}
              >
                <LinearGradient
                  colors={[
                    colors.primary,
                    colors.accent || colors.primary,
                  ]}
                  start={{
                    x: 0,
                    y: 0,
                  }}
                  end={{
                    x: 1,
                    y: 0,
                  }}
                  style={styles.progressBarFill}
                />
              </MotiView>
            </View>

            {/* Progress footer */}

            <View
              style={[
                styles.progressFooter,
                {
                  alignItems: isRTL
                    ? 'flex-end'
                    : 'flex-start',
                },
              ]}
            >
              <Text
                style={[
                  styles.progressText,
                  {
                    color: colors.textSecondary,
                    textAlign: isRTL
                      ? 'right'
                      : 'left',
                    writingDirection: isRTL
                      ? 'rtl'
                      : 'ltr',
                  },
                ]}
              >
                {t.dashboardKeepGoing}
              </Text>
            </View>
          </Card>
        </MotiView>

        {/* =================================================
            QUICK ACCESS HEADER
        ================================================== */}

        <MotiView
          from={{
            opacity: 0,
            translateY: 14,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 400,
            delay: 280,
          }}
          style={[
            styles.menuSectionHeader,
            {
              flexDirection: isRTL
                ? 'row-reverse'
                : 'row',
            },
          ]}
        >
          <LayoutGrid
            size={17}
            color={colors.textSecondary}
            strokeWidth={1.9}
          />

          <Text
            style={[
              styles.menuSectionTitle,
              {
                color: colors.textSecondary,
                textAlign: isRTL
                  ? 'right'
                  : 'left',
                writingDirection: isRTL
                  ? 'rtl'
                  : 'ltr',
              },
            ]}
          >
            {t.quickAccess}
          </Text>
        </MotiView>

        {/* =================================================
            2 × 3 GRID
        ================================================== */}

        <View
          style={[
            styles.menuGrid,
            {
              flexDirection: isRTL
                ? 'row-reverse'
                : 'row',
            },
          ]}
        >
          {menuItems.map(renderMenuCard)}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

/* ===========================================================
   STYLES
=========================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: 40,
  },

  /* =========================================================
     HEADER
  ========================================================= */

  header: {
    width: '100%',
    marginBottom: Spacing.lg,
  },

  greetingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 9,
  },

  greetingText: {
    fontSize: 11,
    fontWeight: '700',
  },

  dashboardTitle: {
    width: '100%',
    fontSize: 30,
    lineHeight: 37,
    fontWeight: '800',
  },

  dashboardSubtitle: {
    width: '100%',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },

  /* =========================================================
     CHARACTER CARD
  ========================================================= */

  characterCard: {
    width: '100%',
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    padding: Spacing.lg,

    borderWidth: 1,
  },

  heroBlobA: {

    position: 'absolute',
    width: 200,
    height: 160,
    borderRadius: 80,
    opacity: 0.07,
    top: -50,
    right: -40,
  },

  heroBlobB: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    opacity: 0.06,
    bottom: -30,
    left: -30,
  },

  characterWrapper: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },

  avatarRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowRadius: 12,
  },

  avatarContainer: {
    width: 121,
    height: 121,
    // borderRadius: 59,
    // overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 140,
  },

  avatar: {
    width: 180,
    height: 180,
    resizeMode: 'cover',
  },

  characterTitle: {
    width: '100%',
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '700',
    marginTop: Spacing.md,
  },

  characterSubtitle: {
    width: '100%',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
  },

  /* =========================================================
     PROGRESS
  ========================================================= */

  progressCard: {
    marginBottom: Spacing.lg,

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.06,
    shadowRadius: 10,

    elevation: 3,
  },

  progressHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },

  progressIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressTitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
  },

  progressPercent: {
    fontSize: 18,
    fontWeight: '800',
  },

  progressBarContainer: {
    width: '100%',
    height: 7,
    position: 'relative',
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressBarBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 4,
  },

  progressBarFillWrap: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressBarFill: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
  },

  progressFooter: {
    width: '100%',
    marginTop: 8,
  },

  progressText: {
    fontSize: 11,
    lineHeight: 17,
  },

  /* =========================================================
     QUICK ACCESS
  ========================================================= */

  menuSectionHeader: {
    width: '100%',
    alignItems: 'center',
    gap: 7,
    marginBottom: 12,
    marginTop: 2,
  },

  menuSectionTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },

  /* =========================================================
     2 × 3 GRID
  ========================================================= */

  menuGrid: {
    width: '100%',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },

  menuCardWrapper: {
    width: '31.7%',
  },

  menuCard: {
    width: '100%',
    minHeight: 132,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 12,

    alignItems: 'center',
    justifyContent: 'center',

    position: 'relative',

    shadowColor: '#000000',

    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.035,
    shadowRadius: 7,

    elevation: 2,
  },

  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 10,
    alignSelf: 'center',
  },

  menuCardTitle: {
    width: '100%',
    minHeight: 36,

    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',

    textAlign: 'center',
  },

  bottomSpace: {
    height: 30,
  },
});