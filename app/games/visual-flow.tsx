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
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';

import { useRouter } from 'expo-router';

import {
  ArrowLeft,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Target,
  Zap,
  BarChart3,
  Star,
  Lock,
  CheckCircle,
  XCircle,
  MousePointer2,
  Brain,
  Gauge,
  Award,
  Flame,
  Leaf,
  Crown,
  Sparkles,
  TrendingUp,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing } from '../../constants/theme';

/* ================================================================
   GAME CONFIG
================================================================ */

const TOTAL_TRIALS = 30;

/**
 * حداقل تعداد آزمون‌های کامل قبل از نمایش نتایج
 */
const MIN_COMPLETED_TESTS = 5;

const DIRECTIONS = ['Up', 'Down', 'Left', 'Right'] as const;

type Direction = (typeof DIRECTIONS)[number];

type Dot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
};

/* ================================================================
   DIFFICULTY
================================================================ */

type DifficultyLevel =
  | 'easy'
  | 'medium'
  | 'hard'
  | 'expert';

interface DifficultyConfig {
  id: DifficultyLevel;
  titleFa: string;
  titleEn: string;
  descriptionFa: string;
  descriptionEn: string;
  minCoherence: number;
  maxCoherence: number;
  minSpeed: number;
  maxSpeed: number;
  dots: number;
}

// حذف آیکون از اینجا - فقط داده‌های خام
const DIFFICULTIES: DifficultyConfig[] = [
  {
    id: 'easy',
    titleFa: 'آسان',
    titleEn: 'Easy',
    descriptionFa: 'حرکت نقاط واضح و قابل تشخیص',
    descriptionEn: 'Clear and easy-to-detect movement',
    minCoherence: 0.7,
    maxCoherence: 0.9,
    minSpeed: 1.5,
    maxSpeed: 2.2,
    dots: 60,
  },
  {
    id: 'medium',
    titleFa: 'متوسط',
    titleEn: 'Medium',
    descriptionFa: 'حرکت نقاط با کمی آشفتگی',
    descriptionEn: 'Movement with moderate noise',
    minCoherence: 0.5,
    maxCoherence: 0.7,
    minSpeed: 1.8,
    maxSpeed: 2.6,
    dots: 80,
  },
  {
    id: 'hard',
    titleFa: 'سخت',
    titleEn: 'Hard',
    descriptionFa: 'تشخیص جهت حرکت دشوارتر است',
    descriptionEn: 'Direction is harder to detect',
    minCoherence: 0.35,
    maxCoherence: 0.55,
    minSpeed: 2.0,
    maxSpeed: 3.0,
    dots: 90,
  },
  {
    id: 'expert',
    titleFa: 'خیلی سخت',
    titleEn: 'Expert',
    descriptionFa: 'حرکت بسیار پراکنده و سریع',
    descriptionEn: 'Fast and highly scattered movement',
    minCoherence: 0.2,
    maxCoherence: 0.4,
    minSpeed: 2.3,
    maxSpeed: 3.5,
    dots: 100,
  },
];

/* ================================================================
   TRANSLATIONS
================================================================ */

const directionTranslation: Record<Direction, string> = {
  Up: 'بالا',
  Down: 'پایین',
  Left: 'چپ',
  Right: 'راست',
};

const directionTranslationEn: Record<Direction, string> = {
  Up: 'Up',
  Down: 'Down',
  Left: 'Left',
  Right: 'Right',
};

const dotColors = [
  '#FFD700',
  '#FF4444',
  '#00E5D0',
  '#FFC107',
  '#8B5CF6',
  '#FF1493',
  '#00D4FF',
  '#FF6B35',
];

const random = (min: number, max: number) =>
  Math.random() * (max - min) + min;

/* ================================================================
   RESULT TYPES
================================================================ */

interface TrialResult {
  correct: boolean;
  rt: number;
  coherence: number;
}

interface TestSession {
  difficulty: DifficultyLevel;
  results: TrialResult[];
  score: number;
}

/* ================================================================
   PAGE HEADER
================================================================ */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  colors: any;
  isRTL: boolean;
  backLabel?: string;
}

