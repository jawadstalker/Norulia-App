import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  Easing,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  AccessibilityInfo,
  ImageSourcePropType,
  ViewStyle,
  TextStyle,
  DimensionValue,
  Platform,
} from 'react-native';

// Expo/react-native-web does not support the native animation driver, and
// combining it with Animated.add/multiply (used below to blend entrance and
// exit animations) throws at runtime on web. Native driver is safe — and
// still gives smooth, off-thread animation — on iOS/Android.
const NATIVE_DRIVER = Platform.OS !== 'web';

// RN's style typings require every object inside a `transform` array to name
// exactly one transform key (with the rest typed as `never`), which makes it
// impossible to type an array mixing differently-shaped animated transform
// objects built dynamically. Casting each computed style to this alias keeps
// the component body readable without sprinkling `as any` everywhere.
type AnimatedStyle = Animated.WithAnimatedValue<ViewStyle & TextStyle>;
import { LinearGradient } from 'expo-linear-gradient';

// ---------------------------------------------------------------------------
// Content — matches the original HTML 1:1.
// NOTE: the source HTML's second wordmark literally spells "Neurolia"
// (aria-label="Neurolia", 8 letters N-e-u-r-o-l-i-a), while the alt text on
// the image says "Neurolia logo" too. Your app/repo is "Norulia". I kept the
// text exactly as given for a faithful port — change WORD_2 below to
// 'Norulia' if that was a typo in the source file.
// ---------------------------------------------------------------------------
const WORD_1 = 'IPS';
const SUBTITLE_1 = 'Iliya Pardazesh Shargh';
const WORD_2 = 'Neurolia';
const TAGLINE = 'Mind, beautifully calibrated.';

const COLORS = {
  bgDeep: '#151020',
  bg: '#24142F',
  bgOuter: '#0c0814',
  fg: '#F3EEF9',
  muted: '#B3A7BE',
  accent: '#C39BEF',
  accentHi: '#E6D8F8',
  accentLo: '#8758C8',
} as const;

// letter rotation values, taken from the CSS custom properties
const ROT_2: number[] = [-12, 12, -12, 12, -12, 12, -12, 12]; // N e u r o l i a

