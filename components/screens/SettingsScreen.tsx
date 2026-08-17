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
  LogOut,
} from 'lucide-react-native';

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

  const { logout } = useAuth();

  return (
    <ScrollView
      style={{
        ...styles.container,
        backgroundColor: colors.background,
      }}
      contentContainerStyle={{
        ...styles.content,
        direction: isRTL ? 'rtl' : 'ltr',
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* =========================================
          TITLE
      ========================================= */}

      <Text
        style={{
          ...styles.title,
          color: colors.text,
          textAlign: isRTL ? 'right' : 'left',
          writingDirection: isRTL ? 'rtl' : 'ltr',
        }}
      >
        {t.settings}
      </Text>

      {/* =========================================
          THEME SECTION
      ========================================= */}

      <Card
        style={{
          ...styles.section,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            ...styles.sectionTitle,
            color: colors.textSecondary,
            textAlign: isRTL ? 'right' : 'left',
            writingDirection: isRTL ? 'rtl' : 'ltr',
          }}
        >
          {t.theme}
        </Text>

        <View
          style={{
            ...styles.optionsRow,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          }}
        >
          {/* LIGHT */}

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setTheme('light')}
            accessibilityRole="button"
            accessibilityLabel={t.lightMode}
            style={{
              ...styles.option,
              backgroundColor: colors.surfaceSecondary,
              borderColor:
                theme === 'light'
                  ? colors.primary
                  : colors.border,
              borderWidth: theme === 'light' ? 2 : 1,
            }}
          >
            <Sun
              size={22}
              color={
                theme === 'light'
                  ? colors.primary
                  : colors.textSecondary
              }
              strokeWidth={2}
            />

            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={{
                ...styles.optionText,
                color:
                  theme === 'light'
                    ? colors.primary
                    : colors.text,
                writingDirection: isRTL ? 'rtl' : 'ltr',
              }}
            >
              {t.lightMode}
            </Text>
          </TouchableOpacity>

          {/* DARK */}

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setTheme('dark')}
            accessibilityRole="button"
            accessibilityLabel={t.darkMode}
            style={{
              ...styles.option,
              backgroundColor: colors.surfaceSecondary,
              borderColor:
                theme === 'dark'
                  ? colors.primary
                  : colors.border,
              borderWidth: theme === 'dark' ? 2 : 1,
            }}
          >
            <Moon
              size={22}
              color={
                theme === 'dark'
                  ? colors.primary
                  : colors.textSecondary
              }
              strokeWidth={2}
            />

            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={{
                ...styles.optionText,
                color:
                  theme === 'dark'
                    ? colors.primary
                    : colors.text,
                writingDirection: isRTL ? 'rtl' : 'ltr',
              }}
            >
              {t.darkMode}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* =========================================
          LANGUAGE SECTION
      ========================================= */}

      <Card
        style={{
          ...styles.section,
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            ...styles.sectionTitle,
            color: colors.textSecondary,
            textAlign: isRTL ? 'right' : 'left',
            writingDirection: isRTL ? 'rtl' : 'ltr',
          }}
        >
          {t.language}
        </Text>

        <View
          style={{
            ...styles.optionsRow,
            flexDirection: isRTL ? 'row-reverse' : 'row',
          }}
        >
          {/* PERSIAN */}

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setLanguage('fa')}
            accessibilityRole="button"
            accessibilityLabel={t.persian}
            style={{
              ...styles.option,
              backgroundColor: colors.surfaceSecondary,
              borderColor:
                language === 'fa'
                  ? colors.primary
                  : colors.border,
              borderWidth: language === 'fa' ? 2 : 1,
            }}
          >
            <Text style={styles.flag}>
              🇮🇷
            </Text>

            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={{
                ...styles.optionText,
                color:
                  language === 'fa'
                    ? colors.primary
                    : colors.text,
                writingDirection: isRTL ? 'rtl' : 'ltr',
              }}
            >
              {t.persian}
            </Text>
          </TouchableOpacity>

          {/* ENGLISH */}

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setLanguage('en')}
            accessibilityRole="button"
            accessibilityLabel={t.english}
            style={{
              ...styles.option,
              backgroundColor: colors.surfaceSecondary,
              borderColor:
                language === 'en'
                  ? colors.primary
                  : colors.border,
              borderWidth: language === 'en' ? 2 : 1,
            }}
          >
            <Text style={styles.flag}>
              🇬🇧
            </Text>

            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={{
                ...styles.optionText,
                color:
                  language === 'en'
                    ? colors.primary
                    : colors.text,
                writingDirection: isRTL ? 'rtl' : 'ltr',
              }}
            >
              {t.english}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      {/* =========================================
          LOGOUT
      ========================================= */}

      <TouchableOpacity
        activeOpacity={0.75}
        onPress={logout}
        accessibilityRole="button"
        accessibilityLabel={t.logout}
        style={{
          ...styles.logoutButton,
          backgroundColor: colors.error + '15',
          borderColor: colors.error + '30',
        }}
      >
        <LogOut
          size={20}
          color={colors.error}
          strokeWidth={2}
        />

        <Text
          style={{
            ...styles.logoutText,
            color: colors.error,
            writingDirection: isRTL ? 'rtl' : 'ltr',
          }}
        >
          {t.logout}
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 40,
    width: '100%',
  },

  /* =========================================
     TITLE
  ========================================= */

  title: {
    width: '100%',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    marginBottom: Spacing.lg,
    includeFontPadding: false,
  },

  /* =========================================
     SECTION
  ========================================= */

  section: {
    width: '100%',
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  sectionTitle: {
    width: '100%',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
    marginBottom: Spacing.md,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },

  /* =========================================
     OPTIONS
  ========================================= */

  optionsRow: {
    width: '100%',
    alignItems: 'stretch',
    gap: Spacing.sm,
  },

  option: {
    flex: 1,
    minWidth: 0,
    minHeight: 58,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },

  optionText: {
    flexShrink: 1,
    minWidth: 0,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },

  flag: {
    fontSize: 21,
    lineHeight: 25,
    flexShrink: 0,
  },

  /* =========================================
     LOGOUT
  ========================================= */

  logoutButton: {
    width: '100%',
    minHeight: 56,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    overflow: 'hidden',
  },

  logoutText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '600',
    includeFontPadding: false,
  },

  bottomSpace: {
    height: 30,
  },
});