import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
  Easing,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Play, Settings, Trophy, Globe, Home, X, Star, TrendingUp, Ruler, Zap, Repeat, RotateCcw } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ================================================================
// =============== WORD DATABASE ================
// ================================================================

const ENGLISH_WORDS = {
  easy: ["APPLE", "BOOK", "CAT", "DOG", "FISH", "BIRD", "TREE", "STAR", "MOON", "SUN", "CAR", "BALL", "FIRE", "WATER", "HOUSE", "HAPPY", "SMILE", "GAME", "CLOUD", "HEART"],
  medium: ["TREE", "RIVER", "HAPPINESS", "SKY", "OCEAN", "MOUNTAIN", "FOREST", "BUTTERFLY", "RAINBOW", "CANDLE", "BRIDGE", "CASTLE", "DIAMOND", "ELEPHANT", "GIRAFFE", "DOLPHIN", "KANGAROO", "PANDA", "TIGER", "LIBRARY", "HOSPITAL", "RESTAURANT", "THEATER", "MUSEUM", "TELESCOPE", "MICROSCOPE", "COMPUTER", "TELEPHONE", "CHOCOLATE", "STRAWBERRY", "WATERMELON", "PINEAPPLE", "MAGNIFICENT", "WONDERFUL", "BEAUTIFUL", "EXCITING", "AMAZING", "FREEDOM", "COURAGE", "PATIENCE", "KINDNESS", "STRENGTH", "MEMORY", "ATTENTION", "FOCUS", "PRACTICE", "IMPROVE"],
  hard: ["GALAXY", "BIOLOGY", "ARCHITECTURE", "ASTRONOMY", "PSYCHOLOGY", "PHILOSOPHY", "UNIVERSE", "ATMOSPHERE", "BIODIVERSITY", "CONSERVATION", "EXPLORATION", "INNOVATION", "TECHNOLOGY", "CIVILIZATION", "REVOLUTION", "IMAGINATION", "CREATIVITY", "INSPIRATION", "MOTIVATION", "PERSEVERANCE", "INTELLIGENCE", "CONSCIOUSNESS", "NEUROSCIENCE", "COGNITIVE", "PERCEPTION", "EXPERIMENT", "HYPOTHESIS", "THEORY", "ANALYSIS", "EVALUATION", "SYNTHESIS", "INTEGRATION", "TRANSFORMATION", "EVOLUTION", "ADAPTATION", "COMPREHENSION", "NEUROPLASTICITY", "SYNAPTIC", "COGNITION", "EXECUTIVE_FUNCTION", "WORKING_MEMORY", "LONG_TERM_MEMORY", "ATTENTIONAL_CONTROL", "INHIBITORY_CONTROL", "COGNITIVE_FLEXIBILITY", "PROCESSING_SPEED"]
};

const PERSIAN_WORDS = {
  easy: ["سیب", "سگ", "گل", "ماه", "کتاب", "گربه", "پرنده", "ماهی", "درخت", "ستاره", "خورشید", "ماشین", "توپ", "آتش", "آب", "خانه", "شادی", "لبخند", "بازی", "ابر", "قلب", "نور", "صلح", "رویا", "عشق"],
  medium: ["درخت", "رودخانه", "شادی", "آسمان", "اقیانوس", "کوه", "جنگل", "پروانه", "رنگین‌کمان", "شمع", "پل", "قلعه", "الماس", "فیل", "زرافه", "دلفین", "کانگورو", "پاندا", "ببر", "کتابخانه", "بیمارستان", "رستوران", "تئاتر", "موزه", "تلسکوپ", "میکروسکوپ", "کامپیوتر", "تلفن", "تلویزیون", "شکلات", "توت‌فرنگی", "هندوانه", "آناناس", "نارگیل", "با شکوه", "شگفت‌انگیز", "زیبا", "مهیج", "حیرت‌آور", "آزادی", "شجاعت", "صبر", "مهربانی", "قدرت", "حافظه", "توجه", "تمرکز", "تمرین", "بهبود"],
  hard: ["کهکشان", "زیست‌شناسی", "معماری", "ستاره‌شناسی", "روانشناسی", "فلسفه", "جهان", "جو", "تنوع زیستی", "حفاظت", "اکتشاف", "نوآوری", "فناوری", "تمدن", "انقلاب", "تخیل", "خلاقیت", "الهام", "انگیزه", "پشتکار", "هوش", "هشیاری", "علوم اعصاب", "شناختی", "ادراک", "آزمایش", "فرضیه", "نظریه", "تحلیل", "ارزیابی", "ترکیب", "یکپارچگی", "تحول", "تکامل", "انطباق", "درک", "انعطاف‌پذیری عصبی", "سیناپسی", "شناخت", "عملکرد اجرایی", "حافظه کاری", "حافظه بلندمدت", "کنترل توجه", "کنترل مهاری", "انعطاف‌پذیری شناختی", "سرعت پردازش"]
};

