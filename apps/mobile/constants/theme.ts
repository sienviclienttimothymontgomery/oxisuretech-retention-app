/**
 * OxiSure Tech Mobile Design System
 * Mirrors the web CSS design tokens for cross-platform consistency.
 */

export const Colors = {
  light: {
    // Brand
    primary: '#1B365D',
    primaryLight: '#2A4A7F',
    primaryDark: '#0F1F3D',
    accent: '#0EA5E9',
    accentLight: '#38BDF8',
    accentDark: '#0284C7',

    // Status
    success: '#16A34A',
    successBg: '#F0FDF4',
    warning: '#D97706',
    warningBg: '#FFFBEB',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
    info: '#0EA5E9',
    infoBg: '#F0F9FF',

    // Surfaces
    bg: '#FFFFFF',
    bgSubtle: '#F8FAFC',
    bgMuted: '#F1F5F9',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    border: '#E2E8F0',
    borderSubtle: '#F1F5F9',

    // Text
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',

    // Aliases for Expo template compatibility
    background: '#FFFFFF',
    icon: '#475569',
    tint: '#1B365D',
  },
  dark: {
    primary: '#93C5FD',
    primaryLight: '#BFDBFE',
    primaryDark: '#60A5FA',
    accent: '#38BDF8',
    accentLight: '#7DD3FC',
    accentDark: '#0EA5E9',

    success: '#4ADE80',
    successBg: '#052E16',
    warning: '#FBBF24',
    warningBg: '#422006',
    danger: '#F87171',
    dangerBg: '#450A0A',
    info: '#38BDF8',
    infoBg: '#0C4A6E',

    bg: '#0B1120',
    bgSubtle: '#111827',
    bgMuted: '#1E293B',
    surface: '#1E293B',
    surfaceRaised: '#273449',
    border: '#334155',
    borderSubtle: '#1E293B',

    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textInverse: '#0F172A',

    // Aliases for Expo template compatibility
    background: '#0B1120',
    icon: '#94A3B8',
    tint: '#93C5FD',
  },
};

export type ThemeColors = typeof Colors.light;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMedium: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24 },
  small: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  label: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18, letterSpacing: 0.2 },
} as const;
