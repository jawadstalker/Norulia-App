import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  CheckCircle2,
  Wind,
  PauseCircle,
  Waves,
  Activity,
  Timer,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';

const TOTAL_ROUNDS = 10;

type Phase = 'inhale' | 'hold' | 'exhale';

export default function CalmBreathingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { language, isRTL } = useLanguage();

  const [isStarted, setIsStarted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [seconds, setSeconds] = useState(4);
  const [round, setRound] = useState(1);

  const scale = useRef(new Animated.Value(0.65)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  const timerRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  /* ============================================================
     TRANSLATIONS
  ============================================================ */

  const t = {
    title:
      language === 'fa'
        ? 'تنفس آرام'
        : 'Calm Breathing',

    subtitle:
      language === 'fa'
        ? 'تمرین تنفس و آرام‌سازی'
        : 'Relaxation breathing exercise',

    back:
      language === 'fa'
        ? 'بازگشت'
        : 'Back',

    start:
      language === 'fa'
        ? 'شروع تمرین'
        : 'Start Exercise',

    restart:
      language === 'fa'
        ? 'شروع دوباره'
        : 'Restart',

    pause:
      language === 'fa'
        ? 'توقف تمرین'
        : 'Pause',

    round:
      language === 'fa'
        ? 'دور'
        : 'Round',

    howItWorks:
      language === 'fa'
        ? 'نحوه انجام'
        : 'How it works',

    description:
      language === 'fa'
        ? 'با یک تمرین ساده تنفس، ذهن و بدن خود را آرام کنید.'
        : 'Calm your mind and body with a simple guided breathing exercise.',

    instruction:
      language === 'fa'
        ? '۴ ثانیه دم، ۴ ثانیه نگه داشتن و ۶ ثانیه بازدم. این چرخه ۱۰ بار تکرار می‌شود.'
        : 'Inhale for 4 seconds, hold for 4 seconds, and exhale for 6 seconds. Repeat for 10 rounds.',

    inhale:
      language === 'fa'
        ? 'دم'
        : 'Inhale',

    hold:
      language === 'fa'
        ? 'نگه دار'
        : 'Hold',

    exhale:
      language === 'fa'
        ? 'بازدم'
        : 'Exhale',

    inhaleDescription:
      language === 'fa'
        ? 'آرام نفس بکش و ریه‌هایت را پر کن'
        : 'Breathe in slowly and deeply',

    holdDescription:
      language === 'fa'
        ? 'نفست را آرام نگه دار'
        : 'Hold your breath gently',

    exhaleDescription:
      language === 'fa'
        ? 'آرام و کامل نفس را بیرون بده'
        : 'Breathe out slowly and completely',

    completed:
      language === 'fa'
        ? 'تمرین تمام شد'
        : 'Exercise Complete',

    completedDescription:
      language === 'fa'
        ? 'آفرین! چند دقیقه برای آرامش خودت وقت گذاشتی.'
        : 'Great job! You took a few minutes to relax and reset.',
  };

  /* ============================================================
     BACK BUTTON
     
     همان معماری صفحات قبلی:
     Back همیشه سمت چپ است.
     RTL فقط روی بخش متن تأثیر می‌گذارد.
  ============================================================ */

  const goBack = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setIsRunning(false);

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/psycho');
    }
  };

  /* ============================================================
     START
  ============================================================ */

  const startGame = () => {
    setIsStarted(true);
    setIsRunning(true);
    setRound(1);
    setPhase('inhale');
    setSeconds(4);
  };

  /* ============================================================
     RESTART
  ============================================================ */

  const restartGame = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setRound(1);
    setPhase('inhale');
    setSeconds(4);
    setIsStarted(true);
    setIsRunning(true);

    scale.setValue(0.65);
    opacity.setValue(0.7);
  };

  /* ============================================================
     TIMER
  ============================================================ */

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      return;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setSeconds(prev => {
        if (prev > 1) {
          return prev - 1;
        }

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
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, phase, round]);

  /* ============================================================
     BREATHING ANIMATION
  ============================================================ */

  useEffect(() => {
    if (!isRunning) return;

    const target =
      phase === 'inhale'
        ? 1.15
        : phase === 'hold'
          ? 1.15
          : 0.65;

    const duration =
      phase === 'inhale'
        ? 4000
        : phase === 'hold'
          ? 4000
          : 6000;

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

  /* ============================================================
     PHASE DATA
  ============================================================ */

  const getPhaseData = () => {
    switch (phase) {
      case 'inhale':
        return {
          title: t.inhale,
          description: t.inhaleDescription,
          Icon: Wind,
        };

      case 'hold':
        return {
          title: t.hold,
          description: t.holdDescription,
          Icon: PauseCircle,
        };

      case 'exhale':
        return {
          title: t.exhale,
          description: t.exhaleDescription,
          Icon: Waves,
        };
    }
  };

  const phaseData = getPhaseData();
  const PhaseIcon = phaseData.Icon;

  const progress = Math.min(
    (round / TOTAL_ROUNDS) * 100,
    100,
  );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={[
          styles.header,
          {
            borderBottomColor: colors.border,
          },
        ]}
      >
        {/* BACK */}

        <TouchableOpacity
          onPress={goBack}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={t.back}
          style={[
            styles.backButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <ArrowLeft
            size={21}
            color={colors.text}
            strokeWidth={2.5}
          />
        </TouchableOpacity>

        {/* TITLE */}

        <View
          style={[
            styles.headerText,
            {
              alignItems: isRTL
                ? 'flex-end'
                : 'flex-start',
            },
          ]}
        >
          <Text
            style={[
              styles.headerTitle,
              {
                color: colors.text,
                textAlign: isRTL
                  ? 'right'
                  : 'left',
              },
            ]}
            numberOfLines={1}
          >
            {t.title}
          </Text>

          <Text
            style={[
              styles.headerSubtitle,
              {
                color: colors.textSecondary,
                textAlign: isRTL
                  ? 'right'
                  : 'left',
              },
            ]}
            numberOfLines={1}
          >
            {t.subtitle}
          </Text>
        </View>

        {/* SOUND */}

        <TouchableOpacity
          onPress={() => setIsMuted(v => !v)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={
            isMuted
              ? 'Enable sound'
              : 'Mute sound'
          }
          style={[
            styles.soundButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {isMuted ? (
            <VolumeX
              size={19}
              color={colors.text}
              strokeWidth={2.2}
            />
          ) : (
            <Volume2
              size={19}
              color={colors.text}
              strokeWidth={2.2}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* ======================================================
          START SCREEN
      ====================================================== */}

      {!isStarted ? (
        <View style={styles.startScreen}>

          {/* HERO ICON */}

          <View
            style={[
              styles.heroCircle,
              {
                backgroundColor:
                  colors.primary + '12',
                borderColor:
                  colors.primary + '25',
              },
            ]}
          >
            <View
              style={[
                styles.heroInner,
                {
                  backgroundColor:
                    colors.primary + '18',
                },
              ]}
            >
              <Wind
                size={48}
                color={colors.primary}
                strokeWidth={1.8}
              />
            </View>
          </View>

          {/* TITLE */}

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            {language === 'fa'
              ? 'آرام نفس بکش'
              : 'Breathe & Relax'}
          </Text>

          {/* DESCRIPTION */}

          <Text
            style={[
              styles.description,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            {t.description}
          </Text>

          {/* INFO CARD */}

          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.infoHeader,
                {
                  flexDirection: isRTL
                    ? 'row-reverse'
                    : 'row',
                },
              ]}
            >
              <View
                style={[
                  styles.infoIcon,
                  {
                    backgroundColor:
                      colors.primary + '15',
                  },
                ]}
              >
                <Activity
                  size={19}
                  color={colors.primary}
                />
              </View>

              <Text
                style={[
                  styles.infoTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {t.howItWorks}
              </Text>
            </View>

            <Text
              style={[
                styles.infoText,
                {
                  color: colors.textSecondary,
                  textAlign: isRTL
                    ? 'right'
                    : 'left',
                },
              ]}
            >
              {t.instruction}
            </Text>

            {/* BREATH PATTERN */}

            <View
              style={[
                styles.patternRow,
                {
                  flexDirection: isRTL
                    ? 'row-reverse'
                    : 'row',
                },
              ]}
            >
              <PatternItem
                icon={
                  <Wind
                    size={18}
                    color={colors.primary}
                  />
                }
                value="4s"
                label={t.inhale}
                colors={colors}
              />

              <View
                style={[
                  styles.patternLine,
                  {
                    backgroundColor:
                      colors.border,
                  },
                ]}
              />

              <PatternItem
                icon={
                  <PauseCircle
                    size={18}
                    color={colors.primary}
                  />
                }
                value="4s"
                label={t.hold}
                colors={colors}
              />

              <View
                style={[
                  styles.patternLine,
                  {
                    backgroundColor:
                      colors.border,
                  },
                ]}
              />

              <PatternItem
                icon={
                  <Waves
                    size={18}
                    color={colors.primary}
                  />
                }
                value="6s"
                label={t.exhale}
                colors={colors}
              />
            </View>
          </View>

          {/* START BUTTON */}

          <TouchableOpacity
            onPress={startGame}
            activeOpacity={0.85}
            style={[
              styles.startButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
          >
            <View style={styles.buttonIcon}>
              <Play
                size={17}
                color="#fff"
                fill="#fff"
              />
            </View>

            <Text style={styles.startButtonText}>
              {t.start}
            </Text>
          </TouchableOpacity>

          <View
            style={[
              styles.startHint,
              {
                flexDirection: isRTL
                  ? 'row-reverse'
                  : 'row',
              },
            ]}
          >
            <Timer
              size={14}
              color={colors.textSecondary}
            />

            <Text
              style={[
                styles.hintText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              {TOTAL_ROUNDS}{' '}
              {language === 'fa'
                ? 'دور تمرین'
                : 'breathing rounds'}
            </Text>
          </View>
        </View>
      ) : (
        /* ======================================================
           GAME SCREEN
        ====================================================== */

        <View style={styles.gameArea}>

          {/* PROGRESS */}

          <View
            style={[
              styles.progressCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.progressTop}>
              <View>
                <Text
                  style={[
                    styles.progressCaption,
                    {
                      color:
                        colors.textSecondary,
                    },
                  ]}
                >
                  {t.round}
                </Text>

                <Text
                  style={[
                    styles.progressValue,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {round}
                  <Text
                    style={{
                      color:
                        colors.textSecondary,
                    }}
                  >
                    {' '}
                    / {TOTAL_ROUNDS}
                  </Text>
                </Text>
              </View>

              <View style={styles.timerBadge}>
                <Timer
                  size={15}
                  color={colors.primary}
                />

                <Text
                  style={[
                    styles.timerText,
                    {
                      color: colors.primary,
                    },
                  ]}
                >
                  {seconds}s
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.progressTrack,
                {
                  backgroundColor:
                    colors.background,
                },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor:
                      colors.primary,
                    width: `${progress}%`,
                  },
                ]}
              />
            </View>
          </View>

          {/* BREATHING AREA */}

          <View style={styles.breathingArea}>

            <View style={styles.breathingVisual}>

              {/* OUTER */}

              <Animated.View
                style={[
                  styles.outerCircle,
                  {
                    backgroundColor:
                      colors.primary + '0D',
                    borderColor:
                      colors.primary + '20',
                    transform: [
                      {
                        scale,
                      },
                    ],
                  },
                ]}
              >

                {/* MIDDLE */}

                <View
                  style={[
                    styles.middleCircle,
                    {
                      backgroundColor:
                        colors.primary + '12',
                    },
                  ]}
                >

                  {/* INNER */}

                  <Animated.View
                    style={[
                      styles.innerCircle,
                      {
                        backgroundColor:
                          colors.primary,
                        opacity,
                        transform: [
                          {
                            scale,
                          },
                        ],
                      },
                    ]}
                  >
                    <PhaseIcon
                      size={52}
                      color="#fff"
                      strokeWidth={1.7}
                    />
                  </Animated.View>
                </View>
              </Animated.View>

              {/* PHASE */}

              <Text
                style={[
                  styles.phaseText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {phaseData.title}
              </Text>

              {/* SECONDS */}

              <Text
                style={[
                  styles.secondsText,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                {seconds}
              </Text>

              {/* DESCRIPTION */}

              <Text
                style={[
                  styles.phaseDescription,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {phaseData.description}
              </Text>
            </View>
          </View>

          {/* COMPLETE */}

          {!isRunning &&
          round >= TOTAL_ROUNDS ? (
            <View
              style={[
                styles.resultCard,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.resultIcon,
                  {
                    backgroundColor:
                      colors.primary + '15',
                  },
                ]}
              >
                <CheckCircle2
                  size={34}
                  color={colors.primary}
                  strokeWidth={2}
                />
              </View>

              <Text
                style={[
                  styles.resultTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {t.completed}
              </Text>

              <Text
                style={[
                  styles.resultText,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {t.completedDescription}
              </Text>

              <TouchableOpacity
                onPress={restartGame}
                activeOpacity={0.85}
                style={[
                  styles.restartButton,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
              >
                <RotateCcw
                  size={18}
                  color="#fff"
                  strokeWidth={2.3}
                />

                <Text
                  style={styles.startButtonText}
                >
                  {t.restart}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* PAUSE */

            <TouchableOpacity
              onPress={() =>
                setIsRunning(false)
              }
              activeOpacity={0.8}
              style={[
                styles.pauseButton,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <PauseCircle
                size={19}
                color={colors.text}
              />

              <Text
                style={[
                  styles.pauseText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {t.pause}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

/* ================================================================
   PATTERN ITEM
================================================================ */

function PatternItem({
  icon,
  value,
  label,
  colors,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  colors: any;
}) {
  return (
    <View style={styles.patternItem}>
      <View
        style={[
          styles.patternIcon,
          {
            backgroundColor:
              colors.primary + '12',
          },
        ]}
      >
        {icon}
      </View>

      <Text
        style={[
          styles.patternValue,
          {
            color: colors.text,
          },
        ]}
      >
        {value}
      </Text>

      <Text
        style={[
          styles.patternLabel,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

/* ================================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* ============================================================
     HEADER
  ============================================================ */

  header: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
    paddingTop: 58,
    paddingBottom: 15,

    flexDirection: 'row',
    alignItems: 'center',

    borderBottomWidth:
      StyleSheet.hairlineWidth,

    gap: 12,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,

    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',

    flexShrink: 0,
  },

  headerText: {
    flex: 1,
    minWidth: 0,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 27,
  },

  headerSubtitle: {
    fontSize: 12,
    marginTop: 3,
    lineHeight: 18,
  },

  soundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,

    borderWidth: 1,

    alignItems: 'center',
    justifyContent: 'center',

    flexShrink: 0,
  },

  /* ============================================================
     START
  ============================================================ */

  startScreen: {
    flex: 1,

    paddingHorizontal: Spacing.lg,

    alignItems: 'center',
    justifyContent: 'center',

    paddingBottom: 20,
  },

  heroCircle: {
    width: 142,
    height: 142,

    borderRadius: 71,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,

    marginBottom: 22,
  },

  heroInner: {
    width: 106,
    height: 106,

    borderRadius: 53,

    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.4,
  },

  description: {
    fontSize: 15,
    lineHeight: 24,

    textAlign: 'center',

    marginTop: 10,

    maxWidth: 350,
  },

  /* ============================================================
     INFO CARD
  ============================================================ */

  infoCard: {
    width: '100%',

    borderRadius: 22,

    borderWidth: 1,

    padding: 18,

    marginTop: 24,
  },

  infoHeader: {
    alignItems: 'center',
    gap: 10,
  },

  infoIcon: {
    width: 38,
    height: 38,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',
  },

  infoTitle: {
    fontSize: 17,
    fontWeight: '800',
  },

  infoText: {
    fontSize: 13.5,
    lineHeight: 22,

    marginTop: 14,
  },

  /* ============================================================
     PATTERN
  ============================================================ */

  patternRow: {
    width: '100%',

    alignItems: 'center',
    justifyContent: 'space-between',

    marginTop: 18,
  },

  patternItem: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  patternIcon: {
    width: 34,
    height: 34,

    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 5,
  },

  patternValue: {
    fontSize: 14,
    fontWeight: '800',
  },

  patternLabel: {
    fontSize: 10,
    marginTop: 2,
  },

  patternLine: {
    width: 22,
    height: 1,
    marginHorizontal: 3,
  },

  /* ============================================================
     START BUTTON
  ============================================================ */

  startButton: {
    width: '100%',

    minHeight: 54,

    borderRadius: BorderRadius.full,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    gap: 9,

    marginTop: 18,

    elevation: 2,
  },

  buttonIcon: {
    width: 27,
    height: 27,

    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  startButtonText: {
    color: '#fff',

    fontSize: 16,
    fontWeight: '800',
  },

  startHint: {
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,

    marginTop: 12,
  },

  hintText: {
    fontSize: 11,
  },

  /* ============================================================
     GAME
  ============================================================ */

  gameArea: {
    flex: 1,

    paddingHorizontal: Spacing.lg,
  },

  /* ============================================================
     PROGRESS
  ============================================================ */

  progressCard: {
    borderRadius: 20,

    borderWidth: 1,

    padding: 15,

    marginTop: 16,
  },

  progressTop: {
    flexDirection: 'row',

    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressCaption: {
    fontSize: 10,
    fontWeight: '600',
  },

  progressValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 1,
  },

  timerBadge: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 6,

    paddingHorizontal: 11,
    paddingVertical: 7,

    borderRadius: 12,
  },

  timerText: {
    fontSize: 13,
    fontWeight: '800',
  },

  progressTrack: {
    height: 7,

    borderRadius: 10,

    overflow: 'hidden',

    marginTop: 12,
  },

  progressFill: {
    height: '100%',

    borderRadius: 10,
  },

  /* ============================================================
     BREATHING
  ============================================================ */

  breathingArea: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',
  },

  breathingVisual: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  outerCircle: {
    width: 255,
    height: 255,

    borderRadius: 128,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
  },

  middleCircle: {
    width: 208,
    height: 208,

    borderRadius: 104,

    alignItems: 'center',
    justifyContent: 'center',
  },

  innerCircle: {
    width: 154,
    height: 154,

    borderRadius: 77,

    alignItems: 'center',
    justifyContent: 'center',

    elevation: 4,
  },

  phaseText: {
    fontSize: 29,

    fontWeight: '800',

    marginTop: 26,
  },

  secondsText: {
    fontSize: 56,

    lineHeight: 64,

    fontWeight: '800',

    marginTop: 1,
  },

  phaseDescription: {
    fontSize: 13.5,

    lineHeight: 21,

    textAlign: 'center',

    marginTop: 3,

    maxWidth: 320,
  },

  /* ============================================================
     PAUSE
  ============================================================ */

  pauseButton: {
    height: 50,

    borderRadius: BorderRadius.full,

    borderWidth: 1,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    marginBottom: Spacing.lg,
  },

  pauseText: {
    fontSize: 15,

    fontWeight: '700',
  },

  /* ============================================================
     RESULT
  ============================================================ */

  resultCard: {
    width: '100%',

    borderRadius: 22,

    borderWidth: 1,

    padding: 20,

    alignItems: 'center',

    marginBottom: Spacing.lg,
  },

  resultIcon: {
    width: 62,
    height: 62,

    borderRadius: 31,

    alignItems: 'center',
    justifyContent: 'center',
  },

  resultTitle: {
    fontSize: 24,

    fontWeight: '800',

    marginTop: 12,
  },

  resultText: {
    fontSize: 13.5,

    lineHeight: 21,

    textAlign: 'center',

    marginTop: 7,

    maxWidth: 320,
  },

  restartButton: {
    marginTop: 16,

    width: '100%',

    height: 50,

    borderRadius: BorderRadius.full,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,
  },
});