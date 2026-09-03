import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import {
  ArrowLeft,
  Target,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';

import Svg, {
  Circle as SvgCircle,
  Rect as SvgRect,
  Polygon as SvgPolygon,
} from 'react-native-svg';

import { saveGameResult } from './gameResults';

/* ================================================================
   SHAPE VISUAL
   Renders the shape currently in play (circle / square /
   triangle / rectangle) inside a `size` x `size` bounding box,
   so the size-comparison logic stays exactly the same regardless
   of which shape is shown.
================================================================ */

const ShapeVisual = ({
  shape,
  size,
  color,
  opacity,
}: {
  shape: ShapeType;
  size: number;
  color: string;
  opacity: number;
}) => {
  if (shape === 'circle') {
    return (
      <Svg
        width={size}
        height={size}
        style={{ opacity }}
      >
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={size / 2}
          fill={color}
        />
      </Svg>
    );
  }

  if (shape === 'square') {
    return (
      <Svg
        width={size}
        height={size}
        style={{ opacity }}
      >
        <SvgRect
          x={0}
          y={0}
          width={size}
          height={size}
          rx={size * 0.14}
          fill={color}
        />
      </Svg>
    );
  }

  if (shape === 'rectangle') {
    const height = size * 0.62;

    return (
      <Svg
        width={size}
        height={size}
        style={{ opacity }}
      >
        <SvgRect
          x={0}
          y={(size - height) / 2}
          width={size}
          height={height}
          rx={size * 0.1}
          fill={color}
        />
      </Svg>
    );
  }

  /* triangle */
  const points = `${size / 2},0 ${size},${size} 0,${size}`;

  return (
    <Svg
      width={size}
      height={size}
      style={{ opacity }}
    >
      <SvgPolygon
        points={points}
        fill={color}
      />
    </Svg>
  );
};

/* ================================================================
   TYPES
================================================================ */

type Side = 'left' | 'right';

type ShapeType =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'rectangle';

const SHAPE_TYPES: ShapeType[] = [
  'circle',
  'square',
  'triangle',
  'rectangle',
];

const pickRandomShape = (): ShapeType =>
  SHAPE_TYPES[
    Math.floor(
      Math.random() *
        SHAPE_TYPES.length
    )
  ];

type Phase =
  | 'intro'
  | 'playing'
  | 'result';

type TrialResult = {
  correct: boolean;
  rt: number;
  difference: number;
};

type DifficultyConfig = {
  level: number;

  nameFa: string;

  nameEn: string;

  minDifference: number;

  maxDifference: number;

  timeLimit: number;

  baseSize: number;

  circleCount: number;
};

/* ================================================================
   CONSTANTS
================================================================ */

const TOTAL_TRIALS = 20;

const MIN_LEVEL = 1;

const MAX_LEVEL = 5;

const INITIAL_LEVEL = 1;

const STORAGE_KEY =
  'neurolia_size_discrimination_adaptive_v2';

/*
 * Difficulty progression:
 *
 * Level 1:
 *   Easy, but slightly harder than the previous version.
 *
 * Level 2:
 *   Smaller size difference.
 *
 * Level 3:
 *   Fine discrimination.
 *
 * Level 4:
 *   Three circles + small size difference.
 *
 * Level 5:
 *   Four circles + very small size difference.
 *
 * The final two levels intentionally contain more
 * visual distractors so the user cannot simply compare
 * two isolated circles.
 */
const CONFIGS: DifficultyConfig[] = [
  {
    level: 1,

    nameFa: 'آسان',

    nameEn: 'Easy',

    minDifference: 0.21,

    maxDifference: 0.34,

    timeLimit: 6800,

    baseSize: 78,

    circleCount: 2,
  },

  {
    level: 2,

    nameFa: 'متوسط',

    nameEn: 'Medium',

    minDifference: 0.15,

    maxDifference: 0.24,

    timeLimit: 6200,

    baseSize: 78,

    circleCount: 2,
  },

  {
    level: 3,

    nameFa: 'دقیق',

    nameEn: 'Precise',

    minDifference: 0.095,

    maxDifference: 0.16,

    timeLimit: 5700,

    baseSize: 78,

    circleCount: 2,
  },

  {
    level: 4,

    nameFa: 'سخت',

    nameEn: 'Hard',

    minDifference: 0.055,

    maxDifference: 0.105,

    timeLimit: 5200,

    baseSize: 74,

    circleCount: 3,
  },

  {
    level: 5,

    nameFa: 'حرفه‌ای',

    nameEn: 'Expert',

    minDifference: 0.028,

    maxDifference: 0.065,

    timeLimit: 4700,

    baseSize: 72,

    circleCount: 4,
  },
];

/* ================================================================
   HELPERS
================================================================ */

const randomBetween = (
  min: number,
  max: number
) =>
  Math.random() *
    (max - min) +
  min;

const getConfig = (
  level: number
) =>
  CONFIGS[
    Math.max(
      0,
      Math.min(
        CONFIGS.length - 1,
        level - 1
      )
    )
  ];

/*
 * Creates a set of visually similar circle sizes.
 *
 * The first value is the largest target.
 * Other circles are deliberately kept close to it
 * on the final two levels.
 */
const generateCircleSizes = (
  config: DifficultyConfig,
  difference: number
) => {
  const base =
    config.baseSize;

  const largest =
    base *
    (1 + difference);

  const sizes: number[] = [
    largest,
  ];

  /*
   * Distractor circles are always smaller than
   * the target, but increasingly close to it
   * at higher difficulty levels.
   */
  for (
    let i = 1;
    i < config.circleCount;
    i += 1
  ) {
    const closeness =
      config.level >= 5
        ? randomBetween(
            0.60,
            0.94
          )
        : config.level >= 4
          ? randomBetween(
              0.48,
              0.88
            )
          : randomBetween(
              0.20,
              0.70
            );

    const distractorDifference =
      difference *
      closeness;

    const distractor =
      base *
      (1 + distractorDifference);

    sizes.push(
      distractor
    );
  }

  /*
   * Shuffle the circles so that the largest
   * circle is not always in the first position.
   */
  for (
    let i =
      sizes.length - 1;
    i > 0;
    i -= 1
  ) {
    const j =
      Math.floor(
        Math.random() *
          (i + 1)
      );

    [
      sizes[i],
      sizes[j],
    ] = [
      sizes[j],
      sizes[i],
    ];
  }

  return sizes;
};

/* ================================================================
   SCREEN
================================================================ */

export default function SizeDiscriminationScreen() {
  const router = useRouter();

  const { colors } =
    useTheme();

  const { language, isRTL } =
    useLanguage();

  /* ================================================================
     TEXT
  ================================================================= */

  const text = useMemo(
    () =>
      language === 'fa'
        ? {
            title: 'حدس اندازه',

            subtitle:
              'تفاوت ظریف اندازه‌ها را تشخیص بده',

            instruction:
              'کدام شکل بزرگ‌تر است؟',

            left:
              'سمت چپ',

            right:
              'سمت راست',

            start:
              'شروع بازی',

            back:
              'بازگشت',

            score:
              'امتیاز',

            question:
              'مرحله',

            time:
              'زمان',

            correct:
              'درست',

            wrong:
              'اشتباه',

            accuracy:
              'دقت',

            averageTime:
              'میانگین زمان',

            milliseconds:
              'میلی‌ثانیه',

            completed:
              'بازی تمام شد',

            excellent:
              'عملکرد عالی',

            good:
              'عملکرد خوب',

            improve:
              'ادامه بده تا بهتر شوی',

            adaptive:
              'سختی تطبیقی',

            adaptiveDescription:
              'سطح بازی بر اساس عملکرد واقعی شما به‌صورت خودکار تغییر می‌کند.',

            currentLevel:
              'سطح بازی',

            nextLevel:
              'سطح بعدی',

            playAgain:
              'بازی مجدد',

            difference:
              'اختلاف اندازه',

            noSelection:
              'سطح بازی توسط شما انتخاب نمی‌شود',

            levelUp:
              'دقت شما بالا بود؛ مرحله بعد دشوارتر خواهد شد.',

            levelDown:
              'این مرحله دشوار بود؛ مرحله بعد کمی آسان‌تر خواهد شد.',

            levelSame:
              'سطح فعلی برای عملکرد شما مناسب است.',

            timeout:
              'زمان تمام شد',

            correctAnswer:
              'پاسخ درست',

            choose:
              'یکی را انتخاب کن',

            performance:
              'عملکرد',

            startDescription:
              'در هر مرحله یک شکل تصادفی (دایره، مربع، مثلث یا مستطیل) با اندازه‌های نزدیک به هم نمایش داده می‌شود. شکل بزرگ‌تر را سریع و دقیق انتخاب کن.',
          }
        : {
            title: 'Size Guess',

            subtitle:
              'Detect subtle differences in size',

            instruction:
              'Which shape is bigger?',

            left:
              'Left',

            right:
              'Right',

            start:
              'Start Game',

            back:
              'Back',

            score:
              'Score',

            question:
              'Round',

            time:
              'Time',

            correct:
              'Correct',

            wrong:
              'Wrong',

            accuracy:
              'Accuracy',

            averageTime:
              'Average Time',

            milliseconds:
              'ms',

            completed:
              'Game Complete',

            excellent:
              'Excellent Performance',

            good:
              'Good Performance',

            improve:
              'Keep practicing to improve',

            adaptive:
              'Adaptive Difficulty',

            adaptiveDescription:
              'Game difficulty automatically changes based on your actual performance.',

            currentLevel:
              'Game Level',

            nextLevel:
              'Next Level',

            playAgain:
              'Play Again',

            difference:
              'Size Difference',

            noSelection:
              'You do not select the game level',

            levelUp:
              'Your accuracy was high. The next session will be harder.',

            levelDown:
              'This session was challenging. The next session will be easier.',

            levelSame:
              'The current difficulty is appropriate for your performance.',

            timeout:
              'Time is up',

            correctAnswer:
              'Correct Answer',

            choose:
              'Choose one',

            performance:
              'Performance',

            startDescription:
              'Each round shows a random shape (circle, square, triangle, or rectangle) with similar sizes. Choose the bigger one as quickly and accurately as possible.',
          },
    [language]
  );

  /* ================================================================
     STATE
  ================================================================= */

  const [
    phase,
    setPhase,
  ] = useState<Phase>('intro');

  const [
    level,
    setLevel,
  ] = useState(INITIAL_LEVEL);

  const [
    previousAccuracy,
    setPreviousAccuracy,
  ] = useState<
    number | null
  >(null);

  const [
    trialIndex,
    setTrialIndex,
  ] = useState(0);

  const [
    score,
    setScore,
  ] = useState(0);

  const [
    responses,
    setResponses,
  ] = useState<TrialResult[]>(
    []
  );

  /*
   * Instead of only two values, the game now
   * supports 2 / 3 / 4 circles depending on level.
   */
  const [
    circleSizes,
    setCircleSizes,
  ] = useState<number[]>([
    90,
    70,
  ]);

  const [
    currentShape,
    setCurrentShape,
  ] = useState<ShapeType>('circle');

  const [
    correctIndex,
    setCorrectIndex,
  ] = useState(0);

  const [
    ready,
    setReady,
  ] = useState(false);

  const [
    feedback,
    setFeedback,
  ] = useState<
    'idle' |
    'correct' |
    'wrong' |
    'timeout'
  >('idle');

  const [
    lastResponseTime,
    setLastResponseTime,
  ] = useState<
    number | null
  >(null);

  const [
    adaptiveResult,
    setAdaptiveResult,
  ] = useState<
    'up' |
    'down' |
    'same' |
    null
  >(null);

  /* ================================================================
     REFS
  ================================================================= */

  const mounted =
    useRef(true);

  const answered =
    useRef(false);

  const startTime =
    useRef(0);

  const timerRef =
    useRef<
      ReturnType<typeof setTimeout> | null
    >(null);

  const nextTrialTimer =
    useRef<
      ReturnType<typeof setTimeout> | null
    >(null);

  const currentDifference =
    useRef(0);

  const pulse =
    useRef(
      new Animated.Value(0)
    ).current;

  const timerAnimation =
    useRef(
      new Animated.Value(1)
    ).current;

  /* ================================================================
     CONFIG
  ================================================================= */

  const config =
    getConfig(level);

  const levelName =
    language === 'fa'
      ? config.nameFa
      : config.nameEn;

  /* ================================================================
     CLEANUP
  ================================================================= */

  const clearTimers =
    useCallback(() => {
      if (
        timerRef.current
      ) {
        clearTimeout(
          timerRef.current
        );

        timerRef.current =
          null;
      }

      if (
        nextTrialTimer.current
      ) {
        clearTimeout(
          nextTrialTimer.current
        );

        nextTrialTimer.current =
          null;
      }
    }, []);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;

      clearTimers();
    };
  }, [clearTimers]);

  /* ================================================================
     LOAD ADAPTIVE STATE
  ================================================================= */

  useEffect(() => {
    const load =
      async () => {
        try {
          const stored =
            await AsyncStorage.getItem(
              STORAGE_KEY
            );

          if (!stored) {
            return;
          }

          const parsed =
            JSON.parse(stored);

          if (
            typeof parsed.level ===
            'number'
          ) {
            setLevel(
              Math.max(
                MIN_LEVEL,
                Math.min(
                  MAX_LEVEL,
                  parsed.level
                )
              )
            );
          }

          if (
            typeof parsed.accuracy ===
            'number'
          ) {
            setPreviousAccuracy(
              parsed.accuracy
            );
          }
        } catch (error) {
          console.log(
            '[SizeDiscrimination] load error',
            error
          );
        }
      };

    load();
  }, []);

  /* ================================================================
     SAVE ADAPTIVE STATE
  ================================================================= */

  const saveAdaptiveState =
    useCallback(
      async (
        nextLevel: number,
        accuracy: number
      ) => {
        try {
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              level:
                nextLevel,

              accuracy,

              updatedAt:
                Date.now(),
            })
          );
        } catch (error) {
          console.log(
            '[SizeDiscrimination] save error',
            error
          );
        }
      },
      []
    );

  /* ================================================================
     GENERATE TRIAL
  ================================================================= */

  const generateTrial =
    useCallback(() => {
      answered.current = false;

      setReady(true);

      setFeedback('idle');

      setLastResponseTime(
        null
      );

      /*
       * Randomize the difference inside the
       * current difficulty range.
       */
      const difference =
        randomBetween(
          config.minDifference,
          config.maxDifference
        );

      const sizes =
        generateCircleSizes(
          config,
          difference
        );

      /*
       * Each trial shows a freshly-picked random
       * shape (circle / square / triangle /
       * rectangle) so the player can't rely on
       * memorized shape outlines.
       */
      setCurrentShape(
        pickRandomShape()
      );

      /*
       * Find the largest circle after
       * randomization.
       */
      let largestIndex = 0;

      for (
        let i = 1;
        i < sizes.length;
        i += 1
      ) {
        if (
          sizes[i] >
          sizes[largestIndex]
        ) {
          largestIndex = i;
        }
      }

      setCircleSizes(
        sizes
      );

      setCorrectIndex(
        largestIndex
      );

      currentDifference.current =
        difference;

      pulse.setValue(0);

      Animated.spring(
        pulse,
        {
          toValue: 1,

          friction: 7,

          tension: 65,

          useNativeDriver: true,
        }
      ).start();

      timerAnimation.setValue(
        1
      );

      Animated.timing(
        timerAnimation,
        {
          toValue: 0,

          duration:
            config.timeLimit,

          useNativeDriver: false,
        }
      ).start();

      startTime.current =
        Date.now();

      clearTimers();

      timerRef.current =
        setTimeout(() => {
          if (
            !answered.current &&
            mounted.current
          ) {
            handleTimeout();
          }
        }, config.timeLimit);
    }, [
      clearTimers,
      config,
      pulse,
      timerAnimation,
    ]);

  /* ================================================================
     START
  ================================================================= */

  const startGame =
    useCallback(() => {
      clearTimers();

      setPhase('playing');

      setTrialIndex(0);

      setScore(0);

      setResponses([]);

      setFeedback('idle');

      setLastResponseTime(
        null
      );

      setAdaptiveResult(
        null
      );

      nextTrialTimer.current =
        setTimeout(() => {
          generateTrial();
        }, 300);
    }, [
      clearTimers,
      generateTrial,
    ]);

  /* ================================================================
     FINISH
  ================================================================= */

  const finishGame =
    useCallback(
      async (
        results: TrialResult[]
      ) => {
        clearTimers();

        setReady(false);

        const total =
          results.length;

        const correct =
          results.filter(
            item =>
              item.correct
          ).length;

        const accuracy =
          total === 0
            ? 0
            : (correct /
                total) *
              100;

        let nextLevel =
          level;

        let result:
          | 'up'
          | 'down'
          | 'same' =
          'same';

        if (
          accuracy >= 85 &&
          level < MAX_LEVEL
        ) {
          nextLevel =
            level + 1;

          result = 'up';
        } else if (
          accuracy < 50 &&
          level > MIN_LEVEL
        ) {
          nextLevel =
            level - 1;

          result = 'down';
        }

        setLevel(
          nextLevel
        );

        setPreviousAccuracy(
          Math.round(
            accuracy
          )
        );

        setAdaptiveResult(
          result
        );

        await saveAdaptiveState(
          nextLevel,
          Math.round(
            accuracy
          )
        );

        const avgRt =
          total === 0
            ? 0
            : Math.round(
                results.reduce(
                  (sum, item) =>
                    sum + item.rt,
                  0
                ) / total
              );

        await saveGameResult({
          gameId: 'size-discrimination',
          gameName:
            language === 'fa'
              ? 'تمایز اندازه'
              : 'Size Discrimination',
          timestamp: Date.now(),
          score: Math.round(accuracy),

          metrics: [
            {
              id: 'size_discrimination_accuracy',
              label:
                language === 'fa'
                  ? 'دقت'
                  : 'Accuracy',
              value: Math.round(accuracy),
              unit: '%',
            },
            {
              id: 'size_discrimination_reaction_time',
              label:
                language === 'fa'
                  ? 'زمان پاسخ'
                  : 'Reaction Time',
              value: avgRt,
              unit: 'ms',
            },
          ],
        });

        setPhase('result');
      },
      [
        clearTimers,
        level,
        saveAdaptiveState,
        language,
      ]
    );

  /* ================================================================
     NEXT TRIAL
  ================================================================= */

  const nextTrial =
    useCallback(
      (
        results: TrialResult[]
      ) => {
        const next =
          trialIndex + 1;

        if (
          next >=
          TOTAL_TRIALS
        ) {
          finishGame(
            results
          );

          return;
        }

        setTrialIndex(
          next
        );

        nextTrialTimer.current =
          setTimeout(() => {
            generateTrial();
          }, 650);
      },
      [
        finishGame,
        generateTrial,
        trialIndex,
      ]
    );

  /* ================================================================
     ANSWER
  ================================================================= */

  const answer =
    useCallback(
      (index: number) => {
        if (
          !ready ||
          answered.current
        ) {
          return;
        }

        answered.current =
          true;

        setReady(false);

        if (
          timerRef.current
        ) {
          clearTimeout(
            timerRef.current
          );

          timerRef.current =
            null;
        }

        const rt =
          Date.now() -
          startTime.current;

        const isCorrect =
          index ===
          correctIndex;

        const result: TrialResult =
          {
            correct:
              isCorrect,

            rt,

            difference:
              currentDifference.current,
          };

        setLastResponseTime(
          rt
        );

        setFeedback(
          isCorrect
            ? 'correct'
            : 'wrong'
        );

        setResponses(
          previous => [
            ...previous,
            result,
          ]
        );

        if (isCorrect) {
          const speedBonus =
            Math.max(
              0,
              Math.round(
                ((config.timeLimit -
                  rt) /
                  config.timeLimit) *
                  10
              )
            );

          /*
           * Harder levels reward slightly more
           * for correct responses because the
           * discrimination task is more difficult.
           */
          const difficultyBonus =
            Math.max(
              0,
              (config.level - 1) *
                2
            );

          const points =
            10 +
            speedBonus +
            difficultyBonus;

          setScore(
            previous =>
              previous +
              points
          );
        }

        const currentResults =
          [
            ...responses,
            result,
          ];

        nextTrial(
          currentResults
        );
      },
      [
        config,
        correctIndex,
        nextTrial,
        ready,
        responses,
      ]
    );

  /* ================================================================
     TIMEOUT
  ================================================================= */

  const handleTimeout =
    useCallback(() => {
      if (
        answered.current
      ) {
        return;
      }

      answered.current =
        true;

      setReady(false);

      const result: TrialResult =
        {
          correct: false,

          rt: 0,

          difference:
            currentDifference.current,
        };

      setFeedback(
        'timeout'
      );

      setResponses(
        previous => [
          ...previous,
          result,
        ]
      );

      const currentResults =
        [
          ...responses,
          result,
        ];

      nextTrial(
        currentResults
      );
    }, [
      nextTrial,
      responses,
    ]);

  /* ================================================================
     BACK
  ================================================================= */

  const handleBack =
    useCallback(() => {
      clearTimers();

      if (
        router.canGoBack()
      ) {
        router.back();
      } else {
        router.replace('/');
      }
    }, [
      clearTimers,
      router,
    ]);

  /* ================================================================
     RESULTS
  ================================================================= */

  const correctCount =
    responses.filter(
      item =>
        item.correct
    ).length;

  const wrongCount =
    responses.length -
    correctCount;

  const accuracy =
    responses.length
      ? Math.round(
          (correctCount /
            responses.length) *
            100
        )
      : 0;

  const validTimes =
    responses
      .filter(
        item =>
          item.correct &&
          item.rt > 0
      )
      .map(
        item =>
          item.rt
      );

  const averageTime =
    validTimes.length
      ? Math.round(
          validTimes.reduce(
            (
              sum,
              value
            ) =>
              sum + value,
            0
          ) /
            validTimes.length
        )
      : 0;

  const resultTitle =
    accuracy >= 85
      ? text.excellent
      : accuracy >= 60
        ? text.good
        : text.improve;

  const nextConfig =
    getConfig(level);

  const nextLevelName =
    language === 'fa'
      ? nextConfig.nameFa
      : nextConfig.nameEn;

  /* ================================================================
     INTRO SCREEN
  ================================================================= */

  if (
    phase === 'intro'
  ) {
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
            styles.header,
            {
              borderBottomColor:
                colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={
              handleBack
            }
            activeOpacity={
              0.75
            }
            style={[
              styles.backButton,
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
              color={
                colors.text
              }
              strokeWidth={
                2.5
              }
            />
          </TouchableOpacity>

          <View
            style={
              styles.headerText
            }
          >
            <Text
              style={[
                styles.headerTitle,
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
              {text.title}
            </Text>

            <Text
              style={[
                styles.headerSubtitle,
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
                text.subtitle
              }
            </Text>
          </View>
        </View>

        <ScrollView
          style={
            styles.scroll
          }
          contentContainerStyle={
            styles.introContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={[
              styles.heroIcon,
              {
                backgroundColor:
                  colors.primary +
                  '15',
              },
            ]}
          >
            <Target
              size={44}
              color={
                colors.primary
              }
            />
          </View>

          <Text
            style={[
              styles.heroTitle,
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
              styles.heroDescription,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {
              text.startDescription
            }
          </Text>

          {/* Preview */}

          <View
            style={[
              styles.previewCard,
              {
                backgroundColor:
                  colors.surface,

                borderColor:
                  colors.border,
              },
            ]}
          >
            <View
              style={
                styles.previewArea
              }
            >
              {Array.from(
                {
                  length:
                    Math.min(
                      config.circleCount,
                      4
                    ),
                }
              ).map(
                (
                  _,
                  index
                ) => {
                  const previewSizes =
                    [
                      76,
                      62,
                      53,
                      47,
                    ];

                  return (
                    <View
                      key={
                        `preview-${index}`
                      }
                      style={[
                        styles.previewCircle,
                        {
                          width:
                            previewSizes[
                              index
                            ],

                          height:
                            previewSizes[
                              index
                            ],

                          backgroundColor:
                            colors.primary,

                          opacity:
                            1 -
                            index *
                              0.12,
                        },
                      ]}
                    />
                  );
                }
              )}
            </View>

            <Text
              style={[
                styles.previewText,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {
                text.instruction
              }
            </Text>
          </View>

          {/* Adaptive */}

          <View
            style={[
              styles.adaptiveCard,
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
                styles.adaptiveIcon,
                {
                  backgroundColor:
                    colors.primary +
                    '15',
                },
              ]}
            >
              <Sparkles
                size={23}
                color={
                  colors.primary
                }
              />
            </View>

            <View
              style={
                styles.adaptiveText
              }
            >
              <Text
                style={[
                  styles.adaptiveTitle,
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
                  text.adaptive
                }
              </Text>

              <Text
                style={[
                  styles.adaptiveDescription,
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
                  text.adaptiveDescription
                }
              </Text>
            </View>
          </View>

          {/* Current Level */}

          <View
            style={[
              styles.levelCard,
              {
                backgroundColor:
                  colors.primary +
                  '0D',

                borderColor:
                  colors.primary +
                  '25',
              },
            ]}
          >
            <View>
              <Text
                style={[
                  styles.levelLabel,
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
                  text.currentLevel
                }
              </Text>

              <Text
                style={[
                  styles.levelValue,
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
                {levelName}
              </Text>
            </View>

            <TrendingUp
              size={25}
              color={
                colors.primary
              }
            />
          </View>

          {previousAccuracy !==
            null && (
            <View
              style={[
                styles.previousCard,
                {
                  backgroundColor:
                    colors.surface,

                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Trophy
                size={23}
                color={
                  colors.primary
                }
              />

              <View
                style={
                  styles.previousText
                }
              >
                <Text
                  style={[
                    styles.previousLabel,
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
                    text.accuracy
                  }
                </Text>

                <Text
                  style={[
                    styles.previousValue,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {
                    previousAccuracy
                  }
                  %
                </Text>
              </View>
            </View>
          )}

          <Text
            style={[
              styles.noSelection,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {
              text.noSelection
            }
          </Text>

          <TouchableOpacity
            activeOpacity={
              0.85
            }
            onPress={
              startGame
            }
            style={[
              styles.primaryButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            <Zap
              size={20}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.primaryButtonText
              }
            >
              {text.start}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  /* ================================================================
     RESULT SCREEN
  ================================================================= */

  if (
    phase === 'result'
  ) {
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
            styles.header,
            {
              borderBottomColor:
                colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={
              handleBack
            }
            activeOpacity={
              0.75
            }
            style={[
              styles.backButton,
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
              color={
                colors.text
              }
              strokeWidth={
                2.5
              }
            />
          </TouchableOpacity>

          <View
            style={
              styles.headerText
            }
          >
            <Text
              style={[
                styles.headerTitle,
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
                text.completed
              }
            </Text>

            <Text
              style={[
                styles.headerSubtitle,
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
              {text.title}
            </Text>
          </View>
        </View>

        <ScrollView
          style={
            styles.scroll
          }
          contentContainerStyle={
            styles.resultContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={[
              styles.resultIcon,
              {
                backgroundColor:
                  colors.primary +
                  '15',
              },
            ]}
          >
            <Trophy
              size={48}
              color={
                colors.primary
              }
            />
          </View>

          <Text
            style={[
              styles.resultTitle,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {resultTitle}
          </Text>

          <Text
            style={[
              styles.resultSubtitle,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {
              text.completed
            }
          </Text>

          {/* SCORE */}

          <View
            style={[
              styles.scoreCard,
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
                styles.scoreValue,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              {score}
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
              {text.score}
            </Text>
          </View>

          {/* STATS */}

          <View
            style={
              styles.statsRow
            }
          >
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor:
                    colors.surface,

                  borderColor:
                    colors.border,
                },
              ]}
            >
              <CheckCircle
                size={23}
                color={
                  colors.primary
                }
              />

              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {
                  correctCount
                }
              </Text>

              <Text
                style={[
                  styles.statLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {
                  text.correct
                }
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor:
                    colors.surface,

                  borderColor:
                    colors.border,
                },
              ]}
            >
              <XCircle
                size={23}
                color="#EF4444"
              />

              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {
                  wrongCount
                }
              </Text>

              <Text
                style={[
                  styles.statLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {
                  text.wrong
                }
              </Text>
            </View>
          </View>

          {/* ACCURACY */}

          <View
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
            <Target
              size={23}
              color={
                colors.primary
              }
            />

            <View
              style={
                styles.metricText
              }
            >
              <Text
                style={[
                  styles.metricLabel,
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
                {accuracy}%
              </Text>
            </View>
          </View>

          {/* RESPONSE TIME */}

          <View
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
            <Clock
              size={23}
              color={
                colors.primary
              }
            />

            <View
              style={
                styles.metricText
              }
            >
              <Text
                style={[
                  styles.metricLabel,
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
                  text.averageTime
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
                {averageTime}{' '}
                {
                  text.milliseconds
                }
              </Text>
            </View>
          </View>

          {/* ADAPTIVE */}

          <View
            style={[
              styles.adaptiveResult,
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
                styles.adaptiveResultIcon,
                {
                  backgroundColor:
                    colors.primary +
                    '15',
                },
              ]}
            >
              <Sparkles
                size={22}
                color={
                  colors.primary
                }
              />
            </View>

            <View
              style={
                styles.adaptiveResultText
              }
            >
              <Text
                style={[
                  styles.adaptiveResultTitle,
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
                  text.adaptive
                }
              </Text>

              <Text
                style={[
                  styles.adaptiveResultDescription,
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
                {adaptiveResult ===
                'up'
                  ? text.levelUp
                  : adaptiveResult ===
                      'down'
                    ? text.levelDown
                    : text.levelSame}
              </Text>
            </View>
          </View>

          {/* NEXT LEVEL */}

          <View
            style={[
              styles.nextLevel,
              {
                backgroundColor:
                  colors.primary +
                  '0D',

                borderColor:
                  colors.primary +
                  '25',
              },
            ]}
          >
            <View>
              <Text
                style={[
                  styles.nextLevelLabel,
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
                  text.nextLevel
                }
              </Text>

              <Text
                style={[
                  styles.nextLevelValue,
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
                  nextLevelName
                }
              </Text>
            </View>

            <TrendingUp
              size={25}
              color={
                colors.primary
              }
            />
          </View>

          <TouchableOpacity
            activeOpacity={
              0.85
            }
            onPress={
              startGame
            }
            style={[
              styles.primaryButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            <RotateCcw
              size={20}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.primaryButtonText
              }
            >
              {
                text.playAgain
              }
            </Text>
          </TouchableOpacity>

          <View
            style={
              styles.bottomSpace
            }
          />
        </ScrollView>
      </View>
    );
  }

  /* ================================================================
     GAME SCREEN
  ================================================================= */

  /*
   * We now render a dynamic number of circles.
   *
   * Level 1-3 -> 2 circles
   * Level 4   -> 3 circles
   * Level 5   -> 4 circles
   */

  const renderedCircleSizes =
    circleSizes.map(
      size =>
        Math.min(
          size,
          132
        )
    );

  const maxCircleSize =
    Math.max(
      ...renderedCircleSizes,
      72
    );

  const choiceAreaWidth =
    config.circleCount >= 4
      ? Math.max(
          78,
          Math.min(
            110,
            maxCircleSize +
              22
          )
        )
      : Math.max(
          maxCircleSize +
            50,
          130
        );

  const choiceAreaHeight =
    config.circleCount >= 4
      ? 170
      : 190;

  const timerWidth =
    timerAnimation.interpolate(
      {
        inputRange: [
          0,
          1,
        ],

        outputRange: [
          '0%',
          '100%',
        ],
      }
    );

  return (
    <View
      style={[
        styles.gameContainer,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      {/* HEADER */}

      <View
        style={[
          styles.header,
          {
            borderBottomColor:
              colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={
            handleBack
          }
          activeOpacity={
            0.75
          }
          style={[
            styles.backButton,
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
            color={
              colors.text
            }
            strokeWidth={
              2.5
            }
          />
        </TouchableOpacity>

        <View
          style={
            styles.headerText
          }
        >
          <Text
            style={[
              styles.headerTitle,
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
            {text.title}
          </Text>

          <Text
            style={[
              styles.headerSubtitle,
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
            {levelName}
          </Text>
        </View>
      </View>

      {/* HUD */}

      <View
        style={[
          styles.gameHud,
          {
            backgroundColor:
              colors.surface,

            borderColor:
              colors.border,
          },
        ]}
      >
        <View
          style={
            styles.hudItem
          }
        >
          <Zap
            size={18}
            color={
              colors.primary
            }
          />

          <View>
            <Text
              style={[
                styles.hudLabel,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {text.score}
            </Text>

            <Text
              style={[
                styles.hudValue,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {score}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.progressContainer
          }
        >
          <Text
            style={[
              styles.progressText,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {text.question}{' '}
            {trialIndex + 1}/
            {TOTAL_TRIALS}
          </Text>
        </View>

        <View
          style={
            styles.hudItem
          }
        >
          <Clock
            size={18}
            color={
              colors.primary
            }
          />

          <Text
            style={[
              styles.levelHud,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {level}
          </Text>
        </View>
      </View>

      {/* INSTRUCTION */}

      <View
        style={[
          styles.instructionCard,
          {
            backgroundColor:
              colors.surface,

            borderColor:
              colors.border,
          },
        ]}
      >
        <Target
          size={20}
          color={
            colors.primary
          }
        />

        <Text
          style={[
            styles.instructionText,
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
            text.instruction
          }
        </Text>
      </View>

      {/* TIMER */}

      <View
        style={[
          styles.timerTrack,
          {
            backgroundColor:
              colors.border,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.timerProgress,
            {
              width:
                timerWidth,

              backgroundColor:
                colors.primary,
            },
          ]}
        />
      </View>

      {/* PLAY AREA */}

      <View
        style={
          styles.playAreaWrapper
        }
      >
        <Animated.View
          style={[
            styles.circleRow,
            {
              flexWrap:
                config.circleCount >=
                4
                  ? 'wrap'
                  : 'nowrap',

              maxWidth:
                config.circleCount >=
                4
                  ? 370
                  : '100%',

              transform: [
                {
                  scale:
                    pulse.interpolate(
                      {
                        inputRange: [
                          0,
                          1,
                        ],

                        outputRange: [
                          0.88,
                          1,
                        ],
                      }
                    ),
                },
              ],
            },
          ]}
        >
          {renderedCircleSizes.map(
            (
              size,
              index
            ) => {
              const isCorrect =
                index ===
                correctIndex;

              return (
                <TouchableOpacity
                  key={
                    `circle-${index}-${trialIndex}`
                  }
                  activeOpacity={
                    0.78
                  }
                  disabled={
                    !ready
                  }
                  onPress={() =>
                    answer(
                      index
                    )
                  }
                  style={[
                    styles.choiceArea,
                    {
                      width:
                        choiceAreaWidth,

                      height:
                        choiceAreaHeight,

                      marginHorizontal:
                        config.circleCount >=
                        4
                          ? 4
                          : 0,

                      marginVertical:
                        config.circleCount >=
                        4
                          ? 2
                          : 0,
                    },
                  ]}
                >
                  <View
                    style={{
                      width: size,
                      height: size,
                      alignItems:
                        'center',
                      justifyContent:
                        'center',
                    }}
                  >
                    <ShapeVisual
                      shape={
                        currentShape
                      }
                      size={size}
                      color={
                        colors.primary
                      }
                      opacity={
                        feedback ===
                          'wrong' &&
                        !ready &&
                        isCorrect
                          ? 0.95
                          : 1
                      }
                    />
                  </View>

                  {config.circleCount <=
                    2 && (
                    <Text
                      style={[
                        styles.choiceLabel,
                        {
                          color:
                            colors.textSecondary,
                        },
                      ]}
                    >
                      {index ===
                      0
                        ? text.left
                        : text.right}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            }
          )}
        </Animated.View>
      </View>

      {/* FEEDBACK */}

      <View
        style={
          styles.feedbackContainer
        }
      >
        {feedback !==
          'idle' && (
          <View
            style={[
              styles.feedbackCard,
              {
                backgroundColor:
                  feedback ===
                  'correct'
                    ? '#22C55E' +
                      '15'
                    : '#EF4444' +
                      '15',

                borderColor:
                  feedback ===
                  'correct'
                    ? '#22C55E' +
                      '35'
                    : '#EF4444' +
                      '35',
              },
            ]}
          >
            {feedback ===
            'correct' ? (
              <CheckCircle
                size={21}
                color="#22C55E"
              />
            ) : (
              <XCircle
                size={21}
                color="#EF4444"
              />
            )}

            <Text
              style={[
                styles.feedbackText,
                {
                  color:
                    feedback ===
                    'correct'
                      ? '#16A34A'
                      : '#DC2626',
                },
              ]}
            >
              {feedback ===
              'correct'
                ? text.correct
                : feedback ===
                    'timeout'
                  ? text.timeout
                  : text.wrong}
            </Text>
          </View>
        )}

        {lastResponseTime !==
          null && (
          <Text
            style={[
              styles.responseTime,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {
              lastResponseTime
            }{' '}
            {
              text.milliseconds
            }
          </Text>
        )}
      </View>

      {/* BOTTOM HINT */}

      <View
        style={
          styles.bottomHint
        }
      >
        <Text
          style={[
            styles.bottomHintText,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          {
            text.choose
          }
        </Text>
      </View>
    </View>
  );
}

/* ================================================================
   STYLES
================================================================ */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    gameContainer: {
      flex: 1,

      overflow:
        'hidden',
    },

    scroll: {
      flex: 1,
    },

    /* ============================================================
       HEADER
    ============================================================ */

    header: {
      width: '100%',

      paddingHorizontal:
        Spacing.lg,

      paddingTop: 56,

      paddingBottom: 14,

      flexDirection:
        'row',

      alignItems:
        'center',

      borderBottomWidth:
        StyleSheet.hairlineWidth,

      zIndex: 50,
    },

    backButton: {
      width: 44,

      height: 44,

      borderRadius: 22,

      borderWidth: 1,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginRight: 12,

      flexShrink: 0,
    },

    headerText: {
      flex: 1,

      minWidth: 0,
    },

    headerTitle: {
      fontSize: 21,

      fontWeight: '800',

      lineHeight: 27,
    },

    headerSubtitle: {
      fontSize: 12,

      lineHeight: 18,

      marginTop: 2,
    },

    /* ============================================================
       INTRO
    ============================================================ */

    introContent: {
      flexGrow: 1,

      paddingHorizontal:
        Spacing.lg,

      alignItems:
        'center',

      paddingTop: 28,

      paddingBottom: 45,
    },

    heroIcon: {
      width: 84,

      height: 84,

      borderRadius: 28,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginBottom: 14,
    },

    heroTitle: {
      fontSize: 27,

      fontWeight: '900',

      textAlign:
        'center',
    },

    heroDescription: {
      maxWidth: 360,

      fontSize: 14,

      lineHeight: 23,

      textAlign:
        'center',

      marginTop: 9,
    },

    previewCard: {
      width: '100%',

      marginTop: 22,

      borderWidth: 1,

      borderRadius:
        BorderRadius.lg,

      padding: 18,

      alignItems:
        'center',
    },

    previewArea: {
      height: 145,

      width: '100%',

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-evenly',

      flexWrap:
        'wrap',

      gap: 4,
    },

    previewCircle: {
      borderRadius: 100,
    },

    previewText: {
      fontSize: 12,

      lineHeight: 18,

      marginTop: 8,

      textAlign:
        'center',
    },

    adaptiveCard: {
      width: '100%',

      marginTop: 12,

      padding:
        Spacing.md,

      borderWidth: 1,

      borderRadius:
        BorderRadius.lg,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 12,
    },

    adaptiveIcon: {
      width: 44,

      height: 44,

      borderRadius: 14,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    adaptiveText: {
      flex: 1,
    },

    adaptiveTitle: {
      fontSize: 14,

      fontWeight: '800',
    },

    adaptiveDescription: {
      fontSize: 11,

      lineHeight: 18,

      marginTop: 3,
    },

    levelCard: {
      width: '100%',

      marginTop: 12,

      paddingHorizontal:
        Spacing.md,

      paddingVertical: 14,

      borderWidth: 1,

      borderRadius:
        BorderRadius.lg,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    levelLabel: {
      fontSize: 10,
    },

    levelValue: {
      fontSize: 18,

      fontWeight: '900',

      marginTop: 2,
    },

    previousCard: {
      width: '100%',

      marginTop: 12,

      padding:
        Spacing.md,

      borderWidth: 1,

      borderRadius:
        BorderRadius.lg,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 12,
    },

    previousText: {
      flex: 1,
    },

    previousLabel: {
      fontSize: 10,
    },

    previousValue: {
      fontSize: 19,

      fontWeight: '900',

      marginTop: 2,
    },

    noSelection: {
      fontSize: 10,

      textAlign:
        'center',

      marginTop: 12,
    },

    primaryButton: {
      width: '100%',

      minHeight: 54,

      marginTop: 18,

      borderRadius:
        BorderRadius.full,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 8,

      paddingHorizontal: 18,
    },

    primaryButtonText: {
      color: '#FFFFFF',

      fontSize: 16,

      fontWeight: '800',
    },

    /* ============================================================
       RESULT
    ============================================================ */

    resultContent: {
      flexGrow: 1,

      paddingHorizontal:
        Spacing.lg,

      alignItems:
        'center',

      paddingTop: 28,

      paddingBottom: 55,
    },

    resultIcon: {
      width: 82,

      height: 82,

      borderRadius: 28,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginBottom: 13,
    },

    resultTitle: {
      fontSize: 24,

      fontWeight: '900',

      textAlign:
        'center',
    },

    resultSubtitle: {
      fontSize: 12,

      marginTop: 5,

      textAlign:
        'center',
    },

    scoreCard: {
      width: '100%',

      marginTop: 18,

      borderWidth: 1,

      borderRadius:
        BorderRadius.lg,

      alignItems:
        'center',

      paddingVertical: 17,
    },

    scoreValue: {
      fontSize: 45,

      fontWeight: '900',
    },

    scoreLabel: {
      fontSize: 11,

      marginTop: -2,
    },

    statsRow: {
      width: '100%',

      flexDirection:
        'row',

      gap: 10,

      marginTop: 10,
    },

    statCard: {
      flex: 1,

      minHeight: 105,

      borderWidth: 1,

      borderRadius:
        BorderRadius.lg,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    statValue: {
      fontSize: 22,

      fontWeight: '900',

      marginTop: 5,
    },

    statLabel: {
      fontSize: 10,

      marginTop: 2,
    },

    metricCard: {
      width: '100%',

      marginTop: 10,

      minHeight: 64,

      paddingHorizontal:
        Spacing.md,

      borderWidth: 1,

      borderRadius:
        BorderRadius.lg,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 12,
    },

    metricText: {
      flex: 1,
    },

    metricLabel: {
      fontSize: 10,
    },

    metricValue: {
      fontSize: 18,

      fontWeight: '900',

      marginTop: 1,
    },

    adaptiveResult: {
      width: '100%',

      marginTop: 10,

      padding:
        Spacing.md,

      borderWidth: 1,

      borderRadius:
        BorderRadius.lg,

      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 10,
    },

    adaptiveResultIcon: {
      width: 43,

      height: 43,

      borderRadius: 14,

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    adaptiveResultText: {
      flex: 1,
    },

    adaptiveResultTitle: {
      fontSize: 13,

      fontWeight: '800',
    },

    adaptiveResultDescription: {
      fontSize: 10,

      lineHeight: 17,

      marginTop: 3,
    },

    nextLevel: {
      width: '100%',

      marginTop: 10,

      paddingHorizontal:
        Spacing.md,

      paddingVertical: 14,

      borderWidth: 1,

      borderRadius:
        BorderRadius.lg,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    nextLevelLabel: {
      fontSize: 10,
    },

    nextLevelValue: {
      fontSize: 18,

      fontWeight: '900',

      marginTop: 2,
    },

    bottomSpace: {
      height: 15,
    },

    /* ============================================================
       GAME HUD
    ============================================================ */

    gameHud: {
      marginHorizontal: 12,

      marginTop: 12,

      height: 58,

      borderWidth: 1,

      borderRadius:
        BorderRadius.lg,

      paddingHorizontal: 14,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',
    },

    hudItem: {
      flexDirection:
        'row',

      alignItems:
        'center',

      gap: 7,

      minWidth: 55,
    },

    hudLabel: {
      fontSize: 8,
    },

    hudValue: {
      fontSize: 16,

      fontWeight: '900',

      marginTop: 1,
    },

    progressContainer: {
      alignItems:
        'center',

      justifyContent:
        'center',
    },

    progressText: {
      fontSize: 10,

      fontWeight: '700',
    },

    levelHud: {
      fontSize: 15,

      fontWeight: '900',
    },

    /* ============================================================
       GAME
    ============================================================ */

    instructionCard: {
      marginHorizontal: 18,

      marginTop: 10,

      minHeight: 46,

      paddingHorizontal: 12,

      paddingVertical: 8,

      borderWidth: 1,

      borderRadius:
        BorderRadius.lg,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 8,
    },

    instructionText: {
      fontSize: 13,

      lineHeight: 19,

      fontWeight: '700',

      flexShrink: 1,
    },

    timerTrack: {
      height: 4,

      marginHorizontal: 18,

      marginTop: 10,

      borderRadius: 2,

      overflow:
        'hidden',
    },

    timerProgress: {
      height: '100%',

      borderRadius: 2,
    },

    playAreaWrapper: {
      flex: 1,

      marginHorizontal: 8,

      marginTop: 8,

      marginBottom: 8,

      minHeight: 250,

      overflow:
        'hidden',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    circleRow: {
      width: '100%',

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 4,
    },

    choiceArea: {
      alignItems:
        'center',

      justifyContent:
        'center',

      overflow:
        'hidden',
    },

    circle: {
      shadowOpacity: 0.08,

      shadowRadius: 10,

      shadowOffset: {
        width: 0,

        height: 4,
      },

      elevation: 2,
    },

    choiceLabel: {
      fontSize: 10,

      fontWeight: '700',

      marginTop: 9,
    },

    feedbackContainer: {
      minHeight: 72,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 18,
    },

    feedbackCard: {
      minWidth: 145,

      minHeight: 42,

      paddingHorizontal: 14,

      borderWidth: 1,

      borderRadius:
        BorderRadius.full,

      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      gap: 7,
    },

    feedbackText: {
      fontSize: 13,

      fontWeight: '800',
    },

    responseTime: {
      fontSize: 9,

      marginTop: 4,
    },

    bottomHint: {
      minHeight: 40,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingBottom: 8,
    },

    bottomHintText: {
      fontSize: 10,
    },
  });