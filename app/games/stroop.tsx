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
  useWindowDimensions,
  Animated,
  LayoutChangeEvent,
} from 'react-native';

import { MotiView } from 'moti';
import { useRouter } from 'expo-router';

import {
  ArrowLeft,
  Trophy,
  Zap,
  Heart,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Languages,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAssessment } from '../../context/AssessmentContext';

import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';

/* ================================================================
   TYPES
================================================================ */

type GameLanguage = 'fa' | 'en';

type DifficultyLevel = {
  name: string;
  nameFa: string;
  colorCount: number;
  roundTime: number;
  totalRounds: number;
  minScore: number;
};

type ColorDef = {
  key: string;
  en: string;
  fa: string;
  hex: string;
};

type ScorePopup = {
  id: number;
  value: number;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
  anim: Animated.Value;
};

/* ================================================================
   COLORS
================================================================ */

const COLOR_POOL: ColorDef[] = [
  {
    key: 'red',
    en: 'RED',
    fa: 'قرمز',
    hex: '#EF4444',
  },
  {
    key: 'blue',
    en: 'BLUE',
    fa: 'آبی',
    hex: '#3B82F6',
  },
  {
    key: 'green',
    en: 'GREEN',
    fa: 'سبز',
    hex: '#22C55E',
  },
  {
    key: 'yellow',
    en: 'YELLOW',
    fa: 'زرد',
    hex: '#EAB308',
  },
  {
    key: 'purple',
    en: 'PURPLE',
    fa: 'بنفش',
    hex: '#A855F7',
  },
  {
    key: 'orange',
    en: 'ORANGE',
    fa: 'نارنجی',
    hex: '#F97316',
  },
  {
    key: 'pink',
    en: 'PINK',
    fa: 'صورتی',
    hex: '#EC4899',
  },
  {
    key: 'cyan',
    en: 'CYAN',
    fa: 'فیروزه‌ای',
    hex: '#06B6D4',
  },
];

/* ================================================================
   DIFFICULTY
================================================================ */

const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  {
    name: 'Easy',
    nameFa: 'آسان',
    colorCount: 4,
    roundTime: 4000,
    totalRounds: 12,
    minScore: 0,
  },
  {
    name: 'Medium',
    nameFa: 'متوسط',
    colorCount: 5,
    roundTime: 3000,
    totalRounds: 15,
    minScore: 40,
  },
  {
    name: 'Hard',
    nameFa: 'سخت',
    colorCount: 6,
    roundTime: 2200,
    totalRounds: 18,
    minScore: 65,
  },
  {
    name: 'Extreme',
    nameFa: 'حرفه‌ای',
    colorCount: 8,
    roundTime: 1600,
    totalRounds: 20,
    minScore: 85,
  },
];

const DEFAULT_USER_SCORE = 50;

const PARTICLE_COUNT = 10;

const GRID_HORIZONTAL_PADDING = Spacing.lg;

const GRID_GAP = 12;

/* ================================================================
   HELPERS
================================================================ */

