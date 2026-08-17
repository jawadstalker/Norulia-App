import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { Easing } from 'react-native-reanimated';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const COLORS = {
  bg: '#120D20',
  bg2: '#241A3D',
  bg3: '#0B0713',
  fg: '#F3EFFB',
  muted: '#9E94B4',
  accent: '#B79DEA',
  accentHi: '#E9DEFF',
  accentLo: '#7055B2',
  line: 'rgba(220,206,245,0.12)',
  lineSoft: 'rgba(220,206,245,0.055)',
};

const WORDMARK = 'Norulia';

const STATUS_LABELS = [
  { at: 0, text: 'Initializing' },
  { at: 950, text: 'Calibrating' },
  { at: 1900, text: 'Ready' },
];

const T = {
  eyebrow: 120,
  logo: 240,
  scan: 500,
  wordmark: 520,
  wordStagger: 55,
  detail: 850,
  mascot: 1050,
  divider: 1250,
  tagline: 1320,
  system: 150,
  textHighlight: 1550,
  exitStart: 2550,
  exitDuration: 450,
};

const TOTAL_MS = 3000;

const PARTICLES = [
  { x: 12, y: 18, size: 2, delay: 300 },
  { x: 22, y: 31, size: 1, delay: 500 },
  { x: 81, y: 17, size: 2, delay: 420 },
  { x: 90, y: 34, size: 1, delay: 650 },
  { x: 8, y: 64, size: 1, delay: 800 },
  { x: 18, y: 78, size: 2, delay: 580 },
  { x: 86, y: 69, size: 2, delay: 720 },
  { x: 94, y: 82, size: 1, delay: 400 },
  { x: 30, y: 13, size: 1, delay: 900 },
  { x: 70, y: 86, size: 1, delay: 760 },
];

interface SplashScreenProps {
  onComplete?: () => void;
  autoCompleteAfter?: number;
}

