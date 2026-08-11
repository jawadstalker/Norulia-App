
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Trophy,
  Zap,
  Heart,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';

/* ================================================================
   CONSTANTS
================================================================ */

const PLAY_TOP_MARGIN = 110;
const PLAY_BOTTOM_MARGIN = 40;
const PLAY_SIDE_MARGIN = 8;

/* ================================================================
   TYPES
================================================================ */

type Level = {
  name: string;
  nameFa: string;
  lifeTime: number;
  spawnInterval: number;
  maxObjects: number;
  objectSize: number;
  duration: number;
};

type GameObject = {
  id: number;
  color: 'green' | 'red';
  x: number;
  y: number;
  scale: Animated.Value;
  opacity: Animated.Value;
};

type ScorePopup = {
  id: number;
  x: number;
  y: number;
  value: number;
  opacity: Animated.Value;
  translateY: Animated.Value;
};

/* ================================================================
   LEVELS
================================================================ */

const LEVELS: Level[] = [
  {
    name: 'Easy',
    nameFa: 'آسان',
    lifeTime: 1800,
    spawnInterval: 900,
    maxObjects: 3,
    objectSize: 68,
    duration: 30000,
  },
  {
    name: 'Medium',
    nameFa: 'متوسط',
    lifeTime: 1400,
    spawnInterval: 700,
    maxObjects: 4,
    objectSize: 62,
    duration: 35000,
  },
  {
    name: 'Hard',
    nameFa: 'سخت',
    lifeTime: 1100,
    spawnInterval: 550,
    maxObjects: 5,
    objectSize: 56,
    duration: 40000,
  },
  {
    name: 'Extreme',
    nameFa: 'حرفه‌ای',
    lifeTime: 850,
    spawnInterval: 400,
    maxObjects: 6,
    objectSize: 50,
    duration: 45000,
  },
];


interface BackButtonProps {
  onPress: () => void;
  colors: any;
  label?: string;
  showLabel?: boolean;
  compact?: boolean;
}

function BackButton({
  onPress,
  colors,
  label,
  showLabel = true,
  compact = false,
}: BackButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label || 'Back'}
      style={[
        styles.unifiedBackButton,
        compact && styles.compactBackButton,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <ArrowLeft
        size={compact ? 20 : 20}
        color={colors.text}
        strokeWidth={2.5}
      />


    </TouchableOpacity>
  );
}

/* ================================================================
   MAIN SCREEN
================================================================ */

