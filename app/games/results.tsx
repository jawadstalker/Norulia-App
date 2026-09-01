import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Platform,
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
  Download,
  Eye,
  Film,
  Gamepad2,
  Target,
  TrendingUp,
  Trophy,
  Zap,
  AlertCircle,
  Sparkles,
} from 'lucide-react-native';

import { useRouter } from 'expo-router';

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

import {
  BorderRadius,
  Spacing,
} from '../../constants/theme';

import {
  getGameResults,
  GameMetric,
  GameResult,
} from './gameResults';

import {
  getMovieRecommendations,
  MovieRecommendation,
} from '../../services/movieRecommendation';

type Props = {
  fromGame?: boolean;
};

const MIN_GAMES_FOR_MOVIE_RECOMMENDATION = 3;

const GAME_ICONS: Record<
  string,
  React.ComponentType<any>
> = {
  'visual-flow': Eye,
  'memory-challenge': Brain,
  'reaction-test': Zap,
  'pattern-match': Target,
  'last-survival': Trophy,
  'size-discrimination': Target,
  stroop: Zap,
  anologram: Brain,
  'bilingual-sequence': Gamepad2,
  relaxe: Brain,
  word: Brain,
};

function normalizeGameId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-');
}

/**
 * The current Colab API returns genres as:
 *
 * [
 *   "Drama",
 *   "Fantasy"
 * ]
 *
 * Older versions of the API could return a JSON string.
 * This helper supports both formats so the UI remains
 * backwards-compatible.
 */
function getMovieGenres(
  genres:
    | string[]
    | string
    | undefined
    | null
): string[] {
  if (!genres) {
    return [];
  }

  if (Array.isArray(genres)) {
    return genres
      .filter(
        (genre): genre is string =>
          typeof genre === 'string' &&
          genre.trim().length > 0
      )
      .map((genre) => genre.trim());
  }

  if (typeof genres !== 'string') {
    return [];
  }

  const trimmed = genres.trim();

  if (!trimmed) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (typeof item === 'string') {
            return item;
          }

          if (
            item &&
            typeof item === 'object' &&
            typeof item.name === 'string'
          ) {
            return item.name;
          }

          return '';
        })
        .filter(
          (value): value is string =>
            typeof value === 'string' &&
            value.trim().length > 0
        );
    }
  } catch {
    // The value may simply be a comma-separated string.
  }

  return trimmed
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getMovieMatchedTags(
  matchedTags:
    | string[]
    | undefined
    | null
): string[] {
  if (!Array.isArray(matchedTags)) {
    return [];
  }

  return matchedTags
    .filter(
      (tag): tag is string =>
        typeof tag === 'string' &&
        tag.trim().length > 0
    )
    .map((tag) => tag.trim());
}

function formatSimilarity(
  similarity: number
) {
  if (!Number.isFinite(similarity)) {
    return '--';
  }

  return `${Math.round(
    Math.max(0, Math.min(1, similarity)) * 100
  )}%`;
}

