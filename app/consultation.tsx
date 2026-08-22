import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  Image,
} from 'react-native';

import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import {
  ArrowLeft,
  Stethoscope,
  Phone,
  Clock,
  ShieldCheck,
} from 'lucide-react-native';
import { ColorValue } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Spacing,
  BorderRadius,
} from '../constants/theme';

const CONSULT_PHONE = '09037661174';

export default function ConsultationScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { isRTL } = useLanguage();

  // ============================================================
  // TEXTS
  // ============================================================

  const TEXTS = {
    headerTitle: isRTL
      ? 'مشاوره تخصصی'
      : 'Expert Consultation',

    speechHello: isRTL
      ? 'سلام، من'
      : "Hello, I'm",

    speechName: 'نورولیا',

    speechSub: isRTL
      ? 'در این بخش مشاوره تخصصی در انتظار شماست'
      : 'In this section, expert consultation awaits you',

    cardTitle: isRTL
      ? 'جلسات مشاوره تخصصی'
      : 'Expert Consultation Sessions',

    cardDesc: isRTL
      ? 'درخواست جلسه مشاوره ماهانه با متخصص را ثبت کنید. پس از ثبت، تیم پشتیبانی برای هماهنگی زمان با شما تماس می‌گیرد.'
      : 'Request a monthly consultation session with a specialist. After registration, our support team will contact you to schedule the time.',

    btnText: isRTL
      ? 'درخواست مشاوره'
      : 'Request Consultation',

    hoursLabel: isRTL
      ? 'ساعات پاسخگویی:'
      : 'Support Hours:',

    hoursDays: isRTL
      ? 'شنبه تا پنجشنبه'
      : 'Saturday to Thursday',

    hoursTime: isRTL
      ? '• ۹:۰۰ تا ۱۸:۰۰'
      : '• 9:00 AM - 6:00 PM',

    infoBadge: isRTL
      ? 'ویژه کاربران دارای اشتراک فعال'
      : 'For users with active subscription',

    infoText: isRTL
      ? 'برای دریافت مشاوره تخصصی و پیگیری درمان'
      : 'To receive expert consultation and follow up on treatment',
  };

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    Haptics.impactAsync(
      Haptics.ImpactFeedbackStyle.Light,
    ).catch(() => {});

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  // ============================================================
  // CONSULTATION
  // ============================================================

  const handleRequestConsultation = () => {
    Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => {});

    Linking.openURL(
      `tel:${CONSULT_PHONE}`,
    ).catch(() => {});
  };

  // ============================================================
  // COLOR HELPERS
  // ============================================================

  /**
   * از رنگ اصلی تم برای ساخت یک نسخه شفاف استفاده می‌کنیم.
   * این باعث می‌شود در Light و Dark هر دو با پالت اصلی اپ
   * هماهنگ باقی بماند.
   */
  const primarySoft = isDark
    ? `${colors.primary}20`
    : `${colors.primary}12`;

  const primaryMedium = isDark
    ? `${colors.primary}30`
    : `${colors.primary}18`;

  const backgroundGradient = isDark
    ? [
        colors.background,
        colors.background,
      ]
    : [
        colors.background,
        colors.background,
      ];

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <LinearGradient
      colors={backgroundGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView
        style={styles.safeArea}
        edges={['top', 'bottom']}
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <MotiView
          from={{
            opacity: 0,
            translateY: -12,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
          }}
          transition={{
            type: 'timing',
            duration: 450,
          }}
          style={styles.header}
        >
          <View
            style={styles.headerTitleContainer}
          >
            <Text
              style={[
                styles.headerTitle,
                {
                  color: colors.text,
                },
              ]}
            >
              {TEXTS.headerTitle}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleBack}
            activeOpacity={0.7}
            style={[
              styles.backButton,
              {
                backgroundColor:
                  colors.surface,
                borderColor:
                  colors.border,
                shadowColor:
                  colors.text,
              },
            ]}
            hitSlop={{
              top: 10,
              bottom: 10,
              left: 10,
              right: 10,
            }}
          >
            <ArrowLeft
              size={23}
              color={colors.text}
              strokeWidth={2.4}
            />
          </TouchableOpacity>
        </MotiView>

        {/* ======================================================
            CONTENT
        ====================================================== */}

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                Spacing.xl +
                Spacing.lg,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* ====================================================
              HERO
          ==================================================== */}

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
              duration: 500,
              delay: 100,
            }}
            style={styles.hero}
          >
            {/* Avatar */}

            <View
              style={[
                styles.avatarWrap,
                {
                  borderColor:
                    colors.primary,
                  backgroundColor:
                    colors.surface,
                  shadowColor:
                    colors.primary,
                },
              ]}
            >
              <Image
                source={require('../assets/avatars/model1.jpg')}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>

            {/* Speech Bubble */}

            <View
              style={[
                styles.speechBubble,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.speechLine1,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {TEXTS.speechHello}{' '}
                <Text
                  style={{
                    color:
                      colors.primary,
                  }}
                >
                  {TEXTS.speechName}
                </Text>{' '}
                {isRTL ? 'هستم' : ''}
              </Text>

              <Text
                style={[
                  styles.speechLine2,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                {TEXTS.speechSub}
              </Text>
            </View>
          </MotiView>

          {/* ====================================================
              CONSULTATION CARD
          ==================================================== */}

          <MotiView
            from={{
              opacity: 0,
              translateY: 24,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              translateY: 0,
              scale: 1,
            }}
            transition={{
              type: 'timing',
              duration: 500,
              delay: 200,
            }}
            style={[
              styles.card,
              {
                backgroundColor:
                  colors.surface,
                shadowColor:
                  colors.primary,
              },
            ]}
          >
            {/* Card Title */}

            <View
              style={styles.titleRow}
            >
              <View
                style={[
                  styles.iconBadge,
                  {
                    backgroundColor:
                      primarySoft,
                    borderColor:
                      primaryMedium,
                  },
                ]}
              >
                <Stethoscope
                  size={24}
                  color={
                    colors.primary
                  }
                  strokeWidth={2}
                />
              </View>

              <Text
                style={[
                  styles.cardTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              >
                {TEXTS.cardTitle}
              </Text>
            </View>

            {/* Description */}

            <Text
              style={[
                styles.cardDesc,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              {TEXTS.cardDesc}
            </Text>

            {/* ==================================================
                REQUEST BUTTON
            ================================================== */}

            <TouchableOpacity
              onPress={
                handleRequestConsultation
              }
              activeOpacity={0.85}
              style={[
                styles.requestButtonWrap,
                {
                  shadowColor:
                    colors.primary,
                },
              ]}
            >
              <LinearGradient
                colors={[
                  colors.primary,
                  colors.primary,
                ]}
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 0,
                }}
                style={
                  styles.requestButton
                }
              >
                <Phone
                  size={21}
                  color="#FFFFFF"
                  strokeWidth={2.2}
                />

                <Text
                  style={
                    styles.requestButtonText
                  }
                >
                  {TEXTS.btnText}
                </Text>

                <ArrowLeft
                  size={19}
                  color="rgba(255,255,255,0.65)"
                  strokeWidth={2.3}
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* ==================================================
                HOURS
            ================================================== */}

            <View
              style={styles.hoursRow}
            >
              <Clock
                size={14}
                color={
                  colors.textTertiary
                }
                strokeWidth={2}
              />

              <Text
                style={[
                  styles.hoursText,
                  {
                    color:
                      colors.textTertiary,
                  },
                ]}
              >
                {TEXTS.hoursLabel}{' '}

                <Text
                  style={{
                    color:
                      colors.primary,
                  }}
                >
                  {TEXTS.hoursDays}
                </Text>{' '}

                {TEXTS.hoursTime}
              </Text>
            </View>

            {/* ==================================================
                INFO BOX
            ================================================== */}

            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor:
                    colors.surfaceSecondary,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.infoIcon,
                  {
                    backgroundColor:
                      colors.success +
                      '15',
                  },
                ]}
              >
                <ShieldCheck
                  size={17}
                  color={
                    colors.success
                  }
                  strokeWidth={2}
                />
              </View>

              <Text
                style={[
                  styles.infoText,
                  {
                    color:
                      colors.textSecondary,
                  },
                ]}
              >
                <Text
                  style={{
                    color:
                      colors.success,
                    fontWeight: '700',
                  }}
                >
                  {TEXTS.infoBadge}
                </Text>

                {'\n'}

                {TEXTS.infoText}
              </Text>
            </View>
          </MotiView>

          {/* ====================================================
              SMALL FOOTER
          ==================================================== */}

          <MotiView
            from={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              type: 'timing',
              duration: 500,
              delay: 400,
            }}
            style={styles.footer}
          >
            <View
              style={[
                styles.footerLine,
                {
                  backgroundColor:
                    colors.border,
                },
              ]}
            />

            <Text
              style={[
                styles.footerText,
                {
                  color:
                    colors.textTertiary,
                },
              ]}
            >
              {isRTL
                ? 'نورولیا • همراه شما در مسیر بهتر شدن'
                : 'Neurolia • Supporting you on your journey'}
            </Text>
          </MotiView>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    minHeight: 58,

    flexDirection:
      'row-reverse',

    alignItems: 'center',

    justifyContent:
      'space-between',

    paddingHorizontal:
      Spacing.md,

    paddingTop: 8,

    paddingBottom:
      Spacing.xs,
  },

  headerTitleContainer: {
    flex: 1,

    alignItems:
      'flex-end',

    justifyContent:
      'center',
  },

  headerTitle: {
    fontSize: 18,

    fontWeight: '800',

    textAlign: 'right',
  },

  backButton: {
    width: 42,

    height: 42,

    borderRadius:
      BorderRadius.full,

    borderWidth: 1,

    alignItems:
      'center',

    justifyContent:
      'center',

    marginLeft:
      Spacing.xs,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.06,

    shadowRadius: 6,

    elevation: 2,
  },

  // ==========================================================
  // SCROLL
  // ==========================================================

  scrollContent: {
    paddingHorizontal:
      Spacing.md,

    paddingTop:
      Spacing.md,

    alignItems:
      'center',
  },

  // ==========================================================
  // HERO
  // ==========================================================

  hero: {
    flexDirection:
      'row-reverse',

    alignItems:
      'center',

    width: '100%',

    marginTop:
      Spacing.sm,

    marginBottom:
      Spacing.lg,

    gap: Spacing.sm,
  },

  avatarWrap: {
    width: 92,

    height: 92,

    borderRadius: 46,

    borderWidth: 2,

    alignItems:
      'center',

    justifyContent:
      'center',

    overflow: 'hidden',

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.20,

    shadowRadius: 18,

    elevation: 7,
  },

  avatarImage: {
    width: '100%',

    height: '100%',
  },

  speechBubble: {
    flex: 1,

    borderWidth: 1,

    borderRadius:
      BorderRadius.xl,

    borderTopRightRadius: 6,

    padding:
      Spacing.md,

    minHeight: 86,

    justifyContent:
      'center',
  },

  speechLine1: {
    fontSize: 15,

    fontWeight: '700',

    textAlign: 'right',

    lineHeight: 22,
  },

  speechLine2: {
    fontSize: 12,

    textAlign: 'right',

    marginTop: 4,

    lineHeight: 18,
  },

  // ==========================================================
  // CARD
  // ==========================================================

  card: {
    width: '100%',

    borderRadius:
      BorderRadius.xl,

    padding:
      Spacing.lg,

    gap: Spacing.md,

    shadowOffset: {
      width: 0,
      height: 8,
    },

    shadowOpacity: 0.10,

    shadowRadius: 24,

    elevation: 5,
  },

  titleRow: {
    flexDirection:
      'row-reverse',

    alignItems:
      'center',

    justifyContent:
      'center',

    gap: Spacing.sm,
  },

  iconBadge: {
    width: 48,

    height: 48,

    borderRadius: 24,

    borderWidth: 1,

    alignItems:
      'center',

    justifyContent:
      'center',
  },

  cardTitle: {
    flex: 1,

    fontSize: 20,

    fontWeight: '800',

    textAlign: 'right',
  },

  cardDesc: {
    fontSize: 14,

    textAlign: 'center',

    lineHeight: 24,

    fontWeight: '400',

    paddingHorizontal:
      Spacing.xs,
  },

  // ==========================================================
  // BUTTON
  // ==========================================================

  requestButtonWrap: {
    borderRadius:
      BorderRadius.full,

    overflow: 'hidden',

    ...Platform.select({
      ios: {
        shadowOffset: {
          width: 0,
          height: 6,
        },

        shadowOpacity: 0.28,

        shadowRadius: 16,
      },

      android: {
        elevation: 6,
      },

      default: {},
    }),
  },

  requestButton: {
    flexDirection:
      'row-reverse',

    alignItems:
      'center',

    justifyContent:
      'center',

    gap: Spacing.sm,

    paddingVertical:
      Spacing.md + 2,

    paddingHorizontal:
      Spacing.lg,
  },

  requestButtonText: {
    color: '#FFFFFF',

    fontSize: 17,

    fontWeight: '700',

    textAlign: 'center',
  },

  // ==========================================================
  // HOURS
  // ==========================================================

  hoursRow: {
    flexDirection:
      'row-reverse',

    alignItems:
      'center',

    justifyContent:
      'center',

    gap: 6,

    paddingTop: 2,
  },

  hoursText: {
    fontSize: 12,

    fontWeight: '400',

    textAlign: 'center',
  },

  // ==========================================================
  // INFO BOX
  // ==========================================================

  infoBox: {
    flexDirection:
      'row-reverse',

    alignItems:
      'flex-start',

    gap: Spacing.sm,

    borderWidth: 1,

    borderRadius:
      BorderRadius.md,

    padding:
      Spacing.md,
  },

  infoIcon: {
    width: 30,

    height: 30,

    borderRadius: 15,

    alignItems:
      'center',

    justifyContent:
      'center',
  },

  infoText: {
    flex: 1,

    fontSize: 12,

    lineHeight: 20,

    fontWeight: '400',

    textAlign: 'right',
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  footer: {
    width: '100%',

    alignItems:
      'center',

    marginTop:
      Spacing.lg,

    paddingBottom:
      Spacing.md,
  },

  footerLine: {
    width: 42,

    height: 2,

    borderRadius: 1,

    marginBottom:
      Spacing.sm,
  },

  footerText: {
    fontSize: 10,

    fontWeight: '500',

    textAlign: 'center',

    opacity: 0.75,
  },
});