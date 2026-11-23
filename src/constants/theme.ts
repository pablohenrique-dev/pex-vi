export const colors = {
  background: '#FFFFFF',
  surface: '#F3F7F7',
  surfaceStrong: '#E5EEEE',
  primary: '#006B6B',
  primaryPressed: '#004F51',
  primarySoft: '#DDF0F0',
  ink: '#172527',
  muted: '#52686B',
  border: '#CCDADA',
  warning: '#9A5B00',
  warningSoft: '#FFF1D6',
  danger: '#B42318',
  dangerSoft: '#FEE9E7',
  success: '#16794A',
  successSoft: '#E2F4EA',
  white: '#FFFFFF',
  scrim: 'rgba(23, 37, 39, 0.42)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const shadows = {
  floating: {
    shadowColor: '#172527',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
  },
} as const;

export const layout = {
  contentMaxWidth: 680,
  touchTarget: 48,
} as const;
