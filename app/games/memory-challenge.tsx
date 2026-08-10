import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';

type Level = 'easy' | 'medium' | 'hard' | 'expert';

type Shape = {
  shape:
    | 'circle'
    | 'square'
    | 'triangle'
    | 'diamond'
    | 'star'
    | 'hexagon';
  color: string;
};

const TOTAL_ROUNDS = 5;

const levels = [
  {
    id: 'easy' as Level,
    title: 'Easy',
    titleFa: 'آسان',
    description: '4 options, clear differences',
    descriptionFa: '۴ گزینه، تفاوت واضح',
    optionCount: 4,
    similarity: 0.9,
  },
  {
    id: 'medium' as Level,
    title: 'Medium',
    titleFa: 'متوسط',
    description: '6 options, similar colors',
    descriptionFa: '۶ گزینه، رنگ‌های مشابه',
    optionCount: 6,
    similarity: 0.7,
  },
  {
    id: 'hard' as Level,
    title: 'Hard',
    titleFa: 'سخت',
    description: '6 options, similar shapes',
    descriptionFa: '۶ گزینه، شکل‌های مشابه',
    optionCount: 6,
    similarity: 0.5,
  },
  {
    id: 'expert' as Level,
    title: 'Expert',
    titleFa: 'حرفه‌ای',
    description: '9 options, maximum difficulty',
    descriptionFa: '۹ گزینه، حداکثر سختی',
    optionCount: 9,
    similarity: 0.3,
  },
];

const shapeTypes = [
  'circle',
  'square',
  'triangle',
  'diamond',
  'star',
  'hexagon',
] as const;

const shapeColors = [
  '#EF4444',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
];

const shapeNames = {
  circle: 'Circle',
  square: 'Square',
  triangle: 'Triangle',
  diamond: 'Diamond',
  star: 'Star',
  hexagon: 'Hexagon',
};

const shapeNamesFa = {
  circle: 'دایره',
  square: 'مربع',
  triangle: 'مثلث',
  diamond: 'لوزی',
  star: 'ستاره',
  hexagon: 'شش‌ضلعی',
};

const colorNames = {
  '#EF4444': 'Red',
  '#3B82F6': 'Blue',
  '#10B981': 'Green',
  '#F59E0B': 'Yellow',
  '#8B5CF6': 'Purple',
  '#EC4899': 'Pink',
};

const colorNamesFa = {
  '#EF4444': 'قرمز',
  '#3B82F6': 'آبی',
  '#10B981': 'سبز',
  '#F59E0B': 'زرد',
  '#8B5CF6': 'بنفش',
  '#EC4899': 'صورتی',
};

const generateRandomTarget = (): Shape => {
  return {
    shape:
      shapeTypes[
        Math.floor(
          Math.random() * shapeTypes.length
        )
      ],
    color:
      shapeColors[
        Math.floor(
          Math.random() * shapeColors.length
        )
      ],
  };
};

const generateOptions = (
  target: Shape,
  level: Level
): Shape[] => {
  const levelConfig = levels.find(
    l => l.id === level
  )!;

  const count = levelConfig.optionCount;
  const similarity = levelConfig.similarity;

  const options: Shape[] = [];

  options.push({
    shape: target.shape,
    color: target.color,
  });

  const availableShapes =
    shapeTypes.filter(
      s => s !== target.shape
    );

  const availableColors =
    shapeColors.filter(
      c => c !== target.color
    );

  let attempts = 0;

  while (
    options.length < count &&
    attempts < 100
  ) {
    attempts++;

    let newShape: typeof shapeTypes[number];
    let newColor: string;

    if (Math.random() > similarity) {
      newShape =
        availableShapes[
          Math.floor(
            Math.random() *
              availableShapes.length
          )
        ];

      newColor =
        availableColors[
          Math.floor(
            Math.random() *
              availableColors.length
          )
        ];
    } else {
      const useSameShape =
        Math.random() > 0.5;

      if (useSameShape) {
        newShape = target.shape;

        newColor =
          availableColors[
            Math.floor(
              Math.random() *
                availableColors.length
            )
          ];
      } else {
        newShape =
          availableShapes[
            Math.floor(
              Math.random() *
                availableShapes.length
            )
          ];

        newColor = target.color;
      }
    }

    const exists = options.some(
      option =>
        option.shape === newShape &&
        option.color === newColor
    );

    if (!exists) {
      options.push({
        shape: newShape,
        color: newColor,
      });
    }
  }

  return options.sort(
    () => Math.random() - 0.5
  );
};

