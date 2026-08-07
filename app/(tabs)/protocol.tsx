import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../../components/ui/Card';
import { Brain, Target, Zap, Shield, ChevronRight } from 'lucide-react-native';
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

  return (
    <LinearGradient
      colors={isDark ? ['#0a0a0f', '#14141e'] : ['#eef2ff', '#ffffff']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
            <Image
              source={require('../../assets/avatars/model3.png')}
              style={styles.avatar}
            />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            {t.smartProtocol || 'Smart Personal Protocol'}
          </Text>

          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t.aiPoweredProtocols || 'AI powered personalized cognitive programs'}
          </Text>
        </View>

        {protocols.map((item, index) => (
          <MotiView
            key={index}
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 100 }}
          >
            <Card style={{ ...styles.card, backgroundColor: isDark ? colors.surface : '#ffffff' }}>
              <View style={styles.cardHeader}>
                <View style={[
                  styles.iconBox,
                  { backgroundColor: item.color + '20' }
                ]}>
                  <item.icon size={30} color={item.color} />
                </View>

                <View style={styles.textContent}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {item.title}
                  </Text>

                  <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                    {item.desc}
                  </Text>

                  <View style={[styles.progressBackground, { backgroundColor: isDark ? '#333' : '#ddd' }]}>
                    <View
                      style={[
                        styles.progress,
                        {
                          width: `${item.progress}%`,
                          backgroundColor: item.color
                        }
                      ]}
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: item.color }
                ]}
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
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  card: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContent: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  cardDesc: {
    fontSize: 14,
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