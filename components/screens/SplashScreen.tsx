import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  bg: '#24142F',
  fg: '#F3EEF9',
  muted: '#B3A7BE',

  accent: '#C39BEF',
  accentHi: '#E6D8F8',
  accentLo: '#8758C8',

  deep: '#151020',
};

/* =========================================================
   CONSTANTS
========================================================= */

const WORD = 'Norulia';

const LABELS = [
  'Initializing',
  'Calibrating',
  'Ready',
] as const;

const SPLASH_DURATION = 3500;

/*
 * Inspired by TextEffectOne from:
 * https://github.com/mwaqar29/react-text-animate
 *
 * Native React Native implementation:
 * - character stagger
 * - top-to-bottom entrance
 * - small rotation
 * - spring-like easing
 * - quick highlight after entrance
 */

/* =========================================================
   TYPES
========================================================= */

export interface SplashScreenProps {
  onComplete?: () => void;
}

/* =========================================================
   SPARKLE PATH
========================================================= */

const SPARKLE_PATH = `
M12 0
C13 6.5 17.5 11 24 12
C17.5 13 13 17.5 12 24
C11 17.5 6.5 13 0 12
C6.5 11 11 6.5 12 0
Z
`;

/* =========================================================
   CLOUD
========================================================= */

function Cloud() {
  return (
    <Svg
      viewBox="0 0 160 80"
      width="100%"
      height="100%"
    >
      <G fill="rgba(255,255,255,0.9)">
        <Ellipse
          cx="46"
          cy="54"
          rx="40"
          ry="20"
        />

        <Ellipse
          cx="82"
          cy="38"
          rx="31"
          ry="24"
        />

        <Ellipse
          cx="119"
          cy="54"
          rx="29"
          ry="17"
        />

        <Rect
          x="18"
          y="53"
          width="125"
          height="20"
          rx="10"
        />
      </G>
    </Svg>
  );
}

/* =========================================================
   SPARKLE
========================================================= */

function Sparkle({
  style,
  opacity,
  scale,
  rotate,
}: {
  style: any;
  opacity:
    | Animated.Value
    | Animated.AnimatedInterpolation<number>;

  scale: Animated.AnimatedInterpolation<number>;

  rotate: Animated.AnimatedInterpolation<string>;
}) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.sparkle,
        style,
        {
          opacity,

          transform: [
            {
              scale,
            },
            {
              rotate,
            },
          ],
        },
      ]}
    >
      <Svg
        viewBox="0 0 24 24"
        width="100%"
        height="100%"
      >
        <Path
          d={SPARKLE_PATH}
          fill="#FFFFFF"
        />
      </Svg>
    </Animated.View>
  );
}

/* =========================================================
   MASCOT
========================================================= */

function Mascot({
  progress,
  bob,
  wave,
}: {
  progress: Animated.Value;
  bob: Animated.Value;
  wave: Animated.Value;
}) {
  const entranceY =
    progress.interpolate({
      inputRange: [
        0,
        0.35,
        0.65,
        0.82,
        1,
      ],
      outputRange: [
        38,
        -8,
        4,
        -2,
        0,
      ],
    });

  const entranceScale =
    progress.interpolate({
      inputRange: [
        0,
        0.35,
        0.65,
        0.82,
        1,
      ],
      outputRange: [
        0.3,
        1.12,
        0.97,
        1.02,
        1,
      ],
    });

  const entranceRotate =
    progress.interpolate({
      inputRange: [
        0,
        0.5,
        1,
      ],
      outputRange: [
        '14deg',
        '-4deg',
        '0deg',
      ],
    });

  const bobY =
    bob.interpolate({
      inputRange: [
        0,
        0.5,
        1,
      ],
      outputRange: [
        0,
        -5,
        0,
      ],
    });

  const bobScaleX =
    bob.interpolate({
      inputRange: [
        0,
        0.5,
        1,
      ],
      outputRange: [
        1,
        1.035,
        1,
      ],
    });

  const bobScaleY =
    bob.interpolate({
      inputRange: [
        0,
        0.5,
        1,
      ],
      outputRange: [
        1,
        0.965,
        1,
      ],
    });

  const armRotate =
    wave.interpolate({
      inputRange: [
        0,
        0.35,
        0.65,
        1,
      ],
      outputRange: [
        '-8deg',
        '22deg',
        '28deg',
        '-8deg',
      ],
    });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.mascot,
        {
          opacity: progress,

          transform: [
            {
              translateX: -25,
            },
            {
              translateY:
                Animated.add(
                  entranceY,
                  bobY,
                ),
            },
            {
              scale: entranceScale,
            },
            {
              scaleX: bobScaleX,
            },
            {
              scaleY: bobScaleY,
            },
            {
              rotate: entranceRotate,
            },
          ],
        },
      ]}
    >
      <Svg
        viewBox="0 0 120 120"
        width={50}
        height={50}
      >
        <Defs>
          <LinearGradient
            id="mascotGradient"
            x1="0"
            y1="1"
            x2="1"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <Stop
              offset="0"
              stopColor={COLORS.accentLo}
            />

            <Stop
              offset="0.6"
              stopColor={COLORS.accent}
            />

            <Stop
              offset="1"
              stopColor={COLORS.accentHi}
            />
          </LinearGradient>
        </Defs>

        <Path
          d="
            M60 9
            C89 9 109 30 109 60
            C109 89 91 110 60 110
            C29 110 11 89 11 60
            C11 30 31 9 60 9
            Z
          "
          fill="url(#mascotGradient)"
          stroke="#68428F"
          strokeWidth="4"
        />

        <Ellipse
          cx="44"
          cy="78"
          rx="9"
          ry="6"
          fill="rgba(255,220,244,0.65)"
        />

        <Ellipse
          cx="76"
          cy="78"
          rx="9"
          ry="6"
          fill="rgba(255,220,244,0.65)"
        />

        <Ellipse
          cx="45"
          cy="57"
          rx="7"
          ry="10"
          fill="#FFFFFF"
        />

        <Ellipse
          cx="75"
          cy="57"
          rx="7"
          ry="10"
          fill="#FFFFFF"
        />

        <Circle
          cx="47"
          cy="60"
          r="4"
          fill="#3B2455"
        />

        <Circle
          cx="77"
          cy="60"
          r="4"
          fill="#3B2455"
        />

        <Circle
          cx="48.5"
          cy="58"
          r="1.3"
          fill="#FFFFFF"
        />

        <Circle
          cx="78.5"
          cy="58"
          r="1.3"
          fill="#FFFFFF"
        />

        <Path
          d="M48 78 Q60 90 72 78"
          fill="none"
          stroke="#68428F"
          strokeWidth="4"
          strokeLinecap="round"
        />

        <Ellipse
          cx="106"
          cy="35"
          rx="7"
          ry="14"
          transform="rotate(32 106 35)"
          fill="url(#mascotGradient)"
          stroke="#68428F"
          strokeWidth="4"
        />
      </Svg>

      {/* Animated arm is outside SVG */}
      <Animated.View
        style={[
          styles.mascotArm,
          {
            transform: [
              {
                rotate: armRotate,
              },
            ],
          },
        ]}
      >
        <Svg
          viewBox="0 0 40 55"
          width={20}
          height={28}
        >
          <Path
            d="
              M20 45
              C11 40 8 29 12 18
              C14 12 19 10 24 12
              C29 14 31 20 28 26
              C25 31 25 37 31 42
            "
            fill="none"
            stroke={COLORS.accent}
            strokeWidth="5"
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
}

