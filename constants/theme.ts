export const Colors = {
  light: {
    background: '#F8F7FC',
    surface: '#FFFFFF',
    surfaceSecondary: '#F3F1F9',
    primary: '#7C3AED',
    primaryLight: '#A78BFA',
    primaryDark: '#5B21B6',
    accent: '#C4B5FD',
    text: '#1F2937',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    cardShadow: 'rgba(124, 58, 237, 0.08)',
    
    // ===== Gradients =====
    gradientPrimary: ['#EEF2FF', '#FFFFFF', '#F8FAFC'],
    gradientCard: ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.8)'],
    gradientButton: ['#7C3AED', '#6D28D9', '#5B21B6'],
    gradientHeader: ['#7C3AED', '#6D28D9'],
  },
  dark: {
    // ===== Base Colors =====
    background: '#241D3A',
    surface: '#30274A',
    surfaceSecondary: '#3B315A',
    
    // ===== Primary =====
    primary: '#A78BFA',
    primaryLight: '#C4B5FD',
    primaryDark: '#8B5CF6',
    
    // ===== Accent =====
    accent: '#D8B4FE',
    
    // ===== Text =====
    text: '#FFFFFF',
    textSecondary: '#E9E5F7',
    textTertiary: '#C6C1D9',
    
    // ===== Border =====
    border: '#4B426A',
    
    // ===== Status =====
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    
    // ===== Shadows =====
    cardShadow: 'rgba(167,139,250,0.25)',
    
    // ===== Gradients =====
    gradientPrimary: ['#46386D', '#352B56', '#241D3A'],
    gradientCard: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)'],
    gradientCardSolid: ['#3D3262', '#2D2548'],
    gradientButton: ['#C084FC', '#A78BFA', '#8B5CF6'],
    gradientHeader: ['#5B46A8', '#7C5CFF'],
    
    // ===== Glow Effects =====
    glow: 'rgba(167,139,250,0.35)',
    glowStrong: 'rgba(139,92,246,0.45)',
  }
};

export const Fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// ===== Helper Functions =====
export const getGradient = (type: keyof typeof Colors['dark']['gradientPrimary'] | string, isDark: boolean) => {
  const theme = isDark ? Colors.dark : Colors.light;
  
  switch (type) {
    case 'primary':
      return theme.gradientPrimary;
    case 'card':
      return theme.gradientCard;
    case 'cardSolid':
      return isDark ? Colors.dark.gradientCardSolid : Colors.light.gradientCard;
    case 'button':
      return isDark ? Colors.dark.gradientButton : Colors.light.gradientButton;
    case 'header':
      return isDark ? Colors.dark.gradientHeader : Colors.light.gradientHeader;
    default:
      return theme.gradientPrimary;
  }
};

export const getGlassStyle = (isDark: boolean, opacity: number = 0.08) => {
  return {
    backgroundColor: isDark 
      ? `rgba(255,255,255,${opacity})` 
      : `rgba(255,255,255,${opacity + 0.8})`,
    borderColor: isDark 
      ? 'rgba(255,255,255,0.08)' 
      : 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    backdropFilter: 'blur(20px)',
  };
};

export const getShadowStyle = (isDark: boolean, intensity: number = 1) => {
  const shadowColor = isDark ? 'rgba(167,139,250,0.25)' : 'rgba(124,58,237,0.08)';
  return {
    shadowColor,
    shadowOffset: { width: 0, height: 4 * intensity },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 12 * intensity,
    elevation: 6 * intensity,
  };
};