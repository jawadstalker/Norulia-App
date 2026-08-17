import React from 'react';
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

export function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const { width } = useWindowDimensions();

  const [refreshing, setRefreshing] =
    React.useState(false);

  const refreshTimerRef =
    React.useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const isSmallScreen =
    width < 380;

  const isVerySmallScreen =
    width < 350;

  const heroGradient = isDark
    ? ['#3D2E70', '#261268']
    : ['#F0ECFA', '#E3DCF5'];

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
          refreshTimerRef.current
        );
      }
    };
  }, []);

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
        style={[
          styles.menuCardWrapper,
          {
            width:
              isVerySmallScreen
                ? '31.2%'
                : '31.7%',
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.78}
          onPress={() =>
            router.push(
              item.route as any
            )
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
          <View
            style={[
              styles.menuIconContainer,
              {
                backgroundColor:
                  isDark
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(107,90,166,0.07)',

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
              color={
                colors.primary
              }
              strokeWidth={1.9}
            />
          </View>

          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={[
              styles.menuCardTitle,
              {
                color:
                  colors.text,

                textAlign:
                  'center',

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
        showsVerticalScrollIndicator={
          false
        }
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
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
            tintColor={
              colors.primary
            }
            colors={[
              colors.primary,
            ]}
          />
        }
      >
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
              alignItems:
                isRTL
                  ? 'flex-end'
                  : 'flex-start',
            },
          ]}
        >
          <View
            style={[
              styles.greetingChip,
              {
                backgroundColor:
                  isDark
                    ? 'rgba(123,97,255,0.12)'
                    : 'rgba(107,90,166,0.09)',
              },
            ]}
          >
            <Text
              style={[
                styles.greetingText,
                {
                  color:
                    colors.primary,

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
              {getGreeting(t)}
            </Text>
          </View>

          <Text
            style={[
              styles.dashboardTitle,
              {
                color:
                  colors.text,

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
            {t.dashboardNeuroTitle}
          </Text>

          <Text
            style={[
              styles.dashboardSubtitle,
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
            {t.dashboardSubtitle}
          </Text>
        </MotiView>

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
                borderColor:
                  isDark
                    ? 'rgba(255,255,255,0.10)'
                    : 'rgba(107,90,166,0.06)',

                shadowColor:
                  isDark
                    ? '#000000'
                    : '#6B5AA6',

                shadowOpacity:
                  isDark
                    ? 0.20
                    : 0.08,

                elevation:
                  isDark
                    ? 8
                    : 3,

                minHeight:
                  isSmallScreen
                    ? 190
                    : 215,
              },
            ]}
          >
            <View
              pointerEvents="none"
              style={[
                styles.heroBlobA,
                {
                  backgroundColor:
                    isDark
                      ? '#FFFFFF'
                      : '#6B5AA6',
                },
              ]}
            />

            <View
              pointerEvents="none"
              style={[
                styles.heroBlobB,
                {
                  backgroundColor:
                    isDark
                      ? '#FFFFFF'
                      : '#6B5AA6',
                },
              ]}
            />

            <View style={styles.characterWrapper}>
              <View style={styles.avatarContainer}>
                <Image
                  source={require('../../assets/avatars/model.png')}
                  style={styles.avatar}
                />
              </View>

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
            }}
          >
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
                      isDark
                        ? 'rgba(123,97,255,0.12)'
                        : 'rgba(107,90,166,0.08)',
                  },
                ]}
              >
                <TrendingUp
                  size={18}
                  color={
                    colors.primary
                  }
                  strokeWidth={2}
                />
              </View>

              <Text
                style={[
                  styles.progressTitle,
                  {
                    color:
                      colors.text,

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
                      colors.primary,
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
                    colors.primary,
                    colors.accent ||
                      colors.primary,
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
            color={
              colors.textSecondary
            }
            strokeWidth={1.9}
          />

          <Text
            style={[
              styles.menuSectionTitle,
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
            renderMenuCard
          )}
        </View>

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    scrollContent: {
      paddingTop:
        Spacing.xxl,

      paddingBottom: 40,
    },

    header: {
      width: '100%',
      marginBottom:
        Spacing.lg,
    },

    greetingChip: {
      flexDirection:
        'row',

      alignItems:
        'center',

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

    characterCard: {
      width: '100%',

      marginBottom:
        Spacing.lg,

      borderRadius:
        BorderRadius.lg,

      paddingHorizontal:
        Spacing.md,

      paddingVertical:
        Spacing.md,

      borderWidth: 1,

      overflow: 'hidden',
    },

    heroBlobA: {
      position:
        'absolute',

      width: 200,
      height: 160,

      borderRadius: 80,

      opacity: 0.07,

      top: -50,
      right: -40,
    },

    heroBlobB: {
      position:
        'absolute',

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

    avatarContainer: {
      width: 121,
      height: 121,
      alignItems: 'center',
      justifyContent: 'center',
    },

    avatar: {
  
      width: 180,
      height: 180,
      resizeMode: 'contain',
    },

    characterTitle: {
      paddingTop: 20,

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

    progressCard: {
      marginBottom:
        Spacing.lg,

      shadowColor:
        '#000000',

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowOpacity: 0.06,
      shadowRadius: 10,

      elevation: 3,
    },

    progressHeader: {
      alignItems:
        'center',

      marginBottom:
        Spacing.md,

      gap: Spacing.sm,
    },

    progressIconWrap: {
      width: 32,
      height: 32,

      borderRadius: 10,

      alignItems:
        'center',

      justifyContent:
        'center',
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

      position:
        'relative',

      borderRadius: 4,

      overflow:
        'hidden',
    },

    progressBarBg: {
      ...StyleSheet.absoluteFillObject,

      borderRadius: 4,
    },

    progressBarFillWrap: {
      height: '100%',

      borderRadius: 4,

      overflow:
        'hidden',
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

    menuSectionHeader: {
      width: '100%',

      alignItems:
        'center',

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

      flexWrap:
        'wrap',

      justifyContent:
        'space-between',

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

      alignItems:
        'center',

      justifyContent:
        'center',

      position:
        'relative',

      shadowColor:
        '#000000',

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

      alignItems:
        'center',

      justifyContent:
        'center',

      marginBottom: 10,

      alignSelf:
        'center',
    },

    menuCardTitle: {
      width: '100%',

      minHeight: 36,

      lineHeight: 17,

      fontWeight: '600',

      textAlign:
        'center',
    },

    bottomSpace: {
      height: 30,
    },
  });