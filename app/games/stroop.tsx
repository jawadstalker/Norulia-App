import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trophy, Zap, Clock } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';

const { width } = Dimensions.get('window');

type ColorDef = {
  key: string;
  en: string;
  fa: string;
  hex: string;
};

const COLOR_POOL: ColorDef[] = [
  { key: 'red', en: 'RED', fa: 'قرمز', hex: '#EF4444' },
  { key: 'blue', en: 'BLUE', fa: 'آبی', hex: '#3B82F6' },
  { key: 'green', en: 'GREEN', fa: 'سبز', hex: '#22C55E' },
  { key: 'yellow', en: 'YELLOW', fa: 'زرد', hex: '#EAB308' },
  { key: 'purple', en: 'PURPLE', fa: 'بنفش', hex: '#A855F7' },
  { key: 'orange', en: 'ORANGE', fa: 'نارنجی', hex: '#F97316' },
  { key: 'pink', en: 'PINK', fa: 'صورتی', hex: '#EC4899' },
  { key: 'cyan', en: 'CYAN', fa: 'فیروزه‌ای', hex: '#06B6D4' },
];

type Level = {
  name: string;
  nameFa: string;
  colorCount: number;
  roundTime: number;
  totalRounds: number;
};

const LEVELS: Level[] = [
  { name: 'Easy', nameFa: 'آسان', colorCount: 4, roundTime: 4000, totalRounds: 12 },
  { name: 'Medium', nameFa: 'متوسط', colorCount: 5, roundTime: 3000, totalRounds: 15 },
  { name: 'Hard', nameFa: 'سخت', colorCount: 6, roundTime: 2200, totalRounds: 18 },
  { name: 'Extreme', nameFa: 'حرفه‌ای', colorCount: 8, roundTime: 1600, totalRounds: 20 },
];

type ScorePopup = {
  id: number;
  value: number;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
  color: string;
  size: number;
  anim: Animated.Value;
};

const PARTICLE_COUNT = 10;

