import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/ui/Card';
import { Brain, Target, Zap, Shield, ChevronRight, Sparkles } from 'lucide-react-native';
import { Spacing } from '../../constants/theme';

export default function ProtocolScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const protocols = [
    {
      title: t.cognitiveEnhancement || 'Cognitive Enhancement',
      desc: t.cognitiveTraining || 'Personalized brain training protocols',
      icon: Brain,
      color: colors.primary,
      progress: 70
    },
    {
      title: t.focusTraining || 'Focus Training',
      desc: t.improveAttention || 'Improve concentration and attention',
      icon: Target,
      color: colors.success,
      progress: 45
    },
    {
      title: t.memoryBoost || 'Memory Boost',
      desc: t.enhanceMemory || 'Enhance memory retention',
      icon: Zap,
      color: colors.warning,
      progress: 80
    },
    {
      title: t.stressManagement || 'Stress Management',
      desc: t.buildResilience || 'Build resilience and coping skills',
      icon: Shield,
      color: colors.error,
      progress: 55
    }
  ];

  const avgProgress = Math.round(
    protocols.reduce((sum, p) => sum + p.progress, 0) / protocols.length
  );

  return (
    <LinearGradient
      colors={isDark ? ['#0a0a0f', '#14141e'] : ['#eef2ff', '#ffffff']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <MotiView
          from={{ opacity: 0, translateY: -14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.header}
        >
          <View style={styles.avatarRing}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
              <Image
                source={require('../../assets/avatars/model3.png')}
                style={styles.avatar}
              />
            </View>
            <View style={[styles.avatarBadge, { backgroundColor: colors.primary }]}>
              <Sparkles size={12} color="#FFFFFF" />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {t.smartProtocol || 'Smart Personal Protocol'}
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t.aiPoweredProtocols || 'AI powered personalized cognitive programs'}
          </Text>

          <View style={[styles.overallChip, { backgroundColor: colors.primary + '14' }]}>
            <Text style={[styles.overallChipText, { color: colors.primary }]}>
              {avgProgress}% {t.overallProgress || 'overall progress'}
            </Text>
          </View>
        </MotiView>

        {protocols.map((item, index) => (
          <MotiView
            key={index}
            from={{ opacity: 0, translateY: 24 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400, delay: 150 + index * 100 }}
          >
            <Card
              style={{
                ...styles.card,
                backgroundColor: isDark ? colors.surface : '#ffffff',
                shadowColor: item.color,
              }}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: item.color + '18' }]}>
                  <item.icon size={26} color={item.color} />
                </View>

                <View style={styles.textContent}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.progressLabel, { color: item.color }]}>
                      {item.progress}%
                    </Text>
                  </View>

                  <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                    {item.desc}
                  </Text>

                  <View style={[styles.progressBackground, { backgroundColor: isDark ? '#2A2A38' : '#e9e9f2' }]}>
                    <MotiView
                      from={{ width: '0%' }}
                      animate={{ width: `${item.progress}%` }}
                      transition={{ type: 'timing', duration: 900, delay: 300 + index * 100 }}
                      style={[styles.progress, { backgroundColor: item.color }]}
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.button, { backgroundColor: item.color }]}
              >
                <Text style={styles.buttonText}>
                  {t.startProtocol || 'Start Protocol'}
                </Text>
                <ChevronRight size={18} color="#fff" />
              </TouchableOpacity>
            </Card>
          </MotiView>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  avatar: {
    width: 100,
    height: 100,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  overallChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: Spacing.md,
  },
  overallChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    flex: 1,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 13,
  },
  progressBackground: {
    height: 6,
    borderRadius: 10,
    marginTop: 12,
    overflow: 'hidden',
  },
  progress: {
    height: 6,
    borderRadius: 10,
  },
  button: {
    marginTop: Spacing.md,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});