import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Languages,
  Clock3,
  Trophy,
  Layers3,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Flag,
  Sparkles,
  ChevronRight,
  Play,
  Moon,
  Sun,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { saveGameResult } from './gameResults';

type GameLanguage = 'fa' | 'en';
type LevelConfig = {
  level: number;
  minLength: number;
  maxLength: number;
  timeLimit: number;
  wordsPerLevel: number;
};
type WordBank = Record<number, string[]>;

const LEVEL_CONFIG: LevelConfig[] = [
  { level: 1, minLength: 3, maxLength: 4, timeLimit: 15, wordsPerLevel: 5 },
  { level: 2, minLength: 4, maxLength: 5, timeLimit: 12, wordsPerLevel: 5 },
  { level: 3, minLength: 5, maxLength: 6, timeLimit: 10, wordsPerLevel: 6 },
  { level: 4, minLength: 6, maxLength: 7, timeLimit: 8, wordsPerLevel: 6 },
  { level: 5, minLength: 7, maxLength: 8, timeLimit: 6, wordsPerLevel: 7 },
];

const WORDS: Record<GameLanguage, WordBank> = {
  en: {
    3: ['CAT', 'DOG', 'SUN', 'CAR', 'BAG', 'HAT', 'LEG', 'EYE', 'EAR', 'TOE', 'MAP', 'BED', 'CUP', 'PEN', 'RUN'],
    4: ['FISH', 'BIRD', 'TREE', 'STAR', 'MOON', 'BOOK', 'CARD', 'LAMP', 'DESK', 'CITY', 'FLOW', 'GOLD', 'HOME', 'JUMP', 'KIND'],
    5: ['APPLE', 'HAPPY', 'SMILE', 'WATER', 'HOUSE', 'MONEY', 'PHONE', 'CLOUD', 'DREAM', 'LIGHT', 'BREAD', 'CHILD', 'DRINK', 'EARTH', 'FLOUR'],
    6: ['BANANA', 'ORANGE', 'FAMILY', 'FRIEND', 'GARDEN', 'HEARTY', 'JUNGLE', 'MONKEY', 'PENCIL', 'RABBIT', 'SILVER', 'TRAVEL', 'UNIVERSE', 'VICTORY', 'WINDOW'],
    7: ['ELEPHANT', 'BUTTERFLY', 'CHOCOLATE', 'DANGEROUS', 'EXCELLENT', 'FANTASTIC', 'GENEROUS', 'HORIZON', 'IMAGINE', 'JOURNEY', 'KINGDOM', 'LIBRARY', 'MIRACLE', 'NATURE', 'OPERA'],
    8: ['BEAUTIFUL', 'CHARACTER', 'EDUCATION', 'FABULOUS', 'GENERATOR', 'HAPPINESS', 'IMAGINARY', 'KNOWLEDGE', 'MOUNTAIN', 'RIVER', 'SPECTRUM', 'TREASURE', 'UNIVERSE', 'VIBRANT', 'WONDERFUL'],
    9: ['ADVENTURE', 'BRILLIANT', 'CHALLENGE', 'DETERMINED', 'EXCITING', 'FORTUNATE', 'HOPEFULLY', 'INCREDIBLE', 'JOURNAL', 'KEYSTONE', 'LIMITLESS', 'MAGNIFICENT', 'NEGOTIATE', 'OVERCOME', 'PEACEFUL'],
  },
  fa: {
    3: ['آب', 'باد', 'پا', 'گل', 'ماه', 'نور', 'یک', 'دو', 'سه', 'راه', 'شیر', 'دست', 'چشم', 'سرد', 'گرم'],
    4: ['آبشار', 'بازار', 'پاییز', 'ترانه', 'چهار', 'خانه', 'دوست', 'رنگین', 'زمین', 'سفر', 'شادی', 'کارت', 'گلشن', 'مادر', 'نگاه'],
    5: ['آسمان', 'بهار', 'پرنده', 'تالاب', 'جنگل', 'حافظه', 'خورشید', 'درخت', 'رودخانه', 'زندگی', 'سعادت', 'شهر', 'گلزار', 'مشاور', 'نوروز'],
    6: ['آزادگان', 'بارانی', 'پرستو', 'تاریخچه', 'جوانان', 'خاطره', 'دانشجو', 'رستگار', 'زمزمه', 'سپیده', 'شکوفه', 'صبحانه', 'طلوع', 'عشق', 'فصل'],
    7: ['آرامش', 'اقتصاد', 'بهاری', 'پرچم', 'تکامل', 'جهان', 'حقیقت', 'خشایار', 'دایره', 'رستاخیز', 'سپهر', 'شکوفا', 'صداقت', 'طبیعت', 'عاطفه'],
    8: ['آزادی', 'باورها', 'پرسش', 'تغییر', 'جستجو', 'خردمند', 'دانایی', 'رهایی', 'زیبایی', 'سرفراز', 'شکوه', 'صبر', 'طلب', 'عشق', 'فتح'],
    9: ['آگاهی', 'باور', 'پذیرش', 'تحول', 'جهاد', 'خوشبخت', 'درخشش', 'رستگار', 'زندگی', 'سربلند', 'شکفتن', 'صلح', 'طوفان', 'عشق', 'فرشته'],
  },
};

