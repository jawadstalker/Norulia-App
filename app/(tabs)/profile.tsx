import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Settings, LogOut, Trophy, Flame, Star, ChevronRight, ChevronLeft, Sparkles, Shield } from 'lucide-react-native';
import { Spacing, BorderRadius } from '../../constants/theme';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

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
      <LinearGradient
        colors={[colors.primary, colors.accent || colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={[styles.heroBlobA, { backgroundColor: '#FFFFFF' }]} />
        <View style={[styles.heroBlobB, { backgroundColor: '#FFFFFF' }]} />

        <MotiView
          from={{ opacity: 0, scale: 0.85, translateY: 12 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          transition={{ type: 'spring', damping: 14, stiffness: 140 }}
        >
          <LinearGradient
            colors={['#FFFFFF', 'rgba(255,255,255,0.4)']}
            style={styles.avatarRing}
          >
            <View style={styles.avatarInner}>
              <Image
                source={require('../../assets/avatars/model 2.jpg')}
                style={styles.profileAvatar}
              />
            </View>
          </LinearGradient>

          <View style={[styles.crownBadge, { backgroundColor: colors.warning }]}>
            <Star size={13} color="#FFFFFF" fill="#FFFFFF" />
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 450, delay: 120 }}
        >
          <Text style={styles.userName}>{user?.name || t.appName}</Text>
          <Text style={styles.email}>{user?.email || 'user@neurolia.app'}</Text>

          <View style={styles.badge}>
            <Sparkles size={13} color="#FFFFFF" />
            <Text style={styles.badgeText}>Premium Member</Text>
          </View>
        </MotiView>
      </LinearGradient>

      <View style={[styles.body, { backgroundColor: colors.background }]}>
        <View style={styles.statsRow}>
          {stats.map((stat, index) => (
            <MotiView
              key={index}
              from={{ opacity: 0, translateY: 16 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 400, delay: 150 + index * 90 }}
              style={styles.statWrap}
            >
              <Card style={styles.statCard} padding="sm">
                <View style={[styles.statIconWrap, { backgroundColor: stat.color + '18' }]}>
                  <stat.icon size={18} color={stat.color} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              </Card>
            </MotiView>
          ))}
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 420 }}
        >
          <Card style={styles.menuCard}>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconWrap, { backgroundColor: colors.primary + '18' }]}>
                <Settings size={19} color={colors.primary} />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>{t.settings}</Text>
              <ChevronIcon size={19} color={colors.textTertiary} />
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

            <View style={styles.menuItem}>
              <View style={[styles.menuIconWrap, { backgroundColor: colors.success + '18' || colors.primary + '18' }]}>
                <Shield size={19} color={colors.success || colors.primary} />
              </View>
              <Text style={[styles.menuText, { color: colors.text }]}>Privacy & Security</Text>
              <ChevronIcon size={19} color={colors.textTertiary} />
            </View>
          </Card>
        </MotiView>

        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 500 }}
        >
          <TouchableOpacity
            onPress={logout}
            style={[styles.logoutButton, { backgroundColor: colors.error + '12', borderColor: colors.error + '30' }]}
            activeOpacity={0.75}
          >
            <LogOut size={19} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>{t.logout}</Text>
          </TouchableOpacity>
        </MotiView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  hero: {
    width,
    paddingTop: 80,
    paddingBottom: 56,
    alignItems: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  heroBlobA: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.08,
    top: -60,
    right: -40,
  },
  heroBlobB: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.08,
    bottom: -30,
    left: -30,
  },
  avatarRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  avatarInner: {
    width: 118,
    height: 118,
    borderRadius: 59,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  profileAvatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  crownBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  email: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    marginTop: 3,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: Spacing.sm,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  body: {
    marginTop: -28,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statWrap: {
    flex: 1,
    marginHorizontal: 4,
  },
  statCard: {
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 19,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  menuCard: {
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
  },
});