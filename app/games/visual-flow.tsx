import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions, PanResponder } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Palette, Target, Zap, BarChart3 } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';

const TOTAL_TRIALS = 30;
const NUM_DOTS = 80;
const DIRECTIONS = ['Up', 'Down', 'Left', 'Right'] as const;

type Direction = typeof DIRECTIONS[number];
type Dot = { x: number; y: number; vx: number; vy: number; color: string; size: number };

const directionTranslation: { [key in Direction]: string } = { Up: 'بالا', Down: 'پایین', Left: 'چپ', Right: 'راست' };
const directionTranslationEn: { [key in Direction]: string } = { Up: 'Up', Down: 'Down', Left: 'Left', Right: 'Right' };
const dotColors = ['#FFD700', '#FF4444', '#00E5D0', '#FFC107', '#8B5CF6', '#FF1493', '#00D4FF', '#FF6B35'];
const random = (min: number, max: number) => Math.random() * (max - min) + min;

export default function VisualFlowScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { language, isRTL } = useLanguage();

  const [tutorialVisible, setTutorialVisible] = useState(true);
  const [trialCount, setTrialCount] = useState(0);
  const [score, setScore] = useState(0);
  const [currentDirection, setCurrentDirection] = useState<Direction | null>(null);
  const [coherence, setCoherence] = useState(0);
  const [trialActive, setTrialActive] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [info, setInfo] = useState(language === 'fa' ? '👆 جهت حرکت دسته‌ی نقاط را تشخیص بده!' : '👆 Identify the direction of the moving dots!');
  const [infoType, setInfoType] = useState<'normal' | 'correct' | 'wrong'>('normal');
  const [dots, setDots] = useState<Dot[]>([]);
  const [results, setResults] = useState<{ correct: boolean; rt: number; coherence: number }[]>([]);
  const [gameStarted, setGameStarted] = useState(false);

  const startTimeRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const directionRef = useRef<Direction | null>(null);
  const coherenceRef = useRef(0);
  const trialActiveRef = useRef(false);
  const gameEndedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;

  const t = {
    title: language === 'fa' ? 'جریان بصری' : 'Visual Flow',
    subtitle: language === 'fa' ? 'جهت حرکت دسته‌ی نقاط را پیدا کن!' : 'Find the main direction of the moving dots!',
    start: language === 'fa' ? 'شروع تست' : 'Start Test',
    back: language === 'fa' ? 'بازگشت' : 'Back',
    correct: language === 'fa' ? 'درسته! 🎉' : 'Correct! 🎉',
    wrong: language === 'fa' ? 'اشتباه!' : 'Wrong!',
    restart: language === 'fa' ? 'شروع دوباره' : 'Restart',
    round: language === 'fa' ? 'دور' : 'Round',
    score: language === 'fa' ? 'امتیاز' : 'Score',
    difficulty: language === 'fa' ? 'سختی' : 'Difficulty',
    correctAnswers: language === 'fa' ? 'پاسخ صحیح' : 'Correct answers',
    accuracy: language === 'fa' ? 'دقت' : 'Accuracy',
    reaction: language === 'fa' ? 'میانگین زمان واکنش' : 'Average reaction time',
    finalScore: language === 'fa' ? 'امتیاز نهایی' : 'Final score',
    finished: language === 'fa' ? '🎯 تست تمام شد!' : '🎯 Test completed!',
  };

  const goBack = () => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (router.canGoBack()) {
      router.back();
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const generateDots = useCallback((width: number, height: number) => {
    const newDots: Dot[] = [];
    for (let i = 0; i < NUM_DOTS; i++) {
      const angle = random(0, Math.PI * 2);
      const speed = random(1.5, 3.5);
      newDots.push({
        x: random(8, width - 8),
        y: random(8, height - 8),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: dotColors[Math.floor(Math.random() * dotColors.length)],
        size: random(3, 5),
      });
    }
    dotsRef.current = newDots;
    setDots([...newDots]);
  }, []);

  const endGame = useCallback(() => {
    gameEndedRef.current = true;
    trialActiveRef.current = false;
    setTrialActive(false);
    setGameEnded(true);

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setInfo(t.finished);
    setInfoType('correct');
  }, [t]);

  const startTrial = useCallback(() => {
    if (trialCount >= TOTAL_TRIALS) {
      endGame();
      return;
    }

    const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    const coh = random(0.2, 0.8);

    directionRef.current = direction;
    coherenceRef.current = coh;

    setCurrentDirection(direction);
    setCoherence(coh);
    setTrialCount(prev => prev + 1);
    setTrialActive(true);
    trialActiveRef.current = true;
    gameEndedRef.current = false;

    startTimeRef.current = Date.now();

    setInfo(language === 'fa' ? '🤔 جهت حرکت را پیدا کن و پاسخ بده!' : '🤔 Find the direction and answer!');
    setInfoType('normal');
  }, [trialCount, language, endGame]);

  const animate = useCallback((width: number, height: number) => {
    if (!trialActiveRef.current || gameEndedRef.current) return;

    const direction = directionRef.current;
    const coh = coherenceRef.current;

    if (!direction) return;

    const vectors: { [key in Direction]: [number, number] } = {
      Up: [0, -2],
      Down: [0, 2],
      Left: [-2, 0],
      Right: [2, 0],
    };

    const [vx, vy] = vectors[direction];

    const updated = dotsRef.current.map(dot => {
      let nextVx = dot.vx;
      let nextVy = dot.vy;

      if (Math.random() < coh) {
        nextVx = vx + random(-0.3, 0.3);
        nextVy = vy + random(-0.3, 0.3);
      } else {
        const angle = random(0, Math.PI * 2);
        const speed = random(1, 3);
        nextVx = Math.cos(angle) * speed;
        nextVy = Math.sin(angle) * speed;
      }

      let x = dot.x + nextVx;
      let y = dot.y + nextVy;

      if (x < 0) x = width;
      if (x > width) x = 0;
      if (y < 0) y = height;
      if (y > height) y = 0;

      return { ...dot, x, y, vx: nextVx, vy: nextVy };
    });

    dotsRef.current = updated;
    setDots([...updated]);

    animationRef.current = requestAnimationFrame(() => animate(width, height));
  }, []);

  const submitAnswer = useCallback((direction: Direction) => {
    if (!trialActiveRef.current || gameEndedRef.current) return;

    trialActiveRef.current = false;
    setTrialActive(false);

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    const reactionTime = Date.now() - startTimeRef.current;
    const correct = direction === directionRef.current;

    setResults(prev => [...prev, { correct, rt: reactionTime, coherence: coherenceRef.current }]);

    if (correct) {
      setScore(prev => prev + 10);
      setInfo(t.correct);
      setInfoType('correct');
    } else {
      const actual = directionRef.current!;
      setInfo(`${t.wrong} ${language === 'fa' ? `جهت اصلی ${directionTranslation[actual]} بود` : `The main direction was ${directionTranslationEn[actual]}`}`);
      setInfoType('wrong');
    }

    timeoutRef.current = setTimeout(() => {
      if (!gameEndedRef.current) {
        if (trialCount >= TOTAL_TRIALS) {
          endGame();
        } else {
          startTrial();
        }
      }
      timeoutRef.current = null;
    }, 800);
  }, [trialCount, t, language, startTrial, endGame]);

  useEffect(() => {
    if (trialActive && dots.length > 0) {
      timeoutRef.current = setTimeout(() => {
        const width = Dimensions.get('window').width - Spacing.lg * 2 - 28;
        const height = Math.min(width * 2 / 3, 280);
        animate(width, height);
        timeoutRef.current = null;
      }, 0);
      return () => {
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }
  }, [trialActive, dots.length, animate]);

  const startGame = () => {
    setTutorialVisible(false);
    setGameEnded(false);
    gameEndedRef.current = false;
    setGameStarted(true);
    setTrialCount(0);
    setScore(0);
    setResults([]);

    timeoutRef.current = setTimeout(() => {
      const width = Dimensions.get('window').width - Spacing.lg * 2 - 28;
      const height = Math.min(width * 2 / 3, 280);
      generateDots(width, height);
      startTrial();
      timeoutRef.current = null;
    }, 300);
  };

  const restartGame = () => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    gameEndedRef.current = false;
    trialActiveRef.current = false;
    setGameEnded(false);
    setTrialActive(false);
    setTrialCount(0);
    setScore(0);
    setResults([]);
    setDots([]);
    setInfo(language === 'fa' ? '👆 جهت حرکت دسته‌ی نقاط را تشخیص بده!' : '👆 Identify the direction of the moving dots!');
    setInfoType('normal');

    timeoutRef.current = setTimeout(startGame, 200);
  };

  const showReport = () => {
    const total = results.length;
    const corrects = results.filter(r => r.correct).length;
    const accuracy = total ? (corrects / total * 100) : 0;
    const correctRT = results.filter(r => r.correct).map(r => r.rt);
    const avgRT = correctRT.length ? correctRT.reduce((a, b) => a + b, 0) / correctRT.length : 0;

    // استفاده از alert ساده
    alert(
      `${t.correctAnswers}: ${corrects} / ${total}\n${t.accuracy}: ${accuracy.toFixed(1)}%\n${t.reaction}: ${avgRT.toFixed(0)}ms\n${t.finalScore}: ${score}`
    );
  };

  useEffect(() => {
    if (gameEnded && results.length >= TOTAL_TRIALS) {
      timeoutRef.current = setTimeout(showReport, 350);
      return () => {
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }
  }, [gameEnded, results]);

  const panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderRelease: (_, gesture) => {
      const { dx, dy } = gesture;
      if (Math.abs(dx) < 15 && Math.abs(dy) < 15) return;
      if (Math.abs(dx) > Math.abs(dy)) submitAnswer(dx > 0 ? 'Right' : 'Left');
      else submitAnswer(dy > 0 ? 'Down' : 'Up');
    },
  })).current;

  const DirectionButton = ({ direction, icon }: { direction: Direction; icon: React.ReactNode }) => (
    <TouchableOpacity
      style={[styles.dirButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => submitAnswer(direction)}
      activeOpacity={0.75}
    >
      {icon}
    </TouchableOpacity>
  );

  if (tutorialVisible) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.tutorialHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            onPress={goBack}
            activeOpacity={0.8}
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
          >
            <ArrowLeft
              size={22}
              color={colors.text}
              style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
            />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
        </View>

        <Animated.View style={[styles.tutorialCard, { backgroundColor: colors.surface, borderColor: colors.border, opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.logo, { backgroundColor: colors.primary + '18' }]}>
            <Target size={38} color={colors.primary} />
          </View>

          <Text style={[styles.tutorialTitle, { color: colors.text }]}>{t.title}</Text>
          <Text style={[styles.tutorialSubtitle, { color: colors.textSecondary }]}>{t.subtitle}</Text>

          <View style={[styles.ruleBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
            <View style={styles.ruleRow}>
              <Palette size={20} color={colors.primary} />
              <Text style={[styles.ruleText, { color: colors.text }]}>{language === 'fa' ? 'نقاط رنگارنگ را تماشا کن' : 'Watch the colorful dots'}</Text>
            </View>
            <View style={styles.ruleRow}>
              <Target size={20} color={colors.primary} />
              <Text style={[styles.ruleText, { color: colors.text }]}>{language === 'fa' ? 'جهت اصلی حرکت را تشخیص بده' : 'Identify their main direction'}</Text>
            </View>
            <View style={styles.ruleRow}>
              <Zap size={20} color={colors.primary} />
              <Text style={[styles.ruleText, { color: colors.text }]}>{language === 'fa' ? 'هر پاسخ درست = ۱۰ امتیاز' : 'Every correct answer = 10 points'}</Text>
            </View>
            <View style={styles.ruleRow}>
              <BarChart3 size={20} color={colors.primary} />
              <Text style={[styles.ruleText, { color: colors.text }]}>{language === 'fa' ? '۳۰ دور با سختی تدریجی' : '30 rounds with increasing difficulty'}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={startGame} activeOpacity={0.85} style={[styles.startButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.startButtonText}>{t.start}</Text>
          </TouchableOpacity>

          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            {language === 'fa' ? '👆 با دکمه‌ها یا کشیدن روی صفحه پاسخ بده' : '👆 Answer using buttons or swipe on the screen'}
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          onPress={goBack}
          activeOpacity={0.8}
          style={[styles.iconButton, { backgroundColor: colors.surface }]}
        >
          <ArrowLeft
            size={22}
            color={colors.text}
            style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
          />
        </TouchableOpacity>

        <View style={[styles.titleContainer, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.headerTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>{t.title}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {trialCount}/{TOTAL_TRIALS}
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      <View
        style={[styles.canvasWrapper, { backgroundColor: colors.surface, borderColor: infoType === 'correct' ? '#34D39955' : infoType === 'wrong' ? '#FF6B8155' : colors.border }]}
        {...panResponder.panHandlers}
      >
        {dots.map((dot, index) => (
          <View
            key={index}
            style={[styles.dot, { left: dot.x, top: dot.y, width: dot.size, height: dot.size, borderRadius: dot.size / 2, backgroundColor: dot.color }]}
          />
        ))}
      </View>

      <View style={styles.infoArea}>
        <Text style={[styles.infoText, { color: infoType === 'correct' ? '#34D399' : infoType === 'wrong' ? '#FF6B81' : colors.textSecondary }]}>
          {info}
        </Text>
      </View>

      <View style={styles.directionButtons}>
        <DirectionButton direction="Up" icon={<ChevronUp size={25} color={colors.text} />} />
        <DirectionButton direction="Down" icon={<ChevronDown size={25} color={colors.text} />} />
        <DirectionButton direction="Left" icon={<ChevronLeft size={25} color={colors.text} />} />
        <DirectionButton direction="Right" icon={<ChevronRight size={25} color={colors.text} />} />
      </View>

      <View style={[styles.statusBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.statusItem}>
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>{t.round}</Text>
          <Text style={[styles.statusValue, { color: colors.text }]}>{trialCount}/{TOTAL_TRIALS}</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>{t.score}</Text>
          <Text style={[styles.statusValue, { color: colors.primary }]}>{score}</Text>
        </View>
        <View style={styles.statusItem}>
          <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>{t.difficulty}</Text>
          <Text style={[styles.statusValue, { color: colors.text }]}>{trialActive ? Math.round(coherence * 100) + '%' : '--'}</Text>
        </View>
      </View>

      {gameEnded && (
        <TouchableOpacity onPress={restartGame} activeOpacity={0.85} style={[styles.restartButton, { backgroundColor: colors.primary }]}>
          <RotateCcw size={18} color="#fff" />
          <Text style={styles.restartText}>{t.restart}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.lg },
  header: { paddingTop: Spacing.lg, paddingBottom: Spacing.md, alignItems: 'center', gap: 12 },
  tutorialHeader: { paddingTop: Spacing.lg, paddingBottom: Spacing.md, alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  headerSpacer: { width: 44 },
  titleContainer: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  tutorialCard: { flex: 1, borderRadius: 28, borderWidth: 1, padding: Spacing.lg, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.lg },
  logo: { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  tutorialTitle: { fontSize: 28, fontWeight: '800' },
  tutorialSubtitle: { fontSize: 14, marginTop: 6, textAlign: 'center' },
  ruleBox: { width: '100%', borderRadius: 18, borderWidth: 1, padding: 16, marginTop: 24, gap: 15 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ruleText: { fontSize: 14, flex: 1 },
  startButton: { marginTop: 24, minWidth: 190, paddingVertical: 14, paddingHorizontal: 30, borderRadius: BorderRadius.full, alignItems: 'center' },
  startButtonText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  hint: { fontSize: 12, marginTop: 12, textAlign: 'center' },
  canvasWrapper: { width: '100%', height: Math.min((Dimensions.get('window').width - Spacing.lg * 2) * 2 / 3, 280), borderRadius: 20, borderWidth: 1, overflow: 'hidden', position: 'relative' },
  dot: { position: 'absolute', shadowOpacity: 0.8, shadowRadius: 8, elevation: 5 },
  infoArea: { minHeight: 58, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  infoText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  directionButtons: { flexDirection: 'row', justifyContent: 'center', gap: 9, flexWrap: 'wrap', marginBottom: 12 },
  dirButton: { width: 58, height: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  statusBar: { height: 54, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  statusItem: { alignItems: 'center', minWidth: 70 },
  statusLabel: { fontSize: 10 },
  statusValue: { fontSize: 14, fontWeight: '800', marginTop: 2 },
  restartButton: { height: 48, borderRadius: 24, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  restartText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});