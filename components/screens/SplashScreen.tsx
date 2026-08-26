import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  AccessibilityInfo,
  Easing,
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  bgTop: '#2E1A3E',
  bg: '#24142F',
  bgBottom: '#151020',
  fg: '#F3EEF9',
  muted: '#B3A7BE',
  accentHi: '#E6D8F8',
  star: '#E6D8F8',
};

const FIRST_WORD = 'IPS';
const FIRST_SUBTITLE = 'Iliya Pardazesh Shargh';
const SECOND_WORD = 'Norulia';
const SECOND_TAGLINE = 'Mind, beautifully calibrated.';

const TIMING = {
  FIRST_IN: 700,
  FIRST_OUT_START: 1050,
  FIRST_OUT: 500,
  SECOND_START: 1400,
  SECOND_LOGO_IN: 750,
  WORD_STAGGER: 55,
  WORD_IN: 550,
  TAGLINE_DELAY: 350,
  TAGLINE_IN: 600,
  COMPLETE: 3500,
};

const EASE_ENTER = Easing.out(Easing.cubic);
const EASE_EXIT = Easing.in(Easing.cubic);

type SparkConfig = {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
};

const SPARKS: SparkConfig[] = [
  { top: '22%', left: '18%', size: 18, delay: 500, duration: 2600, opacity: 0.5 },
  { top: '30%', right: '17%', size: 12, delay: 900, duration: 2900, opacity: 0.4 },
  { bottom: '28%', left: '24%', size: 14, delay: 1150, duration: 2500, opacity: 0.45 },
  { bottom: '25%', right: '21%', size: 16, delay: 750, duration: 2800, opacity: 0.48 },
  { top: '50%', left: '9%', size: 10, delay: 1350, duration: 3100, opacity: 0.35 },
];

export interface SplashScreenProps {
  onComplete?: () => void;
  logo1?: ImageSourcePropType;
  logo2?: ImageSourcePropType;
}

function createAnimatedValue(value = 0) {
  return new Animated.Value(value);
}

function Sparkle({ config, animation }: { config: SparkConfig; animation: Animated.Value }) {
  const opacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, config.opacity, 0],
  });

  const translateY = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [4, -4, 4],
  });

  const scale = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.7, 1, 0.7],
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
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      ✦
    </Animated.Text>
  );
}

function FirstBrand({
  logo,
  logoLife,
  letterLives,
  subtitleLife,
}: {
  logo: ImageSourcePropType;
  logoLife: Animated.Value;
  letterLives: Animated.Value[];
  subtitleLife: Animated.Value;
}) {
  const logoOpacity = logoLife.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1, 0],
  });

  const logoTranslateY = logoLife.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [14, 0, -14],
  });

  const logoScale = logoLife.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0.94, 1, 0.97],
  });

  const subtitleOpacity = subtitleLife.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1, 0],
  });

  const subtitleTranslateY = subtitleLife.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [8, 0, -8],
  });

  return (
    <View pointerEvents="none" style={styles.brandLayer}>
      <Animated.View
        style={[
          styles.firstLogoContainer,
          { opacity: logoOpacity, transform: [{ translateY: logoTranslateY }, { scale: logoScale }] },
        ]}
      >
        <Image source={logo} resizeMode="contain" style={styles.firstLogo} />
      </Animated.View>

      <View style={styles.firstWordmark}>
        {FIRST_WORD.split('').map((letter, index) => {
          const life = letterLives[index];

          const opacity = life.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [0, 1, 0],
          });

          const translateY = life.interpolate({
            inputRange: [0, 1, 2],
            outputRange: [8, 0, -8],
          });

          return (
            <Animated.Text
              key={letter}
              style={[styles.firstWordLetter, { opacity, transform: [{ translateY }] }]}
            >
              {letter}
            </Animated.Text>
          );
        })}
      </View>

      <Animated.Text
        style={[
          styles.firstSubtitle,
          { opacity: subtitleOpacity, transform: [{ translateY: subtitleTranslateY }] },
        ]}
      >
        {FIRST_SUBTITLE}
      </Animated.Text>
    </View>
  );
}

