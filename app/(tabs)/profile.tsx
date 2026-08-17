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
  const { colors } = useTheme();
  const { t, isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const router = useRouter();

  const ChevronIcon = isRTL
    ? ChevronLeft
    : ChevronRight;

  const stats = [
    {
      label: t.level,
      value: user?.level || 1,
      icon: Trophy,
      color: colors.warning,
    },
    {
      label: t.streak,
      value: user?.streak || 0,
      icon: Flame,
      color: colors.error,
    },
    {
      label: t.xp,
      value: user?.xp || 0,
      icon: Star,
      color: colors.primary,
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
      {/* =====================================================
          PROFILE HERO
      ===================================================== */}

<LinearGradient
  colors={[
    '#242052',
    '#38306F',
  ]}
  start={{
    x: 0,
    y: 0,
  }}
  end={{
    x: 1,
    y: 1,
  }}
  style={styles.hero}
>
        {/* =================================================
            CHARACTER

            فقط خود PNG
            بدون دایره
            بدون glow
            بدون border
            بدون background
            بدون star
        ================================================= */}

        <MotiView
          from={{
            opacity: 0,
            translateY: 24,
            scale: 0.82,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
            scale: 1,
          }}
          transition={{
            type: 'spring',
            damping: 14,
            stiffness: 120,
            mass: 0.8,
          }}
          style={styles.characterContainer}
        >
          <Image
            source={require(
              '../../assets/avatars/Head.png'
            )}
            style={styles.characterHead}
          />
        </MotiView>

        {/* =================================================
            USER INFORMATION
        ================================================= */}

        <MotiView
          from={{
            opacity: 0,
            translateY: 12,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 450,
            delay: 180,
          }}
        >
          <Text style={styles.userName}>
            {user?.name || t.appName}
          </Text>

          <Text style={styles.email}>
            {user?.email || 'user@neurolia.app'}
          </Text>
        </MotiView>
      </LinearGradient>

      {/* =====================================================
          BODY
      ===================================================== */}

      <View
        style={[
          styles.body,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        {/* ===================================================
            STATISTICS
        =================================================== */}

        <View style={styles.statsRow}>
          {stats.map((stat, index) => {
            const StatIcon = stat.icon;

            return (
              <MotiView
                key={index}
                from={{
                  opacity: 0,
                  translateY: 16,
                }}
                animate={{
                  opacity: 1,
                  translateY: 0,
                }}
                transition={{
                  type: 'timing',
                  duration: 400,
                  delay: 150 + index * 90,
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
                        backgroundColor:
                          stat.color + '18',
                      },
                    ]}
                  >
                    <StatIcon
                      size={18}
                      color={stat.color}
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
                        color:
                          colors.textSecondary,
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

        {/* ===================================================
            MENU
        =================================================== */}

        <MotiView
          from={{
            opacity: 0,
            translateY: 16,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 400,
            delay: 420,
          }}
        >
          <Card style={styles.menuCard}>
            {/* Settings */}

            <TouchableOpacity
              onPress={() =>
                router.push('/settings')
              }
              style={styles.menuItem}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconWrap,
                  {
                    backgroundColor:
                      colors.primary + '18',
                  },
                ]}
              >
                <Settings
                  size={19}
                  color={colors.primary}
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

            {/* Divider */}

            <View
              style={[
                styles.menuDivider,
                {
                  backgroundColor:
                    colors.border,
                },
              ]}
            />

            {/* Privacy */}

            <View style={styles.menuItem}>
              <View
                style={[
                  styles.menuIconWrap,
                  {
                    backgroundColor:
                      (colors.success ||
                        colors.primary) + '18',
                  },
                ]}
              >
                <Shield
                  size={19}
                  color={
                    colors.success ||
                    colors.primary
                  }
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

        {/* ===================================================
            LOGOUT
        =================================================== */}

        <MotiView
          from={{
            opacity: 0,
            translateY: 16,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 400,
            delay: 500,
          }}
        >
          <TouchableOpacity
            onPress={logout}
            style={[
              styles.logoutButton,
              {
                backgroundColor:
                  colors.error + '12',
                borderColor:
                  colors.error + '30',
              },
            ]}
            activeOpacity={0.75}
          >
            <LogOut
              size={19}
              color={colors.error}
            />

            <Text
              style={[
                styles.logoutText,
                {
                  color: colors.error,
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

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
  },

  content: {
    paddingBottom: 100,
  },

  /* =======================================================
     HERO BACKGROUND
     
     این قسمت عمداً باقی مانده است.
     فقط دایره‌ها حذف شده‌اند.
  ======================================================= */

  hero: {
    marginHorizontal: Spacing.lg,

    marginTop: Spacing.lg,

    paddingTop: 28,

    paddingBottom: 36,

    paddingHorizontal: Spacing.lg,

    alignItems: 'center',

    borderRadius: 32,

    overflow: 'hidden',

    borderWidth: 1,

    borderColor:
      'rgba(255,255,255,0.14)',

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 10,
    },

    shadowOpacity: 0.15,

    shadowRadius: 20,

    elevation: 8,
  },

  /* =======================================================
     CHARACTER
  ======================================================= */

  characterContainer: {
    width: 145,

    height: 145,

    alignItems: 'center',

    justifyContent: 'center',

    marginBottom: 2,
  },

  characterHead: {
    width: 180,

    height: 170,

    resizeMode: 'contain',
  },

  /* =======================================================
     USER INFORMATION
  ======================================================= */

  userName: {
    fontSize: 22,

    fontWeight: '700',

    color: '#FFFFFF',

    textAlign: 'center',

    marginTop: Spacing.md,
  },

  email: {
    fontSize: 13,

    color:
      'rgba(255,255,255,0.72)',

    textAlign: 'center',

    marginTop: 4,
  },

  /* =======================================================
     BODY
  ======================================================= */

  body: {
    paddingHorizontal: Spacing.lg,

    paddingTop: Spacing.lg,
  },

  /* =======================================================
     STATS
  ======================================================= */

  statsRow: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

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

  /* =======================================================
     MENU
  ======================================================= */

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

  /* =======================================================
     LOGOUT
  ======================================================= */

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