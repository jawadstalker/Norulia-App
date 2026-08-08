import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trophy, Zap } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

// Play area boundaries used to lay shapes out in non-overlapping lanes,
// so every visible shape stays fully tappable.
const PLAY_TOP_MARGIN = 110;
const PLAY_BOTTOM_MARGIN = 40;
const PLAY_SIDE_MARGIN = 8;
const LANE_GAP = 20;

type Level = {
  name: string;
  nameFa: string;
  speed: number;
  spawnInterval: number;
  maxObjects: number;
  objectSize: number;
  duration: number;
  directions: string[];
};

const LEVELS: Level[] = [
  {
    name: 'Easy',
    nameFa: 'آسان',
    speed: 2200,
    spawnInterval: 1300,
    maxObjects: 3,
    objectSize: 68,
    duration: 30000,
    directions: ['right'],
  },
  {
    name: 'Medium',
    nameFa: 'متوسط',
    speed: 1700,
    spawnInterval: 950,
    maxObjects: 4,
    objectSize: 62,
    duration: 35000,
    directions: ['right'],
  },
  {
    name: 'Hard',
    nameFa: 'سخت',
    speed: 1200,
    spawnInterval: 700,
    maxObjects: 5,
    objectSize: 56,
    duration: 40000,
    directions: ['right', 'left'],
  },
  {
    name: 'Extreme',
    nameFa: 'حرفه‌ای',
    speed: 850,
    spawnInterval: 500,
    maxObjects: 7,
    objectSize: 50,
    duration: 45000,
    directions: ['right', 'left', 'top', 'bottom'],
  },
];

type GameObject = {
  id: number;
  color: 'green' | 'red';
  direction: string;
  position: Animated.ValueXY;
  scale: Animated.Value;
  opacity: Animated.Value;
  rotate: Animated.Value;
  laneOrientation: 'horizontal' | 'vertical';
  laneIndex: number;
};

