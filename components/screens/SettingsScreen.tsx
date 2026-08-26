import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
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
  Palette,
} from 'lucide-react-native';

import { LinearGradient } from 'expo-linear-gradient';

import { ThemeMode } from '../../types';

// =======================================================
// THEME OPTION
// =======================================================

interface ThemeOptionProps {
  mode: ThemeMode;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  previewColors: string[];
  selected: boolean;
  onPress: () => void;
  isRTL: boolean;
  textColor: string;
  secondaryTextColor: string;
  surfaceColor: string;
  borderColor: string;
}

function ThemeOption({
  title,
  subtitle,
  icon,
  previewColors,
  selected,
  onPress,
  isRTL,
  textColor,
  secondaryTextColor,
  surfaceColor,
  borderColor,
}: ThemeOptionProps) {
  const scale = useRef(
    new Animated.Value(selected ? 1 : 0.985)
  ).current;

  const selectionProgress = useRef(
    new Animated.Value(selected ? 1 : 0)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: selected ? 1 : 0.985,
        useNativeDriver: true,
        damping: 16,
        stiffness: 180,
        mass: 0.8,
      }),

      Animated.timing(selectionProgress, {
        toValue: selected ? 1 : 0,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
  }, [selected, scale, selectionProgress]);

  const animatedBorderColor =
    selectionProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [
        borderColor,
        previewColors[1],
      ],
    });

  const animatedBackgroundColor =
    selectionProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [
        surfaceColor,
        previewColors[1] + '0D',
      ],
    });

  const animatedIconBackground =
    selectionProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [
        'rgba(128,128,128,0.10)',
        previewColors[1],
      ],
    });

  return (
    <Animated.View
      style={[
        styles.themeOptionWrapper,
        {
          transform: [{ scale }],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{
          selected,
        }}
        style={styles.themeTouchable}
      >
        <Animated.View
          style={[
            styles.themeOption,
            {
              borderColor: animatedBorderColor,
              backgroundColor: animatedBackgroundColor,
            },
          ]}
        >
          {/* ============================================
              THEME PREVIEW
          ============================================ */}

          <View
            style={[
              styles.themePreview,
              {
                backgroundColor: previewColors[0],
              },
            ]}
          >
            <View
              style={[
                styles.previewTop,
                {
                  backgroundColor: previewColors[2],
                },
              ]}
            />

            <View
              style={[
                styles.previewContent,
                {
                  backgroundColor: previewColors[0],
                },
              ]}
            >
              <View
                style={[
                  styles.previewLine,
                  {
                    backgroundColor: previewColors[3],
                  },
                ]}
              />

              <View
                style={[
                  styles.previewLineShort,
                  {
                    backgroundColor: previewColors[3],
                  },
                ]}
              />

              <View
                style={[
                  styles.previewCard,
                  {
                    backgroundColor: previewColors[2],
                  },
                ]}
              />

              <View
                style={[
                  styles.previewAccent,
                  {
                    backgroundColor: previewColors[1],
                  },
                ]}
              />
            </View>
          </View>

          {/* ============================================
              INFO
          ============================================ */}

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
              <Animated.View
                style={[
                  styles.themeIcon,
                  {
                    backgroundColor:
                      animatedIconBackground,
                  },
                ]}
              >
                {icon}
              </Animated.View>

              <Text
                style={[
                  styles.themeTitle,
                  {
                    color: selected
                      ? previewColors[1]
                      : textColor,
                    textAlign: isRTL
                      ? 'right'
                      : 'left',
                  },
                ]}
                numberOfLines={1}
              >
                {title}
              </Text>
            </View>

            <Text
              style={[
                styles.themeSubtitle,
                {
                  color: secondaryTextColor,
                  textAlign: isRTL
                    ? 'right'
                    : 'left',
                },
              ]}
              numberOfLines={2}
            >
              {subtitle}
            </Text>
          </View>

          {/* ============================================
              SELECTED BADGE
          ============================================ */}

          {selected && (
            <View
              style={[
                styles.checkBadge,
                {
                  backgroundColor:
                    previewColors[1],
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
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
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
  // THEME DATA
  // =====================================================

  const themeOptions = [
    {
      mode: 'light' as ThemeMode,

      title: isRTL
        ? 'روشن'
        : 'Light',

      subtitle: isRTL
        ? 'تم روشن و مینیمال'
        : 'Clean & minimal',

      icon: (
        <Sun
          size={18}
          color={
            theme === 'light'
              ? '#FFFFFF'
              : colors.textSecondary
          }
          strokeWidth={2.2}
        />
      ),

      previewColors: [
        '#F8F7FC',
        '#7C3AED',
        '#FFFFFF',
        '#D7D2E8',
      ],
    },

    {
      mode: 'dark' as ThemeMode,

      title: isRTL
        ? 'تاریک'
        : 'Dark',

      subtitle: isRTL
        ? 'تیره و آرام برای شب'
        : 'Deep & comfortable',

      icon: (
        <Moon
          size={18}
          color={
            theme === 'dark'
              ? '#FFFFFF'
              : colors.textSecondary
          }
          strokeWidth={2.2}
        />
      ),

      previewColors: [
        '#0B1026',
        '#7B61FF',
        '#1A1645',
        '#6F75A8',
      ],
    },

    {
      mode: 'athlete' as ThemeMode,

      title: 'Neon Athlete',

      subtitle:
        'Brain × Body × Performance',

      icon: (
        <Dumbbell
          size={18}
          color={
            theme === 'athlete'
              ? '#071006'
              : '#B8FF3D'
          }
          strokeWidth={2.5}
        />
      ),

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
      contentContainerStyle={
        styles.content
      }
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
        <View
          style={[
            styles.heroIcon,
            {
              backgroundColor:
                colors.primary + '18',

              borderColor:
                colors.primary + '35',
            },
          ]}
        >
          <Palette
            size={22}
            color={colors.primary}
            strokeWidth={2.2}
          />
        </View>

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
          {t.settings || (
            isRTL
              ? 'تنظیمات'
              : 'Settings'
          )}
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
                  colors.primary + '14',
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

        {/* =================================================
            THEME OPTIONS
        ================================================= */}

        <View style={styles.themeList}>
          {themeOptions.map((option) => (
            <ThemeOption
              key={option.mode}
              mode={option.mode}
              title={option.title}
              subtitle={option.subtitle}
              icon={option.icon}
              previewColors={
                option.previewColors
              }
              selected={
                theme === option.mode
              }
              onPress={() =>
                setTheme(option.mode)
              }
              isRTL={isRTL}
              textColor={colors.text}
              secondaryTextColor={
                colors.textSecondary
              }
              surfaceColor={
                colors.surfaceSecondary ||
                colors.surface
              }
              borderColor={
                colors.border
              }
            />
          ))}
        </View>

        {/* =================================================
            ATHLETE CALLOUT
        ================================================= */}

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
                borderColor:
                  'rgba(184,255,61,0.20)',

                flexDirection: isRTL
                  ? 'row-reverse'
                  : 'row',
              },
            ]}
          >
            <View
              style={styles.calloutIcon}
            >
              <Dumbbell
                size={19}
                color="#B8FF3D"
                strokeWidth={2.4}
              />
            </View>

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
                colors.textSecondary,

              textAlign: isRTL
                ? 'right'
                : 'left',
            },
          ]}
        >
          {t.language}
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
          {/* ==========================================
              PERSIAN
          ========================================== */}

          <TouchableOpacity
            activeOpacity={0.78}
            onPress={() =>
              setLanguage('fa')
            }
            accessibilityRole="button"
            accessibilityState={{
              selected:
                language === 'fa',
            }}
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
              {t.persian}
            </Text>

            {language === 'fa' && (
              <View
                style={[
                  styles.languageCheck,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
              >
                <Check
                  size={11}
                  color={
                    colors.background
                  }
                  strokeWidth={3}
                />
              </View>
            )}
          </TouchableOpacity>

          {/* ==========================================
              ENGLISH
          ========================================== */}

          <TouchableOpacity
            activeOpacity={0.78}
            onPress={() =>
              setLanguage('en')
            }
            accessibilityRole="button"
            accessibilityState={{
              selected:
                language === 'en',
            }}
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
              {t.english}
            </Text>

            {language === 'en' && (
              <View
                style={[
                  styles.languageCheck,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
              >
                <Check
                  size={11}
                  color={
                    colors.background
                  }
                  strokeWidth={3}
                />
              </View>
            )}
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
          t.logout
        }
        style={[
          styles.logoutButton,
          {
            backgroundColor:
              colors.error + '12',

            borderColor:
              colors.error + '30',

            flexDirection: isRTL
              ? 'row-reverse'
              : 'row',
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
          {t.logout}
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

    paddingBottom:
      50,

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

    gap: Spacing.sm,

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
  // THEMES
  // =====================================================

  themeList: {
    width: '100%',
    gap: Spacing.sm,
  },

  themeOptionWrapper: {
    width: '100%',
  },

  themeTouchable: {
    width: '100%',
  },

  themeOption: {
    width: '100%',

    minHeight: 112,

    borderRadius:
      BorderRadius.lg,

    borderWidth: 1,

    padding: 10,

    flexDirection:
      'row',

    alignItems:
      'center',

    position:
      'relative',

    overflow:
      'hidden',
  },

  // =====================================================
  // PREVIEW
  // =====================================================

  themePreview: {
    width: 84,
    height: 88,

    borderRadius:
      BorderRadius.md,

    overflow:
      'hidden',

    flexShrink: 0,
  },

  previewTop: {
    height: 17,

    width: '100%',
  },

  previewContent: {
    flex: 1,

    padding: 9,

    position:
      'relative',
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

    minWidth: 0,
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
    fontSize: 12,

    lineHeight: 18,

    includeFontPadding:
      false,
  },

  // =====================================================
  // CHECK
  // =====================================================

  checkBadge: {
    position:
      'absolute',

    top: 9,

    right: 9,

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

    gap: Spacing.sm,
  },

  calloutIcon: {
    width: 34,
    height: 34,

    borderRadius: 10,

    alignItems:
      'center',

    justifyContent:
      'center',

    backgroundColor:
      'rgba(184,255,61,0.10)',

    flexShrink: 0,
  },

  calloutContent: {
    flex: 1,

    minWidth: 0,
  },

  calloutTitle: {
    color:
      '#B8FF3D',

    fontSize: 13,

    lineHeight: 18,

    fontWeight: '800',

    includeFontPadding:
      false,
  },

  calloutText: {
    color:
      '#849087',

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

    gap: Spacing.sm,

    marginTop:
      Spacing.md,
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

    overflow:
      'hidden',

    position:
      'relative',
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

  languageCheck: {
    width: 18,
    height: 18,

    borderRadius: 9,

    alignItems:
      'center',

    justifyContent:
      'center',

    marginLeft: 2,
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

    alignItems:
      'center',

    justifyContent:
      'center',

    paddingHorizontal:
      Spacing.lg,

    paddingVertical:
      Spacing.md,

    gap: Spacing.sm,

    overflow:
      'hidden',
  },

  logoutText: {
    fontSize: 15,

    lineHeight: 21,

    fontWeight: '600',

    includeFontPadding:
      false,
  },

  // =====================================================
  // BOTTOM SPACE
  // =====================================================

  bottomSpace: {
    height: 30,
  },
});