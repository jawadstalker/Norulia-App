import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import {
  ArrowLeft,
  Brain,
  Check,
  Clock3,
  Languages,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  BorderRadius,
  Spacing,
} from '../../constants/theme';
import { saveGameResult } from './gameResults';

type GameLanguage = 'fa' | 'en';

type Phase =
  | 'language'
  | 'preview'
  | 'playing'
  | 'feedback'
  | 'completed';

interface WordItem {
  id: string;
  value: string;
}

const WORDS_FA = {
  easy: [
    'سیب',
    'سگ',
    'گل',
    'ماه',
    'کتاب',
    'گربه',
    'پرنده',
    'ماهی',
    'درخت',
    'ستاره',
    'خورشید',
    'ماشین',
    'توپ',
    'آتش',
    'آب',
    'خانه',
    'شادی',
    'لبخند',
    'بازی',
    'ابر',
    'قلب',
    'نور',
    'صلح',
    'رویا',
    'عشق',
  ],

  medium: [
    'رودخانه',
    'آسمان',
    'اقیانوس',
    'کوه',
    'جنگل',
    'پروانه',
    'رنگین‌کمان',
    'شمع',
    'پل',
    'قلعه',
    'الماس',
    'فیل',
    'زرافه',
    'دلفین',
    'کانگورو',
    'پاندا',
    'ببر',
    'کتابخانه',
    'بیمارستان',
    'رستوران',
    'تئاتر',
    'موزه',
    'تلسکوپ',
    'میکروسکوپ',
    'کامپیوتر',
    'تلفن',
    'شکلات',
    'توت‌فرنگی',
    'هندوانه',
    'آناناس',
    'آزادی',
    'شجاعت',
    'صبر',
    'مهربانی',
    'قدرت',
    'حافظه',
    'توجه',
    'تمرکز',
  ],

  hard: [
    'کهکشان',
    'زیست‌شناسی',
    'معماری',
    'ستاره‌شناسی',
    'روانشناسی',
    'فلسفه',
    'جهان',
    'جو',
    'تنوع زیستی',
    'حفاظت',
    'اکتشاف',
    'نوآوری',
    'فناوری',
    'تمدن',
    'انقلاب',
    'تخیل',
    'خلاقیت',
    'الهام',
    'انگیزه',
    'پشتکار',
    'هوش',
    'هشیاری',
    'علوم اعصاب',
    'شناخت',
    'ادراک',
    'آزمایش',
    'فرضیه',
    'تحلیل',
    'ارزیابی',
    'ترکیب',
    'تحول',
    'تکامل',
    'سازگاری',
    'درک',
    'انعطاف‌پذیری',
  ],
};

const WORDS_EN = {
  easy: [
    'APPLE',
    'DOG',
    'FLOWER',
    'MOON',
    'BOOK',
    'CAT',
    'BIRD',
    'FISH',
    'TREE',
    'STAR',
    'SUN',
    'CAR',
    'BALL',
    'FIRE',
    'WATER',
    'HOME',
    'JOY',
    'SMILE',
    'GAME',
    'CLOUD',
    'HEART',
    'LIGHT',
    'PEACE',
    'DREAM',
    'LOVE',
  ],

  medium: [
    'RIVER',
    'SKY',
    'OCEAN',
    'MOUNTAIN',
    'FOREST',
    'BUTTERFLY',
    'RAINBOW',
    'CANDLE',
    'BRIDGE',
    'CASTLE',
    'DIAMOND',
    'ELEPHANT',
    'GIRAFFE',
    'DOLPHIN',
    'KANGAROO',
    'PANDA',
    'TIGER',
    'LIBRARY',
    'HOSPITAL',
    'RESTAURANT',
    'THEATER',
    'MUSEUM',
    'TELESCOPE',
    'MICROSCOPE',
    'COMPUTER',
    'TELEPHONE',
    'CHOCOLATE',
    'STRAWBERRY',
    'WATERMELON',
    'PINEAPPLE',
    'FREEDOM',
    'COURAGE',
    'PATIENCE',
    'KINDNESS',
    'STRENGTH',
    'MEMORY',
    'ATTENTION',
    'FOCUS',
  ],

  hard: [
    'GALAXY',
    'BIOLOGY',
    'ARCHITECTURE',
    'ASTRONOMY',
    'PSYCHOLOGY',
    'PHILOSOPHY',
    'UNIVERSE',
    'ATMOSPHERE',
    'BIODIVERSITY',
    'CONSERVATION',
    'EXPLORATION',
    'INNOVATION',
    'TECHNOLOGY',
    'CIVILIZATION',
    'REVOLUTION',
    'IMAGINATION',
    'CREATIVITY',
    'INSPIRATION',
    'MOTIVATION',
    'PERSEVERANCE',
    'INTELLIGENCE',
    'CONSCIOUSNESS',
    'NEUROSCIENCE',
    'COGNITIVE',
    'PERCEPTION',
    'EXPERIMENT',
    'HYPOTHESIS',
    'ANALYSIS',
    'EVALUATION',
    'SYNTHESIS',
    'TRANSFORMATION',
    'EVOLUTION',
    'ADAPTATION',
    'COMPREHENSION',
    'COGNITION',
  ],
};

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function getWordPool(
  language: GameLanguage,
  length: number,
) {
  const words =
    language === 'fa'
      ? WORDS_FA
      : WORDS_EN;

  if (length <= 4) {
    return words.easy;
  }

  if (length <= 7) {
    return [
      ...words.easy,
      ...words.medium,
    ];
  }

  return [
    ...words.medium,
    ...words.hard,
  ];
}

