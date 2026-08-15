import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Target,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';

type Side = 'left' | 'right';

type TrialResult = {
  correct: boolean;
  rt: number;
  diff: number;
};

type FeedbackType = 'idle' | 'correct' | 'wrong' | 'timeout';

const TOTAL_TRIALS = 20;
const TIMER_DURATION = 8000;
const DESIGN_WIDTH = 780;

const random = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const randomInt = (min: number, max: number) =>
  Math.floor(random(min, max + 1));

export default function SizeDiscriminationScreen() {
  const { colors, isDark } = useTheme();
  const { language, isRTL } = useLanguage();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const textAlignStyle = isRTL ? 'right' : 'left';

  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>(
    'intro'
  );

  const [trialIndex, setTrialIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [responses, setResponses] = useState<TrialResult[]>([]);

  const [leftSize, setLeftSize] = useState(80);
  const [rightSize, setRightSize] = useState(80);
  const [correctSide, setCorrectSide] = useState<Side>('left');

  const [isReady, setIsReady] = useState(false);

  const [feedback, setFeedback] = useState<{
    text: string;
    type: FeedbackType;
  }>({
    text: '',
    type: 'idle',
  });

  const [detailText, setDetailText] = useState('');
  const [lastRt, setLastRt] = useState<number | null>(null);

  const startTimeRef = useRef(0);
  const roundIdRef = useRef(0);
  const answeredRef = useRef(false);

  const timeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextTrialRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentDiffRef = useRef(0.1);

  const timerAnim = useRef(new Animated.Value(1)).current;

  const timerRunRef =
    useRef<Animated.CompositeAnimation | null>(null);

  const circlePulse = useRef(new Animated.Value(0)).current;

  /*
   * ---------------------------------------------------------
   * CLEANUP
   * ---------------------------------------------------------
   */

  useEffect(() => {
    return () => {
      timerRunRef.current?.stop();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (nextTrialRef.current) {
        clearTimeout(nextTrialRef.current);
      }
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * DIMENSIONS
   * ---------------------------------------------------------
   */

  const playAreaWidth = Math.min(
    width - Spacing.lg * 2,
    460
  );

  const playAreaHeight = playAreaWidth * (4 / 7);

  const scale = playAreaWidth / DESIGN_WIDTH;

  const spacing = playAreaWidth * 0.24;

  /*
   * ---------------------------------------------------------
   * BACK HANDLERS
   * ---------------------------------------------------------
   */

  const handleIntroBack = useCallback(() => {
    router.back();
  }, [router]);

  const backToIntro = useCallback(() => {
    timerRunRef.current?.stop();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (nextTrialRef.current) {
      clearTimeout(nextTrialRef.current);
      nextTrialRef.current = null;
    }

    answeredRef.current = true;
    setIsReady(false);

    setPhase('intro');
  }, []);

  /*
   * ---------------------------------------------------------
   * START TRIAL
   * ---------------------------------------------------------
   */

  const beginTrial = useCallback(
    (index: number) => {
      roundIdRef.current += 1;

      const roundId = roundIdRef.current;

      answeredRef.current = false;

      setIsReady(true);

      setFeedback({
        text: '',
        type: 'idle',
      });

      setDetailText('');
      setLastRt(null);

      const diffPercent = random(0.05, 0.3);

      const baseSize = randomInt(60, 120);

      const biggerOnRight = Math.random() < 0.5;

      if (biggerOnRight) {
        setLeftSize(baseSize);

        setRightSize(
          Math.round(baseSize * (1 + diffPercent))
        );

        setCorrectSide('right');
      } else {
        setLeftSize(
          Math.round(baseSize * (1 + diffPercent))
        );

        setRightSize(baseSize);

        setCorrectSide('left');
      }

      currentDiffRef.current = diffPercent;

      /*
       * Circle animation
       */

      circlePulse.setValue(0);

      Animated.spring(circlePulse, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }).start();

      /*
       * Timer animation
       */

      timerAnim.setValue(1);

      timerRunRef.current = Animated.timing(timerAnim, {
        toValue: 0,
        duration: TIMER_DURATION,
        useNativeDriver: false,
      });

      timerRunRef.current.start();

      startTimeRef.current = Date.now();

      /*
       * Timeout
       */

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (
          roundId !== roundIdRef.current ||
          answeredRef.current
        ) {
          return;
        }

        handleTimeout(index, diffPercent);
      }, TIMER_DURATION);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  /*
   * ---------------------------------------------------------
   * NEXT TRIAL
   * ---------------------------------------------------------
   */

  const endGame = useCallback(() => {
    timerRunRef.current?.stop();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsReady(false);
    setPhase('result');
  }, []);

  const goToNextTrial = useCallback(
    (index: number) => {
      const next = index + 1;

      if (next >= TOTAL_TRIALS) {
        endGame();
        return;
      }

      setTrialIndex(next);

      beginTrial(next);
    },
    [beginTrial, endGame]
  );

  /*
   * ---------------------------------------------------------
   * ANSWER
   * ---------------------------------------------------------
   */

  const respond = useCallback(
    (side: Side) => {
      if (!isReady || answeredRef.current) {
        return;
      }

      answeredRef.current = true;

      setIsReady(false);

      timerRunRef.current?.stop();

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const rt = Date.now() - startTimeRef.current;

      const correct = side === correctSide;

      const diff = currentDiffRef.current;

      setResponses((prev) => [
        ...prev,
        {
          correct,
          rt,
          diff,
        },
      ]);

      setLastRt(rt);

      if (correct) {
        setScore((prev) => prev + 10);

        setFeedback({
          text:
            language === 'fa'
              ? 'درست بود'
              : 'Correct',
          type: 'correct',
        });
      } else {
        setFeedback({
          text:
            language === 'fa'
              ? 'پاسخ اشتباه بود'
              : 'Wrong answer',
          type: 'wrong',
        });
      }

      setDetailText(
        language === 'fa'
          ? `تفاوت اندازه: ${Math.round(
              diff * 100
            )}٪  ·  زمان پاسخ: ${rt}ms`
          : `Size difference: ${Math.round(
              diff * 100
            )}%  ·  RT: ${rt}ms`
      );

      nextTrialRef.current = setTimeout(() => {
        goToNextTrial(trialIndex);
      }, 800);
    },
    [
      correctSide,
      goToNextTrial,
      isReady,
      language,
      trialIndex,
    ]
  );

  /*
   * ---------------------------------------------------------
   * TIMEOUT
   * ---------------------------------------------------------
   */

  const handleTimeout = useCallback(
    (index: number, diff: number) => {
      if (answeredRef.current) {
        return;
      }

      answeredRef.current = true;

      setIsReady(false);

      timerRunRef.current?.stop();

      setResponses((prev) => [
        ...prev,
        {
          correct: false,
          rt: 0,
          diff,
        },
      ]);

      setFeedback({
        text:
          language === 'fa'
            ? 'زمان تمام شد'
            : 'Time is up',
        type: 'timeout',
      });

      setDetailText(
        language === 'fa'
          ? `تفاوت اندازه: ${Math.round(
              diff * 100
            )}٪`
          : `Size difference: ${Math.round(
              diff * 100
            )}%`
      );

      nextTrialRef.current = setTimeout(() => {
        goToNextTrial(index);
      }, 1000);
    },
    [goToNextTrial, language]
  );

  /*
   * ---------------------------------------------------------
   * START / RESTART
   * ---------------------------------------------------------
   */

  const startGame = useCallback(() => {
    if (nextTrialRef.current) {
      clearTimeout(nextTrialRef.current);
    }

    setPhase('playing');
    setTrialIndex(0);
    setScore(0);
    setResponses([]);

    setFeedback({
      text: '',
      type: 'idle',
    });

    setDetailText('');

    nextTrialRef.current = setTimeout(() => {
      beginTrial(0);
    }, 400);
  }, [beginTrial]);

  const restartGame = useCallback(() => {
    timerRunRef.current?.stop();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (nextTrialRef.current) {
      clearTimeout(nextTrialRef.current);
    }

    setPhase('playing');
    setTrialIndex(0);
    setScore(0);
    setResponses([]);

    setFeedback({
      text: '',
      type: 'idle',
    });

    setDetailText('');

    setLastRt(null);

    nextTrialRef.current = setTimeout(() => {
      beginTrial(0);
    }, 400);
  }, [beginTrial]);

  /*
   * ---------------------------------------------------------
   * RESULTS
   * ---------------------------------------------------------
   */

  const total = responses.length;

  const corrects = responses.filter(
    (r) => r.correct
  ).length;

  const accuracy =
    total > 0
      ? (corrects / total) * 100
      : 0;

  const validRts = responses
    .filter((r) => r.correct && r.rt > 0)
    .map((r) => r.rt);

  const avgRt =
    validRts.length > 0
      ? validRts.reduce(
          (a, b) => a + b,
          0
        ) / validRts.length
      : 0;

  const getThresholdLabel = () => {
    const buckets: Record<
      string,
      {
        correct: number;
        total: number;
      }
    > = {};

    responses.forEach((r) => {
      const bucketStart =
        Math.floor(
          (r.diff * 100) / 5
        ) * 5;

      const key = `${bucketStart}`;

      if (!buckets[key]) {
        buckets[key] = {
          correct: 0,
          total: 0,
        };
      }

      buckets[key].total += 1;

      if (r.correct) {
        buckets[key].correct += 1;
      }
    });

    const sortedKeys = Object.keys(buckets)
      .map(Number)
      .sort((a, b) => a - b);

    for (const key of sortedKeys) {
      const bucket = buckets[String(key)];

      const acc =
        (bucket.correct /
          bucket.total) *
        100;

      if (acc >= 75) {
        return `${key}–${key + 5}%`;
      }
    }

    return language === 'fa'
      ? 'داده کافی نیست'
      : 'Not enough data';
  };

  /*
   * ---------------------------------------------------------
   * TIMER
   * ---------------------------------------------------------
   */

  const timerWidth =
    timerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

  const timerColor =
    timerAnim.interpolate({
      inputRange: [
        0,
        0.3,
        0.301,
        1,
      ],
      outputRange: [
        colors.error,
        colors.error,
        colors.primary,
        colors.primary,
      ],
    });

  /*
   * ---------------------------------------------------------
   * CIRCLE SIZE
   * ---------------------------------------------------------
   */

  const leftDiameter =
    leftSize * 2 * scale;

  const rightDiameter =
    rightSize * 2 * scale;

  /*
   * =========================================================
   * INTRO
   * =========================================================
   */

  if (phase === 'intro') {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        {/* FIXED HEADER */}

        <View
          style={[
            styles.fixedHeader,
            {
              backgroundColor:
                colors.background,
              borderBottomColor:
                colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleIntroBack}
            activeOpacity={0.7}
            style={[
              styles.fixedBackButton,
              {
                backgroundColor:
                  colors.surface,
              },
            ]}
          >
            <ArrowLeft
              size={22}
              color={colors.text}
              strokeWidth={2.2}
            />
          </TouchableOpacity>

          <View
            style={styles.fixedHeaderTitle}
          >
            {/* <Target
              size={20}
              color={colors.primary}
            />

            <Text
              allowFontScaling={false}
              style={[
                styles.fixedHeaderTitleText,
                {
                  color: colors.text,
                },
              ]}
            >
              {language === 'fa'
                ? 'تشخیص اندازه'
                : 'Size Discrimination'}
            </Text> */}
          </View>

          <View
            style={
              styles.fixedHeaderSpacer
            }
          />
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={styles.introHeader}
          >
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor:
                    colors.primary +
                    '20',
                },
              ]}
            >
              <Target
                size={32}
                color={colors.primary}
              />
            </View>

            <Text
              allowFontScaling={false}
              style={[
                styles.title,
                {
                  color: colors.text,
                },
              ]}
            >
              {language === 'fa'
                ? 'تشخیص اندازه'
                : 'Size Discrimination'}
            </Text>

            <Text
              allowFontScaling={false}
              style={[
                styles.subtitle,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {language === 'fa'
                ? 'کدام دایره بزرگ‌تر است؟'
                : 'Which circle is bigger?'}
            </Text>
          </View>

          <View
            style={[
              styles.instructionCard,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
              },
            ]}
          >
            <Text
              allowFontScaling={false}
              style={[
                styles.instructionTitle,
                {
                  color: colors.text,
                  textAlign:
                    textAlignStyle,
                },
              ]}
            >
              {language === 'fa'
                ? 'راهنما'
                : 'How to play'}
            </Text>

            {(language === 'fa'
              ? [
                  'دو دایره قرمز و آبی روی صفحه نمایش داده می‌شود.',
                  'روی دایره‌ای که بزرگ‌تر است ضربه بزن.',
                  'برای هر مرحله فقط ۸ ثانیه فرصت داری.',
                  '۲۰ مرحله پشت‌سرهم اجرا می‌شود و در پایان آستانه تشخیص تو محاسبه می‌شود.',
                ]
              : [
                  'Two circles, red and blue, appear on screen.',
                  'Tap the circle that looks bigger.',
                  'You have 8 seconds for each trial.',
                  '20 trials in a row, then we estimate your discrimination threshold.',
                ]
            ).map((line, index) => (
              <View
                key={index}
                style={[
                  styles.instructionRow,
                  {
                    flexDirection:
                      isRTL
                        ? 'row-reverse'
                        : 'row',
                  },
                ]}
              >
                <View
                  style={[
                    styles.instructionDot,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                />

                <Text
                  allowFontScaling={false}
                  style={[
                    styles.instructionText,
                    {
                      color:
                        colors.textSecondary,
                      textAlign:
                        textAlignStyle,
                    },
                  ]}
                >
                  {line}
                </Text>
              </View>
            ))}
          </View>

          <View
            style={[
              styles.statsPreview,
              {
                flexDirection:
                  isRTL
                    ? 'row-reverse'
                    : 'row',
              },
            ]}
          >
            <View
              style={[
                styles.statPreviewItem,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Target
                size={18}
                color={colors.primary}
              />

              <Text
                allowFontScaling={false}
                style={[
                  styles.statPreviewText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {TOTAL_TRIALS}{' '}
                {language === 'fa'
                  ? 'مرحله'
                  : 'trials'}
              </Text>
            </View>

            <View
              style={[
                styles.statPreviewItem,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Clock
                size={18}
                color={colors.primary}
              />

              <Text
                allowFontScaling={false}
                style={[
                  styles.statPreviewText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {language === 'fa'
                  ? '۸ ثانیه'
                  : '8 seconds'}
              </Text>
            </View>

            <View
              style={[
                styles.statPreviewItem,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Trophy
                size={18}
                color={colors.warning}
              />

              <Text
                allowFontScaling={false}
                style={[
                  styles.statPreviewText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                +10{' '}
                {language === 'fa'
                  ? 'به ازای هر پاسخ درست'
                  : 'per correct'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={startGame}
            style={[
              styles.startButton,
              {
                backgroundColor:
                  colors.primary,
              },
            ]}
          >
            <Sparkles
              size={18}
              color="#fff"
            />

            <Text
              allowFontScaling={false}
              style={styles.startButtonText}
            >
              {language === 'fa'
                ? 'شروع تست'
                : 'Start Test'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  /*
   * =========================================================
   * RESULT
   * =========================================================
   */

  if (phase === 'result') {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        {/* FIXED HEADER */}

        <View
          style={[
            styles.fixedHeader,
            {
              backgroundColor:
                colors.background,
              borderBottomColor:
                colors.border,
            },
          ]}
        >
          <TouchableOpacity
            onPress={backToIntro}
            activeOpacity={0.7}
            style={[
              styles.fixedBackButton,
              {
                backgroundColor:
                  colors.surface,
              },
            ]}
          >
            <ArrowLeft
              size={22}
              color={colors.text}
              strokeWidth={2.2}
            />
          </TouchableOpacity>

          <View
            style={styles.fixedHeaderTitle}
          >
            <Trophy
              size={20}
              color={colors.primary}
            />

            <Text
              allowFontScaling={false}
              style={[
                styles.fixedHeaderTitleText,
                {
                  color: colors.text,
                },
              ]}
            >
              {language === 'fa'
                ? 'نتیجه آزمون'
                : 'Test Result'}
            </Text>
          </View>

          <View
            style={
              styles.fixedHeaderSpacer
            }
          />
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={
            styles.resultScrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={styles.resultOverlay}
          >
            <View
              style={[
                styles.resultCard,
                {
                  backgroundColor:
                    colors.surface,
                },
              ]}
            >
              <Trophy
                size={42}
                color={colors.primary}
              />

              <Text
                allowFontScaling={false}
                style={[
                  styles.resultTitle,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {language === 'fa'
                  ? 'آزمون کامل شد!'
                  : 'Test complete!'}
              </Text>

              <View
                style={
                  styles.resultStatsGrid
                }
              >
                <View
                  style={[
                    styles.resultStatBox,
                    {
                      backgroundColor:
                        colors.background,
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.resultStatValue,
                      {
                        color:
                          colors.primary,
                      },
                    ]}
                  >
                    {corrects}/{total}
                  </Text>

                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.resultStatLabel,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {language === 'fa'
                      ? 'پاسخ درست'
                      : 'Correct'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.resultStatBox,
                    {
                      backgroundColor:
                        colors.background,
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.resultStatValue,
                      {
                        color:
                          colors.primary,
                      },
                    ]}
                  >
                    {accuracy.toFixed(0)}٪
                  </Text>

                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.resultStatLabel,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {language === 'fa'
                      ? 'دقت'
                      : 'Accuracy'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.resultStatBox,
                    {
                      backgroundColor:
                        colors.background,
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.resultStatValue,
                      {
                        color:
                          colors.primary,
                      },
                    ]}
                  >
                    {avgRt.toFixed(0)}
                  </Text>

                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.resultStatLabel,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {language === 'fa'
                      ? 'میانگین زمان (ms)'
                      : 'Avg RT (ms)'}
                  </Text>
                </View>

                <View
                  style={[
                    styles.resultStatBox,
                    {
                      backgroundColor:
                        colors.background,
                      borderColor:
                        colors.border,
                    },
                  ]}
                >
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.resultStatValue,
                      {
                        color:
                          colors.primary,
                      },
                    ]}
                  >
                    {getThresholdLabel()}
                  </Text>

                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.resultStatLabel,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {language === 'fa'
                      ? 'آستانه تشخیص'
                      : 'Threshold'}
                  </Text>
                </View>
              </View>

              <Text
                allowFontScaling={false}
                style={[
                  styles.finalScore,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                {score}{' '}
                {language === 'fa'
                  ? 'امتیاز'
                  : 'Points'}
              </Text>

              <TouchableOpacity
                onPress={restartGame}
                activeOpacity={0.85}
                style={[
                  styles.resultButton,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
              >
                <RotateCcw
                  size={16}
                  color="#fff"
                />

                <Text
                  allowFontScaling={false}
                  style={
                    styles.resultButtonText
                  }
                >
                  {language === 'fa'
                    ? 'دوباره تلاش کن'
                    : 'Try Again'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={backToIntro}
                activeOpacity={0.85}
                style={[
                  styles.secondaryButton,
                  {
                    borderColor:
                      colors.border,
                  },
                ]}
              >
                <Text
                  allowFontScaling={false}
                  style={[
                    styles.secondaryButtonText,
                    {
                      color: colors.text,
                    },
                  ]}
                >
                  {language === 'fa'
                    ? 'بازگشت به راهنما'
                    : 'Back to Instructions'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  /*
   * =========================================================
   * PLAYING
   * =========================================================
   */

  return (
    <View
      style={[
        styles.gameContainer,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      {/* FIXED GAME HEADER */}

      <View
        style={[
          styles.fixedHeader,
          {
            backgroundColor:
              colors.background,
            borderBottomColor:
              colors.border,
          },
        ]}
      >
        {/* ALWAYS LEFT */}

        <TouchableOpacity
          onPress={backToIntro}
          activeOpacity={0.7}
          style={[
            styles.fixedBackButton,
            {
              backgroundColor:
                colors.surface,
            },
          ]}
        >
          <ArrowLeft
            size={22}
            color={colors.text}
            strokeWidth={2.2}
          />
        </TouchableOpacity>

        {/* CENTER TITLE */}

        <View
          style={styles.fixedHeaderTitle}
        >
          <Target
            size={20}
            color={colors.primary}
          />

          <Text
            allowFontScaling={false}
            style={[
              styles.fixedHeaderTitleText,
              {
                color: colors.text,
              },
            ]}
          >
            {language === 'fa'
              ? 'تشخیص اندازه'
              : 'Size Discrimination'}
          </Text>
        </View>

        <View
          style={styles.fixedHeaderSpacer}
        />
      </View>

      {/* GAME STATS */}

      <View
        style={[
          styles.gameStatsBar,
          {
            flexDirection:
              isRTL
                ? 'row-reverse'
                : 'row',
          },
        ]}
      >
        <View style={styles.stat}>
          <Target
            size={18}
            color={colors.primary}
          />

          <Text
            allowFontScaling={false}
            style={[
              styles.statText,
              {
                color: colors.text,
              },
            ]}
          >
            {trialIndex + 1}/
            {TOTAL_TRIALS}
          </Text>
        </View>

        <View style={styles.stat}>
          <Trophy
            size={18}
            color={colors.warning}
          />

          <Text
            allowFontScaling={false}
            style={[
              styles.statText,
              {
                color: colors.text,
              },
            ]}
          >
            {score}
          </Text>
        </View>
      </View>

      {/* TIMER */}

      <View
        style={[
          styles.timerTrack,
          {
            backgroundColor:
              colors.border,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.timerFill,
            {
              width: timerWidth,
              backgroundColor:
                timerColor,
            },
          ]}
        />
      </View>

      <Text
        allowFontScaling={false}
        style={[
          styles.infoText,
          {
            color: colors.text,
          },
        ]}
      >
        {language === 'fa'
          ? 'کدام دایره بزرگ‌تر است؟'
          : 'Which circle is bigger?'}
      </Text>

      {/* PLAY AREA */}

      <View
        style={[
          styles.playArea,
          {
            width: playAreaWidth,
            height: playAreaHeight,
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.03)'
              : 'rgba(15,23,42,0.02)',
            borderColor:
              colors.border,
          },
        ]}
      >
        {/* LEFT CIRCLE */}

        <View
          style={[
            styles.circleColumn,
            {
              marginRight:
                spacing / 2,
            },
          ]}
        >
          <Animated.View
            style={{
              transform: [
                {
                  scale: circlePulse,
                },
              ],
            }}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!isReady}
              hitSlop={{
                top: 14,
                bottom: 14,
                left: 14,
                right: 14,
              }}
              onPress={() =>
                respond('left')
              }
            >
              <LinearGradient
                colors={[
                  '#FF8A8A',
                  '#E53935',
                  '#B71C1C',
                ]}
                style={[
                  styles.circle,
                  {
                    width:
                      leftDiameter,
                    height:
                      leftDiameter,
                    borderRadius:
                      leftDiameter / 2,
                  },
                ]}
              />
            </TouchableOpacity>
          </Animated.View>

          <Text
            allowFontScaling={false}
            style={[
              styles.circleLabel,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {language === 'fa'
              ? 'چپ'
              : 'Left'}
          </Text>
        </View>

        {/* RIGHT CIRCLE */}

        <View
          style={[
            styles.circleColumn,
            {
              marginLeft:
                spacing / 2,
            },
          ]}
        >
          <Animated.View
            style={{
              transform: [
                {
                  scale: circlePulse,
                },
              ],
            }}
          >
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!isReady}
              hitSlop={{
                top: 14,
                bottom: 14,
                left: 14,
                right: 14,
              }}
              onPress={() =>
                respond('right')
              }
            >
              <LinearGradient
                colors={[
                  '#7FD8FF',
                  '#1E88E5',
                  '#0D47A1',
                ]}
                style={[
                  styles.circle,
                  {
                    width:
                      rightDiameter,
                    height:
                      rightDiameter,
                    borderRadius:
                      rightDiameter / 2,
                  },
                ]}
              />
            </TouchableOpacity>
          </Animated.View>

          <Text
            allowFontScaling={false}
            style={[
              styles.circleLabel,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {language === 'fa'
              ? 'راست'
              : 'Right'}
          </Text>
        </View>
      </View>

      {/* FEEDBACK */}

      <View
        style={styles.feedbackArea}
      >
        {feedback.type !== 'idle' && (
          <View
            style={[
              styles.feedbackRow,
              {
                flexDirection:
                  isRTL
                    ? 'row-reverse'
                    : 'row',

                backgroundColor:
                  feedback.type ===
                  'correct'
                    ? colors.success +
                      '18'
                    : feedback.type ===
                      'wrong'
                    ? colors.error +
                      '18'
                    : colors.warning +
                      '18',
              },
            ]}
          >
            {feedback.type ===
            'correct' ? (
              <CheckCircle
                size={18}
                color={colors.success}
              />
            ) : feedback.type ===
              'wrong' ? (
              <XCircle
                size={18}
                color={colors.error}
              />
            ) : (
              <Clock
                size={18}
                color={colors.warning}
              />
            )}

            <Text
              allowFontScaling={false}
              style={[
                styles.feedbackText,
                {
                  color:
                    feedback.type ===
                    'correct'
                      ? colors.success
                      : feedback.type ===
                        'wrong'
                      ? colors.error
                      : colors.warning,
                },
              ]}
            >
              {feedback.text}
            </Text>
          </View>
        )}

        {!!detailText && (
          <Text
            allowFontScaling={false}
            style={[
              styles.detailText,
              {
                color:
                  colors.textSecondary,
              },
            ]}
          >
            {detailText}
          </Text>
        )}
      </View>
    </View>
  );
}

/*
 * ============================================================
 * STYLES
 * ============================================================
 */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /*
   * FIXED HEADER
   */

  fixedHeader: {
    height: 72,
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: 10,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

  

    zIndex: 100,
    elevation: 5,
  },

  fixedBackButton: {
    width: 42,
    height: 42,

    borderRadius: 21,

    alignItems: 'center',
    justifyContent: 'center',

    /*
     * IMPORTANT:
     * No RTL-dependent direction here.
     * This button is ALWAYS on the LEFT.
     */
  },

  fixedHeaderTitle: {
    position: 'absolute',

    left: 0,
    right: 0,

    height: 72,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    pointerEvents: 'none',
  },

  fixedHeaderTitleText: {
    fontSize: 17,
    fontWeight: '800',
  },

  fixedHeaderSpacer: {
    width: 42,
    height: 42,
  },

  /*
   * INTRO
   */

  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },

  introHeader: {
    alignItems: 'center',
    marginTop: 28,
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
    fontSize: 26,
    fontWeight: '800',
  },

  subtitle: {
    fontSize: 14,
    marginTop: 6,
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
    gap: 8,
  },

  instructionDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    marginTop: 7,
  },

  instructionText: {
    flex: 1,

    fontSize: 13,
    lineHeight: 20,
  },

  statsPreview: {
    gap: 10,
    marginBottom: Spacing.lg,
  },

  statPreviewItem: {
    flex: 1,

    borderWidth: 1,
    borderRadius: BorderRadius.md,

    paddingVertical: 12,

    alignItems: 'center',
    gap: 6,
  },

  statPreviewText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

  startButton: {
    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    paddingVertical: 16,

    borderRadius: BorderRadius.full,
  },

  startButtonText: {
    color: '#fff',

    fontSize: 16,
    fontWeight: '800',
  },

  /*
   * GAME
   */

  gameContainer: {
    flex: 1,
  },

  gameStatsBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 12,
    paddingBottom: 6,

    alignItems: 'center',
    justifyContent: 'space-between',
  },

  stat: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 6,
  },

  statText: {
    fontSize: 15,
    fontWeight: '800',
  },

  timerTrack: {
    height: 5,

    marginHorizontal:
      Spacing.lg,

    borderRadius: 3,

    overflow: 'hidden',
  },

  timerFill: {
    height: '100%',
    borderRadius: 3,
  },

  infoText: {
    fontSize: 16,
    fontWeight: '700',

    textAlign: 'center',

    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },

  playArea: {
    borderWidth: 1,

    borderRadius: BorderRadius.lg,

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    alignSelf: 'center',
  },

  circleColumn: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  circle: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,

    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 6,
  },

  circleLabel: {
    fontSize: 12,
    fontWeight: '600',

    marginTop: 10,
  },

  /*
   * FEEDBACK
   */

  feedbackArea: {
    marginTop: Spacing.lg,

    paddingHorizontal:
      Spacing.lg,

    alignItems: 'center',

    minHeight: 70,
  },

  feedbackRow: {
    alignItems: 'center',

    gap: 8,

    paddingHorizontal: 16,
    paddingVertical: 10,

    borderRadius:
      BorderRadius.full,
  },

  feedbackText: {
    fontSize: 14,
    fontWeight: '800',
  },

  detailText: {
    fontSize: 12,

    marginTop: 8,

    textAlign: 'center',
  },

  /*
   * RESULT
   */

  resultScrollContent: {
    flexGrow: 1,

    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },

  resultOverlay: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingVertical: Spacing.lg,
  },

  resultCard: {
    width: '100%',

    padding: Spacing.xl,

    borderRadius:
      BorderRadius.xl,

    alignItems: 'center',
  },

  resultTitle: {
    fontSize: 22,
    fontWeight: '800',

    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },

  resultStatsGrid: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 10,

    width: '100%',

    marginBottom: Spacing.lg,
  },

  resultStatBox: {
    width: '47%',

    borderWidth: 1,

    borderRadius:
      BorderRadius.md,

    paddingVertical: 14,

    alignItems: 'center',
  },

  resultStatValue: {
    fontSize: 18,
    fontWeight: '900',
  },

  resultStatLabel: {
    fontSize: 11,

    marginTop: 4,

    textAlign: 'center',
  },

  finalScore: {
    fontSize: 24,
    fontWeight: '900',

    marginBottom: Spacing.lg,
  },

  resultButton: {
    width: '100%',

    flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    paddingVertical: 14,

    borderRadius:
      BorderRadius.full,
  },

  resultButtonText: {
    color: '#fff',

    fontSize: 15,
    fontWeight: '800',
  },

  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius:
      BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});