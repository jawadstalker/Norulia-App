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
    Alert,
    Platform,
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
  } from 'lucide-react-native';
  
  import { useRouter } from 'expo-router';
  
  import { useTheme } from '../../context/ThemeContext';
  import { useLanguage } from '../../context/LanguageContext';
  
  
  // =====================================================
  // TYPES
  // =====================================================
  
  type GameLanguage = 'fa' | 'en';
  
  type WordItem = {
    word: string;
    shuffled: string[];
  };
  
  type GameStatus = 'playing' | 'correct' | 'gameover';
  
  
  // =====================================================
  // STORAGE
  // =====================================================
  
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
  
  
  function shuffleWord(word: string): string[] {
    const chars = Array.from(word);
  
    let shuffled = shuffleArray(chars);
  
    // Avoid showing the original word
    if (
      shuffled.join('') === word &&
      chars.length > 1
    ) {
      shuffled = shuffleArray(chars);
    }
  
    return shuffled;
  }
  
  
  function normalizePersian(value: string) {
    return value
      .trim()
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      .replace(/\s+/g, '');
  }
  
  
  // =====================================================
  // COMPONENT
  // =====================================================
  
  export default function AnologramGame() {
    const router = useRouter();
  
    const {
      colors,
    } = useTheme();
  
    const {
      isRTL,
    } = useLanguage();
  
  
    // ---------------------------------------------------
    // LANGUAGE
    // ---------------------------------------------------
  
    const [
      gameLanguage,
      setGameLanguage,
    ] = useState<GameLanguage>('fa');
  
  
    // ---------------------------------------------------
    // GAME STATE
    // ---------------------------------------------------
  
    const [
      currentIndex,
      setCurrentIndex,
    ] = useState(0);
  
    const [
      score,
      setScore,
    ] = useState(0);
  
    const [
      bestScore,
      setBestScore,
    ] = useState(0);
  
    const [
      selectedLetters,
      setSelectedLetters,
    ] = useState<
      {
        letter: string;
        index: number;
      }[]
    >([]);
  
    const [
      availableLetters,
      setAvailableLetters,
    ] = useState<
      {
        letter: string;
        index: number;
      }[]
    >([]);
  
    const [
      status,
      setStatus,
    ] = useState<GameStatus>('playing');
  
  
    // ---------------------------------------------------
    // WORDS
    // ---------------------------------------------------
  
    const words = useMemo(() => {
      const source =
        gameLanguage === 'fa'
          ? FARSI_WORDS
          : ENGLISH_WORDS;
  
      return shuffleArray(source);
    }, [gameLanguage]);
  
  
    const currentWord = words[currentIndex] || words[0];
  
  
    // ---------------------------------------------------
    // LOAD BEST SCORE
    // ---------------------------------------------------
  
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
            setBestScore(Number(saved));
          } else {
            setBestScore(0);
          }
        } catch {
          setBestScore(0);
        }
      },
      []
    );
  
  
    // ---------------------------------------------------
    // PREPARE WORD
    // ---------------------------------------------------
  
    const prepareWord = useCallback(
      (word: string) => {
        const letters = shuffleWord(word);
  
        setAvailableLetters(
          letters.map(
            (letter, index) => ({
              letter,
              index,
            })
          )
        );
  
        setSelectedLetters([]);
      },
      []
    );
  
  
    // ---------------------------------------------------
    // INITIALIZE
    // ---------------------------------------------------
  
    useEffect(() => {
      loadBestScore(gameLanguage);
    }, [
      gameLanguage,
      loadBestScore,
    ]);
  
  
    useEffect(() => {
      if (currentWord) {
        prepareWord(currentWord);
      }
    }, [
      currentWord,
      prepareWord,
    ]);
  
  
    // ---------------------------------------------------
    // SELECT LETTER
    // ---------------------------------------------------
  
    const handleLetterPress = (
      letter: string,
      index: number
    ) => {
      if (status !== 'playing') {
        return;
      }
  
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
  
  
    // ---------------------------------------------------
    // REMOVE SELECTED LETTER
    // ---------------------------------------------------
  
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
  
  
    // ---------------------------------------------------
    // CHECK ANSWER
    // ---------------------------------------------------
  
    const checkAnswer = async () => {
      if (
        selectedLetters.length === 0 ||
        status !== 'playing'
      ) {
        return;
      }
  
      const answer =
        selectedLetters
          .map(item => item.letter)
          .join('');
  
      const normalizedAnswer =
        gameLanguage === 'fa'
          ? normalizePersian(answer)
          : answer.toLowerCase();
  
      const normalizedWord =
        gameLanguage === 'fa'
          ? normalizePersian(currentWord)
          : currentWord.toLowerCase();
  
  
      // -----------------------------------------------
      // CORRECT
      // -----------------------------------------------
  
      if (
        normalizedAnswer === normalizedWord
      ) {
        const newScore = score + 1;
  
        setScore(newScore);
        setStatus('correct');
  
        if (newScore > bestScore) {
          setBestScore(newScore);
  
          const key =
            gameLanguage === 'fa'
              ? BEST_SCORE_FA_KEY
              : BEST_SCORE_EN_KEY;
  
          try {
            await AsyncStorage.setItem(
              key,
              String(newScore)
            );
          } catch {}
        }
  
        return;
      }
  
  
      // -----------------------------------------------
      // WRONG
      // -----------------------------------------------
  
      setStatus('gameover');
    };
  
  
    // ---------------------------------------------------
    // NEXT WORD
    // ---------------------------------------------------
  
    const nextWord = () => {
      setCurrentIndex(
        previous =>
          previous + 1
      );
  
      setStatus('playing');
    };
  
  
    // ---------------------------------------------------
    // RESTART
    // ---------------------------------------------------
  
    const restartGame = () => {
      setScore(0);
      setCurrentIndex(0);
      setStatus('playing');
  
      const source =
        gameLanguage === 'fa'
          ? FARSI_WORDS
          : ENGLISH_WORDS;
  
      const firstWord =
        shuffleArray(source)[0];
  
      prepareWord(firstWord);
    };
  
  
    // ---------------------------------------------------
    // CHANGE LANGUAGE
    // ---------------------------------------------------
  
    const changeLanguage = (
      language: GameLanguage
    ) => {
      setGameLanguage(language);
      setScore(0);
      setCurrentIndex(0);
      setStatus('playing');
    };
  
  
    // ---------------------------------------------------
    // TEXT
    // ---------------------------------------------------
  
    const isPersian =
      gameLanguage === 'fa';
  
    const texts = isPersian
      ? {
          title: 'آناگرام',
          subtitle:
            'حروف را مرتب کن و کلمه را بساز',
          score: 'امتیاز',
          best: 'رکورد',
          chooseLanguage:
            'زبان بازی',
          persian: 'فارسی',
          english: 'English',
          check: 'بررسی پاسخ',
          correct:
            'پاسخ درست است',
          next:
            'کلمه بعدی',
          gameOver:
            'بازی تمام شد',
          wrong:
            'ترتیب حروف درست نیست',
          finalScore:
            'امتیاز نهایی',
          playAgain:
            'شروع دوباره',
          instruction:
            'حروف را به ترتیب انتخاب کن تا یک کلمه معنی‌دار ساخته شود.',
          newRecord:
            'رکورد جدید',
        }
      : {
          title: 'Anologram',
          subtitle:
            'Arrange the letters and build the word',
          score: 'Score',
          best: 'Best',
          chooseLanguage:
            'Game language',
          persian: 'فارسی',
          english: 'English',
          check: 'Check Answer',
          correct:
            'Correct answer',
          next:
            'Next Word',
          gameOver:
            'Game Over',
          wrong:
            'The letter order is incorrect',
          finalScore:
            'Final Score',
          playAgain:
            'Play Again',
          instruction:
            'Select the letters in order to create a meaningful word.',
          newRecord:
            'New Record',
        };
  
  
    // ---------------------------------------------------
    // RENDER
    // ---------------------------------------------------
  
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
  
        {/* ================================================
            HEADER
           ================================================ */}
  
        <View
          style={[
            styles.header,
            {
              borderBottomColor:
                colors.border,
            },
          ]}
        >
  
          {/* BACK BUTTON — LEFT */}
  
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
          >
            <ArrowLeft
              size={22}
              color={colors.text}
              strokeWidth={2.2}
            />
          </TouchableOpacity>
  
  
          {/* TITLE — RIGHT */}
  
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
  
  
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            styles.scrollContent
          }
        >
  
          {/* ============================================
              LANGUAGE
             ============================================ */}
  
          <View
            style={[
              styles.languageSection,
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
                styles.languageHeader,
                {
                  flexDirection:
                    isPersian
                      ? 'row-reverse'
                      : 'row',
                },
              ]}
            >
  
              <Languages
                size={19}
                color={colors.primary}
              />
  
              <Text
                style={[
                  styles.sectionTitle,
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
                {texts.chooseLanguage}
              </Text>
  
            </View>
  
  
            <View
              style={styles.languageButtons}
            >
  
              <TouchableOpacity
                onPress={() =>
                  changeLanguage('fa')
                }
                activeOpacity={0.8}
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
                    styles.languageText,
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
  
  
              <TouchableOpacity
                onPress={() =>
                  changeLanguage('en')
                }
                activeOpacity={0.8}
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
                    styles.languageText,
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
  
  
          {/* ============================================
              SCORE
             ============================================ */}
  
          <View
            style={styles.scoreRow}
          >
  
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
                {texts.score}
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
  
              <View
                style={[
                  styles.bestTitle,
                  {
                    flexDirection:
                      isPersian
                        ? 'row-reverse'
                        : 'row',
                  },
                ]}
              >
  
                <Trophy
                  size={16}
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
                  {texts.best}
                </Text>
  
              </View>
  
              <Text
                style={[
                  styles.scoreValue,
                  {
                    color:
                      colors.primary,
                  },
                ]}
              >
                {bestScore}
              </Text>
  
            </View>
  
          </View>
  
  
          {/* ============================================
              INSTRUCTION
             ============================================ */}
  
          <View
            style={[
              styles.instruction,
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
  
  
          {/* ============================================
              LETTER AREA
             ============================================ */}
  
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
  
            {/* SELECTED WORD */}
  
            <View
              style={[
                styles.answerBox,
                {
                  borderColor:
                    colors.border,
                  backgroundColor:
                    colors.background,
                },
              ]}
            >
  
              {selectedLetters.length === 0 ? (
                <Text
                  style={[
                    styles.placeholder,
                    {
                      color:
                        colors.textSecondary,
                    },
                  ]}
                >
                  {isPersian
                    ? 'حروف انتخاب‌شده اینجا نمایش داده می‌شوند'
                    : 'Selected letters will appear here'}
                </Text>
              ) : (
                <View
                  style={[
                    styles.selectedLetters,
                    {
                      flexDirection:
                        isPersian
                          ? 'row-reverse'
                          : 'row',
                    },
                  ]}
                >
  
                  {selectedLetters.map(
                    (item, index) => (
                      <TouchableOpacity
                        key={`${item.index}-${index}`}
                        onPress={() =>
                          handleSelectedLetterPress(
                            index
                          )
                        }
                        activeOpacity={0.75}
                        style={[
                          styles.selectedLetter,
                          {
                            backgroundColor:
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
                  )}
  
                </View>
              )}
  
            </View>
  
  
            {/* AVAILABLE LETTERS */}
  
            <View
              style={[
                styles.lettersContainer,
                {
                  flexDirection:
                    isPersian
                      ? 'row-reverse'
                      : 'row',
                },
              ]}
            >
  
              {availableLetters.map(
                item => (
                  <TouchableOpacity
                    key={item.index}
                    onPress={() =>
                      handleLetterPress(
                        item.letter,
                        item.index
                      )
                    }
                    activeOpacity={0.8}
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
  
  
            {/* CHECK */}
  
            {status === 'playing' && (
              <TouchableOpacity
                onPress={checkAnswer}
                activeOpacity={0.85}
                style={[
                  styles.checkButton,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
              >
  
                <Check
                  size={20}
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
            )}
  
  
            {/* CORRECT */}
  
            {status === 'correct' && (
              <View
                style={[
                  styles.resultContainer,
                  {
                    backgroundColor:
                      colors.background,
                    borderColor:
                      colors.primary,
                  },
                ]}
              >
  
                <View
                  style={
                    styles.resultIcon
                  }
                >
                  <Check
                    size={24}
                    color={colors.primary}
                    strokeWidth={2.5}
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
                  {texts.correct}
                </Text>
  
                {score === bestScore && (
                  <Text
                    style={[
                      styles.newRecord,
                      {
                        color:
                          colors.primary,
                      },
                    ]}
                  >
                    {texts.newRecord}
                  </Text>
                )}
  
                <TouchableOpacity
                  onPress={nextWord}
                  activeOpacity={0.85}
                  style={[
                    styles.nextButton,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                >
  
                  <Text
                    style={
                      styles.nextButtonText
                    }
                  >
                    {texts.next}
                  </Text>
  
                </TouchableOpacity>
  
              </View>
            )}
  
  
            {/* GAME OVER */}
  
            {status === 'gameover' && (
              <View
                style={[
                  styles.resultContainer,
                  {
                    backgroundColor:
                      colors.background,
                    borderColor:
                      colors.border,
                  },
                ]}
              >
  
                <View
                  style={[
                    styles.resultIcon,
                    {
                      backgroundColor:
                        colors.surface,
                    },
                  ]}
                >
                  <X
                    size={24}
                    color={colors.textSecondary}
                    strokeWidth={2.5}
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
                  {texts.gameOver}
                </Text>
  
                <Text
                  style={[
                    styles.wrongText,
                    {
                      color:
                        colors.textSecondary,
                    },
                  ]}
                >
                  {texts.wrong}
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
                  {texts.finalScore}: {score}
                </Text>
  
                <TouchableOpacity
                  onPress={restartGame}
                  activeOpacity={0.85}
                  style={[
                    styles.nextButton,
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
                    style={
                      styles.nextButtonText
                    }
                  >
                    {texts.playAgain}
                  </Text>
  
                </TouchableOpacity>
  
              </View>
            )}
  
          </View>
  
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
  
    header: {
      minHeight: 88,
      paddingTop:
        Platform.OS === 'ios'
          ? 42
          : 28,
      paddingHorizontal: 18,
      paddingBottom: 12,
  
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
  
      borderBottomWidth: 1,
    },
  
    backButton: {
      width: 42,
      height: 42,
      borderRadius: 13,
  
      alignItems: 'center',
      justifyContent: 'center',
  
      borderWidth: 1,
    },
  
    headerTitle: {
      flex: 1,
      marginLeft: 14,
    },
  
    titleRow: {
      alignItems: 'center',
    },
  
    title: {
      fontSize: 22,
      fontWeight: '700',
    },
  
    subtitle: {
      marginTop: 3,
      fontSize: 12,
    },
  
    scrollContent: {
      padding: 18,
      paddingBottom: 40,
    },
  
    languageSection: {
      borderRadius: 18,
      borderWidth: 1,
      padding: 15,
      marginBottom: 14,
    },
  
    languageHeader: {
      alignItems: 'center',
      marginBottom: 12,
    },
  
    sectionTitle: {
      fontSize: 15,
      fontWeight: '600',
    },
  
    languageButtons: {
      flexDirection: 'row',
      gap: 10,
    },
  
    languageButton: {
      flex: 1,
      height: 44,
      borderRadius: 12,
  
      alignItems: 'center',
      justifyContent: 'center',
  
      borderWidth: 1,
    },
  
    languageText: {
      fontSize: 14,
      fontWeight: '600',
    },
  
    scoreRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 14,
    },
  
    scoreCard: {
      flex: 1,
      minHeight: 78,
  
      borderRadius: 18,
      borderWidth: 1,
  
      padding: 13,
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    scoreLabel: {
      fontSize: 12,
      marginBottom: 3,
    },
  
    scoreValue: {
      fontSize: 25,
      fontWeight: '800',
    },
  
    bestTitle: {
      alignItems: 'center',
      gap: 5,
    },
  
    instruction: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 14,
      marginBottom: 14,
    },
  
    instructionText: {
      fontSize: 13,
      lineHeight: 21,
    },
  
    gameCard: {
      borderRadius: 22,
      borderWidth: 1,
      padding: 18,
    },
  
    answerBox: {
      minHeight: 92,
      borderRadius: 17,
      borderWidth: 1,
  
      alignItems: 'center',
      justifyContent: 'center',
  
      padding: 12,
      marginBottom: 18,
    },
  
    placeholder: {
      fontSize: 12,
      textAlign: 'center',
    },
  
    selectedLetters: {
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
    },
  
    selectedLetter: {
      minWidth: 46,
      height: 52,
  
      paddingHorizontal: 10,
  
      borderRadius: 13,
  
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    selectedLetterText: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: '700',
    },
  
    lettersContainer: {
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 10,
  
      marginBottom: 20,
    },
  
    letterButton: {
      width: 52,
      height: 52,
  
      borderRadius: 14,
      borderWidth: 1,
  
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    letterText: {
      fontSize: 21,
      fontWeight: '700',
    },
  
    checkButton: {
      height: 52,
      borderRadius: 15,
  
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
  
      gap: 8,
    },
  
    checkButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '700',
    },
  
    resultContainer: {
      borderRadius: 17,
      borderWidth: 1,
  
      padding: 18,
  
      alignItems: 'center',
    },
  
    resultIcon: {
      width: 52,
      height: 52,
  
      borderRadius: 26,
  
      alignItems: 'center',
      justifyContent: 'center',
  
      marginBottom: 10,
    },
  
    resultTitle: {
      fontSize: 19,
      fontWeight: '700',
      marginBottom: 5,
    },
  
    newRecord: {
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 12,
    },
  
    wrongText: {
      fontSize: 13,
      marginBottom: 8,
      textAlign: 'center',
    },
  
    finalScore: {
      fontSize: 22,
      fontWeight: '800',
      marginBottom: 15,
    },
  
    nextButton: {
      minWidth: 150,
      height: 48,
  
      borderRadius: 13,
  
      paddingHorizontal: 20,
  
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
  
      gap: 8,
    },
  
    nextButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
    },
  });