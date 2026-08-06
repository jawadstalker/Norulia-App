import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MotiView } from 'moti';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../ui/Card';
import { Spacing, BorderRadius } from '../../constants/theme';
import { Sun, Moon, Globe, LogOut, ChevronRight, ChevronLeft } from 'lucide-react-native';

export function SettingsScreen() {
  const { colors, theme, setTheme } = useTheme();
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { logout } = useAuth();

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.text }]}>{t.settings}</Text>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {t.theme}
        </Text>

        <View style={styles.themeOptions}>
          <TouchableOpacity
            onPress={() => setTheme('light')}
            style={[
              styles.themeOption,
              theme === 'light' && { borderColor: colors.primary, borderWidth: 2 },
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <Sun size={24} color={theme === 'light' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.themeText, { color: theme === 'light' ? colors.primary : colors.text }]}>
              {t.lightMode}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setTheme('dark')}
            style={[
              styles.themeOption,
              theme === 'dark' && { borderColor: colors.primary, borderWidth: 2 },
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <Moon size={24} color={theme === 'dark' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.themeText, { color: theme === 'dark' ? colors.primary : colors.text }]}>
              {t.darkMode}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          {t.language}
        </Text>

        <View style={styles.themeOptions}>
          <TouchableOpacity
            onPress={() => setLanguage('fa')}
            style={[
              styles.themeOption,
              language === 'fa' && { borderColor: colors.primary, borderWidth: 2 },
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <Text style={styles.flagEmoji}>🇮🇷</Text>
            <Text style={[styles.themeText, { color: language === 'fa' ? colors.primary : colors.text }]}>
              {t.persian}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setLanguage('en')}
            style={[
              styles.themeOption,
              language === 'en' && { borderColor: colors.primary, borderWidth: 2 },
              { backgroundColor: colors.surfaceSecondary },
            ]}
          >
            <Text style={styles.flagEmoji}>🇬🇧</Text>
            <Text style={[styles.themeText, { color: language === 'en' ? colors.primary : colors.text }]}>
              {t.english}
            </Text>
          </TouchableOpacity>
        </View>
      </Card>

      <TouchableOpacity
        onPress={logout}
        style={[styles.logoutButton, { backgroundColor: colors.error + '15' }]}
      >
        <LogOut size={20} color={colors.error} />
        <Text style={[styles.logoutText, { color: colors.error }]}>{t.logout}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  themeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  flagEmoji: {
    fontSize: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