/* =========================================================
   ANIMATED NORULIA
========================================================= */

function AnimatedWord({
  wordAnimation,
  highlights,
}: {
  wordAnimation: Animated.Value;

  highlights: Animated.Value[];
}) {
  const letters = WORD.split('');

  return (
    <View
      style={styles.animatedWord}
      accessibilityLabel={WORD}
      accessibilityRole="text"
    >
      {letters.map(
        (letter, index) => {
          /*
           * This is the React Native equivalent
           * of the TextEffectOne stagger effect.
           */

          const start =
            index * 0.075;

          const end =
            start + 0.28;

          const opacity =
            wordAnimation.interpolate({
              inputRange: [
                0,
                start,
                end,
                1,
              ],
              outputRange: [
                0,
                0,
                1,
                1,
              ],
              extrapolate:
                'clamp',
            });

          /*
           * From top:
           * the character begins above
           * its final position.
           */

          const translateY =
            wordAnimation.interpolate({
              inputRange: [
                0,
                start,
                end,
                1,
              ],
              outputRange: [
                -34,
                -34,
                4,
                0,
              ],
              extrapolate:
                'clamp',
            });

          /*
           * Small rotation inspired by
           * TextEffectOne's rotation prop.
           */

          const rotate =
            wordAnimation.interpolate({
              inputRange: [
                0,
                start,
                end,
                1,
              ],
              outputRange: [
                index % 2 === 0
                  ? '-12deg'
                  : '12deg',

                index % 2 === 0
                  ? '-12deg'
                  : '12deg',

                index % 2 === 0
                  ? '2deg'
                  : '-2deg',

                '0deg',
              ],
              extrapolate:
                'clamp',
            });

          const scale =
            wordAnimation.interpolate({
              inputRange: [
                0,
                start,
                end,
                1,
              ],
              outputRange: [
                0.82,
                0.82,
                1.035,
                1,
              ],
              extrapolate:
                'clamp',
            });

          /*
           * Individual highlight.
           * It happens AFTER the character
           * has already appeared.
           */

          const highlight =
            highlights[index].interpolate({
              inputRange: [
                0,
                0.35,
                0.7,
                1,
              ],
              outputRange: [
                0,
                0.9,
                0.35,
                0,
              ],
              extrapolate:
                'clamp',
            });

          const highlightScale =
            highlights[index].interpolate({
              inputRange: [
                0,
                0.45,
                1,
              ],
              outputRange: [
                1,
                1.06,
                1,
              ],
            });

          return (
            <View
              key={`${letter}-${index}`}
              style={styles.letterContainer}
            >
              <Animated.Text
                style={[
                  styles.wordmarkChar,
                  {
                    opacity,

                    transform: [
                      {
                        translateY,
                      },
                      {
                        rotate,
                      },
                      {
                        scale:
                          Animated.multiply(
                            scale,
                            highlightScale,
                          ),
                      },
                    ],
                  },
                ]}
              >
                {letter}
              </Animated.Text>

              {/* Quick glow/highlight */}
              <Animated.Text
                pointerEvents="none"
                style={[
                  styles.wordmarkChar,
                  styles.wordmarkHighlight,
                  {
                    opacity: highlight,

                    transform: [
                      {
                        scale:
                          highlightScale,
                      },
                    ],
                  },
                ]}
              >
                {letter}
              </Animated.Text>
            </View>
          );
        },
      )}
    </View>
  );
}

