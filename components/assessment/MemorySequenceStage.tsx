import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BrainCog } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';
import { StageProps, clampScore } from './types';

const { width } = Dimensions.get('window');
const GRID_SIZE = 3;
const CELL_GAP = 10;
const GRID_WIDTH = Math.min(width - Spacing.lg * 2, 320);
const CELL_SIZE = (GRID_WIDTH - CELL_GAP * (GRID_SIZE - 1)) / GRID_SIZE;
const START_LENGTH = 3;
const MAX_LEVELS = 6; // sequence grows to START_LENGTH + MAX_LEVELS - 1
const MAX_LIVES = 3;
const SHOW_INTERVAL = 650;

type Phase = 'intro' | 'showing' | 'input' | 'feedback' | 'finished';

export default function MemorySequenceStage({ onComplete }: StageProps) {
  const { colors } = useTheme();
  const { language } = useLanguage();

  const [phase, setPhase] = useState<Phase>('intro');
  const [sequence, setSequence] = useState<number[]>([]);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [lives, setLives] = useState(MAX_LIVES);
  const [level, setLevel] = useState(0); // 0-indexed round
  const [maxCompletedLength, setMaxCompletedLength] = useState(0);
  const [wrongCell, setWrongCell] = useState<number | null>(null);

  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timeouts.current.forEach(clearTimeout);
    };
  }, []);

  const buildSequence = (length: number) => {
    const seq: number[] = [];
    for (let i = 0; i < length; i++) {
      seq.push(Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE)));
    }
    return seq;
  };

  const playSequence = (seq: number[]) => {
    setPhase('showing');
    setUserInput([]);
    seq.forEach((cell, i) => {
      const t1 = setTimeout(() => setActiveCell(cell), i * SHOW_INTERVAL);
      const t2 = setTimeout(() => setActiveCell(null), i * SHOW_INTERVAL + SHOW_INTERVAL * 0.6);
      timeouts.current.push(t1, t2);
    });
    const endTimeout = setTimeout(() => {
      setPhase('input');
    }, seq.length * SHOW_INTERVAL + 200);
    timeouts.current.push(endTimeout);
  };

  const startTest = () => {
    setLives(MAX_LIVES);
    setLevel(0);
    setMaxCompletedLength(0);
    const seq = buildSequence(START_LENGTH);
    setSequence(seq);
    playSequence(seq);
  };

  const finishTest = (finalMaxLength: number) => {
    setPhase('finished');
    const span = Math.max(0, finalMaxLength - (START_LENGTH - 1));
    const score = clampScore((span / (MAX_LEVELS + 1)) * 100);
    const detail = language === 'fa'
      ? `بلندترین دنباله به‌خاطر سپرده‌شده: ${finalMaxLength} خانه`
      : `Longest recalled sequence: ${finalMaxLength} cells`;
    setTimeout(() => {
      onComplete({ domain: 'memory', score, detail });
    }, 1400);
  };

  const nextLevel = (newMax: number) => {
    const next = level + 1;
    if (next >= MAX_LEVELS) {
      finishTest(newMax);
      return;
    }
    setLevel(next);
    const seq = buildSequence(START_LENGTH + next);
    setSequence(seq);
    setTimeout(() => playSequence(seq), 500);
  };

  const handleCellPress = (index: number) => {
    if (phase !== 'input') return;
    Haptics.selectionAsync();
    const newInput = [...userInput, index];
    const posIndex = newInput.length - 1;

    if (sequence[posIndex] !== index) {
      // wrong tap
      setWrongCell(index);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPhase('feedback');
      setTimeout(() => {
        setWrongCell(null);
        const remainingLives = lives - 1;
        setLives(remainingLives);
        if (remainingLives <= 0) {
          finishTest(maxCompletedLength);
        } else {
          setPhase('input');
          setUserInput([]);
          setTimeout(() => playSequence(sequence), 400);
        }
      }, 700);
      return;
    }

    setUserInput(newInput);
    if (newInput.length === sequence.length) {
      const newMax = Math.max(maxCompletedLength, sequence.length);
      setMaxCompletedLength(newMax);
      setPhase('feedback');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => nextLevel(newMax), 600);
    }
  };

  if (phase === 'intro') {
    return (
      <View style={styles.container}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '22' }]}>
          <BrainCog size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          {language === 'fa' ? 'حافظه کاری' : 'Working Memory'}
        </Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          {language === 'fa'
            ? 'دنباله‌ای از خانه‌های روشن‌شده را با دقت نگاه کن، سپس همان ترتیب را با لمس خانه‌ها تکرار کن. هر دور یک خانه به دنباله اضافه می‌شود.'
            : 'Watch the sequence of highlighted cells, then tap them back in the same order. The sequence grows every round.'}
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
      <View style={styles.statsRow}>
        <Text style={[styles.statText, { color: colors.textSecondary }]}>
          {language === 'fa' ? `طول دنباله: ${sequence.length}` : `Length: ${sequence.length}`}
        </Text>
        <Text style={[styles.statText, { color: colors.error }]}>
          {'❤️'.repeat(lives)}
        </Text>
      </View>

      <Text style={[styles.hint, { color: colors.textTertiary }]}>
        {phase === 'showing'
          ? (language === 'fa' ? 'با دقت نگاه کن…' : 'Watch carefully…')
          : (language === 'fa' ? 'حالا به همان ترتیب لمس کن' : 'Now repeat the order')}
      </Text>

      <View style={[styles.grid, { width: GRID_WIDTH, height: GRID_WIDTH }]}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
          const isActive = activeCell === idx;
          const isWrong = wrongCell === idx;
          let bg = colors.surfaceSecondary;
          if (isActive) bg = colors.primary;
          if (isWrong) bg = colors.error;
          return (
            <TouchableOpacity
              key={idx}
              disabled={phase !== 'input'}
              onPress={() => handleCellPress(idx)}
              style={[
                styles.cell,
                {
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  marginRight: (idx + 1) % GRID_SIZE === 0 ? 0 : CELL_GAP,
                  marginBottom: CELL_GAP,
                  backgroundColor: bg,
                  borderColor: colors.border,
                },
              ]}
            />
          );
        })}
      </View>
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: GRID_WIDTH,
    marginBottom: Spacing.sm,
  },
  statText: { fontSize: 14, fontWeight: '700' },
  hint: { fontSize: 13, marginBottom: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { borderRadius: BorderRadius.md, borderWidth: 1 },
});
