import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';

import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

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

interface ShineEffectProps {
  color?: string;
  delay?: number;
  duration?: number;
  opacity?: number;
}

function ShineEffect({
  color = '#FFFFFF',
  delay = 1600,
  duration = 1900,
  opacity = 0.16,
}: ShineEffectProps) {
  const shineX = useSharedValue(-180);
  const shineOpacity = useSharedValue(0);

  React.useEffect(() => {
    shineX.value = -180;
    shineOpacity.value = 0;

    shineX.value = withRepeat(
      withSequence(
        withTiming(-180, { duration: delay }),
        withTiming(-145, { duration: 180 }),
        withTiming(430, { duration }),
        withTiming(500, { duration: 220 }),
        withTiming(500, { duration: 350 }),
      ),
      -1,
      false,
    );

    shineOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: delay }),
        withTiming(opacity, { duration: 180 }),
        withTiming(opacity, { duration }),
        withTiming(0, { duration: 220 }),
        withTiming(0, { duration: 350 }),
      ),
      -1,
      false,
    );
  }, [delay, duration, opacity, shineOpacity, shineX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shineX.value },
      { rotate: '20deg' },
    ],
    opacity: shineOpacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.shineContainer,
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={[
          'transparent',
          `${color}10`,
          `${color}45`,
          `${color}10`,
          'transparent',
        ]}
        locations={[0, 0.28, 0.5, 0.72, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.shineGradient}
      />
    </Animated.View>
  );
}

interface GlowLayerProps {
  color: string;
  opacity?: number;
}

function GlowLayer({
  color,
  opacity = 0.10,
}: GlowLayerProps) {
  return (
    <View
      pointerEvents="none"
      style={[
        styles.glowLayer,
        {
          borderColor: color,
          opacity,
        },
      ]}
    />
  );
}

