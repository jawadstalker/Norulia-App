
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  ChevronRight,
  Eye,
  Gauge,
  HeartPulse,
  Lightbulb,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  BorderRadius,
  Spacing,
} from '../../constants/theme';

/* ================================================================
   TYPES
================================================================ */

type MetricKey =
  | 'attention'
  | 'visualProcessing'
  | 'workingMemory'
  | 'reactionControl'
  | 'visualDiscrimination'
  | 'cognitiveFlexibility'
  | 'relaxation';

type GameResult = {
  gameId: string;
  completedAt: number;

  raw?: Record<string, number>;

  metrics: Partial<Record<MetricKey, number>>;
};

type StoredResults = GameResult[];

type MetricDefinition = {
  key: MetricKey;
  icon: React.ComponentType<any>;
  colorOpacity: string;
};

/* ================================================================
   CONSTANTS
================================================================ */

const STORAGE_KEYS = [
  'norulia_game_results',
  'neurolia_game_results',
  'game_performance_results',
];

/*
 * These are intentionally separate from the game results.
 * A game can contribute to more than one cognitive dimension.
 */
const METRICS: MetricDefinition[] = [
  {
    key: 'attention',
    icon: Target,
    colorOpacity: '18',
  },
  {
    key: 'visualProcessing',
    icon: Eye,
    colorOpacity: '18',
  },
  {
    key: 'workingMemory',
    icon: Brain,
    colorOpacity: '18',
  },
  {
    key: 'reactionControl',
    icon: Zap,
    colorOpacity: '18',
  },
  {
    key: 'visualDiscrimination',
    icon: Gauge,
    colorOpacity: '18',
  },
  {
    key: 'cognitiveFlexibility',
    icon: Lightbulb,
    colorOpacity: '18',
  },
  {
    key: 'relaxation',
    icon: HeartPulse,
    colorOpacity: '18',
  },
];

