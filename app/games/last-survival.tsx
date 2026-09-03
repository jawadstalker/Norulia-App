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
  Image,
  Animated,
  ScrollView,
  useWindowDimensions,
  BackHandler,
  Platform,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useRouter } from 'expo-router';

import {
  ArrowLeft,
  Trophy,
  Zap,
  Heart,
  Target,
  TrendingUp,
  RotateCcw,
  CheckCircle,
  XCircle,
  Sparkles,
  Shield,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';

import { saveGameResult } from './gameResults';

/* ================================================================
   IMAGES
================================================================ */

const GAME_IMAGES = {
  safe: require('../../assets/avatars/blue.png'),
  danger: require('../../assets/avatars/red.png'),
};

/* ================================================================
   CONSTANTS
================================================================ */

const TOTAL_LIVES = 3;

const MIN_DIFFICULTY = 1;

const MAX_DIFFICULTY = 4;

const INITIAL_DIFFICULTY = 1;

const STORAGE_KEY =
  'neurolia_last_survival_adaptive_v4';

const PLAY_SIDE_MARGIN = 14;

/* ================================================================
   DIFFICULTY
================================================================ */

type DifficultyConfig = {
  level: number;
  nameFa: string;
  nameEn: string;
  spawnInterval: number;
  lifeTime: number;
  maxObjects: number;
  objectSize: number;
  duration: number;
  dangerProbability: number;
  /*
   * Movement makes objects drift around in the air
   * instead of sitting still, so the player has to
   * track a moving target — harder difficulty means
   * a wider drift radius and a faster drift speed.
   */
  wobbleRadius: number;
  wobbleMinDuration: number;
  wobbleMaxDuration: number;
};

const DIFFICULTIES: DifficultyConfig[] = [
  {
    level: 1,
    nameFa: 'آسان',
    nameEn: 'Easy',
    spawnInterval: 1050,
    lifeTime: 2400,
    maxObjects: 3,
    objectSize: 76,
    duration: 30000,
    dangerProbability: 0.25,
    wobbleRadius: 26,
    wobbleMinDuration: 520,
    wobbleMaxDuration: 820,
  },

  {
    level: 2,
    nameFa: 'متوسط',
    nameEn: 'Medium',
    spawnInterval: 800,
    lifeTime: 1900,
    maxObjects: 4,
    objectSize: 70,
    duration: 35000,
    dangerProbability: 0.35,
    wobbleRadius: 38,
    wobbleMinDuration: 420,
    wobbleMaxDuration: 700,
  },

  {
    level: 3,
    nameFa: 'سخت',
    nameEn: 'Hard',
    spawnInterval: 620,
    lifeTime: 1500,
    maxObjects: 5,
    objectSize: 64,
    duration: 40000,
    dangerProbability: 0.45,
    wobbleRadius: 50,
    wobbleMinDuration: 340,
    wobbleMaxDuration: 580,
  },

  {
    level: 4,
    nameFa: 'حرفه‌ای',
    nameEn: 'Expert',
    spawnInterval: 470,
    lifeTime: 1150,
    maxObjects: 6,
    objectSize: 58,
    duration: 45000,
    dangerProbability: 0.55,
    wobbleRadius: 64,
    wobbleMinDuration: 260,
    wobbleMaxDuration: 460,
  },
];

/* ================================================================
   TYPES
================================================================ */

type GameObject = {
  id: number;
  isDanger: boolean;
  x: number;
  y: number;
  scale: Animated.Value;
  opacity: Animated.Value;
  /*
   * translateX / translateY drive the continuous
   * in-air drift so the object keeps shifting
   * position while it's alive.
   */
  translateX: Animated.Value;
  translateY: Animated.Value;
};

type ScorePopup = {
  id: number;
  x: number;
  y: number;
  value: number;
  opacity: Animated.Value;
  translateY: Animated.Value;
};

/* ================================================================
   HEADER
================================================================ */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  colors: any;
  isRTL: boolean;
  backLabel: string;
}

