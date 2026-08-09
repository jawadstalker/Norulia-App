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
import { ChevronRight, ChevronLeft, Stethoscope, Phone, Clock, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Spacing, BorderRadius } from '../constants/theme';

const CONSULT_PHONE = '09037661174';

export default function ConsultationScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { isRTL } = useLanguage();

  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleRequestConsultation = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    Linking.openURL(`tel:${CONSULT_PHONE}`).catch(() => {});
  };

  return (
    <LinearGradient
      colors={isDark ? ['#3A2F5C', '#241D3A'] : ['#F3ECFB', '#F8F7FC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <MotiView
          from={{ opacity: 0, translateY: -12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 450 }}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.backButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <BackIcon size={22} color={colors.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: colors.text }]}>مشاوره تخصصی</Text>

          <View style={styles.headerSpacer} />
        </MotiView>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 500, delay: 100 }}
            style={styles.hero}
          >
            <View
              style={[
                styles.avatarWrap,
                {
                  borderColor: colors.primary,
                  backgroundColor: colors.surface,
                  shadowColor: colors.primary,
                },
              ]}
            >
              <Image
                source={require('../assets/avatars/model1.jpg')}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>

            <View
              style={[
                styles.speechBubble,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.speechLine1, { color: colors.text }]}>
                سلام، من <Text style={{ color: colors.primary }}>نورولیا</Text> هستم
              </Text>
              <Text style={[styles.speechLine2, { color: colors.textSecondary }]}>
                در این بخش مشاوره تخصصی در انتظار شماست
              </Text>
            </View>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 24, scale: 0.97 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: 'timing', duration: 500, delay: 200 }}
            style={[
              styles.card,
              { backgroundColor: colors.surface, shadowColor: colors.primary },
            ]}
          >
            <View style={styles.titleRow}>
              <View style={[styles.iconBadge, { backgroundColor: colors.primary + '22' }]}>
                <Stethoscope size={24} color={colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                جلسات مشاوره تخصصی
              </Text>
            </View>

            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
              درخواست جلسه مشاوره ماهانه با متخصص را ثبت کنید. پس از ثبت، تیم پشتیبانی برای
              هماهنگی زمان با شما تماس می‌گیرد.
            </Text>

            <TouchableOpacity
              onPress={handleRequestConsultation}
              activeOpacity={0.85}
              style={styles.requestButtonWrap}
            >
              <LinearGradient
                colors={isDark ? ['#C084FC', '#8B5CF6'] : ['#7C3AED', '#5B21B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.requestButton}
              >
                <Phone size={22} color="#FFFFFF" />
                <Text style={styles.requestButtonText}>درخواست مشاوره</Text>
                <BackIcon size={18} color="rgba(255,255,255,0.6)" />
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.hoursRow}>
              <Clock size={14} color={colors.textTertiary} />
              <Text style={[styles.hoursText, { color: colors.textTertiary }]}>
                ساعات پاسخگویی: <Text style={{ color: colors.primary }}>شنبه تا پنجشنبه</Text>{' '}
                • ۹:۰۰ تا ۱۸:۰۰
              </Text>
            </View>

            <View
              style={[
                styles.infoBox,
                { backgroundColor: colors.surfaceSecondary, borderColor: colors.border },
              ]}
            >
              <ShieldCheck size={16} color={colors.success} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                <Text style={{ color: colors.success, fontWeight: '600' }}>
                  ویژه کاربران دارای اشتراک فعال
                </Text>
                {'\n'}برای دریافت مشاوره تخصصی و پیگیری درمان
              </Text>
            </View>
          </MotiView>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
    alignItems: 'center',
  },
  hero: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    width: '100%',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarEmoji: {
    fontSize: 44,
  },
  speechBubble: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.xl,
    borderTopRightRadius: 6,
    padding: Spacing.md,
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
  card: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
  },
  titleRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  cardDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '300',
  },
  requestButtonWrap: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: { elevation: 6 },
    }),
  },
  requestButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing.lg,
  },
  requestButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  hoursRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  hoursText: {
    fontSize: 12,
    fontWeight: '300',
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '300',
    textAlign: 'right',
  },
});