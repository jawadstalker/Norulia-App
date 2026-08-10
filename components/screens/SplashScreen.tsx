
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

/* ---------------------------------- */
/* Timing                              */
/* ---------------------------------- */

const T_OPEN = 500;
const T_REFORM = 1350;
const T_LOGO = 1900;
const T_EXIT = 3350;
const T_DONE = 3650;

/* ---------------------------------- */
/* Animation settings                  */
/* ---------------------------------- */

const PARTICLE_COUNT = 12;
const RING_COUNT = 3;
const AMBIENT_COUNT = 8;

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [stage, setStage] = useState(0);

  /* -------------------------------- */
  /* Timeline                          */
  /* -------------------------------- */

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

  /* -------------------------------- */
  /* Main particles                   */
  /* -------------------------------- */

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2;

        // Smaller orbit for mobile
        const distance = 82 + ((i * 29) % 42);

        return {
          id: i,
          dx: Math.cos(angle) * distance,
          dy: Math.sin(angle) * distance,
          delay: (i % 4) * 45,
          duration: 700 + (i % 3) * 100,
          isSpark: i % 4 === 0,
        };
      }),
    []
  );

  /* -------------------------------- */
  /* Ambient particles                 */
  /* -------------------------------- */

  const ambientParticles = useMemo(
    () =>
      Array.from({ length: AMBIENT_COUNT }).map((_, i) => {
        const angle = (i / AMBIENT_COUNT) * Math.PI * 2;

        // Much smaller than original
        const distance = 100 + ((i * 37) % 55);

        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          delay: i * 120,
          duration: 2600 + (i % 4) * 450,
        };
      }),
    []
  );

  /* -------------------------------- */
  /* Rings                             */
  /* -------------------------------- */

  const rings = useMemo(
    () =>
      Array.from({ length: RING_COUNT }).map((_, i) => ({
        id: i,
        tilt: -24 + i * 24,
        speed: 6500 + i * 1600,

        // Smaller rings for phone screens
        size: 135 + i * 25,
      })),
    []
  );

  const brainOpen = stage === 1;
  const logoStage = stage >= 3;
  const exitStage = stage >= 4;

  // Smaller movement on mobile
  const brainLift = logoStage ? -38 : 0;

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#1B1530', '#120F22', '#0B0916']
          : ['#2A2050', '#1B1638', '#100E1E']
      }
      style={styles.container}
    >
      {/* =========================================
          MAIN GLOW
          ========================================= */}

      <MotiView
        from={{
          opacity: 0,
          scale: 0.7,
        }}
        animate={{
          opacity: exitStage
            ? 0
            : stage >= 2
              ? logoStage
                ? 0.24
                : 0.42
              : 0.72,

          scale: stage === 1
            ? 1.22
            : logoStage
              ? 0.72
              : 1,

          translateY: brainLift,
        }}
        transition={{
          type: 'timing',
          duration: stage === 2 ? 650 : 450,
        }}
        style={[
          styles.glowBlob,
          {
            backgroundColor: colors.primary,
          },
        ]}
      />

      {/* =========================================
          SECONDARY GLOW
          ========================================= */}

      <MotiView
        from={{
          opacity: 0,
          scale: 0.6,
        }}
        animate={{
          opacity: exitStage
            ? 0
            : logoStage
              ? [0.12, 0.28, 0.12]
              : [0.18, 0.32, 0.18],

          scale: logoStage
            ? [0.9, 1.08, 0.9]
            : [0.85, 1, 0.85],
        }}
        transition={{
          type: 'timing',
          duration: 2600,
          loop: !exitStage,
        }}
        style={[
          styles.secondaryGlow,
          {
            backgroundColor: colors.accent,
          },
        ]}
      />

      {/* =========================================
          OPENING FLASH
          ========================================= */}

      <MotiView
        from={{
          opacity: 0,
          scale: 0.3,
        }}
        animate={{
          opacity: brainOpen ? [0.8, 0] : 0,
          scale: brainOpen ? 1.45 : 0.3,
        }}
        transition={{
          type: 'timing',
          duration: 650,
        }}
        style={styles.flash}
      />

      <View style={styles.content}>

        {/* =======================================
            AMBIENT FLOATING DOTS
            ======================================= */}

        {ambientParticles.map((p) => (
          <MotiView
            key={`ambient-${p.id}`}
            from={{
              opacity: 0,
              translateX: p.x,
              translateY: p.y,
              scale: 0.45,
            }}
            animate={{
              opacity: exitStage
                ? 0
                : [0, 0.55, 0.15, 0.65, 0],

              translateX: exitStage
                ? p.x
                : [
                    p.x,
                    p.x + 5,
                    p.x - 4,
                    p.x + 2,
                    p.x,
                  ],

              translateY: exitStage
                ? p.y
                : [
                    p.y,
                    p.y - 12,
                    p.y - 5,
                    p.y - 15,
                    p.y,
                  ],

              scale: exitStage
                ? 0.4
                : [0.45, 0.8, 0.55, 0.9, 0.45],
            }}
            transition={{
              type: 'timing',
              duration: p.duration,
              delay: p.delay,
              loop: !exitStage,
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

        {/* =======================================
            ROTATING RINGS
            ======================================= */}

        {rings.map((ring) => (
          <MotiView
            key={ring.id}
            from={{
              opacity: 0,
              rotateZ: '0deg',
              scale: 0.82,
            }}
            animate={{
              opacity: exitStage
                ? 0
                : stage === 1 || stage === 2
                  ? 0.38
                  : 0,

              rotateZ: '360deg',

              scale:
                stage === 1
                  ? [0.82, 1, 0.94, 1]
                  : 1,

              translateY: brainLift,
            }}
            transition={{
              opacity: {
                type: 'timing',
                duration: 500,
              },

              translateY: {
                type: 'timing',
                duration: 600,
              },

              scale: {
                type: 'timing',
                duration: 1800,
                loop: stage === 1 && !exitStage,
              },

              rotateZ: {
                type: 'timing',
                duration: ring.speed,
                loop: true,
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

        {/* =======================================
            SHOCKWAVES
            ======================================= */}

        {[0, 1, 2].map((i) => (
          <MotiView
            key={`wave-${i}`}
            from={{
              opacity: 0,
              scale: 0.25,
            }}
            animate={{
              opacity:
                stage === 1
                  ? [0.5, 0]
                  : 0,

              scale:
                stage >= 1
                  ? 2.15 + i * 0.42
                  : 0.25,
            }}
            transition={{
              type: 'timing',
              duration: 1100,
              delay: i * 170,
            }}
            style={[
              styles.shockwave,
              {
                borderColor: colors.primary,
              },
            ]}
          />
        ))}

        {/* =======================================
            EXPLOSION PARTICLES
            ======================================= */}

        {particles.map((p) => (
          <MotiView
            key={p.id}
            from={{
              opacity: 0,
              translateX: 0,
              translateY: 0,
              scale: 0.3,
            }}
            animate={{
              opacity:
                stage === 1
                  ? [0, 1, 0]
                  : 0,

              translateX:
                stage >= 1
                  ? [
                      0,
                      p.dx * 0.55,
                      p.dx,
                    ]
                  : 0,

              translateY:
                stage >= 1
                  ? [
                      0,
                      p.dy * 0.55 - 6,
                      p.dy,
                    ]
                  : 0,

              scale:
                stage === 1
                  ? [0.3, 1, 0.5]
                  : 0.3,
            }}
            transition={{
              type: 'timing',
              duration: p.duration,
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

        {/* =======================================
            BRAIN
            ======================================= */}

        <MotiView
          from={{
            scale: 0,
            opacity: 0,
          }}
          animate={{
            scale: exitStage
              ? 0.76
              : stage === 2
                ? [1.08, 1, 1.025, 1]
                : 1,

            opacity: exitStage
              ? 0
              : 1,

            translateY: brainLift,
          }}
          transition={{
            scale: {
              type: 'spring',
              stiffness: 150,
              damping: 15,
            },

            opacity: {
              type: 'timing',
              duration: 450,
            },

            translateY: {
              type: 'timing',
              duration: 600,
            },
          }}
          style={styles.brainRow}
        >

          {/* LEFT HALF */}

          <MotiView
            animate={{
              translateX: brainOpen
                ? -22
                : 0,

              translateY: brainOpen
                ? -3
                : [0, -2, 0, 2, 0],

              rotateY: brainOpen
                ? '-32deg'
                : '0deg',

              rotateZ: brainOpen
                ? '-2deg'
                : '0deg',
            }}
            transition={{
              translateX: {
                type: 'timing',
                duration: 550,
              },

              translateY: {
                type: 'timing',
                duration: 2200,
                loop: !brainOpen && !exitStage,
              },

              rotateY: {
                type: 'timing',
                duration: 550,
              },

              rotateZ: {
                type: 'timing',
                duration: 500,
              },
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
              strokeWidth={1.7}
            />
          </MotiView>

          {/* RIGHT HALF */}

          <MotiView
            animate={{
              translateX: brainOpen
                ? 22
                : 0,

              translateY: brainOpen
                ? 3
                : [0, 2, 0, -2, 0],

              rotateY: brainOpen
                ? '32deg'
                : '0deg',

              rotateZ: brainOpen
                ? '2deg'
                : '0deg',
            }}
            transition={{
              translateX: {
                type: 'timing',
                duration: 550,
              },

              translateY: {
                type: 'timing',
                duration: 2200,
                loop: !brainOpen && !exitStage,
              },

              rotateY: {
                type: 'timing',
                duration: 550,
              },

              rotateZ: {
                type: 'timing',
                duration: 500,
              },
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
              strokeWidth={1.7}
              style={styles.rightIconOffset}
            />
          </MotiView>

          {/* =====================================
              CENTER ENERGY
              ===================================== */}

          <MotiView
            from={{
              opacity: 0,
              scale: 0.2,
            }}
            animate={{
              opacity: exitStage
                ? 0
                : brainOpen
                  ? [0.5, 1, 0.75]
                  : logoStage
                    ? [0.35, 0.9, 0.35]
                    : 0,

              scale: brainOpen
                ? [0.8, 1.12, 1]
                : logoStage
                  ? [0.85, 1.05, 0.85]
                  : 0.2,
            }}
            transition={{
              opacity: {
                type: 'timing',
                duration: logoStage ? 1800 : 600,
                loop: logoStage && !exitStage,
              },

              scale: {
                type: 'timing',
                duration: 900,
                loop: logoStage && !exitStage,
              },
            }}
            style={[
              styles.coreLight,
              {
                backgroundColor: colors.accent,
              },
            ]}
          />

          {/* Small center pulse */}

          <MotiView
            from={{
              opacity: 0,
              scale: 0.5,
            }}
            animate={{
              opacity: logoStage
                ? [0, 0.7, 0]
                : 0,

              scale: logoStage
                ? [0.7, 1.5, 0.7]
                : 0.5,
            }}
            transition={{
              type: 'timing',
              duration: 1700,
              loop: logoStage && !exitStage,
            }}
            style={[
              styles.centerPulse,
              {
                borderColor: colors.accent,
              },
            ]}
          />

        </MotiView>

      </View>

      {/* =========================================
          WORDMARK
          ========================================= */}

      <MotiView
        from={{
          opacity: 0,
          translateY: 22,
          scale: 0.96,
        }}
        animate={{
          opacity: exitStage
            ? 0
            : logoStage
              ? 1
              : 0,

          translateY: exitStage
            ? 8
            : logoStage
              ? 0
              : 22,

          scale: logoStage
            ? [0.96, 1.015, 1]
            : 0.96,
        }}
        transition={{
          opacity: {
            type: 'timing',
            duration: 550,
          },

          translateY: {
            type: 'timing',
            duration: 550,
          },

          scale: {
            type: 'timing',
            duration: 900,
          },
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

        {/* =====================================
            PROGRESS BAR
            ===================================== */}

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
              duration: 1400,
              delay: 120,
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
              translateX: -35,
              opacity: 0,
            }}
            animate={{
              translateX: logoStage
                ? width * 0.42
                : -35,

              opacity: logoStage
                ? [0, 0.9, 0]
                : 0,
            }}
            transition={{
              type: 'timing',
              duration: 1200,
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
/* STYLES                                            */
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

    // Was 340
    width: 230,
    height: 230,

    borderRadius: 120,
    opacity: 0.7,
  },

  secondaryGlow: {
    position: 'absolute',

    width: 155,
    height: 155,

    borderRadius: 80,
    opacity: 0.25,
  },

  flash: {
    position: 'absolute',

    // Smaller opening flash
    width: 150,
    height: 150,

    borderRadius: 75,
    backgroundColor: '#FFFFFF',
  },

  /* ----------------------------------------------- */
  /* Main content                                      */
  /* ----------------------------------------------- */

  content: {
    alignItems: 'center',
    justifyContent: 'center',

    // Smaller animation area for phones
    width: 220,
    height: 220,
  },

  ambientWrap: {
    position: 'absolute',
  },

  ambientDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 2,
  },

  /* ----------------------------------------------- */
  /* Rings                                             */
  /* ----------------------------------------------- */

  ring: {
    position: 'absolute',
    borderWidth: 1.2,
  },

  /* ----------------------------------------------- */
  /* Shockwave                                         */
  /* ----------------------------------------------- */

  shockwave: {
    position: 'absolute',

    width: 110,
    height: 110,

    borderRadius: 55,
    borderWidth: 1.5,
  },

  /* ----------------------------------------------- */
  /* Particles                                         */
  /* ----------------------------------------------- */

  particleWrap: {
    position: 'absolute',
  },

  particleDot: {
    width: 5,
    height: 5,
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
    // 108px icon -> half
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
  /* Center energy                                     */
  /* ----------------------------------------------- */

  coreLight: {
    position: 'absolute',

    width: 18,
    height: 66,

    borderRadius: 9,

    opacity: 0.8,
  },

  centerPulse: {
    position: 'absolute',

    width: 38,
    height: 38,

    borderRadius: 19,

    borderWidth: 1,
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
      'rgba(167,139,250,0.45)',

    textShadowOffset: {
      width: 0,
      height: 0,
    },

    textShadowRadius: 14,
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

    width: 26,
    height: '100%',

    borderRadius: BorderRadius.full,
  },
});
