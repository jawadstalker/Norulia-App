import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { SettingsScreen } from '../components/screens/SettingsScreen';
import { Spacing, BorderRadius } from '../constants/theme';

export default function SettingsRoute() {
  const router = useRouter();

  const { colors } = useTheme();
  const { t } = useLanguage();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      {/* ================================
          HEADER
         ================================ */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        {/* BACK BUTTON — LEFT */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => router.back()}
          style={[
            styles.backButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t.back || 'بازگشت'}
        >
          <ArrowLeft
            size={22}
            strokeWidth={2.2}
            color={colors.text}
          />
        </TouchableOpacity>

        {/* TITLE — RIGHT */}
        <View style={styles.titleContainer}>
          {/* <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
            numberOfLines={1}
          >
            {t.settings || 'تنظیمات'}
          </Text> */}
        </View>
      </View>

      {/* ================================
          CONTENT
         ================================ */}
      <View style={styles.content}>
        <SettingsScreen />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* =================================
     HEADER
     ================================= */
  header: {
    minHeight: 72,

    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.sm,

    flexDirection: 'row',

    alignItems: 'center',

    /*
     * مهم:
     * هیچ RTL روی خود Header اعمال نمی‌کنیم.
     * ترتیب فیزیکی:
     *
     * [ BACK ]                  [ TITLE ]
     *
     */
    justifyContent: 'space-between',

    width: '100%',
  },

  /* =================================
     BACK BUTTON
     ================================= */
  backButton: {
    width: 42,
    height: 42,

    borderRadius: 30,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,

    flexShrink: 0,
  },

  /* =================================
     TITLE
     * همیشه سمت راست
     ================================= */
  titleContainer: {
    flex: 1,

    alignItems: 'flex-end',
    justifyContent: 'center',

    marginLeft: Spacing.md,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',

    textAlign: 'right',

    includeFontPadding: false,
  },

  /* =================================
     CONTENT
     ================================= */
  content: {
    flex: 1,
  },
});