function shuffle<T>(input: T[]): T[] {
  const arr = [...input];

  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

/**
 * Converts the user's assessment result into a
 * difficulty level automatically.
 *
 * Stroop primarily targets attention, therefore
 * attention score is preferred.
 */
function getDifficultyFromAssessment(
  results: Array<{
    domain: string;
    score: number;
  }>,
): DifficultyLevel {
  if (!results || results.length === 0) {
    return DIFFICULTY_LEVELS[1];
  }

  const attentionResult = results.find(
    (result) => result.domain === 'attention',
  );

  const scoreSource = attentionResult
    ? attentionResult.score
    : results.reduce(
        (sum, result) => sum + result.score,
        0,
      ) / results.length;

  const safeScore = Math.max(
    0,
    Math.min(100, Number(scoreSource) || DEFAULT_USER_SCORE),
  );

  if (safeScore >= 85) {
    return DIFFICULTY_LEVELS[3];
  }

  if (safeScore >= 65) {
    return DIFFICULTY_LEVELS[2];
  }

  if (safeScore >= 40) {
    return DIFFICULTY_LEVELS[1];
  }

  return DIFFICULTY_LEVELS[0];
}

/* ================================================================
   MAIN SCREEN
================================================================ */

export default function StroopTestScreen() {
  const { colors } = useTheme();

  const {
    t,
    language,
    isRTL,
  } = useLanguage();

  const {
    results: assessmentResults,
    isLoading: assessmentLoading,
  } = useAssessment();

  const router = useRouter();

  const { width } = useWindowDimensions();

  /* ==============================================================
     GAME LANGUAGE

     مهم:
     زبان بازی مستقل از زبان اپ است.
  ============================================================== */

  const [
    gameLanguage,
    setGameLanguage,
  ] = useState<GameLanguage | null>(null);

  /* ==============================================================
     AUTOMATIC DIFFICULTY
  ============================================================== */

  const difficulty = useMemo(() => {
    return getDifficultyFromAssessment(
      assessmentResults,
    );
  }, [assessmentResults]);

  /* ==============================================================
     GAME STATE
  ============================================================== */

  const [playing, setPlaying] =
    useState(false);

  const [score, setScore] =
    useState(0);

  const [lives, setLives] =
    useState(3);

  const [roundIndex, setRoundIndex] =
    useState(0);

  const [wordKey, setWordKey] =
    useState('red');

  const [inkKey, setInkKey] =
    useState('blue');

  const [options, setOptions] =
    useState<ColorDef[]>([]);

  const [popups, setPopups] =
    useState<ScorePopup[]>([]);

  const [particles, setParticles] =
    useState<Particle[]>([]);

  const [gameOver, setGameOver] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  const [flashColor, setFlashColor] =
    useState('#EF4444');

  /* ==============================================================
     DERIVED VALUES
  ============================================================== */

  const swatchWidth =
    (width -
      GRID_HORIZONTAL_PADDING * 2 -
      GRID_GAP) /
    2;

  const swatchHeight =
    swatchWidth / 2.1;

  const wordColor =
    COLOR_POOL.find(
      (color) => color.key === wordKey,
    ) || COLOR_POOL[0];

  const inkColor =
    COLOR_POOL.find(
      (color) => color.key === inkKey,
    ) || COLOR_POOL[1];

  const textAlignStyle =
    isRTL ? 'right' : 'left';

  const colorName = useCallback(
    (color: ColorDef) => {
      return gameLanguage === 'fa'
        ? color.fa
        : color.en;
    },
    [gameLanguage],
  );

  /* ==============================================================
     REFS
  ============================================================== */

  const roundIdRef = useRef(0);

  const answeredRef =
    useRef(false);

  const popupId =
    useRef(0);

  const particleId =
    useRef(0);

  const buttonLayouts =
    useRef<
      Record<
        string,
        {
          x: number;
          y: number;
          w: number;
          h: number;
        }
      >
    >({});

  const timerAnim =
    useRef(
      new Animated.Value(1),
    ).current;

  const timerRunRef =
    useRef<
      Animated.CompositeAnimation | null
    >(null);

  const wordScale =
    useRef(
      new Animated.Value(0.7),
    ).current;

  const flashAnim =
    useRef(
      new Animated.Value(0),
    ).current;

  const shakeAnim =
    useRef(
      new Animated.Value(0),
    ).current;

  /* ==============================================================
     CLEANUP
  ============================================================== */

  useEffect(() => {
    return () => {
      timerRunRef.current?.stop();

      roundIdRef.current += 1;

      answeredRef.current = true;
    };
  }, []);

  /* ==============================================================
     UI TEXT
  ============================================================== */

  const text = useMemo(() => {
    if (language === 'fa') {
      return {
        title: 'استروپ دیجیتال',

        subtitle:
          'رنگ نوشته را تشخیص بده، نه خود کلمه را',

        chooseLanguage:
          'زبان بازی را انتخاب کنید',

        languageDescription:
          'می‌توانید بازی استروپ را به فارسی یا انگلیسی انجام دهید.',

        persian: 'فارسی',

        english: 'English',

        persianDescription:
          'نام رنگ‌ها به فارسی',

        englishDescription:
          'نام رنگ‌ها به انگلیسی',

        instruction:
          'رنگ واقعی نوشته را انتخاب کنید.',

        example:
          'مثلاً اگر کلمه «قرمز» با رنگ آبی نمایش داده شد، باید آبی را انتخاب کنید.',

        chooseInk:
          'رنگ نوشته را انتخاب کنید',

        round:
          'مرحله',

        finalScore:
          'امتیاز نهایی',

        gameCompleted:
          'بازی با موفقیت تمام شد',

        gameOver:
          'بازی تمام شد',

        playAgain:
          'دوباره بازی کن',

        changeLanguage:
          'تغییر زبان بازی',

        back:
          'بازگشت',

        score:
          'امتیاز',

        level:
          'سطح عملکرد',

        easy:
          'آسان',

        medium:
          'متوسط',

        hard:
          'سخت',

        extreme:
          'حرفه‌ای',

        assessmentLoading:
          'در حال بررسی سطح عملکرد شما...',

        automaticDifficulty:
          'سطح بازی بر اساس ارزیابی شناختی شما تنظیم شده است.',

        noAssessment:
          'برای شروع، سطح متوسط به‌صورت پیش‌فرض انتخاب شده است.',
      };
    }

    return {
      title: 'Digital Stroop',

      subtitle:
        'Identify the ink color, not the word',

      chooseLanguage:
        'Choose your game language',

      languageDescription:
        'You can play Stroop in Persian or English.',

      persian: 'فارسی',

      english: 'English',

      persianDescription:
        'Color names in Persian',

      englishDescription:
        'Color names in English',

      instruction:
        'Choose the actual ink color.',

      example:
        'For example, if RED is displayed in blue, select BLUE.',

      chooseInk:
        'Choose the ink color',

      round:
        'Round',

      finalScore:
        'Final score',

      gameCompleted:
        'Game completed',

      gameOver:
        'Game over',

      playAgain:
        'Play Again',

      changeLanguage:
        'Change Game Language',

      back:
        'Back',

      score:
        'Score',

      level:
        'Performance Level',

      easy:
        'Easy',

      medium:
        'Medium',

      hard:
        'Hard',

      extreme:
        'Extreme',

      assessmentLoading:
        'Checking your performance level...',

      automaticDifficulty:
        'Game difficulty is automatically based on your cognitive assessment.',

      noAssessment:
        'No assessment was found, so Medium difficulty is used by default.',
    };
  }, [language]);

  /* ==============================================================
     LEVEL NAME
  ============================================================== */

  const difficultyName =
    gameLanguage === 'fa'
      ? difficulty.nameFa
      : difficulty.name;

  /* ==============================================================
     BACK
  ============================================================== */

  const handleBack =
    useCallback(() => {
      timerRunRef.current?.stop();

      timerRunRef.current = null;

      roundIdRef.current += 1;

      answeredRef.current = true;

      router.back();
    }, [router]);

  /* ==============================================================
     FLASH
  ============================================================== */

  const triggerFlash =
    useCallback((color: string) => {
      setFlashColor(color);

      Animated.sequence([
        Animated.timing(
          flashAnim,
          {
            toValue: 1,
            duration: 70,
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          flashAnim,
          {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
          },
        ),
      ]).start();
    }, [flashAnim]);

  /* ==============================================================
     SHAKE
  ============================================================== */

  const triggerShake =
    useCallback(() => {
      shakeAnim.setValue(0);

      Animated.sequence([
        Animated.timing(
          shakeAnim,
          {
            toValue: 1,
            duration: 45,
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          shakeAnim,
          {
            toValue: -1,
            duration: 45,
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          shakeAnim,
          {
            toValue: 1,
            duration: 45,
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          shakeAnim,
          {
            toValue: 0,
            duration: 45,
            useNativeDriver: true,
          },
        ),
      ]).start();
    }, [shakeAnim]);

  /* ==============================================================
     SCORE POPUP
  ============================================================== */

  const spawnPopup =
    useCallback((value: number) => {
      const id =
        popupId.current++;

      setPopups((previous) => [
        ...previous,
        {
          id,
          value,
        },
      ]);

      setTimeout(() => {
        setPopups((previous) =>
          previous.filter(
            (popup) =>
              popup.id !== id,
          ),
        );
      }, 700);
    }, []);

  /* ==============================================================
     PARTICLE EXPLOSION
  ============================================================== */

  const spawnExplosion =
    useCallback(
      (
        centerX: number,
        centerY: number,
        color: string,
      ) => {
        const newParticles: Particle[] =
          [];

        for (
          let i = 0;
          i < PARTICLE_COUNT;
          i += 1
        ) {
          const angle =
            (Math.PI * 2 * i) /
              PARTICLE_COUNT +
            (Math.random() * 0.4 -
              0.2);

          const distance =
            30 +
            Math.random() * 40;

          const size =
            5 +
            Math.random() * 7;

          const id =
            particleId.current++;

          const anim =
            new Animated.Value(0);

          newParticles.push({
            id,
            x: centerX,
            y: centerY,
            angle,
            distance,
            color,
            size,
            anim,
          });
        }

        setParticles((previous) => [
          ...previous,
          ...newParticles,
        ]);

        newParticles.forEach(
          (particle) => {
            Animated.timing(
              particle.anim,
              {
                toValue: 1,
                duration:
                  450 +
                  Math.random() * 100,
                useNativeDriver: true,
              },
            ).start(
              ({ finished }) => {
                if (finished) {
                  setParticles(
                    (previous) =>
                      previous.filter(
                        (item) =>
                          item.id !==
                          particle.id,
                      ),
                  );
                }
              },
            );
          },
        );
      },
      [],
    );

  /* ==============================================================
     BEGIN ROUND
  ============================================================== */

  const beginRound =
    useCallback(
      (currentDifficulty: DifficultyLevel) => {
        roundIdRef.current += 1;

        const thisRoundId =
          roundIdRef.current;

        answeredRef.current = false;

        const pool =
          COLOR_POOL.slice(
            0,
            currentDifficulty.colorCount,
          );

        const word =
          pool[
            Math.floor(
              Math.random() *
                pool.length,
            )
          ];

        const inkCandidates =
          pool.filter(
            (color) =>
              color.key !==
              word.key,
          );

        const ink =
          inkCandidates[
            Math.floor(
              Math.random() *
                inkCandidates.length,
            )
          ];

        setWordKey(word.key);

        setInkKey(ink.key);

        setOptions(
          shuffle(pool),
        );

        wordScale.setValue(0.7);

        Animated.spring(
          wordScale,
          {
            toValue: 1,
            friction: 5,
            tension: 70,
            useNativeDriver: true,
          },
        ).start();

        timerAnim.setValue(1);

        timerRunRef.current =
          Animated.timing(
            timerAnim,
            {
              toValue: 0,
              duration:
                currentDifficulty.roundTime,
              useNativeDriver: false,
            },
          );

        timerRunRef.current.start(
          ({ finished }) => {
            if (
              finished &&
              !answeredRef.current &&
              thisRoundId ===
                roundIdRef.current
            ) {
              handleTimeout(
                thisRoundId,
              );
            }
          },
        );
      },
      [timerAnim, wordScale],
    );

  /* ==============================================================
     END GAME
  ============================================================== */

  const endGame =
    useCallback(
      (success: boolean) => {
        timerRunRef.current?.stop();

        timerRunRef.current =
          null;

        setPlaying(false);

        if (success) {
          setCompleted(true);
        } else {
          setGameOver(true);
        }
      },
      [],
    );

  /* ==============================================================
     NEXT ROUND
  ============================================================== */

  const proceedToNext =
    useCallback(() => {
      setRoundIndex(
        (previous) => {
          const next =
            previous + 1;

          if (
            next >=
            difficulty.totalRounds
          ) {
            endGame(true);

            return previous;
          }

          beginRound(
            difficulty,
          );

          return next;
        },
      );
    }, [
      beginRound,
      difficulty,
      endGame,
    ]);

  /* ==============================================================
     TIMEOUT
  ============================================================== */

  const handleTimeout =
    useCallback(
      (roundId: number) => {
        if (
          roundId !==
          roundIdRef.current
        ) {
          return;
        }

        answeredRef.current =
          true;

        triggerFlash(
          '#EF4444',
        );

        triggerShake();

        spawnPopup(-5);

        setScore(
          (previous) =>
            previous - 5,
        );

        setLives(
          (previous) => {
            const newLives =
              previous - 1;

            if (
              newLives <= 0
            ) {
              setTimeout(
                () => {
                  endGame(false);
                },
                500,
              );
            } else {
              setTimeout(
                () => {
                  proceedToNext();
                },
                500,
              );
            }

            return newLives;
          },
        );
      },
      [
        endGame,
        proceedToNext,
        spawnPopup,
        triggerFlash,
        triggerShake,
      ],
    );

  /* ==============================================================
     ANSWER
  ============================================================== */

  const handleAnswer =
    useCallback(
      (selected: ColorDef) => {
        if (
          !playing ||
          answeredRef.current
        ) {
          return;
        }

        answeredRef.current =
          true;

        timerRunRef.current?.stop();

        const layout =
          buttonLayouts.current[
            selected.key
          ];

        const centerX = layout
          ? layout.x +
            layout.w / 2
          : width / 2;

        const centerY = layout
          ? layout.y +
            layout.h / 2
          : 0;

        const isCorrect =
          selected.key ===
          inkKey;

        if (isCorrect) {
          spawnExplosion(
            centerX,
            centerY,
            inkColor.hex,
          );

          spawnPopup(10);

          setScore(
            (previous) =>
              previous + 10,
          );

          setTimeout(() => {
            proceedToNext();
          }, 400);

          return;
        }

        triggerFlash(
          '#EF4444',
        );

        triggerShake();

        spawnPopup(-5);

        setScore(
          (previous) =>
            previous - 5,
        );

        setLives(
          (previous) => {
            const newLives =
              previous - 1;

            if (
              newLives <= 0
            ) {
              setTimeout(
                () => {
                  endGame(false);
                },
                500,
              );
            } else {
              setTimeout(
                () => {
                  proceedToNext();
                },
                500,
              );
            }

            return newLives;
          },
        );
      },
      [
        endGame,
        inkColor.hex,
        inkKey,
        playing,
        proceedToNext,
        spawnExplosion,
        spawnPopup,
        triggerFlash,
        triggerShake,
        width,
      ],
    );

  /* ==============================================================
     START GAME
  ============================================================== */

  const startGame =
    useCallback(
      (
        selectedLanguage: GameLanguage,
      ) => {
        setGameLanguage(
          selectedLanguage,
        );

        setPlaying(true);

        setGameOver(false);

        setCompleted(false);

        setScore(0);

        setLives(3);

        setRoundIndex(0);

        setPopups([]);

        setParticles([]);

        buttonLayouts.current =
          {};

        roundIdRef.current += 1;

        answeredRef.current =
          false;

        requestAnimationFrame(
          () => {
            beginRound(
              difficulty,
            );
          },
        );
      },
      [beginRound, difficulty],
    );

  /* ==============================================================
     RESTART
  ============================================================== */

  const restartGame =
    useCallback(() => {
      if (
        !gameLanguage
      ) {
        return;
      }

      startGame(
        gameLanguage,
      );
    }, [
      gameLanguage,
      startGame,
    ]);

  /* ==============================================================
     CHANGE LANGUAGE
  ============================================================== */

  const changeLanguage =
    useCallback(() => {
      timerRunRef.current?.stop();

      timerRunRef.current =
        null;

      roundIdRef.current += 1;

      answeredRef.current =
        true;

      setPlaying(false);

      setGameOver(false);

      setCompleted(false);

      setScore(0);

      setLives(3);

      setRoundIndex(0);

      setGameLanguage(null);

      setPopups([]);

      setParticles([]);
    }, []);

  /* ==============================================================
     RECORD BUTTON POSITION
  ============================================================== */

  const recordLayout =
    useCallback(
      (key: string) =>
        (
          event: LayoutChangeEvent,
        ) => {
          const {
            x,
            y,
            width: buttonWidth,
            height,
          } =
            event.nativeEvent
              .layout;

          buttonLayouts.current[
            key
          ] = {
            x,
            y,
            w: buttonWidth,
            h: height,
          };
        },
      [],
    );

  /* ==============================================================
     TIMER
  ============================================================== */

  const timerWidth =
    timerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [
        '0%',
        '100%',
      ],
    });

  /* ==============================================================
     SHAKE
  ============================================================== */

  const shakeTranslate =
    shakeAnim.interpolate({
      inputRange: [-1, 0, 1],
      outputRange: [
        -8,
        0,
        8,
      ],
    });

  /* ==============================================================
     LANGUAGE SELECTION
  ============================================================== */

  if (
    !gameLanguage &&
    !playing &&
    !gameOver &&
    !completed
  ) {
    return (
      <ScrollView
        style={[
          styles.container,
          {
            backgroundColor:
              colors.background,
          },
        ]}
        contentContainerStyle={
          styles.languageScrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* BACK */}

        <TouchableOpacity
          onPress={
            handleBack
          }
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={
            text.back
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
            strokeWidth={2.3}
            color={
              colors.text
            }
          />
        </TouchableOpacity>

        {/* HEADER */}

        <View
          style={
            styles.languageHeader
          }
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor:
                  colors.primary +
                  '20',
              },
            ]}
          >
            <Zap
              size={34}
              color={
                colors.primary
              }
            />
          </View>

          <Text
            allowFontScaling={
              false
            }
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
            allowFontScaling={
              false
            }
            style={[
              styles.subtitle,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {text.subtitle}
          </Text>
        </View>

        {/* LANGUAGE CARD */}

        <View
          style={[
            styles.languageCard,
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
              styles.languageCardIcon,
              {
                backgroundColor:
                  colors.primary +
                  '15',
              },
            ]}
          >
            <Languages
              size={26}
              color={
                colors.primary
              }
            />
          </View>

          <Text
            allowFontScaling={
              false
            }
            style={[
              styles.languageTitle,
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
            {text.chooseLanguage}
          </Text>

          <Text
            allowFontScaling={
              false
            }
            style={[
              styles.languageDescription,
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
              text.languageDescription
            }
          </Text>
        </View>

        {/* PERSIAN */}

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() =>
            startGame('fa')
          }
          style={[
            styles.languageOption,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
              flexDirection:
                isRTL
                  ? 'row-reverse'
                  : 'row',
            },
          ]}
        >
          <View
            style={[
              styles.languageOptionIcon,
              {
                backgroundColor:
                  colors.primary +
                  '15',
              },
            ]}
          >
            <Text
              allowFontScaling={
                false
              }
              style={[
                styles.languageOptionIconText,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              ف
            </Text>
          </View>

          <View
            style={
              styles.languageOptionContent
            }
          >
            <Text
              allowFontScaling={
                false
              }
              style={[
                styles.languageOptionTitle,
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
              {text.persian}
            </Text>

            <Text
              allowFontScaling={
                false
              }
              style={[
                styles.languageOptionDescription,
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
                text.persianDescription
              }
            </Text>
          </View>

          <ArrowLeft
            size={19}
            color={
              colors.textSecondary
            }
            style={{
              transform: [
                {
                  rotate: isRTL
                    ? '0deg'
                    : '180deg',
                },
              ],
            }}
          />
        </TouchableOpacity>

        {/* ENGLISH */}

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() =>
            startGame('en')
          }
          style={[
            styles.languageOption,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
              flexDirection:
                isRTL
                  ? 'row-reverse'
                  : 'row',
            },
          ]}
        >
          <View
            style={[
              styles.languageOptionIcon,
              {
                backgroundColor:
                  colors.primary +
                  '15',
              },
            ]}
          >
            <Text
              allowFontScaling={
                false
              }
              style={[
                styles.languageOptionIconText,
                {
                  color:
                    colors.primary,
                  fontSize: 16,
                },
              ]}
            >
              EN
            </Text>
          </View>

          <View
            style={
              styles.languageOptionContent
            }
          >
            <Text
              allowFontScaling={
                false
              }
              style={[
                styles.languageOptionTitle,
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
              {text.english}
            </Text>

            <Text
              allowFontScaling={
                false
              }
              style={[
                styles.languageOptionDescription,
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
                text.englishDescription
              }
            </Text>
          </View>

          <ArrowLeft
            size={19}
            color={
              colors.textSecondary
            }
            style={{
              transform: [
                {
                  rotate: isRTL
                    ? '0deg'
                    : '180deg',
                },
              ],
            }}
          />
        </TouchableOpacity>

        {/* AUTOMATIC DIFFICULTY */}

        <View
          style={[
            styles.automaticLevelCard,
            {
              backgroundColor:
                colors.primary +
                '0C',
              borderColor:
                colors.primary +
                '25',
            },
          ]}
        >
          <View
            style={[
              styles.automaticLevelIcon,
              {
                backgroundColor:
                  colors.primary +
                  '15',
              },
            ]}
          >
            <Trophy
              size={20}
              color={
                colors.primary
              }
            />
          </View>

          <View
            style={
              styles.automaticLevelContent
            }
          >
            <Text
              allowFontScaling={
                false
              }
              style={[
                styles.automaticLevelLabel,
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
              {text.level}
            </Text>

            <Text
              allowFontScaling={
                false
              }
              style={[
                styles.automaticLevelValue,
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

            <Text
              allowFontScaling={
                false
              }
              style={[
                styles.automaticLevelDescription,
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
              {assessmentLoading
                ? text.assessmentLoading
                : text.automaticDifficulty}
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
          <View
            style={[
              styles.instructionIcon,
              {
                backgroundColor:
                  colors.primary +
                  '15',
              },
            ]}
          >
            <Zap
              size={20}
              color={
                colors.primary
              }
            />
          </View>

          <Text
            allowFontScaling={
              false
            }
            style={[
              styles.instructionText,
              {
                color:
                  colors.text,
                textAlign:
                  textAlignStyle,
              },
            ]}
          >
            {text.instruction}
            {'\n\n'}
            {text.example}
          </Text>
        </View>

        {!assessmentLoading &&
          assessmentResults.length ===
            0 && (
            <Text
              allowFontScaling={
                false
              }
              style={[
                styles.noAssessmentText,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {text.noAssessment}
            </Text>
          )}

        <View
          style={
            styles.bottomSpace
          }
        />
      </ScrollView>
    );
  }

  /* ==============================================================
     GAME SCREEN
  ============================================================== */

  if (playing) {
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
            styles.gameHeader,
            {
              backgroundColor:
                colors.background,
            },
          ]}
        >
          <TouchableOpacity
            onPress={
              handleBack
            }
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={
              text.back
            }
            style={[
              styles.gameBackButton,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <ArrowLeft
              size={22}
              strokeWidth={2.4}
              color={
                colors.text
              }
            />
          </TouchableOpacity>

          <View
            style={
              styles.gameHeaderCenter
            }
          >
            <Text
              allowFontScaling={
                false
              }
              numberOfLines={1}
              style={[
                styles.gameHeaderTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {text.title}
            </Text>

            <Text
              allowFontScaling={
                false
              }
              style={[
                styles.gameHeaderRound,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {text.round}{' '}
              {roundIndex + 1}{' '}
              /{' '}
              {
                difficulty.totalRounds
              }
            </Text>
          </View>

          <View
            style={[
              styles.scoreBadge,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <Trophy
              size={17}
              color={
                colors.primary
              }
            />

            <Text
              allowFontScaling={
                false
              }
              style={[
                styles.scoreText,
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

        {/* TIMER */}

        <View
          style={[
            styles.timerContainer,
            {
              backgroundColor:
                colors.surface,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.timerProgress,
              {
                backgroundColor:
                  colors.primary,
                width:
                  timerWidth,
              },
            ]}
          />
        </View>

        {/* CONTENT */}

        <Animated.View
          style={[
            styles.gameContent,
            {
              transform: [
                {
                  translateX:
                    shakeTranslate,
                },
              ],
            },
          ]}
        >
          {/* STATUS */}

          <View
            style={
              styles.statusRow
            }
          >
            <View
              style={
                styles.livesContainer
              }
            >
              {Array.from({
                length: 3,
              }).map(
                (_, index) => (
                  <Heart
                    key={index}
                    size={20}
                    strokeWidth={2}
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
                ),
              )}
            </View>

            <View
              style={[
                styles.roundBadge,
                {
                  backgroundColor:
                    colors.surface,
                },
              ]}
            >
              <Text
                allowFontScaling={
                  false
                }
                style={[
                  styles.roundText,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {text.round}{' '}
                {roundIndex + 1}
              </Text>
            </View>
          </View>

          {/* WORD */}

          <View
            style={
              styles.wordContainer
            }
          >
            <Text
              allowFontScaling={
                false
              }
              style={[
                styles.instructionSmall,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {text.chooseInk}
            </Text>

            <Animated.Text
              allowFontScaling={
                false
              }
              style={[
                styles.stroopWord,
                {
                  color:
                    inkColor.hex,
                  transform: [
                    {
                      scale:
                        wordScale,
                    },
                  ],
                },
              ]}
            >
              {colorName(
                wordColor,
              )}
            </Animated.Text>
          </View>

          {/* OPTIONS */}

          <View
            style={[
              styles.optionsGrid,
              {
                width:
                  width -
                  GRID_HORIZONTAL_PADDING *
                    2,
              },
            ]}
          >
            {options.map(
              (option) => (
                <TouchableOpacity
                  key={
                    option.key
                  }
                  activeOpacity={
                    0.82
                  }
                  onLayout={recordLayout(
                    option.key,
                  )}
                  onPress={() =>
                    handleAnswer(
                      option,
                    )
                  }
                  style={[
                    styles.colorButton,
                    {
                      width:
                        swatchWidth,
                      height:
                        swatchHeight,
                      backgroundColor:
                        option.hex,
                    },
                  ]}
                >
                  <Text
                    allowFontScaling={
                      false
                    }
                    style={
                      styles.colorButtonText
                    }
                  >
                    {colorName(
                      option,
                    )}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </Animated.View>

        {/* FLASH */}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.flashOverlay,
            {
              backgroundColor:
                flashColor,
              opacity:
                flashAnim.interpolate(
                  {
                    inputRange: [
                      0,
                      1,
                    ],
                    outputRange: [
                      0,
                      0.16,
                    ],
                  },
                ),
            },
          ]}
        />

        {/* SCORE POPUPS */}

        <View
          pointerEvents="none"
          style={
            styles.popupLayer
          }
        >
          {popups.map(
            (popup) => (
              <MotiView
                key={
                  popup.id
                }
                from={{
                  opacity: 1,
                  translateY: 0,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 0,
                  translateY: -55,
                  scale: 1.15,
                }}
                transition={{
                  duration: 650,
                }}
                style={
                  styles.scorePopup
                }
              >
                <Text
                  allowFontScaling={
                    false
                  }
                  style={[
                    styles.scorePopupText,
                    {
                      color:
                        popup.value >
                        0
                          ? '#22C55E'
                          : '#EF4444',
                    },
                  ]}
                >
                  {popup.value >
                  0
                    ? `+${popup.value}`
                    : popup.value}
                </Text>
              </MotiView>
            ),
          )}
        </View>

        {/* PARTICLES */}

        <View
          pointerEvents="none"
          style={
            styles.particleLayer
          }
        >
          {particles.map(
            (particle) => {
              const translateX =
                particle.anim.interpolate(
                  {
                    inputRange: [
                      0,
                      1,
                    ],
                    outputRange: [
                      0,
                      Math.cos(
                        particle.angle,
                      ) *
                        particle.distance,
                    ],
                  },
                );

              const translateY =
                particle.anim.interpolate(
                  {
                    inputRange: [
                      0,
                      1,
                    ],
                    outputRange: [
                      0,
                      Math.sin(
                        particle.angle,
                      ) *
                        particle.distance,
                    ],
                  },
                );

              const opacity =
                particle.anim.interpolate(
                  {
                    inputRange: [
                      0,
                      0.7,
                      1,
                    ],
                    outputRange: [
                      1,
                      1,
                      0,
                    ],
                  },
                );

              return (
                <Animated.View
                  key={
                    particle.id
                  }
                  style={[
                    styles.particle,
                    {
                      width:
                        particle.size,
                      height:
                        particle.size,
                      borderRadius:
                        particle.size /
                        2,
                      backgroundColor:
                        particle.color,
                      left:
                        particle.x,
                      top:
                        particle.y,
                      opacity,
                      transform: [
                        {
                          translateX,
                        },
                        {
                          translateY,
                        },
                      ],
                    },
                  ]}
                />
              );
            },
          )}
        </View>
      </View>
    );
  }

  /* ==============================================================
     RESULT SCREEN
  ============================================================== */

  return (
    <View
      style={[
        styles.resultContainer,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      {/* BACK */}

      <TouchableOpacity
        onPress={
          handleBack
        }
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={
          text.back
        }
        style={[
          styles.resultBackButton,
          {
            backgroundColor:
              colors.surface,
            borderColor:
              colors.border,
          },
        ]}
      >
        <ArrowLeft
          size={22}
          strokeWidth={2.3}
          color={
            colors.text
          }
        />
      </TouchableOpacity>

      <View
        style={
          styles.resultContent
        }
      >
        {/* RESULT ICON */}

        <View
          style={[
            styles.resultIcon,
            {
              backgroundColor:
                completed
                  ? '#22C55E20'
                  : '#EF444420',
            },
          ]}
        >
          {completed ? (
            <CheckCircle2
              size={48}
              color="#22C55E"
            />
          ) : (
            <XCircle
              size={48}
              color="#EF4444"
            />
          )}
        </View>

        {/* TITLE */}

        <Text
          allowFontScaling={
            false
          }
          style={[
            styles.resultTitle,
            {
              color:
                colors.text,
            },
          ]}
        >
          {completed
            ? text.gameCompleted
            : text.gameOver}
        </Text>

        {/* SCORE */}

        <View
          style={[
            styles.finalScoreCard,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <Trophy
            size={26}
            color={
              colors.primary
            }
          />

          <Text
            allowFontScaling={
              false
            }
            style={[
              styles.finalScoreLabel,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {text.finalScore}
          </Text>

          <Text
            allowFontScaling={
              false
            }
            style={[
              styles.finalScore,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {score}
          </Text>
        </View>

        {/* DIFFICULTY INFO */}

        <View
          style={[
            styles.resultDifficulty,
            {
              backgroundColor:
                colors.primary +
                '0C',
              borderColor:
                colors.primary +
                '20',
            },
          ]}
        >
          <Text
            allowFontScaling={
              false
            }
            style={[
              styles.resultDifficultyLabel,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {text.level}
          </Text>

          <Text
            allowFontScaling={
              false
            }
            style={[
              styles.resultDifficultyValue,
              {
                color:
                  colors.primary,
              },
            ]}
          >
            {difficultyName}
          </Text>
        </View>

        {/* PLAY AGAIN */}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={
            restartGame
          }
          style={[
            styles.restartButton,
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
            allowFontScaling={
              false
            }
            style={
              styles.restartButtonText
            }
          >
            {text.playAgain}
          </Text>
        </TouchableOpacity>

        {/* CHANGE LANGUAGE */}

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={
            changeLanguage
          }
          style={[
            styles.secondaryButton,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <Languages
            size={18}
            color={
              colors.text
            }
          />

          <Text
            allowFontScaling={
              false
            }
            style={[
              styles.secondaryButtonText,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {
              text.changeLanguage
            }
          </Text>
        </TouchableOpacity>
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

    /* ============================================================
       LANGUAGE SELECTION
    ============================================================ */

    languageScrollContent: {
      paddingHorizontal:
        Spacing.lg,
      paddingTop: 55,
      paddingBottom: 40,
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
    },

    languageHeader: {
      alignItems:
        'center',
      marginTop: 24,
      marginBottom: 24,
    },

    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginBottom: 15,
    },

    title: {
      fontSize: 27,
      fontWeight: '900',
      textAlign:
        'center',
    },

    subtitle: {
      marginTop: 8,
      fontSize: 14,
      lineHeight: 21,
      textAlign:
        'center',
    },

    languageCard: {
      width: '100%',
      borderWidth: 1,
      borderRadius:
        BorderRadius.lg,
      padding: 16,
      marginBottom: 12,
    },

    languageCardIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginBottom: 12,
    },

    languageTitle: {
      fontSize: 18,
      fontWeight: '900',
    },

    languageDescription: {
      marginTop: 6,
      fontSize: 12,
      lineHeight: 19,
    },

    languageOption: {
      minHeight: 82,
      borderWidth: 1,
      borderRadius:
        BorderRadius.lg,
      paddingHorizontal: 15,
      marginBottom: 10,
      alignItems:
        'center',
      gap: 12,
    },

    languageOptionIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    languageOptionIconText: {
      fontSize: 23,
      fontWeight: '900',
    },

    languageOptionContent: {
      flex: 1,
      minWidth: 0,
    },

    languageOptionTitle: {
      fontSize: 16,
      fontWeight: '800',
    },

    languageOptionDescription: {
      fontSize: 11,
      marginTop: 4,
    },

    /* ============================================================
       AUTOMATIC LEVEL
    ============================================================ */

    automaticLevelCard: {
      width: '100%',
      minHeight: 76,
      borderWidth: 1,
      borderRadius:
        BorderRadius.lg,
      padding: 13,
      marginBottom: 12,
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 11,
    },

    automaticLevelIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    automaticLevelContent: {
      flex: 1,
    },

    automaticLevelLabel: {
      fontSize: 9,
      fontWeight: '700',
    },

    automaticLevelValue: {
      fontSize: 17,
      fontWeight: '900',
      marginTop: 2,
    },

    automaticLevelDescription: {
      fontSize: 10,
      lineHeight: 15,
      marginTop: 3,
    },

    /* ============================================================
       INSTRUCTION
    ============================================================ */

    instructionCard: {
      width: '100%',
      borderRadius:
        BorderRadius.lg,
      borderWidth: 1,
      padding: 15,
      flexDirection:
        'row',
      alignItems:
        'flex-start',
      gap: 10,
      marginTop: 4,
    },

    instructionIcon: {
      width: 38,
      height: 38,
      borderRadius: 13,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    instructionText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 21,
    },

    noAssessmentText: {
      width: '100%',
      fontSize: 10,
      lineHeight: 16,
      textAlign:
        'center',
      marginTop: 12,
    },

    bottomSpace: {
      height: 20,
    },

    /* ============================================================
       GAME
    ============================================================ */

    gameContainer: {
      paddingTop: 30,
      flex: 1,
    },

    gameHeader: {
      height: 72,
      paddingHorizontal:
        Spacing.lg,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      zIndex: 20,
    },

    gameBackButton: {
      width: 44,
      height: 44,
      borderRadius:
        30,
      borderWidth: 1,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    gameHeaderCenter: {
      flex: 1,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginHorizontal: 10,
    },

    gameHeaderTitle: {
      fontSize: 17,
      fontWeight: '800',
    },

    gameHeaderRound: {
      marginTop: 2,
      fontSize: 11,
      fontWeight: '600',
    },

    scoreBadge: {
      minWidth: 66,
      height: 40,
      paddingHorizontal: 10,
      borderRadius:
        BorderRadius.md,
      borderWidth: 1,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 6,
    },

    scoreText: {
      fontSize: 15,
      fontWeight: '800',
    },

    timerContainer: {
      height: 5,
      marginHorizontal:
        Spacing.lg,
      borderRadius: 3,
      overflow:
        'hidden',
    },

    timerProgress: {
      height: '100%',
    },

    gameContent: {
      flex: 1,
      paddingHorizontal:
        GRID_HORIZONTAL_PADDING,
      paddingTop: 18,
      paddingBottom: 24,
    },

    statusRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      marginBottom: 25,
    },

    livesContainer: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 5,
    },

    roundBadge: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 18,
    },

    roundText: {
      fontSize: 12,
      fontWeight: '700',
    },

    wordContainer: {
      alignItems:
        'center',
      justifyContent:
        'center',
      marginBottom: 35,
    },

    instructionSmall: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 15,
      textAlign:
        'center',
    },

    stroopWord: {
      fontSize: 42,
      fontWeight: '900',
      textAlign:
        'center',
    },

    optionsGrid: {
      flexDirection:
        'row',
      flexWrap:
        'wrap',
      gap: GRID_GAP,
      alignSelf:
        'center',
    },

    colorButton: {
      borderRadius:
        BorderRadius.lg,
      alignItems:
        'center',
      justifyContent:
        'center',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },

    colorButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
      textShadowColor:
        'rgba(0,0,0,0.25)',
      textShadowOffset: {
        width: 0,
        height: 1,
      },
      textShadowRadius: 3,
      textAlign:
        'center',
    },

    /* ============================================================
       EFFECTS
    ============================================================ */

    flashOverlay: {
      position:
        'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50,
    },

    popupLayer: {
      position:
        'absolute',
      top: '45%',
      left: 0,
      right: 0,
      alignItems:
        'center',
      zIndex: 60,
      pointerEvents:
        'none',
    },

    scorePopup: {
      position:
        'absolute',
    },

    scorePopupText: {
      fontSize: 30,
      fontWeight: '900',
    },

    particleLayer: {
      position:
        'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 55,
      pointerEvents:
        'none',
    },

    particle: {
      position:
        'absolute',
    },

    /* ============================================================
       RESULT
    ============================================================ */

    resultContainer: {
      flex: 1,
      paddingTop: 55,
      paddingHorizontal:
        Spacing.lg,
    },

    resultBackButton: {
      width: 44,
      height: 44,
      borderRadius:
        30,
      borderWidth: 1,
      alignItems:
        'center',
      justifyContent:
        'center',
      alignSelf:
        'flex-start',
    },

    resultContent: {
      flex: 1,
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingBottom: 60,
    },

    resultIcon: {
      width: 90,
      height: 90,
      borderRadius: 45,
      alignItems:
        'center',
      justifyContent:
        'center',
      marginBottom: 20,
    },

    resultTitle: {
      fontSize: 24,
      fontWeight: '800',
      textAlign:
        'center',
      marginBottom: 24,
    },

    finalScoreCard: {
      width: '100%',
      borderRadius:
        BorderRadius.lg,
      borderWidth: 1,
      alignItems:
        'center',
      paddingVertical: 24,
      marginBottom: 12,
    },

    finalScoreLabel: {
      fontSize: 13,
      fontWeight: '600',
      marginTop: 8,
    },

    finalScore: {
      fontSize: 42,
      fontWeight: '900',
      marginTop: 2,
    },

    resultDifficulty: {
      width: '100%',
      borderRadius:
        BorderRadius.lg,
      borderWidth: 1,
      paddingVertical: 11,
      alignItems:
        'center',
      marginBottom: 20,
    },

    resultDifficultyLabel: {
      fontSize: 10,
      fontWeight: '600',
    },

    resultDifficultyValue: {
      fontSize: 16,
      fontWeight: '900',
      marginTop: 2,
    },

    restartButton: {
      width: '100%',
      height: 52,
      borderRadius:
        BorderRadius.lg,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 8,
      marginBottom: 10,
    },

    restartButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },

    secondaryButton: {
      width: '100%',
      height: 50,
      borderRadius:
        BorderRadius.lg,
      borderWidth: 1,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 7,
    },

    secondaryButtonText: {
      fontSize: 14,
      fontWeight: '700',
    },
  });