function PageHeader({
  title,
  subtitle,
  onBack,
  colors,
  isRTL,
  backLabel,
}: PageHeaderProps) {
  return (
    <View
      style={[
        styles.pageHeader,
        {
          borderBottomColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={backLabel}
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
          strokeWidth={2.5}
        />
      </TouchableOpacity>

      <View style={styles.headerTextContainer}>
        <Text
          numberOfLines={2}
          style={[
            styles.headerTitle,
            {
              color: colors.text,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={[
              styles.headerSubtitle,
              {
                color: colors.textSecondary,
                textAlign: isRTL ? 'right' : 'left',
              },
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

/* ================================================================
   SCREEN
================================================================ */

export default function LastSurvivalScreen() {
  const router = useRouter();

  const { colors } = useTheme();

  const { language, isRTL } = useLanguage();

  const { width } = useWindowDimensions();

  /* ================================================================
     TEXT
  ================================================================= */

  const text = useMemo(
    () =>
      language === 'fa'
        ? {
            title: 'آخرین بازمانده',
            subtitle: 'از تصاویر امن محافظت کن',
            instruction:
              'تصویر آبی را لمس کن و از تصویر قرمز دوری کن',
            score: 'امتیاز',
            lives: 'جان',
            level: 'سطح',
            start: 'شروع بازی',
            playAgain: 'بازی مجدد',
            back: 'بازگشت',
            completed: 'مرحله با موفقیت تمام شد',
            gameOver: 'بازی تمام شد',
            adaptive: 'سختی تطبیقی',
            adaptiveInfo:
              'سطح بازی بر اساس عملکرد واقعی شما به‌صورت خودکار تغییر می‌کند.',
            difficulty: 'سطح فعلی',
            accuracy: 'دقت',
            correct: 'درست',
            wrong: 'اشتباه',
            adaptiveUp:
              'عملکرد عالی بود؛ بازی در دفعه بعد سخت‌تر می‌شود.',
            adaptiveDown:
              'این مرحله دشوار بود؛ بازی در دفعه بعد کمی آسان‌تر می‌شود.',
            adaptiveSame:
              'عملکرد مناسب بود؛ سختی بازی حفظ می‌شود.',
            noLevelSelection:
              'سطح بازی به‌صورت خودکار تعیین می‌شود',
          }
        : {
            title: 'Last Survivor',
            subtitle: 'Protect the safe images',
            instruction:
              'Tap the blue image and avoid the red image',
            score: 'Score',
            lives: 'Lives',
            level: 'Level',
            start: 'Start Game',
            playAgain: 'Play Again',
            back: 'Back',
            completed: 'Stage Completed',
            gameOver: 'Game Over',
            adaptive: 'Adaptive Difficulty',
            adaptiveInfo:
              'Game difficulty automatically changes based on your actual performance.',
            difficulty: 'Current Level',
            accuracy: 'Accuracy',
            correct: 'Correct',
            wrong: 'Mistakes',
            adaptiveUp:
              'Excellent performance. The game will become harder next time.',
            adaptiveDown:
              'This session was challenging. The game will become easier next time.',
            adaptiveSame:
              'Good performance. The difficulty will remain stable.',
            noLevelSelection:
              'Difficulty is selected automatically',
          },
    [language]
  );

  /* ================================================================
     STATE
  ================================================================= */

  const [difficulty, setDifficulty] =
    useState(INITIAL_DIFFICULTY);

  const [previousAccuracy, setPreviousAccuracy] =
    useState<number | null>(null);

  const [playing, setPlaying] =
    useState(false);

  const [score, setScore] =
    useState(0);

  const [lives, setLives] =
    useState(TOTAL_LIVES);

  const [objects, setObjects] =
    useState<GameObject[]>([]);

  const [popups, setPopups] =
    useState<ScorePopup[]>([]);

  const [completed, setCompleted] =
    useState(false);

  const [gameOver, setGameOver] =
    useState(false);

  const [correctCount, setCorrectCount] =
    useState(0);

  const [wrongCount, setWrongCount] =
    useState(0);

  const [adaptiveResult, setAdaptiveResult] =
    useState<'up' | 'down' | 'same' | null>(null);

  const [playFieldWidth, setPlayFieldWidth] =
    useState(0);

  const [playFieldHeight, setPlayFieldHeight] =
    useState(0);

  /* ================================================================
     REFS
  ================================================================= */

  const mounted = useRef(true);

  /*
   * VERY IMPORTANT
   *
   * Prevents the Android hardware BackHandler and the UI back
   * button from executing navigation twice.
   */
  const isLeavingRef = useRef(false);

  const objectId = useRef(0);

  const popupId = useRef(0);

  const livesRef = useRef(TOTAL_LIVES);

  const scoreRef = useRef(0);

  const correctRef = useRef(0);

  const wrongRef = useRef(0);

  const removingIds =
    useRef<Set<number>>(new Set());

  const objectTimers =
    useRef<
      Map<number, ReturnType<typeof setTimeout>>
    >(new Map());

  const spawnTimer =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  const gameTimer =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const flashAnimation =
    useRef(new Animated.Value(0)).current;

  /* ================================================================
     CONFIG
  ================================================================= */

  const currentConfig =
    DIFFICULTIES[
      Math.max(
        0,
        Math.min(
          difficulty - 1,
          DIFFICULTIES.length - 1
        )
      )
    ];

  const difficultyName =
    language === 'fa'
      ? currentConfig.nameFa
      : currentConfig.nameEn;

  /* ================================================================
     LOAD
  ================================================================= */

  useEffect(() => {
    mounted.current = true;
    isLeavingRef.current = false;

    const loadState = async () => {
      try {
        const raw =
          await AsyncStorage.getItem(
            STORAGE_KEY
          );

        if (!raw || !mounted.current) {
          return;
        }

        const saved = JSON.parse(raw);

        if (
          typeof saved.difficulty ===
          'number'
        ) {
          setDifficulty(
            Math.max(
              MIN_DIFFICULTY,
              Math.min(
                MAX_DIFFICULTY,
                saved.difficulty
              )
            )
          );
        }

        if (
          typeof saved.accuracy ===
          'number'
        ) {
          setPreviousAccuracy(
            saved.accuracy
          );
        }
      } catch (error) {
        console.log(
          '[LastSurvival] Load error:',
          error
        );
      }
    };

    loadState();

    return () => {
      mounted.current = false;
    };
  }, []);

  /* ================================================================
     CLEAR TIMERS
  ================================================================= */

  const clearAllTimers =
    useCallback(() => {
      if (spawnTimer.current) {
        clearInterval(
          spawnTimer.current
        );

        spawnTimer.current = null;
      }

      if (gameTimer.current) {
        clearTimeout(
          gameTimer.current
        );

        gameTimer.current = null;
      }

      objectTimers.current.forEach(
        timer => {
          clearTimeout(timer);
        }
      );

      objectTimers.current.clear();
    }, []);

  /* ================================================================
     CLEAN GAME
  ================================================================= */

  const cleanupGame =
    useCallback(() => {
      clearAllTimers();

      removingIds.current.clear();

      setPlaying(false);

      setObjects([]);

      setPopups([]);

      /*
       * Stop current flash animation.
       */
      flashAnimation.stopAnimation();
      flashAnimation.setValue(0);
    }, [
      clearAllTimers,
      flashAnimation,
    ]);

  /* ================================================================
     SAVE
  ================================================================= */

  const saveAdaptiveState =
    useCallback(
      async (
        nextDifficulty: number,
        accuracy: number
      ) => {
        try {
          await AsyncStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              difficulty:
                nextDifficulty,
              accuracy,
              correct:
                correctRef.current,
              wrong:
                wrongRef.current,
              updatedAt:
                Date.now(),
            })
          );
        } catch (error) {
          console.log(
            '[LastSurvival] Save error:',
            error
          );
        }
      },
      []
    );

  /* ================================================================
     REMOVE OBJECT
  ================================================================= */

  const removeObject =
    useCallback(
      (id: number) => {
        const timer =
          objectTimers.current.get(
            id
          );

        if (timer) {
          clearTimeout(timer);

          objectTimers.current.delete(
            id
          );
        }

        removingIds.current.delete(id);

        if (!mounted.current) {
          return;
        }

        setObjects(previous =>
          previous.filter(
            item => item.id !== id
          )
        );
      },
      []
    );

  /* ================================================================
     POPUP
  ================================================================= */

  const showPopup =
    useCallback(
      (
        x: number,
        y: number,
        value: number
      ) => {
        if (
          !mounted.current ||
          isLeavingRef.current
        ) {
          return;
        }

        const opacity =
          new Animated.Value(0);

        const translateY =
          new Animated.Value(0);

        const id =
          popupId.current++;

        const popup: ScorePopup = {
          id,
          x,
          y,
          value,
          opacity,
          translateY,
        };

        setPopups(previous => [
          ...previous,
          popup,
        ]);

        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),

          Animated.timing(
            translateY,
            {
              toValue: -45,
              duration: 600,
              useNativeDriver: true,
            }
          ),
        ]).start(() => {
          if (
            !mounted.current ||
            isLeavingRef.current
          ) {
            return;
          }

          Animated.timing(opacity, {
            toValue: 0,
            duration: 220,
            useNativeDriver: true,
          }).start(() => {
            if (
              mounted.current &&
              !isLeavingRef.current
            ) {
              setPopups(previous =>
                previous.filter(
                  item =>
                    item.id !== id
                )
              );
            }
          });
        });
      },
      []
    );

  /* ================================================================
     WOBBLE (in-air drift)
  ================================================================= */

  const wobbleObject =
    useCallback(
      (
        id: number,
        translateX: Animated.Value,
        translateY: Animated.Value,
        maxOffsetX: number,
        maxOffsetY: number
      ) => {
        if (
          !mounted.current ||
          isLeavingRef.current ||
          removingIds.current.has(id)
        ) {
          return;
        }

        const nextX =
          maxOffsetX > 0
            ? (Math.random() * 2 - 1) *
              maxOffsetX
            : 0;

        const nextY =
          maxOffsetY > 0
            ? (Math.random() * 2 - 1) *
              maxOffsetY
            : 0;

        const duration =
          currentConfig.wobbleMinDuration +
          Math.random() *
            (currentConfig.wobbleMaxDuration -
              currentConfig.wobbleMinDuration);

        Animated.parallel([
          Animated.timing(translateX, {
            toValue: nextX,
            duration,
            useNativeDriver: true,
          }),

          Animated.timing(translateY, {
            toValue: nextY,
            duration,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => {
          if (!finished) {
            return;
          }

          wobbleObject(
            id,
            translateX,
            translateY,
            maxOffsetX,
            maxOffsetY
          );
        });
      },
      [currentConfig]
    );

  /* ================================================================
     SPAWN
  ================================================================= */

  const spawnObject =
    useCallback(() => {
      if (
        !mounted.current ||
        isLeavingRef.current ||
        !playing
      ) {
        return;
      }

      if (
        playFieldWidth <= 0 ||
        playFieldHeight <= 0
      ) {
        return;
      }

      const size =
        currentConfig.objectSize;

      const maxX =
        Math.max(
          0,
          playFieldWidth -
            size -
            PLAY_SIDE_MARGIN * 2
        );

      const maxY =
        Math.max(
          0,
          playFieldHeight -
            size -
            PLAY_SIDE_MARGIN * 2
        );

      const x =
        PLAY_SIDE_MARGIN +
        Math.random() * maxX;

      const y =
        PLAY_SIDE_MARGIN +
        Math.random() * maxY;

      const id =
        objectId.current++;

      const isDanger =
        Math.random() <
        currentConfig.dangerProbability;

      const scale =
        new Animated.Value(0);

      const opacity =
        new Animated.Value(1);

      const translateX =
        new Animated.Value(0);

      const translateY =
        new Animated.Value(0);

      const object: GameObject = {
        id,
        isDanger,
        x,
        y,
        scale,
        opacity,
        translateX,
        translateY,
      };

      setObjects(previous => [
        ...previous,
        object,
      ]);

      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 70,
        useNativeDriver: true,
      }).start();

      /*
       * Keep the object drifting around in the air
       * for as long as it stays alive, clamped so it
       * never drifts outside the play field.
       */
      const maxOffsetX =
        Math.max(
          0,
          Math.min(
            currentConfig.wobbleRadius,
            x - PLAY_SIDE_MARGIN,
            PLAY_SIDE_MARGIN +
              maxX -
              x
          )
        );

      const maxOffsetY =
        Math.max(
          0,
          Math.min(
            currentConfig.wobbleRadius,
            y - PLAY_SIDE_MARGIN,
            PLAY_SIDE_MARGIN +
              maxY -
              y
          )
        );

      wobbleObject(
        id,
        translateX,
        translateY,
        maxOffsetX,
        maxOffsetY
      );

      const timer =
        setTimeout(() => {
          if (
            !mounted.current ||
            isLeavingRef.current ||
            removingIds.current.has(id)
          ) {
            return;
          }

          removingIds.current.add(id);

          Animated.parallel([
            Animated.timing(scale, {
              toValue: 0,
              duration: 180,
              useNativeDriver: true,
            }),

            Animated.timing(opacity, {
              toValue: 0,
              duration: 180,
              useNativeDriver: true,
            }),
          ]).start(() => {
            if (
              mounted.current &&
              !isLeavingRef.current
            ) {
              removeObject(id);
            }
          });
        }, currentConfig.lifeTime);

      objectTimers.current.set(
        id,
        timer
      );
    }, [
      playing,
      playFieldWidth,
      playFieldHeight,
      currentConfig,
      removeObject,
      wobbleObject,
    ]);

  /* ================================================================
     PRESS
  ================================================================= */

  const handleObjectPress =
    useCallback(
      (object: GameObject) => {
        if (
          !playing ||
          isLeavingRef.current ||
          !mounted.current
        ) {
          return;
        }

        if (
          removingIds.current.has(
            object.id
          )
        ) {
          return;
        }

        removingIds.current.add(
          object.id
        );

        const delta =
          object.isDanger
            ? -10
            : 10;

        showPopup(
          object.x +
            currentConfig.objectSize /
              2 -
            15,
          object.y,
          delta
        );

        if (object.isDanger) {
          wrongRef.current += 1;

          setWrongCount(
            wrongRef.current
          );

          scoreRef.current =
            Math.max(
              0,
              scoreRef.current - 10
            );

          setScore(
            scoreRef.current
          );

          livesRef.current -= 1;

          setLives(
            livesRef.current
          );

          Animated.sequence([
            Animated.timing(
              flashAnimation,
              {
                toValue: 1,
                duration: 70,
                useNativeDriver: true,
              }
            ),

            Animated.timing(
              flashAnimation,
              {
                toValue: 0,
                duration: 260,
                useNativeDriver: true,
              }
            ),
          ]).start();
        } else {
          correctRef.current += 1;

          setCorrectCount(
            correctRef.current
          );

          scoreRef.current += 10;

          setScore(
            scoreRef.current
          );
        }

        Animated.parallel([
          Animated.timing(
            object.scale,
            {
              toValue:
                object.isDanger
                  ? 1.25
                  : 1.15,
              duration: 80,
              useNativeDriver: true,
            }
          ),

          Animated.timing(
            object.opacity,
            {
              toValue: 0,
              duration: 220,
              useNativeDriver: true,
            }
          ),
        ]).start(() => {
          if (
            mounted.current &&
            !isLeavingRef.current
          ) {
            removeObject(
              object.id
            );
          }
        });
      },
      [
        playing,
        showPopup,
        currentConfig.objectSize,
        flashAnimation,
        removeObject,
      ]
    );

  /* ================================================================
     FINISH
  ================================================================= */

  const finishGame =
    useCallback(
      async (
        successful: boolean
      ) => {
        /*
         * If user already pressed Back, never allow
         * the game completion logic to update the
         * screen after navigation.
         */
        if (
          !mounted.current ||
          isLeavingRef.current
        ) {
          return;
        }

        clearAllTimers();

        setPlaying(false);

        setObjects([]);

        setPopups([]);

        if (!successful) {
          if (!mounted.current) {
            return;
          }

          setGameOver(true);
          setCompleted(false);

          await saveGameResult({
            gameId: 'last-survival',
            gameName:
              language === 'fa'
                ? 'آخرین بازمانده'
                : 'Last Survival',
            timestamp: Date.now(),
            score: scoreRef.current,

            metrics: [
              {
                id: 'last_survival_correct',
                label:
                  language === 'fa'
                    ? 'پاسخ‌های صحیح'
                    : 'Correct Responses',
                value: correctRef.current,
              },
            ],
          });

          return;
        }

        const total =
          correctRef.current +
          wrongRef.current;

        const accuracy =
          total === 0
            ? 0
            : Math.round(
                (correctRef.current /
                  total) *
                  100
              );

        let nextDifficulty =
          difficulty;

        let result:
          | 'up'
          | 'down'
          | 'same' =
          'same';

        if (
          accuracy >= 80 &&
          difficulty <
            MAX_DIFFICULTY
        ) {
          nextDifficulty =
            difficulty + 1;

          result = 'up';
        } else if (
          accuracy < 40 &&
          difficulty >
            MIN_DIFFICULTY
        ) {
          nextDifficulty =
            difficulty - 1;

          result = 'down';
        }

        if (
          !mounted.current ||
          isLeavingRef.current
        ) {
          return;
        }

        setPreviousAccuracy(
          accuracy
        );

        setDifficulty(
          nextDifficulty
        );

        setAdaptiveResult(
          result
        );

        setCompleted(true);

        await saveAdaptiveState(
          nextDifficulty,
          accuracy
        );

        await saveGameResult({
          gameId: 'last-survival',
          gameName:
            language === 'fa'
              ? 'آخرین بازمانده'
              : 'Last Survival',
          timestamp: Date.now(),
          score: scoreRef.current,

          metrics: [
            {
              id: 'last_survival_accuracy',
              label:
                language === 'fa'
                  ? 'دقت'
                  : 'Accuracy',
              value: accuracy,
              unit: '%',
            },
            {
              id: 'last_survival_difficulty',
              label:
                language === 'fa'
                  ? 'سطح دشواری'
                  : 'Difficulty Level',
              value: nextDifficulty,
            },
          ],
        });
      },
      [
        clearAllTimers,
        difficulty,
        saveAdaptiveState,
        language,
      ]
    );

  /* ================================================================
     START
  ================================================================= */

  const startGame =
    useCallback(() => {
      isLeavingRef.current = false;

      clearAllTimers();

      removingIds.current.clear();

      objectId.current = 0;

      popupId.current = 0;

      livesRef.current =
        TOTAL_LIVES;

      scoreRef.current = 0;

      correctRef.current = 0;

      wrongRef.current = 0;

      setLives(
        TOTAL_LIVES
      );

      setScore(0);

      setCorrectCount(0);

      setWrongCount(0);

      setObjects([]);

      setPopups([]);

      setCompleted(false);

      setGameOver(false);

      setAdaptiveResult(null);

      flashAnimation.stopAnimation();
      flashAnimation.setValue(0);

      setPlaying(true);
    }, [
      clearAllTimers,
      flashAnimation,
    ]);

  /* ================================================================
     BACK / EXIT
  ================================================================= */

  const handleBack =
    useCallback(() => {
      /*
       * This is the most important guard.
       *
       * Android BackHandler can sometimes fire more than
       * once during a transition. We allow only one exit.
       */
      if (isLeavingRef.current) {
        return;
      }

      isLeavingRef.current = true;

      /*
       * Stop the game BEFORE navigation.
       */
      cleanupGame();

      /*
       * Reset animations.
       */
      flashAnimation.stopAnimation();
      flashAnimation.setValue(0);

      /*
       * Android / iOS navigation.
       *
       * If there is a route in the stack, go back.
       * Otherwise go safely to the app root instead of
       * allowing Android to close the Activity.
       */
      try {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/');
        }
      } catch (error) {
        console.log(
          '[LastSurvival] Navigation error:',
          error
        );

        /*
         * Emergency fallback.
         *
         * This prevents the screen from remaining in
         * an invalid state if navigation throws.
         */
        try {
          router.replace('/');
        } catch (fallbackError) {
          console.log(
            '[LastSurvival] Navigation fallback error:',
            fallbackError
          );
        }
      }
    }, [
      cleanupGame,
      flashAnimation,
      router,
    ]);

  /* ================================================================
     ANDROID HARDWARE BACK
  ================================================================= */

  useEffect(() => {
    /*
     * Web does not need Android BackHandler.
     */
    if (Platform.OS !== 'android') {
      return;
    }

    /*
     * This handler is registered while this screen is mounted.
     *
     * Returning TRUE tells Android:
     *
     * "The back press has been handled."
     *
     * Therefore Android must NOT close the Activity.
     */
    const subscription =
      BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          if (
            isLeavingRef.current
          ) {
            return true;
          }

          handleBack();

          return true;
        }
      );

    return () => {
      subscription.remove();
    };
  }, [handleBack]);

  /* ================================================================
     UNMOUNT CLEANUP
  ================================================================= */

  useEffect(() => {
    return () => {
      mounted.current = false;

      isLeavingRef.current = true;

      clearAllTimers();

      removingIds.current.clear();

      flashAnimation.stopAnimation();
    };
  }, [
    clearAllTimers,
    flashAnimation,
  ]);

  /* ================================================================
     GAME TIMER
  ================================================================= */

  useEffect(() => {
    if (
      !playing ||
      isLeavingRef.current
    ) {
      return;
    }

    if (
      playFieldWidth <= 0 ||
      playFieldHeight <= 0
    ) {
      return;
    }

    gameTimer.current =
      setTimeout(() => {
        if (
          mounted.current &&
          !isLeavingRef.current
        ) {
          finishGame(true);
        }
      }, currentConfig.duration);

    return () => {
      if (gameTimer.current) {
        clearTimeout(
          gameTimer.current
        );

        gameTimer.current = null;
      }
    };
  }, [
    playing,
    playFieldWidth,
    playFieldHeight,
    currentConfig.duration,
    finishGame,
  ]);

  /* ================================================================
     SPAWN TIMER
  ================================================================= */

  useEffect(() => {
    if (
      !playing ||
      isLeavingRef.current
    ) {
      return;
    }

    if (
      playFieldWidth <= 0 ||
      playFieldHeight <= 0
    ) {
      return;
    }

    const initialTimer =
      setTimeout(() => {
        if (
          mounted.current &&
          !isLeavingRef.current
        ) {
          spawnObject();
        }
      }, 100);

    spawnTimer.current =
      setInterval(() => {
        if (
          !mounted.current ||
          isLeavingRef.current
        ) {
          return;
        }

        /*
         * Do NOT update state merely to decide
         * whether we can spawn.
         *
         * This also avoids nested state updates.
         */
        setObjects(previous => {
          if (
            previous.length >=
            currentConfig.maxObjects
          ) {
            return previous;
          }

          spawnObject();

          return previous;
        });
      }, currentConfig.spawnInterval);

    return () => {
      clearTimeout(
        initialTimer
      );

      if (
        spawnTimer.current
      ) {
        clearInterval(
          spawnTimer.current
        );

        spawnTimer.current = null;
      }
    };
  }, [
    playing,
    playFieldWidth,
    playFieldHeight,
    currentConfig.spawnInterval,
    currentConfig.maxObjects,
    spawnObject,
  ]);

  /* ================================================================
     LIVES
  ================================================================= */

  useEffect(() => {
    if (
      playing &&
      lives <= 0 &&
      !isLeavingRef.current
    ) {
      const timer =
        setTimeout(() => {
          if (
            mounted.current &&
            !isLeavingRef.current
          ) {
            finishGame(false);
          }
        }, 100);

      return () =>
        clearTimeout(timer);
    }

    return undefined;
  }, [
    lives,
    playing,
    finishGame,
  ]);

  /* ================================================================
     START SCREEN
  ================================================================= */

  if (
    !playing &&
    !completed &&
    !gameOver
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
        <PageHeader
          title={text.title}
          subtitle={
            text.noLevelSelection
          }
          onBack={handleBack}
          colors={colors}
          isRTL={isRTL}
          backLabel={text.back}
        />

        <ScrollView
          style={
            styles.startScroll
          }
          contentContainerStyle={
            styles.startScrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={
              styles.startContent
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
              <Shield
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
              {text.instruction}
            </Text>

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
                  {text.adaptive}
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
                  {text.adaptiveInfo}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.currentLevelCard,
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
                  {text.difficulty}
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
                  {difficultyName}
                </Text>
              </View>

              <Target
                size={27}
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
                <TrendingUp
                  size={24}
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
                    {text.accuracy}
                  </Text>

                  <Text
                    style={[
                      styles.previousValue,
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
                    {previousAccuracy}%
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={startGame}
              style={[
                styles.startButton,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >
              <Zap
                size={21}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.startButtonText
                }
              >
                {text.start}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  /* ================================================================
     GAME OVER
  ================================================================= */

  if (gameOver) {
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
        <PageHeader
          title={text.gameOver}
          subtitle={text.title}
          onBack={handleBack}
          colors={colors}
          isRTL={isRTL}
          backLabel={text.back}
        />

        <ScrollView
          style={
            styles.resultScroll
          }
          contentContainerStyle={
            styles.resultScrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={
              styles.resultContent
            }
          >
            <View
              style={[
                styles.resultIcon,
                {
                  backgroundColor:
                    '#EF4444' +
                    '15',
                },
              ]}
            >
              <XCircle
                size={48}
                color="#EF4444"
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
              {text.gameOver}
            </Text>

            <Text
              style={[
                styles.resultScore,
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
                styles.resultLabel,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {text.score}
            </Text>

            <View
              style={[
                styles.statsCard,
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
                  styles.statItem
                }
              >
                <CheckCircle
                  size={22}
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
                  {text.correct}
                </Text>
              </View>

              <View
                style={
                  styles.statItem
                }
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

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={startGame}
              style={[
                styles.startButton,
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
                  styles.startButtonText
                }
              >
                {text.playAgain}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  /* ================================================================
     COMPLETED
  ================================================================= */

  if (completed) {
    const total =
      correctCount +
      wrongCount;

    const accuracy =
      total > 0
        ? Math.round(
            (correctCount /
              total) *
              100
          )
        : 0;

    const nextConfig =
      DIFFICULTIES[
        Math.max(
          0,
          Math.min(
            difficulty - 1,
            DIFFICULTIES.length - 1
          )
        )
      ];

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
        <PageHeader
          title={text.completed}
          subtitle={text.title}
          onBack={handleBack}
          colors={colors}
          isRTL={isRTL}
          backLabel={text.back}
        />

        <ScrollView
          style={
            styles.resultScroll
          }
          contentContainerStyle={
            styles.resultScrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={
              styles.resultContent
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
              {text.completed}
            </Text>

            <Text
              style={[
                styles.resultScore,
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
                styles.resultLabel,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {text.score}
            </Text>

            <View
              style={[
                styles.accuracyCard,
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
                  styles.accuracyValue,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                {accuracy}%
              </Text>

              <Text
                style={[
                  styles.accuracyLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {text.accuracy}
              </Text>
            </View>

            <View
              style={[
                styles.statsCard,
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
                  styles.statItem
                }
              >
                <CheckCircle
                  size={22}
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
                  {text.correct}
                </Text>
              </View>

              <View
                style={
                  styles.statItem
                }
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
                styles.adaptiveResultCard,
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
                color={
                  colors.primary
                }
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
                    ? text.adaptiveUp
                    : adaptiveResult ===
                        'down'
                      ? text.adaptiveDown
                      : text.adaptiveSame}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.nextLevelCard,
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
                {text.difficulty}
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
                {language === 'fa'
                  ? nextConfig.nameFa
                  : nextConfig.nameEn}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={startGame}
              style={[
                styles.startButton,
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
                  styles.startButtonText
                }
              >
                {text.playAgain}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  /* ================================================================
     ACTIVE GAME
  ================================================================= */

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
      <PageHeader
        title={text.title}
        subtitle={`${text.level} ${difficultyName}`}
        onBack={handleBack}
        colors={colors}
        isRTL={isRTL}
        backLabel={text.back}
      />

      {/* HUD */}

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
          style={
            styles.hudItem
          }
        >
          <Zap
            size={19}
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
            styles.livesContainer
          }
        >
          {Array.from({
            length:
              TOTAL_LIVES,
          }).map(
            (_, index) => (
              <Heart
                key={index}
                size={20}
                color={
                  index <
                  lives
                    ? '#EF4444'
                    : colors.border
                }
                fill={
                  index <
                  lives
                    ? '#EF4444'
                    : 'transparent'
                }
              />
            )
          )}
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
          size={19}
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
          {text.instruction}
        </Text>
      </View>

      {/* GAME AREA */}

      <View
        style={
          styles.playField
        }
        onLayout={event => {
          const {
            width: fieldWidth,
            height: fieldHeight,
          } =
            event.nativeEvent.layout;

          setPlayFieldWidth(
            fieldWidth
          );

          setPlayFieldHeight(
            fieldHeight
          );
        }}
      >
        {objects.map(
          object => (
            <Animated.View
              key={object.id}
              style={[
                styles.objectWrapper,
                {
                  left:
                    object.x,
                  top:
                    object.y,
                  width:
                    currentConfig.objectSize,
                  height:
                    currentConfig.objectSize,
                  opacity:
                    object.opacity,
                  transform: [
                    {
                      scale:
                        object.scale,
                    },
                    {
                      translateX:
                        object.translateX,
                    },
                    {
                      translateY:
                        object.translateY,
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() =>
                  handleObjectPress(
                    object
                  )
                }
                style={
                  styles.imageButton
                }
              >
                <Image
                  source={
                    object.isDanger
                      ? GAME_IMAGES.danger
                      : GAME_IMAGES.safe
                  }
                  resizeMode="contain"
                  style={
                    styles.gameImage
                  }
                />
              </TouchableOpacity>
            </Animated.View>
          )
        )}

        {popups.map(
          popup => (
            <Animated.View
              key={popup.id}
              pointerEvents="none"
              style={[
                styles.popup,
                {
                  left:
                    popup.x,
                  top:
                    popup.y,
                  opacity:
                    popup.opacity,
                  transform: [
                    {
                      translateY:
                        popup.translateY,
                    },
                  ],
                },
              ]}
            >
              <Text
                style={[
                  styles.popupText,
                  {
                    color:
                      popup.value >
                      0
                        ? '#22C55E'
                        : '#EF4444',
                  },
                ]}
              >
                {popup.value > 0
                  ? '+'
                  : ''}
                {popup.value}
              </Text>
            </Animated.View>
          )
        )}
      </View>

      {/* ERROR FLASH */}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.flashOverlay,
          {
            opacity:
              flashAnimation.interpolate(
                {
                  inputRange: [
                    0,
                    1,
                  ],
                  outputRange: [
                    0,
                    0.12,
                  ],
                }
              ),
          },
        ]}
      />
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
      overflow: 'hidden',
    },

    pageHeader: {
      width: '100%',
      paddingHorizontal:
        Spacing.lg,
      paddingTop: 58,
      paddingBottom: 14,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth:
        StyleSheet.hairlineWidth,
      zIndex: 50,
    },

    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      flexShrink: 0,
    },

    headerTextContainer: {
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
      marginTop: 3,
      lineHeight: 18,
    },

    startScroll: {
      flex: 1,
    },

    startScrollContent: {
      flexGrow: 1,
      paddingBottom: 40,
    },

    startContent: {
      paddingHorizontal:
        Spacing.lg,
      alignItems: 'center',
      paddingTop: 30,
      paddingBottom: 30,
    },

    heroIcon: {
      width: 86,
      height: 86,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },

    heroTitle: {
      fontSize: 27,
      fontWeight: '900',
      textAlign: 'center',
    },

    heroDescription: {
      fontSize: 14,
      lineHeight: 22,
      textAlign: 'center',
      marginTop: 9,
      maxWidth: 340,
    },

    adaptiveCard: {
      width: '100%',
      marginTop: 22,
      padding: Spacing.md,
      borderRadius:
        BorderRadius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    adaptiveIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
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

    currentLevelCard: {
      width: '100%',
      marginTop: 12,
      paddingHorizontal:
        Spacing.md,
      paddingVertical: 13,
      borderRadius:
        BorderRadius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    levelLabel: {
      fontSize: 11,
    },

    levelValue: {
      fontSize: 18,
      fontWeight: '900',
      marginTop: 2,
    },

    previousCard: {
      width: '100%',
      marginTop: 12,
      padding: Spacing.md,
      borderRadius:
        BorderRadius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    previousText: {
      flex: 1,
    },

    previousLabel: {
      fontSize: 11,
    },

    previousValue: {
      fontSize: 20,
      fontWeight: '900',
      marginTop: 2,
    },

    startButton: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      borderRadius:
        BorderRadius.full,
      marginTop: 18,
    },

    startButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },

    hud: {
      position: 'absolute',
      top: 112,
      left: 12,
      right: 12,
      zIndex: 30,
      height: 58,
      borderRadius:
        BorderRadius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
    },

    hudItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    hudLabel: {
      fontSize: 9,
    },

    hudValue: {
      fontSize: 17,
      fontWeight: '900',
      marginTop: 1,
    },

    livesContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },

    instructionCard: {
      position: 'absolute',
      top: 177,
      left: 18,
      right: 18,
      zIndex: 30,
      minHeight: 42,
      borderRadius:
        BorderRadius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },

    instructionText: {
      fontSize: 12,
      lineHeight: 18,
      flexShrink: 1,
    },

    playField: {
      position: 'absolute',
      top: 225,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      zIndex: 5,
    },

    objectWrapper: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },

    imageButton: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'transparent',
      borderWidth: 0,
      padding: 0,
      margin: 0,
    },

    gameImage: {
      width: '100%',
      height: '100%',
      borderWidth: 0,
    },

    popup: {
      position: 'absolute',
      zIndex: 100,
      minWidth: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },

    popupText: {
      fontSize: 22,
      fontWeight: '900',
      textShadowColor:
        'rgba(0,0,0,0.15)',
      textShadowOffset: {
        width: 0,
        height: 1,
      },
      textShadowRadius: 2,
    },

    flashOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor:
        '#EF4444',
      zIndex: 200,
    },

    resultScroll: {
      flex: 1,
    },

    resultScrollContent: {
      flexGrow: 1,
      paddingBottom: 50,
    },

    resultContent: {
      paddingHorizontal:
        Spacing.lg,
      alignItems: 'center',
      paddingTop: 28,
      paddingBottom: 30,
    },

    resultIcon: {
      width: 84,
      height: 84,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },

    resultTitle: {
      fontSize: 24,
      fontWeight: '900',
      textAlign: 'center',
    },

    resultScore: {
      fontSize: 50,
      fontWeight: '900',
      marginTop: 14,
    },

    resultLabel: {
      fontSize: 13,
      marginTop: -3,
    },

    accuracyCard: {
      width: '100%',
      marginTop: 18,
      paddingVertical: 14,
      borderRadius:
        BorderRadius.lg,
      borderWidth: 1,
      alignItems: 'center',
    },

    accuracyValue: {
      fontSize: 28,
      fontWeight: '900',
    },

    accuracyLabel: {
      fontSize: 11,
      marginTop: 2,
    },

    statsCard: {
      width: '100%',
      marginTop: 12,
      paddingVertical: 16,
      borderRadius:
        BorderRadius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
    },

    statItem: {
      alignItems: 'center',
      minWidth: 80,
    },

    statValue: {
      fontSize: 20,
      fontWeight: '900',
      marginTop: 5,
    },

    statLabel: {
      fontSize: 10,
      marginTop: 2,
    },

    adaptiveResultCard: {
      width: '100%',
      marginTop: 12,
      padding: Spacing.md,
      borderRadius:
        BorderRadius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    adaptiveResultText: {
      flex: 1,
    },

    adaptiveResultTitle: {
      fontSize: 14,
      fontWeight: '800',
    },

    adaptiveResultDescription: {
      fontSize: 11,
      lineHeight: 18,
      marginTop: 3,
    },

    nextLevelCard: {
      width: '100%',
      marginTop: 12,
      padding: Spacing.md,
      borderRadius:
        BorderRadius.lg,
      borderWidth: 1,
    },

    nextLevelLabel: {
      fontSize: 10,
    },

    nextLevelValue: {
      fontSize: 18,
      fontWeight: '900',
      marginTop: 3,
    },
  });