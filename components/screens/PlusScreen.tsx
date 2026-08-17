import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  Gamepad2,
  Feather,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowLeft,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function PlusScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { isRTL } = useLanguage();

  const modules = [
    {
      id: 'quran',
      title: isRTL ? 'حفظ قرآن' : 'Quran Memorization',
      description: isRTL
        ? 'حفظ آیات و سوره‌ها با تمرین هوشمند'
        : 'Memorize verses and surahs with smart practice',
      icon: BookOpen,
      iconColor: '#22C55E',
      backgroundLight: '#F0FDF4',
      backgroundDark: 'rgba(34,197,94,0.13)',
      enabled: true,
      route: '/quran',
    },
    {
      id: 'games',
      title: isRTL ? 'بازی‌های دوزبانه' : 'Bilingual Games',
      description: isRTL
        ? 'یادگیری و تقویت ذهن با بازی‌های جذاب'
        : 'Learn and train your mind with fun games',
      icon: Gamepad2,
      iconColor: '#F59E0B',
      backgroundLight: '#FFF7DD',
      backgroundDark: 'rgba(245,158,11,0.13)',
      enabled: true,
      route: '/bilingual-games',
    },
    {
      id: 'poems',
      title: isRTL ? 'حفظ اشعار' : 'Poem Memorization',
      description: isRTL
        ? 'حافظه، ادبیات و درک معنا را تقویت کن'
        : 'Improve memory, literature and understanding',
      icon: Feather,
      iconColor: '#7C3AED',
      backgroundLight: '#F0EAFE',
      backgroundDark: 'rgba(124,58,237,0.15)',
      enabled: true,
      route: '/poems',
    },
  ];

  const TEXTS = {
    badge: isRTL ? 'یادگیری هوشمند' : 'Smart Learning',
    title: isRTL ? 'ماژول‌ها' : 'Modules',
    subtitle: isRTL
      ? 'مسیر یادگیری مورد علاقه‌ات را انتخاب کن'
      : 'Choose your favorite learning path',
    comingSoon: isRTL ? 'به‌زودی' : 'Coming Soon',
    backLabel: isRTL ? 'بازگشت' : 'Back',
  };

  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  const handleModulePress = (module: (typeof modules)[number]) => {
    if (!module.enabled) return;
    router.push(module.route as any);
  };

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#171329', '#211A3A', '#2B2350']
          : ['#F8F7FC', '#FFFFFF']
      }
      style={styles.container}
    >
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel={TEXTS.backLabel}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[
                styles.backButton,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : '#FFFFFF',
                  borderColor: colors.border,
                },
              ]}
            >
              <ArrowLeft
                size={22}
                strokeWidth={2.4}
                color={colors.text}
              />
            </TouchableOpacity>

            <View style={styles.headerText}>
              <View style={styles.badge}>
                <Sparkles size={15} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  {TEXTS.badge}
                </Text>
              </View>

              <Text style={[styles.title, { color: colors.text }]}>
                {TEXTS.title}
              </Text>

              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {TEXTS.subtitle}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.modules}>
          {modules.map((module) => {
            const Icon = module.icon;

            return (
              <TouchableOpacity
                key={module.id}
                activeOpacity={module.enabled ? 0.85 : 1}
                disabled={!module.enabled}
                onPress={() => handleModulePress(module)}
                style={[
                  styles.moduleCard,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.055)'
                      : '#FFFFFF',
                    borderColor: colors.border,
                    opacity: module.enabled ? 1 : 0.62,
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <View
                  style={[
                    styles.moduleIcon,
                    {
                      backgroundColor: isDark
                        ? module.backgroundDark
                        : module.backgroundLight,
                      marginLeft: isRTL ? 13 : 0,
                      marginRight: isRTL ? 0 : 13,
                    },
                  ]}
                >
                  <Icon size={25} color={module.iconColor} />
                </View>

                <View
                  style={[
                    styles.moduleContent,
                    {
                      alignItems: isRTL ? 'flex-end' : 'flex-start',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.moduleTitle,
                      {
                        color: colors.text,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {module.title}
                  </Text>

                  <Text
                    style={[
                      styles.moduleDescription,
                      {
                        color: colors.textSecondary,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                  >
                    {module.description}
                  </Text>

                  {!module.enabled && (
                    <Text
                      style={[
                        styles.comingSoon,
                        {
                          color: colors.textTertiary,
                          textAlign: isRTL ? 'right' : 'left',
                        },
                      ]}
                    >
                      {TEXTS.comingSoon}
                    </Text>
                  )}
                </View>

                {module.enabled && (
                  <View
                    style={[
                      styles.arrowCircle,
                      {
                        backgroundColor: isDark
                          ? 'rgba(124,58,237,0.14)'
                          : '#F0EAFE',
                        marginRight: isRTL ? 10 : 0,
                        marginLeft: isRTL ? 0 : 10,
                      },
                    ]}
                  >
                    <ArrowIcon size={19} color={colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 14,
  },
  headerText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  badge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 23,
    marginTop: 7,
    textAlign: 'right',
  },
  modules: {
    gap: 13,
  },
  moduleCard: {
    minHeight: 112,
    borderRadius: 22,
    borderWidth: 1,
    padding: 17,
    alignItems: 'center',
  },
  moduleIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  moduleDescription: {
    fontSize: 12,
    lineHeight: 20,
    marginTop: 4,
  },
  comingSoon: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 5,
  },
  arrowCircle: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});