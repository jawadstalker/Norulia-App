import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';
import { Brain, Sparkles } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onComplete: () => void;
}

const T_OPEN = 450;
const T_REFORM = 1250;
const T_LOGO = 1750;
const T_EXIT = 3150;
const T_DONE = 3450;

const PARTICLE_COUNT = 16;
const RING_COUNT = 3;
const AMBIENT_COUNT = 10;

// Taglines cycle in sync with the brain's core-light pulse (1400ms loop)
const TAGLINES = ['Norulia App', 'Norulia AI', 'A Friend for Your Mind', 'Norulia Wellness'];
const TAGLINE_INTERVAL = 1400;

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [stage, setStage] = useState(0);
  const [taglineIndex, setTaglineIndex] = useState(0);

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

  // Cycle taglines only while the logo/tagline stage is active
  useEffect(() => {
    if (stage < 3 || stage >= 4) return;
    const id = setInterval(() => {
      setTaglineIndex((i) => (i + 1) % TAGLINES.length);
    }, TAGLINE_INTERVAL);
    return () => clearInterval(id);
  }, [stage]);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
        const distance = 110 + ((i * 37) % 60);
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

  const ambientParticles = useMemo(
    () =>
      Array.from({ length: AMBIENT_COUNT }).map((_, i) => {
        const angle = (i / AMBIENT_COUNT) * Math.PI * 2;
        const distance = 130 + ((i * 53) % 90);
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          delay: i * 90,
          duration: 2200 + (i % 4) * 400,
        };
      }),
    []
  );

  const rings = useMemo(
    () =>
      Array.from({ length: RING_COUNT }).map((_, i) => ({
        id: i,
        tilt: -30 + i * 30,
        speed: 5000 + i * 1800,
        size: 190 + i * 34,
      })),
    []
  );

  const brainOpen = stage === 1;
  const logoStage = stage >= 3;
  const exitStage = stage >= 4;
  const brainLift = logoStage ? -54 : 0;

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#1B1530', '#120F22', '#0B0916']
          : ['#2A2050', '#1B1638', '#100E1E']
      }
      style={styles.container}
    >
      <MotiView
        from={{ opacity: 0, scale: 0.6 }}
        animate={{
          opacity: exitStage ? 0 : stage >= 2 ? (logoStage ? 0.35 : 0.5) : 0.85,
          scale: stage === 1 ? 1.6 : logoStage ? 0.55 : 1,
          translateY: brainLift,
        }}
        transition={{ type: 'timing', duration: stage === 2 ? 550 : 400 }}
        style={[styles.glowBlob, { backgroundColor: colors.primary }]}
      />

      <View style={styles.content}>
        {ambientParticles.map((p) => (
          <MotiView
            key={`ambient-${p.id}`}
            from={{ opacity: 0, translateX: p.x, translateY: p.y, scale: 0.5 }}
            animate={{
              opacity: exitStage ? 0 : [0, 0.6, 0],
              translateX: p.x,
              translateY: exitStage ? p.y : [p.y, p.y - 14, p.y],
              scale: exitStage ? 0.5 : [0.5, 1, 0.5],
            }}
            transition={{
              type: 'timing',
              duration: p.duration,
              delay: p.delay,
              loop: !exitStage,
            }}
            style={styles.ambientWrap}
          >
            <View style={[styles.ambientDot, { backgroundColor: colors.accent }]} />
          </MotiView>
        ))}

        {rings.map((ring) => (
          <MotiView
            key={ring.id}
            from={{ opacity: 0, rotateZ: '0deg' }}
            animate={{
              opacity: exitStage ? 0 : stage === 1 || stage === 2 ? 0.5 : 0,
              rotateZ: '360deg',
              translateY: brainLift,
            }}
            transition={{
              opacity: { type: 'timing', duration: 400 },
              translateY: { type: 'timing', duration: 500 },
              rotateZ: { type: 'timing', duration: ring.speed, loop: true },
            }}
            style={[
              styles.ring,
              {
                width: ring.size,
                height: ring.size,
                borderRadius: ring.size / 2,
                borderColor: colors.accent,
                transform: [{ perspective: 800 }, { rotateX: `${ring.tilt}deg` }],
              },
            ]}
          />
        ))}

        {[0, 1].map((i) => (
          <MotiView
            key={`wave-${i}`}
            from={{ opacity: 0, scale: 0.3 }}
            animate={{
              opacity: stage === 1 ? [0.55, 0] : 0,
              scale: stage >= 1 ? 3.2 + i * 0.6 : 0.3,
            }}
            transition={{
              type: 'timing',
              duration: 800,
              delay: i * 120,
            }}
            style={[styles.shockwave, { borderColor: colors.primary }]}
          />
        ))}

        {particles.map((p) => (
          <MotiView
            key={p.id}
            from={{ opacity: 0, translateX: 0, translateY: 0, scale: 0.4 }}
            animate={{
              opacity: stage === 1 ? [0, 1, 0] : 0,
              translateX: stage >= 1 ? p.dx : 0,
              translateY: stage >= 1 ? p.dy : 0,
              scale: stage === 1 ? 1 : 0.4,
            }}
            transition={{ type: 'timing', duration: 750, delay: p.delay }}
            style={styles.particleWrap}
          >
            {p.isSpark ? (
              <Sparkles size={14} color={colors.accent} />
            ) : (
              <View style={[styles.particleDot, { backgroundColor: colors.accent }]} />
            )}
          </MotiView>
        ))}

        <MotiView
          from={{ scale: 0, opacity: 0 }}
          animate={{
            scale: exitStage ? 0.85 : stage === 2 ? [1.18, 1] : 1,
            opacity: exitStage ? 0 : 1,
            translateY: brainLift,
            rotateY: logoStage && !exitStage ? ['-6deg', '6deg', '-6deg'] : '0deg',
          }}
          transition={{
            scale: { type: 'spring', stiffness: 160, damping: 14 },
            opacity: { type: 'timing', duration: 400 },
            translateY: { type: 'timing', duration: 500 },
            rotateY: { type: 'timing', duration: 3200, loop: logoStage && !exitStage },
          }}
          style={[styles.brainRow, { transform: [{ perspective: 900 }] }]}
        >
          <MotiView
            animate={{
              translateX: brainOpen ? -34 : 0,
              rotateY: brainOpen ? '-38deg' : '0deg',
            }}
            transition={{ type: 'timing', duration: 500 }}
            style={[styles.halfMask, { transform: [{ perspective: 700 }] }]}
          >
            <Brain size={150} color="#FFFFFF" strokeWidth={1.8} />
          </MotiView>

          <MotiView
            animate={{
              translateX: brainOpen ? 34 : 0,
              rotateY: brainOpen ? '38deg' : '0deg',
            }}
            transition={{ type: 'timing', duration: 500 }}
            style={[styles.halfMask, styles.halfMaskRight, { transform: [{ perspective: 700 }] }]}
          >
            <Brain
              size={150}
              color="#FFFFFF"
              strokeWidth={1.8}
              style={styles.rightIconOffset}
            />
          </MotiView>

          <MotiView
            from={{ opacity: 0, scale: 0.2 }}
            animate={{
              opacity: exitStage ? 0 : brainOpen ? 1 : logoStage ? [0.5, 0.95, 0.5] : 0,
              scale: brainOpen ? 1 : logoStage ? 1 : 0.2,
            }}
            transition={{
              opacity: { type: 'timing', duration: logoStage ? TAGLINE_INTERVAL : 350, loop: logoStage && !exitStage },
              scale: { type: 'timing', duration: 350 },
            }}
            style={[styles.coreLight, { backgroundColor: colors.accent }]}
          />
        </MotiView>
      </View>

      <MotiView
        from={{ opacity: 0, translateY: 24 }}
        animate={{
          opacity: exitStage ? 0 : logoStage ? 1 : 0,
          translateY: exitStage ? 12 : logoStage ? 0 : 24,
        }}
        transition={{ type: 'timing', duration: 500 }}
        style={[styles.wordmark, { transform: [{ perspective: 600 }] }]}
      >
        <Text style={[styles.title, { color: colors.text }]}>{t.appName}</Text>

        <View style={styles.taglineFrame}>
          <AnimatePresence exitBeforeEnter>
            <MotiView
              key={taglineIndex}
              from={{ opacity: 0, rotateX: '65deg', translateY: 6 }}
              animate={{ opacity: 1, rotateX: '0deg', translateY: 0 }}
              exit={{ opacity: 0, rotateX: '-65deg', translateY: -6 }}
              transition={{ type: 'timing', duration: 380 }}
            >
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {TAGLINES[taglineIndex]}
              </Text>
            </MotiView>
          </AnimatePresence>
        </View>

        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <MotiView
            from={{ width: 0 }}
            animate={{ width: logoStage ? width * 0.5 : 0 }}
            transition={{ type: 'timing', duration: 1300, delay: 150 }}
            style={[styles.progressFill, { backgroundColor: colors.accent }]}
          />
          <MotiView
            from={{ translateX: -40, opacity: 0 }}
            animate={{
              translateX: logoStage ? width * 0.5 : -40,
              opacity: logoStage ? [0, 0.9, 0] : 0,
            }}
            transition={{ type: 'timing', duration: 1300, delay: 150 }}
            style={[styles.progressShine, { backgroundColor: colors.text }]}
          />
        </View>
      </MotiView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowBlob: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 200,
    opacity: 0.7,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 260,
    height: 260,
  },
  ambientWrap: {
    position: 'absolute',
  },
  ambientDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
  },
  shockwave: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
  },
  particleWrap: {
    position: 'absolute',
  },
  particleDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  brainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halfMask: {
    width: 75,
    height: 150,
    overflow: 'hidden',
  },
  halfMaskRight: {
    alignItems: 'flex-end',
  },
  rightIconOffset: {
    marginLeft: -75,
  },
  coreLight: {
    position: 'absolute',
    width: 26,
    height: 90,
    borderRadius: 13,
  },
  wordmark: {
    position: 'absolute',
    bottom: height * 0.16,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    textShadowColor: 'rgba(167,139,250,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 18,
  },
  taglineFrame: {
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
  },
  progressTrack: {
    height: 4,
    width: width * 0.5,
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
    width: 30,
    height: '100%',
    borderRadius: BorderRadius.full,
  },
});