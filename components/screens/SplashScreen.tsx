import React, {
  useCallback,
  useEffect,
  useRef,
} from 'react';

import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
  I18nManager,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { AppText as Text } from '../ui/AppText';

import { LinearGradient } from 'expo-linear-gradient';

/* ================================================================
   COLORS
================================================================ */

const COLORS = {
  bgTop: '#30203F',
  bg: '#24152F',
  bgMiddle: '#1D1328',
  bgBottom: '#100B17',

  fg: '#F6F0FA',
  muted: '#B9ACBF',

  accent: '#CFA8F2',
  accentHi: '#E9DDF5',
  accentSoft: '#A96FE0',

  star: '#E8D7F7',
};

/* ================================================================
   TEXT
================================================================ */

const FIRST_WORD = 'IPS';

const FIRST_SUBTITLE_EN =
  'Iliya Pardazesh Shargh';

const FIRST_SUBTITLE_FA =
  'ایلیا پردازش شرق';

const SECOND_WORD_EN =
  'Neurolia';

const SECOND_WORD_FA =
  'نورولیا';

const SECOND_TAGLINE_EN =
  'Mind, beautifully calibrated.';

const SECOND_TAGLINE_FA =
  'ذهن، با ظرافت تنظیم‌شده.';

/* ================================================================
   TIMING

   Sequence:

   0
   │
   ├── First logo enters
   ├── IPS enters
   ├── First subtitle enters
   │
   ├── pause
   │
   ├── First logo exits
   ├── IPS exits
   ├── First subtitle exits
   │
   ├── transition gap
   │
   ├── Second logo enters
   ├── Neurolia enters
   └── tagline enters
================================================================ */

const TIMING = {
  /* ---------------- FIRST BRAND ---------------- */

  FIRST_LOGO_IN: 650,

  FIRST_WORD_DELAY: 150,
  FIRST_WORD_IN: 460,

  FIRST_SUBTITLE_DELAY: 270,
  FIRST_SUBTITLE_IN: 500,

  /* Start of complete first-brand exit */
  FIRST_OUT_START: 1750,

  FIRST_LOGO_OUT: 500,
  FIRST_WORD_OUT: 400,
  FIRST_SUBTITLE_OUT: 400,

  /* Gap between first exit and second entrance */
  SECOND_START: 2380,

  /* ---------------- SECOND BRAND ---------------- */

  SECOND_LOGO_IN: 650,

  SECOND_WORD_DELAY: 180,
  SECOND_WORD_STAGGER: 55,
  SECOND_WORD_IN: 460,

  SECOND_TAGLINE_DELAY: 430,
  SECOND_TAGLINE_IN: 520,

  /* ---------------- COMPLETE ---------------- */

  COMPLETE: 4250,
};

/* ================================================================
   EASING
================================================================ */

const EASE_ENTER = Easing.bezier(
  0.22,
  1,
  0.36,
  1
);

const EASE_EXIT = Easing.bezier(
  0.55,
  0,
  0.78,
  0
);

/* ================================================================
   SPARK CONFIG
================================================================ */

type SparkConfig = {
  top?: `${number}%`;
  bottom?: `${number}%`;
  left?: `${number}%`;
  right?: `${number}%`;

  size: number;
  delay: number;
  duration: number;
  opacity: number;
};

const SPARKS: SparkConfig[] = [
  {
    top: '20%',
    left: '17%',
    size: 15,
    delay: 350,
    duration: 2600,
    opacity: 0.42,
  },
  {
    top: '29%',
    right: '16%',
    size: 10,
    delay: 850,
    duration: 2900,
    opacity: 0.32,
  },
  {
    bottom: '27%',
    left: '23%',
    size: 12,
    delay: 1050,
    duration: 2500,
    opacity: 0.36,
  },
  {
    bottom: '23%',
    right: '20%',
    size: 14,
    delay: 700,
    duration: 2800,
    opacity: 0.4,
  },
  {
    top: '49%',
    left: '9%',
    size: 9,
    delay: 1250,
    duration: 3100,
    opacity: 0.28,
  },
  {
    top: '39%',
    right: '8%',
    size: 7,
    delay: 1550,
    duration: 3200,
    opacity: 0.24,
  },
];

/* ================================================================
   PROPS
================================================================ */

