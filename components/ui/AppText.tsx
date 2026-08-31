import React from 'react';

import {
  StyleProp,
  StyleSheet,
  Text as RNText,
  TextProps as RNTextProps,
  TextStyle,
} from 'react-native';

import {
  Fonts,
} from '../../constants/theme';

/* =======================================================
   TYPES
======================================================= */

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
    | StyleProp<TextStyle>;

  /**
   * Force English font even if the text contains
   * Persian characters.
   */
  forceEnglish?: boolean;

  /**
   * Force Persian font even if the text does not
   * contain Persian characters.
   */
  forcePersian?: boolean;
}

/* =======================================================
   PERSIAN CHARACTER DETECTION
======================================================= */

function containsPersian(
  value: string,
): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(
    value,
  );
}

/* =======================================================
   TEXT EXTRACTION
======================================================= */

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
      .map((child) =>
        extractText(child),
      )
      .join('');
  }

  /*
   * React elements are intentionally not inspected here.
   * The explicit forcePersian / forceEnglish props can be
   * used for dynamic nested content.
   */
  return '';
}

/* =======================================================
   DEFAULT VARIANT STYLES
======================================================= */

/*
 * IMPORTANT:
 *
 * Do NOT specify fontWeight for Persian text here.
 *
 * Estedad-Medium.ttf is a single physical font file.
 * Android should use that exact font instead of trying
 * to resolve a synthetic/other weight.
 */

const variantStyles: Record<
  AppTextVariant,
  TextStyle
> = {
  display: {
    fontFamily: Fonts.persian,
    fontSize: 32,
    lineHeight: 42,
  },

  h1: {
    fontFamily: Fonts.persian,
    fontSize: 28,
    lineHeight: 38,
  },

  h2: {
    fontFamily: Fonts.persian,
    fontSize: 24,
    lineHeight: 34,
  },

  h3: {
    fontFamily: Fonts.persian,
    fontSize: 20,
    lineHeight: 30,
  },

  body: {
    fontFamily: Fonts.persian,
    fontSize: 16,
    lineHeight: 27,
  },

  bodySmall: {
    fontFamily: Fonts.persian,
    fontSize: 14,
    lineHeight: 23,
  },

  caption: {
    fontFamily: Fonts.persian,
    fontSize: 12,
    lineHeight: 20,
  },

  button: {
    fontFamily: Fonts.persian,
    fontSize: 15,
    lineHeight: 24,
  },
};

/* =======================================================
   COMPONENT
======================================================= */

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

  /*
   * Persian is selected when:
   *
   * 1. forcePersian === true
   *
   * OR
   *
   * 2. the actual text contains Persian characters
   *
   * unless forceEnglish is explicitly true.
   */
  const isPersian =
    forcePersian ||
    (
      !forceEnglish &&
      hasPersian
    );

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
          /*
           * This is deliberately applied directly
           * to the final native Text style.
           *
           * This prevents another style from replacing
           * the font family before React Native renders it.
           */
          fontFamily,

          writingDirection:
            direction,

          textAlign:
            isPersian
              ? 'right'
              : undefined,

          /*
           * Never ask Android to synthesize a different
           * Persian font weight.
           */
          fontWeight:
            undefined,
        },

        styles.base,

        style,
      ]}
    >
      {children}
    </RNText>
  );
}

/* =======================================================
   PERSIAN TEXT
======================================================= */

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

/* =======================================================
   ENGLISH TEXT
======================================================= */

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

/* =======================================================
   STYLES
======================================================= */

const styles =
  StyleSheet.create({
    base: {
      /*
       * Prevent Android from adding its own
       * extra top/bottom font padding.
       */
      includeFontPadding: false,

      /*
       * Ensure text does not inherit a font weight
       * that could cause Android to select a fallback.
       */
      fontWeight:
        undefined,
    },
  });

export default AppText;