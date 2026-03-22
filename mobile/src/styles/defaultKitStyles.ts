import { StyleSheet } from "react-native";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSizes,
  FontWeights,
  Shadows,
} from "./theme";

export const defaultKitStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundHome,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    backgroundColor: Colors.backgroundHome,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderPrimary,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.primaryHome,
  },
  backButton: {
    padding: Spacing.sm,
  },
  listContent: {
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  cardTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.primaryHome,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimaryHome,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  badge: {
    backgroundColor: Colors.secondaryBlue,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: FontSizes.xs,
    color: Colors.primaryHome,
    fontWeight: FontWeights.semibold,
  },
  primaryButton: {
    backgroundColor: Colors.primaryHome,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  primaryButtonText: {
    color: Colors.textWhite,
    fontWeight: FontWeights.semibold,
    fontSize: FontSizes.sm,
  },
  emptyState: {
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.primaryHome,
  },
  emptySubtitle: {
    fontSize: FontSizes.base,
    color: Colors.textPrimaryHome,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.primaryHome,
    marginVertical: Spacing.md,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderPrimary,
  },
  itemInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  itemName: {
    fontSize: FontSizes.base,
    fontWeight: FontWeights.semibold,
    color: Colors.primaryHome,
  },
  itemMeta: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimaryHome,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimaryHome,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  addButton: {
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryHome,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  addButtonText: {
    color: Colors.primaryHome,
    fontWeight: FontWeights.semibold,
  },
  confirmButton: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primaryHome,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    color: Colors.textWhite,
    fontWeight: FontWeights.semibold,
  },
  helperText: {
    fontSize: FontSizes.sm,
    color: Colors.textPrimaryHome,
  },
  warningText: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.sm,
    color: Colors.error,
    textAlign: "center",
  },
});
