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
  Pressable,
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
   Based directly on splash.html
========================================================= */

const COLORS = {
  bg: '#24142F',
  bg2: '#37214F',

  fg: '#F3EEF9',
  muted: '#B3A7BE',

  border: 'rgba(255,255,255,0.12)',

  accent: '#C39BEF',
  accentHi: '#E6D8F8',
  accentLo: '#8758C8',

  orbA: 'rgba(132,79,189,0.22)',
  orbB: 'rgba(148,93,199,0.18)',
  orbC: 'rgba(159,108,196,0.13)',

  deep: '#151020',
};

const WORD = 'Norulia';

const LABELS = [
  'Initializing',
  'Calibrating',
  'Ready',
] as const;

const DEFAULT_COMPLETE_TIME = 6300;

/* =========================================================
   TYPES
========================================================= */

export interface SplashScreenProps {
  onComplete?: () => void;
  autoCompleteAfter?: number;
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
   Native approximation of the cloud SVG used by the HTML
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
  opacity: Animated.Value;
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
            { scale },
            { rotate },
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
          stroke="#FFFFFF"
          strokeWidth={0.4}
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
  blink,
  blush,
  wave,
  bob,
}: {
  progress: Animated.Value;
  blink: Animated.Value;
  blush: Animated.Value;
  wave: Animated.Value;
  bob: Animated.Value;
}) {
  const entranceY = progress.interpolate({
    inputRange: [0, 0.55, 0.8, 1],
    outputRange: [34, -7, 2, 0],
  });

  const entranceScale = progress.interpolate({
    inputRange: [0, 0.55, 0.8, 1],
    outputRange: [0.3, 1.12, 0.96, 1],
  });

  const entranceRotate = progress.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: ['14deg', '-4deg', '0deg'],
  });

  const bobY = bob.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -5, 0],
  });

  const bobScaleX = bob.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.04, 1],
  });

  const bobScaleY = bob.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.95, 1],
  });

  const blinkScale = blink.interpolate({
    inputRange: [0, 0.9, 0.93, 0.96, 1],
    outputRange: [1, 1, 0.08, 1, 1],
  });

  const blushOpacity = blush.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.45, 0.85, 0.45],
  });

  const blushScale = blush.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.18, 1],
  });

  const armRotate = wave.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-8deg', '26deg', '-8deg'],
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
              translateY: Animated.add(
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

        {/* Body */}

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

        {/* Left blush */}

        <Animated.View>
          <Ellipse
            cx="44"
            cy="78"
            rx="9"
            ry="6"
            fill="rgba(255,220,244,0.65)"
            opacity={0.55}
          />
        </Animated.View>

        {/* Right blush */}

        <Ellipse
          cx="76"
          cy="78"
          rx="9"
          ry="6"
          fill="rgba(255,220,244,0.65)"
          opacity={0.55}
        />

        {/* Eyes */}

        <G
          transform={`translate(0,0)`}
        >
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
        </G>

        {/* Mouth */}

        <Path
          d="M48 78 Q60 90 72 78"
          fill="none"
          stroke="#68428F"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Arm */}

        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            transform: [
              {
                rotate: armRotate,
              },
            ],
          }}
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
              fill="url(#mascotGradient)"
              stroke="#68428F"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        {/* Ear / side ornament */}

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
    </Animated.View>
  );
}

/* =========================================================
   SPLASH
========================================================= */