export function SplashScreen({ onComplete, autoCompleteAfter = TOTAL_MS }: SplashScreenProps) {
  const [playKey, setPlayKey] = useState(0);
  const [labelIndex, setLabelIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  const letters = useMemo(() => WORDMARK.split(''), []);

  const replay = useCallback(() => {
    setPlayKey((value) => value + 1);
    setLabelIndex(0);
    setExiting(false);
  }, []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    STATUS_LABELS.forEach((status, index) => {
      timers.push(
        setTimeout(() => {
          setLabelIndex(index);
        }, status.at)
      );
    });

    timers.push(
      setTimeout(() => {
        setExiting(true);
      }, T.exitStart)
    );

    if (onComplete) {
      timers.push(
        setTimeout(() => {
          onComplete();
        }, autoCompleteAfter)
      );
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [playKey, onComplete, autoCompleteAfter]);

  return (
    <MotiView
      key={`stage-${playKey}`}
      style={styles.stage}
      from={{ opacity: 1, scale: 1 }}
      animate={
        exiting
          ? { opacity: 0, scale: 1.045 }
          : { opacity: 1, scale: 1 }
      }
      transition={{
        type: 'timing',
        duration: exiting ? T.exitDuration : 0,
        easing: Easing.in(Easing.cubic),
      }}
    >
      <MotiView
        from={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'timing',
          duration: 800,
          easing: Easing.out(Easing.cubic),
        }}
        style={StyleSheet.absoluteFill}
      >
        <ExpoLinearGradient
          colors={[COLORS.bg2, COLORS.bg, COLORS.bg3]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.15, y: 0 }}
          end={{ x: 0.85, y: 1 }}
        />
      </MotiView>

      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.16, scale: 1 }}
        transition={{ type: 'timing', duration: 1200 }}
        style={styles.ambientGlow}
      />

      <View pointerEvents="none" style={styles.grid}>
        {Array.from({ length: 7 }).map((_, index) => (
          <View
            key={`v-${index}`}
            style={[
              styles.gridVertical,
              { left: `${14 + index * 12}%` as `${number}%` },
            ]}
          />
        ))}
        {Array.from({ length: 9 }).map((_, index) => (
          <View
            key={`h-${index}`}
            style={[
              styles.gridHorizontal,
              { top: `${8 + index * 11}%` as `${number}%` },
            ]}
          />
        ))}
      </View>

      {PARTICLES.map((particle, index) => (
        <MotiView
          key={`particle-${index}-${playKey}`}
          from={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.8, 0.25], scale: [0, 1, 0.65] }}
          transition={{
            type: 'timing',
            duration: 900,
            delay: particle.delay,
            easing: Easing.out(Easing.cubic),
          }}
          style={[
            styles.particle,
            {
              left: `${particle.x}%` as `${number}%`,
              top: `${particle.y}%` as `${number}%`,
              width: particle.size,
              height: particle.size,
            },
          ]}
        />
      ))}

      <MotiView
        from={{ opacity: 0, translateY: -8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: 'timing',
          duration: 350,
          delay: T.eyebrow,
          easing: Easing.out(Easing.cubic),
        }}
        style={styles.topBrand}
      >
        <View style={styles.topDot} />
        <Text style={styles.topBrandText}>NEUROLIA</Text>
        <View style={styles.topLine} />
        <Text style={styles.version}>01</Text>
      </MotiView>

      <MotiView
        from={{ opacity: 0, translateX: 12 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{
          type: 'timing',
          duration: 350,
          delay: T.system,
        }}
        style={styles.systemIndicator}
      >
        <View style={styles.systemDot} />
        <Text style={styles.systemText}>SYSTEM ONLINE</Text>
      </MotiView>

      <View style={styles.lockup}>
        <MotiText
          key={`eyebrow-${playKey}`}
          from={{ opacity: 0, translateY: -8 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 420,
            delay: T.eyebrow,
            easing: Easing.out(Easing.cubic),
          }}
          style={styles.eyebrow}
        >
          INTELLIGENCE · PERFORMANCE · SELF
        </MotiText>

        <View style={styles.logoArea}>
          <MotiView
            from={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'timing',
              duration: 500,
              delay: T.logo,
              easing: Easing.out(Easing.back(1.2)),
            }}
            style={styles.logoFrame}
          >
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </MotiView>

          <MotiView
            from={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 0.65, 0.35], scale: [0.4, 1.15, 1] }}
            transition={{
              type: 'timing',
              duration: 700,
              delay: T.logo,
              easing: Easing.out(Easing.cubic),
            }}
            style={styles.logoGlow}
          />

          <MotiView
            key={`logo-${playKey}`}
            from={{ opacity: 0, scale: 0.45, rotate: '-8deg' }}
            animate={{ opacity: 1, scale: 1, rotate: '0deg' }}
            transition={{
              type: 'timing',
              duration: 650,
              delay: T.logo,
              easing: Easing.out(Easing.back(1.5)),
            }}
            style={styles.logo}
          >
            <Svg width={110} height={110} viewBox="0 0 120 120">
              <Defs>
                <LinearGradient id="nGradient" x1="0" y1="1" x2="1" y2="0">
                  <Stop offset="0" stopColor={COLORS.accentLo} />
                  <Stop offset="0.5" stopColor={COLORS.accent} />
                  <Stop offset="1" stopColor={COLORS.accentHi} />
                </LinearGradient>
              </Defs>
              <Path d="M30 34 L30 86" stroke="url(#nGradient)" strokeWidth={8} strokeLinecap="round" fill="none" />
              <Path d="M30 86 L90 34" stroke="url(#nGradient)" strokeWidth={8} strokeLinecap="round" fill="none" />
              <Path d="M90 34 L90 86" stroke="url(#nGradient)" strokeWidth={8} strokeLinecap="round" fill="none" />
              <Circle cx={30} cy={34} r={3.5} fill={COLORS.accentHi} />
              <Circle cx={90} cy={34} r={3.5} fill={COLORS.accentHi} />
            </Svg>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: -65 }}
            animate={{ opacity: [0, 0.9, 0], translateY: 65 }}
            transition={{
              type: 'timing',
              duration: 700,
              delay: T.scan,
              easing: Easing.inOut(Easing.cubic),
            }}
            style={styles.scanLine}
          />
        </View>

        <View style={styles.wordmarkContainer}>
          <View style={styles.wordmarkClip}>
            <View style={styles.wordmarkRow}>
              {letters.map((letter, index) => (
                <MotiText
                  key={`base-letter-${index}-${playKey}`}
                  from={{ opacity: 0, translateY: 28, scale: 0.65 }}
                  animate={{ opacity: 1, translateY: 0, scale: 1 }}
                  transition={{
                    type: 'timing',
                    duration: 430,
                    delay: T.wordmark + index * T.wordStagger,
                    easing: Easing.out(Easing.back(1.5)),
                  }}
                  style={styles.wordmarkChar}
                >
                  {letter}
                </MotiText>
              ))}
            </View>

            <MotiView
              pointerEvents="none"
              from={{ opacity: 0, translateX: -170 }}
              animate={{ opacity: [0, 1, 1, 0], translateX: [-170, -115, 120, 170] }}
              transition={{
                type: 'timing',
                duration: 900,
                delay: T.textHighlight,
                easing: Easing.inOut(Easing.cubic),
              }}
              style={styles.textHighlightLayer}
            >
              <View style={styles.wordmarkRow}>
                {letters.map((letter, index) => (
                  <Text key={`highlight-letter-${index}`} style={styles.highlightWordmarkChar}>
                    {letter}
                  </Text>
                ))}
              </View>

              <MotiView
                from={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.15, 1, 0.4] }}
                transition={{
                  type: 'timing',
                  duration: 900,
                  delay: T.textHighlight,
                  easing: Easing.inOut(Easing.cubic),
                }}
                style={styles.textLightPoint}
              />

              <MotiView
                from={{ opacity: 0, scaleX: 0.2 }}
                animate={{ opacity: [0, 0.7, 0.55, 0], scaleX: [0.2, 1, 1, 0.2] }}
                transition={{
                  type: 'timing',
                  duration: 900,
                  delay: T.textHighlight,
                  easing: Easing.inOut(Easing.cubic),
                }}
                style={styles.textLightGlow}
              />
            </MotiView>
          </View>

          <MotiView
            from={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{
              type: 'timing',
              duration: 450,
              delay: T.divider,
              easing: Easing.out(Easing.cubic),
            }}
            style={styles.accentLine}
          />
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 12, scale: 0.7 }}
          animate={{ opacity: 1, translateY: 0, scale: 1 }}
          transition={{
            type: 'timing',
            duration: 420,
            delay: T.mascot,
            easing: Easing.out(Easing.back(1.4)),
          }}
          style={styles.mascot}
        >
          <Svg width={38} height={38} viewBox="0 0 100 100">
            <Defs>
              <LinearGradient id="nodeGradient" x1="0" y1="1" x2="1" y2="0">
                <Stop offset="0" stopColor="#8064C7" />
                <Stop offset="0.65" stopColor={COLORS.accent} />
                <Stop offset="1" stopColor={COLORS.accentHi} />
              </LinearGradient>
            </Defs>
            <Circle cx={50} cy={50} r={40} fill="url(#nodeGradient)" stroke="#4A3A78" strokeWidth={4} />
            <Circle cx={38} cy={45} r={6} fill="#FFFFFF" />
            <Circle cx={62} cy={45} r={6} fill="#FFFFFF" />
            <Circle cx={39} cy={46} r={3} fill="#35284F" />
            <Circle cx={63} cy={46} r={3} fill="#35284F" />
            <Path d="M39 64 Q50 73 61 64" fill="none" stroke="#4A3A78" strokeWidth={3} strokeLinecap="round" />
          </Svg>
        </MotiView>

        <MotiText
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 400,
            delay: T.tagline,
            easing: Easing.out(Easing.back(1.2)),
          }}
          style={styles.tagline}
        >
          Mind, beautifully calibrated.
        </MotiText>

        <MotiText
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: 'timing',
            duration: 300,
            delay: T.tagline + 180,
          }}
          style={styles.subTagline}
        >
          Understand your mind.
        </MotiText>
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 15 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          type: 'timing',
          duration: 400,
          delay: T.system,
        }}
        style={styles.statusBar}
      >
        <View>
          <Text style={styles.statusCore}>IPS CORE</Text>
          <Text style={styles.statusMeta}>NEUROCOGNITIVE ENGINE</Text>
        </View>

        <View style={styles.progressTrack}>
          <MotiView
            from={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{
              type: 'timing',
              duration: 2550,
              delay: 180,
              easing: Easing.out(Easing.cubic),
            }}
            style={styles.progressFill}
          />
        </View>

        <AnimatePresence exitBeforeEnter>
          <MotiText
            key={`label-${labelIndex}-${playKey}`}
            from={{ opacity: 0, translateY: 4 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -4 }}
            transition={{ type: 'timing', duration: 180 }}
            style={styles.statusLabel}
          >
            {STATUS_LABELS[labelIndex].text}
          </MotiText>
        </AnimatePresence>
      </MotiView>

      <View pointerEvents="none" style={styles.cornerInfoLeft}>
        <Text style={styles.microText}>N / 001</Text>
        <View style={styles.microLine} />
      </View>

      <View pointerEvents="none" style={styles.cornerInfoRight}>
        <View style={styles.microLine} />
        <Text style={styles.microText}>COGNITIVE OS</Text>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    minHeight: height,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: 999,
    backgroundColor: 'rgba(183,157,234,0.22)',
    top: height * 0.5 - width * 0.425,
    left: width * 0.5 - width * 0.425,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  gridVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: COLORS.lineSoft,
  },
  gridHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.lineSoft,
  },
  particle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: COLORS.accentHi,
  },
  topBrand: {
    position: 'absolute',
    top: 44,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: COLORS.accent,
    marginRight: 8,
  },
  topBrandText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: COLORS.muted,
  },
  topLine: {
    flex: 1,
    height: 1,
    marginHorizontal: 12,
    backgroundColor: COLORS.line,
  },
  version: {
    fontSize: 9,
    letterSpacing: 1.5,
    color: 'rgba(220,206,245,0.4)',
  },
  systemIndicator: {
    position: 'absolute',
    top: 80,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  systemDot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    backgroundColor: COLORS.accent,
    marginRight: 6,
  },
  systemText: {
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 1.3,
    color: 'rgba(220,206,245,0.55)',
  },
  lockup: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: -5,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.muted,
    letterSpacing: 4,
    marginBottom: 20,
    textAlign: 'center',
  },
  logoArea: {
    width: 170,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 999,
    backgroundColor: 'rgba(183,157,234,0.12)',
  },
  logoFrame: {
    position: 'absolute',
    width: 142,
    height: 142,
  },
  corner: {
    position: 'absolute',
    width: 17,
    height: 17,
    borderColor: 'rgba(220,206,245,0.45)',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 1,
    borderLeftWidth: 1,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 1,
    borderRightWidth: 1,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanLine: {
    position: 'absolute',
    width: 120,
    height: 1,
    backgroundColor: COLORS.accentHi,
    opacity: 0.6,
  },
  wordmarkContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  wordmarkClip: {
    position: 'relative',
    overflow: 'hidden',
    height: 58,
    justifyContent: 'center',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  wordmarkChar: {
    fontSize: 43,
    fontWeight: '700',
    color: COLORS.fg,
    letterSpacing: -0.8,
  },
  textHighlightLayer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    overflow: 'visible',
  },
  highlightWordmarkChar: {
    fontSize: 43,
    fontWeight: '700',
    color: COLORS.accentHi,
    letterSpacing: -0.8,
    textShadowColor: 'rgba(183,157,234,0.95)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  textLightPoint: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    top: '50%',
    marginTop: -3.5,
    left: -3,
    shadowColor: '#DCCBFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  textLightGlow: {
    position: 'absolute',
    width: 68,
    height: 22,
    borderRadius: 999,
    backgroundColor: 'rgba(196,171,255,0.30)',
    top: '50%',
    marginTop: -11,
    left: -34,
    transform: [{ rotate: '8deg' }],
  },
  accentLine: {
    width: 62,
    height: 2,
    marginTop: 11,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
  mascot: {
    marginTop: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.muted,
    letterSpacing: 0.3,
  },
  subTagline: {
    marginTop: 5,
    fontSize: 9,
    fontWeight: '500',
    color: 'rgba(179,169,196,0.55)',
    letterSpacing: 1.2,
  },
  statusBar: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusCore: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.7,
    color: COLORS.muted,
  },
  statusMeta: {
    marginTop: 3,
    fontSize: 7,
    letterSpacing: 1,
    color: 'rgba(179,169,196,0.4)',
  },
  progressTrack: {
    flex: 1,
    height: 2,
    marginLeft: 18,
    marginRight: 12,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
  },
  statusLabel: {
    minWidth: 68,
    fontSize: 8,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: COLORS.muted,
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  cornerInfoLeft: {
    position: 'absolute',
    left: 24,
    bottom: 88,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cornerInfoRight: {
    position: 'absolute',
    right: 24,
    bottom: 88,
    flexDirection: 'row',
    alignItems: 'center',
  },
  microText: {
    fontSize: 7,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: 'rgba(179,169,196,0.28)',
  },
  microLine: {
    width: 22,
    height: 1,
    backgroundColor: 'rgba(220,206,245,0.12)',
    marginHorizontal: 7,
  },
});

export default SplashScreen;