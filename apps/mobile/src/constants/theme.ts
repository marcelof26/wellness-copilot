export const Colors = {
  // Primary
  primary: '#0A84FF',
  primaryLight: '#4DA3FF',
  primaryDark: '#0060CC',

  // Accent
  accent: '#30D158',
  accentLight: '#5DEA80',
  accentDark: '#20A040',

  // Semantic
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#64D2FF',

  // Status
  optimal: '#30D158',
  normal: '#0A84FF',
  borderline: '#FF9F0A',
  abnormal: '#FF453A',
  unknown: '#8E8E93',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  surfaceAlt: '#F2F2F7',
  border: '#E5E5EA',
  separator: '#C6C6C8',

  // Text
  textPrimary: '#1C1C1E',
  textSecondary: '#3C3C43',
  textTertiary: '#6C6C70',
  textDisabled: '#AEAEB2',
  textOnPrimary: '#FFFFFF',

  // Goals
  energy: '#FF9F0A',
  sleep_recovery: '#5E5CE6',
  metabolism: '#30D158',
  longevity_prevention: '#0A84FF',
  performance: '#FF453A',
} as const;

export const Typography = {
  // Font sizes
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 28,
    xxxl: 34,
  },
  // Font weights
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

export type ColorKey = keyof typeof Colors;
export type GoalColor = 'energy' | 'sleep_recovery' | 'metabolism' | 'longevity_prevention' | 'performance';