export function SplashScreen({
  onComplete,
  autoCompleteAfter = DEFAULT_COMPLETE_TIME,
}: SplashScreenProps) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [playKey, setPlayKey] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [showReplay, setShowReplay] = useState(false);

  const makeValue = () =>
    new Animated.Value(0);

  /* ---------------------------------------------
     Main animation values
  --------------------------------------------- */

  const stage = useRef(makeValue()).current;

  const eyebrow = useRef(makeValue()).current;

  const glow = useRef(makeValue()).current;

  const ripple1 = useRef(makeValue()).current;
  const ripple2 = useRef(makeValue()).current;

  const mark = useRef(makeValue()).current;

  const word = useRef(makeValue()).current;

  const shine = useRef(makeValue()).current;

  const mascot = useRef(makeValue()).current;

  const mascotBob = useRef(makeValue()).current;

  const mascotBlink = useRef(makeValue()).current;

  const mascotBlush = useRef(makeValue()).current;

  const mascotWave = useRef(makeValue()).current;

  const divider = useRef(makeValue()).current;

  const tagline = useRef(makeValue()).current;

  const status = useRef(makeValue()).current;

  const loading = useRef(makeValue()).current;

  const sparkleMaster = useRef(makeValue()).current;

  /* ---------------------------------------------
     Letters
  --------------------------------------------- */

  const letters = useMemo(
    () => WORD.split(''),
    [],
  );

  /* ---------------------------------------------
     Reset
  --------------------------------------------- */

  const reset = useCallback(() => {
    [
      stage,
      eyebrow,

      glow,

      ripple1,
      ripple2,

      mark,

      word,

      shine,

      mascot,
      mascotBob,
      mascotBlink,
      mascotBlush,
      mascotWave,

      divider,
      tagline,

      status,
      loading,

      sparkleMaster,
    ].forEach((value) => {
      value.stopAnimation();
      value.setValue(0);
    });

    setStatusIndex(0);
    setShowReplay(false);
  }, [
    stage,
    eyebrow,

    glow,

    ripple1,
    ripple2,

    mark,

    word,

    shine,

    mascot,
    mascotBob,
    mascotBlink,
    mascotBlush,
    mascotWave,

    divider,
    tagline,

    status,
    loading,

    sparkleMaster,
  ]);

  /* ---------------------------------------------
     Replay
  --------------------------------------------- */

  const replay = useCallback(() => {
    reset();

    setPlayKey((value) => value + 1);
  }, [reset]);

  /* ---------------------------------------------
     Main timeline
  --------------------------------------------- */

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

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

    /* Stage */

    Animated.timing(stage, {
      toValue: 1,
      duration: 900,
      delay: 50,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    /* Eyebrow */

    Animated.timing(eyebrow, {
      toValue: 1,
      duration: 850,
      delay: 450,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    /* Glow */

    Animated.sequence([
      Animated.delay(1050),

      Animated.timing(glow, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1.08,
            duration: 2300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(glow, {
            toValue: 1,
            duration: 2300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();

    /* Ripple 1 */

    Animated.sequence([
      Animated.delay(1800),

      Animated.timing(ripple1, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    /* Ripple 2 */

    Animated.sequence([
      Animated.delay(3100),

      Animated.timing(ripple2, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    /* N mark */

    Animated.timing(mark, {
      toValue: 1,
      duration: 1150,
      delay: 950,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    /* Word */

    Animated.timing(word, {
      toValue: 1,
      duration: 1150,
      delay: 1900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    /* Shine */

    Animated.timing(shine, {
      toValue: 1,
      duration: 1600,
      delay: 4250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    /* Mascot entrance */

    Animated.timing(mascot, {
      toValue: 1,
      duration: 950,
      delay: 3550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    /* Mascot bob */

    timer(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(mascotBob, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(mascotBob, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }, 4700);

    /* Mascot blink */

    timer(() => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(3000),

          Animated.timing(mascotBlink, {
            toValue: 1,
            duration: 380,
            easing: Easing.linear,
            useNativeDriver: true,
          }),

          Animated.timing(mascotBlink, {
            toValue: 0,
            duration: 380,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }, 4700);

    /* Mascot blush */

    timer(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(mascotBlush, {
            toValue: 1,
            duration: 1300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(mascotBlush, {
            toValue: 0,
            duration: 1300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }, 4700);

    /* Mascot arm */

    timer(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(mascotWave, {
            toValue: 1,
            duration: 750,
            delay: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),

          Animated.timing(mascotWave, {
            toValue: 0,
            duration: 750,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }, 4700);

    /* Divider */

    Animated.timing(divider, {
      toValue: 1,
      duration: 1100,
      delay: 3050,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    /* Tagline */

    Animated.timing(tagline, {
      toValue: 1,
      duration: 800,
      delay: 3200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    /* Status */

    Animated.timing(status, {
      toValue: 1,
      duration: 700,
      delay: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    /* Loading */

    Animated.timing(loading, {
      toValue: 1,
      duration: 5600,
      delay: 500,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    /* Sparkle master */

    Animated.timing(sparkleMaster, {
      toValue: 1,
      duration: 550,
      delay: 4550,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    /* Status text */

    timer(
      () => setStatusIndex(1),
      3600,
    );

    timer(
      () => setStatusIndex(2),
      5200,
    );

    /* Replay */

    timer(
      () => setShowReplay(true),
      6300,
    );

    /* Complete */

    if (onComplete) {
      timer(
        onComplete,
        Math.max(
          0,
          autoCompleteAfter,
        ),
      );
    }

    return () => {
      timers.forEach(clearTimeout);

      [
        stage,
        eyebrow,

        glow,

        ripple1,
        ripple2,

        mark,
        word,
        shine,

        mascot,
        mascotBob,
        mascotBlink,
        mascotBlush,
        mascotWave,

        divider,
        tagline,

        status,
        loading,

        sparkleMaster,
      ].forEach((value) => {
        value.stopAnimation();
      });
    };
  }, [
    playKey,
    onComplete,
    autoCompleteAfter,
  ]);

  /* =========================================================
     ANIMATED STYLES
  ========================================================= */

  /* Glow */

  const glowScale = glow.interpolate({
    inputRange: [0, 1, 1.08],
    outputRange: [0.72, 1, 1.06],
  });

  /* Mark */

  const markTranslateY = mark.interpolate({
    inputRange: [
      0,
      0.45,
      0.65,
      0.8,
      1,
    ],
    outputRange: [
      42,
      -8,
      3,
      0,
      0,
    ],
  });

  const markScale = mark.interpolate({
    inputRange: [
      0,
      0.45,
      0.65,
      0.8,
      1,
    ],
    outputRange: [
      0.3,
      1.1,
      0.94,
      1.03,
      1,
    ],
  });

  const markRotate = mark.interpolate({
    inputRange: [
      0,
      0.45,
      0.65,
      1,
    ],
    outputRange: [
      '-8deg',
      '1.5deg',
      '0deg',
      '0deg',
    ],
  });

  /* Ripple */

  const ripple1Scale =
    ripple1.interpolate({
      inputRange: [0, 1],
      outputRange: [0.42, 1.6],
    });

  const ripple2Scale =
    ripple2.interpolate({
      inputRange: [0, 1],
      outputRange: [0.42, 1.6],
    });

  const ripple1Opacity =
    ripple1.interpolate({
      inputRange: [0, 1],
      outputRange: [0.65, 0],
    });

  const ripple2Opacity =
    ripple2.interpolate({
      inputRange: [0, 1],
      outputRange: [0.65, 0],
    });

  /* Word */

  const wordTranslateY =
    word.interpolate({
      inputRange: [
        0,
        0.55,
        0.75,
        1,
      ],
      outputRange: [
        48,
        -8,
        3,
        0,
      ],
    });

  const wordScale =
    word.interpolate({
      inputRange: [
        0,
        0.55,
        0.75,
        1,
      ],
      outputRange: [
        0.45,
        1.08,
        0.96,
        1,
      ],
    });

  /* Shine */

  const shineOpacity =
    shine.interpolate({
      inputRange: [
        0,
        0.12,
        0.86,
        1,
      ],
      outputRange: [
        0,
        1,
        1,
        0,
      ],
    });

  const shineTranslate =
    shine.interpolate({
      inputRange: [
        0,
        0.12,
        0.86,
        1,
      ],
      outputRange: [
        170,
        125,
        -115,
        -170,
      ],
    });

  /* Divider */

  const dividerScale =
    divider.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

  /* Tagline */

  const taglineY =
    tagline.interpolate({
      inputRange: [
        0,
        0.6,
        1,
      ],
      outputRange: [
        16,
        -4,
        0,
      ],
    });

  /* =========================================================
     RENDER
  ========================================================= */

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
      <SafeAreaView style={styles.safe}>

        {/* ===============================================
            GRAIN
        =============================================== */}

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
                  stopOpacity="0.03"
                />

                <Stop
                  offset="0.5"
                  stopColor="#FFFFFF"
                  stopOpacity="0.08"
                />

                <Stop
                  offset="1"
                  stopColor="#FFFFFF"
                  stopOpacity="0.02"
                />
              </LinearGradient>
            </Defs>

            <Rect
              width="160"
              height="160"
              fill="url(#grainGradient)"
            />

            {Array.from({
              length: 180,
            }).map((_, index) => {
              const x =
                (index * 37) % 160;

              const y =
                (index * 61) % 160;

              const r =
                index % 3 === 0
                  ? 0.8
                  : 0.35;

              return (
                <Circle
                  key={index}
                  cx={x}
                  cy={y}
                  r={r}
                  fill="#FFFFFF"
                  opacity={
                    index % 4 === 0
                      ? 0.12
                      : 0.05
                  }
                />
              );
            })}
          </Svg>
        </View>

        {/* ===============================================
            VIGNETTE
        =============================================== */}

        <View
          pointerEvents="none"
          style={styles.vignette}
        />

        {/* ===============================================
            CLOUDS
        =============================================== */}

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
                      inputRange: [0, 1],
                      outputRange: [
                        -170,
                        width + 170,
                      ],
                    }),
                },
              ],
            },
          ]}
        >
          <Cloud />
        </Animated.View>

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
                      inputRange: [0, 1],
                      outputRange: [
                        -250,
                        width + 250,
                      ],
                    }),
                },
              ],
            },
          ]}
        >
          <Cloud />
        </Animated.View>

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
                      inputRange: [0, 1],
                      outputRange: [
                        -210,
                        width + 210,
                      ],
                    }),
                },
              ],
            },
          ]}
        >
          <Cloud />
        </Animated.View>

        {/* ===============================================
            MAIN LOCKUP
        =============================================== */}

        <View style={styles.lockup}>

          {/* IPS */}

          <Animated.Text
            style={[
              styles.brandEyebrow,
              {
                opacity: eyebrow,
              },
            ]}
          >
            IPS
          </Animated.Text>

          {/* =============================================
              LOGO
          ============================================= */}

          <View style={styles.markWrap}>

            {/* Glow */}

            <Animated.View
              pointerEvents="none"
              style={[
                styles.markGlow,
                {
                  opacity: glow,
                  transform: [
                    {
                      scale: glowScale,
                    },
                  ],
                },
              ]}
            />

            {/* Ripple 1 */}

            <Animated.View
              pointerEvents="none"
              style={[
                styles.ripple,
                {
                  opacity: ripple1Opacity,
                  transform: [
                    {
                      scale: ripple1Scale,
                    },
                  ],
                },
              ]}
            />

            {/* Ripple 2 */}

            <Animated.View
              pointerEvents="none"
              style={[
                styles.ripple,
                styles.ripple2,
                {
                  opacity: ripple2Opacity,
                  transform: [
                    {
                      scale: ripple2Scale,
                    },
                  ],
                },
              ]}
            />

            {/* N */}

            <Animated.View
              style={{
                opacity: mark,

                transform: [
                  {
                    translateY:
                      markTranslateY,
                  },

                  {
                    scale: markScale,
                  },

                  {
                    rotate: markRotate,
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
                  fill={COLORS.accentHi}
                />

                <Circle
                  cx="90"
                  cy="34"
                  r="3.5"
                  fill={COLORS.accentHi}
                />
              </Svg>
            </Animated.View>
          </View>

          {/* =============================================
              WORDMARK
          ============================================= */}

          <View style={styles.wordmarkWrap}>

            <Animated.View
              style={[
                styles.wordmark,
                {
                  transform: [
                    {
                      translateY:
                        wordTranslateY,
                    },

                    {
                      scale:
                        wordScale,
                    },
                  ],
                },
              ]}
            >
              {letters.map(
                (
                  letter,
                  index,
                ) => {
                  const start =
                    index / letters.length;

                  const opacity =
                    word.interpolate({
                      inputRange: [
                        0,
                        Math.max(
                          0.1,
                          start,
                        ),
                        Math.min(
                          1,
                          start + 0.25,
                        ),
                        1,
                      ],
                      outputRange: [
                        0,
                        0,
                        1,
                        1,
                      ],
                    });

                  return (
                    <Animated.Text
                      key={`${letter}-${index}-${playKey}`}
                      style={[
                        styles.wordmarkChar,
                        {
                          opacity,

                          transform: [
                            {
                              translateY:
                                word.interpolate({
                                  inputRange: [
                                    0,
                                    0.55,
                                    0.75,
                                    1,
                                  ],
                                  outputRange: [
                                    48,
                                    -8,
                                    3,
                                    0,
                                  ],
                                }),
                            },

                            {
                              scale:
                                word.interpolate({
                                  inputRange: [
                                    0,
                                    0.55,
                                    0.75,
                                    1,
                                  ],
                                  outputRange: [
                                    0.45,
                                    1.08,
                                    0.96,
                                    1,
                                  ],
                                }),
                            },
                          ],
                        },
                      ]}
                    >
                      {letter}
                    </Animated.Text>
                  );
                },
              )}
            </Animated.View>

            {/* ===========================================
                SHIMMER
            =========================================== */}

            <Animated.View
              pointerEvents="none"
              style={[
                styles.shine,
                {
                  opacity:
                    shineOpacity,

                  transform: [
                    {
                      translateX:
                        shineTranslate,
                    },
                  ],
                },
              ]}
            >
              {letters.map(
                (
                  letter,
                  index,
                ) => (
                  <Text
                    key={`shine-${index}`}
                    style={
                      styles.shineChar
                    }
                  >
                    {letter}
                  </Text>
                ),
              )}
            </Animated.View>

            {/* ===========================================
                MASCOT
            =========================================== */}

            <Mascot
              progress={mascot}
              blink={mascotBlink}
              blush={mascotBlush}
              wave={mascotWave}
              bob={mascotBob}
            />

            {/* ===========================================
                SIX SPARKLES
            =========================================== */}

            <Sparkle
              style={styles.sparkle1}
              opacity={sparkleMaster}
              scale={sparkleMaster.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [0, 1.15, 1],
              })}
              rotate={sparkleMaster.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [
                  '-60deg',
                  '8deg',
                  '0deg',
                ],
              })}
            />

            <Sparkle
              style={styles.sparkle2}
              opacity={sparkleMaster}
              scale={sparkleMaster.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [0, 1.15, 1],
              })}
              rotate={sparkleMaster.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [
                  '-60deg',
                  '8deg',
                  '0deg',
                ],
              })}
            />

            <Sparkle
              style={styles.sparkle3}
              opacity={sparkleMaster}
              scale={sparkleMaster.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [0, 1.15, 1],
              })}
              rotate={sparkleMaster.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [
                  '-60deg',
                  '8deg',
                  '0deg',
                ],
              })}
            />

            <Sparkle
              style={styles.sparkle4}
              opacity={sparkleMaster}
              scale={sparkleMaster.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [0, 1.15, 1],
              })}
              rotate={sparkleMaster.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [
                  '-60deg',
                  '8deg',
                  '0deg',
                ],
              })}
            />

            <Sparkle
              style={styles.sparkle5}
              opacity={sparkleMaster}
              scale={sparkleMaster.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [0, 1.15, 1],
              })}
              rotate={sparkleMaster.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [
                  '-60deg',
                  '8deg',
                  '0deg',
                ],
              })}
            />

            <Sparkle
              style={styles.sparkle6}
              opacity={sparkleMaster}
              scale={sparkleMaster.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [0, 1.15, 1],
              })}
              rotate={sparkleMaster.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [
                  '-60deg',
                  '8deg',
                  '0deg',
                ],
              })}
            />

          </View>

          {/* =============================================
              DIVIDER
          ============================================= */}

          <Animated.View
            style={[
              styles.divider,
              {
                transform: [
                  {
                    scaleX:
                      dividerScale,
                  },
                ],
              },
            ]}
          />

          {/* =============================================
              TAGLINE
          ============================================= */}

          <Animated.Text
            style={[
              styles.tagline,
              {
                opacity: tagline,

                transform: [
                  {
                    translateY: taglineY,
                  },

                  {
                    scale:
                      tagline.interpolate({
                        inputRange: [
                          0,
                          0.6,
                          1,
                        ],
                        outputRange: [
                          0.85,
                          1.05,
                          1,
                        ],
                      }),
                  },
                ],
              },
            ]}
          >
            Mind, beautifully calibrated.
          </Animated.Text>

        </View>

        {/* ===============================================
            BOTTOM STATUS
        =============================================== */}

        <Animated.View
          style={[
            styles.statusBar,
            {
              opacity: status,

              paddingBottom:
                Math.max(
                  18,
                  insets.bottom + 18,
                ),
            },
          ]}
        >

          <View style={styles.statusDot} />

          <Text style={styles.statusCore}>
            IPS CORE
          </Text>

          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width:
                    loading.interpolate({
                      inputRange: [
                        0,
                        1,
                      ],
                      outputRange: [
                        '0%',
                        '100%',
                      ],
                    }),
                },
              ]}
            />
          </View>

          <Text style={styles.statusLabel}>
            {LABELS[statusIndex]}
          </Text>

        </Animated.View>

        {/* ===============================================
            REPLAY
        =============================================== */}

        {showReplay && (
          <Pressable
            onPress={replay}
            accessibilityRole="button"
            accessibilityLabel="Replay animation"
            style={({ pressed }) => [
              styles.replay,
              pressed &&
                styles.replayPressed,
            ]}
          >
            <Svg
              viewBox="0 0 12 12"
              width={12}
              height={12}
              fill="none"
            >
              <Path
                d="
                  M6 1.5
                  A4.5 4.5 0 1 0
                  10.28 4.8
                  M6 1.5V.6
                  M6 1.5H6.9
                "
                stroke={COLORS.fg}
                strokeWidth={1.3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>

            <Text style={styles.replayText}>
              Replay
            </Text>
          </Pressable>
        )}

      </SafeAreaView>
    </Animated.View>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({

  /* ---------------------------------------------
     Stage
  --------------------------------------------- */

  stage: {
    position: 'relative',

    flex: 1,

    width: '100%',

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

  /* ---------------------------------------------
     Grain
  --------------------------------------------- */

  grain: {
    ...StyleSheet.absoluteFillObject,

    opacity: 0.32,

    zIndex: 0,
  },

  /* ---------------------------------------------
     Vignette
  --------------------------------------------- */

  vignette: {
    ...StyleSheet.absoluteFillObject,

    zIndex: 1,

    backgroundColor:
      'rgba(0,0,0,0.13)',
  },

  /* ---------------------------------------------
     Clouds
  --------------------------------------------- */

  cloud: {
    position: 'absolute',

    left: 0,

    zIndex: 2,

    pointerEvents: 'none',

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

  /* ---------------------------------------------
     Lockup
  --------------------------------------------- */

  lockup: {
    position: 'relative',

    zIndex: 5,

    alignItems: 'center',

    paddingHorizontal: 28,
  },

  /* ---------------------------------------------
     IPS
  --------------------------------------------- */

  brandEyebrow: {
    fontFamily:
      'JetBrainsMono_500Medium',

    fontSize: 12,

    letterSpacing: 3.6,

    color: COLORS.muted,

    textTransform: 'uppercase',

    marginBottom: 30,
  },

  /* ---------------------------------------------
     Mark
  --------------------------------------------- */

  markWrap: {
    position: 'relative',

    width: 170,

    height: 170,

    alignItems: 'center',

    justifyContent: 'center',
  },

  markGlow: {
    position: 'absolute',

    width: 250,

    height: 250,

    borderRadius: 999,

    backgroundColor:
      'rgba(161,100,214,0.32)',
  },

  ripple: {
    position: 'absolute',

    width: 150,

    height: 150,

    borderRadius: 999,

    borderWidth: 1,

    borderColor:
      'rgba(210,180,245,0.4)',
  },

  ripple2: {
    borderColor:
      'rgba(210,180,245,0.28)',
  },

  /* ---------------------------------------------
     Wordmark
  --------------------------------------------- */

  wordmarkWrap: {
    position: 'relative',

    marginTop: 26,

    alignItems: 'center',

    overflow: 'visible',
  },

  wordmark: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',
  },

  wordmarkChar: {
    fontFamily:
      'Sora_700Bold',

    fontSize: 58,

    lineHeight: 66,

    color: COLORS.fg,

    letterSpacing: -1.15,
  },

  /* ---------------------------------------------
     Shine
  --------------------------------------------- */

  shine: {
    position: 'absolute',

    top: 0,

    bottom: 0,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'center',

    overflow: 'hidden',
  },

  shineChar: {
    fontFamily:
      'Sora_700Bold',

    fontSize: 58,

    lineHeight: 66,

    color:
      'rgba(255,255,255,0.92)',

    letterSpacing: -1.15,

    textShadowColor:
      'rgba(218,190,255,0.85)',

    textShadowRadius: 8,

    textShadowOffset: {
      width: 0,
      height: 0,
    },
  },

  /* ---------------------------------------------
     Mascot
  --------------------------------------------- */

  mascot: {
    position: 'absolute',

    top: -40,

    left: '50%',

    zIndex: 10,

    width: 50,

    height: 50,

    shadowColor: '#120820',

    shadowOpacity: 0.45,

    shadowRadius: 14,

    shadowOffset: {
      width: 0,
      height: 10,
    },

    elevation: 8,
  },

  /* ---------------------------------------------
     Sparkles
  --------------------------------------------- */

  sparkle: {
    position: 'absolute',

    zIndex: 8,

    pointerEvents: 'none',

    width: 16,

    height: 16,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'transparent',

    overflow: 'visible',

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

  /* ---------------------------------------------
     Divider
  --------------------------------------------- */

  divider: {
    width: 150,

    height: 1,

    marginTop: 20,

    marginBottom: 16,

    backgroundColor:
      'rgba(255,255,255,0.1)',
  },

  /* ---------------------------------------------
     Tagline
  --------------------------------------------- */

  tagline: {
    fontFamily:
      'Inter_600SemiBold',

    fontSize: 15,

    letterSpacing: 0.15,

    color: COLORS.muted,
  },

  /* ---------------------------------------------
     Status
  --------------------------------------------- */

  statusBar: {
    position: 'absolute',

    left: 0,

    right: 0,

    bottom: 0,

    zIndex: 20,

    flexDirection: 'row',

    alignItems: 'center',

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

    shadowOpacity: 0.9,

    shadowRadius: 8,

    shadowOffset: {
      width: 0,
      height: 0,
    },
  },

  statusCore: {
    fontFamily:
      'JetBrainsMono_500Medium',

    fontSize: 10.5,

    letterSpacing: 1.25,

    color: COLORS.muted,

    textTransform: 'uppercase',
  },

  progressTrack: {
    flex: 1,

    height: 2,

    borderRadius: 2,

    overflow: 'hidden',

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

    textAlign: 'right',

    fontFamily:
      'JetBrainsMono_500Medium',

    fontSize: 10.5,

    letterSpacing: 1.25,

    color: COLORS.muted,

    textTransform: 'uppercase',
  },

  /* ---------------------------------------------
     Replay
  --------------------------------------------- */

  replay: {
    position: 'absolute',

    zIndex: 30,

    bottom: 72,

    left: '50%',

    marginLeft: -55,

    flexDirection: 'row',

    alignItems: 'center',

    gap: 8,

    paddingVertical: 10,

    paddingHorizontal: 18,

    borderRadius: 999,

    backgroundColor:
      'rgba(255,255,255,0.04)',

    borderWidth: 1,

    borderColor:
      COLORS.border,
  },

  replayPressed: {
    backgroundColor:
      'rgba(255,255,255,0.12)',
  },

  replayText: {
    fontFamily:
      'Inter_500Medium',

    fontSize: 11,

    letterSpacing: 1.5,

    color: COLORS.fg,

    textTransform: 'uppercase',
  },
});

export default SplashScreen;