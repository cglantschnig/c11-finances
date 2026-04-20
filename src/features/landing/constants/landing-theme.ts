export const LANDING_THEME = {
  dark: {
    background: 'oklch(0.148 0.004 228.8)',
    backgroundImage:
      'radial-gradient(circle at top left, rgba(76, 201, 240, 0.16), transparent 34%), radial-gradient(circle at top right, rgba(34, 197, 94, 0.12), transparent 28%)',
    border: 'rgba(255,255,255,0.1)',
    borderSoft: 'rgba(255,255,255,0.08)',
    borderSubtle: 'rgba(255,255,255,0.06)',
    foreground: '#fff',
    gridLine: 'rgba(255,255,255,0.04)',
    headerBackground: 'transparent',
    muted: 'rgba(255,255,255,0.5)',
    mutedSoft: 'rgba(255,255,255,0.35)',
    mutedStrong: 'rgba(255,255,255,0.4)',
    positive: 'oklch(0.64 0.156 149.56)',
    surface: 'oklch(0.218 0.008 223.9 / 0.92)',
    surfaceAlt: 'rgba(255,255,255,0.07)',
    watermarkFilter: 'brightness(10)',
    watermarkOpacity: 0.05,
  },
  light: {
    background: 'oklch(0.982 0.007 220)',
    backgroundImage:
      'radial-gradient(circle at top left, rgba(15, 118, 110, 0.16), transparent 34%), radial-gradient(circle at top right, rgba(59, 130, 246, 0.12), transparent 28%)',
    border: 'rgba(15,23,42,0.12)',
    borderSoft: 'rgba(15,23,42,0.08)',
    borderSubtle: 'rgba(15,23,42,0.06)',
    foreground: 'oklch(0.19 0.014 236)',
    gridLine: 'rgba(15,23,42,0.04)',
    headerBackground: 'rgba(255,255,255,0.96)',
    muted: 'rgba(15,23,42,0.62)',
    mutedSoft: 'rgba(15,23,42,0.38)',
    mutedStrong: 'rgba(15,23,42,0.5)',
    positive: 'oklch(0.59 0.165 149.56)',
    surface: 'rgba(255,255,255,0.82)',
    surfaceAlt: 'rgba(15,23,42,0.05)',
    watermarkFilter: 'none',
    watermarkOpacity: 0.08,
  },
} as const

export type LandingPalette = (typeof LANDING_THEME)['dark']
