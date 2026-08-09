import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Play, CheckCircle, XCircle } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';

export default function CalmBreathingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { language, isRTL } = useLanguage();

  const [isStarted, setIsStarted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [seconds, setSeconds] = useState(4);
  const [round, setRound] = useState(1);

  const TOTAL_ROUNDS = 10;

  const scale = useRef(new Animated.Value(0.65)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const startGame = () => {
    setIsStarted(true);
    setIsRunning(true);
    setRound(1);
    setPhase('inhale');
    setSeconds(4);
  };

  const restartGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRound(1);
    setPhase('inhale');
    setSeconds(4);
    setIsStarted(true);
    setIsRunning(true);
  };

  useEffect(() => {
    if (!isRunning) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev > 1) return prev - 1;

        if (phase === 'inhale') {
          setPhase('hold');
          return 4;
        }

        if (phase === 'hold') {
          setPhase('exhale');
          return 6;
        }

        if (round >= TOTAL_ROUNDS) {
          setIsRunning(false);
          return 0;
        }

        setRound(prevRound => prevRound + 1);
        setPhase('inhale');
        return 4;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, phase, round]);

  useEffect(() => {
    if (!isRunning) return;

    const target = phase === 'inhale' ? 1.15 : phase === 'hold' ? 1.15 : 0.65;
    const duration = phase === 'inhale' ? 4000 : phase === 'hold' ? 4000 : 6000;

    Animated.timing(scale, {
      toValue: target,
      duration,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start();

    Animated.timing(opacity, {
      toValue: phase === 'hold' ? 1 : 0.75,
      duration,
      useNativeDriver: true,
    }).start();
  }, [phase, isRunning]);

  function easingDuration(duration: number) { return duration; }

  const phaseText = language === 'fa'
    ? phase === 'inhale' ? 'دم' : phase === 'hold' ? 'نگه دار' : 'بازدم'
    : phase === 'inhale' ? 'Inhale' : phase === 'hold' ? 'Hold' : 'Exhale';

  const phaseDescription = language === 'fa'
    ? phase === 'inhale' ? 'آرام نفس بکش و ریه‌هایت را پر کن'
      : phase === 'hold' ? 'نفست را آرام نگه دار'
        : 'آرام و کامل نفس را بیرون بده'
    : phase === 'inhale' ? 'Breathe in slowly and deeply'
      : phase === 'hold' ? 'Hold your breath gently'
        : 'Breathe out slowly and completely';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          onPress={goBack}
          activeOpacity={0.7}
          style={[styles.iconButton, { backgroundColor: colors.surface }]}
        >
          <ArrowLeft
            size={22}
            color={colors.text}
            style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
          />
        </TouchableOpacity>

        <View style={[styles.headerCenter, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.headerTitle, { color: colors.text, textAlign: isRTL ? 'right' : 'left' }]}>
            {language === 'fa' ? 'تنفس آرام' : 'Calm Breathing'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {language === 'fa' ? 'تمرین تنفس و آرام‌سازی' : 'Relaxation breathing exercise'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsMuted(v => !v)}
          activeOpacity={0.8}
          style={[styles.iconButton, { backgroundColor: colors.surface }]}
        >
          {isMuted ? <VolumeX size={20} color={colors.text} /> : <Volume2 size={20} color={colors.text} />}
        </TouchableOpacity>
      </View>

      {!isStarted ? (
        <View style={styles.startScreen}>
          <View style={[styles.heroCircle, { backgroundColor: colors.primary + '18' }]}>
            <Text style={styles.heroEmoji}>🌿</Text>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {language === 'fa' ? 'آرام نفس بکش' : 'Breathe & Relax'}
          </Text>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {language === 'fa'
              ? 'با یک تمرین ساده تنفس، ذهن و بدن خود را آرام کنید.'
              : 'Calm your mind and body with a simple guided breathing exercise.'}
          </Text>

          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              {language === 'fa' ? 'نحوه انجام' : 'How it works'}
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {language === 'fa'
                ? '۴ ثانیه دم، ۴ ثانیه نگه داشتن و ۶ ثانیه بازدم. این چرخه ۱۰ بار تکرار می‌شود.'
                : 'Inhale for 4 seconds, hold for 4 seconds, and exhale for 6 seconds. Repeat for 10 rounds.'}
            </Text>
          </View>

          <TouchableOpacity
            onPress={startGame}
            activeOpacity={0.85}
            style={[styles.startButton, { backgroundColor: colors.primary }]}
          >
            <Play size={20} color="#fff" fill="#fff" />
            <Text style={styles.startButtonText}>
              {language === 'fa' ? 'شروع تمرین' : 'Start Exercise'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameArea}>
          <View style={[styles.progressCard, { backgroundColor: colors.surface }]}>
            <View style={styles.progressTop}>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {language === 'fa' ? 'دور' : 'Round'} {round} / {TOTAL_ROUNDS}
              </Text>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {seconds}s
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.background }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${Math.min((round / TOTAL_ROUNDS) * 100, 100)}%` }]} />
            </View>
          </View>

          <View style={styles.breathingArea}>
            <Animated.View style={[styles.outerCircle, { backgroundColor: colors.primary + '12', transform: [{ scale }] }]}>
              <Animated.View style={[styles.innerCircle, { backgroundColor: colors.primary, opacity, transform: [{ scale }] }]}>
                <Text style={styles.breathEmoji}>
                  {phase === 'inhale' ? '🌬️' : phase === 'hold' ? '✨' : '🍃'}
                </Text>
              </Animated.View>
            </Animated.View>

            <Text style={[styles.phaseText, { color: colors.text }]}>
              {phaseText}
            </Text>

            <Text style={[styles.secondsText, { color: colors.primary }]}>
              {seconds}
            </Text>

            <Text style={[styles.phaseDescription, { color: colors.textSecondary }]}>
              {phaseDescription}
            </Text>
          </View>

          {!isRunning && round >= TOTAL_ROUNDS ? (
            <View style={styles.resultArea}>
              <CheckCircle size={48} color={colors.primary} />
              <Text style={[styles.resultTitle, { color: colors.text }]}>
                {language === 'fa' ? 'تمرین تمام شد!' : 'Exercise Complete!'}
              </Text>
              <Text style={[styles.resultText, { color: colors.textSecondary }]}>
                {language === 'fa'
                  ? 'آفرین! چند دقیقه برای آرامش خودت وقت گذاشتی.'
                  : 'Great job! You took a few minutes to relax and reset.'}
              </Text>
              <TouchableOpacity
                onPress={restartGame}
                activeOpacity={0.85}
                style={[styles.restartButton, { backgroundColor: colors.primary }]}
              >
                <RotateCcw size={18} color="#fff" />
                <Text style={styles.startButtonText}>
                  {language === 'fa' ? 'شروع دوباره' : 'Restart'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setIsRunning(false)}
              activeOpacity={0.8}
              style={[styles.pauseButton, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.pauseText, { color: colors.text }]}>
                {language === 'fa' ? 'توقف تمرین' : 'Pause'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    alignItems: 'center',
    gap: 12,
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerCenter: { flex: 1 },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },

  headerSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },

  startScreen: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },

  heroEmoji: { fontSize: 58 },

  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },

  description: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 340,
  },

  infoCard: {
    width: '100%',
    borderRadius: 20,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
  },

  infoTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },

  infoText: {
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 8,
  },

  startButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.lg,
  },

  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  gameArea: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },

  progressCard: {
    borderRadius: 18,
    padding: 14,
  },

  progressTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressText: {
    fontSize: 13,
    fontWeight: '600',
  },

  progressTrack: {
    height: 7,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },

  progressFill: {
    height: '100%',
    borderRadius: 10,
  },

  breathingArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  outerCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    alignItems: 'center',
    justifyContent: 'center',
  },

  innerCircle: {
    width: 175,
    height: 175,
    borderRadius: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },

  breathEmoji: { fontSize: 48 },

  phaseText: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 28,
  },

  secondsText: {
    fontSize: 54,
    fontWeight: '800',
    marginTop: 4,
  },

  phaseDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
  },

  pauseButton: {
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },

  pauseText: {
    fontSize: 15,
    fontWeight: '700',
  },

  resultArea: {
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },

  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 12,
  },

  resultText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },

  restartButton: {
    marginTop: 16,
    minWidth: 180,
    height: 48,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});