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
  
  import AsyncStorage from '@react-native-async-storage/async-storage';
  
  import {
    ArrowLeft,
    RotateCcw,
    Trophy,
    Check,
    X,
    Languages,
    Sparkles,
    Clock3,
    Target,
  } from 'lucide-react-native';
  
  import { useRouter } from 'expo-router';
  
  import { useTheme } from '../../context/ThemeContext';
  import { useLanguage } from '../../context/LanguageContext';
  
  
  // =====================================================
  // TYPES
  // =====================================================
  
  type GameLanguage = 'fa' | 'en';
  
  type LetterItem = {
    letter: string;
    index: number;
  };
  
  type GameStatus = 'playing' | 'gameover';
  
  
  // =====================================================
  // CONSTANTS
  // =====================================================
  
  const GAME_DURATION = 20;
  
  const BEST_SCORE_FA_KEY = '@anologram_best_score_fa';
  const BEST_SCORE_EN_KEY = '@anologram_best_score_en';
  
  
  // =====================================================
  // WORD BANK
  // =====================================================
  
  const FARSI_WORDS = [
    'سفید',
    'کتاب',
    'درخت',
    'باران',
    'خورشید',
    'مدرسه',
    'دوست',
    'آسمان',
    'پرنده',
    'لبخند',
    'زندگی',
    'رویا',
    'دریا',
    'خانه',
    'بهار',
    'گلستان',
    'ستاره',
    'آرامش',
    'ذهن',
    'دانش',
  
    // Additional words
    'امید',
    'آینده',
    'توانا',
    'زیبا',
    'آرام',
    'خاطره',
    'لباس',
    'پنجره',
    'رودخانه',
    'کوهستان',
    'جنگل',
    'صبح',
    'شب',
    'ماه',
    'خوراک',
    'سلامت',
    'آگاهی',
    'تفکر',
    'تمرکز',
    'سرعت',
  ];
  
  const ENGLISH_WORDS = [
    'white',
    'book',
    'tree',
    'rain',
    'sun',
    'school',
    'friend',
    'sky',
    'bird',
    'smile',
    'life',
    'dream',
    'ocean',
    'house',
    'spring',
    'garden',
    'star',
    'calm',
    'mind',
    'knowledge',
  
    // Additional words
    'hope',
    'future',
    'strong',
    'beautiful',
    'memory',
    'window',
    'river',
    'mountain',
    'forest',
    'morning',
    'night',
    'moon',
    'health',
    'focus',
    'speed',
    'brain',
    'thought',
    'energy',
    'nature',
    'wisdom',
  ];
  
  
  // =====================================================
  // HELPERS
  // =====================================================
  
  function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
  
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
  
      [result[i], result[j]] = [
        result[j],
        result[i],
      ];
    }
  
    return result;
  }
  
  
  /**
   * Better Persian normalization.
   *
   * Handles:
   * ي -> ی
   * ى -> ی
   * ك -> ک
   * ة -> ه
   * Arabic/Persian whitespace
   * ZWNJ / zero-width characters
   * Tatweel
   */
  function normalizePersian(value: string): string {
    return value
      .normalize('NFKC')
      .trim()
  
      // Arabic Yeh variants
      .replace(/ي/g, 'ی')
      .replace(/ى/g, 'ی')
  
      // Arabic Kaf
      .replace(/ك/g, 'ک')
  
      // Arabic Teh Marbuta
      .replace(/ة/g, 'ه')
  
      // Remove tatweel
      .replace(/ـ/g, '')
  
      // Remove zero-width characters
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
  
      // Remove Persian/Arabic whitespace
      .replace(/\s+/g, '');
  }
  
  
  function normalizeEnglish(value: string): string {
    return value
      .normalize('NFKC')
      .trim()
      .replace(/\s+/g, '')
      .toLowerCase();
  }
  
  
  function normalizeAnswer(
    value: string,
    language: GameLanguage
  ): string {
    return language === 'fa'
      ? normalizePersian(value)
      : normalizeEnglish(value);
  }
  
  
  function shuffleWord(word: string): string[] {
    const characters = Array.from(word);
  
    if (characters.length <= 1) {
      return characters;
    }
  
    let shuffled = shuffleArray(characters);
  
    const original = characters.join('');
  
    // Try several times to avoid showing the original word.
    let attempts = 0;
  
    while (
      shuffled.join('') === original &&
      attempts < 10
    ) {
      shuffled = shuffleArray(characters);
      attempts++;
    }
  
    // If random shuffle still equals original,
    // swap two positions manually.
    if (
      shuffled.join('') === original &&
      shuffled.length > 1
    ) {
      [shuffled[0], shuffled[1]] = [
        shuffled[1],
        shuffled[0],
      ];
    }
  
    return shuffled;
  }
  
  
  // =====================================================
  // COMPONENT
  // =====================================================
  
  export default function AnologramGame() {
    const router = useRouter();
  
    const { colors } = useTheme();
    const { isRTL } = useLanguage();
  
    // ===================================================
    // LANGUAGE
    // ===================================================
  
    const [gameLanguage, setGameLanguage] =
      useState<GameLanguage>('fa');
  
  
    // ===================================================
    // GAME STATE
    // ===================================================
  
    const [currentIndex, setCurrentIndex] =
      useState(0);
  
    const [score, setScore] =
      useState(0);
  
    const [bestScore, setBestScore] =
      useState(0);
  
    const [timeLeft, setTimeLeft] =
      useState(GAME_DURATION);
  
    const [status, setStatus] =
      useState<GameStatus>('playing');
  
    const [selectedLetters, setSelectedLetters] =
      useState<LetterItem[]>([]);
  
    const [availableLetters, setAvailableLetters] =
      useState<LetterItem[]>([]);
  
    const [showWrong, setShowWrong] =
      useState(false);
  
  
    // ===================================================
    // WORDS
    // ===================================================
  
    const words = useMemo(() => {
      const source =
        gameLanguage === 'fa'
          ? FARSI_WORDS
          : ENGLISH_WORDS;
  
      return shuffleArray(source);
    }, [gameLanguage]);
  
  
    const currentWord =
      words[currentIndex % words.length];
  
  
    // ===================================================
    // TEXT
    // ===================================================
  
    const isPersian =
      gameLanguage === 'fa';
  
    const texts = isPersian
      ? {
          title: 'آناگرام',
          subtitle:
            'حروف را مرتب کن و کلمه را بساز',
  
          score: 'امتیاز',
          best: 'رکورد',
          time: 'زمان',
  
          chooseLanguage:
            'زبان بازی',
  
          persian: 'فارسی',
          english: 'English',
  
          instruction:
            'حروف را به ترتیب انتخاب کن تا یک کلمه معنی‌دار ساخته شود.',
  
          check:
            'بررسی پاسخ',
  
          correct:
            'درست',
  
          wrong:
            'پاسخ اشتباه',
  
          gameOver:
            'زمان تمام شد',
  
          finalScore:
            'امتیاز نهایی',
  
          record:
            'رکورد',
  
          newRecord:
            'رکورد جدید',
  
          playAgain:
            'شروع دوباره',
  
          back:
            'بازگشت',
  
          seconds:
            'ثانیه',
        }
      : {
          title: 'Anologram',
          subtitle:
            'Arrange the letters and build the word',
  
          score: 'Score',
          best: 'Best',
          time: 'Time',
  
          chooseLanguage:
            'Game language',
  
          persian: 'فارسی',
          english: 'English',
  
          instruction:
            'Select the letters in order to create a meaningful word.',
  
          check:
            'Check Answer',
  
          correct:
            'Correct',
  
          wrong:
            'Wrong answer',
  
          gameOver:
            'Time is up',
  
          finalScore:
            'Final Score',
  
          record:
            'Record',
  
          newRecord:
            'New Record',
  
          playAgain:
            'Play Again',
  
          back:
            'Back',
  
          seconds:
            'seconds',
        };
  
  
    // ===================================================
    // LOAD BEST SCORE
    // ===================================================
  
    const loadBestScore = useCallback(
      async (language: GameLanguage) => {
        try {
          const key =
            language === 'fa'
              ? BEST_SCORE_FA_KEY
              : BEST_SCORE_EN_KEY;
  
          const saved =
            await AsyncStorage.getItem(key);
  
          if (saved) {
            const numericScore =
              Number(saved);
  
            setBestScore(
              Number.isFinite(numericScore)
                ? numericScore
                : 0
            );
          } else {
            setBestScore(0);
          }
        } catch {
          setBestScore(0);
        }
      },
      []
    );
  
  
    // ===================================================
    // SAVE BEST SCORE
    // ===================================================
  
    const saveBestScore = useCallback(
      async (
        language: GameLanguage,
        newScore: number
      ) => {
        try {
          const key =
            language === 'fa'
              ? BEST_SCORE_FA_KEY
              : BEST_SCORE_EN_KEY;
  
          await AsyncStorage.setItem(
            key,
            String(newScore)
          );
        } catch {
          // Storage failure should not stop gameplay.
        }
      },
      []
    );
  
  
    // ===================================================
    // PREPARE CURRENT WORD
    // ===================================================
  
    const prepareWord = useCallback(
      (word: string) => {
        if (!word) {
          setAvailableLetters([]);
          setSelectedLetters([]);
          return;
        }
  
        const shuffled =
          shuffleWord(word);
  
        const items: LetterItem[] =
          shuffled.map(
            (letter, index) => ({
              letter,
              index,
            })
          );
  
        setAvailableLetters(items);
        setSelectedLetters([]);
        setShowWrong(false);
      },
      []
    );
  
  
    // ===================================================
    // INITIAL LOAD
    // ===================================================
  
    useEffect(() => {
      loadBestScore(gameLanguage);
    }, [
      gameLanguage,
      loadBestScore,
    ]);
  
  
    // ===================================================
    // PREPARE WORD WHEN WORD CHANGES
    // ===================================================
  
    useEffect(() => {
      if (currentWord) {
        prepareWord(currentWord);
      }
    }, [
      currentWord,
      prepareWord,
    ]);
  
  
    // ===================================================
    // TIMER
    // ===================================================
  
    useEffect(() => {
      if (status !== 'playing') {
        return;
      }
  
      const timer =
        setInterval(() => {
          setTimeLeft(previous => {
            if (previous <= 1) {
              setStatus('gameover');
              return 0;
            }
  
            return previous - 1;
          });
        }, 1000);
  
      return () => {
        clearInterval(timer);
      };
    }, [status]);
  
  
    // ===================================================
    // SELECT LETTER
    // ===================================================
  
    const handleLetterPress = (
      letter: string,
      index: number
    ) => {
      if (status !== 'playing') {
        return;
      }
  
      setShowWrong(false);
  
      setSelectedLetters(previous => [
        ...previous,
        {
          letter,
          index,
        },
      ]);
  
      setAvailableLetters(previous =>
        previous.filter(
          item => item.index !== index
        )
      );
    };
  
  
    // ===================================================
    // REMOVE SELECTED LETTER
    // ===================================================
  
    const handleSelectedLetterPress = (
      selectedIndex: number
    ) => {
      if (status !== 'playing') {
        return;
      }
  
      const item =
        selectedLetters[selectedIndex];
  
      if (!item) {
        return;
      }
  
      setShowWrong(false);
  
      setSelectedLetters(previous =>
        previous.filter(
          (_, index) =>
            index !== selectedIndex
        )
      );
  
      setAvailableLetters(previous => [
        ...previous,
        item,
      ]);
    };
  
  
    // ===================================================
    // CHECK ANSWER
    // ===================================================
  
    const checkAnswer = async () => {
      if (
        status !== 'playing' ||
        selectedLetters.length === 0 ||
        !currentWord
      ) {
        return;
      }
  
      const answer =
        selectedLetters
          .map(item => item.letter)
          .join('');
  
      const normalizedAnswer =
        normalizeAnswer(
          answer,
          gameLanguage
        );
  
      const normalizedWord =
        normalizeAnswer(
          currentWord,
          gameLanguage
        );
  
  
      // ================================================
      // CORRECT
      // ================================================
  
      if (
        normalizedAnswer ===
        normalizedWord
      ) {
        setShowWrong(false);
  
        setScore(previousScore => {
          const newScore =
            previousScore + 1;
  
          if (newScore > bestScore) {
            setBestScore(newScore);
  
            saveBestScore(
              gameLanguage,
              newScore
            );
          }
  
          return newScore;
        });
  
        // Immediately move to the next word.
        setCurrentIndex(previous =>
          previous + 1
        );
  
        return;
      }
  
  
      // ================================================
      // WRONG
      // ================================================
  
      // IMPORTANT:
      // Wrong answer DOES NOT end the game.
      // The user can correct the letters.
      setShowWrong(true);
    };
  
  
    // ===================================================
    // NEXT WORD
    // ===================================================
  
    const nextWord = () => {
      if (status !== 'playing') {
        return;
      }
  
      setShowWrong(false);
  
      setCurrentIndex(previous =>
        previous + 1
      );
    };
  
  
    // ===================================================
    // RESTART GAME
    // ===================================================
  
    const restartGame = () => {
      setScore(0);
      setCurrentIndex(0);
      setTimeLeft(GAME_DURATION);
      setStatus('playing');
      setShowWrong(false);
  
      const source =
        gameLanguage === 'fa'
          ? FARSI_WORDS
          : ENGLISH_WORDS;
  
      const shuffledSource =
        shuffleArray(source);
  
      const firstWord =
        shuffledSource[0];
  
      if (firstWord) {
        prepareWord(firstWord);
      }
    };
  
  
    // ===================================================
    // CHANGE LANGUAGE
    // ===================================================
  
    const changeLanguage = (
      language: GameLanguage
    ) => {
      if (
        language === gameLanguage
      ) {
        return;
      }
  
      setGameLanguage(language);
  
      setScore(0);
      setCurrentIndex(0);
      setTimeLeft(GAME_DURATION);
      setStatus('playing');
      setShowWrong(false);
    };
  
  
    // ===================================================
    // TIMER PROGRESS
    // ===================================================
  
    const timerProgress =
      timeLeft / GAME_DURATION;
  
  
    // ===================================================
    // RENDER
    // ===================================================
  
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
  
        {/* =================================================
            HEADER
           ================================================= */}
  
        <View
          style={[
            styles.header,
            {
              borderBottomColor:
                colors.border,
            },
          ]}
        >
  
          {/* BACK BUTTON — ALWAYS LEFT */}
  
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.75}
            style={[
              styles.backButton,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              texts.back
            }
          >
            <ArrowLeft
              size={22}
              color={colors.text}
              strokeWidth={2.2}
            />
          </TouchableOpacity>
  
  
          {/* TITLE */}
  
          <View
            style={[
              styles.headerTitle,
              {
                alignItems:
                  isPersian
                    ? 'flex-end'
                    : 'flex-start',
              },
            ]}
          >
  
            <View
              style={[
                styles.titleRow,
                {
                  flexDirection:
                    isPersian
                      ? 'row-reverse'
                      : 'row',
                },
              ]}
            >
  
              <Sparkles
                size={21}
                color={colors.primary}
                strokeWidth={2}
              />
  
              <Text
                style={[
                  styles.title,
                  {
                    color:
                      colors.text,
  
                    marginLeft:
                      isPersian
                        ? 0
                        : 8,
  
                    marginRight:
                      isPersian
                        ? 8
                        : 0,
                  },
                ]}
              >
                {texts.title}
              </Text>
  
            </View>
  
            <Text
              style={[
                styles.subtitle,
                {
                  color:
                    colors.textSecondary,
  
                  textAlign:
                    isPersian
                      ? 'right'
                      : 'left',
                },
              ]}
            >
              {texts.subtitle}
            </Text>
  
          </View>
  
        </View>
  
  
        {/* =================================================
            CONTENT
           ================================================= */}
  
        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
        >
  
          {/* =================================================
              LANGUAGE SELECTOR
             ================================================= */}
  
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
                styles.sectionHeader,
                {
                  flexDirection:
                    isPersian
                      ? 'row-reverse'
                      : 'row',
                },
              ]}
            >
  
              <Languages
                size={20}
                color={colors.primary}
                strokeWidth={2}
              />
  
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {texts.chooseLanguage}
              </Text>
  
            </View>
  
  
            <View
              style={[
                styles.languageButtons,
                {
                  flexDirection:
                    isPersian
                      ? 'row-reverse'
                      : 'row',
                },
              ]}
            >
  
              {/* PERSIAN */}
  
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  changeLanguage('fa')
                }
                style={[
                  styles.languageButton,
                  {
                    backgroundColor:
                      gameLanguage === 'fa'
                        ? colors.primary
                        : colors.background,
  
                    borderColor:
                      gameLanguage === 'fa'
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    {
                      color:
                        gameLanguage === 'fa'
                          ? '#FFFFFF'
                          : colors.text,
                    },
                  ]}
                >
                  {texts.persian}
                </Text>
              </TouchableOpacity>
  
  
              {/* ENGLISH */}
  
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  changeLanguage('en')
                }
                style={[
                  styles.languageButton,
                  {
                    backgroundColor:
                      gameLanguage === 'en'
                        ? colors.primary
                        : colors.background,
  
                    borderColor:
                      gameLanguage === 'en'
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.languageButtonText,
                    {
                      color:
                        gameLanguage === 'en'
                          ? '#FFFFFF'
                          : colors.text,
                    },
                  ]}
                >
                  {texts.english}
                </Text>
              </TouchableOpacity>
  
            </View>
  
          </View>
  
  
          {/* =================================================
              STATS
             ================================================= */}
  
          <View
            style={styles.statsRow}
          >
  
            {/* TIME */}
  
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
  
              <Clock3
                size={20}
                color={
                  timeLeft <= 5
                    ? '#EF4444'
                    : colors.primary
                }
                strokeWidth={2.2}
              />
  
              <Text
                style={[
                  styles.statLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {texts.time}
              </Text>
  
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      timeLeft <= 5
                        ? '#EF4444'
                        : colors.text,
                  },
                ]}
              >
                {timeLeft}
              </Text>
  
              <Text
                style={[
                  styles.statSmall,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {texts.seconds}
              </Text>
  
            </View>
  
  
            {/* SCORE */}
  
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
  
              <Target
                size={20}
                color={colors.primary}
                strokeWidth={2.2}
              />
  
              <Text
                style={[
                  styles.statLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {texts.score}
              </Text>
  
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {score}
              </Text>
  
            </View>
  
  
            {/* BEST */}
  
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
  
              <Trophy
                size={20}
                color={colors.primary}
                strokeWidth={2.2}
              />
  
              <Text
                style={[
                  styles.statLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {texts.best}
              </Text>
  
              <Text
                style={[
                  styles.statValue,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {bestScore}
              </Text>
  
            </View>
  
          </View>
  
  
          {/* =================================================
              TIMER BAR
             ================================================= */}
  
          <View
            style={[
              styles.timerContainer,
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
                styles.timerTrack,
                {
                  backgroundColor:
                    colors.background,
                },
              ]}
            >
  
              <View
                style={[
                  styles.timerProgress,
                  {
                    width:
                      `${Math.max(
                        0,
                        timerProgress * 100
                      )}%`,
  
                    backgroundColor:
                      timeLeft <= 5
                        ? '#EF4444'
                        : colors.primary,
                  },
                ]}
              />
  
            </View>
  
          </View>
  
  
          {/* =================================================
              INSTRUCTION
             ================================================= */}
  
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
  
            <Text
              style={[
                styles.instructionText,
                {
                  color:
                    colors.textSecondary,
  
                  textAlign:
                    isPersian
                      ? 'right'
                      : 'left',
                },
              ]}
            >
              {texts.instruction}
            </Text>
  
          </View>
  
  
          {/* =================================================
              GAME AREA
             ================================================= */}
  
          {status === 'playing' ? (
            <View
              style={[
                styles.gameCard,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
  
              {/* SELECTED LETTERS */}
  
              <View
                style={[
                  styles.answerContainer,
                  {
                    direction:
                      isPersian
                        ? 'rtl'
                        : 'ltr',
                  },
                ]}
              >
  
                {selectedLetters.length >
                0 ? (
                  selectedLetters.map(
                    (item, index) => (
                      <TouchableOpacity
                        key={`selected-${item.index}-${index}`}
                        activeOpacity={0.75}
                        onPress={() =>
                          handleSelectedLetterPress(
                            index
                          )
                        }
                        style={[
                          styles.selectedLetter,
                          {
                            backgroundColor:
                              colors.primary,
  
                            borderColor:
                              colors.primary,
                          },
                        ]}
                      >
                        <Text
                          style={
                            styles.selectedLetterText
                          }
                        >
                          {item.letter}
                        </Text>
                      </TouchableOpacity>
                    )
                  )
                ) : (
                  <Text
                    style={[
                      styles.placeholderText,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {isPersian
                      ? 'حروف را انتخاب کن'
                      : 'Select letters'}
                  </Text>
                )}
  
              </View>
  
  
              {/* WRONG MESSAGE */}
  
              {showWrong && (
                <View
                  style={[
                    styles.feedback,
                    {
                      backgroundColor:
                        'rgba(239,68,68,0.10)',
                      borderColor:
                        'rgba(239,68,68,0.25)',
                    },
                  ]}
                >
  
                  <X
                    size={18}
                    color="#EF4444"
                    strokeWidth={2.4}
                  />
  
                  <Text
                    style={[
                      styles.feedbackText,
                      {
                        color:
                          '#EF4444',
                      },
                    ]}
                  >
                    {texts.wrong}
                  </Text>
  
                </View>
              )}
  
  
              {/* AVAILABLE LETTERS */}
  
              <View
                style={[
                  styles.lettersContainer,
                  {
                    flexDirection:
                      'row',
  
                    justifyContent:
                      'center',
  
                    flexWrap:
                      'wrap',
                  },
                ]}
              >
  
                {availableLetters.map(
                  item => (
                    <TouchableOpacity
                      key={`available-${item.index}`}
                      activeOpacity={0.75}
                      onPress={() =>
                        handleLetterPress(
                          item.letter,
                          item.index
                        )
                      }
                      style={[
                        styles.letterButton,
                        {
                          backgroundColor:
                            colors.background,
  
                          borderColor:
                            colors.border,
                        },
                      ]}
                    >
  
                      <Text
                        style={[
                          styles.letterText,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {item.letter}
                      </Text>
  
                    </TouchableOpacity>
                  )
                )}
  
              </View>
  
  
              {/* CHECK BUTTON */}
  
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={checkAnswer}
                disabled={
                  selectedLetters.length ===
                  0
                }
                style={[
                  styles.checkButton,
                  {
                    backgroundColor:
                      selectedLetters.length >
                      0
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
  
                <Check
                  size={21}
                  color="#FFFFFF"
                  strokeWidth={2.5}
                />
  
                <Text
                  style={
                    styles.checkButtonText
                  }
                >
                  {texts.check}
                </Text>
  
              </TouchableOpacity>
  
            </View>
          ) : (
            /* =================================================
               GAME OVER
               ================================================= */
  
            <View
              style={[
                styles.gameOverCard,
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
                  styles.gameOverIcon,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
              >
  
                <Trophy
                  size={34}
                  color="#FFFFFF"
                  strokeWidth={2}
                />
  
              </View>
  
  
              <Text
                style={[
                  styles.gameOverTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {texts.gameOver}
              </Text>
  
  
              <Text
                style={[
                  styles.finalScoreLabel,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {texts.finalScore}
              </Text>
  
  
              <Text
                style={[
                  styles.finalScore,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                {score}
              </Text>
  
  
              {score >= bestScore &&
                score > 0 && (
                  <View
                    style={[
                      styles.recordBadge,
                      {
                        backgroundColor:
                          colors.background,
                        borderColor:
                          colors.primary,
                      },
                    ]}
                  >
  
                    <Trophy
                      size={17}
                      color={
                        colors.primary
                      }
                      strokeWidth={2}
                    />
  
                    <Text
                      style={[
                        styles.recordText,
                        {
                          color:
                            colors.primary,
                        },
                      ]}
                    >
                      {texts.newRecord}
                    </Text>
  
                  </View>
                )}
  
  
              <View
                style={styles.finalStatsRow}
              >
  
                <View
                  style={[
                    styles.finalStat,
                    {
                      backgroundColor:
                        colors.background,
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
  
                  <Text
                    style={[
                      styles.finalStatLabel,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {texts.finalScore}
                  </Text>
  
                  <Text
                    style={[
                      styles.finalStatValue,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {score}
                  </Text>
  
                </View>
  
  
                <View
                  style={[
                    styles.finalStat,
                    {
                      backgroundColor:
                        colors.background,
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
  
                  <Text
                    style={[
                      styles.finalStatLabel,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {texts.record}
                  </Text>
  
                  <Text
                    style={[
                      styles.finalStatValue,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {Math.max(
                      bestScore,
                      score
                    )}
                  </Text>
  
                </View>
  
              </View>
  
  
              {/* RESTART */}
  
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={restartGame}
                style={[
                  styles.restartButton,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
              >
  
                <RotateCcw
                  size={21}
                  color="#FFFFFF"
                  strokeWidth={2.3}
                />
  
                <Text
                  style={
                    styles.restartButtonText
                  }
                >
                  {texts.playAgain}
                </Text>
  
              </TouchableOpacity>
  
            </View>
          )}
  
        </ScrollView>
  
      </View>
    );
  }
  
  
  // =====================================================
  // STYLES
  // =====================================================
  
  const styles = StyleSheet.create({
  
    container: {
      flex: 1,
    },
  
  
    // ===================================================
    // HEADER
    // ===================================================
  
    header: {
      minHeight: 82,
  
      paddingHorizontal: 18,
      paddingTop: 40,
      paddingBottom: 10,
  
      flexDirection: 'row',
      alignItems: 'center',
  
      borderBottomWidth: 1,
    },
  
    backButton: {
      width: 42,
      height: 42,
  
      borderRadius: 13,
  
      alignItems: 'center',
      justifyContent: 'center',
  
      borderWidth: 1,
  
      flexShrink: 0,
    },
  
    headerTitle: {
      flex: 1,
  
      marginLeft: 14,
  
      justifyContent: 'center',
    },
  
    titleRow: {
      alignItems: 'center',
    },
  
    title: {
      fontSize: 22,
      fontWeight: '800',
    },
  
    subtitle: {
      marginTop: 3,
  
      fontSize: 12,
      fontWeight: '500',
    },
  
  
    // ===================================================
    // SCROLL
    // ===================================================
  
    scrollContent: {
      paddingHorizontal: 18,
      paddingTop: 18,
      paddingBottom: 40,
    },
  
  
    // ===================================================
    // LANGUAGE
    // ===================================================
  
    languageCard: {
      borderRadius: 18,
  
      borderWidth: 1,
  
      padding: 16,
  
      marginBottom: 14,
    },
  
    sectionHeader: {
      alignItems: 'center',
  
      marginBottom: 13,
    },
  
    sectionTitle: {
      marginHorizontal: 8,
  
      fontSize: 15,
      fontWeight: '700',
    },
  
    languageButtons: {
      gap: 10,
    },
  
    languageButton: {
      flex: 1,
  
      minHeight: 44,
  
      borderRadius: 12,
  
      borderWidth: 1,
  
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    languageButtonText: {
      fontSize: 14,
      fontWeight: '700',
    },
  
  
    // ===================================================
    // STATS
    // ===================================================
  
    statsRow: {
      flexDirection: 'row',
  
      gap: 9,
  
      marginBottom: 12,
    },
  
    statCard: {
      flex: 1,
  
      minHeight: 102,
  
      borderRadius: 16,
  
      borderWidth: 1,
  
      alignItems: 'center',
      justifyContent: 'center',
  
      paddingVertical: 11,
    },
  
    statLabel: {
      fontSize: 11,
      fontWeight: '600',
  
      marginTop: 5,
    },
  
    statValue: {
      fontSize: 23,
      fontWeight: '800',
  
      marginTop: 1,
    },
  
    statSmall: {
      fontSize: 9,
      marginTop: -2,
    },
  
  
    // ===================================================
    // TIMER
    // ===================================================
  
    timerContainer: {
      borderRadius: 12,
  
      borderWidth: 1,
  
      padding: 5,
  
      marginBottom: 12,
    },
  
    timerTrack: {
      height: 6,
  
      borderRadius: 100,
  
      overflow: 'hidden',
    },
  
    timerProgress: {
      height: '100%',
  
      borderRadius: 100,
    },
  
  
    // ===================================================
    // INSTRUCTION
    // ===================================================
  
    instructionCard: {
      borderRadius: 16,
  
      borderWidth: 1,
  
      paddingHorizontal: 16,
      paddingVertical: 13,
  
      marginBottom: 14,
    },
  
    instructionText: {
      fontSize: 13,
      lineHeight: 21,
      fontWeight: '500',
    },
  
  
    // ===================================================
    // GAME CARD
    // ===================================================
  
    gameCard: {
      borderRadius: 22,
  
      borderWidth: 1,
  
      padding: 18,
  
      minHeight: 330,
    },
  
  
    // ===================================================
    // ANSWER
    // ===================================================
  
    answerContainer: {
      minHeight: 74,
  
      borderRadius: 17,
  
      borderWidth: 1,
  
      borderColor: 'rgba(128,128,128,0.18)',
  
      alignItems: 'center',
      justifyContent: 'center',
  
      flexDirection: 'row',
  
      flexWrap: 'wrap',
  
      padding: 10,
  
      marginBottom: 14,
    },
  
    placeholderText: {
      fontSize: 13,
      fontWeight: '500',
    },
  
    selectedLetter: {
      minWidth: 44,
      height: 48,
  
      borderRadius: 12,
  
      borderWidth: 1,
  
      alignItems: 'center',
      justifyContent: 'center',
  
      margin: 4,
  
      paddingHorizontal: 9,
    },
  
    selectedLetterText: {
      color: '#FFFFFF',
  
      fontSize: 21,
      fontWeight: '800',
    },
  
  
    // ===================================================
    // FEEDBACK
    // ===================================================
  
    feedback: {
      minHeight: 42,
  
      borderRadius: 12,
  
      borderWidth: 1,
  
      flexDirection: 'row',
  
      alignItems: 'center',
      justifyContent: 'center',
  
      marginBottom: 12,
  
      paddingHorizontal: 12,
    },
  
    feedbackText: {
      fontSize: 13,
      fontWeight: '700',
  
      marginLeft: 7,
    },
  
  
    // ===================================================
    // LETTERS
    // ===================================================
  
    lettersContainer: {
      minHeight: 115,
  
      alignItems: 'center',
  
      paddingVertical: 5,
  
      marginBottom: 12,
    },
  
    letterButton: {
      width: 52,
      height: 52,
  
      borderRadius: 14,
  
      borderWidth: 1,
  
      alignItems: 'center',
      justifyContent: 'center',
  
      margin: 5,
    },
  
    letterText: {
      fontSize: 22,
      fontWeight: '800',
    },
  
  
    // ===================================================
    // CHECK BUTTON
    // ===================================================
  
    checkButton: {
      height: 52,
  
      borderRadius: 15,
  
      flexDirection: 'row',
  
      alignItems: 'center',
      justifyContent: 'center',
  
      marginTop: 5,
    },
  
    checkButtonText: {
      color: '#FFFFFF',
  
      fontSize: 15,
      fontWeight: '800',
  
      marginLeft: 8,
    },
  
  
    // ===================================================
    // GAME OVER
    // ===================================================
  
    gameOverCard: {
      borderRadius: 22,
  
      borderWidth: 1,
  
      padding: 24,
  
      alignItems: 'center',
    },
  
    gameOverIcon: {
      width: 68,
      height: 68,
  
      borderRadius: 22,
  
      alignItems: 'center',
      justifyContent: 'center',
  
      marginBottom: 15,
    },
  
    gameOverTitle: {
      fontSize: 24,
      fontWeight: '800',
  
      marginBottom: 8,
    },
  
    finalScoreLabel: {
      fontSize: 13,
      fontWeight: '600',
    },
  
    finalScore: {
      fontSize: 48,
      fontWeight: '900',
  
      marginTop: 1,
    },
  
    recordBadge: {
      minHeight: 38,
  
      borderRadius: 100,
  
      borderWidth: 1,
  
      flexDirection: 'row',
  
      alignItems: 'center',
      justifyContent: 'center',
  
      paddingHorizontal: 14,
  
      marginTop: 8,
    },
  
    recordText: {
      fontSize: 12,
      fontWeight: '800',
  
      marginLeft: 6,
    },
  
  
    // ===================================================
    // FINAL STATS
    // ===================================================
  
    finalStatsRow: {
      flexDirection: 'row',
  
      width: '100%',
  
      gap: 10,
  
      marginTop: 20,
      marginBottom: 18,
    },
  
    finalStat: {
      flex: 1,
  
      minHeight: 76,
  
      borderRadius: 14,
  
      borderWidth: 1,
  
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    finalStatLabel: {
      fontSize: 11,
      fontWeight: '600',
    },
  
    finalStatValue: {
      fontSize: 23,
      fontWeight: '800',
  
      marginTop: 3,
    },
  
  
    // ===================================================
    // RESTART
    // ===================================================
  
    restartButton: {
      width: '100%',
  
      height: 53,
  
      borderRadius: 15,
  
      flexDirection: 'row',
  
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    restartButtonText: {
      color: '#FFFFFF',
  
      fontSize: 15,
      fontWeight: '800',
  
      marginLeft: 8,
    },
  });