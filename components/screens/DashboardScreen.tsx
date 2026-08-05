import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, Image } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../ui/Card';
import { MenuItem } from '../ui/MenuItem';
import { useRouter } from 'expo-router';
import { Spacing, BorderRadius } from '../../constants/theme';
import {
  ClipboardCheck,
  Brain,
  Sparkles,
  Puzzle,
  Globe,
  User,
  Plus,
  Calendar,
  Pill,
  Video,
  TrendingUp,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const menuItems = [
  { id: 'assessment', titleKey: 'assessment', icon: ClipboardCheck, color: '#7C3AED', route: '/assessment' },
  { id: 'ai', titleKey: 'aiAssistant', icon: Sparkles, color: '#EC4899', route: '/ai' },
  { id: 'protocol', titleKey: 'smartProtocol', icon: Brain, color: '#3B82F6', route: '/protocol' },
  { id: 'psycho', titleKey: 'psychoPhysical', icon: Puzzle, color: '#10B981', route: '/psycho' },
  { id: 'cultural', titleKey: 'culturalInterventions', icon: Globe, color: '#F59E0B', route: '/cultural' },
  { id: 'profile', titleKey: 'userProfile', icon: User, color: '#6366F1', route: '/profile' },
  { id: 'plus', titleKey: 'plusModule', icon: Plus, color: '#EF4444', route: '/plus' },
  { id: 'program', titleKey: 'programManagement', icon: Calendar, color: '#8B5CF6', route: '/program' },
  { id: 'medication', titleKey: 'medicationManagement', icon: Pill, color: '#14B8A6', route: '/medication' },
  { id: 'consultation', titleKey: 'consultation', icon: Video, color: '#F97316', route: '/consultation' },
];

export function DashboardScreen() {
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
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
          <Text style={[styles.dashboardTitle, { color: colors.text }]}>
            Neuro AI Companion
          </Text>
          <Text style={[styles.dashboardSubtitle, { color: colors.textSecondary }]}>
            Your personal cognitive wellness assistant
          </Text>
        </MotiView>

        <Card style={styles.characterCard}>
          <View style={styles.characterWrapper}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
              <Image
                source={require('../../assets/avatars/model1.jpg')}
                style={styles.avatar}
              />
            </View>
            <Text style={[styles.characterTitle, { color: colors.text }]}>
              Ready to help you today
            </Text>
            <Text style={[styles.characterSubtitle, { color: colors.textSecondary }]}>
              AI guided wellness journey
            </Text>
          </View>
        </Card>

        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <TrendingUp size={20} color={colors.primary} />
            <Text style={[styles.progressTitle, { color: colors.text }]}>
              Cognitive wellness progress
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarBg, { backgroundColor: colors.border }]} />
            <MotiView
              from={{ width: 0 }}
              animate={{ width: `82%` }}
              transition={{ type: 'timing', duration: 1000 }}
              style={[styles.progressBarFill, { backgroundColor: colors.primary }]}
            />
          </View>
          <View style={styles.progressFooter}>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              82% Complete
            </Text>
          </View>
        </Card>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <MenuItem
              key={item.id}
              titleKey={item.titleKey}
              icon={<item.icon size={24} color={item.color} />}
              color={item.color}
              onPress={() => router.push(item.route as any)}
              delay={index * 50}
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
  },
  characterWrapper: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
  },
  characterTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  characterSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  progressCard: {
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.sm,
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
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
  },
  progressText: {
    fontSize: 13,
  },
  menuSection: {
    marginTop: Spacing.sm,
  },
  bottomSpace: {
    height: 100,
  },
});