export interface SplashScreenProps {
  onComplete?: () => void;

  logo1?: ImageSourcePropType;
  logo2?: ImageSourcePropType;
}

/* ================================================================
   HELPERS
================================================================ */

function createAnimatedValue(value = 0) {
  return new Animated.Value(value);
}

/* ================================================================
   SPARKLE
================================================================ */

function Sparkle({
  config,
  animation,
}: {
  config: SparkConfig;
  animation: Animated.Value;
}) {
  const opacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      0,
      config.opacity,
      0,
    ],
  });

  const translateY = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [4, -4, 4],
  });

  const scale = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.75, 1, 0.75],
  });

  return (
    <Animated.Text
      pointerEvents="none"
      style={[
        styles.spark,
        {
          top: config.top,
          bottom: config.bottom,
          left: config.left,
          right: config.right,
          fontSize: config.size,
          opacity,
          transform: [
            {
              translateY,
            },
            {
              scale,
            },
          ],
        },
      ]}
    >
      ✦
    </Animated.Text>
  );
}

/* ================================================================
   FIRST BRAND
================================================================ */

function FirstBrand({
  logo,
  logoLife,
  letterLives,
  subtitleLife,
  isRTL,
}: {
  logo: ImageSourcePropType;

  logoLife: Animated.Value;
  letterLives: Animated.Value[];
  subtitleLife: Animated.Value;

  isRTL: boolean;
}) {
  /* --------------------------------------------------------------
     LOGO

     0 = hidden
     1 = visible
     2 = exited
  -------------------------------------------------------------- */

  const logoOpacity =
    logoLife.interpolate({
      inputRange: [0, 0.35, 1, 1.65, 2],
      outputRange: [0, 0.8, 1, 0.8, 0],
    });

  const logoTranslateY =
    logoLife.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [24, 0, -26],
    });

  const logoScale =
    logoLife.interpolate({
      inputRange: [0, 0.45, 1, 2],
      outputRange: [0.88, 1.015, 1, 0.96],
    });

  /* --------------------------------------------------------------
     SUBTITLE
  -------------------------------------------------------------- */

  const subtitleOpacity =
    subtitleLife.interpolate({
      inputRange: [0, 0.35, 1, 1.7, 2],
      outputRange: [0, 0.75, 1, 0.75, 0],
    });

  const subtitleTranslateY =
    subtitleLife.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [12, 0, -14],
    });

  const subtitleScale =
    subtitleLife.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [0.96, 1, 0.98],
    });

  const subtitle =
    isRTL
      ? FIRST_SUBTITLE_FA
      : FIRST_SUBTITLE_EN;

  return (
    <View
      pointerEvents="none"
      style={styles.brandLayer}
    >
      {/* ==========================================================
          FIRST LOGO
      ========================================================== */}

      <Animated.View
        style={[
          styles.firstLogoContainer,
          {
            opacity: logoOpacity,
            transform: [
              {
                translateY: logoTranslateY,
              },
              {
                scale: logoScale,
              },
            ],
          },
        ]}
      >
        <Image
          source={logo}
          resizeMode="contain"
          style={styles.firstLogo}
        />
      </Animated.View>

      {/* ==========================================================
          IPS
      ========================================================== */}

      <View
        style={[
          styles.firstWordmark,
          isRTL && styles.rtlWordmark,
        ]}
      >
        {FIRST_WORD.split('').map(
          (letter, index) => {
            const life =
              letterLives[index];

            const opacity =
              life.interpolate({
                inputRange: [
                  0,
                  0.35,
                  1,
                  1.7,
                  2,
                ],
                outputRange: [
                  0,
                  0.75,
                  1,
                  0.7,
                  0,
                ],
              });

            const translateY =
              life.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [
                  14,
                  0,
                  -14,
                ],
              });

            const scale =
              life.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [
                  0.94,
                  1,
                  0.98,
                ],
              });

            return (
              <Animated.Text
                key={`${letter}-${index}`}
                style={[
                  styles.firstWordLetter,
                  {
                    opacity,
                    transform: [
                      {
                        translateY,
                      },
                      {
                        scale,
                      },
                    ],
                  },
                ]}
              >
                {letter}
              </Animated.Text>
            );
          }
        )}
      </View>

      {/* ==========================================================
          FIRST SUBTITLE
      ========================================================== */}

      <Animated.Text
        style={[
          styles.firstSubtitle,

          isRTL &&
            styles.persianFirstSubtitle,

          {
            opacity:
              subtitleOpacity,

            transform: [
              {
                translateY:
                  subtitleTranslateY,
              },
              {
                scale:
                  subtitleScale,
              },
            ],
          },
        ]}
      >
        {subtitle}
      </Animated.Text>
    </View>
  );
}

