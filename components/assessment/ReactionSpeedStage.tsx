import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Zap } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';
import { StageProps, clampScore } from './types';

const { width } = Dimensions.get('window');
const BOX_SIZE = Math.min(width - Spacing.lg * 2, 340);
const TARGET_SIZE = 84;
const TOTAL_ROUNDS = 5;

type Phase = 'intro' | 'waiting' | 'target' | 'early' | 'finished';

export default function ReactionSpeedStage({ onComplete }: StageProps) {
  const { colors } = useTheme();
  const { language } = useLanguage();

  const [phase, setPhase] = useState<Phase>('intro');
  const [round, setRound] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [lastTime, setLastTime] = useState<number | null>(null);
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });

  const appearAt = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const scheduleTarget = () => {
    setPhase('waiting');
    const delay = 1000 + Math.random() * 2200;
    timeoutRef.current = setTimeout(() => {
      const maxX = BOX_SIZE - TARGET_SIZE;
      const maxY = BOX_SIZE - TARGET_SIZE;
      setTargetPos({ x: Math.random() * maxX, y: Math.random() * maxY });
      appearAt.current = Date.now();
      setPhase('target');
      scale.setValue(0);
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 90, useNativeDriver: true }).start();
    }, delay);
  };

  const startTest = () => {
    setTimes([]);
    setRound(0);
    scheduleTarget();
  };

  const finishRounds = (allTimes: number[]) => {
    const valid = allTimes.filter((t) => t < 1200);
    const avg = valid.length > 0
      ? valid.reduce((a, b) => a + b, 0) / valid.length
      : 1200;
    const score = clampScore(100 - (avg - 220) / 7);
    setPhase('finished');
    const detail = language === 'fa'
      ? `میانگین زمان واکنش: ${Math.round(avg)} میلی‌ثانیه`
      : `Average reaction time: ${Math.round(avg)} ms`;
    setTimeout(() => {
      onComplete({ domain: 'speed', score, detail });
    }, 1400);
  };

  const handleBoxPress = () => {
    if (phase === 'waiting') {
      // tapped too early
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setPhase('early');
      const newTimes = [...times, 1200];
      setTimes(newTimes);
      setTimeout(() => {
        const next = round + 1;
        setRound(next);
        if (next >= TOTAL_ROUNDS) {
          finishRounds(newTimes);
        } else {
          scheduleTarget();
        }
      }, 700);
    }
  };

  const handleTargetPress = () => {
    if (phase !== 'target') return;
    const rt = Date.now() - appearAt.current;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLastTime(rt);
    const newTimes = [...times, rt];
    setTimes(newTimes);
    const next = round + 1;
    setRound(next);
    if (next >= TOTAL_ROUNDS) {
      finishRounds(newTimes);
    } else {
      scheduleTarget();
    }
  };

  if (phase === 'intro') {
    return (
      <View style={styles.container}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '22' }]}>
          <Zap size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          {language === 'fa' ? 'سرعت واکنش ذهنی' : 'Reaction Speed'}
        </Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          {language === 'fa'
            ? 'به محض ظاهر شدن دایره بنفش روی صفحه، در سریع‌ترین زمان ممکن روی آن ضربه بزن. مراقب باش زودتر از موعد لمس نکنی!'
            : 'As soon as the purple circle appears, tap it as fast as you can. Don\'t tap too early!'}
        </Text>
        <TouchableOpacity style={[styles.startButton, { backgroundColor: colors.primary }]} onPress={startTest}>
          <Text style={styles.startButtonText}>{language === 'fa' ? 'شروع مرحله' : 'Start Stage'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.roundText, { color: colors.textSecondary }]}>
        {language === 'fa'
          ? `دور ${Math.min(round + 1, TOTAL_ROUNDS)} از ${TOTAL_ROUNDS}`
          : `Round ${Math.min(round + 1, TOTAL_ROUNDS)} of ${TOTAL_ROUNDS}`}
      </Text>

      <TouchableOpacity
        activeOpacity={1}
        onPress={handleBoxPress}
        style={[
          styles.playArea,
          {
            width: BOX_SIZE,
            height: BOX_SIZE,
            backgroundColor: colors.surfaceSecondary,
            borderColor: colors.border,
          },
        ]}
      >
        {phase === 'waiting' && (
          <Text style={[styles.hint, { color: colors.textTertiary }]}>
            {language === 'fa' ? 'آماده باش…' : 'Get ready…'}
          </Text>
        )}
        {phase === 'early' && (
          <Text style={[styles.hint, { color: colors.error }]}>
            {language === 'fa' ? 'زودتر از موعد! دوباره تلاش کن' : 'Too early! Try again'}
          </Text>
        )}
        {phase === 'finished' && lastTime !== null && (
          <Text style={[styles.hint, { color: colors.success }]}>
            {language === 'fa' ? 'مرحله تمام شد ✔' : 'Stage complete ✔'}
          </Text>
        )}
        {phase === 'target' && (
          <Animated.View
            style={[
              styles.target,
              {
                left: targetPos.x,
                top: targetPos.y,
                backgroundColor: colors.primary,
                transform: [{ scale }],
              },
            ]}
          >
            <TouchableOpacity style={styles.targetTouch} onPress={handleTargetPress} />
          </Animated.View>
        )}
      </TouchableOpacity>

      {lastTime !== null && phase !== 'finished' && (
        <Text style={[styles.lastTime, { color: colors.textSecondary }]}>
          {language === 'fa' ? `آخرین زمان: ${lastTime} میلی‌ثانیه` : `Last: ${lastTime} ms`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: Spacing.lg },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: { fontSize: 22, fontWeight: '800', marginBottom: Spacing.sm, textAlign: 'center' },
  desc: { fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: Spacing.lg },
  startButton: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
  },
  startButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  roundText: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.md },
  playArea: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { fontSize: 16, fontWeight: '700', textAlign: 'center', paddingHorizontal: 20 },
  target: {
    position: 'absolute',
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
  },
  targetTouch: { width: '100%', height: '100%' },
  lastTime: { marginTop: Spacing.md, fontSize: 13 },
});