type ScorePopup = {
  id: number;
  x: number;
  y: number;
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

export default function LastSurvivalScreen() {
  const { colors } = useTheme();
  const { t, language, isRTL } = useLanguage();
  const router = useRouter();

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [objects, setObjects] = useState<GameObject[]>([]);
  const [popups, setPopups] = useState<ScorePopup[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [completed, setCompleted] = useState(false);

  const objectId = useRef(0);
  const popupId = useRef(0);
  const particleId = useRef(0);
  const removingIds = useRef<Set<number>>(new Set());
  const spawnTimer = useRef<NodeJS.Timeout | null>(null);
  const hitFlash = useRef(new Animated.Value(0)).current;

  // Rows used by left/right movers, columns used by top/bottom movers.
  // A lane is reserved the moment a shape spawns into it and freed the
  // moment that shape leaves the screen or is tapped away, so two shapes
  // never sit on top of each other and every shape stays tappable.
  const occupiedRows = useRef<Set<number>>(new Set());
  const occupiedColumns = useRef<Set<number>>(new Set());

  const releaseLane = (object: GameObject) => {
    if (object.laneOrientation === 'horizontal') {
      occupiedRows.current.delete(object.laneIndex);
    } else {
      occupiedColumns.current.delete(object.laneIndex);
    }
  };

  const level = selectedLevel !== null ? LEVELS[selectedLevel] : LEVELS[0];
  const textAlignStyle = isRTL ? 'right' : 'left';

  const getLevelDescription = (index: number) => {
    if (language === 'fa') {
      const descriptions = [
        'اشیاء آهسته از سمت راست',
        'اشیاء سریع‌تر و تعداد بیشتر',
        'اشیاء از هر دو سمت',
        'اشیاء سریع از همه جهات',
      ];
      return descriptions[index] || '';
    }
    const descriptions = [
      'Slow objects from the right',
      'Faster objects and more targets',
      'Objects from both sides',
      'Fast objects from every direction',
    ];
    return descriptions[index] || '';
  };

  const startGame = (levelIndex: number) => {
    removingIds.current.clear();
    occupiedRows.current.clear();
    occupiedColumns.current.clear();
    setSelectedLevel(levelIndex);
    setPlaying(true);
    setGameOver(false);
    setCompleted(false);
    setScore(0);
    setLives(3);
    setObjects([]);
    setPopups([]);
    setParticles([]);
  };

  const endGame = (success: boolean) => {
    if (spawnTimer.current) {
      clearInterval(spawnTimer.current);
      spawnTimer.current = null;
    }

    setPlaying(false);
    setObjects([]);

    if (success) {
      setCompleted(true);
    } else {
      setGameOver(true);
    }
  };

  useEffect(() => {
    if (!playing || selectedLevel === null) return;

    const currentLevel = LEVELS[selectedLevel];

    const timer = setTimeout(() => {
      endGame(true);
    }, currentLevel.duration);

    const size = currentLevel.objectSize;
    const rowCount = Math.max(
      3,
      Math.floor((height - PLAY_TOP_MARGIN - PLAY_BOTTOM_MARGIN) / (size + LANE_GAP))
    );
    const columnCount = Math.max(
      3,
      Math.floor((width - PLAY_SIDE_MARGIN * 2) / (size + LANE_GAP))
    );

    // Picks a lane index that's currently free, or null if every lane
    // in that orientation is taken (in which case we skip this spawn
    // rather than stack a shape on top of another one).
    const pickFreeLane = (occupied: Set<number>, laneCount: number) => {
      const free: number[] = [];
      for (let i = 0; i < laneCount; i++) {
        if (!occupied.has(i)) free.push(i);
      }
      if (free.length === 0) return null;
      return free[Math.floor(Math.random() * free.length)];
    };

    spawnTimer.current = setInterval(() => {
      setObjects((prev) => {
        if (prev.length >= currentLevel.maxObjects) {
          return prev;
        }

        const direction =
          currentLevel.directions[
            Math.floor(Math.random() * currentLevel.directions.length)
          ];

        const isHorizontalMover = direction === 'left' || direction === 'right';

        const laneIndex = isHorizontalMover
          ? pickFreeLane(occupiedRows.current, rowCount)
          : pickFreeLane(occupiedColumns.current, columnCount);

        // No free lane right now — skip this tick, try again next spawn.
        if (laneIndex === null) {
          return prev;
        }

        if (isHorizontalMover) {
          occupiedRows.current.add(laneIndex);
        } else {
          occupiedColumns.current.add(laneIndex);
        }

        const id = objectId.current++;
        const isGreen = Math.random() > 0.35;

        const rowY = PLAY_TOP_MARGIN + laneIndex * (size + LANE_GAP);
        const columnX = PLAY_SIDE_MARGIN + laneIndex * (size + LANE_GAP);

        const position = new Animated.ValueXY({
          x:
            direction === 'left'
              ? width
              : direction === 'right'
              ? -size
              : columnX,
          y:
            direction === 'top'
              ? height
              : direction === 'bottom'
              ? -size
              : rowY,
        });

        const newObject: GameObject = {
          id,
          color: isGreen ? 'green' : 'red',
          direction,
          position,
          scale: new Animated.Value(0),
          opacity: new Animated.Value(1),
          rotate: new Animated.Value(0),
          laneOrientation: isHorizontalMover ? 'horizontal' : 'vertical',
          laneIndex,
        };

        requestAnimationFrame(() => {
          animateObject(newObject, currentLevel);
        });

        return [...prev, newObject];
      });
    }, currentLevel.spawnInterval);

    return () => {
      clearTimeout(timer);
      if (spawnTimer.current) {
        clearInterval(spawnTimer.current);
      }
    };
  }, [playing, selectedLevel]);

  const animateObject = (object: GameObject, currentLevel: Level) => {
    Animated.spring(object.scale, {
      toValue: 1,
      friction: 5,
      tension: 60,
      useNativeDriver: true,
    }).start();

    const targetX =
      object.direction === 'left'
        ? -currentLevel.objectSize - 50
        : width + 50;

    const currentY = (object.position.y as any)._value || 0;

    const targetY =
      object.direction === 'top'
        ? -currentLevel.objectSize - 50
        : object.direction === 'bottom'
        ? height + 50
        : currentY;

    if (object.direction === 'right' || object.direction === 'left') {
      Animated.timing(object.position.x, {
        toValue: targetX,
        duration: currentLevel.speed,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          releaseLane(object);
          setObjects((prev) => prev.filter((item) => item.id !== object.id));
        }
      });
    } else {
      Animated.timing(object.position.y, {
        toValue: targetY,
        duration: currentLevel.speed,
        useNativeDriver: false,
      }).start(({ finished }) => {
        if (finished) {
          releaseLane(object);
          setObjects((prev) => prev.filter((item) => item.id !== object.id));
        }
      });
    }
  };

  // Spawns a ring of small particles at the object's last position and
  // animates them flying outward while fading — the "explosion" burst.
  const spawnExplosion = (
    centerX: number,
    centerY: number,
    color: string
  ) => {
    const newParticles: Particle[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle =
        (Math.PI * 2 * i) / PARTICLE_COUNT + (Math.random() * 0.4 - 0.2);
      const distance = 34 + Math.random() * 46;
      const size = 6 + Math.random() * 8;
      const id = particleId.current++;
      const anim = new Animated.Value(0);

      newParticles.push({
        id,
        x: centerX,
        y: centerY,
        angle,
        distance,
        color,
        size,
        anim,
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);

    newParticles.forEach((particle) => {
      Animated.timing(particle.anim, {
        toValue: 1,
        duration: 480 + Math.random() * 120,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          setParticles((prev) => prev.filter((p) => p.id !== particle.id));
        }
      });
    });
  };

  const handleObjectPress = (object: GameObject) => {
    if (!playing) return;
    if (removingIds.current.has(object.id)) return;
    removingIds.current.add(object.id);

    const x = (object.position.x as any)._value || 0;
    const y = (object.position.y as any)._value || 0;
    const isGreen = object.color === 'green';
    const delta = isGreen ? 10 : -10;
    const explosionColor = isGreen ? '#22C55E' : '#EF4444';
    const centerX = x + level.objectSize / 2;
    const centerY = y + level.objectSize / 2;

    const newPopupId = popupId.current++;
    setPopups((prev) => [...prev, { id: newPopupId, x, y, value: delta }]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== newPopupId));
    }, 700);

    // Burst of particles flying out from the object's center.
    spawnExplosion(centerX, centerY, explosionColor);

    // The object itself: a quick punch outward, then it blows apart —
    // scaling past its own size, spinning, and fading — instead of
    // simply shrinking away.
    Animated.sequence([
      Animated.timing(object.scale, {
        toValue: 1.3,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(object.scale, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(object.opacity, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(object.rotate, {
          toValue: isGreen ? 1 : -1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      releaseLane(object);
      setObjects((prev) => prev.filter((item) => item.id !== object.id));
      removingIds.current.delete(object.id);
    });

    if (isGreen) {
      setScore((prev) => prev + 10);
    } else {
      setScore((prev) => prev - 10);

      Animated.sequence([
        Animated.timing(hitFlash, { toValue: 1, duration: 70, useNativeDriver: true }),
        Animated.timing(hitFlash, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]).start();

      setLives((prev) => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setTimeout(() => {
            endGame(false);
          }, 120);
        }
        return newLives;
      });
    }
  };

  // Touch fingerprint tolerance around each shape's actual box — plays
  // the same role hitSlop used to, just applied manually.
  const TOUCH_PADDING = 15;

  // A single touch handler for the whole play area. Instead of giving
  // every moving shape its own Pressable (which breaks down the moment
  // two shapes' hit regions overlap — only the topmost one ever
  // responds), we catch every touch here and manually work out which
  // shape, if any, is under the finger using each shape's live
  // position. This makes every visible shape reliably tappable,
  // regardless of how many others are nearby.
  const handlePlayAreaTouch = (evt: any) => {
    if (!playing) return;

    const { locationX, locationY } = evt.nativeEvent;
    const size = level.objectSize;

    // Check from the most recently spawned shape backwards, so that if
    // two boxes' tolerance zones genuinely overlap, the one drawn on
    // top (visually in front) wins — matching what the eye expects.
    for (let i = objects.length - 1; i >= 0; i--) {
      const object = objects[i];
      if (removingIds.current.has(object.id)) continue;

      const x = (object.position.x as any)._value || 0;
      const y = (object.position.y as any)._value || 0;

      const withinX =
        locationX >= x - TOUCH_PADDING &&
        locationX <= x + size + TOUCH_PADDING;
      const withinY =
        locationY >= y - TOUCH_PADDING &&
        locationY <= y + size + TOUCH_PADDING;

      if (withinX && withinY) {
        handleObjectPress(object);
        return;
      }
    }
  };

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
          <Text
            style={[
              styles.backText,
              { color: colors.text, textAlign: textAlignStyle },
            ]}
          >
            {t.back}
          </Text>
        </TouchableOpacity>

        <View style={styles.levelHeader}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
            <Zap size={32} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.text, textAlign: 'center' }]}>
            Last Survival
          </Text>

          <Text
            style={[
              styles.subtitle,
              { color: colors.textSecondary, textAlign: 'center' },
            ]}
          >
            {language === 'fa'
              ? 'روی اشکال سبز کلیک کنید. از قرمزها دوری کنید.'
              : 'Click the green shapes. Avoid the red ones.'}
          </Text>
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
                <Text
                  style={[
                    styles.levelTitle,
                    { color: colors.text, textAlign: textAlignStyle },
                  ]}
                >
                  {language === 'fa' ? item.nameFa : item.name}
                </Text>

                <Text
                  style={[
                    styles.levelDescription,
                    { color: colors.textSecondary, textAlign: textAlignStyle },
                  ]}
                >
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
    <View style={[styles.gameContainer, { backgroundColor: colors.background }]}>
      <View style={[styles.gameHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={styles.stat}>
          <Text style={[styles.lifeIcon, { color: colors.error }]}>❤️</Text>
          <Text style={[styles.statText, { color: colors.text }]}>{lives}</Text>
        </View>

        <View style={styles.stat}>
          <Trophy size={20} color={colors.warning} />
          <Text style={[styles.statText, { color: colors.text }]}>{score}</Text>
        </View>

        <Text style={[styles.levelLabel, { color: colors.primary }]}>
          {language === 'fa' ? level.nameFa : level.name}
        </Text>
      </View>

      <View
        style={styles.playArea}
        onStartShouldSetResponder={() => playing}
        onResponderGrant={handlePlayAreaTouch}
      >
        {objects.map((object) => {
          const rotateInterpolate = object.rotate.interpolate({
            inputRange: [-1, 0, 1],
            outputRange: ['-140deg', '0deg', '140deg'],
          });

          return (
            <Animated.View
              key={object.id}
              pointerEvents="none"
              style={[
                styles.movingObject,
                {
                  width: level.objectSize,
                  height: level.objectSize,
                  backgroundColor: object.color === 'green' ? '#22C55E' : '#EF4444',
                  opacity: object.opacity,
                  left: object.position.x,
                  top: object.position.y,
                  transform: [
                    { scale: object.scale },
                    { rotate: rotateInterpolate },
                  ],
                },
              ]}
            >
              <View style={styles.pressableObject}>
                <View style={styles.eyes}>
                  <View style={styles.eye} />
                  <View style={styles.eye} />
                </View>

                {object.color === 'green' ? (
                  <View style={styles.happyMouth} />
                ) : (
                  <View style={styles.angryMouth} />
                )}
              </View>
            </Animated.View>
          );
        })}

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

        {popups.map((p) => (
          <MotiView
            key={p.id}
            pointerEvents="none"
            from={{ opacity: 0, translateY: 0, scale: 0.6 }}
            animate={{ opacity: [1, 1, 0], translateY: -55, scale: 1 }}
            transition={{ type: 'timing', duration: 700 }}
            style={[styles.popup, { left: p.x, top: p.y }]}
          >
            <Text
              style={[
                styles.popupText,
                { color: p.value > 0 ? '#22C55E' : '#EF4444' },
              ]}
            >
              {p.value > 0 ? `+${p.value}` : `${p.value}`}
            </Text>
          </MotiView>
        ))}

        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: '#EF4444', opacity: hitFlash },
          ]}
        />

        <View style={styles.instruction}>
          <Text
            style={[
              styles.instructionText,
              { color: colors.textSecondary, textAlign: 'center' },
            ]}
          >
            {language === 'fa' ? 'ضربه به سبز' : 'Tap GREEN'}
          </Text>
          <Text
            style={[
              styles.instructionDanger,
              { color: colors.error, textAlign: 'center' },
            ]}
          >
            {language === 'fa' ? 'دوری از قرمز' : 'Avoid RED'}
          </Text>
        </View>
      </View>

      {(gameOver || completed) && (
        <View
          style={[
            styles.resultOverlay,
            { backgroundColor: colors.background + 'F5' },
          ]}
        >
          <View style={[styles.resultCard, { backgroundColor: colors.surface }]}>
            <Trophy size={42} color={completed ? colors.success : colors.error} />

            <Text
              style={[
                styles.resultTitle,
                { color: colors.text, textAlign: 'center' },
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
                { color: colors.primary, textAlign: 'center' },
              ]}
            >
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
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: colors.text, textAlign: 'center' },
                ]}
              >
                {language === 'fa' ? 'انتخاب سطح' : 'Choose Level'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
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
    fontSize: 17,
    fontWeight: '800',
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: '800',
  },
  playArea: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  movingObject: {
    position: 'absolute',
    left: 0,
    top: 0,
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
  particle: {
    position: 'absolute',
  },
  popup: {
    position: 'absolute',
  },
  popupText: {
    fontSize: 20,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  instruction: {
    position: 'absolute',
    top: 25,
    width: '100%',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '800',
  },
  instructionDanger: {
    fontSize: 12,
    marginTop: 3,
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