function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function StroopTestScreen() {
  const { colors } = useTheme();
  const { t, language, isRTL } = useLanguage();
  const router = useRouter();

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [roundIndex, setRoundIndex] = useState(0);
  const [wordKey, setWordKey] = useState<string>('red');
  const [inkKey, setInkKey] = useState<string>('blue');
  const [options, setOptions] = useState<ColorDef[]>([]);
  const [popups, setPopups] = useState<ScorePopup[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [flashColor, setFlashColor] = useState('#EF4444');

  const level = selectedLevel !== null ? LEVELS[selectedLevel] : LEVELS[0];
  const textAlignStyle = isRTL ? 'right' : 'left';
  const colorName = (c: ColorDef) => (language === 'fa' ? c.fa : c.en);
  const wordColor = COLOR_POOL.find((c) => c.key === wordKey) || COLOR_POOL[0];
  const inkColor = COLOR_POOL.find((c) => c.key === inkKey) || COLOR_POOL[1];

  const roundIdRef = useRef(0);
  const answeredRef = useRef(false);
  const popupId = useRef(0);
  const particleId = useRef(0);
  const buttonLayouts = useRef<Record<string, { x: number; y: number; w: number; h: number }>>({});
  const timerAnim = useRef(new Animated.Value(1)).current;
  const timerRunRef = useRef<Animated.CompositeAnimation | null>(null);
  const wordScale = useRef(new Animated.Value(0.7)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      timerRunRef.current?.stop();
    };
  }, []);

  const getLevelDescription = (index: number) => {
    if (language === 'fa') {
      const descriptions = [
        'چهار رنگ ساده، زمان کافی',
        'پنج رنگ، کمی سریع‌تر',
        'شش رنگ، زمان محدود',
        'هشت رنگ، سرعت بالا',
      ];
      return descriptions[index] || '';
    }
    const descriptions = [
      'Four simple colors, plenty of time',
      'Five colors, a bit faster',
      'Six colors, limited time',
      'Eight colors, high speed',
    ];
    return descriptions[index] || '';
  };

  const triggerFlash = (color: string) => {
    setFlashColor(color);
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 70, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  };

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start();
  };

  const spawnPopup = (value: number) => {
    const id = popupId.current++;
    setPopups((prev) => [...prev, { id, value }]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, 700);
  };

  const spawnExplosion = (centerX: number, centerY: number, color: string) => {
    const newParticles: Particle[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() * 0.4 - 0.2);
      const distance = 30 + Math.random() * 40;
      const size = 5 + Math.random() * 7;
      const id = particleId.current++;
      const anim = new Animated.Value(0);

      newParticles.push({ id, x: centerX, y: centerY, angle, distance, color, size, anim });
    }

    setParticles((prev) => [...prev, ...newParticles]);

    newParticles.forEach((particle) => {
      Animated.timing(particle.anim, {
        toValue: 1,
        duration: 450 + Math.random() * 100,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setParticles((prev) => prev.filter((p) => p.id !== particle.id));
        }
      });
    });
  };

  const beginRound = (currentLevel: Level) => {
    roundIdRef.current += 1;
    const thisRoundId = roundIdRef.current;
    answeredRef.current = false;

    const pool = COLOR_POOL.slice(0, currentLevel.colorCount);
    const word = pool[Math.floor(Math.random() * pool.length)];
    const inkCandidates = pool.filter((c) => c.key !== word.key);
    const ink = inkCandidates[Math.floor(Math.random() * inkCandidates.length)];

    setWordKey(word.key);
    setInkKey(ink.key);
    setOptions(shuffle(pool));

    wordScale.setValue(0.7);
    Animated.spring(wordScale, {
      toValue: 1,
      friction: 5,
      tension: 70,
      useNativeDriver: true,
    }).start();

    timerAnim.setValue(1);
    timerRunRef.current = Animated.timing(timerAnim, {
      toValue: 0,
      duration: currentLevel.roundTime,
      useNativeDriver: false,
    });
    timerRunRef.current.start(({ finished }) => {
      if (finished && !answeredRef.current && thisRoundId === roundIdRef.current) {
        handleTimeout(thisRoundId);
      }
    });
  };

  const proceedToNext = (currentLevel: Level) => {
    setRoundIndex((prev) => {
      const next = prev + 1;
      if (next >= currentLevel.totalRounds) {
        endGame(true);
        return prev;
      }
      beginRound(currentLevel);
      return next;
    });
  };

  const handleTimeout = (roundId: number) => {
    if (roundId !== roundIdRef.current) return;
    answeredRef.current = true;

    triggerFlash('#EF4444');
    triggerShake();
    spawnPopup(-5);
    setScore((prev) => prev - 5);

    setLives((prev) => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setTimeout(() => endGame(false), 500);
      } else {
        setTimeout(() => proceedToNext(level), 500);
      }
      return newLives;
    });
  };

  const handleAnswer = (selected: ColorDef) => {
    if (!playing || answeredRef.current) return;
    answeredRef.current = true;
    timerRunRef.current?.stop();

    const layout = buttonLayouts.current[selected.key];
    const centerX = layout ? layout.x + layout.w / 2 : width / 2;
    const centerY = layout ? layout.y + layout.h / 2 : 0;
    const isCorrect = selected.key === inkKey;

    if (isCorrect) {
      spawnExplosion(centerX, centerY, inkColor.hex);
      spawnPopup(10);
      setScore((prev) => prev + 10);
      setTimeout(() => proceedToNext(level), 400);
    } else {
      triggerFlash('#EF4444');
      triggerShake();
      spawnPopup(-5);
      setScore((prev) => prev - 5);

      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setTimeout(() => endGame(false), 500);
        } else {
          setTimeout(() => proceedToNext(level), 500);
        }
        return newLives;
      });
    }
  };

  const startGame = (levelIndex: number) => {
    setSelectedLevel(levelIndex);
    setPlaying(true);
    setGameOver(false);
    setCompleted(false);
    setScore(0);
    setLives(3);
    setRoundIndex(0);
    setPopups([]);
    setParticles([]);
    buttonLayouts.current = {};

    requestAnimationFrame(() => beginRound(LEVELS[levelIndex]));
  };

  const endGame = (success: boolean) => {
    timerRunRef.current?.stop();
    setPlaying(false);
    if (success) {
      setCompleted(true);
    } else {
      setGameOver(true);
    }
  };

  const recordLayout = (key: string) => (e: LayoutChangeEvent) => {
    const { x, y, width: w, height: h } = e.nativeEvent.layout;
    buttonLayouts.current[key] = { x, y, w, h };
  };

  const timerWidth = timerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const shakeTranslate = shakeAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-8, 0, 8],
  });

  if (!playing && selectedLevel === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              backgroundColor: colors.surface,
              flexDirection: isRTL ? 'row-reverse' : 'row',
            },
          ]}
        >
          <ArrowLeft
            size={20}
            color={colors.text}
            style={isRTL ? { transform: [{ scaleX: -1 }] } : {}}
          />
          <Text style={[styles.backText, { color: colors.text, textAlign: textAlignStyle }]}>
            {t.back}
          </Text>
        </TouchableOpacity>

        <View style={styles.levelHeader}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
            <Zap size={32} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.text, textAlign: 'center' }]}>
            {language === 'fa' ? 'استروپ دیجیتال' : 'Digital Stroop'}
          </Text>
        </View>

        <View style={[styles.instructionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.instructionTitle, { color: colors.text, textAlign: textAlignStyle }]}>
            {t.howToPlay || (language === 'fa' ? 'راهنما' : 'How to play')}
          </Text>

          {(language === 'fa'
            ? [
                'یک کلمه‌ی رنگ (مثلاً «قرمز») را می‌بینید',
                'که با رنگی متفاوت نوشته شده است.',
                'شما باید رنگ جوهر را انتخاب کنید، نه کلمه را!',
              ]
            : [
                'You will see a color word (e.g. "RED")',
                'written in a different ink color.',
                'You must pick the ink color, not the word!',
              ]
          ).map((line, i) => (
            <View key={i} style={[styles.instructionRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.instructionDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.instructionText, { color: colors.textSecondary, textAlign: textAlignStyle }]}>
                {line}
              </Text>
            </View>
          ))}

          <View style={[styles.exampleBox, { borderColor: colors.border }]}>
            <Text style={[styles.exampleWord, { color: '#3B82F6' }]}>
              {language === 'fa' ? 'قرمز' : 'RED'}
            </Text>
            <Text style={[styles.exampleArrow, { color: colors.textSecondary }]}>
              {isRTL ? '←' : '→'}
            </Text>
            <View style={[styles.exampleAnswer, { backgroundColor: '#3B82F6' }]}>
              <Text style={styles.exampleAnswerText}>
                {language === 'fa' ? 'آبی' : 'BLUE'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.levels}>
          {LEVELS.map((item, index) => (
            <TouchableOpacity
              key={item.name}
              onPress={() => startGame(index)}
              activeOpacity={0.8}
              style={[
                styles.levelCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <View style={[styles.levelNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.levelNumberText}>{index + 1}</Text>
              </View>

              <View style={isRTL ? styles.levelInfoRTL : styles.levelInfo}>
                <Text style={[styles.levelTitle, { color: colors.text, textAlign: textAlignStyle }]}>
                  {language === 'fa' ? item.nameFa : item.name}
                </Text>
                <Text style={[styles.levelDescription, { color: colors.textSecondary, textAlign: textAlignStyle }]}>
                  {getLevelDescription(index)}
                </Text>
              </View>

              <Zap
                size={20}
                color={
                  index === 0
                    ? colors.success
                    : index === 1
                    ? colors.warning
                    : colors.error
                }
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.gameContainer,
        { backgroundColor: colors.background, transform: [{ translateX: shakeTranslate }] },
      ]}
    >
      <View style={[styles.gameHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={styles.stat}>
          <Text style={[styles.lifeIcon, { color: colors.error }]}>❤️</Text>
          <Text style={[styles.statText, { color: colors.text }]}>{lives}</Text>
        </View>

        <View style={styles.stat}>
          <Trophy size={20} color={colors.warning} />
          <Text style={[styles.statText, { color: colors.text }]}>{score}</Text>
        </View>

        <View style={styles.stat}>
          <Clock size={18} color={colors.textSecondary} />
          <Text style={[styles.statText, { color: colors.text }]}>
            {roundIndex + 1}/{level.totalRounds}
          </Text>
        </View>
      </View>

      <View style={[styles.timerTrack, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[styles.timerFill, { width: timerWidth, backgroundColor: colors.primary }]}
        />
      </View>

      <View style={styles.wordArea}>
        <Animated.Text
          style={[
            styles.wordText,
            { color: inkColor.hex, transform: [{ scale: wordScale }] },
          ]}
        >
          {colorName(wordColor)}
        </Animated.Text>

        {popups.map((p) => (
          <MotiView
            key={p.id}
            pointerEvents="none"
            from={{ opacity: 0, translateY: 0, scale: 0.6 }}
            animate={{ opacity: [1, 1, 0], translateY: -50, scale: 1 }}
            transition={{ type: 'timing', duration: 700 }}
            style={styles.popup}
          >
            <Text style={[styles.popupText, { color: p.value > 0 ? '#22C55E' : '#EF4444' }]}>
              {p.value > 0 ? `+${p.value}` : `${p.value}`}
            </Text>
          </MotiView>
        ))}
      </View>

      <View style={styles.gridWrapper}>
        {particles.map((particle) => {
          const translateX = particle.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, Math.cos(particle.angle) * particle.distance],
          });
          const translateY = particle.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, Math.sin(particle.angle) * particle.distance],
          });
          const opacity = particle.anim.interpolate({
            inputRange: [0, 0.7, 1],
            outputRange: [1, 0.8, 0],
          });
          const scale = particle.anim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.2],
          });

          return (
            <Animated.View
              key={particle.id}
              pointerEvents="none"
              style={[
                styles.particle,
                {
                  left: particle.x,
                  top: particle.y,
                  width: particle.size,
                  height: particle.size,
                  borderRadius: particle.size / 2,
                  backgroundColor: particle.color,
                  opacity,
                  transform: [{ translateX }, { translateY }, { scale }],
                },
              ]}
            />
          );
        })}

        <View style={styles.grid}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.key}
              activeOpacity={0.8}
              onLayout={recordLayout(option.key)}
              onPress={() => handleAnswer(option)}
              style={[styles.swatch, { backgroundColor: option.hex }]}
            >
              <Text style={styles.swatchLabel}>{colorName(option)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { backgroundColor: flashColor, opacity: flashAnim }]}
      />

      {(gameOver || completed) && (
        <View style={[styles.resultOverlay, { backgroundColor: colors.background + 'F5' }]}>
          <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
            <Trophy size={42} color={completed ? colors.success : colors.error} />

            <Text style={[styles.resultTitle, { color: colors.text, textAlign: 'center' }]}>
              {completed
                ? language === 'fa'
                  ? 'مرحله کامل شد!'
                  : 'Level Complete!'
                : language === 'fa'
                ? 'بازی تمام شد'
                : 'Game Over'}
            </Text>

            <Text style={[styles.finalScore, { color: colors.primary, textAlign: 'center' }]}>
              {score} {language === 'fa' ? 'امتیاز' : 'Points'}
            </Text>

            <TouchableOpacity
              onPress={() => selectedLevel !== null && startGame(selectedLevel)}
              style={[styles.resultButton, { backgroundColor: colors.primary }]}
            >
              <Text style={styles.resultButtonText}>
                {language === 'fa' ? 'دوباره بازی' : 'Play Again'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSelectedLevel(null);
                setGameOver(false);
                setCompleted(false);
              }}
              style={[styles.secondaryButton, { borderColor: colors.border }]}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text, textAlign: 'center' }]}>
                {language === 'fa' ? 'انتخاب سطح' : 'Choose Level'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  backText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
  },
  levelHeader: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  instructionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  instructionRow: {
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  instructionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginHorizontal: 8,
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  exampleBox: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  exampleWord: {
    fontSize: 20,
    fontWeight: '900',
  },
  exampleArrow: {
    fontSize: 16,
  },
  exampleAnswer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  exampleAnswerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  levels: {
    gap: 12,
  },
  levelCard: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  levelNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumberText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  levelInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  levelInfoRTL: {
    flex: 1,
    marginRight: Spacing.md,
  },
  levelTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  levelDescription: {
    fontSize: 12,
    marginTop: 4,
  },
  gameContainer: {
    flex: 1,
  },
  gameHeader: {
    height: 90,
    paddingHorizontal: Spacing.lg,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lifeIcon: {
    fontSize: 18,
  },
  statText: {
    fontSize: 16,
    fontWeight: '800',
  },
  timerTrack: {
    height: 6,
    marginHorizontal: Spacing.lg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  timerFill: {
    height: '100%',
    borderRadius: 3,
  },
  wordArea: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordText: {
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: 1,
  },
  popup: {
    position: 'absolute',
    top: 10,
  },
  popupText: {
    fontSize: 22,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  gridWrapper: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  swatch: {
    width: '48%',
    aspectRatio: 2.1,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  swatchLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  particle: {
    position: 'absolute',
  },
  resultOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCard: {
    width: '82%',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 25,
    fontWeight: '800',
    marginTop: Spacing.md,
  },
  finalScore: {
    fontSize: 28,
    fontWeight: '900',
    marginVertical: Spacing.lg,
  },
  resultButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  resultButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});