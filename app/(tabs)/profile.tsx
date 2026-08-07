import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Settings, LogOut, Trophy, Flame, Star, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { Spacing, BorderRadius } from '../../constants/theme';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const router = useRouter();

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const stats = [
    { label: t.level, value: user?.level || 1, icon: Trophy, color: colors.warning },
    { label: t.streak, value: user?.streak || 0, icon: Flame, color: colors.error },
    { label: 'XP', value: user?.xp || 0, icon: Star, color: colors.primary },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
          <Image
            source={require('../../assets/avatars/model 2.jpg')}
            style={styles.profileAvatar}
          />
        </View>

        <Text style={[styles.userName, { color: colors.text }]}>
          {user?.name || t.appName}
        </Text>

        <Text style={[styles.email, { color: colors.textSecondary }]}>
          {user?.email || 'user@neurolia.app'}
        </Text>

        <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
          <Star size={14} color={colors.primary}/>
          <Text style={[styles.badgeText, { color: colors.primary }]}>
            Premium Member
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        {stats.map((stat, index) => (
          <Card key={index} style={styles.statCard} padding="sm">
            <stat.icon size={20} color={stat.color} />
            <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
          </Card>
        ))}
      </View>

      <Card style={styles.menuCard}>
        <TouchableOpacity
          onPress={() => router.push('/settings')}
          style={styles.menuItem}
        >
          <Settings size={22} color={colors.primary} />
          <Text style={[styles.menuText, { color: colors.text }]}>{t.settings}</Text>
          <ChevronIcon size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      </Card>

      <TouchableOpacity
        onPress={logout}
        style={[styles.logoutButton, { backgroundColor: colors.error + '15' }]}
      >
        <LogOut size={20} color={colors.error} />
        <Text style={[styles.logoutText, { color: colors.error }]}>{t.logout}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
    paddingTop : 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  email: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: Spacing.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  menuCard: {
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: Spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});