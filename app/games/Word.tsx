import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  Languages,
  ArrowRight,
  Trash2,
  Trophy,
  ChevronLeft,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useGameExitGuard } from '../../context/GameExitGuard';
import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';
import { saveGameResult } from './gameResults';

/* ================================================================
   TYPES
================================================================ */

type GameLanguage = 'fa' | 'en';

interface Question {
  id: number;
  words: string[];
  answer: string;
}

/* ================================================================
   PERSIAN QUESTIONS
================================================================ */

const questionsFa: Question[] = [
  {
    id: 1,
    words: ['من', 'کتاب', 'می‌خوانم'],
    answer: 'من کتاب می‌خوانم',
  },
  {
    id: 2,
    words: ['امروز', 'هوا', 'خوب', 'است'],
    answer: 'امروز هوا خوب است',
  },
  {
    id: 3,
    words: ['به', 'مدرسه', 'من', 'می‌روم'],
    answer: 'من به مدرسه می‌روم',
  },
  {
    id: 4,
    words: ['دوست', 'من', 'خوب', 'است'],
    answer: 'دوست من خوب است',
  },
  {
    id: 5,
    words: ['آب', 'من', 'می‌نوشم'],
    answer: 'من آب می‌نوشم',
  },
  {
    id: 6,
    words: ['هر', 'روز', 'ورزش', 'می‌کنم'],
    answer: 'من هر روز ورزش می‌کنم',
  },
  {
    id: 7,
    words: ['صبح', 'من', 'زود', 'بیدار', 'می‌شوم'],
    answer: 'من صبح زود بیدار می‌شوم',
  },
  {
    id: 8,
    words: ['موسیقی', 'گوش', 'دادن', 'را', 'دوست', 'دارم'],
    answer: 'من گوش دادن موسیقی را دوست دارم',
  },
  {
    id: 9,
    words: ['امروز', 'یک', 'کتاب', 'جدید', 'خریدم'],
    answer: 'امروز یک کتاب جدید خریدم',
  },
  {
    id: 10,
    words: ['ذهن', 'خود', 'را', 'تمرین', 'می‌دهم'],
    answer: 'من ذهن خود را تمرین می‌دهم',
  },
];

/* ================================================================
   ENGLISH QUESTIONS
================================================================ */