const TEXT = {
  fa: {
    title: 'آنالوگرام',
    subtitle: 'حروف را مرتب کن و کلمه را پیدا کن',
    scrambled: 'حروف به‌هم‌ریخته',
    build: 'کلمه شما',
    instruction: 'حروف را به ترتیب انتخاب کن',
    score: 'امتیاز',
    level: 'مرحله',
    time: 'زمان',
    remaining: 'باقی‌مانده',
    correct: 'درست',
    wrong: 'اشتباه',
    timeUp: 'زمان تمام شد',
    levelComplete: 'مرحله کامل شد',
    wordsCompleted: 'کلمات تکمیل شده',
    levelScore: 'امتیاز مرحله',
    accuracy: 'دقت',
    nextLevel: 'مرحله بعد',
    finish: 'پایان',
    newGame: 'بازی جدید',
    chooseLanguage: 'زبان بازی',
    persian: 'فارسی',
    english: 'English',
    exit: 'خروج',
    back: 'بازگشت',
    correctMessage: 'درست!',
    wrongMessage: 'اشتباه!',
    allDone: 'همه مراحل کامل شد!',
    totalScore: 'امتیاز نهایی',
    start: 'شروع بازی',
    ready: 'آماده‌ای؟',
    readyDescription: 'حروف به‌هم‌ریخته را مرتب کن و در کوتاه‌ترین زمان کلمه درست را بساز.',
  },
  en: {
    title: 'Anagram',
    subtitle: 'Arrange the letters and find the word',
    scrambled: 'Scrambled letters',
    build: 'Your word',
    instruction: 'Select the letters in order',
    score: 'Score',
    level: 'Level',
    time: 'Time',
    remaining: 'Remaining',
    correct: 'Correct',
    wrong: 'Wrong',
    timeUp: 'Time is up',
    levelComplete: 'Level complete',
    wordsCompleted: 'Words completed',
    levelScore: 'Level score',
    accuracy: 'Accuracy',
    nextLevel: 'Next level',
    finish: 'Finish',
    newGame: 'New game',
    chooseLanguage: 'Game language',
    persian: 'فارسی',
    english: 'English',
    exit: 'Exit',
    back: 'Back',
    correctMessage: 'Correct!',
    wrongMessage: 'Wrong!',
    allDone: 'All levels complete!',
    totalScore: 'Total score',
    start: 'Start game',
    ready: 'Ready?',
    readyDescription: 'Arrange the scrambled letters and build the correct word as quickly as possible.',
  },
};

type LetterItem = {
  char: string;
  index: number;
};

function normalizeWord(value: string) {
  return value
    .normalize('NFC')
    .replace(/\u200c/g, '')
    .replace(/\u064A/g, '\u06CC')
    .replace(/\u0643/g, '\u06A9')
    .trim()
    .toLocaleLowerCase();
}

function splitLetters(word: string): string[] {
  return Array.from(normalizeWord(word));
}

function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function getWordLength(word: string) {
  return splitLetters(word).length;
}

