import { Platform } from 'react-native';

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'dark';

export const colors = {
  bg: '#F5F9FC',
  surface: '#FFFFFF',
  surfaceAlt: '#FAFDFF',
  ink: '#101820',
  text: '#42566B',
  muted: '#6D7E8F',
  line: '#DDE8EF',
  white: '#FFFFFF',
  whiteSoft: 'rgba(255,255,255,0.78)',
  whiteMuted: 'rgba(255,255,255,0.62)',
  teal: '#1F9F96',
  tealDark: '#147B75',
  tealSoft: '#E6F7F4',
  tealLine: '#CDEBE7',
  blue: '#2563EB',
  blueBg: '#EAF3FF',
  blueLine: '#D6E7FF',
  success: '#13744D',
  successBg: '#E9F8EF',
  successLine: '#CBEAD8',
  warning: '#A15C00',
  warningBg: '#FFF4DF',
  warningLine: '#FFE0A3',
  danger: '#B42318',
  dangerBg: '#FFF0EE',
  dangerLine: '#FFD0CA',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
};

export const radius = {
  sm: 6,
  md: 8,
  pill: 999,
};

export const toneStyles: Record<Tone, { bg: string; border: string; text: string }> = {
  neutral: { bg: colors.surfaceAlt, border: colors.line, text: colors.text },
  info: { bg: colors.blueBg, border: colors.blueLine, text: colors.blue },
  success: { bg: colors.successBg, border: colors.successLine, text: colors.success },
  warning: { bg: colors.warningBg, border: colors.warningLine, text: colors.warning },
  danger: { bg: colors.dangerBg, border: colors.dangerLine, text: colors.danger },
  dark: { bg: 'rgba(255,255,255,0.12)', border: 'rgba(255,255,255,0.20)', text: colors.white },
};

export const softShadow = Platform.select({
  ios: {
    shadowColor: '#0B2235',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.09,
    shadowRadius: 24,
  },
  android: {
    elevation: 3,
  },
  default: {},
});