const questionsEn: Question[] = [
  {
    id: 1,
    words: ['read', 'I', 'a', 'book'],
    answer: 'I read a book',
  },
  {
    id: 2,
    words: ['today', 'is', 'the', 'weather', 'good'],
    answer: 'the weather is good today',
  },
  {
    id: 3,
    words: ['school', 'I', 'go', 'to'],
    answer: 'I go to school',
  },
  {
    id: 4,
    words: ['friend', 'my', 'is', 'good'],
    answer: 'my friend is good',
  },
  {
    id: 5,
    words: ['drink', 'I', 'water'],
    answer: 'I drink water',
  },
  {
    id: 6,
    words: ['every', 'day', 'I', 'exercise'],
    answer: 'I exercise every day',
  },
  {
    id: 7,
    words: [
      'early',
      'I',
      'wake',
      'the',
      'up',
      'in',
      'morning',
    ],
    answer: 'I wake up early in the morning',
  },
  {
    id: 8,
    words: [
      'I',
      'music',
      'like',
      'listening',
      'to',
      
    ],
    answer: 'I like listening to music',
  },
  {
    id: 9,
    words: [
      'I',
      'bought',
      'a',
      'today',
      'new',
      'book',
    ],
    answer: 'I bought a new book today',
  },
  {
    id: 10,
    words: [
      'mind',
      'I',
      'train',
      'my',
      'every',
      'day',
    ],
    answer: 'I train my mind every day',
  },
];

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
        onPress={onBack}
        activeOpacity={0.75}
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

      <View
        style={[
          styles.pageHeaderText,
          {
            alignItems: isRTL
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
              textAlign: isRTL
                ? 'right'
                : 'left',
            },
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={[
              styles.pageHeaderSubtitle,
              {
                color: colors.textSecondary,
                textAlign: isRTL
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

/* ================================================================
   MAIN SCREEN
================================================================ */

export default function WordGameScreen() {
  const router = useRouter();

  const { colors } = useTheme();

  const {
    language: appLanguage,
    isRTL,
  } = useLanguage();

  const { setGuard, confirmExit } = useGameExitGuard();

  /* ================================================================
     GAME LANGUAGE
  ================================================================= */

  const [gameLanguage, setGameLanguage] =
    useState<GameLanguage | null>(null);

  /* ================================================================
     GAME STATE
  ================================================================= */

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedWords, setSelectedWords] =
    useState<string[]>([]);

  const [usedIndexes, setUsedIndexes] =
    useState<number[]>([]);

  const [score, setScore] = useState(0);

  const [answered, setAnswered] =
    useState(false);

  const [isCorrect, setIsCorrect] =
    useState<boolean | null>(null);

  /* ================================================================
     COMPLETED STATE
     
     وقتی بازی تمام می‌شود، این state فعال می‌شود.
     در این حالت دیگر Alert نداریم و دکمه اصلی
     تبدیل به «شروع مجدد» می‌شود.
  ================================================================= */

  const [gameCompleted, setGameCompleted] =
    useState(false);

  /*
   * Register mid-session state with the global exit guard.
   */
  useEffect(() => {
    setGuard(
      gameLanguage !== null && !gameCompleted,
      score
    );

    return () => setGuard(false, 0);
  }, [gameLanguage, gameCompleted, score, setGuard]);

  /* ================================================================
     UI TEXT
  ================================================================= */

  const text = useMemo(() => {
    if (appLanguage === 'fa') {
      return {
        title: 'جمله‌سازی',
        subtitle: 'کلمات را مرتب کن و جمله بساز',

        chooseLanguage:
          'زبان بازی را انتخاب کنید',

        chooseLanguageDescription:
          'می‌توانید بازی را به فارسی یا انگلیسی انجام دهید.',

        persian: 'فارسی',
        english: 'English',

        persianDescription:
          'جمله‌های فارسی',

        englishDescription:
          'English sentences',

        question: 'سؤال',
        of: 'از',

        instruction:
          'کلمات را به ترتیب درست قرار دهید',

        selectedPlaceholder:
          'کلمات انتخاب‌شده اینجا نمایش داده می‌شوند',

        check: 'بررسی پاسخ',
        next: 'سؤال بعدی',

        correct: 'پاسخ درست است!',
        wrong: 'پاسخ اشتباه است',

        correctAnswer: 'پاسخ صحیح:',

        clear: 'پاک کردن',
        removeLast: 'حذف آخرین کلمه',

        completed: 'بازی تمام شد',

        yourScore: 'امتیاز شما',

        back: 'بازگشت',

        playAgain: 'شروع مجدد',

        excellent: 'عملکرد عالی!',
        good: 'عملکرد خوب',
        practice: 'به تمرین بیشتری نیاز دارید',

        switchLanguage:
          'می‌توانید زبان بازی را در هر زمان تغییر دهید',

        selectedLanguage:
          'زبان انتخاب‌شده',

        restartDescription:
          'برای شروع دوباره، زبان موردنظر خود را انتخاب کنید.',
      };
    }

    return {
      title: 'Sentence Builder',
      subtitle:
        'Arrange the words and build a sentence',

      chooseLanguage:
        'Choose your game language',

      chooseLanguageDescription:
        'You can play the game in Persian or English.',

      persian: 'فارسی',
      english: 'English',

      persianDescription:
        'Persian sentences',

      englishDescription:
        'English sentences',

      question: 'Question',
      of: 'of',

      instruction:
        'Arrange the words in the correct order',

      selectedPlaceholder:
        'Selected words will appear here',

      check: 'Check Answer',
      next: 'Next Question',

      correct: 'Correct answer!',
      wrong: 'Incorrect answer',

      correctAnswer: 'Correct answer:',

      clear: 'Clear',
      removeLast: 'Remove last word',

      completed: 'Game Completed',

      yourScore: 'Your Score',

      back: 'Back',

      playAgain: 'Play Again',

      excellent: 'Excellent!',
      good: 'Good Performance',
      practice: 'More practice needed',

      switchLanguage:
        'You can change the game language at any time',

      selectedLanguage:
        'Selected language',

      restartDescription:
        'Choose your preferred language to start again.',
    };
  }, [appLanguage]);

  /* ================================================================
     QUESTIONS
  ================================================================= */

  const questions = useMemo(() => {
    return gameLanguage === 'en'
      ? questionsEn
      : questionsFa;
  }, [gameLanguage]);

  const question =
    questions[currentQuestion];

  /* ================================================================
     BACK
  ================================================================= */

  const exitScreen = useCallback(() => {
    router.back();
  }, [router]);

  const handleBack = useCallback(() => {
    if (gameLanguage !== null && !gameCompleted) {
      confirmExit(exitScreen);
      return;
    }

    exitScreen();
  }, [
    gameLanguage,
    gameCompleted,
    confirmExit,
    exitScreen,
  ]);

  /* ================================================================
     START / RESTART GAME
     
     مهم:
     این تابع هم برای شروع اولیه و هم برای تغییر زبان
     و شروع مجدد استفاده می‌شود.
  ================================================================= */

  const startWithLanguage = useCallback(
    (selectedLanguage: GameLanguage) => {
      setGameLanguage(selectedLanguage);

      setCurrentQuestion(0);
      setSelectedWords([]);
      setUsedIndexes([]);

      setScore(0);

      setAnswered(false);
      setIsCorrect(null);

      setGameCompleted(false);
    },
    [],
  );

  /* ================================================================
     RESTART TO LANGUAGE SELECTION
     
     بعد از پایان بازی:
     به جای اینکه بازی با همان زبان دوباره شروع شود،
     کاربر به صفحه انتخاب زبان برمی‌گردد.
  ================================================================= */

  const handlePlayAgain = useCallback(() => {
    setGameLanguage(null);

    setCurrentQuestion(0);
    setSelectedWords([]);
    setUsedIndexes([]);

    setScore(0);

    setAnswered(false);
    setIsCorrect(null);

    setGameCompleted(false);
  }, []);

  /* ================================================================
     SELECT WORD
  ================================================================= */

  const handleWordPress = useCallback(
    (
      word: string,
      index: number,
    ) => {
      if (answered || gameCompleted) {
        return;
      }

      if (usedIndexes.includes(index)) {
        return;
      }

      setSelectedWords((previous) => [
        ...previous,
        word,
      ]);

      setUsedIndexes((previous) => [
        ...previous,
        index,
      ]);
    },
    [
      answered,
      gameCompleted,
      usedIndexes,
    ],
  );

  /* ================================================================
     NORMALIZE ANSWER
  ================================================================= */

  const normalizeAnswer = useCallback(
    (value: string) => {
      return value
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .replace(/[.,!?،؛]/g, '');
    },
    [],
  );

  /* ================================================================
     CHECK ANSWER
  ================================================================= */

  const handleCheck = useCallback(() => {
    if (
      !question ||
      selectedWords.length === 0 ||
      answered ||
      gameCompleted
    ) {
      return;
    }

    const userAnswer =
      normalizeAnswer(
        selectedWords.join(' '),
      );

    const correctAnswer =
      normalizeAnswer(
        question.answer,
      );

    const correct =
      userAnswer === correctAnswer;

    setAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      setScore(
        (previous) => previous + 1,
      );
    }
  }, [
    answered,
    gameCompleted,
    normalizeAnswer,
    question,
    selectedWords,
  ]);

  /* ================================================================
     NEXT QUESTION / FINISH GAME
  ================================================================= */

  const handleNext = useCallback(() => {
    if (!question || !answered) {
      return;
    }

    /* --------------------------------------------------------------
       هنوز سؤال باقی مانده
    -------------------------------------------------------------- */

    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        (previous) => previous + 1,
      );

      setSelectedWords([]);
      setUsedIndexes([]);

      setAnswered(false);
      setIsCorrect(null);

      return;
    }

    /* --------------------------------------------------------------
       آخرین سؤال تمام شده است
       
       امتیاز نهایی را محاسبه می‌کنیم و بازی را وارد
       حالت Completed می‌کنیم.
       
       دیگر Alert نمایش داده نمی‌شود.
    -------------------------------------------------------------- */

    setGameCompleted(true);

    const finalAccuracy =
      questions.length > 0
        ? Math.round(
            (score / questions.length) * 100,
          )
        : 0;

    saveGameResult({
      gameId: 'word-order',
      gameName:
        appLanguage === 'fa'
          ? 'ترتیب کلمات'
          : 'Word Order',
      timestamp: Date.now(),
      score,

      metrics: [
        {
          id: 'word_order_accuracy',
          label:
            appLanguage === 'fa'
              ? 'دقت'
              : 'Accuracy',
          value: finalAccuracy,
          unit: '%',
        },
      ],
    });
  }, [
    answered,
    currentQuestion,
    question,
    questions.length,
    score,
    appLanguage,
  ]);

  /* ================================================================
     RESET CURRENT QUESTION
  ================================================================= */

  const handleReset = useCallback(() => {
    if (answered || gameCompleted) {
      return;
    }

    setSelectedWords([]);
    setUsedIndexes([]);
  }, [answered, gameCompleted]);

  /* ================================================================
     REMOVE LAST WORD
  ================================================================= */

  const handleRemoveLast = useCallback(() => {
    if (
      answered ||
      gameCompleted ||
      selectedWords.length === 0
    ) {
      return;
    }

    setSelectedWords((previous) =>
      previous.slice(0, -1),
    );

    setUsedIndexes((previous) =>
      previous.slice(0, -1),
    );
  }, [
    answered,
    gameCompleted,
    selectedWords.length,
  ]);

  /* ================================================================
     FINAL SCORE
  ================================================================= */

  const finalScore = score;

  const performanceTitle = useMemo(() => {
    if (
      finalScore >=
      Math.ceil(questions.length * 0.8)
    ) {
      return text.excellent;
    }

    if (
      finalScore <
      Math.ceil(questions.length * 0.5)
    ) {
      return text.practice;
    }

    return text.good;
  }, [
    finalScore,
    questions.length,
    text,
  ]);

  /* ================================================================
     PROGRESS
  ================================================================= */

  const progress =
    gameLanguage &&
    questions.length > 0
      ? ((currentQuestion + 1) /
          questions.length) *
        100
      : 0;

  /* ================================================================
     LANGUAGE SELECTION SCREEN
  ================================================================= */

  if (!gameLanguage) {
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
          subtitle={text.subtitle}
          onBack={handleBack}
          colors={colors}
          isRTL={isRTL}
          backLabel={text.back}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.languageContent
          }
        >
          <View
            style={[
              styles.languageIcon,
              {
                backgroundColor:
                  colors.primary + '15',
              },
            ]}
          >
            <Languages
              size={42}
              color={colors.primary}
              strokeWidth={2}
            />
          </View>

          <Text
            style={[
              styles.languageTitle,
              {
                color: colors.text,
              },
            ]}
          >
            {text.chooseLanguage}
          </Text>

          <Text
            style={[
              styles.languageDescription,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {text.chooseLanguageDescription}
          </Text>

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
            {/* =====================================================
                PERSIAN
            ====================================================== */}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                startWithLanguage('fa')
              }
              style={[
                styles.languageOption,
                {
                  borderColor:
                    colors.border,
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
                  styles.languageOptionText
                }
              >
                <Text
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
                  {text.persianDescription}
                </Text>
              </View>

              <ChevronLeft
                size={20}
                color={
                  colors.textSecondary
                }
                style={{
                  transform: [
                    {
                      rotate:
                        isRTL
                          ? '0deg'
                          : '180deg',
                    },
                  ],
                }}
              />
            </TouchableOpacity>

            {/* =====================================================
                ENGLISH
            ====================================================== */}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                startWithLanguage('en')
              }
              style={[
                styles.languageOption,
                {
                  borderColor:
                    colors.border,
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
                  style={[
                    styles.languageOptionIconText,
                    {
                      color:
                        colors.primary,
                      fontSize: 17,
                    },
                  ]}
                >
                  EN
                </Text>
              </View>

              <View
                style={
                  styles.languageOptionText
                }
              >
                <Text
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
                  {text.englishDescription}
                </Text>
              </View>

              <ChevronLeft
                size={20}
                color={
                  colors.textSecondary
                }
                style={{
                  transform: [
                    {
                      rotate:
                        isRTL
                          ? '0deg'
                          : '180deg',
                    },
                  ],
                }}
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.languageHint,
              {
                backgroundColor:
                  colors.primary + '0C',
                borderColor:
                  colors.primary + '20',
              },
            ]}
          >
            <Languages
              size={19}
              color={colors.primary}
            />

            <Text
              style={[
                styles.languageHintText,
                {
                  color:
                    colors.textSecondary,
                  textAlign: isRTL
                    ? 'right'
                    : 'left',
                },
              ]}
            >
              {text.switchLanguage}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  /* ================================================================
     COMPLETED SCREEN
     
     بعد از پایان بازی:
     - نتیجه نهایی
     - امتیاز
     - عملکرد
     - دکمه شروع مجدد
     - کاربر با شروع مجدد به انتخاب زبان برمی‌گردد
  ================================================================= */

  if (gameCompleted) {
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
          subtitle={text.completed}
          onBack={handleBack}
          colors={colors}
          isRTL={isRTL}
          backLabel={text.back}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.completedContent
          }
        >
          <View
            style={[
              styles.completedIcon,
              {
                backgroundColor:
                  colors.primary + '15',
              },
            ]}
          >
            <Trophy
              size={52}
              color={colors.primary}
              strokeWidth={2}
            />
          </View>

          <Text
            style={[
              styles.completedTitle,
              {
                color: colors.text,
              },
            ]}
          >
            {text.completed}
          </Text>

          <Text
            style={[
              styles.performanceTitle,
              {
                color: colors.primary,
              },
            ]}
          >
            {performanceTitle}
          </Text>

          <Text
            style={[
              styles.completedDescription,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {text.yourScore}
          </Text>

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
              color={colors.primary}
            />

            <Text
              style={[
                styles.finalScore,
                {
                  color:
                    colors.primary,
                },
              ]}
            >
              {finalScore}
            </Text>

            <Text
              style={[
                styles.finalScoreTotal,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              / {questions.length}
            </Text>
          </View>

          <Text
            style={[
              styles.restartDescription,
              {
                color:
                  colors.textSecondary,
                textAlign: isRTL
                  ? 'right'
                  : 'left',
              },
            ]}
          >
            {text.restartDescription}
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePlayAgain}
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

  /* ================================================================
     GAME SCREEN
  ================================================================= */

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
        subtitle={`${text.question} ${
          currentQuestion + 1
        } ${text.of} ${questions.length}`}
        onBack={handleBack}
        colors={colors}
        isRTL={isRTL}
        backLabel={text.back}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================
            GAME LANGUAGE
        ========================================================= */}

        <View
          style={[
            styles.gameLanguageBar,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
              flexDirection: isRTL
                ? 'row-reverse'
                : 'row',
            },
          ]}
        >
          <View
            style={[
              styles.gameLanguageLeft,
              {
                flexDirection: isRTL
                  ? 'row-reverse'
                  : 'row',
              },
            ]}
          >
            <Languages
              size={17}
              color={colors.primary}
            />

            <Text
              style={[
                styles.gameLanguageLabel,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {text.selectedLanguage}
            </Text>
          </View>

          <View
            style={[
              styles.languageSwitcher,
              {
                backgroundColor:
                  colors.background,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                startWithLanguage('fa')
              }
              style={[
                styles.languageSwitchButton,
                gameLanguage === 'fa' && {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.languageSwitchText,
                  {
                    color:
                      gameLanguage === 'fa'
                        ? '#FFFFFF'
                        : colors.text,
                  },
                ]}
              >
                فارسی
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                startWithLanguage('en')
              }
              style={[
                styles.languageSwitchButton,
                gameLanguage === 'en' && {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.languageSwitchText,
                  {
                    color:
                      gameLanguage === 'en'
                        ? '#FFFFFF'
                        : colors.text,
                  },
                ]}
              >
                EN
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================
            PROGRESS
        ========================================================= */}

        <View
          style={styles.progressContainer}
        >
          <View
            style={[
              styles.progressBackground,
              {
                backgroundColor:
                  colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor:
                    colors.primary,
                },
              ]}
            />
          </View>

          <Text
            style={[
              styles.progressText,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {currentQuestion + 1} /{' '}
            {questions.length}
          </Text>
        </View>

        {/* ========================================================
            SCORE
        ========================================================= */}

        <View
          style={[
            styles.scoreBar,
            {
              backgroundColor:
                colors.surface,
              borderColor:
                colors.border,
            },
          ]}
        >
          <View
            style={styles.scoreItem}
          >
            <Trophy
              size={18}
              color={colors.primary}
            />

            <Text
              style={[
                styles.scoreLabel,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {text.yourScore}
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
        </View>

        {/* ========================================================
            QUESTION CARD
        ========================================================= */}

        <View
          style={[
            styles.questionCard,
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
              styles.questionLabel,
              {
                color:
                  colors.textSecondary,
                textAlign: isRTL
                  ? 'right'
                  : 'left',
              },
            ]}
          >
            {text.instruction}
          </Text>

          {/* ======================================================
              ANSWER AREA
          ====================================================== */}

          <View
            style={[
              styles.answerArea,
              {
                borderColor:
                  answered
                    ? isCorrect
                      ? '#22C55E'
                      : '#EF4444'
                    : colors.border,

                backgroundColor:
                  answered
                    ? isCorrect
                      ? '#22C55E08'
                      : '#EF444408'
                    : colors.background,
              },
            ]}
          >
            {selectedWords.length > 0 ? (
              <View
                style={[
                  styles.selectedWordsContainer,
                  {
                    flexDirection:
                      gameLanguage ===
                      'fa'
                        ? 'row-reverse'
                        : 'row',
                  },
                ]}
              >
                {selectedWords.map(
                  (word, index) => (
                    <View
                      key={`${word}-${index}`}
                      style={[
                        styles.selectedWord,
                        {
                          backgroundColor:
                            colors.primary +
                            '15',
                          borderColor:
                            colors.primary,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.selectedWordText,
                          {
                            color:
                              colors.primary,
                          },
                        ]}
                      >
                        {word}
                      </Text>
                    </View>
                  ),
                )}
              </View>
            ) : (
              <Text
                style={[
                  styles.placeholder,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {
                  text.selectedPlaceholder
                }
              </Text>
            )}
          </View>

          {/* ======================================================
              ANSWER CONTROLS
          ====================================================== */}

          {!answered &&
            selectedWords.length >
              0 && (
              <View
                style={[
                  styles.answerControls,
                  {
                    flexDirection:
                      isRTL
                        ? 'row-reverse'
                        : 'row',
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={
                    handleRemoveLast
                  }
                  style={[
                    styles.smallAction,
                    {
                      backgroundColor:
                        colors.background,
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
                  <ArrowRight
                    size={15}
                    color={
                      colors.textSecondary
                    }
                    style={{
                      transform: [
                        {
                          rotate:
                            gameLanguage ===
                            'fa'
                              ? '180deg'
                              : '0deg',
                        },
                      ],
                    }}
                  />

                  <Text
                    style={[
                      styles.smallActionText,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {text.removeLast}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleReset}
                  style={[
                    styles.smallAction,
                    {
                      backgroundColor:
                        colors.background,
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
                  <Trash2
                    size={15}
                    color={
                      colors.textSecondary
                    }
                  />

                  <Text
                    style={[
                      styles.smallActionText,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {text.clear}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          {/* ======================================================
              WORDS
          ====================================================== */}

          <View
            style={[
              styles.wordsContainer,
              {
                direction:
                  gameLanguage === 'fa'
                    ? 'rtl'
                    : 'ltr',
              },
            ]}
          >
            {question.words.map(
              (word, index) => {
                const used =
                  usedIndexes.includes(
                    index,
                  );

                return (
                  <TouchableOpacity
                    key={`${word}-${index}`}
                    activeOpacity={0.75}
                    disabled={
                      used ||
                      answered
                    }
                    onPress={() =>
                      handleWordPress(
                        word,
                        index,
                      )
                    }
                    style={[
                      styles.wordButton,
                      {
                        backgroundColor:
                          used
                            ? colors.border
                            : colors.surface,

                        borderColor:
                          used
                            ? colors.border
                            : colors.primary,

                        opacity: used
                          ? 0.4
                          : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.wordText,
                        {
                          color: used
                            ? colors.textSecondary
                            : colors.text,
                        },
                      ]}
                    >
                      {word}
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>
        </View>

        {/* ========================================================
            RESULT
        ========================================================= */}

        {answered && (
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor:
                  isCorrect
                    ? '#22C55E12'
                    : '#EF444412',

                borderColor:
                  isCorrect
                    ? '#22C55E'
                    : '#EF4444',
              },
            ]}
          >
            <View
              style={[
                styles.resultIcon,
                {
                  backgroundColor:
                    isCorrect
                      ? '#22C55E18'
                      : '#EF444418',
                },
              ]}
            >
              {isCorrect ? (
                <CheckCircle
                  size={28}
                  color="#22C55E"
                />
              ) : (
                <XCircle
                  size={28}
                  color="#EF4444"
                />
              )}
            </View>

            <View
              style={
                styles.resultContent
              }
            >
              <Text
                style={[
                  styles.resultTitle,
                  {
                    color: isCorrect
                      ? '#16A34A'
                      : '#DC2626',

                    textAlign:
                      isRTL
                        ? 'right'
                        : 'left',
                  },
                ]}
              >
                {isCorrect
                  ? text.correct
                  : text.wrong}
              </Text>

              {!isCorrect && (
                <>
                  <Text
                    style={[
                      styles.correctAnswerLabel,
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
                    {text.correctAnswer}
                  </Text>

                  <Text
                    style={[
                      styles.correctAnswer,
                      {
                        color:
                          colors.text,

                        textAlign:
                          gameLanguage ===
                          'fa'
                            ? 'right'
                            : 'left',
                      },
                    ]}
                  >
                    {question.answer}
                  </Text>
                </>
              )}
            </View>
          </View>
        )}

        {/* ========================================================
            MAIN BUTTON
        ========================================================= */}

        {!answered ? (
          <TouchableOpacity
            activeOpacity={0.85}
            disabled={
              selectedWords.length === 0
            }
            onPress={handleCheck}
            style={[
              styles.primaryButton,
              {
                backgroundColor:
                  colors.primary,

                opacity:
                  selectedWords.length ===
                  0
                    ? 0.45
                    : 1,
              },
            ]}
          >
            <CheckCircle
              size={19}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.primaryButtonText
              }
            >
              {text.check}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleNext}
            style={[
              styles.primaryButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            {currentQuestion <
            questions.length - 1 ? (
              <ArrowRight
                size={19}
                color="#FFFFFF"
              />
            ) : (
              <Trophy
                size={19}
                color="#FFFFFF"
              />
            )}

            <Text
              style={
                styles.primaryButtonText
              }
            >
              {currentQuestion <
              questions.length - 1
                ? text.next
                : text.completed}
            </Text>
          </TouchableOpacity>
        )}

        <View
          style={styles.bottomSpace}
        />
      </ScrollView>
    </View>
  );
}

/* ================================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  /* ==============================================================
     HEADER
  ============================================================== */

  pageHeader: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth:
      StyleSheet.hairlineWidth,
    gap: 12,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  pageHeaderText: {
    flex: 1,
    minWidth: 0,
  },

  pageHeaderTitle: {
    fontSize: 21,
    fontWeight: '900',
  },

  pageHeaderSubtitle: {
    fontSize: 11,
    marginTop: 3,
  },

  /* ==============================================================
     LANGUAGE SELECTION
  ============================================================== */

  languageContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 38,
    paddingBottom: 60,
    alignItems: 'center',
  },

  languageIcon: {
    width: 86,
    height: 86,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  languageTitle: {
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
  },

  languageDescription: {
    maxWidth: 360,
    fontSize: 13,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },

  languageCard: {
    width: '100%',
    marginTop: 28,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  languageOption: {
    minHeight: 82,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },

  languageOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  languageOptionIconText: {
    fontSize: 23,
    fontWeight: '900',
  },

  languageOptionText: {
    flex: 1,
  },

  languageOptionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },

  languageOptionDescription: {
    fontSize: 11,
    marginTop: 4,
  },

  languageHint: {
    width: '100%',
    marginTop: 14,
    minHeight: 52,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  languageHintText: {
    flex: 1,
    fontSize: 11,
  },

  /* ==============================================================
     COMPLETED
  ============================================================== */

  completedContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 55,
    paddingBottom: 50,
    alignItems: 'center',
  },

  completedIcon: {
    width: 100,
    height: 100,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  completedTitle: {
    fontSize: 27,
    fontWeight: '900',
    textAlign: 'center',
  },

  performanceTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 9,
  },

  completedDescription: {
    fontSize: 12,
    marginTop: 28,
    textAlign: 'center',
  },

  finalScoreCard: {
    width: '100%',
    minHeight: 105,
    marginTop: 10,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  finalScore: {
    fontSize: 48,
    fontWeight: '900',
  },

  finalScoreTotal: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 16,
  },

  restartDescription: {
    width: '100%',
    fontSize: 12,
    lineHeight: 20,
    marginTop: 20,
  },

  /* ==============================================================
     GAME CONTENT
  ============================================================== */

  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 14,
    paddingBottom: 40,
  },

  gameLanguageBar: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  gameLanguageLeft: {
    alignItems: 'center',
    gap: 7,
  },

  gameLanguageLabel: {
    fontSize: 10,
    fontWeight: '600',
  },

  languageSwitcher: {
    borderWidth: 1,
    borderRadius: 11,
    padding: 3,
    flexDirection: 'row',
  },

  languageSwitchButton: {
    minWidth: 45,
    height: 31,
    paddingHorizontal: 9,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  languageSwitchText: {
    fontSize: 10,
    fontWeight: '800',
  },

  /* ==============================================================
     PROGRESS
  ============================================================== */

  progressContainer: {
    width: '100%',
    marginTop: 13,
  },

  progressBackground: {
    height: 5,
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  progressText: {
    fontSize: 9,
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 5,
  },

  /* ==============================================================
     SCORE
  ============================================================== */

  scoreBar: {
    minHeight: 54,
    marginTop: 10,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },

  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  scoreLabel: {
    fontSize: 11,
    fontWeight: '600',
  },

  scoreValue: {
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 3,
  },

  /* ==============================================================
     QUESTION
  ============================================================== */

  questionCard: {
    width: '100%',
    marginTop: 10,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 15,
  },

  questionLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 11,
  },

  /* ==============================================================
     ANSWER AREA
  ============================================================== */

  answerArea: {
    width: '100%',
    minHeight: 125,
    borderWidth: 1,
    borderRadius: 15,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedWordsContainer: {
    width: '100%',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  selectedWord: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedWordText: {
    fontSize: 13,
    fontWeight: '800',
  },

  placeholder: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
  },

  /* ==============================================================
     ANSWER CONTROLS
  ============================================================== */

  answerControls: {
    width: '100%',
    marginTop: 9,
    justifyContent: 'center',
    gap: 7,
  },

  smallAction: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  smallActionText: {
    fontSize: 9,
    fontWeight: '700',
  },

  /* ==============================================================
     WORDS
  ============================================================== */

  wordsContainer: {
    width: '100%',
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },

  wordButton: {
    minHeight: 45,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  wordText: {
    fontSize: 14,
    fontWeight: '700',
  },

  /* ==============================================================
     RESULT
  ============================================================== */

  resultCard: {
    width: '100%',
    marginTop: 10,
    padding: 13,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },

  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultContent: {
    flex: 1,
  },

  resultTitle: {
    fontSize: 14,
    fontWeight: '900',
  },

  correctAnswerLabel: {
    fontSize: 9,
    marginTop: 7,
  },

  correctAnswer: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },

  /* ==============================================================
     BUTTON
  ============================================================== */

  primaryButton: {
    width: '100%',
    minHeight: 54,
    marginTop: 14,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  bottomSpace: {
    height: 20,
  },
});