function createScrambledLetters(word: string): LetterItem[] {
  const letters = splitLetters(word);
  const shuffled = shuffleArray(letters.map((char, index) => ({ char, index })));
  const original = letters.join('');
  if (shuffled.length > 1 && shuffled.map((x) => x.char).join('') === original) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

export default function AnagramScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { language: appLanguage, isRTL } = useLanguage();
  const { width } = useWindowDimensions();
  const [gameLanguage, setGameLanguage] = useState<GameLanguage>(isRTL ? 'fa' : 'en');
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [levelScore, setLevelScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [wordsDone, setWordsDone] = useState(0);
  const [timeLeft, setTimeLeft] = useState(LEVEL_CONFIG[0].timeLimit);
  const [currentWord, setCurrentWord] = useState('');
  const [letters, setLetters] = useState<LetterItem[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong' | 'time'>('idle');
  const [isRunning, setIsRunning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const t = TEXT[gameLanguage];
  const config = LEVEL_CONFIG[currentLevel];
  const selectedWord = useMemo(() => {
    return selectedIndexes.map((index) => letters.find((item) => item.index === index)?.char || '').join('');
  }, [letters, selectedIndexes]);
  const accuracy = attempts > 0 ? Math.round((correctCount / attempts) * 100) : 0;

  const selectWord = useCallback(() => {
    const cfg = LEVEL_CONFIG[currentLevel];
    const possibleLengths: number[] = [];
    for (let i = cfg.minLength; i <= cfg.maxLength; i++) {
      const pool = WORDS[gameLanguage][i];
      if (pool?.length) {
        possibleLengths.push(i);
      }
    }
    if (!possibleLengths.length) {
      return;
    }
    const length = possibleLengths[Math.floor(Math.random() * possibleLengths.length)];
    const pool = WORDS[gameLanguage][length];
    const word = pool[Math.floor(Math.random() * pool.length)];
    setCurrentWord(word);
    setLetters(createScrambledLetters(word));
    setSelectedIndexes([]);
    setStatus('idle');
    setTimeLeft(cfg.timeLimit);
  }, [currentLevel, gameLanguage]);

  const startGame = useCallback(() => {
    const cfg = LEVEL_CONFIG[0];
    setCurrentLevel(0);
    setScore(0);
    setLevelScore(0);
    setCorrectCount(0);
    setAttempts(0);
    setWordsDone(0);
    setTimeLeft(cfg.timeLimit);
    setStatus('idle');
    setShowResult(false);
    setGameFinished(false);
    setIsRunning(true);
  }, []);

  useEffect(() => {
    if (!isRunning || gameFinished) {
      return;
    }
    selectWord();
  }, [isRunning, currentLevel, gameLanguage, gameFinished, selectWord]);

  useEffect(() => {
    if (!isRunning || gameFinished || showResult) {
      return;
    }
    if (timeLeft <= 0) {
      setStatus('time');
      setAttempts((value) => value + 1);
      setWordsDone((value) => value + 1);
      setTimeout(() => {
        if (wordsDone + 1 >= config.wordsPerLevel) {
          setShowResult(true);
        } else {
          selectWord();
        }
      }, 650);
      return;
    }
    const timer = setTimeout(() => {
      setTimeLeft((value) => value - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, isRunning, gameFinished, showResult, wordsDone, config.wordsPerLevel, selectWord]);

  const finishRound = useCallback((isCorrect: boolean) => {
    if (!isRunning || showResult) return;
    setAttempts((value) => value + 1);
    setWordsDone((value) => value + 1);
    if (isCorrect) {
      setScore((value) => value + 15);
      setLevelScore((value) => value + 15);
      setCorrectCount((value) => value + 1);
      setStatus('correct');
    } else {
      setStatus('wrong');
    }
    setTimeout(() => {
      const nextWordsDone = wordsDone + 1;
      if (nextWordsDone >= config.wordsPerLevel) {
        setShowResult(true);
      } else {
        selectWord();
      }
    }, 700);
  }, [isRunning, showResult, wordsDone, config.wordsPerLevel, selectWord]);

  const handleLetterPress = useCallback((item: LetterItem) => {
    if (!isRunning || showResult || selectedIndexes.includes(item.index)) {
      return;
    }
    const nextSelected = [...selectedIndexes, item.index];
    setSelectedIndexes(nextSelected);
    const builtWord = nextSelected.map((index) => letters.find((letter) => letter.index === index)?.char || '').join('');
    if (builtWord.length === splitLetters(currentWord).length) {
      const isCorrect = normalizeWord(builtWord) === normalizeWord(currentWord);
      finishRound(isCorrect);
    }
  }, [isRunning, showResult, selectedIndexes, letters, currentWord, finishRound]);

  const resetCurrentWord = () => {
    if (!isRunning || showResult) return;
    setSelectedIndexes([]);
    setStatus('idle');
  };

  const changeLanguage = (language: GameLanguage) => {
    setGameLanguage(language);
    if (isRunning) {
      setCurrentLevel(0);
      setScore(0);
      setLevelScore(0);
      setCorrectCount(0);
      setAttempts(0);
      setWordsDone(0);
      setShowResult(false);
      setGameFinished(false);
    }
  };

  const reportGameResult = () => {
    saveGameResult({
      gameId: 'anologram',
      gameName: appLanguage === 'fa' ? 'آنولوگرام' : 'Anologram',
      timestamp: Date.now(),
      score,
      metrics: [
        {
          id: 'anologram_accuracy',
          label: appLanguage === 'fa' ? 'دقت' : 'Accuracy',
          value: accuracy,
          unit: '%',
        },
        {
          id: 'anologram_words_done',
          label: appLanguage === 'fa' ? 'کلمات کامل‌شده' : 'Words Completed',
          value: wordsDone,
        },
      ],
    });
  };

  const goNextLevel = () => {
    if (currentLevel >= LEVEL_CONFIG.length - 1) {
      setGameFinished(true);
      setShowResult(false);
      setIsRunning(false);
      reportGameResult();
      return;
    }
    const nextLevel = currentLevel + 1;
    const nextConfig = LEVEL_CONFIG[nextLevel];
    setCurrentLevel(nextLevel);
    setWordsDone(0);
    setLevelScore(0);
    setCorrectCount(0);
    setAttempts(0);
    setTimeLeft(nextConfig.timeLimit);
    setShowResult(false);
    setStatus('idle');
  };

  const finishGame = () => {
    setShowResult(false);
    setIsRunning(false);
    setGameFinished(true);
    reportGameResult();
  };

  const quitGame = () => {
    setIsRunning(false);
    setShowResult(false);
    setGameFinished(false);
    router.back();
  };

  const renderStat = (icon: React.ReactNode, label: string, value: string | number) => (
    <View style={[styles.statItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {icon}
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={quitGame}
          activeOpacity={0.8}
          style={[styles.backButton, { backgroundColor: colors.background, borderColor: colors.border }]}
          accessibilityRole="button"
          accessibilityLabel={t.back}
        >
          <ArrowLeft size={21} color={colors.text} strokeWidth={2.3} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <View style={[styles.titleIcon, { backgroundColor: `${colors.primary}18` }]}>
            <Layers3 size={20} color={colors.primary} strokeWidth={2} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>{t.title}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t.subtitle}</Text>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => changeLanguage(gameLanguage === 'fa' ? 'en' : 'fa')}
          style={[styles.languageButton, { backgroundColor: colors.background, borderColor: colors.border }]}
        >
          <Languages size={18} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.languageText, { color: colors.text }]}>
            {gameLanguage === 'fa' ? 'EN' : 'فا'}
          </Text>
        </TouchableOpacity>
      </View>

      {!isRunning && !gameFinished ? (
        <ScrollView
          contentContainerStyle={[styles.startContainer, { paddingHorizontal: width < 390 ? 18 : 24 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.heroIcon, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}30` }]}>
            <Sparkles size={44} color={colors.primary} strokeWidth={1.8} />
          </View>
          <Text style={[styles.readyTitle, { color: colors.text }]}>{t.ready}</Text>
          <Text style={[styles.readyDescription, { color: colors.textSecondary }]}>{t.readyDescription}</Text>
          <View style={[styles.languageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Languages size={21} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>{t.chooseLanguage}</Text>
            </View>
            <View style={styles.languageOptions}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => changeLanguage('fa')}
                style={[
                  styles.languageOption,
                  {
                    backgroundColor: gameLanguage === 'fa' ? `${colors.primary}18` : colors.background,
                    borderColor: gameLanguage === 'fa' ? colors.primary : colors.border,
                  }
                ]}
              >
                <Text style={[styles.languageOptionText, { color: gameLanguage === 'fa' ? colors.primary : colors.text }]}>
                  فارسی
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => changeLanguage('en')}
                style={[
                  styles.languageOption,
                  {
                    backgroundColor: gameLanguage === 'en' ? `${colors.primary}18` : colors.background,
                    borderColor: gameLanguage === 'en' ? colors.primary : colors.border,
                  }
                ]}
              >
                <Text style={[styles.languageOptionText, { color: gameLanguage === 'en' ? colors.primary : colors.text }]}>
                  English
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Clock3 size={19} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {LEVEL_CONFIG[0].timeLimit} ثانیه برای هر کلمه
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Trophy size={19} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                +15 امتیاز برای هر پاسخ درست
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Layers3 size={19} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {LEVEL_CONFIG.length} مرحله با سختی افزایشی
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={startGame}
            style={[styles.startButton, { backgroundColor: colors.primary }]}
          >
            <Play size={21} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.startButtonText}>{t.start}</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : gameFinished ? (
        <View style={styles.finalContainer}>
          <View style={[styles.finalIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Trophy size={48} color={colors.primary} strokeWidth={1.8} />
          </View>
          <Text style={[styles.finalTitle, { color: colors.text }]}>{t.allDone}</Text>
          <Text style={[styles.finalScoreLabel, { color: colors.textSecondary }]}>{t.totalScore}</Text>
          <Text style={[styles.finalScore, { color: colors.primary }]}>{score}</Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={startGame}
            style={[styles.startButton, { backgroundColor: colors.primary }]}
          >
            <RotateCcw size={20} color="#FFFFFF" />
            <Text style={styles.startButtonText}>{t.newGame}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gameContent}>
          <View style={styles.statsGrid}>
            {renderStat(<Trophy size={17} color={colors.primary} />, t.score, score)}
            {renderStat(<Layers3 size={17} color={colors.primary} />, t.level, currentLevel + 1)}
            {renderStat(
              <Clock3 size={17} color={timeLeft <= 3 ? '#EF4444' : colors.primary} />,
              t.time,
              `${timeLeft}s`
            )}
            {renderStat(<Flag size={17} color={colors.primary} />, t.remaining, Math.max(0, config.wordsPerLevel - wordsDone))}
          </View>
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                {t.level} {currentLevel + 1}
              </Text>
              <Text style={[styles.progressLabel, { color: colors.primary }]}>
                {wordsDone}/{config.wordsPerLevel}
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: colors.primary,
                    width: `${Math.min(100, (wordsDone / config.wordsPerLevel) * 100)}%`,
                  }
                ]}
              />
            </View>
          </View>
          <View style={[styles.wordCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t.scrambled}</Text>
            <Text
              style={[
                styles.scrambledWord,
                { color: colors.text, writingDirection: gameLanguage === 'fa' ? 'rtl' : 'ltr' }
              ]}
            >
              {letters.map((item) => item.char).join(' ')}
            </Text>
          </View>
          <View style={[styles.buildCard, { backgroundColor: `${colors.primary}0D`, borderColor: `${colors.primary}35` }]}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t.build}</Text>
            <Text
              style={[
                styles.buildWord,
                {
                  color: status === 'correct' ? '#22C55E' : status === 'wrong' ? '#EF4444' : colors.primary,
                  writingDirection: gameLanguage === 'fa' ? 'rtl' : 'ltr',
                }
              ]}
            >
              {selectedWord || '—'}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            {status === 'correct' ? <CheckCircle2 size={18} color="#22C55E" /> : null}
            {status === 'wrong' ? <XCircle size={18} color="#EF4444" /> : null}
            {status === 'time' ? <Clock3 size={18} color="#EF4444" /> : null}
            <Text
              style={[
                styles.statusText,
                {
                  color: status === 'correct' ? '#22C55E' : status === 'wrong' || status === 'time' ? '#EF4444' : colors.textSecondary,
                }
              ]}
            >
              {status === 'correct' ? t.correctMessage : status === 'wrong' ? t.wrongMessage : status === 'time' ? t.timeUp : t.instruction}
            </Text>
          </View>
          <View style={styles.lettersContainer}>
            {letters.map((item) => {
              const used = selectedIndexes.includes(item.index);
              return (
                <TouchableOpacity
                  key={`${item.index}-${item.char}`}
                  activeOpacity={0.75}
                  disabled={used || status !== 'idle'}
                  onPress={() => handleLetterPress(item)}
                  style={[
                    styles.letterButton,
                    {
                      width: width < 390 ? 50 : 56,
                      height: width < 390 ? 50 : 56,
                      backgroundColor: used ? colors.border : colors.surface,
                      borderColor: used ? colors.border : colors.primary,
                      opacity: used ? 0.35 : 1,
                    }
                  ]}
                >
                  <Text style={[styles.letterText, { color: used ? colors.textSecondary : colors.text }]}>
                    {item.char}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={resetCurrentWord}
            disabled={selectedIndexes.length === 0 || status !== 'idle'}
            style={[styles.resetButton, { borderColor: colors.border, opacity: selectedIndexes.length === 0 ? 0.4 : 1 }]}
          >
            <RotateCcw size={17} color={colors.textSecondary} />
            <Text style={[styles.resetText, { color: colors.textSecondary }]}>
              {gameLanguage === 'fa' ? 'پاک کردن انتخاب' : 'Clear selection'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal visible={showResult} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.modalIcon, { backgroundColor: `${colors.primary}15` }]}>
              <Trophy size={34} color={colors.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t.levelComplete}</Text>
            <View style={styles.resultGrid}>
              <View style={[styles.resultItem, { backgroundColor: colors.background }]}>
                <Text style={[styles.resultValue, { color: colors.primary }]}>
                  {wordsDone}/{config.wordsPerLevel}
                </Text>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>{t.wordsCompleted}</Text>
              </View>
              <View style={[styles.resultItem, { backgroundColor: colors.background }]}>
                <Text style={[styles.resultValue, { color: colors.primary }]}>{levelScore}</Text>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>{t.levelScore}</Text>
              </View>
              <View style={[styles.resultItem, { backgroundColor: colors.background }]}>
                <Text style={[styles.resultValue, { color: colors.primary }]}>{accuracy}%</Text>
                <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>{t.accuracy}</Text>
              </View>
            </View>
            <View style={styles.modalActions}>
              {currentLevel < LEVEL_CONFIG.length - 1 && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={goNextLevel}
                  style={[styles.modalPrimaryButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.modalPrimaryText}>{t.nextLevel}</Text>
                  <ChevronRight size={19} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={finishGame}
                style={[styles.modalSecondaryButton, { borderColor: colors.border }]}
              >
                <Flag size={18} color={colors.text} />
                <Text style={[styles.modalSecondaryText, { color: colors.text }]}>
                  {currentLevel >= LEVEL_CONFIG.length - 1 ? t.finish : t.exit}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    minHeight: 76,
    paddingHorizontal: 14,
    paddingTop: 60,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginRight: 10,
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  titleIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 9.5,
    marginTop: 1,
    textAlign: 'center',
  },
  languageButton: {
    height: 40,
    minWidth: 46,
    paddingHorizontal: 9,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  languageText: {
    fontSize: 12,
    fontWeight: '800',
  },
  startContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
    paddingBottom: 40,
  },
  heroIcon: {
    width: 94,
    height: 94,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  readyTitle: {
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  readyDescription: {
    maxWidth: 350,
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 26,
  },
  languageCard: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  languageOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  languageOption: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageOptionText: {
    fontSize: 14,
    fontWeight: '800',
  },
  infoCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    marginVertical: 7,
  },
  infoText: {
    flex: 1,
    fontSize: 12.5,
  },
  startButton: {
    width: '100%',
    maxWidth: 420,
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  gameContent: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    minHeight: 62,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  statLabel: {
    fontSize: 8.5,
    marginTop: 3,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '900',
    marginTop: 1,
  },
  progressSection: {
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 20,
  },
  wordCard: {
    minHeight: 130,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    marginBottom: 10,
  },
  buildCard: {
    minHeight: 105,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 9,
  },
  scrambledWord: {
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 3,
    textAlign: 'center',
  },
  buildWord: {
    minHeight: 40,
    fontSize: 25,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },
  statusContainer: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  lettersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  letterButton: {
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    fontSize: 19,
    fontWeight: '900',
  },
  resetButton: {
    alignSelf: 'center',
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 18,
  },
  resetText: {
    fontSize: 11,
    fontWeight: '700',
  },
  finalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  finalIcon: {
    width: 100,
    height: 100,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  finalTitle: {
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
  },
  finalScoreLabel: {
    fontSize: 13,
    marginTop: 20,
  },
  finalScore: {
    fontSize: 54,
    fontWeight: '900',
    marginBottom: 30,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
  },
  modalIcon: {
    width: 68,
    height: 68,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 18,
  },
  resultGrid: {
    width: '100%',
    flexDirection: 'row',
    gap: 7,
    marginBottom: 20,
  },
  resultItem: {
    flex: 1,
    minHeight: 76,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  resultValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  resultLabel: {
    fontSize: 8.5,
    textAlign: 'center',
    marginTop: 4,
  },
  modalActions: {
    width: '100%',
    gap: 9,
  },
  modalPrimaryButton: {
    minHeight: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  modalSecondaryButton: {
    minHeight: 48,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  modalSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
  },
});