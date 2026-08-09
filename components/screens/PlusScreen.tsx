import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import {
  BookOpen,
  Gamepad2,
  Feather,
  ChevronLeft,
  Sparkles,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';

export default function PlusScreen() {
  const navigation = useNavigation<any>();
  const { colors, isDark } = useTheme();

  const modules = [
    {
      id: 'quran',
      title: 'حفظ قرآن',
      description: 'حفظ آیات و سوره‌ها با تمرین هوشمند',
      icon: BookOpen,
      iconColor: '#22C55E',
      backgroundLight: '#F0FDF4',
      backgroundDark: 'rgba(34,197,94,0.13)',
      enabled: false,
    },
    {
      id: 'games',
      title: 'بازی‌های دوزبانه',
      description: 'یادگیری و تقویت ذهن با بازی‌های جذاب',
      icon: Gamepad2,
      iconColor: '#F59E0B',
      backgroundLight: '#FFF7DD',
      backgroundDark: 'rgba(245,158,11,0.13)',
      enabled: false,
    },
    {
      id: 'poems',
      title: 'حفظ اشعار',
      description: 'حافظه، ادبیات و درک معنا را تقویت کن',
      icon: Feather,
      iconColor: '#7C3AED',
      backgroundLight: '#F0EAFE',
      backgroundDark: 'rgba(124,58,237,0.15)',
      enabled: true,
    },
  ];

  const handleModulePress = (moduleId: string) => {
    if (moduleId === 'poems') {
      navigation.navigate('PoemsScreen');
    }
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <View style={styles.badge}>
              <Sparkles
                size={14}
                color={colors.primary}
              />

              <Text
                style={[
                  styles.badgeText,
                  { color: colors.primary },
                ]}
              >
                یادگیری هوشمند
              </Text>
            </View>

            <Text
              style={[
                styles.title,
                { color: colors.text },
              ]}
            >
              ماژول‌ها
            </Text>

            <Text
              style={[
                styles.subtitle,
                { color: colors.textSecondary },
              ]}
            >
              مسیر یادگیری مورد علاقه‌ات را انتخاب کن
            </Text>
          </View>
        </View>

        {/* Modules */}
        <View style={styles.modules}>
          {modules.map(module => {
            const Icon = module.icon;

            return (
              <TouchableOpacity
                key={module.id}
                activeOpacity={module.enabled ? 0.85 : 1}
                disabled={!module.enabled}
                onPress={() =>
                  handleModulePress(module.id)
                }
                style={[
                  styles.moduleCard,
                  {
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.055)'
                      : '#FFFFFF',
                    borderColor: colors.border,
                    opacity: module.enabled ? 1 : 0.62,
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
                    },
                  ]}
                >
                  <Icon
                    size={25}
                    color={module.iconColor}
                  />
                </View>

                <View style={styles.moduleContent}>
                  <Text
                    style={[
                      styles.moduleTitle,
                      { color: colors.text },
                    ]}
                  >
                    {module.title}
                  </Text>

                  <Text
                    style={[
                      styles.moduleDescription,
                      {
                        color:
                          colors.textSecondary,
                      },
                    ]}
                  >
                    {module.description}
                  </Text>

                  {!module.enabled && (
                    <Text
                      style={[
                        styles.comingSoon,
                        { color: colors.textTertiary },
                      ]}
                    >
                      به‌زودی
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
                      },
                    ]}
                  >
                    <ChevronLeft
                      size={19}
                      color={colors.primary}
                    />
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
    paddingTop:
      Platform.OS === 'ios' ? 58 : 32,
    paddingHorizontal: 20,
  },

  header: {
    paddingTop: 12,
    marginBottom: 28,
  },

  headerText: {
    alignItems: 'flex-end',
  },

  badge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
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
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  moduleIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 13,
  },

  moduleContent: {
    flex: 1,
    alignItems: 'flex-end',
  },

  moduleTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'right',
  },

  moduleDescription: {
    fontSize: 12,
    lineHeight: 20,
    marginTop: 4,
    textAlign: 'right',
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
    marginRight: 10,
  },
});