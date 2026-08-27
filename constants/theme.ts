// =======================================================
// NEUROLIA DESIGN SYSTEM
// =======================================================

export const Colors = {
  // =====================================================
  // LIGHT THEME
  // =====================================================

  light: {
    background: '#F8F7FC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F3F1F9',

    primary: '#7C3AED',
    primaryLight: '#A78BFA',
    primaryDark: '#5B21B6',

    accent: '#C4B5FD',

    iconAccent: '#7C3AED',
    progressAccent: '#7C3AED',

    text: '#1F2937',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',

    border: '#E5E7EB',

    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',

    cardShadow: 'rgba(124, 58, 237, 0.08)',

    gradientPrimary: [
      '#EEF2FF',
      '#FFFFFF',
      '#F8FAFC',
    ],

    gradientCard: [
      'rgba(255,255,255,0.98)',
      'rgba(255,255,255,0.86)',
    ],

    gradientCardSolid: [
      '#FFFFFF',
      '#F3F1F9',
    ],

    gradientButton: [
      '#7C3AED',
      '#6D28D9',
      '#5B21B6',
    ],

    gradientHeader: [
      '#7C3AED',
      '#6D28D9',
    ],

    glassBackground:
      'rgba(255,255,255,0.92)',

    glassHover:
      'rgba(255,255,255,0.98)',

    glassBorder:
      'rgba(124,58,237,0.12)',

    glassBorderHover:
      'rgba(124,58,237,0.25)',

    glow:
      'rgba(124,58,237,0.12)',

    glowStrong:
      'rgba(124,58,237,0.20)',

    iconFilter:
      'brightness(0) saturate(100%)',
  },

  // =====================================================
  // DARK THEME
  // =====================================================

  dark: {
    background: '#0B1026',

    surface:
      'rgba(26, 29, 69, 0.60)',

    surfaceSecondary:
      '#1A1645',

    primary: '#7B61FF',

    primaryLight: '#9A86FF',

    primaryDark: '#6348E8',

    accent: '#7B61FF',

    iconAccent:
      'rgba(73, 194, 226, 1)',

    progressAccent:
      'rgba(73, 194, 226, 1)',

    text: '#FFFFFF',

    textSecondary: '#B6C2D9',

    textTertiary: '#A9B1D6',

    border:
      'rgba(123, 97, 255, 0.20)',

    success: '#34D399',

    warning: '#FBBF24',

    error: '#F87171',

    cardShadow:
      'rgba(0, 0, 0, 0.50)',

    gradientPrimary: [
      '#0B1026',
      '#1A1645',
      '#101B3D',
    ],

    gradientCard: [
      'rgba(26, 29, 69, 0.72)',
      'rgba(16, 27, 61, 0.72)',
    ],

    gradientCardSolid: [
      '#1A1645',
      '#101B3D',
    ],

    gradientButton: [
      '#7B61FF',
      '#6E5AFF',
      '#5A46D6',
    ],

    gradientHeader: [
      '#1A1645',
      '#7B61FF',
    ],

    glassBackground:
      'rgba(26, 29, 69, 0.60)',

    glassHover:
      'rgba(26, 29, 69, 0.80)',

    glassBorder:
      'rgba(123, 97, 255, 0.20)',

    glassBorderHover:
      'rgba(123, 97, 255, 0.40)',

    glow:
      'rgba(110, 90, 255, 0.18)',

    glowStrong:
      'rgba(110, 90, 255, 0.25)',

    iconFilter:
      'brightness(0) invert(1)',
  },

  // =====================================================
  // NEON ATHLETE
  // Brain × Body × Performance
  // =====================================================

  athlete: {
    background: '#070908',

    surface: '#0D120F',

    surfaceSecondary: '#121A15',

    primary: '#B8FF3D',

    primaryLight: '#D0FF67',

    primaryDark: '#72B52A',

    accent: '#B8FF3D',

    iconAccent: '#B8FF3D',

    progressAccent: '#B8FF3D',

    text: '#F4F7F2',

    textSecondary: '#9AA69D',

    textTertiary: '#657168',

    border:
      'rgba(184, 255, 61, 0.16)',

    success: '#B8FF3D',

    warning: '#FFC857',

    error: '#FF5C5C',

    cardShadow:
      'rgba(0, 0, 0, 0.65)',

    gradientPrimary: [
      '#070908',
      '#0D1710',
      '#101B12',
    ],

    gradientCard: [
      'rgba(18, 26, 21, 0.96)',
      'rgba(10, 15, 12, 0.96)',
    ],

    gradientCardSolid: [
      '#121A15',
      '#0A0F0C',
    ],

    gradientButton: [
      '#D0FF67',
      '#B8FF3D',
      '#7FBC2B',
    ],

    gradientHeader: [
      '#0B120D',
      '#172414',
      '#B8FF3D',
    ],

    glassBackground:
      'rgba(13, 18, 15, 0.86)',

    glassHover:
      'rgba(18, 26, 21, 0.96)',

    glassBorder:
      'rgba(184, 255, 61, 0.14)',

    glassBorderHover:
      'rgba(184, 255, 61, 0.34)',

    glow:
      'rgba(184, 255, 61, 0.10)',

    glowStrong:
      'rgba(184, 255, 61, 0.22)',

    iconFilter:
      'brightness(0) saturate(100%)',
  },
};

// =======================================================
// FONT FAMILY
// =======================================================