function PageHeader({
  title,
  subtitle,
  onBack,
  colors,
  isRTL,
  backLabel = 'Back',
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
      {/* Back button همیشه سمت چپ */}
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        style={[
          styles.unifiedBackButton,
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

      {/* Header text */}
      <View
        style={[
          styles.pageHeaderText,
          {
            alignItems: isRTL ? 'flex-end' : 'flex-start',
          },
        ]}
      >
        <Text
          style={[
            styles.pageHeaderTitle,
            {
              color: colors.text,
              textAlign: isRTL ? 'right' : 'left',
            },
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={[
              styles.pageHeaderSubtitle,
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
   MAIN SCREEN
================================================================ */

export default function VisualFlowScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { language, isRTL } = useLanguage();

  /* ================================================================
     ICON MAP - آیکون‌ها با رنگ dynamic
  ================================================================ */

  const difficultyIcons = useMemo(
    () => ({
      easy: Leaf,
      medium: Brain,
      hard: Flame,
      expert: Crown,
    }),
    []
  );

  /* ================================================================
     SCREEN STATE
  ================================================================ */

  const [screen, setScreen] = useState<
    'difficulty' | 'game' | 'finished'
  >('difficulty');

  const [selectedDifficulty, setSelectedDifficulty] =
    useState<DifficultyLevel | null>(null);

  const [trialCount, setTrialCount] = useState(0);
  const [score, setScore] = useState(0);

  const [currentDirection, setCurrentDirection] =
    useState<Direction | null>(null);

  const [coherence, setCoherence] = useState(0);

  const [trialActive, setTrialActive] = useState(false);

  const [dots, setDots] = useState<Dot[]>([]);

  const [results, setResults] = useState<TrialResult[]>([]);

  const [completedTests, setCompletedTests] =
    useState<TestSession[]>([]);

  const [info, setInfo] = useState(
    language === 'fa'
      ? 'سطح مورد نظر خود را انتخاب کن'
      : 'Select your difficulty level'
  );

  const [infoType, setInfoType] = useState<
    'normal' | 'correct' | 'wrong'
  >('normal');

  /* ================================================================
     REFS
  ================================================================ */

  const startTimeRef = useRef(0);

  const animationRef = useRef<number | null>(null);

  const timeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const dotsRef = useRef<Dot[]>([]);

  const directionRef =
    useRef<Direction | null>(null);

  const coherenceRef = useRef(0);

  const trialActiveRef = useRef(false);

  const gameEndedRef = useRef(false);

  /**
   * تعداد Trialها را در ref نگه می‌داریم
   * تا مشکل stale state نداشته باشیم.
   */
  const trialCountRef = useRef(0);

  /**
   * امتیاز را هم در ref نگه می‌داریم.
   */
  const scoreRef = useRef(0);

  /**
   * سطح انتخاب‌شده در ref
   */
  const selectedDifficultyRef =
    useRef<DifficultyLevel | null>(null);

  /* ================================================================
     ANIMATION
  ================================================================ */

  const fadeAnim =
    useRef(new Animated.Value(0)).current;

  const scaleAnim =
    useRef(new Animated.Value(0.94)).current;

  /* ================================================================
     TEXT
  ================================================================ */

  const t = useMemo(
    () => ({
      title:
        language === 'fa'
          ? 'جریان بصری'
          : 'Visual Flow',

      subtitle:
        language === 'fa'
          ? 'جهت حرکت دسته‌ی نقاط را پیدا کن!'
          : 'Find the main direction of the moving dots!',

      back:
        language === 'fa'
          ? 'بازگشت'
          : 'Back',

      selectDifficulty:
        language === 'fa'
          ? 'سطح بازی را انتخاب کن'
          : 'Choose your difficulty',

      selectDescription:
        language === 'fa'
          ? 'از آسان شروع کن یا سطح چالش‌برانگیزتری انتخاب کن'
          : 'Start easy or choose a more challenging level',

      start:
        language === 'fa'
          ? 'شروع آزمون'
          : 'Start Test',

      round:
        language === 'fa'
          ? 'دور'
          : 'Round',

      score:
        language === 'fa'
          ? 'امتیاز'
          : 'Score',

      difficulty:
        language === 'fa'
          ? 'انسجام'
          : 'Coherence',

      correct:
        language === 'fa'
          ? 'درسته!'
          : 'Correct!',

      wrong:
        language === 'fa'
          ? 'اشتباه!'
          : 'Wrong!',

      correctAnswers:
        language === 'fa'
          ? 'پاسخ صحیح'
          : 'Correct answers',

      accuracy:
        language === 'fa'
          ? 'دقت'
          : 'Accuracy',

      reaction:
        language === 'fa'
          ? 'میانگین زمان واکنش'
          : 'Average reaction time',

      finalScore:
        language === 'fa'
          ? 'امتیاز'
          : 'Score',

      testProgress:
        language === 'fa'
          ? 'آزمون'
          : 'Test',

      finalResults:
        language === 'fa'
          ? 'نتایج نهایی'
          : 'Final Results',

      testsRemaining:
        language === 'fa'
          ? 'آزمون دیگر تا نمایش نتایج'
          : 'more tests until results',

      minimumTests:
        language === 'fa'
          ? 'برای نمایش نتایج حداقل ۵ آزمون کامل انجام بده'
          : 'Complete at least 5 tests to see your results',

      findDirection:
        language === 'fa'
          ? 'جهت حرکت را پیدا کن و پاسخ بده!'
          : 'Find the direction and answer!',

      identifyDirection:
        language === 'fa'
          ? 'جهت حرکت دسته‌ی نقاط را تشخیص بده!'
          : 'Identify the direction of the moving dots!',
    }),
    [language]
  );

  /* ================================================================
     INITIAL ANIMATION
  ================================================================ */

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),

      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  /* ================================================================
     CLEANUP ON UNMOUNT
  ================================================================ */

  useEffect(() => {
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      trialActiveRef.current = false;
      gameEndedRef.current = true;
    };
  }, []);

  /* ================================================================
     GET DIFFICULTY CONFIG
  ================================================================ */

  const getDifficultyConfig = useCallback(
    (difficulty?: DifficultyLevel | null) => {
      const id =
        difficulty ??
        selectedDifficultyRef.current ??
        selectedDifficulty ??
        'easy';

      return (
        DIFFICULTIES.find(
          item => item.id === id
        ) || DIFFICULTIES[0]
      );
    },
    [selectedDifficulty]
  );

  /* ================================================================
     GENERATE DOTS
  ================================================================ */

  const generateDots = useCallback(
    (
      width: number,
      height: number,
      config: DifficultyConfig
    ) => {
      const safeWidth = Math.max(width, 20);
      const safeHeight = Math.max(height, 20);

      const newDots: Dot[] = [];

      for (let i = 0; i < config.dots; i++) {
        const angle = random(0, Math.PI * 2);

        const speed = random(
          config.minSpeed,
          config.maxSpeed
        );

        newDots.push({
          x: random(
            8,
            Math.max(8, safeWidth - 8)
          ),

          y: random(
            8,
            Math.max(8, safeHeight - 8)
          ),

          vx: Math.cos(angle) * speed,

          vy: Math.sin(angle) * speed,

          color:
            dotColors[
              Math.floor(
                Math.random() *
                  dotColors.length
              )
            ],

          size: random(3, 5),
        });
      }

      dotsRef.current = newDots;

      setDots(newDots);
    },
    []
  );

  /* ================================================================
     STOP GAME
  ================================================================ */

  const stopGame = useCallback(() => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(
        animationRef.current
      );

      animationRef.current = null;
    }

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    trialActiveRef.current = false;
    setTrialActive(false);
  }, []);

  /* ================================================================
     BACK HANDLER
  ================================================================ */

  const goBack = useCallback(() => {
    if (screen === 'game') {
      stopGame();

      gameEndedRef.current = true;

      setScreen('difficulty');
      setTrialCount(0);
      setScore(0);
      setResults([]);
      setDots([]);

      trialCountRef.current = 0;
      scoreRef.current = 0;

      return;
    }

    if (screen === 'finished') {
      setScreen('difficulty');
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/psycho');
    }
  }, [
    screen,
    stopGame,
    router,
  ]);

  /* ================================================================
     START TRIAL
     
     نکته مهم:
     difficulty مستقیماً به تابع داده می‌شود.
     بنابراین دیگر مشکل stale selectedDifficulty نداریم.
  ================================================================ */

  const startTrial = useCallback(
    (difficulty: DifficultyLevel) => {
      if (gameEndedRef.current) {
        return;
      }

      if (
        trialCountRef.current >=
        TOTAL_TRIALS
      ) {
        return;
      }

      const config =
        getDifficultyConfig(difficulty);

      const direction =
        DIRECTIONS[
          Math.floor(
            Math.random() *
              DIRECTIONS.length
          )
        ];

      const coh = random(
        config.minCoherence,
        config.maxCoherence
      );

      directionRef.current =
        direction;

      coherenceRef.current = coh;

      setCurrentDirection(direction);

      setCoherence(coh);

      trialCountRef.current += 1;

      setTrialCount(
        trialCountRef.current
      );

      trialActiveRef.current = true;

      setTrialActive(true);

      gameEndedRef.current = false;

      startTimeRef.current =
        Date.now();

      setInfo(t.findDirection);

      setInfoType('normal');
    },
    [
      getDifficultyConfig,
      t.findDirection,
    ]
  );

  /* ================================================================
     ANIMATION
  ================================================================ */

  const animate = useCallback(
    (
      width: number,
      height: number,
      difficulty: DifficultyLevel
    ) => {
      if (
        !trialActiveRef.current ||
        gameEndedRef.current
      ) {
        return;
      }

      const direction =
        directionRef.current;

      const coh =
        coherenceRef.current;

      if (!direction) {
        return;
      }

      const config =
        getDifficultyConfig(
          difficulty
        );

      const vectors: Record<
        Direction,
        [number, number]
      > = {
        Up: [0, -config.maxSpeed],
        Down: [0, config.maxSpeed],
        Left: [-config.maxSpeed, 0],
        Right: [config.maxSpeed, 0],
      };

      const [vx, vy] =
        vectors[direction];

      const updated =
        dotsRef.current.map(dot => {
          let nextVx = dot.vx;
          let nextVy = dot.vy;

          if (Math.random() < coh) {
            nextVx =
              vx + random(-0.3, 0.3);

            nextVy =
              vy + random(-0.3, 0.3);
          } else {
            const angle =
              random(
                0,
                Math.PI * 2
              );

            const speed =
              random(
                config.minSpeed,
                config.maxSpeed
              );

            nextVx =
              Math.cos(angle) *
              speed;

            nextVy =
              Math.sin(angle) *
              speed;
          }

          let x =
            dot.x + nextVx;

          let y =
            dot.y + nextVy;

          if (x < 0) {
            x = width;
          }

          if (x > width) {
            x = 0;
          }

          if (y < 0) {
            y = height;
          }

          if (y > height) {
            y = 0;
          }

          return {
            ...dot,
            x,
            y,
            vx: nextVx,
            vy: nextVy,
          };
        });

      dotsRef.current = updated;

      setDots(updated);

      animationRef.current =
        requestAnimationFrame(() =>
          animate(
            width,
            height,
            difficulty
          )
        );
    },
    [getDifficultyConfig]
  );

  /* ================================================================
     FINISH TEST
  ================================================================ */

  const finishTest = useCallback(
    (
      finalResults: TrialResult[],
      finalScore: number,
      difficulty: DifficultyLevel
    ) => {
      stopGame();

      gameEndedRef.current = true;

      const session: TestSession = {
        difficulty,
        results: finalResults,
        score: finalScore,
      };

      setCompletedTests(prev => {
        const newTests = [
          ...prev,
          session,
        ];

        const hasEnoughTests =
          newTests.length >=
          MIN_COMPLETED_TESTS;

        setTimeout(() => {
          if (hasEnoughTests) {
            setScreen('finished');
          } else {
            setScreen('difficulty');
          }
        }, 350);

        return newTests;
      });
    },
    [stopGame]
  );

  /* ================================================================
     SUBMIT ANSWER
  ================================================================ */

  const submitAnswer = useCallback(
    (direction: Direction) => {
      if (
        !trialActiveRef.current ||
        gameEndedRef.current
      ) {
        return;
      }

      trialActiveRef.current = false;

      setTrialActive(false);

      if (
        animationRef.current !== null
      ) {
        cancelAnimationFrame(
          animationRef.current
        );

        animationRef.current = null;
      }

      const reactionTime =
        Date.now() -
        startTimeRef.current;

      const correct =
        direction ===
        directionRef.current;

      const newResult: TrialResult = {
        correct,
        rt: reactionTime,
        coherence:
          coherenceRef.current,
      };

      const updatedResults = [
        ...results,
        newResult,
      ];

      const nextScore = correct
        ? scoreRef.current + 10
        : scoreRef.current;

      scoreRef.current = nextScore;

      setScore(nextScore);

      setResults(
        updatedResults
      );

      if (correct) {
        setInfo(t.correct);
        setInfoType('correct');
      } else {
        const actual =
          directionRef.current;

        if (actual) {
          setInfo(
            language === 'fa'
              ? `${t.wrong} جهت اصلی ${directionTranslation[actual]} بود`
              : `${t.wrong} The main direction was ${directionTranslationEn[actual]}`
          );
        } else {
          setInfo(t.wrong);
        }

        setInfoType('wrong');
      }

      /*
       * آیا آخرین Trial بود؟
       */
      if (
        updatedResults.length >=
        TOTAL_TRIALS
      ) {
        timeoutRef.current =
          setTimeout(() => {
            timeoutRef.current = null;

            finishTest(
              updatedResults,
              nextScore,
              selectedDifficultyRef.current ??
                'easy'
            );
          }, 700);

        return;
      }

      /*
       * Trial بعدی
       */
      timeoutRef.current =
        setTimeout(() => {
          timeoutRef.current = null;

          if (
            gameEndedRef.current
          ) {
            return;
          }

          startTrial(
            selectedDifficultyRef.current ??
              'easy'
          );
        }, 700);
    },
    [
      results,
      language,
      t.correct,
      t.wrong,
      startTrial,
      finishTest,
    ]
  );

  /* ================================================================
     START GAME
  ================================================================ */

  const startGame = useCallback(
    (difficulty: DifficultyLevel) => {
      stopGame();

      /*
       * State + Ref همزمان
       */
      selectedDifficultyRef.current =
        difficulty;

      setSelectedDifficulty(
        difficulty
      );

      trialCountRef.current = 0;
      scoreRef.current = 0;

      setScreen('game');
      setTrialCount(0);
      setScore(0);
      setResults([]);
      setDots([]);
      setCurrentDirection(null);
      setCoherence(0);

      setInfo(t.identifyDirection);
      setInfoType('normal');

      gameEndedRef.current = false;
      trialActiveRef.current = false;

      const config =
        getDifficultyConfig(
          difficulty
        );

      const width =
        Dimensions.get('window').width -
        Spacing.lg * 2;

      const height = Math.min(
        (width * 2) / 3,
        280
      );

      /*
       * اول نقاط را ایجاد می‌کنیم.
       */
      generateDots(
        width,
        height,
        config
      );

      /*
       * سپس اولین Trial
       */
      timeoutRef.current =
        setTimeout(() => {
          timeoutRef.current = null;

          if (
            gameEndedRef.current
          ) {
            return;
          }

          startTrial(
            difficulty
          );
        }, 350);
    },
    [
      stopGame,
      getDifficultyConfig,
      generateDots,
      startTrial,
      t.identifyDirection,
    ]
  );

  /* ================================================================
     ANIMATION EFFECT
  ================================================================ */

  useEffect(() => {
    if (
      screen !== 'game' ||
      !trialActive ||
      dots.length === 0
    ) {
      return;
    }

    const difficulty =
      selectedDifficultyRef.current;

    if (!difficulty) {
      return;
    }

    const width =
      Dimensions.get('window').width -
      Spacing.lg * 2;

    const height = Math.min(
      (width * 2) / 3,
      280
    );

    animate(
      width,
      height,
      difficulty
    );

    return () => {
      if (
        animationRef.current !== null
      ) {
        cancelAnimationFrame(
          animationRef.current
        );

        animationRef.current = null;
      }
    };
  }, [
    screen,
    trialActive,
    dots.length,
    animate,
  ]);

  /* ================================================================
     RESTART
  ================================================================ */

  const restartGame = useCallback(() => {
    stopGame();

    setScreen('difficulty');

    setTrialCount(0);
    setScore(0);
    setResults([]);
    setDots([]);
    setCurrentDirection(null);
    setCoherence(0);
    setInfoType('normal');

    setSelectedDifficulty(null);

    selectedDifficultyRef.current =
      null;

    trialCountRef.current = 0;
    scoreRef.current = 0;

    gameEndedRef.current = false;
  }, [stopGame]);

  /* ================================================================
     SWIPE
  ================================================================ */

  const panResponder =
    useRef(
      PanResponder.create({
        onStartShouldSetPanResponder:
          () => true,

        onMoveShouldSetPanResponder:
          () => true,

        onPanResponderRelease: (
          _,
          gesture
        ) => {
          const { dx, dy } =
            gesture;

          if (
            Math.abs(dx) < 15 &&
            Math.abs(dy) < 15
          ) {
            return;
          }

          if (
            Math.abs(dx) >
            Math.abs(dy)
          ) {
            submitAnswer(
              dx > 0
                ? 'Right'
                : 'Left'
            );
          } else {
            submitAnswer(
              dy > 0
                ? 'Down'
                : 'Up'
            );
          }
        },
      })
    ).current;

  /* ================================================================
     DIRECTION BUTTON
  ================================================================ */

  const DirectionButton = ({
    direction,
    icon,
  }: {
    direction: Direction;
    icon: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[
        styles.dirButton,
        {
          backgroundColor:
            colors.surface,
          borderColor:
            colors.border,
        },
      ]}
      onPress={() =>
        submitAnswer(direction)
      }
      activeOpacity={0.75}
      disabled={!trialActive}
    >
      {icon}
    </TouchableOpacity>
  );

  /* ================================================================
     FINAL REPORT
  ================================================================ */

  const getFinalReport = useCallback(() => {
    const allResults =
      completedTests.flatMap(
        test => test.results
      );

    const total =
      allResults.length;

    const correct =
      allResults.filter(
        result => result.correct
      ).length;

    const accuracy =
      total > 0
        ? (correct / total) * 100
        : 0;

    const reactionTimes =
      allResults
        .filter(
          result => result.correct
        )
        .map(
          result => result.rt
        );

    const avgRT =
      reactionTimes.length > 0
        ? reactionTimes.reduce(
            (a, b) => a + b,
            0
          ) /
          reactionTimes.length
        : 0;

    const totalScore =
      completedTests.reduce(
        (sum, test) =>
          sum + test.score,
        0
      );

    return {
      total,
      correct,
      accuracy,
      avgRT,
      totalScore,
    };
  }, [completedTests]);

  /* ================================================================
     PAGE 1 — DIFFICULTY SELECTION
  ================================================================ */

  if (screen === 'difficulty') {
    const remaining = Math.max(
      0,
      MIN_COMPLETED_TESTS -
        completedTests.length
    );

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
          title={t.title}
          subtitle={t.subtitle}
          onBack={goBack}
          colors={colors}
          isRTL={isRTL}
          backLabel={t.back}
        />

        <Animated.ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.difficultyScroll
          }
          style={{
            opacity: fadeAnim,
            transform: [
              {
                scale: scaleAnim,
              },
            ],
          }}
        >
          {/* INTRO */}

          <View
            style={[
              styles.selectionHeader,
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
                styles.logo,
                {
                  backgroundColor:
                    colors.primary +
                    '18',
                },
              ]}
            >
              <Target
                size={38}
                color={
                  colors.primary
                }
              />
            </View>

            <Text
              style={[
                styles.selectionTitle,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {t.selectDifficulty}
            </Text>

            <Text
              style={[
                styles.selectionDescription,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {t.selectDescription}
            </Text>

            {/* TEST PROGRESS */}

            <View
              style={[
                styles.testProgressBox,
                {
                  backgroundColor:
                    colors.background,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <BarChart3
                size={20}
                color={
                  colors.primary
                }
              />

              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={[
                    styles.progressTitle,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {t.testProgress}{' '}
                  {Math.min(
                    completedTests.length,
                    MIN_COMPLETED_TESTS
                  )}
                  /
                  {
                    MIN_COMPLETED_TESTS
                  }
                </Text>

                <Text
                  style={[
                    styles.progressSubtitle,
                    {
                      color:
                        colors.textSecondary,
                    },
                  ]}
                >
                  {remaining > 0
                    ? `${remaining} ${t.testsRemaining}`
                    : language ===
                      'fa'
                    ? 'نتایج شما آماده است'
                    : 'Your results are ready'}
                </Text>
              </View>

              {completedTests.length >=
              MIN_COMPLETED_TESTS ? (
                <CheckCircle
                  size={22}
                  color="#34D399"
                />
              ) : (
                <Lock
                  size={19}
                  color={
                    colors.textSecondary
                  }
                />
              )}
            </View>
          </View>

          {/* DIFFICULTY OPTIONS */}

          <View
            style={
              styles.difficultyList
            }
          >
            {DIFFICULTIES.map(
              (
                difficulty,
                index
              ) => {
                const isRecommended =
                  index === 0;
                
                // دریافت کامپوننت آیکون متناسب با سطح
                const IconComponent = difficultyIcons[difficulty.id];

                return (
                  <TouchableOpacity
                    key={
                      difficulty.id
                    }
                    activeOpacity={0.8}
                    onPress={() =>
                      startGame(
                        difficulty.id
                      )
                    }
                    style={[
                      styles.difficultyCard,
                      {
                        backgroundColor:
                          colors.surface,
                        borderColor:
                          colors.border,
                      },
                    ]}
                  >
                    {/* ICON - با رنگ primary از Theme */}

                    <View
                      style={[
                        styles.difficultyIcon,
                        {
                          backgroundColor:
                            colors.primary +
                            '18',
                        },
                      ]}
                    >
                      <IconComponent
                        size={28}
                        color={colors.primary}
                      />
                    </View>

                    {/* TEXT */}

                    <View
                      style={
                        styles.difficultyContent
                      }
                    >
                      <View
                        style={
                          styles.difficultyTitleRow
                        }
                      >
                        <Text
                          style={[
                            styles.difficultyTitle,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          {language ===
                          'fa'
                            ? difficulty.titleFa
                            : difficulty.titleEn}
                        </Text>

                        {isRecommended && (
                          <View
                            style={[
                              styles.recommendedBadge,
                              {
                                backgroundColor:
                                  colors.primary +
                                  '20',
                              },
                            ]}
                          >
                            <Star
                              size={
                                11
                              }
                              color={
                                colors.primary
                              }
                            />

                            <Text
                              style={[
                                styles.recommendedText,
                                {
                                  color:
                                    colors.primary,
                                },
                              ]}
                            >
                              {language ===
                              'fa'
                                ? 'شروع پیشنهادی'
                                : 'Recommended'}
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text
                        style={[
                          styles.difficultyDescription,
                          {
                            color:
                              colors.textSecondary,
                          },
                        ]}
                      >
                        {language ===
                        'fa'
                          ? difficulty.descriptionFa
                          : difficulty.descriptionEn}
                      </Text>

                      <View
                        style={
                          styles.difficultyIndicator
                        }
                      >
                        {[0, 1, 2, 3].map(
                          item => (
                            <View
                              key={
                                item
                              }
                              style={[
                                styles.difficultyDot,
                                {
                                  backgroundColor:
                                    item <=
                                    index
                                      ? colors.primary
                                      : colors.border,
                                },
                              ]}
                            />
                          )
                        )}
                      </View>
                    </View>

                    {/* ARROW */}

                    <View
                      style={
                        styles.difficultyArrow
                      }
                    >
                      {isRTL ? (
                        <ChevronLeft
                          size={22}
                          color={
                            colors.textSecondary
                          }
                        />
                      ) : (
                        <ChevronRight
                          size={22}
                          color={
                            colors.textSecondary
                          }
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }
            )}
          </View>

          {/* INFO */}

          <View
            style={[
              styles.minimumInfo,
              {
                backgroundColor:
                  colors.primary +
                  '10',
                borderColor:
                  colors.primary +
                  '30',
              },
            ]}
          >
            <Zap
              size={19}
              color={
                colors.primary
              }
            />

            <Text
              style={[
                styles.minimumInfoText,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {t.minimumTests}
            </Text>
          </View>
        </Animated.ScrollView>
      </View>
    );
  }

  /* ================================================================
     PAGE 2 — FINAL RESULTS
  ================================================================ */

  if (screen === 'finished') {
    const report =
      getFinalReport();

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
          title={t.finalResults}
          subtitle={
            language === 'fa'
              ? `${MIN_COMPLETED_TESTS} آزمون کامل شد`
              : `${MIN_COMPLETED_TESTS} tests completed`
          }
          onBack={goBack}
          colors={colors}
          isRTL={isRTL}
          backLabel={t.back}
        />

        <Animated.View
          style={[
            styles.resultCard,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
              opacity: fadeAnim,
              transform: [
                {
                  scale: scaleAnim,
                },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.resultIcon,
              {
                backgroundColor:
                  colors.primary +
                  '18',
              },
            ]}
          >
            <Award
              size={42}
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
            {t.finalResults}
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
            {language === 'fa'
              ? 'نتایج بر اساس تمام آزمون‌های انجام‌شده محاسبه شده است.'
              : 'Results are calculated from all completed tests.'}
          </Text>

          {/* ACCURACY */}

          <View
            style={[
              styles.resultItem,
              {
                backgroundColor:
                  colors.background,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <View
              style={
                styles.resultItemLeft
              }
            >
              <TrendingUp
                size={18}
                color={
                  colors.primary
                }
              />

              <Text
                style={[
                  styles.resultLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {t.accuracy}
              </Text>
            </View>

            <Text
              style={[
                styles.resultValue,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              {report.accuracy.toFixed(
                1
              )}
              %
            </Text>
          </View>

          {/* CORRECT */}

          <View
            style={[
              styles.resultItem,
              {
                backgroundColor:
                  colors.background,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <View
              style={
                styles.resultItemLeft
              }
            >
              <CheckCircle
                size={18}
                color="#34D399"
              />

              <Text
                style={[
                  styles.resultLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {t.correctAnswers}
              </Text>
            </View>

            <Text
              style={[
                styles.resultValue,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {report.correct}/
              {report.total}
            </Text>
          </View>

          {/* REACTION */}

          <View
            style={[
              styles.resultItem,
              {
                backgroundColor:
                  colors.background,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <View
              style={
                styles.resultItemLeft
              }
            >
              <Gauge
                size={18}
                color={
                  colors.textSecondary
                }
              />

              <Text
                style={[
                  styles.resultLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {t.reaction}
              </Text>
            </View>

            <Text
              style={[
                styles.resultValue,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {report.avgRT.toFixed(
                0
              )}
              ms
            </Text>
          </View>

          {/* SCORE */}

          <View
            style={[
              styles.resultItem,
              {
                backgroundColor:
                  colors.background,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <View
              style={
                styles.resultItemLeft
              }
            >
              <Sparkles
                size={18}
                color={
                  colors.primary
                }
              />

              <Text
                style={[
                  styles.resultLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {t.finalScore}
              </Text>
            </View>

            <Text
              style={[
                styles.resultValue,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              {report.totalScore}
            </Text>
          </View>

          <TouchableOpacity
            onPress={
              restartGame
            }
            activeOpacity={0.85}
            style={[
              styles.restartButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            <RotateCcw
              size={18}
              color="#fff"
            />

            <Text
              style={
                styles.restartText
              }
            >
              {language === 'fa'
                ? 'آزمون جدید'
                : 'New Test'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  /* ================================================================
     PAGE 3 — GAME PLAY
  ================================================================ */

  const currentDifficulty =
    getDifficultyConfig(
      selectedDifficultyRef.current
    );

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
        title={t.title}
        subtitle={`${t.testProgress} ${
          completedTests.length + 1
        }/${MIN_COMPLETED_TESTS} • ${
          t.round
        } ${trialCount}/${TOTAL_TRIALS} • ${
          t.score
        }: ${score}`}
        onBack={goBack}
        colors={colors}
        isRTL={isRTL}
        backLabel={t.back}
      />

      {/* GAME CANVAS */}

      <View
        style={[
          styles.canvasWrapper,
          {
            backgroundColor:
              colors.surface,
            borderColor:
              infoType === 'correct'
                ? '#34D39955'
                : infoType === 'wrong'
                ? '#FF6B8155'
                : colors.border,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {dots.map(
          (dot, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  left: dot.x,
                  top: dot.y,
                  width: dot.size,
                  height: dot.size,
                  borderRadius:
                    dot.size / 2,
                  backgroundColor:
                    dot.color,
                },
              ]}
            />
          )
        )}
      </View>

      {/* INFO */}

      <View style={styles.infoArea}>
        <View
          style={styles.infoRow}
        >
          {infoType ===
          'correct' ? (
            <CheckCircle
              size={22}
              color="#34D399"
              strokeWidth={2.5}
            />
          ) : infoType ===
            'wrong' ? (
            <XCircle
              size={22}
              color="#FF6B81"
              strokeWidth={2.5}
            />
          ) : (
            <MousePointer2
              size={22}
              color={
                colors.primary
              }
              strokeWidth={2.5}
            />
          )}

          <Text
            style={[
              styles.infoText,
              {
                color:
                  infoType ===
                  'correct'
                    ? '#34D399'
                    : infoType ===
                      'wrong'
                    ? '#FF6B81'
                    : colors.textSecondary,
              },
            ]}
          >
            {info}
          </Text>
        </View>
      </View>

      {/* BUTTONS */}

      <View
        style={
          styles.directionButtons
        }
      >
        <DirectionButton
          direction="Up"
          icon={
            <ChevronUp
              size={25}
              color={
                colors.text
              }
            />
          }
        />

        <DirectionButton
          direction="Down"
          icon={
            <ChevronDown
              size={25}
              color={
                colors.text
              }
            />
          }
        />

        <DirectionButton
          direction="Left"
          icon={
            <ChevronLeft
              size={25}
              color={
                colors.text
              }
            />
          }
        />

        <DirectionButton
          direction="Right"
          icon={
            <ChevronRight
              size={25}
              color={
                colors.text
              }
            />
          }
        />
      </View>

      {/* STATUS */}

      <View
        style={[
          styles.statusBar,
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
            styles.statusItem
          }
        >
          <Text
            style={[
              styles.statusLabel,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {t.round}
          </Text>

          <Text
            style={[
              styles.statusValue,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {trialCount}/
            {TOTAL_TRIALS}
          </Text>
        </View>

        <View
          style={
            styles.statusItem
          }
        >
          <Text
            style={[
              styles.statusLabel,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {t.score}
          </Text>

          <Text
            style={[
              styles.statusValue,
              {
                color:
                  colors.primary,
              },
            ]}
          >
            {score}
          </Text>
        </View>

        <View
          style={
            styles.statusItem
          }
        >
          <Text
            style={[
              styles.statusLabel,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {t.difficulty}
          </Text>

          <Text
            style={[
              styles.statusValue,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {Math.round(
              coherence * 100
            )}
            %
          </Text>
        </View>

        <View
          style={
            styles.statusItem
          }
        >
          <Text
            style={[
              styles.statusLabel,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {language === 'fa'
              ? 'سطح'
              : 'Level'}
          </Text>

          <Text
            style={[
              styles.statusValue,
              {
                color:
                  colors.primary,
              },
            ]}
          >
            {language === 'fa'
              ? currentDifficulty.titleFa
              : currentDifficulty.titleEn}
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ================================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal:
      Spacing.lg,
  },

  /* ================================================================
     HEADER
  ================================================================ */

  pageHeader: {
    width: '100%',
    paddingHorizontal: 0,
    paddingTop: 60,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth:
      StyleSheet.hairlineWidth,
  },

  unifiedBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 12,
  },

  pageHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  pageHeaderTitle: {
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 27,
  },

  pageHeaderSubtitle: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 18,
  },

  /* ================================================================
     DIFFICULTY PAGE
  ================================================================ */

  difficultyScroll: {
    paddingTop: Spacing.md,
    paddingBottom: 30,
  },

  selectionHeader: {
    borderRadius: 26,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: 'center',
  },

  logo: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  selectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },

  selectionDescription: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 7,
  },

  testProgressBox: {
    width: '100%',
    minHeight: 66,
    borderRadius: 17,
    borderWidth: 1,
    marginTop: 18,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  progressTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  progressSubtitle: {
    fontSize: 11,
    marginTop: 3,
  },

  difficultyList: {
    marginTop: 14,
    gap: 10,
  },

  difficultyCard: {
    minHeight: 92,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  difficultyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  difficultyContent: {
    flex: 1,
    marginLeft: 13,
  },

  difficultyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },

  difficultyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },

  recommendedBadge: {
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  recommendedText: {
    fontSize: 8,
    fontWeight: '800',
  },

  difficultyDescription: {
    fontSize: 11,
    marginTop: 5,
    lineHeight: 17,
  },

  difficultyIndicator: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },

  difficultyDot: {
    width: 17,
    height: 4,
    borderRadius: 2,
  },

  difficultyArrow: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  minimumInfo: {
    minHeight: 55,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  minimumInfoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 17,
  },

  /* ================================================================
     GAME
  ================================================================ */

  canvasWrapper: {
    width: '100%',
    height: Math.min(
      ((Dimensions.get('window').width -
        Spacing.lg * 2) *
        2) /
        3,
      280
    ),
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    marginTop: Spacing.md,
  },

  dot: {
    position: 'absolute',
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },

  infoArea: {
    minHeight: 58,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: Spacing.sm,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  infoText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    flexShrink: 1,
  },

  directionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 9,
    flexWrap: 'wrap',
    marginBottom: 12,
  },

  dirButton: {
    width: 58,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ================================================================
     STATUS
  ================================================================ */

  statusBar: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },

  statusItem: {
    alignItems: 'center',
    minWidth: 65,
  },

  statusLabel: {
    fontSize: 9,
  },

  statusValue: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },

  /* ================================================================
     FINAL RESULTS
  ================================================================ */

  resultCard: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 1,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    alignItems: 'center',
  },

  resultIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultTitle: {
    fontSize: 24,
    fontWeight: '900',
    marginTop: 15,
  },

  resultSubtitle: {
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 18,
  },

  resultItem: {
    width: '100%',
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },

  resultItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  resultLabel: {
    fontSize: 12,
  },

  resultValue: {
    fontSize: 17,
    fontWeight: '900',
  },

  restartButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  restartText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});