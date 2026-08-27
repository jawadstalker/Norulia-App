import React from 'react';

import {
  I18nManager,
  StyleProp,
  StyleSheet,
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from 'react-native';

import {
  Fonts,
} from '../../constants/theme';

// =======================================================
// TYPES
// =======================================================

export type AppTextVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'button';

interface AppTextProps
  extends RNTextProps {
  children?: React.ReactNode;

  variant?: AppTextVariant;

  style?:
    StyleProp<TextStyle>;

  forceEnglish?: boolean;

  forcePersian?: boolean;
}

// =======================================================
// PERSIAN CHARACTER DETECTION
// =======================================================

function containsPersian(
  value: string,
): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(
    value,
  );
}

function extractText(
  children: React.ReactNode,
): string {
  if (
    children === null ||
    children === undefined
  ) {
    return '';
  }

  if (
    typeof children === 'string' ||
    typeof children === 'number'
  ) {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children
      .map(child =>
        extractText(child),
      )
      .join('');
  }

  return '';
}

// =======================================================
// DEFAULT VARIANT STYLES
// =======================================================

const variantStyles: Record<
  AppTextVariant,
  TextStyle
> = {
  display: {
    fontFamily: Fonts.persian,
    fontSize: 32,
    lineHeight: 42,
    fontWeight: '500',
  },

  h1: {
    fontFamily: Fonts.persian,
    fontSize: 28,
    lineHeight: 38,
    fontWeight: '500',
  },

  h2: {
    fontFamily: Fonts.persian,
    fontSize: 24,
    lineHeight: 34,
    fontWeight: '500',
  },

  h3: {
    fontFamily: Fonts.persian,
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '500',
  },

  body: {
    fontFamily: Fonts.persian,
    fontSize: 16,
    lineHeight: 27,
    fontWeight: '500',
  },

  bodySmall: {
    fontFamily: Fonts.persian,
    fontSize: 14,
    lineHeight: 23,
    fontWeight: '500',
  },

  caption: {
    fontFamily: Fonts.persian,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '500',
  },

  button: {
    fontFamily: Fonts.persian,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
};

// =======================================================
// COMPONENT
// =======================================================

export function AppText({
  children,

  variant = 'body',

  style,

  forceEnglish = false,

  forcePersian = false,

  ...props
}: AppTextProps) {
  const text =
    extractText(children);

  const hasPersian =
    containsPersian(text);

  const isPersian =
    forcePersian ||
    (!forceEnglish && hasPersian);

  const fontFamily =
    isPersian
      ? Fonts.persian
      : Fonts.regular;

  const direction =
    isPersian
      ? 'rtl'
      : 'ltr';

  return (
    <RNText
      {...props}
      style={[
        variantStyles[variant],

        {
          fontFamily,
          writingDirection:
            direction,

          textAlign:
            isPersian
              ? 'right'
              : undefined,
        },

        styles.base,

        style,
      ]}
    >
      {children}
    </RNText>
  );
}

// =======================================================
// CONVENIENCE COMPONENTS
// =======================================================

export function PersianText(
  props: Omit<
    AppTextProps,
    'forcePersian'
  >,
) {
  return (
    <AppText
      {...props}
      forcePersian
    />
  );
}

export function EnglishText(
  props: Omit<
    AppTextProps,
    'forceEnglish'
  >,
) {
  return (
    <AppText
      {...props}
      forceEnglish
    />
  );
}

// =======================================================
// STYLES
// =======================================================

const styles =
  StyleSheet.create({
    base: {
      includeFontPadding: false,
    },
  });

export default AppText;