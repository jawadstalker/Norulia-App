// constants/theme.ts

export const Colors = {
  // =====================================================
  // LIGHT THEME
  // =====================================================

  light: {
    // Base
    background: '#F8F7FC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F3F1F9',

    // Primary
    primary: '#7C3AED',
    primaryLight: '#A78BFA',
    primaryDark: '#5B21B6',

    // Accent
    accent: '#C4B5FD',

    // Text
    text: '#1F2937',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',

    // Border
    border: '#E5E7EB',

    // Status
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',

    // Shadow
    cardShadow: 'rgba(124, 58, 237, 0.08)',

    // Gradients
    gradientPrimary: [
      '#EEF2FF',
      '#FFFFFF',
      '#F8FAFC',
    ],

    gradientCard: [
      'rgba(255,255,255,0.95)',
      'rgba(255,255,255,0.80)',
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

    // Glass
    glassBackground:
      'rgba(255,255,255,0.92)',

    glassHover:
      'rgba(255,255,255,0.98)',

    glassBorder:
      'rgba(124,58,237,0.12)',

    glassBorderHover:
      'rgba(124,58,237,0.25)',

    // Glow
    glow:
      'rgba(124,58,237,0.12)',

    glowStrong:
      'rgba(124,58,237,0.20)',

    // Icon
    iconFilter:
      'brightness(0) saturate(100%)',
  },

  // =====================================================
  // DARK THEME
  // =====================================================

  dark: {
    // ===================================================
    // BACKGROUND
    // ===================================================

    background: '#0B1026',

    surface:
      'rgba(26, 29, 69, 0.60)',

    surfaceSecondary:
      '#1A1645',

    // ===================================================
    // PRIMARY
    // ===================================================

    primary: '#7B61FF',

    primaryLight: '#9A86FF',

    primaryDark: '#6348E8',

    // ===================================================
    // ACCENT
    // ===================================================

    accent: '#7B61FF',

    // ===================================================
    // TEXT
    // ===================================================

    text: '#FFFFFF',

    textSecondary: '#B6C2D9',

    textTertiary: '#A9B1D6',

    // ===================================================
    // BORDER
    // ===================================================

    border:
      'rgba(123, 97, 255, 0.20)',

    // ===================================================
    // STATUS
    // ===================================================

    success: '#34D399',

    warning: '#FBBF24',

    error: '#F87171',

    // ===================================================
    // SHADOW
    // ===================================================

    cardShadow:
      'rgba(0, 0, 0, 0.50)',

    // ===================================================
    // GRADIENTS
    // ===================================================

    gradientPrimary: [
      '#0B1026',
      '#1A1645',
      '#101B3D',
    ],

    gradientCard: [
      'rgba(26, 29, 69, 0.60)',
      'rgba(26, 29, 69, 0.60)',
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

    // ===================================================
    // GLASS
    // ===================================================

    glassBackground:
      'rgba(26, 29, 69, 0.60)',

    glassHover:
      'rgba(26, 29, 69, 0.80)',

    glassBorder:
      'rgba(123, 97, 255, 0.20)',

    glassBorderHover:
      'rgba(123, 97, 255, 0.40)',

    // ===================================================
    // GLOW
    // ===================================================

    glow:
      'rgba(110, 90, 255, 0.18)',

    glowStrong:
      'rgba(110, 90, 255, 0.25)',

    // ===================================================
    // ICON
    // ===================================================

    iconFilter:
      'brightness(0) invert(1)',
  },
};

// =======================================================
// FONTS
// =======================================================

export const Fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
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
// GRADIENT HELPER
// =======================================================

export const getGradient = (
  type:
    | 'primary'
    | 'card'
    | 'cardSolid'
    | 'button'
    | 'header',
  isDark: boolean,
) => {
  const theme = isDark
    ? Colors.dark
    : Colors.light;

  switch (type) {
    case 'primary':
      return theme.gradientPrimary;

    case 'card':
      return theme.gradientCard;

    case 'cardSolid':
      return isDark
        ? Colors.dark.gradientCardSolid
        : Colors.light.gradientCard;

    case 'button':
      return theme.gradientButton;

    case 'header':
      return theme.gradientHeader;

    default:
      return theme.gradientPrimary;
  }
};

// =======================================================
// GLASS STYLE
// =======================================================

export const getGlassStyle = (
  isDark: boolean,
  opacity: number = 0.08,
) => {
  if (isDark) {
    return {
      backgroundColor:
        `rgba(26, 29, 69, ${Math.min(
          opacity + 0.52,
          0.80,
        )})`,

      borderColor:
        'rgba(123, 97, 255, 0.20)',

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
      'rgba(124, 58, 237, 0.12)',

    borderWidth: 1,
  };
};

// =======================================================
// HOVER GLASS STYLE
// =======================================================

export const getGlassHoverStyle = (
  isDark: boolean,
) => {
  return {
    backgroundColor: isDark
      ? 'rgba(26, 29, 69, 0.80)'
      : 'rgba(255, 255, 255, 0.98)',

    borderColor: isDark
      ? 'rgba(123, 97, 255, 0.40)'
      : 'rgba(124, 58, 237, 0.25)',

    borderWidth: 1,
  };
};

// =======================================================
// SHADOW STYLE
// =======================================================

export const getShadowStyle = (
  isDark: boolean,
  intensity: number = 1,
) => {
  if (isDark) {
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
  isDark: boolean,
) => {
  if (isDark) {
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

// =======================================================
// THEME TYPE
// =======================================================

export type AppColors =
  typeof Colors.light;

// =======================================================
// DEFAULT EXPORT
// =======================================================

export default Colors;