function SecondBrand({
  logo,
  logoProgress,
  letterProgresses,
  taglineProgress,
}: {
  logo: ImageSourcePropType;
  logoProgress: Animated.Value;
  letterProgresses: Animated.Value[];
  taglineProgress: Animated.Value;
}) {
  const logoOpacity = logoProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const logoTranslateY = logoProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  const logoScale = logoProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.94, 1],
  });

  const taglineOpacity = taglineProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const taglineTranslateY = taglineProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [8, 0],
  });

  return (
    <View pointerEvents="none" style={styles.brandLayer}>
      <Animated.View
        style={[
          styles.secondLogoContainer,
          { opacity: logoOpacity, transform: [{ translateY: logoTranslateY }, { scale: logoScale }] },
        ]}
      >
        <Image source={logo} resizeMode="contain" style={styles.secondLogo} />
      </Animated.View>

      <View style={styles.secondWordmark}>
        {SECOND_WORD.split('').map((letter, index) => {
          const progress = letterProgresses[index];

          const opacity = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });

          const translateY = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [10, 0],
          });

          return (
            <Animated.Text
              key={`${letter}-${index}`}
              style={[styles.secondWordLetter, { opacity, transform: [{ translateY }] }]}
            >
              {letter}
            </Animated.Text>
          );
        })}
      </View>

      <Animated.Text
        style={[styles.tagline, { opacity: taglineOpacity, transform: [{ translateY: taglineTranslateY }] }]}
      >
        {SECOND_TAGLINE}
      </Animated.Text>
    </View>
  );
}

