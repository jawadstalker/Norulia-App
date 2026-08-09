import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  Easing,
  Alert,
} from 'react-native';

import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Palette,
  Sparkles,
  Compass,
  Target,
  Trophy,
  RotateCcw,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TOTAL_TRIALS = 30;
const NUM_DOTS = 80;

const DIRECTIONS = ['Up', 'Down', 'Left', 'Right'] as const;

type Direction = (typeof DIRECTIONS)[number];

type Dot = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
};

type Result = {
  coherence: number;
  correct: boolean;
  rt: number;
};

const DOT_COLORS = [
  '#FFD700',
  '#FF4444',
  '#00E5D0',
  '#FFC107',
  '#8B5CF6',
  '#FF1493',
  '#00D4FF',
  '#FF6B35',
];

const directionTranslation: Record<Direction, string> = {
  Up: 'بالا',
  Down: 'پایین',
  Left: 'چپ',
  Right: 'راست',
};

const directionTranslationEn: Record<Direction, string> = {
  Up: 'Up',
  Down: 'Down',
  Left: 'Left',
  Right: 'Right',
};

const getDirectionVector = (
  direction: Direction,
): [number, number] => {
  switch (direction) {
    case 'Up':
      return [0, -2];
    case 'Down':
      return [0, 2];
    case 'Left':
      return [-2, 0];
    case 'Right':
      return [2, 0];
  }
};

const random = (min: number, max: number) =>
  Math.random() * (max - min) + min;