/* ================================================================
   SECOND BRAND
================================================================ */

function SecondBrand({
  logo,
  logoProgress,
  letterProgresses,
  taglineProgress,
  isRTL,
}: {
  logo: ImageSourcePropType;

  logoProgress: Animated.Value;
  letterProgresses: Animated.Value[];
  taglineProgress: Animated.Value;

  isRTL: boolean;
}) {
  /* --------------------------------------------------------------
     SECOND LOGO
  -------------------------------------------------------------- */

  const logoOpacity =
    logoProgress.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0.75, 1],
    });

  const logoTranslateY =
    logoProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [22, 0],
    });

  const logoScale =
    logoProgress.interpolate({
      inputRange: [0, 0.45, 1],
      outputRange: [
        0.88,
        1.015,
        1,
      ],
    });

  /* --------------------------------------------------------------
     TAGLINE
  -------------------------------------------------------------- */

  const taglineOpacity =
    taglineProgress.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0, 0.8, 1],
    });

  const taglineTranslateY =
    taglineProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [11, 0],
    });

  const secondWord =
    isRTL
      ? SECOND_WORD_FA
      : SECOND_WORD_EN;

  const tagline =
    isRTL
      ? SECOND_TAGLINE_FA
      : SECOND_TAGLINE_EN;

  return (
    <View
      pointerEvents="none"
      style={styles.brandLayer}
    >
      {/* ==========================================================
          SECOND LOGO

          Important:
          No circle
          No border
          No glow
          No background
      ========================================================== */}

      <Animated.View
        style={[
          styles.secondLogoContainer,
          {
            opacity: logoOpacity,

            transform: [
              {
                translateY:
                  logoTranslateY,
              },
              {
                scale:
                  logoScale,
              },
            ],
          },
        ]}
      >
        <Image
          source={logo}
          resizeMode="contain"
          style={styles.secondLogo}
        />
      </Animated.View>

      {/* ==========================================================
          SECOND WORD
      ========================================================== */}

      <View
        style={[
          styles.secondWordmark,
          isRTL &&
            styles.rtlWordmark,
        ]}
      >
        {secondWord
          .split('')
          .map(
            (
              letter,
              index
            ) => {
              const progress =
                letterProgresses[
                  index
                ];

              const opacity =
                progress.interpolate({
                  inputRange: [
                    0,
                    0.35,
                    1,
                  ],
                  outputRange: [
                    0,
                    0.75,
                    1,
                  ],
                });

              const translateY =
                progress.interpolate({
                  inputRange: [
                    0,
                    1,
                  ],
                  outputRange: [
                    14,
                    0,
                  ],
                });

              const scale =
                progress.interpolate({
                  inputRange: [
                    0,
                    1,
                  ],
                  outputRange: [
                    0.95,
                    1,
                  ],
                });

              return (
                <Animated.Text
                  key={`${letter}-${index}`}
                  style={[
                    styles.secondWordLetter,

                    isRTL &&
                      styles.persianWordLetter,

                    {
                      opacity,

                      transform: [
                        {
                          translateY,
                        },
                        {
                          scale,
                        },
                      ],
                    },
                  ]}
                >
                  {letter}
                </Animated.Text>
              );
            }
          )}
      </View>

      {/* ==========================================================
          TAGLINE
      ========================================================== */}

      <Animated.Text
        style={[
          styles.tagline,

          isRTL &&
            styles.persianTagline,

          {
            opacity:
              taglineOpacity,

            transform: [
              {
                translateY:
                  taglineTranslateY,
              },
            ],
          },
        ]}
      >
        {tagline}
      </Animated.Text>
    </View>
  );
}

/* ================================================================
   SPLASH SCREEN
================================================================ */

