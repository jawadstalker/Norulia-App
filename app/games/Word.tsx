import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Play,
  Settings,
  Trophy,
  Globe,
  Home,
  RotateCcw,
  X,
  Zap,
  Target,
  Layers,
  Award,
  Crown,
  ChevronRight,
  Volume2,
  VolumeX,
  Brain,
  Clock3,
  TrendingUp,
  Medal,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/* ============================================================
   COLORS - LUXURY PURPLE THEME
============================================================ */

const LUXURY = {
  background: '#100D16',
  surface: '#181421',
  surface2: '#211A2C',
  surface3: '#2A2137',

  border: 'rgba(196, 150, 255, 0.10)',
  borderStrong: 'rgba(196, 150, 255, 0.18)',

  text: '#F7F3FC',
  textSecondary: '#B8AFC4',
  textMuted: '#81768D',

  // Purple/Violet theme
  gold: '#9B6DFF',
  goldLight: '#C4A3FF',
  goldDark: '#6842B5',

  success: '#6ED5A0',
  danger: '#E87979',

  white: '#FFFFFF',
};

/* ============================================================
   WORD DATABASE
============================================================ */

const ENGLISH_WORDS = {
  easy: ['APPLE', 'BOOK', 'CAT', 'DOG', 'FISH', 'BIRD', 'TREE', 'STAR', 'MOON', 'SUN'],
  medium: ['TREE', 'RIVER', 'HAPPINESS', 'SKY', 'OCEAN', 'MOUNTAIN', 'FOREST', 'BUTTERFLY'],
  hard: ['GALAXY', 'BIOLOGY', 'ARCHITECTURE', 'ASTRONOMY', 'PSYCHOLOGY', 'PHILOSOPHY'],
};

const PERSIAN_WORDS = {
  easy: ['سیب', 'سگ', 'گل', 'ماه', 'کتاب', 'گربه', 'پرنده', 'ماهی'],
  medium: ['درخت', 'رودخانه', 'شادی', 'آسمان', 'اقیانوس', 'کوه', 'جنگل', 'پروانه'],
  hard: ['کهکشان', 'زیست‌شناسی', 'معماری', 'ستاره‌شناسی', 'روانشناسی', 'فلسفه'],
};

/* ============================================================
   CONSTANTS
============================================================ */

const CONSTANTS = {
  BASE_SCORE: 10,
  BONUS_BASE: 20,
  BONUS_INCREMENT: 5,
  EXTRA_OPTIONS: 4,
  DISPLAY_TIMES: { easy: 1200, medium: 1000, hard: 700 },
  START_LENGTHS: { easy: 3, medium: 5, hard: 7 },
  BONUS_MULTIPLIERS: { easy: 1, medium: 1.25, hard: 1.5 },
  RT_THRESHOLDS: { excellent: 400, normal: 700, slow: 1000 },
};

/* ============================================================
   HELPERS
============================================================ */

const shuffleArray = <T,>(array: T[]) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

/* ============================================================
   COMPONENT
============================================================ */

