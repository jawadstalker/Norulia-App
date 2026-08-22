import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Animated,
  LayoutChangeEvent,
} from 'react-native';

import { MotiView } from 'moti';
import { useRouter } from 'expo-router';

import {
  ArrowLeft,
  Trophy,
  Zap,
  Clock,
  Heart,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';

type ColorDef = {
  key: string;
  en: string;
  fa: string;
  hex: string;
};

const COLOR_POOL: ColorDef[] = [
  {
    key: 'red',
    en: 'RED',
    fa: 'قرمز',
    hex: '#EF4444',
  },
  {
    key: 'blue',
    en: 'BLUE',
    fa: 'آبی',
    hex: '#3B82F6',
  },
  {
    key: 'green',
    en: 'GREEN',
    fa: 'سبز',
    hex: '#22C55E',
  },
  {
    key: 'yellow',
    en: 'YELLOW',
    fa: 'زرد',
    hex: '#EAB308',
  },
  {
    key: 'purple',
    en: 'PURPLE',
    fa: 'بنفش',
    hex: '#A855F7',
  },
  {
    key: 'orange',
    en: 'ORANGE',
    fa: 'نارنجی',
    hex: '#F97316',
  },
  {
    key: 'pink',
    en: 'PINK',
    fa: 'صورتی',
    hex: '#EC4899',
  },
  {
    key: 'cyan',
    en: 'CYAN',
    fa: 'فیروزه‌ای',
    hex: '#06B6D4',
  },
];

type Level = {
  name: string;
  nameFa: string;
  colorCount: number;
  roundTime: number;
  totalRounds: number;
};

const LEVELS: Level[] = [
  {
    name: 'Easy',
    nameFa: 'آسان',
    colorCount: 4,
    roundTime: 4000,
    totalRounds: 12,
  },
  {
    name: 'Medium',
    nameFa: 'متوسط',
    colorCount: 5,
    roundTime: 3000,
    totalRounds: 15,
  },
  {
    name: 'Hard',
    nameFa: 'سخت',
    colorCount: 6,
    roundTime: 2200,
    totalRounds: 18,
  },
  {
    name: 'Extreme',
    nameFa: 'حرفه‌ای',
    colorCount: 8,
    roundTime: 1600,
    totalRounds: 20,
  },
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
const GRID_HORIZONTAL_PADDING = Spacing.lg;
const GRID_GAP = 12;

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
  const { width } = useWindowDimensions();
  const swatchWidth = (width - GRID_HORIZONTAL_PADDING * 2 - GRID_GAP) / 2;
  const swatchHeight = swatchWidth / 2.1;
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [roundIndex, setRoundIndex] = useState(0);
  const [wordKey, setWordKey] = useState('red');
  const [inkKey, setInkKey] = useState('blue');
  const [options, setOptions] = useState<ColorDef[]>([]);
  const [popups, setPopups] = useState<ScorePopup[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [flashColor, setFlashColor] = useState('#EF4444');
  const level = selectedLevel !== null ? LEVELS[selectedLevel] : LEVELS[0];
  const wordColor = COLOR_POOL.find((c) => c.key === wordKey) || COLOR_POOL[0];
  const inkColor = COLOR_POOL.find((c) => c.key === inkKey) || COLOR_POOL[1];
  const textAlignStyle = isRTL ? 'right' : 'left';
  const colorName = (color: ColorDef) => (language === 'fa' ? color.fa : color.en);
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
      const descriptions = ['چهار رنگ ساده، زمان کافی', 'پنج رنگ، کمی سریع‌تر', 'شش رنگ، زمان محدود', 'هشت رنگ، سرعت بالا'];
      return descriptions[index] || '';
    }
    const descriptions = ['Four simple colors, plenty of time', 'Five colors, a bit faster', 'Six colors, limited time', 'Eight colors, high speed'];
    return descriptions[index] || '';
  };

  const handleBack = () => {
    timerRunRef.current?.stop();
    timerRunRef.current = null;
    roundIdRef.current += 1;
    answeredRef.current = true;
    router.back();
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
      setPopups((prev) => prev.filter((popup) => popup.id !== id));
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
    const inkCandidates = pool.filter((color) => color.key !== word.key);
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
        setTimeout(() => {
          endGame(false);
        }, 500);
      } else {
        setTimeout(() => {
          proceedToNext(level);
        }, 500);
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
      setTimeout(() => {
        proceedToNext(level);
      }, 400);
    } else {
      triggerFlash('#EF4444');
      triggerShake();
      spawnPopup(-5);
      setScore((prev) => prev - 5);
      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setTimeout(() => {
            endGame(false);
          }, 500);
        } else {
          setTimeout(() => {
            proceedToNext(level);
          }, 500);
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
    requestAnimationFrame(() => {
      beginRound(LEVELS[levelIndex]);
    });
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

  const restartGame = () => {
    if (selectedLevel === null) return;
    startGame(selectedLevel);
  };

  const recordLayout = (key: string) => (event: LayoutChangeEvent) => {
    const { x, y, width: w, height: h } = event.nativeEvent.layout;
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
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.8}
          style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <ArrowLeft size={21} strokeWidth={2.3} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.levelHeader}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
            <Zap size={32} color={colors.primary} />
          </View>
          <Text allowFontScaling={false} style={[styles.title, { color: colors.text }]}>
            {language === 'fa' ? 'استروپ دیجیتال' : 'Digital Stroop'}
          </Text>
          <Text allowFontScaling={false} style={[styles.subtitle, { color: colors.textSecondary }]}>
            {language === 'fa' ? 'رنگ نوشته را تشخیص دهید، نه خود کلمه را' : 'Identify the ink color, not the word'}
          </Text>
        </View>

        <View style={[styles.instructionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.instructionIcon}>
            <Zap size={20} color={colors.primary} />
          </View>
          <Text allowFontScaling={false} style={[styles.instructionText, { color: colors.text, textAlign: textAlignStyle }]}>
            {language === 'fa'
              ? 'رنگ واقعی نوشته را انتخاب کنید. مثلاً اگر کلمه «قرمز» با رنگ آبی نمایش داده شد، باید آبی را انتخاب کنید.'
              : 'Choose the actual ink color. For example, if RED is displayed in blue, select BLUE.'}
          </Text>
        </View>

        <Text allowFontScaling={false} style={[styles.sectionTitle, { color: colors.text, textAlign: textAlignStyle }]}>
          {language === 'fa' ? 'سطح بازی را انتخاب کنید' : 'Choose difficulty'}
        </Text>

        {LEVELS.map((item, index) => {
          const active = selectedLevel === index;
          return (
            <TouchableOpacity
              key={item.name}
              activeOpacity={0.85}
              onPress={() => startGame(index)}
              style={[
                styles.levelCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                  flexDirection: isRTL ? 'row-reverse' : 'row',
                },
              ]}
            >
              <View style={[styles.levelNumber, { backgroundColor: colors.primary + '18', marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 0 }]}>
                <Text allowFontScaling={false} style={[styles.levelNumberText, { color: colors.primary }]}>
                  {index + 1}
                </Text>
              </View>

              <View style={[styles.levelInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text allowFontScaling={false} style={[styles.levelName, { color: colors.text, textAlign: textAlignStyle }]}>
                  {language === 'fa' ? item.nameFa : item.name}
                </Text>
                <Text allowFontScaling={false} style={[styles.levelDescription, { color: colors.textSecondary, textAlign: textAlignStyle }]}>
                  {getLevelDescription(index)}
                </Text>
              </View>

              <View style={[styles.levelStats, { alignItems: isRTL ? 'flex-start' : 'flex-end' }]}>
                <View style={[styles.statRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Clock size={15} color={colors.textSecondary} />
                  <Text allowFontScaling={false} style={[styles.statText, { color: colors.textSecondary }]}>
                    {item.roundTime / 1000}s
                  </Text>
                </View>
                <View style={[styles.statRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Trophy size={15} color={colors.textSecondary} />
                  <Text allowFontScaling={false} style={[styles.statText, { color: colors.textSecondary }]}>
                    {item.totalRounds}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  if (playing) {
    return (
      <View style={[styles.gameContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.gameHeader, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={t.back || 'Back'}
            style={[styles.gameBackButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <ArrowLeft size={22} strokeWidth={2.4} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.gameHeaderCenter}>
            <Text allowFontScaling={false} numberOfLines={1} style={[styles.gameHeaderTitle, { color: colors.text }]}>
              {language === 'fa' ? 'استروپ دیجیتال' : 'Digital Stroop'}
            </Text>
            <Text allowFontScaling={false} style={[styles.gameHeaderRound, { color: colors.textSecondary }]}>
              {roundIndex + 1} / {level.totalRounds}
            </Text>
          </View>

          <View style={[styles.scoreBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Trophy size={17} color={colors.primary} />
            <Text allowFontScaling={false} style={[styles.scoreText, { color: colors.text }]}>
              {score}
            </Text>
          </View>
        </View>

        <View style={[styles.timerContainer, { backgroundColor: colors.surface }]}>
          <Animated.View style={[styles.timerProgress, { backgroundColor: colors.primary, width: timerWidth }]} />
        </View>

        <Animated.View style={[styles.gameContent, { transform: [{ translateX: shakeTranslate }] }]}>
          <View style={styles.statusRow}>
            <View style={styles.livesContainer}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Heart
                  key={index}
                  size={20}
                  strokeWidth={2}
                  color={index < lives ? '#EF4444' : colors.border}
                  fill={index < lives ? '#EF4444' : 'transparent'}
                />
              ))}
            </View>
            <View style={[styles.roundBadge, { backgroundColor: colors.surface }]}>
              <Text allowFontScaling={false} style={[styles.roundText, { color: colors.text }]}>
                {language === 'fa' ? `مرحله ${roundIndex + 1}` : `Round ${roundIndex + 1}`}
              </Text>
            </View>
          </View>

          <View style={styles.wordContainer}>
            <Text allowFontScaling={false} style={[styles.instructionSmall, { color: colors.textSecondary }]}>
              {language === 'fa' ? 'رنگ نوشته را انتخاب کنید' : 'Choose the ink color'}
            </Text>
            <Animated.Text
              allowFontScaling={false}
              style={[styles.stroopWord, { color: inkColor.hex, transform: [{ scale: wordScale }] }]}
            >
              {colorName(wordColor)}
            </Animated.Text>
          </View>

          <View style={[styles.optionsGrid, { width: width - GRID_HORIZONTAL_PADDING * 2 }]}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.key}
                activeOpacity={0.82}
                onLayout={recordLayout(option.key)}
                onPress={() => handleAnswer(option)}
                style={[styles.colorButton, { width: swatchWidth, height: swatchHeight, backgroundColor: option.hex }]}
              >
                <Text allowFontScaling={false} style={styles.colorButtonText}>
                  {colorName(option)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.flashOverlay,
            {
              backgroundColor: flashColor,
              opacity: flashAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.16],
              }),
            },
          ]}
        />

        <View pointerEvents="none" style={styles.popupLayer}>
          {popups.map((popup) => (
            <MotiView
              key={popup.id}
              from={{ opacity: 1, translateY: 0, scale: 0.8 }}
              animate={{ opacity: 0, translateY: -55, scale: 1.15 }}
              transition={{ duration: 650 }}
              style={styles.scorePopup}
            >
              <Text allowFontScaling={false} style={[styles.scorePopupText, { color: popup.value > 0 ? '#22C55E' : '#EF4444' }]}>
                {popup.value > 0 ? `+${popup.value}` : popup.value}
              </Text>
            </MotiView>
          ))}
        </View>

        <View pointerEvents="none" style={styles.particleLayer}>
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
              outputRange: [1, 1, 0],
            });
            return (
              <Animated.View
                key={particle.id}
                style={[
                  styles.particle,
                  {
                    width: particle.size,
                    height: particle.size,
                    borderRadius: particle.size / 2,
                    backgroundColor: particle.color,
                    left: particle.x,
                    top: particle.y,
                    opacity,
                    transform: [{ translateX }, { translateY }],
                  },
                ]}
              />
            );
          })}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.resultContainer, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        onPress={handleBack}
        activeOpacity={0.8}
        style={[styles.resultBackButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <ArrowLeft size={22} strokeWidth={2.3} color={colors.text} />
      </TouchableOpacity>

      <View style={styles.resultContent}>
        <View style={[styles.resultIcon, { backgroundColor: completed ? '#22C55E20' : '#EF444420' }]}>
          {completed ? <CheckCircle2 size={48} color="#22C55E" /> : <XCircle size={48} color="#EF4444" />}
        </View>

        <Text allowFontScaling={false} style={[styles.resultTitle, { color: colors.text }]}>
          {completed
            ? language === 'fa'
              ? 'بازی با موفقیت تمام شد'
              : 'Game completed'
            : language === 'fa'
              ? 'بازی تمام شد'
              : 'Game over'}
        </Text>

        <View style={[styles.finalScoreCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Trophy size={26} color={colors.primary} />
          <Text allowFontScaling={false} style={[styles.finalScoreLabel, { color: colors.textSecondary }]}>
            {language === 'fa' ? 'امتیاز نهایی' : 'Final score'}
          </Text>
          <Text allowFontScaling={false} style={[styles.finalScore, { color: colors.text }]}>
            {score}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={restartGame}
          style={[styles.restartButton, { backgroundColor: colors.primary }]}
        >
          <RotateCcw size={20} color="#FFFFFF" />
          <Text allowFontScaling={false} style={styles.restartButtonText}>
            {language === 'fa' ? 'دوباره بازی کن' : 'Play again'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            setSelectedLevel(null);
            setGameOver(false);
            setCompleted(false);
          }}
          style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text allowFontScaling={false} style={[styles.secondaryButtonText, { color: colors.text }]}>
            {language === 'fa' ? 'انتخاب سطح دیگر' : 'Choose another level'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 55,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    minWidth: 44,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 30,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
  },
  levelHeader: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  instructionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 26,
  },
  instructionIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 21,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  levelCard: {
    minHeight: 88,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  levelNumber: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumberText: {
    fontSize: 17,
    fontWeight: '800',
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: 16,
    fontWeight: '700',
  },
  levelDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
  },
  levelStats: {
    gap: 7,
  },
  statRow: {
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
  },
  gameContainer: {
    flex: 1,
  },
  gameHeader: {
    height: 72,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  gameBackButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  gameHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  gameHeaderRound: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
  },
  scoreBadge: {
    minWidth: 66,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '800',
  },
  timerContainer: {
    height: 5,
    marginHorizontal: Spacing.lg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  timerProgress: {
    height: '100%',
  },
  gameContent: {
    flex: 1,
    paddingHorizontal: GRID_HORIZONTAL_PADDING,
    paddingTop: 18,
    paddingBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  livesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  roundBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
  },
  roundText: {
    fontSize: 12,
    fontWeight: '700',
  },
  wordContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 35,
  },
  instructionSmall: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 15,
  },
  stroopWord: {
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
    alignSelf: 'center',
  },
  colorButton: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  colorButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  flashOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  popupLayer: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 60,
    pointerEvents: 'none',
  },
  scorePopup: {
    position: 'absolute',
  },
  scorePopupText: {
    fontSize: 30,
    fontWeight: '900',
  },
  particleLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 55,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
  },
  resultContainer: {
    flex: 1,
    paddingTop: 55,
    paddingHorizontal: Spacing.lg,
  },
  resultBackButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  resultContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  resultIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 24,
  },
  finalScoreCard: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 20,
  },
  finalScoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  finalScore: {
    fontSize: 42,
    fontWeight: '900',
    marginTop: 2,
  },
  restartButton: {
    width: '100%',
    height: 52,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  restartButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    width: '100%',
    height: 50,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});