interface Spark {
  top?: DimensionValue;
  left?: DimensionValue;
  right?: DimensionValue;
  bottom?: DimensionValue;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

const SPARKS: Spark[] = [
  { top: '22%', left: '20%', size: 22, color: COLORS.accentHi, delay: 900, duration: 2400 },
  { top: '30%', right: '18%', size: 14, color: COLORS.accent, delay: 1300, duration: 2800 },
  { bottom: '30%', left: '26%', size: 16, color: COLORS.accentHi, delay: 1600, duration: 2100 },
  { bottom: '26%', right: '24%', size: 20, color: COLORS.accentHi, delay: 1100, duration: 2600 },
  { top: '46%', left: '12%', size: 12, color: COLORS.accent, delay: 1900, duration: 3100 },
];

// timeline, in ms — mirrors the setTimeout schedule in the original <script>
const T = {
  ACT1_EXIT: 1350,
  ACT2_ENTER: 1900,
  ACT1_GONE: 2100,
  AMBIENT_START: 3600, // when floaty/breathe loops kick in, relative to ACT2_ENTER
  END: 4600,
  OUTDONE: 4900,
};

const EASE_IN = Easing.bezier(0.2, 0, 0, 1);
const EASE_OUT = Easing.bezier(0.5, 0, 0.75, 0);

function mkVal(v = 0): Animated.Value {
  return new Animated.Value(v);
}

export interface SplashScreenProps {
  /** Called once the entrance animation finishes and the replay button appears. */
  onFinish?: () => void;
  /** First logo (IPS act). Defaults to ./assets/logo1.png */
  logo1?: ImageSourcePropType;
  /** Second logo (brand act). Defaults to ./assets/logo.png */
  logo2?: ImageSourcePropType;
}

export default function SplashScreen({
  onFinish,
  logo1 = require('../../assets/logo1.png'),
  logo2 = require('../../assets/logo2.png'),
}: SplashScreenProps): React.JSX.Element {
  const reduceMotion = useRef<boolean>(false);

  // ---- shared / background --------------------------------------------
  const bgOpacity = useRef(mkVal(0)).current;
  const sparkVals = useRef<Animated.Value[]>(SPARKS.map(() => mkVal(0))).current;
  const sparkLoops = useRef<Animated.CompositeAnimation[]>([]);

  // ---- act 1 (IPS) ----------------------------------------------------
  const act1Glow = useRef(mkVal(0)).current;
  const act1Logo = useRef(mkVal(0)).current; // 0..1 progress for logoIn
  const act1LogoOut = useRef(mkVal(0)).current; // 0..1 progress for logoOutClassic
  const act1Letters = useRef<Animated.Value[]>(WORD_1.split('').map(() => mkVal(0))).current; // softFade in
  const act1LettersOut = useRef<Animated.Value[]>(WORD_1.split('').map(() => mkVal(0))).current; // fadeOutOnly
  const act1Subtitle = useRef(mkVal(0)).current;
  const act1SubtitleOut = useRef(mkVal(0)).current;
  const act1Visible = useRef(mkVal(1)).current; // hides act1 entirely once gone

  // ---- act 2 (Neurolia) -------------------------------------------------
  const act2Glow = useRef(mkVal(0)).current; // bloom progress
  const act2GlowBreathe = useRef(mkVal(0)).current; // ambient loop
  const act2Logo = useRef(mkVal(0)).current;
  const act2Letters = useRef<Animated.Value[]>(WORD_2.split('').map(() => mkVal(0))).current;
  const act2Tagline = useRef(mkVal(0)).current;
  const act2Floaty = useRef(mkVal(0)).current; // ambient loop

  // ---- chrome -----------------------------------------------------------
  const sparksEnd = useRef(mkVal(1)).current; // 1 -> visible, animates to 0 at END
  const replayOpacity = useRef(mkVal(0)).current;

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    sparkLoops.current.forEach((l) => l && l.stop());
    sparkLoops.current = [];
  };