export default function GameResultsScreen({
  fromGame,
}: Props) {
  const router = useRouter();

  const { colors } = useTheme();
  const { language, isRTL } = useLanguage();

  const [results, setResults] =
    useState<GameResult[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [exporting, setExporting] =
    useState(false);

  const [
    movieRecommendations,
    setMovieRecommendations,
  ] = useState<MovieRecommendation[]>([]);

  const [
    movieLoading,
    setMovieLoading,
  ] = useState(false);

  const [
    movieError,
    setMovieError,
  ] = useState<string | null>(null);

  // Refs for preventing duplicate movie requests
  const movieRequestInFlightRef = useRef(false);
  const movieRequestedSignatureRef = useRef<string | null>(null);
  const movieMountedRef = useRef(true);

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
            noMetric:
              'اطلاعات عملکردی ثبت نشده است.',
            exportData: 'دانلود نتایج (JSON)',
            exportSuccess:
              'فایل نتایج با موفقیت ذخیره شد.',
            exportError:
              'ذخیره فایل نتایج با خطا مواجه شد.',
            exportEmpty:
              'هنوز داده‌ای برای دانلود وجود ندارد.',
            cancelled: 'ذخیره فایل لغو شد.',
            movieTitle: 'پیشنهاد فیلم برای شما',
            movieSubtitle:
              'بر اساس عملکرد شما در بازی‌های شناختی',
            movieLoading:
              'در حال تحلیل نتایج و پیدا کردن فیلم‌های مناسب...',
            movieWaiting:
              'برای دریافت پیشنهاد فیلم، حداقل ۳ بازی متفاوت انجام دهید.',
            movieError:
              'دریافت پیشنهاد فیلم در حال حاضر امکان‌پذیر نیست.',
            movieRetry: 'تلاش دوباره',
            movieEmpty:
              'هنوز فیلمی برای پیشنهاد پیدا نشد.',
            movieSimilarity: 'تناسب',
            movieOverview: 'درباره فیلم',
            movieGenres: 'ژانر',
            movieId: 'شناسه فیلم',
            movieMatchedTags: 'دلیل پیشنهاد',
            recommendationReady:
              'پیشنهادهای شخصی‌سازی‌شده',
            gamesRequired: 'بازی دیگر',
            gamesProgress:
              'بازی متفاوت تکمیل شده',
            allGamesCompleted:
              'تعداد کافی بازی برای پیشنهاد فیلم تکمیل شده است.',
            noConnection:
              'اتصال به سرویس پیشنهاد فیلم برقرار نشد.',
          }
        : {
            title: 'Performance Results',
            subtitle:
              'Your game performance analysis',
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
            cognitiveProfile:
              'Cognitive Performance Profile',
            strongest: 'Strongest Area',
            needsImprovement:
              'Needs Improvement',
            overall: 'Overall Performance',
            gamesPlayed: 'Games Played',
            refresh: 'Refresh',
            back: 'Back',
            game: 'Game',
            metrics: 'Performance Metrics',
            noMetric:
              'No performance data recorded.',
            exportData:
              'Download Results (JSON)',
            exportSuccess:
              'Results file was saved successfully.',
            exportError:
              'Failed to save results file.',
            exportEmpty:
              'There is no data to download yet.',
            cancelled:
              'File saving was cancelled.',
            movieTitle:
              'Movies Recommended For You',
            movieSubtitle:
              'Based on your cognitive game performance',
            movieLoading:
              'Analyzing your results and finding the best movies for you...',
            movieWaiting:
              'Complete at least 3 different games to receive movie recommendations.',
            movieError:
              'Movie recommendations are currently unavailable.',
            movieRetry: 'Try Again',
            movieEmpty:
              'No movie recommendations were found.',
            movieSimilarity: 'Match',
            movieOverview: 'About the movie',
            movieGenres: 'Genres',
            movieId: 'Movie ID',
            movieMatchedTags: 'Why this was recommended',
            recommendationReady:
              'Personalized Recommendations',
            gamesRequired: 'more games',
            gamesProgress:
              'different games completed',
            allGamesCompleted:
              'Enough games have been completed for movie recommendations.',
            noConnection:
              'Could not connect to the movie recommendation service.',
          },
    [language]
  );

  const loadResults = useCallback(
    async () => {
      try {
        const data = await getGameResults();

        setResults(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.warn(
          '[Results] Failed to load results:',
          error
        );

        setResults([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      movieMountedRef.current = false;
    };
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadResults();
  }, [loadResults]);

  /**
   * Count unique game types.
   *
   * The movie engine requires 3 DIFFERENT games,
   * not simply 3 sessions of the same game.
   */
  const completedGameIds = useMemo(() => {
    const set = new Set<string>();

    results.forEach((result) => {
      if (!result?.gameId) {
        return;
      }

      set.add(
        normalizeGameId(result.gameId)
      );
    });

    return set;
  }, [results]);

  const completedGamesCount =
    completedGameIds.size;

  const remainingGamesForRecommendation =
    Math.max(
      0,
      MIN_GAMES_FOR_MOVIE_RECOMMENDATION -
        completedGamesCount
    );

  const hasEnoughGamesForMovies =
    completedGamesCount >=
    MIN_GAMES_FOR_MOVIE_RECOMMENDATION;

  /**
   * Generate a stable signature from the game
   * results so we don't repeatedly call the API
   * with exactly the same data.
   */
  const movieRequestSignature =
    useMemo(() => {
      return results
        .map((result) => ({
          gameId: normalizeGameId(
            result.gameId
          ),
          timestamp: result.timestamp,
          score: result.score,
          metrics: result.metrics,
        }))
        .sort(
          (a, b) =>
            Number(a.timestamp || 0) -
            Number(b.timestamp || 0)
        )
        .map((item) =>
          JSON.stringify(item)
        )
        .join('|');
    }, [results]);

  /**
   * Request movie recommendations from
   * the current Colab / FastAPI service.
   */
  const requestMovieRecommendations = useCallback(
    async (force = false) => {
      if (!hasEnoughGamesForMovies) {
        return;
      }

      if (!results.length) {
        return;
      }

      if (movieRequestInFlightRef.current) {
        return;
      }

      if (
        !force &&
        movieRequestedSignatureRef.current ===
          movieRequestSignature
      ) {
        return;
      }

      movieRequestInFlightRef.current = true;

      if (movieMountedRef.current) {
        setMovieLoading(true);
        setMovieError(null);
      }

      try {
        console.log(
          '[MovieRecommendation] Requesting recommendations...',
          {
            games: results.length,
            differentGames: completedGamesCount,
            signature: movieRequestSignature,
          }
        );

        const recommendations =
          await getMovieRecommendations(
            results,
            3
          );

        const normalizedRecommendations =
          Array.isArray(recommendations)
            ? recommendations
                .filter(
                  (movie) =>
                    movie &&
                    typeof movie.title === 'string'
                )
                .slice(0, 3)
            : [];

        console.log(
          '[MovieRecommendation] Recommendations received:',
          normalizedRecommendations
        );

        if (!movieMountedRef.current) {
          return;
        }

        setMovieRecommendations(
          normalizedRecommendations
        );

        /*
         * VERY IMPORTANT:
         * Mark this exact dataset as processed even
         * when the API returns an empty array.
         *
         * This prevents an endless request loop.
         */
        movieRequestedSignatureRef.current =
          movieRequestSignature;

        if (
          normalizedRecommendations.length ===
          0
        ) {
          console.warn(
            '[MovieRecommendation] API returned no movies.'
          );
        }
      } catch (error) {
        console.error(
          '[MovieRecommendation] Failed:',
          error
        );

        if (!movieMountedRef.current) {
          return;
        }

        setMovieRecommendations([]);

        setMovieError(
          text.noConnection
        );

        /*
         * Do NOT mark the signature as successful
         * on error.
         *
         * The user can explicitly press Try Again.
         */
      } finally {
        movieRequestInFlightRef.current = false;

        if (movieMountedRef.current) {
          setMovieLoading(false);
        }
      }
    },
    [
      hasEnoughGamesForMovies,
      results,
      completedGamesCount,
      movieRequestSignature,
      text.noConnection,
    ]
  );

  /**
   * Automatically request recommendations
   * when enough different games exist.
   */
  useEffect(() => {
    if (!hasEnoughGamesForMovies) {
      return;
    }

    if (!results.length) {
      return;
    }

    if (movieRequestInFlightRef.current) {
      return;
    }

    if (
      movieRequestedSignatureRef.current ===
      movieRequestSignature
    ) {
      return;
    }

    requestMovieRecommendations(false);
  }, [
    hasEnoughGamesForMovies,
    results.length,
    movieRequestSignature,
    requestMovieRecommendations,
  ]);

  const createExportPayload =
    useCallback(() => {
      return {
        exportedAt:
          new Date().toISOString(),
        count: results.length,
        results,
      };
    }, [results]);

  const createExportFilename =
    useCallback(() => {
      const stamp =
        new Date()
          .toISOString()
          .replace(
            /[:.]/g,
            '-'
          );

      return `norulia_game_results_${stamp}.json`;
    }, []);

  const exportOnWeb =
    useCallback(
      async (
        json: string,
        filename: string
      ) => {
        if (
          typeof document ===
            'undefined' ||
          typeof URL ===
            'undefined'
        ) {
          throw new Error(
            'Browser download API unavailable.'
          );
        }

        const blob =
          new Blob(
            [json],
            {
              type:
                'application/json;charset=utf-8',
            }
          );

        const url =
          URL.createObjectURL(
            blob
          );

        try {
          const anchor =
            document.createElement(
              'a'
            );

          anchor.href = url;
          anchor.download =
            filename;
          anchor.style.display =
            'none';

          document.body.appendChild(
            anchor
          );

          anchor.click();

          document.body.removeChild(
            anchor
          );
        } finally {
          setTimeout(() => {
            URL.revokeObjectURL(
              url
            );
          }, 1000);
        }
      },
      []
    );

  const exportOnAndroid =
    useCallback(
      async (
        json: string,
        filename: string
      ) => {
        if (
          !FileSystem
            .StorageAccessFramework
        ) {
          throw new Error(
            'Storage Access Framework unavailable.'
          );
        }

        const permission =
          await FileSystem
            .StorageAccessFramework
            .requestDirectoryPermissionsAsync();

        if (
          !permission.granted ||
          !permission.directoryUri
        ) {
          return false;
        }

        const fileUri =
          await FileSystem
            .StorageAccessFramework
            .createFileAsync(
              permission.directoryUri,
              filename,
              'application/json'
            );

        await FileSystem.writeAsStringAsync(
          fileUri,
          json,
          {
            encoding:
              FileSystem.EncodingType
                .UTF8,
          }
        );

        return true;
      },
      []
    );

  const exportOnIOS =
    useCallback(
      async (
        json: string,
        filename: string
      ) => {
        const baseDirectory =
          FileSystem.documentDirectory ||
          FileSystem.cacheDirectory;

        if (!baseDirectory) {
          throw new Error(
            'No writable directory available.'
          );
        }

        const fileUri =
          `${baseDirectory}${filename}`;

        await FileSystem.writeAsStringAsync(
          fileUri,
          json,
          {
            encoding:
              FileSystem.EncodingType
                .UTF8,
          }
        );

        const available =
          await Sharing.isAvailableAsync();

        if (!available) {
          return;
        }

        await Sharing.shareAsync(
          fileUri,
          {
            mimeType:
              'application/json',
            dialogTitle:
              text.exportData,
            UTI: 'public.json',
          }
        );
      },
      [text.exportData]
    );

  const exportWithSharing =
    useCallback(
      async (
        json: string,
        filename: string
      ) => {
        const baseDirectory =
          FileSystem.documentDirectory ||
          FileSystem.cacheDirectory;

        if (!baseDirectory) {
          throw new Error(
            'No writable directory available.'
          );
        }

        const fileUri =
          `${baseDirectory}${filename}`;

        await FileSystem.writeAsStringAsync(
          fileUri,
          json,
          {
            encoding:
              FileSystem.EncodingType
                .UTF8,
          }
        );

        const available =
          await Sharing.isAvailableAsync();

        if (!available) {
          throw new Error(
            'Sharing unavailable.'
          );
        }

        await Sharing.shareAsync(
          fileUri,
          {
            mimeType:
              'application/json',
            dialogTitle:
              text.exportData,
            UTI: 'public.json',
          }
        );
      },
      [text.exportData]
    );

  const exportResults =
    useCallback(
      async () => {
        if (exporting) {
          return;
        }

        if (!results.length) {
          Alert.alert(
            text.exportData,
            text.exportEmpty
          );

          return;
        }

        setExporting(true);

        try {
          const payload =
            createExportPayload();

          const json =
            JSON.stringify(
              payload,
              null,
              2
            );

          const filename =
            createExportFilename();

          if (
            Platform.OS ===
            'web'
          ) {
            await exportOnWeb(
              json,
              filename
            );

            return;
          }

          if (
            Platform.OS ===
            'android'
          ) {
            const saved =
              await exportOnAndroid(
                json,
                filename
              );

            if (!saved) {
              Alert.alert(
                text.exportData,
                text.cancelled
              );

              return;
            }

            Alert.alert(
              text.exportData,
              text.exportSuccess
            );

            return;
          }

          if (
            Platform.OS ===
            'ios'
          ) {
            await exportOnIOS(
              json,
              filename
            );

            return;
          }

          await exportWithSharing(
            json,
            filename
          );
        } catch (error) {
          console.warn(
            '[Results] Export failed:',
            error
          );

          Alert.alert(
            text.exportData,
            text.exportError
          );
        } finally {
          setExporting(false);
        }
      },
      [
        exporting,
        results,
        text,
        createExportPayload,
        createExportFilename,
        exportOnWeb,
        exportOnAndroid,
        exportOnIOS,
        exportWithSharing,
      ]
    );

  const getGameIcon =
    useCallback(
      (gameId: string) => {
        return (
          GAME_ICONS[
            normalizeGameId(
              gameId
            )
          ] || Gamepad2
        );
      },
      []
    );

  const getPerformanceLabel =
    useCallback(
      (score?: number) => {
        if (
          typeof score !==
          'number'
        ) {
          return text.good;
        }

        if (score >= 80) {
          return text.excellent;
        }

        if (score >= 60) {
          return text.good;
        }

        return text.needsPractice;
      },
      [text]
    );

  const formatDate =
    useCallback(
      (timestamp: number) => {
        const date =
          new Date(
            timestamp
          );

        const now =
          new Date();

        const diff =
          Math.floor(
            (
              now.getTime() -
              date.getTime()
            ) /
              86400000
          );

        if (diff === 0) {
          return text.today;
        }

        if (diff === 1) {
          return text.yesterday;
        }

        return `${diff} ${text.daysAgo}`;
      },
      [text]
    );

  const getMetricValue =
    useCallback(
      (
        metrics: GameMetric[],
        ids: string[]
      ) => {
        const metric =
          metrics.find(
            (item) =>
              ids.includes(
                item.id
              )
          );

        return metric;
      },
      []
    );

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text
          style={[
            styles.loadingText,
            {
              color: colors.text,
            },
          ]}
        >
          {language === 'fa'
            ? 'در حال بارگذاری نتایج...'
            : 'Loading results...'}
        </Text>
      </View>
    );
  }

  if (!results.length) {
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
        <View
          style={[
            styles.emptyContainer,
            {
              direction:
                isRTL
                  ? 'rtl'
                  : 'ltr',
            },
          ]}
        >
          <View
            style={[
              styles.emptyIcon,
              {
                backgroundColor:
                  colors.primary +
                  '18',
              },
            ]}
          >
            <Gamepad2
              size={42}
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
            {text.noResults}
          </Text>

          <Text
            style={[
              styles.emptyDescription,
              {
                color:
                  colors.textSecondary,
                textAlign:
                  isRTL
                    ? 'right'
                    : 'center',
              },
            ]}
          >
            {
              text.noResultsDescription
            }
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() =>
              router.back()
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
              style={
                styles.primaryButtonText
              }
            >
              {text.startGame}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
          />
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        <View
          style={[
            styles.header,
            {
              flexDirection:
                isRTL
                  ? 'row-reverse'
                  : 'row',
            },
          ]}
        >
          <TouchableOpacity
            onPress={() =>
              router.back()
            }
            activeOpacity={0.8}
            style={[
              styles.iconButton,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <ArrowLeft
              size={21}
              color={colors.text}
            />
          </TouchableOpacity>

          <View
            style={[
              styles.headerTextContainer,
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
                styles.title,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {text.title}
            </Text>

            <Text
              style={[
                styles.subtitle,
                {
                  color:
                    colors.textSecondary,
                  textAlign:
                    isRTL
                      ? 'right'
                      : 'left',
                },
              ]}
            >
              {text.subtitle}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.summaryCard,
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
              styles.summaryHeader,
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
                styles.summaryIcon,
                {
                  backgroundColor:
                    colors.primary +
                    '18',
                },
              ]}
            >
              <TrendingUp
                size={22}
                color={
                  colors.primary
                }
              />
            </View>

            <View
              style={[
                styles.summaryHeaderText,
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
                  styles.summaryTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {
                  text.cognitiveProfile
                }
              </Text>

              <Text
                style={[
                  styles.summarySubtitle,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {results.length}{' '}
                {
                  text.gamesPlayed
                }
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.summaryStats,
              {
                flexDirection:
                  isRTL
                    ? 'row-reverse'
                    : 'row',
              },
            ]}
          >
            <View
              style={
                styles.summaryStat
              }
            >
              <Text
                style={[
                  styles.summaryStatValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {
                  completedGamesCount
                }
              </Text>

              <Text
                style={[
                  styles.summaryStatLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {
                  text.gamesProgress
                }
              </Text>
            </View>

            <View
              style={[
                styles.summaryDivider,
                {
                  backgroundColor:
                    colors.border,
                },
              ]}
            />

            <View
              style={
                styles.summaryStat
              }
            >
              <Text
                style={[
                  styles.summaryStatValue,
                  {
                    color:
                      hasEnoughGamesForMovies
                        ? colors.success
                        : colors.primary,
                  },
                ]}
              >
                {hasEnoughGamesForMovies
                  ? '✓'
                  : remainingGamesForRecommendation}
              </Text>

              <Text
                style={[
                  styles.summaryStatLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {hasEnoughGamesForMovies
                  ? text.completed
                  : text.gamesRequired}
              </Text>
            </View>
          </View>
        </View>

        {/* ======================================================
            MOVIE RECOMMENDATIONS
           ====================================================== */}

        <View
          style={[
            styles.movieSection,
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
              styles.movieHeader,
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
                styles.movieHeaderIcon,
                {
                  backgroundColor:
                    colors.primary +
                    '18',
                },
              ]}
            >
              <Film
                size={23}
                color={
                  colors.primary
                }
              />
            </View>

            <View
              style={[
                styles.movieHeaderText,
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
                  styles.movieTitleRow,
                  {
                    flexDirection:
                      isRTL
                        ? 'row-reverse'
                        : 'row',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.movieSectionTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {
                    text.movieTitle
                  }
                </Text>

                <Sparkles
                  size={17}
                  color={
                    colors.primary
                  }
                />
              </View>

              <Text
                style={[
                  styles.movieSectionSubtitle,
                  {
                    color:
                      colors.textSecondary,
                    textAlign:
                      isRTL
                        ? 'right'
                        : 'left',
                  },
                ]}
              >
                {
                  text.movieSubtitle
                }
              </Text>
            </View>
          </View>

          {/* Waiting for enough different games */}

          {!hasEnoughGamesForMovies &&
            !movieLoading && (
              <View
                style={[
                  styles.movieMessage,
                  {
                    backgroundColor:
                      colors.background,
                    flexDirection:
                      isRTL
                        ? 'row-reverse'
                        : 'row',
                  },
                ]}
              >
                <Gamepad2
                  size={24}
                  color={
                    colors.primary
                  }
                />

                <View
                  style={
                    styles.movieWaitingContent
                  }
                >
                  <Text
                    style={[
                      styles.movieMessageText,
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
                    {
                      text.movieWaiting
                    }
                  </Text>

                  <Text
                    style={[
                      styles.movieProgressText,
                      {
                        color:
                          colors.primary,
                        textAlign:
                          isRTL
                            ? 'right'
                            : 'left',
                      },
                    ]}
                  >
                    {
                      completedGamesCount
                    }{' '}
                    /{' '}
                    {
                      MIN_GAMES_FOR_MOVIE_RECOMMENDATION
                    }{' '}
                    {
                      text.gamesProgress
                    }
                  </Text>
                </View>
              </View>
            )}

          {/* Loading */}

          {movieLoading && (
            <View
              style={
                styles.movieLoading
              }
            >
              <ActivityIndicator
                size="small"
                color={
                  colors.primary
                }
              />

              <Text
                style={[
                  styles.movieLoadingText,
                  {
                    color:
                      colors.textSecondary,
                    textAlign:
                      isRTL
                        ? 'right'
                        : 'left',
                  },
                ]}
              >
                {
                  text.movieLoading
                }
              </Text>
            </View>
          )}

          {/* Error */}

          {!movieLoading &&
            movieError && (
              <View
                style={[
                  styles.movieError,
                  {
                    backgroundColor:
                      colors.background,
                    borderColor:
                      colors.border,
                    flexDirection:
                      isRTL
                        ? 'row-reverse'
                        : 'row',
                  },
                ]}
              >
                <AlertCircle
                  size={23}
                  color={
                    colors.error ||
                    '#ef4444'
                  }
                />

                <View
                  style={
                    styles.movieErrorContent
                  }
                >
                  <Text
                    style={[
                      styles.movieErrorText,
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
                    {
                      text.movieError
                    }
                  </Text>

                  {hasEnoughGamesForMovies && (
                    <TouchableOpacity
                      onPress={() =>
                        requestMovieRecommendations(
                          true
                        )
                      }
                      activeOpacity={
                        0.8
                      }
                      style={[
                        styles.retryButton,
                        {
                          backgroundColor:
                            colors.primary,
                          alignSelf:
                            isRTL
                              ? 'flex-end'
                              : 'flex-start',
                        },
                      ]}
                    >
                      <Text
                        style={
                          styles.retryButtonText
                        }
                      >
                        {
                          text.movieRetry
                        }
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

          {/* Recommendations */}

          {!movieLoading &&
            !movieError &&
            movieRecommendations.length >
              0 && (
              <View
                style={
                  styles.moviesList
                }
              >
                {movieRecommendations
                  .slice(0, 3)
                  .map(
                    (
                      movie,
                      index
                    ) => {
                      const genres =
                        getMovieGenres(
                          movie.genres
                        );

                      const matchedTags =
                        getMovieMatchedTags(
                          movie.matchedTags
                        );

                      return (
                        <View
                          key={`${movie.movieId}-${index}`}
                          style={[
                            styles.movieCard,
                            {
                              backgroundColor:
                                colors.background,
                              borderColor:
                                colors.border,
                              flexDirection:
                                isRTL
                                  ? 'row-reverse'
                                  : 'row',
                            },
                          ]}
                        >
                          {/* Rank */}

                          <View
                            style={[
                              styles.movieNumber,
                              {
                                backgroundColor:
                                  colors.primary,
                                marginRight:
                                  isRTL
                                    ? 0
                                    : 12,
                                marginLeft:
                                  isRTL
                                    ? 12
                                    : 0,
                              },
                            ]}
                          >
                            <Text
                              style={
                                styles.movieNumberText
                              }
                            >
                              {index + 1}
                            </Text>
                          </View>

                          <View
                            style={
                              styles.movieContent
                            }
                          >
                            {/* Title + match */}

                            <View
                              style={[
                                styles.movieNameRow,
                                {
                                  flexDirection:
                                    isRTL
                                      ? 'row-reverse'
                                      : 'row',
                                },
                              ]}
                            >
                              <Text
                                numberOfLines={
                                  2
                                }
                                style={[
                                  styles.movieName,
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
                                {
                                  movie.title
                                }
                              </Text>

                              <View
                                style={[
                                  styles.matchBadge,
                                  {
                                    backgroundColor:
                                      colors.primary +
                                      '18',
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.matchText,
                                    {
                                      color:
                                        colors.primary,
                                    },
                                  ]}
                                >
                                  {formatSimilarity(
                                    movie.similarity
                                  )}
                                </Text>
                              </View>
                            </View>

                            {/* Genres */}

                            {genres.length >
                              0 && (
                              <View
                                style={[
                                  styles.genreRow,
                                  {
                                    flexDirection:
                                      isRTL
                                        ? 'row-reverse'
                                        : 'row',
                                  },
                                ]}
                              >
                                {genres
                                  .slice(
                                    0,
                                    3
                                  )
                                  .map(
                                    (
                                      genre,
                                      genreIndex
                                    ) => (
                                      <View
                                        key={`${genre}-${genreIndex}`}
                                        style={[
                                          styles.genreChip,
                                          {
                                            backgroundColor:
                                              colors.surface,
                                            borderColor:
                                              colors.border,
                                          },
                                        ]}
                                      >
                                        <Text
                                          style={[
                                            styles.genreText,
                                            {
                                              color:
                                                colors.textSecondary,
                                            },
                                          ]}
                                        >
                                          {
                                            genre
                                          }
                                        </Text>
                                      </View>
                                    )
                                  )}
                              </View>
                            )}

                            {/* Matched tags */}

                            {matchedTags.length >
                              0 && (
                              <View
                                style={[
                                  styles.matchedTagsContainer,
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
                                    styles.matchedTagsLabel,
                                    {
                                      color:
                                        colors.textSecondary,
                                      textAlign:
                                        isRTL
                                          ? 'right'
                                          : 'left',
                                    },
                                  ]}
                                >
                                  {
                                    text.movieMatchedTags
                                  }
                                </Text>

                                <View
                                  style={[
                                    styles.genreRow,
                                    {
                                      flexDirection:
                                        isRTL
                                          ? 'row-reverse'
                                          : 'row',
                                    },
                                  ]}
                                >
                                  {matchedTags
                                    .slice(
                                      0,
                                      4
                                    )
                                    .map(
                                      (
                                        tag,
                                        tagIndex
                                      ) => (
                                        <View
                                          key={`${tag}-${tagIndex}`}
                                          style={[
                                            styles.tagChip,
                                            {
                                              backgroundColor:
                                                colors.primary +
                                                '12',
                                              borderColor:
                                                colors.primary +
                                                '35',
                                            },
                                          ]}
                                        >
                                          <Text
                                            style={[
                                              styles.tagText,
                                              {
                                                color:
                                                  colors.primary,
                                              },
                                            ]}
                                          >
                                            {
                                              tag
                                            }
                                          </Text>
                                        </View>
                                      )
                                    )}
                                </View>
                              </View>
                            )}

                            {/* Overview */}

                            {movie.overview ? (
                              <Text
                                style={[
                                  styles.movieOverview,
                                  {
                                    color:
                                      colors.textSecondary,
                                    textAlign:
                                      isRTL
                                        ? 'right'
                                        : 'left',
                                  },
                                ]}
                                numberOfLines={
                                  4
                                }
                              >
                                {
                                  movie.overview
                                }
                              </Text>
                            ) : null}

                            {/* Metadata */}

                            <View
                              style={[
                                styles.movieMeta,
                                {
                                  flexDirection:
                                    isRTL
                                      ? 'row-reverse'
                                      : 'row',
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.movieMetaText,
                                  {
                                    color:
                                      colors.textSecondary,
                                  },
                                ]}
                              >
                                {
                                  text.movieId
                                }
                                :{' '}
                                {
                                  movie.movieId
                                }
                              </Text>

                              <Text
                                style={[
                                  styles.movieMetaText,
                                  {
                                    color:
                                      colors.primary,
                                  },
                                ]}
                              >
                                {
                                  text.movieSimilarity
                                }{' '}
                                {formatSimilarity(
                                  movie.similarity
                                )}
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    }
                  )}
              </View>
            )}

          {/* Empty result after successful request */}

          {!movieLoading &&
            !movieError &&
            hasEnoughGamesForMovies &&
            movieRequestedSignatureRef.current ===
              movieRequestSignature &&
            movieRecommendations.length ===
              0 && (
              <View
                style={[
                  styles.movieMessage,
                  {
                    backgroundColor:
                      colors.background,
                  },
                ]}
              >
                <Film
                  size={24}
                  color={
                    colors.primary
                  }
                />

                <Text
                  style={[
                    styles.movieMessageText,
                    {
                      color:
                        colors.textSecondary,
                      textAlign:
                        isRTL
                          ? 'right'
                          : 'left',
                    },
                  ]}
                >
                  {
                    text.movieEmpty
                  }
                </Text>
              </View>
            )}
        </View>

        {/* ======================================================
            EXPORT
           ====================================================== */}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={
            exportResults
          }
          disabled={
            exporting
          }
          style={[
            styles.exportButton,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
              opacity:
                exporting
                  ? 0.6
                  : 1,
              flexDirection:
                isRTL
                  ? 'row-reverse'
                  : 'row',
            },
          ]}
        >
          {exporting ? (
            <ActivityIndicator
              size="small"
              color={
                colors.primary
              }
            />
          ) : (
            <Download
              size={20}
              color={
                colors.primary
              }
            />
          )}

          <Text
            style={[
              styles.exportButtonText,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {
              text.exportData
            }
          </Text>
        </TouchableOpacity>

        {/* ======================================================
            GAME HISTORY
           ====================================================== */}

        <View
          style={[
            styles.sectionHeader,
            {
              flexDirection:
                isRTL
                  ? 'row-reverse'
                  : 'row',
            },
          ]}
        >
          <View>
            <Text
              style={[
                styles.sectionTitle,
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
              {
                text.allResults
              }
            </Text>
          </View>
        </View>

        {results
          .slice()
          .reverse()
          .map(
            (
              result,
              index
            ) => {
              const Icon =
                getGameIcon(
                  result.gameId
                );

              const accuracy =
                getMetricValue(
                  result.metrics,
                  [
                    'memory_accuracy',
                    'size_discrimination_accuracy',
                    'visual_attention',
                    'movement_accuracy',
                  ]
                );

              const responseTime =
                getMetricValue(
                  result.metrics,
                  [
                    'average_response_time',
                    'size_discrimination_reaction_time',
                  ]
                );

              return (
                <View
                  key={`${result.gameId}-${result.timestamp}-${index}`}
                  style={[
                    styles.resultCard,
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
                      styles.resultHeader,
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
                        styles.gameIcon,
                        {
                          backgroundColor:
                            colors.primary +
                            '18',
                        },
                      ]}
                    >
                      <Icon
                        size={22}
                        color={
                          colors.primary
                        }
                      />
                    </View>

                    <View
                      style={[
                        styles.resultHeaderText,
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
                          styles.gameName,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {
                          result.gameName
                        }
                      </Text>

                      <Text
                        style={[
                          styles.resultDate,
                          {
                            color:
                              colors.textSecondary,
                          },
                        ]}
                      >
                        {formatDate(
                          result.timestamp
                        )}
                      </Text>
                    </View>

                    {typeof result.score ===
                      'number' && (
                      <View
                        style={[
                          styles.scoreContainer,
                          {
                            backgroundColor:
                              colors.primary +
                              '18',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.scoreValue,
                            {
                              color:
                                colors.primary,
                            },
                          ]}
                        >
                          {
                            result.score
                          }
                        </Text>

                        <Text
                          style={[
                            styles.scoreLabel,
                            {
                              color:
                                colors.textSecondary,
                            },
                          ]}
                        >
                          {
                            text.score
                          }
                        </Text>
                      </View>
                    )}
                  </View>

                  {typeof result.score ===
                    'number' && (
                    <Text
                      style={[
                        styles.performanceLabel,
                        {
                          color:
                            colors.textSecondary,
                          textAlign:
                            isRTL
                              ? 'right'
                              : 'left',
                        },
                      ]}
                    >
                      {
                        getPerformanceLabel(
                          result.score
                        )
                      }
                    </Text>
                  )}

                  <View
                    style={[
                      styles.metricsRow,
                      {
                        flexDirection:
                          isRTL
                            ? 'row-reverse'
                            : 'row',
                      },
                    ]}
                  >
                    {accuracy && (
                      <View
                        style={[
                          styles.metricItem,
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
                            styles.metricLabel,
                            {
                              color:
                                colors.textSecondary,
                            },
                          ]}
                        >
                          {
                            text.accuracy
                          }
                        </Text>

                        <Text
                          style={[
                            styles.metricValue,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {
                            accuracy.value
                          }
                          {
                            accuracy.unit ||
                            ''
                          }
                        </Text>
                      </View>
                    )}

                    {responseTime && (
                      <View
                        style={[
                          styles.metricItem,
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
                            styles.metricLabel,
                            {
                              color:
                                colors.textSecondary,
                            },
                          ]}
                        >
                          {
                            text.responseTime
                          }
                        </Text>

                        <Text
                          style={[
                            styles.metricValue,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {
                            responseTime.value
                          }{' '}
                          {
                            responseTime.unit ||
                            text.milliseconds
                          }
                        </Text>
                      </View>
                    )}

                    <View
                      style={[
                        styles.metricItem,
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
                          styles.metricLabel,
                          {
                            color:
                              colors.textSecondary,
                          },
                        ]}
                      >
                        {
                          text.metrics
                        }
                      </Text>

                      <Text
                        style={[
                          styles.metricValue,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {
                          result.metrics
                            ?.length ||
                          0
                        }
                      </Text>
                    </View>
                  </View>

                  {result.metrics?.length >
                    0 && (
                    <View
                      style={
                        styles.detailsContainer
                      }
                    >
                      {result.metrics.map(
                        (metric) => (
                          <View
                            key={
                              metric.id
                            }
                            style={[
                              styles.detailRow,
                              {
                                flexDirection:
                                  isRTL
                                    ? 'row-reverse'
                                    : 'row',
                                borderTopColor:
                                  colors.border,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.detailLabel,
                                {
                                  color:
                                    colors.textSecondary,
                                  textAlign:
                                    isRTL
                                      ? 'right'
                                      : 'left',
                                },
                              ]}
                            >
                              {
                                metric.label
                              }
                            </Text>

                            <Text
                              style={[
                                styles.detailValue,
                                {
                                  color:
                                    colors.text,
                                },
                              ]}
                            >
                              {
                                metric.value
                              }{' '}
                              {
                                metric.unit ||
                                ''
                              }
                            </Text>
                          </View>
                        )
                      )}
                    </View>
                  )}
                </View>
              );
            }
          )}

        <View
          style={
            styles.bottomSpacer
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
      paddingHorizontal:
        Spacing?.lg || 20,
      paddingTop:
        Spacing?.md || 16,
      paddingBottom: 40,
    },

    loadingContainer: {
      flex: 1,
      justifyContent:
        'center',
      alignItems:
        'center',
      gap: 12,
    },

    loadingText: {
      fontSize: 14,
      fontWeight: '500',
    },

    header: {
      alignItems:
        'center',
      marginBottom: 20,
    },

    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      borderWidth: 1,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    headerTextContainer: {
      flex: 1,
      marginHorizontal: 14,
    },

    title: {
      fontSize: 25,
      fontWeight: '800',
      letterSpacing: -0.4,
    },

    subtitle: {
      fontSize: 13,
      marginTop: 4,
      lineHeight: 19,
    },

    emptyContainer: {
      flex: 1,
      justifyContent:
        'center',
      alignItems:
        'center',
      paddingHorizontal: 30,
    },

    emptyIcon: {
      width: 86,
      height: 86,
      borderRadius: 28,
      justifyContent:
        'center',
      alignItems:
        'center',
      marginBottom: 20,
    },

    emptyTitle: {
      fontSize: 22,
      fontWeight: '800',
      marginBottom: 10,
    },

    emptyDescription: {
      fontSize: 14,
      lineHeight: 22,
      maxWidth: 360,
    },

    primaryButton: {
      marginTop: 24,
      paddingHorizontal: 26,
      paddingVertical: 14,
      borderRadius: 16,
    },

    primaryButtonText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '700',
    },

    summaryCard: {
      borderWidth: 1,
      borderRadius:
        BorderRadius?.xl ||
        24,
      padding: 18,
      marginBottom: 18,
    },

    summaryHeader: {
      alignItems:
        'center',
    },

    summaryIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    summaryHeaderText: {
      flex: 1,
      marginHorizontal: 12,
    },

    summaryTitle: {
      fontSize: 16,
      fontWeight: '800',
    },

    summarySubtitle: {
      fontSize: 12,
      marginTop: 3,
    },

    summaryStats: {
      alignItems:
        'center',
      marginTop: 18,
    },

    summaryStat: {
      flex: 1,
      alignItems:
        'center',
    },

    summaryStatValue: {
      fontSize: 25,
      fontWeight: '800',
    },

    summaryStatLabel: {
      fontSize: 11,
      marginTop: 4,
      textAlign:
        'center',
    },

    summaryDivider: {
      width: 1,
      height: 34,
    },

    /* ==========================================================
       MOVIE STYLES
       ========================================================== */

    movieSection: {
      borderWidth: 1,
      borderRadius:
        BorderRadius?.xl ||
        24,
      padding: 18,
      marginBottom: 18,
    },

    movieHeader: {
      alignItems:
        'center',
      marginBottom: 16,
    },

    movieHeaderIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    movieHeaderText: {
      flex: 1,
      marginHorizontal: 12,
    },

    movieTitleRow: {
      alignItems:
        'center',
      gap: 7,
    },

    movieSectionTitle: {
      fontSize: 17,
      fontWeight: '800',
    },

    movieSectionSubtitle: {
      fontSize: 12,
      marginTop: 4,
      lineHeight: 18,
    },

    movieMessage: {
      minHeight: 90,
      borderRadius: 18,
      justifyContent:
        'center',
      alignItems:
        'center',
      padding: 18,
      gap: 10,
    },

    movieWaitingContent: {
      flex: 1,
      gap: 4,
    },

    movieMessageText: {
      fontSize: 13,
      lineHeight: 21,
    },

    movieProgressText: {
      fontSize: 11,
      fontWeight: '700',
      lineHeight: 17,
    },

    movieLoading: {
      minHeight: 100,
      justifyContent:
        'center',
      alignItems:
        'center',
      gap: 12,
    },

    movieLoadingText: {
      fontSize: 13,
      lineHeight: 20,
    },

    movieError: {
      minHeight: 100,
      borderWidth: 1,
      borderRadius: 18,
      padding: 16,
      alignItems:
        'center',
      gap: 12,
    },

    movieErrorContent: {
      flex: 1,
    },

    movieErrorText: {
      fontSize: 13,
      lineHeight: 20,
      marginBottom: 10,
    },

    retryButton: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 10,
    },

    retryButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
    },

    moviesList: {
      gap: 12,
    },

    movieCard: {
      borderWidth: 1,
      borderRadius: 20,
      padding: 14,
      alignItems:
        'flex-start',
    },

    movieNumber: {
      width: 34,
      height: 34,
      borderRadius: 12,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    movieNumberText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '800',
    },

    movieContent: {
      flex: 1,
      minWidth: 0,
    },

    movieNameRow: {
      alignItems:
        'flex-start',
      justifyContent:
        'space-between',
      gap: 8,
    },

    movieName: {
      flex: 1,
      fontSize: 16,
      fontWeight: '800',
      lineHeight: 21,
    },

    matchBadge: {
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 9,
    },

    matchText: {
      fontSize: 11,
      fontWeight: '800',
    },

    genreRow: {
      flexWrap:
        'wrap',
      gap: 6,
      marginTop: 9,
    },

    genreChip: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },

    genreText: {
      fontSize: 10,
      fontWeight: '600',
    },

    matchedTagsContainer: {
      marginTop: 9,
      width: '100%',
    },

    matchedTagsLabel: {
      fontSize: 10,
      fontWeight: '600',
      marginBottom: 4,
    },

    tagChip: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },

    tagText: {
      fontSize: 10,
      fontWeight: '700',
    },

    movieOverview: {
      fontSize: 12,
      lineHeight: 19,
      marginTop: 10,
    },

    movieMeta: {
      justifyContent:
        'space-between',
      marginTop: 11,
      gap: 8,
    },

    movieMetaText: {
      fontSize: 10,
      fontWeight: '600',
    },

    /* ==========================================================
       EXPORT
       ========================================================== */

    exportButton: {
      minHeight: 54,
      borderRadius: 17,
      borderWidth: 1,
      paddingHorizontal: 18,
      justifyContent:
        'center',
      alignItems:
        'center',
      gap: 10,
      marginBottom: 24,
    },

    exportButtonText: {
      fontSize: 14,
      fontWeight: '700',
    },

    /* ==========================================================
       HISTORY
       ========================================================== */

    sectionHeader: {
      justifyContent:
        'space-between',
      alignItems:
        'center',
      marginBottom: 12,
    },

    sectionTitle: {
      fontSize: 19,
      fontWeight: '800',
    },

    resultCard: {
      borderWidth: 1,
      borderRadius:
        BorderRadius?.xl ||
        24,
      padding: 16,
      marginBottom: 12,
    },

    resultHeader: {
      alignItems:
        'center',
    },

    gameIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      justifyContent:
        'center',
      alignItems:
        'center',
    },

    resultHeaderText: {
      flex: 1,
      marginHorizontal: 12,
    },

    gameName: {
      fontSize: 15,
      fontWeight: '800',
    },

    resultDate: {
      fontSize: 11,
      marginTop: 3,
    },

    scoreContainer: {
      minWidth: 58,
      paddingVertical: 8,
      paddingHorizontal: 9,
      borderRadius: 13,
      alignItems:
        'center',
    },

    scoreValue: {
      fontSize: 18,
      fontWeight: '800',
    },

    scoreLabel: {
      fontSize: 9,
      marginTop: 1,
    },

    performanceLabel: {
      fontSize: 11,
      marginTop: 10,
      fontWeight: '600',
    },

    metricsRow: {
      marginTop: 14,
      gap: 16,
    },

    metricItem: {
      flex: 1,
    },

    metricLabel: {
      fontSize: 10,
      marginBottom: 4,
    },

    metricValue: {
      fontSize: 15,
      fontWeight: '800',
    },

    detailsContainer: {
      marginTop: 14,
    },

    detailRow: {
      minHeight: 40,
      borderTopWidth: 1,
      alignItems:
        'center',
      justifyContent:
        'space-between',
      gap: 12,
    },

    detailLabel: {
      flex: 1,
      fontSize: 11,
    },

    detailValue: {
      fontSize: 12,
      fontWeight: '700',
    },

    bottomSpacer: {
      height: 20,
    },
  });