export default function LastSurvivalScreen() {
  const { colors } = useTheme();

  const {
    t,
    language,
    isRTL,
  } = useLanguage();

  const router = useRouter();

  const {
    width,
    height,
  } = useWindowDimensions();

  const [selectedLevel, setSelectedLevel] =
    useState<number | null>(null);

  const [playing, setPlaying] =
    useState(false);

  const [score, setScore] =
    useState(0);

  const [lives, setLives] =
    useState(3);

  const [objects, setObjects] =
    useState<GameObject[]>([]);

  const [popups, setPopups] =
    useState<ScorePopup[]>([]);

  const [gameOver, setGameOver] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  /* ================================================================
     REFS
  ================================================================= */

  const objectId = useRef(0);

  const popupId = useRef(0);

  const removingIds =
    useRef<Set<number>>(new Set());

  const objectTimers =
    useRef<
      Map<
        number,
        ReturnType<typeof setTimeout>
      >
    >(new Map());

  const spawnTimer =
    useRef<
      ReturnType<typeof setInterval> | null
    >(null);

  const gameTimer =
    useRef<
      ReturnType<typeof setTimeout> | null
    >(null);

  const hitFlash =
    useRef(new Animated.Value(0)).current;

  const isMounted =
    useRef(true);

  const livesRef =
    useRef(3);

  const level =
    selectedLevel !== null
      ? LEVELS[selectedLevel]
      : LEVELS[0];

  /* ================================================================
     BACK NAVIGATION

     مسیر برگشت در تمام حالت‌ها یکسان است.
  ================================================================= */

  const handleBack = useCallback(() => {
    clearAllTimers();

    setPlaying(false);
    setSelectedLevel(null);
    setGameOver(false);
    setCompleted(false);
    setObjects([]);
    setPopups([]);

    isMounted.current = true;

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  /* ================================================================
     CLEAR TIMERS
  ================================================================= */

  const clearAllTimers =
    useCallback(() => {
      if (spawnTimer.current) {
        clearInterval(spawnTimer.current);
        spawnTimer.current = null;
      }

      if (gameTimer.current) {
        clearTimeout(gameTimer.current);
        gameTimer.current = null;
      }

      objectTimers.current.forEach(
        (timer) => clearTimeout(timer)
      );

      objectTimers.current.clear();
    }, []);

  /* ================================================================
     REMOVE OBJECT
  ================================================================= */

  const removeObject =
    useCallback((id: number) => {
      const timer =
        objectTimers.current.get(id);

      if (timer) {
        clearTimeout(timer);
        objectTimers.current.delete(id);
      }

      removingIds.current.delete(id);

      setObjects((prev) =>
        prev.filter(
          (o) => o.id !== id
        )
      );
    }, []);

  /* ================================================================
     END GAME
  ================================================================= */

  const endGame =
    useCallback(
      (success: boolean) => {
        clearAllTimers();

        setPlaying(false);
        setObjects([]);

        if (success) {
          setCompleted(true);
        } else {
          setGameOver(true);
        }
      },
      [clearAllTimers]
    );

  /* ================================================================
     SCORE POPUP
  ================================================================= */

  const spawnPopup =
    useCallback(
      (
        x: number,
        y: number,
        value: number
      ) => {
        const opacity =
          new Animated.Value(0);

        const translateY =
          new Animated.Value(0);

        const id =
          popupId.current++;

        setPopups((prev) => [
          ...prev,
          {
            id,
            x,
            y,
            value,
            opacity,
            translateY,
          },
        ]);

        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),

          Animated.timing(
            translateY,
            {
              toValue: -50,
              duration: 650,
              useNativeDriver: true,
            }
          ),
        ]).start(() => {
          Animated.timing(
            opacity,
            {
              toValue: 0,
              duration: 250,
              useNativeDriver: true,
            }
          ).start(() => {
            if (isMounted.current) {
              setPopups((prev) =>
                prev.filter(
                  (p) => p.id !== id
                )
              );
            }
          });
        });
      },
      []
    );

  /* ================================================================
     SPAWN OBJECT
  ================================================================= */

  const spawnObject =
    useCallback(
      (currentLevel: Level) => {
        const size =
          currentLevel.objectSize;

        const maxX =
          width -
          PLAY_SIDE_MARGIN * 2 -
          size;

        const maxY =
          height -
          PLAY_TOP_MARGIN -
          PLAY_BOTTOM_MARGIN -
          size;

        const x =
          PLAY_SIDE_MARGIN +
          Math.random() *
            Math.max(maxX, 0);

        const y =
          PLAY_TOP_MARGIN +
          Math.random() *
            Math.max(maxY, 0);

        const id =
          objectId.current++;

        const isGreen =
          Math.random() > 0.35;

        const scale =
          new Animated.Value(0);

        const opacity =
          new Animated.Value(1);

        const newObject: GameObject = {
          id,
          color: isGreen
            ? 'green'
            : 'red',
          x,
          y,
          scale,
          opacity,
        };

        setObjects((prev) => [
          ...prev,
          newObject,
        ]);

        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }).start();

        const timer =
          setTimeout(() => {
            if (
              !isMounted.current ||
              removingIds.current.has(id)
            ) {
              return;
            }

            removingIds.current.add(id);

            Animated.parallel([
              Animated.timing(
                scale,
                {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }
              ),

              Animated.timing(
                opacity,
                {
                  toValue: 0,
                  duration: 200,
                  useNativeDriver: true,
                }
              ),
            ]).start(() => {
              removeObject(id);
            });
          }, currentLevel.lifeTime);

        objectTimers.current.set(
          id,
          timer
        );
      },
      [
        removeObject,
        width,
        height,
      ]
    );

  /* ================================================================
     OBJECT PRESS
  ================================================================= */

  const handleObjectPress =
    useCallback(
      (object: GameObject) => {
        if (!playing) return;

        if (
          removingIds.current.has(
            object.id
          )
        ) {
          return;
        }

        removingIds.current.add(
          object.id
        );

        const isGreen =
          object.color === 'green';

        const delta =
          isGreen ? 10 : -10;

        const centerX =
          object.x +
          level.objectSize / 2 -
          20;

        const centerY =
          object.y - 10;

        spawnPopup(
          centerX,
          centerY,
          delta
        );

        Animated.sequence([
          Animated.timing(
            object.scale,
            {
              toValue: 1.3,
              duration: 70,
              useNativeDriver: true,
            }
          ),

          Animated.parallel([
            Animated.timing(
              object.scale,
              {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }
            ),

            Animated.timing(
              object.opacity,
              {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }
            ),
          ]),
        ]).start(() => {
          removeObject(object.id);
        });

        if (isGreen) {
          setScore(
            (prev) => prev + 10
          );
        } else {
          setScore(
            (prev) => prev - 10
          );

          Animated.sequence([
            Animated.timing(
              hitFlash,
              {
                toValue: 1,
                duration: 70,
                useNativeDriver: true,
              }
            ),

            Animated.timing(
              hitFlash,
              {
                toValue: 0,
                duration: 260,
                useNativeDriver: true,
              }
            ),
          ]).start();

          livesRef.current -= 1;

          setLives(
            livesRef.current
          );

          if (
            livesRef.current <= 0
          ) {
            setTimeout(
              () => endGame(false),
              120
            );
          }
        }
      },
      [
        playing,
        level.objectSize,
        spawnPopup,
        removeObject,
        endGame,
        hitFlash,
      ]
    );

  /* ================================================================
     START GAME
  ================================================================= */

  const startGame =
    useCallback(
      (levelIndex: number) => {
        clearAllTimers();

        isMounted.current = true;

        removingIds.current.clear();

        livesRef.current = 3;

        setSelectedLevel(
          levelIndex
        );

        setPlaying(true);

        setGameOver(false);

        setCompleted(false);

        setScore(0);

        setLives(3);

        setObjects([]);

        setPopups([]);
      },
      [clearAllTimers]
    );

  /* ================================================================
     MOUNT / UNMOUNT
  ================================================================= */

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);

  /* ================================================================
     GAME TIMER / SPAWN TIMER
  ================================================================= */

  useEffect(() => {
    if (
      !playing ||
      selectedLevel === null
    ) {
      return;
    }

    const currentLevel =
      LEVELS[selectedLevel];

    gameTimer.current =
      setTimeout(() => {
        endGame(true);
      }, currentLevel.duration);

    spawnTimer.current =
      setInterval(() => {
        if (!isMounted.current) {
          return;
        }

        setObjects((prev) => {
          if (
            prev.length >=
            currentLevel.maxObjects
          ) {
            return prev;
          }

          spawnObject(currentLevel);

          return prev;
        });
      }, currentLevel.spawnInterval);

    return () => {
      if (spawnTimer.current) {
        clearInterval(
          spawnTimer.current
        );

        spawnTimer.current = null;
      }

      if (gameTimer.current) {
        clearTimeout(
          gameTimer.current
        );

        gameTimer.current = null;
      }
    };
  }, [
    playing,
    selectedLevel,
    endGame,
    spawnObject,
  ]);

  /* ================================================================
     LEVEL DESCRIPTION
  ================================================================= */

  const getLevelDescription =
    useCallback(
      (index: number) => {
        if (language === 'fa') {
          const descriptions = [
            'اشکال آهسته ظاهر می‌شوند',
            'اشکال بیشتر و سریع‌تر ناپدید می‌شوند',
            'اشکال بیشتر با زمان کمتر',
            'اشکال زیاد و زمان خیلی کم',
          ];

          return (
            descriptions[index] || ''
          );
        }

        const descriptions = [
          'Shapes appear slowly',
          'More shapes, less time',
          'Even more shapes, faster pace',
          'Maximum shapes, minimum time',
        ];

        return (
          descriptions[index] || ''
        );
      },
      [language]
    );

  const textAlignStyle =
    isRTL ? 'right' : 'left';

  /* ================================================================
     PAGE 1 — LEVEL SELECTION
  ================================================================= */

  if (
    !playing &&
    selectedLevel === null
  ) {
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
        {/* ========================================================
            BACK BUTTON
            همیشه سمت چپ
        ======================================================== */}

        <BackButton
          onPress={handleBack}
          colors={colors}
          label={t.back}
          showLabel={true}
        />

        {/* ========================================================
            HEADER
        ======================================================== */}

        <View style={styles.levelHeader}>
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor:
                  colors.primary + '20',
              },
            ]}
          >
            <Zap
              size={32}
              color={colors.primary}
            />
          </View>

          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                textAlign: 'center',
              },
            ]}
          >
            Last Survival
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color:
                  colors.textSecondary,
                textAlign: 'center',
              },
            ]}
          >
            {language === 'fa'
              ? 'روی اشکال سبز کلیک کنید. از قرمزها دوری کنید.'
              : 'Click the green shapes. Avoid the red ones.'}
          </Text>
        </View>

        {/* ========================================================
            LEVELS
        ======================================================== */}

        <View style={styles.levels}>
          {LEVELS.map(
            (item, index) => (
              <TouchableOpacity
                key={item.name}
                onPress={() =>
                  startGame(index)
                }
                activeOpacity={0.8}
                style={[
                  styles.levelCard,
                  {
                    backgroundColor:
                      colors.surface,
                    borderColor:
                      colors.border,

                    flexDirection:
                      isRTL
                        ? 'row-reverse'
                        : 'row',
                  },
                ]}
              >
                <View
                  style={[
                    styles.levelNumber,
                    {
                      backgroundColor:
                        colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={
                      styles.levelNumberText
                    }
                  >
                    {index + 1}
                  </Text>
                </View>

                <View
                  style={
                    isRTL
                      ? styles.levelInfoRTL
                      : styles.levelInfo
                  }
                >
                  <Text
                    style={[
                      styles.levelTitle,
                      {
                        color:
                          colors.text,
                        textAlign:
                          textAlignStyle,
                      },
                    ]}
                  >
                    {language === 'fa'
                      ? item.nameFa
                      : item.name}
                  </Text>

                  <Text
                    style={[
                      styles.levelDescription,
                      {
                        color:
                          colors.textSecondary,
                        textAlign:
                          textAlignStyle,
                      },
                    ]}
                  >
                    {getLevelDescription(
                      index
                    )}
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
            )
          )}
        </View>
      </View>
    );
  }

  /* ================================================================
     PAGE 2 — GAME
  ================================================================= */

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
      {/* ==========================================================
          GAME HEADER

          Back همیشه در سمت چپ ثابت است.
          HUD مستقل از BackButton است.
      ========================================================== */}

      <View style={styles.gameHeader}>
        {/* BACK BUTTON */}

        <BackButton
          onPress={handleBack}
          colors={colors}
          label={t.back}
          showLabel={false}
          compact={true}
        />

        {/* GAME STATS */}

        <View style={styles.gameStats}>
          <View style={styles.stat}>
            <Heart
              size={19}
              color={colors.error}
              strokeWidth={2.4}
              fill={colors.error}
            />

            <Text
              style={[
                styles.statText,
                {
                  color: colors.text,
                },
              ]}
            >
              {lives}
            </Text>
          </View>

          <View style={styles.stat}>
            <Trophy
              size={20}
              color={colors.warning}
              strokeWidth={2.3}
            />

            <Text
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

        {/* LEVEL */}

        <Text
          style={[
            styles.levelLabel,
            {
              color: colors.primary,
            },
          ]}
        >
          {language === 'fa'
            ? level.nameFa
            : level.name}
        </Text>
      </View>

      {/* ==========================================================
          PLAY AREA
      ========================================================== */}

      <View style={styles.playArea}>
        {objects.map((object) => (
          <Animated.View
            key={object.id}
            style={[
              styles.movingObject,
              {
                left: object.x,
                top: object.y,
                width:
                  level.objectSize,
                height:
                  level.objectSize,

                backgroundColor:
                  object.color ===
                  'green'
                    ? '#22C55E'
                    : '#EF4444',

                opacity:
                  object.opacity,

                transform: [
                  {
                    scale:
                      object.scale,
                  },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={
                styles.pressableObject
              }
              activeOpacity={0.7}
              onPress={() =>
                handleObjectPress(
                  object
                )
              }
              hitSlop={{
                top: 12,
                bottom: 12,
                left: 12,
                right: 12,
              }}
            >
              <View
                style={styles.eyes}
              >
                <View
                  style={styles.eye}
                />

                <View
                  style={styles.eye}
                />
              </View>

              {object.color ===
              'green' ? (
                <View
                  style={
                    styles.happyMouth
                  }
                />
              ) : (
                <View
                  style={
                    styles.angryMouth
                  }
                />
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}

        {/* SCORE POPUPS */}

        {popups.map((p) => (
          <Animated.View
            key={p.id}
            pointerEvents="none"
            style={[
              styles.popup,
              {
                left: p.x,
                top: p.y,
                opacity: p.opacity,
                transform: [
                  {
                    translateY:
                      p.translateY,
                  },
                ],
              },
            ]}
          >
            <Text
              style={[
                styles.popupText,
                {
                  color:
                    p.value > 0
                      ? '#22C55E'
                      : '#EF4444',
                },
              ]}
            >
              {p.value > 0
                ? `+${p.value}`
                : `${p.value}`}
            </Text>
          </Animated.View>
        ))}

        {/* HIT FLASH */}

        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor:
                '#EF4444',
              opacity: hitFlash,
            },
          ]}
        />

        {/* INSTRUCTION */}

        <View
          style={styles.instruction}
          pointerEvents="none"
        >
          <Text
            style={[
              styles.instructionText,
              {
                color:
                  colors.textSecondary,
                textAlign: 'center',
              },
            ]}
          >
            {language === 'fa'
              ? 'ضربه به سبز'
              : 'Tap GREEN'}
          </Text>

          <Text
            style={[
              styles.instructionDanger,
              {
                color:
                  colors.error,
                textAlign: 'center',
              },
            ]}
          >
            {language === 'fa'
              ? 'دوری از قرمز'
              : 'Avoid RED'}
          </Text>
        </View>
      </View>

      {/* ==========================================================
          RESULT
      ========================================================== */}

      {(gameOver || completed) && (
        <View
          style={[
            styles.resultOverlay,
            {
              backgroundColor:
                colors.background +
                'F5',
            },
          ]}
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
              color={
                completed
                  ? colors.success
                  : colors.error
              }
            />

            <Text
              style={[
                styles.resultTitle,
                {
                  color:
                    colors.text,
                  textAlign:
                    'center',
                },
              ]}
            >
              {completed
                ? language === 'fa'
                  ? 'مرحله کامل شد!'
                  : 'Level Complete!'
                : language === 'fa'
                ? 'بازی تمام شد'
                : 'Game Over'}
            </Text>

            <Text
              style={[
                styles.finalScore,
                {
                  color:
                    colors.primary,
                  textAlign:
                    'center',
                },
              ]}
            >
              {score}{' '}
              {language === 'fa'
                ? 'امتیاز'
                : 'Points'}
            </Text>

            {/* PLAY AGAIN */}

            <TouchableOpacity
              onPress={() =>
                selectedLevel !==
                  null &&
                startGame(
                  selectedLevel
                )
              }
              style={[
                styles.resultButton,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >
              <Text
                style={
                  styles.resultButtonText
                }
              >
                {language === 'fa'
                  ? 'دوباره بازی'
                  : 'Play Again'}
              </Text>
            </TouchableOpacity>

            {/* CHOOSE LEVEL */}

            <TouchableOpacity
              onPress={() => {
                clearAllTimers();

                setPlaying(false);

                setSelectedLevel(
                  null
                );

                setGameOver(false);

                setCompleted(false);

                setObjects([]);

                setPopups([]);

                isMounted.current = true;
              }}
              style={[
                styles.secondaryButton,
                {
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  {
                    color:
                      colors.text,
                    textAlign:
                      'center',
                  },
                ]}
              >
                {language === 'fa'
                  ? 'انتخاب سطح'
                  : 'Choose Level'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

/* ================================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({
  /* ================================================================
     PAGE 1
  ================================================================= */

  container: {
    flex: 1,
    padding: Spacing.lg,
  },

  /* ================================================================
     UNIFIED BACK BUTTON

     همیشه:
     LEFT

     [ ← Back ]

     مستقل از RTL
  ================================================================= */

  unifiedBackButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.md,
  },

  compactBackButton: {
    minHeight: 42,
    width: 42,
    paddingHorizontal: 0,
    paddingVertical: 0,
    gap: 0,
  },

  backText: {
    fontSize: 15,
    fontWeight: '600',
  },

  /* ================================================================
     LEVEL HEADER
  ================================================================= */

  levelHeader: {
    alignItems: 'center',
    marginTop: 45,
    marginBottom: Spacing.xl,
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
    fontSize: 30,
    fontWeight: '800',
  },

  subtitle: {
    fontSize: 15,
    marginTop: 8,
    maxWidth: 300,
  },

  /* ================================================================
     LEVELS
  ================================================================= */

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

  /* ================================================================
     GAME
  ================================================================= */

  gameContainer: {
    flex: 1,
  },

  gameHeader: {
    height: 90,
    paddingHorizontal: Spacing.lg,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },

  gameStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    flex: 1,
  },

  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  statText: {
    fontSize: 17,
    fontWeight: '800',
  },

  levelLabel: {
    fontSize: 16,
    fontWeight: '800',
    minWidth: 60,
    textAlign: 'right',
  },

  /* ================================================================
     PLAY AREA
  ================================================================= */

  playArea: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },

  movingObject: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 7,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  pressableObject: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },

  eyes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '48%',
    marginBottom: 7,
  },

  eye: {
    width: 7,
    height: 11,
    borderRadius: 5,
    backgroundColor: '#111827',
  },

  happyMouth: {
    width: 24,
    height: 11,
    borderBottomWidth: 4,
    borderBottomColor: '#111827',
    borderRadius: 12,
  },

  angryMouth: {
    width: 24,
    height: 10,
    borderTopWidth: 4,
    borderTopColor: '#111827',
    borderRadius: 12,
  },

  /* ================================================================
     POPUP
  ================================================================= */

  popup: {
    position: 'absolute',
  },

  popupText: {
    fontSize: 20,
    fontWeight: '900',
    textShadowColor:
      'rgba(0,0,0,0.25)',
    textShadowOffset: {
      width: 0,
      height: 1,
    },
    textShadowRadius: 3,
  },

  /* ================================================================
     INSTRUCTION
  ================================================================= */

  instruction: {
    position: 'absolute',
    top: 25,
    width: '100%',
    alignItems: 'center',
  },

  instructionText: {
    fontSize: 18,
    fontWeight: '800',
  },

  instructionDanger: {
    fontSize: 12,
    marginTop: 3,
  },

  /* ================================================================
     RESULT
  ================================================================= */

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