export default function VisualFlowScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { language, isRTL } = useLanguage();

  const [showTutorial, setShowTutorial] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const [trialCount, setTrialCount] = useState(0);
  const [score, setScore] = useState(0);

  const [currentDirection, setCurrentDirection] =
    useState<Direction | null>(null);

  const [coherenceLevel, setCoherenceLevel] =
    useState(0.5);

  const [trialActive, setTrialActive] =
    useState(false);

  const [gameEnded, setGameEnded] = useState(false);

  const [infoText, setInfoText] = useState(
    language === 'fa'
      ? '👆 جهت حرکت دسته‌ی نقاط را تشخیص بده!'
      : '👆 Detect the direction of the moving dots!',
  );

  const [infoType, setInfoType] = useState<
    'normal' | 'correct' | 'wrong'
  >('normal');

  const [dots, setDots] = useState<Dot[]>([]);

  const [results, setResults] = useState<Result[]>([]);

  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const generateDots = useCallback(
    (
      direction: Direction,
      coherence: number,
    ) => {
      const generated: Dot[] = [];

      const [cohVx, cohVy] =
        getDirectionVector(direction);

      const canvasWidth = SCREEN_WIDTH - 48;
      const canvasHeight = 260;

      for (let i = 0; i < NUM_DOTS; i++) {
        const isCoherent =
          Math.random() < coherence;

        let vx: number;
        let vy: number;

        if (isCoherent) {
          vx = cohVx + random(-0.3, 0.3);
          vy = cohVy + random(-0.3, 0.3);
        } else {
          const angle = random(
            0,
            Math.PI * 2,
          );

          const speed = random(1, 3);

          vx = Math.cos(angle) * speed;
          vy = Math.sin(angle) * speed;
        }

        generated.push({
          id: i,
          x: random(8, canvasWidth - 8),
          y: random(8, canvasHeight - 8),
          vx,
          vy,
          color:
            DOT_COLORS[
              Math.floor(
                Math.random() *
                  DOT_COLORS.length,
              )
            ],
        });
      }

      setDots(generated);
    },
    [],
  );

  const animateDots = useCallback(() => {
    if (!trialActive || !currentDirection) {
      return;
    }

    setDots(prevDots => {
      const canvasWidth =
        SCREEN_WIDTH - 48;

      const canvasHeight = 260;

      return prevDots.map(dot => {
        let x = dot.x + dot.vx;
        let y = dot.y + dot.vy;

        if (x < 0) x = canvasWidth;
        if (x > canvasWidth) x = 0;

        if (y < 0) y = canvasHeight;
        if (y > canvasHeight) y = 0;

        return {
          ...dot,
          x,
          y,
        };
      });
    });
  }, [trialActive, currentDirection]);

  useEffect(() => {
    if (!trialActive) return;

    timerRef.current =
      setInterval(animateDots, 40);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [trialActive, animateDots]);

  const startTrial = useCallback(() => {
    if (trialCount >= TOTAL_TRIALS) {
      return;
    }

    const nextTrial = trialCount + 1;

    const direction =
      DIRECTIONS[
        Math.floor(
          Math.random() * DIRECTIONS.length,
        )
      ];

    const coherence = random(
      0.2,
      0.8,
    );

    setTrialCount(nextTrial);
    setTrialActive(true);
    setGameEnded(false);

    setCurrentDirection(direction);
    setCoherenceLevel(coherence);

    startTimeRef.current = Date.now();

    generateDots(
      direction,
      coherence,
    );

    setInfoType('normal');

    setInfoText(
      language === 'fa'
        ? '🤔 جهت حرکت را پیدا کن و دکمه را بزن!'
        : '🤔 Find the direction and answer!',
    );
  }, [
    trialCount,
    generateDots,
    language,
  ]);

  const startGame = () => {
    setShowTutorial(false);

    if (!trialActive && trialCount === 0) {
      setTimeout(() => {
        startTrial();
      }, 500);
    }
  };

  const checkAnswer = async (
    direction: Direction,
  ) => {
    if (
      !trialActive ||
      gameEnded ||
      !currentDirection
    ) {
      return;
    }

    setTrialActive(false);

    const reactionTime =
      Date.now() -
      startTimeRef.current;

    const correct =
      direction === currentDirection;

    setResults(prev => [
      ...prev,
      {
        coherence: coherenceLevel,
        correct,
        rt: reactionTime,
      },
    ]);

    if (correct) {
      setScore(prev => prev + 10);

      setInfoType('correct');

      setInfoText(
        language === 'fa'
          ? '✅ درسته! 🎉'
          : '✅ Correct! 🎉',
      );
    } else {
      setInfoType('wrong');

      const correctDirection =
        language === 'fa'
          ? directionTranslation[
              currentDirection
            ]
          : directionTranslationEn[
              currentDirection
            ];

      setInfoText(
        language === 'fa'
          ? `❌ اشتباه! جهت اصلی ${correctDirection} بود`
          : `❌ Wrong! The correct direction was ${correctDirection}`,
      );
    }

    if (
      trialCount >= TOTAL_TRIALS
    ) {
      setTimeout(() => {
        endGame();
      }, 800);

      return;
    }

    setTimeout(() => {
      startTrial();
    }, 800);
  };

  const endGame = () => {
    setGameEnded(true);
    setTrialActive(false);

    const total =
      results.length;

    const corrects =
      results.filter(
        result => result.correct,
      ).length;

    const accuracy =
      total > 0
        ? (corrects / total) * 100
        : 0;

    const correctReactionTimes =
      results
        .filter(
          result =>
            result.correct &&
            result.rt > 0,
        )
        .map(result => result.rt);

    const avgRt =
      correctReactionTimes.length > 0
        ? correctReactionTimes.reduce(
            (a, b) => a + b,
            0,
          ) /
          correctReactionTimes.length
        : 0;

    setInfoType('correct');

    setInfoText(
      language === 'fa'
        ? '🎯 تست تمام شد!'
        : '🎯 Test completed!',
    );

    setTimeout(() => {
      const report =
        language === 'fa'
          ? `📊 گزارش جریان بصری

✅ پاسخ صحیح: ${corrects} از ${total}
🎯 دقت: ${accuracy.toFixed(1)}%
⚡ میانگین زمان واکنش: ${avgRt.toFixed(0)}ms
⭐ امتیاز نهایی: ${score}

💪 ممنون از تلاشت!`
          : `📊 Visual Flow Report

✅ Correct: ${corrects} / ${total}
🎯 Accuracy: ${accuracy.toFixed(1)}%
⚡ Average reaction time: ${avgRt.toFixed(0)}ms
⭐ Final score: ${score}

💪 Great job!`;

      Alert.alert(
        language === 'fa'
          ? 'گزارش تست'
          : 'Test Report',
        report,
      );
    }, 300);
  };

  const restartGame = () => {
    setGameEnded(false);
    setTrialCount(0);
    setScore(0);
    setResults([]);
    setCurrentDirection(null);
    setCoherenceLevel(0.5);
    setTrialActive(false);
    setDots([]);

    setInfoType('normal');

    setInfoText(
      language === 'fa'
        ? '👆 جهت حرکت دسته‌ی نقاط را تشخیص بده!'
        : '👆 Detect the direction of the moving dots!',
    );

    setTimeout(() => {
      startTrial();
    }, 500);
  };

  const showExit = () => {
    setShowExitDialog(true);
  };

  const closeExit = () => {
    setShowExitDialog(false);
  };

  const confirmExit = () => {
    setShowExitDialog(false);

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const panResponder =
    useRef(
      PanResponder.create({
        onStartShouldSetPanResponder:
          () => true,

        onMoveShouldSetPanResponder:
          () => true,

        onPanResponderRelease:
          (_, gesture) => {
            const {
              dx,
              dy,
            } = gesture;

            if (
              Math.abs(dx) < 10 &&
              Math.abs(dy) < 10
            ) {
              return;
            }

            if (
              Math.abs(dx) >
              Math.abs(dy)
            ) {
              checkAnswer(
                dx > 0
                  ? 'Right'
                  : 'Left',
              );
            } else {
              checkAnswer(
                dy > 0
                  ? 'Down'
                  : 'Up',
              );
            }
          },
      }),
    ).current;

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor:
            '#1A0A2A',
        },
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            backgroundColor:
              'rgba(209,0,209,0.05)',
          },
        ]}
      />

      <View
        style={[
          styles.container,
          {
            backgroundColor:
              '#2D1547',
          },
        ]}
      >
        <View
          style={[
            styles.header,
            {
              flexDirection:
                isRTL
                  ? 'row-reverse'
                  : 'row',
            },
          ]}
        >
          <TouchableOpacity
            onPress={showExit}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <ArrowLeft
              size={22}
              color="#fff"
              style={
                isRTL
                  ? {
                      transform: [
                        {
                          scaleX: -1,
                        },
                      ],
                    }
                  : undefined
              }
            />
          </TouchableOpacity>

          <Text
            style={[
              styles.headerTitle,
              {
                textAlign:
                  'center',
              },
            ]}
          >
            🎨{' '}
            {language === 'fa'
              ? 'جریان بصری'
              : 'Visual Flow'}
          </Text>

          <View
            style={
              styles.headerSpacer
            }
          />
        </View>

        <View
          {...panResponder.panHandlers}
          style={styles.canvasWrapper}
        >
          {dots.map(dot => (
            <View
              key={dot.id}
              style={[
                styles.dot,
                {
                  left: dot.x,
                  top: dot.y,
                  backgroundColor:
                    dot.color,
                  shadowColor:
                    dot.color,
                },
              ]}
            />
          ))}

          {showTutorial && (
            <Tutorial
              language={language}
              isRTL={isRTL}
              onBack={showExit}
              onStart={startGame}
            />
          )}
        </View>

        <Text
          style={[
            styles.infoText,
            {
              color:
                infoType === 'correct'
                  ? '#34D399'
                  : infoType === 'wrong'
                    ? '#FF6B81'
                    : '#E8D0F0',
            },
          ]}
        >
          {infoText}
        </Text>

        <View
          style={[
            styles.directionButtons,
            {
              flexDirection:
                isRTL
                  ? 'row-reverse'
                  : 'row',
            },
          ]}
        >
          <DirectionButton
            label="⬆️"
            onPress={() =>
              checkAnswer('Up')
            }
          />

          <DirectionButton
            label="⬇️"
            onPress={() =>
              checkAnswer('Down')
            }
          />

          <DirectionButton
            label="⬅️"
            onPress={() =>
              checkAnswer('Left')
            }
          />

          <DirectionButton
            label="➡️"
            onPress={() =>
              checkAnswer('Right')
            }
          />
        </View>

        <View
          style={[
            styles.statusBar,
            {
              flexDirection:
                isRTL
                  ? 'row-reverse'
                  : 'row',
            },
          ]}
        >
          <StatusItem
            label={
              language === 'fa'
                ? '🎯 دور'
                : '🎯 Round'
            }
            value={`${trialCount}/${TOTAL_TRIALS}`}
          />

          <StatusItem
            label={
              language === 'fa'
                ? '⭐ امتیاز'
                : '⭐ Score'
            }
            value={String(score)}
          />

          <StatusItem
            label={
              language === 'fa'
                ? '📊 سختی'
                : '📊 Difficulty'
            }
            value={
              trialActive
                ? `${Math.round(
                    coherenceLevel *
                      100,
                  )}%`
                : '--'
            }
          />
        </View>

        {gameEnded && (
          <TouchableOpacity
            onPress={restartGame}
            style={styles.restartButton}
            activeOpacity={0.8}
          >
            <RotateCcw
              size={18}
              color="#E8D0F0"
            />

            <Text
              style={
                styles.restartText
              }
            >
              {language === 'fa'
                ? 'شروع دوباره'
                : 'Restart'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        transparent
        visible={showExitDialog}
        animationType="fade"
        onRequestClose={
          closeExit
        }
      >
        <View
          style={styles.modalOverlay}
        >
          <View
            style={styles.exitDialog}
          >
            <Text
              style={
                styles.dialogTitle
              }
            >
              {language === 'fa'
                ? 'خروج از نورولیا'
                : 'Exit Neurolia'}
            </Text>

            <Text
              style={
                styles.dialogMessage
              }
            >
              {language === 'fa'
                ? 'آیا از تست خارج می‌شوید؟'
                : 'Are you sure you want to exit?'}
            </Text>

            <View
              style={[
                styles.dialogButtons,
                {
                  flexDirection:
                    isRTL
                      ? 'row-reverse'
                      : 'row',
                },
              ]}
            >
              <TouchableOpacity
                onPress={confirmExit}
                style={[
                  styles.dialogButton,
                  styles.confirmButton,
                ]}
              >
                <CheckCircle
                  size={20}
                  color="#fff"
                />

                <Text
                  style={
                    styles.dialogButtonText
                  }
                >
                  {language === 'fa'
                    ? 'تایید'
                    : 'Confirm'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={closeExit}
                style={
                  styles.dialogButton
                }
              >
                <XCircle
                  size={20}
                  color="#E8D0F0"
                />

                <Text
                  style={
                    styles.dialogButtonText
                  }
                >
                  {language === 'fa'
                    ? 'انصراف'
                    : 'Cancel'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Tutorial({
  language,
  isRTL,
  onBack,
  onStart,
}: {
  language: string;
  isRTL: boolean;
  onBack: () => void;
  onStart: () => void;
}) {
  return (
    <View
      style={styles.tutorial}
    >
      <TouchableOpacity
        onPress={onBack}
        style={[
          styles.tutorialBack,
          isRTL
            ? { left: 14, right: undefined }
            : { right: 14 },
        ]}
      >
        <ArrowLeft
          size={20}
          color="#fff"
          style={
            isRTL
              ? {
                  transform: [
                    {
                      scaleX: -1,
                    },
                  ],
                }
              : undefined
          }
        />
      </TouchableOpacity>

      <View
        style={styles.logo}
      >
        <Palette
          size={38}
          color="#fff"
        />
      </View>

      <Text
        style={styles.tutorialTitle}
      >
        {language === 'fa'
          ? 'جریان بصری'
          : 'Visual Flow'}
      </Text>

      <Text
        style={styles.tutorialSubtitle}
      >
        {language === 'fa'
          ? 'جهت حرکت دسته‌ی نقاط را پیدا کن!'
          : 'Find the main direction of the moving dots!'}
      </Text>

      <View
        style={styles.ruleBox}
      >
        <Rule
          icon="✨"
          text={
            language === 'fa'
              ? 'نقاط رنگ‌ارنگ را تماشا کن'
              : 'Watch the colorful dots'
          }
        />

        <Rule
          icon="🧭"
          text={
            language === 'fa'
              ? 'جهت اصلی حرکت آنها را تشخیص بده'
              : 'Detect their main movement direction'
          }
        />

        <Rule
          icon="⭐"
          text={
            language === 'fa'
              ? 'هر پاسخ درست = ۱۰ امتیاز'
              : 'Each correct answer = 10 points'
          }
          highlight
        />

        <Rule
          icon="🎯"
          text={
            language === 'fa'
              ? '۳۰ دور و افزایش تدریجی سختی'
              : '30 rounds with increasing difficulty'
          }
          highlight
        />
      </View>

      <TouchableOpacity
        onPress={onStart}
        style={styles.startButton}
        activeOpacity={0.8}
      >
        <Text
          style={styles.startButtonText}
        >
          ▶{' '}
          {language === 'fa'
            ? 'شروع تست'
            : 'Start Test'}
        </Text>
      </TouchableOpacity>

      <Text
        style={styles.hint}
      >
        {language === 'fa'
          ? '👆 با کلیک روی دکمه‌ها یا کشیدن روی صفحه پاسخ بده'
          : '👆 Use the buttons or swipe on the screen'}
      </Text>
    </View>
  );
}

function Rule({
  icon,
  text,
  highlight = false,
}: {
  icon: string;
  text: string;
  highlight?: boolean;
}) {
  return (
    <View
      style={styles.ruleItem}
    >
      <Text
        style={styles.ruleIcon}
      >
        {icon}
      </Text>

      <Text
        style={[
          styles.ruleText,
          highlight &&
            styles.highlightText,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

function DirectionButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.directionButton}
      activeOpacity={0.7}
    >
      <Text
        style={
          styles.directionText
        }
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function StatusItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View
      style={styles.statusItem}
    >
      <Text
        style={styles.statusLabel}
      >
        {label}
      </Text>

      <Text
        style={styles.statusValue}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },

  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: 80,
    left: -80,
  },

  container: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 32,
    padding: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor:
      'rgba(211,0,209,0.08)',
  },

  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor:
      'rgba(211,0,209,0.08)',
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor:
      'rgba(211,0,209,0.08)',
  },

  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  headerSpacer: {
    width: 40,
  },

  canvasWrapper: {
    height: 260,
    marginTop: 10,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#10071D',
    borderWidth: 1,
    borderColor:
      'rgba(211,0,209,0.08)',
    position: 'relative',
  },

  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: 4,
  },

  infoText: {
    minHeight: 40,
    paddingTop: 10,
    paddingBottom: 4,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },

  directionButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    marginTop: 6,
    flexWrap: 'wrap',
  },

  directionButton: {
    minWidth: 52,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor:
      'rgba(211,0,209,0.08)',
  },

  directionText: {
    fontSize: 20,
    fontWeight: '700',
  },

  statusBar: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'space-between',
    backgroundColor:
      'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor:
      'rgba(211,0,209,0.06)',
  },

  statusItem: {
    alignItems: 'center',
  },

  statusLabel: {
    color: '#A070B0',
    fontSize: 10,
    fontWeight: '500',
  },

  statusValue: {
    color: '#E8D0F0',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },

  restartButton: {
    marginTop: 10,
    minHeight: 44,
    borderRadius: 30,
    borderWidth: 1,
    borderColor:
      'rgba(211,0,209,0.08)',
    backgroundColor:
      'rgba(255,255,255,0.02)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  restartText: {
    color: '#E8D0F0',
    fontSize: 14,
    fontWeight: '600',
  },

  tutorial: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(45,21,71,0.96)',
  },

  tutorialBack: {
    position: 'absolute',
    top: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor:
      'rgba(211,0,209,0.08)',
  },

  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(209,0,209,0.08)',
    marginBottom: 8,
  },

  tutorialTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
  },

  tutorialSubtitle: {
    color: '#A070B0',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
    textAlign: 'center',
  },

  ruleBox: {
    width: '92%',
    maxWidth: 300,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor:
      'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor:
      'rgba(211,0,209,0.06)',
  },

  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 5,
  },

  ruleIcon: {
    width: 32,
    fontSize: 21,
    textAlign: 'center',
  },

  ruleText: {
    flex: 1,
    color: '#E8D0F0',
    fontSize: 13,
  },

  highlightText: {
    color: '#D100D1',
    fontWeight: '700',
  },

  startButton: {
    marginTop: 12,
    paddingHorizontal: 42,
    paddingVertical: 13,
    borderRadius: 60,
    backgroundColor:
      'rgba(209,0,209,0.10)',
    borderWidth: 1,
    borderColor:
      'rgba(209,0,209,0.12)',
  },

  startButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },

  hint: {
    color: '#A070B0',
    fontSize: 11,
    marginTop: 10,
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(26,10,42,0.90)',
    padding: 20,
  },

  exitDialog: {
    width: '90%',
    maxWidth: 320,
    paddingHorizontal: 24,
    paddingVertical: 30,
    borderRadius: 28,
    backgroundColor: '#2D1547',
    borderWidth: 1,
    borderColor:
      'rgba(211,0,209,0.08)',
  },

  dialogTitle: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
  },

  dialogMessage: {
    color: '#E8D0F0',
    fontSize: 15,
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 25,
    textAlign: 'center',
  },

  dialogButtons: {
    justifyContent: 'center',
    gap: 10,
  },

  dialogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 60,
    backgroundColor:
      'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor:
      'rgba(211,0,209,0.08)',
  },

  confirmButton: {
    backgroundColor:
      'rgba(209,0,209,0.08)',
  },

  dialogButtonText: {
    color: '#E8D0F0',
    fontSize: 14,
    fontWeight: '600',
  },
});