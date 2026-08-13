
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { useRouter } from 'expo-router';

import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';

interface Question {
  id: number;
  words: string[];
  answer: string;
}

/* ================================================================
   QUESTIONS
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
];

const questionsEn: Question[] = [
  {
    id: 1,
    words: ['read', 'I', 'book', 'a'],
    answer: 'I read a book',
  },
  {
    id: 2,
    words: ['today', 'is', 'weather', 'good', 'the'],
    answer: 'the weather is good today',
  },
  {
    id: 3,
    words: ['school', 'go', 'I', 'to'],
    answer: 'I go to school',
  },
  {
    id: 4,
    words: ['friend', 'my', 'good', 'is'],
    answer: 'my friend is good',
  },
  {
    id: 5,
    words: ['drink', 'I', 'water'],
    answer: 'I drink water',
  },
];

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

export default function WordGameScreen() {
  const router = useRouter();

  const { colors } = useTheme();

  const {
    t,
    language,
    isRTL,
  } = useLanguage();

  /* ================================================================
     STATE
  ================================================================ */

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [selectedWords, setSelectedWords] =
    useState<string[]>([]);

  const [usedIndexes, setUsedIndexes] =
    useState<number[]>([]);

  const [score, setScore] = useState(0);

  const [answered, setAnswered] = useState(false);

  const [isCorrect, setIsCorrect] =
    useState<boolean | null>(null);

  /* ================================================================
     QUESTIONS BASED ON LANGUAGE
  ================================================================ */

  const questions = useMemo(
    () =>
      language === 'fa'
        ? questionsFa
        : questionsEn,
    [language],
  );

  const question = questions[currentQuestion];

  /* ================================================================
     RESET WHEN LANGUAGE CHANGES
  ================================================================ */

  useEffect(() => {
    setCurrentQuestion(0);
    setSelectedWords([]);
    setUsedIndexes([]);
    setScore(0);
    setAnswered(false);
    setIsCorrect(null);
  }, [language]);

  /* ================================================================
     BACK TO BILINGUAL GAMES

     مهم:

     دیگر از این استفاده نمی‌کنیم:

     router.replace('./bilingual')

     چون bilingual.tsx یک screen/component است
     و لزوماً route مستقیمی با این نام ندارد.

     Word از صفحه بازی‌های دوزبانه باز شده است،
     بنابراین router.back() کاربر را به همان صفحه
     قبلی برمی‌گرداند.
  ================================================================ */

  const handleBack = () => {
    router.back();
  };

  /* ================================================================
     SELECT WORD
  ================================================================ */

  const handleWordPress = (
    word: string,
    index: number,
  ) => {
    if (answered) {
      return;
    }

    if (usedIndexes.includes(index)) {
      return;
    }

    setSelectedWords((prev) => [
      ...prev,
      word,
    ]);

    setUsedIndexes((prev) => [
      ...prev,
      index,
    ]);
  };

  /* ================================================================
     CHECK ANSWER
  ================================================================ */

  const normalizeAnswer = (value: string) => {
    return value
      .trim()
      .replace(/\s+/g, ' ')
      .toLowerCase();
  };

  const handleCheck = () => {
    if (
      selectedWords.length === 0 ||
      answered
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
      setScore((prev) => prev + 1);
    }
  };

  /* ================================================================
     NEXT QUESTION
  ================================================================ */

  const handleNext = () => {
    if (
      currentQuestion <
      questions.length - 1
    ) {
      setCurrentQuestion(
        (prev) => prev + 1,
      );

      setSelectedWords([]);
      setUsedIndexes([]);
      setAnswered(false);
      setIsCorrect(null);

      return;
    }

    Alert.alert(
      language === 'fa'
        ? 'بازی تمام شد'
        : 'Game Completed',

      language === 'fa'
        ? `امتیاز شما: ${
            score + (isCorrect ? 1 : 0)
          } از ${questions.length}`
        : `Your score: ${
            score + (isCorrect ? 1 : 0)
          } / ${questions.length}`,

      [
        {
          text:
            language === 'fa'
              ? 'بازگشت'
              : 'Back',

          onPress: handleBack,
        },
      ],
    );
  };

  /* ================================================================
     RESET CURRENT QUESTION
  ================================================================ */

  const handleReset = () => {
    setSelectedWords([]);
    setUsedIndexes([]);
    setAnswered(false);
    setIsCorrect(null);
  };

  /* ================================================================
     REMOVE LAST WORD
  ================================================================ */

  const handleRemoveLast = () => {
    if (
      answered ||
      selectedWords.length === 0
    ) {
      return;
    }

    const newSelected =
      selectedWords.slice(0, -1);

    setSelectedWords(newSelected);

    const indexesToKeep =
      usedIndexes.slice(0, -1);

    setUsedIndexes(indexesToKeep);
  };

  /* ================================================================
     PROGRESS
  ================================================================ */

  const progress =
    ((currentQuestion + 1) /
      questions.length) *
    100;

  /* ================================================================
     TITLE
  ================================================================ */

  const title =
    language === 'fa'
      ? 'بازی کلمه'
      : 'Word Puzzle';

  const subtitle =
    language === 'fa'
      ? `سؤال ${currentQuestion + 1} از ${questions.length}`
      : `Question ${
          currentQuestion + 1
        } of ${questions.length}`;

  /* ================================================================
     RENDER
  ================================================================ */

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
      {/* HEADER */}

      <PageHeader
        title={title}
        subtitle={subtitle}
        onBack={handleBack}
        colors={colors}
        isRTL={isRTL}
        backLabel={t.back}
      />

      {/* CONTENT */}

      <View style={styles.content}>

        {/* PROGRESS */}

        <View style={styles.progressContainer}>
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

        {/* QUESTION */}

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
            {language === 'fa'
              ? 'کلمات را به ترتیب درست قرار دهید'
              : 'Arrange the words in the correct order'}
          </Text>

          {/* ANSWER AREA */}

          <View
            style={[
              styles.answerArea,
              {
                direction: isRTL
                  ? 'rtl'
                  : 'ltr',
              },
            ]}
          >
            {selectedWords.length > 0 ? (
              selectedWords.map(
                (word, index) => (
                  <View
                    key={`${word}-${index}`}
                    style={[
                      styles.selectedWord,
                      {
                        backgroundColor:
                          colors.primary +
                          '18',
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
              )
            ) : (
              <Text
                style={[
                  styles.placeholder,
                  {
                    color:
                      colors.textSecondary,
                    textAlign: 'center',
                  },
                ]}
              >
                {language === 'fa'
                  ? 'کلمات انتخاب‌شده اینجا نمایش داده می‌شوند'
                  : 'Selected words will appear here'}
              </Text>
            )}
          </View>

          {/* WORDS */}

          <View
            style={[
              styles.wordsContainer,
              {
                flexDirection: isRTL
                  ? 'row-reverse'
                  : 'row',
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
                          ? 0.45
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

        {/* RESULT */}

        {answered ? (
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor:
                  isCorrect
                    ? '#22c55e18'
                    : '#ef444418',

                borderColor:
                  isCorrect
                    ? '#22c55e'
                    : '#ef4444',
              },
            ]}
          >
            {isCorrect ? (
              <CheckCircle
                size={26}
                color="#22c55e"
              />
            ) : (
              <XCircle
                size={26}
                color="#ef4444"
              />
            )}

            <View
              style={[
                styles.resultTextContainer,
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
                  styles.resultTitle,
                  {
                    color:
                      isCorrect
                        ? '#22c55e'
                        : '#ef4444',

                    textAlign:
                      isRTL
                        ? 'right'
                        : 'left',
                  },
                ]}
              >
                {isCorrect
                  ? language === 'fa'
                    ? 'پاسخ صحیح است!'
                    : 'Correct answer!'
                  : language === 'fa'
                  ? 'پاسخ اشتباه است'
                  : 'Incorrect answer'}
              </Text>

              {!isCorrect && (
                <Text
                  style={[
                    styles.correctAnswer,
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
                  {language === 'fa'
                    ? `پاسخ صحیح: ${question.answer}`
                    : `Correct answer: ${question.answer}`}
                </Text>
              )}
            </View>
          </View>
        ) : null}

        {/* ACTIONS */}

        <View
          style={[
            styles.actions,
            {
              flexDirection: isRTL
                ? 'row-reverse'
                : 'row',
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleReset}
            disabled={
              selectedWords.length === 0 ||
              answered
            }
            style={[
              styles.resetButton,
              {
                borderColor:
                  colors.border,

                backgroundColor:
                  colors.surface,

                opacity:
                  selectedWords.length === 0 ||
                  answered
                    ? 0.5
                    : 1,
              },
            ]}
          >
            <RotateCcw
              size={18}
              color={colors.text}
            />

            <Text
              style={[
                styles.resetText,
                {
                  color: colors.text,
                },
              ]}
            >
              {language === 'fa'
                ? 'پاک کردن'
                : 'Reset'}
            </Text>
          </TouchableOpacity>

          {!answered ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCheck}
              disabled={
                selectedWords.length === 0
              }
              style={[
                styles.checkButton,
                {
                  backgroundColor:
                    colors.primary,

                  opacity:
                    selectedWords.length === 0
                      ? 0.5
                      : 1,
                },
              ]}
            >
              <Text
                style={
                  styles.checkButtonText
                }
              >
                {language === 'fa'
                  ? 'بررسی پاسخ'
                  : 'Check Answer'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleNext}
              style={[
                styles.checkButton,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >
              <Text
                style={
                  styles.checkButtonText
                }
              >
                {currentQuestion <
                questions.length - 1
                  ? language === 'fa'
                    ? 'سؤال بعدی'
                    : 'Next Question'
                  : language === 'fa'
                  ? 'پایان بازی'
                  : 'Finish Game'}
              </Text>
            </TouchableOpacity>
          )}
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
  },

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

  content: {
    flex: 1,

    paddingTop: 20,
    paddingHorizontal:
      Spacing.lg,
    paddingBottom: 40,
  },

  progressContainer: {
    marginBottom: 18,
  },

  progressBackground: {
    width: '100%',
    height: 7,

    borderRadius: 10,

    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',

    borderRadius: 10,
  },

  progressText: {
    marginTop: 7,

    fontSize: 12,
    textAlign: 'center',
  },

  questionCard: {
    borderRadius: 20,

    borderWidth: 1,

    padding: Spacing.lg,
  },

  questionLabel: {
    fontSize: 15,
    fontWeight: '700',

    lineHeight: 22,

    marginBottom: 18,
  },

  answerArea: {
    minHeight: 100,

    borderRadius: 16,

    borderWidth: 1,
    borderColor: '#00000015',

    padding: 14,

    flexDirection: 'row',
    flexWrap: 'wrap',

    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    marginBottom: 20,
  },

  selectedWord: {
    paddingHorizontal: 13,
    paddingVertical: 9,

    borderRadius: 12,

    borderWidth: 1,
  },

  selectedWordText: {
    fontSize: 15,
    fontWeight: '700',
  },

  placeholder: {
    fontSize: 13,
    lineHeight: 20,
  },

  wordsContainer: {
    flexWrap: 'wrap',

    justifyContent: 'center',

    gap: 10,
  },

  wordButton: {
    minHeight: 44,

    paddingHorizontal: 15,
    paddingVertical: 10,

    borderRadius: 14,

    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  wordText: {
    fontSize: 15,
    fontWeight: '600',
  },

  resultCard: {
    marginTop: 18,

    minHeight: 72,

    borderRadius: 16,

    borderWidth: 1,

    padding: 14,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 12,
  },

  resultTextContainer: {
    flex: 1,
  },

  resultTitle: {
    fontSize: 15,
    fontWeight: '800',
  },

  correctAnswer: {
    marginTop: 4,

    fontSize: 13,
    lineHeight: 19,
  },

  actions: {
    marginTop: 18,

    alignItems: 'center',

    gap: 10,
  },

  resetButton: {
    minHeight: 48,

    paddingHorizontal: 16,

    borderRadius:
      BorderRadius.full,

    borderWidth: 1,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    gap: 7,
  },

  resetText: {
    fontSize: 14,
    fontWeight: '700',
  },

  checkButton: {
    flex: 1,

    minHeight: 48,

    paddingHorizontal: 20,

    borderRadius:
      BorderRadius.full,

    alignItems: 'center',
    justifyContent: 'center',
  },

  checkButtonText: {
    color: '#fff',

    fontSize: 14,
    fontWeight: '800',
  },
});