/* =========================================================
   SPLASH SCREEN
========================================================= */

export function SplashScreen({
  onComplete,
}: SplashScreenProps) {
  const {
    width,
    height,
  } = useWindowDimensions();

  const insets =
    useSafeAreaInsets();

  const [
    statusIndex,
    setStatusIndex,
  ] = useState(0);

  /* =======================================================
     CORE ANIMATIONS
  ======================================================= */

  const stage =
    useRef(
      new Animated.Value(0),
    ).current;

  const eyebrow =
    useRef(
      new Animated.Value(0),
    ).current;

  const mark =
    useRef(
      new Animated.Value(0),
    ).current;

  const markPulse =
    useRef(
      new Animated.Value(0),
    ).current;

  const word =
    useRef(
      new Animated.Value(0),
    ).current;

  const wordHighlight =
    useRef(
      new Animated.Value(0),
    ).current;

  const mascot =
    useRef(
      new Animated.Value(0),
    ).current;

  const mascotBob =
    useRef(
      new Animated.Value(0),
    ).current;

  const mascotWave =
    useRef(
      new Animated.Value(0),
    ).current;

  const divider =
    useRef(
      new Animated.Value(0),
    ).current;

  const tagline =
    useRef(
      new Animated.Value(0),
    ).current;

  const taglineHighlight =
    useRef(
      new Animated.Value(0),
    ).current;

  const status =
    useRef(
      new Animated.Value(0),
    ).current;

  const loading =
    useRef(
      new Animated.Value(0),
    ).current;

  const sparkleMaster =
    useRef(
      new Animated.Value(0),
    ).current;

  const sparklePulse =
    useRef(
      new Animated.Value(0),
    ).current;

  /* =======================================================
     LETTER HIGHLIGHTS
  ======================================================= */

  const letterHighlights =
    useMemo(
      () =>
        WORD.split('').map(
          () =>
            new Animated.Value(0),
        ),
      [],
    );

  /* =======================================================
     RESET
  ======================================================= */

  const resetAnimations =
    useCallback(() => {
      [
        stage,
        eyebrow,
        mark,
        markPulse,
        word,
        wordHighlight,
        mascot,
        mascotBob,
        mascotWave,
        divider,
        tagline,
        taglineHighlight,
        status,
        loading,
        sparkleMaster,
        sparklePulse,
        ...letterHighlights,
      ].forEach(
        (value) => {
          value.stopAnimation();
          value.setValue(0);
        },
      );

      setStatusIndex(0);
    }, [
      stage,
      eyebrow,
      mark,
      markPulse,
      word,
      wordHighlight,
      mascot,
      mascotBob,
      mascotWave,
      divider,
      tagline,
      taglineHighlight,
      status,
      loading,
      sparkleMaster,
      sparklePulse,
      letterHighlights,
    ]);

  /* =======================================================
     MAIN TIMELINE
  ======================================================= */

  useEffect(() => {
    resetAnimations();

    const timers:
      ReturnType<
        typeof setTimeout
      >[] = [];

    const timer = (
      callback: () => void,
      delay: number,
    ) => {
      timers.push(
        setTimeout(
          callback,
          delay,
        ),
      );
    };

    /* =====================================================
       BACKGROUND
    ===================================================== */

    Animated.timing(stage, {
      toValue: 1,
      duration: 500,
      delay: 20,
      easing:
        Easing.out(
          Easing.cubic,
        ),
      useNativeDriver: true,
    }).start();

    /* =====================================================
       IPS
    ===================================================== */

    Animated.timing(eyebrow, {
      toValue: 1,
      duration: 420,
      delay: 130,
      easing:
        Easing.out(
          Easing.cubic,
        ),
      useNativeDriver: true,
    }).start();

    /* =====================================================
       N MARK
    ===================================================== */

    Animated.sequence([
      Animated.timing(mark, {
        toValue: 1,
        duration: 620,
        delay: 280,
        easing:
          Easing.out(
            Easing.back(1.25),
          ),
        useNativeDriver: true,
      }),

      Animated.timing(
        markPulse,
        {
          toValue: 1,
          duration: 250,
          easing:
            Easing.inOut(
              Easing.ease,
            ),
          useNativeDriver: true,
        },
      ),

      Animated.timing(
        markPulse,
        {
          toValue: 0,
          duration: 270,
          easing:
            Easing.inOut(
              Easing.ease,
            ),
          useNativeDriver: true,
        },
      ),
    ]).start();

    /* =====================================================
       NORULIA
       
       TextEffectOne inspired:
       character stagger
       from top
       rotation
       scale
    ===================================================== */

    Animated.timing(word, {
      toValue: 1,
      duration: 850,
      delay: 720,
      easing:
        Easing.out(
          Easing.cubic,
        ),
      useNativeDriver: true,
    }).start();

    /* =====================================================
       LETTER HIGHLIGHT
       
       Starts AFTER the word is already visible.
    ===================================================== */

    timer(() => {
      Animated.stagger(
        65,
        letterHighlights.map(
          (letter) =>
            Animated.sequence([
              Animated.timing(
                letter,
                {
                  toValue: 1,
                  duration: 100,
                  easing:
                    Easing.out(
                      Easing.quad,
                    ),
                  useNativeDriver: true,
                },
              ),

              Animated.timing(
                letter,
                {
                  toValue: 0,
                  duration: 220,
                  easing:
                    Easing.inOut(
                      Easing.quad,
                    ),
                  useNativeDriver: true,
                },
              ),
            ]),
        ),
      ).start();
    }, 1570);

    /* =====================================================
       QUICK WORD HIGHLIGHT
    ===================================================== */

    timer(() => {
      Animated.sequence([
        Animated.timing(
          wordHighlight,
          {
            toValue: 1,
            duration: 100,
            easing:
              Easing.out(
                Easing.quad,
              ),
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          wordHighlight,
          {
            toValue: 0,
            duration: 220,
            easing:
              Easing.inOut(
                Easing.quad,
              ),
            useNativeDriver: true,
          },
        ),
      ]).start();
    }, 2380);

    /* =====================================================
       MASCOT
    ===================================================== */

    Animated.timing(mascot, {
      toValue: 1,
      duration: 560,
      delay: 1120,
      easing:
        Easing.out(
          Easing.back(1.15),
        ),
      useNativeDriver: true,
    }).start();

    /* =====================================================
       MASCOT FLOAT
    ===================================================== */

    timer(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(
            mascotBob,
            {
              toValue: 1,
              duration: 650,
              easing:
                Easing.inOut(
                  Easing.ease,
                ),
              useNativeDriver: true,
              isInteraction:
                false,
            },
          ),

          Animated.timing(
            mascotBob,
            {
              toValue: 0,
              duration: 650,
              easing:
                Easing.inOut(
                  Easing.ease,
                ),
              useNativeDriver: true,
              isInteraction:
                false,
            },
          ),
        ]),
      ).start();
    }, 1650);

    /* =====================================================
       MASCOT WAVE
    ===================================================== */

    timer(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(
            mascotWave,
            {
              toValue: 1,
              duration: 450,
              easing:
                Easing.inOut(
                  Easing.ease,
                ),
              useNativeDriver: true,
              isInteraction:
                false,
            },
          ),

          Animated.timing(
            mascotWave,
            {
              toValue: 0,
              duration: 450,
              easing:
                Easing.inOut(
                  Easing.ease,
                ),
              useNativeDriver: true,
              isInteraction:
                false,
            },
          ),
        ]),
      ).start();
    }, 1600);

    /* =====================================================
       DIVIDER
    ===================================================== */

    Animated.timing(divider, {
      toValue: 1,
      duration: 520,
      delay: 1300,
      easing:
        Easing.out(
          Easing.cubic,
        ),
      useNativeDriver: true,
    }).start();

    /* =====================================================
       TAGLINE
    ===================================================== */

    Animated.timing(tagline, {
      toValue: 1,
      duration: 500,
      delay: 1380,
      easing:
        Easing.out(
          Easing.cubic,
        ),
      useNativeDriver: true,
    }).start();

    /* =====================================================
       TAGLINE HIGHLIGHT
    ===================================================== */

    timer(() => {
      Animated.sequence([
        Animated.timing(
          taglineHighlight,
          {
            toValue: 1,
            duration: 120,
            useNativeDriver: true,
          },
        ),

        Animated.timing(
          taglineHighlight,
          {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          },
        ),
      ]).start();
    }, 2100);

    /* =====================================================
       STATUS
    ===================================================== */

    Animated.timing(status, {
      toValue: 1,
      duration: 420,
      delay: 260,
      easing:
        Easing.out(
          Easing.cubic,
        ),
      useNativeDriver: true,
    }).start();

    /* =====================================================
       PROGRESS
       
       EXACTLY 3500ms
    ===================================================== */

    Animated.timing(loading, {
      toValue: 1,
      duration:
        SPLASH_DURATION,
      easing:
        Easing.linear,
      useNativeDriver: false,
    }).start();

    /* =====================================================
       SPARKLES
    ===================================================== */

    Animated.timing(
      sparkleMaster,
      {
        toValue: 1,
        duration: 520,
        delay: 1360,
        easing:
          Easing.out(
            Easing.back(1.2),
          ),
        useNativeDriver: true,
      },
    ).start();

    timer(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(
            sparklePulse,
            {
              toValue: 1,
              duration: 430,
              easing:
                Easing.inOut(
                  Easing.ease,
                ),
              useNativeDriver: true,
              isInteraction:
                false,
            },
          ),

          Animated.timing(
            sparklePulse,
            {
              toValue: 0,
              duration: 430,
              easing:
                Easing.inOut(
                  Easing.ease,
                ),
              useNativeDriver: true,
              isInteraction:
                false,
            },
          ),
        ]),
        {
          iterations: 2,
        },
      ).start();
    }, 1650);

    /* =====================================================
       STATUS LABELS
    ===================================================== */

    timer(() => {
      setStatusIndex(1);
    }, 1450);

    timer(() => {
      setStatusIndex(2);
    }, 2650);

    /* =====================================================
       COMPLETE
    ===================================================== */

    if (onComplete) {
      timer(
        onComplete,
        SPLASH_DURATION,
      );
    }

    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {
      timers.forEach(
        clearTimeout,
      );

      [
        stage,
        eyebrow,
        mark,
        markPulse,
        word,
        wordHighlight,
        mascot,
        mascotBob,
        mascotWave,
        divider,
        tagline,
        taglineHighlight,
        status,
        loading,
        sparkleMaster,
        sparklePulse,
        ...letterHighlights,
      ].forEach(
        (value) => {
          value.stopAnimation();
        },
      );
    };
  }, [
    resetAnimations,
    onComplete,
    stage,
    eyebrow,
    mark,
    markPulse,
    word,
    wordHighlight,
    mascot,
    mascotBob,
    mascotWave,
    divider,
    tagline,
    taglineHighlight,
    status,
    loading,
    sparkleMaster,
    sparklePulse,
    letterHighlights,
  ]);

  /* =======================================================
     LOGO TRANSFORMS
  ======================================================= */

  const markTranslateY =
    mark.interpolate({
      inputRange: [
        0,
        0.35,
        0.55,
        0.75,
        1,
      ],
      outputRange: [
        35,
        -8,
        3,
        -1,
        0,
      ],
    });

  const markScale =
    mark.interpolate({
      inputRange: [
        0,
        0.35,
        0.55,
        0.75,
        1,
      ],
      outputRange: [
        0.45,
        1.1,
        0.97,
        1.02,
        1,
      ],
    });

  const markRotate =
    mark.interpolate({
      inputRange: [
        0,
        0.5,
        1,
      ],
      outputRange: [
        '-5deg',
        '1deg',
        '0deg',
      ],
    });

  const markPulseScale =
    markPulse.interpolate({
      inputRange: [
        0,
        1,
      ],
      outputRange: [
        1,
        1.035,
      ],
    });

  /* =======================================================
     DIVIDER
  ======================================================= */

  const dividerScale =
    divider.interpolate({
      inputRange: [
        0,
        1,
      ],
      outputRange: [
        0,
        1,
      ],
    });

  /* =======================================================
     TAGLINE
  ======================================================= */

  const taglineY =
    tagline.interpolate({
      inputRange: [
        0,
        0.6,
        1,
      ],
      outputRange: [
        12,
        -2,
        0,
      ],
    });

  const taglineHighlightOpacity =
    taglineHighlight.interpolate({
      inputRange: [
        0,
        1,
      ],
      outputRange: [
        0,
        0.25,
      ],
    });

  /* =======================================================
     SPARKLE SCALE
  ======================================================= */

  const sparkleScale =
    sparkleMaster.interpolate({
      inputRange: [
        0,
        0.5,
        1,
      ],
      outputRange: [
        0,
        1.15,
        1,
      ],
      extrapolate:
        'clamp',
    });

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Animated.View
      style={[
        styles.stage,
        {
          opacity: stage,
          minHeight: height,
        },
      ]}
    >
      <SafeAreaView
        style={styles.safe}
      >

        {/* =================================================
            GRAIN
        ================================================= */}

        <View
          pointerEvents="none"
          style={styles.grain}
        >
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 160 160"
            preserveAspectRatio="none"
          >
            <Defs>
              <LinearGradient
                id="grainGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <Stop
                  offset="0"
                  stopColor="#FFFFFF"
                  stopOpacity="0.025"
                />

                <Stop
                  offset="0.5"
                  stopColor="#FFFFFF"
                  stopOpacity="0.06"
                />

                <Stop
                  offset="1"
                  stopColor="#FFFFFF"
                  stopOpacity="0.015"
                />
              </LinearGradient>
            </Defs>

            <Rect
              width={160}
              height={160}
              fill="url(#grainGradient)"
            />

            {Array.from({
              length: 150,
            }).map(
              (_, index) => {
                const x =
                  (index * 37) % 160;

                const y =
                  (index * 61) % 160;

                return (
                  <Circle
                    key={index}
                    cx={x}
                    cy={y}
                    r={
                      index % 3 === 0
                        ? 0.7
                        : 0.3
                    }
                    fill="#FFFFFF"
                    opacity={
                      index % 4 === 0
                        ? 0.08
                        : 0.035
                    }
                  />
                );
              },
            )}
          </Svg>
        </View>

        {/* =================================================
            VIGNETTE
        ================================================= */}

        <View
          pointerEvents="none"
          style={styles.vignette}
        />

        {/* =================================================
            CLOUD 1
        ================================================= */}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.cloud,
            styles.cloud1,
            {
              transform: [
                {
                  translateX:
                    loading.interpolate({
                      inputRange: [
                        0,
                        1,
                      ],
                      outputRange: [
                        -180,
                        width + 180,
                      ],
                    }),
                },
              ],
            },
          ]}
        >
          <Cloud />
        </Animated.View>

        {/* =================================================
            CLOUD 2
        ================================================= */}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.cloud,
            styles.cloud2,
            {
              transform: [
                {
                  translateX:
                    loading.interpolate({
                      inputRange: [
                        0,
                        1,
                      ],
                      outputRange: [
                        -260,
                        width + 260,
                      ],
                    }),
                },
              ],
            },
          ]}
        >
          <Cloud />
        </Animated.View>

        {/* =================================================
            CLOUD 3
        ================================================= */}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.cloud,
            styles.cloud3,
            {
              transform: [
                {
                  translateX:
                    loading.interpolate({
                      inputRange: [
                        0,
                        1,
                      ],
                      outputRange: [
                        -220,
                        width + 220,
                      ],
                    }),
                },
              ],
            },
          ]}
        >
          <Cloud />
        </Animated.View>

        {/* =================================================
            MAIN LOCKUP
        ================================================= */}

        <View
          style={styles.lockup}
        >

          {/* IPS */}

          <Animated.Text
            style={[
              styles.brandEyebrow,
              {
                opacity: eyebrow,

                transform: [
                  {
                    translateY:
                      eyebrow.interpolate({
                        inputRange: [
                          0,
                          1,
                        ],
                        outputRange: [
                          -8,
                          0,
                        ],
                      }),
                  },
                  {
                    scale:
                      eyebrow.interpolate({
                        inputRange: [
                          0,
                          1,
                        ],
                        outputRange: [
                          0.94,
                          1,
                        ],
                      }),
                  },
                ],
              },
            ]}
          >
            IPS
          </Animated.Text>

          {/* =================================================
              N LOGO
              
              NO BORDER
              NO CIRCLE
          ================================================= */}

          <View
            style={styles.markWrap}
          >
            <Animated.View
              style={{
                opacity: mark,

                transform: [
                  {
                    translateY:
                      markTranslateY,
                  },
                  {
                    scale:
                      Animated.multiply(
                        markScale,
                        markPulseScale,
                      ),
                  },
                  {
                    rotate:
                      markRotate,
                  },
                ],
              }}
            >
              <Svg
                width={104}
                height={104}
                viewBox="0 0 120 120"
              >
                <Defs>
                  <LinearGradient
                    id="nGradient"
                    x1="0"
                    y1="1"
                    x2="1"
                    y2="0"
                    gradientUnits="userSpaceOnUse"
                  >
                    <Stop
                      offset="0"
                      stopColor={
                        COLORS.accentLo
                      }
                    />

                    <Stop
                      offset="0.55"
                      stopColor={
                        COLORS.accent
                      }
                    />

                    <Stop
                      offset="1"
                      stopColor={
                        COLORS.accentHi
                      }
                    />
                  </LinearGradient>
                </Defs>

                <Path
                  d="M30 34 L30 86"
                  stroke="url(#nGradient)"
                  strokeWidth={8}
                  strokeLinecap="round"
                  fill="none"
                />

                <Path
                  d="M30 86 L90 34"
                  stroke="url(#nGradient)"
                  strokeWidth={8}
                  strokeLinecap="round"
                  fill="none"
                />

                <Path
                  d="M90 34 L90 86"
                  stroke="url(#nGradient)"
                  strokeWidth={8}
                  strokeLinecap="round"
                  fill="none"
                />

                <Circle
                  cx="30"
                  cy="34"
                  r="3.5"
                  fill={
                    COLORS.accentHi
                  }
                />

                <Circle
                  cx="90"
                  cy="34"
                  r="3.5"
                  fill={
                    COLORS.accentHi
                  }
                />
              </Svg>
            </Animated.View>
          </View>

          {/* =================================================
              NORULIA
          ================================================= */}

          <View
            style={styles.wordmarkWrap}
          >
            <AnimatedWord
              wordAnimation={word}
              highlights={
                letterHighlights
              }
            />

            {/* =================================================
                QUICK WHOLE-WORD HIGHLIGHT
            ================================================= */}

            <Animated.View
              pointerEvents="none"
              style={[
                styles.wordHighlightSweep,
                {
                  opacity:
                    wordHighlight.interpolate({
                      inputRange: [
                        0,
                        0.4,
                        1,
                      ],
                      outputRange: [
                        0,
                        0.38,
                        0,
                      ],
                    }),

                  transform: [
                    {
                      translateX:
                        wordHighlight.interpolate(
                          {
                            inputRange: [
                              0,
                              1,
                            ],
                            outputRange: [
                              -100,
                              100,
                            ],
                          },
                        ),
                    },
                  ],
                },
              ]}
            />
          </View>

          {/* =================================================
              MASCOT
          ================================================= */}

          <Mascot
            progress={mascot}
            bob={mascotBob}
            wave={mascotWave}
          />

          {/* =================================================
              SPARKLES
          ================================================= */}

          <Sparkle
            style={styles.sparkle1}
            opacity={
              sparkleMaster
            }
            scale={
              sparkleScale
            }
            rotate={sparkleMaster.interpolate(
              {
                inputRange: [
                  0,
                  1,
                ],
                outputRange: [
                  '-60deg',
                  '0deg',
                ],
              },
            )}
          />

          <Sparkle
            style={styles.sparkle2}
            opacity={
              sparkleMaster
            }
            scale={
              sparkleScale
            }
            rotate={sparkleMaster.interpolate(
              {
                inputRange: [
                  0,
                  1,
                ],
                outputRange: [
                  '-60deg',
                  '0deg',
                ],
              },
            )}
          />

          <Sparkle
            style={styles.sparkle3}
            opacity={
              sparkleMaster
            }
            scale={
              sparkleScale
            }
            rotate={sparkleMaster.interpolate(
              {
                inputRange: [
                  0,
                  1,
                ],
                outputRange: [
                  '-60deg',
                  '0deg',
                ],
              },
            )}
          />

          <Sparkle
            style={styles.sparkle4}
            opacity={
              sparkleMaster
            }
            scale={
              sparkleScale
            }
            rotate={sparkleMaster.interpolate(
              {
                inputRange: [
                  0,
                  1,
                ],
                outputRange: [
                  '-60deg',
                  '0deg',
                ],
              },
            )}
          />

          <Sparkle
            style={styles.sparkle5}
            opacity={
              sparkleMaster
            }
            scale={
              sparkleScale
            }
            rotate={sparkleMaster.interpolate(
              {
                inputRange: [
                  0,
                  1,
                ],
                outputRange: [
                  '-60deg',
                  '0deg',
                ],
              },
            )}
          />

          <Sparkle
            style={styles.sparkle6}
            opacity={
              sparkleMaster
            }
            scale={
              sparkleScale
            }
            rotate={sparkleMaster.interpolate(
              {
                inputRange: [
                  0,
                  1,
                ],
                outputRange: [
                  '-60deg',
                  '0deg',
                ],
              },
            )}
          />
        </View>

        {/* =================================================
            DIVIDER
        ================================================= */}

        <Animated.View
          style={[
            styles.divider,
            {
              opacity: divider,

              transform: [
                {
                  scaleX:
                    dividerScale,
                },
              ],
            },
          ]}
        />

        {/* =================================================
            TAGLINE
        ================================================= */}

        <Animated.View
          style={[
            styles.taglineWrap,
            {
              opacity: tagline,

              transform: [
                {
                  translateY:
                    taglineY,
                },
              ],
            },
          ]}
        >
          <Text
            style={styles.tagline}
          >
            Mind, beautifully calibrated.
          </Text>

          <Animated.View
            pointerEvents="none"
            style={[
              styles.taglineHighlight,
              {
                opacity:
                  taglineHighlightOpacity,

                transform: [
                  {
                    translateX:
                      taglineHighlight.interpolate(
                        {
                          inputRange: [
                            0,
                            1,
                          ],
                          outputRange: [
                            -80,
                            80,
                          ],
                        },
                      ),
                  },
                ],
              },
            ]}
          />
        </Animated.View>

        {/* =================================================
            STATUS
        ================================================= */}

        <Animated.View
          style={[
            styles.statusBar,
            {
              opacity: status,

              paddingBottom:
                Math.max(
                  18,
                  insets.bottom +
                    18,
                ),
            },
          ]}
        >
          <View
            style={styles.statusDot}
          />

          <Text
            style={styles.statusCore}
          >
            IPS CORE
          </Text>

          <View
            style={styles.progressTrack}
          >
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width:
                    loading.interpolate({
                      inputRange: [
                        0,
                        0.08,
                        0.45,
                        0.78,
                        1,
                      ],
                      outputRange: [
                        '0%',
                        '7%',
                        '45%',
                        '78%',
                        '100%',
                      ],
                    }),
                },
              ]}
            />
          </View>

          <Text
            style={styles.statusLabel}
          >
            {
              LABELS[
                statusIndex
              ]
            }
          </Text>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default SplashScreen;

