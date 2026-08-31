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
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import {
  ArrowLeft,
  RotateCcw,
  Target,
  Zap,
  Trophy,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Sparkles,
  Brain,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';

const TOTAL_TRIALS = 20;
const MIN_LEVEL = 1;
const MAX_LEVEL = 5;

const STORAGE_KEY = 'neurolia_visual_flow_adaptive_v3';

type Direction = 'up' | 'down' | 'left' | 'right';

type Phase = 'intro' | 'playing' | 'result';

type Feedback =
  | 'idle'
  | 'correct'
  | 'wrong'
  | 'timeout';

type Dot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
};

type DifficultyConfig = {
  level: number;
  nameFa: string;
  nameEn: string;
  minCoherence: number;
  maxCoherence: number;
  minSpeed: number;
  maxSpeed: number;
  dots: number;
  duration: number;
};

const DIFFICULTIES: DifficultyConfig[] = [
  {
    level: 1,
    nameFa: 'آسان',
    nameEn: 'Easy',
    minCoherence: 0.72,
    maxCoherence: 0.88,
    minSpeed: 1.1,
    maxSpeed: 1.8,
    dots: 42,
    duration: 2600,
  },
  {
    level: 2,
    nameFa: 'متوسط',
    nameEn: 'Medium',
    minCoherence: 0.58,
    maxCoherence: 0.72,
    minSpeed: 1.4,
    maxSpeed: 2.1,
    dots: 55,
    duration: 2500,
  },
  {
    level: 3,
    nameFa: 'دقیق',
    nameEn: 'Precise',
    minCoherence: 0.45,
    maxCoherence: 0.58,
    minSpeed: 1.7,
    maxSpeed: 2.5,
    dots: 68,
    duration: 2400,
  },
  {
    level: 4,
    nameFa: 'سخت',
    nameEn: 'Hard',
    minCoherence: 0.32,
    maxCoherence: 0.46,
    minSpeed: 2.0,
    maxSpeed: 2.9,
    dots: 82,
    duration: 2300,
  },
  {
    level: 5,
    nameFa: 'حرفه‌ای',
    nameEn: 'Expert',
    minCoherence: 0.2,
    maxCoherence: 0.34,
    minSpeed: 2.3,
    maxSpeed: 3.3,
    dots: 96,
    duration: 2200,
  },
];

const randomBetween = (
  min: number,
  max: number
) => Math.random() * (max - min) + min;

const getConfig = (
  level: number
): DifficultyConfig =>
  DIFFICULTIES[
    Math.max(
      0,
      Math.min(
        DIFFICULTIES.length - 1,
        level - 1
      )
    )
  ];