export const Fonts = {
  // Persian
  persian: 'EstedadMedium',

  // English
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

// =======================================================
// TYPOGRAPHY
// =======================================================

export const Typography = {
  display: {
    fontFamily: Fonts.persian,
    fontSize: 32,
    lineHeight: 42,
    fontWeight: '500' as const,
  },

  h1: {
    fontFamily: Fonts.persian,
    fontSize: 28,
    lineHeight: 38,
    fontWeight: '500' as const,
  },

  h2: {
    fontFamily: Fonts.persian,
    fontSize: 24,
    lineHeight: 34,
    fontWeight: '500' as const,
  },

  h3: {
    fontFamily: Fonts.persian,
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '500' as const,
  },

  body: {
    fontFamily: Fonts.persian,
    fontSize: 16,
    lineHeight: 27,
    fontWeight: '500' as const,
  },

  bodySmall: {
    fontFamily: Fonts.persian,
    fontSize: 14,
    lineHeight: 23,
    fontWeight: '500' as const,
  },

  caption: {
    fontFamily: Fonts.persian,
    fontSize: 12,
    lineHeight: 20,
    fontWeight: '500' as const,
  },

  button: {
    fontFamily: Fonts.persian,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500' as const,
  },

  english: {
    regular: {
      fontFamily: Fonts.regular,
      fontWeight: '400' as const,
    },

    medium: {
      fontFamily: Fonts.medium,
      fontWeight: '500' as const,
    },

    semiBold: {
      fontFamily: Fonts.semiBold,
      fontWeight: '600' as const,
    },

    bold: {
      fontFamily: Fonts.bold,
      fontWeight: '700' as const,
    },
  },
};

// =======================================================
// SPACING
// =======================================================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// =======================================================
// BORDER RADIUS
// =======================================================

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// =======================================================
// THEME HELPERS
// =======================================================

export type ThemeName =
  | 'light'
  | 'dark'
  | 'athlete';

export type ThemeColors =
  typeof Colors.light;

export const getGradient = (
  type:
    | 'primary'
    | 'card'
    | 'cardSolid'
    | 'button'
    | 'header',

  theme: ThemeName,
) => {
  const selectedTheme =
    Colors[theme];

  switch (type) {
    case 'primary':
      return selectedTheme.gradientPrimary;

    case 'card':
      return selectedTheme.gradientCard;

    case 'cardSolid':
      return selectedTheme.gradientCardSolid;

    case 'button':
      return selectedTheme.gradientButton;

    case 'header':
      return selectedTheme.gradientHeader;

    default:
      return selectedTheme.gradientPrimary;
  }
};

// =======================================================
// GLASS
// =======================================================

export const getGlassStyle = (
  theme: ThemeName,
  opacity: number = 0.08,
) => {
  const selectedTheme =
    Colors[theme];

  if (theme === 'athlete') {
    return {
      backgroundColor:
        `rgba(13, 18, 15, ${Math.min(
          opacity + 0.75,
          0.96,
        )})`,

      borderColor:
        selectedTheme.glassBorder,

      borderWidth: 1,
    };
  }

  if (theme === 'dark') {
    return {
      backgroundColor:
        `rgba(26, 29, 69, ${Math.min(
          opacity + 0.52,
          0.80,
        )})`,

      borderColor:
        selectedTheme.glassBorder,

      borderWidth: 1,
    };
  }

  return {
    backgroundColor:
      `rgba(255, 255, 255, ${Math.min(
        opacity + 0.8,
        1,
      )})`,

    borderColor:
      selectedTheme.glassBorder,

    borderWidth: 1,
  };
};

// =======================================================
// GLASS HOVER
// =======================================================

export const getGlassHoverStyle = (
  theme: ThemeName,
) => {
  const selectedTheme =
    Colors[theme];

  return {
    backgroundColor:
      selectedTheme.glassHover,

    borderColor:
      selectedTheme.glassBorderHover,

    borderWidth: 1,
  };
};

// =======================================================
// SHADOW
// =======================================================

export const getShadowStyle = (
  theme: ThemeName,
  intensity: number = 1,
) => {
  if (theme === 'athlete') {
    return {
      shadowColor: '#000000',

      shadowOffset: {
        width: 0,
        height: 8 * intensity,
      },

      shadowOpacity: 0.65,

      shadowRadius:
        24 * intensity,

      elevation:
        10 * intensity,
    };
  }

  if (theme === 'dark') {
    return {
      shadowColor:
        'rgba(110, 90, 255, 0.25)',

      shadowOffset: {
        width: 0,
        height: 8 * intensity,
      },

      shadowOpacity: 0.5,

      shadowRadius:
        20 * intensity,

      elevation:
        8 * intensity,
    };
  }

  return {
    shadowColor:
      'rgba(124, 58, 237, 0.08)',

    shadowOffset: {
      width: 0,
      height: 4 * intensity,
    },

    shadowOpacity: 0.1,

    shadowRadius:
      12 * intensity,

    elevation:
      6 * intensity,
  };
};

// =======================================================
// CARD SHADOW
// =======================================================

export const getCardShadowStyle = (
  theme: ThemeName,
) => {
  if (theme === 'athlete') {
    return {
      shadowColor: '#000000',

      shadowOffset: {
        width: 0,
        height: 12,
      },

      shadowOpacity: 0.65,

      shadowRadius: 30,

      elevation: 12,
    };
  }

  if (theme === 'dark') {
    return {
      shadowColor:
        'rgba(0, 0, 0, 0.50)',

      shadowOffset: {
        width: 0,
        height: 12,
      },

      shadowOpacity: 0.5,

      shadowRadius: 40,

      elevation: 12,
    };
  }

  return {
    shadowColor:
      'rgba(124, 58, 237, 0.08)',

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.1,

    shadowRadius: 20,

    elevation: 6,
  };
};

export type AppColors =
  typeof Colors.light;

export default Colors;