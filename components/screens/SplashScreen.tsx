import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';
import { Brain, Sparkles } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onComplete: () => void;
}

/* ================================================= */
/* TIMELINE                                           */
/* ================================================= */

const T_OPEN = 450;
const T_REFORM = 1250;
const T_LOGO = 1750;

/*
 * مهم:
 * تمام دایره‌ها قبل از شروع حرکت مغز حذف می‌شوند.
 *
 * stage 1 -> باز شدن مغز
 * stage 2 -> برگشت مغز
 * stage 3 -> حذف کامل دایره‌ها + حرکت مغز به بالا
 */
const T_EXIT = 3150;
const T_DONE = 3450;

/* ================================================= */
/* ANIMATION COUNTS                                  */
/* ================================================= */

const PARTICLE_COUNT = 14;
const RING_COUNT = 3;
const AMBIENT_COUNT = 8;

/* ================================================= */
/* SPLASH SCREEN                                     */
/* ================================================= */

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [stage, setStage] = useState(0);

  /* ----------------------------------------------- */
  /* Timeline                                         */
  /* ----------------------------------------------- */

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), T_OPEN),
      setTimeout(() => setStage(2), T_REFORM),
      setTimeout(() => setStage(3), T_LOGO),
      setTimeout(() => setStage(4), T_EXIT),
      setTimeout(onComplete, T_DONE),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  /* ----------------------------------------------- */
  /* Particles                                        */
  /* ----------------------------------------------- */

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
        const distance = 85 + ((i * 37) % 45);

        return {
          id: i,
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          delay: (i % 5) * 25,
          isSpark: i % 4 === 0,
        };
      }),
    []
  );

  /* ----------------------------------------------- */
  /* Ambient particles                                */
  /* ----------------------------------------------- */

  const ambientParticles = useMemo(
    () =>
      Array.from({ length: AMBIENT_COUNT }).map((_, i) => {
        const angle = (i / AMBIENT_COUNT) * Math.PI * 2;
        const distance = 105 + ((i * 53) % 55);

        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          delay: i * 80,
          duration: 2200 + (i % 4) * 300,
        };
      }),
    []
  );

  /* ----------------------------------------------- */
  /* Rings                                            */
  /* ----------------------------------------------- */

  const rings = useMemo(
    () =>
      Array.from({ length: RING_COUNT }).map((_, i) => ({
        id: i,
        tilt: -25 + i * 25,
        speed: 5000 + i * 1600,

        // کوچک‌تر برای موبایل
        size: 135 + i * 24,
      })),
    []
  );

  /* ================================================= */
  /* STATES                                             */
  /* ================================================= */

  const brainOpen = stage === 1;

  const logoStage = stage >= 3;

  /*
   * این متغیر بسیار مهم است:
   *
   * از stage 3 به بعد:
   * - تمام رینگ‌ها حذف
   * - تمام shockwaveها حذف
   * - تمام particleها حذف
   * - ambient particleها حذف
   * - glow پشت مغز حذف
   *
   * سپس مغز به بالا حرکت می‌کند.
   */
  const circlesGone = stage >= 3;

  const exitStage = stage >= 4;

  /*
   * مغز فقط بعد از حذف کامل دایره‌ها
   * به سمت بالا می‌رود.
   */
  const brainLift = exitStage ? -42 : 0;

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#1B1530', '#120F22', '#0B0916']
          : ['#2A2050', '#1B1638', '#100E1E']
      }
      style={styles.container}
    >

      {/* =================================================
          BACKGROUND GLOW
          ================================================= */}

      <MotiView
        from={{
          opacity: 0,
          scale: 0.6,
        }}
        animate={{
          /*
           * به محض شروع stage 3،
           * دایره/Glow پشت مغز کاملاً حذف می‌شود.
           */
          opacity: circlesGone
            ? 0
            : stage >= 2
              ? 0.5
              : 0.85,

          scale: stage === 1
            ? 1.35
            : 1,
        }}
        transition={{
          type: 'timing',
          duration: 400,
        }}
        style={[
          styles.glowBlob,
          {
            backgroundColor: colors.primary,
          },
        ]}
      />

      {/* =================================================
          OPENING FLASH
          ================================================= */}

      <MotiView
        from={{
          opacity: 0,
          scale: 0.4,
        }}
        animate={{
          opacity: brainOpen
            ? [0.9, 0]
            : 0,

          scale: brainOpen
            ? 1.55
            : 0.4,
        }}
        transition={{
          type: 'timing',
          duration: 420,
        }}
        style={styles.flash}
      />

      {/* =================================================
          MAIN CONTENT
          ================================================= */}

      <View style={styles.content}>

        {/* =================================================
            AMBIENT DOTS

            به محض stage 3 کاملاً حذف می‌شوند.
            هیچ loopی وجود ندارد.
            ================================================= */}

        {ambientParticles.map((p) => (
          <MotiView
            key={`ambient-${p.id}`}
            from={{
              opacity: 0,
              translateX: p.x,
              translateY: p.y,
              scale: 0.5,
            }}
            animate={{
              opacity: circlesGone
                ? 0
                : [0, 0.6, 0],

              translateX: p.x,
              translateY: p.y,

              scale: circlesGone
                ? 0.5
                : [0.5, 1, 0.5],
            }}
            transition={{
              type: 'timing',
              duration: p.duration,
              delay: p.delay,

              /*
               * قبل از stage 3 فقط یک بار.
               * دیگر motion دائمی نداریم.
               */
              loop: false,
            }}
            style={styles.ambientWrap}
          >
            <View
              style={[
                styles.ambientDot,
                {
                  backgroundColor: colors.accent,
                },
              ]}
            />
          </MotiView>
        ))}

        {/* =================================================
            RINGS

            مهم‌ترین تغییر:
            stage 3 = opacity 0

            بنابراین درست قبل از بالا رفتن مغز،
            تمام حلقه‌ها از بین رفته‌اند.
            ================================================= */}

        {rings.map((ring) => (
          <MotiView
            key={ring.id}
            from={{
              opacity: 0,
              rotateZ: '0deg',
              scale: 0.9,
            }}
            animate={{
              opacity: circlesGone
                ? 0
                : stage === 1 || stage === 2
                  ? 0.5
                  : 0,

              rotateZ: '360deg',

              scale: stage === 1
                ? 1
                : 0.9,
            }}
            transition={{
              opacity: {
                type: 'timing',
                duration: circlesGone ? 180 : 400,
              },

              scale: {
                type: 'timing',
                duration: 450,
              },

              rotateZ: {
                type: 'timing',
                duration: ring.speed,

                /*
                 * فقط تا زمانی که دایره‌ها
                 * روی صفحه هستند.
                 */
                loop: !circlesGone,
              },
            }}
            style={[
              styles.ring,
              {
                width: ring.size,
                height: ring.size,
                borderRadius: ring.size / 2,
                borderColor: colors.accent,

                transform: [
                  {
                    perspective: 800,
                  },
                  {
                    rotateX: `${ring.tilt}deg`,
                  },
                ],
              },
            ]}
          />
        ))}

        {/* =================================================
            SHOCKWAVES

            همه قبل از حرکت مغز حذف می‌شوند.
            ================================================= */}

        {[0, 1].map((i) => (
          <MotiView
            key={`wave-${i}`}
            from={{
              opacity: 0,
              scale: 0.3,
            }}
            animate={{
              opacity: circlesGone
                ? 0
                : stage === 1
                  ? [0.55, 0]
                  : 0,

              scale: stage >= 1
                ? 2.45 + i * 0.45
                : 0.3,
            }}
            transition={{
              type: 'timing',
              duration: 800,
              delay: i * 120,
            }}
            style={[
              styles.shockwave,
              {
                borderColor: colors.primary,
              },
            ]}
          />
        ))}

        {/* =================================================
            PARTICLES

            قبل از بالا رفتن مغز کاملاً حذف می‌شوند.
            ================================================= */}

        {particles.map((p) => (
          <MotiView
            key={p.id}
            from={{
              opacity: 0,
              translateX: 0,
              translateY: 0,
              scale: 0.4,
            }}
            animate={{
              opacity: circlesGone
                ? 0
                : stage === 1
                  ? [0, 1, 0]
                  : 0,

              translateX: stage >= 1
                ? p.dx
                : 0,

              translateY: stage >= 1
                ? p.dy
                : 0,

              scale: stage === 1
                ? 1
                : 0.4,
            }}
            transition={{
              type: 'timing',
              duration: 750,
              delay: p.delay,
            }}
            style={styles.particleWrap}
          >
            {p.isSpark ? (
              <Sparkles
                size={12}
                color={colors.accent}
              />
            ) : (
              <View
                style={[
                  styles.particleDot,
                  {
                    backgroundColor: colors.accent,
                  },
                ]}
              />
            )}
          </MotiView>
        ))}

        {/* =================================================
            BRAIN

            مغز در stage 3 هنوز وسط است.

            circlesGone = true
            ↓
            همه دایره‌ها حذف
            ↓
            سپس stage 4
            ↓
            مغز به بالا می‌رود
            ================================================= */}

        <MotiView
          from={{
            scale: 0,
            opacity: 0,
          }}
          animate={{
            scale: exitStage
              ? 0.82
              : stage === 2
                ? [1.12, 1]
                : 1,

            opacity: exitStage
              ? 0
              : 1,

            translateY: brainLift,
          }}
          transition={{
            scale: {
              type: 'spring',
              stiffness: 160,
              damping: 14,
            },

            opacity: {
              type: 'timing',
              duration: 350,
            },

            /*
             * این حرکت بعد از حذف دایره‌ها انجام می‌شود.
             */
            translateY: {
              type: 'timing',
              duration: 500,
            },
          }}
          style={styles.brainRow}
        >

          {/* =================================================
              LEFT BRAIN HALF
              ================================================= */}

          <MotiView
            animate={{
              translateX: brainOpen
                ? -28
                : 0,

              rotateY: brainOpen
                ? '-38deg'
                : '0deg',
            }}
            transition={{
              type: 'timing',
              duration: 500,
            }}
            style={[
              styles.halfMask,
              {
                transform: [
                  {
                    perspective: 700,
                  },
                ],
              },
            ]}
          >
            <Brain
              size={108}
              color="#FFFFFF"
              strokeWidth={1.8}
            />
          </MotiView>

          {/* =================================================
              RIGHT BRAIN HALF
              ================================================= */}

          <MotiView
            animate={{
              translateX: brainOpen
                ? 28
                : 0,

              rotateY: brainOpen
                ? '38deg'
                : '0deg',
            }}
            transition={{
              type: 'timing',
              duration: 500,
            }}
            style={[
              styles.halfMask,
              styles.halfMaskRight,
              {
                transform: [
                  {
                    perspective: 700,
                  },
                ],
              },
            ]}
          >
            <Brain
              size={108}
              color="#FFFFFF"
              strokeWidth={1.8}
              style={styles.rightIconOffset}
            />
          </MotiView>

          {/* =================================================
              CENTER LIGHT

              این هم جزو عناصر دایره‌ای محسوب می‌شود،
              بنابراین قبل از حرکت مغز حذف می‌شود.
              ================================================= */}

          <MotiView
            from={{
              opacity: 0,
              scale: 0.2,
            }}
            animate={{
              opacity: circlesGone
                ? 0
                : brainOpen
                  ? 1
                  : 0,

              scale: brainOpen
                ? 1
                : 0.2,
            }}
            transition={{
              opacity: {
                type: 'timing',
                duration: circlesGone ? 150 : 350,
              },

              scale: {
                type: 'timing',
                duration: 350,
              },
            }}
            style={[
              styles.coreLight,
              {
                backgroundColor: colors.accent,
              },
            ]}
          />

        </MotiView>

      </View>

      {/* =================================================
          WORDMARK
          ================================================= */}

      <MotiView
        from={{
          opacity: 0,
          translateY: 24,
        }}
        animate={{
          opacity: exitStage
            ? 0
            : logoStage
              ? 1
              : 0,

          translateY: exitStage
            ? 12
            : logoStage
              ? 0
              : 24,
        }}
        transition={{
          type: 'timing',
          duration: 500,
        }}
        style={styles.wordmark}
      >
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          {t.appName}
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          {t.dashboardSubtitle}
        </Text>

        {/* =================================================
            PROGRESS BAR
            ================================================= */}

        <View
          style={[
            styles.progressTrack,
            {
              backgroundColor: colors.border,
            },
          ]}
        >
          <MotiView
            from={{
              width: 0,
            }}
            animate={{
              width: logoStage
                ? width * 0.42
                : 0,
            }}
            transition={{
              type: 'timing',
              duration: 1300,
              delay: 150,
            }}
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.accent,
              },
            ]}
          />

          <MotiView
            from={{
              translateX: -40,
              opacity: 0,
            }}
            animate={{
              translateX: logoStage
                ? width * 0.42
                : -40,

              opacity: logoStage
                ? [0, 0.9, 0]
                : 0,
            }}
            transition={{
              type: 'timing',
              duration: 1300,
              delay: 150,
            }}
            style={[
              styles.progressShine,
              {
                backgroundColor: colors.text,
              },
            ]}
          />
        </View>
      </MotiView>

    </LinearGradient>
  );
}

