import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Lightbulb } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';
import { StageProps, clampScore } from './types';

const QUESTION_TIME_MS = 15000;

interface Question {
  prompt: { fa: string; en: string };
  options: { fa: string; en: string }[];
  answerIndex: number;
}

const QUESTIONS: Question[] = [
  {
    prompt: { fa: '2، 4، 8، 16، ؟', en: '2, 4, 8, 16, ?' },
    options: [{ fa: '20', en: '20' }, { fa: '24', en: '24' }, { fa: '32', en: '32' }, { fa: '18', en: '18' }],
    answerIndex: 2,
  },
  {
    prompt: { fa: '1، 1، 2، 3، 5، 8، ؟', en: '1, 1, 2, 3, 5, 8, ?' },
    options: [{ fa: '11', en: '11' }, { fa: '13', en: '13' }, { fa: '12', en: '12' }, { fa: '10', en: '10' }],
    answerIndex: 1,
  },
  {
    prompt: { fa: 'کدام یک با بقیه فرق دارد؟\nسیب، موز، صندلی، پرتقال', en: 'Which one is different?\nApple, Banana, Chair, Orange' },
    options: [{ fa: 'سیب', en: 'Apple' }, { fa: 'موز', en: 'Banana' }, { fa: 'صندلی', en: 'Chair' }, { fa: 'پرتقال', en: 'Orange' }],
    answerIndex: 2,
  },
  {
    prompt: { fa: 'کتاب : خواندن  ::  چنگال : ؟', en: 'Book : Read  ::  Fork : ?' },
    options: [{ fa: 'نوشتن', en: 'Write' }, { fa: 'خوردن', en: 'Eat' }, { fa: 'دیدن', en: 'See' }, { fa: 'شنیدن', en: 'Hear' }],
    answerIndex: 1,
  },
  {
    prompt: { fa: '3، 6، 12، 24، ؟', en: '3, 6, 12, 24, ?' },
    options: [{ fa: '30', en: '30' }, { fa: '36', en: '36' }, { fa: '48', en: '48' }, { fa: '20', en: '20' }],
    answerIndex: 2,
  },
  {
    prompt: { fa: '1، 4، 9، 16، ؟', en: '1, 4, 9, 16, ?' },
    options: [{ fa: '20', en: '20' }, { fa: '22', en: '22' }, { fa: '25', en: '25' }, { fa: '30', en: '30' }],
    answerIndex: 2,
  },
];

type Answered = 'correct' | 'wrong' | 'timeout' | null;

export default function LogicPatternStage({ onComplete }: StageProps) {
  const { colors } = useTheme();
  const { language } = useLanguage();

  const [phase, setPhase] = useState<'intro' | 'playing' | 'finished'>('intro');
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState<Answered>(null);

  const timerAnim = useRef(new Animated.Value(1)).current;
  const timerRun = useRef<Animated.CompositeAnimation | null>(null);
  const answeredRef = useRef(false);
  const advanceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      timerRun.current?.stop();
      if (advanceTimeout.current) clearTimeout(advanceTimeout.current);
    };
  }, []);

  const startQuestion = (index: number) => {
    answeredRef.current = false;
    setSelected(null);
    setAnswered(null);
    timerAnim.setValue(1);
    timerRun.current = Animated.timing(timerAnim, { toValue: 0, duration: QUESTION_TIME_MS, useNativeDriver: false });
    timerRun.current.start(({ finished }) => {
      if (finished && !answeredRef.current) {
        handleTimeout();
      }
    });
  };

  const startTest = () => {
    setPhase('playing');
    setQIndex(0);
    setCorrectCount(0);
    startQuestion(0);
  };

  const goNext = (finalCorrectCount: number) => {
    const next = qIndex + 1;
    if (next >= QUESTIONS.length) {
      finishTest(finalCorrectCount);
    } else {
      setQIndex(next);
      startQuestion(next);
    }
  };

  const finishTest = (finalCorrectCount: number) => {
    setPhase('finished');
    const score = clampScore((finalCorrectCount / QUESTIONS.length) * 100);
    const detail = language === 'fa'
      ? `${finalCorrectCount} پاسخ درست از ${QUESTIONS.length} سوال`
      : `${finalCorrectCount} correct out of ${QUESTIONS.length}`;
    setTimeout(() => {
      onComplete({ domain: 'logic', score, detail });
    }, 1400);
  };

  const handleTimeout = () => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    setAnswered('timeout');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    advanceTimeout.current = setTimeout(() => goNext(correctCount), 900);
  };

  const handleSelect = (optionIndex: number) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    timerRun.current?.stop();
    setSelected(optionIndex);

    const isCorrect = optionIndex === QUESTIONS[qIndex].answerIndex;
    setAnswered(isCorrect ? 'correct' : 'wrong');
    Haptics.notificationAsync(isCorrect ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);

    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    if (isCorrect) setCorrectCount(newCorrect);
    advanceTimeout.current = setTimeout(() => goNext(newCorrect), 700);
  };

  if (phase === 'intro') {
    return (
      <View style={styles.container}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '22' }]}>
          <Lightbulb size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          {language === 'fa' ? 'الگویابی و استدلال منطقی' : 'Logic & Pattern Reasoning'}
        </Text>
        <Text style={[styles.desc, { color: colors.textSecondary }]}>
          {language === 'fa'
            ? `${QUESTIONS.length} سوال منطقی و عددی داری، برای هر کدام ۱۵ ثانیه زمان داری. گزینه درست را انتخاب کن.`
            : `You'll get ${QUESTIONS.length} logic/number questions, 15 seconds each. Pick the correct option.`}
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

  const question = QUESTIONS[qIndex];

  return (
    <View style={styles.container}>
      <Text style={[styles.roundText, { color: colors.textSecondary }]}>
        {language === 'fa' ? `سوال ${qIndex + 1} از ${QUESTIONS.length}` : `Question ${qIndex + 1} of ${QUESTIONS.length}`}
      </Text>

      <View style={[styles.timerTrack, { backgroundColor: colors.surfaceSecondary }]}>
        <Animated.View
          style={[
            styles.timerFill,
            {
              backgroundColor: colors.primary,
              width: timerAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>

      <View style={[styles.questionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.questionText, { color: colors.text }]}>{question.prompt[language]}</Text>
      </View>

      <View style={styles.optionsGrid}>
        {question.options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrectOption = answered && idx === question.answerIndex;
          let bg = colors.surfaceSecondary;
          let borderColor = colors.border;
          if (answered) {
            if (isCorrectOption) {
              bg = colors.success + '33';
              borderColor = colors.success;
            } else if (isSelected) {
              bg = colors.error + '33';
              borderColor = colors.error;
            }
          }
          return (
            <TouchableOpacity
              key={idx}
              disabled={!!answered}
              onPress={() => handleSelect(idx)}
              style={[styles.optionButton, { backgroundColor: bg, borderColor }]}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>{opt[language]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: Spacing.lg, width: '100%' },
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
  roundText: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm },
  timerTrack: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: Spacing.lg },
  timerFill: { height: '100%', borderRadius: 3 },
  questionCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    minHeight: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: { fontSize: 20, fontWeight: '800', textAlign: 'center', lineHeight: 30 },
  optionsGrid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  optionButton: {
    width: '48%',
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 4,
  },
  optionText: { fontSize: 16, fontWeight: '700' },
});