function getLevelTitle(
  level: number,
  language: GameLanguage,
) {
  if (language === 'fa') {
    if (level <= 3) return 'شروع خوب';
    if (level <= 6) return 'تمرکز بالا';
    if (level <= 9) return 'ذهن قدرتمند';
    return 'سطح نخبگان';
  }

  if (level <= 3) return 'Good Start';
  if (level <= 6) return 'High Focus';
  if (level <= 9) return 'Sharp Mind';
  return 'Elite Level';
}

export default function BilingualSequenceScreen() {
  const router = useRouter();

  const { colors } = useTheme();

  const {
    language: appLanguage,
    isRTL,
  } = useLanguage();

  const [gameLanguage, setGameLanguage] =
    useState<GameLanguage | null>(null);

  const [phase, setPhase] =
    useState<Phase>('language');

  const [level, setLevel] =
    useState(1);

  const [sequenceLength, setSequenceLength] =
    useState(3);

  const [sequence, setSequence] =
    useState<WordItem[]>([]);

  const [options, setOptions] =
    useState<WordItem[]>([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [score, setScore] =
    useState(0);

  const [correctCount, setCorrectCount] =
    useState(0);

  const [attempts, setAttempts] =
    useState(0);

  const [lastCorrect, setLastCorrect] =
    useState<boolean | null>(null);

  const [lastReactionTime, setLastReactionTime] =
    useState(0);

  const [totalReactionTime, setTotalReactionTime] =
    useState(0);

  const [bestStreak, setBestStreak] =
    useState(0);

  const [streak, setStreak] =
    useState(0);

  const [roundStartedAt, setRoundStartedAt] =
    useState(0);

  const [previewIndex, setPreviewIndex] =
    useState(0);

  const [showingWord, setShowingWord] =
    useState('');

  const scale = useRef(
    new Animated.Value(0.86),
  ).current;

  const opacity = useRef(
    new Animated.Value(0),
  ).current;

  const progress = useRef(
    new Animated.Value(0),
  ).current;

  const text = useMemo(() => {
    if (appLanguage === 'fa') {
      return {
        title: 'حافظه دوزبانه',
        subtitle:
          'توالی کلمات را به خاطر بسپار',

        chooseLanguage:
          'زبان بازی را انتخاب کن',

        chooseDescription:
          'کلمات را در زبان موردنظر ببین و ترتیب آن‌ها را به خاطر بسپار.',

        persian:
          'فارسی',

        english:
          'English',

        persianDescription:
          'توالی واژه‌های فارسی',

        englishDescription:
          'English word sequence',

        watch:
          'با دقت نگاه کن...',

        repeat:
          'حالا همان ترتیب را تکرار کن',

        select:
          'کلمه بعدی را انتخاب کن',

        level:
          'مرحله',

        score:
          'امتیاز',

        accuracy:
          'دقت',

        reaction:
          'زمان واکنش',

        correct:
          'عالی! درست بود',

        wrong:
          'اشتباه شد',

        correctAnswer:
          'توالی درست',

        completed:
          'بازی تمام شد',

        finalScore:
          'امتیاز نهایی',

        finalLevel:
          'مرحله نهایی',

        finalAccuracy:
          'دقت نهایی',

        avgReaction:
          'میانگین واکنش',

        playAgain:
          'شروع دوباره',

        changeLanguage:
          'تغییر زبان',

        back:
          'بازگشت',

        next:
          'ادامه',

        focus:
          'تمرکز',

        words:
          'کلمه',

        newRecord:
          'عملکرد جدید',

        excellent:
          'عملکرد فوق‌العاده',

        good:
          'عملکرد خوب',

        keepTraining:
          'ادامه بده؛ ذهنت در حال قوی‌تر شدن است.',
      };
    }

    return {
      title: 'Bilingual Memory',
      subtitle:
        'Remember the sequence of words',

      chooseLanguage:
        'Choose your game language',

      chooseDescription:
        'Watch the words carefully and remember their exact order.',

      persian:
        'فارسی',

      english:
        'English',

      persianDescription:
        'Persian word sequence',

      englishDescription:
        'English word sequence',

      watch:
        'Watch carefully...',

      repeat:
        'Now repeat the same order',

      select:
        'Select the next word',

      level:
        'Level',

      score:
        'Score',

      accuracy:
        'Accuracy',

      reaction:
        'Reaction',

      correct:
        'Great! Correct',

      wrong:
        'Not quite',

      correctAnswer:
        'Correct sequence',

      completed:
        'Game Completed',

      finalScore:
        'Final Score',

      finalLevel:
        'Final Level',

      finalAccuracy:
        'Final Accuracy',

      avgReaction:
        'Average Reaction',

      playAgain:
        'Play Again',

      changeLanguage:
        'Change Language',

      back:
        'Back',

      next:
        'Continue',

      focus:
        'Focus',

      words:
        'Words',

      newRecord:
        'New Performance',

      excellent:
        'Excellent Performance',

      good:
        'Good Performance',

      keepTraining:
        'Keep going; your mind is getting stronger.',
    };
  }, [appLanguage]);

  const animateCard = useCallback(() => {
    scale.setValue(0.86);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 70,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  const animateProgress = useCallback(
    (value: number) => {
      Animated.timing(progress, {
        toValue: value,
        duration: 280,
        useNativeDriver: false,
      }).start();
    },
    [progress],
  );

  const startRound = useCallback(
    (
      selectedLanguage: GameLanguage,
      nextLength: number,
      nextLevel: number,
    ) => {
      const pool = getWordPool(
        selectedLanguage,
        nextLength,
      );

      const selected: WordItem[] = shuffle(pool)
        .slice(0, nextLength)
        .map((value, index) => ({
          id: `${nextLevel}-${index}-${Math.random()}`,
          value,
        }));

      const extraWords: WordItem[] = shuffle(
        pool.filter(
          (word) =>
            !selected.some(
              (item) => item.value === word,
            ),
        ),
      )
        .slice(0, 4)
        .map((value, index) => ({
          id: `${nextLevel}-extra-${index}-${Math.random()}`,
          value,
        }));

      setSequence(selected);

      setOptions(
        shuffle<WordItem>([
          ...selected,
          ...extraWords,
        ]),
      );

      setCurrentIndex(0);
      setLastCorrect(null);
      setPreviewIndex(0);
      setShowingWord(
        selected[0]?.value ?? '',
      );

      setPhase('preview');

      animateCard();
      animateProgress(0);
    },
    [animateCard, animateProgress],
  );

  const selectLanguage = useCallback(
    (selectedLanguage: GameLanguage) => {
      setGameLanguage(selectedLanguage);

      setLevel(1);
      setSequenceLength(3);
      setScore(0);
      setCorrectCount(0);
      setAttempts(0);
      setTotalReactionTime(0);
      setBestStreak(0);
      setStreak(0);

      startRound(
        selectedLanguage,
        3,
        1,
      );
    },
    [startRound],
  );

  useEffect(() => {
    if (
      phase !== 'preview' ||
      sequence.length === 0
    ) {
      return;
    }

    setShowingWord(
      sequence[previewIndex]?.value ?? '',
    );

    const timer = setTimeout(() => {
      if (
        previewIndex <
        sequence.length - 1
      ) {
        setPreviewIndex(
          (value) => value + 1,
        );

        return;
      }

      setPhase('playing');
      setRoundStartedAt(
        Date.now(),
      );

      animateCard();
    }, 850);

    return () => {
      clearTimeout(timer);
    };
  }, [
    phase,
    previewIndex,
    sequence,
    animateCard,
  ]);

  const handleAnswer = useCallback(
    (word: WordItem) => {
      if (
        phase !== 'playing' ||
        sequence.length === 0
      ) {
        return;
      }

      const reaction =
        Date.now() - roundStartedAt;

      const expected =
        sequence[currentIndex];

      const correct =
        word.id === expected.id;

      setAttempts(
        (value) => value + 1,
      );

      setLastReactionTime(reaction);

      setTotalReactionTime(
        (value) => value + reaction,
      );

      setLastCorrect(correct);

      if (correct) {
        const nextStreak =
          streak + 1;

        setStreak(nextStreak);

        setBestStreak(
          (value) =>
            Math.max(
              value,
              nextStreak,
            ),
        );

        const reactionBonus =
          reaction < 900
            ? 20
            : reaction < 1500
              ? 10
              : 5;

        const points =
          50 +
          level * 10 +
          reactionBonus +
          nextStreak * 5;

        setScore(
          (value) => value + points,
        );

        setCorrectCount(
          (value) => value + 1,
        );

        animateProgress(
          (currentIndex + 1) /
            sequence.length,
        );

        if (
          currentIndex ===
          sequence.length - 1
        ) {
          setPhase('feedback');

          return;
        }

        setCurrentIndex(
          (value) => value + 1,
        );

        setRoundStartedAt(
          Date.now(),
        );

        animateCard();

        return;
      }

      setStreak(0);
      setPhase('feedback');
    },
    [
      phase,
      sequence,
      currentIndex,
      roundStartedAt,
      streak,
      level,
      animateCard,
      animateProgress,
    ],
  );

  const continueAfterFeedback =
    useCallback(() => {
      if (!gameLanguage) {
        return;
      }

      if (!lastCorrect) {
        setPhase('completed');

        const finalAccuracy =
          attempts > 0
            ? Math.round(
                (correctCount /
                  attempts) *
                  100,
              )
            : 0;

        const avgReaction =
          correctCount > 0
            ? Math.round(
                totalReactionTime /
                  correctCount,
              )
            : 0;

        saveGameResult({
          gameId: 'bilingual-sequence',
          gameName:
            appLanguage === 'fa'
              ? 'توالی دوزبانه'
              : 'Bilingual Sequence',
          timestamp: Date.now(),
          score,

          metrics: [
            {
              id: 'bilingual_sequence_accuracy',
              label:
                appLanguage === 'fa'
                  ? 'دقت'
                  : 'Accuracy',
              value: finalAccuracy,
              unit: '%',
            },
            {
              id: 'bilingual_sequence_reaction_time',
              label:
                appLanguage === 'fa'
                  ? 'زمان پاسخ'
                  : 'Reaction Time',
              value: avgReaction,
              unit: 'ms',
            },
          ],
        });

        return;
      }

      const nextLevel =
        level + 1;

      const nextLength =
        Math.min(
          3 +
            Math.floor(
              nextLevel / 2,
            ),
          12,
        );

      setLevel(nextLevel);
      setSequenceLength(
        nextLength,
      );

      startRound(
        gameLanguage,
        nextLength,
        nextLevel,
      );
    }, [
      gameLanguage,
      lastCorrect,
      level,
      startRound,
      attempts,
      correctCount,
      totalReactionTime,
      score,
      appLanguage,
    ]);

  const restartGame = useCallback(() => {
    setGameLanguage(null);
    setPhase('language');

    setLevel(1);
    setSequenceLength(3);
    setScore(0);
    setCorrectCount(0);
    setAttempts(0);
    setTotalReactionTime(0);
    setBestStreak(0);
    setStreak(0);
    setSequence([]);
    setOptions([]);
  }, []);

  const handleBack = useCallback(() => {
    if (phase !== 'language') {
      restartGame();
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/bilingual-games');
    }
  }, [
    phase,
    restartGame,
    router,
  ]);

  const accuracy =
    attempts > 0
      ? Math.round(
          (correctCount /
            attempts) *
            100,
        )
      : 0;

  const averageReaction =
    attempts > 0
      ? Math.round(
          totalReactionTime /
            attempts,
        )
      : 0;

  const performanceTitle =
    accuracy >= 90
      ? text.excellent
      : text.good;

  if (phase === 'language') {
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
              flexDirection: 'row',
            },
          ]}
        >
          <Pressable
            onPress={handleBack}
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
              strokeWidth={2.4}
            />
          </Pressable>

          <View
            style={[
              styles.headerText,
              {
                alignItems: 'flex-end',
              },
            ]}
          >
            <View
              style={[
                styles.headerTitleRow,
                {
                  flexDirection:
                    'row-reverse',
                },
              ]}
            >
              <View
                style={[
                  styles.headerIcon,
                  {
                    backgroundColor:
                      colors.primary +
                      '18',
                  },
                ]}
              >
                <Languages
                  size={21}
                  color={colors.primary}
                />
              </View>

              <View>
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
                    },
                  ]}
                >
                  {text.subtitle}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.languageContent
          }
        >
          <Animated.View
            style={[
              styles.hero,
              {
                opacity,
                transform: [
                  {
                    scale,
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.heroIcon,
                {
                  backgroundColor:
                    colors.primary +
                    '16',
                },
              ]}
            >
              <Brain
                size={34}
                color={colors.primary}
              />
            </View>

            <Text
              style={[
                styles.heroTitle,
                {
                  color:
                    colors.text,
                  textAlign: 'center',
                },
              ]}
            >
              {text.chooseLanguage}
            </Text>

            <Text
              style={[
                styles.heroDescription,
                {
                  color:
                    colors.textSecondary,
                  textAlign:
                    'center',
                },
              ]}
            >
              {text.chooseDescription}
            </Text>
          </Animated.View>

          <LanguageCard
            title={text.persian}
            description={
              text.persianDescription
            }
            icon="fa"
            colors={colors}
            onPress={() =>
              selectLanguage('fa')
            }
          />

          <LanguageCard
            title={text.english}
            description={
              text.englishDescription
            }
            icon="en"
            colors={colors}
            onPress={() =>
              selectLanguage('en')
            }
          />

          <View
            style={[
              styles.infoCard,
              {
                backgroundColor:
                  colors.primary +
                  '0A',
                borderColor:
                  colors.primary +
                  '20',
              },
            ]}
          >
            <Sparkles
              size={18}
              color={colors.primary}
            />

            <Text
              style={[
                styles.infoText,
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
              {text.keepTraining}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (phase === 'completed') {
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
          contentContainerStyle={
            styles.completedContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={[
              styles.completedIcon,
              {
                backgroundColor:
                  colors.primary +
                  '18',
              },
            ]}
          >
            <Trophy
              size={42}
              color={colors.primary}
            />
          </View>

          <Text
            style={[
              styles.completedTitle,
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
              styles.performanceTitle,
              {
                color:
                  colors.primary,
              },
            ]}
          >
            {performanceTitle}
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
                styles.scoreLabel,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {text.finalScore}
            </Text>

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
          </View>

          <View
            style={styles.summaryGrid}
          >
            <SummaryStat
              icon={
                <Target
                  size={18}
                  color={
                    colors.primary
                  }
                />
              }
              label={
                text.finalAccuracy
              }
              value={`${accuracy}%`}
              colors={colors}
            />

            <SummaryStat
              icon={
                <Brain
                  size={18}
                  color={
                    colors.primary
                  }
                />
              }
              label={text.finalLevel}
              value={`${level}`}
              colors={colors}
            />

            <SummaryStat
              icon={
                <Clock3
                  size={18}
                  color={
                    colors.primary
                  }
                />
              }
              label={
                text.avgReaction
              }
              value={
                averageReaction
                  ? `${averageReaction} ms`
                  : '--'
              }
              colors={colors}
            />

            <SummaryStat
              icon={
                <Zap
                  size={18}
                  color={
                    colors.primary
                  }
                />
              }
              label={text.focus}
              value={`${bestStreak}`}
              colors={colors}
            />
          </View>

          <Pressable
            onPress={restartGame}
            style={[
              styles.primaryButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            <RotateCcw
              size={19}
              color="#FFFFFF"
            />

            <Text
              style={styles.primaryButtonText}
            >
              {text.playAgain}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleBack}
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
            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color:
                    colors.text,
                },
              ]}
            >
              {text.back}
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  const isPreview =
    phase === 'preview';

  const currentExpected =
    sequence[currentIndex];

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
          styles.gameHeader,
          {
            flexDirection: 'row',
          },
        ]}
      >
        <Pressable
          onPress={handleBack}
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
            strokeWidth={2.4}
          />
        </Pressable>

        <View
          style={
            styles.gameHeaderStats
          }
        >
          <MiniStat
            icon={
              <Trophy
                size={14}
                color={
                  colors.primary
                }
              />
            }
            value={`${score}`}
            colors={colors}
          />

          <MiniStat
            icon={
              <Brain
                size={14}
                color={
                  colors.primary
                }
              />
            }
            value={`${level}`}
            colors={colors}
          />
        </View>

        <View
          style={[
            styles.languagePill,
            {
              backgroundColor:
                colors.primary +
                '12',
            },
          ]}
        >
          <Languages
            size={14}
            color={colors.primary}
          />

          <Text
            style={[
              styles.languagePillText,
              {
                color:
                  colors.primary,
              },
            ]}
          >
            {gameLanguage ===
            'fa'
              ? 'FA'
              : 'EN'}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.progressTrack,
          {
            backgroundColor:
              colors.border,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor:
                colors.primary,
              width:
                progress.interpolate({
                  inputRange: [
                    0,
                    1,
                  ],
                  outputRange: [
                    '0%',
                    '100%',
                  ],
                }),
            },
          ]}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.gameContent
        }
      >
        <Animated.View
          style={[
            styles.statusBlock,
            {
              opacity,
              transform: [
                {
                  scale,
                },
              ],
            },
          ]}
        >
          <View
            style={[
              styles.statusIcon,
              {
                backgroundColor:
                  colors.primary +
                  '16',
              },
            ]}
          >
            {isPreview ? (
              <Brain
                size={21}
                color={
                  colors.primary
                }
              />
            ) : (
              <Target
                size={21}
                color={
                  colors.primary
                }
              />
            )}
          </View>

          <Text
            style={[
              styles.statusTitle,
              {
                color:
                  colors.text,
                textAlign:
                  'center',
              },
            ]}
          >
            {isPreview
              ? text.watch
              : text.repeat}
          </Text>

          <Text
            style={[
              styles.statusSubtitle,
              {
                color:
                  colors.textSecondary,
                textAlign:
                  'center',
              },
            ]}
          >
            {isPreview
              ? `${previewIndex + 1} / ${sequence.length}`
              : `${currentIndex + 1} / ${sequence.length}`}
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.wordCard,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
              opacity,
              transform: [
                {
                  scale,
                },
              ],
            },
          ]}
        >
          {isPreview ? (
            <>
              <Text
                style={[
                  styles.wordLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {text.words}
              </Text>

              <Text
                style={[
                  styles.wordValue,
                  {
                    color:
                      colors.text,
                    textAlign:
                      'center',
                  },
                ]}
              >
                {showingWord}
              </Text>
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.wordLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {text.select}
              </Text>

              <View
                style={
                  styles.emptyWord
                }
              >
                <Text
                  style={[
                    styles.emptyWordText,
                    {
                      color:
                        colors.textSecondary,
                    },
                  ]}
                >
                  ?
                </Text>
              </View>
            </>
          )}
        </Animated.View>

        {!isPreview && (
          <View
            style={styles.optionsGrid}
          >
            {options.map((word) => (
              <WordButton
                key={word.id}
                word={word.value}
                colors={colors}
                isRTL={isRTL}
                onPress={() =>
                  handleAnswer(word)
                }
              />
            ))}
          </View>
        )}

        {phase ===
          'feedback' && (
          <View
            style={[
              styles.feedbackCard,
              {
                backgroundColor:
                  lastCorrect
                    ? '#22C55E' +
                      '12'
                    : '#EF4444' +
                      '12',
                borderColor:
                  lastCorrect
                    ? '#22C55E' +
                      '30'
                    : '#EF4444' +
                      '30',
              },
            ]}
          >
            <View
              style={[
                styles.feedbackIcon,
                {
                  backgroundColor:
                    lastCorrect
                      ? '#22C55E' +
                        '18'
                      : '#EF4444' +
                        '18',
                },
              ]}
            >
              {lastCorrect ? (
                <Check
                  size={22}
                  color="#22C55E"
                />
              ) : (
                <X
                  size={22}
                  color="#EF4444"
                />
              )}
            </View>

            <View
              style={
                styles.feedbackText
              }
            >
              <Text
                style={[
                  styles.feedbackTitle,
                  {
                    color:
                      lastCorrect
                        ? '#22C55E'
                        : '#EF4444',
                    textAlign:
                      isRTL
                        ? 'right'
                        : 'left',
                  },
                ]}
              >
                {lastCorrect
                  ? text.correct
                  : text.wrong}
              </Text>

              <Text
                style={[
                  styles.feedbackSubtitle,
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
                {lastCorrect
                  ? `${lastReactionTime} ms`
                  : `${text.correctAnswer}: ${sequence.map((item) => item.value).join(' • ')}`}
              </Text>
            </View>

            <Pressable
              onPress={
                continueAfterFeedback
              }
              style={[
                styles.feedbackButton,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >
              <Text
                style={
                  styles.feedbackButtonText
                }
              >
                {text.next}
              </Text>
            </Pressable>
          </View>
        )}

        <View
          style={[
            styles.levelHint,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <Sparkles
            size={16}
            color={
              colors.primary
            }
          />

          <Text
            style={[
              styles.levelHintText,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {getLevelTitle(
              level,
              gameLanguage ??
                'en',
            )}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function LanguageCard({
  title,
  description,
  icon,
  colors,
  onPress,
}: {
  title: string;
  description: string;
  icon: 'fa' | 'en';
  colors: any;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.languageCard,
        {
          backgroundColor:
            colors.surface,
          borderColor:
            colors.border,
          transform: [
            {
              scale: pressed
                ? 0.985
                : 1,
            },
          ],
        },
      ]}
    >
      <View
        style={[
          styles.languageIcon,
          {
            backgroundColor:
              colors.primary +
              '14',
          },
        ]}
      >
        <Text
          style={[
            styles.languageIconText,
            {
              color:
                colors.primary,
            },
          ]}
        >
          {icon === 'fa'
            ? 'فا'
            : 'EN'}
        </Text>
      </View>

      <View
        style={
          styles.languageCardText
        }
      >
        <Text
          style={[
            styles.languageCardTitle,
            {
              color:
                colors.text,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.languageCardDescription,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          {description}
        </Text>
      </View>

      <View
        style={[
          styles.languageArrow,
          {
            backgroundColor:
              colors.primary +
              '12',
          },
        ]}
      >
        <ArrowLeft
          size={18}
          color={
            colors.primary
          }
        />
      </View>
    </Pressable>
  );
}

function WordButton({
  word,
  colors,
  isRTL,
  onPress,
}: {
  word: string;
  colors: any;
  isRTL: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wordButton,
        {
          backgroundColor:
            colors.surface,
          borderColor:
            pressed
              ? colors.primary
              : colors.border,
          transform: [
            {
              scale: pressed
                ? 0.96
                : 1,
            },
          ],
        },
      ]}
    >
      <Text
        style={[
          styles.wordButtonText,
          {
            color:
              colors.text,
            textAlign:
              isRTL
                ? 'right'
                : 'left',
          },
        ]}
        numberOfLines={2}
      >
        {word}
      </Text>
    </Pressable>
  );
}

function MiniStat({
  icon,
  value,
  colors,
}: {
  icon: React.ReactNode;
  value: string;
  colors: any;
}) {
  return (
    <View
      style={[
        styles.miniStat,
        {
          backgroundColor:
            colors.surface,
          borderColor:
            colors.border,
        },
      ]}
    >
      {icon}

      <Text
        style={[
          styles.miniStatText,
          {
            color:
              colors.text,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function SummaryStat({
  icon,
  label,
  value,
  colors,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View
      style={[
        styles.summaryStat,
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
          styles.summaryStatIcon,
          {
            backgroundColor:
              colors.primary +
              '12',
          },
        ]}
      >
        {icon}
      </View>

      <Text
        style={[
          styles.summaryStatLabel,
          {
            color:
              colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.summaryStatValue,
          {
            color:
              colors.text,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal:
      Spacing.lg,
    paddingTop:
      Spacing.lg + 28,
    paddingBottom:
      Spacing.md,
    alignItems: 'center',
    gap: 12,
  },

  headerText: {
    flex: 1,
  },

  headerTitleRow: {
    alignItems: 'center',
    gap: 10,
  },

  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 3,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius:
      BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  languageContent: {
    paddingHorizontal:
      Spacing.lg,
    paddingTop: 18,
    paddingBottom: 40,
    gap: 12,
  },

  hero: {
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 6,
  },

  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
  },

  heroDescription: {
    fontSize: 13,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 330,
  },

  languageCard: {
    minHeight: 88,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  languageIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  languageIconText: {
    fontSize: 17,
    fontWeight: '900',
  },

  languageCardText: {
    flex: 1,
  },

  languageCardTitle: {
    fontSize: 17,
    fontWeight: '800',
  },

  languageCardDescription: {
    fontSize: 12,
    marginTop: 4,
  },

  languageArrow: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [
      {
        rotate: '180deg',
      },
    ],
  },

  infoCard: {
    marginTop: 8,
    borderRadius: 18,
    borderWidth: 1,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  infoText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 18,
  },

  gameHeader: {
    paddingHorizontal:
      Spacing.lg,
    paddingTop:
      Spacing.lg + 24,
    paddingBottom: 8,
    alignItems: 'center',
    gap: 10,
  },

  gameHeaderStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
  },

  miniStat: {
    minWidth: 58,
    height: 34,
    paddingHorizontal: 9,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  miniStatText: {
    fontSize: 12,
    fontWeight: '800',
  },

  languagePill: {
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  languagePillText: {
    fontSize: 11,
    fontWeight: '900',
  },

  progressTrack: {
    height: 5,
    marginHorizontal:
      Spacing.lg,
    borderRadius: 5,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 5,
  },

  gameContent: {
    paddingHorizontal:
      Spacing.lg,
    paddingTop: 22,
    paddingBottom: 36,
  },

  statusBlock: {
    alignItems: 'center',
    marginBottom: 17,
  },

  statusIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  statusTitle: {
    fontSize: 17,
    fontWeight: '800',
  },

  statusSubtitle: {
    fontSize: 12,
    marginTop: 5,
  },

  wordCard: {
    minHeight: 185,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginBottom: 18,
  },

  wordLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 12,
  },

  wordValue: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  emptyWord: {
    width: 76,
    height: 76,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyWordText: {
    fontSize: 30,
    fontWeight: '800',
  },

  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  wordButton: {
    width: '47.8%',
    minHeight: 58,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  wordButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },

  feedbackCard: {
    borderRadius: 21,
    borderWidth: 1,
    padding: 13,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  feedbackIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  feedbackText: {
    flex: 1,
  },

  feedbackTitle: {
    fontSize: 14,
    fontWeight: '800',
  },

  feedbackSubtitle: {
    fontSize: 10,
    lineHeight: 16,
    marginTop: 3,
  },

  feedbackButton: {
    minWidth: 72,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },

  feedbackButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  levelHint: {
    marginTop: 14,
    borderRadius: 15,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  levelHintText: {
    fontSize: 11,
    fontWeight: '700',
  },

  completedContent: {
    flexGrow: 1,
    paddingHorizontal:
      Spacing.lg,
    paddingTop:
      Spacing.lg + 45,
    paddingBottom: 40,
    alignItems: 'center',
  },

  completedIcon: {
    width: 88,
    height: 88,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  completedTitle: {
    fontSize: 27,
    fontWeight: '900',
  },

  performanceTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
    marginBottom: 24,
  },

  scoreCard: {
    width: '100%',
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 12,
  },

  scoreLabel: {
    fontSize: 11,
    fontWeight: '600',
  },

  scoreValue: {
    fontSize: 43,
    fontWeight: '900',
    marginTop: 2,
  },

  summaryGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },

  summaryStat: {
    width: '48.3%',
    minHeight: 112,
    borderRadius: 19,
    borderWidth: 1,
    padding: 12,
  },

  summaryStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  summaryStatLabel: {
    fontSize: 10,
    marginTop: 9,
  },

  summaryStatValue: {
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2,
  },

  primaryButton: {
    width: '100%',
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  secondaryButton: {
    width: '100%',
    height: 50,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});