import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, Image } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../ui/Card';
import { MenuItem } from '../ui/MenuItem';
import { useRouter } from 'expo-router';
import { Spacing, BorderRadius } from '../../constants/theme';
import {
  Brain,
  Sparkles,
  Puzzle,
  Globe,
  User,
  Plus,
  Calendar,
  Pill,
  Video,
  Film,
  TrendingUp,
  LayoutGrid,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const menuItems = [
  { id: 'psycho', titleKey: 'psychoPhysical', icon: Puzzle, color: '#10B981', route: '/psycho' },
  { id: 'cultural', titleKey: 'culturalInterventions', icon: Globe, color: '#F59E0B', route: '/cultural' },
  { id: 'plus', titleKey: 'plusModule', icon: Plus, color: '#EF4444', route: '/(tabs)/plus' },
  { id: 'medication', titleKey: 'medicationManagement', icon: Pill, color: '#14B8A6', route: '/medication' },
  { id: 'consultation', titleKey: 'consultation', icon: Video, color: '#F97316', route: '/consultation' },
];

function getGreeting(t: any) {
  const hour = new Date().getHours();
  if (hour < 12) return t.goodMorning;
  if (hour < 18) return t.goodAfternoon;
  return t.goodEvening;
}

export function DashboardScreen() {
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);
  const refreshTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    refreshTimerRef.current = setTimeout(() => {
      setRefreshing(false);
      refreshTimerRef.current = null;
    }, 1500);
  }, []);

  React.useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400 }}
          style={styles.header}
        >
          <View style={[styles.greetingChip, { backgroundColor: colors.primary + '14' }]}>
            <Sparkles size={12} color={colors.primary} />
            <Text style={[styles.greetingText, { color: colors.primary }]}>{getGreeting(t)}</Text>
          </View>
          <Text style={[styles.dashboardTitle, { color: colors.text }]}>
            {t.dashboardNeuroTitle}
          </Text>
          <Text style={[styles.dashboardSubtitle, { color: colors.textSecondary }]}>
            {t.dashboardSubtitle}
          </Text>
        </MotiView>

        <MotiView
          from={{ opacity: 0, scale: 0.94, translateY: 14 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 450, delay: 100 }}
        >
          <LinearGradient
            colors={[colors.primary, colors.accent || colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.characterCard}
          >
            <View style={[styles.heroBlobA, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.heroBlobB, { backgroundColor: '#FFFFFF' }]} />

            <View style={styles.characterWrapper}>
              <View style={styles.avatarRing}>
                <View style={styles.avatarContainer}>
                  <Image
                    source={require('../../assets/avatars/model1.jpg')}
                    style={styles.avatar}
                  />
                </View>
              </View>
              <View style={styles.aiBadge}>
                <Sparkles size={12} color="#FFFFFF" />
              </View>
              <Text style={styles.characterTitle}>
                {t.dashboardReadyHelp}
              </Text>
              <Text style={styles.characterSubtitle}>
                {t.dashboardWellnessJourney}
              </Text>
            </View>
          </LinearGradient>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 200 }}
        >
          <Card style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={[styles.progressIconWrap, { backgroundColor: colors.primary + '18' }]}>
                <TrendingUp size={18} color={colors.primary} />
              </View>
              <Text style={[styles.progressTitle, { color: colors.text }]}>
                {t.dashboardCognitiveProgress}
              </Text>
              <Text style={[styles.progressPercent, { color: colors.primary }]}>82%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarBg, { backgroundColor: colors.border }]} />
              <MotiView
                from={{ width: '0%' }}
                animate={{ width: '82%' }}
                transition={{ type: 'timing', duration: 1100, delay: 250 }}
                style={styles.progressBarFillWrap}
              >
                <LinearGradient
                  colors={[colors.primary, colors.accent || colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.progressBarFill}
                />
              </MotiView>
            </View>
            <View style={styles.progressFooter}>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {t.dashboardKeepGoing}
              </Text>
            </View>
          </Card>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 14 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 280 }}
          style={styles.menuSectionHeader}
        >
          <LayoutGrid size={16} color={colors.textSecondary} />
          <Text style={[styles.menuSectionTitle, { color: colors.textSecondary }]}>
            {t.quickAccess}
          </Text>
        </MotiView>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <MenuItem
              key={item.id}
              titleKey={item.titleKey}
              icon={<item.icon size={24} color={item.color} />}
              color={item.color}
              onPress={() => router.push(item.route as any)}
              delay={320 + index * 60}
            />
          ))}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  greetingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 5,
    marginBottom: 8,
  },
  greetingText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dashboardTitle: {
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
  },
  dashboardSubtitle: {
    fontSize: 15,
    marginTop: 6,
    textAlign: 'center',
  },
  characterCard: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    padding: Spacing.lg,
  },
  heroBlobA: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.08,
    top: -50,
    right: -40,
  },
  heroBlobB: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    opacity: 0.08,
    bottom: -30,
    left: -30,
  },
  characterWrapper: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  avatarRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarContainer: {
    width: 118,
    height: 118,
    borderRadius: 59,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 118,
    height: 118,
  },
  aiBadge: {
    position: 'absolute',
    top: Spacing.md + 4,
    right: width / 2 - 64 - 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  characterTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: Spacing.md,
    color: '#FFFFFF',
  },
  characterSubtitle: {
    fontSize: 14,
    marginTop: 4,
    color: 'rgba(255,255,255,0.8)',
  },
  progressCard: {
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  progressIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 15,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 12,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressBarFillWrap: {
    height: '100%',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '100%',
    height: '100%',
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
  },
  progressText: {
    fontSize: 13,
  },
  menuSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuSection: {
    marginTop: Spacing.xs,
  },
  bottomSpace: {
    height: 100,
  },
});