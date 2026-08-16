import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../ui/Card';
import { useRouter } from 'expo-router';
import { Spacing, BorderRadius } from '../../constants/theme';

import {
  Sparkles,
  Puzzle,
  Globe,
  Plus,
  Pill,
  Video,
  TrendingUp,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const menuItems = [
  {
    id: 'psycho',
    titleKey: 'psychoPhysical',
    icon: Puzzle,
    color: '#10B981',
    route: '/psycho',
  },
  {
    id: 'cultural',
    titleKey: 'culturalInterventions',
    icon: Globe,
    color: '#F59E0B',
    route: '/cultural',
  },
  {
    id: 'plus',
    titleKey: 'plusModule',
    icon: Plus,
    color: '#EF4444',
    route: '/(tabs)/plus',
  },
  {
    id: 'medication',
    titleKey: 'medicationManagement',
    icon: Pill,
    color: '#14B8A6',
    route: '/medication',
  },
  {
    id: 'consultation',
    titleKey: 'consultation',
    icon: Video,
    color: '#F97316',
    route: '/consultation',
  },
  {
    id: 'assistant',
    titleKey: 'novaAI',
    icon: Sparkles,
    color: '#6366F1',
    route: '/(tabs)/assistant',
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
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const [refreshing, setRefreshing] = React.useState(false);

  const refreshTimerRef =
    React.useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const renderMenuCard = (
    item: (typeof menuItems)[number],
    index: number
  ) => {
    const IconComponent = item.icon;

    const title =
      t[item.titleKey as keyof typeof t] || item.titleKey;

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
          onPress={() => router.push(item.route as any)}
          style={[
            styles.menuCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Icon */}

          <View
            style={[
              styles.menuIconContainer,
              {
                backgroundColor: `${item.color}18`,
              },
            ]}
          >
            <IconComponent
              size={25}
              color={item.color}
              strokeWidth={2}
            />
          </View>

          {/* Title */}

          <Text
            numberOfLines={2}
            style={[
              styles.menuCardTitle,
              {
                color: colors.text,
                textAlign: isRTL ? 'right' : 'left',
                writingDirection: isRTL
                  ? 'rtl'
                  : 'ltr',
              },
            ]}
          >
            {title}
          </Text>

          {/* Arrow */}

          <View
            style={[
              styles.menuArrow,
              {
                backgroundColor: `${item.color}12`,
              },
            ]}
          >
            {isRTL ? (
              <ChevronLeft
                size={15}
                color={item.color}
                strokeWidth={2.3}
              />
            ) : (
              <ChevronRight
                size={15}
                color={item.color}
                strokeWidth={2.3}
              />
            )}
          </View>
        </TouchableOpacity>
      </MotiView>
    );
  };

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
        {/* =====================================================
            HEADER
        ====================================================== */}

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
              alignItems: 'center',
            },
          ]}
        >
          <View
            style={[
              styles.greetingChip,
              {
                backgroundColor:
                  colors.primary + '14',
              },
            ]}
          >
            <Text
              style={[
                styles.greetingText,
                {
                  color: colors.primary,
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

        {/* =====================================================
            CHARACTER / AI CARD
        ====================================================== */}

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
              y: 1,
            }}
            style={styles.characterCard}
          >
            <View
              style={[
                styles.heroBlobA,
                {
                  backgroundColor: '#FFFFFF',
                },
              ]}
            />

            <View
              style={[
                styles.heroBlobB,
                {
                  backgroundColor: '#FFFFFF',
                },
              ]}
            />

            <View style={styles.characterWrapper}>
              <View style={styles.avatarRing}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={require('../../assets/avatars/model1.jpg')}
                    style={styles.avatar}
                  />
                </View>
              </View>

              <View
                style={[
                  styles.aiBadge,
                  {
                    right: width / 2 - 64 - 6,
                  },
                ]}
              >
                <Sparkles
                  size={12}
                  color="#FFFFFF"
                />
              </View>

              <Text
                style={[
                  styles.characterTitle,
                  {
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

        {/* =====================================================
            COGNITIVE PROGRESS
        ====================================================== */}

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
          <Card style={styles.progressCard}>
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
                    backgroundColor:
                      colors.primary + '18',
                  },
                ]}
              >
                <TrendingUp
                  size={18}
                  color={colors.primary}
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

            <View style={styles.progressBarContainer}>
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
                    alignSelf: isRTL
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
                  style={styles.progressBarFill}
                />
              </MotiView>
            </View>

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
                    color:
                      colors.textSecondary,
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

        {/* =====================================================
            QUICK ACCESS HEADER
        ====================================================== */}

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

        {/* =====================================================
            2 × 3 GRID
        ====================================================== */}

        <View
          style={[
            styles.menuGrid,
            {
              direction: isRTL
                ? 'rtl'
                : 'ltr',
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
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    padding: Spacing.lg,
  },

  heroBlobA: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.08,
    top: -50,
    right: -40,
  },

  heroBlobB: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    opacity: 0.08,
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
    backgroundColor:
      'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  avatarContainer: {
    width: 118,
    height: 118,
    borderRadius: 59,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  avatar: {
    width: 118,
    height: 118,
  },

  aiBadge: {
    position: 'absolute',
    top: Spacing.md + 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor:
      'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  characterTitle: {
    width: '100%',
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '700',
    marginTop: Spacing.md,
    color: '#FFFFFF',
  },

  characterSubtitle: {
    width: '100%',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 4,
    color: 'rgba(255,255,255,0.8)',
  },

  /* =========================================================
     PROGRESS
  ========================================================= */

  progressCard: {
    marginBottom: Spacing.lg,
    shadowColor: '#000',
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
     GRID
  ========================================================= */

  menuGrid: {
    width: '100%',
    flexDirection: 'row',
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
    justifyContent: 'flex-start',
    position: 'relative',

    shadowColor: '#000',
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
  },

  menuCardTitle: {
    width: '100%',
    minHeight: 36,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },

  menuArrow: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  bottomSpace: {
    height: 30,
  },
});