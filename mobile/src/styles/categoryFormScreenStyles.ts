import { StyleSheet } from "react-native";
import { Colors, Spacing, BorderRadius, FontSizes, FontWeights, Shadows } from "./theme";

export const categoryFormScreenStyles = StyleSheet.create({
  formCard: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.medium,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    marginTop: Spacing.sm,
  },

  // Artículos

  statCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primaryHome,
  },

  statNumber: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textWhite,
  },

  articleCard: {
    width: 140,
    height: 150,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },

  articleImage: {
    width: "100%",
    height: 90,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },

  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },

  articleInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  articleTitle: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },

  articleBadge: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Formulario

  inputLabel: {
    fontSize: 14,
    color: "#1C1B1F",
    marginBottom: 4,
  },

  input: {
    backgroundColor: Colors.backgroundWhite,
    flex: 1,
    fontSize: 16,
  },

  priceInput: {
    textAlign: "center",
    maxWidth: 110,
  },

  priceSeparator: {
    fontSize: 16,
    color: "#1C1B1F",
    paddingHorizontal: 8,
    alignContent: "center",
    textAlign: "center",
  },
});