export function SplashScreen({
  onComplete,
  logo1 = require('../../assets/logo1.png'),
  logo2 = require('../../assets/logo2.png'),
}: SplashScreenProps) {
  const { width, height } = useWindowDimensions();

  const reduceMotion = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const completed = useRef(false);

  const backgroundProgress = useRef(createAnimatedValue(0)).current;

  const firstLogoLife = useRef(createAnimatedValue(0)).current;
  const firstLetterLives = useRef(FIRST_WORD.split('').map(() => createAnimatedValue(0))).current;
  const firstSubtitleLife = useRef(createAnimatedValue(0)).current;

  const secondLogoProgress = useRef(createAnimatedValue(0)).current;
  const secondLetterProgresses = useRef(SECOND_WORD.split('').map(() => createAnimatedValue(0))).current;
  const secondTaglineProgress = useRef(createAnimatedValue(0)).current;

  const sparkValues = useRef(SPARKS.map(() => createAnimatedValue(0))).current;

  const clearTimers = useCallback(() => {
    timers.current.forEach(timer => clearTimeout(timer));
    timers.current = [];
  }, []);

  const finish = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    onComplete?.();
  }, [onComplete]);

  const play = useCallback(() => {
    clearTimers();
    completed.current = false;

    const d = reduceMotion.current ? 0.001 : 1;

    backgroundProgress.setValue(0);
    firstLogoLife.setValue(0);
    firstLetterLives.forEach(v => v.setValue(0));
    firstSubtitleLife.setValue(0);
    secondLogoProgress.setValue(0);
    secondLetterProgresses.forEach(v => v.setValue(0));
    secondTaglineProgress.setValue(0);
    sparkValues.forEach(v => v.setValue(0));

    Animated.timing(backgroundProgress, {
      toValue: 1,
      duration: 650 * d,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    SPARKS.forEach((spark, index) => {
      const timer = setTimeout(() => {
        Animated.loop(
          Animated.timing(sparkValues[index], {
            toValue: 1,
            duration: spark.duration * d,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          })
        ).start();
      }, spark.delay * d);

      timers.current.push(timer);
    });

    Animated.timing(firstLogoLife, {
      toValue: 1,
      duration: TIMING.FIRST_IN * d,
      easing: EASE_ENTER,
      useNativeDriver: true,
    }).start();

    firstLetterLives.forEach((value, index) => {
      Animated.timing(value, {
        toValue: 1,
        duration: 500 * d,
        delay: (120 + index * 60) * d,
        easing: EASE_ENTER,
        useNativeDriver: true,
      }).start();
    });

    Animated.timing(firstSubtitleLife, {
      toValue: 1,
      duration: 550 * d,
      delay: 220 * d,
      easing: EASE_ENTER,
      useNativeDriver: true,
    }).start();

    timers.current.push(
      setTimeout(() => {
        Animated.timing(firstLogoLife, {
          toValue: 2,
          duration: TIMING.FIRST_OUT * d,
          easing: EASE_EXIT,
          useNativeDriver: true,
        }).start();

        firstLetterLives.forEach((value, index) => {
          Animated.timing(value, {
            toValue: 2,
            duration: 350 * d,
            delay: index * 25 * d,
            easing: EASE_EXIT,
            useNativeDriver: true,
          }).start();
        });

        Animated.timing(firstSubtitleLife, {
          toValue: 2,
          duration: 360 * d,
          delay: 20 * d,
          easing: EASE_EXIT,
          useNativeDriver: true,
        }).start();
      }, TIMING.FIRST_OUT_START * d)
    );

    timers.current.push(
      setTimeout(() => {
        Animated.timing(secondLogoProgress, {
          toValue: 1,
          duration: TIMING.SECOND_LOGO_IN * d,
          easing: EASE_ENTER,
          useNativeDriver: true,
        }).start();

        secondLetterProgresses.forEach((value, index) => {
          Animated.timing(value, {
            toValue: 1,
            duration: TIMING.WORD_IN * d,
            delay: (130 + index * TIMING.WORD_STAGGER) * d,
            easing: EASE_ENTER,
            useNativeDriver: true,
          }).start();
        });

        Animated.timing(secondTaglineProgress, {
          toValue: 1,
          duration: TIMING.TAGLINE_IN * d,
          delay: TIMING.TAGLINE_DELAY * d,
          easing: EASE_ENTER,
          useNativeDriver: true,
        }).start();
      }, TIMING.SECOND_START * d)
    );

    timers.current.push(setTimeout(finish, TIMING.COMPLETE * d));
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

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled?.()
      .then(enabled => {
        if (!mounted) return;
        reduceMotion.current = Boolean(enabled);
        play();
      })
      .catch(() => play());

    return () => {
      mounted = false;
      clearTimers();
    };
  }, [clearTimers, play]);

  const backgroundOpacity = backgroundProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={[styles.container, { width, height }]}>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFillObject, { opacity: backgroundOpacity }]}
      >
        <LinearGradient
          colors={[COLORS.bgTop, COLORS.bg, COLORS.bgBottom]}
          locations={[0, 0.48, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>

      <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, styles.vignette]} />

      {SPARKS.map((spark, index) => (
        <Sparkle key={index} config={spark} animation={sparkValues[index]} />
      ))}

      <FirstBrand
        logo={logo1}
        logoLife={firstLogoLife}
        letterLives={firstLetterLives}
        subtitleLife={firstSubtitleLife}
      />

      <SecondBrand
        logo={logo2}
        logoProgress={secondLogoProgress}
        letterProgresses={secondLetterProgresses}
        taglineProgress={secondTaglineProgress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgBottom,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  vignette: {
    backgroundColor: 'rgba(5,3,10,0.08)',
    borderWidth: 45,
    borderColor: 'rgba(5,3,10,0.16)',
  },
  spark: {
    position: 'absolute',
    color: COLORS.star,
    fontWeight: '300',
    includeFontPadding: false,
    textShadowColor: 'rgba(195,155,239,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  brandLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  firstLogoContainer: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  firstLogo: {
    width: 116,
    height: 116,
  },
  firstWordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 19,
  },
  firstWordLetter: {
    color: COLORS.fg,
    fontSize: 50,
    lineHeight: 55,
    fontWeight: '800',
    letterSpacing: 7,
    includeFontPadding: false,
  },
  firstSubtitle: {
    marginTop: 11,
    color: COLORS.accentHi,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    textAlign: 'center',
    includeFontPadding: false,
  },
  secondLogoContainer: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondLogo: {
    width: 116,
    height: 116,
  },
  secondWordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  secondWordLetter: {
    color: COLORS.fg,
    fontSize: 50,
    lineHeight: 56,
    fontWeight: '800',
    letterSpacing: -1,
    includeFontPadding: false,
  },
  tagline: {
    marginTop: 17,
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.15,
    textAlign: 'center',
    includeFontPadding: false,
  },
});

export default SplashScreen;