/* ================================================================
   HELPERS
================================================================ */

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]) {
  if (!values.length) return 0;

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

function formatDate(timestamp: number, language: string) {
  const date = new Date(timestamp);

  return new Intl.DateTimeFormat(
    language === 'fa' ? 'fa-IR' : 'en-US',
    {
      month: 'short',
      day: 'numeric',
    },
  ).format(date);
}

function getMetricLabel(
  key: MetricKey,
  language: string,
) {
  const labels: Record<
    MetricKey,
    { fa: string; en: string }
  > = {
    attention: {
      fa: 'توجه',
      en: 'Attention',
    },

    visualProcessing: {
      fa: 'پردازش بصری',
      en: 'Visual Processing',
    },

    workingMemory: {
      fa: 'حافظه کاری',
      en: 'Working Memory',
    },

    reactionControl: {
      fa: 'کنترل واکنش',
      en: 'Reaction Control',
    },

    visualDiscrimination: {
      fa: 'تمایز بصری',
      en: 'Visual Discrimination',
    },

    cognitiveFlexibility: {
      fa: 'انعطاف‌پذیری شناختی',
      en: 'Cognitive Flexibility',
    },

    relaxation: {
      fa: 'آرام‌سازی',
      en: 'Relaxation',
    },
  };

  return language === 'fa'
    ? labels[key].fa
    : labels[key].en;
}

function getMetricDescription(
  key: MetricKey,
  language: string,
) {
  const descriptions: Record<
    MetricKey,
    { fa: string; en: string }
  > = {
    attention: {
      fa: 'توانایی حفظ تمرکز و توجه به اطلاعات مهم',
      en: 'Your ability to maintain focus and attend to relevant information',
    },

    visualProcessing: {
      fa: 'سرعت و دقت پردازش اطلاعات دیداری',
      en: 'Speed and accuracy when processing visual information',
    },

    workingMemory: {
      fa: 'توانایی نگهداری و استفاده از اطلاعات در ذهن',
      en: 'Your ability to hold and use information in your mind',
    },

    reactionControl: {
      fa: 'سرعت پاسخ‌دهی همراه با کنترل و دقت',
      en: 'Response speed combined with accuracy and control',
    },

    visualDiscrimination: {
      fa: 'توانایی تشخیص تفاوت‌های ظریف دیداری',
      en: 'Your ability to detect subtle visual differences',
    },

    cognitiveFlexibility: {
      fa: 'توانایی تغییر روش فکر کردن و حل مسئله',
      en: 'Your ability to adapt thinking and switch strategies',
    },

    relaxation: {
      fa: 'ثبات و کیفیت عملکرد در تمرین‌های آرام‌سازی',
      en: 'Consistency and performance during relaxation exercises',
    },
  };

  return language === 'fa'
    ? descriptions[key].fa
    : descriptions[key].en;
}

function getPerformanceLabel(
  score: number,
  language: string,
) {
  if (score >= 90) {
    return language === 'fa' ? 'عالی' : 'Excellent';
  }

  if (score >= 80) {
    return language === 'fa' ? 'قوی' : 'Strong';
  }

  if (score >= 70) {
    return language === 'fa' ? 'خوب' : 'Good';
  }

  if (score >= 60) {
    return language === 'fa' ? 'متوسط' : 'Developing';
  }

  return language === 'fa' ? 'نیازمند تمرین' : 'Needs Practice';
}

function getGameName(
  gameId: string,
  language: string,
) {
  const names: Record<
    string,
    { fa: string; en: string }
  > = {
    'visual-flow': {
      fa: 'Visual Flow',
      en: 'Visual Flow',
    },

    'memory-challenge': {
      fa: 'چالش حافظه',
      en: 'Memory Challenge',
    },

    stroop: {
      fa: 'Stroop',
      en: 'Stroop',
    },

    'last-survival': {
      fa: 'Last Survival',
      en: 'Last Survival',
    },

    'size-discrimination': {
      fa: 'تشخیص اندازه',
      en: 'Size Discrimination',
    },

    anagram: {
      fa: 'آنالوگرام',
      en: 'Anagram',
    },

    'bilingual-sequence': {
      fa: 'توالی دوزبانه',
      en: 'Bilingual Sequence',
    },

    relaxe: {
      fa: 'تنفس آرام',
      en: 'Calm Breathing',
    },

    word: {
      fa: 'بازی کلمات',
      en: 'Word Game',
    },
  };

  return (
    names[gameId]?.[
      language === 'fa' ? 'fa' : 'en'
    ] || gameId
  );
}

/* ================================================================
   SCREEN
================================================================ */

export default function GameResultsScreen() {
  const router = useRouter();

  const { colors } = useTheme();
  const { language, isRTL } = useLanguage();

  const [results, setResults] = useState<StoredResults>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ==============================================================
     TRANSLATIONS
  ============================================================== */

  const t = useMemo(
    () => ({
      title:
        language === 'fa'
          ? 'نتایج شناختی'
          : 'Cognitive Results',

      subtitle:
        language === 'fa'
          ? 'پروفایل عملکرد شناختی شما'
          : 'Your cognitive performance profile',

      basedOn:
        language === 'fa'
          ? 'بر اساس عملکرد شما در بازی‌ها'
          : 'Based on your game performance',

      overall:
        language === 'fa'
          ? 'عملکرد کلی'
          : 'Overall Performance',

      noData:
        language === 'fa'
          ? 'هنوز داده‌ای ثبت نشده است'
          : 'No results yet',

      noDataDescription:
        language === 'fa'
          ? 'یک بازی انجام بده تا اولین داده عملکردی تو اینجا نمایش داده شود.'
          : 'Complete a game to see your first performance result here.',

      playGame:
        language === 'fa'
          ? 'انجام بازی'
          : 'Play a Game',

      strongest:
        language === 'fa'
          ? 'قوی‌ترین حوزه'
          : 'Strongest Area',

      needsPractice:
        language === 'fa'
          ? 'حوزه برای تمرین'
          : 'Area to Practice',

      gamePerformance:
        language === 'fa'
          ? 'عملکرد بازی‌ها'
          : 'Game Performance',

      recent:
        language === 'fa'
          ? 'آخرین نتایج'
          : 'Recent Results',

      score:
        language === 'fa'
          ? 'امتیاز'
          : 'Score',

      refresh:
        language === 'fa'
          ? 'به‌روزرسانی'
          : 'Refresh',

      performance:
        language === 'fa'
          ? 'عملکرد'
          : 'Performance',

      results:
        language === 'fa'
          ? 'نتایج'
          : 'Results',

      back:
        language === 'fa'
          ? 'بازگشت'
          : 'Back',

      basedOnGames:
        language === 'fa'
          ? 'بر اساس بازی‌های انجام‌شده'
          : 'Based on completed games',
    }),
    [language],
  );

  /* ==============================================================
     LOAD RESULTS
  ============================================================== */

  const loadResults = useCallback(async () => {
    try {
      let loaded: StoredResults = [];

      for (const key of STORAGE_KEYS) {
        const stored = await AsyncStorage.getItem(key);

        if (!stored) continue;

        try {
          const parsed = JSON.parse(stored);

          if (Array.isArray(parsed)) {
            loaded = parsed;
            break;
          }

          if (
            parsed &&
            Array.isArray(parsed.results)
          ) {
            loaded = parsed.results;
            break;
          }
        } catch {
          // Ignore malformed storage and try next key.
        }
      }

      const normalized = loaded
        .filter(
          item =>
            item &&
            typeof item === 'object' &&
            typeof item.gameId === 'string' &&
            item.metrics,
        )
        .sort(
          (a, b) =>
            (b.completedAt || 0) -
            (a.completedAt || 0),
        );

      setResults(normalized);
    } catch (error) {
      console.warn(
        'Failed to load game results:',
        error,
      );

      setResults([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  /* ==============================================================
     REFRESH
  ============================================================== */

  const handleRefresh = () => {
    setRefreshing(true);
    loadResults();
  };

  /* ==============================================================
     CALCULATE METRICS
  ============================================================== */

  const metricScores = useMemo(() => {
    const output: Record<
      MetricKey,
      number
    > = {
      attention: 0,
      visualProcessing: 0,
      workingMemory: 0,
      reactionControl: 0,
      visualDiscrimination: 0,
      cognitiveFlexibility: 0,
      relaxation: 0,
    };

    METRICS.forEach(metric => {
      const values = results
        .map(result => result.metrics?.[metric.key])
        .filter(
          (value): value is number =>
            typeof value === 'number' &&
            Number.isFinite(value),
        );

      if (values.length) {
        output[metric.key] = Math.round(
          clamp(average(values)),
        );
      }
    });

    return output;
  }, [results]);

  const availableScores = useMemo(
    () =>
      METRICS.map(metric => ({
        ...metric,
        score: metricScores[metric.key],
      })).filter(item => item.score > 0),
    [metricScores],
  );

  const overallScore = useMemo(() => {
    if (!availableScores.length) return 0;

    return Math.round(
      average(
        availableScores.map(item => item.score),
      ),
    );
  }, [availableScores]);

  const strongestMetric = useMemo(() => {
    if (!availableScores.length) return null;

    return [...availableScores].sort(
      (a, b) => b.score - a.score,
    )[0];
  }, [availableScores]);

  const weakestMetric = useMemo(() => {
    if (!availableScores.length) return null;

    return [...availableScores].sort(
      (a, b) => a.score - b.score,
    )[0];
  }, [availableScores]);

  /* ==============================================================
     GAME SUMMARY
  ============================================================== */

  const gameSummary = useMemo(() => {
    const map = new Map<
      string,
      {
        gameId: string;
        score: number;
        date: number;
      }
    >();

    results.forEach(result => {
      const values = Object.values(
        result.metrics || {},
      ).filter(
        (value): value is number =>
          typeof value === 'number' &&
          Number.isFinite(value),
      );

      if (!values.length) return;

      const score = Math.round(
        average(values),
      );

      const existing = map.get(result.gameId);

      if (
        !existing ||
        result.completedAt > existing.date
      ) {
        map.set(result.gameId, {
          gameId: result.gameId,
          score,
          date: result.completedAt,
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => b.date - a.date,
    );
  }, [results]);

  /* ==============================================================
     EMPTY STATE
  ============================================================== */

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />

          <Text
            style={[
              styles.loadingText,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {language === 'fa'
              ? 'در حال بارگذاری...'
              : 'Loading...'}
          </Text>
        </View>
      </View>
    );
  }

  /* ==============================================================
     RENDER
  ============================================================== */

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* =========================================================
          HEADER
      ========================================================= */}

      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
            flexDirection: isRTL
              ? 'row-reverse'
              : 'row',
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/psycho');
            }
          }}
          activeOpacity={0.75}
          style={[
            styles.backButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <ArrowLeft
            size={21}
            color={colors.text}
            strokeWidth={2.4}
          />
        </TouchableOpacity>

        <View
          style={[
            styles.headerText,
            {
              alignItems: isRTL
                ? 'flex-end'
                : 'flex-start',
            },
          ]}
        >
          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.text,
                textAlign: isRTL
                  ? 'right'
                  : 'left',
              },
            ]}
          >
            {t.title}
          </Text>

          <Text
            style={[
              styles.headerSubtitle,
              {
                color: colors.textSecondary,
                textAlign: isRTL
                  ? 'right'
                  : 'left',
              },
            ]}
          >
            {t.subtitle}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleRefresh}
          activeOpacity={0.75}
          style={[
            styles.refreshButton,
            {
              backgroundColor:
                colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <RefreshCw
            size={19}
            color={colors.text}
            strokeWidth={2.2}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* =======================================================
            HERO
        ======================================================= */}

        <View
          style={[
            styles.hero,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.heroGlow,
              {
                backgroundColor:
                  colors.primary + '12',
              },
            ]}
          />

          <View
            style={[
              styles.brainIcon,
              {
                backgroundColor:
                  colors.primary + '18',
                borderColor:
                  colors.primary + '30',
              },
            ]}
          >
            <Brain
              size={28}
              color={colors.primary}
              strokeWidth={1.9}
            />
          </View>

          <Text
            style={[
              styles.heroTitle,
              {
                color: colors.text,
                textAlign: 'center',
              },
            ]}
          >
            {t.overall}
          </Text>

          <View style={styles.overallScoreRow}>
            <Text
              style={[
                styles.overallScore,
                {
                  color: colors.text,
                },
              ]}
            >
              {overallScore || '—'}
            </Text>

            {overallScore > 0 && (
              <Text
                style={[
                  styles.scoreOutOf,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                /100
              </Text>
            )}
          </View>

          <Text
            style={[
              styles.performanceLabel,
              {
                color: colors.primary,
              },
            ]}
          >
            {overallScore
              ? getPerformanceLabel(
                  overallScore,
                  language,
                )
              : t.noData}
          </Text>

          <Text
            style={[
              styles.heroDescription,
              {
                color:
                  colors.textSecondary,
                textAlign: 'center',
              },
            ]}
          >
            {results.length
              ? t.basedOn
              : t.noDataDescription}
          </Text>

          {results.length > 0 && (
            <View
              style={[
                styles.gamesCount,
                {
                  backgroundColor:
                    colors.background,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Sparkles
                size={15}
                color={colors.primary}
              />

              <Text
                style={[
                  styles.gamesCountText,
                  {
                    color: colors.textSecondary,
                  },
                ]}
              >
                {results.length}{' '}
                {language === 'fa'
                  ? 'جلسه ثبت شده'
                  : results.length === 1
                    ? 'session recorded'
                    : 'sessions recorded'}
              </Text>
            </View>
          )}
        </View>

        {/* =======================================================
            EMPTY STATE
        ======================================================= */}

        {!results.length && (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor:
                  colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor:
                    colors.primary + '15',
                },
              ]}
            >
              <TrendingUp
                size={28}
                color={colors.primary}
              />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              {t.noData}
            </Text>

            <Text
              style={[
                styles.emptyDescription,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {t.noDataDescription}
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                router.replace(
                  '/(tabs)/psycho',
                )
              }
              style={[
                styles.primaryButton,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  {
                    color:
                      colors.background,
                  },
                ]}
              >
                {t.playGame}
              </Text>

              <ChevronRight
                size={19}
                color={colors.background}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* =======================================================
            METRICS
        ======================================================= */}

        {availableScores.length > 0 && (
          <>
            <SectionTitle
              title={t.performance}
              colors={colors}
              isRTL={isRTL}
            />

            <View style={styles.metricsGrid}>
              {METRICS.map(metric => {
                const score =
                  metricScores[metric.key];

                if (!score) return null;

                const Icon = metric.icon;

                return (
                  <View
                    key={metric.key}
                    style={[
                      styles.metricCard,
                      {
                        backgroundColor:
                          colors.surface,
                        borderColor:
                          colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.metricTop,
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
                          styles.metricIcon,
                          {
                            backgroundColor:
                              colors.primary +
                              metric.colorOpacity,
                          },
                        ]}
                      >
                        <Icon
                          size={18}
                          color={
                            colors.primary
                          }
                          strokeWidth={2}
                        />
                      </View>

                      <Text
                        style={[
                          styles.metricScore,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {score}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.metricTitle,
                        {
                          color:
                            colors.text,
                          textAlign: isRTL
                            ? 'right'
                            : 'left',
                        },
                      ]}
                    >
                      {getMetricLabel(
                        metric.key,
                        language,
                      )}
                    </Text>

                    <Text
                      style={[
                        styles.metricDescription,
                        {
                          color:
                            colors.textSecondary,
                          textAlign: isRTL
                            ? 'right'
                            : 'left',
                        },
                      ]}
                    >
                      {getMetricDescription(
                        metric.key,
                        language,
                      )}
                    </Text>

                    <View
                      style={[
                        styles.progressTrack,
                        {
                          backgroundColor:
                            colors.background,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            backgroundColor:
                              colors.primary,
                            width: `${score}%`,
                          },
                        ]}
                      />
                    </View>

                    <Text
                      style={[
                        styles.metricLevel,
                        {
                          color:
                            colors.primary,
                          textAlign: isRTL
                            ? 'right'
                            : 'left',
                        },
                      ]}
                    >
                      {getPerformanceLabel(
                        score,
                        language,
                      )}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* =======================================================
            STRONGEST / WEAKEST
        ======================================================= */}

        {strongestMetric && (
          <>
            <SectionTitle
              title={
                language === 'fa'
                  ? 'بینش عملکرد'
                  : 'Performance Insights'
              }
              colors={colors}
              isRTL={isRTL}
            />

            <View style={styles.insightRow}>
              <InsightCard
                icon={TrendingUp}
                title={t.strongest}
                metric={getMetricLabel(
                  strongestMetric.key,
                  language,
                )}
                score={strongestMetric.score}
                colors={colors}
                isRTL={isRTL}
              />

              {weakestMetric && (
                <InsightCard
                  icon={Target}
                  title={t.needsPractice}
                  metric={getMetricLabel(
                    weakestMetric.key,
                    language,
                  )}
                  score={weakestMetric.score}
                  colors={colors}
                  isRTL={isRTL}
                />
              )}
            </View>
          </>
        )}

        {/* =======================================================
            GAME PERFORMANCE
        ======================================================= */}

        {gameSummary.length > 0 && (
          <>
            <SectionTitle
              title={t.gamePerformance}
              colors={colors}
              isRTL={isRTL}
            />

            <View
              style={[
                styles.gameList,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              {gameSummary.map(
                (game, index) => (
                  <View
                    key={game.gameId}
                    style={[
                      styles.gameRow,
                      {
                        borderBottomColor:
                          colors.border,
                        borderBottomWidth:
                          index ===
                          gameSummary.length -
                            1
                            ? 0
                            : StyleSheet.hairlineWidth,
                        flexDirection:
                          isRTL
                            ? 'row-reverse'
                            : 'row',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.gameIcon,
                        {
                          backgroundColor:
                            colors.primary +
                            '15',
                        },
                      ]}
                    >
                      <Brain
                        size={18}
                        color={
                          colors.primary
                        }
                        strokeWidth={2}
                      />
                    </View>

                    <View
                      style={[
                        styles.gameInfo,
                        {
                          alignItems: isRTL
                            ? 'flex-end'
                            : 'flex-start',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.gameName,
                          {
                            color:
                              colors.text,
                            textAlign:
                              isRTL
                                ? 'right'
                                : 'left',
                          },
                        ]}
                      >
                        {getGameName(
                          game.gameId,
                          language,
                        )}
                      </Text>

                      <Text
                        style={[
                          styles.gameDate,
                          {
                            color:
                              colors.textSecondary,
                          },
                        ]}
                      >
                        {formatDate(
                          game.date,
                          language,
                        )}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.gameScoreContainer
                      }
                    >
                      <Text
                        style={[
                          styles.gameScore,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {game.score}
                      </Text>

                      <Text
                        style={[
                          styles.gameScoreLabel,
                          {
                            color:
                              colors.textSecondary,
                          },
                        ]}
                      >
                        /100
                      </Text>
                    </View>
                  </View>
                ),
              )}
            </View>
          </>
        )}

        {/* =======================================================
            FOOTER
        ======================================================= */}

        {results.length > 0 && (
          <View
            style={[
              styles.footerCard,
              {
                backgroundColor:
                  colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <CheckCircle2
              size={19}
              color={colors.primary}
            />

            <Text
              style={[
                styles.footerText,
                {
                  color:
                    colors.textSecondary,
                  textAlign: isRTL
                    ? 'right'
                    : 'left',
                },
              ]}
            >
              {language === 'fa'
                ? 'این شاخص‌ها از عملکرد شما در بازی‌ها محاسبه شده‌اند و برای مشاهده روند پیشرفت شما طراحی شده‌اند.'
                : 'These indicators are calculated from your game performance and are designed to help you track your progress over time.'}
            </Text>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

/* ================================================================
   SECTION TITLE
================================================================ */

function SectionTitle({
  title,
  colors,
  isRTL,
}: {
  title: string;
  colors: any;
  isRTL: boolean;
}) {
  return (
    <View
      style={[
        styles.sectionTitleRow,
        {
          flexDirection: isRTL
            ? 'row-reverse'
            : 'row',
        },
      ]}
    >
      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.text,
            textAlign: isRTL
              ? 'right'
              : 'left',
          },
        ]}
      >
        {title}
      </Text>
    </View>
  );
}

/* ================================================================
   INSIGHT CARD
================================================================ */

function InsightCard({
  icon: Icon,
  title,
  metric,
  score,
  colors,
  isRTL,
}: {
  icon: React.ComponentType<any>;
  title: string;
  metric: string;
  score: number;
  colors: any;
  isRTL: boolean;
}) {
  return (
    <View
      style={[
        styles.insightCard,
        {
          backgroundColor:
            colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.insightIcon,
          {
            backgroundColor:
              colors.primary + '15',
          },
        ]}
      >
        <Icon
          size={18}
          color={colors.primary}
          strokeWidth={2}
        />
      </View>

      <Text
        style={[
          styles.insightTitle,
          {
            color: colors.textSecondary,
            textAlign: isRTL
              ? 'right'
              : 'left',
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.insightMetric,
          {
            color: colors.text,
            textAlign: isRTL
              ? 'right'
              : 'left',
          },
        ]}
        numberOfLines={2}
      >
        {metric}
      </Text>

      <Text
        style={[
          styles.insightScore,
          {
            color: colors.primary,
            textAlign: isRTL
              ? 'right'
              : 'left',
          },
        ]}
      >
        {score}/100
      </Text>
    </View>
  );
}

/* ================================================================
   STYLES
================================================================ */

const { width } = Dimensions.get('window');

const cardGap = 12;
const horizontalPadding = 18;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    minHeight: 76,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 12,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.2,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
  },

  content: {
    paddingHorizontal: horizontalPadding,
    paddingTop: 18,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  loadingText: {
    fontSize: 13,
    fontWeight: '600',
  },

  hero: {
    minHeight: 285,
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  heroGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: -70,
  },

  brainIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  heroTitle: {
    fontSize: 14,
    fontWeight: '700',
  },

  overallScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },

  overallScore: {
    fontSize: 58,
    lineHeight: 66,
    fontWeight: '900',
    letterSpacing: -2,
  },

  scoreOutOf: {
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 5,
  },

  performanceLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },

  heroDescription: {
    maxWidth: 310,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 10,
    fontWeight: '500',
  },

  gamesCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },

  gamesCountText: {
    fontSize: 11,
    fontWeight: '600',
  },

  emptyCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    marginTop: 14,
    alignItems: 'center',
  },

  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  emptyDescription: {
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 310,
  },

  primaryButton: {
    minHeight: 48,
    borderRadius: 15,
    paddingHorizontal: 18,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  primaryButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },

  sectionTitleRow: {
    marginTop: 24,
    marginBottom: 11,
    alignItems: 'center',
  },

  sectionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '850',
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: cardGap,
  },

  metricCard: {
    width:
      (width -
        horizontalPadding * 2 -
        cardGap) /
      2,
    minHeight: 190,
    borderRadius: 21,
    borderWidth: 1,
    padding: 14,
  },

  metricTop: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  metricScore: {
    fontSize: 23,
    fontWeight: '900',
  },

  metricTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 12,
    lineHeight: 18,
  },

  metricDescription: {
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 5,
    minHeight: 48,
  },

  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 10,
  },

  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  metricLevel: {
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 7,
  },

  insightRow: {
    flexDirection: 'row',
    gap: 12,
  },

  insightCard: {
    flex: 1,
    minHeight: 165,
    borderRadius: 21,
    borderWidth: 1,
    padding: 14,
  },

  insightIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  insightTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 12,
  },

  insightMetric: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
    lineHeight: 19,
  },

  insightScore: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 8,
  },

  gameList: {
    borderRadius: 21,
    borderWidth: 1,
    overflow: 'hidden',
  },

  gameRow: {
    minHeight: 72,
    paddingHorizontal: 14,
    alignItems: 'center',
    gap: 11,
  },

  gameIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  gameInfo: {
    flex: 1,
  },

  gameName: {
    fontSize: 13,
    fontWeight: '800',
  },

  gameDate: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 3,
  },

  gameScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  gameScore: {
    fontSize: 20,
    fontWeight: '900',
  },

  gameScoreLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },

  footerCard: {
    marginTop: 18,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },

  footerText: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 17,
    fontWeight: '500',
  },

  bottomSpace: {
    height: 35,
  },
});

