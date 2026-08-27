import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

import { Card } from '../../components/ui/Card';

import {
  Settings,
  LogOut,
  Trophy,
  Flame,
  Star,
  ChevronRight,
  ChevronLeft,
  Shield,
} from 'lucide-react-native';

import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';

import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { colors, isDark, isAthlete, theme } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const router = useRouter();

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const iconColor = isAthlete
    ? '#22C55E'
    : isDark
    ? 'rgba(73, 194, 226, 1)'
    : '#6B5AA6';

  const bgColor = isAthlete
    ? 'rgba(34,197,94,0.10)'
    : isDark
    ? 'rgba(73, 194, 226, 0.15)'
    : 'rgba(107,90,166,0.10)';

  const stats = [
    {
      label: t.level,
      value: user?.level || 1,
      icon: Trophy,
    },
    {
      label: t.streak,
      value: user?.streak || 0,
      icon: Flame,
    },
    {
      label: t.xp,
      value: user?.xp || 0,
      icon: Star,
    },
  ];

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['rgba(73, 194, 226, 1)', 'rgba(73, 194, 226, 0.7)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.hero,
          {
            borderColor: isDark
              ? 'rgba(255,255,255,0.10)'
              : 'rgba(73, 194, 226, 0.20)',
            shadowColor: '#000000',
            shadowOpacity: isDark ? 0.20 : 0.15,
            elevation: isDark ? 8 : 5,
          },
        ]}
      >
        <View style={styles.characterStage}>
          <MotiView
            from={{
              opacity: 0,
              translateY: 30,
              scale: 0.82,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
              scale: 1,
            }}
            transition={{
              type: 'spring',
              damping: 13,
              stiffness: 120,
              mass: 0.8,
            }}
            style={styles.characterWrapper}
          >
            <Image
              source={require('../../assets/avatars/model8.png')}
              style={styles.characterHead}
            />
          </MotiView>
        </View>

        <MotiView
          from={{
            opacity: 0,
            translateY: 14,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 450,
            delay: 220,
          }}
          style={styles.userInfo}
        >
          <Text
            style={[
              styles.userName,
              {
                color: '#FFFFFF',
              },
            ]}
          >
            {user?.name || t.appName}
          </Text>

          <Text
            style={[
              styles.email,
              {
                color: 'rgba(255,255,255,0.85)',
              },
            ]}
          >
            {user?.email || 'user@neurolia.app'}
          </Text>

          <View
            style={[
              styles.profileAccent,
              {
                backgroundColor: 'rgba(255,255,255,0.30)',
              },
            ]}
          >
            <View
              style={[
                styles.profileAccentDot,
                {
                  backgroundColor: '#FFFFFF',
                },
              ]}
            />
          </View>
        </MotiView>
      </LinearGradient>

      <View
        style={[
          styles.body,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <View style={styles.statsRow}>
          {stats.map((stat, index) => {
            const StatIcon = stat.icon;

            return (
              <MotiView
                key={index}
                from={{
                  opacity: 0,
                  translateY: 16,
                  scale: 0.96,
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                  scale: 1,
                }}
                transition={{
                  type: 'timing',
                  duration: 400,
                  delay: 250 + index * 90,
                }}
                style={styles.statWrap}
              >
                <Card
                  style={styles.statCard}
                  padding="sm"
                >
                  <View
                    style={[
                      styles.statIconWrap,
                      {
                        backgroundColor: bgColor,
                      },
                    ]}
                  >
                    <StatIcon
                      size={18}
                      color={iconColor}
                    />
                  </View>

                  <Text
                    style={[
                      styles.statValue,
                      {
                        color: colors.text,
                      },
                    ]}
                  >
                    {stat.value}
                  </Text>

                  <Text
                    style={[
                      styles.statLabel,
                      {
                        color: colors.textSecondary,
                      },
                    ]}
                  >
                    {stat.label}
                  </Text>
                </Card>
              </MotiView>
            );
          })}
        </View>

        <MotiView
          from={{
            opacity: 0,
            translateY: 18,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 450,
            delay: 540,
          }}
        >
          <Card style={styles.menuCard}>
            <TouchableOpacity
              onPress={() => router.push('/settings')}
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconWrap,
                  {
                    backgroundColor: bgColor,
                  },
                ]}
              >
                <Settings
                  size={19}
                  color={iconColor}
                />
              </View>

              <Text
                style={[
                  styles.menuText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {t.settings}
              </Text>

              <ChevronIcon
                size={19}
                color={colors.textTertiary}
              />
            </TouchableOpacity>

            <View
              style={[
                styles.menuDivider,
                {
                  backgroundColor: colors.border,
                },
              ]}
            />

            <View style={styles.menuItem}>
              <View
                style={[
                  styles.menuIconWrap,
                  {
                    backgroundColor: bgColor,
                  },
                ]}
              >
                <Shield
                  size={19}
                  color={iconColor}
                />
              </View>

              <Text
                style={[
                  styles.menuText,
                  {
                    color: colors.text,
                  },
                ]}
              >
                {t.privacySecurity}
              </Text>

              <ChevronIcon
                size={19}
                color={colors.textTertiary}
              />
            </View>
          </Card>
        </MotiView>

        <MotiView
          from={{
            opacity: 0,
            translateY: 18,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 450,
            delay: 620,
          }}
        >
          <TouchableOpacity
            onPress={logout}
            style={[
              styles.logoutButton,
              {
                backgroundColor: isAthlete
                  ? 'rgba(34,197,94,0.12)'
                  : isDark
                  ? 'rgba(73, 194, 226, 0.12)'
                  : colors.error + '12',
                borderColor: isAthlete
                  ? 'rgba(34,197,94,0.30)'
                  : isDark
                  ? 'rgba(73, 194, 226, 0.30)'
                  : colors.error + '30',
              },
            ]}
            activeOpacity={0.75}
          >
            <LogOut
              size={19}
              color={isAthlete ? '#22C55E' : isDark ? 'rgba(73, 194, 226, 1)' : colors.error}
            />

            <Text
              style={[
                styles.logoutText,
                {
                  color: isAthlete ? '#22C55E' : isDark ? 'rgba(73, 194, 226, 1)' : colors.error,
                },
              ]}
            >
              {t.logout}
            </Text>
          </TouchableOpacity>
        </MotiView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    flex: 1,
  },

  content: {
    paddingBottom: 100,
  },

  hero: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    paddingTop: 20,
    paddingBottom: 34,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },

  characterStage: {
    width: 190,
    height: 175,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  characterWrapper: {
    width: 175,
    height: 175,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  characterHead: {
    width: 175,
    height: 175,
    resizeMode: 'contain',
  },

  userInfo: {
    alignItems: 'center',
  },

  userName: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  email: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },

  profileAccent: {
    width: 42,
    height: 2,
    marginTop: 12,
    borderRadius: 2,
    alignItems: 'flex-end',
  },

  profileAccentDot: {
    width: 10,
    height: 2,
    borderRadius: 2,
  },

  body: {
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
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
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