export function SplashScreen({
  onComplete,

  logo1 = require('../../assets/logo1.png'),
  logo2 = require('../../assets/logo2.png'),
}: SplashScreenProps) {
  const {
    width,
    height,
  } = useWindowDimensions();

  const isRTL =
    I18nManager.isRTL;

  const reduceMotion =
    useRef(false);

  const timers =
    useRef<
      ReturnType<
        typeof setTimeout
      >[]
    >([]);

  const completed =
    useRef(false);

  /* ==============================================================
     ANIMATED VALUES
  ============================================================== */

  const backgroundProgress =
    useRef(
      createAnimatedValue(0)
    ).current;

  /* ---------------- FIRST BRAND ---------------- */

  const firstLogoLife =
    useRef(
      createAnimatedValue(0)
    ).current;

  const firstLetterLives =
    useRef(
      FIRST_WORD
        .split('')
        .map(() =>
          createAnimatedValue(0)
        )
    ).current;

  const firstSubtitleLife =
    useRef(
      createAnimatedValue(0)
    ).current;

  /* ---------------- SECOND BRAND ---------------- */

  const secondLogoProgress =
    useRef(
      createAnimatedValue(0)
    ).current;

  const secondWordLength =
    isRTL
      ? SECOND_WORD_FA.length
      : SECOND_WORD_EN.length;

  const secondLetterProgresses =
    useRef(
      Array.from(
        {
          length:
            secondWordLength,
        },
        () =>
          createAnimatedValue(0)
      )
    ).current;

  const secondTaglineProgress =
    useRef(
      createAnimatedValue(0)
    ).current;

  /* ---------------- SPARKS ---------------- */

  const sparkValues =
    useRef(
      SPARKS.map(() =>
        createAnimatedValue(0)
      )
    ).current;

  /* ==============================================================
     CLEAR TIMERS
  ============================================================== */

  const clearTimers =
    useCallback(() => {
      timers.current.forEach(
        timer =>
          clearTimeout(timer)
      );

      timers.current = [];
    }, []);

  /* ==============================================================
     FINISH
  ============================================================== */

  const finish =
    useCallback(() => {
      if (completed.current) {
        return;
      }

      completed.current = true;

      onComplete?.();
    }, [onComplete]);

  /* ==============================================================
     PLAY ANIMATION
  ============================================================== */

  const play =
    useCallback(() => {
      clearTimers();

      completed.current = false;

      const d =
        reduceMotion.current
          ? 0.001
          : 1;

      /* ==========================================================
         RESET
      ========================================================== */

      backgroundProgress.setValue(0);

      firstLogoLife.setValue(0);

      firstLetterLives.forEach(
        value =>
          value.setValue(0)
      );

      firstSubtitleLife.setValue(0);

      secondLogoProgress.setValue(0);

      secondLetterProgresses.forEach(
        value =>
          value.setValue(0)
      );

      secondTaglineProgress.setValue(
        0
      );

      sparkValues.forEach(
        value =>
          value.setValue(0)
      );

      /* ==========================================================
         BACKGROUND
      ========================================================== */

      Animated.timing(
        backgroundProgress,
        {
          toValue: 1,

          duration:
            700 * d,

          easing:
            Easing.out(
              Easing.quad
            ),

          useNativeDriver: true,
        }
      ).start();

      /* ==========================================================
         SPARKLES
      ========================================================== */

      SPARKS.forEach(
        (
          spark,
          index
        ) => {
          const timer =
            setTimeout(
              () => {
                Animated.loop(
                  Animated.sequence([
                    Animated.timing(
                      sparkValues[
                        index
                      ],
                      {
                        toValue: 1,

                        duration:
                          spark.duration *
                          d,

                        easing:
                          Easing.inOut(
                            Easing.sin
                          ),

                        useNativeDriver:
                          true,
                      }
                    ),

                    Animated.timing(
                      sparkValues[
                        index
                      ],
                      {
                        toValue: 0,

                        duration:
                          spark.duration *
                          d,

                        easing:
                          Easing.inOut(
                            Easing.sin
                          ),

                        useNativeDriver:
                          true,
                      }
                    ),
                  ])
                ).start();
              },

              spark.delay * d
            );

          timers.current.push(
            timer
          );
        }
      );

      /* ==========================================================
         FIRST BRAND — LOGO IN
      ========================================================== */

      Animated.timing(
        firstLogoLife,
        {
          toValue: 1,

          duration:
            TIMING.FIRST_LOGO_IN *
            d,

          easing:
            EASE_ENTER,

          useNativeDriver: true,
        }
      ).start();

      /* ==========================================================
         FIRST BRAND — IPS IN
      ========================================================== */

      firstLetterLives.forEach(
        (
          value,
          index
        ) => {
          Animated.timing(
            value,
            {
              toValue: 1,

              duration:
                TIMING.FIRST_WORD_IN *
                d,

              delay:
                (
                  TIMING.FIRST_WORD_DELAY +
                  index * 60
                ) * d,

              easing:
                EASE_ENTER,

              useNativeDriver: true,
            }
          ).start();
        }
      );

      /* ==========================================================
         FIRST BRAND — SUBTITLE IN
      ========================================================== */

      Animated.timing(
        firstSubtitleLife,
        {
          toValue: 1,

          duration:
            TIMING.FIRST_SUBTITLE_IN *
            d,

          delay:
            TIMING.FIRST_SUBTITLE_DELAY *
            d,

          easing:
            EASE_ENTER,

          useNativeDriver: true,
        }
      ).start();

      /* ==========================================================
         FIRST BRAND — EXIT

         مهم:
         همه اجزای برند اول اینجا با هم خارج می‌شوند.
         بنابراین دیگر هیچ چیزی از برند اول زیر لوگوی دوم
         باقی نمی‌ماند.
      ========================================================== */

      timers.current.push(
        setTimeout(
          () => {
            /* ---------------- LOGO OUT ---------------- */

            const logoExit =
              Animated.timing(
                firstLogoLife,
                {
                  toValue: 2,

                  duration:
                    TIMING.FIRST_LOGO_OUT *
                    d,

                  easing:
                    EASE_EXIT,

                  useNativeDriver: true,
                }
              );

            /* ---------------- IPS OUT ---------------- */

            const wordExit =
              Animated.parallel(
                firstLetterLives.map(
                  (
                    value,
                    index
                  ) =>
                    Animated.timing(
                      value,
                      {
                        toValue: 2,

                        duration:
                          TIMING.FIRST_WORD_OUT *
                          d,

                        delay:
                          index * 28 * d,

                        easing:
                          EASE_EXIT,

                        useNativeDriver:
                          true,
                      }
                    )
                )
              );

            /* ---------------- SUBTITLE OUT ---------------- */

            const subtitleExit =
              Animated.timing(
                firstSubtitleLife,
                {
                  toValue: 2,

                  duration:
                    TIMING.FIRST_SUBTITLE_OUT *
                    d,

                  delay:
                    30 * d,

                  easing:
                    EASE_EXIT,

                  useNativeDriver: true,
                }
              );

            /* ====================================================
               RUN ALL FIRST-BRAND EXITS TOGETHER
            ==================================================== */

            Animated.parallel([
              logoExit,
              wordExit,
              subtitleExit,
            ]).start();
          },

          TIMING.FIRST_OUT_START *
            d
        )
      );

      /* ==========================================================
         SECOND BRAND

         شروع دوم عمداً بعد از پایان خروج اول است.
         این قسمت مهم‌ترین اصلاح است.
      ========================================================== */

      timers.current.push(
        setTimeout(
          () => {
            /* ====================================================
               SECOND LOGO IN
            ==================================================== */

            Animated.timing(
              secondLogoProgress,
              {
                toValue: 1,

                duration:
                  TIMING.SECOND_LOGO_IN *
                  d,

                easing:
                  EASE_ENTER,

                useNativeDriver:
                  true,
              }
            ).start();

            /* ====================================================
               SECOND WORD IN
            ==================================================== */

            secondLetterProgresses.forEach(
              (
                value,
                index
              ) => {
                Animated.timing(
                  value,
                  {
                    toValue: 1,

                    duration:
                      TIMING.SECOND_WORD_IN *
                      d,

                    delay:
                      (
                        TIMING.SECOND_WORD_DELAY +
                        index *
                          TIMING.SECOND_WORD_STAGGER
                      ) * d,

                    easing:
                      EASE_ENTER,

                    useNativeDriver:
                      true,
                  }
                ).start();
              }
            );

            /* ====================================================
               TAGLINE IN
            ==================================================== */

            Animated.timing(
              secondTaglineProgress,
              {
                toValue: 1,

                duration:
                  TIMING.SECOND_TAGLINE_IN *
                  d,

                delay:
                  TIMING.SECOND_TAGLINE_DELAY *
                  d,

                easing:
                  EASE_ENTER,

                useNativeDriver:
                  true,
              }
            ).start();
          },

          TIMING.SECOND_START * d
        )
      );

      /* ==========================================================
         COMPLETE
      ========================================================== */

      timers.current.push(
        setTimeout(
          finish,
          TIMING.COMPLETE * d
        )
      );
    }, [
      backgroundProgress,
      clearTimers,
      finish,

      firstLetterLives,
      firstLogoLife,
      firstSubtitleLife,

      secondLetterProgresses,
      secondLogoProgress,
      secondTaglineProgress,

      sparkValues,
    ]);

  /* ==============================================================
     ACCESSIBILITY / REDUCED MOTION
  ============================================================== */

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo
      .isReduceMotionEnabled?.()
      .then(enabled => {
        if (!mounted) {
          return;
        }

        reduceMotion.current =
          Boolean(enabled);

        play();
      })
      .catch(() => {
        if (mounted) {
          play();
        }
      });

    return () => {
      mounted = false;

      clearTimers();

      sparkValues.forEach(
        value =>
          value.stopAnimation()
      );

      firstLogoLife.stopAnimation();

      firstLetterLives.forEach(
        value =>
          value.stopAnimation()
      );

      firstSubtitleLife.stopAnimation();

      secondLogoProgress.stopAnimation();

      secondLetterProgresses.forEach(
        value =>
          value.stopAnimation()
      );

      secondTaglineProgress.stopAnimation();
    };
  }, [
    clearTimers,
    play,
    sparkValues,
    firstLogoLife,
    firstLetterLives,
    firstSubtitleLife,
    secondLogoProgress,
    secondLetterProgresses,
    secondTaglineProgress,
  ]);

  /* ==============================================================
     BACKGROUND
  ============================================================== */

  const backgroundOpacity =
    backgroundProgress.interpolate({
      inputRange: [0, 1],

      outputRange: [0, 1],
    });

  /* ==============================================================
     RENDER
  ============================================================== */

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
        },
      ]}
    >
      {/* ==========================================================
          FULL SCREEN GRADIENT
      ========================================================== */}

      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            opacity:
              backgroundOpacity,
          },
        ]}
      >
        <LinearGradient
          colors={[
            COLORS.bgTop,
            COLORS.bg,
            COLORS.bgMiddle,
            COLORS.bgBottom,
          ]}
          locations={[
            0,
            0.36,
            0.68,
            1,
          ]}
          start={{
            x: 0.15,
            y: 0,
          }}
          end={{
            x: 0.85,
            y: 1,
          }}
          style={
            StyleSheet.absoluteFillObject
          }
        />
      </Animated.View>

      {/* ==========================================================
          VERY SUBTLE TOP LIGHT

          Not a circle.
          Not a border.
          Not an animated background.
      ========================================================== */}

      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(207,168,242,0.075)',
          'rgba(207,168,242,0.015)',
          'rgba(207,168,242,0)',
        ]}
        locations={[
          0,
          0.38,
          1,
        ]}
        start={{
          x: 0.5,
          y: 0,
        }}
        end={{
          x: 0.5,
          y: 1,
        }}
        style={
          StyleSheet.absoluteFillObject
        }
      />

      {/* ==========================================================
          SPARKLES
      ========================================================== */}

      {SPARKS.map(
        (
          spark,
          index
        ) => (
          <Sparkle
            key={index}
            config={spark}
            animation={
              sparkValues[index]
            }
          />
        )
      )}

      {/* ==========================================================
          FIRST BRAND
      ========================================================== */}

      <FirstBrand
        logo={logo1}
        logoLife={
          firstLogoLife
        }
        letterLives={
          firstLetterLives
        }
        subtitleLife={
          firstSubtitleLife
        }
        isRTL={isRTL}
      />

      {/* ==========================================================
          SECOND BRAND
      ========================================================== */}

      <SecondBrand
        logo={logo2}
        logoProgress={
          secondLogoProgress
        }
        letterProgresses={
          secondLetterProgresses
        }
        taglineProgress={
          secondTaglineProgress
        }
        isRTL={isRTL}
      />
    </View>
  );
}

