import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useRouter } from 'expo-router';

import {
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import { MotiView } from 'moti';

import {
  Svg,
  Polygon,
} from 'react-native-svg';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';


type ShapeType =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'diamond'
  | 'star'
  | 'hexagon';

type Shape = {
  shape: ShapeType;
  color: string;
};

/*
 * ============================================================
 * GAME CONFIG
 * ============================================================
 */

const TOTAL_ROUNDS = 5;

const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 4;

const STORAGE_KEY =
  'neurolia_memory_challenge_adaptive_v2';



const difficultyConfig = {
  1: {
    optionCount: 4,
    similarity: 0.9,
  },

  2: {
    optionCount: 6,
    similarity: 0.7,
  },

  3: {
    optionCount: 6,
    similarity: 0.5,
  },

  4: {
    optionCount: 9,
    similarity: 0.3,
  },
} as const;

/*
 * ============================================================
 * SHAPES
 * ============================================================
 */

const shapeTypes: ShapeType[] = [
  'circle',
  'square',
  'triangle',
  'diamond',
  'star',
  'hexagon',
];

const shapeColors = [
  '#EF4444',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
];

/*
 * ============================================================
 * LOCAL TEXT
 * ============================================================
 */

const text = {
  fa: {
    title: 'چالش حافظه',

    subtitle:
      'شکل و رنگ صحیح را پیدا کنید',

    instruction:
      'شکل صحیح را پیدا کنید',

    start:
      'شروع بازی',

    gameCompleted:
      'بازی تمام شد',

    tryAgain:
      'دوباره بازی کنید',

    back:
      'بازگشت',

    round:
      'مرحله',

    score:
      'امتیاز',

    correct:
      'صحیح',

    correctAnswers:
      'پاسخ صحیح',

    answers:
      'پاسخ',

    of:
      'از',

    adaptive:
      'سختی تطبیقی',

    adaptiveUp:
      'عملکرد شما عالی بود. مرحله بعد کمی سخت‌تر خواهد بود.',

    adaptiveDown:
      'این مرحله کمی دشوار بود. مرحله بعد کمی آسان‌تر خواهد بود.',

    adaptiveSame:
      'عملکرد شما مناسب بود. سختی بازی حفظ می‌شود.',

    adaptiveInfo:
      'سختی بازی بر اساس عملکرد واقعی شما به‌صورت خودکار تنظیم می‌شود.',

    previousPerformance:
      'عملکرد قبلی',

    difficulty:
      'سختی فعلی',

    noSelection:
      'نیازی به انتخاب سطح نیست',

    excellent:
      'عالی!',

    veryGood:
      'خیلی خوب!',

    good:
      'خوب بود!',

    keepPracticing:
      'به تمرین ادامه دهید!',

    easy:
      'آسان',

    medium:
      'متوسط',

    hard:
      'سخت',

    expert:
      'حرفه‌ای',

    circle:
      'دایره',

    square:
      'مربع',

    triangle:
      'مثلث',

    diamond:
      'لوزی',

    star:
      'ستاره',

    hexagon:
      'شش‌ضلعی',

    red:
      'قرمز',

    blue:
      'آبی',

    green:
      'سبز',

    yellow:
      'زرد',

    purple:
      'بنفش',

    pink:
      'صورتی',
  },

  en: {
    title: 'Memory Challenge',

    subtitle:
      'Find the correct shape and color',

    instruction:
      'Find the correct shape',

    start:
      'Start Game',

    gameCompleted:
      'Game Completed',

    tryAgain:
      'Try Again',

    back:
      'Back',

    round:
      'Round',

    score:
      'Score',

    correct:
      'correct',

    correctAnswers:
      'Correct Answers',

    answers:
      'answers',

    of:
      'of',

    adaptive:
      'Adaptive Difficulty',

    adaptiveUp:
      'Excellent performance. The next session will be slightly harder.',

    adaptiveDown:
      'This session was challenging. The next session will be slightly easier.',

    adaptiveSame:
      'Good performance. The difficulty will remain stable.',

    adaptiveInfo:
      'Game difficulty automatically adapts to your actual performance.',

    previousPerformance:
      'Previous Performance',

    difficulty:
      'Current Difficulty',

    noSelection:
      'No level selection required',

    excellent:
      'Excellent!',

    veryGood:
      'Very Good!',

    good:
      'Good Job!',

    keepPracticing:
      'Keep Practicing!',

    easy:
      'Easy',

    medium:
      'Medium',

    hard:
      'Hard',

    expert:
      'Expert',

    circle:
      'Circle',

    square:
      'Square',

    triangle:
      'Triangle',

    diamond:
      'Diamond',

    star:
      'Star',

    hexagon:
      'Hexagon',

    red:
      'Red',

    blue:
      'Blue',

    green:
      'Green',

    yellow:
      'Yellow',

    purple:
      'Purple',

    pink:
      'Pink',
  },
};

/*
 * ============================================================
 * RANDOM HELPERS
 * ============================================================
 */

function randomItem<T>(
  array: T[]
): T {
  return array[
    Math.floor(
      Math.random() * array.length
    )
  ];
}

function shuffle<T>(
  array: T[]
): T[] {
  return [...array].sort(
    () => Math.random() - 0.5
  );
}

/*
 * ============================================================
 * TARGET
 * ============================================================
 */

function generateRandomTarget(): Shape {
  return {
    shape: randomItem(shapeTypes),
    color: randomItem(shapeColors),
  };
}



function generateOptions(
  target: Shape,
  difficulty: number
): Shape[] {
  const config =
    difficultyConfig[
      difficulty as keyof typeof difficultyConfig
    ] || difficultyConfig[1];

  const options: Shape[] = [];



  options.push({
    shape: target.shape,
    color: target.color,
  });

  const availableShapes =
    shapeTypes.filter(
      shape =>
        shape !== target.shape
    );

  const availableColors =
    shapeColors.filter(
      color =>
        color !== target.color
    );

  let attempts = 0;

  while (
    options.length <
      config.optionCount &&
    attempts < 150
  ) {
    attempts++;

    let newShape: ShapeType;
    let newColor: string;

    /*
     * Similar distractors.
     */

    if (
      Math.random() <
      config.similarity
    ) {
      /*
       * Same shape + different color
       * OR
       * different shape + same color
       */

      if (
        Math.random() < 0.5
      ) {
        newShape =
          target.shape;

        newColor =
          randomItem(
            availableColors
          );
      } else {
        newShape =
          randomItem(
            availableShapes
          );

        newColor =
          target.color;
      }
    } else {
      /*
       * Completely different
       * shape + color.
       */

      newShape =
        randomItem(
          availableShapes
        );

      newColor =
        randomItem(
          availableColors
        );
    }

    const alreadyExists =
      options.some(
        option =>
          option.shape ===
            newShape &&
          option.color ===
            newColor
      );

    if (!alreadyExists) {
      options.push({
        shape: newShape,
        color: newColor,
      });
    }
  }

  return shuffle(options);
}

/*
 * ============================================================
 * SHAPE COMPONENT
 * ============================================================
 */

function ShapeComponent({
  type,
  color,
  size = 55,
}: {
  type: ShapeType;
  color: string;
  size?: number;
}) {
  switch (type) {
    case 'circle':
      return (
        <View
          style={[
            styles.circleShape,
            {
              width: size,
              height: size,
              backgroundColor:
                color,
            },
          ]}
        />
      );

    case 'square':
      return (
        <View
          style={[
            styles.squareShape,
            {
              width: size,
              height: size,
              backgroundColor:
                color,
            },
          ]}
        />
      );

    case 'triangle':
      return (
        <View
          style={[
            styles.triangleShape,
            {
              borderLeftWidth:
                size / 2,
              borderRightWidth:
                size / 2,
              borderBottomWidth:
                size,
              borderBottomColor:
                color,
            },
          ]}
        />
      );

    case 'diamond':
      return (
        <View
          style={[
            styles.diamondShape,
            {
              width:
                size * 0.72,
              height:
                size * 0.72,
              backgroundColor:
                color,
              transform: [
                {
                  rotate: '45deg',
                },
              ],
            },
          ]}
        />
      );

    case 'star':
      return (
        <Text
          style={[
            styles.starShape,
            {
              color,
              fontSize:
                size,
            },
          ]}
        >
          ★
        </Text>
      );

    case 'hexagon':
      return (
        <Svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
        >
          <Polygon
            points="
              50,5
              95,27.5
              95,72.5
              50,95
              5,72.5
              5,27.5
            "
            fill={color}
          />
        </Svg>
      );

    default:
      return null;
  }
}

/*
 * ============================================================
 * PAGE HEADER
 * ============================================================
 */

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
          borderBottomColor:
            colors.border,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onBack}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={
          backLabel
        }
        style={[
          styles.unifiedBackButton,
          {
            backgroundColor:
              colors.surface,
            borderColor:
              colors.border,
          },
        ]}
      >
        <MaterialCommunityIcons
          name={
            isRTL
              ? 'arrow-left'
              : 'arrow-right'
          }
          size={23}
          color={colors.text}
        />
      </TouchableOpacity>

      <View
        style={[
          styles.pageHeaderText,
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
            styles.pageHeaderTitle,
            {
              color: colors.text,
              textAlign:
                isRTL
                  ? 'right'
                  : 'left',
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
                color:
                  colors.textSecondary,
                textAlign:
                  isRTL
                    ? 'right'
                    : 'left',
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

/*
 * ============================================================
 * MAIN SCREEN
 * ============================================================
 */

export default function MemoryChallenge() {
  const router = useRouter();

  const {
    colors,
  } = useTheme();

  const {
    isRTL,
    language,
  } = useLanguage();

  const currentText =
    language === 'fa'
      ? text.fa
      : text.en;

  /*
   * Adaptive difficulty.
   *
   * User NEVER changes this manually.
   */

  const [
    difficulty,
    setDifficulty,
  ] = useState<number>(1);

  const [
    previousAccuracy,
    setPreviousAccuracy,
  ] = useState<number | null>(
    null
  );

  /*
   * Game state.
   */

  const [
    gameStarted,
    setGameStarted,
  ] = useState(false);

  const [
    gameFinished,
    setGameFinished,
  ] = useState(false);

  const [
    currentRound,
    setCurrentRound,
  ] = useState(1);

  const [
    score,
    setScore,
  ] = useState(0);

  const [
    correctAnswers,
    setCorrectAnswers,
  ] = useState(0);

  const [
    target,
    setTarget,
  ] = useState<Shape>(
    generateRandomTarget()
  );

  const [
    options,
    setOptions,
  ] = useState<Shape[]>([]);

  const [
    adaptiveResult,
    setAdaptiveResult,
  ] = useState<
    'up' | 'down' | 'same' | null
  >(null);

  /*
   * ============================================================
   * LOAD ADAPTIVE DATA
   * ============================================================
   */

  useEffect(() => {
    loadAdaptiveState();
  }, []);

  async function loadAdaptiveState() {
    try {
      const saved =
        await AsyncStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {
        return;
      }

      const data =
        JSON.parse(saved);

      if (
        typeof data.difficulty ===
        'number'
      ) {
        const safeDifficulty =
          Math.max(
            MIN_DIFFICULTY,
            Math.min(
              MAX_DIFFICULTY,
              data.difficulty
            )
          );

        setDifficulty(
          safeDifficulty
        );
      }

      if (
        typeof data.accuracy ===
        'number'
      ) {
        setPreviousAccuracy(
          data.accuracy
        );
      }
    } catch (error) {
      console.log(
        '[MemoryChallenge] Failed to load adaptive state:',
        error
      );
    }
  }

  /*
   * ============================================================
   * SAVE ADAPTIVE DATA
   * ============================================================
   */

  async function saveAdaptiveState(
    nextDifficulty: number,
    accuracy: number
  ) {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          difficulty:
            nextDifficulty,

          accuracy,

          lastCorrectAnswers:
            correctAnswers,

          totalRounds:
            TOTAL_ROUNDS,

          updatedAt:
            new Date().toISOString(),
        })
      );
    } catch (error) {
      console.log(
        '[MemoryChallenge] Failed to save adaptive state:',
        error
      );
    }
  }

  /*
   * ============================================================
   * START GAME
   * ============================================================
   */

  function startGame() {
    const newTarget =
      generateRandomTarget();

    setTarget(newTarget);

    setOptions(
      generateOptions(
        newTarget,
        difficulty
      )
    );

    setGameStarted(true);
    setGameFinished(false);

    setCurrentRound(1);

    setScore(0);

    setCorrectAnswers(0);

    setAdaptiveResult(null);
  }

  /*
   * ============================================================
   * SELECT ANSWER
   * ============================================================
   */

  function selectShape(
    selectedShape: Shape
  ) {
    const isCorrect =
      selectedShape.shape ===
        target.shape &&
      selectedShape.color ===
        target.color;

    const newCorrectAnswers =
      isCorrect
        ? correctAnswers + 1
        : correctAnswers;

    if (isCorrect) {
      setScore(
        previous =>
          previous + 20
      );

      setCorrectAnswers(
        previous =>
          previous + 1
      );
    }

    /*
     * Finish after the final round.
     */

    if (
      currentRound >=
      TOTAL_ROUNDS
    ) {
      finishGame(
        newCorrectAnswers
      );

      return;
    }

    /*
     * Next round.
     */

    const nextRound =
      currentRound + 1;

    const newTarget =
      generateRandomTarget();

    setCurrentRound(
      nextRound
    );

    setTarget(newTarget);

    setOptions(
      generateOptions(
        newTarget,
        difficulty
      )
    );
  }

  /*
   * ============================================================
   * FINISH GAME
   * ============================================================
   */

  async function finishGame(
    finalCorrectAnswers: number
  ) {
    const accuracy = Math.round(
      (finalCorrectAnswers /
        TOTAL_ROUNDS) *
        100
    );

    let nextDifficulty =
      difficulty;

    let result:
      | 'up'
      | 'down'
      | 'same' =
      'same';

    /*
     * Adaptive rules.
     *
     * 80-100% -> harder
     * 40-79%  -> same
     * 0-39%   -> easier
     */

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

    setPreviousAccuracy(
      accuracy
    );

    setAdaptiveResult(
      result
    );

    setDifficulty(
      nextDifficulty
    );

    setGameFinished(true);

    await saveAdaptiveState(
      nextDifficulty,
      accuracy
    );
  }

  /*
   * ============================================================
   * RESET / PLAY AGAIN
   * ============================================================
   */

  function resetGame() {
    /*
     * IMPORTANT:
     * Start from the NEW adaptive difficulty.
     */

    const newTarget =
      generateRandomTarget();

    setTarget(newTarget);

    setOptions(
      generateOptions(
        newTarget,
        difficulty
      )
    );

    setCurrentRound(1);

    setScore(0);

    setCorrectAnswers(0);

    setGameFinished(false);

    setGameStarted(true);

    setAdaptiveResult(null);
  }

  /*
   * ============================================================
   * BACK
   * ============================================================
   */

  function handleBack() {
    if (
      gameStarted ||
      gameFinished
    ) {
      setGameStarted(false);

      setGameFinished(false);

      setCurrentRound(1);

      setScore(0);

      setCorrectAnswers(0);

      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(
        '/(tabs)/psycho'
      );
    }
  }

  /*
   * ============================================================
   * HELPERS
   * ============================================================
   */

  function getShapeName(
    shape: ShapeType
  ) {
    return currentText[
      shape
    ];
  }

  function getColorName(
    color: string
  ) {
    const colorMap: Record<
      string,
      keyof typeof text.fa
    > = {
      '#EF4444': 'red',
      '#3B82F6': 'blue',
      '#10B981': 'green',
      '#F59E0B': 'yellow',
      '#8B5CF6': 'purple',
      '#EC4899': 'pink',
    };

    return currentText[
      colorMap[color]
    ];
  }

  function getDifficultyName() {
    const names = {
      1: currentText.easy,
      2: currentText.medium,
      3: currentText.hard,
      4: currentText.expert,
    };

    return names[
      difficulty as keyof typeof names
    ];
  }

  function getFeedback(
    percentage: number
  ) {
    if (percentage >= 80) {
      return currentText.excellent;
    }

    if (percentage >= 60) {
      return currentText.veryGood;
    }

    if (percentage >= 40) {
      return currentText.good;
    }

    return currentText.keepPracticing;
  }

  /*
   * ============================================================
   * START SCREEN
   * ============================================================
   */

  if (
    !gameStarted &&
    !gameFinished
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
          title={
            currentText.title
          }
          subtitle={
            currentText.noSelection
          }
          onBack={
            handleBack
          }
          colors={colors}
          isRTL={isRTL}
          backLabel={
            currentText.back
          }
        />

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.content
          }
        >
          <MotiView
            from={{
              opacity: 0,
              translateY: 20,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
            }}
            transition={{
              type: 'timing',
              duration: 450,
            }}
          >
            {/* Game intro */}

            <View
              style={[
                styles.introCard,
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
                  styles.introIcon,
                  {
                    backgroundColor:
                      colors.primary +
                      '15',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="brain"
                  size={43}
                  color={
                    colors.primary
                  }
                />
              </View>

              <Text
                style={[
                  styles.introTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {currentText.title}
              </Text>

              <Text
                style={[
                  styles.introDescription,
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
                {currentText.adaptiveInfo}
              </Text>
            </View>

            {/* Adaptive information */}

            <View
              style={[
                styles.adaptiveCard,
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
              <View
                style={[
                  styles.adaptiveIcon,
                  {
                    backgroundColor:
                      colors.primary +
                      '18',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="auto-fix"
                  size={22}
                  color={
                    colors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.adaptiveInfoContent
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
                  {currentText.adaptive}
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
                    currentText.adaptiveInfo
                  }
                </Text>
              </View>
            </View>

            {/* Previous performance */}

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
                <View>
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
                      currentText.previousPerformance
                    }
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
                    {
                      previousAccuracy
                    }
                    %
                  </Text>
                </View>

                <MaterialCommunityIcons
                  name="chart-line"
                  size={27}
                  color={
                    colors.primary
                  }
                />
              </View>
            )}

            {/* Start */}

            <TouchableOpacity
              onPress={
                startGame
              }
              activeOpacity={0.85}
              style={[
                styles.startButton,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="play"
                size={20}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.startText
                }
              >
                {currentText.start}
              </Text>
            </TouchableOpacity>
          </MotiView>
        </ScrollView>
      </View>
    );
  }

  /*
   * ============================================================
   * RESULT SCREEN
   * ============================================================
   */

  if (gameFinished) {
    const maxScore =
      TOTAL_ROUNDS * 20;

    const percentage =
      Math.round(
        (score / maxScore) *
          100
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
          title={
            currentText.gameCompleted
          }
          subtitle={
            currentText.title
          }
          onBack={
            handleBack
          }
          colors={colors}
          isRTL={isRTL}
          backLabel={
            currentText.back
          }
        />

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.resultContent
          }
        >
          <MotiView
            from={{
              opacity: 0,
              scale: 0.92,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              type: 'spring',
              damping: 18,
            }}
          >
            {/* Result icon */}

            <View
              style={[
                styles.resultIconBox,
                {
                  backgroundColor:
                    colors.primary +
                    '15',
                },
              ]}
            >
              <MaterialCommunityIcons
                name="trophy"
                size={46}
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
              {
                currentText.gameCompleted
              }
            </Text>

            {/* Score */}

            <View
              style={[
                styles.resultScoreContainer,
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
                  styles.resultMaxScore,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                / {maxScore}
              </Text>
            </View>

            {/* Correct answers */}

            <Text
              style={[
                styles.resultDescription,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {correctAnswers}{' '}
              {currentText.of}{' '}
              {TOTAL_ROUNDS}{' '}
              {
                currentText.correctAnswers
              }
            </Text>

            {/* Feedback */}

            <Text
              style={[
                styles.feedbackText,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {getFeedback(
                percentage
              )}
            </Text>

            {/* Percentage */}

            <View
              style={[
                styles.percentageBar,
                {
                  backgroundColor:
                    colors.border,
                },
              ]}
            >
              <MotiView
                animate={{
                  width: `${percentage}%`,
                }}
                transition={{
                  type: 'spring',
                  damping: 15,
                }}
                style={[
                  styles.percentageFill,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
              />
            </View>

            {/* Adaptive result */}

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
                <MaterialCommunityIcons
                  name="auto-fix"
                  size={21}
                  color={
                    colors.primary
                  }
                />
              </View>

              <View
                style={
                  styles.adaptiveResultContent
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
                    currentText.adaptive
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
                    ? currentText.adaptiveUp
                    : adaptiveResult ===
                        'down'
                      ? currentText.adaptiveDown
                      : currentText.adaptiveSame}
                </Text>
              </View>
            </View>

            {/* New difficulty */}

            <View
              style={[
                styles.nextDifficultyCard,
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
                  styles.nextDifficultyLabel,
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
                  currentText.difficulty
                }
              </Text>

              <Text
                style={[
                  styles.nextDifficultyValue,
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
                  getDifficultyName()
                }
              </Text>
            </View>

            {/* Try again */}

            <TouchableOpacity
              onPress={
                resetGame
              }
              activeOpacity={0.85}
              style={[
                styles.startButton,
                {
                  backgroundColor:
                    colors.primary,
                  marginTop:
                    Spacing.lg,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="reload"
                size={21}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.startText
                }
              >
                {
                  currentText.tryAgain
                }
              </Text>
            </TouchableOpacity>
          </MotiView>
        </ScrollView>
      </View>
    );
  }

  /*
   * ============================================================
   * GAME SCREEN
   * ============================================================
   */

  const targetShapeName =
    getShapeName(
      target.shape
    );

  const targetColorName =
    getColorName(
      target.color
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
        title={
          currentText.title
        }
        subtitle={`${currentText.round} ${currentRound} / ${TOTAL_ROUNDS} • ${currentText.score}: ${score}`}
        onBack={
          handleBack
        }
        colors={colors}
        isRTL={isRTL}
        backLabel={
          currentText.back
        }
      />

      {/* Progress */}

      <View
        style={
          styles.progressContainer
        }
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
          <Text
            style={[
              styles.correctText,
              {
                color:
                  colors.primary,
              },
            ]}
          >
            ✓ {correctAnswers}{' '}
            {
              currentText.correct
            }
          </Text>
        </View>

        <View
          style={[
            styles.progressBackground,
            {
              backgroundColor:
                colors.border,
            },
          ]}
        >
          <MotiView
            animate={{
              width: `${
                (currentRound /
                  TOTAL_ROUNDS) *
                100
              }%`,
            }}
            transition={{
              type: 'timing',
              duration: 350,
            }}
            style={[
              styles.progressFill,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Game */}

      <View
        style={
          styles.gameContent
        }
      >
        <Text
          style={[
            styles.instruction,
            {
              color:
                colors.textSecondary,
              textAlign:
                'center',
            },
          ]}
        >
          {
            currentText.instruction
          }
        </Text>

        {/*
         * IMPORTANT:
         *
         * This is the original core mechanic.
         *
         * Example:
         * "Red Circle"
         *
         * User must find exactly:
         * Circle + Red
         */}

        <Text
          style={[
            styles.targetText,
            {
              color:
                colors.text,
              textAlign:
                'center',
            },
          ]}
        >
          {isRTL
            ? `${targetShapeName} ${targetColorName}`
            : `${targetColorName} ${targetShapeName}`}
        </Text>

        {/* Options */}

        <View
          style={
            styles.options
          }
        >
          {options.map(
            (
              shape,
              index
            ) => (
              <MotiView
                key={`${shape.shape}-${shape.color}-${index}`}
                from={{
                  opacity: 0,
                  scale: 0.88,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  delay:
                    index * 35,
                  type: 'timing',
                  duration: 220,
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    selectShape(
                      shape
                    )
                  }
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={
                    `${getColorName(
                      shape.color
                    )} ${getShapeName(
                      shape.shape
                    )}`
                  }
                  style={[
                    styles.shapeOption,
                    {
                      backgroundColor:
                        colors.surface,
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
                  <ShapeComponent
                    type={
                      shape.shape
                    }
                    color={
                      shape.color
                    }
                    size={50}
                  />
                </TouchableOpacity>
              </MotiView>
            )
          )}
        </View>
      </View>
    </View>
  );
}

/*
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    /*
     * HEADER
     */

    pageHeader: {
      width: '100%',
      paddingHorizontal:
        Spacing.lg,
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

    /*
     * CONTENT
     */

    content: {
      paddingTop: 20,
      paddingHorizontal:
        Spacing.lg,
      paddingBottom: 100,
    },

    resultContent: {
      paddingHorizontal:
        Spacing.lg,
      paddingBottom: 100,
    },

    /*
     * INTRO
     */

    introCard: {
      borderWidth: 1,
      borderRadius:
        BorderRadius.lg,
      padding: Spacing.xl,
      alignItems: 'center',
    },

    introIcon: {
      width: 82,
      height: 82,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },

    introTitle: {
      fontSize: 25,
      fontWeight: '800',
    },

    introDescription: {
      fontSize: 14,
      lineHeight: 22,
      marginTop: 9,
    },

    /*
     * ADAPTIVE
     */

    adaptiveCard: {
      marginTop: Spacing.md,
      padding: Spacing.md,
      borderWidth: 1,
      borderRadius:
        BorderRadius.lg,
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
      flexShrink: 0,
    },

    adaptiveInfoContent: {
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

    previousCard: {
      marginTop: Spacing.md,
      paddingHorizontal:
        Spacing.md,
      paddingVertical:
        Spacing.sm,
      borderWidth: 1,
      borderRadius:
        BorderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },

    previousLabel: {
      fontSize: 11,
    },

    previousValue: {
      fontSize: 23,
      fontWeight: '900',
      marginTop: 2,
    },

    /*
     * BUTTON
     */

    startButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop:
        Spacing.md,
      paddingVertical: 16,
      borderRadius:
        BorderRadius.full,
    },

    startText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },

    /*
     * PROGRESS
     */

    progressContainer: {
      paddingHorizontal:
        Spacing.lg,
      paddingTop:
        Spacing.md,
      paddingBottom:
        Spacing.sm,
    },

    progressHeader: {
      justifyContent:
        'flex-end',
      marginBottom: 7,
    },

    correctText: {
      fontSize: 14,
      fontWeight: '600',
    },

    progressBackground: {
      height: 6,
      borderRadius:
        BorderRadius.full,
      overflow: 'hidden',
    },

    progressFill: {
      height: '100%',
      borderRadius:
        BorderRadius.full,
    },

    /*
     * GAME
     */

    gameContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding:
        Spacing.lg,
    },

    instruction: {
      fontSize: 15,
      lineHeight: 22,
    },

    targetText: {
      fontSize: 30,
      fontWeight: '800',
      marginTop: 8,
      marginBottom:
        Spacing.xl,
    },

    options: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent:
        'center',
      gap: Spacing.md,
      width: '100%',
    },

    shapeOption: {
      width: 100,
      height: 100,
      borderRadius:
        BorderRadius.lg,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /*
     * SHAPES
     */

    circleShape: {
      borderRadius: 999,
    },

    squareShape: {
      borderRadius: 4,
    },

    triangleShape: {
      width: 0,
      height: 0,
      backgroundColor:
        'transparent',
      borderStyle: 'solid',
      borderLeftColor:
        'transparent',
      borderRightColor:
        'transparent',
    },

    diamondShape: {
      borderRadius: 2,
    },

    starShape: {
      textAlign: 'center',
      lineHeight: 55,
    },

    /*
     * RESULT
     */

    resultIconBox: {
      width: 82,
      height: 82,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginTop: 25,
    },

    resultTitle: {
      fontSize: 24,
      fontWeight: '700',
      marginTop: Spacing.md,
      marginBottom:
        Spacing.md,
      textAlign: 'center',
    },

    resultScoreContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      paddingHorizontal:
        Spacing.xl,
      paddingVertical:
        Spacing.md,
      borderRadius:
        BorderRadius.lg,
      borderWidth: 1,
      alignSelf: 'center',
    },

    resultScore: {
      fontSize: 48,
      fontWeight: '900',
    },

    resultMaxScore: {
      fontSize: 20,
      marginLeft: 4,
    },

    resultDescription: {
      fontSize: 16,
      marginTop: Spacing.md,
      marginBottom:
        Spacing.md,
      textAlign: 'center',
    },

    feedbackText: {
      fontSize: 17,
      fontWeight: '700',
      marginBottom:
        Spacing.md,
      textAlign: 'center',
    },

    percentageBar: {
      width: '80%',
      height: 8,
      borderRadius:
        BorderRadius.full,
      overflow: 'hidden',
      marginBottom:
        Spacing.lg,
      alignSelf: 'center',
    },

    percentageFill: {
      height: '100%',
      borderRadius:
        BorderRadius.full,
    },

    /*
     * ADAPTIVE RESULT
     */

    adaptiveResultCard: {
      borderWidth: 1,
      borderRadius:
        BorderRadius.lg,
      padding: Spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    adaptiveResultIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },

    adaptiveResultContent: {
      flex: 1,
    },

    adaptiveResultTitle: {
      fontSize: 14,
      fontWeight: '800',
    },

    adaptiveResultDescription: {
      fontSize: 11,
      lineHeight: 18,
      marginTop: 4,
    },

    nextDifficultyCard: {
      marginTop: Spacing.md,
      padding:
        Spacing.md,
      borderWidth: 1,
      borderRadius:
        BorderRadius.lg,
    },

    nextDifficultyLabel: {
      fontSize: 11,
    },

    nextDifficultyValue: {
      fontSize: 18,
      fontWeight: '900',
      marginTop: 3,
    },
  });