  const play = useCallback(() => {
    clearTimers();

    const dur = reduceMotion.current ? 0.001 : 1; // scale factor if reduced motion

    // reset everything
    [
      bgOpacity, act1Glow, act1Logo, act1LogoOut, act1Subtitle, act1SubtitleOut,
      act2Glow, act2GlowBreathe, act2Logo, act2Tagline, act2Floaty, sparksEnd,
      replayOpacity,
    ].forEach((v) => v.setValue(0));
    act1Visible.setValue(1);
    sparksEnd.setValue(1);
    act1Letters.forEach((v) => v.setValue(0));
    act1LettersOut.forEach((v) => v.setValue(0));
    act2Letters.forEach((v) => v.setValue(0));
    sparkVals.forEach((v) => v.setValue(0));

    // background fade in (bgIn .7s)
    Animated.timing(bgOpacity, {
      toValue: 1,
      duration: 700 * dur,
      easing: Easing.linear,
      useNativeDriver: NATIVE_DRIVER,
    }).start();

    // ambient sparkle twinkle loops
    SPARKS.forEach((s, i) => {
      const t = setTimeout(() => {
        const loop = Animated.loop(
          Animated.sequence([
            Animated.timing(sparkVals[i], {
              toValue: 1,
              duration: (s.duration / 2) * dur,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: NATIVE_DRIVER,
            }),
            Animated.timing(sparkVals[i], {
              toValue: 0,
              duration: (s.duration / 2) * dur,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: NATIVE_DRIVER,
            }),
          ])
        );
        sparkLoops.current.push(loop);
        loop.start();
      }, s.delay * dur);
      timers.current.push(t);
    });

    // ---- ACT 1 in ----
    Animated.timing(act1Glow, {
      toValue: 1,
      duration: 1200 * dur,
      delay: 100 * dur,
      easing: EASE_IN,
      useNativeDriver: NATIVE_DRIVER,
    }).start();

    Animated.timing(act1Logo, {
      toValue: 1,
      duration: 1000 * dur,
      delay: 50 * dur,
      easing: EASE_IN,
      useNativeDriver: NATIVE_DRIVER,
    }).start();

    act1Letters.forEach((v, i) => {
      Animated.timing(v, {
        toValue: 1,
        duration: 800 * dur,
        delay: (50 + i * 30) * dur,
        easing: EASE_IN,
        useNativeDriver: NATIVE_DRIVER,
      }).start();
    });

    Animated.timing(act1Subtitle, {
      toValue: 1,
      duration: 800 * dur,
      delay: 150 * dur,
      easing: EASE_IN,
      useNativeDriver: NATIVE_DRIVER,
    }).start();

    // ---- ACT 1 out (dissolve) ----
    timers.current.push(
      setTimeout(() => {
        Animated.timing(act1LogoOut, {
          toValue: 1,
          duration: 750 * dur,
          easing: EASE_OUT,
          useNativeDriver: NATIVE_DRIVER,
        }).start();
        act1LettersOut.forEach((v, i) => {
          Animated.timing(v, {
            toValue: 1,
            duration: 600 * dur,
            delay: i * 30 * dur,
            easing: EASE_OUT,
            useNativeDriver: NATIVE_DRIVER,
          }).start();
        });
        Animated.timing(act1SubtitleOut, {
          toValue: 1,
          duration: 600 * dur,
          delay: 80 * dur,
          easing: EASE_OUT,
          useNativeDriver: NATIVE_DRIVER,
        }).start();
      }, T.ACT1_EXIT * dur)
    );

    // ---- ACT 2 in (logo leads, then text) ----
    timers.current.push(
      setTimeout(() => {
        Animated.timing(act2Glow, {
          toValue: 1,
          duration: 1200 * dur,
          delay: 150 * dur,
          easing: EASE_IN,
          useNativeDriver: NATIVE_DRIVER,
        }).start();

        Animated.timing(act2Logo, {
          toValue: 1,
          duration: 1000 * dur,
          delay: 200 * dur,
          easing: EASE_IN,
          useNativeDriver: NATIVE_DRIVER,
        }).start();

        act2Letters.forEach((v, i) => {
          Animated.timing(v, {
            toValue: 1,
            duration: 1000 * dur,
            delay: (340 + i * 50) * dur,
            easing: EASE_IN,
            useNativeDriver: NATIVE_DRIVER,
          }).start();
        });

        Animated.timing(act2Tagline, {
          toValue: 1,
          duration: 1000 * dur,
          delay: 540 * dur,
          easing: EASE_IN,
          useNativeDriver: NATIVE_DRIVER,
        }).start();

        // ambient loops start ~3.6s after act2 begins (matches CSS delay)
        const ambientT = setTimeout(() => {
          const floatLoop = Animated.loop(
            Animated.sequence([
              Animated.timing(act2Floaty, { toValue: 1, duration: 2500 * dur, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE_DRIVER }),
              Animated.timing(act2Floaty, { toValue: 0, duration: 2500 * dur, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIVE_DRIVER }),
            ])
          );
          const breatheLoop = Animated.loop(
            Animated.sequence([
              Animated.timing(act2GlowBreathe, { toValue: 1, duration: 2250 * dur, easing: Easing.inOut(Easing.ease), useNativeDriver: NATIVE_DRIVER }),
              Animated.timing(act2GlowBreathe, { toValue: 0, duration: 2250 * dur, easing: Easing.inOut(Easing.ease), useNativeDriver: NATIVE_DRIVER }),
            ])
          );
          sparkLoops.current.push(floatLoop, breatheLoop);
          floatLoop.start();
          breatheLoop.start();
        }, T.AMBIENT_START * dur);
        timers.current.push(ambientT);
      }, T.ACT2_ENTER * dur)
    );

    // ---- act1 fully gone ----
    timers.current.push(
      setTimeout(() => {
        act1Visible.setValue(0);
      }, T.ACT1_GONE * dur)
    );

    // ---- end: fade sparkles ----
    timers.current.push(
      setTimeout(() => {
        Animated.timing(sparksEnd, {
          toValue: 0,
          duration: 500 * dur,
          easing: Easing.linear,
          useNativeDriver: NATIVE_DRIVER,
        }).start();
      }, T.END * dur)
    );

    // ---- outdone: show replay button ----
    timers.current.push(
      setTimeout(() => {
        Animated.timing(replayOpacity, {
          toValue: 1,
          duration: 550 * dur,
          easing: Easing.linear,
          useNativeDriver: NATIVE_DRIVER,
        }).start(() => {
          if (onFinish) onFinish();
        });
      }, T.OUTDONE * dur)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.().then((v: boolean) => {
      reduceMotion.current = !!v;
      play();
    });
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- derived transforms ----
  // Raw interpolation nodes for the glow bloom, kept separate from
  // `glowStyle` below so they can be combined with `breatheStyle` via
  // Animated.add without re-reading `.opacity` off an already-cast style
  // object (that would reintroduce `undefined` into the type).
  const glowOpacity = (progress: Animated.Value) =>
    progress.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0, 0.9, 0] });
  const glowScale = (progress: Animated.Value) =>
    progress.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1.5] });

  const glowStyle = (progress: Animated.Value): AnimatedStyle => ({
    opacity: glowOpacity(progress),
    transform: [{ scale: glowScale(progress) }],
  } as AnimatedStyle);

  const breatheStyle = act2GlowBreathe.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0.35, 0] });

  const logoInStyle = (progress: Animated.Value): AnimatedStyle => ({
    opacity: progress,
    transform: [
      { translateY: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [22, -4, 0] }) },
      { scale: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.82, 1.05, 1] }) },
      { rotate: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: ['-6deg', '1.5deg', '0deg'] }) },
    ],
  } as AnimatedStyle);

  // Entrance + exit drive the SAME opacity/transform, so they must be
  // combined (multiplied/added) into one style rather than passed as two
  // separate style objects — RN style arrays override matching keys instead
  // of merging them, which would otherwise let the (initially neutral) exit
  // values silently clobber the entrance animation.
  const logoInOutStyle = (inProg: Animated.Value, outProg: Animated.Value): AnimatedStyle => ({
    opacity: Animated.multiply(
      inProg,
      outProg.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
    ),
    transform: [
      {
        translateY: Animated.add(
          inProg.interpolate({ inputRange: [0, 0.6, 1], outputRange: [22, -4, 0] }),
          outProg.interpolate({ inputRange: [0, 1], outputRange: [0, -18] })
        ),
      },
      {
        scale: Animated.multiply(
          inProg.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.82, 1.05, 1] }),
          outProg.interpolate({ inputRange: [0, 1], outputRange: [1, 0.985] })
        ),
      },
      { rotate: inProg.interpolate({ inputRange: [0, 0.6, 1], outputRange: ['-6deg', '1.5deg', '0deg'] }) },
    ],
  } as AnimatedStyle);

  const fadeInOutStyle = (inProg: Animated.Value, outProg: Animated.Value): AnimatedStyle => ({
    opacity: Animated.multiply(
      inProg,
      outProg.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
    ),
  } as AnimatedStyle);

  const letterInStyle = (progress: Animated.Value, rotDeg: number): AnimatedStyle => ({
    opacity: progress,
    transform: [
      { translateY: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [18, -3, 0] }) },
      { scale: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.7, 1.06, 1] }) },
      { rotate: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [`${rotDeg}deg`, '2deg', '0deg'] }) },
    ],
  } as AnimatedStyle);

  const taglineStyle = (progress: Animated.Value): AnimatedStyle => ({
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [16, -3, 0] }) }],
  } as AnimatedStyle);

  const floatyTranslate = act2Floaty.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -8, 0] });

  return (
    <View style={styles.stage}>
      {/* background */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
        <LinearGradient
          colors={[COLORS.bg, COLORS.bg, COLORS.bgDeep]}
          locations={[0, 0.42, 1]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      {/* vignette (approximated with a soft dark overlay) */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.vignette]} />

      {/* sparkles */}
      {SPARKS.map((s, i) => (
        <Animated.Text
          key={i}
          pointerEvents="none"
          style={[
            styles.spark,
            {
              top: s.top,
              left: s.left,
              right: s.right,
              bottom: s.bottom,
              fontSize: s.size,
              color: s.color,
              opacity: Animated.multiply(
                sparkVals[i].interpolate({ inputRange: [0, 1], outputRange: [0, 0.85] }),
                sparksEnd
              ),
              transform: [
                { scale: sparkVals[i].interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
              ],
            },
          ]}
        >
          ✦
        </Animated.Text>
      ))}

      {/* ACT 1 — IPS */}
      <Animated.View style={[styles.act, { opacity: act1Visible }]} pointerEvents="none">
        <Animated.View style={[styles.glow, glowStyle(act1Glow)]} />
        <Animated.View style={[styles.logoWrap, logoInOutStyle(act1Logo, act1LogoOut)]}>
          <Image source={logo1} style={styles.logo} resizeMode="contain" />
        </Animated.View>
        <View style={styles.wordmarkRow}>
          {WORD_1.split('').map((ch, i) => (
            <Animated.Text
              key={i}
              style={[styles.wordmark, styles.wordmarkWide, fadeInOutStyle(act1Letters[i], act1LettersOut[i])]}
            >
              {ch}
            </Animated.Text>
          ))}
        </View>
        <Animated.Text style={[styles.subtitle, fadeInOutStyle(act1Subtitle, act1SubtitleOut)]}>
          {SUBTITLE_1}
        </Animated.Text>
      </Animated.View>

      {/* ACT 2 — Neurolia */}
      <Animated.View style={[styles.act, { transform: [{ translateY: floatyTranslate }] }]} pointerEvents="none">
        <Animated.View
          style={[
            styles.glow,
            { transform: [{ scale: glowScale(act2Glow) }] } as AnimatedStyle,
            { opacity: Animated.add(glowOpacity(act2Glow), breatheStyle) },
          ]}
        />
        <Animated.View style={[styles.logoWrap, logoInStyle(act2Logo)]}>
          <Image source={logo2} style={styles.logo} resizeMode="contain" />
        </Animated.View>
        <View style={styles.wordmarkRow}>
          {WORD_2.split('').map((ch, i) => (
            <Animated.Text key={i} style={[styles.wordmark, letterInStyle(act2Letters[i], ROT_2[i])]}>
              {ch}
            </Animated.Text>
          ))}
        </View>
        <Animated.Text style={[styles.tagline, taglineStyle(act2Tagline)]}>{TAGLINE}</Animated.Text>
      </Animated.View>

      {/* replay button */}
      <Animated.View style={[styles.replayWrap, { opacity: replayOpacity }]}>
        <TouchableOpacity style={styles.replay} onPress={play} activeOpacity={0.7}>
          <Text style={styles.replayText}>Replay intro</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    width,
    height,
    backgroundColor: COLORS.bgOuter,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  vignette: {
    // soft edge darkening approximating the radial vignette
    backgroundColor: 'transparent',
    borderWidth: 60,
    borderColor: 'rgba(8,5,16,0.35)',
  },
  spark: {
    position: 'absolute',
  },
  act: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: '50%',
    marginTop: -212, // ~ -62% of 300 + 38
    backgroundColor: COLORS.accent,
  },
  logoWrap: {
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 116,
    height: 116,
  },
  wordmarkRow: {
    flexDirection: 'row',
    marginTop: 22,
    justifyContent: 'center',
  },
  wordmark: {
    fontSize: 52,
    fontWeight: '800',
    color: COLORS.fg,
    lineHeight: 56,
    letterSpacing: -1, // ~ -0.02em, matches act-2 wordmark tracking
  },
  wordmarkWide: {
    letterSpacing: 8, // ~ 0.2em, matches act-1 (IPS) wordmark tracking
  },
  subtitle: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: COLORS.accentHi,
  },
  tagline: {
    marginTop: 18,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.muted,
  },
  replayWrap: {
    position: 'absolute',
    bottom: 18,
    right: 18,
  },
  replay: {
    backgroundColor: 'rgba(243,238,249,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(243,238,249,0.12)',
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  replayText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});