import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { AppText as Text } from '../ui/AppText';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  BookOpen,
  Gamepad2,
  Feather,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowLeft,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function PlusScreen() {
  const router = useRouter();
  const { colors, isDark, isAthlete } = useTheme();
  const { isRTL } = useLanguage();

  // ===== تغییر رنگ آیکون‌ها بر اساس تم =====
  const getIconColor = () => {
    if (isAthlete) return '#22C55E'; // سبز برای تم ورزشکار
    if (isDark) return 'rgba(73, 194, 226, 1)'; // آبی برای تم تاریک
    return colors.primary; // رنگ primary برای تم لایت
  };

  // رنگ آیکون‌های ماژول‌ها
  const getModuleIconColor = (moduleId: string) => {
    if (isAthlete) return '#22C55E'; // همه آیکون‌ها سبز در تم ورزشکار
    if (isDark) return 'rgba(73, 194, 226, 1)'; // همه آیکون‌ها آبی در تم تاریک
    
    // در تم لایت همه آیکون‌ها از colors.primary استفاده می‌کنند
    return colors.primary;
  };

  // رنگ پس‌زمینه آیکون‌های ماژول‌ها
  const getModuleBgColor = (moduleId: string) => {
    if (isAthlete) return '#22C55E' + '18'; // سبز با透明度 برای تم ورزشکار
    if (isDark) return 'rgba(73, 194, 226, 0.15)'; // آبی با透明度 برای تم تاریک
    
    // در تم لایت از colors.primary با透明度 استفاده می‌شود
    return colors.primary + '18';
  };

  const iconColor = getIconColor();
  const sparkleColor = getIconColor();
  const arrowBgColor = isAthlete 
    ? '#22C55E' + '15' 
    : isDark 
      ? 'rgba(73, 194, 226, 0.15)' 
      : colors.primary + '15'; // ← تغییر برای تم لایت
  const arrowColor = getIconColor();

  const TEXTS = {
    fa: {
      badge: 'یادگیری هوشمند',
      title: 'ماژول‌ها',
      subtitle: 'مسیر یادگیری مورد علاقه‌ات را انتخاب کن',
      comingSoon: 'به‌زودی',
      back: 'بازگشت',
      quranTitle: 'حفظ قرآن',
      quranDescription: 'حفظ آیات و سوره‌ها با تمرین هوشمند',
      gamesTitle: 'بازی‌های دوزبانه',
      gamesDescription: 'یادگیری و تقویت ذهن با بازی‌های جذاب',
      poemsTitle: 'حفظ اشعار',
      poemsDescription: 'حافظه، ادبیات و درک معنا را تقویت کن',
      sportsTitle: 'ورزش',
      sportsDescription: 'تقویت عملکرد مغز و بدن با تمرین‌های ورزشی',
    },
    en: {
      badge: 'Smart Learning',
      title: 'Modules',
      subtitle: 'Choose your favorite learning path',
      comingSoon: 'Coming Soon',
      back: 'Back',
      quranTitle: 'Quran Memorization',
      quranDescription: 'Memorize verses and surahs with smart practice',
      gamesTitle: 'Bilingual Games',
      gamesDescription: 'Learn and train your mind with fun games',
      poemsTitle: 'Poem Memorization',
      poemsDescription: 'Improve memory, literature and understanding',
      sportsTitle: 'Sports',
      sportsDescription: 'Improve brain and body performance through sports training',
    },
  };

  const text = isRTL ? TEXTS.fa : TEXTS.en;

  const modules = [
    {
      id: 'quran',
      title: text.quranTitle,
      description: text.quranDescription,
      icon: BookOpen,
      enabled: true,
      route: '/quran',
    },
    {
      id: 'games',
      title: text.gamesTitle,
      description: text.gamesDescription,
      icon: Gamepad2,
      enabled: true,
      route: '/bilingual-games',
    },
    {
      id: 'poems',
      title: text.poemsTitle,
      description: text.poemsDescription,
      icon: Feather,
      enabled: true,
      route: '/poems',
    },
    {
      id: 'sports',
      title: text.sportsTitle,
      description: text.sportsDescription,
      icon: Dumbbell,
      enabled: true,
      route: '/sports',
    },
  ];

  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  const handleModulePress = (module: (typeof modules)[number]) => {
    if (!module.enabled || !module.route) return;
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
              accessibilityLabel={text.back}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={[
                styles.backButton,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
                  borderColor: colors.border,
                },
              ]}
            >
              <ArrowLeft size={22} strokeWidth={2.4} color={colors.text} />
            </TouchableOpacity>

            <View
              style={[
                styles.headerText,
                {
                  alignItems: isRTL ? 'flex-end' : 'flex-start',
                },
              ]}
            >
              <View
                style={[
                  styles.badge,
                  {
                    flexDirection: isRTL ? 'row-reverse' : 'row',
                  },
                ]}
              >
                <Sparkles size={15} color={sparkleColor} />
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: sparkleColor,
                    },
                  ]}
                >
                  {text.badge}
                </Text>
              </View>

              <Text
                style={[
                  styles.title,
                  {
                    color: colors.text,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {text.title}
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  {
                    color: colors.textSecondary,
                    textAlign: isRTL ? 'right' : 'left',
                  },
                ]}
              >
                {text.subtitle}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.modules}>
            {modules.map((module) => {
              const Icon = module.icon;
              const moduleIconColor = getModuleIconColor(module.id);
              const moduleBgColor = getModuleBgColor(module.id);

              return (
                <TouchableOpacity
                  key={module.id}
                  activeOpacity={module.enabled ? 0.85 : 1}
                  disabled={!module.enabled}
                  onPress={() => handleModulePress(module)}
                  style={[
                    styles.moduleCard,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.055)' : '#FFFFFF',
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
                        backgroundColor: moduleBgColor,
                        marginLeft: isRTL ? 13 : 0,
                        marginRight: isRTL ? 0 : 13,
                      },
                    ]}
                  >
                    <Icon size={25} color={moduleIconColor} />
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
                        {text.comingSoon}
                      </Text>
                    )}
                  </View>

                  {module.enabled && (
                    <View
                      style={[
                        styles.arrowCircle,
                        {
                          backgroundColor: arrowBgColor,
                          marginRight: isRTL ? 10 : 0,
                          marginLeft: isRTL ? 0 : 10,
                        },
                      ]}
                    >
                      <ArrowIcon size={19} color={arrowColor} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
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
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 40,
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
  },
  badge: {
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
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 23,
    marginTop: 7,
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