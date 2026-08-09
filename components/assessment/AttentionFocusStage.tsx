import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Eye } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';
import { StageProps, clampScore } from './types';

const TARGET_LETTER = 'X';
const DISTRACTORS = ['A', 'B', 'K', 'M', 'H', 'E', 'T', 'Z'];
const TOTAL_TRIALS = 16;
const TRIAL_DURATION = 950;
const GAP_DURATION = 200;
const TARGET_RATIO = 0.375; // ~6 of 16

type Phase = 'intro' | 'gap' | 'trial' | 'finished';

function buildTrials(): boolean[] {
  const targetCount = Math.round(TOTAL_TRIALS * TARGET_RATIO);
  const arr = [
    ...Array(targetCount).fill(true),
    ...Array(TOTAL_TRIALS - targetCount).fill(false),
  ];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomDistractor() {
  return DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)];
}

export default function AttentionFocusStage({ onComplete }: StageProps) {
  const { colors } = useTheme();
  const { language } = useLanguage();

  const [phase, setPhase] = useState<Phase>('intro');
  const [trialIndex, setTrialIndex] = useState(0);
  const [letter, setLetter] = useState('');
  const [isTargetTrial, setIsTargetTrial] = useState(false);
  const [flash, setFlash] = useState<'hit' | 'falseAlarm' | null>(null);

  const trialsRef = useRef<boolean[]>([]);
  const tappedRef = useRef(false);
  const hitsRef = useRef(0);
  const missesRef = useRef(0);
  const falseAlarmsRef = useRef(0);
  const targetCountRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const runTrial = (index: number) => {
    if (index >= TOTAL_TRIALS) {
      finish();
      return;
    }
    const isTarget = trialsRef.current[index];
    if (isTarget) targetCountRef.current += 1;
    tappedRef.current = false;
    setIsTargetTrial(isTarget);
    setLetter(isTarget ? TARGET_LETTER : randomDistractor());
    setPhase('trial');
    setTrialIndex(index);

    timeoutRef.current = setTimeout(() => {
      if (isTarget && !tappedRef.current) {
        missesRef.current += 1;
      }
      setPhase('gap');
      setLetter('');
      timeoutRef.current = setTimeout(() => runTrial(index + 1), GAP_DURATION);
    }, TRIAL_DURATION);
  };

  const startTest = () => {
    trialsRef.current = buildTrials();
    hitsRef.current = 0;
    missesRef.current = 0;
    falseAlarmsRef.current = 0;
    targetCountRef.current = 0;
    runTrial(0);
  };

  const finish = () => {
    setPhase('finished');
    const targets = Math.max(1, targetCountRef.current);
    const raw = ((hitsRef.current - falseAlarmsRef.current) / targets) * 100;
    const score = clampScore(raw);
    const detail = language === 'fa'
      ? `${hitsRef.current} تشخیص درست، ${falseAlarmsRef.current} خطای اشتباه`
      : `${hitsRef.current} correct hits, ${falseAlarmsRef.current} false alarms`;
    setTimeout(() => {
      onComplete({ domain: 'attention', score, detail });
    }, 1400);
  };

  const handleTap = () => {
    if (phase !== 'trial' || tappedRef.current) return;
    tappedRef.current = true;
    if (isTargetTrial) {
      hitsRef.current += 1;
      setFlash('hit');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      falseAlarmsRef.current += 1;
      setFlash('falseAlarm');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    setTimeout(() => setFlash(null), 250);
  };

  if (phase === 'intro') {
    return (
      <View style={styles.container}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '22' }]}>
          <Eye size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          {language === 'fa' ? 'تمرکز و توجه پایدار' : 'Sustained Attention'}
        </Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          {language === 'fa'
            ? `حروف مختلف به‌سرعت روی صفحه ظاهر می‌شوند. فقط وقتی حرف «${TARGET_LETTER}» را دیدی روی دکمه ضربه بزن، برای بقیه حروف کاری نکن.`
            : `Letters will flash quickly on screen. Tap the button only when you see "${TARGET_LETTER}", and do nothing for other letters.`}
        </Text>
        <TouchableOpacity style={[styles.startButton, { backgroundColor: colors.primary }]} onPress={startTest}>
          <Text style={styles.startButtonText}>{language === 'fa' ? 'شروع مرحله' : 'Start Stage'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'finished') {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.success }]}>
          {language === 'fa' ? 'مرحله تمام شد ✔' : 'Stage complete ✔'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.roundText, { color: colors.textSecondary }]}>
        {language === 'fa'
          ? `مورد ${Math.min(trialIndex + 1, TOTAL_TRIALS)} از ${TOTAL_TRIALS}`
          : `Item ${Math.min(trialIndex + 1, TOTAL_TRIALS)} of ${TOTAL_TRIALS}`}
      </Text>

      <View style={[styles.letterBox, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
        <Text style={[styles.letterText, { color: colors.text }]}>{letter}</Text>
      </View>

      <TouchableOpacity
        onPress={handleTap}
        activeOpacity={0.8}
        style={[
          styles.tapButton,
          {
            backgroundColor:
              flash === 'hit' ? colors.success : flash === 'falseAlarm' ? colors.error : colors.primary,
          },
        ]}
      >
        <Text style={styles.tapButtonText}>
          {language === 'fa' ? `وقتی «${TARGET_LETTER}» دیدی بزن` : `Tap for "${TARGET_LETTER}"`}
        </Text>
      </TouchableOpacity>
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
  startButton: { paddingVertical: 14, paddingHorizontal: Spacing.xl, borderRadius: BorderRadius.full },
  startButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  roundText: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.lg },
  letterBox: {
    width: 140,
    height: 140,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  letterText: { fontSize: 64, fontWeight: '900' },
  tapButton: {
    paddingVertical: 18,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    minWidth: 220,
    alignItems: 'center',
  },
  tapButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});