export function DashboardScreen() {
  const {
    colors,
    isDark,
    isAthlete,
  } = useTheme();

  const {
    t,
    isRTL,
    language,
  } = useLanguage();

  const router = useRouter();

  const { width } = useWindowDimensions();

  const [refreshing, setRefreshing] =
    React.useState(false);

  /*
   * =========================================================
   * NORULIA WELCOME TYPING
   * =========================================================
   */

  const [typedWelcome, setTypedWelcome] =
    useState('');

  const typingTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  /*
   * Use the same dashboard bubble text
   * that already exists in LanguageContext.
   */
  const welcomeText =
    t.dashboardWelcomeBubble || '';

  useEffect(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    setTypedWelcome('');

    let index = 0;

    const typeNextCharacter = () => {
      if (index >= welcomeText.length) {
        return;
      }

      setTypedWelcome(
        welcomeText.slice(0, index + 1),
      );

      index += 1;

      typingTimerRef.current =
        setTimeout(
          typeNextCharacter,
          32,
        );
    };

    /*
     * Small delay so the avatar enters first,
     * then the bubble starts typing.
     */
    typingTimerRef.current =
      setTimeout(
        typeNextCharacter,
        700,
      );

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(
          typingTimerRef.current,
        );
      }
    };
  }, [
    language,
    welcomeText,
  ]);

  React.useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(
          typingTimerRef.current,
        );
      }
    };
  }, []);

  const refreshTimerRef =
    React.useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

  const isVerySmallScreen =
    width < 350;

  const themeColor = isAthlete
    ? '#22C55E'
    : isDark
      ? 'rgba(73, 194, 226, 1)'
      : colors.primary;

  const iconColor = themeColor;
  const progressIconColor = themeColor;
  const progressBarColor = themeColor;

  const iconBgColor = isAthlete
    ? 'rgba(34,197,94,0.15)'
    : isDark
      ? 'rgba(73, 194, 226, 0.15)'
      : 'rgba(107,90,166,0.07)';

  const onRefresh =
    React.useCallback(() => {
      setRefreshing(true);

      refreshTimerRef.current =
        setTimeout(() => {
          setRefreshing(false);
          refreshTimerRef.current = null;
        }, 1500);
    }, []);

  React.useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(
          refreshTimerRef.current,
        );
      }
    };
  }, []);

  const renderMenuCard = (
    item: (typeof menuItems)[number],
    index: number,
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
        style={[
          styles.menuCardWrapper,
          {
            width: isVerySmallScreen
              ? '31.2%'
              : '31.7%',
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() =>
            router.push(item.route as any)
          }
          accessibilityRole="button"
          accessibilityLabel={title}
          style={[
            styles.menuCard,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
              minHeight:
                isVerySmallScreen
                  ? 118
                  : 132,
            },
          ]}
        >
          <ShineEffect
            color={
              isDark
                ? '#FFFFFF'
                : colors.primary
            }
            delay={
              1500 + index * 260
            }
            duration={1750}
            opacity={
              isDark ? 0.15 : 0.12
            }
          />

          <GlowLayer
            color={colors.primary}
            opacity={
              isDark ? 0.08 : 0.045
            }
          />

          <View
            style={[
              styles.menuIconContainer,
              {
                backgroundColor:
                  iconBgColor,
                width:
                  isVerySmallScreen
                    ? 43
                    : 48,
                height:
                  isVerySmallScreen
                    ? 43
                    : 48,
              },
            ]}
          >
            <IconComponent
              size={
                isVerySmallScreen
                  ? 21
                  : 24
              }
              color={iconColor}
              strokeWidth={1.9}
            />
          </View>

          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={[
              styles.menuCardTitle,
              {
                color: colors.text,
                textAlign: 'center',
                writingDirection:
                  isRTL
                    ? 'rtl'
                    : 'ltr',
                fontSize:
                  isVerySmallScreen
                    ? 11
                    : 12,
              },
            ]}
          >
            {title}
          </Text>
        </TouchableOpacity>
      </MotiView>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal:
              isVerySmallScreen
                ? 14
                : Spacing.lg,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={iconColor}
            colors={[iconColor]}
          />
        }
      >
        {/* =====================================================
            NORULIA CHARACTER
            ===================================================== */}

        <MotiView
          from={{
            opacity: 0,
            scale: 0.96,
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
          <View
            style={styles.characterCard}
          >
            <View
              style={styles.characterWrapper}
            >
              <View
                style={[
                  styles.avatarRow,
                  {
                    flexDirection: isRTL
                      ? 'row-reverse'
                      : 'row',
                  },
                ]}
              >
                {/* =================================================
                    AVATAR — ENTERS FROM LEFT
                    ================================================= */}

                <MotiView
                  from={{
                    opacity: 0,
                    translateX: -180,
                    scale: 0.90,
                  }}
                  animate={{
                    opacity: 1,
                    translateX: 0,
                    scale: 1,
                  }}
                  transition={{
                    type: 'spring',
                    damping: 18,
                    stiffness: 110,
                    delay: 180,
                  }}
                  style={
                    styles.avatarContainer
                  }
                >
                  <Image
                    source={require(
                      '../../assets/avatars/model.png',
                    )}
                    style={
                      styles.avatar
                    }
                  />
                </MotiView>

                {/* =================================================
                    SPEECH BUBBLE — ENTERS FROM RIGHT
                    ================================================= */}

                <MotiView
                  from={{
                    opacity: 0,
                    translateX: 190,
                    scale: 0.92,
                  }}
                  animate={{
                    opacity: 1,
                    translateX: 0,
                    scale: 1,
                  }}
                  transition={{
                    type: 'spring',
                    damping: 18,
                    stiffness: 105,
                    delay: 430,
                  }}
                  style={[
                    styles.speechBubbleWrapper,
                    {
                      alignSelf:
                        'center',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.speechBubble,
                      {
                        backgroundColor:
                          colors.surface,
                        borderColor:
                          colors.border,
                        shadowColor:
                          isDark
                            ? '#000000'
                            : '#6B5AA6',
                      },
                    ]}
                  >
                    <View
                      pointerEvents="none"
                      style={[
                        styles.speechBubbleTail,
                        {
                          backgroundColor:
                            colors.surface,
                          borderColor:
                            colors.border,
                        },
                        isRTL
                          ? styles.speechBubbleTailRight
                          : styles.speechBubbleTailLeft,
                      ]}
                    />

                    <Text
                      style={[
                        styles.speechBubbleText,
                        {
                          color:
                            isDark
                              ? '#FFFFFF'
                              : '#2F2850',
                          textAlign:
                            isRTL
                              ? 'right'
                              : 'left',
                          writingDirection:
                            isRTL
                              ? 'rtl'
                              : 'ltr',
                        },
                      ]}
                    >
                      {typedWelcome}

                      {typedWelcome.length <
                        welcomeText.length && (
                        <Text
                          style={{
                            color:
                              themeColor,
                          }}
                        >
                          ▌
                        </Text>
                      )}
                    </Text>
                  </View>
                </MotiView>
              </View>

              {/* =================================================
                  MAIN CHARACTER TITLE
                  ================================================= */}

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
                    writingDirection:
                      isRTL
                        ? 'rtl'
                        : 'ltr',
                  },
                ]}
              >
                {t.dashboardReadyHelp}
              </Text>

              {/* =================================================
                  REMOVED:
                  dashboardWellnessJourney
                  ================================================= */}
            </View>
          </View>
        </MotiView>

        {/* =====================================================
            PROGRESS
            ===================================================== */}

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
              backgroundColor:
                colors.surface,
              overflow: 'hidden',
            }}
          >
            <ShineEffect
              color={
                isDark
                  ? '#FFFFFF'
                  : colors.primary
              }
              delay={2100}
              duration={2050}
              opacity={
                isDark ? 0.13 : 0.09
              }
            />

            <GlowLayer
              color={colors.primary}
              opacity={
                isDark ? 0.055 : 0.035
              }
            />

            <View
              style={[
                styles.progressHeader,
                {
                  flexDirection:
                    isRTL
                      ? 'row-reverse'
                      : 'row',
                },
              ]}
            >
              <View
                style={[
                  styles.progressIconWrap,
                  {
                    backgroundColor:
                      iconBgColor,
                  },
                ]}
              >
                <TrendingUp
                  size={18}
                  color={
                    progressIconColor
                  }
                  strokeWidth={2}
                />
              </View>

              <Text
                style={[
                  styles.progressTitle,
                  {
                    color: colors.text,
                    textAlign:
                      isRTL
                        ? 'right'
                        : 'left',
                    writingDirection:
                      isRTL
                        ? 'rtl'
                        : 'ltr',
                  },
                ]}
              >
                {
                  t.dashboardCognitiveProgress
                }
              </Text>

              <Text
                style={[
                  styles.progressPercent,
                  {
                    color:
                      progressIconColor,
                  },
                ]}
              >
                82%
              </Text>
            </View>

            <View
              style={
                styles.progressBarContainer
              }
            >
              <View
                style={[
                  styles.progressBarBg,
                  {
                    backgroundColor:
                      colors.border,
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
                    alignSelf:
                      isRTL
                        ? 'flex-end'
                        : 'flex-start',
                  },
                ]}
              >
                <LinearGradient
                  colors={[
                    progressBarColor,
                    progressBarColor,
                  ]}
                  start={{
                    x: 0,
                    y: 0,
                  }}
                  end={{
                    x: 1,
                    y: 0,
                  }}
                  style={
                    styles.progressBarFill
                  }
                />
              </MotiView>
            </View>

            <View
              style={[
                styles.progressFooter,
                {
                  alignItems:
                    isRTL
                      ? 'flex-end'
                      : 'flex-start',
                },
              ]}
            >
              <Text
                style={[
                  styles.progressText,
                  {
                    color:
                      colors.textSecondary,
                    textAlign:
                      isRTL
                        ? 'right'
                        : 'left',
                    writingDirection:
                      isRTL
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

        {/* =====================================================
            QUICK ACCESS
            ===================================================== */}

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
              flexDirection:
                isRTL
                  ? 'row-reverse'
                  : 'row',
            },
          ]}
        >
          <LayoutGrid
            size={17}
            color={iconColor}
            strokeWidth={1.9}
          />

          <Text
            style={[
              styles.menuSectionTitle,
              {
                color: iconColor,
                textAlign:
                  isRTL
                    ? 'right'
                    : 'left',
                writingDirection:
                  isRTL
                    ? 'rtl'
                    : 'ltr',
              },
            ]}
          >
            {t.quickAccess}
          </Text>
        </MotiView>

        <View
          style={[
            styles.menuGrid,
            {
              flexDirection:
                isRTL
                  ? 'row-reverse'
                  : 'row',
            },
          ]}
        >
          {menuItems.map(
            renderMenuCard,
          )}
        </View>

        <View
          style={styles.bottomSpace}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: Spacing.xxl,
    paddingBottom: 40,
  },

  /* =========================================================
     SHINE
     ========================================================= */

  shineContainer: {
    position: 'absolute',
    top: -90,
    left: -20,
    width: 72,
    height: 280,
    zIndex: 20,
    elevation: 20,
  },

  shineGradient: {
    width: '100%',
    height: '100%',
  },

  glowLayer: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    zIndex: 5,
  },

  /* =========================================================
     CHARACTER
     ========================================================= */

  characterCard: {
    width: '100%',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
  },

  characterWrapper: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },

  avatarRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 26,
  },

  avatarContainer: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatar: {
    width: 180,
    height: 200,
    resizeMode: 'contain',
  },

  /* =========================================================
     SPEECH BUBBLE
     ========================================================= */

  speechBubbleWrapper: {
    flexShrink: 1,
    maxWidth: 176,
  },

  speechBubble: {
    flexShrink: 1,
    maxWidth: 176,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,

    position: 'relative',

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },

  speechBubbleText: {
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '700',
    letterSpacing: 0.1,
  },

  speechBubbleTail: {
    position: 'absolute',
    top: 24,
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    transform: [
      {
        rotate: '45deg',
      },
    ],
  },

  /*
   * LTR:
   * Avatar -> Bubble
   * Tail points left toward avatar.
   */

  speechBubbleTailLeft: {
    left: -6,
  },

  /*
   * RTL:
   * Bubble -> Avatar
   * Tail points right toward avatar.
   */

  speechBubbleTailRight: {
    right: -6,
  },

  characterTitle: {
    paddingTop: 20,
    width: '100%',
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '700',
    marginTop: Spacing.md,
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
    overflow: 'hidden',
    position: 'relative',
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
     MENU
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

  menuGrid: {
    width: '100%',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },

  menuCardWrapper: {
    flexGrow: 0,
    flexShrink: 0,
  },

  menuCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',

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
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    alignSelf: 'center',
  },

  menuCardTitle: {
    width: '100%',
    minHeight: 36,
    lineHeight: 17,
    fontWeight: '600',
    textAlign: 'center',
  },

  bottomSpace: {
    height: 30,
  },
});