/* ================================================= */
/* STYLES                                             */
/* ================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  /* ----------------------------------------------- */
  /* Glow                                              */
  /* ----------------------------------------------- */

  glowBlob: {
    position: 'absolute',

    width: 230,
    height: 230,

    borderRadius: 115,

    opacity: 0.7,
  },

  flash: {
    position: 'absolute',

    width: 150,
    height: 150,

    borderRadius: 75,

    backgroundColor: '#FFFFFF',
  },

  /* ----------------------------------------------- */
  /* Content                                           */
  /* ----------------------------------------------- */

  content: {
    alignItems: 'center',
    justifyContent: 'center',

    width: 220,
    height: 220,
  },

  /* ----------------------------------------------- */
  /* Ambient dots                                      */
  /* ----------------------------------------------- */

  ambientWrap: {
    position: 'absolute',
  },

  ambientDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
  },

  /* ----------------------------------------------- */
  /* Rings                                             */
  /* ----------------------------------------------- */

  ring: {
    position: 'absolute',
    borderWidth: 1.5,
  },

  /* ----------------------------------------------- */
  /* Shockwave                                         */
  /* ----------------------------------------------- */

  shockwave: {
    position: 'absolute',

    width: 120,
    height: 120,

    borderRadius: 60,

    borderWidth: 1.5,
  },

  /* ----------------------------------------------- */
  /* Particles                                         */
  /* ----------------------------------------------- */

  particleWrap: {
    position: 'absolute',
  },

  particleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  /* ----------------------------------------------- */
  /* Brain                                             */
  /* ----------------------------------------------- */

  brainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  halfMask: {
    width: 54,
    height: 108,

    overflow: 'hidden',
  },

  halfMaskRight: {
    alignItems: 'flex-end',
  },

  rightIconOffset: {
    marginLeft: -54,
  },

  /* ----------------------------------------------- */
  /* Center light                                      */
  /* ----------------------------------------------- */

  coreLight: {
    position: 'absolute',

    width: 18,
    height: 68,

    borderRadius: 9,
  },

  /* ----------------------------------------------- */
  /* Wordmark                                         */
  /* ----------------------------------------------- */

  wordmark: {
    position: 'absolute',

    bottom: height * 0.14,

    alignItems: 'center',
  },

  title: {
    fontSize: 34,
    fontWeight: '800',

    marginBottom: Spacing.sm,

    textShadowColor:
      'rgba(167,139,250,0.5)',

    textShadowOffset: {
      width: 0,
      height: 0,
    },

    textShadowRadius: 16,
  },

  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },

  /* ----------------------------------------------- */
  /* Progress                                          */
  /* ----------------------------------------------- */

  progressTrack: {
    height: 3,

    width: width * 0.42,

    borderRadius: BorderRadius.full,

    marginTop: Spacing.xxl,

    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',

    borderRadius: BorderRadius.full,

    position: 'absolute',

    left: 0,
    top: 0,
  },

  progressShine: {
    position: 'absolute',

    top: 0,

    width: 28,
    height: '100%',

    borderRadius: BorderRadius.full,
  },
});

