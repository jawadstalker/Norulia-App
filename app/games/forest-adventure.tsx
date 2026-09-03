import React, { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppText as Text } from '../../components/ui/AppText';

import { useRouter } from 'expo-router';

import {
  ArrowLeft,
  Gamepad2,
  Play,
} from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

import {
  BorderRadius,
  Spacing,
} from '../../constants/theme';

import {
  launchNoruPuzzle,
} from '../../utils/externalGame';

export default function ForestAdventureScreen() {
  const router = useRouter();

  const {
    colors,
    isDark,
    isAthlete,
  } = useTheme();

  const {
    language,
    isRTL,
    t,
  } = useLanguage();

  const [launching, setLaunching] = useState(false);

  const isPersian = language === 'fa';

  const primaryColor = isAthlete
    ? '#22C55E'
    : isDark
      ? '#49C2E2'
      : colors.primary;

  const handleLaunchGame = useCallback(async () => {
    if (launching) {
      return;
    }

    setLaunching(true);

    try {
      const launched = await launchNoruPuzzle();

      if (!launched) {
        Alert.alert(
          isPersian
            ? 'بازی نصب نیست'
            : 'Game Not Installed',
          isPersian
            ? 'بازی Forest Adventure روی این دستگاه نصب نشده است.'
            : 'Forest Adventure is not installed on this device.',
          [
            {
              text: isPersian ? 'باشه' : 'OK',
              style: 'cancel',
            },
          ]
        );
      }
    } catch (error) {
      console.error(
        'Forest Adventure launch error:',
        error
      );

      Alert.alert(
        isPersian
          ? 'خطا'
          : 'Error',
        isPersian
          ? 'امکان اجرای بازی وجود ندارد.'
          : 'Unable to launch the game.',
        [
          {
            text: isPersian ? 'باشه' : 'OK',
            style: 'cancel',
          },
        ]
      );
    } finally {
      setTimeout(() => {
        setLaunching(false);
      }, 700);
    }
  }, [
    launching,
    isPersian,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleLaunchGame();
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [handleLaunchGame]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/');
          }
        }}
        style={[
          styles.backButton,
          {
            backgroundColor: colors.surface,
            flexDirection: isRTL
              ? 'row-reverse'
              : 'row',
          },
        ]}
      >
        <ArrowLeft
          size={22}
          color={colors.text}
          style={
            isRTL
              ? {
                  transform: [
                    {
                      scaleX: -1,
                    },
                  ],
                }
              : undefined
          }
        />

        <Text
          style={[
            styles.backText,
            {
              color: colors.text,
            },
          ]}
        >
          {t.back}
        </Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                primaryColor + '18',
            },
          ]}
        >
          <Gamepad2
            size={64}
            color={primaryColor}
          />
        </View>

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              textAlign: 'center',
            },
          ]}
        >
          {isPersian
            ? 'ماجراجویی در جنگل'
            : 'Forest Adventure'}
        </Text>

        <Text
          style={[
            styles.description,
            {
              color: colors.textSecondary,
              textAlign: 'center',
            },
          ]}
        >
          {isPersian
            ? 'بازی در حال اجرا شدن است...'
            : 'Launching the game...'}
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleLaunchGame}
          disabled={launching}
          style={[
            styles.launchButton,
            {
              backgroundColor: primaryColor,
              opacity: launching ? 0.7 : 1,
            },
          ]}
        >
          {launching ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Play
              size={20}
              color="#FFFFFF"
              fill="#FFFFFF"
            />
          )}

          <Text
            style={styles.launchButtonText}
          >
            {launching
              ? isPersian
                ? 'در حال اجرا...'
                : 'Launching...'
              : isPersian
                ? 'اجرای بازی'
                : 'Launch Game'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  backButton: {
    marginTop: 54,
    marginHorizontal: Spacing.lg,
    minHeight: 44,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
  },

  backText: {
    fontSize: 15,
    fontWeight: '600',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: 80,
  },

  iconContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: Spacing.md,
  },

  description: {
    fontSize: 16,
    lineHeight: 25,
    marginBottom: Spacing.xl,
  },

  launchButton: {
    minWidth: 190,
    minHeight: 54,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  launchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});