// ================================================================
// =============== CONSTANTS ================
// ================================================================

const CONSTANTS = {
  BASE_SCORE: 10,
  BONUS_BASE: 20,
  BONUS_INCREMENT: 5,
  MAX_SEQUENCE: 12,
  MIN_SEQUENCE: 2,
  EXTRA_OPTIONS: 4,
  DISPLAY_TIMES: { easy: 1200, medium: 1000, hard: 700 },
  START_LENGTHS: { easy: 3, medium: 5, hard: 7 },
  BONUS_MULTIPLIERS: { easy: 1.0, medium: 1.25, hard: 1.5 },
  RT_THRESHOLDS: { excellent: 400, normal: 700, slow: 1000 }
};

// ================================================================
// =============== HELPERS ================
// ================================================================

const shuffleArray = (array: any[]) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const random = (min: number, max: number) => Math.random() * (max - min) + min;

// ================================================================
// =============== MAIN COMPONENT ================
// ================================================================

export default function WordSequenceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { language, isRTL } = useLanguage();

  const [currentScreen, setCurrentScreen] = useState<'menu' | 'settings' | 'records' | 'game'>('menu');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameMode, setGameMode] = useState<'forward' | 'backward'>('forward');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Game state
  const [gameScore, setGameScore] = useState(0);
  const [gameLevel, setGameLevel] = useState(1);
  const [gameLength, setGameLength] = useState(3);
  const [gameSequence, setGameSequence] = useState<string[]>([]);
  const [gamePlayerIndex, setGamePlayerIndex] = useState(0);
  const [gameIsShowing, setGameIsShowing] = useState(false);
  const [gameIsPlaying, setIsPlaying] = useState(false);
  const [gameIsOver, setGameIsOver] = useState(false);
  const [gameStatus, setGameStatus] = useState('👀 دنباله را تماشا کن...');
  const [gameStatusColor, setGameStatusColor] = useState('#A070B0');
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
  const [gameRunning, setGameRunning] = useState(false);
  const [wordButtonsEnabled, setWordButtonsEnabled] = useState(false);
  const [gridColumns, setGridColumns] = useState(3);

  // Records state
  const [highScore, setHighScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [bestLevel, setBestLevel] = useState(1);
  const [bestAccuracy, setBestAccuracy] = useState(0);
  const [bestRT, setBestRT] = useState<number | null>(null);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalIcon, setModalIcon] = useState('💫');
  const [modalTitle, setModalTitle] = useState('پایان بازی');
  const [modalTitleColor, setModalTitleColor] = useState('#FFFFFF');
  const [finalScore, setFinalScore] = useState(0);
  const [finalLevel, setFinalLevel] = useState(1);
  const [finalAccuracy, setFinalAccuracy] = useState(0);
  const [finalRT, setFinalRT] = useState(0);

  // Refs
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const lastReactionStartTime = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnim = useRef(new Animated.Value(0.94)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // ================================================================
  // =============== LANGUAGE HELPERS ================
  // ================================================================

  const getWordBank = () => {
    const lang = language || 'fa';
    return lang === 'en' ? ENGLISH_WORDS[difficulty] || ENGLISH_WORDS.medium :
      PERSIAN_WORDS[difficulty] || PERSIAN_WORDS.medium;
  };

  const getDisplayTime = () => CONSTANTS.DISPLAY_TIMES[difficulty] || 1000;

  const getStartLength = () => CONSTANTS.START_LENGTHS[difficulty] || 5;

  const getMaxSequenceLength = () => {
    if (difficulty === 'easy') return 8;
    if (difficulty === 'hard') return 12;
    return 10;
  };

  const getBonusMultiplier = () => CONSTANTS.BONUS_MULTIPLIERS[difficulty] || 1.0;

  const getBonusForLevel = (level: number) => {
    const base = CONSTANTS.BONUS_BASE + (level - 1) * CONSTANTS.BONUS_INCREMENT;
    const multiplier = getBonusMultiplier();
    return Math.round(base * multiplier);
  };

  const getRTInterpretation = (rt: number) => {
    if (rt < CONSTANTS.RT_THRESHOLDS.excellent) return 'عالی';
    if (rt < CONSTANTS.RT_THRESHOLDS.normal) return 'طبیعی';
    if (rt < CONSTANTS.RT_THRESHOLDS.slow) return 'کند';
    return 'بسیار کند';
  };

  const getAverageRT = () => {
    const rts = gameReactionTimes;
    return rts.length === 0 ? 0 : rts.reduce((a, b) => a + b, 0) / rts.length;
  };

  const getCurrentRoundAverageRT = () => {
    const rts = currentRoundRTs;
    return rts.length === 0 ? 0 : rts.reduce((a, b) => a + b, 0) / rts.length;
  };

  const getRandomWords = (count: number, exclude: string[]) => {
    const bank = getWordBank();
    const available = bank.filter(w => !exclude.includes(w));
    const shuffled = shuffleArray([...available]);
    if (shuffled.length < count) {
      setWordHistory([]);
      const freshAvailable = bank.filter(w => !exclude.includes(w));
      return shuffleArray([...freshAvailable]).slice(0, count);
    }
    return shuffled.slice(0, count);
  };

  // ================================================================
  // =============== RECORDS ================
  // ================================================================

  const loadRecords = () => {
    try {
      const data = {
        high_score: 0,
        games_played: 0,
        best_level: 1,
        best_accuracy: 0,
        best_reaction_time: null as number | null
      };
      // Try to load from localStorage equivalent (AsyncStorage in real app)
      // For now using default values
      setHighScore(data.high_score);
      setGamesPlayed(data.games_played);
      setBestLevel(data.best_level);
      setBestAccuracy(data.best_accuracy);
      setBestRT(data.best_reaction_time);
    } catch (e) {
      console.error('Error loading records:', e);
    }
  };

  const updateHighScore = (score: number) => {
    if (score > highScore) {
      setHighScore(score);
      return true;
    }
    return false;
  };

  const updateBestLevel = (level: number) => {
    if (level > bestLevel) {
      setBestLevel(level);
      return true;
    }
    return false;
  };

  const updateBestAccuracy = (accuracy: number) => {
    if (accuracy > bestAccuracy) {
      setBestAccuracy(accuracy);
      return true;
    }
    return false;
  };

  const updateBestReactionTime = (rt: number) => {
    if (rt <= 0) return false;
    if (bestRT === null || rt < bestRT) {
      setBestRT(rt);
      return true;
    }
    return false;
  };

  const incrementGamesPlayed = () => {
    setGamesPlayed(prev => prev + 1);
  };

  // ================================================================
  // =============== GO BACK ================
  // ================================================================

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const handleBack = () => {
    if (currentScreen === 'game' && gameRunning) {
      Alert.alert(
        'خروج از بازی',
        'آیا مطمئن هستید که می‌خواهید از بازی خارج شوید؟',
        [
          { text: 'انصراف', style: 'cancel' },
          { text: 'خروج', style: 'destructive', onPress: () => {
            stopGame();
            setCurrentScreen('menu');
          }}
        ]
      );
    } else if (currentScreen === 'settings' || currentScreen === 'records') {
      setCurrentScreen('menu');
    } else {
      goBack();
    }
  };

  // ================================================================
  // =============== SOUND ================
  // ================================================================

  const playBeep = (frequency: number, duration: number) => {
    if (!soundEnabled) return;
    // Simple sound simulation - in real app use expo-av
    // For now just a placeholder
  };

  const playCorrectSound = () => playBeep(800, 150);
  const playWrongSound = () => playBeep(300, 400);
  const playTickSound = () => playBeep(600, 80);
  const playLevelUpSound = () => {
    playBeep(1000, 200);
    setTimeout(() => playBeep(1200, 200), 200);
  };

  // ================================================================
  // =============== SCREEN MANAGEMENT ================
  // ================================================================

  const showScreen = (screen: 'menu' | 'settings' | 'records' | 'game') => {
    setCurrentScreen(screen);
  };

  // ================================================================
  // =============== TIMER MANAGEMENT ================
  // ================================================================

  const clearGameTimeouts = () => {
    timeoutsRef.current.forEach(t => clearTimeout(t));
    timeoutsRef.current = [];
    if (timerRef.current) { clearTimeout(timerRef.current);
      timerRef.current = null; }
    if (wordTimerRef.current) { clearTimeout(wordTimerRef.current);
      wordTimerRef.current = null; }
  };

  const addTimeout = (fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay);
    timeoutsRef.current.push(id);
    return id;
  };

  // ================================================================
  // =============== GAME LOGIC ================
  // ================================================================

  const startReactionTimer = () => {
    lastReactionStartTime.current = performance.now();
  };

  const stopReactionTimer = () => {
    if (lastReactionStartTime.current === 0) return 0;
    const rt = performance.now() - lastReactionStartTime.current;
    lastReactionStartTime.current = 0;
    return rt;
  };

  const recordReactionTime = (rt: number) => {
    if (rt <= 0 || rt > 10000) return;
    setGameReactionTimes(prev => [...prev, rt]);
    setCurrentRoundRTs(prev => [...prev, rt]);
    setAverageRT(getCurrentRoundAverageRT());
  };

  const resetRoundRTs = () => {
    setCurrentRoundRTs([]);
    setAverageRT(0);
  };

  const enableWordButtons = (enabled: boolean) => {
    setWordButtonsEnabled(enabled);
  };

  const updateGameStatus = (text: string, color: string = '#A070B0') => {
    setGameStatus(text);
    setGameStatusColor(color);
  };

  const showLoadingOverlay = (show: boolean) => {
    setShowLoading(show);
  };

  const updateGameStats = () => {
    // Stats are updated via state
  };

  const startGame = () => {
    setGameScore(0);
    setGameLevel(1);
    const startLen = getStartLength();
    setGameLength(startLen);
    setGameRunning(true);
    setGameIsOver(false);
    setGameIsShowing(false);
    setIsPlaying(false);
    setGameCorrectCount(0);
    setGameTotalAttempts(0);
    setWordHistory([]);
    setGameReactionTimes([]);
    setCurrentRoundRTs([]);
    setAverageRT(0);
    setWordButtonsEnabled(false);
    setModalVisible(false);

    incrementGamesPlayed();
    clearGameTimeouts();

    showScreen('game');
    setGameStatus('👀 دنباله را تماشا کن...', '#A070B0');

    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true })
    ]).start();

    addTimeout(() => startRound(), 300);
  };

  const startRound = () => {
    if (!gameRunning || gameIsOver) return;

    setGameIsShowing(true);
    setIsPlaying(false);
    setGamePlayerIndex(0);

    const maxLen = getMaxSequenceLength();
    const len = Math.min(gameLength, maxLen);

    const available = getWordBank().filter(w => !wordHistory.includes(w));
    const shuffledAvailable = shuffleArray([...available]);
    let seqWords = shuffledAvailable.slice(0, len);

    if (seqWords.length < len) {
      setWordHistory([]);
      const fullShuffled = shuffleArray([...getWordBank()]);
      seqWords = fullShuffled.slice(0, len);
    }

    setGameSequence(seqWords);
    setWordHistory(prev => [...prev, ...seqWords].slice(-30));

    const extraCount = Math.min(CONSTANTS.EXTRA_OPTIONS, Math.floor(getWordBank().length / 2));
    const extraWords = getRandomWords(extraCount, seqWords);
    const grid = shuffleArray([...seqWords, ...extraWords]);
    setGridWords(grid);

    const cols = grid.length <= 4 ? 2 : grid.length <= 6 ? 3 : 4;
    setGridColumns(cols);

    setDisplayWord('');
    setDisplayWordClass('');

    updateGameStatus('👀 دنباله را تماشا کن...', '#A070B0');
    resetRoundRTs();
    enableWordButtons(false);
    showLoadingOverlay(true);

    addTimeout(() => {
      showLoadingOverlay(false);
      showSequence(0);
    }, 400);
  };

  const showSequence = (index: number) => {
    if (!gameRunning || gameIsOver) return;

    if (index >= gameSequence.length) {
      setGameIsShowing(false);
      setIsPlaying(true);
      const mode = gameMode || 'forward';
      updateGameStatus(
        mode === 'forward' ? '🧠 حالا کلمات را به همان ترتیب تکرار کن!' : '🧠 حالا کلمات را به ترتیب برعکس تکرار کن!',
        '#D100D1'
      );
      setDisplayWord('');
      setDisplayWordClass('');
      enableWordButtons(true);
      startReactionTimer();
      return;
    }

    const word = gameSequence[index];
    setDisplayWord(word);
    setDisplayWordClass('showing');
    playTickSound();

    const displayTime = getDisplayTime();
    addTimeout(() => {
      setDisplayWordClass('hiding');
    }, displayTime * 0.8);

    addTimeout(() => {
      showSequence(index + 1);
    }, displayTime);
  };

  const handleWordClick = (word: string) => {
    if (!gameRunning || gameIsOver || !gameIsPlaying) return;

    const rt = stopReactionTimer();
    if (rt > 0 && rt < 10000) recordReactionTime(rt);

    const mode = gameMode || 'forward';
    const expectedIndex = mode === 'forward' ? gamePlayerIndex : gameSequence.length - 1 - gamePlayerIndex;
    const correctWord = gameSequence[expectedIndex];

    if (word === correctWord) {
      setGamePlayerIndex(prev => prev + 1);
      const scoreGain = Math.round(CONSTANTS.BASE_SCORE * getBonusMultiplier());
      setGameScore(prev => prev + scoreGain);
      setGameCorrectCount(prev => prev + 1);
      setGameTotalAttempts(prev => prev + 1);
      playCorrectSound();

      updateGameStatus(`✅ درست! +${scoreGain} امتیاز`, '#34D399');

      // Disable clicked button
      setGridWords(prev => prev.map(w => w === word ? `✓${w}` : w));

      setDisplayWord(word);
      setDisplayWordClass('correct-feedback');

      if (gamePlayerIndex + 1 >= gameSequence.length) {
        setIsPlaying(false);
        setGameLevel(prev => prev + 1);

        const bonus = getBonusForLevel(gameLevel);
        setGameScore(prev => prev + bonus);
        playLevelUpSound();

        updateGameStatus(`⬆ مرحله بعد! +${bonus} امتیاز پاداش`, '#D100D1');
        enableWordButtons(false);
        resetRoundRTs();

        const newLen = Math.min(gameLength + 1, getMaxSequenceLength());
        setGameLength(newLen);

        addTimeout(() => {
          if (gameRunning && !gameIsOver) startRound();
        }, 1500);
      } else {
        enableWordButtons(true);
        startReactionTimer();
      }
    } else {
      setGameTotalAttempts(prev => prev + 1);
      playWrongSound();

      updateGameStatus('❌ اشتباه! بازی تمام شد', '#FF6B81');

      // Mark wrong button
      setGridWords(prev => prev.map(w => w === word ? `✗${w}` : w));

      setDisplayWord(word);
      setDisplayWordClass('wrong-feedback');

      setIsPlaying(false);
      enableWordButtons(false);

      addTimeout(() => gameOver(), 600);
    }
  };

  const gameOver = () => {
    setGameRunning(false);
    setGameIsOver(true);
    setIsPlaying(false);
    setGameIsShowing(false);
    enableWordButtons(false);
    clearGameTimeouts();

    const finalScoreVal = gameScore;
    const finalLevelVal = gameLevel;
    const accuracy = gameTotalAttempts > 0 ? Math.round((gameCorrectCount / gameTotalAttempts) * 100) : 0;
    const avgRTVal = getAverageRT();

    let newRecords: string[] = [];
    if (updateHighScore(finalScoreVal)) newRecords.push('بهترین امتیاز');
    if (updateBestLevel(finalLevelVal)) newRecords.push('بهترین مرحله');
    if (updateBestAccuracy(accuracy)) newRecords.push('بهترین دقت');
    if (avgRTVal > 0 && updateBestReactionTime(avgRTVal)) newRecords.push('بهترین زمان واکنش');

    setFinalScore(finalScoreVal);
    setFinalLevel(finalLevelVal);
    setFinalAccuracy(accuracy);
    setFinalRT(avgRTVal);

    if (newRecords.length > 0) {
      setModalIcon('🏆');
      setModalTitle(newRecords.length === 1 ? '🎉 رکورد جدید!' : '🏆 رکوردهای جدید!');
      setModalTitleColor('#34D399');
    } else {
      setModalIcon('💫');
      setModalTitle('پایان بازی');
      setModalTitleColor('#FFFFFF');
    }

    setModalVisible(true);
  };

  const restartGame = () => {
    setModalVisible(false);
    startGame();
  };

  const stopGame = () => {
    setGameRunning(false);
    setGameIsOver(true);
    setIsPlaying(false);
    setGameIsShowing(false);
    clearGameTimeouts();
    enableWordButtons(false);
  };

  // ================================================================
  // =============== RENDER FUNCTIONS ================
  // ================================================================

  const renderMenuItem = (icon: React.ReactNode, text: string, onPress: () => void, primary?: boolean) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.menuButton,
        primary && styles.menuButtonPrimary,
        { borderColor: primary ? 'rgba(209,0,209,0.10)' : 'rgba(211,0,209,0.08)' }
      ]}
    >
      <View style={styles.menuButtonContent}>
        {icon}
        <Text style={[styles.menuButtonText, primary && styles.menuButtonTextPrimary]}>
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderStatItem = (icon: React.ReactNode, label: string, value: string | number) => (
    <View style={[styles.statItem, { borderColor: 'rgba(211,0,209,0.06)' }]}>
      {icon}
      <Text style={[styles.statLabel, { color: '#A070B0' }]}>{label}</Text>
      <Text style={[styles.statValue, { color: '#D100D1' }]}>{value}</Text>
    </View>
  );

  const renderGameStat = (icon: React.ReactNode, label: string, value: string | number) => (
    <View style={styles.gameStatItem}>
      <Text style={styles.gameStatLabel}>{label}</Text>
      <Text style={[styles.gameStatValue, { color: '#D100D1' }]}>{value}</Text>
    </View>
  );

  const renderWordButton = (word: string, index: number) => {
    const isCorrect = word.startsWith('✓');
    const isWrong = word.startsWith('✗');
    const displayWord = word.replace(/^[✓✗]/, '');

    return (
      <TouchableOpacity
        key={index}
        onPress={() => handleWordClick(displayWord)}
        disabled={!wordButtonsEnabled || isCorrect || isWrong}
        style={[
          styles.wordButton,
          {
            backgroundColor: isCorrect ? 'rgba(52,211,153,0.04)' : isWrong ? 'rgba(255,107,129,0.04)' : 'rgba(255,255,255,0.02)',
            borderColor: isCorrect ? 'rgba(52,211,153,0.12)' : isWrong ? 'rgba(255,107,129,0.12)' : 'rgba(211,0,209,0.06)',
            opacity: (!wordButtonsEnabled && !isCorrect && !isWrong) ? 0.3 : 1,
          }
        ]}
      >
        <Text style={[
          styles.wordButtonText,
          { color: isCorrect ? '#34D399' : isWrong ? '#FF6B81' : '#E8D0F0' }
        ]}>
          {displayWord}
        </Text>
      </TouchableOpacity>
    );
  };

  // ================================================================
  // =============== RENDER ================
  // ================================================================

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.7}
          style={[styles.headerButton, { backgroundColor: colors.surface }]}
        >
          <ArrowLeft size={22} color={colors.text} style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {currentScreen === 'menu' ? 'توالی کلمات' :
           currentScreen === 'settings' ? 'تنظیمات' :
           currentScreen === 'records' ? 'رکوردها' :
           'بازی توالی کلمات'}
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      {/* Menu Screen */}
      {currentScreen === 'menu' && (
        <ScrollView contentContainerStyle={styles.menuScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.logoSection}>
            <Text style={styles.logoIcon}>📚</Text>
            <Text style={[styles.mainTitle, { color: colors.text }]}>
              توالی <Text style={styles.gradientText}>کلمات</Text>
            </Text>
            <Text style={[styles.mainSubtitle, { color: '#A070B0' }]}>تقویت حافظه‌ی کاری</Text>
          </View>

          <View style={styles.menuButtons}>
            {renderMenuItem(
              <Play size={20} color="#FFFFFF" />,
              'شروع بازی',
              startGame,
              true
            )}
            {renderMenuItem(
              <Settings size={20} color="#E8D0F0" />,
              'تنظیمات',
              () => showScreen('settings')
            )}
            {renderMenuItem(
              <Trophy size={20} color="#E8D0F0" />,
              'رکوردها',
              () => {
                loadRecords();
                showScreen('records');
              }
            )}
            {renderMenuItem(
              <Globe size={20} color="#E8D0F0" />,
              language === 'fa' ? '🇬🇧 English' : '🇫🇦 فارسی',
              () => {
                // Toggle language - handled by context
              }
            )}
            {renderMenuItem(
              <Home size={20} color="#E8D0F0" />,
              'بازگشت به ماژول‌ها',
              goBack
            )}
          </View>
        </ScrollView>
      )}

      {/* Settings Screen */}
      {currentScreen === 'settings' && (
        <ScrollView contentContainerStyle={styles.settingsScrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.settingsGroup, { borderColor: 'rgba(211,0,209,0.06)' }]}>
            <Text style={[styles.settingsLabel, { color: '#E8D0F0' }]}>سختی:</Text>
            <View style={styles.settingsOptions}>
              {['easy', 'medium', 'hard'].map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setDifficulty(d as 'easy' | 'medium' | 'hard')}
                  style={[
                    styles.optionButton,
                    difficulty === d && styles.optionButtonActive,
                    { borderColor: difficulty === d ? 'rgba(209,0,209,0.15)' : 'rgba(211,0,209,0.06)' }
                  ]}
                >
                  <Text style={[
                    styles.optionButtonText,
                    { color: difficulty === d ? '#FFFFFF' : '#E8D0F0' }
                  ]}>
                    {d === 'easy' ? 'آسان' : d === 'medium' ? 'متوسط' : 'سخت'}
                  </Text>
                  <Text style={[
                    styles.optionButtonSmall,
                    { color: difficulty === d ? '#D100D1' : '#A070B0' }
                  ]}>
                    {d === 'easy' ? '(شروع با ۳)' : d === 'medium' ? '(شروع با ۵)' : '(شروع با ۷)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={[styles.settingsGroup, { borderColor: 'rgba(211,0,209,0.06)' }]}>
            <Text style={[styles.settingsLabel, { color: '#E8D0F0' }]}>صدا:</Text>
            <TouchableOpacity onPress={() => setSoundEnabled(!soundEnabled)} style={styles.toggleButton}>
              <View style={[styles.toggleTrack, soundEnabled && styles.toggleTrackActive]}>
                <View style={[styles.toggleThumb, soundEnabled && styles.toggleThumbActive]} />
              </View>
              <Text style={[styles.toggleLabel, { color: '#A070B0' }]}>
                {soundEnabled ? 'فعال' : 'غیرفعال'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.settingsGroup, { borderColor: 'rgba(211,0,209,0.06)' }]}>
            <Text style={[styles.settingsLabel, { color: '#E8D0F0' }]}>حالت:</Text>
            <View style={styles.settingsOptions}>
              {['forward', 'backward'].map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setGameMode(m as 'forward' | 'backward')}
                  style={[
                    styles.optionButton,
                    gameMode === m && styles.optionButtonActive,
                    { borderColor: gameMode === m ? 'rgba(209,0,209,0.15)' : 'rgba(211,0,209,0.06)' }
                  ]}
                >
                  <Text style={[
                    styles.optionButtonText,
                    { color: gameMode === m ? '#FFFFFF' : '#E8D0F0' }
                  ]}>
                    {m === 'forward' ? '➡️ پیش‌رو' : '⬅️ معکوس'}
                  </Text>
                  <Text style={[
                    styles.optionButtonSmall,
                    { color: gameMode === m ? '#D100D1' : '#A070B0' }
                  ]}>
                    {m === 'forward' ? '(به همان ترتیب)' : '(برعکس)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            onPress={() => showScreen('menu')}
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.saveButtonText}>💾 ذخیره</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Records Screen */}
      {currentScreen === 'records' && (
        <ScrollView contentContainerStyle={styles.recordsScrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.recordsGrid}>
            {[
              { icon: '🏆', label: 'بهترین امتیاز', value: highScore },
              { icon: '📈', label: 'بهترین مرحله', value: bestLevel },
              { icon: '🎯', label: 'بهترین دقت', value: bestAccuracy + '%' },
              { icon: '⚡', label: 'بهترین زمان واکنش', value: bestRT ? Math.round(bestRT) + ' ms' : '--' },
              { icon: '📊', label: 'تعداد بازی‌ها', value: gamesPlayed },
            ].map((item, index) => (
              <View key={index} style={[styles.recordCard, { borderColor: 'rgba(211,0,209,0.06)' }]}>
                <Text style={styles.recordIcon}>{item.icon}</Text>
                <View style={styles.recordInfo}>
                  <Text style={[styles.recordLabel, { color: '#A070B0' }]}>{item.label}</Text>
                  <Text style={[styles.recordValue, { color: '#D100D1' }]}>{item.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Game Screen */}
      {currentScreen === 'game' && (
        <Animated.View style={[styles.gameContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.gameHeader, { borderColor: 'rgba(211,0,209,0.06)' }]}>
            <View style={styles.gameStats}>
              {renderGameStat('⭐', 'امتیاز', gameScore)}
              {renderGameStat('📈', 'مرحله', gameLevel)}
              {renderGameStat('📏', 'طول', gameLength)}
              {renderGameStat('⚡', 'زمان واکنش', averageRT > 0 ? Math.round(averageRT) + ' ms' : '--')}
            </View>
            <TouchableOpacity onPress={() => {
              Alert.alert('خروج از بازی', 'آیا مطمئن هستید؟', [
                { text: 'انصراف', style: 'cancel' },
                { text: 'خروج', style: 'destructive', onPress: () => {
                  stopGame();
                  setCurrentScreen('menu');
                }}
              ]);
            }} style={styles.gameCloseButton}>
              <X size={20} color="#A070B0" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.gameStatusText, { color: gameStatusColor }]}>
            {gameStatus}
          </Text>

          <View style={[styles.wordDisplay, { borderColor: 'rgba(211,0,209,0.06)' }]}>
            {showLoading && (
              <View style={styles.loadingOverlay}>
                <View style={styles.loadingSpinner} />
              </View>
            )}
            <Text style={[styles.wordText, {
              color: displayWordClass === 'correct-feedback' ? '#34D399' :
                     displayWordClass === 'wrong-feedback' ? '#FF6B81' :
                     '#FFFFFF'
            }]}>
              {displayWord}
            </Text>
          </View>

          <View style={[styles.wordGrid, { gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }]}>
            {gridWords.map((word, index) => renderWordButton(word, index))}
          </View>

          <View style={styles.gameBottom}>
            <TouchableOpacity
              onPress={() => {
                // Toggle language
              }}
              style={[styles.gameBottomButton, { borderColor: 'rgba(211,0,209,0.06)' }]}
            >
              <Globe size={16} color="#E8D0F0" />
              <Text style={[styles.gameBottomButtonText, { color: '#E8D0F0' }]}>
                {language === 'fa' ? '🇬🇧 English' : '🇫🇦 فارسی'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                stopGame();
                setCurrentScreen('menu');
              }}
              style={[styles.gameBottomButton, styles.gameBottomButtonPrimary, { borderColor: 'rgba(52,211,153,0.12)' }]}
            >
              <Home size={16} color="#34D399" />
              <Text style={[styles.gameBottomButtonText, { color: '#34D399' }]}>منو</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Game Over Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: '#2D1547', borderColor: 'rgba(211,0,209,0.08)' }]}>
              <Text style={styles.modalIcon}>{modalIcon}</Text>
              <Text style={[styles.modalTitle, { color: modalTitleColor }]}>{modalTitle}</Text>

              <View style={styles.modalStats}>
                {[
                  { label: 'امتیاز نهایی', value: finalScore },
                  { label: 'مرحله', value: finalLevel },
                  { label: 'دقت', value: finalAccuracy + '%' },
                  { label: 'زمان واکنش', value: finalRT > 0 ? Math.round(finalRT) + ' ms' : '--' },
                ].map((item, index) => (
                  <View key={index} style={[styles.modalStat, { borderColor: 'rgba(211,0,209,0.06)' }]}>
                    <Text style={[styles.modalStatLabel, { color: '#A070B0' }]}>{item.label}</Text>
                    <Text style={[styles.modalStatValue, { color: '#D100D1' }]}>{item.value}</Text>
                    {item.label === 'زمان واکنش' && finalRT > 0 && (
                      <Text style={[styles.modalStatInterpretation, { color: '#A070B0' }]}>
                        {getRTInterpretation(finalRT)}
                      </Text>
                    )}
                  </View>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={restartGame} style={[styles.modalButton, styles.modalButtonPrimary]}>
                  <RotateCcw size={18} color="#FFFFFF" />
                  <Text style={styles.modalButtonText}>دوباره</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                  setModalVisible(false);
                  setCurrentScreen('menu');
                }} style={[styles.modalButton, { borderColor: 'rgba(211,0,209,0.08)' }]}>
                  <Home size={18} color="#E8D0F0" />
                  <Text style={[styles.modalButtonText, { color: '#E8D0F0' }]}>منو</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// ================================================================
// =============== STYLES ================
// ================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    alignItems: 'center',
    gap: 12,
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },

  headerSpacer: {
    width: 42,
  },

  // Menu
  menuScrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
    alignItems: 'center',
  },

  logoSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },

  logoIcon: {
    fontSize: 64,
    marginBottom: 8,
  },

  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
  },

  gradientText: {
    color: '#D100D1',
  },

  mainSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },

  menuButtons: {
    width: '100%',
    maxWidth: 320,
    gap: 10,
  },

  menuButton: {
    padding: 14,
    borderRadius: 60,
    borderWidth: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuButtonPrimary: {
    backgroundColor: 'rgba(209,0,209,0.08)',
  },

  menuButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  menuButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E8D0F0',
  },

  menuButtonTextPrimary: {
    color: '#FFFFFF',
  },

  // Settings
  settingsScrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },

  settingsGroup: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },

  settingsLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },

  settingsOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },

  optionButton: {
    flex: 1,
    minWidth: 70,
    padding: 10,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    gap: 2,
  },

  optionButtonActive: {
    backgroundColor: 'rgba(209,0,209,0.06)',
  },

  optionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  optionButtonSmall: {
    fontSize: 10,
  },

  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(211,0,209,0.06)',
    padding: 2,
  },

  toggleTrackActive: {
    backgroundColor: 'rgba(209,0,209,0.08)',
    borderColor: 'rgba(209,0,209,0.10)',
  },

  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },

  toggleLabel: {
    fontSize: 14,
  },

  saveButton: {
    paddingVertical: 14,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Records
  recordsScrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 40,
  },

  recordsGrid: {
    gap: 10,
  },

  recordCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  recordIcon: {
    fontSize: 28,
  },

  recordInfo: {
    flex: 1,
    alignItems: 'center',
  },

  recordLabel: {
    fontSize: 11,
  },

  recordValue: {
    fontSize: 22,
    fontWeight: '700',
  },

  // Game
  gameContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 20,
  },

  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 8,
    marginBottom: 8,
  },

  gameStats: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },

  gameStatItem: {
    alignItems: 'center',
    minWidth: 40,
  },

  gameStatLabel: {
    fontSize: 6,
    color: '#A070B0',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  gameStatValue: {
    fontSize: 12,
    fontWeight: '700',
  },

  gameCloseButton: {
    padding: 8,
  },

  gameStatusText: {
    textAlign: 'center',
    padding: 6,
    fontSize: 13,
    minHeight: 34,
  },

  wordDisplay: {
    flex: 1,
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  wordText: {
    fontSize: 48,
    fontWeight: '700',
  },

  loadingOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(45,21,71,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  loadingSpinner: {
    width: 40,
    height: 40,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.04)',
    borderTopColor: '#D100D1',
    borderRadius: 20,
  },

  wordGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 8,
  },

  wordButton: {
    flex: 1,
    minWidth: 60,
    padding: 10,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },

  wordButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  gameBottom: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
  },

  gameBottomButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
    minHeight: 36,
  },

  gameBottomButtonPrimary: {
    backgroundColor: 'rgba(52,211,153,0.04)',
  },

  gameBottomButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26,10,42,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  modalContent: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },

  modalIcon: {
    fontSize: 44,
    marginBottom: 4,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },

  modalStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
    width: '100%',
  },

  modalStat: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },

  modalStatLabel: {
    fontSize: 7,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  modalStatValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },

  modalStatInterpretation: {
    fontSize: 10,
    marginTop: 1,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },

  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: 'rgba(211,0,209,0.08)',
  },

  modalButtonPrimary: {
    backgroundColor: 'rgba(209,0,209,0.08)',
    borderColor: 'rgba(209,0,209,0.10)',
  },

  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});