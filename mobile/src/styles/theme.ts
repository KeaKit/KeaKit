/**
 * Sistema de diseño
 * Basado en la paleta oficial de la marca
 */

export const Colors = {
  primary: '#1A3A52', 
  primaryLight: '#2C5F7C',     
  primaryDark: '#0F2534',  

  primaryHome: '#2d6e91',
  primaryHomeOpacity: 'rgba(45, 110, 145, 0.15)',      
  backgroundHome: '#fcfff5',        
  textPrimaryHome: '#595959', 

  brandBeige: '#F5EFE7',        // Fondo logo
  brandBorder: '#D4C5B9',       // Borde logo
  brandIcon: '#8B7355',         // Color icono logo

  secondaryLavender: '#d6d0f8',
  secondaryBlue: '#8ec2db',
  secondaryMint: '#c3f1d1',
  secondaryCoral: '#FFD6C0',

  backgroundWhite: '#FFFFFF',
  backgroundGray: '#f0f4ff',   
  backgroundCard: '#FFFFFF',
  placeholderBackground: '#EBF5FF',    

  textPrimary: '#1A1A1A',
  textSecondary: '#7A7A7A',
  textLight: '#9CA3AF', 
  textWhite: '#FFFFFF', 
  textMuted: '#D1D5DB', 

  border: '#E8ECF1',            
  borderLight: '#F3F4F6',
  borderPrimary: 'rgba(45, 110, 145, 0.15)',

  white: '#FFFFFF',
  success: '#10B981',     
  error: '#EF4444',           
  warning: '#F59E0B',       
  info: '#3B82F6',  

  overlay: 'rgba(45, 110, 145, 0.4)',
  shadowColor: '#2d6e91',
  transparent: 'rgba(0, 0, 0, 0)',
  
  // MIC colors
  cream:     '#fcfff5',
  blue:      '#2d6e91',
  blueDark:  '#1e526e',
  gray:      '#595959',
  lavender:  '#d6d0f8',
  skyBlue:   '#8ec2db',
  mint:      '#c3f1d1',
  lightBlue: '#e4f1fc',
  accentBlue: '#9bd1f1',
  lightMint: '#e5ffee',
  
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
  header: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  }
} as const;

export const Layout = {
  screenPadding: Spacing.lg,
  cardPadding: Spacing.xl,
  headerHeight: 60,
} as const;