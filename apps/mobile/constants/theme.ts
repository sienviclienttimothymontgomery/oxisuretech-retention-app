/**
 * OxiSure Tech Mobile Design System
 * Mirrors the web CSS design tokens for cross-platform consistency.
 * Light-theme only — clean, professional, high-contrast.
 */

const FONT_FAMILY = 'Inter';

export const Colors = {
  light: {
    // Brand
    primary: '#0C5A8A', // OxiSure Teal-Blue
    primaryLight: '#2C7BAF',
    primaryDark: '#083F61',
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
    bg: '#F5F7FA', // Light gray base
    bgSubtle: '#F8FAFC',
    bgMuted: '#E2E8F0',
    surface: '#FFFFFF', // White cards
    surfaceRaised: '#FFFFFF',
    border: '#E2E8F0',
    borderSubtle: '#F1F5F9',

    // Text
    text: '#1A1A2E', // Dark gray
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',

    // Gradient (For accent buttons/cards)
    gradientStart: '#38BDF8',
    gradientMid: '#0EA5E9',
    gradientEnd: '#0284C7',

    // Aliases for Expo template compatibility
    background: '#F5F7FA',
    icon: '#475569',
    tint: '#0C5A8A',
  },
  dark: {
    // Forced Light Theme — identical to light
    primary: '#0C5A8A',
    primaryLight: '#2C7BAF',
    primaryDark: '#083F61',
    accent: '#0EA5E9',
    accentLight: '#38BDF8',
    accentDark: '#0284C7',

    success: '#16A34A',
    successBg: '#F0FDF4',
    warning: '#D97706',
    warningBg: '#FFFBEB',
    danger: '#DC2626',
    dangerBg: '#FEF2F2',
    info: '#0EA5E9',
    infoBg: '#F0F9FF',

    bg: '#F5F7FA',
    bgSubtle: '#F8FAFC',
    bgMuted: '#E2E8F0',
    surface: '#FFFFFF',
    surfaceRaised: '#FFFFFF',
    border: '#E2E8F0',
    borderSubtle: '#F1F5F9',

    text: '#1A1A2E',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textInverse: '#FFFFFF',

    gradientStart: '#38BDF8',
    gradientMid: '#0EA5E9',
    gradientEnd: '#0284C7',

    background: '#F5F7FA',
    icon: '#475569',
    tint: '#0C5A8A',
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
  h1: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34, letterSpacing: -0.5, fontFamily: FONT_FAMILY },
  h2: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28, letterSpacing: -0.3, fontFamily: FONT_FAMILY },
  h3: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24, fontFamily: FONT_FAMILY },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24, fontFamily: FONT_FAMILY },
  bodyMedium: { fontSize: 16, fontWeight: '500' as const, lineHeight: 24, fontFamily: FONT_FAMILY },
  small: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20, fontFamily: FONT_FAMILY },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18, fontFamily: FONT_FAMILY },
  label: { fontSize: 14, fontWeight: '600' as const, lineHeight: 18, letterSpacing: 0.2, fontFamily: FONT_FAMILY },
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
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  xl: {
    shadowColor: '#0C5A8A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 12,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  }),
} as const;
