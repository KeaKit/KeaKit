import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from './theme';

/**
 * Estilos compartidos que pueden heredarse en todas las pantallas
 */
export const commonStyles = StyleSheet.create({
  // Contenedores
  container: {
    flex: 1,
  },

  containerWhite: {
    flex: 1,
    backgroundColor: Colors.backgroundWhite,
  },

  screenPadding: {
    paddingHorizontal: Spacing.lg,
  },

  // Headers
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    backgroundColor: Colors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },

  // Logo de la app
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoBox: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Botones principales
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },

  primaryButtonText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.textWhite,
  },

  secondaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },

  secondaryButtonText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.bold,
    color: Colors.textWhite,
  },

  outlineButton: {
    backgroundColor: 'transparent',
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  outlineButtonText: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },

  // Cards
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.medium,
  },

  cardSmall: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    ...Shadows.small,
  },

  // Inputs
  input: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
  },

  inputError: {
    borderColor: Colors.error,
  },

  inputFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },

  // Textos
  title: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },

  subtitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },

  body: {
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
  },

  bodySecondary: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },

  caption: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },

  // Secciones de bienvenida
  welcomeSection: {
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xxxl,
    alignItems: 'center',
  },

  welcomeTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },

  welcomeSubtitle: {
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Divisores
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.base,
  },

  dividerThick: {
    height: 2,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },

  // Mensajes de error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },

  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.error,
  },

  // Centrado
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Espaciado
  marginTopSm: {
    marginTop: Spacing.sm,
  },

  marginTopMd: {
    marginTop: Spacing.md,
  },

  marginTopLg: {
    marginTop: Spacing.lg,
  },

  marginTopXl: {
    marginTop: Spacing.xl,
  },

  marginBottomSm: {
    marginBottom: Spacing.sm,
  },

  marginBottomMd: {
    marginBottom: Spacing.md,
  },

  marginBottomLg: {
    marginBottom: Spacing.lg,
  },

  marginBottomXl: {
    marginBottom: Spacing.xl,
  },

  // Gaps (flexbox)
  gapXs: {
    gap: Spacing.xs,
  },

  gapSm: {
    gap: Spacing.sm,
  },

  gapMd: {
    gap: Spacing.md,
  },

  gapLg: {
    gap: Spacing.lg,
  },

  gapXl: {
    gap: Spacing.xl,
  },
});