const ShapeComponent = ({
  type,
  color,
  size = 55,
}: {
  type: string;
  color: string;
  size?: number;
}) => {
  switch (type) {
    case 'circle':
      return (
        <View
          style={[
            styles.circleShape,
            {
              width: size,
              height: size,
              backgroundColor: color,
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
              backgroundColor: color,
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
              borderBottomColor: color,
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
              width: size * 0.8,
              height: size * 0.8,
              backgroundColor: color,
              transform: [
                { rotate: '45deg' },
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
              fontSize: size,
            },
          ]}
        >
          ★
        </Text>
      );

    case 'hexagon':
      return (
        <View
          style={[
            styles.hexagonShape,
            {
              width: size * 0.9,
              height: size * 0.8,
              backgroundColor: color,
            },
          ]}
        />
      );

    default:
      return (
        <View
          style={[
            styles.circleShape,
            {
              width: size,
              height: size,
              backgroundColor: color,
            },
          ]}
        />
      );
  }
};

export default function MemoryChallenge() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, isRTL, language } =
    useLanguage();

  const [selectedLevel, setSelectedLevel] =
    useState<Level>('easy');

  const [gameStarted, setGameStarted] =
    useState(false);

  const [currentRound, setCurrentRound] =
    useState(1);

  const [score, setScore] = useState(0);

  const [correctAnswers, setCorrectAnswers] =
    useState(0);

  const [gameFinished, setGameFinished] =
    useState(false);

  const [target, setTarget] = useState<Shape>(
    generateRandomTarget()
  );

  const [options, setOptions] =
    useState<Shape[]>([]);

  useEffect(() => {
    if (
      gameStarted &&
      !gameFinished
    ) {
      const newTarget =
        generateRandomTarget();

      setTarget(newTarget);

      setOptions(
        generateOptions(
          newTarget,
          selectedLevel
        )
      );
    }
  }, [
    currentRound,
    gameStarted,
    gameFinished,
    selectedLevel,
  ]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/psycho');
    }
  };

  const startGame = () => {
    setScore(0);
    setCorrectAnswers(0);
    setCurrentRound(1);
    setGameFinished(false);
    setGameStarted(true);

    const newTarget =
      generateRandomTarget();

    setTarget(newTarget);

    setOptions(
      generateOptions(
        newTarget,
        selectedLevel
      )
    );
  };

  const selectShape = (
    shape: Shape
  ) => {
    const isCorrect =
      shape.shape === target.shape &&
      shape.color === target.color;

    if (isCorrect) {
      setScore(
        prev => prev + 20
      );

      setCorrectAnswers(
        prev => prev + 1
      );
    }

    if (
      currentRound >= TOTAL_ROUNDS
    ) {
      setGameFinished(true);
      return;
    }

    setCurrentRound(
      prev => prev + 1
    );
  };

  const resetGame = () => {
    setCurrentRound(1);
    setScore(0);
    setCorrectAnswers(0);
    setGameFinished(false);
    setGameStarted(true);

    const newTarget =
      generateRandomTarget();

    setTarget(newTarget);

    setOptions(
      generateOptions(
        newTarget,
        selectedLevel
      )
    );
  };

  const getLevelTitle = (
    levelId: string
  ) => {
    const level = levels.find(
      l => l.id === levelId
    );

    if (!level) return '';

    return language === 'fa'
      ? level.titleFa
      : level.title;
  };

  const getLevelDescription = (
    levelId: string
  ) => {
    const level = levels.find(
      l => l.id === levelId
    );

    if (!level) return '';

    return language === 'fa'
      ? level.descriptionFa
      : level.description;
  };

  const getShapeName = (
    shapeType: string
  ) => {
    return language === 'fa'
      ? shapeNamesFa[
          shapeType as keyof typeof shapeNamesFa
        ]
      : shapeNames[
          shapeType as keyof typeof shapeNames
        ];
  };

  const getColorName = (
    colorCode: string
  ) => {
    return language === 'fa'
      ? colorNamesFa[
          colorCode as keyof typeof colorNamesFa
        ]
      : colorNames[
          colorCode as keyof typeof colorNames
        ];
  };

  const getFeedback = (
    percentage: number
  ) => {
    if (percentage >= 100)
      return language === 'fa'
        ? 'عالی! امتیاز کامل!'
        : 'Perfect Score! Amazing!';

    if (percentage >= 80)
      return language === 'fa'
        ? 'کار عالی!'
        : 'Excellent work!';

    if (percentage >= 60)
      return language === 'fa'
        ? 'خوب بود!'
        : 'Good job!';

    if (percentage >= 40)
      return language === 'fa'
        ? 'به تلاش ادامه دهید!'
        : 'Keep trying!';

    return language === 'fa'
      ? 'تمرین کنید!'
      : 'Keep practicing!';
  };

  const getEmoji = (
    percentage: number
  ) => {
    if (percentage >= 100)
      return '🏆';

    if (percentage >= 80)
      return '🌟';

    if (percentage >= 60)
      return '💪';

    if (percentage >= 40)
      return '📚';

    return '😊';
  };

  const textAlignStyle =
    isRTL ? 'right' : 'left';

  if (!gameStarted) {
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
          contentContainerStyle={
            styles.startContent
          }
        >
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.8}
            style={[
              styles.startBackButton,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              language === 'fa'
                ? 'بازگشت'
                : 'Back'
            }
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={23}
              color={colors.text}
            />
          </TouchableOpacity>

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
              duration: 500,
            }}
          >
            <View
              style={styles.header}
            >
              <Text
                style={[
                  styles.title,
                  {
                    color: colors.text,
                    textAlign: 'center',
                  },
                ]}
              >
                {t.memoryGame}
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color: colors.textSecondary,
                    textAlign: 'center',
                  },
                ]}
              >
                {t.cognitiveGames}
              </Text>
            </View>

            <View
              style={
                styles.levelsContainer
              }
            >
              {levels.map(level => {
                const active =
                  selectedLevel ===
                  level.id;

                return (
                  <TouchableOpacity
                    key={level.id}
                    onPress={() =>
                      setSelectedLevel(
                        level.id
                      )
                    }
                    activeOpacity={0.8}
                    style={[
                      styles.levelCard,
                      {
                        backgroundColor:
                          active
                            ? colors.primary +
                              '14'
                            : colors.surface,

                        borderColor:
                          active
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.levelContent,
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
                          styles.levelIconBox,
                          {
                            backgroundColor:
                              active
                                ? colors.primary +
                                  '18'
                                : colors.background,
                            borderColor:
                              active
                                ? colors.primary +
                                  '30'
                                : colors.border,
                          },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={
                            level.id ===
                            'easy'
                              ? 'leaf'
                              : level.id ===
                                'medium'
                              ? 'brain'
                              : level.id ===
                                'hard'
                              ? 'target'
                              : 'fire'
                          }
                          size={20}
                          color={
                            active
                              ? colors.primary
                              : colors.textSecondary
                          }
                        />
                      </View>

                      <View
                        style={
                          isRTL
                            ? styles.levelInfoRTL
                            : styles.levelInfo
                        }
                      >
                        <Text
                          style={[
                            styles.levelTitle,
                            {
                              color:
                                colors.text,
                              textAlign:
                                textAlignStyle,
                            },
                          ]}
                        >
                          {getLevelTitle(
                            level.id
                          )}
                        </Text>

                        <Text
                          style={[
                            styles.levelDescription,
                            {
                              color:
                                colors.textSecondary,
                              textAlign:
                                textAlignStyle,
                            },
                          ]}
                        >
                          {getLevelDescription(
                            level.id
                          )}
                        </Text>
                      </View>

                      {active && (
                        <View
                          style={[
                            styles.selectedDot,
                            {
                              backgroundColor:
                                colors.primary,
                            },
                          ]}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              onPress={startGame}
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
                style={styles.startText}
              >
                {t.startGame}
              </Text>
            </TouchableOpacity>
          </MotiView>
        </ScrollView>
      </View>
    );
  }

  if (gameFinished) {
    const maxScore =
      TOTAL_ROUNDS * 20;

    const percentage =
      Math.round(
        (score / maxScore) * 100
      );

    const feedback =
      getFeedback(percentage);

    const emoji =
      getEmoji(percentage);

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
        <MotiView
          from={{
            opacity: 0,
            scale: 0.9,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            type: 'spring',
            damping: 20,
          }}
          style={
            styles.resultContainer
          }
        >
          <View
            style={
              styles.resultHeader
            }
          >
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
                size={48}
                color={colors.primary}
              />
            </View>

            <Text
              style={[
                styles.resultEmoji,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {emoji}
            </Text>
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
            {t.gameCompleted}
          </Text>

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
            {language === 'fa'
              ? 'از'
              : 'of'}{' '}
            {TOTAL_ROUNDS}{' '}
            {language === 'fa'
              ? 'پاسخ صحیح'
              : 'answers were correct'}
          </Text>

          <Text
            style={[
              styles.feedbackText,
              {
                color:
                  colors.text,
              },
            ]}
          >
            {feedback}
          </Text>

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

          <TouchableOpacity
            onPress={resetGame}
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
              {t.tryAgain}
            </Text>
          </TouchableOpacity>
        </MotiView>
      </View>
    );
  }

  const targetShapeName =
    getShapeName(target.shape);

  const targetColorName =
    getColorName(target.color);

  const roundLabel =
    language === 'fa'
      ? 'مرحله'
      : 'Round';

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
        style={styles.gameHeader}
      >
        <View
          style={[
            styles.scoreContainer,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="trophy"
            size={20}
            color={colors.primary}
          />

          <Text
            style={[
              styles.score,
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
              styles.roundText,
              {
                color:
                  colors.text,
                textAlign:
                  textAlignStyle,
              },
            ]}
          >
            {roundLabel}{' '}
            {currentRound} /{' '}
            {TOTAL_ROUNDS}
          </Text>

          <Text
            style={[
              styles.correctText,
              {
                color:
                  colors.primary,
                textAlign:
                  textAlignStyle,
              },
            ]}
          >
            ✓ {correctAnswers}{' '}
            {language === 'fa'
              ? 'صحیح'
              : 'correct'}
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
              duration: 400,
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

      <View
        style={styles.gameContent}
      >
        <Text
          style={[
            styles.instruction,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          {language === 'fa'
            ? 'شکل صحیح را پیدا کنید'
            : 'Find the correct shape'}
        </Text>

        <Text
          style={[
            styles.targetText,
            {
              color:
                colors.text,
            },
          ]}
        >
          {targetColorName}{' '}
          {targetShapeName}
        </Text>

        <View
          style={styles.options}
        >
          {options.map(
            (shape, index) => (
              <TouchableOpacity
                key={`${shape.shape}-${shape.color}-${index}`}
                onPress={() =>
                  selectShape(
                    shape
                  )
                }
                activeOpacity={0.8}
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
            )
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  startContent: {
    paddingHorizontal:
      Spacing.lg,
    paddingTop: 20,
    paddingBottom: 100,
  },

  startBackButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
    alignSelf: 'flex-start',
    marginBottom: 28,
  },

  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: Spacing.xl,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
  },

  levelsContainer: {
    gap: 0,
  },

  levelCard: {
    minHeight: 82,
    borderWidth: 1.5,
    borderRadius:
      BorderRadius.lg,
    padding:
      Spacing.md,
    marginBottom:
      Spacing.md,
  },

  levelContent: {
    flex: 1,
    alignItems: 'center',
  },

  levelIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  levelInfo: {
    flex: 1,
    marginLeft:
      Spacing.md,
  },

  levelInfoRTL: {
    flex: 1,
    marginRight:
      Spacing.md,
  },

  levelTitle: {
    fontSize: 17,
    fontWeight: '700',
  },

  levelDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 18,
  },

  selectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
    marginRight: 8,
  },

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

  gameHeader: {
    paddingHorizontal:
      Spacing.lg,
    paddingTop: 50,
    paddingBottom:
      Spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },

  score: {
    fontSize: 20,
    fontWeight: '800',
  },

  progressContainer: {
    paddingHorizontal:
      Spacing.lg,
    paddingBottom:
      Spacing.sm,
  },

  progressHeader: {
    justifyContent:
      'space-between',
    marginBottom: 7,
  },

  roundText: {
    fontSize: 14,
    fontWeight: '600',
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

  gameContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding:
      Spacing.lg,
  },

  instruction: {
    fontSize: 15,
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
    justifyContent: 'center',
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
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 50,
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

  hexagonShape: {
    borderRadius: 2,
  },

  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding:
      Spacing.xl,
  },

  resultHeader: {
    alignItems: 'center',
    marginBottom:
      Spacing.md,
  },

  resultIconBox: {
    width: 82,
    height: 82,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultEmoji: {
    fontSize: 48,
    marginTop: 4,
  },

  resultTitle: {
    fontSize: 24,
    fontWeight: '700',
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
    marginBottom:
      Spacing.xs,
    borderWidth: 1,
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
  },

  percentageFill: {
    height: '100%',
    borderRadius:
      BorderRadius.full,
  },
});