export default function WordSequenceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { language, isRTL } = useLanguage();

  const [currentScreen, setCurrentScreen] = useState<
    'menu' | 'settings' | 'records' | 'game'
  >('menu');

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameMode, setGameMode] = useState<'forward' | 'backward'>('forward');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Game state
  const [gameScore, setGameScore] = useState(0);
  const [gameLevel, setGameLevel] = useState(1);
  const [gameLength, setGameLength] = useState(3);
  const [gameSequence, setGameSequence] = useState<string[]>([]);
  const [gamePlayerIndex, setGamePlayerIndex] = useState(0);
  const [gameIsPlaying, setGameIsPlaying] = useState(false);
  const [gameIsOver, setGameIsOver] = useState(false);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameStatus, setGameStatus] = useState('');
  const [gameStatusColor, setGameStatusColor] = useState(LUXURY.textSecondary);
  const [gridWords, setGridWords] = useState<string[]>([]);
  const [wordHistory, setWordHistory] = useState<string[]>([]);
  const [gameCorrectCount, setGameCorrectCount] = useState(0);
  const [gameTotalAttempts, setGameTotalAttempts] = useState(0);
  const [gameReactionTimes, setGameReactionTimes] = useState<number[]>([]);
  const [currentRoundRTs, setCurrentRoundRTs] = useState<number[]>([]);
  const [averageRT, setAverageRT] = useState(0);
  const [displayWord, setDisplayWord] = useState('');
  const [displayWordClass, setDisplayWordClass] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const [wordButtonsEnabled, setWordButtonsEnabled] = useState(false);

  // Records
  const [highScore, setHighScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [bestLevel, setBestLevel] = useState(1);
  const [bestAccuracy, setBestAccuracy] = useState(0);
  const [bestRT, setBestRT] = useState<number | null>(null);

  // Result
  const [modalVisible, setModalVisible] = useState(false);
  const [newRecord, setNewRecord] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalLevel, setFinalLevel] = useState(1);
  const [finalAccuracy, setFinalAccuracy] = useState(0);
  const [finalRT, setFinalRT] = useState(0);

  // Refs
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastReactionStartTime = useRef(0);
  
  // 🔥 CRITICAL FIX: Use refs to avoid closure issues
  const gameRunningRef = useRef(false);
  const gameIsOverRef = useRef(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const resultScaleAnim = useRef(new Animated.Value(0.85)).current;

  /* ============================================================
     HELPERS
  ============================================================ */

  const getWordBank = () => {
    try {
      if (language === 'en') {
        return ENGLISH_WORDS[difficulty] || ENGLISH_WORDS.medium;
      }
      return PERSIAN_WORDS[difficulty] || PERSIAN_WORDS.medium;
    } catch (error) {
      console.error('Error getting word bank:', error);
      return language === 'en' ? ENGLISH_WORDS.medium : PERSIAN_WORDS.medium;
    }
  };

  const getDisplayTime = () => CONSTANTS.DISPLAY_TIMES[difficulty];
  const getStartLength = () => CONSTANTS.START_LENGTHS[difficulty];
  const getMaxSequenceLength = () => {
    if (difficulty === 'easy') return 8;
    if (difficulty === 'hard') return 12;
    return 10;
  };
  const getBonusMultiplier = () => CONSTANTS.BONUS_MULTIPLIERS[difficulty];

  const getBonusForLevel = (level: number) => {
    const base = CONSTANTS.BONUS_BASE + (level - 1) * CONSTANTS.BONUS_INCREMENT;
    return Math.round(base * getBonusMultiplier());
  };

  const getRTInterpretation = (rt: number) => {
    if (isRTL) {
      if (rt < CONSTANTS.RT_THRESHOLDS.excellent) return 'عملکرد عالی';
      if (rt < CONSTANTS.RT_THRESHOLDS.normal) return 'عملکرد طبیعی';
      if (rt < CONSTANTS.RT_THRESHOLDS.slow) return 'نیازمند تمرکز بیشتر';
      return 'سرعت واکنش پایین';
    }
    if (rt < CONSTANTS.RT_THRESHOLDS.excellent) return 'Excellent Performance';
    if (rt < CONSTANTS.RT_THRESHOLDS.normal) return 'Normal Performance';
    if (rt < CONSTANTS.RT_THRESHOLDS.slow) return 'Needs More Focus';
    return 'Slow Reaction Speed';
  };

  const playSound = (type: 'correct' | 'wrong' | 'levelup' | 'gameover') => {
    if (!soundEnabled) return;
    try {
      console.log(`🎵 Sound: ${type}`);
    } catch (error) {
      console.error('Sound error:', error);
    }
  };

  /* ============================================================
     TIMEOUTS
  ============================================================ */

  const clearGameTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  const addTimeout = (callback: () => void, delay: number) => {
    const timeout = setTimeout(callback, delay);
    timeoutsRef.current.push(timeout);
    return timeout;
  };

  /* ============================================================
     NAVIGATION - FIXED
  ============================================================ */

  const goBack = () => {
    // If not on main menu, go to menu first
    if (currentScreen !== 'menu') {
      setCurrentScreen('menu');
      return;
    }

    // If game is running, ask for confirmation
    if (gameRunningRef.current) {
      Alert.alert(
        isRTL ? 'خروج از بازی' : 'Exit Game',
        isRTL ? 'آیا مطمئن هستید که می‌خواهید از بازی خارج شوید؟' : 'Are you sure you want to exit the game?',
        [
          { text: isRTL ? 'انصراف' : 'Cancel', style: 'cancel' },
          {
            text: isRTL ? 'خروج' : 'Exit',
            style: 'destructive',
            onPress: () => {
              stopGame();
              if (router.canGoBack()) {
                router.back();
              }
            },
          },
        ]
      );
      return;
    }

    // Go back using router
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleBack = () => {
    if (currentScreen === 'game' && gameRunningRef.current) {
      Alert.alert(
        isRTL ? 'خروج از بازی' : 'Exit Game',
        isRTL ? 'آیا مطمئن هستید که می‌خواهید از بازی خارج شوید؟' : 'Are you sure you want to exit the game?',
        [
          { text: isRTL ? 'انصراف' : 'Cancel', style: 'cancel' },
          {
            text: isRTL ? 'خروج' : 'Exit',
            style: 'destructive',
            onPress: () => {
              stopGame();
              setCurrentScreen('menu');
            },
          },
        ]
      );
      return;
    }

    if (currentScreen === 'settings' || currentScreen === 'records') {
      setCurrentScreen('menu');
      return;
    }

    goBack();
  };

  /* ============================================================
     GAME - FIXED
  ============================================================ */

  const startReactionTimer = () => {
    lastReactionStartTime.current = performance.now();
  };

  const stopReactionTimer = () => {
    if (!lastReactionStartTime.current) return 0;
    const result = performance.now() - lastReactionStartTime.current;
    lastReactionStartTime.current = 0;
    return result;
  };

  // 🔥 FIXED: Proper average calculation
  const recordReactionTime = (rt: number) => {
    if (rt <= 0 || rt > 10000) return;

    setGameReactionTimes(prev => {
      const next = [...prev, rt];
      const average = next.reduce((sum, value) => sum + value, 0) / next.length;
      setAverageRT(average);
      return next;
    });

    setCurrentRoundRTs(prev => [...prev, rt]);
  };

  // 🔥 FIXED: Start game with proper refs
  const startGame = () => {
    try {
      clearGameTimeouts();

      // Set refs BEFORE anything else
      gameRunningRef.current = true;
      gameIsOverRef.current = false;

      setGameScore(0);
      setGameLevel(1);
      setGameLength(getStartLength());
      setGameSequence([]);
      setGamePlayerIndex(0);
      setGameRunning(true);
      setGameIsOver(false);
      setGameIsPlaying(false);
      setGameCorrectCount(0);
      setGameTotalAttempts(0);
      setWordHistory([]);
      setGameReactionTimes([]);
      setCurrentRoundRTs([]);
      setAverageRT(0);
      setWordButtonsEnabled(false);
      setModalVisible(false);
      setCurrentScreen('game');

      fadeAnim.setValue(0);
      scaleAnim.setValue(0.96);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      setGameStatus(
        isRTL ? 'دنباله را با دقت دنبال کن' : 'Follow the sequence carefully'
      );

      addTimeout(() => {
        startRound();
      }, 350);

      setGamesPlayed(prev => prev + 1);
    } catch (error) {
      console.error('Error starting game:', error);
      Alert.alert(
        isRTL ? 'خطا' : 'Error',
        isRTL ? 'مشکلی در شروع بازی رخ داد' : 'An error occurred while starting the game'
      );
    }
  };

  // 🔥 FIXED: Check refs instead of state
  const startRound = () => {
    if (!gameRunningRef.current || gameIsOverRef.current) {
      return;
    }

    try {
      const maxLength = getMaxSequenceLength();
      const length = Math.min(gameLength, maxLength);
      const bank = getWordBank();

      if (!bank || bank.length === 0) {
        throw new Error('Word bank is empty');
      }

      let available = bank.filter(word => !wordHistory.includes(word));

      if (available.length < length) {
        available = [...bank];
        setWordHistory([]);
      }

      const sequence = shuffleArray(available).slice(0, length);

      if (sequence.length < length) {
        throw new Error('Not enough words available');
      }

      const extras = shuffleArray(
        bank.filter(word => !sequence.includes(word))
      ).slice(0, CONSTANTS.EXTRA_OPTIONS);

      const finalGrid = shuffleArray([...sequence, ...extras]);

      setGameSequence(sequence);
      setWordHistory(prev => [...prev, ...sequence].slice(-30));
      setGridWords(finalGrid);
      setGamePlayerIndex(0);
      setDisplayWord('');
      setDisplayWordClass('');
      setWordButtonsEnabled(false);

      setGameStatus(
        isRTL ? 'دنباله را به خاطر بسپار' : 'Remember the sequence'
      );
      setGameStatusColor(LUXURY.textSecondary);

      setShowLoading(true);

      addTimeout(() => {
        if (!gameRunningRef.current || gameIsOverRef.current) {
          return;
        }
        setShowLoading(false);
        showSequence(0, sequence);
      }, 350);
    } catch (error) {
      console.error('Error starting round:', error);
      gameOver();
    }
  };

  // 🔥 FIXED: Check refs instead of state
  const showSequence = (index: number, sequence: string[]) => {
    if (!gameRunningRef.current || gameIsOverRef.current) {
      return;
    }

    if (index >= sequence.length) {
      setGameIsPlaying(true);
      setGameStatus(
        gameMode === 'forward'
          ? isRTL
            ? 'حالا کلمات را به همان ترتیب انتخاب کن'
            : 'Now select the words in the same order'
          : isRTL
          ? 'حالا کلمات را برعکس انتخاب کن'
          : 'Now select the words in reverse order'
      );
      setGameStatusColor(LUXURY.gold);
      setDisplayWord('');
      setWordButtonsEnabled(true);
      startReactionTimer();
      return;
    }

    const word = sequence[index];
    setDisplayWord(word);
    setDisplayWordClass('showing');

    const displayTime = getDisplayTime();

    addTimeout(() => {
      if (!gameRunningRef.current || gameIsOverRef.current) {
        return;
      }
      setDisplayWordClass('hiding');
    }, displayTime * 0.8);

    addTimeout(() => {
      showSequence(index + 1, sequence);
    }, displayTime);
  };

  const handleWordClick = (word: string) => {
    if (!gameRunningRef.current || gameIsOverRef.current || !gameIsPlaying) {
      return;
    }

    const rt = stopReactionTimer();
    if (rt > 0) {
      recordReactionTime(rt);
    }

    const expectedIndex = gameMode === 'forward'
      ? gamePlayerIndex
      : gameSequence.length - 1 - gamePlayerIndex;

    const correctWord = gameSequence[expectedIndex];

    if (word === correctWord) {
      // Correct
      const newIndex = gamePlayerIndex + 1;
      setGamePlayerIndex(newIndex);

      const scoreGain = Math.round(CONSTANTS.BASE_SCORE * getBonusMultiplier());
      setGameScore(prev => prev + scoreGain);
      setGameCorrectCount(prev => prev + 1);
      setGameTotalAttempts(prev => prev + 1);

      setGridWords(prev =>
        prev.map(item => item === word ? `✓${item}` : item)
      );

      setDisplayWord(word);
      setDisplayWordClass('correct-feedback');
      setGameStatus(isRTL ? `درست  •  +${scoreGain}` : `Correct  •  +${scoreGain}`);
      setGameStatusColor(LUXURY.success);

      playSound('correct');

      if (newIndex >= gameSequence.length) {
        // Level complete
        setGameIsPlaying(false);
        setWordButtonsEnabled(false);

        const bonus = getBonusForLevel(gameLevel);
        setGameScore(prev => prev + bonus);

        setGameStatus(
          isRTL ? `مرحله بعد  •  پاداش +${bonus}` : `Next Level  •  Bonus +${bonus}`
        );
        setGameStatusColor(LUXURY.gold);

        playSound('levelup');

        const newLength = Math.min(gameLength + 1, getMaxSequenceLength());
        setGameLevel(prev => prev + 1);
        setGameLength(newLength);

        addTimeout(() => {
          if (gameRunningRef.current && !gameIsOverRef.current) {
            startRound();
          }
        }, 1200);
      } else {
        startReactionTimer();
      }

      return;
    }

    // Wrong
    setGameTotalAttempts(prev => prev + 1);

    setGridWords(prev =>
      prev.map(item => item === word ? `✗${item}` : item)
    );

    setDisplayWord(word);
    setDisplayWordClass('wrong-feedback');
    setGameStatus(isRTL ? 'انتخاب اشتباه بود' : 'Wrong selection');
    setGameStatusColor(LUXURY.danger);

    playSound('wrong');

    setGameIsPlaying(false);
    setWordButtonsEnabled(false);

    addTimeout(() => {
      gameOver();
    }, 650);
  };

  // 🔥 FIXED: Proper game over
  const gameOver = () => {
    gameRunningRef.current = false;
    gameIsOverRef.current = true;

    setGameRunning(false);
    setGameIsOver(true);
    setGameIsPlaying(false);
    setWordButtonsEnabled(false);

    clearGameTimeouts();

    const accuracy = gameTotalAttempts > 0
      ? Math.round((gameCorrectCount / gameTotalAttempts) * 100)
      : 0;

    const avgRT = gameReactionTimes.length
      ? Math.round(gameReactionTimes.reduce((sum, value) => sum + value, 0) / gameReactionTimes.length)
      : 0;

    setFinalScore(gameScore);
    setFinalLevel(gameLevel);
    setFinalAccuracy(accuracy);
    setFinalRT(avgRT);

    playSound('gameover');

    let record = false;

    if (gameScore > highScore) {
      setHighScore(gameScore);
      record = true;
    }

    if (gameLevel > bestLevel) {
      setBestLevel(gameLevel);
      record = true;
    }

    if (accuracy > bestAccuracy) {
      setBestAccuracy(accuracy);
      record = true;
    }

    if (avgRT > 0 && (bestRT === null || avgRT < bestRT)) {
      setBestRT(avgRT);
      record = true;
    }

    setNewRecord(record);
    setModalVisible(true);

    resultScaleAnim.setValue(0.85);
    Animated.spring(resultScaleAnim, {
      toValue: 1,
      friction: 7,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  // 🔥 FIXED: Proper stop
  const stopGame = () => {
    clearGameTimeouts();
    gameRunningRef.current = false;
    gameIsOverRef.current = true;
    setGameRunning(false);
    setGameIsOver(true);
    setGameIsPlaying(false);
    setWordButtonsEnabled(false);
    setDisplayWord('');
  };

  const restartGame = () => {
    setModalVisible(false);
    addTimeout(() => {
      startGame();
    }, 100);
  };

  /* ============================================================
     MENU BUTTON
  ============================================================ */

  const MenuButton = ({
    icon,
    title,
    subtitle,
    onPress,
    primary = false,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress: () => void;
    primary?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={[
        styles.menuButton,
        primary && styles.menuButtonPrimary,
      ]}
    >
      <View style={[styles.menuIcon, primary && styles.menuIconPrimary]}>
        {icon}
      </View>

      <View style={styles.menuText}>
        <Text style={[styles.menuTitle, primary && styles.menuTitlePrimary]}>
          {title}
        </Text>

        {subtitle && (
          <Text style={styles.menuSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>

      <ChevronRight
        size={18}
        color={primary ? LUXURY.gold : LUXURY.textMuted}
        style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
      />
    </TouchableOpacity>
  );

  /* ============================================================
     STAT CARD
  ============================================================ */

  const StatCard = ({
    icon,
    label,
    value,
    large = false,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    large?: boolean;
  }) => (
    <View style={[styles.statCard, large && styles.statCardLarge]}>
      <View style={styles.statIcon}>
        {icon}
      </View>

      <Text style={styles.statLabel}>
        {label}
      </Text>

      <Text style={[styles.statValue, large && styles.statValueLarge]}>
        {value}
      </Text>
    </View>
  );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <View style={[styles.container, { backgroundColor: colors?.background || LUXURY.background }]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.headerButton}
          activeOpacity={0.8}
        >
          <ArrowLeft
            size={20}
            color={LUXURY.text}
            style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {currentScreen === 'menu'
            ? (isRTL ? 'توالی کلمات' : 'Word Sequence')
            : currentScreen === 'settings'
            ? (isRTL ? 'تنظیمات' : 'Settings')
            : currentScreen === 'records'
            ? (isRTL ? 'رکوردها' : 'Records')
            : (isRTL ? 'بازی' : 'Game')}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* MENU */}
      {currentScreen === 'menu' && (
        <ScrollView
          contentContainerStyle={styles.menuContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandSection}>
            <View style={styles.brandMark}>
              <Brain size={34} color={LUXURY.gold} strokeWidth={1.5} />
            </View>

            <Text style={styles.brandTitle}>
              {isRTL ? 'توالی کلمات' : 'Word Sequence'}
            </Text>

            <Text style={styles.brandSubtitle}>
              {isRTL ? 'تمرکز بیشتر، حافظه قوی‌تر' : 'More Focus, Stronger Memory'}
            </Text>
          </View>

          <View style={styles.menuButtons}>
            <MenuButton
              primary
              icon={<Play size={20} color={LUXURY.background} fill={LUXURY.background} />}
              title={isRTL ? 'شروع بازی' : 'Start Game'}
              subtitle={isRTL ? 'آزمون حافظه و سرعت واکنش' : 'Memory & Reaction Speed Test'}
              onPress={startGame}
            />

            <MenuButton
              icon={<Settings size={20} color={LUXURY.gold} />}
              title={isRTL ? 'تنظیمات' : 'Settings'}
              subtitle={isRTL ? 'سطح، حالت بازی و صدا' : 'Level, Game Mode & Sound'}
              onPress={() => setCurrentScreen('settings')}
            />

            <MenuButton
              icon={<Trophy size={20} color={LUXURY.gold} />}
              title={isRTL ? 'رکوردها' : 'Records'}
              subtitle={isRTL ? 'بهترین عملکردهای شما' : 'Your Best Performances'}
              onPress={() => setCurrentScreen('records')}
            />

            <MenuButton
              icon={<Globe size={20} color={LUXURY.gold} />}
              title={language === 'fa' ? 'English' : 'فارسی'}
              subtitle={isRTL ? 'تغییر زبان بازی' : 'Change Game Language'}
              onPress={() => {}}
            />

            <MenuButton
              icon={<Home size={20} color={LUXURY.gold} />}
              title={isRTL ? 'بازگشت' : 'Go Back'}
              subtitle={isRTL ? 'بازگشت به ماژول‌ها' : 'Back to Modules'}
              onPress={goBack}
            />
          </View>

          <View style={styles.menuFooter}>
            <View style={styles.footerLine} />
            <Text style={styles.footerText}>MEMORY • FOCUS • SPEED</Text>
          </View>
        </ScrollView>
      )}

      {/* SETTINGS */}
      {currentScreen === 'settings' && (
        <ScrollView
          contentContainerStyle={styles.pageContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {isRTL ? 'تنظیمات بازی' : 'Game Settings'}
          </Text>

          <View style={styles.settingsCard}>
            <Text style={[styles.settingsLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL ? 'سطح دشواری' : 'Difficulty Level'}
            </Text>

            <View style={[styles.optionsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {(['easy', 'medium', 'hard'] as const).map(level => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setDifficulty(level)}
                  style={[styles.option, difficulty === level && styles.optionActive]}
                >
                  <Text style={[styles.optionTitle, difficulty === level && styles.optionTitleActive]}>
                    {level === 'easy'
                      ? (isRTL ? 'آسان' : 'Easy')
                      : level === 'medium'
                      ? (isRTL ? 'متوسط' : 'Medium')
                      : (isRTL ? 'سخت' : 'Hard')}
                  </Text>
                  <Text style={styles.optionDescription}>
                    {level === 'easy'
                      ? (isRTL ? 'شروع ۳' : 'Start 3')
                      : level === 'medium'
                      ? (isRTL ? 'شروع ۵' : 'Start 5')
                      : (isRTL ? 'شروع ۷' : 'Start 7')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingsCard}>
            <View style={[styles.settingsHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                <Text style={[styles.settingsLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {isRTL ? 'صدا' : 'Sound'}
                </Text>
                <Text style={[styles.settingsDescription, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {isRTL ? 'بازخورد صوتی بازی' : 'Game Sound Feedback'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setSoundEnabled(!soundEnabled)}
                style={[styles.toggle, soundEnabled && styles.toggleActive]}
              >
                <View style={[styles.toggleThumb, soundEnabled && styles.toggleThumbActive]} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingsCard}>
            <Text style={[styles.settingsLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL ? 'حالت بازی' : 'Game Mode'}
            </Text>

            <View style={[styles.modeContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                onPress={() => setGameMode('forward')}
                style={[
                  styles.modeButton,
                  gameMode === 'forward' && styles.modeButtonActive,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' }
                ]}
              >
                <TrendingUp size={19} color={gameMode === 'forward' ? LUXURY.gold : LUXURY.textMuted} />
                <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                  <Text style={[styles.modeTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? 'پیش‌رو' : 'Forward'}
                  </Text>
                  <Text style={[styles.modeDescription, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? 'همان ترتیب' : 'Same Order'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setGameMode('backward')}
                style={[
                  styles.modeButton,
                  gameMode === 'backward' && styles.modeButtonActive,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' }
                ]}
              >
                <Layers size={19} color={gameMode === 'backward' ? LUXURY.gold : LUXURY.textMuted} />
                <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                  <Text style={[styles.modeTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? 'معکوس' : 'Backward'}
                  </Text>
                  <Text style={[styles.modeDescription, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL ? 'ترتیب برعکس' : 'Reverse Order'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setCurrentScreen('menu')}
            style={styles.goldButton}
          >
            <Text style={styles.goldButtonText}>
              {isRTL ? 'ذخیره تنظیمات' : 'Save Settings'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* RECORDS */}
      {currentScreen === 'records' && (
        <ScrollView
          contentContainerStyle={styles.pageContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.recordsHero}>
            <View style={styles.recordsHeroIcon}>
              <Crown size={30} color={LUXURY.gold} />
            </View>

            <Text style={styles.recordsHeroTitle}>
              {isRTL ? 'رکوردهای شخصی' : 'Personal Records'}
            </Text>

            <Text style={styles.recordsHeroSubtitle}>
              {isRTL ? 'بهترین عملکردهای ثبت‌شده' : 'Best Recorded Performances'}
            </Text>
          </View>

          <View style={styles.recordsGrid}>
            <StatCard
              large
              icon={<Trophy size={21} color={LUXURY.gold} />}
              label={isRTL ? 'بهترین امتیاز' : 'Best Score'}
              value={highScore}
            />

            <StatCard
              icon={<TrendingUp size={21} color={LUXURY.gold} />}
              label={isRTL ? 'بهترین مرحله' : 'Best Level'}
              value={bestLevel}
            />

            <StatCard
              icon={<Target size={21} color={LUXURY.gold} />}
              label={isRTL ? 'بهترین دقت' : 'Best Accuracy'}
              value={`${bestAccuracy}%`}
            />

            <StatCard
              icon={<Zap size={21} color={LUXURY.gold} />}
              label={isRTL ? 'بهترین واکنش' : 'Best Reaction'}
              value={bestRT ? `${Math.round(bestRT)} ms` : '--'}
            />

            <StatCard
              icon={<Medal size={21} color={LUXURY.gold} />}
              label={isRTL ? 'تعداد بازی' : 'Games Played'}
              value={gamesPlayed}
            />
          </View>
        </ScrollView>
      )}

      {/* GAME */}
      {currentScreen === 'game' && (
        <Animated.View
          style={[
            styles.gameContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={[styles.gameTopBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={styles.gameMetric}>
              <Text style={styles.gameMetricLabel}>{isRTL ? 'امتیاز' : 'Score'}</Text>
              <Text style={styles.gameMetricValue}>{gameScore}</Text>
            </View>

            <View style={styles.gameMetric}>
              <Text style={styles.gameMetricLabel}>{isRTL ? 'مرحله' : 'Level'}</Text>
              <Text style={styles.gameMetricValue}>{gameLevel}</Text>
            </View>

            <View style={styles.gameMetric}>
              <Text style={styles.gameMetricLabel}>{isRTL ? 'طول' : 'Length'}</Text>
              <Text style={styles.gameMetricValue}>{gameLength}</Text>
            </View>

            <View style={styles.gameMetric}>
              <Text style={styles.gameMetricLabel}>{isRTL ? 'واکنش' : 'Reaction'}</Text>
              <Text style={styles.gameMetricValue}>
                {averageRT ? `${Math.round(averageRT)}ms` : '--'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  isRTL ? 'خروج از بازی' : 'Exit Game',
                  isRTL ? 'آیا مطمئن هستید؟' : 'Are you sure?',
                  [
                    { text: isRTL ? 'انصراف' : 'Cancel', style: 'cancel' },
                    {
                      text: isRTL ? 'خروج' : 'Exit',
                      style: 'destructive',
                      onPress: () => {
                        stopGame();
                        setCurrentScreen('menu');
                      },
                    },
                  ]
                );
              }}
              style={styles.closeButton}
            >
              <X size={19} color={LUXURY.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.gameStatusContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.statusDot, { backgroundColor: gameStatusColor }]} />
            <Text style={[styles.gameStatus, { color: gameStatusColor }]}>{gameStatus}</Text>
          </View>

          <View style={styles.wordDisplay}>
            {showLoading ? (
              <View style={styles.loadingContainer}>
                <View style={styles.loadingRing} />
              </View>
            ) : (
              <>
                <Text style={styles.wordDisplayLabel}>MEMORY SEQUENCE</Text>
                <Text
                  style={[
                    styles.wordText,
                    displayWordClass === 'correct-feedback' && styles.wordCorrect,
                    displayWordClass === 'wrong-feedback' && styles.wordWrong,
                  ]}
                >
                  {displayWord}
                </Text>
              </>
            )}
          </View>

          <View style={[styles.wordGrid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {gridWords.map((word, index) => {
              const isCorrect = word.startsWith('✓');
              const isWrong = word.startsWith('✗');
              const cleanWord = word.replace(/^[✓✗]/, '');

              return (
                <TouchableOpacity
                  key={`${word}-${index}`}
                  onPress={() => handleWordClick(cleanWord)}
                  disabled={!wordButtonsEnabled || isCorrect || isWrong}
                  activeOpacity={0.75}
                  style={[
                    styles.wordButton,
                    isCorrect && styles.wordButtonCorrect,
                    isWrong && styles.wordButtonWrong,
                    !wordButtonsEnabled && !isCorrect && !isWrong && styles.wordButtonDisabled,
                  ]}
                >
                  {isCorrect ? <Target size={15} color={LUXURY.success} /> : null}
                  {isWrong ? <X size={15} color={LUXURY.danger} /> : null}
                  <Text
                    style={[
                      styles.wordButtonText,
                      isCorrect && styles.wordTextCorrect,
                      isWrong && styles.wordTextWrong,
                    ]}
                  >
                    {cleanWord}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.gameBottom, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              style={[styles.bottomButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              onPress={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <Volume2 size={16} color={LUXURY.textSecondary} />
              ) : (
                <VolumeX size={16} color={LUXURY.textMuted} />
              )}
              <Text style={styles.bottomButtonText}>{isRTL ? 'صدا' : 'Sound'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bottomButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              onPress={() => {
                stopGame();
                setCurrentScreen('menu');
              }}
            >
              <Home size={16} color={LUXURY.textSecondary} />
              <Text style={styles.bottomButtonText}>{isRTL ? 'منو' : 'Menu'}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* RESULT MODAL */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback>
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.resultCard,
                {
                  transform: [{ scale: resultScaleAnim }],
                },
              ]}
            >
              <View style={styles.resultHeader}>
                <View style={[styles.resultIcon, newRecord && styles.resultIconGold]}>
                  {newRecord ? <Crown size={30} color={LUXURY.gold} /> : <Award size={30} color={LUXURY.gold} />}
                </View>

                <Text style={styles.resultEyebrow}>
                  {newRecord
                    ? (isRTL ? 'رکورد جدید شخصی' : 'NEW PERSONAL RECORD')
                    : (isRTL ? 'پایان جلسه' : 'SESSION COMPLETE')}
                </Text>

                <Text style={styles.resultTitle}>
                  {newRecord
                    ? (isRTL ? 'رکورد جدید' : 'New Record')
                    : (isRTL ? 'بازی تمام شد' : 'Game Over')}
                </Text>
              </View>

              <View style={styles.finalScoreContainer}>
                <Text style={styles.finalScoreLabel}>{isRTL ? 'امتیاز نهایی' : 'Final Score'}</Text>
                <Text style={styles.finalScore}>{finalScore}</Text>
                <View style={styles.scoreDivider} />
              </View>

              <View style={[styles.resultStats, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={styles.resultStat}>
                  <TrendingUp size={18} color={LUXURY.gold} />
                  <Text style={styles.resultStatLabel}>{isRTL ? 'مرحله' : 'Level'}</Text>
                  <Text style={styles.resultStatValue}>{finalLevel}</Text>
                </View>

                <View style={styles.resultStat}>
                  <Target size={18} color={LUXURY.gold} />
                  <Text style={styles.resultStatLabel}>{isRTL ? 'دقت' : 'Accuracy'}</Text>
                  <Text style={styles.resultStatValue}>{finalAccuracy}%</Text>
                </View>

                <View style={styles.resultStat}>
                  <Clock3 size={18} color={LUXURY.gold} />
                  <Text style={styles.resultStatLabel}>{isRTL ? 'واکنش' : 'Reaction'}</Text>
                  <Text style={styles.resultStatValue}>{finalRT ? `${finalRT} ms` : '--'}</Text>
                </View>
              </View>

              {finalRT > 0 && (
                <View style={[styles.performanceBadge, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Zap size={14} color={LUXURY.gold} />
                  <Text style={styles.performanceText}>{getRTInterpretation(finalRT)}</Text>
                </View>
              )}

              <View style={styles.resultActions}>
                <TouchableOpacity
                  onPress={restartGame}
                  activeOpacity={0.8}
                  style={[styles.resultPrimaryButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                >
                  <RotateCcw size={18} color={LUXURY.background} />
                  <Text style={styles.resultPrimaryText}>{isRTL ? 'دوباره بازی کن' : 'Play Again'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    setCurrentScreen('menu');
                  }}
                  activeOpacity={0.8}
                  style={[styles.resultSecondaryButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                >
                  <Home size={18} color={LUXURY.textSecondary} />
                  <Text style={styles.resultSecondaryText}>{isRTL ? 'بازگشت به منو' : 'Back to Menu'}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

/* ============================================================
   STYLES - LUXURY PURPLE THEME
============================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LUXURY.background,
  },

  header: {
    height: 72,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LUXURY.surface,
    borderWidth: 1,
    borderColor: LUXURY.border,
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: LUXURY.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  headerSpacer: {
    width: 42,
  },

  menuContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 35,
  },

  brandSection: {
    alignItems: 'center',
    paddingTop: 42,
    paddingBottom: 38,
  },

  brandMark: {
    width: 76,
    height: 76,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(155,109,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(155,109,255,0.25)',
    marginBottom: 20,
  },

  brandTitle: {
    color: LUXURY.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
  },

  brandSubtitle: {
    marginTop: 8,
    color: LUXURY.textSecondary,
    fontSize: 13,
  },

  menuButtons: {
    gap: 10,
  },

  menuButton: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: LUXURY.surface,
    borderWidth: 1,
    borderColor: LUXURY.border,
  },

  menuButtonPrimary: {
    backgroundColor: LUXURY.gold,
    borderColor: LUXURY.gold,
    shadowColor: LUXURY.gold,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 5,
  },

  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LUXURY.surface2,
    borderWidth: 1,
    borderColor: LUXURY.border,
  },

  menuIconPrimary: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderColor: 'rgba(0,0,0,0.08)',
  },

  menuText: {
    flex: 1,
    marginHorizontal: 14,
  },

  menuTitle: {
    color: LUXURY.text,
    fontSize: 15,
    fontWeight: '700',
  },

  menuTitlePrimary: {
    color: LUXURY.background,
  },

  menuSubtitle: {
    color: LUXURY.textMuted,
    fontSize: 11,
    marginTop: 4,
  },

  menuFooter: {
    alignItems: 'center',
    marginTop: 38,
  },

  footerLine: {
    width: 40,
    height: 1,
    backgroundColor: LUXURY.gold,
    opacity: 0.5,
    marginBottom: 12,
  },

  footerText: {
    color: LUXURY.textMuted,
    fontSize: 8,
    letterSpacing: 2,
  },

  pageContent: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  sectionTitle: {
    color: LUXURY.text,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
  },

  settingsCard: {
    backgroundColor: LUXURY.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: LUXURY.border,
    padding: 18,
    marginBottom: 12,
  },

  settingsLabel: {
    color: LUXURY.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 5,
  },

  settingsDescription: {
    color: LUXURY.textMuted,
    fontSize: 11,
  },

  optionsRow: {
    gap: 8,
    marginTop: 14,
  },

  option: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    backgroundColor: LUXURY.surface2,
    borderWidth: 1,
    borderColor: LUXURY.border,
  },

  optionActive: {
    backgroundColor: 'rgba(155,109,255,0.08)',
    borderColor: 'rgba(155,109,255,0.35)',
  },

  optionTitle: {
    color: LUXURY.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },

  optionTitleActive: {
    color: LUXURY.goldLight,
  },

  optionDescription: {
    color: LUXURY.textMuted,
    fontSize: 9,
    marginTop: 4,
  },

  settingsHeader: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 3,
    backgroundColor: LUXURY.surface3,
    borderWidth: 1,
    borderColor: LUXURY.border,
  },

  toggleActive: {
    backgroundColor: 'rgba(155,109,255,0.15)',
    borderColor: 'rgba(155,109,255,0.35)',
  },

  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: LUXURY.textMuted,
  },

  toggleThumbActive: {
    transform: [{ translateX: 20 }],
    backgroundColor: LUXURY.gold,
  },

  modeContainer: {
    gap: 8,
    marginTop: 14,
  },

  modeButton: {
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 15,
    backgroundColor: LUXURY.surface2,
    borderWidth: 1,
    borderColor: LUXURY.border,
  },

  modeButtonActive: {
    borderColor: 'rgba(155,109,255,0.35)',
    backgroundColor: 'rgba(155,109,255,0.07)',
  },

  modeTitle: {
    color: LUXURY.text,
    fontSize: 13,
    fontWeight: '700',
  },

  modeDescription: {
    color: LUXURY.textMuted,
    fontSize: 10,
    marginTop: 2,
  },

  goldButton: {
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LUXURY.gold,
    marginTop: 4,
  },

  goldButtonText: {
    color: LUXURY.background,
    fontSize: 15,
    fontWeight: '800',
  },

  recordsHero: {
    alignItems: 'center',
    paddingTop: 22,
    paddingBottom: 24,
  },

  recordsHeroIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(155,109,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(155,109,255,0.2)',
    marginBottom: 14,
  },

  recordsHeroTitle: {
    color: LUXURY.text,
    fontSize: 24,
    fontWeight: '800',
  },

  recordsHeroSubtitle: {
    color: LUXURY.textMuted,
    fontSize: 12,
    marginTop: 6,
  },

  recordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  statCard: {
    width: (SCREEN_WIDTH - 50) / 2,
    minHeight: 140,
    borderRadius: 20,
    backgroundColor: LUXURY.surface,
    borderWidth: 1,
    borderColor: LUXURY.border,
    padding: 15,
  },

  statCardLarge: {
    width: '100%',
    minHeight: 155,
  },

  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(155,109,255,0.07)',
    marginBottom: 15,
  },

  statLabel: {
    color: LUXURY.textMuted,
    fontSize: 11,
  },

  statValue: {
    color: LUXURY.text,
    fontSize: 24,
    fontWeight: '800',
    marginTop: 5,
  },

  statValueLarge: {
    color: LUXURY.goldLight,
    fontSize: 36,
  },

  gameContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  gameTopBar: {
    alignItems: 'center',
    padding: 7,
    borderRadius: 18,
    backgroundColor: LUXURY.surface,
    borderWidth: 1,
    borderColor: LUXURY.border,
    gap: 3,
  },

  gameMetric: {
    flex: 1,
    alignItems: 'center',
  },

  gameMetricLabel: {
    color: LUXURY.textMuted,
    fontSize: 8,
  },

  gameMetricValue: {
    color: LUXURY.goldLight,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LUXURY.surface2,
  },

  gameStatusContainer: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  gameStatus: {
    fontSize: 12,
    fontWeight: '600',
  },

  wordDisplay: {
    flex: 1,
    minHeight: 170,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LUXURY.surface,
    borderWidth: 1,
    borderColor: LUXURY.borderStrong,
    overflow: 'hidden',
    marginBottom: 10,
  },

  wordDisplayLabel: {
    position: 'absolute',
    top: 20,
    color: LUXURY.textMuted,
    fontSize: 8,
    letterSpacing: 2,
  },

  wordText: {
    color: LUXURY.text,
    fontSize: 44,
    fontWeight: '800',
    letterSpacing: -1,
  },

  wordCorrect: {
    color: LUXURY.success,
  },

  wordWrong: {
    color: LUXURY.danger,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingRing: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    borderColor: 'rgba(155,109,255,0.12)',
    borderTopColor: LUXURY.gold,
  },

  wordGrid: {
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },

  wordButton: {
    width: (SCREEN_WIDTH - 48) / 3,
    minHeight: 52,
    paddingHorizontal: 7,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: LUXURY.surface,
    borderWidth: 1,
    borderColor: LUXURY.border,
  },

  wordButtonDisabled: {
    opacity: 0.38,
  },

  wordButtonCorrect: {
    backgroundColor: 'rgba(110,213,160,0.07)',
    borderColor: 'rgba(110,213,160,0.3)',
  },

  wordButtonWrong: {
    backgroundColor: 'rgba(232,121,121,0.07)',
    borderColor: 'rgba(232,121,121,0.3)',
  },

  wordButtonText: {
    color: LUXURY.text,
    fontSize: 13,
    // fontWeight: '650',
    textAlign: 'center',
  },

  wordTextCorrect: {
    color: LUXURY.success,
  },

  wordTextWrong: {
    color: LUXURY.danger,
  },

  gameBottom: {
    gap: 8,
    paddingTop: 4,
  },

  bottomButton: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 13,
    backgroundColor: LUXURY.surface,
    borderWidth: 1,
    borderColor: LUXURY.border,
  },

  bottomButtonText: {
    color: LUXURY.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    backgroundColor: 'rgba(3,4,6,0.93)',
  },

  resultCard: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 30,
    padding: 22,
    backgroundColor: '#111318',
    borderWidth: 1,
    borderColor: 'rgba(155,109,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 12,
  },

  resultHeader: {
    alignItems: 'center',
  },

  resultIcon: {
    width: 68,
    height: 68,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: 1,
    borderColor: LUXURY.border,
    marginBottom: 14,
  },

  resultIconGold: {
    backgroundColor: 'rgba(155,109,255,0.08)',
    borderColor: 'rgba(155,109,255,0.3)',
  },

  resultEyebrow: {
    color: LUXURY.gold,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 5,
  },

  resultTitle: {
    color: LUXURY.text,
    fontSize: 23,
    fontWeight: '800',
  },

  finalScoreContainer: {
    alignItems: 'center',
    marginTop: 20,
  },

  finalScoreLabel: {
    color: LUXURY.textMuted,
    fontSize: 10,
  },

  finalScore: {
    color: LUXURY.goldLight,
    fontSize: 52,
    fontWeight: '900',
    letterSpacing: -2,
    marginTop: 1,
  },

  scoreDivider: {
    width: 45,
    height: 2,
    borderRadius: 2,
    backgroundColor: LUXURY.gold,
    marginTop: 7,
    opacity: 0.6,
  },

  resultStats: {
    marginTop: 22,
    backgroundColor: LUXURY.surface2,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: LUXURY.border,
    padding: 5,
  },

  resultStat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 13,
  },

  resultStatLabel: {
    color: LUXURY.textMuted,
    fontSize: 9,
    marginTop: 7,
  },

  resultStatValue: {
    color: LUXURY.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
  },

  performanceBadge: {
    alignSelf: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 13,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 30,
    backgroundColor: 'rgba(155,109,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(155,109,255,0.16)',
  },

  performanceText: {
    color: LUXURY.goldLight,
    fontSize: 10,
    fontWeight: '600',
  },

  resultActions: {
    marginTop: 20,
  },

  resultPrimaryButton: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: LUXURY.gold,
  },

  resultPrimaryText: {
    color: LUXURY.background,
    fontSize: 14,
    fontWeight: '800',
  },

  resultSecondaryButton: {
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: LUXURY.surface2,
    borderWidth: 1,
    borderColor: LUXURY.border,
  },

  resultSecondaryText: {
    color: LUXURY.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
});