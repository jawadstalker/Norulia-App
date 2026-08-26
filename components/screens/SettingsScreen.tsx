import React from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

import { Card } from '../ui/Card';

import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';

import {
  Sun,
  Moon,
  Dumbbell,
  Check,
  Sparkles,
  LogOut,
} from 'lucide-react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { ThemeMode } from '../../types';


// =======================================================
// TYPES
// =======================================================

interface ThemeOptionProps {
  mode: ThemeMode;
  title: string;
  subtitle: string;
  selected: boolean;
  isRTL: boolean;
  previewColors: string[];
  onPress: () => void;
}


// =======================================================
// THEME OPTION
// =======================================================

function ThemeOption({
  mode,
  title,
  subtitle,
  selected,
  isRTL,
  previewColors,
  onPress,
}: ThemeOptionProps) {
  const Icon =
    mode === 'light'
      ? Sun
      : mode === 'dark'
        ? Moon
        : Dumbbell;

  const iconColor =
    selected
      ? mode === 'athlete'
        ? '#071006'
        : '#FFFFFF'
      : previewColors[1];

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{
        selected,
      }}
      style={[
        styles.themeOption,
        {
          borderColor: selected
            ? previewColors[1]
            : 'rgba(128,128,128,0.16)',

          backgroundColor: selected
            ? `${previewColors[1]}0D`
            : 'rgba(128,128,128,0.035)',

          flexDirection: isRTL
            ? 'row-reverse'
            : 'row',
        },
      ]}
    >
      {/* -----------------------------------------------
          PREVIEW
      ------------------------------------------------ */}

      <View
        style={[
          styles.themePreview,
          {
            backgroundColor:
              previewColors[0],
          },
        ]}
      >
        <View
          style={[
            styles.previewTop,
            {
              backgroundColor:
                previewColors[2],
            },
          ]}
        />

        <View
          style={[
            styles.previewContent,
            {
              backgroundColor:
                previewColors[0],
            },
          ]}
        >
          <View
            style={[
              styles.previewLine,
              {
                backgroundColor:
                  previewColors[3],
              },
            ]}
          />

          <View
            style={[
              styles.previewLineShort,
              {
                backgroundColor:
                  previewColors[3],
              },
            ]}
          />

          <View
            style={[
              styles.previewCard,
              {
                backgroundColor:
                  previewColors[2],
              },
            ]}
          />

          <View
            style={[
              styles.previewAccent,
              {
                backgroundColor:
                  previewColors[1],
              },
            ]}
          />
        </View>
      </View>


      {/* -----------------------------------------------
          INFORMATION
      ------------------------------------------------ */}

      <View
        style={[
          styles.themeInfo,
          {
            alignItems: isRTL
              ? 'flex-end'
              : 'flex-start',
          },
        ]}
      >
        <View
          style={[
            styles.themeTitleRow,
            {
              flexDirection: isRTL
                ? 'row-reverse'
                : 'row',
            },
          ]}
        >
          <View
            style={[
              styles.themeIcon,
              {
                backgroundColor:
                  selected
                    ? previewColors[1]
                    : 'rgba(128,128,128,0.10)',
              },
            ]}
          >
            <Icon
              size={18}
              color={iconColor}
              strokeWidth={2.4}
            />
          </View>

          <Text
            numberOfLines={1}
            style={[
              styles.themeTitle,
              {
                color: selected
                  ? previewColors[1]
                  : '#FFFFFF',
                textAlign: isRTL
                  ? 'right'
                  : 'left',
              },
            ]}
          >
            {title}
          </Text>
        </View>

        <Text
          numberOfLines={2}
          style={[
            styles.themeSubtitle,
            {
              textAlign: isRTL
                ? 'right'
                : 'left',
            },
          ]}
        >
          {subtitle}
        </Text>
      </View>


      {/* -----------------------------------------------
          CHECK
      ------------------------------------------------ */}

      {selected && (
        <View
          style={[
            styles.checkBadge,
            {
              backgroundColor:
                previewColors[1],

              [isRTL
                ? 'left'
                : 'right']: 9,
            },
          ]}
        >
          <Check
            size={15}
            color={previewColors[0]}
            strokeWidth={3}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}


// =======================================================
// SETTINGS SCREEN
// =======================================================

export function SettingsScreen() {
  const {
    colors,
    theme,
    setTheme,
  } = useTheme();

  const {
    language,
    setLanguage,
    t,
    isRTL,
  } = useLanguage();

  const {
    logout,
  } = useAuth();


  // =====================================================
  // THEME OPTIONS
  // =====================================================

  const themeOptions: {
    mode: ThemeMode;
    title: string;
    subtitle: string;
    previewColors: string[];
  }[] = [
    {
      mode: 'light',

      title: isRTL
        ? 'روشن'
        : 'Light',

      subtitle: isRTL
        ? 'تم روشن و مینیمال'
        : 'Clean & minimal',

      previewColors: [
        '#F8F7FC',
        '#7C3AED',
        '#FFFFFF',
        '#D7D2E8',
      ],
    },

    {
      mode: 'dark',

      title: isRTL
        ? 'تاریک'
        : 'Dark',

      subtitle: isRTL
        ? 'تیره و آرام برای شب'
        : 'Deep & comfortable',

      previewColors: [
        '#0B1026',
        '#7B61FF',
        '#1A1645',
        '#6F75A8',
      ],
    },

    {
      mode: 'athlete',

      title: 'Neon Athlete',

      subtitle:
        'Brain × Body × Performance',

      previewColors: [
        '#070908',
        '#B8FF3D',
        '#121A15',
        '#4D5C50',
      ],
    },
  ];


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: 60,
        },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >

      {/* =================================================
          HERO
      ================================================= */}

      <View
        style={[
          styles.hero,
          {
            alignItems: isRTL
              ? 'flex-end'
              : 'flex-start',
          },
        ]}
      >
        {/* <View
          style={[
            styles.heroIcon,
            {
              backgroundColor:
                `${colors.primary}18`,

              borderColor:
                `${colors.primary}35`,
            },
          ]}
        >

        </View> */}

        <Text
          style={[
            styles.title,
            {
              color: colors.text,

              textAlign: isRTL
                ? 'right'
                : 'left',
            },
          ]}
        >
          {t.settings ||
            (isRTL
              ? 'تنظیمات'
              : 'Settings')}
        </Text>

        <Text
          style={[
            styles.heroSubtitle,
            {
              color:
                colors.textSecondary,

              textAlign: isRTL
                ? 'right'
                : 'left',
            },
          ]}
        >
          {isRTL
            ? 'ظاهر Neurolia را برای خودت شخصی‌سازی کن'
            : 'Customize your Neurolia experience'}
        </Text>
      </View>


      {/* =================================================
          APPEARANCE
      ================================================= */}

      <Card
        style={[
          styles.section,
          {
            backgroundColor:
              colors.surface,

            borderColor:
              colors.border,
          },
        ]}
      >

        {/* SECTION HEADER */}

        <View
          style={[
            styles.sectionHeader,
            {
              flexDirection: isRTL
                ? 'row-reverse'
                : 'row',
            },
          ]}
        >

          <View
            style={[
              styles.sectionIcon,
              {
                backgroundColor:
                  `${colors.primary}14`,
              },
            ]}
          >
            <Sparkles
              size={18}
              color={colors.primary}
              strokeWidth={2.1}
            />
          </View>

          <View
            style={[
              styles.sectionHeaderText,
              {
                alignItems: isRTL
                  ? 'flex-end'
                  : 'flex-start',
              },
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,

                  textAlign: isRTL
                    ? 'right'
                    : 'left',
                },
              ]}
            >
              {isRTL
                ? 'ظاهر برنامه'
                : 'Appearance'}
            </Text>

            <Text
              style={[
                styles.sectionDescription,
                {
                  color:
                    colors.textSecondary,

                  textAlign: isRTL
                    ? 'right'
                    : 'left',
                },
              ]}
            >
              {isRTL
                ? 'تم مورد علاقه خود را انتخاب کن'
                : 'Choose your preferred experience'}
            </Text>
          </View>
        </View>


        {/* THEME LIST */}

        <View style={styles.themeList}>
          {themeOptions.map((option) => (
            <ThemeOption
              key={option.mode}
              mode={option.mode}
              title={option.title}
              subtitle={option.subtitle}
              previewColors={
                option.previewColors
              }
              selected={
                theme === option.mode
              }
              isRTL={isRTL}
              onPress={() =>
                setTheme(option.mode)
              }
            />
          ))}
        </View>


        {/* ATHLETE CALLOUT */}

        {theme === 'athlete' && (
          <LinearGradient
            colors={[
              'rgba(184,255,61,0.14)',
              'rgba(184,255,61,0.03)',
              'rgba(184,255,61,0.10)',
            ]}
            start={{
              x: 0,
              y: 0,
            }}
            end={{
              x: 1,
              y: 1,
            }}
            style={[
              styles.athleteCallout,
              {
                flexDirection: isRTL
                  ? 'row-reverse'
                  : 'row',

                borderColor:
                  'rgba(184,255,61,0.20)',
              },
            ]}
          >
            <Dumbbell
              size={19}
              color="#B8FF3D"
              strokeWidth={2.4}
            />

            <View
              style={[
                styles.calloutContent,
                {
                  alignItems: isRTL
                    ? 'flex-end'
                    : 'flex-start',
                },
              ]}
            >
              <Text
                style={[
                  styles.calloutTitle,
                  {
                    textAlign: isRTL
                      ? 'right'
                      : 'left',
                  },
                ]}
              >
                Neon Athlete Mode
              </Text>

              <Text
                style={[
                  styles.calloutText,
                  {
                    textAlign: isRTL
                      ? 'right'
                      : 'left',
                  },
                ]}
              >
                {isRTL
                  ? 'تم طراحی‌شده برای Brain × Body × Performance'
                  : 'Designed for Brain × Body × Performance'}
              </Text>
            </View>
          </LinearGradient>
        )}
      </Card>


      {/* =================================================
          LANGUAGE
      ================================================= */}

      <Card
        style={[
          styles.section,
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
            styles.sectionTitle,
            {
              color:
                colors.text,

              textAlign: isRTL
                ? 'right'
                : 'left',

              marginBottom:
                Spacing.md,
            },
          ]}
        >
          {t.language ||
            (isRTL
              ? 'زبان'
              : 'Language')}
        </Text>


        <View
          style={[
            styles.optionsRow,
            {
              flexDirection: isRTL
                ? 'row-reverse'
                : 'row',
            },
          ]}
        >

          {/* PERSIAN */}

          <TouchableOpacity
            activeOpacity={0.78}
            onPress={() =>
              setLanguage('fa')
            }
            style={[
              styles.languageOption,
              {
                backgroundColor:
                  colors.surfaceSecondary,

                borderColor:
                  language === 'fa'
                    ? colors.primary
                    : colors.border,

                borderWidth:
                  language === 'fa'
                    ? 2
                    : 1,
              },
            ]}
          >
            <Text style={styles.flag}>
              🇮🇷
            </Text>

            <Text
              style={[
                styles.optionText,
                {
                  color:
                    language === 'fa'
                      ? colors.primary
                      : colors.text,
                },
              ]}
            >
              {t.persian || 'فارسی'}
            </Text>
          </TouchableOpacity>


          {/* ENGLISH */}

          <TouchableOpacity
            activeOpacity={0.78}
            onPress={() =>
              setLanguage('en')
            }
            style={[
              styles.languageOption,
              {
                backgroundColor:
                  colors.surfaceSecondary,

                borderColor:
                  language === 'en'
                    ? colors.primary
                    : colors.border,

                borderWidth:
                  language === 'en'
                    ? 2
                    : 1,
              },
            ]}
          >
            <Text style={styles.flag}>
              🇬🇧
            </Text>

            <Text
              style={[
                styles.optionText,
                {
                  color:
                    language === 'en'
                      ? colors.primary
                      : colors.text,
                },
              ]}
            >
              {t.english || 'English'}
            </Text>
          </TouchableOpacity>

        </View>
      </Card>


      {/* =================================================
          LOGOUT
      ================================================= */}

      <TouchableOpacity
        activeOpacity={0.78}
        onPress={logout}
        accessibilityRole="button"
        accessibilityLabel={
          t.logout || 'Logout'
        }
        style={[
          styles.logoutButton,
          {
            backgroundColor:
              `${colors.error}12`,

            borderColor:
              `${colors.error}30`,
          },
        ]}
      >
        <LogOut
          size={20}
          color={colors.error}
          strokeWidth={2}
        />

        <Text
          style={[
            styles.logoutText,
            {
              color:
                colors.error,
            },
          ]}
        >
          {t.logout || 'Logout'}
        </Text>
      </TouchableOpacity>


      <View
        style={styles.bottomSpace}
      />

    </ScrollView>
  );
}