/* =========================================================
   STYLES
========================================================= */

const styles =
  StyleSheet.create({
    /* =====================================================
       STAGE
    ===================================================== */

    stage: {
      flex: 1,

      width: '100%',

      position: 'relative',

      overflow: 'hidden',

      backgroundColor:
        COLORS.bg,
    },

    safe: {
      flex: 1,

      width: '100%',

      alignItems: 'center',

      justifyContent: 'center',

      overflow: 'hidden',
    },

    /* =====================================================
       GRAIN
    ===================================================== */

    grain: {
      ...StyleSheet.absoluteFillObject,

      opacity: 0.32,

      zIndex: 0,
    },

    vignette: {
      ...StyleSheet.absoluteFillObject,

      zIndex: 1,

      backgroundColor:
        'rgba(0,0,0,0.13)',
    },

    /* =====================================================
       CLOUDS
    ===================================================== */

    cloud: {
      position: 'absolute',

      left: 0,

      zIndex: 2,

      pointerEvents:
        'none',

      overflow: 'visible',
    },

    cloud1: {
      top: '6%',

      width: 150,

      height: 75,

      opacity: 0.62,
    },

    cloud2: {
      top: '19%',

      width: 108,

      height: 54,

      opacity: 0.45,
    },

    cloud3: {
      bottom: '11%',

      width: 128,

      height: 64,

      opacity: 0.5,
    },

    /* =====================================================
       LOCKUP
    ===================================================== */

    lockup: {
      position: 'relative',

      zIndex: 5,

      alignItems:
        'center',

      paddingHorizontal: 28,
    },

    /* =====================================================
       IPS
    ===================================================== */

    brandEyebrow: {
      fontFamily:
        'JetBrainsMono_500Medium',

      fontSize: 12,

      letterSpacing: 3.6,

      color: COLORS.muted,

      textTransform:
        'uppercase',

      marginBottom: 30,
    },

    /* =====================================================
       MARK
    ===================================================== */

    markWrap: {
      width: 170,

      height: 170,

      alignItems:
        'center',

      justifyContent:
        'center',

      overflow:
        'visible',
    },

    /* =====================================================
       WORDMARK
    ===================================================== */

    wordmarkWrap: {
      position:
        'relative',

      marginTop: 26,

      alignItems:
        'center',

      justifyContent:
        'center',

      overflow:
        'visible',
    },

    animatedWord: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'center',

      overflow:
        'visible',
    },

    letterContainer: {
      position:
        'relative',

      alignItems:
        'center',

      justifyContent:
        'center',

      overflow:
        'visible',
    },

    wordmarkChar: {
      fontFamily:
        'Sora_700Bold',

      fontSize: 58,

      lineHeight: 66,

      color:
        COLORS.fg,

      letterSpacing:
        -1.15,
    },

    wordmarkHighlight: {
      position:
        'absolute',

      left: 0,

      top: 0,

      color:
        COLORS.accentHi,

      opacity: 0,

      textShadowColor:
        'rgba(230,216,248,0.9)',

      textShadowOffset: {
        width: 0,
        height: 0,
      },

      textShadowRadius: 8,
    },

    wordHighlightSweep: {
      position:
        'absolute',

      top: 7,

      left: '50%',

      width: 18,

      height: 52,

      borderRadius: 999,

      backgroundColor:
        'rgba(255,255,255,0.8)',

      opacity: 0,

      transform:
        [
          {
            scaleX: 0.3,
          },
        ],
    },

    /* =====================================================
       MASCOT
    ===================================================== */

    mascot: {
      position:
        'absolute',

      top: -40,

      left: '50%',

      zIndex: 10,

      width: 50,

      height: 50,

      overflow:
        'visible',
    },

    mascotArm: {
      position:
        'absolute',

      right: -2,

      top: 4,

      width: 20,

      height: 28,

      transformOrigin:
        '50% 50%',
    },

    /* =====================================================
       SPARKLES
    ===================================================== */

    sparkle: {
      position:
        'absolute',

      zIndex: 8,

      width: 16,

      height: 16,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        'transparent',

      overflow:
        'visible',

      elevation: 0,
    },

    sparkle1: {
      top: -44,

      left: -26,

      width: 15,

      height: 15,
    },

    sparkle2: {
      top: -50,

      right: 4,

      width: 12,

      height: 12,
    },

    sparkle3: {
      top: -4,

      left: -54,

      width: 13,

      height: 13,
    },

    sparkle4: {
      top: 2,

      right: -42,

      width: 18,

      height: 18,
    },

    sparkle5: {
      bottom: -22,

      left: 22,

      width: 14,

      height: 14,
    },

    sparkle6: {
      bottom: -28,

      right: 16,

      width: 11,

      height: 11,
    },

    /* =====================================================
       DIVIDER
    ===================================================== */

    divider: {
      width: 150,

      height: 1,

      marginTop: 20,

      marginBottom: 16,

      backgroundColor:
        'rgba(255,255,255,0.1)',
    },

    /* =====================================================
       TAGLINE
    ===================================================== */

    taglineWrap: {
      position:
        'relative',

      overflow:
        'hidden',

      alignItems:
        'center',

      justifyContent:
        'center',
    },

    tagline: {
      fontFamily:
        'Inter_600SemiBold',

      fontSize: 15,

      letterSpacing:
        0.15,

      color:
        COLORS.muted,
    },

    taglineHighlight: {
      position:
        'absolute',

      left: '50%',

      top: 1,

      width: 16,

      height: 20,

      borderRadius: 999,

      backgroundColor:
        'rgba(255,255,255,0.75)',

      opacity: 0,
    },

    /* =====================================================
       STATUS
    ===================================================== */

    statusBar: {
      position:
        'absolute',

      left: 0,

      right: 0,

      bottom: 0,

      zIndex: 20,

      flexDirection:
        'row',

      alignItems:
        'center',

      paddingHorizontal: 24,

      gap: 16,
    },

    statusDot: {
      width: 5,

      height: 5,

      borderRadius: 999,

      backgroundColor:
        COLORS.accent,

      shadowColor:
        COLORS.accent,

      shadowOpacity: 0.8,

      shadowRadius: 6,

      shadowOffset: {
        width: 0,
        height: 0,
      },
    },

    statusCore: {
      fontFamily:
        'JetBrainsMono_500Medium',

      fontSize: 10.5,

      letterSpacing:
        1.25,

      color:
        COLORS.muted,

      textTransform:
        'uppercase',
    },

    progressTrack: {
      flex: 1,

      height: 2,

      borderRadius: 2,

      overflow:
        'hidden',

      backgroundColor:
        'rgba(255,255,255,0.1)',
    },

    progressFill: {
      height: '100%',

      backgroundColor:
        COLORS.accent,
    },

    statusLabel: {
      minWidth: 96,

      textAlign:
        'right',

      fontFamily:
        'JetBrainsMono_500Medium',

      fontSize: 10.5,

      letterSpacing:
        1.25,

      color:
        COLORS.muted,

      textTransform:
        'uppercase',
    },
  });