export default function VisualFlowScreen() {
  const router = useRouter();

  const { colors } = useTheme();
  const { language, isRTL } = useLanguage();

  const text = useMemo(
    () =>
      language === 'fa'
        ? {
            title: 'جریان بصری',
            subtitle: 'جهت حرکت نقاط را تشخیص بده',

            instruction:
              'جهت اصلی حرکت نقاط کدام است؟',

            description:
              'به حرکت کلی نقاط نگاه کن و جهتی را انتخاب کن که بیشتر نقاط در آن حرکت می‌کنند.',

            start: 'شروع بازی',
            back: 'بازگشت',

            up: 'بالا',
            down: 'پایین',
            left: 'چپ',
            right: 'راست',

            round: 'مرحله',
            score: 'امتیاز',

            correct: 'درست',
            wrong: 'اشتباه',
            timeout: 'زمان تمام شد',

            completed: 'بازی تمام شد',

            accuracy: 'دقت',
            averageTime: 'میانگین زمان پاسخ',
            milliseconds: 'میلی‌ثانیه',

            correctAnswers:
              'پاسخ‌های درست',

            currentLevel: 'سطح فعلی',
            nextLevel: 'سطح بعدی',

            adaptive: 'سختی تطبیقی',

            adaptiveDescription:
              'سطح بازی بر اساس عملکرد واقعی شما به‌صورت خودکار تغییر می‌کند.',

            levelUp:
              'عملکرد شما عالی بود. مرحله بعد دشوارتر خواهد شد.',

            levelDown:
              'این مرحله دشوار بود. مرحله بعد کمی آسان‌تر خواهد شد.',

            levelSame:
              'سطح فعلی برای عملکرد شما مناسب است.',

            playAgain: 'بازی مجدد',

            noLevel:
              'سطح بازی توسط شما انتخاب نمی‌شود.',

            excellent: 'عملکرد عالی',
            good: 'عملکرد خوب',
            improve: 'نیاز به تمرین بیشتر',

            direction: 'جهت',
            find: 'جهت حرکت را پیدا کن',

            previous: 'عملکرد قبلی',
          }
        : {
            title: 'Visual Flow',
            subtitle:
              'Detect the direction of moving dots',

            instruction:
              'What is the main direction?',

            description:
              'Watch the overall movement and choose the direction in which most dots are moving.',

            start: 'Start Game',
            back: 'Back',

            up: 'Up',
            down: 'Down',
            left: 'Left',
            right: 'Right',

            round: 'Round',
            score: 'Score',

            correct: 'Correct',
            wrong: 'Wrong',
            timeout: 'Time is up',

            completed: 'Game Complete',

            accuracy: 'Accuracy',
            averageTime: 'Average Response',
            milliseconds: 'ms',

            correctAnswers:
              'Correct Answers',

            currentLevel: 'Current Level',
            nextLevel: 'Next Level',

            adaptive: 'Adaptive Difficulty',

            adaptiveDescription:
              'Game difficulty automatically changes based on your actual performance.',

            levelUp:
              'Excellent performance. The next session will be harder.',

            levelDown:
              'This session was challenging. The next session will be easier.',

            levelSame:
              'The current difficulty is appropriate for your performance.',

            playAgain: 'Play Again',

            noLevel:
              'You do not choose the game level.',

            excellent: 'Excellent Performance',
            good: 'Good Performance',
            improve: 'More Practice Needed',

            direction: 'Direction',
            find: 'Find the direction',

            previous: 'Previous Performance',
          },
    [language]
  );

  const [phase, setPhase] =
    useState<Phase>('intro');

  const [level, setLevel] = useState(1);

  const [previousAccuracy, setPreviousAccuracy] =
    useState<number | null>(null);

  const [trialIndex, setTrialIndex] =
    useState(0);

  const [score, setScore] = useState(0);

  const [feedback, setFeedback] =
    useState<Feedback>('idle');

  const [dots, setDots] =
    useState<Dot[]>([]);

  const [areaWidth, setAreaWidth] =
    useState(0);

  const [areaHeight, setAreaHeight] =
    useState(0);

  const [responseTime, setResponseTime] =
    useState<number | null>(null);

  const [results, setResults] = useState<
    {
      correct: boolean;
      rt: number;
    }[]
  >([]);

  const [adaptiveResult, setAdaptiveResult] =
    useState<
      'up' | 'down' | 'same' | null
    >(null);

  const [ready, setReady] =
    useState(false);

  /*
   * Refs
   */

  const mounted = useRef(true);

  const animationFrame =
    useRef<number | null>(null);

  const timeoutRef =
    useRef<
      ReturnType<typeof setTimeout> | null
    >(null);

  const trialTimerRef =
    useRef<
      ReturnType<typeof setTimeout> | null
    >(null);

  const startTimeRef = useRef(0);

  const correctDirectionRef =
    useRef<Direction>('up');

  const dotsRef =
    useRef<Dot[]>([]);

  const levelRef =
    useRef(level);

  const trialRef =
    useRef(0);

  const resultsRef = useRef<
    {
      correct: boolean;
      rt: number;
    }[]
  >([]);

  const scoreRef = useRef(0);

  const answeredRef =
    useRef(false);

  const phaseRef =
    useRef<Phase>('intro');

  const readyRef =
    useRef(false);

  const finishingRef =
    useRef(false);

  const handleAnswerRef =
    useRef<
      (selected: Direction | null) => void
    >(() => {});

  const pulse =
    useRef(new Animated.Value(0.92))
      .current;

  const timerAnimation =
    useRef(new Animated.Value(1))
      .current;

  const config = getConfig(level);

  const levelName =
    language === 'fa'
      ? config.nameFa
      : config.nameEn;

  /*
   * Keep refs synchronized with state
   */

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    readyRef.current = ready;
  }, [ready]);

  /*
   * Load previous adaptive progress
   */

  useEffect(() => {
    let cancelled = false;

    const loadProgress = async () => {
      try {
        const stored =
          await AsyncStorage.getItem(
            STORAGE_KEY
          );

        if (!stored || cancelled) return;

        const parsed =
          JSON.parse(stored);

        if (
          typeof parsed.level ===
          'number'
        ) {
          const savedLevel = Math.max(
            MIN_LEVEL,
            Math.min(
              MAX_LEVEL,
              parsed.level
            )
          );

          levelRef.current =
            savedLevel;

          setLevel(savedLevel);
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
        console.warn(
          '[VisualFlow] Failed to load progress:',
          error
        );
      }
    };

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Save adaptive progress
   */

  const saveProgress =
    useCallback(
      async (
        nextLevel: number,
        accuracy: number
      ) => {
        try {
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              level: nextLevel,
              accuracy: Math.round(
                accuracy
              ),
              updatedAt: Date.now(),
            })
          );
        } catch (error) {
          console.warn(
            '[VisualFlow] Save failed:',
            error
          );
        }
      },
      []
    );

  /*
   * Clear every active timer / animation
   */

  const clearTimers =
    useCallback(() => {
      if (
        animationFrame.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrame.current
        );

        animationFrame.current = null;
      }

      if (timeoutRef.current) {
        clearTimeout(
          timeoutRef.current
        );

        timeoutRef.current = null;
      }

      if (
        trialTimerRef.current
      ) {
        clearTimeout(
          trialTimerRef.current
        );

        trialTimerRef.current = null;
      }

      timerAnimation.stopAnimation();
    }, [timerAnimation]);

  /*
   * Cleanup
   */

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;

      clearTimers();

      dotsRef.current = [];

      setDots([]);
    };
  }, [clearTimers]);

  /*
   * Create dots
   */

  const createDots =
    useCallback(
      (
        width: number,
        height: number,
        direction: Direction,
        cfg: DifficultyConfig
      ) => {
        const safeWidth =
          Math.max(width, 100);

        const safeHeight =
          Math.max(height, 100);

        const directionVectors: Record<
          Direction,
          [number, number]
        > = {
          up: [0, -1],
          down: [0, 1],
          left: [-1, 0],
          right: [1, 0],
        };

        const [
          directionX,
          directionY,
        ] =
          directionVectors[
            direction
          ];

        const nextDots: Dot[] = [];

        const minDistance = 8;

        for (
          let i = 0;
          i < cfg.dots;
          i++
        ) {
          const coherent =
            Math.random() <
            randomBetween(
              cfg.minCoherence,
              cfg.maxCoherence
            );

          let vx: number;
          let vy: number;

          if (coherent) {
            const speed =
              randomBetween(
                cfg.minSpeed,
                cfg.maxSpeed
              );

            vx =
              directionX * speed +
              randomBetween(
                -0.25,
                0.25
              );

            vy =
              directionY * speed +
              randomBetween(
                -0.25,
                0.25
              );
          } else {
            const angle =
              randomBetween(
                0,
                Math.PI * 2
              );

            const speed =
              randomBetween(
                cfg.minSpeed,
                cfg.maxSpeed
              );

            vx =
              Math.cos(angle) * speed;

            vy =
              Math.sin(angle) * speed;
          }

          let attempts = 0;

          let x = randomBetween(
            8,
            safeWidth - 8
          );

          let y = randomBetween(
            8,
            safeHeight - 8
          );

          let validPosition = false;

          while (
            !validPosition &&
            attempts < 50
          ) {
            x = randomBetween(
              8,
              safeWidth - 8
            );

            y = randomBetween(
              8,
              safeHeight - 8
            );

            let tooClose = false;

            for (const existing of nextDots) {
              const dx =
                x - existing.x;

              const dy =
                y - existing.y;

              if (
                Math.sqrt(
                  dx * dx +
                    dy * dy
                ) < minDistance
              ) {
                tooClose = true;
                break;
              }
            }

            if (!tooClose) {
              validPosition = true;
            }

            attempts++;
          }

          nextDots.push({
            x,
            y,
            vx,
            vy,
            size: randomBetween(
              3,
              5
            ),
          });
        }

        dotsRef.current =
          nextDots;

        setDots(nextDots);
      },
      []
    );

  /*
   * Animate dots
   */

  const animateDots =
    useCallback(() => {
      if (
        !mounted.current ||
        phaseRef.current !==
          'playing' ||
        !readyRef.current
      ) {
        return;
      }

      if (
        areaWidth <= 0 ||
        areaHeight <= 0
      ) {
        animationFrame.current =
          requestAnimationFrame(
            animateDots
          );

        return;
      }

      const cfg = getConfig(
        levelRef.current
      );

      const updated =
        dotsRef.current.map(
          dot => {
            let x =
              dot.x + dot.vx;

            let y =
              dot.y + dot.vy;

            if (x < -10) {
              x =
                areaWidth + 10;
            }

            if (
              x >
              areaWidth + 10
            ) {
              x = -10;
            }

            if (y < -10) {
              y =
                areaHeight + 10;
            }

            if (
              y >
              areaHeight + 10
            ) {
              y = -10;
            }

            let vx =
              dot.vx +
              randomBetween(
                -0.04,
                0.04
              );

            let vy =
              dot.vy +
              randomBetween(
                -0.04,
                0.04
              );

            const maxSpeed =
              cfg.maxSpeed * 1.2;

            const speed = Math.sqrt(
              vx * vx +
                vy * vy
            );

            if (
              speed > maxSpeed
            ) {
              vx =
                (vx / speed) *
                maxSpeed;

              vy =
                (vy / speed) *
                maxSpeed;
            }

            return {
              ...dot,
              x,
              y,
              vx,
              vy,
            };
          }
        );

      dotsRef.current =
        updated;

      setDots(updated);

      animationFrame.current =
        requestAnimationFrame(
          animateDots
        );
    }, [
      areaHeight,
      areaWidth,
    ]);

  /*
   * Start / stop animation
   */

  useEffect(() => {
    if (
      phase !== 'playing' ||
      !ready
    ) {
      return;
    }

    if (
      animationFrame.current !==
      null
    ) {
      cancelAnimationFrame(
        animationFrame.current
      );
    }

    animationFrame.current =
      requestAnimationFrame(
        animateDots
      );

    return () => {
      if (
        animationFrame.current !==
        null
      ) {
        cancelAnimationFrame(
          animationFrame.current
        );

        animationFrame.current =
          null;
      }
    };
  }, [
    animateDots,
    phase,
    ready,
  ]);

  /*
   * Finish game
   *
   * IMPORTANT:
   * This function changes phase BEFORE
   * AsyncStorage so the result screen
   * can never get blocked by storage.
   */

  const finishGame =
    useCallback(
      (
        finalResults: {
          correct: boolean;
          rt: number;
        }[]
      ) => {
        if (
          finishingRef.current
        ) {
          return;
        }

        finishingRef.current =
          true;

        clearTimers();

        answeredRef.current =
          true;

        readyRef.current =
          false;

        setReady(false);

        const correct =
          finalResults.filter(
            item => item.correct
          ).length;

        const accuracy =
          finalResults.length > 0
            ? (correct /
                finalResults.length) *
              100
            : 0;

        let nextLevel =
          levelRef.current;

        let adaptive:
          | 'up'
          | 'down'
          | 'same' =
          'same';

        /*
         * Adaptive difficulty
         */

        if (
          accuracy >= 85 &&
          levelRef.current <
            MAX_LEVEL
        ) {
          nextLevel =
            levelRef.current + 1;

          adaptive = 'up';
        } else if (
          accuracy < 50 &&
          levelRef.current >
            MIN_LEVEL
        ) {
          nextLevel =
            levelRef.current - 1;

          adaptive = 'down';
        }

        levelRef.current =
          nextLevel;

        setLevel(nextLevel);

        setPreviousAccuracy(
          Math.round(accuracy)
        );

        setAdaptiveResult(
          adaptive
        );

        /*
         * Clear visual state
         */

        dotsRef.current = [];

        setDots([]);

        /*
         * SHOW RESULT IMMEDIATELY
         */

        phaseRef.current =
          'result';

        setPhase('result');

        /*
         * Save in background
         */

        saveProgress(
          nextLevel,
          accuracy
        ).catch(error => {
          console.warn(
            '[VisualFlow] Failed to save final progress:',
            error
          );
        });
      },
      [
        clearTimers,
        saveProgress,
      ]
    );

  /*
   * Start next trial
   */

  const startTrial =
    useCallback(() => {
      if (
        !mounted.current ||
        phaseRef.current !==
          'playing'
      ) {
        return;
      }

      if (
        trialRef.current >
        TOTAL_TRIALS
      ) {
        return;
      }

      clearTimers();

      answeredRef.current =
        false;

      readyRef.current =
        false;

      setReady(false);

      setFeedback('idle');

      setResponseTime(null);

      const directions: Direction[] =
        [
          'up',
          'down',
          'left',
          'right',
        ];

      const direction =
        directions[
          Math.floor(
            Math.random() *
              directions.length
          )
        ];

      correctDirectionRef.current =
        direction;

      const cfg = getConfig(
        levelRef.current
      );

      createDots(
        areaWidth,
        areaHeight,
        direction,
        cfg
      );

      setReady(true);

      readyRef.current =
        true;

      startTimeRef.current =
        Date.now();

      pulse.setValue(0.88);

      Animated.spring(pulse, {
        toValue: 1,
        friction: 7,
        tension: 70,
        useNativeDriver: true,
      }).start();

      timerAnimation.stopAnimation();

      timerAnimation.setValue(
        1
      );

      Animated.timing(
        timerAnimation,
        {
          toValue: 0,
          duration:
            cfg.duration,
          useNativeDriver: false,
        }
      ).start();

      /*
       * Timeout
       *
       * Use ref so the timeout
       * always reaches the latest
       * handleAnswer.
       */

      timeoutRef.current =
        setTimeout(() => {
          if (
            mounted.current &&
            phaseRef.current ===
              'playing' &&
            readyRef.current &&
            !answeredRef.current
          ) {
            handleAnswerRef.current(
              null
            );
          }
        }, cfg.duration);
    }, [
      areaWidth,
      areaHeight,
      clearTimers,
      createDots,
      pulse,
      timerAnimation,
    ]);

  /*
   * Answer handler
   */

  const handleAnswer =
    useCallback(
      (
        selected:
          | Direction
          | null
      ) => {
        if (
          !mounted.current ||
          phaseRef.current !==
            'playing' ||
          !readyRef.current ||
          answeredRef.current ||
          finishingRef.current
        ) {
          return;
        }

        answeredRef.current =
          true;

        readyRef.current =
          false;

        setReady(false);

        if (
          timeoutRef.current
        ) {
          clearTimeout(
            timeoutRef.current
          );

          timeoutRef.current =
            null;
        }

        timerAnimation.stopAnimation();

        const rt =
          Date.now() -
          startTimeRef.current;

        const correct =
          selected !== null &&
          selected ===
            correctDirectionRef.current;

        const result = {
          correct,
          rt:
            selected === null
              ? 0
              : rt,
        };

        setResponseTime(
          selected === null
            ? null
            : rt
        );

        setFeedback(
          selected === null
            ? 'timeout'
            : correct
            ? 'correct'
            : 'wrong'
        );

        const updatedResults =
          [
            ...resultsRef.current,
            result,
          ];

        resultsRef.current =
          updatedResults;

        setResults(
          updatedResults
        );

        /*
         * Score
         */

        if (correct) {
          const cfg = getConfig(
            levelRef.current
          );

          const speedBonus =
            Math.max(
              0,
              Math.round(
                ((cfg.duration -
                  rt) /
                  cfg.duration) *
                  10
              )
            );

          const points =
            10 + speedBonus;

          scoreRef.current +=
            points;

          setScore(
            scoreRef.current
          );
        }

        /*
         * FINAL TRIAL
         *
         * Do NOT increment trial.
         * Finish using the complete results.
         */

        if (
          trialRef.current >=
          TOTAL_TRIALS
        ) {
          trialTimerRef.current =
            setTimeout(() => {
              if (
                mounted.current
              ) {
                finishGame(
                  updatedResults
                );
              }
            }, 500);

          return;
        }

        /*
         * Move to next trial
         */

        trialRef.current += 1;

        setTrialIndex(
          trialRef.current
        );

        trialTimerRef.current =
          setTimeout(() => {
            if (
              mounted.current &&
              phaseRef.current ===
                'playing' &&
              !finishingRef.current
            ) {
              startTrial();
            }
          }, 500);
      },
      [
        finishGame,
        startTrial,
        timerAnimation,
      ]
    );

  /*
   * Keep the latest answer handler
   * available to timeout callbacks.
   */

  useEffect(() => {
    handleAnswerRef.current =
      handleAnswer;

    return () => {
      handleAnswerRef.current =
        () => {};
    };
  }, [handleAnswer]);

  /*
   * Start complete game
   */

  const startGame =
    useCallback(() => {
      clearTimers();

      finishingRef.current =
        false;

      phaseRef.current =
        'playing';

      readyRef.current =
        false;

      answeredRef.current =
        false;

      trialRef.current = 1;

      scoreRef.current = 0;

      resultsRef.current = [];

      setTrialIndex(1);

      setResults([]);

      setScore(0);

      setFeedback('idle');

      setResponseTime(null);

      setAdaptiveResult(null);

      setDots([]);

      setReady(false);

      setPhase('playing');

      /*
       * Give the layout one render
       * before creating the first trial.
       */

      trialTimerRef.current =
        setTimeout(() => {
          if (
            mounted.current &&
            phaseRef.current ===
              'playing'
          ) {
            startTrial();
          }
        }, 250);
    }, [
      clearTimers,
      startTrial,
    ]);

  /*
   * Back button
   */

  const handleBack =
    useCallback(() => {
      clearTimers();

      finishingRef.current =
        false;

      readyRef.current =
        false;

      answeredRef.current =
        true;

      setReady(false);

      dotsRef.current = [];

      setDots([]);

      if (
        phaseRef.current ===
        'playing'
      ) {
        phaseRef.current =
          'intro';

        setPhase('intro');

        trialRef.current =
          0;

        resultsRef.current =
          [];

        scoreRef.current =
          0;

        setResults([]);

        setScore(0);

        setFeedback('idle');

        return;
      }

      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace(
          '/(tabs)/psycho'
        );
      }
    }, [
      clearTimers,
      router,
    ]);

  /*
   * Statistics
   */

  const correctCount =
    results.filter(
      item => item.correct
    ).length;

  const wrongCount =
    results.length -
    correctCount;

  const accuracy =
    results.length
      ? Math.round(
          (correctCount /
            results.length) *
            100
        )
      : 0;

  const validTimes =
    results
      .filter(
        item =>
          item.correct &&
          item.rt > 0
      )
      .map(item => item.rt);

  const averageTime =
    validTimes.length
      ? Math.round(
          validTimes.reduce(
            (total, value) =>
              total + value,
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

  /*
   * Direction labels
   */

  const getDirectionLabel =
    (direction: Direction) => {
      if (
        direction === 'up'
      ) {
        return text.up;
      }

      if (
        direction === 'down'
      ) {
        return text.down;
      }

      if (
        direction === 'left'
      ) {
        return text.left;
      }

      return text.right;
    };

  /*
   * INTRO
   */

  if (phase === 'intro') {
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
        <Header
          title={text.title}
          subtitle={text.subtitle}
          onBack={handleBack}
          colors={colors}
          isRTL={isRTL}
        />

        <ScrollView
          style={styles.scroll}
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
            <Brain
              size={43}
              color={colors.primary}
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
            {text.description}
          </Text>

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
              {Array.from({
                length: 28,
              }).map(
                (_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.previewDot,
                      {
                        backgroundColor:
                          colors.primary,
                        opacity:
                          0.45 +
                          (index % 4) *
                            0.12,
                      },
                    ]}
                  />
                )
              )}
            </View>

            <Text
              style={[
                styles.previewInstruction,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {text.instruction}
            </Text>
          </View>

          <View
            style={[
              styles.infoCard,
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
                styles.infoIcon,
                {
                  backgroundColor:
                    colors.primary +
                    '15',
                },
              ]}
            >
              <Sparkles
                size={22}
                color={colors.primary}
              />
            </View>

            <View
              style={
                styles.infoText
              }
            >
              <Text
                style={[
                  styles.infoTitle,
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
                {text.adaptive}
              </Text>

              <Text
                style={[
                  styles.infoDescription,
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
                {text.currentLevel}
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
              size={24}
              color={colors.primary}
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
                size={21}
                color={colors.primary}
              />

              <Text
                style={[
                  styles.previousText,
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
                {text.previous} •{' '}
                {previousAccuracy}%
              </Text>
            </View>
          )}

          <Text
            style={[
              styles.noLevel,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {text.noLevel}
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={startGame}
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

  /*
   * RESULT SCREEN
   */

  if (phase === 'result') {
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
        <Header
          title={text.completed}
          subtitle={text.title}
          onBack={handleBack}
          colors={colors}
          isRTL={isRTL}
        />

        <ScrollView
          style={styles.scroll}
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
              size={46}
              color={colors.primary}
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
                size={22}
                color="#22C55E"
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
                {correctCount}
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
                  text.correctAnswers
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
                size={22}
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
                {wrongCount}
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
                {text.wrong}
              </Text>
            </View>
          </View>

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
              size={22}
              color={colors.primary}
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
                {text.accuracy}
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
              size={22}
              color={colors.primary}
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
                {text.averageTime}
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
                {text.milliseconds}
              </Text>
            </View>
          </View>

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
            <Sparkles
              size={23}
              color={colors.primary}
            />

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
                {text.adaptive}
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
                {text.nextLevel}
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
                {nextLevelName}
              </Text>
            </View>

            <TrendingUp
              size={24}
              color={colors.primary}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={startGame}
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
              {text.playAgain}
            </Text>
          </TouchableOpacity>

          <View
            style={styles.bottomSpace}
          />
        </ScrollView>
      </View>
    );
  }

  /*
   * GAME
   */

  const timerWidth =
    timerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

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
      <Header
        title={text.title}
        subtitle={`${levelName} • ${text.round} ${trialIndex}/${TOTAL_TRIALS}`}
        onBack={handleBack}
        colors={colors}
        isRTL={isRTL}
      />

      <View
        style={[
          styles.hud,
          {
            backgroundColor:
              colors.surface,
            borderColor:
              colors.border,
          },
        ]}
      >
        <View
          style={styles.hudItem}
        >
          <Zap
            size={17}
            color={colors.primary}
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

        <Text
          style={[
            styles.roundText,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          {trialIndex}/
          {TOTAL_TRIALS}
        </Text>

        <View
          style={styles.hudItem}
        >
          <Brain
            size={17}
            color={colors.primary}
          />

          <Text
            style={[
              styles.hudValue,
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
          color={colors.primary}
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
          {text.instruction}
        </Text>
      </View>

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
              width: timerWidth,
              backgroundColor:
                colors.primary,
            },
          ]}
        />
      </View>

      <View
        style={
          styles.visualFieldWrapper
        }
      >
        <View
          style={[
            styles.visualField,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
          onLayout={event => {
            const {
              width,
              height,
            } =
              event.nativeEvent
                .layout;

            if (
              width !==
                areaWidth ||
              height !==
                areaHeight
            ) {
              setAreaWidth(width);
              setAreaHeight(
                height
              );
            }
          }}
        >
          <Animated.View
            style={[
              styles.dotsLayer,
              {
                transform: [
                  {
                    scale: pulse,
                  },
                ],
              },
            ]}
          >
            {dots.map(
              (dot, index) => (
                <View
                  key={`${index}-${dot.x}-${dot.y}`}
                  pointerEvents="none"
                  style={[
                    styles.dot,
                    {
                      width:
                        dot.size,
                      height:
                        dot.size,
                      borderRadius:
                        dot.size /
                        2,
                      left:
                        dot.x -
                        dot.size /
                          2,
                      top:
                        dot.y -
                        dot.size /
                          2,
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                />
              )
            )}
          </Animated.View>
        </View>
      </View>

      <View
        style={
          styles.feedbackArea
        }
      >
        {feedback !== 'idle' && (
          <View
            style={[
              styles.feedback,
              {
                backgroundColor:
                  feedback ===
                  'correct'
                    ? '#22C55E15'
                    : '#EF444415',

                borderColor:
                  feedback ===
                  'correct'
                    ? '#22C55E35'
                    : '#EF444435',
              },
            ]}
          >
            {feedback ===
            'correct' ? (
              <CheckCircle
                size={20}
                color="#22C55E"
              />
            ) : (
              <XCircle
                size={20}
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
      </View>

      <View
        style={
          styles.directionArea
        }
      >
        <View
          style={
            styles.directionRow
          }
        >
          <DirectionButton
            label={text.up}
            icon="up"
            onPress={() =>
              handleAnswer('up')
            }
            colors={colors}
            disabled={!ready}
          />
        </View>

        <View
          style={
            styles.directionRow
          }
        >
          <DirectionButton
            label={text.left}
            icon="left"
            onPress={() =>
              handleAnswer('left')
            }
            colors={colors}
            disabled={!ready}
          />

          <View
            style={
              styles.centerTarget
            }
          >
            <Target
              size={17}
              color={
                colors.textSecondary
              }
            />
          </View>

          <DirectionButton
            label={text.right}
            icon="right"
            onPress={() =>
              handleAnswer('right')
            }
            colors={colors}
            disabled={!ready}
          />
        </View>

        <View
          style={
            styles.directionRow
          }
        >
          <DirectionButton
            label={text.down}
            icon="down"
            onPress={() =>
              handleAnswer('down')
            }
            colors={colors}
            disabled={!ready}
          />
        </View>
      </View>
    </View>
  );
}

/*
 * Header
 */

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
          borderBottomColor:
            colors.border,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onBack}
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
          color={colors.text}
          strokeWidth={2.5}
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
          numberOfLines={1}
        >
          {title}
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
          numberOfLines={1}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

/*
 * Direction Button
 */

function DirectionButton({
  label,
  icon,
  onPress,
  colors,
  disabled,
}: {
  label: string;
  icon:
    | 'up'
    | 'down'
    | 'left'
    | 'right';
  onPress: () => void;
  colors: any;
  disabled: boolean;
}) {
  const Icon =
    icon === 'up'
      ? require('lucide-react-native')
          .ChevronUp
      : icon === 'down'
      ? require('lucide-react-native')
          .ChevronDown
      : icon === 'left'
      ? require('lucide-react-native')
          .ChevronLeft
      : require('lucide-react-native')
          .ChevronRight;

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.directionButton,
        {
          backgroundColor:
            colors.surface,
          borderColor:
            colors.border,
          opacity: disabled
            ? 0.45
            : 1,
        },
      ]}
    >
      <Icon
        size={24}
        color={colors.text}
        strokeWidth={2.5}
      />

      <Text
        style={[
          styles.directionLabel,
          {
            color:
              colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/*
 * Styles
 */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    gameContainer: {
      flex: 1,
      overflow: 'hidden',
    },

    scroll: {
      flex: 1,
    },

    header: {
      width: '100%',
      paddingHorizontal:
        Spacing.lg,
      paddingTop: 30,
      paddingBottom: 14,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth:
        StyleSheet.hairlineWidth,
    },

    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent:
        'center',
      marginRight: 12,
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

    introContent: {
      flexGrow: 1,
      paddingHorizontal:
        Spacing.lg,
      alignItems: 'center',
      paddingTop: 28,
      paddingBottom: 50,
    },

    heroIcon: {
      width: 82,
      height: 82,
      borderRadius: 27,
      alignItems: 'center',
      justifyContent:
        'center',
      marginBottom: 14,
    },

    heroTitle: {
      fontSize: 27,
      fontWeight: '900',
      textAlign: 'center',
    },

    heroDescription: {
      maxWidth: 370,
      fontSize: 13,
      lineHeight: 22,
      textAlign: 'center',
      marginTop: 8,
    },

    previewCard: {
      width: '100%',
      marginTop: 22,
      borderRadius:
        BorderRadius.lg,
      borderWidth: 1,
      padding: 16,
    },

    previewArea: {
      height: 125,
      width: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignContent:
        'center',
      justifyContent:
        'center',
      gap: 8,
      overflow: 'hidden',
    },

    previewDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },

    previewInstruction: {
      fontSize: 13,
      fontWeight: '700',
      textAlign: 'center',
      marginTop: 9,
    },

    infoCard: {
      width: '100%',
      marginTop: 12,
      borderWidth: 1,
      borderRadius:
        BorderRadius.lg,
      padding: Spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    infoIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    infoText: {
      flex: 1,
    },

    infoTitle: {
      fontSize: 14,
      fontWeight: '800',
    },

    infoDescription: {
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
      flexDirection: 'row',
      alignItems: 'center',
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
      marginTop: 10,
      minHeight: 50,
      paddingHorizontal:
        Spacing.md,
      borderWidth: 1,
      borderRadius:
        BorderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    previousText: {
      flex: 1,
      fontSize: 11,
    },

    noLevel: {
      fontSize: 10,
      textAlign: 'center',
      marginTop: 12,
    },

    primaryButton: {
      width: '100%',
      minHeight: 54,
      marginTop: 18,
      borderRadius:
        BorderRadius.full,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 8,
    },

    primaryButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },

    hud: {
      marginHorizontal: 12,
      marginTop: 11,
      height: 56,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderRadius:
        BorderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    hudItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      minWidth: 55,
    },

    hudLabel: {
      fontSize: 8,
    },

    hudValue: {
      fontSize: 16,
      fontWeight: '900',
    },

    roundText: {
      fontSize: 10,
      fontWeight: '700',
    },

    instructionCard: {
      marginHorizontal: 16,
      marginTop: 9,
      minHeight: 45,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderRadius:
        BorderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 8,
    },

    instructionText: {
      fontSize: 12,
      fontWeight: '700',
      flexShrink: 1,
    },

    timerTrack: {
      height: 4,
      marginHorizontal: 18,
      marginTop: 9,
      borderRadius: 3,
      overflow: 'hidden',
    },

    timerProgress: {
      height: '100%',
      borderRadius: 3,
    },

    visualFieldWrapper: {
      flex: 1,
      minHeight: 200,
      marginHorizontal: 12,
      marginTop: 9,
      marginBottom: 5,
      overflow: 'hidden',
    },

    visualField: {
      flex: 1,
      borderWidth: 1,
      borderRadius:
        BorderRadius.lg,
      overflow: 'hidden',
      position: 'relative',
    },

    dotsLayer: {
      position: 'absolute',
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    },

    dot: {
      position: 'absolute',
    },

    feedbackArea: {
      height: 48,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    feedback: {
      minWidth: 125,
      minHeight: 37,
      paddingHorizontal: 13,
      borderRadius:
        BorderRadius.full,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 7,
    },

    feedbackText: {
      fontSize: 12,
      fontWeight: '800',
    },

    directionArea: {
      alignItems: 'center',
      justifyContent:
        'center',
      paddingBottom: 10,
      gap: 5,
    },

    directionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 5,
    },

    directionButton: {
      width: 88,
      height: 43,
      borderWidth: 1,
      borderRadius:
        BorderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      gap: 4,
    },

    directionLabel: {
      fontSize: 10,
      fontWeight: '800',
    },

    centerTarget: {
      width: 43,
      height: 43,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    resultContent: {
      flexGrow: 1,
      paddingHorizontal:
        Spacing.lg,
      alignItems: 'center',
      paddingTop: 28,
      paddingBottom: 55,
    },

    resultIcon: {
      width: 82,
      height: 82,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent:
        'center',
      marginBottom: 13,
    },

    resultTitle: {
      fontSize: 24,
      fontWeight: '900',
      textAlign: 'center',
    },

    scoreCard: {
      width: '100%',
      marginTop: 18,
      borderWidth: 1,
      borderRadius:
        BorderRadius.lg,
      alignItems: 'center',
      paddingVertical: 17,
    },

    scoreValue: {
      fontSize: 44,
      fontWeight: '900',
    },

    scoreLabel: {
      fontSize: 11,
      marginTop: -2,
    },

    statsRow: {
      width: '100%',
      flexDirection: 'row',
      gap: 10,
      marginTop: 10,
    },

    statCard: {
      flex: 1,
      minHeight: 100,
      borderWidth: 1,
      borderRadius:
        BorderRadius.lg,
      alignItems: 'center',
      justifyContent:
        'center',
    },

    statValue: {
      fontSize: 22,
      fontWeight: '900',
      marginTop: 5,
    },

    statLabel: {
      fontSize: 9,
      marginTop: 2,
      textAlign: 'center',
      paddingHorizontal: 4,
    },

    metricCard: {
      width: '100%',
      minHeight: 64,
      marginTop: 10,
      paddingHorizontal:
        Spacing.md,
      borderWidth: 1,
      borderRadius:
        BorderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
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
      padding: Spacing.md,
      borderWidth: 1,
      borderRadius:
        BorderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
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

    bottomSpace: {
      height: 15,
    },
  });