/* ================================================================
   STYLES
================================================================ */

const styles = StyleSheet.create({
  /* ==============================================================
     CONTAINER
  ============================================================== */

  container: {
    flex: 1,

    backgroundColor:
      COLORS.bgBottom,

    alignItems: 'center',

    justifyContent:
      'center',

    overflow: 'hidden',
  },

  /* ==============================================================
     SPARK
  ============================================================== */

  spark: {
    position: 'absolute',

    color:
      COLORS.star,

    fontWeight: '300',

    includeFontPadding:
      false,

    textShadowColor:
      'rgba(195,155,239,0.45)',

    textShadowOffset: {
      width: 0,
      height: 0,
    },

    textShadowRadius: 5,
  },

  /* ==============================================================
     BRAND LAYER
  ============================================================== */

  brandLayer: {
    position: 'absolute',

    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    alignItems:
      'center',

    justifyContent:
      'center',
  },

  /* ==============================================================
     FIRST LOGO
  ============================================================== */

  firstLogoContainer: {
    width: 132,
    height: 132,

    alignItems:
      'center',

    justifyContent:
      'center',
  },

  firstLogo: {
    width: 116,
    height: 116,

    overflow:
      'hidden',
  },

  /* ==============================================================
     FIRST WORD
  ============================================================== */

  firstWordmark: {
    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'center',

    marginTop: 17,
  },

  rtlWordmark: {
    flexDirection:
      'row-reverse',
  },

  firstWordLetter: {
    color:
      COLORS.fg,

    fontSize: 50,

    lineHeight: 55,

    fontWeight:
      '800',

    letterSpacing: 7,

    includeFontPadding:
      false,
  },

  /* ==============================================================
     FIRST SUBTITLE
  ============================================================== */

  firstSubtitle: {
    marginTop: 10,

    color:
      COLORS.accentHi,

    fontSize: 12,

    lineHeight: 18,

    fontWeight:
      '600',

    letterSpacing: 1.5,

    textTransform:
      'uppercase',

    textAlign:
      'center',

    includeFontPadding:
      false,
  },

  persianFirstSubtitle: {
    fontSize: 14,

    lineHeight: 22,

    fontWeight:
      '500',

    letterSpacing: 0,

    textTransform:
      'none',

    writingDirection:
      'rtl',
  },

  /* ==============================================================
     SECOND LOGO
  ============================================================== */

  secondLogoContainer: {
    width: 132,
    height: 132,

    alignItems:
      'center',

    justifyContent:
      'center',
  },

  secondLogo: {
    width: 116,
    height: 116,

    overflow:
      'hidden',
  },

  /* ==============================================================
     SECOND WORD
  ============================================================== */

  secondWordmark: {
    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'center',

    marginTop: 18,
  },

  secondWordLetter: {
    color:
      COLORS.fg,

    fontSize: 50,

    lineHeight: 56,

    fontWeight:
      '800',

    letterSpacing: -1,

    includeFontPadding:
      false,
  },

  persianWordLetter: {
    fontSize: 48,

    lineHeight: 57,

    fontWeight:
      '700',

    letterSpacing: 0,

    includeFontPadding:
      false,

    writingDirection:
      'rtl',
  },

  /* ==============================================================
     TAGLINE
  ============================================================== */

  tagline: {
    marginTop: 15,

    color:
      COLORS.muted,

    fontSize: 14,

    lineHeight: 20,

    fontWeight:
      '500',

    letterSpacing: 0.15,

    textAlign:
      'center',

    includeFontPadding:
      false,

    paddingHorizontal: 24,
  },

  persianTagline: {
    marginTop: 14,

    color:
      COLORS.muted,

    fontSize: 15,

    lineHeight: 24,

    fontWeight:
      '500',

    letterSpacing: 0,

    writingDirection:
      'rtl',

    textAlign:
      'center',

    paddingHorizontal: 30,
  },
});

/* ================================================================
   DEFAULT EXPORT
================================================================ */

export default SplashScreen;