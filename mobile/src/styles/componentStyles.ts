import { StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from './theme';

/**
 * Estilos para componentes específicos reutilizables
 */
export const componentStyles = StyleSheet.create({
  // Modales
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: Spacing.lg,
  },

  modalContainer: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.md,
    minWidth: 280,
    ...Shadows.large,
  },

  modalHeader: {
    padding: Spacing.lg,
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },

  modalDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },

  // Menú de perfil
  profileMenu: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.md,
    minWidth: 280,
    ...Shadows.large,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },

  menuItemText: {
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
  },

  menuItemDanger: {
    color: Colors.error,
  },

  menuUserName: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },

  menuUserEmail: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // Botones de icono
  iconButton: {
    padding: Spacing.xs,
  },

  iconButtonLarge: {
    padding: Spacing.sm,
  },

  // Botones de acción grandes (home screen)
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xxl,
    alignItems: 'center',
    ...Shadows.medium,
  },

  actionButtonSecondary: {
    backgroundColor: Colors.primaryLight,
  },

  actionIconContainer: {
    marginBottom: Spacing.base,
  },

  actionButtonText: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textWhite,
    marginBottom: Spacing.sm,
  },

  actionButtonSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // Badges/etiquetas
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.bold,
    color: Colors.textWhite,
  },

  badgeSuccess: {
    backgroundColor: Colors.success,
  },

  badgeError: {
    backgroundColor: Colors.error,
  },

  badgeWarning: {
    backgroundColor: Colors.warning,
  },

  // Avatares
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Listas
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    backgroundColor: Colors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  listItemText: {
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    flex: 1,
  },

  // Productos/items de catálogo
  productCard: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadows.small,
  },

  productImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.border,
  },

  productInfo: {
    padding: Spacing.md,
  },

  productName: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },

  productPrice: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
  },

  productLocation: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // Tabs/pestañas
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  tabItem: {
    flex: 1,
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },

  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },

  tabText: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },

  tabTextActive: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.primary,
  },

  // Barra de búsqueda
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },

  searchInput: {
    flex: 1,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
});
