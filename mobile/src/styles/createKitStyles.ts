import { StyleSheet } from "react-native";
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights } from "./theme";

export const createKitStyles = StyleSheet.create({
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.sm,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },

  headerTitle: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
  },

  row: {
    flexDirection: "row",
    gap: Spacing.sm,
  },

  rowItem: {
    flex: 1,
  },

  inputRounded: {
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.backgroundWhite,
  },

  dateInput: {
    borderRadius: BorderRadius.md,
    borderColor: Colors.primary,
    borderWidth: 2,
  },

  productsHeader: {
    marginTop: Spacing.base,
    marginBottom: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  productsTitle: {
    fontSize: FontSizes.xxl,
    color: Colors.primary,
  },

  counterBadge: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundWhite,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  counterBadgeText: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
    fontSize: FontSizes.sm,
  },

  loaderArea: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },

  productRow: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundWhite,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },

  productRowSelected: {
    borderColor: Colors.success,
    backgroundColor: "#F1FFF5",
  },

  productThumb: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.brandBeige,
    borderWidth: 1,
    borderColor: Colors.brandBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  productInfo: {
    flex: 1,
  },

  productTitle: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    marginBottom: 2,
  },

  productDesc: {
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  productPriceActions: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: Spacing.sm,
  },

  removeItemButton: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundWhite,
  },

  footerRow: {
    marginTop: Spacing.base,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
    backgroundColor: Colors.backgroundWhite,
    padding: 50,
    paddingTop: 30,
    paddingBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  totalText: {
    flex: 1,
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
  },

  submitButton: {
    minWidth: 150,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },

  submitButtonDisabled: {
    opacity: 0.7,
  },

  submitButtonText: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },

  addButton: {
    backgroundColor: Colors.backgroundWhite,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  addButtonText: {
    color: Colors.primary,
    fontWeight: FontWeights.semibold,
    fontSize: FontSizes.base,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: Colors.backgroundWhite,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: "75%",
  },
  modalTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  modalList: {
    marginBottom: Spacing.md,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  modalRowChecked: {
    borderColor: Colors.success,
    backgroundColor: "#F1FFF5",
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  modalBtn: {
    flex: 1,
  },
});
