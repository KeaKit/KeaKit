/**
 * Sistema de diseño de KeaKit
 * Basado en los mockups de la aplicación
 */

export const Colors = {
  // Colores primarios
  primary: '#1A3A52',           // Azul oscuro principal
  primaryLight: '#2C5F7C',      // Azul secundario
  primaryDark: '#0F2534',       // Azul muy oscuro

  // Colores del logo/brand
  brandBeige: '#F5EFE7',        // Fondo logo
  brandBorder: '#D4C5B9',       // Borde logo
  brandIcon: '#8B7355',         // Color icono logo

  // Colores de fondo
  background: '#F5F7FA',        // Fondo principal
  backgroundWhite: '#FFFFFF',   // Fondo blanco
  backgroundCard: '#FFFFFF',    // Fondo de tarjetas

  // Colores de texto
  textPrimary: '#1A3A52',       // Texto principal
  textSecondary: '#6B7280',     // Texto secundario
  textLight: '#9CA3AF',         // Texto claro
  textWhite: '#FFFFFF',         // Texto blanco
  textMuted: '#D1D5DB',         // Texto apagado

  // Colores de borde
  border: '#E8ECF1',            // Borde principal
  borderLight: '#F3F4F6',       // Borde claro

  // Colores de estado
  success: '#4CAF50',           // Verde éxito
  error: '#FF6B6B',             // Rojo error
  warning: '#F59E0B',           // Amarillo advertencia
  info: '#3B82F6',              // Azul información

  // Colores de overlay/sombra
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadowColor: '#000000',
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

export const Layout = {
  screenPadding: Spacing.lg,
  cardPadding: Spacing.xl,
  headerHeight: 60,
} as const;
