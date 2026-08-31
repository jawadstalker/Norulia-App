import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  ArrowLeft,
  Brain,
  CheckCircle,
  Clock,
  Eye,
  Gamepad2,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react-native';

import { useRouter } from 'expo-router';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { BorderRadius, Spacing } from '../../constants/theme';

import {
  getGameResults,
  GameMetric,
  GameResult,
} from './gameResults';

type Props = {
  fromGame?: boolean;
};

const GAME_ICONS: Record<string, React.ComponentType<any>> = {
  'visual-flow': Eye,
  'memory-challenge': Brain,
  'reaction-test': Zap,
  'pattern-match': Target,
};

export default function GameResultsScreen({ fromGame }: Props) {
  const router = useRouter();

  const { colors } = useTheme();
  const { language, isRTL } = useLanguage();

  const [results, setResults] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const text = useMemo(
    () =>
      language === 'fa'
        ? {
            title: 'نتایج عملکرد',
            subtitle: 'تحلیل عملکرد بازی‌های شما',
            latest: 'آخرین نتیجه',
            allResults: 'سابقه بازی‌ها',
            noResults: 'هنوز نتیجه‌ای ثبت نشده است.',
            noResultsDescription:
              'یک بازی انجام دهید تا اطلاعات عملکرد شما اینجا نمایش داده شود.',
            startGame: 'شروع یک بازی',
            score: 'امتیاز',
            accuracy: 'دقت',
            responseTime: 'زمان پاسخ',
            performance: 'عملکرد',
            excellent: 'عملکرد عالی',
            good: 'عملکرد خوب',
            needsPractice: 'نیاز به تمرین',
            visualFlow: 'جریان بصری',
            completed: 'تکمیل شد',
            viewDetails: 'مشاهده جزئیات',
            today: 'امروز',
            yesterday: 'دیروز',
            daysAgo: 'روز پیش',
            seconds: 'ثانیه',
            milliseconds: 'میلی‌ثانیه',
            outOf: 'از',
            cognitiveProfile: 'پروفایل عملکرد شناختی',
            strongest: 'قوی‌ترین حوزه',
            needsImprovement: 'نیازمند بهبود',
            overall: 'عملکرد کلی',
            gamesPlayed: 'بازی انجام‌شده',
            refresh: 'به‌روزرسانی',
            back: 'بازگشت',
            game: 'بازی',
            metrics: 'شاخص‌های عملکرد',
            noMetric: 'اطلاعات عملکردی ثبت نشده است.',
          }
        : {
            title: 'Performance Results',
            subtitle: 'Your game performance analysis',
            latest: 'Latest Result',
            allResults: 'Game History',
            noResults: 'No results yet.',
            noResultsDescription:
              'Complete a game to see your performance data here.',
            startGame: 'Start a Game',
            score: 'Score',
            accuracy: 'Accuracy',
            responseTime: 'Response Time',
            performance: 'Performance',
            excellent: 'Excellent Performance',
            good: 'Good Performance',
            needsPractice: 'Needs Practice',
            visualFlow: 'Visual Flow',
            completed: 'Completed',
            viewDetails: 'View Details',
            today: 'Today',
            yesterday: 'Yesterday',
            daysAgo: 'days ago',
            seconds: 'seconds',
            milliseconds: 'ms',
            outOf: 'out of',
            cognitiveProfile: 'Cognitive Performance Profile',
            strongest: 'Strongest Area',
            needsImprovement: 'Needs Improvement',
            overall: 'Overall Performance',
            gamesPlayed: 'Games Played',
            refresh: 'Refresh',
            back: 'Back',
            game: 'Game',
            metrics: 'Performance Metrics',
            noMetric: 'No performance data recorded.',
          },
    [language]
  );

  const loadResults = useCallback(async () => {
    try {
      const data = await getGameResults();
      setResults(data);
    } catch (error) {
      console.warn('[Results] Failed to load:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadResults();
  }, [loadResults]);

  const latest = results.length > 0 ? results[results.length - 1] : null;

  /*
   * Flatten all metrics from all games.
   *
   * If the same metric exists in multiple
   * sessions, only the latest value is used
   * for the profile.
   */
  const latestMetrics = useMemo(() => {
    const map = new Map<string, GameMetric>();

    results.forEach(result => {
      result.metrics.forEach(metric => {
        map.set(metric.id, metric);
      });
    });

    return Array.from(map.values());
  }, [results]);

  /*
   * Overall performance
   */
  const overallScore = useMemo(() => {
    if (!latestMetrics.length) {
      return 0;
    }

    const total = latestMetrics.reduce((sum, metric) => sum + metric.value, 0);
    return Math.round(total / latestMetrics.length);
  }, [latestMetrics]);

  const strongestMetric = useMemo(() => {
    if (!latestMetrics.length) {
      return null;
    }

    return [...latestMetrics].sort((a, b) => b.value - a.value)[0];
  }, [latestMetrics]);

  const weakestMetric = useMemo(() => {
    if (!latestMetrics.length) {
      return null;
    }

    return [...latestMetrics].sort((a, b) => a.value - b.value)[0];
  }, [latestMetrics]);

  const getPerformanceText = (value: number) => {
    if (value >= 85) {
      return text.excellent;
    }

    if (value >= 60) {
      return text.good;
    }

    return text.needsPractice;
  };

  const getGameName = (result: GameResult) => {
    if (result.gameId === 'visual-flow') {
      return text.visualFlow;
    }

    return result.gameName;
  };

  const getIcon = (gameId: string) => {
    return GAME_ICONS[gameId] || Gamepad2;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const day = 24 * 60 * 60 * 1000;

    if (diff < day) {
      return text.today;
    }

    if (diff < day * 2) {
      return text.yesterday;
    }

    const days = Math.floor(diff / day);

    return language === 'fa' ? `${days} ${text.daysAgo}` : `${days} ${text.daysAgo}`;
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/psycho');
    }
  };

  const openGames = () => {
    router.replace('/(tabs)/psycho');
  };

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
        <Header
          title={text.title}
          subtitle={text.subtitle}
          onBack={goBack}
          colors={colors}
          isRTL={isRTL}
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Header
        title={text.title}
        subtitle={text.subtitle}
        onBack={goBack}
        colors={colors}
        isRTL={isRTL}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {results.length === 0 ? (
          <EmptyState text={text} colors={colors} onStart={openGames} />
        ) : (
          <>
            {/* ========================= */}
            {/* LATEST RESULT */}
            {/* ========================= */}

            {latest && (
              <View>
                <SectionHeader title={text.latest} colors={colors} isRTL={isRTL} />

                <LatestResult
                  result={latest}
                  title={getGameName(latest)}
                  performanceText={getPerformanceText(
                    latest.metrics.length
                      ? Math.round(
                          latest.metrics.reduce((sum, metric) => sum + metric.value, 0) / latest.metrics.length
                        )
                      : 0
                  )}
                  colors={colors}
                  isRTL={isRTL}
                  text={text}
                  getIcon={getIcon}
                />
              </View>
            )}

            {/* ========================= */}
            {/* OVERALL PROFILE */}
            {/* ========================= */}

            {latestMetrics.length > 0 && (
              <View>
                <SectionHeader title={text.cognitiveProfile} colors={colors} isRTL={isRTL} />

                <View
                  style={[
                    styles.overallCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.overallTop,
                      {
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.overallIcon,
                        {
                          backgroundColor: colors.primary + '15',
                        },
                      ]}
                    >
                      <Brain size={25} color={colors.primary} />
                    </View>

                    <View style={styles.overallInfo}>
                      <Text
                        style={[
                          styles.overallLabel,
                          {
                            color: colors.textSecondary,
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {text.overall}
                      </Text>

                      <Text
                        style={[
                          styles.overallValue,
                          {
                            color: colors.text,
                            textAlign: isRTL ? 'right' : 'left',
                          },
                        ]}
                      >
                        {overallScore}
                        <Text
                          style={[
                            styles.overallOutOf,
                            {
                              color: colors.textSecondary,
                            },
                          ]}
                        >
                          {' '}
                          / 100
                        </Text>
                      </Text>
                    </View>

                    <TrendingUp size={23} color={colors.primary} />
                  </View>

                  <View
                    style={[
                      styles.progressTrack,
                      {
                        backgroundColor: colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(100, Math.max(0, overallScore))}%`,
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={[
                      styles.performanceText,
                      {
                        color: colors.primary,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {getPerformanceText(overallScore)}
                  </Text>
                </View>

                {strongestMetric && (
                  <ProfileHighlight
                    icon={<Trophy size={20} color={colors.primary} />}
                    title={text.strongest}
                    metric={strongestMetric}
                    colors={colors}
                    isRTL={isRTL}
                  />
                )}

                {weakestMetric && weakestMetric.id !== strongestMetric?.id && (
                  <ProfileHighlight
                    icon={<Target size={20} color={colors.primary} />}
                    title={text.needsImprovement}
                    metric={weakestMetric}
                    colors={colors}
                    isRTL={isRTL}
                  />
                )}
              </View>
            )}

            {/* ========================= */}
            {/* HISTORY */}
            {/* ========================= */}

            <SectionHeader title={text.allResults} colors={colors} isRTL={isRTL} />

            {[...results]
              .reverse()
              .map((result, index) => (
                <HistoryCard
                  key={`${result.gameId}-${result.timestamp}-${index}`}
                  result={result}
                  title={getGameName(result)}
                  date={formatDate(result.timestamp)}
                  colors={colors}
                  isRTL={isRTL}
                  text={text}
                  getIcon={getIcon}
                />
              ))}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={openGames}
              style={[
                styles.startButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Gamepad2 size={20} color="#FFFFFF" />

              <Text style={styles.startButtonText}>{text.startGame}</Text>
            </TouchableOpacity>

            <View style={styles.bottomSpace} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

/* ========================================================= */
/* HEADER */
/* ========================================================= */

function Header({
  title,
  subtitle,
  onBack,
  colors,
  isRTL,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
  colors: any;
  isRTL: boolean;
}) {
  return (
    <View
      style={[
        styles.header,
        {
          borderBottomColor: colors.border,
        },
        {
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onBack}
        style={[
          styles.backButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <ArrowLeft size={21} color={colors.text} strokeWidth={2.5} />
      </TouchableOpacity>

      <View style={styles.headerText}>
        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.headerSubtitle,
            {
              color: colors.textSecondary,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

/* ========================================================= */
/* SECTION HEADER */
/* ========================================================= */

function SectionHeader({
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
        styles.sectionHeader,
        {
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      <Text
        style={[
          styles.sectionTitle,
          {
            color: colors.text,
            textAlign: isRTL ? 'right' : 'left',
          },
        ]}
      >
        {title}
      </Text>
    </View>
  );
}

/* ========================================================= */
/* LATEST RESULT */
/* ========================================================= */

function LatestResult({
  result,
  title,
  performanceText,
  colors,
  isRTL,
  text,
  getIcon,
}: {
  result: GameResult;
  title: string;
  performanceText: string;
  colors: any;
  isRTL: boolean;
  text: any;
  getIcon: (id: string) => React.ComponentType<any>;
}) {
  const Icon = getIcon(result.gameId);

  const average = result.metrics.length
    ? Math.round(result.metrics.reduce((sum, metric) => sum + metric.value, 0) / result.metrics.length)
    : 0;

  return (
    <View
      style={[
        styles.latestCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.primary + '35',
        },
      ]}
    >
      <View
        style={[
          styles.latestTop,
          {
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <View
          style={[
            styles.latestIcon,
            {
              backgroundColor: colors.primary + '15',
            },
          ]}
        >
          <Icon size={28} color={colors.primary} />
        </View>

        <View style={styles.latestTitleContainer}>
          <Text
            style={[
              styles.latestGame,
              {
                color: colors.text,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.latestCompleted,
              {
                color: colors.textSecondary,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {text.completed}
          </Text>
        </View>

        <View
          style={[
            styles.latestScore,
            {
              backgroundColor: colors.primary + '12',
            },
          ]}
        >
          <Text
            style={[
              styles.latestScoreValue,
              {
                color: colors.primary,
              },
            ]}
          >
            {average}
          </Text>

          <Text
            style={[
              styles.latestScoreUnit,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            /100
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.performanceBadge,
          {
            backgroundColor: colors.primary + '10',
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <CheckCircle size={17} color={colors.primary} />

        <Text
          style={[
            styles.performanceBadgeText,
            {
              color: colors.primary,
            },
          ]}
        >
          {performanceText}
        </Text>
      </View>

      <Text
        style={[
          styles.metricsTitle,
          {
            color: colors.text,
            textAlign: isRTL ? 'right' : 'left',
          },
        ]}
      >
        {text.metrics}
      </Text>

      {result.metrics.map(metric => (
        <MetricRow key={metric.id} metric={metric} colors={colors} isRTL={isRTL} />
      ))}
    </View>
  );
}

/* ========================================================= */
/* METRIC ROW */
/* ========================================================= */

function MetricRow({
  metric,
  colors,
  isRTL,
}: {
  metric: GameMetric;
  colors: any;
  isRTL: boolean;
}) {
  const value = Math.min(100, Math.max(0, metric.value));

  return (
    <View
      style={[
        styles.metricRow,
        {
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      <View style={styles.metricMain}>
        <View
          style={[
            styles.metricHeader,
            {
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          <Text
            style={[
              styles.metricLabel,
              {
                color: colors.text,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {metric.label}
          </Text>

          <Text
            style={[
              styles.metricValue,
              {
                color: colors.primary,
              },
            ]}
          >
            {metric.value}
            {metric.unit ? ` ${metric.unit}` : ''}
          </Text>
        </View>

        <View
          style={[
            styles.metricTrack,
            {
              backgroundColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.metricFill,
              {
                width: `${value}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

/* ========================================================= */
/* PROFILE HIGHLIGHT */
/* ========================================================= */

function ProfileHighlight({
  icon,
  title,
  metric,
  colors,
  isRTL,
}: {
  icon: React.ReactNode;
  title: string;
  metric: GameMetric;
  colors: any;
  isRTL: boolean;
}) {
  return (
    <View
      style={[
        styles.highlightCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      <View
        style={[
          styles.highlightIcon,
          {
            backgroundColor: colors.primary + '12',
          },
        ]}
      >
        {icon}
      </View>

      <View style={styles.highlightText}>
        <Text
          style={[
            styles.highlightTitle,
            {
              color: colors.textSecondary,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.highlightMetric,
            {
              color: colors.text,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {metric.label}
        </Text>
      </View>

      <Text
        style={[
          styles.highlightValue,
          {
            color: colors.primary,
          },
        ]}
      >
        {metric.value}
      </Text>
    </View>
  );
}

/* ========================================================= */
/* HISTORY CARD */
/* ========================================================= */

function HistoryCard({
  result,
  title,
  date,
  colors,
  isRTL,
  text,
  getIcon,
}: {
  result: GameResult;
  title: string;
  date: string;
  colors: any;
  isRTL: boolean;
  text: any;
  getIcon: (id: string) => React.ComponentType<any>;
}) {
  const Icon = getIcon(result.gameId);

  const average = result.metrics.length
    ? Math.round(result.metrics.reduce((sum, metric) => sum + metric.value, 0) / result.metrics.length)
    : 0;

  return (
    <View
      style={[
        styles.historyCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.historyTop,
          {
            flexDirection: isRTL ? 'row-reverse' : 'row',
          },
        ]}
      >
        <View
          style={[
            styles.historyIcon,
            {
              backgroundColor: colors.primary + '12',
            },
          ]}
        >
          <Icon size={20} color={colors.primary} />
        </View>

        <View style={styles.historyInfo}>
          <Text
            style={[
              styles.historyTitle,
              {
                color: colors.text,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>

          <Text
            style={[
              styles.historyDate,
              {
                color: colors.textSecondary,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {date}
          </Text>
        </View>

        <View style={styles.historyScore}>
          <Text
            style={[
              styles.historyScoreValue,
              {
                color: colors.primary,
              },
            ]}
          >
            {average}
          </Text>

          <Text
            style={[
              styles.historyScoreUnit,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            /100
          </Text>
        </View>
      </View>

      <View style={styles.historyMetrics}>
        {result.metrics.slice(0, 3).map(metric => (
          <View key={metric.id} style={styles.historyMetric}>
            <Text
              style={[
                styles.historyMetricLabel,
                {
                  color: colors.textSecondary,
                  textAlign: isRTL ? 'right' : 'left',
                },
              ]}
              numberOfLines={1}
            >
              {metric.label}
            </Text>

            <Text
              style={[
                styles.historyMetricValue,
                {
                  color: colors.text,
                },
              ]}
            >
              {metric.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ========================================================= */
/* EMPTY STATE */
/* ========================================================= */

function EmptyState({
  text,
  colors,
  onStart,
}: {
  text: any;
  colors: any;
  onStart: () => void;
}) {
  return (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIcon,
          {
            backgroundColor: colors.primary + '15',
          },
        ]}
      >
        <Gamepad2 size={42} color={colors.primary} />
      </View>

      <Text
        style={[
          styles.emptyTitle,
          {
            color: colors.text,
          },
        ]}
      >
        {text.noResults}
      </Text>

      <Text
        style={[
          styles.emptyDescription,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        {text.noResultsDescription}
      </Text>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onStart}
        style={[
          styles.startButton,
          {
            backgroundColor: colors.primary,
          },
        ]}
      >
        <Gamepad2 size={20} color="#FFFFFF" />

        <Text style={styles.startButtonText}>{text.startGame}</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ========================================================= */
/* STYLES */
/* ========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 20,
    paddingBottom: 50,
  },

  header: {
    minHeight: 108,
    paddingHorizontal: Spacing.lg,
    paddingTop: 54,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 12,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },

  headerSubtitle: {
    fontSize: 11,
    marginTop: 3,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHeader: {
    marginTop: 5,
    marginBottom: 10,
  },

  sectionTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
  },

  latestCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: 18,
  },

  latestTop: {
    alignItems: 'center',
    gap: 11,
  },

  latestIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  latestTitleContainer: {
    flex: 1,
    minWidth: 0,
  },

  latestGame: {
    fontSize: 16,
    fontWeight: '900',
  },

  latestCompleted: {
    fontSize: 10,
    marginTop: 3,
  },

  latestScore: {
    minWidth: 62,
    minHeight: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 7,
  },

  latestScoreValue: {
    fontSize: 24,
    fontWeight: '900',
  },

  latestScoreUnit: {
    fontSize: 9,
    marginTop: 9,
  },

  performanceBadge: {
    marginTop: 14,
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    gap: 6,
  },

  performanceBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },

  metricsTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 17,
    marginBottom: 8,
  },

  metricRow: {
    width: '100%',
    marginTop: 7,
  },

  metricMain: {
    flex: 1,
  },

  metricHeader: {
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },

  metricLabel: {
    flex: 1,
    fontSize: 11,
  },

  metricValue: {
    fontSize: 12,
    fontWeight: '900',
  },

  metricTrack: {
    width: '100%',
    height: 5,
    borderRadius: 3,
    marginTop: 6,
    overflow: 'hidden',
  },

  metricFill: {
    height: '100%',
    borderRadius: 3,
  },

  overallCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: 10,
  },

  overallTop: {
    alignItems: 'center',
    gap: 11,
  },

  overallIcon: {
    width: 49,
    height: 49,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  overallInfo: {
    flex: 1,
  },

  overallLabel: {
    fontSize: 10,
  },

  overallValue: {
    fontSize: 25,
    fontWeight: '900',
    marginTop: 1,
  },

  overallOutOf: {
    fontSize: 11,
    fontWeight: '500',
  },

  progressTrack: {
    width: '100%',
    height: 7,
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 15,
  },

  progressFill: {
    height: '100%',
    borderRadius: 5,
  },

  performanceText: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 7,
  },

  highlightCard: {
    width: '100%',
    minHeight: 66,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    marginBottom: 10,
    alignItems: 'center',
    gap: 10,
  },

  highlightIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  highlightText: {
    flex: 1,
  },

  highlightTitle: {
    fontSize: 9,
  },

  highlightMetric: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },

  highlightValue: {
    fontSize: 20,
    fontWeight: '900',
  },

  historyCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: 10,
  },

  historyTop: {
    alignItems: 'center',
    gap: 10,
  },

  historyIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  historyInfo: {
    flex: 1,
    minWidth: 0,
  },

  historyTitle: {
    fontSize: 13,
    fontWeight: '800',
  },

  historyDate: {
    fontSize: 9,
    marginTop: 3,
  },

  historyScore: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  historyScoreValue: {
    fontSize: 21,
    fontWeight: '900',
  },

  historyScoreUnit: {
    fontSize: 8,
    marginBottom: 3,
  },

  historyMetrics: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 7,
  },

  historyMetric: {
    flex: 1,
    minWidth: 0,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128,128,128,0.15)',
  },

  historyMetricLabel: {
    fontSize: 8,
  },

  historyMetricValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 3,
  },

  startButton: {
    width: '100%',
    minHeight: 54,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  startButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  emptyContainer: {
    flex: 1,
    minHeight: 520,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },

  emptyDescription: {
    maxWidth: 340,
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },

  bottomSpace: {
    height: 20,
  },
});