// =======================================================
// STYLES
// =======================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal:
      Spacing.lg,

    paddingTop:
      Spacing.md,

    width: '100%',
  },


  // =====================================================
  // HERO
  // =====================================================

  hero: {
    width: '100%',
    marginBottom:
      Spacing.lg,
  },

  heroIcon: {
    width: 48,
    height: 48,

    borderRadius:
      BorderRadius.md,

    alignItems:
      'center',

    justifyContent:
      'center',

    borderWidth: 1,

    marginBottom:
      Spacing.md,
  },

  title: {
    width: '100%',

    fontSize: 30,

    lineHeight: 38,

    fontWeight: '800',

    letterSpacing: -0.6,

    includeFontPadding:
      false,
  },

  heroSubtitle: {
    width: '100%',

    fontSize: 14,

    lineHeight: 21,

    marginTop: 6,

    includeFontPadding:
      false,
  },


  // =====================================================
  // SECTION
  // =====================================================

  section: {
    width: '100%',

    marginBottom:
      Spacing.lg,

    padding:
      Spacing.md,

    borderWidth: 1,

    borderRadius:
      BorderRadius.xl,

    overflow: 'hidden',
  },

  sectionHeader: {
    width: '100%',

    alignItems:
      'center',

    gap:
      Spacing.sm,

    marginBottom:
      Spacing.lg,
  },

  sectionIcon: {
    width: 40,
    height: 40,

    borderRadius:
      BorderRadius.md,

    alignItems:
      'center',

    justifyContent:
      'center',

    flexShrink: 0,
  },

  sectionHeaderText: {
    flex: 1,

    minWidth: 0,
  },

  sectionTitle: {
    width: '100%',

    fontSize: 15,

    lineHeight: 21,

    fontWeight: '700',

    includeFontPadding:
      false,
  },

  sectionDescription: {
    width: '100%',

    fontSize: 12,

    lineHeight: 18,

    marginTop: 2,

    includeFontPadding:
      false,
  },


  // =====================================================
  // THEME LIST
  // =====================================================

  themeList: {
    width: '100%',
    gap: Spacing.sm,
  },

  themeOption: {
    width: '100%',

    minHeight: 112,

    borderRadius:
      BorderRadius.lg,

    borderWidth: 1,

    padding: 10,

    alignItems:
      'center',

    position: 'relative',

    overflow: 'hidden',
  },


  // =====================================================
  // THEME PREVIEW
  // =====================================================

  themePreview: {
    width: 84,
    height: 88,

    borderRadius:
      BorderRadius.md,

    overflow: 'hidden',

    flexShrink: 0,
  },

  previewTop: {
    height: 17,
    width: '100%',
  },

  previewContent: {
    flex: 1,

    padding: 9,

    position: 'relative',
  },

  previewLine: {
    height: 5,

    width: '68%',

    borderRadius: 4,

    opacity: 0.7,

    marginBottom: 5,
  },

  previewLineShort: {
    height: 4,

    width: '42%',

    borderRadius: 4,

    opacity: 0.4,
  },

  previewCard: {
    height: 29,

    width: '100%',

    borderRadius: 6,

    marginTop: 8,
  },

  previewAccent: {
    position: 'absolute',

    width: 20,
    height: 20,

    borderRadius: 10,

    right: 7,
    bottom: 7,
  },


  // =====================================================
  // THEME INFO
  // =====================================================

  themeInfo: {
    flex: 1,

    minWidth: 0,

    paddingHorizontal:
      Spacing.sm,
  },

  themeTitleRow: {
    alignItems:
      'center',

    gap: 8,

    marginBottom: 5,

    maxWidth: '100%',
  },

  themeIcon: {
    width: 30,
    height: 30,

    borderRadius: 9,

    alignItems:
      'center',

    justifyContent:
      'center',

    flexShrink: 0,
  },

  themeTitle: {
    flexShrink: 1,

    fontSize: 15,

    lineHeight: 20,

    fontWeight: '700',

    includeFontPadding:
      false,
  },

  themeSubtitle: {
    color: '#89948C',

    fontSize: 12,

    lineHeight: 18,

    includeFontPadding:
      false,
  },


  // =====================================================
  // CHECK
  // =====================================================

  checkBadge: {
    position: 'absolute',

    top: 9,

    width: 26,
    height: 26,

    borderRadius: 13,

    alignItems:
      'center',

    justifyContent:
      'center',
  },


  // =====================================================
  // ATHLETE CALLOUT
  // =====================================================

  athleteCallout: {
    width: '100%',

    marginTop:
      Spacing.md,

    minHeight: 66,

    borderRadius:
      BorderRadius.lg,

    borderWidth: 1,

    paddingHorizontal:
      Spacing.md,

    paddingVertical:
      Spacing.sm,

    alignItems:
      'center',

    gap:
      Spacing.sm,
  },

  calloutContent: {
    flex: 1,

    minWidth: 0,
  },

  calloutTitle: {
    color: '#B8FF3D',

    fontSize: 13,

    lineHeight: 18,

    fontWeight: '800',

    includeFontPadding:
      false,
  },

  calloutText: {
    color: '#849087',

    fontSize: 11,

    lineHeight: 17,

    marginTop: 2,

    includeFontPadding:
      false,
  },


  // =====================================================
  // LANGUAGE
  // =====================================================

  optionsRow: {
    width: '100%',

    alignItems:
      'stretch',

    gap:
      Spacing.sm,
  },

  languageOption: {
    flex: 1,

    minWidth: 0,

    minHeight: 58,

    borderRadius:
      BorderRadius.md,

    paddingHorizontal:
      Spacing.sm,

    paddingVertical: 10,

    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'center',

    gap: 8,

    overflow: 'hidden',
  },

  flag: {
    fontSize: 21,

    lineHeight: 25,

    flexShrink: 0,
  },

  optionText: {
    flexShrink: 1,

    minWidth: 0,

    fontSize: 14,

    lineHeight: 20,

    fontWeight: '600',

    textAlign:
      'center',

    includeFontPadding:
      false,
  },


  // =====================================================
  // LOGOUT
  // =====================================================

  logoutButton: {
    width: '100%',

    minHeight: 56,

    borderRadius:
      BorderRadius.lg,

    borderWidth: 1,

    flexDirection:
      'row',

    alignItems:
      'center',

    justifyContent:
      'center',

    paddingHorizontal:
      Spacing.lg,

    paddingVertical:
      Spacing.md,

    gap:
      Spacing.sm,

    overflow: 'hidden',
  },

  logoutText: {
    fontSize: 15,

    lineHeight: 21,

    fontWeight: '600',

    includeFontPadding:
      false,
  },

  bottomSpace: {
    height: 30,
  },
});