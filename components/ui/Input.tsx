import React from 'react';

import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
} from 'react-native';

import { useTheme } from '../../context/ThemeContext';

import {
  Spacing,
  BorderRadius,
} from '../../constants/theme';

/* ================================================================
   TYPES
================================================================ */

interface InputProps
  extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

/* ================================================================
   COMPONENT
================================================================ */

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}: InputProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.container,
        containerStyle,
      ]}
    >
      {label ? (
        <Text
          style={[
            styles.label,
            {
              color:
                colors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor:
              colors.surfaceSecondary,

            borderColor: error
              ? colors.error
              : colors.border,
          },
        ]}
      >
        {leftIcon ? (
          <View style={styles.iconLeft}>
            {leftIcon}
          </View>
        ) : null}

        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
            },

            /*
             * Important:
             *
             * Do not use:
             *
             * leftIcon && {...}
             *
             * because ReactNode can produce values such
             * as 0, '', false, etc., which are not valid
             * TextStyle array entries for React Native's
             * TypeScript definitions.
             */
            leftIcon
              ? {
                  paddingLeft: 0,
                }
              : undefined,

            rightIcon
              ? {
                  paddingRight: 0,
                }
              : undefined,

            style,
          ]}
          placeholderTextColor={
            colors.textTertiary
          }
          {...props}
        />

        {rightIcon ? (
          <View style={styles.iconRight}>
            {rightIcon}
          </View>
        ) : null}
      </View>

      {error ? (
        <Text
          style={[
            styles.error,
            {
              color: colors.error,
            },
          ]}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

/* ================================================================
   STYLES
================================================================ */

const styles =
  StyleSheet.create({
    container: {
      marginBottom:
        Spacing.md,
    },

    label: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom:
        Spacing.sm,
    },

    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',

      borderRadius:
        BorderRadius.lg,

      borderWidth: 1,

      paddingHorizontal:
        Spacing.md,
    },

    input: {
      flex: 1,

      paddingVertical:
        Spacing.md,

      fontSize: 16,
    },

    iconLeft: {
      marginRight:
        Spacing.sm,
    },

    iconRight: {
      marginLeft:
        Spacing.sm,
    },

    error: {
      fontSize: 12,

      marginTop:
        Spacing.xs,
    },
  });