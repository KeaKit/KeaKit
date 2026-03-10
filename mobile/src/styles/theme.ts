/**
 * Sistema de diseño
 * Basado en la paleta oficial de la marca
 */

export const Colors = {
  // ─── Colores Primarios (Oficiales) ─────────────────────────────
  primary: '#2d6e91',           // Azul oscuro (Títulos, botones, énfasis)
  background: '#fcfff5',        // Crema / Blanco roto (Fondo general de la app)
  textPrimary: '#595959',       // Gris oscuro (Textos principales para legibilidad)

  // ─── Colores Secundarios (Apoyo visual y acentos) ──────────────
  secondaryLavender: '#d6d0f8', // Lila claro
  secondaryBlue: '#8ec2db',     // Azul claro
  secondaryMint: '#c3f1d1',     // Verde menta

  // ─── Colores de fondo derivados ────────────────────────────────
  backgroundWhite: '#FFFFFF',   // Blanco puro (Para las tarjetas, contrasta genial con el crema)
  backgroundCard: '#FFFFFF',    // Fondo de tarjetas

  // ─── Colores de texto de apoyo ─────────────────────────────────
  textSecondary: '#7A7A7A',     // Gris un poco más claro para subtítulos
  textLight: '#9CA3AF',         // Texto claro / Placeholders
  textWhite: '#FFFFFF',         // Texto blanco (sobre fondos oscuros)
  textMuted: '#D1D5DB',         // Texto muy apagado (disable)

  // ─── Colores de borde ──────────────────────────────────────────
  border: '#E8ECF1',            // Borde principal
  borderLight: '#F3F4F6',       // Borde claro
  borderPrimary: 'rgba(45, 110, 145, 0.15)', // Borde sutil basado en tu azul

  // ─── Colores de estado ─────────────────────────────────────────
  success: '#10B981',           // Verde éxito
  error: '#EF4444',             // Rojo error
  warning: '#F59E0B',           // Amarillo advertencia
  info: '#3B82F6',              // Azul información

  // ─── Colores de overlay/sombra ─────────────────────────────────
  overlay: 'rgba(45, 110, 145, 0.4)', // Overlay tintado ligeramente con tu azul
  shadowColor: '#2d6e91',       // Sombras basadas en tu azul oscuro (queda más premium que negro puro)
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const FontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
  giant: 36,
} as const;

export const FontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export const Shadows = {
  small: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const Layout = {
  screenPadding: Spacing.lg,
  cardPadding: Spacing.xl,
  headerHeight: 60,
} as const;