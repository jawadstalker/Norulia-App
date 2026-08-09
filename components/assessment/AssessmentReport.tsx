import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { Zap, Lightbulb, BrainCog, Eye, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Spacing, BorderRadius } from '../../constants/theme';
import { DomainResult, CognitiveDomain } from '../../context/AssessmentContext';
import { scoreLevel } from './types';

const DOMAIN_META: Record<CognitiveDomain, { icon: any; color: string; fa: string; en: string }> = {
  speed: { icon: Zap, color: '#F59E0B', fa: 'سرعت واکنش', en: 'Reaction Speed' },
  logic: { icon: Lightbulb, color: '#8B5CF6', fa: 'استدلال منطقی', en: 'Logic & Reasoning' },
  memory: { icon: BrainCog, color: '#10B981', fa: 'حافظه کاری', en: 'Working Memory' },
  attention: { icon: Eye, color: '#3B82F6', fa: 'تمرکز و توجه', en: 'Attention & Focus' },
};

const DOMAIN_ORDER: CognitiveDomain[] = ['speed', 'logic', 'memory', 'attention'];

interface Props {
  results: DomainResult[];
  onEnterApp: () => void;
}

function Bar({ score, color }: { score: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: score, duration: 900, useNativeDriver: false }).start();
  }, [score]);
  return (
    <View style={styles.barTrack}>
      <Animated.View
        style={[
          styles.barFill,
          {
            backgroundColor: color,
            width: anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
          },
        ]}
      />
    </View>
  );
}

export default function AssessmentReport({ results, onEnterApp }: Props) {
  const { colors } = useTheme();
  const { language } = useLanguage();

  const byDomain = Object.fromEntries(results.map((r) => [r.domain, r])) as Record<CognitiveDomain, DomainResult>;
  const overall = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
    : 0;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.headerIcon, { backgroundColor: colors.primary + '22' }]}>
        <Sparkles size={34} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>
        {language === 'fa' ? 'پروفایل شناختی تو آماده است' : 'Your Cognitive Profile is Ready'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {language === 'fa'
          ? 'این یک ارزیابی سرگرم‌کننده و اولیه است، نه یک تشخیص بالینی. نورا از این پروفایل برای شخصی‌سازی برنامه‌ات استفاده می‌کند.'
          : 'This is a light, first-pass assessment, not a clinical diagnosis. Nora uses it to personalize your plan.'}
      </Text>

      <View style={[styles.overallCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.overallLabel, { color: colors.textSecondary }]}>
          {language === 'fa' ? 'امتیاز کلی' : 'Overall Score'}
        </Text>
        <Text style={[styles.overallScore, { color: colors.primary }]}>{overall}</Text>
        <Text style={[styles.overallTier, { color: colors.textSecondary }]}>{scoreLevel(overall, language)}</Text>
      </View>

      <View style={styles.domainsWrap}>
        {DOMAIN_ORDER.map((domain) => {
          const result = byDomain[domain];
          const meta = DOMAIN_META[domain];
          const Icon = meta.icon;
          const score = result?.score ?? 0;
          return (
            <View key={domain} style={[styles.domainCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.domainHeader}>
                <View style={[styles.domainIcon, { backgroundColor: meta.color + '22' }]}>
                  <Icon size={20} color={meta.color} />
                </View>
                <View style={styles.domainHeaderText}>
                  <Text style={[styles.domainTitle, { color: colors.text }]}>
                    {language === 'fa' ? meta.fa : meta.en}
                  </Text>
                  {!!result?.detail && (
                    <Text style={[styles.domainDetail, { color: colors.textTertiary }]}>{result.detail}</Text>
                  )}
                </View>
                <Text style={[styles.domainScore, { color: meta.color }]}>{score}</Text>
              </View>
              <Bar score={score} color={meta.color} />
              <Text style={[styles.domainTier, { color: colors.textSecondary }]}>{scoreLevel(score, language)}</Text>
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={[styles.enterButton, { backgroundColor: colors.primary }]} onPress={onEnterApp}>
        <Text style={styles.enterButtonText}>
          {language === 'fa' ? 'ورود به اپ' : 'Enter the App'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xxl, paddingTop: Spacing.sm },
  headerIcon: {
  
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: Spacing.lg },
  overallCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  overallLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  overallScore: { fontSize: 44, fontWeight: '900' },
  overallTier: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  domainsWrap: { width: '100%', gap: 12 },
  domainCard: {
    width: '100%',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: 4,
  },
  domainHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
  domainIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  domainHeaderText: { flex: 1, marginHorizontal: Spacing.sm },
  domainTitle: { fontSize: 15, fontWeight: '700' },
  domainDetail: { fontSize: 11, marginTop: 2 },
  domainScore: { fontSize: 20, fontWeight: '900' },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: 'rgba(128,128,128,0.15)' },
  barFill: { height: '100%', borderRadius: 4 },
  domainTier: { fontSize: 11, fontWeight: '600', marginTop: 6 },
  enterButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  enterButtonText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
